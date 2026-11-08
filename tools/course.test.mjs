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
import { LESSONS, SECTIONS, progress, nextLesson } from '../src/js/course.js';
import {
  threePointClasses, threePointData, cloneTissue, cloneGoalMet, SHOCK_TIMES, SHOCK_LENGTHS,
  STAGES, simulateTarget, targetChecks, DOSES, PER_GENE, screenStats, screenChecks,
} from '../src/js/research.js';
import { PlannerSession, replayPlan } from '../src/js/plannerSession.js';
import {
  expression, sampleCounts, rng, chiSquare, chiSquareP, complements, complementationCross, deficiencyMap,
} from '../src/js/lessons.js';
import { practiceProblem, benchCross, countVial, PRESETS } from '../src/js/sandboxLogic.js';
import { lessonDraft, restoreDraft } from '../src/js/lessonDraft.js';
import { threePointPractice, cloneCohort, targetWindow } from '../src/js/research.js';
import { VISUAL_GUIDES, guideScene, visualGuideHTML, actionGuideHTML } from '../src/js/lessonVisuals.js';

import { CURRICULUM, PATH, STAGES as TEACHING_STAGES, DEMONSTRATIONS } from '../src/js/curriculum.js';
import { teachingModel } from '../src/js/teachingModels.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;
const steps = (type) => Object.entries(LESSON_CONTENT).flatMap(([id, l]) => l.steps.filter((s) => s.type === type).map((s) => ({ id, ...s })));
const share = (rows, label) => rows.find((r) => r.label === label)?.p ?? 0;

test('every genetics lesson has a labelled chromosome-first visual sequence', () => {
  for (const lesson of LESSONS.filter((l) => l.kind === 'lesson')) {
    const guideId = LESSON_CONTENT[lesson.id].steps[0].visual || lesson.id;
    const guide = VISUAL_GUIDES[guideId];
    assert(guide && guide.frames.length >= 4, `${lesson.id}: explanatory stages`);
    const scenes = guide.frames.map(([title, caption], i) => {
      assert(title && caption.length > 40, `${lesson.id}: stage explains the biological change`);
      const svg = guideScene(guideId, i);
      assert(svg.includes('role="img"') && svg.includes('aria-label='));
      assert(!/undefined|NaN|Infinity/.test(svg));
      return svg;
    });
    assert.equal(new Set(scenes).size, scenes.length);
    assert(visualGuideHTML(guideId).includes('data-visual-play'));
  }
  assert.equal(visualGuideHTML('diagnostic'), '', 'assessment has no explanatory answer guide');
  assert.equal(guideScene('missing', 0), '');
  assert.equal(guideScene('inheritance', -1), guideScene('inheritance', 0));
  assert.equal(guideScene('inheritance', 99), guideScene('inheritance', 3));
});

test('visual activities offer navigation cues, with a separate mapping example', () => {
  for (const type of ['gametes', 'predict', 'count', 'chance', 'chisq', 'grid', 'threepoint', 'clones', 'target', 'screen']) {
    assert.equal((actionGuideHTML(type).match(/data-guide-target/g) || []).length, 3);
  }
  assert.equal(actionGuideHTML('choice'), '');
  assert(VISUAL_GUIDES.threepoint.frames[0][1].includes('not the exercise'));
  assert(guideScene('threepoint', 2).includes('>b</text>'));
  assert(!guideScene('threepoint', 2).includes('cv'));
  assert(guideScene('target', 3).includes('protein-ghost'), 'protein is depleted after activation');
  assert(VISUAL_GUIDES.balancers.frames[2][1].includes('not absolute'));
});

test('beginner steps select specific visual concepts and all guide stages render', () => {
  const teaching = (id, title) => LESSON_CONTENT[id].steps.find((s) => s.title === title);
  for (const [title, expected] of [
    ['Genes ride on chromosomes', 'chromosomes'], ['Meet Curly', 'dominance'],
    ['Curly × normal', 'fertilisation'], ['Two pairs at once', 'assortment'], ['Curly × Curly', 'lethals'],
  ]) assert.equal(teaching('inheritance', title).visual, expected);
  assert.equal(teaching('xlinked', 'Females XX, males XY').visual, 'x-copies');
  assert.equal(teaching('xlinked', 'Swap the parents').visual, 'reciprocal');
  assert.equal(teaching('balancers', 'The same chromosomes in a male').visual, 'male-meiosis');
  assert.equal(teaching('balancers', 'And over a balancer').visual, 'balancer-transmission');
  for (const lesson of Object.values(LESSON_CONTENT)) for (const step of lesson.steps) {
    if (step.visual) assert(VISUAL_GUIDES[step.visual], `unknown guide ${step.visual}`);
  }
  for (const [id, guide] of Object.entries(VISUAL_GUIDES)) for (let i = 0; i < guide.frames.length; i++) {
    const scene = guideScene(id, i);
    assert(!/undefined|NaN|Infinity/.test(scene), `${id} stage ${i}: finite, labelled geometry`);
    assert(scene.includes('role="img"') && scene.includes('aria-label='));
  }
  assert(VISUAL_GUIDES.assortment.frames[3][1].includes('different chromosome pairs'));
  assert(VISUAL_GUIDES.lethals.frames[3][1].includes('surviving adults'));
  assert(VISUAL_GUIDES['x-copies'].frames[0][1].includes('not sex determination'));
  assert.equal((guideScene('chromosomes', 1).match(/<rect /g) || []).length, 8, 'four pairs in a diploid cell');
  assert.equal((guideScene('chromosomes', 3).match(/<rect /g) || []).length, 12, 'eight body-cell chromosomes and four in a gamete');
  assert.equal((guideScene('assortment', 3).match(/<rect /g) || []).length, 8, 'four gamete types each contain two depicted chromosomes');
  assert(guideScene('male-meiosis', 3).includes('>AB sperm</text>'));
  assert(!guideScene('male-meiosis', 3).includes('>Ab sperm</text>'));
});

test('every lesson in the course has content, and every step is well formed', () => {
  for (const l of LESSONS.filter((x) => x.kind === 'lesson')) assert.ok(LESSON_CONTENT[l.id], `content for ${l.id}`);
  for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
    for (const s of lesson.steps) {
      assert.ok(['text', 'choice', 'gametes', 'predict', 'pick', 'go', 'multi', 'count', 'chance', 'chisq', 'grid', 'threepoint', 'clones', 'target', 'screen', 'worked', 'mission', 'reflection'].includes(s.type), `${id}: step type ${s.type}`);
      for (const g of [s.parent, s.mother, s.father, ...(s.diagrams || []).map((d) => d.g)].filter(Boolean)) assert.doesNotThrow(() => parseGenotype(g), `${id}: ${g}`);
      if (s.type === 'multi') assert.ok(s.options.some((o) => o.correct) && s.options.every((o) => o.why), `${id}: multi has answers and notes`);
      if (s.type === 'choice') {
        assert.equal(s.options.filter((o) => o.correct).length, 1, `${id}: one correct option in "${s.question}"`);
        assert.ok(s.options.every((o) => typeof o.why === 'string' && o.why.trim()), `${id}: each option explains its chromosomes`);
      }
      if (s.type === 'go' && s.action.kind === 'scope') assert.ok(LESSONS.some((l) => l.activity === s.action.activity), `${id}: activity ${s.action.activity}`);
    }
  }
});

test('the learning path is connected, optional and teaches before independent work', () => {
  const ids = new Set(LESSONS.map(l=>l.id));
  for (const part of PATH) for (const id of part.lessons) assert(ids.has(id), id);
  const visit=(id, stack=[])=>{ assert(!stack.includes(id), `prerequisite cycle: ${id}`); for(const pre of CURRICULUM[id]?.prerequisites||[]){assert(ids.has(pre));visit(pre,[...stack,id]);} };
  for(const [id, course] of Object.entries(CURRICULUM)) {
    visit(id); assert(course.objectives.length>=3 && Object.keys(course.terms).length && course.coach.length>=3);
    const lesson=LESSON_CONTENT[id]; assert(lesson && lesson.curriculum);
    if(DEMONSTRATIONS[id]) {
      const demo=lesson.steps.findIndex(s=>s.type==='worked');
      const firstTask=lesson.steps.findIndex(s=>!['text','worked'].includes(s.type));
      assert(demo>=0 && demo<firstTask, `${id}: demonstrate before asking`);
      for(const stage of Object.keys(TEACHING_STAGES)) assert(lesson.steps.some(s=>s.stage===stage), `${id}: ${stage}`);
      assert(lesson.steps.some(s=>s.stage==='diagnose' && s.type==='choice'));
    }
  }
});

test('worked examples use the same inheritance and research models as the exercises', () => {
  for(const demo of Object.values(DEMONSTRATIONS)) {
    assert.equal(demo.pages.length,4); assert(demo.pages.every(p=>p.length>60));
    const model=teachingModel(demo);
    if(demo.kind==='cross') {
      assert(near(model.rows.reduce((n,r)=>n+r.p,0),1));
      for(const gs of [model.eggs,model.sperm]) assert(near(gs.reduce((n,g)=>n+g.p,0),1));
      if(model.square) for(const gs of [model.eggs,model.sperm]) assert(gs.every(g=>near(g.p,1/gs.length)), 'an equally weighted square requires equally likely gametes');
      if(demo.recombine) assert.equal(model.square,null,'do not use an equally weighted square for unequal recombinant gametes');
    }
    if(demo.kind==='statistics') { assert(near(model.test.chi,.8)); assert(model.test.fits); }
    if(demo.kind==='mapping') assert(model.d1>0 && model.d2>0 && Number.isFinite(model.coc));
    if(demo.kind==='clones') assert(model.met>=4 && model.summaries.length===8);
    if(demo.kind==='target') assert(model.checks.every(c=>c.ok));
    if(demo.kind==='screen') assert(model.selected.hitGene>=.9 && model.selected.multiShare<=.35);
  }
  assert.equal(teachingModel(DEMONSTRATIONS.inheritance).dead,.25);
  assert.equal(teachingModel(DEMONSTRATIONS.balancers).dead,.5);
});

test('multi-generation investigations replay decisions without storing hidden genotypes', () => {
  for(const index of [3,5]) {
    const s=new PlannerSession(PUZZLES[index]);
    const keep=(c,want)=>s.keep(c.id,c.classes.findIndex(r=>Object.entries(want).every(([k,v])=>r.pheno[k]===v)));
    let target;
    if(index===3) {
      const a=keep(s.cross('s0','s2'),{curly:false,scutoid:true,humeral:true,stubble:false});
      const b=keep(s.cross('s1','s2'),{curly:true,scutoid:false,humeral:false,stubble:true});
      target=keep(s.cross(a.id,b.id),{curly:true,scutoid:false,humeral:true,stubble:false,eye:'orange'});
    } else {
      const trans=keep(s.cross('s1','s2'),{eye:'darkorange'});
      const reporter=keep(s.cross('s0','s3'),{curly:false,scutoid:true,humeral:true,stubble:false});
      const recombinant=keep(s.cross(trans.id,'s3'),{curly:true,scutoid:false,humeral:true,stubble:false,eye:'darkorange'});
      target=keep(s.cross(recombinant.id,reporter.id),{curly:true,scutoid:false,humeral:true,stubble:false,eye:'darkorange'});
    }
    assert(s.declare(target.id).ok);
    const saved=JSON.parse(JSON.stringify({puzzle:s.puzzle.id,actions:s.actions}));
    assert(!JSON.stringify(saved).includes('members'));
    const restored=replayPlan(s.puzzle,saved);
    assert.deepEqual(restored.solved,s.solved); assert.deepEqual(restored.vials,s.vials); assert.deepEqual(restored.actions,s.actions);
    assert.equal(restored.solved.generations,index===3?2:3);
    assert.throws(()=>replayPlan(s.puzzle,{...saved,actions:[{method:'constructor',args:[]}]}),/Invalid/);
    assert.throws(()=>replayPlan(s.puzzle,{...saved,puzzle:'other'}),/Unsupported/);
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
  assert.equal(recommendStart([true, true, true, false, true, true]), 'foundations');
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
  assert.equal(nextLesson().id, 'flyroom', 'practice lessons are not suggested');
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


// ---- research techniques ---------------------------------------------------------------

test('research section exposes technique and strategy lessons with model notes', () => {
  assert.ok(SECTIONS.some((s) => s.id === 'research'));
  const lessons = LESSONS.filter((l) => l.section === 'research');
  assert.deepEqual(lessons.map((l) => l.id), ['threepoint', 'mosaics', 'target', 'screens', 'strategies']);
  for (const l of lessons) {
    assert.equal(l.kind, 'lesson');
    assert.ok(LESSON_CONTENT[l.id].model.length, `${l.id}: model assumptions available together`);
    assert.equal(nextLesson(LESSONS.filter((x) => x.id !== l.id).map((x) => x.id)).id, l.id, 'no prerequisite lock');
  }
});

test('three-point lesson infers gene order and interval distances from sampled chromosomes', () => {
  for (const step of steps('threepoint')) {
    const theoretical = threePointClasses(step), data = threePointData(step);
    assert.ok(near(theoretical.reduce((t, c) => t + c.p, 0), 1));
    assert.ok(near(theoretical.filter((c) => c.kind === 'D').reduce((t, c) => t + c.p, 0), step.coc * step.r[0] * step.r[1]));
    assert.deepEqual(threePointData(step), data, 'stable counts across Back and notation changes');
    assert.equal(data.counts.reduce((t, c) => t + c.n, 0), step.n);
    const byCount = data.counts.map((c, i) => ({ i, n: c.n })).sort((a, b) => a.n - b.n);
    assert.deepEqual(data.dco.slice().sort(), byCount.slice(0, 2).map((c) => c.i).sort(), 'rare pair is recognisable in this teaching sample');
    assert.deepEqual(data.parental.slice().sort(), byCount.slice(-2).map((c) => c.i).sort());
    const middleCandidates = step.shown.filter((gene) => data.dco.every((i) => data.parental.some((j) => step.shown.every((g) => g === gene ? data.counts[i].mutant[g] !== data.counts[j].mutant[g] : data.counts[i].mutant[g] === data.counts[j].mutant[g]))));
    assert.deepEqual(middleCandidates, [data.middle], 'one allele switches between reciprocal parental and DCO chromosomes');
    const recombinantCount = (a, b) => data.counts.filter((c) => c.mutant[a] !== c.mutant[b]).reduce((t, c) => t + c.n, 0);
    assert.ok(near(data.d1, 100 * recombinantCount(step.order[0], step.order[1]) / step.n));
    assert.ok(near(data.d2, 100 * recombinantCount(step.order[1], step.order[2]) / step.n));
    const dco = data.dco.reduce((t, i) => t + data.counts[i].n, 0);
    assert.ok(near(data.d1 + data.d2 - 100 * recombinantCount(step.order[0], step.order[2]) / step.n, 200 * dco / step.n), 'two outer exchanges are hidden from the two-marker score');
    assert.ok(near(data.coc, dco / (step.n * data.d1 * data.d2 / 10000)));
    assert.ok(Math.abs(data.coc - step.coc) > 0.02, 'sampled coefficient must be calculated, not copied from the model preset');
  }
});

test('clone goals are achievable and model lineages are reciprocal, seeded chromosome products', () => {
  const untreated = cloneTissue({ round: 3, p: 0, seed: 17 });
  assert.equal(untreated.clones, 0);
  assert.ok(untreated.cells.every((c) => c.geno === 1));
  const strong = cloneTissue({ round: 3, p: 1, seed: 17 });
  const eventGenotypes = new Map();
  for (const c of strong.cells.filter((c) => c.event)) {
    if (!eventGenotypes.has(c.event)) eventGenotypes.set(c.event, new Set());
    eventGenotypes.get(c.event).add(c.geno);
  }
  for (const genotypes of eventGenotypes.values()) assert.deepEqual([...genotypes].sort(), [0, 2]);
  assert.deepEqual(cloneTissue({ round: 3, p: 1, seed: 17 }), strong);
  for (const step of steps('clones')) {
    const plans = SHOCK_TIMES.flatMap((t) => SHOCK_LENGTHS.map((l) => cloneTissue({ round: t.round, p: l.p, seed: step.seed })));
    assert.ok(plans.some((t) => cloneGoalMet(t, step.goal)), `${step.title}: a selectable plan works`);
    assert.ok(plans.some((t) => !cloneGoalMet(t, step.goal)), `${step.title}: planning matters`);
    assert.equal(cloneGoalMet(untreated, step.goal), false);
    for (const tissue of plans) {
      assert.equal(tissue.cells.length, tissue.size ** 2);
      assert.ok(tissue.mutantShare >= 0 && tissue.mutantShare <= 1);
      assert.ok(tissue.clones <= tissue.events, 'visible mutant patches exclude events outside the dissected disc');
    }
  }
});

test('TARGET goals respect stage windows, temperature-dependent development and protein perdurance', () => {
  const schedule = (temp) => Object.fromEntries(STAGES.map((s) => [s.id, temp]));
  const cold = simulateTarget(schedule(18)), warm = simulateTarget(schedule(29));
  assert.ok(cold.points.every((p) => p.gal4 === 0 && p.protein === 1));
  assert.ok(cold.eclosion > warm.eclosion, 'colder development takes longer');
  assert.ok(warm.points.at(-1).protein < 0.11);
  for (const step of steps('target')) {
    const feasible = Array.from({ length: 64 }, (_, bits) => Object.fromEntries(STAGES.map((s, i) => [s.id, bits & (1 << i) ? 29 : 18]))).filter((t) => targetChecks(simulateTarget(t), step.goal).every((c) => c.ok));
    assert.ok(feasible.length > 0, step.title);
    assert.ok(!targetChecks(cold, step.goal).every((c) => c.ok), 'no induction fails the knockdown objective');
    for (const temps of feasible) {
      const sim = simulateTarget(temps);
      assert.ok(sim.points.every((p) => Number.isFinite(p.protein) && p.protein >= 0 && p.protein <= 1));
      for (const check of step.goal.checks) {
        const window = sim.points.filter((p) => check.stages.includes(p.stage));
        const end = window.at(-1).t;
        const selected = check.last ? window.filter((p) => p.t > end - check.last) : window;
        assert.equal(targetChecks(sim, { checks: [check] })[0].ok, selected.every((p) => (check.min === undefined || p[check.measure] >= check.min) && (check.max === undefined || p[check.measure] <= check.max)));
      }
    }
  }
  const adult = simulateTarget({ ...schedule(18), adult: 29 }).points.filter((p) => p.stage === 'adult');
  assert.ok(adult[0].protein > 0.9 && adult.at(-1).protein < 0.2, 'activation does not instantly remove existing protein');
  const recovery = simulateTarget({ ...schedule(18), pupa: 29 }).points.filter((p) => p.stage === 'adult');
  assert.ok(recovery[0].protein < 0.3 && recovery.at(-1).protein > 0.8, 'return to repression requires time for protein recovery');
});

test('screen plans balance independent chromosomes, conditional multiple-hit share and capacity', () => {
  for (const dose of DOSES) {
    const a = screenStats(dose.mM, 1000), b = screenStats(dose.mM, 2000);
    assert.ok(b.hitGene > a.hitGene);
    assert.equal(a.multiShare, b.multiShare, 'more lines cannot change per-chromosome mutation burden');
    assert.equal(b.vials, 4000);
    assert.ok(near(a.hitGene, 1 - (1 - dose.lambda * PER_GENE) ** 1000));
    assert.ok(near(a.multiShare * (1 - Math.exp(-dose.lambda)), 1 - Math.exp(-dose.lambda) * (1 + dose.lambda)), 'denominator is chromosomes with at least one lethal hit');
  }
  for (const step of steps('screen')) {
    const plans = DOSES.map((dose) => ({ dose: dose.mM, n: Math.ceil(Math.log(1 - step.goal.minHit) / Math.log(1 - dose.lambda * PER_GENE)) }));
    const feasible = plans.filter((p) => screenChecks(p.dose, p.n, step.goal).every((c) => c.ok));
    assert.ok(feasible.length, `${step.title}: feasible preset and integer line count`);
    assert.ok(feasible.length < DOSES.length, `${step.title}: dose/capacity constraints exclude alternatives`);
    for (const p of feasible) assert.equal(screenChecks(p.dose, p.n - 1, step.goal)[0].ok, false, 'rounding below the minimum misses coverage');
    assert.equal(screenChecks(15, step.goal.maxLines + 1, step.goal).at(-1).ok, false, 'over-capacity plans fail even if coverage is sufficient');
  }
});

test('drafts preserve unchecked input and plans without storing derived model arrays', () => {
  const lesson = LESSON_CONTENT.target;
  const states = lesson.steps.map(() => ({ done: false }));
  states[2] = { temps: { adult: 29 }, ran: true, sim: { points: [1, 2] }, result: { cells: [1, 2] }, assisted: true, value: '0.123' };
  const draft = lessonDraft(lesson, 2, states);
  const restored = restoreDraft(lesson, JSON.parse(JSON.stringify(draft)));
  assert.equal(restored.index, 2);
  assert.deepEqual(restored.state[2], { temps: { adult: 29 }, ran: true, assisted: true, value: '0.123' });
  restored.state[2].temps.adult = 18;
  assert.equal(draft.state[2].temps.adult, 29);
  for (const bad of [{ ...draft, version: 0 }, { ...draft, index: -1 }, { ...draft, state: [] }, { ...draft, types: ['text'] }]) assert.equal(restoreDraft(lesson, bad), null);
});

test('supported completion and independent fresh-case practice are distinct, persistent results', () => {
  progress.reset();
  progress.saveDraft('threepoint', { index: 2 });
  assert.equal(progress.get().drafts.threepoint.index, 2);
  progress.complete('threepoint', { assisted: true });
  assert.equal(progress.get().drafts.threepoint, undefined);
  assert.deepEqual(progress.get().results.threepoint, { assisted: true, independentPractice: false });
  progress.complete('threepoint', { independentPractice: true });
  progress.complete('threepoint', { assisted: true });
  assert.deepEqual(progress.get().results.threepoint, { assisted: false, independentPractice: true }, 'later supported revision does not erase independent practice');
  progress.reset(); assert.deepEqual(progress.get().results, {});
});

test('fresh mapping cases preserve real locus order while changing phase and sampled offspring', () => {
  const step = steps('threepoint')[0];
  for (const seed of [7948, 15867, 23786, 31705]) {
    const fresh = threePointPractice(step, seed), data = threePointData(fresh);
    assert.deepEqual(fresh.order, ['y', 'cv', 'v']);
    assert.deepEqual(threePointPractice(step, seed), fresh);
    assert.notDeepEqual(data.counts.map((c) => c.n), threePointData(step).counts.map((c) => c.n));
    assert(data.expectedDco > 0 && Number.isFinite(data.coc));
    const sorted = data.counts.map((c, i) => ({ i, n: c.n })).sort((a, b) => a.n - b.n);
    assert.deepEqual(sorted.slice(0, 2).map((c) => c.i).sort(), data.dco.slice().sort());
    assert.deepEqual(sorted.slice(-2).map((c) => c.i).sort(), data.parental.slice().sort());
  }
});

test('clone plans succeed across independent discs, with multiple feasible plans for each goal', () => {
  for (const step of steps('clones')) {
    const plans = SHOCK_TIMES.flatMap((t) => SHOCK_LENGTHS.map((l) => cloneCohort({ round: t.round, p: l.p, seed: step.seed, goal: step.goal })));
    assert(plans.filter((c) => c.met >= 4).length > 1, 'avoid one lucky seed as the only solution');
    assert(plans.some((c) => c.met < 4));
    for (const cohort of plans) {
      assert.equal(cohort.summaries.length, 8);
      assert.equal(cohort.met, cohort.summaries.filter((d) => cloneGoalMet(d, step.goal)).length);
    }
    const repeat = cloneCohort({ round: 4, p: 0.15, seed: 17, goal: step.goal });
    assert.deepEqual(cloneCohort({ round: 4, p: 0.15, seed: 17, goal: step.goal }), repeat);
    assert(new Set(repeat.summaries.map((d) => JSON.stringify(d))).size > 1, 'discs are independent draws');
  }
});

test('TARGET displayed windows use exactly the assessed hourly points', () => {
  const sim = simulateTarget(Object.fromEntries(STAGES.map((s) => [s.id, 18])));
  const check = { stages: ['adult'], measure: 'protein', last: 48, min: 0.9 };
  const points = targetWindow(sim, check);
  assert.equal(points.length, 48);
  assert(points.every((p) => p.stage === 'adult'));
  assert.equal(points.at(-1).t, sim.points.at(-1).t);
  assert(targetChecks(sim, { checks: [check] })[0].ok);
});

test('research arguments survive completion and progress reset without automatic grading', () => {
  progress.saveLearningNote('research-project', { hypothesis: 'Compare timed depletion with temperature-matched controls.' });
  progress.complete('research-project');
  assert(progress.get().learningNotes['research-project'].hypothesis.includes('timed depletion'));
  progress.reset();
  assert(progress.get().learningNotes['research-project'].hypothesis.includes('timed depletion'));
  const noteStep=LESSON_CONTENT['research-project'].steps.find(s=>s.type==='reflection');
  assert.equal(noteStep.stage,'diagnose'); assert.equal(Object.keys(noteStep.prompts).length,3);
});
