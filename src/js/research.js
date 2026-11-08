// Research techniques: the models behind the most advanced lessons. All pure
// (no DOM), seeded where random, and tested in tools/course.test.mjs.
//   - three-point mapping on the X (gene order, distances, interference)
//   - FLP/FRT mitotic recombination in a growing tissue (clone size and number)
//   - GAL80ts temporal control (GAL4 activity and target protein over time)
//   - EMS screen design (Poisson hits, lines needed, multiple-hit lines)

import { rng, sampleCounts } from './random.js';

// ---- three-point mapping ---------------------------------------------------------------

// Three recessive X-linked markers. Map positions (FlyBase recombination map):
// y 1-0.0, cv 1-13.7, v 1-33.0, so y-cv is 13.7 cM and cv-v is 19.3 cM.
export const TP_GENES = {
  y: { name: 'yellow', symbol: 'y', mutant: 'yellow body' },
  cv: { name: 'crossveinless', symbol: 'cv', mutant: 'crossveinless' },
  v: { name: 'vermilion', symbol: 'v', mutant: 'vermilion eyes' },
};

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Offspring classes of a three-point test cross. `order` is the true gene order,
 * `phase` marks which genes are mutant on the mother's first X (the other X carries
 * the rest), `r` the recombination fractions of the two intervals and `coc` the
 * coefficient of coincidence. Rows are listed in the order of `shown`.
 */
export function threePointClasses({ order, shown, phase, r: [r1, r2], coc }) {
  const d = coc * r1 * r2;
  const rows = [];
  for (let bits = 0; bits < 8; bits++) {
    const mutant = Object.fromEntries(shown.map((gene, i) => [gene, !!(bits & (4 >> i))]));
    const same = order.map((gene) => mutant[gene] === !!phase[gene]);
    const regionI = same[0] !== same[1];
    const regionII = same[1] !== same[2];
    const kind = regionI && regionII ? 'D' : regionI ? 'I' : regionII ? 'II' : 'P';
    const p = { P: 1 - r1 - r2 + d, I: r1 - d, II: r2 - d, D: d }[kind] / 2;
    const traits = shown.filter((gene) => mutant[gene]).map((gene) => TP_GENES[gene].mutant);
    rows.push({ label: capital(traits.length ? traits.join(', ') : 'wild type'), mutant, kind, p });
  }
  return rows;
}

/** Sampled counts plus every answer the lesson checks. */
export function threePointData(step) {
  const rows = threePointClasses(step);
  const counts = sampleCounts(rows, step.n, rng(step.seed)).map((c, i) => ({ ...rows[i], n: c.n }));
  const sum = (kinds) => counts.filter((c) => kinds.includes(c.kind)).reduce((t, c) => t + c.n, 0);
  const d1 = (sum(['I', 'D']) / step.n) * 100;
  const d2 = (sum(['II', 'D']) / step.n) * 100;
  const expectedDco = step.n * (d1 / 100) * (d2 / 100);
  return {
    counts,
    parental: counts.map((c, i) => (c.kind === 'P' ? i : -1)).filter((i) => i >= 0),
    dco: counts.map((c, i) => (c.kind === 'D' ? i : -1)).filter((i) => i >= 0),
    middle: step.order[1],
    d1, d2,
    coc: sum(['D']) / expectedDco,
    expectedDco,
  };
}

// ---- FLP/FRT mosaics -------------------------------------------------------------------

/**
 * Heat-shock times on offer, as larval age (hours after egg laying) and the
 * division round of the model disc that is under way then (illustrative: the
 * disc grows from a few founder cells to about a thousand).
 */
export const SHOCK_TIMES = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ round: k + 2, hours: 24 + 12 * (k - 1) }));
/** Heat-shock length → chance that one dividing cell recombines at its FRTs. */
export const SHOCK_LENGTHS = [{ minutes: 10, p: 0.05 }, { minutes: 30, p: 0.15 }, { minutes: 60, p: 0.35 }];

/**
 * A disc of `size`² cells grown by repeated division from one founder. Each
 * division splits a patch of cells into two neighbouring halves, so clones stay
 * together. A heat shock at division `round` gives each dividing het cell chance
 * `p` of mitotic recombination: one daughter becomes m/m (the clone), the other
 * +/+ (its twin). cells[i] = { geno: 0 (m/m) | 1 (m/+) | 2 (+/+), event, inside }.
 */
export function cloneTissue({ round, p, seed = 1, size = 32 }) {
  const random = rng(seed);
  const cells = new Array(size * size);
  let events = 0;
  const all = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) all.push([x, y]);

  function grow(patch, depth, geno, event) {
    if (patch.length === 1) {
      const [x, y] = patch[0];
      const dx = (x + 0.5) / size - 0.5, dy = (y + 0.5) / size - 0.5;
      cells[y * size + x] = { geno, event, inside: (dx / 0.5) ** 2 + (dy / 0.36) ** 2 <= 1 };
      return;
    }
    // Split along the longer side, a little off-centre, as real divisions are.
    const xs = patch.map((c) => c[0]), ys = patch.map((c) => c[1]);
    const axis = Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys) ? 0 : 1;
    const sorted = [...patch].sort((a, b) => a[axis] - b[axis] || a[1 - axis] - b[1 - axis]);
    const cut = Math.max(1, Math.min(sorted.length - 1, Math.round(sorted.length * (0.4 + 0.2 * random()))));
    const halves = [sorted.slice(0, cut), sorted.slice(cut)];
    if (depth === round && geno === 1 && random() < p) {
      events++;
      const first = random() < 0.5 ? 0 : 2;
      grow(halves[0], depth + 1, first, events);
      grow(halves[1], depth + 1, 2 - first, events);
      return;
    }
    grow(halves[0], depth + 1, geno, event);
    grow(halves[1], depth + 1, geno, event);
  }
  grow(all, 1, 1, 0);

  // Clones the dissection shows: m/m patches with at least one cell inside the disc.
  const sizes = new Map();
  for (const c of cells) if (c.inside && c.geno === 0) sizes.set(c.event, (sizes.get(c.event) || 0) + 1);
  const cloneSizes = [...sizes.values()];
  return {
    size, cells, events,
    clones: cloneSizes.length,
    meanSize: cloneSizes.length ? cloneSizes.reduce((t, n) => t + n, 0) / cloneSizes.length : 0,
    largest: cloneSizes.length ? Math.max(...cloneSizes) : 0,
    mutantShare: cells.filter((c) => c.inside && c.geno === 0).length / cells.filter((c) => c.inside).length,
  };
}

/** Does a dissected disc meet a goal? Goal: { minClones, maxClones, minLargest, maxMean }. */
export function cloneGoalMet(t, goal) {
  return (goal.minClones === undefined || t.clones >= goal.minClones)
    && (goal.maxClones === undefined || t.clones <= goal.maxClones)
    && (goal.minLargest === undefined || t.largest >= goal.minLargest)
    && (goal.maxMean === undefined || (t.clones > 0 && t.meanSize <= goal.maxMean));
}

// ---- GAL80ts (TARGET) ------------------------------------------------------------------

// Stage lengths at 25 °C in days, roughly; development runs about half as fast at
// 18 °C and a little faster at 29 °C. The adult period is a fixed observation window.
export const STAGES = [
  { id: 'embryo', label: 'Embryo', days: 1 },
  { id: 'L1', label: 'L1', days: 1 },
  { id: 'L2', label: 'L2', days: 1 },
  { id: 'L3', label: 'L3', days: 2 },
  { id: 'pupa', label: 'Pupa', days: 4.5 },
  { id: 'adult', label: 'Adult', days: 6, fixed: true },
];
export const RATE = { 18: 0.5, 29: 1.1 };
const TAU_ON = 6;     // hours for GAL80ts to let go at 29 °C and GAL4 targets to come up
const TAU_OFF = 24;   // hours for GAL80ts to re-accumulate and shut GAL4 off at 18 °C
const TAU_PROTEIN = 24; // hours for the target protein to turn over (perdurance)
const KNOCKDOWN = 0.9;  // RNAi removes 90% of new protein synthesis at full GAL4 activity

/**
 * Simulate one temperature schedule ({ stageId: 18 | 29 }). Returns hourly points
 * { t (hours), stage, temp, gal4 (0-1), protein (0-1) } and stage boundaries.
 */
export function simulateTarget(temps) {
  const points = [];
  const bounds = [];
  let t = 0, gal4 = 0, protein = 1;
  for (const st of STAGES) {
    const temp = temps[st.id];
    const hours = Math.round((st.fixed ? st.days : st.days / RATE[temp]) * 24);
    bounds.push({ id: st.id, label: st.label, start: t, end: t + hours, temp });
    for (let h = 0; h < hours; h++) {
      const on = temp === 29 ? 1 : 0;
      gal4 += (on - gal4) / (on ? TAU_ON : TAU_OFF);
      protein += ((1 - KNOCKDOWN * gal4) - protein) / TAU_PROTEIN;
      points.push({ t: ++t, stage: st.id, temp, gal4, protein });
    }
  }
  return { points, bounds, eclosion: bounds.find((b) => b.id === 'adult').start };
}

/**
 * Goals are lists of checks over stages: { stages, measure: 'gal4' | 'protein',
 * max?, min?, last? (hours at the end of the window only) , text }.
 */
export function targetChecks(sim, goal) {
  return goal.checks.map((c) => {
    const window = sim.points.filter((pt) => c.stages.includes(pt.stage));
    const end = window.at(-1)?.t ?? 0;
    const pts = c.last ? window.filter((pt) => pt.t > end - c.last) : window;
    const vals = pts.map((pt) => pt[c.measure]);
    const ok = vals.length > 0 && (c.max === undefined || Math.max(...vals) <= c.max) && (c.min === undefined || Math.min(...vals) >= c.min);
    return { text: c.text, ok };
  });
}

// ---- mutagenesis screens ---------------------------------------------------------------

/** EMS doses: mean number of new lethal hits per mutagenised chromosome 2. */
export const DOSES = [
  { mM: 15, label: 'Low (15 mM)', lambda: 0.5 },
  { mM: 25, label: 'Standard (25 mM)', lambda: 1.0 },
  { mM: 35, label: 'High (35 mM)', lambda: 1.5 },
];
/** Chance that one chromosome carries a lethal allele of one particular gene, per unit λ. */
export const PER_GENE = 0.001;

/** Expected outcome of screening `lines` F3 lines at a dose. */
export function screenStats(dose, lines) {
  const { lambda } = DOSES.find((d) => d.mM === dose);
  const q = lambda * PER_GENE;
  return {
    lambda,
    hitGene: 1 - (1 - q) ** lines,
    lethalLines: lines * (1 - Math.exp(-lambda)),
    multiShare: (1 - Math.exp(-lambda) * (1 + lambda)) / (1 - Math.exp(-lambda)),
    vials: lines * 2,
  };
}

/** Screen goals: { minHit, maxMulti, maxLines }. */
export function screenChecks(dose, lines, goal) {
  const s = screenStats(dose, lines);
  return [
    { text: `At least a ${Math.round(goal.minHit * 100)}% chance of an allele in your gene`, ok: s.hitGene >= goal.minHit },
    { text: `No more than ${Math.round(goal.maxMulti * 100)}% of lethal lines carry a second lethal`, ok: s.multiShare <= goal.maxMulti },
    { text: `No more than ${goal.maxLines.toLocaleString('en-GB')} lines (your fly room's capacity)`, ok: lines <= goal.maxLines },
  ];
}
