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
import {
  expression, sampleCounts, rng, chiSquare, chiSquareP, complements, complementationCross, deficiencyMap,
} from '../src/js/lessons.js';
import { practiceProblem, benchCross, countVial, PRESETS } from '../src/js/sandboxLogic.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;
const steps = (type) => Object.entries(LESSON_CONTENT).flatMap(([id, l]) => l.steps.filter((s) => s.type === type).map((s) => ({ id, ...s })));
const share = (rows, label) => rows.find((r) => r.label === label)?.p ?? 0;

test('every lesson in the course has content, and every step is well formed', () => {
  for (const l of LESSONS.filter((x) => x.kind === 'lesson')) assert.ok(LESSON_CONTENT[l.id], `content for ${l.id}`);
  for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
    for (const s of lesson.steps) {
      assert.ok(['text', 'choice', 'gametes', 'predict', 'pick', 'go', 'multi', 'count', 'chance', 'chisq', 'grid'].includes(s.type), `${id}: step type ${s.type}`);
      for (const g of [s.parent, s.mother, s.father, ...(s.diagrams || []).map((d) => d.g)].filter(Boolean)) assert.doesNotThrow(() => parseGenotype(g), `${id}: ${g}`);
      if (s.type === 'multi') assert.ok(s.options.some((o) => o.correct) && s.options.every((o) => o.why), `${id}: multi has answers and notes`);
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
  // Questions: handling, handling, inheritance, inheritance, advanced, stocks.
  assert.equal(recommendStart([true, true, true, true, true, true]), 'recombination');
  assert.equal(recommendStart([false, true, true, true, true, true]), 'tour');
  assert.equal(recommendStart([true, true, true, false, true, true]), 'inheritance');
  assert.equal(recommendStart([true, true, true, true, true, false]), 'balancers');
  assert.equal(recommendStart([true, true, true, true, false, true]), 'chance');
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

// ---- advanced material ------------------------------------------------------------------

test('complementation follows shared lethal genes, and the mapping lesson agrees with the engine', () => {
  assert.ok(complements('mut', 'mut2') && complements('mut', 'mut3') && complements('mut2', 'mut3'), 'three different genes');
  for (const m of ['mut', 'mut2', 'mut3']) assert.equal(complements(m, m), false, `${m} fails with itself`);
  const fails = (m) => ['Df1', 'Df2', 'Df3'].filter((d) => !complements(m, d));
  assert.deepEqual(fails('mut'), ['Df1']);
  assert.deepEqual(fails('mut2'), ['Df2', 'Df3'], 'mut² lies in gene c (B and C overlap)');
  assert.deepEqual(fails('mut3'), ['Df3'], 'mut³ lies in gene d (C only)');
  assert.equal(complements('Df1', 'Df3'), true, 'non-overlapping deficiencies complement');
  assert.equal(complements('Df1', 'Df2'), false, 'overlapping deficiencies fail');
  // Sampled crosses show straight-winged flies exactly when the pair complements.
  for (const [a, b] of [['mut', 'mut2'], ['mut', 'Df1'], ['mut2', 'Df3'], ['mut3', 'Df2']]) {
    assert.equal(complementationCross(a, b, 60, 5).complements, complements(a, b), `${a} × ${b}`);
  }
  assert.deepEqual(deficiencyMap(['Df1', 'Df2', 'Df3']).dfs.map((d) => d.genes.join('')), ['ab', 'bc', 'cd']);
});

test('balancer puzzles are unaffected by the new lethal rules', () => {
  const { rows } = classesFor('w/w; mut/CyO; +/+', 'w/Y; mut/CyO; +/+', { traits: ['curly'] });
  assert.equal(rows.length, 1, 'mut/mut still dies');
});

test('GAL4/UAS expression needs both halves', () => {
  const ex = (t) => expression(parseGenotype(t));
  assert.deepEqual(ex('w/w; UAS-GFP/+; +/+'), { gfp: false, rnai: false });
  assert.deepEqual(ex('w/w; UAS-GFP/+; GAL4/+'), { gfp: true, rnai: false });
  assert.deepEqual(ex('w/w; +/+; GAL4,UAS-RNAi/+'), { gfp: false, rnai: true }, 'recombinant carries both');
  const { rows } = classesFor('w/w; +/+; GAL4/TM6B', 'w/Y; +/+; UAS-RNAi/UAS-RNAi', { traits: ['rnai', 'tubby'] });
  assert.ok(near(share(rows, 'Knockdown (GAL4 > RNAi)'), 1 / 2) && near(share(rows, 'No knockdown, Tubby'), 1 / 2));
});

test('sampling is reproducible and chi-square matches standard tables', () => {
  const rows = [{ label: 'a', p: 0.5 }, { label: 'b', p: 0.5 }];
  assert.deepEqual(sampleCounts(rows, 100, rng(4)), sampleCounts(rows, 100, rng(4)));
  assert.equal(sampleCounts(rows, 250, rng(9)).reduce((t, r) => t + r.n, 0), 250);
  assert.ok(Math.abs(chiSquareP(3.841, 1) - 0.05) < 1e-3);
  assert.ok(Math.abs(chiSquareP(5.991, 2) - 0.05) < 1e-3);
  assert.ok(Math.abs(chiSquareP(9.488, 4) - 0.05) < 1e-3);
  const step = LESSON_CONTENT.chance.steps.find((s) => s.type === 'chisq');
  const verdict = step.hypotheses.map((h) => chiSquare(step.observed.map((o) => o.n), h.shares).fits);
  assert.deepEqual(verdict, [false, true, false], 'only 2:1 fits the Curly × Curly vial');
});

test('the recombination counting step has a sensible, reproducible answer', () => {
  const step = LESSON_CONTENT.recombination.steps.find((s) => s.type === 'count');
  const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
  const a = step.answer(sampleCounts(rows, step.n, rng(step.seed)));
  assert.ok(a > 24 && a < 36, `estimate ${a}% near the model's 30%`);
});

test('the bench handles every preset, and practice problems are answerable', () => {
  for (const p of PRESETS) {
    const r = benchCross(p.F, p.M);
    assert.ok(r.motherOk && r.fatherOk && near(r.rows.reduce((t, x) => t + x.p, 0), 1), p.name);
  }
  assert.equal(benchCross('w/w; mut/mut; +/+', 'w/Y; +/+; +/+').motherOk, false, 'lethal parent is flagged');
  const v = countVial(benchCross('w/w; CyO/+; +/+', 'w/Y; +/+; +/+').rows, 200, 3);
  assert.equal(v.counts.reduce((t, c) => t + c.n, 0), 200);
  assert.ok(v.test && v.test.df === 1);
  for (let seed = 1; seed <= 300; seed++) {
    for (const level of [1, 2]) {
      const q = practiceProblem(seed, level);
      assert.equal(q.options.filter((o) => near(o.p, q.answer)).length, 1, `seed ${seed}: one right option`);
      assert.equal(new Set(q.options.map((o) => o.label)).size, q.options.length, `seed ${seed}: options distinct`);
      assert.ok(q.rows.some((r) => r.label === q.label && near(r.p, q.answer)));
    }
  }
});
