// Authored curriculum. All taught modules follow teach → demonstrate → guide → practise → diagnose.
export const STAGES = {
  teach: 'Learn the idea',
  demonstrate: 'Worked demonstration',
  guide: 'Guided practice',
  practise: 'Independent practice',
  diagnose: 'Investigate the evidence',
};
export const PATH = [
  {
    title: '1 · First contact',
    level: 'Beginner',
    lessons: ['tour', 'collection', 'foundations'],
    goal: 'Handle flies, use source history and understand chromosomes and alleles.',
  },
  {
    title: '2 · Read and predict',
    level: 'Foundations',
    lessons: ['inheritance', 'xlinked', 'first-cross', 'notation'],
    goal: 'Read a stock and predict chromosome transmission before setting up a cross.',
  },
  {
    title: '3 · Build and verify',
    level: 'Intermediate',
    lessons: ['balancers', 'chance', 'recombination', 'planner'],
    goal: 'Maintain chromosomes, plan generations, analyse counts and verify lines.',
  },
  {
    title: '4 · Design experiments',
    level: 'Advanced',
    lessons: ['gal4uas', 'complementation', 'threepoint', 'mosaics', 'target', 'screens'],
    goal: 'Choose genetic tools, controls, sample sizes and assay windows.',
  },
  {
    title: '5 · Research investigations',
    level: 'Integrated practice',
    lessons: ['investigation', 'research-project'],
    goal: 'Preserve an unmarked mutation, build a three-generation stock and defend an interpretation.',
  },
];
const plan = (level, prerequisites, objectives, terms, coach) => ({ level, prerequisites, objectives, terms, coach });
export const CURRICULUM = {
  foundations: plan(
    'Beginner',
    [],
    [
      'Distinguish chromosome, gene and allele.',
      'Explain genotype, phenotype and dominance.',
      'Explain why gametes contain one homolog from each pair.',
    ],
    {
      chromosome: 'A DNA-containing structure carrying many genes.',
      gene: 'A functional DNA unit whose activity can contribute to a trait.',
      allele: 'A version of a gene at the same locus.',
      homolog: 'One of the corresponding chromosomes in a pair.',
      genotype: 'The genetic combination being described.',
      phenotype: 'An observable characteristic, shaped by genotype and conditions.',
    },
    ['Name what each bar represents.', 'Count chromosomes before naming alleles.', 'Separate observation from inference.'],
  ),
  inheritance: plan(
    'Foundations',
    ['foundations'],
    [
      'Construct gametes from one or two pairs.',
      'Combine eggs and sperm to predict offspring.',
      'Distinguish fertilised-egg ratios from adult ratios.',
    ],
    {
      gamete: 'An egg or sperm with one chromosome from each pair.',
      meiosis: 'The division process producing a reduced chromosome set.',
      dominant: 'An allele effect expressed in the stated heterozygote.',
      lethal: 'A genetic combination that does not survive to the scored stage.',
    },
    [
      'List the maternal gametes.',
      'List paternal gametes and combine each egg with each sperm.',
      'Remove non-viable combinations before calculating adult shares.',
    ],
  ),
  xlinked: plan(
    'Foundations',
    ['inheritance'],
    ['Trace X chromosomes through sons and daughters.', 'Predict reciprocal crosses.', 'Use unexpected classes to question parentage.'],
    {
      hemizygous: 'Having one copy of a locus, as at many X-linked loci in an XY male.',
      recessive: 'An effect masked by a functional copy in the stated heterozygote.',
      reciprocal: 'A cross assigning the parental genotypes to the opposite sexes.',
    },
    [
      'Write the maternal X.',
      'Add paternal X for a daughter or Y for a son.',
      'Count functional white copies, then group by sex and phenotype.',
    ],
  ),
  notation: plan(
    'Foundations',
    ['inheritance', 'xlinked'],
    ['Read slashes, semicolons, + and Y.', 'Separate chromosome names from markers.', 'Distinguish stock records from inferred identity.'],
    {
      '/': 'Separates homologs within a chromosome pair.',
      ';': 'Separates chromosome groups.',
      '+': 'Wild type at the loci described, not a complete DNA sequence.',
      marker: 'A scorable trait used to follow a chromosome.',
    },
    ['Split at semicolons.', 'Read each slash as a pair, not a cross.', 'Use the marker without assuming it proves every hidden locus.'],
  ),
  balancers: plan(
    'Intermediate',
    ['notation'],
    [
      'Separate marker, homozygous lethality and inversions.',
      'Keep an unmarked mutation through an intermediate.',
      'Choose the right balancer class.',
    ],
    {
      balancer: 'A chromosome used to maintain and follow a partner chromosome.',
      inversion: 'A reversed segment; balancer inversions suppress recovery of recombinants.',
      stock: 'A maintained population with a defined genetic composition.',
    },
    [
      'Track the needed homolog before the marker.',
      'Check which homolog your selection discards.',
      'Ask whether different hidden chromosomes could look the same.',
    ],
  ),
  chance: plan(
    'Intermediate',
    ['inheritance'],
    ['Explain sampling variation.', 'Calculate expected counts and chi-square.', 'Distinguish ratio deviations from forbidden classes.'],
    {
      hypothesis: 'A proposed model making testable predictions.',
      expected: 'The count predicted by a hypothesis and sample size.',
      power: 'The ability to distinguish an alternative from the tested model.',
    },
    ['State the genetic hypothesis.', 'Multiply adult shares by sample size.', 'Failure to reject is not proof.'],
  ),
  recombination: plan(
    'Intermediate',
    ['balancers', 'chance'],
    ['Identify parental and recombinant chromosomes.', 'Estimate recombination frequency.', 'Select and verify independent lines.'],
    {
      linkage: 'Loci on one chromosome need not assort independently.',
      recombinant: 'A chromosome with a new tracked allele combination.',
      cM: 'Genetic-map unit; one percent recombination approximates one cM for short intervals.',
    },
    ['Write maternal phase.', 'Count both reciprocal recombinant classes.', 'Track the balancer, then verify identity and function.'],
  ),
  gal4uas: plan(
    'Advanced',
    ['balancers'],
    [
      'Separate transgene inheritance from expression.',
      'Identify experiment and sibling controls.',
      'Choose controls for competing explanations.',
    ],
    {
      driver: 'GAL4 construct with an expression pattern set by its regulatory context.',
      responder: 'UAS-linked construct activated by GAL4.',
      background: 'Other genetic variants shared or differing between flies.',
    },
    [
      'Track driver and responder separately.',
      'Expression needs both components present and active.',
      'Match conditions and background; add independent controls.',
    ],
  ),
  complementation: plan(
    'Advanced',
    ['balancers', 'chance'],
    [
      'Read functional copies in trans-heterozygotes.',
      'Interpret a controlled complementation grid.',
      'Narrow regions and choose a causal follow-up.',
    ],
    {
      complementation: 'Restoration of function when the chromosomes together supply functional gene copies.',
      deficiency: 'A chromosome with a deleted segment.',
      rescue: 'Restoring a phenotype with a functional gene copy to test an explanation.',
    },
    [
      'Identify the non-balancer test class.',
      'Check self-cross and control outcomes.',
      'Intersect failing deletions and exclude complementing regions.',
    ],
  ),
  threepoint: plan(
    'Advanced',
    ['recombination', 'chance'],
    [
      'Infer maternal phase and marker order.',
      'Count double crossovers in both intervals.',
      'Calculate coincidence and state assumptions.',
    ],
    {
      phase: 'Which alleles lie together on each homolog.',
      DCO: 'A double-crossover product.',
      interference: 'One minus coincidence; departure from independent interval events.',
    },
    [
      'Find reciprocal classes.',
      'Compare DCOs with their closest parental chromosomes.',
      'Use measured interval fractions for expected DCOs.',
    ],
  ),
  mosaics: plan(
    'Advanced',
    ['recombination'],
    ['Follow reciprocal chromosome products into clones.', 'Predict induction-time effects.', 'Compare replicate tissues and controls.'],
    {
      FRT: 'DNA site recognised by FLP recombinase.',
      clone: 'Descendants of a common cell lineage.',
      'twin spot': 'Reciprocal marked lineage from an informative event and segregation.',
    },
    ['Locate FRT relative to m.', 'Predict the age effect before induction.', 'Compare independent tissues and matched lineages.'],
  ),
  target: plan(
    'Advanced',
    ['gal4uas'],
    [
      'Separate DNA, GAL4 activity and protein abundance.',
      'Schedule against the assay window.',
      'Control temperature and verify knockdown.',
    ],
    {
      perdurance: 'Persistence of protein after its production is reduced.',
      GAL80ts: 'Temperature-sensitive GAL4 repressor.',
      'assay window': 'Time interval in which the biological outcome is measured.',
    },
    [
      'Define protected stages and assay window.',
      'Allow time for switching and protein turnover.',
      'Use matched controls and measure the biological effect.',
    ],
  ),
  screens: plan(
    'Advanced',
    ['balancers', 'chance'],
    ['Count independent chromosomes, not siblings.', 'Balance coverage, burden and capacity.', 'State calibration and validation needs.'],
    {
      coverage: 'Here, probability of at least one target-gene allele.',
      independent: 'Different founding mutation events, not copies of one event.',
      'multiple-hit burden': 'Share of lethal lines carrying more than one lethal lesion.',
    },
    ['Define the sampling unit.', 'Compare presets at fixed capacity.', 'Plan candidate recovery and causal verification.'],
  ),
  investigation: plan(
    'Integrated practice',
    ['balancers', 'chance', 'complementation'],
    [
      'Preserve an unmarked lethal across generations.',
      'Diagnose an ambiguous visible class.',
      'Choose identity evidence rather than appearance alone.',
    ],
    { intermediate: 'A selected stock used to construct the next generation.' },
    [
      'Record the homolog you must retain.',
      'Choose a marker distinguishing it from +.',
      'Declare only a class whose every member can match the target.',
    ],
  ),
  'research-project': plan(
    'Integrated practice',
    ['investigation', 'recombination', 'gal4uas', 'target', 'screens', 'threepoint', 'mosaics'],
    [
      'Build a balanced reporter plus recombinant driver–RNAi stock.',
      'Connect construction, verification, controls and timing.',
      'Distinguish support for a mechanism from proof.',
    ],
    { 'independent line': 'A separately derived line testing dependence on one genetic event.' },
    [
      'Plan backwards, chromosome by chromosome.',
      'Make recombinants in females; prepare other stocks in parallel.',
      'Verify identity and function before interpreting a phenotype.',
    ],
  ),
};
const cross = (title, mother, father, chroms, traits, pages, extra = {}) => ({
  type: 'worked',
  kind: 'cross',
  stage: 'demonstrate',
  title,
  mother,
  father,
  chroms,
  traits,
  pages,
  ...extra,
});
const model = (kind, title, pages, extra = {}) => ({ type: 'worked', kind, stage: 'demonstrate', title, pages, ...extra });
export const DEMONSTRATIONS = {
  foundations: cross(
    'Worked example: follow one chromosome pair',
    'w/w; CyO/+; +/+',
    'w/Y; +/+; +/+',
    ['2'],
    ['curly'],
    [
      'Each parent has a pair of chromosome 2s. CyO carries Curly; + is normal here. We follow a known example, not an unknown fly.',
      'An egg takes CyO or +; a sperm from this father takes +. Each gamete has only one chromosome from this pair.',
      'Join an egg chromosome with a sperm chromosome. The offspring has a pair again. A slash describes homologs in one fly, not two flies.',
      'Read phenotype after rebuilding the pair. One CyO is enough for Curly; +/+ has straight wings. Later lessons calculate and test these shares.',
    ],
  ),
  inheritance: cross(
    'Worked example: lethality changes adult ratios',
    'w/w; CyO/+; +/+',
    'w/Y; CyO/+; +/+',
    ['2'],
    ['curly'],
    [
      'Both parents are CyO/+. Predict fertilised eggs first, then ask which combinations reach the adult scoring stage.',
      'Each parent produces CyO or + gametes. Each square is one egg–sperm combination; two squares can describe the same genotype.',
      'CyO/CyO does not survive in this model. Remove it before counting adult proportions. CyO/+ appears twice and +/+ once.',
      'Among survivors, two Curly combinations and one straight combination give 2:1. This is an expectation, not a promise about the next three flies.',
    ],
  ),
  xlinked: cross(
    'Worked example: a heterozygous mother’s X chromosomes',
    '+/w; +/+; +/+',
    '+/Y; +/+; +/+',
    ['X'],
    ['eye'],
    [
      'The mother has + and w at white. The father carries + on his X; his Y supplies no white allele.',
      'List X+ and Xw eggs, then paternal X+ and Y sperm. A son does not obtain his X from his father.',
      'The square traces each maternal X into a daughter or son. A functional copy masks w in a daughter; an Xw/Y son lacks a second copy.',
      'Group by sex AND eye colour. These shares refer to all adults, not sons alone. Changing the maternal alleles changes the sons.',
    ],
    { bySex: true },
  ),
  notation: cross(
    'Worked example: translate a record before crossing',
    'w/w; UAS-GFP/UAS-GFP; +/+',
    'w/Y; Sco/CyO; +/+',
    ['2'],
    ['curly', 'scutoid'],
    [
      'Split at semicolons: X; chromosome 2; chromosome 3. Each slash separates homologs. UAS-GFP/UAS-GFP is one homozygous pair.',
      'Every maternal chromosome-2 gamete carries UAS-GFP. The father contributes Sco or CyO, with their scorable markers.',
      'Combine inherited chromosomes before naming the visible class. In this defined cross, Scutoid and Curly distinguish the paternal homolog.',
      'The inference works because the starting record and cross are known. Curly alone does not establish every hidden locus in an unrelated stock.',
    ],
  ),
  balancers: cross(
    'Worked example: maintain an invisible lethal',
    'w/w; mut/CyO; +/+',
    'w/Y; mut/CyO; +/+',
    ['2'],
    ['curly'],
    [
      'Follow mut and CyO as different chromosomes. mut has no visible marker; CyO supplies Curly and the essential function missing from mut.',
      'Each parent contributes mut or CyO. Keep all combinations initially, including the invisible chromosomes.',
      'mut/mut and CyO/CyO are lethal. The two reciprocal mut/CyO combinations survive and carry the balancer marker.',
      'Every adult retains mut over CyO in this model. Moving mut elsewhere still requires a marker that distinguishes it from a normal homolog.',
    ],
  ),
  chance: model(
    'statistics',
    'Worked example: calculate before judging',
    [
      'The chromosome cross predicts equal Curly and straight adult shares. State that hypothesis before inspecting the sample.',
      'With 20 adults, 20 × 1/2 gives an expected count of 10 in each class. Expected and observed counts are different quantities.',
      'For observed counts 12 and 8, compute (O − E)²/E for each class, then add. Do not compare only the larger class.',
      'Compare the sum with the one-degree-of-freedom critical value. Below it means no rejection, not proof that every alternative is impossible.',
    ],
    { mother: 'w/w; CyO/+; +/+', father: 'w/Y; +/+; +/+', chroms: ['2'], traits: ['curly'], observed: [12, 8], shares: [0.5, 0.5] },
  ),
  recombination: cross(
    'Worked example: keep track of phase',
    'w/w; +/+; GAL4/UAS-RNAi',
    'w/Y; +/+; TM3/TM6B',
    ['3'],
    ['eye'],
    [
      'The mother has GAL4 on one chromosome 3 and UAS-RNAi on the other. Neither original homolog carries both; that is the starting phase.',
      'Female meiosis can make parental gametes and reciprocal products carrying both insertions or neither. The tester contributes a balancer.',
      'Use the full offspring model: recombinant and parental gametes are not equally frequent. The eye marker is a teaching proxy for insertion dosage.',
      'Add both reciprocal recombinant classes for frequency. Keep the wanted product over a balancer, then verify insertion presence and function.',
    ],
    { recombine: true },
  ),
  gal4uas: cross(
    'Worked example: inheritance before expression',
    'w/w; +/+; GAL4/TM3',
    'w/Y; UAS-GFP/UAS-GFP; +/+',
    ['2', '3'],
    ['gfp', 'stubble'],
    [
      'The driver is on chromosome 3; the reporter on chromosome 2. GAL4 and UAS need not share one chromosome.',
      'Every paternal gamete carries UAS-GFP. Maternal gametes carry GAL4 or TM3, so only some offspring inherit the activator.',
      'Rebuild both pairs. A reporter-bearing fly with TM3 instead of GAL4 does not show GAL4-driven GFP in this model.',
      'Separate sorting from interpretation: the non-Stubble class has the driver, but background, expression pattern and construct behaviour still need controls.',
    ],
  ),
  complementation: cross(
    'Worked example: the class that tests function',
    'w/w; mut/CyO; +/+',
    'w/Y; mut2/CyO; +/+',
    ['2'],
    ['curly'],
    [
      'In this known demonstration, mut and mut² disrupt different genes. Each is maintained over CyO; the cross tests whether the non-balancer pair supplies both functions.',
      'List both mutations together, either mutation over CyO, and CyO/CyO. Only the first combination directly tests complementation.',
      'The model’s mut/mut² survives, whereas CyO/CyO does not. Identify the straight-winged test class rather than treating every survivor as the same evidence.',
      'Straight-winged adults support complementation under these assumptions. For unknown lines use self-crosses and controls; absence in a small sample needs care.',
    ],
  ),
};
Object.assign(DEMONSTRATIONS, {
  threepoint: model(
    'mapping',
    'Worked example: a reference three-point map',
    [
      'This fully explained reference uses known X loci and a different sample from your exercise. Write the maternal phase before naming recombinant classes.',
      'Parental classes preserve phase. Compare each DCO with the parental chromosome sharing its outside alleles: the middle allele changes.',
      'For each interval, add its single crossovers and BOTH DCO classes. Divide by all sons and multiply by 100 for the sampled cM estimate.',
      'Expected DCO = N × measured interval fraction I × measured interval fraction II. Coincidence is observed/expected; interference is one minus coincidence. State the viability and scoring assumptions.',
    ],
    {
      order: ['y', 'cv', 'v'],
      shown: ['cv', 'v', 'y'],
      phase: { y: true, cv: false, v: true },
      r: [0.137, 0.193],
      coc: 0.5,
      n: 1200,
      seed: 101,
    },
  ),
  mosaics: model(
    'clones',
    'Worked example: eight independent discs',
    [
      'Start with FRT m / FRT +. An informative FLP/FRT exchange and segregation can generate reciprocal homozygous daughters.',
      'Choose model induction at 36 hours with the 30-minute setting. Earlier events leave more divisions for expansion; these are illustrative settings, not a protocol.',
      'Run eight independent discs with the same controls. Different exchanges and lineage splits produce different clone numbers and sizes.',
      'Compare all discs with the predeclared goal rather than selecting one attractive tissue. This small model sample does not calibrate a laboratory success probability.',
    ],
    { round: 4, minutes: 30, seed: 17, goal: { minClones: 1, maxClones: 5, minLargest: 40 } },
  ),
  target: model('target', 'Worked example: schedule around protein lag', [
    'Keep all three transgenes throughout. This known example keeps development cold and shifts adults warm; regulation changes, chromosome inheritance does not.',
    'At 18 °C, GAL80ts represses GAL4 and target protein is maintained in the model. Temperature also changes developmental duration.',
    'Shift adults to 29 °C. GAL4 activity rises before existing protein disappears. Compare early and late adult points separately.',
    'Measure the full final 48-hour window, not just the final point. Real experiments need matched-temperature controls and direct knockdown measurements.',
  ]),
  screens: model(
    'screen',
    'Worked example: coverage, burden and capacity',
    [
      'Sample independent mutagenised chromosome lines maintained over balancers. Siblings from one founder are not new mutation opportunities.',
      'Use the model’s low preset and 5,000 lines here. Coverage is the chance of at least one target allele, not the share of lines mutating that gene.',
      'Compare presets at the same line count. More hits can increase coverage and also increase multiple-lethal chromosomes.',
      'Translate the plan into vial workload and state the calibration still needed. Plan candidate recovery, mapping, independent verification and causal follow-up.',
    ],
    { dose: 15, lines: 5000 },
  ),
});
// A teaching bridge introduces an operation before the learner is asked to do it.
export const BRIDGES = {
  inheritance: [
    [
      'Two pairs at once',
      'Independent assortment, slowly',
      'assortment',
      [
        'A gamete takes one homolog from pair 2 AND one from pair 3. Choosing CyO does not force the choice of TM3.',
        'Draw a branching tree: two first choices, each with two second choices. That is four gamete types, not four chromosomes in one gamete.',
      ],
    ],
    [
      'Curly × Curly',
      'Choose the denominator before the ratio',
      'lethals',
      [
        'A possible fertilised egg may never appear among adults. Keep separate lists of zygote combinations and surviving combinations.',
        'Use the survivor list when a question asks for a share of adults. The lethal genotype cannot stay in that denominator.',
      ],
    ],
  ],
  xlinked: [
    [
      'Swap the parents',
      'Why reciprocal crosses can differ',
      'reciprocal',
      [
        'In the usual XX/XY cross, fathers pass X to daughters and Y to sons; mothers pass X to every offspring.',
        'Swapping the sex carrying w changes which X the sons receive. Trace the chromosomes again instead of carrying the first answer over.',
      ],
    ],
  ],
  balancers: [
    [
      'Crossing over in a female',
      'Chromatids, phase and exchange',
      'recombination',
      [
        'Each homolog is copied into sister chromatids before meiosis. An exchange between non-sisters can change allele combinations.',
        'Call a gamete recombinant relative to the starting phase; merely having two insertions is not always a new combination.',
      ],
    ],
  ],
  chance: [
    [
      'Test a Curly × Curly vial',
      'State the hypothesis before testing',
      'chance',
      [
        'Translate the cross into adult shares, then expected counts. The hypothesis is the chromosome model, not whichever ratio looks closest after trying several.',
        'Several hypotheses may remain compatible with a small sample. Failure to reject one does not exclude the others.',
      ],
    ],
  ],
  recombination: [
    [
      'Measure the distance',
      'Choose the numerator from phase',
      'recombination',
      [
        'Each parental maternal chromosome carries one insertion. Both together and neither are reciprocal recombinants in this phase.',
        'Count both products for frequency. The desired both-insertions class is only part of that total.',
      ],
    ],
  ],
  gal4uas: [
    [
      'The experiment and its siblings',
      'What a sibling control can establish',
      'gal4uas',
      [
        'Responder-only siblings share parents and much of the environment with experimental flies. They help control those shared conditions.',
        'They still differ at the driver/balancer chromosome. They are not genetically identical, and are not the only necessary control.',
      ],
    ],
  ],
  complementation: [
    [
      'Map the mutations',
      'Use inclusion AND exclusion',
      'complementation',
      [
        'A failing deficiency places the candidate within its deletion under this model; complementation excludes its deleted genes.',
        'Keep regions consistent with every result. A narrow interval still needs a gene-specific causal test.',
      ],
    ],
  ],
  threepoint: [
    [
      'Find the middle gene, then build the map',
      'Classify chromosomes before calculating',
      'threepoint',
      [
        'Find reciprocal parental and DCO pairs, then compare allele arrangements to infer the middle locus.',
        'Only then do interval totals have meaning. Each DCO belongs in both interval numerators even though outside markers return to their parental arrangement.',
      ],
    ],
  ],
  mosaics: [
    [
      'Make many small clones',
      'From a disc to a replicate experiment',
      'mosaics',
      [
        'One tissue cannot establish an induction plan’s behaviour. Apply a fixed goal across independent tissues and inspect the spread.',
        'Later induction leaves fewer divisions for each lineage; induction strength changes event frequency, not a clone’s age.',
      ],
    ],
  ],
  target: [
    [
      'A pupal pulse, then recovery',
      'Repression is not instant recovery',
      'target',
      [
        'Returning cold represses further RNAi activation, but target protein must be made again. Recovery can lag after the switch.',
        'Define the depletion and recovery windows, then inspect all their points rather than just the temperature labels.',
      ],
    ],
  ],
  screens: [
    [
      'A tighter fly room',
      'Solve constraints together',
      'screens',
      [
        'A strong preset can satisfy coverage but violate the acceptable multiple-hit burden. More lines cannot fix that per-chromosome complexity.',
        'A weak preset can have acceptable complexity yet need more lines than the room can maintain. Check every constraint before choosing coverage alone.',
      ],
    ],
  ],
};
const diagnosis = (question, options) => ({
  type: 'choice',
  stage: 'diagnose',
  title: 'Investigate the evidence',
  question,
  options: options.map(([text, why, correct]) => ({ text, why, correct: !!correct })),
});
export const DIAGNOSES = {
  foundations: diagnosis('Two flies look the same. Must their chromosome pairs be identical?', [
    [
      'No: recessive alleles may be masked and many genetic differences are not visibly scored.',
      'Phenotype is an observation; different genotypes can give the same observation in the conditions.',
      true,
    ],
    ['Yes: phenotype is a complete genotype readout.', 'A chromosome carries unseen alleles; one marker reports only part of its content.'],
  ]),
  inheritance: diagnosis('A colleague predicts 3/4 Curly adults from CyO/+ × CyO/+. What should be checked first?', [
    [
      'They kept lethal CyO/CyO in the adult denominator.',
      'That pair does not survive in the model. Recalculate using viable combinations.',
      true,
    ],
    ['They forgot two chromosome 2s in each egg.', 'An egg has one member of this pair; fertilisation restores two.'],
    ['Curly must have changed chromosome.', 'A prediction error need not require a new chromosome event. Check viability first.'],
  ]),
  xlinked: diagnosis('White daughters appear in a planned w/w female × +/Y male cross. What is the next useful investigation?', [
    [
      'Audit stock identity and collection/mating records, then repeat with independently documented virgins.',
      'Within this chromosome system a white daughter needs paternal w. Check the evidence before assigning a particular hidden history.',
      true,
    ],
    ['Count more until the class disappears.', 'More counts do not explain how the paternal allele entered those daughters.'],
    ['Declare every female previously mated.', 'The class suggests unintended paternity here, not every mother’s individual history.'],
  ]),
  notation: diagnosis('An unknown Curly fly is labelled mut/CyO from appearance alone. What is missing?', [
    [
      'Evidence for its non-CyO homolog from a documented cross or verification.',
      'Curly tracks CyO; mut/CyO and +/CyO can look the same.',
      true,
    ],
    ['A second CyO so the line breeds true.', 'CyO/CyO is lethal here and would not verify the unseen homolog.'],
  ]),
  balancers: diagnosis('A Curly class mixes mut/CyO with +/CyO. Why not fix it by keeping more Curly siblings?', [
    [
      'The marker cannot distinguish their unmarked homologs.',
      'More copies of an ambiguous class do not establish mut. Use an informative intermediate or verification.',
      true,
    ],
    ['More siblings make every unmarked homolog become mut.', 'Sampling does not convert a normal homolog into mut.'],
  ]),
  chance: diagnosis('A small sample fits both 1:1 and 2:1. What improves the next experiment?', [
    [
      'Predefine hypotheses and obtain enough independent offspring or replicate crosses to distinguish them.',
      'A shared fit is not confirmation. More informative evidence addresses the uncertainty.',
      true,
    ],
    ['Choose the smaller chi-square and call the ratio proven.', 'Fit alone does not establish the underlying chromosome model.'],
  ]),
  recombination: diagnosis('A dark-orange candidate fails to activate a reporter. What should be investigated?', [
    [
      'Verify insertion identity and driver function, assay conditions and controls.',
      'Marker dosage suggested a chromosome combination; it did not establish intact functional transgenes.',
      true,
    ],
    [
      'Treat eye colour as sufficient proof and ignore the functional result.',
      'A marker proxy cannot overrule independent functional evidence.',
    ],
  ]),
  gal4uas: diagnosis('One RNAi line gives a phenotype but an independent line does not. What is justified?', [
    [
      'Investigate efficiency, expression and line-specific effects before assigning the phenotype to the target.',
      'Constructs can differ in knockdown, background and off-target effects. Independent evidence is needed.',
      true,
    ],
    ['The first line proves the target is causal.', 'One chromosome cannot separate the target effect from every line-specific effect.'],
  ]),
  complementation: diagnosis('A deficiency maps a lethal to a small region. Is the responsible gene proved?', [
    [
      'No: test gene-specific alleles, rescue and molecular evidence.',
      'A deletion can remove multiple functions. Regional evidence is not a gene-specific causal test.',
      true,
    ],
    ['Yes: the nearest gene must be responsible.', 'Proximity does not identify which deleted function matters.'],
  ]),
  threepoint: diagnosis('Coincidence looks strange after rare classes were omitted. What should be checked first?', [
    [
      'Restore DCOs to both interval totals and recompute expectation from measured fractions.',
      'DCO chromosomes affect the observed count and the fractions used in its expectation.',
      true,
    ],
    [
      'Replace measured intervals with reference values without checking counts.',
      'That can hide a scoring error and discard sample evidence.',
    ],
  ]),
  mosaics: diagnosis('One mutant patch is smaller than its twin. What best tests a growth-defect explanation?', [
    [
      'Compare many matched reciprocal clones and genotype controls in independent tissues.',
      'Inheritance is informative, but lineage history, position and survival remain alternatives.',
      true,
    ],
    ['Treat the one patch as definitive for the genotype.', 'One pair does not resolve competing explanations.'],
  ]),
  target: diagnosis('RNAi is activated but an assay two hours later is normal. What is the next check?', [
    [
      'Measure target protein and expression timing, then allow an appropriate depletion window.',
      'The chromosomes and active GAL4 can coexist with previously made functional target protein.',
      true,
    ],
    ['Assume temperature deleted GAL80ts.', 'Temperature regulates the repressor here, not inheritance of its chromosome.'],
  ]),
  screens: diagnosis('No target allele appears in a screen designed for 95% model coverage. What follows?', [
    [
      'A miss is possible; review recovery, detection and calibration as well as chance.',
      'Coverage is a conditional probability over independent chromosomes, not a guarantee.',
      true,
    ],
    ['The target cannot be mutated.', 'A finite negative screen cannot establish that.'],
  ]),
};
export function scaffoldLesson(id, lesson) {
  const curriculum = CURRICULUM[id];
  if (!curriculum || !DEMONSTRATIONS[id]) return { ...lesson, curriculum };
  const steps = [];
  let demonstrated = false;
  const seen = new Set();
  for (const original of lesson.steps) {
    const active = !['text', 'go'].includes(original.type);
    if (active && !demonstrated) {
      steps.push(DEMONSTRATIONS[id]);
      demonstrated = true;
    }
    for (const [before, title, visual, body] of BRIDGES[id] || [])
      if (original.title === before) steps.push({ type: 'text', stage: 'teach', title, visual, body });
    if (original.type === 'go') steps.push(DIAGNOSES[id]);
    steps.push({ ...original, stage: original.stage || (active ? (seen.has(original.type) ? 'practise' : 'guide') : 'teach') });
    if (active) seen.add(original.type);
  }
  if (!demonstrated) steps.push(DEMONSTRATIONS[id]);
  if (steps.at(-1).type !== 'go') steps.push(DIAGNOSES[id]);
  return { ...lesson, curriculum, steps };
}
// Reference-aligned extensions: Prokop student guide §3–4 and full guide §5.2/Box 9.
CURRICULUM.flyroom = plan(
  'Beginner',
  ['tour'],
  [
    'Recognise eggs, larvae, pupae and adults.',
    'Keep source, generation and clearing records.',
    'Separate sex identification from virginity evidence.',
  ],
  {
    eclosion: 'Emergence of an adult fly from its pupal case.',
    instar: 'A larval stage between moults.',
    F1: 'The first filial offspring generation of the recorded parental cross.',
  },
  ['Identify the life-cycle stage.', 'Read the source and generation record.', 'Use anatomy for sex and reliable history for collection.'],
);
CURRICULUM.strategies = plan(
  'Advanced',
  ['gal4uas', 'complementation', 'mosaics'],
  [
    'Match forward/reverse and loss/gain approaches to a question.',
    'Distinguish reporter, protein-tag and clone-marker evidence.',
    'Separate maternal supply from zygotic genotype and choose causal follow-ups.',
  ],
  {
    MARCM: 'Mosaic analysis using loss of a repressible marker to identify an informative mutant lineage.',
    'maternal contribution': 'RNA or protein supplied to the egg by the mother.',
    'zygotic expression': 'Expression from the developing offspring’s own genome.',
  },
  [
    'State the biological question and readout.',
    'Identify what the genetic tool measures or perturbs.',
    'Choose an independent observation that distinguishes the main alternative.',
  ],
);
DEMONSTRATIONS.flyroom = model(
  'concept',
  'Worked example: read the developing vial',
  [
    'Adults supply eggs to a labelled cross vial. Record their identity and collection history before following the next generation.',
    'Larvae hatch, feed and pass through instars. Developing offspring can be present even when there are no new adults to score.',
    'Pupae undergo metamorphosis. Keep the parent-removal and generation records so older adults are not confused with new F1 adults.',
    'New adults eclose. Use the documented clearing interval and actual conditions for collection; do not infer every mating history from body colour.',
  ],
  { visual: 'life-cycle' },
);
DEMONSTRATIONS.strategies = model(
  'concept',
  'Worked example: a repressible clone marker',
  [
    'In this defined MARCM design, mutation m and GAL80 lie on opposite homologs distal to matching FRT sites. GAL4 and UAS-GFP are present but the repressor keeps the reporter off.',
    'An informative FLP/FRT exchange and segregation can separate the mutation from GAL80. This is a mechanism demonstration, not a simulation of every segregation outcome.',
    'The shown m/m daughter loses GAL80. Its reciprocal +/+ counterpart retains GAL80; keep the genotype of each lineage distinct from the marker state.',
    'The de-repressed clone can express GFP where GAL4 is active. This helps identify the lineage, while matched controls and a separate biological readout test the gene-function explanation.',
  ],
  { visual: 'marcm' },
);
DIAGNOSES.flyroom = diagnosis('A white-eyed adult was found among a scored F1 sample. Could it simply be a parent left in the vial?', [
  [
    'It is a competing explanation to check against parent-removal, generation and source records.',
    'An adult’s appearance is not its generation label. Good records connect the phenotype to the intended cross.',
    true,
  ],
  [
    'No: every adult in a vial must belong to the same generation.',
    'Parents and newly emerged offspring can coexist if they are not separated.',
  ],
]);
DIAGNOSES.strategies = diagnosis('A marked mutant clone has an altered reporter pattern. What best strengthens a causal interpretation?', [
  [
    'Compare genotype-matched control clones, independent alleles or rescue and the relevant biological readout.',
    'The marker identifies a designed lineage; it does not remove induction, background or reporter-specific alternatives.',
    true,
  ],
  [
    'Treat fluorescent marking alone as proof of gene function.',
    'Marker inheritance and a causal biological effect are different observations.',
  ],
]);
PATH[0].lessons.splice(1, 0, 'flyroom');
PATH[3].lessons.push('strategies');
CURRICULUM['research-project'].prerequisites.push('strategies');
