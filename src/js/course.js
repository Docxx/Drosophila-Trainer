// The course: lesson catalogue, suggested order and saved progress.
// Every lesson is open from the start; progress only suggests what to do next.

export const SECTIONS = [
  { id: 'handling', title: 'Handling flies', blurb: 'Use the microscope, tell males from females and collect virgins.' },
  { id: 'inheritance', title: 'Inheritance', blurb: 'Follow chromosomes from parents to offspring, then test it at the bench.' },
  { id: 'stocks', title: 'Building stocks', blurb: 'Balancers, and planning crosses across generations.' },
  {
    id: 'advanced',
    title: 'Experiments and analysis',
    blurb: 'Statistics, recombination mapping, GAL4/UAS experiments and complementation.',
  },
  {
    id: 'research',
    title: 'Research techniques',
    blurb: 'Three-point maps, FLP/FRT clones, temporal control and planning genetic screens.',
  },
  {
    id: 'investigations',
    title: 'Research investigations',
    blurb: 'Integrate chromosome tracking, multi-generation construction and experimental interpretation.',
  },
  { id: 'practice', title: 'Open practice', blurb: 'Free experimentation and unlimited practice problems. Use any time.' },
];

// kind: 'tour' and 'scope' open the microscope; 'lesson' and 'planner' open the genetics desk.
export const LESSONS = [
  {
    id: 'tour',
    section: 'handling',
    kind: 'tour',
    title: 'Meet the fly',
    minutes: 8,
    summary: 'Learn to zoom and turn a fly. Find sex combs on male forelegs and the meconium, a dark gut deposit in newly emerged flies.',
  },
  {
    id: 'reference',
    section: 'handling',
    kind: 'scope',
    activity: 'reference',
    title: 'Reference bench',
    minutes: 5,
    summary: 'Compare five known flies at your own pace, without assessment.',
    practice: true,
  },
  {
    id: 'flyroom',
    section: 'handling',
    kind: 'lesson',
    title: 'From a vial to a reliable cross',
    minutes: 15,
    summary: 'Follow the fly life cycle and learn to label generations and keep vial records.',
  },
  {
    id: 'collection',
    section: 'handling',
    kind: 'scope',
    activity: 'exercise',
    title: 'Virgin collection',
    minutes: 10,
    summary: 'Use a complete clearing record and body features to collect virgin females, including females that have already darkened.',
  },
  {
    id: 'foundations',
    section: 'inheritance',
    kind: 'lesson',
    title: 'Start here: the language of genetics',
    minutes: 20,
    summary: "Start with cells and chromosomes. Learn what genes and alleles are and how they affect a fly's appearance.",
  },
  {
    id: 'inheritance',
    section: 'inheritance',
    kind: 'lesson',
    title: 'Chromosomes and inheritance',
    minutes: 25,
    summary: 'Build egg types, predict Curly offspring and see why some chromosome combinations die.',
  },
  {
    id: 'xlinked',
    section: 'inheritance',
    kind: 'lesson',
    title: 'The X chromosome',
    minutes: 25,
    summary: 'Follow the white eye-colour gene on the X to explain differences between sons and daughters.',
  },
  {
    id: 'first-cross',
    section: 'inheritance',
    kind: 'scope',
    activity: 'cross',
    title: 'First cross',
    minutes: 15,
    summary: 'Collect white-eyed females, cross them to red-eyed males and investigate their offspring.',
  },
  {
    id: 'notation',
    section: 'stocks',
    kind: 'lesson',
    title: 'Read a fly stock and a cross',
    minutes: 20,
    summary: 'Read slashes, semicolons, +, Y and chromosome marker names before planning a cross.',
  },
  {
    id: 'balancers',
    section: 'stocks',
    kind: 'lesson',
    title: 'Balancers',
    minutes: 30,
    summary: 'Use CyO, TM3 and TM6B balancers to maintain mutations and follow the chromosomes through crosses.',
  },
  {
    id: 'planner',
    section: 'stocks',
    kind: 'planner',
    title: 'Cross planner',
    minutes: 30,
    summary: 'Plan crosses and select offspring to build the target stock across six puzzles.',
  },
  {
    id: 'chance',
    section: 'advanced',
    kind: 'lesson',
    title: 'Counting and chance',
    minutes: 25,
    summary: 'Count different-sized samples, explore chance variation and compare counts with predictions using χ².',
  },
  {
    id: 'recombination',
    section: 'advanced',
    kind: 'lesson',
    title: 'Recombination and mapping',
    minutes: 25,
    summary: 'Use offspring counts to estimate the distance between insertions, then keep and check the wanted recombinant chromosome.',
  },
  {
    id: 'gal4uas',
    section: 'advanced',
    kind: 'lesson',
    title: 'GAL4/UAS and controls',
    minutes: 30,
    summary: 'Use GAL4/UAS to activate a responder, identify the experimental offspring and choose controls for an RNAi experiment.',
  },
  {
    id: 'complementation',
    section: 'advanced',
    kind: 'lesson',
    title: 'Complementation and mapping',
    minutes: 30,
    summary: 'Cross three mutant lines to test whether they affect the same gene, then locate them with overlapping chromosome deletions.',
  },
  {
    id: 'threepoint',
    section: 'research',
    kind: 'lesson',
    title: 'Three-point mapping',
    minutes: 30,
    summary: 'Follow three markers on maternal X chromosomes to work out gene order, double crossovers and interference.',
  },
  {
    id: 'mosaics',
    section: 'research',
    kind: 'lesson',
    title: 'FLP/FRT clones and twin spots',
    minutes: 25,
    summary: 'Create mutant cell patches by chromosome exchange, then plan for a few large clones or many small ones.',
  },
  {
    id: 'target',
    section: 'research',
    kind: 'lesson',
    title: 'GAL80ts: controlling time',
    minutes: 25,
    summary: 'Choose temperature shifts to protect development and allow time for target protein to disappear or recover.',
  },
  {
    id: 'screens',
    section: 'research',
    kind: 'lesson',
    title: 'Planning a genetic screen',
    minutes: 25,
    summary: 'Balance the chance of finding an allele against extra mutations and the space needed to keep lines.',
  },
  {
    id: 'transgenesis',
    section: 'research',
    kind: 'lesson',
    title: 'Create and establish a transgenic line',
    minutes: 30,
    summary: 'Choose an insertion method, recover inherited insertions and verify a transgenic stock.',
  },
  {
    id: 'gal80',
    section: 'research',
    kind: 'lesson',
    title: 'GAL80: restrict where GAL4 works',
    minutes: 20,
    summary: 'Follow driver and repressor patterns to predict where a UAS responder remains active.',
  },
  {
    id: 'geneswitch',
    section: 'research',
    kind: 'lesson',
    title: 'GeneSwitch: control expression with a drug',
    minutes: 25,
    summary: 'Break down the drug-responsive driver and plan induction, timing and experimental controls.',
  },
  {
    id: 'recombination-tools',
    section: 'research',
    kind: 'lesson',
    title: 'Recombination: choose the mechanism',
    minutes: 30,
    summary: 'Distinguish inherited crossovers, cell clones, DNA excision, inversion, integration and targeted repair.',
  },
  {
    id: 'strategies',
    section: 'research',
    kind: 'lesson',
    title: 'Choose the genetic strategy',
    minutes: 30,
    summary:
      'Match the tool to the question: choose genetic changes, interpret reporter and clone markers, and test maternal contributions and cause.',
  },
  {
    id: 'investigation',
    section: 'investigations',
    kind: 'lesson',
    title: 'Do not lose the invisible chromosome',
    minutes: 30,
    summary: 'Find where a cross plan loses track of an unmarked lethal mutation, then build a stock that retains it.',
  },
  {
    id: 'research-project',
    section: 'investigations',
    kind: 'lesson',
    title: 'Construct, verify and interpret',
    minutes: 45,
    summary: 'Build a three-generation stock, check its constructs and plan the controls and timing needed to interpret a result.',
  },
  {
    id: 'sandbox',
    section: 'practice',
    kind: 'sandbox',
    title: 'Genetics bench',
    minutes: 0,
    summary:
      'Choose parents, inspect their egg and sperm types, predict offspring and analyse a sample. Practise with unlimited new problems.',
    practice: true,
  },
];

export const DIAGNOSTIC = {
  id: 'diagnostic',
  title: 'Quick check',
  minutes: 3,
  summary: 'Answer six optional questions for a suggested starting point.',
};

const KEY = 'fly-trainer.progress.v1';
let memory = { done: [], puzzles: {}, drafts: {}, results: {}, learningNotes: {}, notation: 'diagram' };
let storageUnavailable = false;

function read() {
  if (storageUnavailable) return structuredClone(memory);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object')
      return { done: [], puzzles: {}, drafts: {}, results: {}, learningNotes: {}, notation: 'diagram', ...saved };
  } catch {
    /* fall through */
  }
  return structuredClone(memory);
}
function write(p) {
  memory = structuredClone(p);
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    storageUnavailable = true;
  }
}

export const progress = {
  get() {
    return read();
  },
  isDone(id) {
    return read().done.includes(id);
  },
  saveDraft(id, draft) {
    const p = read();
    p.drafts[id] = draft;
    write(p);
  },
  clearDraft(id) {
    const p = read();
    delete p.drafts[id];
    write(p);
  },
  saveLearningNote(id, notes) {
    const p = read();
    p.learningNotes[id] = Object.fromEntries(Object.entries(notes).map(([key, value]) => [key, String(value).slice(0, 5000)]));
    write(p);
  },
  complete(id, { assisted = false, independentPractice = false } = {}) {
    const p = read();
    if (!p.done.includes(id)) p.done.push(id);
    const previous = p.results[id];
    p.results[id] = {
      assisted: previous ? previous.assisted && assisted : assisted,
      independentPractice: !!previous?.independentPractice || independentPractice,
    };
    delete p.drafts[id];
    write(p);
    document.dispatchEvent(new CustomEvent('flytrainer:progress', { detail: { id } }));
  },
  /** Best result for a cross-planner puzzle: fewest generations. */
  solvePuzzle(id, generations) {
    const p = read();
    const best = p.puzzles[id];
    if (!best || generations < best) p.puzzles[id] = generations;
    write(p);
    document.dispatchEvent(new CustomEvent('flytrainer:progress', { detail: { id: `puzzle:${id}` } }));
  },
  /** Best run of right answers in the practice problems. */
  recordStreak(n) {
    const p = read();
    if (n > (p.bestStreak || 0)) {
      p.bestStreak = n;
      write(p);
    }
  },
  /** How genotypes are shown: 'diagram', 'notation' or 'both'. */
  get notation() {
    return read().notation;
  },
  set notation(value) {
    const p = read();
    p.notation = value;
    write(p);
  },
  reset() {
    write({ done: [], puzzles: {}, drafts: {}, results: {}, learningNotes: read().learningNotes, notation: read().notation });
  },
};

/** The first lesson not yet completed, in course order (practice lessons are skipped). */
export function nextLesson(done = read().done) {
  return LESSONS.find((l) => !l.practice && !done.includes(l.id)) || null;
}
