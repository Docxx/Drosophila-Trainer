// Visual teaching examples. They explain mechanisms without reading exercise
// answers or revealing an unknown stock. Chromosome positions are schematic.
import { esc } from './chromosomes.js';

export const VISUAL_GUIDES = {
  inheritance: {
    title: 'Follow a chromosome into the next generation',
    frames: [
      ['Two homologs', 'A diploid parent has two homologs of this chromosome, carrying A and a. Only one chromosome pair is shown.'],
      ['Separate into gametes', 'Meiosis separates the homologs. Each gamete receives one member of the pair.'],
      ['Fertilisation', 'Here either kind of egg can meet a sperm carrying a. Follow each chromosome’s label and colour.'],
      ['Restore the pair', 'The offspring receives one homolog from each parent: A/a or a/a in this example.'],
    ],
  },
  xlinked: {
    title: 'Trace the X from mother to offspring',
    frames: [
      ['Parental chromosomes', 'Example: an Xᴬ/Xᵃ mother and Xᴬ/Y father. A is a functional allele; a is recessive.'],
      [
        'Follow one maternal egg',
        'We follow an egg carrying Xᵃ. The father can contribute Xᴬ or Y. The other maternal egg type is not shown.',
      ],
      ['Two possible offspring', 'With paternal Xᴬ, this egg makes an Xᵃ/Xᴬ daughter. With paternal Y, it makes an Xᵃ/Y son.'],
      [
        'Read the allele copies',
        'The daughter has a functional A copy; the son has only a at this locus. The Y does not provide a normal allele here. This example uses usual XX/XY flies.',
      ],
    ],
  },
  balancers: {
    title: 'Keep a lethal chromosome in a stock',
    frames: [
      [
        'A recessive lethal',
        'The mutation m is carried on one homolog. An m/+ fly survives because the other homolog supplies a functional copy.',
      ],
      [
        'Pair it with a balancer',
        'In this teaching example, Bal carries a visible dominant marker and is lethal when homozygous. Its inversions suppress recovery of recombinants.',
      ],
      [
        'Transmit whole chromosomes',
        'The simplified model transmits m or Bal without recombination between them. Real balancers are not absolute barriers to exchange.',
      ],
      [
        'Cross two carriers',
        'For m/Bal × m/Bal, m/m and Bal/Bal die. Surviving m/Bal carriers retain the lethal chromosome and the visible marker.',
      ],
    ],
  },
  chance: {
    title: 'From chromosome probabilities to counts',
    frames: [
      ['A chromosome pair', 'For this example, follow transmission of A or a from an A/a parent.'],
      [
        'Equal probabilities',
        'Each gamete has a 1/2 chance of receiving either homolog. Probability describes repeated events, not a fixed quota.',
      ],
      [
        'A small sample',
        'An illustrative sample has 12 A and 8 a transmissions. Chance can move a small sample away from its expected 1:1 ratio.',
      ],
      [
        'A larger sample',
        'Here 104 of 200 transmissions carry A. Compare relative deviations: larger samples usually vary less in proportion. A close fit does not prove a hypothesis.',
      ],
    ],
  },
  recombination: {
    title: 'Watch a crossover exchange chromosome segments',
    frames: [
      [
        'Replicated homologs',
        'A female has homologs AB and ab. Each has replicated into two sister chromatids; the four bars are chromatids.',
      ],
      [
        'Exchange between non-sisters',
        'Two non-sister chromatids exchange corresponding segments between A and B. The other two do not participate in this event.',
      ],
      [
        'Read the products',
        'This single crossover produces two parental chromatids, AB and ab, and two recombinant chromatids, Ab and aB.',
      ],
      [
        'Score gametes',
        'Gametes receive individual products of meiosis. Recombinant counts estimate exchange frequency; not every meiosis has the single crossover illustrated here. Drosophila males do not have meiotic crossovers.',
      ],
    ],
  },
  gal4uas: {
    title: 'Assemble a genetic expression switch',
    frames: [
      [
        'Two DNA components',
        'The driver carries GAL4; the responder carries UAS linked to an output gene. Insertion sites are unspecified.',
      ],
      ['Make the activator', 'The driver produces GAL4 protein in its expression pattern. GAL4 can bind the responder’s UAS sequence.'],
      [
        'Activate the output',
        'When both components are present and active in the same cell, GAL4 drives expression of the UAS-linked output.',
      ],
      [
        'Compare controls',
        'Driver alone and responder alone lack one component. Compare them with the combined genotype; additional controls depend on the experiment.',
      ],
    ],
  },
  complementation: {
    title: 'Ask whether a functional gene copy remains',
    frames: [
      [
        'Two recessive mutations',
        'Each chromosome carries a loss-of-function mutation. The question is which gene each mutation disrupts.',
      ],
      [
        'Different genes',
        'In a⁻ b⁺ / a⁺ b⁻, each gene has a functional copy on the other homolog. The mutations complement in this simplified example.',
      ],
      ['The same gene', 'In a¹ b⁺ / a² b⁺, neither homolog provides functional a. These two recessive alleles fail to complement.'],
      [
        'Interpret the cross',
        'Complementation tests gene function, not whether two DNA changes are identical. This example assumes recessive loss-of-function alleles without unusual interactions.',
      ],
    ],
  },
  threepoint: {
    title: 'See why a third marker exposes two exchanges',
    frames: [
      [
        'An example chromosome order',
        'Separate demonstration: the known order here is A–B–C, with homologs ABC and abc. These are not the exercise’s marker identities or answer.',
      ],
      [
        'Two exchanges',
        'After replication, the same two non-sister chromatids exchange once in each interval. This illustrates one kind of double crossover.',
      ],
      [
        'Compare parental and DCO',
        'ABC becomes AbC; abc becomes aBc. The outside alleles keep their parental arrangement, while the middle allele changes.',
      ],
      [
        'Count both intervals',
        'Each double-crossover product is recombinant in A–B AND B–C. Include it once in each interval total; an outside-marker-only score misses these two exchanges.',
      ],
    ],
  },
  mosaics: {
    title: 'From chromosome exchange to a clone',
    frames: [
      ['A heterozygous cell', 'Start with an m/+ chromosome-arm pair. The FRT site lies between the centromere and the mutation.'],
      ['Mitotic recombination', 'After replication, FLP can induce exchange between matching FRT sites on non-sister chromatids.'],
      [
        'Reciprocal daughters',
        'The segregation illustrated here gives m/m and +/+ daughters. Other segregation outcomes need not produce homozygous twins.',
      ],
      [
        'Expand the lineages',
        'Further divisions expand the two daughter lineages into neighbouring patches. Earlier induction leaves more divisions for expansion; colour labels genotype, not microscope fluorescence.',
      ],
    ],
  },
  target: {
    title: 'Separate a temperature shift from its biological effect',
    frames: [
      ['Keep the DNA', 'The same fly retains GAL4, UAS-RNAi and GAL80ts. Temperature changes activity, not which transgenes it carries.'],
      ['Repress at 18 °C', 'Active GAL80ts represses GAL4. The target protein can be maintained while RNAi expression is suppressed.'],
      [
        'Shift to 29 °C',
        'Repression is relieved and GAL4 activates RNAi. Existing target protein remains at first; a temperature shift is not an instant knockout.',
      ],
      [
        'Wait for protein turnover',
        'RNAi reduces new target-protein production. Existing protein turns over, so depletion lags behind activation. The time course depends on the construct and protein.',
      ],
    ],
  },
  screens: {
    title: 'Connect independent chromosomes to screen coverage',
    frames: [
      [
        'Maintain one chromosome',
        'A mutagenised chromosome is maintained over a balancer. One independent chromosome defines one line in this model.',
      ],
      [
        'Build independent lines',
        'Each new independently mutagenised chromosome adds another opportunity to recover an allele. Duplicating the same chromosome does not add independence.',
      ],
      [
        'Find a target-gene allele',
        'A target-gene allele may appear among many lines. More independent lines increase its recovery probability; they never guarantee it.',
      ],
      [
        'Check mutation burden',
        'Stronger mutagenesis can place several mutations on one chromosome. Balance coverage against interpretation and the vials needed to maintain the lines.',
      ],
    ],
  },
};

// Beginner concepts are selected by the lesson step, not just its chapter.
Object.assign(VISUAL_GUIDES, {
  chromosomes: {
    title: 'Zoom from a fly to a gene',
    frames: [
      [
        'Fly → body cell',
        'A fly is made of cells. In a typical diploid body cell, the nucleus contains the chromosomes. The sizes here are schematic.',
      ],
      [
        'Four chromosome pairs',
        'This female cell has four pairs: X, 2, 3 and the tiny 4. That is eight chromosomes: one homolog of each pair originally came from each parent.',
      ],
      [
        'Gene and allele',
        'A gene occupies a locus on a chromosome. Homologs carry the same loci; A and a are different versions, or alleles, of one gene. A bar is a chromosome, not a single gene.',
      ],
      [
        'One from every pair',
        'Meiosis produces gametes with one chromosome from each pair: four chromosomes, not four pairs. The course often draws only the pairs relevant to a cross.',
      ],
    ],
  },
  dominance: {
    title: 'Connect the chromosome pair to the visible fly',
    frames: [
      [
        'Read the two homologs',
        'CyO names a balancer chromosome. It carries the dominant Curly marker; + denotes a normal homolog in this example.',
      ],
      [
        'One copy can show',
        'A CyO/+ fly has one Curly-bearing chromosome 2 and one normal homolog. One copy of the dominant marker is sufficient for the Curly phenotype.',
      ],
      [
        'Compare the normal pair',
        'A +/+ fly has no Curly-bearing chromosome. Compare its straight wings with the schematic Curly wing shape.',
      ],
      [
        'Genotype → phenotype',
        'Genotype describes the chromosome combination. Phenotype describes an observable trait. Dominant means visible with one copy here; it does not mean stronger, more common or necessarily beneficial.',
      ],
    ],
  },
  fertilisation: {
    title: 'Build offspring one egg–sperm combination at a time',
    frames: [
      [
        'Start with the parents',
        'Separate example: an A/a mother is crossed to an a/a father. Follow just this chromosome pair; no dominance or lethality is assumed.',
      ],
      [
        'Separate their gametes',
        'The mother can contribute A or a. The father contributes a in either case. A gamete contains one chromosome from this pair.',
      ],
      [
        'Join one egg and one sperm',
        'Either egg type can meet an a-carrying sperm. Fertilisation restores two homologs, one from each parent.',
      ],
      [
        'Read the combinations',
        'The possible offspring genotypes are A/a and a/a. Each has probability one half in this model, although a finite vial need not contain exact halves.',
      ],
    ],
  },
  assortment: {
    title: 'Choose one chromosome from EACH pair',
    frames: [
      [
        'Two different pairs',
        'This example parent is A/a on one chromosome pair and B/b on another. Letters identify alleles; the two pairs sort independently in the model.',
      ],
      [
        'Choose from pair 1',
        'One homolog of the A/a pair enters each gamete. Choosing A or a does not decide which chromosome the B/b pair contributes.',
      ],
      [
        'Choose from pair 2',
        'For either first choice, B or b is possible. Each gamete must receive one chromosome from both pairs, not two from one pair.',
      ],
      [
        'Four combinations',
        'AB, Ab, aB and ab are four possible gamete types, each with probability one quarter here. Independent assortment applies to different chromosome pairs, not automatically to two genes on the same chromosome.',
      ],
    ],
  },
  lethals: {
    title: 'Count fertilised eggs, then count surviving adults',
    frames: [
      [
        'A separate model cross',
        'Here M is a visible dominant marker whose chromosome is lethal in two copies. Cross M/+ to M/+. This is a worked teaching example, not an unknown stock.',
      ],
      [
        'Four egg–sperm combinations',
        'Each parent contributes M or +. The four equally likely combinations are M/M, M/+, +/M and +/+. The two mixed orders have the same genotype.',
      ],
      ['Apply viability', 'M/M does not survive in this example. Both M/+ combinations and the +/+ combination can contribute adults.'],
      [
        'Change the denominator',
        'Among surviving adults, two of the three viable combinations carry the marker. The expected adult ratio is 2:1, not the 3:1 obtained when all genotypes survive.',
      ],
    ],
  },
  'x-copies': {
    title: 'Count functional copies at an X-linked locus',
    frames: [
      [
        'Usual XX and XY flies',
        'An XX female has two X homologs. An XY male has one X and a Y. In Drosophila the Y is needed for normal male fertility, not sex determination.',
      ],
      [
        'Locate the gene',
        'This example locus is on the X. The Y has no matching functional copy of this gene. Do not treat a Y as another allele at the X-linked locus.',
      ],
      [
        'A recessive allele in a female',
        'For this recessive loss-of-function example, an Xᴬ/Xᵃ female has a functional A copy. Xᵃ/Xᵃ has no functional A copy at this locus.',
      ],
      [
        'A single X in a male',
        'An Xᵃ/Y male has only a at this locus. Its recessive effect is exposed because there is no functional A copy on a second X.',
      ],
    ],
  },
  'sex-gametes': {
    title: 'Follow X chromosomes into eggs and sperm',
    frames: [
      [
        'Look at the chromosome pairs',
        'This example uses an Xᵃ/Xᵃ female and an Xᴬ/Y male. Both eggs and sperm receive one sex chromosome, not the whole pair.',
      ],
      [
        'The male makes X or Y sperm',
        'His Xᴬ and Y segregate. Half the sperm carry Xᴬ and half carry Y in the model. A sperm does not carry both together.',
      ],
      [
        'The female contributes X',
        'Both of this female’s X homologs carry a, so every egg has the same allele at this locus even though it receives just one of her X chromosomes.',
      ],
      [
        'Keep copy count separate from variety',
        'One chromosome per gamete does not mean only one gamete type. Different homologs can give different types; identical alleles can give the same scored type.',
      ],
    ],
  },
  reciprocal: {
    title: 'See what changes when the sexes of the parents swap',
    frames: [
      [
        'First direction',
        'Separate example: Xᵃ/Xᵃ mother × Xᴬ/Y father. A is functional and a is recessive. Track the maternal X and the paternal X or Y.',
      ],
      [
        'Follow their offspring',
        'The daughters receive paternal Xᴬ and maternal Xᵃ; sons receive maternal Xᵃ and paternal Y. The sons lack functional A at this locus.',
      ],
      [
        'Reverse the parental sexes',
        'Now cross Xᴬ/Xᴬ mothers to Xᵃ/Y fathers. The mother contributes Xᴬ to every offspring, including every son.',
      ],
      [
        'Compare the directions',
        'Both daughters and sons in the reversed cross have a functional A copy. For an X-linked gene, a reciprocal cross can change the outcome because fathers pass their X only to daughters in these usual XX/XY crosses.',
      ],
    ],
  },
  'male-meiosis': {
    title: 'Watch male transmission without crossing over',
    frames: [
      [
        'Two parental homologs',
        'This male carries AB on one homolog and ab on the other. These two genes lie on the same chromosome pair in this example.',
      ],
      [
        'Copy before segregation',
        'The homologs replicate into sister chromatids before meiosis. Replication copies the existing allele arrangements; it does not combine AB with ab.',
      ],
      [
        'No meiotic exchange',
        'Drosophila males do not undergo meiotic crossing over. The parental arrangements remain intact as the chromatids segregate.',
      ],
      [
        'Two scored sperm types',
        'Sperm carry either AB or ab. Ab and aB recombinant types are not generated by meiotic crossing over in this male.',
      ],
    ],
  },
  'balancer-transmission': {
    title: 'Follow a chromosome beside a balancer',
    frames: [
      [
        'Keep the homologs distinct',
        'A fly carries an insertion-bearing chromosome G beside a balancer Bal. G is an insertion label here, not a recessive lethal mutation.',
      ],
      [
        'Recognise the balancer',
        'The balancer’s inversion pattern and visible marker help maintain and follow the paired chromosome. The drawing is a symbol for inversions, not a literal DNA map.',
      ],
      [
        'Use the teaching-model rule',
        'This course model recovers the intact G or Bal chromosome, without recombinant products from this pair. Real balancers suppress recovery of recombinants rather than making all exchange physically impossible.',
      ],
      [
        'Read the gamete types',
        'The gametes scored by the model carry G or Bal. Bal does not copy, repair or replace G; the homologs remain different chromosomes.',
      ],
    ],
  },
});

Object.assign(VISUAL_GUIDES, {
  'life-cycle': {
    title: 'Follow a vial through the life cycle',
    frames: [
      ['Egg', 'Adults lay eggs. A collection or cross record must distinguish the parents from the generation developing in the vial.'],
      [
        'Larva',
        'Larvae hatch, feed and grow through three instars. A vial can contain developing offspring even when no new adults are visible.',
      ],
      ['Pupa', 'Larvae leave the food and pupate. Metamorphosis precedes adult eclosion; a pupa is not a newly collected adult.'],
      [
        'Adult',
        'New adults eclose. Record clearing and collection history to establish a collection interval. Development and sexual maturity depend on conditions; colour alone cannot establish virginity.',
      ],
    ],
  },
  marcm: {
    title: 'MARCM: mark the clone that loses repression',
    frames: [
      [
        'Repress the reporter',
        'The starting heterozygous cell carries matching FRT sites, the mutation on one homolog and GAL80 on the other. GAL4 and UAS-GFP are also present, but GAL80 represses expression.',
      ],
      [
        'Induce exchange',
        'FLP-mediated mitotic recombination at matching FRT sites can produce informative reciprocal daughter lineages. The mutation and GAL80 lie distal to the FRT site in this schematic.',
      ],
      [
        'Lose GAL80 in one daughter',
        'With the informative segregation shown, m/m cells no longer carry GAL80. The reciprocal +/+ lineage retains GAL80. Other segregation outcomes do not yield this marked mutant pair.',
      ],
      [
        'Read the marked clone',
        'Where the driver is active, the m/m lineage can express UAS-GFP after losing repression. Fluorescence identifies a lineage in this designed system; it does not by itself establish a causal biological effect.',
      ],
    ],
  },
  maternal: {
    title: 'Separate maternal supply from the embryo’s genotype',
    frames: [
      [
        'Maternal supply',
        'A heterozygous mother can supply functional RNA or protein to developing eggs. That supply is different from the allele the egg inherits.',
      ],
      [
        'Mutant zygote, maternal product',
        'An m/m embryo can initially retain maternal product from a mother carrying a functional copy. An early normal appearance therefore need not show that the gene is dispensable.',
      ],
      [
        'Mutant germline clone',
        'A homozygous mutant germline clone can produce eggs without the normal product of that gene, if the relevant oogenesis and survival requirements permit it. The mother’s somatic genotype need not be homozygous mutant.',
      ],
      [
        'Compare maternal and zygotic contributions',
        'Follow the paternal allele as well as the maternal supply. A functional paternal allele can contribute zygotic expression later; compare the relevant genotypes and developmental windows rather than calling all embryos equivalent.',
      ],
    ],
  },
});

const amber = '#efb95f',
  blue = '#88ccec',
  purple = '#c89bdc',
  green = '#93d5a5';
const text = (x, y, label, cls = '', anchor = 'middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(label)}</text>`;
const label = (x, y, title, subtitle = '') => text(x, y, title, 'scene-title') + (subtitle ? text(x, y + 24, subtitle, 'scene-note') : '');
const arrow = (x1, y1, x2, y2, active = true) =>
  `<path class="scene-arrow ${active ? 'active-flow' : ''}" d="M${x1} ${y1} L${x2} ${y2}" marker-end="url(#guide-arrow)"/>`;
const cell = (x, y, r = 67, colour = '#304653') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${colour}" fill-opacity=".28" stroke="${colour}" stroke-width="2"/>`;
function chrom(x, y, alleles, colour = amber, { from = 0, balancer = false } = {}) {
  return `<g transform="translate(${x} ${y})"><g class="scene-token" style="--travel:${from}px"><rect x="-72" y="-13" width="144" height="26" rx="13" fill="${colour}"/>${balancer ? '<path d="M-55 -8l15 16 15-16 15 16 15-16 15 16 15-16 15 16" fill="none" stroke="#252737" stroke-width="3"/>' : ''}${text(0, 5, alleles, 'scene-alleles')}</g></g>`;
}
const pair = (x, y, a, b, ca = amber, cb = blue) =>
  chrom(x, y - 20, a, ca, { balancer: a === 'Bal' }) + chrom(x, y + 20, b, cb, { balancer: b === 'Bal' });
const protein = (x, y, colour = green, ghost = false) =>
  `<circle class="scene-protein ${ghost ? 'protein-ghost' : ''}" cx="${x}" cy="${y}" r="7" fill="${colour}"/>`;

function inheritance(frame) {
  if (frame === 0)
    return (
      cell(450, 168, 85) +
      pair(450, 168, 'A', 'a') +
      label(450, 54, 'One chromosome pair', 'Homologs carry the same loci') +
      text(450, 294, 'A and a label different alleles of one gene.', 'scene-note')
    );
  const xs = [250, 650];
  return (
    xs
      .map(
        (x, i) =>
          cell(x, 168, frame >= 3 ? 85 : 67) +
          chrom(x, frame >= 3 ? 148 : 168, i ? 'a' : 'A', i ? blue : amber, { from: i ? -200 : 200 }) +
          (frame >= 3 ? chrom(x, 188, 'a', purple) : '') +
          label(x, 54, frame >= 3 ? `Offspring ${i ? 'a/a' : 'A/a'}` : `Egg carrying ${i ? 'a' : 'A'}`) +
          (frame === 2 ? cell(x + 110, 235, 37, purple) + text(x + 110, 240, 'a', 'scene-white') + arrow(x + 100, 208, x + 48, 180) : ''),
      )
      .join('') +
    text(
      450,
      300,
      frame >= 3
        ? 'One chromosome from the egg + one from the sperm'
        : frame === 2
          ? 'Both eggs can meet a sperm carrying a (purple).'
          : 'Alternative gamete types: one homolog per pair',
      'scene-note',
    )
  );
}
function xlinked(frame) {
  if (frame === 0)
    return (
      cell(250, 175, 88) +
      pair(250, 175, 'Xᴬ', 'Xᵃ') +
      label(250, 48, 'Mother · Xᴬ/Xᵃ') +
      cell(650, 175, 88) +
      pair(650, 175, 'Xᴬ', 'Y', purple, purple) +
      label(650, 48, 'Father · Xᴬ/Y')
    );
  if (frame === 1)
    return (
      cell(230, 170) +
      chrom(230, 170, 'Xᵃ', blue, { from: 120 }) +
      label(230, 48, 'One possible egg') +
      [560, 760]
        .map((x, i) => cell(x, 170, 67, purple) + chrom(x, 170, i ? 'Y' : 'Xᴬ', purple) + label(x, 48, i ? 'Y sperm' : 'X sperm'))
        .join('') +
      text(450, 295, 'The other possible maternal egg carries Xᴬ; it is not followed here.', 'scene-note')
    );
  return [270, 650]
    .map(
      (x, i) =>
        cell(x, 168, 87) +
        pair(x, 168, 'Xᵃ', i ? 'Y' : 'Xᴬ', blue, purple) +
        label(x, 48, i ? 'Son · Xᵃ/Y' : 'Daughter · Xᵃ/Xᴬ') +
        (frame === 3 ? text(x, 293, i ? 'No functional A copy at this locus' : 'Functional A supplied by paternal X', 'scene-note') : ''),
    )
    .join('');
}
function balancers(frame) {
  if (frame < 2)
    return (
      cell(450, 169, 90) +
      chrom(450, 149, 'm', amber) +
      chrom(450, 189, frame ? 'Bal' : '+', frame ? purple : blue, { balancer: !!frame }) +
      label(450, 44, frame ? 'Maintain m over Bal' : 'Carry m over a functional homolog') +
      text(
        450,
        300,
        frame
          ? 'Bal: visible marker + inversions + homozygous lethal in this example'
          : 'm is recessive lethal; this m/+ carrier survives.',
        'scene-note',
      )
    );
  if (frame === 2)
    return (
      [270, 650]
        .map(
          (x, i) =>
            cell(x, 170) +
            chrom(x, 170, i ? 'Bal' : 'm', i ? purple : amber, { from: i ? -180 : 180, balancer: !!i }) +
            label(x, 48, i ? 'Gamete carrying Bal' : 'Gamete carrying m'),
        )
        .join('') + text(450, 300, 'Follow the mutation chromosome and the balancer as distinct units.', 'scene-note')
    );
  return [210, 450, 690]
    .map(
      (x, i) =>
        cell(x, 170, 87, i === 1 ? green : '#9d6262') +
        pair(x, 170, i === 2 ? 'Bal' : 'm', i === 0 ? 'm' : 'Bal', i === 2 ? purple : amber, i === 0 ? amber : purple) +
        label(x, 45, ['m/m', 'm/Bal', 'Bal/Bal'][i]) +
        text(x, 296, i === 1 ? 'Survives · visible marker' : 'Homozygous lethal', 'scene-note'),
    )
    .join('');
}
function chance(frame) {
  if (frame < 2)
    return (
      cell(270, 175, 85) +
      pair(270, 175, 'A', 'a') +
      arrow(370, 175, 495, 175) +
      (frame
        ? chrom(650, 130, 'A · probability ½', amber) + chrom(650, 220, 'a · probability ½', blue)
        : label(650, 170, 'Which homolog enters a gamete?')) +
      label(450, 45, frame ? 'Probability is not a quota' : 'Transmission from A/a')
    );
  const n = frame === 2 ? 20 : 200,
    a = frame === 2 ? 12 : 104,
    cols = frame === 2 ? 10 : 25;
  return (
    label(450, 40, `${a} A transmissions in a sample of ${n}`, 'Illustrative independent draws') +
    Array.from(
      { length: n },
      (_, i) =>
        `<circle class="scene-dot" style="--delay:${i * (frame === 2 ? 24 : 2)}ms" cx="${frame === 2 ? 225 + (i % cols) * 50 : 150 + (i % cols) * 25}" cy="${100 + Math.floor(i / cols) * (frame === 2 ? 52 : 18)}" r="${frame === 2 ? 15 : 5.5}" fill="${i < a ? amber : blue}"/>`,
    ).join('') +
    text(450, 285, `A: ${a} (${Math.round((a / n) * 100)}%)    ·    a: ${n - a}    ·    Expected A share: 50%`, 'scene-note')
  );
}
// Segment colours retain parental origin after exchange; labels carry meaning
// even when colour is not distinguishable.
function markedChrom(x, y, alleles, colours, width = 160, from = 0) {
  const size = width / alleles.length;
  return `<g transform="translate(${x} ${y})"><g class="scene-token" style="--travel:${from}px">${alleles.map((a, i) => `<rect x="${-width / 2 + i * size}" y="-13" width="${size}" height="26" rx="4" fill="${colours[i]}"/>${text(-width / 2 + (i + 0.5) * size, 5, a, 'scene-alleles')}`).join('')}</g></g>`;
}
function exchange(frame, three = false) {
  const top = three ? ['A', 'B', 'C'] : ['A', 'B'],
    bottom = three ? ['a', 'b', 'c'] : ['a', 'b'];
  if (frame < 2) {
    const strands = [top, top, bottom, bottom]
      .map((a, i) =>
        markedChrom(
          450,
          98 + i * 48,
          a,
          a.map(() => (i < 2 ? amber : blue)),
          440,
        ),
      )
      .join('');
    return (
      label(
        450,
        38,
        frame
          ? three
            ? 'Exchange in each interval on the same two non-sisters'
            : 'Exchange between non-sister chromatids'
          : 'Replicated maternal homologs',
      ) +
      strands +
      (frame
        ? `<rect x="${three ? 345 : 420}" y="126" width="${three ? 210 : 95}" height="88" rx="10" fill="#c89bdc" fill-opacity=".09" stroke="${purple}" stroke-dasharray="4 4"/>
        <path class="exchange-path" d="M${three ? 357 : 432} 146 C${three ? 380 : 455} 146 ${three ? 380 : 455} 194 ${three ? 403 : 478} 194 M${three ? 357 : 432} 194 C${three ? 380 : 455} 194 ${three ? 380 : 455} 146 ${three ? 403 : 478} 146" stroke="${purple}" fill="none" stroke-width="4"/>
        ${three ? `<path class="exchange-path" d="M500 146 C525 146 525 194 550 194 M500 194 C525 194 525 146 550 146" stroke="${green}" fill="none" stroke-width="4"/>` : ''}`
        : text(150, 126, 'Homolog 1', 'scene-note') + text(150, 222, 'Homolog 2', 'scene-note')) +
      text(450, 305, 'Four chromatids · coloured segments track their parental origin', 'scene-note')
    );
  }
  const products = [top, three ? ['A', 'b', 'C'] : ['A', 'b'], three ? ['a', 'B', 'c'] : ['a', 'B'], bottom];
  if (three && frame === 3)
    return (
      label(450, 40, 'One DCO chromosome contributes to BOTH intervals') +
      markedChrom(450, 135, ['A', 'b', 'C'], [amber, blue, amber], 360) +
      `<path d="M330 163v30h120v-30 M450 163v30h120v-30" fill="none" stroke="${purple}" stroke-width="3"/>` +
      text(390, 222, 'A–B', 'scene-note') +
      text(510, 222, 'B–C', 'scene-note') +
      text(450, 285, 'Outside A and C stay parental. Middle B changes to b.', 'scene-note')
    );
  return (
    label(
      450,
      40,
      three
        ? 'Compare the outside alleles and the middle allele'
        : frame === 3
          ? 'Each gamete receives one chromatid'
          : 'Two parental + two recombinant products',
    ) +
    products
      .map((a, i) => {
        const x = 150 + i * 200,
          changed = i === 1 || i === 2;
        return (
          (frame === 3 ? cell(x, 170, 88) : '') +
          markedChrom(
            x,
            170,
            a,
            a.map((gene) => (gene === gene.toUpperCase() ? amber : blue)),
            160,
            450 - x,
          ) +
          text(x, 265, changed ? (three ? 'Double crossover' : 'Recombinant') : 'Parental', 'scene-note')
        );
      })
      .join('') +
    text(450, 312, 'The allele labels and the segment colours both record chromosome origin.', 'scene-note')
  );
}

function gal4uas(frame) {
  if (frame === 3)
    return [220, 450, 680]
      .map(
        (x, i) =>
          cell(x, 170, 87, i === 2 ? green : '#667785') +
          text(x, 156, ['GAL4', 'UAS–output', 'GAL4 + UAS–output'][i], 'scene-white') +
          text(x, 190, i === 2 ? 'Output ON' : 'Output OFF', 'scene-white') +
          label(x, 43, i === 2 ? 'Both components' : 'Single-component control'),
      )
      .join('');
  return (
    label(450, 40, 'Two DNA components in the same cell', 'Insertion sites are not specified') +
    chrom(230, 142, 'GAL4 driver', amber) +
    chrom(670, 142, 'UAS → output', blue) +
    (frame >= 1
      ? arrow(310, 142, 570, 142) +
        text(445, 120, 'GAL4 protein', 'scene-note') +
        `<g class="scene-token" style="--travel:-290px">${protein(590, 142, amber)}</g>`
      : '') +
    (frame >= 2 ? cell(670, 237, 43, green) + text(670, 243, 'ON', 'scene-white') + arrow(670, 165, 670, 190) : '') +
    text(
      450,
      305,
      frame === 0
        ? 'Driver and responder can be inherited as separate genetic components.'
        : 'GAL4 activates the UAS-linked gene where the driver is active.',
      'scene-note',
    )
  );
}
function complementation(frame) {
  if (frame === 3)
    return (
      label(450, 44, 'Read functional copies across the chromosome pair') +
      [270, 650]
        .map(
          (x, i) =>
            cell(x, 170, 87, i ? '#9d6262' : green) +
            text(x, 155, i ? 'No functional a' : 'Functional a AND b', 'scene-white') +
            text(x, 191, i ? 'Fails to complement' : 'Complements', 'scene-white') +
            text(x, 300, i ? 'Same gene disrupted' : 'Different genes disrupted', 'scene-note'),
        )
        .join('')
    );
  const same = frame === 2;
  return (
    label(
      450,
      40,
      frame === 0 ? 'Mutations reside on chromosomes' : same ? 'Two mutations in the same gene' : 'Mutations in different genes',
    ) +
    pair(450, 160, same ? 'a¹     b⁺' : 'a⁻     b⁺', same ? 'a²     b⁺' : 'a⁺     b⁻') +
    (frame > 0
      ? `<rect x="365" y="104" width="170" height="115" rx="14" fill="none" stroke="${same ? '#df9993' : green}" stroke-width="3"/>` +
        text(
          450,
          270,
          same ? 'Both a copies are defective; normal b cannot replace a.' : 'Each homolog supplies the gene the other lacks.',
          'scene-note',
        )
      : text(450, 270, 'a and b are different genes, not alternative names for one gene.', 'scene-note'))
  );
}
function mosaics(frame) {
  if (frame < 2)
    return (
      label(450, 40, frame ? 'Replicated chromosomes · FLP at matching FRTs' : 'One cell · two homologs') +
      (frame
        ? [0, 1, 2, 3].map((i) => chrom(450, 98 + i * 45, i < 2 ? '●   FRT   m' : '●   FRT   +', i < 2 ? purple : green)).join('')
        : cell(450, 170, 88) + pair(450, 170, '●   FRT   m', '●   FRT   +', purple, green)) +
      (frame ? arrow(210, 163, 355, 163) + text(210, 140, 'FLP', 'scene-note') : '') +
      text(450, 305, '● centromere     ·     FRT proximal to the mutation', 'scene-note')
    );
  if (frame === 2)
    return [270, 650]
      .map(
        (x, i) =>
          cell(x, 175, 88, i ? green : purple) +
          pair(x, 175, i ? '+' : 'm', i ? '+' : 'm', i ? green : purple, i ? green : purple) +
          label(x, 44, i ? 'Reciprocal +/+ daughter' : 'Mutant m/m daughter'),
      )
      .join('');
  return (
    label(450, 40, 'Daughter lineages expand as tissue grows') +
    `<ellipse cx="450" cy="180" rx="240" ry="105" fill="#53616a"/>` +
    Array.from({ length: 63 }, (_, i) => {
      const x = 275 + (i % 9) * 43,
        y = 112 + Math.floor(i / 9) * 23;
      const mutant = i % 9 >= 2 && i % 9 <= 4 && Math.floor(i / 9) >= 2 && Math.floor(i / 9) <= 5;
      const twin = i % 9 >= 5 && i % 9 <= 7 && Math.floor(i / 9) >= 1 && Math.floor(i / 9) <= 4;
      return `<rect class="scene-patch" x="${x}" y="${y}" width="38" height="19" rx="4" fill="${mutant ? purple : twin ? green : '#74828c'}"/>`;
    }).join('') +
    text(450, 312, 'Purple m/m clone · Green +/+ twin · Grey m/+ tissue', 'scene-note')
  );
}
function target(frame) {
  return (
    label(
      450,
      40,
      ['The DNA stays in the fly', '18 °C · GAL4 repressed', '29 °C · RNAi turns on', '29 °C · protein depletion follows'][frame],
    ) +
    chrom(200, 110, 'GAL4', amber) +
    chrom(450, 110, 'UAS–RNAi', blue) +
    chrom(700, 110, 'GAL80ts', purple) +
    (frame > 0
      ? arrow(280, 110, 367, 110, frame >= 2) + (frame === 1 ? `<path d="M320 88v44" stroke="${purple}" stroke-width="5"/>` : '')
      : '') +
    text(245, 202, frame >= 2 ? 'RNAi active' : 'RNAi suppressed', 'scene-white') +
    text(650, 202, 'Target protein', 'scene-white') +
    Array.from({ length: 10 }, (_, i) => protein(570 + (i % 5) * 35, 235 + Math.floor(i / 5) * 30, green, frame === 3 && i > 1)).join('') +
    (frame === 3 ? arrow(350, 242, 490, 242) + text(420, 220, 'Turnover', 'scene-note') : '') +
    text(
      450,
      315,
      frame >= 2
        ? 'Activation and protein depletion happen on different timescales.'
        : 'Temperature changes activity; it does not remove the transgenes.',
      'scene-note',
    )
  );
}
function screens(frame) {
  if (frame === 0)
    return (
      label(450, 40, 'One independent mutagenised chromosome per line') +
      cell(450, 170, 88) +
      pair(450, 170, 'mutagenised', 'Bal', amber, purple) +
      text(450, 305, 'Maintain the chromosome while testing its effects.', 'scene-note')
    );
  return (
    label(450, 40, ['', 'Many independent opportunities', 'A candidate allele appears', 'More hits can complicate interpretation'][frame]) +
    Array.from({ length: 10 }, (_, i) => {
      const x = 155 + (i % 5) * 150,
        y = 92 + Math.floor(i / 5) * 105,
        hit = frame >= 2 && i === 6;
      return `<g class="${frame === 1 ? 'scene-line' : ''}" style="--delay:${i * 35}ms"><path d="M${x - 25} ${y}v57q25 22 50 0v-57" fill="${hit ? '#493e29' : '#243541'}" stroke="${hit ? amber : blue}" stroke-width="2"/><path d="M${x - 27} ${y}h54" stroke="#a6b3bd" stroke-width="7"/>${text(x, y + 84, `Line ${i + 1}`, 'scene-note')}${hit ? text(x, y + 40, frame === 3 ? '★ + •' : '★', 'scene-hit') : ''}</g>`;
    }).join('') +
    text(
      450,
      318,
      frame === 3
        ? '★ target allele · • additional hit on the same chromosome · Two vials per line in the model'
        : frame === 2
          ? 'Illustrative hit placement: most real screens need far more than ten lines.'
          : 'Different lines must represent independent mutagenised chromosomes.',
      'scene-note',
    )
  );
}
function flySketch(x, y, curly = false) {
  return `<g transform="translate(${x} ${y})"><path d="M-8 -10L-52 -40M-10 5L-60 0M-8 20L-48 50M8 -10L52 -40M10 5L60 0M8 20L48 50" stroke="#becad0" stroke-width="4" fill="none"/>
    <ellipse cx="0" cy="16" rx="15" ry="37" fill="#c99761"/><ellipse cx="0" cy="-18" rx="20" ry="22" fill="#b5824b"/><circle cx="0" cy="-48" r="15" fill="#c99761"/>
    ${curly ? '<path d="M-13 -16Q-88 -94 -67 -18Q-59 9 -14 18M13 -16Q88 -94 67 -18Q59 9 14 18" fill="#b5d5df" fill-opacity=".8" stroke="#e1edf0" stroke-width="2"/>' : '<ellipse cx="-32" cy="-8" rx="18" ry="49" transform="rotate(-28 -32 -8)" fill="#b5d5df" fill-opacity=".8"/><ellipse cx="32" cy="-8" rx="18" ry="49" transform="rotate(28 32 -8)" fill="#b5d5df" fill-opacity=".8"/>'}
    <path d="M-10 18h20M-10 29h20M-7 40h14" stroke="#705331" stroke-width="3"/></g>`;
}
function chromosomeSet(x, y, haploid = false, small = false) {
  const gap = small ? 43 : 98,
    scale = small ? 0.55 : 1;
  return ['X', '2', '3', '4']
    .map((name, i) => {
      const height = [76, 106, 92, 26][i] * scale,
        cx = x + (i - 1.5) * gap;
      return (
        `<g class="scene-token" style="--travel:${haploid ? -160 : 0}px">${[0, ...(haploid ? [] : [1])].map((j) => `<rect x="${cx + (haploid ? 0 : j ? 8 : -12)}" y="${y - height / 2}" width="${small ? 9 : 14}" height="${height}" rx="7" fill="${j || (haploid && i % 2) ? blue : amber}"/>`).join('')}</g>` +
        text(cx + 7, y + 76 * scale, name, 'scene-note')
      );
    })
    .join('');
}
function chromosomes(frame) {
  if (!frame)
    return (
      label(450, 38, 'From the animal to a typical diploid body cell') +
      flySketch(220, 170) +
      arrow(310, 170, 430, 170) +
      cell(600, 170, 105) +
      cell(600, 170, 62, purple) +
      chromosomeSet(600, 165, false, true) +
      text(220, 295, 'Schematic fly', 'scene-note') +
      text(600, 295, 'Cell → nucleus → chromosomes', 'scene-note')
    );
  if (frame === 1)
    return (
      label(450, 38, 'Four pairs = eight chromosomes') +
      chromosomeSet(450, 160) +
      text(450, 302, 'Amber: maternal origin · Blue: paternal origin · Female XX example', 'scene-note')
    );
  if (frame === 2)
    return (
      label(450, 38, 'Chromosome → gene locus → allele') +
      pair(450, 155, 'A', 'a') +
      `<rect x="430" y="112" width="40" height="88" rx="6" fill="none" stroke="${purple}" stroke-width="3"/>` +
      arrow(450, 208, 450, 247) +
      text(450, 274, 'Same locus on the homologs; A and a are two alleles.', 'scene-note') +
      text(450, 308, 'A chromosome contains many genes, not just the labelled example.', 'scene-note')
    );
  return (
    label(450, 38, 'Meiosis: keep one homolog from every pair') +
    cell(250, 165, 105) +
    chromosomeSet(250, 165, false, true) +
    arrow(380, 165, 490, 165) +
    cell(650, 165, 96) +
    chromosomeSet(650, 165, true, true) +
    text(250, 295, 'Body cell: four pairs', 'scene-note') +
    text(650, 295, 'Gamete: four chromosomes', 'scene-note')
  );
}
function dominance(frame) {
  if (!frame)
    return (
      label(450, 38, 'CyO names a chromosome carrying the Curly marker') +
      cell(450, 165, 88) +
      pair(450, 165, 'CyO · Curly', '+', purple, blue) +
      text(450, 300, 'One Curly-bearing homolog and one normal homolog', 'scene-note')
    );
  if (frame < 2)
    return (
      label(450, 38, frame ? 'One Curly copy is enough to affect the wings' : 'A chromosome name and the marker it carries') +
      pair(250, 165, 'CyO · Curly', '+', purple, blue) +
      arrow(355, 165, 520, 165) +
      flySketch(670, 174, frame === 1) +
      text(250, 290, 'Genotype: CyO/+', 'scene-note') +
      text(670, 290, frame ? 'Curly phenotype' : 'Follow the chromosome to the trait', 'scene-note')
    );
  return (
    label(
      450,
      38,
      frame === 2 ? 'Compare the chromosome pairs and the wings' : 'Genotype describes copies; phenotype describes appearance',
    ) +
    [260, 650]
      .map(
        (x, i) =>
          pair(x, 110, i ? '+' : 'CyO', '+', i ? blue : purple, blue) +
          flySketch(x, 240, !i) +
          text(x, 320, i ? '+/+ · straight wings' : 'CyO/+ · Curly wings', 'scene-note'),
      )
      .join('')
  );
}
function fertilisation(frame) {
  if (!frame)
    return (
      label(450, 38, 'Follow one pair through a separate example cross') +
      cell(260, 165, 85) +
      pair(260, 165, 'A', 'a') +
      cell(650, 165, 85) +
      pair(650, 165, 'a', 'a', purple, purple) +
      text(260, 300, 'Mother A/a', 'scene-note') +
      text(650, 300, 'Father a/a', 'scene-note')
    );
  if (frame === 1)
    return (
      label(450, 38, 'Egg types and sperm types') +
      chrom(220, 130, 'A', amber, { from: 120 }) +
      chrom(220, 215, 'a', blue, { from: 120 }) +
      chrom(670, 175, 'a', purple, { from: -120 }) +
      text(220, 300, 'Two egg types', 'scene-note') +
      text(670, 300, 'One scored sperm type', 'scene-note')
    );
  return (
    label(450, 38, frame === 2 ? 'An a-carrying sperm can meet either egg type' : 'Each fertilised egg restores a chromosome pair') +
    [260, 650]
      .map(
        (x, i) =>
          cell(x, 165, 85) +
          chrom(x, 145, i ? 'a' : 'A', i ? blue : amber, { from: -100 }) +
          chrom(x, 185, 'a', purple, { from: 100 }) +
          text(x, 295, frame === 3 ? `${i ? 'a/a' : 'A/a'} · expected share ½` : i ? 'a egg + a sperm' : 'A egg + a sperm', 'scene-note'),
      )
      .join('')
  );
}
function assortment(frame) {
  if (!frame)
    return (
      label(450, 38, 'Two pairs, two independent choices') +
      pair(270, 160, 'A', 'a') +
      pair(650, 160, 'B', 'b', green, purple) +
      text(270, 290, 'Chromosome pair 1', 'scene-note') +
      text(650, 290, 'Chromosome pair 2', 'scene-note')
    );
  if (frame === 1)
    return (
      label(450, 38, 'First choose A or a') +
      chrom(270, 170, 'A', amber, { from: 100 }) +
      chrom(650, 170, 'a', blue, { from: -100 }) +
      text(450, 295, 'You still need a chromosome from the other pair.', 'scene-note')
    );
  return (
    label(
      450,
      38,
      frame === 2 ? 'Either first choice can be joined by B or b' : 'Four gamete types, each with one chromosome from EACH pair',
    ) +
    [
      ['A', 'B'],
      ['A', 'b'],
      ['a', 'B'],
      ['a', 'b'],
    ]
      .map(([a, b], i) => {
        const x = 150 + i * 200;
        return (
          cell(x, 170, 88) +
          chrom(x, 150, a, a === 'A' ? amber : blue, { from: 450 - x }) +
          chrom(x, 190, b, b === 'B' ? green : purple, { from: 450 - x }) +
          text(x, 295, `${a}${b}${frame === 3 ? ' · ¼' : ''}`, 'scene-note')
        );
      })
      .join('')
  );
}
function lethals(frame) {
  if (!frame)
    return (
      label(450, 38, 'M/+ × M/+ · M is a dominant marker, lethal in two copies') +
      [260, 650].map((x) => cell(x, 165, 85) + pair(x, 165, 'M', '+', amber, blue)).join('') +
      text(450, 302, 'A separate teaching example; both parents survive.', 'scene-note')
    );
  const pairs = [
    ['M', 'M'],
    ['M', '+'],
    ['+', 'M'],
    ['+', '+'],
  ];
  return (
    label(
      450,
      38,
      frame === 1
        ? 'Count four equally likely fertilisation combinations'
        : frame === 2
          ? 'M/M cannot contribute an adult'
          : 'Adult denominator: three surviving combinations',
    ) +
    pairs
      .map(([a, b], i) => {
        const x = 150 + i * 200,
          dead = frame >= 2 && i === 0;
        return (
          `<g opacity="${dead ? '.3' : '1'}">${cell(x, 165, 88)}${pair(x, 165, a, b, a === 'M' ? amber : blue, b === 'M' ? amber : blue)}</g>` +
          (dead ? `<path d="M${x - 45} 115l90 100M${x + 45} 115l-90 100" stroke="#e49a95" stroke-width="4"/>` : '') +
          text(x, 295, dead ? 'Does not survive' : frame === 3 ? (i < 3 ? 'Marker visible' : 'Marker absent') : `${a}/${b}`, 'scene-note')
        );
      })
      .join('') +
    (frame === 3 ? text(450, 326, 'Expected adult share: 2 marker-bearing / 3 survivors = ⅔', 'scene-note') : '')
  );
}
function xCopies(frame) {
  if (frame < 2)
    return (
      label(450, 38, frame ? 'Only the X carries this example locus' : 'Count X homologs in usual XX and XY flies') +
      pair(260, 165, frame ? 'X · locus A' : 'X', frame ? 'X · locus a' : 'X') +
      pair(650, 165, frame ? 'X · locus a' : 'X', 'Y', amber, purple) +
      text(260, 295, 'XX female: two X homologs', 'scene-note') +
      text(650, 295, frame ? 'Y: no matching copy here' : 'XY male: one X plus Y', 'scene-note')
    );
  if (frame === 2)
    return (
      label(450, 38, 'Recessive example: compare functional allele copies') +
      pair(260, 165, 'Xᴬ', 'Xᵃ') +
      pair(650, 165, 'Xᵃ', 'Xᵃ', blue, blue) +
      text(260, 295, 'A functional copy remains', 'scene-note') +
      text(650, 295, 'No functional A copy', 'scene-note')
    );
  return (
    label(450, 38, 'A male cannot obtain A from a Y at this locus') +
    cell(450, 165, 88) +
    pair(450, 165, 'Xᵃ', 'Y', blue, purple) +
    text(450, 295, 'Only a is present at this X-linked locus.', 'scene-note')
  );
}
function sexGametes(frame) {
  if (!frame)
    return (
      label(450, 38, 'One sex chromosome per gamete') +
      pair(260, 165, 'Xᵃ', 'Xᵃ', amber, amber) +
      pair(650, 165, 'Xᴬ', 'Y', purple, purple) +
      text(260, 295, 'Mother Xᵃ/Xᵃ', 'scene-note') +
      text(650, 295, 'Father Xᴬ/Y', 'scene-note')
    );
  if (frame === 1)
    return (
      label(450, 38, 'Male: two different sperm types') +
      [260, 650]
        .map(
          (x, i) =>
            cell(x, 165, 75) +
            chrom(x, 165, i ? 'Y' : 'Xᴬ', purple, { from: 450 - x }) +
            text(x, 295, i ? 'Y sperm · expected ½' : 'Xᴬ sperm · expected ½', 'scene-note'),
        )
        .join('')
    );
  if (frame === 2)
    return (
      label(450, 38, 'Female: both homologs carry the same allele') +
      pair(260, 165, 'Xᵃ', 'Xᵃ', amber, amber) +
      arrow(365, 165, 535, 165) +
      cell(670, 165, 75) +
      chrom(670, 165, 'Xᵃ', amber, { from: -130 }) +
      text(450, 300, 'One scored egg type; each egg still receives only ONE X.', 'scene-note')
    );
  return (
    label(450, 38, 'Chromosome count and gamete variety are different questions') +
    label(260, 145, 'Each gamete: ONE sex chromosome', 'An X or a Y; not the whole pair') +
    label(650, 145, 'Scored varieties depend on the homologs', 'Identical alleles can give one scored type') +
    text(450, 295, 'Different pairs must also contribute one chromosome each.', 'scene-note')
  );
}
function reciprocal(frame) {
  const reversed = frame >= 2;
  if (frame % 2 === 0)
    return (
      label(450, 38, reversed ? 'Reverse which parent carries a' : 'First direction of the cross') +
      pair(260, 165, reversed ? 'Xᴬ' : 'Xᵃ', reversed ? 'Xᴬ' : 'Xᵃ', amber, amber) +
      pair(650, 165, reversed ? 'Xᵃ' : 'Xᴬ', 'Y', purple, purple) +
      text(260, 295, 'Mother contributes X to every offspring', 'scene-note') +
      text(650, 295, 'Father contributes X or Y', 'scene-note')
    );
  return (
    label(450, 38, reversed ? 'Every offspring now receives maternal Xᴬ' : 'Trace daughters and sons separately') +
    [270, 650]
      .map(
        (x, i) =>
          cell(x, 165, 85) +
          pair(x, 165, reversed ? 'Xᴬ' : 'Xᵃ', i ? 'Y' : reversed ? 'Xᵃ' : 'Xᴬ', amber, purple) +
          text(x, 295, i ? (reversed ? 'Son: functional A' : 'Son: no functional A') : 'Daughter: functional A', 'scene-note'),
      )
      .join('')
  );
}
function maleMeiosis(frame) {
  if (!frame)
    return (
      label(450, 38, 'Male homologs: AB and ab') +
      pair(450, 165, 'A B', 'a b') +
      text(450, 300, 'These loci share one chromosome pair.', 'scene-note')
    );
  if (frame < 3)
    return (
      label(450, 38, frame === 1 ? 'Replicate without changing the allele arrangement' : 'Segregate without meiotic crossing over') +
      ['A B', 'A B', 'a b', 'a b'].map((a, i) => chrom(450, 98 + i * 48, a, i < 2 ? amber : blue)).join('') +
      text(450, 305, 'No exchange between the parental chromatids in male meiosis.', 'scene-note')
    );
  return (
    label(450, 38, 'Only the two parental scored sperm types') +
    [260, 650]
      .map(
        (x, i) =>
          cell(x, 165, 85) +
          chrom(x, 165, i ? 'a b' : 'A B', i ? blue : amber, { from: 450 - x }) +
          text(x, 295, i ? 'ab sperm' : 'AB sperm', 'scene-note'),
      )
      .join('')
  );
}
function balancerTransmission(frame) {
  if (frame < 3)
    return (
      label(
        450,
        38,
        ['One insertion-bearing homolog and one balancer', 'Recognise the inversion symbol', 'Model: recover intact parental chromosomes'][
          frame
        ],
      ) +
      cell(450, 165, 88) +
      pair(450, 165, 'G', 'Bal', amber, purple) +
      text(
        450,
        300,
        frame === 2
          ? 'Suppressed recovery of recombinants; no repair or copying of G.'
          : 'G is an insertion label, not a recessive lethal.',
        'scene-note',
      )
    );
  return (
    label(450, 38, 'One homolog from the pair per gamete') +
    [260, 650]
      .map(
        (x, i) =>
          cell(x, 165, 85) +
          chrom(x, 165, i ? 'Bal' : 'G', i ? purple : amber, { from: 450 - x, balancer: !!i }) +
          text(x, 295, i ? 'Balancer-bearing gamete' : 'Insertion-bearing gamete', 'scene-note'),
      )
      .join('')
  );
}

function lifeCycle(f) {
  const names = ['Egg', 'Larva', 'Pupa', 'Adult'];
  const shapes = [
    `<ellipse cx="450" cy="170" rx="50" ry="90" fill="#ece7d7"/><path d="M425 88v-20M475 88v-20" stroke="#ece7d7" stroke-width="4"/>`,
    `<path d="M260 190C310 90 350 230 400 145S510 240 570 150S630 130 660 160" fill="none" stroke="#e8ddba" stroke-width="38" stroke-linecap="round"/><circle cx="658" cy="160" r="5" fill="#6b5540"/>`,
    `<rect x="395" y="75" width="110" height="190" rx="50" fill="#a76b40"/>${[110, 140, 170, 200, 230].map((y) => `<path d="M400 ${y}h100" stroke="#754625" stroke-width="4"/>`).join('')}`,
    flySketch(450, 180),
  ];
  return (
    label(450, 38, `${f + 1} · ${names[f]}`) +
    `<g class="scene-token">${shapes[f]}</g>` +
    text(450, 310, 'Egg → three larval instars → pupa → adult · timing depends on conditions', 'scene-note')
  );
}
function marcm(f) {
  if (f < 2)
    return (
      label(450, 38, f ? 'FLP exchange at matching FRT sites' : 'GAL80 represses GAL4 in the starting cell') +
      pair(450, 145, 'FRT · m', 'FRT · GAL80', purple, blue) +
      text(
        450,
        235,
        f ? 'Informative exchange and segregation can separate m from GAL80.' : 'GAL4 + UAS-GFP present, reporter repressed',
        'scene-note',
      ) +
      (f ? arrow(250, 145, 350, 145) : '') +
      text(450, 305, 'Loci and insertion sites are schematic.', 'scene-note')
    );
  return (
    label(450, 38, f === 2 ? 'Informative reciprocal daughters' : 'Only the de-repressed lineage is marked') +
    [270, 650]
      .map(
        (x, i) =>
          cell(x, 165, 88, i ? blue : green) +
          pair(x, 165, i ? '+ · GAL80' : 'm', i ? '+ · GAL80' : 'm', i ? blue : purple, i ? blue : purple) +
          text(x, 290, i ? 'Reciprocal +/+ · GAL80 retained' : 'm/m · GAL80 lost', 'scene-note') +
          (f === 3 ? text(x, 320, i ? 'Reporter repressed' : 'GFP where GAL4 is active', 'scene-note') : ''),
      )
      .join('')
  );
}
function maternal(f) {
  const supplied = f < 2;
  return (
    label(
      450,
      38,
      [
        'Maternal genotype and egg supply are different',
        'Maternal protein can mask an early defect',
        'A mutant germline can change the egg supply',
        'Paternal allele can change later zygotic expression',
      ][f],
    ) +
    pair(230, 150, f < 2 ? 'm' : 'm', f < 2 ? '+' : 'm', purple, blue) +
    arrow(330, 150, 480, 150) +
    cell(650, 165, 88) +
    ([0, 2].includes(f) ? chrom(650, 135, 'm egg', purple) : pair(650, 135, 'm', f === 3 ? '+' : 'm', purple, blue)) +
    Array.from({ length: 6 }, (_, i) => protein(600 + (i % 3) * 45, 200 + Math.floor(i / 3) * 25, green, !supplied)).join('') +
    text(230, 295, f < 2 ? 'Mother carries a functional copy' : 'Mutant germline clone', 'scene-note') +
    text(
      650,
      295,
      supplied
        ? 'Functional maternal product present'
        : f === 3
          ? 'Later zygotic expression must be tested'
          : 'Normal maternal product absent here',
      'scene-note',
    )
  );
}

const SCENES = {
  'life-cycle': lifeCycle,
  marcm,
  maternal,
  chromosomes,
  dominance,
  fertilisation,
  assortment,
  lethals,
  'x-copies': xCopies,
  'sex-gametes': sexGametes,
  reciprocal,
  'male-meiosis': maleMeiosis,
  'balancer-transmission': balancerTransmission,
  inheritance,
  xlinked,
  balancers,
  chance,
  recombination: (f) => exchange(f),
  gal4uas,
  complementation,
  threepoint: (f) => exchange(f, true),
  mosaics,
  target,
  screens,
};

// Point to the learner's actual controls without filling in an answer.
const ACTION_GUIDES = {
  gametes: [
    ['Choose chromosomes', '.gamete-bench .parent'],
    ['Build a gamete', '[data-make]'],
    ['Compare your products', '.found'],
  ],
  predict: [
    ['Inspect the parents', '.cross-line'],
    ['Set the shares', '.predict'],
    ['Check your prediction', '[data-check], .punnett'],
  ],
  count: [
    ['Read the counts', '.counts'],
    ['Enter your estimate', '[data-answer]'],
    ['Check the calculation', '[data-check], .feedback'],
  ],
  chance: [
    ['Choose a sample size', '[data-draw]'],
    ['Compare repeated samples', '.strip-row'],
    ['Look for the expected share', '.expect'],
  ],
  chisq: [
    ['Inspect the observed counts', '.counts'],
    ['Test a hypothesis', '[data-h]'],
    ['Judge the fit', '[data-judge], .feedback, [data-h]'],
  ],
  grid: [
    ['Read the chromosome evidence', '.dfmap, .grid'],
    ['Run a cross', '[data-cell], .grid'],
    ['Compare the outcomes', '.grid'],
  ],
  threepoint: [
    ['Classify chromosomes', '.mapping-counts'],
    ['Infer the middle locus', '[data-middle]'],
    ['Count each interval', '.interval-rows, [data-check-order]'],
  ],
  clones: [
    ['Predict the age effect', '[data-clone-prediction]'],
    ['Set the induction plan', '.research-controls'],
    ['Compare independent discs', '.clone-replicates, [data-clone-run]'],
  ],
  target: [
    ['Set stage temperatures', '.temperature-schedule'],
    ['Run the time course', '[data-target-run]'],
    ['Compare assessed windows', '.target-plot, .goal-checks'],
  ],
  screen: [
    ['Choose dose and line count', '.research-controls'],
    ['Evaluate your plan', '[data-screen-run]'],
    ['Compare coverage and workload', '.screen-comparison, .screen-stats, [data-screen-run]'],
  ],
};
export function actionGuideHTML(type) {
  const actions = ACTION_GUIDES[type];
  if (!actions) return '';
  return `<nav class="action-guide" aria-label="Visual activity guide">${actions.map(([title, selector], i) => `<button type="button" data-guide-target="${esc(selector)}"><span>${i + 1}</span>${esc(title)}<span aria-hidden="true">↗</span></button>`).join('')}</nav>`;
}
export function wireActionGuide(root) {
  root.querySelectorAll('[data-guide-target]').forEach((button) =>
    button.addEventListener('click', () => {
      let target = root.querySelector(button.dataset.guideTarget);
      if (!target) return;
      if (target.disabled) target = target.parentElement;
      root.querySelectorAll('.guide-highlight').forEach((node) => node.classList.remove('guide-highlight'));
      target.classList.add('guide-highlight');
      if (!target.matches('button, input, select, textarea, [tabindex]')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center' });
      target.addEventListener('blur', () => target.classList.remove('guide-highlight'), { once: true });
    }),
  );
}

export function guideScene(id, frame, animate = false) {
  const guide = VISUAL_GUIDES[id];
  if (!guide) return '';
  const i = Math.max(0, Math.min(guide.frames.length - 1, frame));
  return `<svg class="visual-scene ${animate ? 'is-moving' : ''}" viewBox="0 0 900 340" role="img" aria-label="${esc(guide.frames[i][0] + ': ' + guide.frames[i][1])}"><defs><marker id="guide-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#a4afb9"/></marker></defs>${SCENES[id](i)}</svg>`;
}

export function visualGuideHTML(id, expanded = true, override = null) {
  const guide = override || VISUAL_GUIDES[id];
  if (!guide) return '';
  return `<details class="visual-guide" ${expanded ? 'open' : ''}><summary><span class="visual-badge">Animated guide</span><strong>${esc(guide.title)}</strong></summary><div class="guide-content"><p class="guide-example">Separate teaching example · labels and chromosome positions are schematic</p><div data-guide-scene></div><ol class="guide-frames" aria-label="Animation stages">${guide.frames.map(([title], i) => `<li><button type="button" data-visual-frame="${i}"><span>${i + 1}</span>${esc(title)}</button></li>`).join('')}</ol><div class="guide-controls"><button type="button" data-visual-back aria-label="Previous animation stage">←</button><button type="button" class="primary" data-visual-play>Play animation</button><button type="button" data-visual-next aria-label="Next animation stage">→</button><button type="button" data-visual-replay>Replay</button><label>Speed <select data-visual-speed><option value="3000">Slow</option><option value="1800" selected>Normal</option><option value="1000">Fast</option></select></label></div><p class="guide-caption" data-guide-caption aria-live="polite"></p></div></details>`;
}

export function wireVisualGuide(
  root,
  id,
  { frame = 0, initialSpeed = 1800, onFrame = () => {}, onSpeed = () => {}, override = null, sceneRenderer = null } = {},
) {
  const el = root.querySelector('.visual-guide'),
    guide = override || VISUAL_GUIDES[id];
  if (!el || !guide) return () => {};
  let index = Number.isInteger(frame) ? Math.max(0, Math.min(guide.frames.length - 1, frame)) : 0;
  let timer = null,
    playing = false,
    speed = [1000, 1800, 3000].includes(initialSpeed) ? initialSpeed : 1800;
  el.querySelector('[data-visual-speed]').value = String(speed);
  const stop = () => {
    clearTimeout(timer);
    timer = null;
    playing = false;
    el.querySelector('[data-visual-play]').textContent = 'Play animation';
  };
  const draw = (animate = false) => {
    el.querySelector('[data-guide-scene]').innerHTML = sceneRenderer ? sceneRenderer(index, animate) : guideScene(id, index, animate);
    el.querySelector('[data-guide-caption]').textContent = guide.frames[index][1];
    el.querySelectorAll('[data-visual-frame]').forEach((b, i) => {
      b.setAttribute('aria-current', i === index ? 'step' : 'false');
    });
    el.querySelector('[data-visual-back]').disabled = index === 0;
    el.querySelector('[data-visual-next]').disabled = index === guide.frames.length - 1;
  };
  const show = (i) => {
    index = i;
    draw(true);
    onFrame(index);
  };
  const tick = () => {
    timer = setTimeout(() => {
      if (!el.isConnected || !el.open || document.hidden) {
        stop();
        return;
      }
      if (index < guide.frames.length - 1) {
        show(index + 1);
        tick();
      } else stop();
    }, speed);
  };
  el.querySelectorAll('[data-visual-frame]').forEach((b) =>
    b.addEventListener('click', () => {
      stop();
      show(Number(b.dataset.visualFrame));
    }),
  );
  el.querySelector('[data-visual-back]').addEventListener('click', () => {
    stop();
    show(Math.max(0, index - 1));
  });
  el.querySelector('[data-visual-next]').addEventListener('click', () => {
    stop();
    show(Math.min(guide.frames.length - 1, index + 1));
  });
  const play = () => {
    if (index === guide.frames.length - 1) show(0);
    playing = true;
    el.querySelector('[data-visual-play]').textContent = 'Pause animation';
    tick();
  };
  el.querySelector('[data-visual-play]').addEventListener('click', () => {
    if (playing) stop();
    else play();
  });
  el.querySelector('[data-visual-replay]').addEventListener('click', () => {
    stop();
    show(0);
    play();
  });
  el.querySelector('[data-visual-speed]').addEventListener('change', (e) => {
    speed = Number(e.target.value);
    onSpeed(speed);
    if (playing) {
      clearTimeout(timer);
      tick();
    }
  });
  el.addEventListener('toggle', () => {
    if (!el.open) stop();
  });
  draw();
  return stop;
}
