import test from 'node:test';
import assert from 'node:assert/strict';
import { CollectionSession, makePopulation } from '../src/js/collection.js';

test('batches have six flies, both sexes, independent mating history and reproducible appearance', () => {
  for (const seed of [0, 1, 19, 200, 4294967295]) {
    const flies = makePopulation(seed);
    assert.equal(flies.length, 6);
    assert.equal(flies.filter((f) => f.sex === 'F').length, 3);
    assert.deepEqual(makePopulation(seed), flies);
    assert(flies.filter((f) => f.sex === 'F').every((f) => f.matingHistory === 'unmated'));
    assert(flies.every((f) => f.ageMinutes < 120));
  }
  assert.notDeepEqual(makePopulation(1).map((f) => f.sex), makePopulation(19).map((f) => f.sex));
});

test('public notebook does not disclose sex, mating history, exact age or a report before submission', () => {
  const session = new CollectionSession({ seed: 5 });
  const state = session.snapshot();
  assert.equal(state.report, null);
  assert(state.flies.every((f) => Object.keys(f).sort().join(',') === 'destination,id,label'));
  assert(!JSON.stringify(session.serialize()).includes('matingHistory'));
  assert(session.appearance.every((f) => !('matingHistory' in f) && !('ageMinutes' in f)));
});

test('two females suffice; uncertain/uncollected flies do not count as errors', () => {
  const session = new CollectionSession({ seed: 8 });
  const females = session.appearance.filter((f) => f.sex === 'F');
  session.move(females[0].id, 'collection');
  session.move(females[1].id, 'collection');
  session.move(females[2].id, 'rejected');
  assert.equal(session.snapshot().report, null);
  const report = session.submit();
  assert.equal(report.success, true);
  assert.equal(report.errors, 0);
  assert.equal(report.rows.length, 2, 'Review must not disclose unselected flies');
  assert(!JSON.stringify(report).includes(females[2].label));
});

test('a collected male fails even with enough females; retry allows correction and return', () => {
  const session = new CollectionSession({ seed: 8 });
  for (const f of session.appearance) session.move(f.id, 'collection');
  assert.equal(session.submit().success, false);
  assert.equal(session.snapshot().report.errors, 3);
  assert.throws(() => session.move('fly-1', 'pad'), /submitted/);
  session.retry();
  assert.equal(session.snapshot().report, null);
  for (const f of session.appearance.filter((f) => f.sex === 'M')) {
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
  session.move(session.appearance.find((f) => f.sex === 'F').id, 'collection');
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
  assert.throws(() => new CollectionSession({ seed: 2, saved: { version: 90 } }), /Unsupported/);
});
