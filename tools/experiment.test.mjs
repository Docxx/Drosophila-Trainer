import test from 'node:test';
import assert from 'node:assert/strict';
import { CrossSession } from '../src/js/experiment.js';

function setParents(session, predicate) {
  for (const fly of session.appearance.filter(predicate)) session.move(fly.id, 'collection');
}
function develop(session) { session.start(); session.advance(); session.advance(); }
function scoreAll(session) {
  for (const fly of [...session.specimens(0), ...session.specimens(1)]) session.score(fly.id, `${fly.eye}-${fly.sex}`);
}

test('documented virgins crossed to normal males produce only red daughters and white sons', () => {
  const session = new CrossSession({ seed: 21 });
  setParents(session, (f) => f.sex === 'F');
  session.setPrediction('expected');
  develop(session);
  const flies = [...session.specimens(0), ...session.specimens(1)];
  assert.equal(flies.length, 12);
  assert(flies.every((f) => f.sex === 'F' ? f.eye === 'red' : f.eye === 'white'));
  assert(flies.some((f) => f.sex === 'F') && flies.some((f) => f.sex === 'M'));
  assert(flies.every((f) => !('g' in f) && !('matingHistory' in f)));
  scoreAll(session); session.setInterpretation('consistent');
  const report = session.submit();
  assert.equal(report.correct, 12); assert.equal(report.predictionCorrect, true);
  assert.equal(report.interpretationSupported, true);
  assert.match(report.explanation, /does not prove/);
});

test('events hide outcomes until day 12 and preserve parent choices', () => {
  const session = new CrossSession({ seed: 6 });
  setParents(session, (f) => f.sex === 'F');
  assert.equal(session.snapshot().offspringCount, null);
  assert.equal(session.snapshot().report, null);
  session.start();
  assert.deepEqual(session.specimens(), []);
  assert.throws(() => session.move('fly-1', 'pad'), /committed/);
  assert.throws(() => session.setPrediction('red'), /locked/);
  session.advance();
  assert.equal(session.snapshot().day, 2); assert.equal(session.snapshot().offspringCount, null);
  assert(session.snapshot().events.some((e) => /all parents removed/.test(e.detail)));
  session.advance();
  assert.equal(session.snapshot().day, 12); assert.equal(session.snapshot().offspringCount, 12);
  assert.throws(() => session.advance(), /No pending/);
});

test('unintended paternity produces white daughters without disclosing individual mating histories', () => {
  const session = new CrossSession({ seed: 21, scenario: 'uncertain' });
  setParents(session, (f) => f.sex === 'F'); develop(session); scoreAll(session);
  session.setInterpretation('unintended');
  const report = session.submit();
  assert(report.counts['white-F'] > 0);
  assert.equal(report.interpretationSupported, true);
  assert.match(report.explanation, /cannot distinguish/);
  assert(!JSON.stringify(session.snapshot()).includes('matingHistory'));
  assert(!JSON.stringify(session.serialize()).includes('previous-white-male'));
  assert(session.appearance.every((f) => f.eye === 'white' && !('matingHistory' in f)));
});

test('accidentally including white-eyed males can change offspring even in the documented batch', () => {
  const session = new CrossSession({ seed: 21 });
  setParents(session, () => true); develop(session); scoreAll(session);
  assert(session.submit().counts['white-F'] > 0);
});

test('males alone yield no offspring but are not rejected before the cross', () => {
  const session = new CrossSession({ seed: 4 });
  setParents(session, (f) => f.sex === 'M'); develop(session);
  assert.equal(session.snapshot().offspringCount, 0);
  session.setInterpretation('none');
  assert.equal(session.submit().interpretationSupported, true);
  assert.match(session.snapshot().report.explanation, /does not identify the cause/);
});

test('uncertain observations are allowed and can be revised without rerolling the offspring', () => {
  const session = new CrossSession({ seed: 3 });
  assert.throws(() => session.start(), /Collect/);
  setParents(session, (f) => f.sex === 'F'); develop(session);
  assert.throws(() => session.submit(), /Record each/);
  const originals = [...session.specimens(0), ...session.specimens(1)];
  for (const fly of originals) session.score(fly.id, 'uncertain');
  assert.equal(session.submit().uncertain, 12);
  assert.throws(() => session.score(originals[0].id, 'red-F'), /Invalid/);
  session.retryScoring(); scoreAll(session);
  assert.equal(session.submit().correct, 12);
  assert.deepEqual([...session.specimens(0), ...session.specimens(1)], originals);
});

test('save/restore reconstructs the same sample and report in every experiment phase', () => {
  let session = new CrossSession({ seed: 21, scenario: 'uncertain' });
  const roundTrip = () => {
    const saved = JSON.parse(JSON.stringify(session.serialize()));
    const next = new CrossSession({ saved });
    assert.deepEqual(next.snapshot(), session.snapshot());
    assert.deepEqual(next.specimens(1), session.specimens(1));
    session = next;
  };
  session.setNote('prediction', 'Test stock history.');
  setParents(session, (f) => f.sex === 'F'); roundTrip();
  session.start(); roundTrip(); session.advance(); roundTrip(); session.advance(); roundTrip();
  scoreAll(session); session.setInterpretation('unintended'); session.submit(); roundTrip();
  const saved = session.serialize(); saved.day = 900;
  assert.throws(() => new CrossSession({ saved }), /Invalid experiment time/);
});
