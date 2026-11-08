// Interactive genetics lessons. Every answer a lesson checks is computed by the
// genetics engine (gametes, progeny classes, viability), so lessons cannot drift
// from the biology. Step types: text, choice, gametes, predict, pick, go.

import { parseGenotype, offspring, phenotype, isViable, chromGametes, isMale } from './genetics/genetics.js';
import { ORDER } from './chromosomes.js';

// ---- engine helpers (pure, tested) ----------------------------------------------

const TRAIT = {
  curly: { yes: 'Curly wings', no: 'straight wings' },
  scutoid: { yes: 'Scutoid' },
  stubble: { yes: 'Stubble' },
  humeral: { yes: 'Humeral' },
  tubby: { yes: 'Tubby' },
};
const EYE = { red: 'red eyes', white: 'white eyes', orange: 'orange eyes', darkorange: 'dark orange eyes' };

/** Short visible description using only the traits a step is about. */
export function describe(ph, traits) {
  const words = [];
  for (const t of traits) {
    if (t === 'eye') words.push(EYE[ph.eye]);
    else if (ph[t]) words.push(TRAIT[t].yes);
    else if (TRAIT[t].no) words.push(TRAIT[t].no);
  }
  return words.length ? words.join(', ') : 'no dominant markers';
}

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Progeny classes of a cross as a learner would score them: [{ label, p, members }],
 * shares of the surviving adults, plus `dead` (share of zygotes that die).
 */
export function classesFor(mother, father, { traits, bySex = false }) {
  const { progeny, dead } = offspring(parseGenotype(mother), parseGenotype(father));
  const rows = new Map();
  for (const o of progeny) {
    let label = describe(phenotype(o.g), traits);
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
    let label = describe(phenotype(z), traits);
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
        body: ['Female flies have two X chromosomes. Males have one X and a Y. The Y makes a fly male but carries almost no genes, and nothing for eye colour.',
          'The white gene sits on the X. Its recessive mutation, w, gives white eyes when a fly has no normal copy. From here on the course also shows the shorthand geneticists write: try the Diagram / Notation / Both switch at the top.'],
        diagrams: [{ g: 'w/w; +/+; +/+', chroms: ['X'], caption: 'A white-eyed female: w/w' }, { g: '+/Y; +/+; +/+', chroms: ['X'], caption: 'A red-eyed male: +/Y' }] },
      { type: 'choice', question: 'A son gets his only X chromosome from…',
        options: [
          { text: 'His mother', correct: true, why: 'Right. His father gave him the Y; that is what made him male.' },
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
  return 'planner';
}
