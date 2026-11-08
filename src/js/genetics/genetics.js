// Core genetics model shared by every mode.
// A genotype is { X: [a, b], '2': [a, b], '3': [a, b] } where each entry is a key
// into CHROMS for that chromosome. Males carry 'Y' as their second sex chromosome.

export const MARKERS = {
  Cy: { name: 'Curly', homLethal: true, desc: 'Wings curl upward at the tips.' },
  Sb: { name: 'Stubble', homLethal: true, desc: 'Short, thick thoracic bristles.' },
  Ser: { name: 'Serrate', homLethal: true, desc: 'Notched wing tips.' },
  Sco: { name: 'Scutoid', homLethal: true, desc: 'Missing scutellar bristles (the long pair at the back of the thorax).' },
  Hu: { name: 'Humeral', desc: 'Extra bristles on the humerus (shoulder).' },
  Tb: { name: 'Tubby', desc: 'Short, stout body.' },
  B: { name: 'Bar', desc: 'Narrow, bar-shaped eyes.' },
  w: { name: 'white', recessive: true, desc: 'White eyes (no eye pigment).' },
  y: { name: 'yellow', recessive: true, desc: 'Yellow body and bristles.' },
  mw: { name: 'mini-white', desc: 'Transgene marker that restores eye pigment in a w background.' },
};

export const CHROMS = {
  X: {
    '+': { label: '+', markers: [] },
    w: { label: 'w¹¹¹⁸', markers: ['w'] },
    yw: { label: 'y w', markers: ['y', 'w'] },
    FM7a: { label: 'FM7a', markers: ['B'], balancer: 'FM7a' },
    Y: { label: 'Y', markers: [], isY: true },
  },
  2: {
    '+': { label: '+', markers: [] },
    CyO: { label: 'CyO', markers: ['Cy'], balancer: 'CyO' },
    'UAS-GFP': { label: 'UAS-GFP', markers: ['mw'], transgene: true },
    GAL4: { label: 'GAL4', markers: ['mw'], transgene: true },
    Sco: { label: 'Sco', markers: ['Sco'] },
    // Unmarked recessive lethal mutations: invisible, and only survive over a balancer or +.
    // `lethal` lists the essential genes each chromosome lacks; a fly dies when both of
    // its chromosome 2s lack the same gene (failure to complement).
    mut: { label: 'mut¹', markers: [], recLethal: true, lethal: ['a'] },
    mut2: { label: 'mut²', markers: [], recLethal: true, lethal: ['c'] },
    mut3: { label: 'mut³', markers: [], recLethal: true, lethal: ['d'] },
    // Deficiencies: overlapping deletions used to map mutations (genes a-d, left to right).
    Df1: { label: 'Df(2L)A', markers: [], recLethal: true, lethal: ['a', 'b'], deficiency: true },
    Df2: { label: 'Df(2L)B', markers: [], recLethal: true, lethal: ['b', 'c'], deficiency: true },
    Df3: { label: 'Df(2L)C', markers: [], recLethal: true, lethal: ['c', 'd'], deficiency: true },
  },
  3: {
    '+': { label: '+', markers: [] },
    TM3: { label: 'TM3, Sb', markers: ['Sb'], balancer: 'TM3' },
    TM3Ser: { label: 'TM3, Ser', markers: ['Ser'], balancer: 'TM3' },
    TM6B: { label: 'TM6B, Hu Tb', markers: ['Hu', 'Tb'], balancer: 'TM6B' },
    'UAS-RNAi': { label: 'UAS-RNAi', markers: ['mw'], transgene: true },
    GAL4: { label: 'GAL4', markers: ['mw'], transgene: true },
    // Recombinant chromosome built by meiotic recombination in a GAL4/UAS-RNAi female.
    'GAL4,UAS-RNAi': { label: 'GAL4, UAS-RNAi', markers: ['mw', 'mw'], transgene: true, parts: ['GAL4', 'UAS-RNAi'] },
  },
};

// Pairs of loci that can recombine, with the recombinant fraction per female meiosis.
// Real values depend on the map distance between the two insertions.
export const LINKAGE = {
  3: { loci: ['GAL4', 'UAS-RNAi'], r: 0.3 },
};

const ORDER = ['X', '2', '3'];

/** Parse 'w/Y; CyO/+; +/+' into a genotype object. */
export function parseGenotype(text) {
  const parts = text.split(';').map((s) => s.trim());
  if (parts.length !== 3) throw new Error(`Expected X; 2; 3 in "${text}"`);
  const g = {};
  parts.forEach((part, i) => {
    const chrom = ORDER[i];
    const homologs = part.split('/').map((s) => s.trim());
    if (homologs.length !== 2) throw new Error(`Expected two homologs in "${part}"`);
    for (const h of homologs) {
      if (!CHROMS[chrom][h]) throw new Error(`Unknown chromosome "${h}" on ${chrom}`);
    }
    if (chrom !== 'X' && homologs.includes('Y')) throw new Error('Y only pairs with X');
    g[chrom] = homologs;
  });
  return g;
}

export function formatGenotype(g) {
  return ORDER.map((c) => g[c].map((k) => CHROMS[c][k].label).join('/')).join('; ');
}

function homologs(g) {
  return ORDER.flatMap((c) => g[c].map((k) => CHROMS[c][k]));
}

/** Genes essential for viability, in map order on chromosome 2 (deficiency mapping). */
export const GENES_2 = ['a', 'b', 'c', 'd'];

export function isMale(g) {
  return g.X.includes('Y');
}

/** Visible phenotype computed from dominance rules. */
export function phenotype(g) {
  const male = isMale(g);
  const xs = g.X.filter((k) => k !== 'Y').map((k) => CHROMS.X[k]);
  const all = homologs(g);
  const has = (m) => all.some((h) => h.markers.includes(m));
  // X-linked recessives show when every X the fly has carries them (one X in males).
  const xRecessive = (m) => xs.every((h) => h.markers.includes(m));
  const barCopies = xs.filter((h) => h.markers.includes('B')).length;
  const miniWhite = all.reduce((n, h) => n + h.markers.filter((m) => m === 'mw').length, 0);

  let eye = 'red';
  if (xRecessive('w')) eye = miniWhite === 0 ? 'white' : miniWhite === 1 ? 'orange' : 'darkorange';

  return {
    sex: male ? 'M' : 'F',
    eye,
    // 0 = round, 1 = kidney (B/+ female), 2 = narrow bar (B/Y male or B/B female)
    bar: male ? (barCopies ? 2 : 0) : barCopies,
    curly: has('Cy'),
    stubble: has('Sb'),
    serrate: has('Ser'),
    humeral: has('Hu'),
    tubby: has('Tb'),
    scutoid: has('Sco'),
    yellow: xRecessive('y'),
  };
}

/** Balancer homozygotes and homozygous dominant-lethal markers die. */
export function isViable(g) {
  for (const c of ['2', '3']) {
    const [a, b] = g[c].map((k) => CHROMS[c][k]);
    if (a.balancer && a.balancer === b.balancer) return false;
    if (a.markers.some((m) => MARKERS[m].homLethal && b.markers.includes(m))) return false;
    if (a.recLethal && a === b) return false;
    if (a.lethal && b.lethal && a.lethal.some((gene) => b.lethal.includes(gene))) return false;
  }
  return true;
}

// ---- meiosis ----------------------------------------------------------------
// Two rules decide whether recombination can happen:
//  1. Drosophila males do not recombine at all (no meiotic crossing over).
//  2. In females, a balancer suppresses recombination with its homolog
//     (multiple inversions; any crossover products are lost).

/** Loci (from LINKAGE) present on a homolog, or null if it has anything else on it. */
function haplotype(chrom, key) {
  const link = LINKAGE[chrom];
  const h = CHROMS[chrom][key];
  if (!link || h.balancer || h.isY) return null;
  const parts = h.parts || (key === '+' ? [] : [key]);
  if (!parts.every((p) => link.loci.includes(p))) return null;
  return link.loci.map((l) => parts.includes(l));
}

function keyFor(chrom, hap) {
  const loci = LINKAGE[chrom].loci.filter((_, i) => hap[i]);
  const found = Object.entries(CHROMS[chrom]).find(([k, h]) => {
    const parts = h.parts || (k === '+' ? [] : [k]);
    return !h.balancer && parts.length === loci.length && loci.every((l) => parts.includes(l));
  });
  return found && found[0];
}

/** Gametes for one chromosome pair: [{ key, p }]. */
export function chromGametes(chrom, pair, female) {
  const [a, b] = pair;
  const plain =
    a === b
      ? [{ key: a, p: 1 }]
      : [
          { key: a, p: 0.5 },
          { key: b, p: 0.5 },
        ];
  if (!female || a === b) return plain;
  const ha = haplotype(chrom, a);
  const hb = haplotype(chrom, b);
  if (!ha || !hb) return plain;
  const r = LINKAGE[chrom].r;
  const r1 = keyFor(chrom, [ha[0], hb[1]]);
  const r2 = keyFor(chrom, [hb[0], ha[1]]);
  if (!r1 || !r2 || r1 === a || r1 === b) return plain;
  return [
    { key: a, p: (1 - r) / 2 },
    { key: b, p: (1 - r) / 2 },
    { key: r1, p: r / 2 },
    { key: r2, p: r / 2 },
  ];
}

/** Every zygote of a cross with its probability, before lethality: [{ g, p }]. */
function allZygotes(mother, father) {
  let out = [{ g: {}, p: 1 }];
  for (const c of ORDER) {
    const mg = chromGametes(c, mother[c], true);
    const fg = chromGametes(c, father[c], false);
    const next = [];
    for (const z of out) for (const m of mg) for (const f of fg) next.push({ g: { ...z.g, [c]: [m.key, f.key] }, p: z.p * m.p * f.p });
    out = next;
  }
  return out;
}

/** Canonical key so that homolog order does not matter (X stays X-first for males). */
export function genotypeKey(g) {
  return ORDER.map((c) => [...g[c]].sort((x, y) => (x === 'Y') - (y === 'Y') || x.localeCompare(y)).join('/')).join(';');
}

/**
 * Exact progeny of a cross: viable genotypes with their share of the surviving flies,
 * plus the fraction of zygotes that died.
 */
export function offspring(mother, father) {
  const map = new Map();
  let dead = 0;
  for (const z of allZygotes(mother, father)) {
    if (!isViable(z.g)) {
      dead += z.p;
      continue;
    }
    const k = genotypeKey(z.g);
    const e = map.get(k);
    if (e) e.p += z.p;
    else map.set(k, { g: z.g, p: z.p });
  }
  const alive = 1 - dead;
  const out = [...map.values()].map((e) => ({ g: e.g, p: e.p / alive }));
  return { progeny: out, dead, alive };
}

function sample(dist) {
  let x = Math.random();
  for (const d of dist) if ((x -= d.p) < 0) return d.key;
  return dist[dist.length - 1].key;
}

/** One zygote from a cross. Females can recombine unless a balancer is present; males never do. */
export function zygote(mother, father) {
  const z = {};
  for (const c of ORDER) z[c] = [sample(chromGametes(c, mother[c], true)), sample(chromGametes(c, father[c], false))];
  return z;
}
