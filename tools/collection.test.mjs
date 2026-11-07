import test from 'node:test';
import assert from 'node:assert/strict';
import { CollectionSession, makePopulation, appearanceForAge, RESTS, VIRGIN_WINDOW_MINUTES } from '../src/js/collection.js';

// Tests may read the private population; the learner only ever sees `appearance`.
const eligible = (seed) => makePopulation(seed).filter((f) => f.sex === 'F' && !f.holdover);
const holdover = (seed) => makePopulation(seed).find((f) => f.holdover);

test('batches: six flies from the 8-hour window plus one holdover, reproducible', () => {
  for (const seed of [0, 1, 19, 200, 4294967295]) {
    const flies = makePopulation(seed);
    assert.equal(flies.length, 7);
    const young = flies.filter((f) => !f.holdover);
    assert.equal(young.length, 6);
    assert.equal(young.filter((f) => f.sex === 'F').length, 3);
    assert(young.every((f) => f.ageMinutes < VIRGIN_WINDOW_MINUTES && f.stage !== 'mature'));
    assert(young.filter((f) => f.sex === 'F').every((f) => f.matingHistory === 'unmated'));
    const old = holdover(seed);
    assert(old.ageMinutes >= 2880 && old.stage === 'mature' && !old.meconium);
    assert.deepEqual(makePopulation(seed), flies);
    assert.equal(new Set(flies.map((f) => `${f.x},${f.z}`)).size, 7, 'Every fly has its own spot on the pad');
  }
  assert.notDeepEqual(makePopulation(1).map((f) => f.sex), makePopulation(19).map((f) => f.sex));
});

test('appearance follows age: unexpanded wings in the first hour, meconium for a few hours', () => {
  assert.deepEqual(appearanceForAge(20), { stage: 'teneral', meconium: true });
  assert.deepEqual(appearanceForAge(200), { stage: 'fresh', meconium: true });
  assert.deepEqual(appearanceForAge(420), { stage: 'fresh', meconium: false });
  assert.deepEqual(appearanceForAge(3000), { stage: 'mature', meconium: false });
});

test('resting pose is random and unrelated to sex', () => {
  const seen = { F: new Set(), M: new Set() };
  for (let seed = 0; seed < 60; seed++) for (const f of makePopulation(seed)) {
    assert(RESTS.includes(f.rest));
    seen[f.sex].add(f.rest);
  }
  assert.deepEqual([...seen.F].sort(), [...RESTS].sort());
  assert.deepEqual([...seen.M].sort(), [...RESTS].sort());
});

test('public notebook does not disclose sex, mating history, age or the holdover before submission', () => {
  const session = new CollectionSession({ seed: 5 });
  const state = session.snapshot();
  assert.equal(state.report, null);
  assert(state.flies.every((f) => Object.keys(f).sort().join(',') === 'destination,id,label'));
  assert(!JSON.stringify(session.serialize()).includes('matingHistory'));
  assert(session.appearance.every((f) => !('matingHistory' in f) && !('ageMinutes' in f) && !('holdover' in f)));
});

test('two eligible females suffice; uncertain/uncollected flies do not count as errors', () => {
  const session = new CollectionSession({ seed: 8 });
  const [a, b, c] = eligible(8);
  session.move(a.id, 'collection');
  session.move(b.id, 'collection');
  session.move(c.id, 'rejected');
  assert.equal(session.snapshot().report, null);
  const report = session.submit();
  assert.equal(report.success, true);
  assert.equal(report.errors, 0);
  assert.equal(report.rows.length, 2, 'Review must not disclose unselected flies');
  assert(!JSON.stringify(report).includes(c.label));
});

test('a holdover counts as an error even when she happens to be unmated', () => {
  let seed = 0;
  while (!(holdover(seed).sex === 'F' && holdover(seed).matingHistory === 'unmated')) seed++;
  const session = new CollectionSession({ seed });
  const [a, b] = eligible(seed);
  for (const f of [a, b, holdover(seed)]) session.move(f.id, 'collection');
  const report = session.submit();
  assert.equal(report.success, false);
  assert.equal(report.errors, 1);
  assert.match(report.rows.find((r) => r.id === holdover(seed).id).reason, /missed at clearing/);
});

test('collecting everything fails; retry allows correction and return', () => {
  const session = new CollectionSession({ seed: 8 });
  for (const f of session.appearance) session.move(f.id, 'collection');
  assert.equal(session.submit().success, false);
  assert.equal(session.snapshot().report.errors, 4, 'Three males and the holdover');
  assert.throws(() => session.move('fly-1', 'pad'), /submitted/);
  session.retry();
  assert.equal(session.snapshot().report, null);
  const keep = new Set(eligible(8).map((f) => f.id));
  for (const f of session.appearance.filter((f) => !keep.has(f.id))) {
    session.move(f.id, 'rejected');
    session.move(f.id, 'pad');
  }
  assert.equal(session.submit().success, true);
});

test('empty/insufficient collections fail without exposing the rest of the answer key', () => {
  const session = new CollectionSession({ seed: 7 });
  assert.deepEqual(session.submit().rows, []);
  assert.equal(session.snapshot().report.success, false);
  session.retry();
  session.move(eligible(7)[0].id, 'collection');
  const report = session.submit();
  assert.equal(report.success, false);
  assert.equal(report.females, 1);
  assert.equal(report.errors, 0);
});

test('notebook round trip retains decisions, notes, review and history; stored success is not trusted', () => {
  const session = new CollectionSession({ seed: 2, now: () => '2026-11-01T20:00:00.000Z' });
  session.setNote('prediction', '<script>user notes are plain text</script>');
  session.setNote('conclusion', 'Use the vial history.');
  session.move('fly-2', 'rejected');
  session.submit();
  const saved = JSON.parse(JSON.stringify(session.serialize()));
  saved.report = { success: true };
  const restored = new CollectionSession({ seed: saved.seed, saved });
  assert.deepEqual(restored.snapshot(), session.snapshot());
  assert.equal(restored.snapshot().report.success, false);
  const copy = restored.snapshot(); copy.flies[0].destination = 'collection'; copy.notes.prediction = 'changed';
  assert.notDeepEqual(copy, restored.snapshot(), 'Public snapshots must not mutate the session');
});

test('invalid saved decisions and unsupported notebook versions are rejected', () => {
  const session = new CollectionSession({ seed: 2 });
  assert.throws(() => session.move('missing', 'collection'), /Invalid/);
  assert.throws(() => session.move('fly-1', 'missing'), /Invalid/);
  const saved = session.serialize(); saved.destinations['fly-1'] = 'missing';
  assert.throws(() => new CollectionSession({ seed: 2, saved }), /Invalid/);
  assert.throws(() => new CollectionSession({ seed: 2, saved: { version: 1, seed: 2 } }), /Unsupported/);
});
