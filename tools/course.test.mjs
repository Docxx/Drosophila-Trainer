// Course layer: lesson content is consistent with the genetics engine, the
// planner can solve puzzles and gives honest feedback, and progress is saved.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGenotype } from '../src/js/genetics/genetics.js';
import { PUZZLES } from '../src/js/genetics/puzzles.js';
import {
  LESSON_CONTENT, classesFor, gametesFor, canCrossOver, crossoverKey, crossoverBlock, punnett,
  FRACTIONS, classMatches, recommendStart,
} from '../src/js/lessons.js';
import { LESSONS, progress, nextLesson } from '../src/js/course.js';
import { PlannerSession } from '../src/js/plannerSession.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;
const steps = (type) => Object.entries(LESSON_CONTENT).flatMap(([id, l]) => l.steps.filter((s) => s.type === type).map((s) => ({ id, ...s })));
const share = (rows, label) => rows.find((r) => r.label === label)?.p ?? 0;

test('every lesson in the course has content, and every step is well formed', () => {
  for (const l of LESSONS.filter((x) => x.kind === 'lesson')) assert.ok(LESSON_CONTENT[l.id], `content for ${l.id}`);
  for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
    for (const s of lesson.steps) {
      assert.ok(['text', 'choice', 'gametes', 'predict', 'pick', 'go'].includes(s.type), `${id}: step type ${s.type}`);
      for (const g of [s.parent, s.mother, s.father, ...(s.diagrams || []).map((d) => d.g)].filter(Boolean)) assert.doesNotThrow(() => parseGenotype(g), `${id}: ${g}`);
      if (s.type === 'choice') assert.equal(s.options.filter((o) => o.correct).length, 1, `${id}: one correct option in "${s.question}"`);
      if (s.type === 'go' && s.action.kind === 'scope') assert.ok(LESSONS.some((l) => l.activity === s.action.activity), `${id}: activity ${s.action.activity}`);
    }
  }
});

test('every predicted share is one the learner can choose, and shares add up to one', () => {
  for (const s of steps('predict')) {
    const { rows } = classesFor(s.mother, s.father, { traits: s.traits, bySex: s.bySex });
    assert.ok(near(rows.reduce((t, r) => t + r.p, 0), 1), `${s.title}: shares sum to 1`);
    for (const r of rows) assert.ok(FRACTIONS.some((f) => near(f.value, r.p)), `${s.title}: ${r.label} = ${r.p} is selectable`);
  }
});

test('lesson answers come out of the engine as the explanations say', () => {
  const curly = (m, f) => classesFor(m, f, { traits: ['curly'] }).rows;
  assert.ok(near(share(curly('w/w; CyO/+; +/+', 'w/Y; +/+; +/+'), 'Curly wings'), 1 / 2));
  const cc = classesFor('w/w; CyO/+; +/+', 'w/Y; CyO/+; +/+', { traits: ['curly'] });
  assert.ok(near(share(cc.rows, 'Curly wings'), 2 / 3), 'Curly × Curly gives 2/3 Curly');
  assert.ok(near(cc.dead, 1 / 4), 'a quarter of zygotes are CyO/CyO and die');
  assert.ok(near(share(curly('w/w; mut/CyO; +/+', 'w/Y; mut/CyO; +/+'), 'Curly wings'), 1), 'balanced stock breeds true');
  const x = classesFor('w/w; +/+; +/+', '+/Y; +/+; +/+', { traits: ['eye'], bySex: true }).rows;
  assert.ok(near(share(x, 'Red eyes: daughters'), 1 / 2) && near(share(x, 'White eyes: sons'), 1 / 2), 'criss-cross inheritance');
  const rx = classesFor('+/+; +/+; +/+', 'w/Y; +/+; +/+', { traits: ['eye'], bySex: true }).rows;
  assert.equal(share(rx, 'White eyes: sons') + share(rx, 'White eyes: daughters'), 0, 'reciprocal cross: no white eyes');
});

test('gamete counts match meiosis in the model', () => {
  const count = (g, chroms) => gametesFor(g, chroms).length;
  assert.equal(count('w/w; CyO/+; +/+', ['2']), 2);
  assert.equal(count('w/w; CyO/+; TM3/+', ['2', '3']), 4);
  assert.equal(count('+/Y; +/+; +/+', ['X']), 2);
  assert.equal(count('w/w; +/+; +/+', ['X']), 1, 'identical homologs give one kind of gamete');
  const female = gametesFor('w/w; +/+; GAL4/UAS-RNAi', ['3']);
  assert.equal(female.length, 4);
  assert.ok(near(female.find((x) => x.gamete['3'] === 'GAL4,UAS-RNAi').p, 0.15));
  assert.equal(count('w/Y; +/+; GAL4/UAS-RNAi', ['3']), 2, 'males do not cross over');
  assert.equal(count('w/w; +/+; GAL4/TM3', ['3']), 2, 'a balancer blocks crossovers');
});

test('the crossover switch only works where crossing over can happen, and says why otherwise', () => {
  assert.ok(canCrossOver('w/w; +/+; GAL4/UAS-RNAi', '3'));
  assert.equal(crossoverKey('w/w; +/+; GAL4/UAS-RNAi', '3', 0), 'GAL4,UAS-RNAi');
  assert.equal(crossoverKey('w/w; +/+; GAL4/UAS-RNAi', '3', 1), '+');
  assert.match(crossoverBlock('w/Y; +/+; GAL4/UAS-RNAi', '3'), /males never cross over/);
  assert.match(crossoverBlock('w/w; +/+; GAL4/TM3', '3'), /balancer/);
  for (const s of steps('gametes').filter((x) => x.crossover)) assert.ok(canCrossOver(s.parent, '3') || crossoverBlock(s.parent, '3'), s.title);
});

test('Punnett squares mark exactly the lethal cells', () => {
  const sq = punnett('w/w; CyO/+; +/+', 'w/Y; CyO/+; +/+', { chroms: ['2'], traits: ['curly'] });
  assert.equal(sq.cells.flat().length, 4);
  assert.equal(sq.cells.flat().filter((c) => !c.viable).length, 1);
  const bal = punnett('w/w; mut/CyO; +/+', 'w/Y; mut/CyO; +/+', { chroms: ['2'], traits: ['curly'] });
  assert.equal(bal.cells.flat().filter((c) => !c.viable).length, 2, 'mut/mut and CyO/CyO both die');
});

test('each pick step has exactly one right class', () => {
  for (const s of steps('pick')) {
    const { rows } = classesFor(s.mother, s.father, { traits: s.traits });
    assert.equal(rows.filter((r) => classMatches(r, s.target)).length, 1, s.title);
  }
});

test('the quick check recommends the first area with a mistake', () => {
  assert.equal(recommendStart([true, true, true, true, true]), 'planner');
  assert.equal(recommendStart([false, true, true, true, true]), 'tour');
  assert.equal(recommendStart([true, true, true, false, true]), 'inheritance');
  assert.equal(recommendStart([true, true, true, true, false]), 'balancers');
});

// ---- planner ------------------------------------------------------------------------

const row = (cross, want) => cross.classes.findIndex((r) => Object.entries(want).every(([k, v]) => r.pheno[k] === v));

test('planner: puzzle 1 in one generation, and a wrong class is caught without revealing genotypes', () => {
  const s = new PlannerSession(PUZZLES[0]);
  const c = s.cross('s0', 's1');
  const wrong = s.keep(c.id, row(c, { scutoid: true }));
  const r1 = s.declare(wrong.id);
  assert.equal(r1.ok, false);
  assert.equal(r1.some, false);
  assert.doesNotMatch(r1.message, /UAS-GFP\/|Sco\//, 'feedback names chromosomes, not genotypes');
  const right = s.keep(c.id, row(c, { curly: true, scutoid: false }));
  const r2 = s.declare(right.id);
  assert.equal(r2.ok, true);
  assert.equal(r2.generations, 1);
});

test('planner: puzzle 3 by the hinted two-generation route', () => {
  const s = new PlannerSession(PUZZLES[2]);
  const a = s.cross('s0', 's2');
  const gfp = s.keep(a.id, row(a, { scutoid: true, curly: false, humeral: true, stubble: false }));
  const b = s.cross('s1', 's2');
  const gal = s.keep(b.id, row(b, { curly: true, scutoid: false, stubble: true, humeral: false }));
  const c = s.cross(gfp.id, gal.id);
  assert.equal(c.generation, 2);
  const v = s.keep(c.id, row(c, { curly: true, scutoid: false, humeral: true, stubble: false }));
  const r = s.declare(v.id);
  assert.ok(r.ok, JSON.stringify(r));
  assert.equal(r.generations, 2);
});

test('planner: losing track of an unmarked mutation gives a mixed vial', () => {
  const s = new PlannerSession(PUZZLES[3]);
  const a = s.cross('s0', 's1');
  const het = s.keep(a.id, row(a, { curly: false }));
  const b = s.cross(het.id, 's2');
  // GAL4 carries mini-white, so orange eyes track it on 3; mut¹ has no marker to follow on 2.
  const v = s.keep(b.id, row(b, { curly: true, scutoid: false, humeral: true, stubble: false, eye: 'orange' }));
  const r = s.declare(v.id);
  assert.equal(r.ok, false);
  assert.equal(r.some, true, 'some of these flies are the target');
  assert.deepEqual(r.chroms, ['2']);
});

test('planner: hints are given one at a time and counted', () => {
  const s = new PlannerSession(PUZZLES[0]);
  assert.equal(s.hint(), PUZZLES[0].hints[0]);
  assert.equal(s.hint(), PUZZLES[0].hints[1]);
  assert.equal(s.hint(), null);
  assert.equal(s.hintsUsed, 2);
});

// ---- progress ------------------------------------------------------------------------

test('progress is saved, suggests the next lesson and keeps the best puzzle result', () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
  const events = [];
  globalThis.document = { dispatchEvent: (e) => events.push(e.detail.id) };
  globalThis.CustomEvent ??= class { constructor(type, init) { this.type = type; this.detail = init.detail; } };
  assert.equal(nextLesson().id, 'tour');
  progress.complete('tour');
  assert.equal(nextLesson().id, 'collection', 'practice lessons are not suggested');
  progress.solvePuzzle('cross-3', 3);
  progress.solvePuzzle('cross-3', 2);
  progress.solvePuzzle('cross-3', 4);
  assert.equal(progress.get().puzzles['cross-3'], 2);
  progress.notation = 'both';
  progress.reset();
  assert.deepEqual(progress.get().done, []);
  assert.equal(progress.notation, 'both', 'reset keeps the display preference');
  assert.deepEqual(events, ['tour', 'puzzle:cross-3', 'puzzle:cross-3', 'puzzle:cross-3']);
});
