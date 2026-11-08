// Interactive genetics lessons. Every answer a lesson checks is computed by the
// genetics engine (gametes, progeny classes, viability), so lessons cannot drift
// from the biology. Step types: text, choice, gametes, predict, pick, go.

import { parseGenotype, offspring, phenotype, isViable, chromGametes, isMale, CHROMS, GENES_2 } from './genetics/genetics.js';
import { ORDER } from './chromosomes.js';

// ---- engine helpers (pure, tested) ----------------------------------------------

const TRAIT = {
  curly: { yes: 'Curly wings', no: 'straight wings' },
  scutoid: { yes: 'Scutoid' },
  stubble: { yes: 'Stubble' },
  serrate: { yes: 'Serrate' },
  humeral: { yes: 'Humeral' },
  tubby: { yes: 'Tubby' },
  yellow: { yes: 'yellow body' },
  gfp: { yes: 'GFP', no: 'no GFP' },
  rnai: { yes: 'knockdown (GAL4 > RNAi)', no: 'no knockdown' },
};
const EYE = { red: 'red eyes', white: 'white eyes', orange: 'orange eyes', darkorange: 'dark orange eyes' };
export const ALL_TRAITS = ['eye', 'bar', 'yellow', 'curly', 'scutoid', 'stubble', 'serrate', 'humeral', 'tubby', 'gfp', 'rnai'];

/**
 * GAL4/UAS: a UAS transgene is expressed only in flies that also carry GAL4.
 * Returned as extra visible traits (GFP under a fluorescence scope; knockdown
 * marks the experimental genotype).
 */
export function expression(g) {
  const parts = ORDER.flatMap((c) => g[c].flatMap((k) => CHROMS[c][k].parts || [k]));
  const gal4 = parts.includes('GAL4');
  return { gfp: gal4 && parts.includes('UAS-GFP'), rnai: gal4 && parts.includes('UAS-RNAi') };
}
export const visible = (g) => ({ ...phenotype(g), ...expression(g) });

/** Short visible description using only the traits a step is about. `terse` drops the "no X" words. */
export function describe(ph, traits, { terse = false } = {}) {
  const words = [];
  for (const t of traits) {
    if (t === 'eye') words.push(EYE[ph.eye]);
    else if (t === 'bar') { if (ph.bar) words.push(ph.bar === 1 ? 'Bar (kidney eyes)' : 'Bar (narrow eyes)'); }
    else if (ph[t]) words.push(TRAIT[t].yes);
    else if (TRAIT[t].no && !terse) words.push(TRAIT[t].no);
  }
  return words.length ? words.join(', ') : 'no dominant markers';
}

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Progeny classes of a cross as a learner would score them: [{ label, p, members }],
 * shares of the surviving adults, plus `dead` (share of zygotes that die).
 */
export function classesFor(mother, father, { traits, bySex = false, terse = false }) {
  const { progeny, dead } = offspring(parseGenotype(mother), parseGenotype(father));
  const rows = new Map();
  for (const o of progeny) {
    let label = describe(visible(o.g), traits, { terse });
    if (bySex) label = `${label}: ${isMale(o.g) ? 'sons' : 'daughters'}`;
    label = capital(label);
    if (!rows.has(label)) rows.set(label, { label, p: 0, members: [] });
    const row = rows.get(label);
    row.p += o.p;
    row.members.push(o);
  }
  return { rows: [...rows.values()].sort((a, b) => b.p - a.p || a.label.localeCompare(b.label)), dead };
}

/** Distinct gametes for the listed chromosomes: [{ gamete: {chrom: key}, p }]. */
export function gametesFor(genotype, chroms) {
  const g = parseGenotype(genotype);
  const female = !isMale(g);
  let out = [{ gamete: {}, p: 1 }];
  for (const c of chroms) {
    const per = chromGametes(c, g[c], female);
    out = out.flatMap((o) => per.map((x) => ({ gamete: { ...o.gamete, [c]: x.key }, p: o.p * x.p })));
  }
  // Identical homologs give one kind of gamete, not two.
  const merged = new Map();
  for (const o of out) {
    const k = gameteKey(o.gamete, chroms);
    merged.set(k, { gamete: o.gamete, p: (merged.get(k)?.p || 0) + o.p });
  }
  return [...merged.values()];
}
export const gameteKey = (gamete, chroms) => chroms.map((c) => gamete[c]).join('|');

/** True if this parent can make crossover gametes on `chrom` (a female, no balancer, linked loci). */
export function canCrossOver(genotype, chrom) {
  const g = parseGenotype(genotype);
  return !isMale(g) && chromGametes(chrom, g[chrom], true).length > 2;
}

/** Why a crossover cannot happen here, in plain words (or '' if it can). */
export function crossoverBlock(genotype, chrom) {
  const g = parseGenotype(genotype);
  if (canCrossOver(genotype, chrom)) return '';
  if (isMale(g)) return 'Drosophila males never cross over: their chromosomes pass on intact.';
  if (g[chrom].some((k) => /CyO|TM3|TM6B|FM7/.test(k))) return 'A balancer is in this pair: its inversions stop crossovers from giving viable products.';
  if (g[chrom][0] === g[chrom][1]) return 'Both chromosomes are the same, so a crossover would change nothing.';
  return 'There is nothing on this pair for a crossover to rearrange.';
}

/** The recombinant chromosome a crossover makes from homolog `index` (female only). */
export function crossoverKey(genotype, chrom, index) {
  const g = parseGenotype(genotype);
  const all = chromGametes(chrom, g[chrom], true);
  return all.at(2 + index).key;
}

/**
 * Punnett square for the listed chromosomes (no crossing over). Other chromosomes
 * are taken from the first homolog of each parent. Cells: { label, viable }.
 */
export function punnett(mother, father, { chroms, traits, bySex = false }) {
  const m = parseGenotype(mother), f = parseGenotype(father);
  const pick = (g) => {
    let out = [{}];
    for (const c of chroms) out = out.flatMap((o) => [...new Set(g[c])].map((k) => ({ ...o, [c]: k })));
    return out;
  };
  const eggs = pick(m), sperm = pick(f);
  const cells = eggs.map((e) => sperm.map((s) => {
    const z = {};
    for (const c of ORDER) z[c] = chroms.includes(c) ? [e[c], s[c]] : [m[c][0], f[c][0]];
    const viable = isViable(z);
    let label = describe(visible(z), traits);
    if (bySex) label = `${label} ${isMale(z) ? '♂' : '♀'}`;
    return { label: capital(label), viable };
  }));
  return { eggs, sperm, cells };
}

export const FRACTIONS = [
  { label: 'none', value: 0 }, { label: '1/4', value: 1 / 4 }, { label: '1/3', value: 1 / 3 }, { label: '1/2', value: 1 / 2 },
  { label: '2/3', value: 2 / 3 }, { label: '3/4', value: 3 / 4 }, { label: 'all', value: 1 },
];
export const fractionLabel = (p) => FRACTIONS.find((f) => Math.abs(f.value - p) < 1e-9)?.label || `${Math.round(p * 100)}%`;

/** Does every member of a progeny class carry `pair` (unordered) on `chrom`? */
export function classMatches(row, { chrom, pair }) {
  const want = [...pair].sort().join('/');
  return row.members.every((m) => [...m.g[chrom]].sort().join('/') === want);
}

// ---- counting and statistics -----------------------------------------------------------

import { rng, sampleCounts } from './random.js';
export { rng, sampleCounts };

// Upper tail of the chi-square distribution, via the regularised incomplete gamma function.
function lnGamma(z) {
  const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  c.forEach((v, i) => { x += v / (z + i + 1); });
  const t = z + c.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let sum = 1 / a, term = sum;
    for (let n = 1; n < 500; n++) { term *= x / (a + n); sum += term; if (term < sum * 1e-14) break; }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}
export const chiSquareP = (chi, df) => gammaQ(df / 2, chi / 2);
export const CRITICAL_05 = [3.841, 5.991, 7.815, 9.488, 11.07, 12.592, 14.067, 15.507, 16.919, 18.307];

/** Goodness of fit of observed counts to expected shares. */
export function chiSquare(observed, shares) {
  const total = observed.reduce((t, n) => t + n, 0);
  const rows = observed.map((o, i) => {
    const e = total * shares[i];
    return { o, e, part: (o - e) ** 2 / e };
  });
  const chi = rows.reduce((t, r) => t + r.part, 0);
  const df = observed.length - 1;
  const p = chiSquareP(chi, df);
  return { rows, chi, df, p, critical: CRITICAL_05[df - 1], fits: p >= 0.05 };
}

// ---- complementation -------------------------------------------------------------------

/** Do two chromosome-2 lethals complement? (Do the trans-heterozygotes survive?) */
export function complements(a, b) {
  return isViable(parseGenotype(`w/w; ${a}/${b}; +/+`));
}

/** The complementation cross: a/CyO virgins x b/CyO males, scored for straight wings. */
export function complementationCross(a, b, n = 60, seed = 1) {
  const { rows } = classesFor(`w/w; ${a}/CyO; +/+`, `w/Y; ${b}/CyO; +/+`, { traits: ['curly'] });
  const counts = sampleCounts(rows, n, rng(seed));
  const straight = counts.find((r) => r.label === 'Straight wings')?.n || 0;
  return { straight, total: n, complements: straight > 0 };
}

/** Genes deleted by each deficiency, for the map. */
export function deficiencyMap(dfs) {
  return { genes: GENES_2, dfs: dfs.map((k) => ({ key: k, label: CHROMS['2'][k].label, genes: CHROMS['2'][k].lethal })) };
}

// ---- lesson content -----------------------------------------------------------------

const CURLY_F = 'w/w; CyO/+; +/+';
const PLAIN_M = 'w/Y; +/+; +/+';
const CURLY_M = 'w/Y; CyO/+; +/+';

export const LESSON_CONTENT = {
  inheritance: {
    title: 'Chromosomes and inheritance',
    notation: 'diagram',
    steps: [
      { type: 'text', title: 'Genes ride on chromosomes',
        body: ['A fruit fly has four pairs of chromosomes: the sex chromosomes (X and Y), chromosomes 2 and 3, and a tiny chromosome 4 that we can ignore here.',
          'Each pair has one chromosome from the mother and one from the father. Here is a fly drawn the way this course draws every fly: one bar per chromosome. Hover over a bar to see what it carries.'],
        diagrams: [{ g: CURLY_F, caption: 'A female fly' }] },
      { type: 'text', title: 'Meet Curly',
        body: ['One of her chromosome 2s is called CyO. It carries a dominant mutation, Curly (the Cy tag): a single copy is enough to curl the wings up at the tips.',
          'Her other chromosome 2 is normal, written +. Because Curly is dominant, she has curly wings.'],
        diagrams: [{ g: CURLY_F, chroms: ['2'], caption: 'Her chromosome 2 pair' }] },
      { type: 'choice', question: 'An egg or a sperm (a gamete) carries how many copies of chromosome 2?',
        options: [
          { text: 'One: one chromosome from each pair', correct: true, why: 'Right. Meiosis halves the set, so each gamete carries one chromosome from each pair. Fertilisation restores the pairs.' },
          { text: 'Two: the whole pair', why: 'Then the offspring would have four copies. Meiosis halves the set: one chromosome from each pair goes into each gamete.' },
          { text: 'It depends on the sex of the fly', why: 'Both eggs and sperm carry one chromosome from each pair. Only the sex chromosomes differ between the sexes.' },
        ] },
      { type: 'gametes', title: 'Make her eggs', parent: CURLY_F, chroms: ['2'],
        intro: 'Click one chromosome from the pair, then press Make gamete. Find every kind of egg she can make.',
        done: 'She makes two kinds of egg, CyO or +, in equal numbers: half her eggs carry Curly.' },
      { type: 'predict', title: 'Curly × normal', mother: CURLY_F, father: PLAIN_M, chroms: ['2'], traits: ['curly'],
        intro: 'She is crossed to a male with two normal chromosome 2s. What share of their offspring will be Curly?',
        explain: 'Every sperm carries +. Half the eggs carry CyO, so half the offspring are CyO/+ (Curly) and half are +/+ (straight).' },
      { type: 'gametes', title: 'Two pairs at once', parent: 'w/w; CyO/+; TM3/+', chroms: ['2', '3'],
        intro: 'This female also carries TM3 on chromosome 3, with the dominant marker Stubble (Sb: short, thick bristles). Choose one chromosome 2 and one chromosome 3 for each gamete. How many kinds are there?',
        done: 'Four kinds, each a quarter. Chromosomes 2 and 3 are sorted into gametes independently of each other (Mendel’s independent assortment).' },
      { type: 'predict', title: 'Curly × Curly', mother: CURLY_F, father: CURLY_M, chroms: ['2'], traits: ['curly'],
        intro: 'Now cross two Curly flies (both CyO/+). Think about every combination of egg and sperm before you answer.',
        explain: 'The squares give 1 CyO/CyO : 2 CyO/+ : 1 +/+. But CyO/CyO flies die before they hatch: two copies of Curly are lethal. Of the survivors, two-thirds are Curly and one-third are straight.' },
      { type: 'choice', question: 'A Curly × Curly vial gives 90 adults. About how many will have curly wings?',
        options: [
          { text: 'About 60', correct: true, why: 'Yes: two-thirds of the survivors, because the CyO/CyO quarter never hatches.' },
          { text: 'About 68', why: 'That is three-quarters, the classic 3:1 ratio. It forgets that CyO/CyO flies die, which leaves 2 Curly : 1 straight.' },
          { text: 'About 45', why: 'That would be a half. Count the squares again: CyO/+ appears twice, +/+ once, and CyO/CyO dies.' },
        ] },
      { type: 'text', title: 'What you have learned',
        body: ['Each parent passes on one chromosome from each pair, chosen at random. Different pairs are sorted independently.',
          'Some combinations never appear because they are lethal. That is not a nuisance, it is a tool: the next lessons use it to keep mutations in place.'] },
    ],
  },
  xlinked: {
    title: 'The X chromosome',
    notation: 'both',
    steps: [
      { type: 'text', title: 'Females XX, males XY',
        body: ['Female flies have two X chromosomes. Males have one X and a Y. In Drosophila, X-chromosome dosage controls sex determination; the Y is needed for normal male fertility, rather than determining sex. The Y carries no white gene. This lesson models the usual XX and XY flies.',
          'The white gene sits on the X. Its recessive mutation, w, gives white eyes when a fly has no normal copy. From here on the course also shows the shorthand geneticists write: try the Diagram / Notation / Both switch at the top.'],
        diagrams: [{ g: 'w/w; +/+; +/+', chroms: ['X'], caption: 'A white-eyed female: w/w' }, { g: '+/Y; +/+; +/+', chroms: ['X'], caption: 'A red-eyed male: +/Y' }] },
      { type: 'choice', question: 'A son gets his only X chromosome from…',
        options: [
          { text: 'His mother', correct: true, why: 'Right. In this XX × XY cross, a son receives his only X from his mother and the Y from his father.' },
          { text: 'His father', why: 'A father who passes on his X has a daughter. Sons get the father’s Y.' },
          { text: 'Either parent, at random', why: 'A sperm carrying the father’s X makes a daughter, so a son’s X must come from his mother.' },
        ] },
      { type: 'gametes', title: 'The male’s sperm', parent: '+/Y; +/+; +/+', chroms: ['X'],
        intro: 'Find every kind of sperm this red-eyed male makes.',
        done: 'Half his sperm carry his X (with the normal white gene) and make daughters; half carry the Y and make sons.' },
      { type: 'gametes', title: 'The female’s eggs', parent: 'w/w; +/+; +/+', chroms: ['X'],
        intro: 'Now this white-eyed female. How many kinds of egg can she make?',
        done: 'Just one: both her X chromosomes carry w, so every egg does.' },
      { type: 'predict', title: 'White female × red male', mother: 'w/w; +/+; +/+', father: '+/Y; +/+; +/+', chroms: ['X'], traits: ['eye'], bySex: true,
        decoys: ['White eyes: daughters', 'Red eyes: sons'],
        intro: 'Predict each class of offspring as a share of all the adults.',
        explain: 'Daughters get w from their mother and + from their father: one normal copy is enough, so they have red eyes. Sons get only their mother’s w and the Y, so they have white eyes.' },
      { type: 'predict', title: 'Swap the parents', mother: '+/+; +/+; +/+', father: 'w/Y; +/+; +/+', chroms: ['X'], traits: ['eye'], bySex: true,
        decoys: ['White eyes: daughters', 'White eyes: sons'],
        intro: 'Now a red-eyed female (+/+) with a white-eyed male (w/Y). Does swapping the parents change the result?',
        explain: 'Every fly gets a normal X from its mother, so all offspring are red-eyed. For an X-linked gene the direction of the cross matters, unlike for chromosome 2 or 3.' },
      { type: 'choice', question: 'In the first cross (white female × red male) you find a white-eyed daughter. What does that tell you?',
        options: [
          { text: 'Her father had white eyes, so the mother mated with a male you did not intend', correct: true, why: 'Exactly. A daughter has white eyes only if both her Xs carry w, so her father’s X carried w. Your red-eyed males could not have given it.' },
          { text: 'Nothing: ratios vary by chance', why: 'Chance changes how many red daughters and white sons you see, but this cross cannot make a white-eyed daughter at all.' },
          { text: 'The mother was certainly a virgin', why: 'The opposite: it points to a father you did not add, such as a male who mated her before you collected her.' },
        ] },
      { type: 'go', title: 'Now do it at the bench',
        body: ['The First cross mission uses exactly this cross. You collect the white-eyed females yourself, so whether a white daughter turns up depends on how well you collected.'],
        action: { kind: 'scope', activity: 'cross', label: 'Open the First cross' } },
    ],
  },
  balancers: {
    title: 'Balancers',
    notation: 'both',
    steps: [
      { type: 'text', title: 'The problem',
        body: ['mut¹ is a recessive lethal mutation on chromosome 2: flies with two copies die, and flies with one copy look completely normal.',
          'How do you keep a stock of it? A mut¹/+ stock left to itself loses mut¹ over the generations, and you cannot see which flies still carry it.'],
        diagrams: [{ g: 'w/w; mut/+; +/+', chroms: ['2'], caption: 'mut¹ over a normal chromosome: invisible' }] },
      { type: 'text', title: 'What a balancer is',
        body: ['A balancer is a specially built chromosome with three properties:',
          '1. A dominant marker you can see: CyO carries Curly, TM3 carries Stubble, TM6B carries Humeral and Tubby.',
          '2. A recessive lethal: two copies of the same balancer die.',
          '3. Several inversions (the zig-zag), which stop crossovers with its partner from giving viable products. Whatever sits on the other chromosome stays intact.'],
        diagrams: [{ g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'mut¹ kept over CyO' }] },
      { type: 'predict', title: 'A balanced stock', mother: 'w/w; mut/CyO; +/+', father: 'w/Y; mut/CyO; +/+', chroms: ['2'], traits: ['curly'],
        decoys: ['Straight wings'],
        intro: 'Cross mut¹/CyO females to mut¹/CyO males. What share of the adults will be Curly?',
        explain: 'mut¹/mut¹ dies (the mutation) and CyO/CyO dies (the balancer). The only survivors are mut¹/CyO: every adult is Curly, generation after generation. The stock breeds true.' },
      { type: 'choice', question: 'Why does a mut¹/CyO stock keep mut¹ for ever, without you selecting anything?',
        options: [
          { text: 'Both homozygotes die, so every survivor still carries mut¹ (over CyO)', correct: true, why: 'Yes. And because a straight-winged fly could only be mut¹/mut¹, which dies, you never see one.' },
          { text: 'Curly flies are healthier', why: 'Curly itself does nothing for health. It is the two lethal homozygotes that leave only mut¹/CyO.' },
          { text: 'CyO repairs mut¹', why: 'CyO cannot change mut¹. It sits beside it, and its own lethality removes every fly without mut¹.' },
        ] },
      { type: 'gametes', title: 'Crossing over in a female', parent: 'w/w; +/+; GAL4/UAS-RNAi', chroms: ['3'], crossover: true,
        intro: 'This female has two different insertions on her two chromosome 3s, GAL4 and UAS-RNAi. In her ovary the pair can swap segments (cross over). Find all her egg types; try the Crossover switch.',
        done: 'Four kinds: the two originals, plus two recombinants, one carrying both insertions and one carrying neither. In this model 30% of eggs are recombinant (15% each).' },
      { type: 'gametes', title: 'The same chromosomes in a male', parent: 'w/Y; +/+; GAL4/UAS-RNAi', chroms: ['3'], crossover: true,
        intro: 'Same chromosome 3s, but in a male. Find all his sperm types.',
        done: 'Only two. Drosophila males do not cross over, which is why recombinants are always made in females.' },
      { type: 'gametes', title: 'And over a balancer', parent: 'w/w; +/+; GAL4/TM3', chroms: ['3'], crossover: true,
        intro: 'Now a female with GAL4 over TM3. Can she make recombinant eggs?',
        done: 'No: two kinds only. TM3’s inversions block viable crossovers, so GAL4 stays exactly as it is. That is the third property of a balancer at work.' },
      { type: 'pick', title: 'Put an insertion over CyO', mother: 'w/w; UAS-GFP/UAS-GFP; +/+', father: 'w/Y; Sco/CyO; +/+', traits: ['curly', 'scutoid'], target: { chrom: '2', pair: ['CyO', 'UAS-GFP'] },
        intro: 'UAS-GFP females are crossed to Sco/CyO males. You want flies with UAS-GFP over CyO, so you can follow it by the Curly wings. Which class do you keep?',
        right: 'Correct: Curly flies got CyO from their father, so their other chromosome 2 must be UAS-GFP from their mother.',
        wrong: 'Those flies got Sco, not CyO, from their father. Look for the CyO marker.' },
      { type: 'pick', title: 'Pick the right balancer', mother: 'w/w; +/+; GAL4/GAL4', father: 'w/Y; +/+; TM3/TM6B', traits: ['stubble', 'humeral', 'tubby'], target: { chrom: '3', pair: ['GAL4', 'TM6B'] },
        intro: 'GAL4 females × TM3/TM6B males. You want GAL4 over TM6B. Which class?',
        right: 'Right: Humeral and Tubby are TM6B’s markers, so these flies carry GAL4/TM6B.',
        wrong: 'Stubble is TM3’s marker. You want the TM6B markers: Humeral and Tubby.' },
      { type: 'go', title: 'Plan your own crosses',
        body: ['You now have the tools of stock building: balancers to follow chromosomes, markers to pick classes, and the rule that only females recombine. The Cross planner puts them together in six puzzles.'],
        action: { kind: 'planner', label: 'Open the Cross planner' } },
    ],
  },
  chance: {
    title: 'Counting and chance',
    notation: 'diagram',
    steps: [
      { type: 'text', title: 'Ratios are expectations',
        body: ['A 1:1 ratio says what happens on average. Each fly in a vial is a separate draw, so a real vial rarely matches the ratio exactly.',
          'How far off can a vial be before you should worry? That depends on how many flies you counted. Find out by counting some vials.'] },
      { type: 'chance', title: 'Count some vials', mother: 'w/w; CyO/+; +/+', father: 'w/Y; +/+; +/+', chroms: ['2'], traits: ['curly'], focus: 'Curly wings',
        sizes: [20, 100, 1000], need: 4, seed: 3,
        intro: 'Curly × normal: half the offspring should be Curly. Count vials of different sizes and watch where the results land.',
        done: 'Small vials scatter widely around 1/2; large counts cluster tightly. The spread shrinks with the square root of the number counted: 100 flies are about twice as precise as 25.' },
      { type: 'choice', question: 'A vial of 20 from this cross gives 13 Curly and 7 straight. What do you conclude?',
        options: [
          { text: 'Nothing unusual: splits like this are common in a vial of 20', correct: true, why: 'Right. 13:7 is well within what chance gives for 20 flies. You saw splits like it a moment ago.' },
          { text: 'The father must have carried Curly too', why: 'Then about two-thirds would be Curly, and you could not tell 2/3 from 1/2 with 20 flies. Nothing here demands a different explanation.' },
          { text: 'Curly flies survive better', why: 'Possibly, but 20 flies cannot show it. A real survival difference needs many more flies, or a formal test.' },
        ] },
      { type: 'text', title: 'Putting a number on it: χ²',
        body: ['The chi-square test asks how surprising your counts are if a hypothesis is true. For each class, compare the observed count O with the expected count E: χ² = sum of (O − E)² / E.',
          'Degrees of freedom are the number of classes minus one. With two classes (one degree of freedom), χ² above 3.84 means a deviation that large happens less than 5% of the time by chance, so you reject the hypothesis.',
          'Below the critical value, you cannot reject it. That is not the same as showing it is true.'] },
      { type: 'chisq', title: 'Test a Curly × Curly vial',
        intro: 'You crossed Curly × Curly and counted 300 adults. Which ratio do the counts fit? Test each hypothesis and judge it.',
        observed: [{ label: 'Curly wings', n: 205 }, { label: 'Straight wings', n: 95 }],
        hypotheses: [{ label: '1:1', shares: [1 / 2, 1 / 2] }, { label: '2:1', shares: [2 / 3, 1 / 3] }, { label: '3:1', shares: [3 / 4, 1 / 4] }],
        explain: 'Only 2:1 survives: exactly what lethality of CyO/CyO predicts. 3:1 is rejected because the homozygotes are missing.' },
      { type: 'choice', question: 'A smaller vial gives 61 Curly and 29 straight (90 flies). Against 3:1, χ² = 2.5, below 3.84. Does that show the ratio is 3:1?',
        options: [
          { text: 'No: 2:1 fits these counts too. 90 flies cannot separate the two ratios', correct: true, why: 'Exactly. Not rejecting a hypothesis is weak evidence when the sample is small. Decide how many flies you need before you count.' },
          { text: 'Yes: the test accepted 3:1', why: 'A χ² test never accepts. It only says the data are not surprising under 3:1. They are even less surprising under 2:1 (χ² ≈ 0.05).' },
          { text: 'No: the test is invalid below 100 flies', why: 'The test is valid here (every expected count is above 5). The problem is power: the sample is too small to tell close ratios apart.' },
        ] },
      { type: 'text', title: 'In the lab',
        body: ['Count enough flies to answer your question, and decide that number before you start. Score blind where you can.',
          'Unexpected classes matter more than slightly-off ratios: a single white-eyed daughter in the First cross is a clear signal, whatever the counts.'] },
    ],
  },
  recombination: {
    title: 'Recombination and mapping',
    notation: 'both',
    steps: [
      { type: 'text', title: 'Crossovers and distance',
        body: ['In a female\u2019s ovary, the two chromosomes of a pair can swap segments: a crossover. Two loci far apart are separated by a crossover often; two close together, rarely.',
          'The percentage of recombinant offspring measures distance on the genetic map: 1% recombinants is one map unit, or centimorgan (cM).'],
        diagrams: [{ g: 'w/w; +/+; GAL4/UAS-RNAi', chroms: ['3'], caption: 'A female carrying two insertions, one on each chromosome 3' }] },
      { type: 'choice', question: 'You want a chromosome carrying both GAL4 and UAS-RNAi. Which fly must carry them on separate chromosome 3s?',
        options: [
          { text: 'A female (a virgin, so you know her offspring\u2019s father)', correct: true, why: 'Right. Drosophila males do not cross over, so only females make recombinants.' },
          { text: 'A male', why: 'Males pass their chromosomes on intact. Recombinants have to come from females.' },
          { text: 'Either sex', why: 'Only female meiosis has crossing over in Drosophila.' },
        ] },
      { type: 'text', title: 'Seeing recombinants',
        body: ['Cross her to TM3/TM6B males. Every offspring gets one balancer from its father and one maternal chromosome 3, which you read by eye colour.',
          'Each insertion carries mini-white. In a white (w) background, one copy gives orange eyes, two copies dark orange, none white. So the two recombinant classes are dark orange (both insertions) and white (neither).'],
        diagrams: [{ g: 'w/Y; +/+; TM3/TM6B', chroms: ['3'], caption: 'Tester male: two balancers' }] },
      { type: 'count', title: 'Measure the distance', mother: 'w/w; +/+; GAL4/UAS-RNAi', father: 'w/Y; +/+; TM3/TM6B', chroms: ['3'], traits: ['eye'], n: 400, seed: 7,
        intro: 'You scored 400 offspring from this cross by eye colour.',
        question: 'What percentage are recombinant?', unit: '%', tolerance: 0.6, decimals: 1,
        answer: (counts) => 100 * counts.filter((c) => c.label !== 'Orange eyes').reduce((t, c) => t + c.n, 0) / counts.reduce((t, c) => t + c.n, 0),
        hint: 'Recombinants are the dark orange flies (both insertions) plus the white flies (neither). Add them and divide by all 400.',
        explain: 'That puts the insertions roughly 30 cM apart (the model uses 30%). Above about 20 cM, double crossovers hide some recombination, so map distances from large values underestimate. Recombination frequency never exceeds 50%.' },
      { type: 'pick', title: 'Keep the recombinant', mother: 'w/w; +/+; GAL4/UAS-RNAi', father: 'w/Y; +/+; TM3/TM6B', traits: ['eye', 'humeral', 'stubble'], target: { chrom: '3', pair: ['GAL4,UAS-RNAi', 'TM6B'] },
        intro: 'You want the GAL4, UAS-RNAi recombinant chromosome balanced over TM6B. Which class do you keep?',
        right: 'Right: dark orange means both insertions; Humeral without Stubble means TM6B from the father.',
        wrong: 'Look for dark orange eyes (both mini-whites) together with TM6B\u2019s marker, Humeral.' },
      { type: 'choice', question: 'Two insertions are 1 cM apart. About how many offspring would you screen to find one carrying both?',
        options: [
          { text: 'About 200, and in practice several hundred to be safe', correct: true, why: 'Right. 1% are recombinant, and half of those carry both insertions: 1 in 200.' },
          { text: 'About 20', why: 'That would need 10 cM. At 1 cM only 1 in 100 offspring is recombinant, and only half of those carry both.' },
          { text: 'About 100', why: '1 in 100 is recombinant, but half of the recombinants carry neither insertion. You need about 1 in 200.' },
        ] },
      { type: 'multi', question: 'You found a dark-orange fly. Before relying on it as a recombinant line, what should you do?',
        options: [
          { text: 'Confirm both insertions are there, for example by PCR', correct: true, why: 'Eye-colour dosage is a weak signal: orange and dark orange are easy to confuse.' },
          { text: 'Check both still work: GAL4 drives a reporter, and the RNAi gives its phenotype', correct: true, why: 'A crossover can occasionally disrupt an insertion. Test function, not just presence.' },
          { text: 'Keep several independent recombinants', correct: true, why: 'Independent lines protect against a single bad event and give you a backup.' },
          { text: 'Nothing: dark orange eyes prove it', why: 'Eye colour can mislead (other mini-white transgenes, variable expression). Always verify.' },
        ],
        explain: 'Good practice: several independent recombinants, each verified by molecular and functional tests.' },
      { type: 'go', title: 'Build one yourself',
        body: ['Puzzles 5 and 6 in the Cross planner ask you to make exactly this recombinant and balance it.'],
        action: { kind: 'planner', label: 'Open the Cross planner' } },
    ],
  },
  gal4uas: {
    title: 'GAL4/UAS and controls',
    notation: 'diagram',
    steps: [
      { type: 'text', title: 'Two halves of a switch',
        body: ['GAL4 is a yeast transcription factor. A GAL4 driver line makes it in a pattern set by a fly enhancer: in neurons, in muscle, in the wing.',
          'A UAS responder line carries a gene (GFP, an RNAi hairpin) behind GAL4 binding sites. On its own it stays silent. Cross the two lines and the offspring express the UAS gene wherever GAL4 is made.'],
        diagrams: [{ g: 'w/w; UAS-GFP/UAS-GFP; +/+', caption: 'Responder: UAS-GFP' }, { g: 'w/Y; +/+; GAL4/GAL4', caption: 'Driver: GAL4' }] },
      { type: 'choice', question: 'A fly carries UAS-GFP but no GAL4. Does it glow?',
        options: [
          { text: 'No: UAS is silent without GAL4', correct: true, why: 'Right. That is the point of the system: you choose where expression happens by choosing the driver.' },
          { text: 'Yes, everywhere', why: 'UAS has no fly enhancer driving it. Without GAL4 nothing binds the UAS sites.' },
          { text: 'Only in the eyes', why: 'The mini-white marker colours the eyes, but GFP itself needs GAL4.' },
        ] },
      { type: 'predict', title: 'Driver × reporter', mother: 'w/w; +/+; GAL4/TM3', father: 'w/Y; UAS-GFP/UAS-GFP; +/+', chroms: ['3'], traits: ['gfp', 'stubble'],
        decoys: ['GFP, Stubble', 'No GFP'],
        intro: 'Your GAL4 is kept over TM3 (Stubble). Cross these females to homozygous UAS-GFP males. Which offspring glow?',
        explain: 'Every offspring gets UAS-GFP. Half get GAL4 (and glow), half get TM3 (Stubble, no GAL4, no GFP). Stubble tells you which is which without a fluorescence scope.' },
      { type: 'pick', title: 'Which flies do you image?', mother: 'w/w; +/+; GAL4/TM3', father: 'w/Y; UAS-GFP/UAS-GFP; +/+', traits: ['gfp', 'stubble'], target: { chrom: '3', pair: ['GAL4', '+'] },
        intro: 'You can sort under a normal microscope by bristles. Which class carries GAL4 > UAS-GFP?',
        right: 'Right: not Stubble means no TM3, so these flies carry GAL4 and express GFP.',
        wrong: 'Stubble flies carry TM3 instead of GAL4, so they have nothing to switch UAS-GFP on.' },
      { type: 'multi', question: 'You knock a gene down with GAL4 > UAS-RNAi and see a phenotype. Which controls do you need to claim the gene is responsible?',
        options: [
          { text: 'GAL4 / + (driver alone)', correct: true, why: 'GAL4 itself, and its insertion, can cause phenotypes.' },
          { text: 'UAS-RNAi / + (responder alone)', correct: true, why: 'The insertion site or leaky expression could cause the effect without GAL4.' },
          { text: 'A second, independent RNAi line against the same gene', correct: true, why: 'Off-target effects are specific to one hairpin. Two lines that agree are far more convincing.' },
          { text: 'GAL4 > a neutral UAS (such as UAS-GFP or a control RNAi)', correct: true, why: 'Controls for GAL4 being shared between two UAS copies, and for expressing any construct at all.' },
          { text: 'Wild-type Canton-S only', why: 'A different genetic background from your experimental flies, so it controls for very little.' },
        ],
        explain: 'All four belong in a good experiment, ideally in a matched genetic background. Better still, rescue the phenotype or confirm with a mutant.' },
      { type: 'predict', title: 'The experiment and its siblings', mother: 'w/w; +/+; GAL4/TM6B', father: 'w/Y; +/+; UAS-RNAi/UAS-RNAi', chroms: ['3'], traits: ['rnai', 'tubby'],
        decoys: ['Knockdown (GAL4 > RNAi), Tubby', 'No knockdown'],
        intro: 'GAL4/TM6B virgins × homozygous UAS-RNAi males. Predict the classes.',
        explain: 'Half are GAL4/UAS-RNAi (knockdown, normal body); half are TM6B/UAS-RNAi (Tubby, no GAL4, no knockdown).' },
      { type: 'choice', question: 'Why are the Tubby siblings from this cross a useful control?',
        options: [
          { text: 'They share parents, vial and conditions, and carry UAS-RNAi without GAL4', correct: true, why: 'Right. A sibling control removes vial and density effects. It is not a complete control: TM6B itself (Tubby) changes body shape.' },
          { text: 'They are genetically identical to the knockdown flies', why: 'They differ in having TM6B instead of GAL4, which is why they are not the only control you need.' },
          { text: 'Tubby flies never show phenotypes', why: 'Tubby changes body shape, which can matter for some assays. Use other controls too.' },
        ] },
      { type: 'text', title: 'What the model leaves out',
        body: ['GAL4 is temperature-sensitive: stronger at 29 °C, weaker at 18 °C. GAL80ts lets you switch it on only in adults.',
          'Knockdown efficiency varies, so check it (qPCR or an antibody). UAS lines can be leaky, and some GAL4 lines express outside their reported pattern: look at GAL4 > UAS-GFP before trusting a driver.'] },
      { type: 'go', title: 'Put a driver and a reporter together',
        body: ['Puzzle 3 in the Cross planner builds a stock carrying both a reporter and a driver, ready for one-cross experiments.'],
        action: { kind: 'planner', label: 'Open the Cross planner' } },
    ],
  },
  complementation: {
    title: 'Complementation and deficiency mapping',
    notation: 'diagram',
    steps: [
      { type: 'text', title: 'Same gene or different?',
        body: ['A screen gave you three recessive lethal mutations on chromosome 2: mut¹, mut² and mut³. Each is kept over CyO, and none has a visible phenotype.',
          'To ask whether two are in the same gene, put them together in one fly. If they hit different genes, each chromosome supplies the gene the other lacks and the fly lives: they complement. If they hit the same gene, the fly has no working copy and dies: they fail to complement.'],
        diagrams: [{ g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'mut¹ stock' }, { g: 'w/Y; mut2/CyO; +/+', chroms: ['2'], caption: 'mut² stock' }] },
      { type: 'predict', title: 'mut¹ × mut²', mother: 'w/w; mut/CyO; +/+', father: 'w/Y; mut2/CyO; +/+', chroms: ['2'], traits: ['curly'],
        intro: 'Suppose mut¹ and mut² are in different genes. Predict the offspring.',
        explain: 'CyO/CyO dies. mut¹/CyO and CyO/mut² are Curly. mut¹/mut² survives because each chromosome covers the other\u2019s defect: the straight-winged third are your evidence of complementation.' },
      { type: 'choice', question: 'If instead every adult from a cross like this is Curly, what does that mean?',
        options: [
          { text: 'The trans-heterozygotes died: the mutations fail to complement and are probably in the same gene', correct: true, why: 'Right. The straight-winged class is the only one that can carry both mutations, and it is missing.' },
          { text: 'The mutations complement', why: 'Complementation would give straight-winged flies (a third of them). Their absence means failure.' },
          { text: 'You scored too few flies to tell', why: 'With dozens of flies you expect about a third straight-winged. Seeing none is a clear result.' },
        ] },
      { type: 'grid', title: 'Test all three', rows: ['mut', 'mut2', 'mut3'], cols: ['mut', 'mut2', 'mut3'],
        intro: 'Cross every pair (and each with itself, as a control). Click a cell to run that cross.',
        done: 'Each mutation fails only with itself: mut¹, mut² and mut³ are in three different genes. The diagonal is your control, showing what failure looks like.' },
      { type: 'text', title: 'Mapping with deficiencies',
        body: ['A deficiency (Df) is a chromosome with a stretch deleted. A mutation fails to complement a deficiency that deletes its gene, and complements one that does not.',
          'With overlapping deficiencies you can narrow a mutation down to the region they share, then test the genes in it.'] },
      { type: 'grid', title: 'Map the mutations', rows: ['mut', 'mut2', 'mut3'], cols: ['Df1', 'Df2', 'Df3'], map: true,
        intro: 'Here are three overlapping deficiencies. Cross each mutation to each deficiency.',
        done: 'Now read the pattern: each mutation lies where every deficiency it fails with overlaps, and outside every deficiency it complements.' },
      { type: 'choice', question: 'Where is mut²?',
        options: [
          { text: 'In gene c: deleted by Df(2L)B and Df(2L)C, not by Df(2L)A', correct: true, why: 'Right. It fails with B and C, so it lies in their overlap, and complements A, which rules out gene b.' },
          { text: 'In gene b', why: 'Gene b is deleted by Df(2L)A too, and mut² complements Df(2L)A.' },
          { text: 'In gene d', why: 'Gene d is deleted only by Df(2L)C, but mut² also fails with Df(2L)B.' },
        ] },
      { type: 'choice', question: 'And mut³?',
        options: [
          { text: 'In gene d: only Df(2L)C deletes it', correct: true, why: 'Right. It fails with C alone, so it lies in the part of C that B does not cover.' },
          { text: 'In gene c', why: 'Then it would fail with Df(2L)B as well.' },
          { text: 'Outside all three deficiencies', why: 'Then it would complement all three, but it fails with Df(2L)C.' },
        ] },
      { type: 'choice', question: 'Deficiency mapping points to one candidate gene. What best shows that it is the gene?',
        options: [
          { text: 'Rescue: a transgene carrying the candidate gene restores viability', correct: true, why: 'Right. Rescue, or a matching mutation found by sequencing, shows causation. Mapping alone narrows the search.' },
          { text: 'Test more deficiencies', why: 'Smaller deficiencies narrow the region further, but cannot prove which gene in it is responsible.' },
          { text: 'Count more flies', why: 'The complementation results are already clear. You need a test of the specific gene.' },
        ] },
    ],
  },
  threepoint: {
    title: 'Three-point mapping',
    notation: 'both',
    model: ['This teaching cross samples sons only, with equal viability and complete penetrance of the three markers. Sampled interval estimates need not equal the reference distances. Rare classes are identifiable here because sampling and viability do not obscure them.'],
    steps: [
      { type: 'text', title: 'Read one maternal X at a time',
        body: ['The mother has two X chromosomes: one carries yellow (y), crossveinless (cv) and vermilion (v); the other carries normal alleles at all three loci. Her sons receive one maternal X and their father’s Y, so each son exposes the recessive markers carried by one of her eggs.',
          'Score all eight marker combinations. A chromosome with no crossover keeps a parental combination; a crossover in one interval gives a single recombinant. A double crossover swaps both intervals. You will infer the order from the counts, rather than being given a map.'] },
      { type: 'choice', question: 'Why score sons for this X-linked mapping cross?', options: [
        { text: 'A son has just one maternal X, so its recessive markers are exposed', correct: true, why: 'His father contributes a Y rather than a second X. The son’s phenotype therefore reads the maternal chromosome directly.' },
        { text: 'Sons make more crossovers than daughters', why: 'The chromosomes recombined in the mother’s meiosis. Drosophila males do not make meiotic crossovers.' },
        { text: 'The Y supplies normal copies of all three marker genes', why: 'A Y does not supply normal alleles at these X-linked loci; that is why recessive maternal markers are visible in sons.' },
      ] },
      { type: 'threepoint', title: 'Find the middle gene, then build the map',
        order: ['y', 'cv', 'v'], shown: ['cv', 'v', 'y'], phase: { y: true, cv: true, v: true }, r: [0.137, 0.193], coc: 0.5, n: 2000, seed: 29,
        intro: 'The table shows 2,000 sons. First mark the two parental classes and the two double-crossover classes, then identify the middle gene. Locus columns are listed alphabetically, not in map order.',
        explain: 'Each maternal chromosome carrying a double crossover is recombinant in BOTH intervals. Include those sons once in each interval total. The coefficient of coincidence is observed double crossovers divided by the number expected from the two measured interval fractions; interference is one minus that coefficient.' },
      { type: 'choice', question: 'Why does adding the two interval distances give a larger value than counting only recombinants between the outside genes?', options: [
        { text: 'Double crossovers restore the outside-marker arrangement but contribute to both interval distances', correct: true, why: 'Two exchanges on a maternal chromosome can leave the outer alleles in their parental combination. The middle marker exposes the exchanges that a two-marker score misses.' },
        { text: 'The Y chromosome adds another map interval', why: 'The map concerns the mother’s X pair. Her son’s Y lets you read it but contributes no interval to this map.' },
        { text: 'Double-crossover sons should be discarded', why: 'Their chromosomes carry information about both intervals. Discarding them underestimates both map distances.' },
      ] },
      { type: 'choice', question: 'A coefficient of coincidence below one tells you what?', options: [
        { text: 'Fewer double crossovers occurred than expected from independent interval events', correct: true, why: 'The two exchanges on a chromosome are less often found together than the product of the measured interval fractions predicts. This is positive interference.' },
        { text: 'No chromosome underwent a double crossover', why: 'A coefficient between zero and one still includes observed double-crossover chromosomes; it means fewer than expected, not none.' },
        { text: 'The physical length of the X chromosome has decreased', why: 'The calculation compares crossover frequencies. It does not measure DNA length or chromosome loss.' },
      ] },
    ],
  },
  mosaics: {
    title: 'FLP/FRT clones and twin spots',
    notation: 'both',
    model: ['The disc is a schematic growing tissue. Coloured cells represent known marker/genotype classes, not microscope fluorescence. Every successful event here uses the segregation that generates reciprocal homozygous daughters; other segregation outcomes, cell death and genotype-dependent growth are not simulated. Heat-shock ages and induction probabilities illustrate timing, not a lab protocol.'],
    steps: [
      { type: 'text', title: 'Two homologs inside one dividing cell',
        body: ['A cell carries m on one chromosome arm and a normal allele on the homolog. Both arms have an FRT site at the same position, between the centromere and the locus. After DNA replication, FLP can exchange the distal arms between homologous chromatids.',
          'With the appropriate mitotic segregation, one daughter receives two mutant distal arms (m/m), while its sister receives two normal arms (+/+). Their descendants make a mutant clone and a reciprocal twin spot in the surrounding m/+ tissue. This is mitotic recombination inside a fly, not a meiotic cross to make offspring.'] },
      { type: 'choice', question: 'What must be true of the chromosomes for this clone scheme to make m/m cells?', options: [
        { text: 'The homologs have compatible FRT sites proximal to the mutation', correct: true, why: 'An exchange at those FRT sites can put two mutant distal arms into one daughter. A mutation on the centromere side of the exchange would not become homozygous by this event.' },
        { text: 'One FRT site anywhere in the genome is enough', why: 'The exchange needs compatible sites on the homologous chromatids. Their position relative to m determines whether the daughter becomes m/m.' },
        { text: 'The starting fly must already be m/m throughout', why: 'The starting chromosome pair is m/+. Mitotic recombination makes local m/m and +/+ patches while the rest remains heterozygous.' },
      ] },
      { type: 'clones', title: 'Make a few large clones', seed: 17,
        goal: { minClones: 1, maxClones: 5, minLargest: 40 },
        intro: 'You need one to five visible mutant clones, with at least one containing 40 cells. Choose when and how strongly to induce FLP, then dissect the model disc.',
        explain: 'An early chromosome exchange leaves more divisions for each daughter lineage to expand. Induction strength changes the chance of an exchange in each dividing cell; it does not directly enlarge a clone.' },
      { type: 'clones', title: 'Make many small clones', seed: 17,
        goal: { minClones: 8, maxMean: 12 },
        intro: 'Now you need at least eight visible mutant clones, averaging no more than 12 cells each. Change the induction plan, then test it across independent model discs.',
        explain: 'Later in growth there are more heterozygous chromosome pairs available to recombine, but fewer divisions remain for each new daughter lineage. This favours many smaller patches.' },
      { type: 'choice', question: 'A mutant clone is smaller than its twin spot. Is reduced growth of m/m cells established?', options: [
        { text: 'It is a candidate explanation; compare matched controls and many reciprocal pairs', correct: true, why: 'The reciprocal chromosome products give a useful internal comparison, but induction time, unequal lineage growth and survival also affect patch size. Multiple matched pairs test a genotype effect.' },
        { text: 'Yes: twin spots must always contain exactly equal numbers of cells', why: 'Reciprocal chromosome inheritance does not force identical growth histories. Even this neutral model splits lineages unevenly.' },
        { text: 'No: the two patches have the same genotype', why: 'They carry reciprocal homozygous chromosome arms: m/m versus +/+. That difference is precisely why the comparison can be informative.' },
      ] },
    ],
  },
  target: {
    title: 'GAL80ts: controlling time',
    notation: 'both',
    model: ['Schedules use two temperature settings and fixed model stage lengths. GAL80ts switching, RNAi and protein turnover are illustrative first-order kinetics; real constructs and proteins require calibration. This model follows an RNAi target protein, not the abundance of a directly expressed UAS reporter.'],
    steps: [
      { type: 'text', title: 'Keep the chromosomes, change their activity',
        body: ['The fly carries a GAL4 driver, a UAS-RNAi construct and a GAL80ts transgene. Their chromosomes remain present throughout the experiment. GAL80ts regulates the activity of GAL4 rather than removing either transgene.',
          'At 18 °C GAL80ts represses GAL4; at 29 °C repression is relieved and GAL4 can drive the RNAi. Temperature also changes developmental rate. After a shift, GAL4 activity changes over time and existing target protein takes time to disappear or recover.'] },
      { type: 'choice', question: 'Why can target protein remain after the RNAi-driving transgenes have been activated?', options: [
        { text: 'The chromosomes are present, but switching and turnover of existing protein take time', correct: true, why: 'GAL4/UAS changes new expression; it does not instantly remove proteins already made. The relevant biological window depends on both activation and protein turnover.' },
        { text: 'The UAS chromosome has to recombine with the GAL4 chromosome first', why: 'GAL4 acts on UAS in trans. Their chromosomes need not recombine; the delay is in regulation and protein abundance.' },
        { text: '29 °C deletes the GAL80ts chromosome', why: 'The chromosome remains. Temperature changes the repressor’s activity, and shifting back can restore repression.' },
      ] },
      { type: 'target', title: 'Protect development, knock down in adults',
        intro: 'Choose 18 or 29 °C for each stage. Keep the target protein at or above 90% throughout pre-adult development, then at or below 20% during the final 48 hours of the adult observation window.',
        goal: { checks: [
          { stages: ['embryo', 'L1', 'L2', 'L3', 'pupa'], measure: 'protein', min: 0.9, text: 'Target protein ≥90% throughout development' },
          { stages: ['adult'], measure: 'protein', max: 0.2, last: 48, text: 'Target protein ≤20% in the final 48 adult hours' },
        ] },
        explain: 'The same chromosomes can support normal development and later knockdown. Inducing RNAi only after eclosion protects development, but the adult assay must wait for regulation and protein depletion.' },
      { type: 'target', title: 'A pupal pulse, then recovery',
        intro: 'Keep target protein at or above 90% through the larval stages. Reduce it to at most 25% in the last 24 pupal hours, then restore it to at least 80% during the last 48 adult hours.',
        goal: { checks: [
          { stages: ['embryo', 'L1', 'L2', 'L3'], measure: 'protein', min: 0.9, text: 'Target protein ≥90% through larval development' },
          { stages: ['pupa'], measure: 'protein', max: 0.25, last: 24, text: 'Target protein ≤25% in the final 24 pupal hours' },
          { stages: ['adult'], measure: 'protein', min: 0.8, last: 48, text: 'Target protein ≥80% in the final 48 adult hours' },
        ] },
        explain: 'Returning these chromosomes to 18 °C restores GAL80ts repression, but recovery of the target protein lags behind. A temperature schedule must specify the assay window as well as the shift.' },
      { type: 'multi', question: 'Which comparisons help interpret a temperature-controlled RNAi phenotype?', options: [
        { text: 'Matched genetic controls under the same temperature schedule', correct: true, why: 'Matched chromosome backgrounds without the experimental knockdown help separate RNAi effects from temperature and background effects.' },
        { text: 'An independent measure of target protein or knockdown in the intended window', correct: true, why: 'Possessing the driver and UAS chromosomes does not establish when their target protein actually changes. Measure the biological consequence of the switch.' },
        { text: 'Only the experimental genotype, because GAL80ts removes temperature effects', why: 'GAL80ts regulates the driver; it does not stop temperature acting on the rest of the fly. Genetic and temperature controls remain necessary.' },
      ], explain: 'The chromosomes define the tools; controls and an independent readout establish what those tools did during the assay window.' },
    ],
  },
  screens: {
    title: 'Planning a genetic screen',
    notation: 'both',
    model: ['Hits per chromosome follow a Poisson distribution. The preset dose labels are parameters in the supplied model, not recommended mutagenesis conditions. The same per-gene hit probability is assumed for each independent line; viability, recovery efficiency and gene size do not vary here. Workload counts two vials per line and is not a full budget.'],
    steps: [
      { type: 'text', title: 'One independently mutagenised chromosome per line',
        body: ['A screen isolates mutagenised chromosome 2s and keeps each over a balancer. Descendants from the same chromosome are one line, even if you score many flies. Finding an allele in your gene requires sampling independent chromosomes.',
          'Increasing mutagenesis increases hits per chromosome. That improves the chance of hitting the gene, but also increases chromosomes with more than one lethal lesion. A line with two lethals is harder to map and interpret, so plan coverage, complexity and capacity together.'],
        diagrams: [{ g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'Each recovered chromosome is maintained as an independent balanced line' }] },
      { type: 'choice', question: 'You score 5,000 sibling flies from one mutagenised chromosome. Is that equivalent to 5,000 independent lines?', options: [
        { text: 'No: they mostly resample copies of the same chromosome', correct: true, why: 'The mutations were carried by one founding chromosome. More siblings improve phenotyping of that line, but do not add independent chances to hit a new gene.' },
        { text: 'Yes: every fly has a newly mutagenised chromosome', why: 'The founding chromosome is inherited. Its siblings do not each gain an independent set of mutations just because you count them.' },
        { text: 'Only if all the siblings carry the balancer', why: 'The balancer preserves the chromosome but does not create independent mutation events. Independence comes from different founding chromosomes.' },
      ] },
      { type: 'screen', title: 'Coverage with simple chromosomes',
        intro: 'Plan at least a 90% chance of an allele in your gene, with no more than 35% of lethal lines carrying multiple lethal hits. Your capacity is 5,000 independent lines.',
        goal: { minHit: 0.9, maxMulti: 0.35, maxLines: 5000 },
        explain: 'Less heavily mutagenised chromosomes are easier to interpret, but more independent lines are needed for coverage. Count lines, not individual sibling flies, when estimating the hit probability.' },
      { type: 'screen', title: 'A tighter fly room',
        intro: 'Now aim for at least 95% coverage with capacity for only 3,500 independent lines. Up to 45% of lethal lines may carry multiple hits. Find a plan that meets all three constraints.',
        goal: { minHit: 0.95, maxMulti: 0.45, maxLines: 3500 },
        explain: 'The chromosome-level trade-off changes with capacity. The strongest preset can exceed the acceptable multiple-hit burden even when its coverage is high; the weakest can require too many lines.' },
      { type: 'choice', question: 'What does “multiple-hit share” mean in this planner?', options: [
        { text: 'Among chromosomes with at least one lethal hit, the share with two or more lethal hits', correct: true, why: 'The denominator is the recovered lethal chromosome set, not every screened chromosome. Conditioning on lethal lines makes the complexity of that collection visible.' },
        { text: 'The share of flies homozygous for the balancer', why: 'Balancer homozygotes concern segregation and viability. This statistic counts lesions on each independently mutagenised chromosome.' },
        { text: 'The chance that the target gene is hit twice in one fly', why: 'The model counts lethal lesions across a chromosome; its coverage calculation separately asks whether at least one line hits the particular gene.' },
      ] },
      { type: 'choice', question: 'A planned screen has 95% coverage in this model. What does that mean for the real experiment?', options: [
        { text: 'A conditional probability estimate, not a guarantee; recovery and the per-gene rate need calibration', correct: true, why: 'Chromosome recovery, gene-specific mutability and detection affect the chance of obtaining an allele. A calculated probability is only as applicable as those assumptions.' },
        { text: 'Exactly 95% of the recovered chromosomes will mutate the target gene', why: 'Coverage is the chance that at least one independent chromosome hits the gene. It is not the fraction of lines that carry its mutation.' },
        { text: 'The first target allele must appear before the last planned line', why: 'Independent chromosome samples remain random. Even a correctly calibrated 95% design can miss the gene.' },
      ] },
    ],
  },
  diagnostic: {
    title: 'Quick check',
    notation: 'both',
    diagnostic: true,
    steps: [
      { type: 'choice', area: 'handling', question: 'Under the microscope, what tells you a fly is male?',
        options: [
          { text: 'Sex combs on the front legs', correct: true, why: 'Right: sex combs are the reliable cue, even in pale young males.' },
          { text: 'Pale colour', why: 'Young flies of both sexes are pale. Sex combs are the reliable cue.' },
          { text: 'Larger size', why: 'Females are usually the larger ones. Sex combs are the reliable cue.' },
        ] },
      { type: 'choice', area: 'handling', question: 'Why collect virgins within about 8 hours of clearing a vial (at 25 °C)?',
        options: [
          { text: 'Females do not mate for about 8 hours after eclosion', correct: true, why: 'Right: any female younger than that is still a virgin.' },
          { text: 'Males die after 8 hours', why: 'Males live for weeks. The point is that young females do not mate yet.' },
          { text: 'The food dries out', why: 'The window is about the females: they do not mate for about 8 hours after eclosion.' },
        ] },
      { type: 'choice', area: 'inheritance', question: 'CyO/+ × CyO/+: what share of the adults are Curly?',
        options: [
          { text: '2/3', correct: true, why: 'Right: CyO/CyO dies, leaving 2 Curly : 1 straight.' },
          { text: '3/4', why: 'That forgets that CyO/CyO dies.' },
          { text: '1/2', why: 'Count the combinations: CyO/+ twice, +/+ once, CyO/CyO lethal.' },
        ] },
      { type: 'choice', area: 'inheritance', question: 'w/w females × +/Y males: what eye colour are the sons?',
        options: [
          { text: 'White', correct: true, why: 'Right: sons get their only X, carrying w, from their mother.' },
          { text: 'Red', why: 'Sons get the Y from their father, not his X, so they have no normal white gene.' },
          { text: 'Half red, half white', why: 'Every son gets one of his mother’s Xs, and both carry w.' },
        ] },
      { type: 'choice', area: 'advanced', question: 'A cross gives 70 Curly : 30 straight. You test 3:1 and get χ² = 1.33 (critical value 3.84). What can you say?',
        options: [
          { text: 'The counts are consistent with 3:1, but that does not prove it', correct: true, why: 'Right: not rejecting is not the same as confirming.' },
          { text: 'The ratio is 3:1', why: 'A χ² test can only fail to reject a hypothesis. 2:1 (χ² = 0.5) fits these counts too.' },
          { text: 'The ratio is not 3:1', why: 'χ² is below the critical value, so you cannot reject 3:1.' },
        ] },
      { type: 'choice', area: 'stocks', question: 'What stops a balancer recombining with its partner chromosome?',
        options: [
          { text: 'Its inversions', correct: true, why: 'Right: multiple inversions block viable crossover products.' },
          { text: 'Its dominant marker', why: 'The marker only lets you see it. Inversions block recombination.' },
          { text: 'Being lethal when homozygous', why: 'That keeps the stock true-breeding. Inversions block recombination.' },
        ] },
    ],
  },
};

/** After the quick check: where to start, from the first area with a wrong answer. */
export function recommendStart(answers) {
  const steps = LESSON_CONTENT.diagnostic.steps;
  const missed = (area) => steps.some((s, i) => s.area === area && !answers[i]);
  if (missed('handling')) return 'tour';
  if (missed('inheritance')) return 'inheritance';
  if (missed('stocks')) return 'balancers';
  if (missed('advanced')) return 'chance';
  return 'recombination';
}
