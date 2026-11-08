// Interactive genetics lessons. Every answer a lesson checks is computed by the
// genetics engine (gametes, progeny classes, viability), so lessons cannot drift
// from the biology. Step types: text, choice, gametes, predict, pick, go.

import { parseGenotype, offspring, phenotype, isViable, chromGametes, isMale, CHROMS, GENES_2 } from './genetics/genetics.js';
import { ORDER } from './chromosomes.js';
import { scaffoldLesson } from './curriculum.js';
import { ADDITIONAL_LESSONS } from './courseAdditions.js';
import { SPECIALIST_LESSONS } from './specialistLessons.js';

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
    else if (t === 'bar') {
      if (ph.bar) words.push(ph.bar === 1 ? 'Bar (kidney eyes)' : 'Bar (narrow eyes)');
    } else if (ph[t]) words.push(TRAIT[t].yes);
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
  if (g[chrom].some((k) => /CyO|TM3|TM6B|FM7/.test(k)))
    return 'A balancer is in this pair: its inversions stop crossovers from giving viable products.';
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
  const m = parseGenotype(mother),
    f = parseGenotype(father);
  const pick = (g) => {
    let out = [{}];
    for (const c of chroms) out = out.flatMap((o) => [...new Set(g[c])].map((k) => ({ ...o, [c]: k })));
    return out;
  };
  const eggs = pick(m),
    sperm = pick(f);
  const cells = eggs.map((e) =>
    sperm.map((s) => {
      const z = {};
      for (const c of ORDER) z[c] = chroms.includes(c) ? [e[c], s[c]] : [m[c][0], f[c][0]];
      const viable = isViable(z);
      let label = describe(visible(z), traits);
      if (bySex) label = `${label} ${isMale(z) ? '♂' : '♀'}`;
      return { label: capital(label), viable };
    }),
  );
  return { eggs, sperm, cells };
}

export const FRACTIONS = [
  { label: 'none', value: 0 },
  { label: '1/4', value: 1 / 4 },
  { label: '1/3', value: 1 / 3 },
  { label: '1/2', value: 1 / 2 },
  { label: '2/3', value: 2 / 3 },
  { label: '3/4', value: 3 / 4 },
  { label: 'all', value: 1 },
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
  const c = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  c.forEach((v, i) => {
    x += v / (z + i + 1);
  });
  const t = z + c.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let sum = 1 / a,
      term = sum;
    for (let n = 1; n < 500; n++) {
      term *= x / (a + n);
      sum += term;
      if (term < sum * 1e-14) break;
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  let b = x + 1 - a,
    c = 1e300,
    d = 1 / b,
    h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
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
      {
        type: 'text',
        title: 'Genes ride on chromosomes',
        visual: 'chromosomes',
        body: [
          'A fruit fly has four chromosome pairs. Females usually have XX sex chromosomes and males XY, alongside chromosomes 2 and 3 and the tiny chromosome 4.',
          'Each pair contains one chromosome from each parent. Each bar in the diagram is one chromosome. Hover over a bar to see what it carries.',
        ],
        diagrams: [{ g: CURLY_F, caption: 'A female fly' }],
      },
      {
        type: 'text',
        title: 'Meet Curly',
        visual: 'dominance',
        body: [
          'One of her chromosome 2s is called CyO. It carries Curly, labelled Cy. Curly is dominant: one copy is enough to curl the wing tips.',
          'Her other chromosome 2 is normal, written +. She has curly wings because she carries Curly on one chromosome.',
        ],
        diagrams: [{ g: CURLY_F, chroms: ['2'], caption: 'Her chromosome 2 pair' }],
      },
      {
        type: 'choice',
        visual: 'inheritance',
        question: 'An egg or a sperm (a gamete) carries how many copies of chromosome 2?',
        options: [
          {
            text: 'One: one chromosome from each pair',
            correct: true,
            why: 'Right. Meiosis, the division that makes eggs and sperm, gives each gamete one chromosome from each pair; fertilisation restores the pairs.',
          },
          {
            text: 'Two: the whole pair',
            why: 'If both egg and sperm carried the whole pair, their offspring would have four copies. Each gamete takes just one chromosome from each pair.',
          },
          {
            text: 'It depends on the sex of the fly',
            why: "Both eggs and sperm take one chromosome from each pair. This rule does not change with the parent's sex.",
          },
        ],
      },
      {
        type: 'gametes',
        title: 'Make her eggs',
        visual: 'inheritance',
        parent: CURLY_F,
        chroms: ['2'],
        intro: 'Click one chromosome from the pair, then press Make gamete. Find every kind of egg she can make.',
        done: 'She makes two egg types: CyO and +. Each is equally likely, so half her eggs carry Curly.',
      },
      {
        type: 'predict',
        title: 'Curly × normal',
        visual: 'fertilisation',
        mother: CURLY_F,
        father: PLAIN_M,
        chroms: ['2'],
        traits: ['curly'],
        intro: 'She is crossed to a male with two normal chromosome 2s. What share of their offspring will be Curly?',
        explain:
          'Every sperm carries +. Half the eggs carry CyO, giving CyO/+ offspring with Curly wings. The rest give +/+ offspring with straight wings.',
      },
      {
        type: 'gametes',
        title: 'Two pairs at once',
        visual: 'assortment',
        parent: 'w/w; CyO/+; TM3/+',
        chroms: ['2', '3'],
        intro:
          'This female also carries TM3 on chromosome 3. Its dominant marker is Stubble, labelled Sb: short, thick bristles. Choose one chromosome 2 and one chromosome 3 for each gamete. Find every combination.',
        done: 'Four types, each with a quarter share. Chromosomes 2 and 3 are sorted separately into eggs. This is called independent assortment.',
      },
      {
        type: 'predict',
        title: 'Curly × Curly',
        visual: 'lethals',
        mother: CURLY_F,
        father: CURLY_M,
        chroms: ['2'],
        traits: ['curly'],
        intro: 'Both Curly parents are CyO/+. List each egg–sperm combination before you predict the offspring.',
        explain:
          'The fertilised eggs have a ratio of 1 CyO/CyO : 2 CyO/+ : 1 +/+. CyO/CyO flies die before hatching. Among surviving adults, two-thirds are Curly and one-third are straight.',
      },
      {
        type: 'choice',
        visual: 'lethals',
        question: 'A Curly × Curly vial gives 90 adults. About how many will have curly wings?',
        options: [
          {
            text: 'About 60',
            correct: true,
            why: 'Right. Two-thirds of the surviving adults are Curly because the CyO/CyO quarter never hatches.',
          },
          {
            text: 'About 68',
            why: 'Three-quarters gives a 3:1 ratio before removing the lethal CyO/CyO flies. The adults instead have a ratio of 2 Curly : 1 straight.',
          },
          { text: 'About 45', why: 'A half would fit Curly crossed to normal. Here CyO/+ occurs twice, +/+ once, and CyO/CyO dies.' },
        ],
      },
      {
        type: 'text',
        title: 'What you have learned',
        visual: 'chromosomes',
        body: [
          'Each parent passes on one chromosome from each pair. Different pairs are sorted separately.',
          'Some chromosome combinations are lethal: the flies die before you score them. The next lessons use this to maintain mutations in a stock.',
        ],
      },
    ],
  },
  xlinked: {
    title: 'The X chromosome',
    notation: 'both',
    steps: [
      {
        type: 'text',
        title: 'Females XX, males XY',
        visual: 'x-copies',
        body: [
          'Female flies have two X chromosomes. Males have one X and a Y. In Drosophila, the number of X chromosomes controls sex determination. The Y is needed for normal male fertility. It carries no white gene.',
          'The white gene is on the X. Its recessive mutation, w, gives white eyes when no normal copy is present. Try the Diagram / Notation / Both switch to compare chromosome drawings with genetic shorthand.',
        ],
        diagrams: [
          { g: 'w/w; +/+; +/+', chroms: ['X'], caption: 'A white-eyed female: w/w' },
          { g: '+/Y; +/+; +/+', chroms: ['X'], caption: 'A red-eyed male: +/Y' },
        ],
      },
      {
        type: 'choice',
        question: 'A son gets his only X chromosome from…',
        options: [
          {
            text: 'His mother',
            correct: true,
            why: 'Right. In this XX × XY cross, a son gets his X from his mother and his Y from his father.',
          },
          { text: 'His father', why: "A father's X goes to a daughter. A son gets his father's Y." },
          {
            text: 'Either parent, at random',
            why: "A son gets his father's Y, so his X must come from his mother.",
          },
        ],
      },
      {
        type: 'gametes',
        title: 'The male’s sperm',
        visual: 'sex-gametes',
        parent: '+/Y; +/+; +/+',
        chroms: ['X'],
        intro: 'Find every kind of sperm this red-eyed male makes.',
        done: 'Half his sperm carry his X with the normal white gene; these make daughters. The other half carry Y and make sons.',
      },
      {
        type: 'gametes',
        title: 'The female’s eggs',
        visual: 'sex-gametes',
        parent: 'w/w; +/+; +/+',
        chroms: ['X'],
        intro: 'Now this white-eyed female. How many kinds of egg can she make?',
        done: 'One type: both her X chromosomes carry w, so every egg carries w.',
      },
      {
        type: 'predict',
        title: 'White female × red male',
        visual: 'xlinked',
        mother: 'w/w; +/+; +/+',
        father: '+/Y; +/+; +/+',
        chroms: ['X'],
        traits: ['eye'],
        bySex: true,
        decoys: ['White eyes: daughters', 'Red eyes: sons'],
        intro: 'Predict each class of offspring as a share of all the adults.',
        explain:
          "Daughters get w from their mother and + from their father, giving red eyes. Sons get their mother's w and their father's Y, giving white eyes.",
      },
      {
        type: 'predict',
        title: 'Swap the parents',
        visual: 'reciprocal',
        mother: '+/+; +/+; +/+',
        father: 'w/Y; +/+; +/+',
        chroms: ['X'],
        traits: ['eye'],
        bySex: true,
        decoys: ['White eyes: daughters', 'White eyes: sons'],
        intro: 'Now cross a red-eyed female (+/+) to a white-eyed male (w/Y). Does reversing the parents change the offspring?',
        explain:
          'Every offspring gets a normal X from its mother, so all are red-eyed. For an X-linked gene, swapping the parents can change the result; for chromosome 2 or 3 it does not change which sex inherits each allele.',
      },
      {
        type: 'choice',
        question: 'In the first cross (white female × red male) you find a white-eyed daughter. What does that tell you?',
        options: [
          {
            text: 'Her father carried w, so the intended red-eyed males were not her father',
            correct: true,
            why: "Right. A white-eyed daughter needs w on both Xs, so her father's X carried w rather than the normal allele in your red-eyed males.",
          },
          {
            text: 'Nothing: ratios vary by chance',
            why: 'Chance changes the counts, but these parents cannot produce a white-eyed daughter. Her paternal X needs a source of w.',
          },
          {
            text: 'The mother was certainly a virgin',
            why: 'This points to an unintended father, such as a white-eyed male that mated with her mother before collection.',
          },
        ],
      },
      {
        type: 'go',
        title: 'Now do it at the bench',
        body: [
          'The First cross mission uses this cross. Collect the white-eyed females, then inspect their offspring for evidence of unintended mating.',
        ],
        action: { kind: 'scope', activity: 'cross', label: 'Open the First cross' },
      },
    ],
  },
  balancers: {
    title: 'Balancers',
    notation: 'both',
    steps: [
      {
        type: 'text',
        title: 'The problem',
        body: [
          'mut¹ is a recessive lethal mutation on chromosome 2. Flies with two copies die. Flies with one copy look normal.',
          'A stock is a population you keep and breed. How can you keep mut¹ when mut¹/+ flies look normal and can pass on either mut¹ or +?',
        ],
        diagrams: [{ g: 'w/w; mut/+; +/+', chroms: ['2'], caption: 'mut¹ over a normal chromosome: invisible' }],
      },
      {
        type: 'text',
        title: 'What a balancer is',
        body: [
          'A balancer is a chromosome with three useful features:',
          '1. A visible dominant marker: Curly on CyO, Stubble on TM3, and Humeral and Tubby on TM6B.',
          '2. A recessive lethal: flies with two copies of the same balancer die.',
          '3. Inversions, shown by the zig-zag: reversed chromosome segments that make recovered recombinants rare, helping you keep the partner chromosome intact.',
        ],
        diagrams: [{ g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'mut¹ kept over CyO' }],
      },
      {
        type: 'predict',
        title: 'A balanced stock',
        mother: 'w/w; mut/CyO; +/+',
        father: 'w/Y; mut/CyO; +/+',
        chroms: ['2'],
        traits: ['curly'],
        decoys: ['Straight wings'],
        intro: 'Cross mut¹/CyO females to mut¹/CyO males. What share of the adults will be Curly?',
        explain:
          'mut¹/mut¹ flies die, as do CyO/CyO flies. Only mut¹/CyO adults survive. Each carries Curly and retains mut¹, so breeding these adults maintains the stock.',
      },
      {
        type: 'choice',
        question: 'Why does breeding a mut¹/CyO stock keep mut¹ without selecting individual flies?',
        options: [
          {
            text: 'Both two-copy combinations die, leaving mut¹ over CyO in every adult',
            correct: true,
            why: 'Right. The straight-winged mut¹/mut¹ flies die, leaving only Curly adults that still carry mut¹.',
          },
          {
            text: 'Curly flies are healthier',
            why: 'Both lethal chromosome combinations die. Curly is the marker that lets you recognise the surviving mut¹/CyO flies.',
          },
          {
            text: 'CyO repairs mut¹',
            why: 'CyO does not repair mut¹. Only the flies carrying one of each chromosome survive.',
          },
        ],
      },
      {
        type: 'gametes',
        title: 'Crossing over in a female',
        visual: 'recombination',
        parent: 'w/w; +/+; GAL4/UAS-RNAi',
        chroms: ['3'],
        crossover: true,
        intro:
          'GAL4 and UAS-RNAi are DNA insertions on different chromosome 3s in this female. During egg formation, matching chromosomes can exchange segments: a crossover. Find her egg types using the Crossover switch.',
        done: 'Four types: the two original combinations, plus one with both insertions and one with neither. These new combinations are recombinants. Here 30% of eggs are recombinant, with 15% of each type.',
      },
      {
        type: 'gametes',
        title: 'The same chromosomes in a male',
        visual: 'male-meiosis',
        parent: 'w/Y; +/+; GAL4/UAS-RNAi',
        chroms: ['3'],
        crossover: true,
        intro: 'The male has the same chromosome 3 pair. Find every sperm type he can make.',
        done: 'Two types only. Drosophila males do not have meiotic crossovers, so this male passes on the original combinations.',
      },
      {
        type: 'gametes',
        title: 'And over a balancer',
        visual: 'balancer-transmission',
        parent: 'w/w; +/+; GAL4/TM3',
        chroms: ['3'],
        crossover: true,
        intro: 'Now a female with GAL4 over TM3. Can she make recombinant eggs?',
        done: "Two types only. TM3's inversions suppress recovered recombinants, so you recover intact GAL4 or TM3 chromosomes here.",
      },
      {
        type: 'pick',
        title: 'Put an insertion over CyO',
        mother: 'w/w; UAS-GFP/UAS-GFP; +/+',
        father: 'w/Y; Sco/CyO; +/+',
        traits: ['curly', 'scutoid'],
        target: { chrom: '2', pair: ['CyO', 'UAS-GFP'] },
        intro:
          'Cross UAS-GFP females to Sco/CyO males. You want UAS-GFP paired with CyO. Which offspring can you identify by their Curly wings?',
        right: 'Right. Curly offspring inherited paternal CyO, so their other chromosome 2 must be maternal UAS-GFP.',
        wrong: "These flies inherited Sco from their father. Select the flies with CyO's Curly marker.",
      },
      {
        type: 'pick',
        title: 'Pick the right balancer',
        mother: 'w/w; +/+; GAL4/GAL4',
        father: 'w/Y; +/+; TM3/TM6B',
        traits: ['stubble', 'humeral', 'tubby'],
        target: { chrom: '3', pair: ['GAL4', 'TM6B'] },
        intro: 'GAL4 females × TM3/TM6B males. You want GAL4 over TM6B. Which class?',
        right: 'Right. Humeral and Tubby mark TM6B, so these offspring carry GAL4/TM6B.',
        wrong: 'Stubble marks TM3. You need Humeral and Tubby, the markers on TM6B.',
      },
      {
        type: 'go',
        title: 'Plan your own crosses',
        body: [
          "You can now follow chromosomes with markers and balancers, and choose females when you need recombination. Use these skills in the Cross planner's six puzzles.",
        ],
        action: { kind: 'planner', label: 'Open the Cross planner' },
      },
    ],
  },
  chance: {
    title: 'Counting and chance',
    notation: 'diagram',
    steps: [
      {
        type: 'text',
        title: 'Ratios are expectations',
        body: [
          'A 1:1 ratio is the expected share over many offspring. Each fly is a separate event, so a vial need not match that ratio exactly.',
          'How large a difference from the expected ratio should concern you? Count vials of different sizes to see how the sample size matters.',
        ],
      },
      {
        type: 'chance',
        title: 'Count some vials',
        mother: 'w/w; CyO/+; +/+',
        father: 'w/Y; +/+; +/+',
        chroms: ['2'],
        traits: ['curly'],
        focus: 'Curly wings',
        sizes: [20, 100, 1000],
        need: 4,
        seed: 3,
        intro: 'Curly × normal: half the offspring should be Curly. Count vials of different sizes and watch where the results land.',
        done: 'Small samples vary widely around 1/2; larger samples vary less in proportion. The spread falls with the square root of the sample size: 100 flies are about twice as precise as 25.',
      },
      {
        type: 'choice',
        question: 'A vial of 20 from this cross gives 13 Curly and 7 straight. What do you conclude?',
        options: [
          {
            text: 'Nothing unusual: splits like this are common in a vial of 20',
            correct: true,
            why: 'Right. A 13:7 split is common enough by chance among 20 flies from this cross.',
          },
          {
            text: 'The father must have carried Curly too',
            why: 'That cross would predict two-thirds Curly, but 20 flies cannot reliably distinguish 2/3 from 1/2. These counts do not require a different father.',
          },
          {
            text: 'Curly flies survive better',
            why: 'A survival difference is possible, but 20 flies do not establish it. Plan a larger sample and test the prediction.',
          },
        ],
      },
      {
        type: 'text',
        title: 'Putting a number on it: χ²',
        body: [
          'First state a hypothesis: the ratio your cross predicts. The chi-square test compares observed counts O with expected counts E, using χ² = sum of (O − E)² / E.',
          'Degrees of freedom are the number of classes minus one. For two classes, χ² above 3.84 would occur less than 5% of the time if the hypothesis were true. Reject that hypothesis at this threshold.',
          'Below the threshold, you cannot reject the hypothesis. You have not proved it true.',
        ],
      },
      {
        type: 'chisq',
        title: 'Test a Curly × Curly vial',
        intro: 'You crossed Curly × Curly and counted 300 adults. Which ratio do the counts fit? Test each hypothesis and judge it.',
        observed: [
          { label: 'Curly wings', n: 205 },
          { label: 'Straight wings', n: 95 },
        ],
        hypotheses: [
          { label: '1:1', shares: [1 / 2, 1 / 2] },
          { label: '2:1', shares: [2 / 3, 1 / 3] },
          { label: '3:1', shares: [3 / 4, 1 / 4] },
        ],
        explain:
          'Only 2:1 fits at this threshold, as expected when CyO/CyO dies. The counts reject 3:1, which includes those missing flies.',
      },
      {
        type: 'choice',
        question:
          'A smaller vial gives 61 Curly and 29 straight (90 flies). Against 3:1, χ² = 2.5, below 3.84. Does that show the ratio is 3:1?',
        options: [
          {
            text: 'No: 2:1 fits these counts too. 90 flies cannot separate the two ratios',
            correct: true,
            why: 'Right. A small sample may fit several ratios, so decide how many flies you need before counting.',
          },
          {
            text: 'Yes: the test accepted 3:1',
            why: 'The test does not prove 3:1. The same counts fit 2:1 even better (χ² ≈ 0.05).',
          },
          {
            text: 'No: the test is invalid below 100 flies',
            why: 'Every expected count is above 5, so this test is valid. It lacks power: the sample cannot reliably distinguish these ratios.',
          },
        ],
      },
      {
        type: 'text',
        title: 'In the lab',
        body: [
          'Choose a sample size that can answer your question before you count. Where possible, score flies without knowing their group.',
          'Check unexpected classes before small ratio differences. In the First cross, a white-eyed daughter needs an explanation even if the overall ratio looks close.',
        ],
      },
    ],
  },
  recombination: {
    title: 'Recombination and mapping',
    notation: 'both',
    steps: [
      {
        type: 'text',
        title: 'Crossovers and distance',
        body: [
          "During egg formation, matching chromosomes can exchange segments: a crossover. A gene's position is its locus. Crossovers separate distant loci more often than nearby loci.",
          'Use the recombinant share to estimate genetic distance. For short intervals, 1% recombinants is about one map unit, called a centimorgan (cM).',
        ],
        diagrams: [{ g: 'w/w; +/+; GAL4/UAS-RNAi', chroms: ['3'], caption: 'A female carrying two insertions, one on each chromosome 3' }],
      },
      {
        type: 'choice',
        question: 'You want a chromosome carrying both GAL4 and UAS-RNAi. Which fly must carry them on separate chromosome 3s?',
        options: [
          {
            text: 'A female (a virgin, so you know her offspring\u2019s father)',
            correct: true,
            why: 'Right. Only females undergo meiotic crossing over in Drosophila, so you need a female to make the recombinant chromosome.',
          },
          { text: 'A male', why: 'Males pass on the original chromosome combinations. Use a female to generate these recombinants.' },
          { text: 'Either sex', why: 'Only females have meiotic crossovers in Drosophila.' },
        ],
      },
      {
        type: 'text',
        title: 'Seeing recombinants',
        body: [
          'Cross her to TM3/TM6B males. Each offspring gets a paternal balancer and a maternal chromosome 3. Use eye colour to follow the maternal chromosome.',
          'Each insertion carries the mini-white eye marker. In a white (w) background, one copy gives orange eyes, two give dark orange, and none give white. Dark orange marks both insertions; white marks neither.',
        ],
        diagrams: [{ g: 'w/Y; +/+; TM3/TM6B', chroms: ['3'], caption: 'Tester male: two balancers' }],
      },
      {
        type: 'count',
        title: 'Measure the distance',
        mother: 'w/w; +/+; GAL4/UAS-RNAi',
        father: 'w/Y; +/+; TM3/TM6B',
        chroms: ['3'],
        traits: ['eye'],
        n: 400,
        seed: 7,
        intro: 'You scored 400 offspring from this cross by eye colour.',
        question: 'What percentage are recombinant?',
        unit: '%',
        tolerance: 0.6,
        decimals: 1,
        answer: (counts) =>
          (100 * counts.filter((c) => c.label !== 'Orange eyes').reduce((t, c) => t + c.n, 0)) / counts.reduce((t, c) => t + c.n, 0),
        hint: 'Add the dark-orange flies carrying both insertions to the white flies carrying neither. Divide that total by all 400 offspring.',
        explain:
          'This gives roughly 30 cM from a cross with 30% recombination. Above about 20 cM, double crossovers hide some exchanges, so the estimate is too short. Recombination frequency cannot exceed 50%.',
      },
      {
        type: 'pick',
        title: 'Keep the recombinant',
        mother: 'w/w; +/+; GAL4/UAS-RNAi',
        father: 'w/Y; +/+; TM3/TM6B',
        traits: ['eye', 'humeral', 'stubble'],
        target: { chrom: '3', pair: ['GAL4,UAS-RNAi', 'TM6B'] },
        intro: 'You want the GAL4, UAS-RNAi recombinant chromosome balanced over TM6B. Which class do you keep?',
        right: 'Right. Dark-orange eyes mark both insertions, and Humeral without Stubble marks the paternal TM6B chromosome.',
        wrong: 'Choose dark-orange eyes for both insertions and Humeral for TM6B.',
      },
      {
        type: 'choice',
        question: 'Two insertions are 1 cM apart. About how many offspring would you screen to find one carrying both?',
        options: [
          {
            text: 'About 200, and in practice several hundred to be safe',
            correct: true,
            why: 'Right. If 1% are recombinant and half carry both insertions, the wanted type occurs about 1 in 200 offspring.',
          },
          {
            text: 'About 20',
            why: 'That estimate would fit 10 cM. At 1 cM, only 1 in 100 offspring is recombinant, and only half of those carry both insertions.',
          },
          {
            text: 'About 100',
            why: 'About 1 in 100 is recombinant, but half carry neither insertion. The type you want occurs about 1 in 200.',
          },
        ],
      },
      {
        type: 'multi',
        question: 'You found a dark-orange fly. Before relying on it as a recombinant line, what should you do?',
        options: [
          {
            text: 'Confirm both insertions are present, for example with a PCR DNA test',
            correct: true,
            why: 'Right. Orange and dark-orange eyes are easy to confuse, so eye colour alone is not enough.',
          },
          {
            text: 'Check that GAL4 activates a reporter and that RNAi gives the expected effect',
            correct: true,
            why: 'Right. A crossover can damage an insertion, so test whether both still work.',
          },
          {
            text: 'Keep several independent recombinants',
            correct: true,
            why: 'Right. Separately recovered lines reduce the chance of relying on one faulty event and give you a backup.',
          },
          {
            text: 'Nothing: dark orange eyes prove it',
            why: 'Other insertions and expression differences can affect eye colour. Confirm the candidate independently.',
          },
        ],
        explain: 'Keep several separately recovered recombinants. Check their DNA and test that both insertions work.',
      },
      {
        type: 'go',
        title: 'Build one yourself',
        body: ['Puzzles 5 and 6 in the Cross planner ask you to make exactly this recombinant and balance it.'],
        action: { kind: 'planner', label: 'Open the Cross planner' },
      },
    ],
  },
  gal4uas: {
    title: 'GAL4/UAS and controls',
    notation: 'diagram',
    steps: [
      {
        type: 'text',
        title: 'Two halves of a switch',
        body: [
          'GAL4 is a yeast protein that activates gene expression. A driver line makes GAL4 in a chosen pattern, such as in neurons. The DNA sequence controlling that pattern is an enhancer.',
          "A UAS responder carries a gene beside DNA sites that GAL4 binds. The gene might make GFP, a fluorescent protein, or an RNAi molecule that reduces a target gene's activity. Crossing driver and responder brings the two parts together.",
        ],
        diagrams: [
          { g: 'w/w; UAS-GFP/UAS-GFP; +/+', caption: 'Responder: UAS-GFP' },
          { g: 'w/Y; +/+; GAL4/GAL4', caption: 'Driver: GAL4' },
        ],
      },
      {
        type: 'choice',
        question: 'A fly carries UAS-GFP but no GAL4. Does it glow?',
        options: [
          {
            text: 'No: UAS is silent without GAL4',
            correct: true,
            why: 'Right. The responder needs GAL4 to activate GFP, so choosing the driver determines where GFP is made.',
          },
          {
            text: 'Yes, everywhere',
            why: 'This responder has no GAL4 to activate it. UAS-GFP alone does not give the driver-controlled GFP pattern.',
          },
          { text: 'Only in the eyes', why: 'Mini-white affects eye colour. It does not activate GFP, which needs GAL4.' },
        ],
      },
      {
        type: 'predict',
        title: 'Driver × reporter',
        mother: 'w/w; +/+; GAL4/TM3',
        father: 'w/Y; UAS-GFP/UAS-GFP; +/+',
        chroms: ['3'],
        traits: ['gfp', 'stubble'],
        decoys: ['GFP, Stubble', 'No GFP'],
        intro:
          'These females carry GAL4 over TM3, marked by Stubble. Cross them to males carrying UAS-GFP on both matching chromosomes. Which offspring glow?',
        explain:
          'Every offspring inherits UAS-GFP. Half inherit GAL4 and glow; half inherit TM3 and are Stubble without GFP. Stubble lets you separate the groups under a normal microscope.',
      },
      {
        type: 'pick',
        title: 'Which flies do you image?',
        mother: 'w/w; +/+; GAL4/TM3',
        father: 'w/Y; UAS-GFP/UAS-GFP; +/+',
        traits: ['gfp', 'stubble'],
        target: { chrom: '3', pair: ['GAL4', '+'] },
        intro: 'You can sort under a normal microscope by bristles. Which class carries GAL4 > UAS-GFP?',
        right: 'Right. Without Stubble, these offspring lack TM3 and instead carry GAL4, which activates UAS-GFP.',
        wrong: 'Stubble offspring inherited TM3 instead of GAL4. They lack the activator needed for UAS-GFP.',
      },
      {
        type: 'multi',
        question:
          "GAL4 > UAS-RNAi reduces the target gene's activity and you see a phenotype. Which controls help test whether the target gene caused it?",
        options: [
          {
            text: 'GAL4 / + (driver alone)',
            correct: true,
            why: 'Right. GAL4 or its insertion can affect the phenotype even without the RNAi construct.',
          },
          {
            text: 'UAS-RNAi / + (responder alone)',
            correct: true,
            why: 'Right. The responder insertion or expression without the driver could affect the phenotype on its own.',
          },
          {
            text: 'A second, independent RNAi line against the same gene',
            correct: true,
            why: 'Right. A second RNAi construct helps test whether the phenotype comes from the target rather than another gene affected by one construct.',
          },
          {
            text: 'GAL4 > a neutral UAS (such as UAS-GFP or a control RNAi)',
            correct: true,
            why: 'Right. This checks the effects of expressing a UAS construct and of sharing GAL4 between two UAS copies.',
          },
          {
            text: 'Wild-type Canton-S only',
            why: 'Canton-S has a different genetic background, so differences could come from many genes rather than the experimental construct.',
          },
        ],
        explain:
          'Use all four comparisons with matched genetic backgrounds where possible. Add a rescue experiment that restores gene function, or check the result with a mutant allele.',
      },
      {
        type: 'predict',
        title: 'The experiment and its siblings',
        mother: 'w/w; +/+; GAL4/TM6B',
        father: 'w/Y; +/+; UAS-RNAi/UAS-RNAi',
        chroms: ['3'],
        traits: ['rnai', 'tubby'],
        decoys: ['Knockdown (GAL4 > RNAi), Tubby', 'No knockdown'],
        intro: 'GAL4/TM6B virgins × homozygous UAS-RNAi males. Predict the classes.',
        explain: 'Half are GAL4/UAS-RNAi (knockdown, normal body); half are TM6B/UAS-RNAi (Tubby, no GAL4, no knockdown).',
      },
      {
        type: 'choice',
        question: 'Why are the Tubby siblings from this cross a useful control?',
        options: [
          {
            text: 'They share parents, vial and conditions, and carry UAS-RNAi without GAL4',
            correct: true,
            why: 'Right. These siblings share parents and rearing conditions, but TM6B changes body shape, so use additional controls too.',
          },
          {
            text: 'They are genetically identical to the knockdown flies',
            why: 'They carry TM6B instead of GAL4. That genetic difference means they are not an identical control group.',
          },
          {
            text: 'Tubby flies never show phenotypes',
            why: 'Tubby itself changes body shape. Check that this does not affect your assay, and include other controls.',
          },
        ],
      },
      {
        type: 'text',
        title: 'What the model leaves out',
        body: [
          'GAL4 activity is stronger at 29 °C than at 18 °C. GAL80ts is a temperature-sensitive GAL4 repressor used to control when GAL4 is active.',
          "Measure knockdown with qPCR, which measures RNA, or with an antibody against the protein. Check the driver's pattern using GAL4 > UAS-GFP before relying on it.",
        ],
      },
      {
        type: 'go',
        title: 'Put a driver and a reporter together',
        body: ['Puzzle 3 in the Cross planner builds a stock carrying both a reporter and a driver, ready for one-cross experiments.'],
        action: { kind: 'planner', label: 'Open the Cross planner' },
      },
    ],
  },
  complementation: {
    title: 'Complementation and deficiency mapping',
    notation: 'diagram',
    steps: [
      {
        type: 'text',
        title: 'Same gene or different?',
        body: [
          'A screen found three mutations, mut¹, mut² and mut³, on chromosome 2. Each is kept over CyO. Each is recessive lethal: two copies kill the fly, while one copy has no visible effect.',
          'Cross two mutant lines so one fly carries both mutant chromosomes. If each supplies the working gene copy the other lacks, the fly lives: the mutations complement. If neither supplies the same essential function, the fly dies: they fail to complement.',
        ],
        diagrams: [
          { g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'mut¹ stock' },
          { g: 'w/Y; mut2/CyO; +/+', chroms: ['2'], caption: 'mut² stock' },
        ],
      },
      {
        type: 'predict',
        title: 'mut¹ × mut²',
        mother: 'w/w; mut/CyO; +/+',
        father: 'w/Y; mut2/CyO; +/+',
        chroms: ['2'],
        traits: ['curly'],
        intro: 'Suppose mut¹ and mut² are in different genes. Predict the offspring.',
        explain:
          'CyO/CyO dies. mut¹/CyO and CyO/mut² have Curly wings. mut¹/mut² survives because the mutations affect different genes; this straight-winged class shows complementation.',
      },
      {
        type: 'choice',
        question: 'If instead every adult from a cross like this is Curly, what does that mean?',
        options: [
          {
            text: 'The flies carrying both mutant chromosomes died, suggesting the mutations affect the same gene',
            correct: true,
            why: 'Right. Only the straight-winged class can carry both mutant chromosomes, and that class is missing.',
          },
          {
            text: 'The mutations complement',
            why: 'With complementation, a third of the adults would have straight wings. Their absence instead suggests failure to complement.',
          },
          {
            text: 'You scored too few flies to tell',
            why: 'You expect about a third of the adults to have straight wings. Finding none among dozens makes failure to complement likely.',
          },
        ],
      },
      {
        type: 'grid',
        title: 'Test all three',
        rows: ['mut', 'mut2', 'mut3'],
        cols: ['mut', 'mut2', 'mut3'],
        intro: 'Cross every pair, including each line with itself as a control. Click a cell to run a cross.',
        done: 'Each mutation fails only with itself. mut¹, mut² and mut³ therefore affect three different genes. The diagonal shows the expected failures for the self-cross controls.',
      },
      {
        type: 'text',
        title: 'Mapping with deficiencies',
        body: [
          'A deficiency, written Df, is a chromosome missing a stretch of DNA. A mutation fails to complement it when the missing stretch includes the required gene.',
          'Compare overlapping deletions to narrow the possible region. Then test candidate genes within that region.',
        ],
      },
      {
        type: 'grid',
        title: 'Map the mutations',
        rows: ['mut', 'mut2', 'mut3'],
        cols: ['Df1', 'Df2', 'Df3'],
        map: true,
        intro: 'Here are three overlapping deficiencies. Cross each mutation to each deficiency.',
        done: 'Keep the regions shared by all failing deficiencies. Exclude regions deleted by any deficiency that complements the mutation.',
      },
      {
        type: 'choice',
        question: 'Where is mut²?',
        options: [
          {
            text: 'In gene c: deleted by Df(2L)B and Df(2L)C, not by Df(2L)A',
            correct: true,
            why: 'Right. The failures with B and C place mut² in their overlap, while complementation with A rules out gene b.',
          },
          { text: 'In gene b', why: 'Df(2L)A also deletes gene b, but mut² complements Df(2L)A.' },
          { text: 'In gene d', why: 'Df(2L)C deletes gene d, but mut² also fails with Df(2L)B.' },
        ],
      },
      {
        type: 'choice',
        question: 'And mut³?',
        options: [
          {
            text: 'In gene d: only Df(2L)C deletes it',
            correct: true,
            why: 'Right. Failure with C alone places mut³ in the part deleted by C but not B.',
          },
          { text: 'In gene c', why: 'A mutation in gene c would also fail with Df(2L)B.' },
          {
            text: 'Outside all three deficiencies',
            why: 'A mutation outside all three deletions would complement all three. mut³ instead fails with Df(2L)C.',
          },
        ],
      },
      {
        type: 'choice',
        question: 'Deficiency mapping points to one candidate gene. What best shows that it is the gene?',
        options: [
          {
            text: 'Rescue: a transgene carrying the candidate gene restores viability',
            correct: true,
            why: 'Right. Restoring viability with a working copy tests the candidate gene directly, whereas mapping only narrows the region.',
          },
          {
            text: 'Test more deficiencies',
            why: 'More deficiencies can narrow the region, but a gene-specific test is needed to identify the cause.',
          },
          {
            text: 'Count more flies',
            why: 'The crosses have already narrowed the region. You now need evidence about the candidate gene itself.',
          },
        ],
      },
    ],
  },
  threepoint: {
    title: 'Three-point mapping',
    notation: 'both',
    model: [
      'Only sons are sampled. All three markers are fully visible, and every class has equal survival. The sample is chosen so parental and rare double-crossover classes are distinguishable. Sampling changes interval estimates from the reference values.',
    ],
    steps: [
      {
        type: 'text',
        title: 'Read one maternal X at a time',
        body: [
          'The mother carries yellow (y), crossveinless (cv) and vermilion (v) on one X, with normal copies on the other. Each son gets one maternal X and a paternal Y. His traits therefore show which maternal alleles he received.',
          "Score all eight combinations. A parental chromosome keeps the mother's starting alleles together. A single crossover exchanges one interval; a double crossover exchanges both. Use these classes to work out the gene order.",
        ],
      },
      {
        type: 'choice',
        question: 'Why score sons for this X-linked mapping cross?',
        options: [
          {
            text: 'A son has just one maternal X, so its recessive markers are exposed',
            correct: true,
            why: "Right. A son receives his father's Y, so the markers on his only X show the maternal allele combination.",
          },
          {
            text: 'Sons make more crossovers than daughters',
            why: 'These crossovers occurred while the mother made eggs. Drosophila males do not have meiotic crossovers.',
          },
          {
            text: 'The Y supplies normal copies of all three marker genes',
            why: 'The Y supplies no normal copies at these loci. This lets the maternal recessive markers show in sons.',
          },
        ],
      },
      {
        type: 'threepoint',
        title: 'Find the middle gene, then build the map',
        order: ['y', 'cv', 'v'],
        shown: ['cv', 'v', 'y'],
        phase: { y: true, cv: true, v: true },
        r: [0.137, 0.193],
        coc: 0.5,
        n: 2000,
        seed: 29,
        intro:
          'These are counts from 2,000 sons. Mark the two parental classes and the two double-crossover classes. Compare their alleles to find the middle gene. The columns are alphabetical, not map order.',
        explain:
          'Count each double-crossover son once in each interval. Coincidence is observed double crossovers divided by the expected count, calculated from the measured interval fractions. Interference is one minus coincidence.',
      },
      {
        type: 'choice',
        question:
          'Why does adding the two interval distances give a larger value than counting only recombinants between the outside genes?',
        options: [
          {
            text: 'Two exchanges restore the outside markers but still count in both intervals',
            correct: true,
            why: 'Right. The middle marker reveals two exchanges that leave the outside alleles in their parental arrangement.',
          },
          {
            text: 'The Y chromosome adds another map interval',
            why: "The intervals lie on the mother's X chromosomes. The son's Y adds no interval to that map.",
          },
          {
            text: 'Double-crossover sons should be discarded',
            why: 'Double-crossover chromosomes are recombinant in both intervals. Omitting them makes both distances too short.',
          },
        ],
      },
      {
        type: 'choice',
        question: 'A coefficient of coincidence below one tells you what?',
        options: [
          {
            text: 'Fewer double crossovers than expected if the intervals exchanged independently',
            correct: true,
            why: 'Right. The observed double-crossover count is below the expectation from the two interval fractions; this is positive interference.',
          },
          {
            text: 'No chromosome underwent a double crossover',
            why: 'A value between zero and one can include double crossovers. It means fewer than expected, not none.',
          },
          {
            text: 'The physical length of the X chromosome has decreased',
            why: 'This compares how often exchanges occur together. It does not measure physical chromosome length.',
          },
        ],
      },
    ],
  },
  mosaics: {
    title: 'FLP/FRT clones and twin spots',
    notation: 'both',
    model: [
      'The disc is a schematic tissue. Colour labels genotype, not fluorescence. Each successful event uses the segregation that makes two homozygous daughters. Other segregation outcomes, cell death and genotype-dependent growth are omitted. Heat-shock ages and event probabilities are teaching settings, not a laboratory protocol. A small sample does not give a calibrated laboratory success rate.',
    ],
    steps: [
      {
        type: 'text',
        title: 'Two homologs inside one dividing cell',
        body: [
          'The cell carries m on one chromosome arm and a normal allele on its partner. Each arm has an FRT DNA site between the centromere and the gene. After the chromosomes are copied, FLP recombinase can exchange the arms beyond those sites.',
          'With the required segregation, one daughter becomes m/m and the other +/+. Their descendants form a mutant clone and a twin spot, surrounded by m/+ tissue. These are cell lineages inside one fly, not offspring from a cross.',
        ],
      },
      {
        type: 'choice',
        question: 'What must be true of the chromosomes for this clone scheme to make m/m cells?',
        options: [
          {
            text: 'Matching FRT sites lie between the centromere and the mutation',
            correct: true,
            why: 'Right. Exchange at these sites can give a daughter two mutant arms, whereas a mutation on the centromere side would not become homozygous in this event.',
          },
          {
            text: 'One FRT site anywhere in the genome is enough',
            why: 'The copied partner chromosomes need matching FRT sites. Their position relative to m determines whether m/m daughters can form.',
          },
          {
            text: 'The starting fly must already be m/m throughout',
            why: 'The starting pair is m/+. Exchange can make m/m and +/+ cell patches while the surrounding tissue keeps the original pair.',
          },
        ],
      },
      {
        type: 'clones',
        title: 'Make a few large clones',
        seed: 17,
        goal: { minClones: 1, maxClones: 5, minLargest: 40 },
        intro:
          'Aim for one to five visible mutant clones, with a largest clone of at least 40 cells. Choose the induction age and strength, then inspect the disc.',
        explain:
          "Earlier exchange leaves more cell divisions for the clone to grow. Stronger induction makes exchange more likely; it does not directly increase a clone's size.",
      },
      {
        type: 'clones',
        title: 'Make many small clones',
        seed: 17,
        goal: { minClones: 8, maxMean: 12 },
        intro:
          'Now aim for at least eight visible mutant clones with a mean size no greater than 12 cells. Change the induction plan and compare independent discs.',
        explain:
          'Later induction reaches more dividing cells, but each new clone has fewer divisions left to grow. This favours many small patches.',
      },
      {
        type: 'choice',
        question: 'A mutant clone is smaller than its twin spot. Is reduced growth of m/m cells established?',
        options: [
          {
            text: 'Possibly; compare many twin spots with matched controls',
            correct: true,
            why: 'Right. Induction time, lineage growth and survival can also change patch size, so compare many matched mutant and twin patches.',
          },
          {
            text: 'Yes: twin spots must always contain exactly equal numbers of cells',
            why: 'The daughters inherit different chromosome arms, but they need not have identical growth histories.',
          },
          {
            text: 'No: the two patches have the same genotype',
            why: 'One patch is m/m and the other +/+. Their different genotypes are what makes the comparison useful.',
          },
        ],
      },
    ],
  },
  target: {
    title: 'GAL80ts: controlling time',
    notation: 'both',
    model: [
      'The simulation uses two temperatures and fixed stage lengths. GAL80ts switching, RNAi and protein turnover use simplified rates. Real experiments need measured rates for the constructs and target. The plot follows the RNAi target protein, not a UAS reporter.',
    ],
    steps: [
      {
        type: 'text',
        title: 'Keep the chromosomes, change their activity',
        body: [
          'The fly carries GAL4, UAS-RNAi and GAL80ts throughout the experiment. GAL80ts is a temperature-sensitive protein that blocks GAL4. Temperature changes this block without removing the transgenes.',
          'At 18 °C GAL80ts blocks GAL4. At 29 °C GAL4 can activate RNAi. GAL4 activity changes before existing target protein disappears. Temperature also changes how long development takes.',
        ],
      },
      {
        type: 'choice',
        question: 'Why can target protein remain after the RNAi-driving transgenes have been activated?',
        options: [
          {
            text: 'The switch takes time, and existing target protein must break down',
            correct: true,
            why: 'Right. Activating GAL4/UAS does not remove protein already present, so allow time for both switching and protein loss before the assay.',
          },
          {
            text: 'The UAS chromosome has to recombine with the GAL4 chromosome first',
            why: 'GAL4 can activate UAS on another chromosome. They do not need to recombine for RNAi to begin.',
          },
          {
            text: '29 °C deletes the GAL80ts chromosome',
            why: 'The chromosome stays in the fly. Temperature changes GAL80ts activity, and a cold shift can restore repression.',
          },
        ],
      },
      {
        type: 'target',
        title: 'Protect development, knock down in adults',
        intro:
          'Choose 18 or 29 °C for each stage. Keep target protein at or above 90% before adulthood. Then keep it at or below 20% throughout the final 48 hours of adult observation.',
        goal: {
          checks: [
            {
              stages: ['embryo', 'L1', 'L2', 'L3', 'pupa'],
              measure: 'protein',
              min: 0.9,
              text: 'Target protein ≥90% throughout development',
            },
            { stages: ['adult'], measure: 'protein', max: 0.2, last: 48, text: 'Target protein ≤20% in the final 48 adult hours' },
          ],
        },
        explain:
          'Starting RNAi after adults emerge protects development. Delay the adult assay until GAL4 is active and the target protein has fallen far enough.',
      },
      {
        type: 'target',
        title: 'A pupal pulse, then recovery',
        intro:
          'Keep target protein at or above 90% through larval development. Aim for at most 25% during the last 24 pupal hours, then at least 80% during the last 48 adult hours.',
        goal: {
          checks: [
            { stages: ['embryo', 'L1', 'L2', 'L3'], measure: 'protein', min: 0.9, text: 'Target protein ≥90% through larval development' },
            { stages: ['pupa'], measure: 'protein', max: 0.25, last: 24, text: 'Target protein ≤25% in the final 24 pupal hours' },
            { stages: ['adult'], measure: 'protein', min: 0.8, last: 48, text: 'Target protein ≥80% in the final 48 adult hours' },
          ],
        },
        explain:
          'At 18 °C, GAL80ts blocks GAL4 again, but target protein takes time to recover. Plan when to measure the effect as well as when to change temperature.',
      },
      {
        type: 'multi',
        question: 'Which comparisons help interpret a temperature-controlled RNAi phenotype?',
        options: [
          {
            text: 'Matched genetic controls under the same temperature schedule',
            correct: true,
            why: 'Right. Temperature-matched flies without the knockdown help separate RNAi effects from temperature and genetic-background effects.',
          },
          {
            text: 'An independent measure of target protein or knockdown in the intended window',
            correct: true,
            why: 'Right. Measure the target in the assay window, because inheriting the driver and responder does not establish when the protein changes.',
          },
          {
            text: 'Only the experimental genotype, because GAL80ts removes temperature effects',
            why: 'GAL80ts controls GAL4, not every effect of temperature on the fly. Include genetic and temperature controls.',
          },
        ],
        explain:
          'The genotype tells you which tools are present. Controls and a separate measurement show what those tools did during the assay.',
      },
    ],
  },
  screens: {
    title: 'Planning a genetic screen',
    notation: 'both',
    model: [
      'Hits follow a Poisson distribution. Dose labels are teaching settings, not recommended treatments. Each independent line has the same per-gene hit rate. Survival, recovery and gene size do not vary. Workload includes two maintenance vials per line, not the full cost of the screen.',
    ],
    steps: [
      {
        type: 'text',
        title: 'One independently mutagenised chromosome per line',
        body: [
          'Keep each mutagenised chromosome 2 over a balancer as a separate line. Siblings copy that founding chromosome. To search for new alleles, sample different founding chromosomes.',
          'Stronger mutagenesis gives more hits per chromosome. This can improve the chance of hitting your gene, but also produces more chromosomes carrying several lethal mutations. Plan how you will maintain and interpret those lines.',
        ],
        diagrams: [
          { g: 'w/w; mut/CyO; +/+', chroms: ['2'], caption: 'Each recovered chromosome is maintained as an independent balanced line' },
        ],
      },
      {
        type: 'choice',
        question: 'You score 5,000 sibling flies from one mutagenised chromosome. Is that equivalent to 5,000 independent lines?',
        options: [
          {
            text: 'No: they mostly resample copies of the same chromosome',
            correct: true,
            why: 'Right. Siblings inherit copies of one founding chromosome, so counting more of them does not add new chances to mutate another gene.',
          },
          {
            text: 'Yes: every fly has a newly mutagenised chromosome',
            why: 'The siblings inherit the founding chromosome. Counting each sibling does not create a new set of mutations.',
          },
          {
            text: 'Only if all the siblings carry the balancer',
            why: 'A balancer maintains a chromosome; it does not create new mutation events. Independent lines need different founding chromosomes.',
          },
        ],
      },
      {
        type: 'screen',
        title: 'Coverage with simple chromosomes',
        intro:
          'Aim for at least a 90% chance of finding an allele in your gene. No more than 35% of lethal lines may carry several lethal hits. You can maintain 5,000 independent lines.',
        goal: { minHit: 0.9, maxMulti: 0.35, maxLines: 5000 },
        explain:
          'A weaker treatment gives simpler chromosomes but needs more independent lines for coverage. Count founding chromosomes, not their siblings.',
      },
      {
        type: 'screen',
        title: 'A tighter fly room',
        intro:
          'Aim for at least 95% coverage with room for 3,500 independent lines. Up to 45% of lethal lines may carry several hits. Meet all three limits.',
        goal: { minHit: 0.95, maxMulti: 0.45, maxLines: 3500 },
        explain:
          'The strongest preset may give enough coverage but too many multiple-hit chromosomes. The weakest may need more lines than your room can hold.',
      },
      {
        type: 'choice',
        question: 'What does “multiple-hit share” mean in this planner?',
        options: [
          {
            text: 'Among chromosomes with at least one lethal hit, the share with two or more lethal hits',
            correct: true,
            why: 'Right. Count chromosomes with several lethal hits as a share of chromosomes with at least one lethal hit, not of all screened chromosomes.',
          },
          {
            text: 'The share of flies homozygous for the balancer',
            why: 'This counts mutations on a founding chromosome, not copies of the balancer in a fly.',
          },
          {
            text: 'The chance that the target gene is hit twice in one fly',
            why: 'This counts lethal hits across a chromosome. Target-gene coverage is a separate probability.',
          },
        ],
      },
      {
        type: 'choice',
        question: 'A screen has 95% predicted coverage. What does this tell you about the experiment?',
        options: [
          {
            text: 'It is a probability estimate that needs measured hit and recovery rates',
            correct: true,
            why: "Right. Check recovery, detection and the target gene's mutation rate before using the calculated probability to plan a real screen.",
          },
          {
            text: 'Exactly 95% of the recovered chromosomes will mutate the target gene',
            why: 'Coverage is the chance of finding at least one target allele. It is not the fraction of lines with that allele.',
          },
          {
            text: 'The first target allele must appear before the last planned line',
            why: 'Even a well-calibrated 95% design can miss the gene. Each independent line remains a chance event.',
          },
        ],
      },
    ],
  },
  diagnostic: {
    title: 'Quick check',
    notation: 'both',
    diagnostic: true,
    steps: [
      {
        type: 'choice',
        area: 'handling',
        question: 'Under the microscope, what tells you a fly is male?',
        options: [
          {
            text: 'Sex combs on the front legs',
            correct: true,
            why: 'Right. Sex combs on the forelegs identify a male, including a pale young male.',
          },
          { text: 'Pale colour', why: 'Young males and females can both be pale. Check the foreleg sex combs.' },
          { text: 'Larger size', why: 'Females are usually larger. Size alone does not identify a male; check the sex combs.' },
        ],
      },
      {
        type: 'choice',
        area: 'handling',
        question: 'Why collect virgins within about 8 hours of clearing a vial (at 25 °C)?',
        options: [
          {
            text: 'Females do not mate for about 8 hours after eclosion',
            correct: true,
            why: 'Right. The clearing record supports collecting these young females as virgins.',
          },
          {
            text: 'Males die after 8 hours',
            why: 'Males live for weeks. The collection window concerns mating maturity, not the males dying.',
          },
          {
            text: 'The food dries out',
            why: 'The collection rule uses the period before mating, about 8 hours after eclosion, when the adult emerges from its pupa.',
          },
        ],
      },
      {
        type: 'choice',
        area: 'inheritance',
        question: 'CyO/+ × CyO/+: what share of the adults are Curly?',
        options: [
          { text: '2/3', correct: true, why: 'Right. CyO/CyO dies, leaving 2 Curly : 1 straight among adults.' },
          { text: '3/4', why: 'That forgets that CyO/CyO dies.' },
          { text: '1/2', why: 'CyO/+ occurs twice, +/+ once, and CyO/CyO dies. Count only surviving combinations.' },
        ],
      },
      {
        type: 'choice',
        area: 'inheritance',
        question: 'w/w females × +/Y males: what eye colour are the sons?',
        options: [
          { text: 'White', correct: true, why: 'Right. A son gets his only X, carrying w, from his mother.' },
          { text: 'Red', why: "A son gets his father's Y. His mother's w-bearing X has no normal white copy to mask it." },
          { text: 'Half red, half white', why: 'Both maternal Xs carry w, so every son inherits w.' },
        ],
      },
      {
        type: 'choice',
        area: 'advanced',
        question: 'A cross gives 70 Curly : 30 straight. You test 3:1 and get χ² = 1.33 (critical value 3.84). What can you say?',
        options: [
          {
            text: 'The counts are consistent with 3:1, but that does not prove it',
            correct: true,
            why: 'Right. Failing to reject a ratio does not prove that ratio is correct.',
          },
          {
            text: 'The ratio is 3:1',
            why: 'The counts also fit 2:1 (χ² = 0.5). The test cannot establish one ratio just because it fits.',
          },
          { text: 'The ratio is not 3:1', why: 'χ² is below the rejection threshold, so these counts do not reject 3:1.' },
        ],
      },
      {
        type: 'choice',
        area: 'stocks',
        question: 'What stops a balancer recombining with its partner chromosome?',
        options: [
          { text: 'Its inversions', correct: true, why: 'Right. Inversions suppress the recovery of recombinant chromosomes.' },
          { text: 'Its dominant marker', why: 'The marker identifies the chromosome. Its inversions suppress recovered recombinants.' },
          {
            text: 'Being lethal when homozygous',
            why: 'Homozygous lethality maintains the stock. Inversions suppress recovered recombinants.',
          },
        ],
      },
    ],
  },
};

Object.assign(LESSON_CONTENT, ADDITIONAL_LESSONS, SPECIALIST_LESSONS);
for (const [id, lesson] of Object.entries(LESSON_CONTENT)) if (!lesson.diagnostic) LESSON_CONTENT[id] = scaffoldLesson(id, lesson);

/** After the quick check: where to start, from the first area with a wrong answer. */
export function recommendStart(answers) {
  const steps = LESSON_CONTENT.diagnostic.steps;
  const missed = (area) => steps.some((s, i) => s.area === area && !answers[i]);
  if (missed('handling')) return 'tour';
  if (missed('inheritance')) return 'foundations';
  if (missed('stocks')) return 'balancers';
  if (missed('advanced')) return 'chance';
  return 'recombination';
}
