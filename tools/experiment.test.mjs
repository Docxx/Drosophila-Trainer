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
const f1 = (session) => [...session.specimens(0), ...session.specimens(1)];
/** Run a cross for each seed and return the F1 samples. */
function crosses(seeds, scenario, predicate, before = () => {}) {
  return seeds.map((seed) => {
    const session = new CrossSession({ seed, scenario });
    before(session);
    setParents(session, predicate); develop(session);
    return f1(session);
  });
}
const seeds = (n) => Array.from({ length: n }, (_, i) => i + 1);

test('documented virgins crossed to normal males produce only red daughters and white sons', () => {
  const session = new CrossSession({ seed: 21 });
  assert.equal(session.appearance.length, 6, 'The cross stock has no holdover fly');
  assert(session.appearance.some((f) => f.stage === 'mature'), 'Trusted virgins may already have adult pigmentation');
  setParents(session, (f) => f.sex === 'F');
  session.setPrediction('expected');
  develop(session);
  const flies = f1(session);
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
  let seed = 1, session;
  for (;; seed++) {
    session = new CrossSession({ seed, scenario: 'uncertain' });
    setParents(session, (f) => f.sex === 'F'); develop(session);
    if (f1(session).some((f) => f.sex === 'F' && f.eye === 'white')) break;
    assert(seed < 20, 'Uncertain vials should usually reveal unintended fathers');
  }
  scoreAll(session);
  session.setInterpretation('unintended');
  const report = session.submit();
  assert(report.counts['white-F'] > 0);
  assert.equal(report.interpretationSupported, true);
  assert.match(report.explanation, /cannot distinguish/);
  assert(!JSON.stringify(session.snapshot()).includes('matingHistory'));
  assert(!JSON.stringify(session.serialize()).includes('previous-white-male'));
  assert(session.appearance.every((f) => f.eye === 'white' && f.stage === 'mature' && !('matingHistory' in f)));
});

test('paternity: stored sperm usually wins, and a remating new male takes most later offspring', () => {
  // Uncertain vials: two of three females have mated a white-eyed male. Each such
  // mother's white share is 1 (no remating, p 0.7) or 0.2 (remated, p 0.3), mean 0.76,
  // so about half of all daughters should be white-eyed.
  const daughters = crosses(seeds(150), 'uncertain', (f) => f.sex === 'F').flat().filter((f) => f.sex === 'F');
  const white = daughters.filter((f) => f.eye === 'white').length / daughters.length;
  assert(white > 0.35 && white < 0.65, `white-eyed daughter fraction ${white.toFixed(2)}`);
});

test('accidentally including white-eyed males can change offspring even in the documented batch', () => {
  const withMales = crosses(seeds(30), 'documented', () => true);
  assert(withMales.some((flies) => flies.some((f) => f.sex === 'F' && f.eye === 'white')));
  const femalesOnly = crosses(seeds(30), 'documented', (f) => f.sex === 'F');
  assert(femalesOnly.every((flies) => flies.every((f) => f.sex === 'M' || f.eye === 'red')));
});

test('re-clearing an uncertain vial gives a fresh documented batch at a cost of 8 hours', () => {
  const session = new CrossSession({ seed: 9, scenario: 'uncertain' });
  const before = session.appearance;
  assert.equal(session.snapshot().canReclear, true);
  session.move(before[0].id, 'collection');
  session.reclear();
  const state = session.snapshot();
  assert.equal(state.recleared, true);
  assert.equal(state.canReclear, false);
  assert.equal(state.delayHours, 8);
  assert.equal(state.source.title, 'Re-cleared vial');
  assert(state.flies.every((f) => f.destination === 'pad'), 'A new batch starts on the pad');
  assert(state.events.some((e) => /re-cleared/.test(e.detail)), 'The re-clear is recorded');
  assert(state.events.some((e) => e.action === 'mission') && state.events.some((e) => e.action === 'transfer'), 'Earlier history is kept');
  assert(state.events.findIndex((e) => e.action === 'mission') < state.events.findIndex((e) => /re-cleared/.test(e.detail)), 'Earlier history comes first');
  assert(session.appearance.some((f) => f.stage === 'mature'), 'Trusted virgins may already have adult pigmentation');
  assert.throws(() => session.reclear(), /uncertain/);
  setParents(session, (f) => f.sex === 'F'); develop(session);
  assert(f1(session).every((f) => f.sex === 'M' || f.eye === 'red'), 'Your own clearing yields only virgins');
  assert.throws(() => new CrossSession({ seed: 9 }).reclear(), /uncertain/);
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
  const originals = f1(session);
  for (const fly of originals) session.score(fly.id, 'uncertain');
  assert.equal(session.submit().uncertain, 12);
  assert.throws(() => session.score(originals[0].id, 'red-F'), /Invalid/);
  session.retryScoring(); scoreAll(session);
  assert.equal(session.submit().correct, 12);
  assert.deepEqual(f1(session), originals);
});

test('save/restore reconstructs the same sample and report in every experiment phase, including a re-clear', () => {
  for (const reclear of [false, true]) {
    let session = new CrossSession({ seed: 21, scenario: 'uncertain' });
    const roundTrip = () => {
      const saved = JSON.parse(JSON.stringify(session.serialize()));
      const next = new CrossSession({ saved });
      assert.deepEqual(next.snapshot(), session.snapshot());
      assert.deepEqual(next.specimens(1), session.specimens(1));
      session = next;
    };
    session.setNote('prediction', 'Test stock history.');
    if (reclear) { session.reclear(); roundTrip(); }
    setParents(session, (f) => f.sex === 'F'); roundTrip();
    session.start(); roundTrip(); session.advance(); roundTrip(); session.advance(); roundTrip();
    scoreAll(session); session.setInterpretation(reclear ? 'consistent' : 'unintended'); session.submit(); roundTrip();
  }
  const saved = new CrossSession({ seed: 2 }).serialize(); saved.day = 900;
  assert.throws(() => new CrossSession({ saved }), /Invalid experiment time/);
  assert.throws(() => new CrossSession({ saved: { ...saved, day: 0, version: 1 } }), /Unsupported/);
});
