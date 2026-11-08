// The course: lesson catalogue, suggested order and saved progress.
// Every lesson is open from the start; progress only suggests what to do next.

export const SECTIONS = [
  { id: 'handling', title: 'Handling flies', blurb: 'Use the microscope, tell males from females and collect virgins.' },
  { id: 'inheritance', title: 'Inheritance', blurb: 'Follow chromosomes from parents to offspring, then test it at the bench.' },
  { id: 'stocks', title: 'Building stocks', blurb: 'Balancers, and planning crosses across generations.' },
  { id: 'advanced', title: 'Experiments and analysis', blurb: 'Statistics, recombination mapping, GAL4/UAS experiments and complementation.' },
  { id: 'research', title: 'Research techniques', blurb: 'Three-point maps, FLP/FRT clones, temporal control and planning genetic screens.' },
  { id: 'practice', title: 'Open practice', blurb: 'Free experimentation and unlimited practice problems. Use any time.' },
];

// kind: 'tour' and 'scope' open the microscope; 'lesson' and 'planner' open the genetics desk.
export const LESSONS = [
  { id: 'tour', section: 'handling', kind: 'tour', title: 'Meet the fly', minutes: 8, summary: 'A guided tour of the microscope: zoom, turn a fly over, and find the sex combs and the meconium.' },
  { id: 'reference', section: 'handling', kind: 'scope', activity: 'reference', title: 'Reference bench', minutes: 5, summary: 'Five known flies to compare at your own pace. Nothing is assessed.', practice: true },
  { id: 'collection', section: 'handling', kind: 'scope', activity: 'exercise', title: 'Virgin collection', minutes: 10, summary: 'Sort a real batch: find the virgin females and spot the fly that should not be there.' },
  { id: 'inheritance', section: 'inheritance', kind: 'lesson', title: 'Chromosomes and inheritance', minutes: 12, summary: 'Build gametes from a Curly fly, predict its offspring, and discover why some genotypes never appear.' },
  { id: 'xlinked', section: 'inheritance', kind: 'lesson', title: 'The X chromosome', minutes: 10, summary: 'Why sons and daughters of the same cross can look different, using the white eye-colour gene.' },
  { id: 'first-cross', section: 'inheritance', kind: 'scope', activity: 'cross', title: 'First cross', minutes: 15, summary: 'Collect white-eyed females, cross them to red-eyed males and read the result in their offspring.' },
  { id: 'balancers', section: 'stocks', kind: 'lesson', title: 'Balancers', minutes: 15, summary: 'How CyO, TM3 and TM6B keep mutations in place, and why every fly in a balanced stock looks the same.' },
  { id: 'planner', section: 'stocks', kind: 'planner', title: 'Cross planner', minutes: 30, summary: 'Six puzzles: plan the crosses that build a target stock, generation by generation.' },
  { id: 'chance', section: 'advanced', kind: 'lesson', title: 'Counting and chance', minutes: 12, summary: 'Count vials of different sizes, see how far chance moves a ratio, and test counts with χ².' },
  { id: 'recombination', section: 'advanced', kind: 'lesson', title: 'Recombination and mapping', minutes: 12, summary: 'Measure the distance between two insertions from real counts, then pick and verify a recombinant.' },
  { id: 'gal4uas', section: 'advanced', kind: 'lesson', title: 'GAL4/UAS and controls', minutes: 12, summary: 'Switch genes on with GAL4/UAS, sort the right offspring, and choose the controls a knockdown needs.' },
  { id: 'complementation', section: 'advanced', kind: 'lesson', title: 'Complementation and mapping', minutes: 15, summary: 'Run a complementation grid, then map three lethal mutations with overlapping deficiencies.' },
  { id: 'threepoint', section: 'research', kind: 'lesson', title: 'Three-point mapping', minutes: 18, summary: 'Read three markers on maternal X chromosomes, infer gene order, and count double crossovers and interference.' },
  { id: 'mosaics', section: 'research', kind: 'lesson', title: 'FLP/FRT clones and twin spots', minutes: 15, summary: 'Induce mitotic recombination in a model disc and plan for a few large clones or many small ones.' },
  { id: 'target', section: 'research', kind: 'lesson', title: 'GAL80ts: controlling time', minutes: 15, summary: 'Plan temperature shifts, protect development, and allow for activation, protein depletion and recovery.' },
  { id: 'screens', section: 'research', kind: 'lesson', title: 'Planning a genetic screen', minutes: 15, summary: 'Balance independent lines, gene coverage, multiple-hit chromosomes and fly-room capacity.' },
  { id: 'sandbox', section: 'practice', kind: 'sandbox', title: 'Genetics bench', minutes: 0, summary: 'Build any two flies, see their gametes and offspring, count vials with a χ² test, and drill unlimited practice problems.', practice: true },
];

export const DIAGNOSTIC = { id: 'diagnostic', title: 'Quick check', minutes: 3, summary: 'Six questions to suggest where to start. Optional.' };

const KEY = 'fly-trainer.progress.v1';

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') return { done: [], puzzles: {}, notation: 'diagram', ...saved };
  } catch { /* fall through */ }
  return { done: [], puzzles: {}, notation: 'diagram' };
}
function write(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* progress stays in memory */ }
}

export const progress = {
  get() { return read(); },
  isDone(id) { return read().done.includes(id); },
  complete(id) {
    const p = read();
    if (!p.done.includes(id)) { p.done.push(id); write(p); }
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
    if (n > (p.bestStreak || 0)) { p.bestStreak = n; write(p); }
  },
  /** How genotypes are shown: 'diagram', 'notation' or 'both'. */
  get notation() { return read().notation; },
  set notation(value) { const p = read(); p.notation = value; write(p); },
  reset() { write({ done: [], puzzles: {}, notation: read().notation }); },
};

/** The first lesson not yet completed, in course order (practice lessons are skipped). */
export function nextLesson(done = read().done) {
  return LESSONS.find((l) => !l.practice && !done.includes(l.id)) || null;
}
