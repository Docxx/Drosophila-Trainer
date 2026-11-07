// Cross Puzzles engine: exact progeny of crosses between vials, grouped into
// the phenotypic classes a geneticist would sort under the microscope.
// A "mix" is the set of genotypes a vial of one sex could hold: [{ g, p }].

import { CHROMS, parseGenotype, formatGenotype, genotypeKey, offspring, phenotype, isMale, chromGametes } from './genetics.js';

const ORDER = ['X', '2', '3'];

/**
 * Parse a stock written the way lab stock lists write it: 'w; UAS-GFP; +' or
 * 'w; Sco/CyO; TM3/TM6B'. A single name means homozygous (hemizygous on the male X).
 */
export function parseStock(text) {
  const parts = text.split(';').map((s) => s.trim());
  const full = parts.map((p, i) => (i === 0 ? p.split('/')[0].trim() : p.includes('/') ? p : `${p}/${p}`));
  const female = parseGenotype(`${full[0]}/${full[0]}; ${full[1]}; ${full[2]}`);
  const male = parseGenotype(`${full[0]}/Y; ${full[1]}; ${full[2]}`);
  return { F: [{ g: female, p: 1 }], M: [{ g: male, p: 1 }] };
}

/** Target written as 'w; UAS-GFP/CyO; GAL4/TM6B'. Either sex counts. */
export function parseTarget(text) {
  const parts = text.split(';').map((s) => s.trim());
  const pair = (s) => s.split('/').map((x) => x.trim());
  return { X: parts[0], 2: pair(parts[1]).sort(), 3: pair(parts[2]).sort(), shown: [pair(parts[1]), pair(parts[2])] };
}

export function matchesTarget(g, t) {
  if (!g.X.filter((k) => k !== 'Y').every((k) => k === t.X)) return false;
  return ['2', '3'].every((c) => [...g[c]].sort().join('/') === t[c].join('/'));
}

export function formatTarget(t) {
  const [two, three] = t.shown;
  return `${CHROMS.X[t.X].label}; ${two.map((k) => CHROMS[2][k].label).join('/')}; ${three.map((k) => CHROMS[3][k].label).join('/')}`;
}

/** Progeny of virgin females drawn from mix F crossed to males from mix M. */
export function crossMixes(F, M) {
  const acc = new Map();
  let deadShare = 0;
  for (const a of F) {
    for (const b of M) {
      const { progeny, dead } = offspring(a.g, b.g);
      deadShare += a.p * b.p * dead;
      for (const o of progeny) {
        const w = a.p * b.p * (1 - dead) * o.p;
        const k = genotypeKey(o.g);
        const e = acc.get(k);
        if (e) e.p += w;
        else acc.set(k, { g: o.g, p: w });
      }
    }
  }
  const alive = 1 - deadShare;
  return { mix: [...acc.values()].map((e) => ({ g: e.g, p: e.p / alive })), dead: deadShare };
}

function phenoKey(ph) {
  const { sex, ...rest } = ph;
  return JSON.stringify(rest);
}

/**
 * Group progeny into visible classes. Females and males that look the same
 * (apart from sex) share a row. Each row: { pheno, p, F, M } where F/M are
 * { p, members } (members normalised to sum to 1) or null.
 */
export function phenoClasses(mix) {
  const rows = new Map();
  for (const e of mix) {
    const ph = phenotype(e.g);
    const k = phenoKey(ph);
    if (!rows.has(k)) rows.set(k, { pheno: ph, p: 0, F: null, M: null });
    const row = rows.get(k);
    const s = isMale(e.g) ? 'M' : 'F';
    if (!row[s]) row[s] = { p: 0, members: [] };
    row[s].p += e.p;
    row[s].members.push({ ...e });
    row.p += e.p;
  }
  for (const row of rows.values()) {
    for (const s of ['F', 'M']) if (row[s]) row[s].members.forEach((m) => (m.p /= row[s].p));
  }
  return [...rows.values()].sort((a, b) => b.p - a.p || traitScore(a.pheno) - traitScore(b.pheno));
}

const traitScore = (ph) => traits(ph).length;

/** Visible traits, in the order you would score them on the pad. */
export function traits(ph) {
  const out = [];
  const eye = { red: 'red eyes', white: 'white eyes', orange: 'orange eyes', darkorange: 'dark orange eyes' }[ph.eye];
  out.push(eye);
  if (ph.bar === 1) out.push('Bar (kidney eyes)');
  if (ph.bar === 2) out.push('Bar (narrow eyes)');
  if (ph.yellow) out.push('yellow body');
  if (ph.curly) out.push('Curly');
  if (ph.scutoid) out.push('Scutoid');
  if (ph.stubble) out.push('Stubble');
  if (ph.serrate) out.push('Serrate');
  if (ph.humeral) out.push('Humeral');
  if (ph.tubby) out.push('Tubby');
  return out;
}

/** Dominant markers only, for short vial labels. */
export function markerSummary(ph) {
  const t = traits(ph).slice(1);
  return t.length ? t.join(', ') : 'no dominant markers';
}

/** Recombination status of a female's chromosomes, for the bench read-out. */
export function recombinationNote(mix) {
  const notes = new Set();
  for (const { g } of mix) {
    for (const c of ['2', '3']) {
      const [a, b] = g[c].map((k) => CHROMS[c][k]);
      if (chromGametes(c, g[c], true).length > 2) notes.add(`Chr ${c}: ${a.label} and ${b.label} can recombine in her germline.`);
      else if ((a.balancer || b.balancer) && a !== b && g[c].every((k) => k !== '+'))
        notes.add(`Chr ${c}: the balancer stops ${a.balancer ? b.label : a.label} recombining.`);
    }
  }
  return [...notes];
}

export function isPure(members, t) {
  return members.every((m) => matchesTarget(m.g, t));
}

export function containsTarget(members, t) {
  return members.some((m) => matchesTarget(m.g, t));
}

export { formatGenotype, ORDER };

/** Nice ratio text: an exact small fraction when there is one, otherwise a percentage. */
export function ratioText(p) {
  for (const d of [1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 32, 36, 48, 64]) {
    const n = Math.round(p * d);
    if (n > 0 && Math.abs(p * d - n) < 1e-9) return n === d ? 'all' : `${n}/${d}`;
  }
  return `${(p * 100).toFixed(1)}%`;
}
