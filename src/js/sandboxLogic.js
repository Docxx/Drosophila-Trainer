// Genetics bench logic (no DOM): parent options, cross results, vial counts and
// generated practice problems. Everything is computed by the genetics engine.

import { CHROMS, formatGenotype, parseGenotype, isViable } from './genetics/genetics.js';
import { ratioText } from './genetics/crosses.js';
import { classesFor, sampleCounts, chiSquare, rng, ALL_TRAITS, gametesFor } from './lessons.js';

/** Homolog choices for a parent's chromosome slot. */
export function homologOptions(chrom, { male = false, slot = 0 } = {}) {
  if (chrom === 'X' && male && slot === 1) return ['Y'];
  return Object.keys(CHROMS[chrom]).filter((k) => k !== 'Y');
}

export const PRESETS = [
  { name: 'Canton-S (wild type)', F: '+/+; +/+; +/+', M: '+/Y; +/+; +/+' },
  { name: 'w¹¹¹⁸', F: 'w/w; +/+; +/+', M: 'w/Y; +/+; +/+' },
  { name: 'Double balancer', F: 'w/w; Sco/CyO; TM3/TM6B', M: 'w/Y; Sco/CyO; TM3/TM6B' },
  { name: 'UAS-GFP', F: 'w/w; UAS-GFP/UAS-GFP; +/+', M: 'w/Y; UAS-GFP/UAS-GFP; +/+' },
  { name: 'GAL4/TM3', F: 'w/w; +/+; GAL4/TM3', M: 'w/Y; +/+; GAL4/TM3' },
  { name: 'UAS-RNAi', F: 'w/w; +/+; UAS-RNAi/UAS-RNAi', M: 'w/Y; +/+; UAS-RNAi/UAS-RNAi' },
  { name: 'mut¹/CyO', F: 'w/w; mut/CyO; +/+', M: 'w/Y; mut/CyO; +/+' },
  { name: 'FM7a balanced X', F: 'w/FM7a; +/+; +/+', M: 'FM7a/Y; +/+; +/+' },
  { name: 'GAL4/UAS-RNAi trans-heterozygote', F: 'w/w; +/+; GAL4/UAS-RNAi', M: 'w/Y; +/+; GAL4/UAS-RNAi' },
];

/** Everything the bench shows for a cross. */
export function benchCross(mother, father, { bySex = false } = {}) {
  const m = parseGenotype(mother),
    f = parseGenotype(father);
  const out = { motherOk: isViable(m), fatherOk: isViable(f) };
  if (!out.motherOk || !out.fatherOk) return out;
  const { rows, dead } = classesFor(mother, father, { traits: ALL_TRAITS, bySex, terse: true });
  return {
    ...out,
    rows,
    dead,
    eggs: gametesFor(mother, ['X', '2', '3']).length,
    sperm: gametesFor(father, ['X', '2', '3']).length,
  };
}

/** Count a vial and test it against the expected ratio. */
export function countVial(rows, n, seed) {
  const counts = sampleCounts(rows, n, rng(seed));
  const test =
    rows.length > 1
      ? chiSquare(
          counts.map((c) => c.n),
          rows.map((r) => r.p),
        )
      : null;
  const lowExpected = rows.some((r) => r.p * n < 5);
  return { counts, test, lowExpected };
}

// ---- practice problems -------------------------------------------------------------------

const POOL = {
  X: { F: ['+/+', 'w/w', 'w/+', 'w/FM7a', 'yw/+', 'yw/w'], M: ['+/Y', 'w/Y', 'yw/Y', 'FM7a/Y'] },
  2: ['+/+', 'CyO/+', 'Sco/CyO', 'UAS-GFP/CyO', 'UAS-GFP/UAS-GFP', 'mut/CyO', 'mut2/CyO', 'Df2/CyO', 'GAL4/CyO', 'Sco/+'],
  3: ['+/+', 'TM3/+', 'TM3/TM6B', 'GAL4/TM3', 'GAL4/TM6B', 'UAS-RNAi/UAS-RNAi', 'UAS-RNAi/TM3', 'TM6B/+'],
};
const COMMON = [1, 3 / 4, 2 / 3, 1 / 2, 3 / 8, 1 / 3, 1 / 4, 2 / 9, 1 / 6, 1 / 8, 1 / 9, 1 / 12, 1 / 16, 0];
const near = (a, b) => Math.abs(a - b) < 1e-9;

/**
 * A practice question: two parents, one offspring class, four answer options.
 * level 1 varies one chromosome (X, 2 or 3); level 2 varies chromosomes 2 and 3.
 */
export function practiceProblem(seed, level = 1) {
  const r = rng(seed);
  const pick = (xs) => xs[Math.floor(r() * xs.length)];
  for (let attempt = 0; attempt < 50; attempt++) {
    const focus = level === 2 ? ['2', '3'] : [pick(['X', '2', '3'])];
    const F = { X: 'w/w', 2: '+/+', 3: '+/+' },
      M = { X: 'w/Y', 2: '+/+', 3: '+/+' };
    for (const c of focus) {
      if (c === 'X') {
        F.X = pick(POOL.X.F);
        M.X = pick(POOL.X.M);
      } else {
        F[c] = pick(POOL[c]);
        M[c] = pick(POOL[c]);
      }
    }
    const mother = `${F.X}; ${F[2]}; ${F[3]}`,
      father = `${M.X}; ${M[2]}; ${M[3]}`;
    if (!isViable(parseGenotype(mother)) || !isViable(parseGenotype(father))) continue;
    const bySex = focus.includes('X') && r() < 0.7;
    const { rows } = classesFor(mother, father, { traits: ALL_TRAITS, bySex, terse: true });
    if (rows.length < 2) continue;
    const row = pick(rows);
    if (!COMMON.some((x) => near(x, row.p)) && level === 1) continue;
    const distractors = COMMON.filter((x) => !near(x, row.p) && x > 0)
      .sort((a, b) => Math.abs(a - row.p) - Math.abs(b - row.p))
      .slice(0, 5);
    const options = [row.p, ...distractors.sort(() => r() - 0.5).slice(0, 3)]
      .sort((a, b) => b - a)
      .map((p) => ({ p, label: ratioText(p) }));
    return { mother, father, bySex, focus, label: row.label, answer: row.p, options, rows };
  }
  return practiceProblem(seed + 1, level);
}

export { formatGenotype, ratioText };
