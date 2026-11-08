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
    goal: 'Handle flies, use vial records and learn how genetic information is inherited.',
  },
  {
    title: '2 · Read and predict',
    level: 'Foundations',
    lessons: ['inheritance', 'xlinked', 'first-cross', 'notation'],
    goal: 'Read a stock label and predict which chromosomes its offspring can inherit.',
  },
  {
    title: '3 · Build and verify',
    level: 'Intermediate',
    lessons: ['balancers', 'chance', 'recombination', 'planner'],
    goal: 'Keep stocks, plan crosses over generations, analyse counts and check the resulting lines.',
  },
  {
    title: '4 · Design experiments',
    level: 'Advanced',
    lessons: ['gal4uas', 'complementation', 'threepoint', 'mosaics', 'target', 'screens'],
    goal: 'Choose tools and controls, plan sample sizes and decide when to measure the effect.',
  },
  {
    title: '5 · Research investigations',
    level: 'Integrated practice',
    lessons: ['investigation', 'research-project'],
    goal: 'Keep track of an unmarked mutation, build a three-generation stock and explain what the evidence shows.',
  },
];
const plan = (level, prerequisites, objectives, terms, coach) => ({ level, prerequisites, objectives, terms, coach });
export const CURRICULUM = {
  foundations: plan(
    'Beginner',
    [],
    [
      'Tell a chromosome, a gene and an allele apart.',
      'Connect the genes a fly carries to the traits you can see.',
      'Explain why an egg or sperm takes one chromosome from every pair.',
    ],
    {
      chromosome: 'A structure made of DNA and proteins that carries many genes.',
      gene: 'A stretch of DNA whose activity contributes to a function or trait.',
      allele: 'A version of a gene found at the same place on matching chromosomes.',
      homolog: 'One chromosome in a matching pair.',
      genotype: 'The alleles or chromosome combination an organism carries.',
      phenotype: 'A trait you can observe, such as wing shape.',
    },
    [
      'Name what each bar represents.',
      'Count chromosomes before naming alleles.',
      'Separate what you see from what you conclude about the genes.',
    ],
  ),
  inheritance: plan(
    'Foundations',
    ['foundations'],
    [
      'Find the egg and sperm types from one or two chromosome pairs.',
      'Join egg and sperm chromosomes to predict the offspring.',
      'Use the right total when counting fertilised eggs or surviving adults.',
    ],
    {
      gamete: 'An egg or sperm carrying one chromosome from every pair.',
      meiosis: 'The cell divisions that make eggs and sperm with one chromosome from each pair.',
      dominant: 'An effect that shows when one copy of the allele is present.',
      lethal: 'A chromosome combination that dies before the stage you score.',
    },
    [
      'List the maternal gametes.',
      'List the sperm types. Join each egg type with each sperm type.',
      'Remove combinations that die before calculating shares of adults.',
    ],
  ),
  xlinked: plan(
    'Foundations',
    ['inheritance'],
    [
      'Trace X chromosomes through sons and daughters.',
      'Predict reciprocal crosses.',
      'Use an unexpected offspring class to investigate which male was the father.',
    ],
    {
      hemizygous: 'Having one copy of a gene, as at many X-linked genes in an XY male.',
      recessive: 'An effect hidden by a working copy on the other chromosome.',
      reciprocal: 'A cross in which the two parental genotypes swap sexes.',
    },
    [
      'Write the maternal X.',
      "Add the father's X for a daughter or his Y for a son.",
      'Count normal white copies, then group the offspring by sex and eye colour.',
    ],
  ),
  notation: plan(
    'Foundations',
    ['inheritance', 'xlinked'],
    [
      'Read slashes, semicolons, + and Y.',
      "Distinguish a chromosome's name from the marker it carries.",
      'Distinguish a recorded genotype from one inferred from appearance.',
    ],
    {
      '/': 'Separates the two chromosomes in a pair.',
      ';': 'Separates chromosome groups.',
      '+': 'Normal at the genes listed in the record.',
      marker: 'A visible or measurable trait used to follow a chromosome.',
    },
    [
      'Split at semicolons.',
      'Read a slash as a pair inside one fly, not a cross between flies.',
      'Check what the marker identifies and what remains unknown.',
    ],
  ),
  balancers: plan(
    'Intermediate',
    ['notation'],
    [
      "Explain a balancer's marker, lethal combinations and reversed DNA segments.",
      'Keep track of an unmarked mutation while building a new stock.',
      'Choose the right balancer class.',
    ],
    {
      balancer: 'A chromosome with features that help maintain and track its partner.',
      inversion: 'A reversed DNA segment. Balancer inversions make recovered recombinant chromosomes rare.',
      stock: 'A population of flies kept with a recorded genetic composition.',
    },
    [
      'Identify the chromosome you need before choosing a visible marker.',
      'Check which chromosome you lose when you keep a group of flies.',
      'Ask whether different unmarked chromosomes could give the same appearance.',
    ],
  ),
  chance: plan(
    'Intermediate',
    ['inheritance'],
    [
      'Explain sampling variation.',
      'Calculate expected counts and compare them with the observed counts using chi-square.',
      'Distinguish a ratio difference from an offspring type the cross cannot produce.',
    ],
    {
      hypothesis: 'An explanation with a prediction you can test.',
      expected: 'The count predicted by a hypothesis for your sample size.',
      power: 'The chance of detecting a real difference with the planned experiment.',
    },
    ['State the genetic hypothesis.', 'Multiply each predicted adult share by the sample size.', 'Failure to reject is not proof.'],
  ),
  recombination: plan(
    'Intermediate',
    ['balancers', 'chance'],
    [
      "Distinguish the parents' allele combinations from new combinations made by exchange.",
      'Estimate recombination frequency.',
      'Keep separately recovered lines and check that they carry the wanted insertions.',
    ],
    {
      linkage: 'Genes on the same chromosome can be inherited together rather than sorted independently.',
      recombinant: 'A chromosome with a new combination of the alleles you are following.',
      cM: 'A genetic-map unit. One percent recombination is about one cM for a short interval.',
    },
    [
      'Write maternal phase.',
      'Count both types made by the exchange.',
      'Follow the balancer, then check that the insertions are present and work.',
    ],
  ),
  gal4uas: plan(
    'Advanced',
    ['balancers'],
    [
      'Distinguish inheriting an inserted gene from expressing it.',
      'Identify experimental flies and siblings that can serve as controls.',
      'Choose controls that distinguish the possible causes of a phenotype.',
    ],
    {
      driver: 'A GAL4 construct whose control DNA determines where and when GAL4 is made.',
      responder: 'A gene linked to UAS DNA sites that GAL4 can activate.',
      background: 'The other genetic variants in the experimental flies and controls.',
    },
    [
      'Track driver and responder separately.',
      'Check that both parts are present and active before predicting expression.',
      'Match conditions and background. Add checks with separately derived constructs.',
    ],
  ),
  complementation: plan(
    'Advanced',
    ['balancers', 'chance'],
    [
      'Check whether two different mutant chromosomes together supply working gene copies.',
      'Use control crosses to interpret a complementation grid.',
      'Narrow the possible chromosome region, then choose a test of the candidate gene.',
    ],
    {
      complementation: 'When two mutant chromosomes together supply the gene functions needed for the scored trait or survival.',
      deficiency: 'A chromosome missing a stretch of DNA.',
      rescue: 'Adding a working gene copy to see whether it restores the lost trait or survival.',
    },
    [
      'Identify the offspring carrying both mutant chromosomes rather than a balancer.',
      'Check self-cross and control outcomes.',
      'Keep regions shared by the failing deletions. Exclude regions removed by deletions that complement.',
    ],
  ),
  threepoint: plan(
    'Advanced',
    ['recombination', 'chance'],
    [
      'Work out which maternal alleles lie together and infer their order.',
      'Count double crossovers in both intervals.',
      'Calculate coincidence and explain what the estimate depends on.',
    ],
    {
      phase: 'The combination of alleles carried together on each chromosome of a pair.',
      DCO: 'A double-crossover product.',
      interference:
        'One minus the coefficient of coincidence. Positive interference means fewer double crossovers than expected from independent exchanges.',
    },
    [
      'Find reciprocal classes.',
      'Compare each DCO chromosome with the parental chromosome it most closely matches.',
      'Calculate expected DCOs from the interval fractions measured in your sample.',
    ],
  ),
  mosaics: plan(
    'Advanced',
    ['recombination'],
    [
      'Follow the two daughter chromosome combinations into growing cell patches.',
      'Predict induction-time effects.',
      'Compare independent tissues and matched controls.',
    ],
    {
      FRT: 'A DNA site recognised by FLP, an enzyme that exchanges DNA between matching sites.',
      clone: 'A group of cells descended from one cell.',
      'twin spot': 'The other marked cell lineage produced by the same chromosome exchange and segregation.',
    },
    [
      'Locate FRT relative to m.',
      'Predict how induction age will affect clone size before you run the experiment.',
      'Compare separately sampled tissues and the paired daughter lineages.',
    ],
  ),
  target: plan(
    'Advanced',
    ['gal4uas'],
    [
      'Distinguish the DNA present, GAL4 activity and target-protein amount.',
      'Choose shifts that give the required protein level when you measure the phenotype.',
      'Use temperature controls and measure the reduction in the target.',
    ],
    {
      perdurance: 'Protein remaining after the cell makes less of it or stops making it.',
      GAL80ts: 'A temperature-sensitive protein that blocks GAL4.',
      'assay window': 'The period during which you measure the biological result.',
    },
    [
      'Set the stages to protect and the period to measure.',
      'Allow time for the switch and for existing protein to break down.',
      'Use matched controls and measure the change in the target.',
    ],
  ),
  screens: plan(
    'Advanced',
    ['balancers', 'chance'],
    [
      'Count different founding chromosomes, not siblings carrying their copies.',
      'Balance the chance of finding an allele, extra mutations and space for lines.',
      'Identify which rates and results need checking in a real experiment.',
    ],
    {
      coverage: 'The chance of finding at least one allele of your target gene.',
      independent: 'Separate founding mutation events rather than copies of the same chromosome.',
      'multiple-hit burden': 'The share of lethal lines that carry several lethal mutations.',
    },
    [
      'Define the sampling unit.',
      'Compare presets at fixed capacity.',
      'Plan how to recover candidates and test which gene causes the effect.',
    ],
  ),
  investigation: plan(
    'Integrated practice',
    ['balancers', 'chance', 'complementation'],
    [
      'Preserve an unmarked lethal across generations.',
      'Explain why a visible group can contain different hidden genotypes.',
      'Choose evidence that establishes chromosome identity beyond appearance alone.',
    ],
    { intermediate: 'A selected stock used to make the next generation in a cross plan.' },
    [
      'Record which chromosome you must keep.',
      'Choose a marker that lets you distinguish that chromosome from +.',
      'Declare the target only when every fly in the selected class can have the required genotype.',
    ],
  ),
  'research-project': plan(
    'Integrated practice',
    ['investigation', 'recombination', 'gal4uas', 'target', 'screens', 'threepoint', 'mosaics'],
    [
      'Build a balanced stock with a reporter and the combined driver–RNAi chromosome.',
      'Connect the stock build to checks of identity, controls and assay timing.',
      'Explain what supports a mechanism and what remains untested.',
    ],
    { 'independent line': 'A separately derived line used to check whether a result depends on one genetic event.' },
    [
      'Plan backwards, chromosome by chromosome.',
      'Make recombinant chromosomes in females while preparing the other stocks.',
      'Check that the insertions are present and work before explaining the phenotype.',
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
      'Each parent has a pair of chromosome 2s. CyO carries Curly; + is normal here. Start by reading these known parental chromosomes.',
      'The mother produces CyO or + eggs. This father produces only + sperm. Each gamete takes one chromosome from this pair.',
      'Join one egg chromosome with one sperm chromosome. The offspring has a pair again. A slash separates the two chromosomes inside that fly.',
      'Now read the visible trait. One CyO gives Curly wings, while +/+ gives straight wings. You will calculate and test these shares in the next lessons.',
    ],
  ),
  inheritance: cross(
    'Worked example: lethality changes adult ratios',
    'w/w; CyO/+; +/+',
    'w/Y; CyO/+; +/+',
    ['2'],
    ['curly'],
    [
      'Both parents are CyO/+. First list the fertilised-egg combinations, then check which can survive to adulthood.',
      'Each parent makes CyO or + gametes. A square joins one egg with one sperm. Different squares can give the same offspring genotype.',
      'CyO/CyO does not survive. Remove that square before calculating adult shares. CyO/+ appears twice and +/+ once.',
      'Two Curly combinations and one straight combination survive, giving an expected 2:1 adult ratio. Individual vials can differ by chance.',
    ],
  ),
  xlinked: cross(
    'Worked example: a heterozygous mother’s X chromosomes',
    '+/w; +/+; +/+',
    '+/Y; +/+; +/+',
    ['X'],
    ['eye'],
    [
      "At the white gene, the mother carries + on one X and w on the other. The father's X carries +; his Y has no white allele.",
      "List the mother's X+ and Xw eggs, then the father's X+ and Y sperm. Track each X from the parent that supplies it.",
      'Follow each maternal X into a daughter or son. A working white copy masks w in a daughter. An Xw/Y son has no second copy.',
      "Group offspring by sex and eye colour. The shares refer to all adults, not just sons. Changing the mother's alleles changes what her sons inherit.",
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
      'Split the record at semicolons: X; chromosome 2; chromosome 3. Each slash separates a chromosome pair. UAS-GFP/UAS-GFP means both chromosomes carry UAS-GFP: the fly is homozygous for it.',
      'Every maternal chromosome-2 gamete carries UAS-GFP. A paternal gamete carries Sco or CyO. Their visible markers let you follow that choice.',
      'Join the chromosomes first, then name the visible group. Here Scutoid identifies paternal Sco, while Curly identifies paternal CyO.',
      "This inference uses the known parents and their cross. Curly on an unrelated fly would not tell you its other chromosome's hidden alleles.",
    ],
  ),
  balancers: cross(
    'Worked example: maintain an invisible lethal',
    'w/w; mut/CyO; +/+',
    'w/Y; mut/CyO; +/+',
    ['2'],
    ['curly'],
    [
      'Track mut and CyO as separate chromosomes. mut has no visible marker. CyO carries Curly and a working copy of the gene affected by mut.',
      'Each parent passes on mut or CyO. List every egg–sperm combination, even when one chromosome has no visible marker.',
      'mut/mut and CyO/CyO die. Both mixed combinations survive as mut/CyO and have Curly wings.',
      'Every adult keeps mut over CyO. To move mut to another stock, choose markers that keep it distinguishable from a normal chromosome at every step.',
    ],
  ),
  chance: model(
    'statistics',
    'Worked example: calculate before judging',
    [
      'The cross predicts equal Curly and straight adult shares. State this predicted ratio before inspecting the observed counts.',
      'For 20 adults, 20 × 1/2 predicts 10 of each class. These are expected counts; the observed counts may differ.',
      'The observed counts are 12 and 8. Calculate (O − E)²/E for each class and add the results, including the contribution from the smaller class.',
      'Compare the sum with the threshold for one degree of freedom. A value below it does not reject this ratio, but another ratio might fit too.',
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
      'The mother has GAL4 on one chromosome 3 and UAS-RNAi on the other. This starting arrangement is called phase. Neither chromosome yet carries both insertions.',
      'During egg formation, this female can make the original combinations or chromosomes with both insertions or neither. The male supplies a balancer chromosome.',
      'The table uses the full offspring probabilities because parental and recombinant gametes have different frequencies. Use the eye marker to follow insertion copy number.',
      'Count both recombinant types when estimating exchange frequency. Keep the wanted type over a balancer, then check its DNA and test that the insertions work.',
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
      'The driver is on chromosome 3 and the reporter on chromosome 2. GAL4 can activate UAS without being on the same chromosome.',
      'Every sperm carries UAS-GFP. An egg carries GAL4 or TM3, so only some offspring inherit the activator.',
      'Rebuild both chromosome pairs. An offspring carrying the reporter with TM3 instead of GAL4 lacks the activator needed to make GFP.',
      'Use non-Stubble to find the driver-bearing class. Then use controls to test whether the driver pattern, genetic background or construct itself explains the result.',
    ],
  ),
  complementation: cross(
    'Worked example: the class that tests function',
    'w/w; mut/CyO; +/+',
    'w/Y; mut2/CyO; +/+',
    ['2'],
    ['curly'],
    [
      'Here mut and mut² affect different genes, and each is kept over CyO. The cross tests whether a fly with both mutant chromosomes still has each needed gene function.',
      'List the two mutations together, each mutation over CyO, and CyO/CyO. The offspring with both mutant chromosomes are the complementation test.',
      'mut/mut² survives; CyO/CyO does not. The straight-winged adults are the group carrying both mutations, so they provide the relevant evidence.',
      'Straight-winged adults support complementation. For unknown lines, include self-crosses and controls, and count enough offspring before concluding a class is absent.',
    ],
  ),
};
Object.assign(DEMONSTRATIONS, {
  threepoint: model(
    'mapping',
    'Worked example: a reference three-point map',
    [
      'This worked example uses known X-linked genes and a different sample. Write the alleles on each maternal chromosome before deciding which offspring are recombinant.',
      'Compare each double-crossover chromosome, or DCO, with the parental chromosome sharing its outside alleles. The allele that differs identifies the middle gene.',
      'For each interval, add its single-crossover classes and both DCO classes. Divide by the total sons and multiply by 100 to estimate the distance in cM.',
      'Expected DCO = N × measured interval fraction I × measured interval fraction II. Coincidence is observed/expected DCO. Interference is one minus coincidence.',
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
      'Begin with FRT m / FRT +. FLP/FRT exchange followed by the right chromosome segregation can give one mutant daughter and one normal daughter.',
      'Induce exchange at 36 hours using the 30-minute setting. Earlier exchanges leave more divisions for a lineage to grow. Keep this plan fixed across the discs.',
      'Run eight independent discs with the same settings. Exchange events and later cell divisions vary, so the resulting clone counts and sizes also vary.',
      'Compare every disc with the goal you set in advance. Do not judge the plan by choosing only the disc that looks best.',
    ],
    { round: 4, minutes: 30, seed: 17, goal: { minClones: 1, maxClones: 5, minLargest: 40 } },
  ),
  target: model('target', 'Worked example: schedule around protein lag', [
    'All three transgenes stay in the fly. Keep development cold and shift adults warm to change their activity, not which chromosomes the fly carries.',
    'At 18 °C, GAL80ts blocks GAL4 and target protein stays high. Note that temperature also changes how long each developmental stage lasts.',
    'Shift adults to 29 °C. Compare early and late measurements: GAL4 activity rises before the existing target protein has disappeared.',
    'Check the whole final 48-hour period, not just its last point. Use controls under the same temperatures and measure the target protein directly.',
  ]),
  screens: model(
    'screen',
    'Worked example: coverage, burden and capacity',
    [
      'Start independent lines from different mutagenised chromosomes and keep each over a balancer. Siblings from one founder copy the same mutations.',
      'Choose the low preset and 5,000 lines. Coverage means the chance of finding at least one target allele, not the fraction of lines with that allele.',
      'Compare all presets at the same line count. A higher hit rate can increase coverage but also give more chromosomes with several lethal mutations.',
      'Calculate how many vials the plan needs. Before starting, decide how you will recover candidates, map their mutations and test which gene causes the phenotype.',
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
        'Choose one chromosome from pair 2 and one from pair 3. Choosing CyO does not decide whether the other chromosome carries TM3.',
        'Draw two first choices. Each can be followed by two second choices, giving four gamete types. Each gamete still contains just one chromosome from each pair.',
      ],
    ],
    [
      'Curly × Curly',
      'Choose the denominator before the ratio',
      'lethals',
      [
        'A fertilised egg may have a genotype that dies before adulthood. List the fertilised-egg combinations, then make a separate list of survivors.',
        'For a share of adults, divide by surviving flies only. Leave the lethal combination out of that total.',
      ],
    ],
  ],
  xlinked: [
    [
      'Swap the parents',
      'Why reciprocal crosses can differ',
      'reciprocal',
      [
        'In this XX/XY cross, the father passes X to daughters and Y to sons. The mother passes X to every offspring.',
        'Changing which parent carries w changes which X reaches the sons. Trace the chromosomes again rather than reusing the first answer.',
      ],
    ],
  ],
  balancers: [
    [
      'Crossing over in a female',
      'Chromatids, phase and exchange',
      'recombination',
      [
        'Before meiosis, each chromosome is copied into two sister chromatids. A crossover between copies from different homologues can make new allele combinations.',
        "Compare each product with the mother's starting allele arrangement, or phase. A chromosome is recombinant only if it has a new combination relative to that start.",
      ],
    ],
  ],
  chance: [
    [
      'Test a Curly × Curly vial',
      'State the hypothesis before testing',
      'chance',
      [
        'Derive the expected adult shares from the cross, then turn them into expected counts. State that hypothesis before testing several ratios against the data.',
        'A small sample may fit several hypotheses. Failing to reject one does not rule out the others.',
      ],
    ],
  ],
  recombination: [
    [
      'Measure the distance',
      'Choose the numerator from phase',
      'recombination',
      [
        'Each original maternal chromosome carries one insertion. In this phase, the chromosomes carrying both or neither are the two recombinant products.',
        'Count both recombinant products for recombination frequency. The product carrying both insertions is only part of that count.',
      ],
    ],
  ],
  gal4uas: [
    [
      'The experiment and its siblings',
      'What a sibling control can establish',
      'gal4uas',
      [
        'Responder-only siblings share parents and rearing conditions with the experimental flies. Use them to check the effects of those shared conditions.',
        'They still differ at the driver/balancer chromosome. Use other controls to test that genetic difference as well.',
      ],
    ],
  ],
  complementation: [
    [
      'Map the mutations',
      'Use inclusion AND exclusion',
      'complementation',
      [
        'Failure with a deficiency places the candidate inside its deleted region. Complementation rules out the genes that deficiency removes.',
        'Find a region consistent with every cross. Then test a specific gene within it; a small mapped region is not yet a causal result.',
      ],
    ],
  ],
  threepoint: [
    [
      'Find the middle gene, then build the map',
      'Classify chromosomes before calculating',
      'threepoint',
      [
        'Find the paired parental classes and paired DCO classes. Compare their allele combinations to identify the middle gene.',
        'Then calculate the interval totals. Each DCO counts in both intervals, even though its outside markers match a parental combination.',
      ],
    ],
  ],
  mosaics: [
    [
      'Make many small clones',
      'From a disc to a replicate experiment',
      'mosaics',
      [
        'Test the same goal across independent tissues. Compare the range of outcomes rather than judging the plan from one disc.',
        'Later induction leaves fewer divisions for each clone to grow. Increasing induction strength changes the chance of exchange, not the age of the clone.',
      ],
    ],
  ],
  target: [
    [
      'A pupal pulse, then recovery',
      'Repression is not instant recovery',
      'target',
      [
        'A cold shift blocks further GAL4 activation of RNAi. The cell still needs time to make target protein again.',
        'Set the periods that need depletion and recovery. Check all points in those periods, not just the temperature settings.',
      ],
    ],
  ],
  screens: [
    [
      'A tighter fly room',
      'Solve constraints together',
      'screens',
      [
        'A strong preset may give enough coverage but too many chromosomes with several mutations. Adding lines cannot lower that multiple-hit share.',
        'A weak preset may give simpler chromosomes but need more lines than you can keep. Check all the limits together.',
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
      'No: a recessive allele may be hidden by a working copy.',
      'Right. Flies with different genotypes can have the same visible traits.',
      true,
    ],
    ['Yes: appearance reveals the complete genotype.', 'One visible marker cannot reveal all the alleles carried on a chromosome.'],
  ]),
  inheritance: diagnosis('A colleague predicts 3/4 Curly adults from CyO/+ × CyO/+. What should be checked first?', [
    [
      'They counted lethal CyO/CyO flies among the adults.',
      'Right. This combination dies, so calculate adult shares using the surviving combinations only.',
      true,
    ],
    [
      'They forgot two chromosome 2s in each egg.',
      "An egg takes one member of the pair. Fertilisation adds the other parent's chromosome.",
    ],
    [
      'Curly must have changed chromosome.',
      'A ratio error does not require a new chromosome event. Check which combinations survive first.',
    ],
  ]),
  xlinked: diagnosis('White daughters appear in a planned w/w female × +/Y male cross. What is the next useful investigation?', [
    [
      'Check stock identity and collection/mating records, then repeat with newly documented virgins.',
      'Right. A white daughter needs paternal w here, so investigate the recorded parents and mating history.',
      true,
    ],
    ['Count more until the class disappears.', 'More counts cannot explain how those daughters received paternal w.'],
    [
      'Declare every female previously mated.',
      "These offspring suggest unintended paternity. They do not reveal every female's mating history.",
    ],
  ]),
  notation: diagnosis('An unknown Curly fly is labelled mut/CyO from appearance alone. What is missing?', [
    [
      'Evidence for the chromosome paired with CyO, from a recorded cross or a checking cross.',
      'Right. Curly tracks CyO, but mut/CyO and +/CyO can look the same.',
      true,
    ],
    ['A second CyO so the line breeds true.', 'CyO/CyO flies die. This would not identify the chromosome you need to check.'],
  ]),
  balancers: diagnosis('A Curly class mixes mut/CyO with +/CyO. Why not fix it by keeping more Curly siblings?', [
    [
      'Curly does not distinguish their other chromosomes.',
      'Right. More flies with the same ambiguous appearance cannot identify mut, so use an informative cross or marked intermediate.',
      true,
    ],
    ['More siblings make every unmarked homolog become mut.', 'Sampling more siblings does not turn a normal chromosome into mut.'],
  ]),
  chance: diagnosis('A small sample fits both 1:1 and 2:1. What improves the next experiment?', [
    [
      'Plan the hypotheses and collect enough independent offspring or repeated crosses to tell them apart.',
      'Right. When both ratios fit, you need data that can distinguish them rather than treating either fit as proof.',
      true,
    ],
    [
      'Choose the smaller chi-square and call the ratio proven.',
      'A good fit does not identify the chromosome explanation that produced the counts.',
    ],
  ]),
  recombination: diagnosis('A dark-orange candidate fails to activate a reporter. What should be investigated?', [
    [
      'Check the insertions, driver function, assay conditions and controls.',
      'Right. Eye colour suggested the insertion combination but did not show that both transgenes work.',
      true,
    ],
    [
      'Treat eye colour as sufficient proof and ignore the functional result.',
      'Eye colour is an indirect marker. A separate test of driver function is relevant evidence.',
    ],
  ]),
  gal4uas: diagnosis('One RNAi line gives a phenotype but an independent line does not. What is justified?', [
    [
      'Check how well each line reduces the target and whether it has other effects.',
      'Right. The lines may differ in target reduction or other genetic effects, so measure these before assigning the cause.',
      true,
    ],
    ['The first line proves the target is causal.', 'One line cannot separate the target effect from all effects specific to that line.'],
  ]),
  complementation: diagnosis('A deficiency maps a lethal to a small region. Is the responsible gene proved?', [
    [
      'No: test other alleles of the gene, rescue or its DNA sequence.',
      'Right. A deletion can remove several genes, so locating the region does not identify which gene caused the effect.',
      true,
    ],
    [
      'Yes: the nearest gene must be responsible.',
      'The nearest gene is not necessarily the one whose missing function causes the phenotype.',
    ],
  ]),
  threepoint: diagnosis('Coincidence looks strange after rare classes were omitted. What should be checked first?', [
    [
      'Put DCOs into both interval totals and recalculate their expected count from the measured fractions.',
      'Right. DCO counts affect both the observed number and the interval fractions used to calculate the expectation.',
      true,
    ],
    [
      'Replace measured intervals with reference values without checking counts.',
      'This may hide a counting error. Check the sample before replacing its values with a reference.',
    ],
  ]),
  mosaics: diagnosis('One mutant patch is smaller than its twin. What best tests a growth-defect explanation?', [
    [
      'Compare matched mutant and twin clones with genotype controls across independent tissues.',
      'Right. Induction time, position and survival can affect clone size, so compare many matched lineages.',
      true,
    ],
    [
      'Treat the one patch as definitive for the genotype.',
      'A single pair of patches cannot distinguish a genotype effect from differences in their growth histories.',
    ],
  ]),
  target: diagnosis('RNAi is activated but an assay two hours later is normal. What is the next check?', [
    [
      'Measure target protein and expression timing, then allow enough time for depletion.',
      'Right. Existing target protein may still work after GAL4 is activated, so check when it actually falls.',
      true,
    ],
    ['Assume temperature deleted GAL80ts.', "Temperature changes the repressor's activity. It does not remove its chromosome."],
  ]),
  screens: diagnosis('No target allele appears in a screen designed for 95% model coverage. What follows?', [
    [
      'A miss is possible; check recovery, detection and the rates used in the calculation.',
      'Right. Coverage predicts a chance of recovery across independent chromosomes, not a guaranteed outcome.',
      true,
    ],
    ['The target cannot be mutated.', 'A finite screen can miss a gene. Its absence does not show that the gene cannot be mutated.'],
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
    'Keep records of the source vial, generation and clearing time.',
    'Use anatomy to identify sex and records to judge virginity.',
  ],
  {
    eclosion: 'The adult emerging from its pupal case.',
    instar: 'A larval stage between moults.',
    F1: 'The first offspring generation from the recorded parental cross.',
  },
  [
    'Identify the life-cycle stage.',
    'Read the source-vial record and check which generation you are observing.',
    'Use body features for sex and reliable collection records for virginity.',
  ],
);
CURRICULUM.strategies = plan(
  'Advanced',
  ['gal4uas', 'complementation', 'mosaics'],
  [
    'Choose forward/reverse genetics and loss/gain changes to answer a question.',
    'Explain what a reporter, protein tag or clone marker actually measures.',
    "Separate the mother's RNA or protein supply from the embryo's genotype, then choose a test of the cause.",
  ],
  {
    MARCM: 'A method that marks a mutant cell lineage when it loses a protein that normally blocks the marker.',
    'maternal contribution': 'RNA or protein that the mother puts into her eggs.',
    'zygotic expression': "Gene expression from the developing offspring's own DNA.",
  },
  [
    'State the biological question and what you will measure.',
    'Identify what the tool changes or measures.',
    'Choose a separate measurement that can distinguish the main alternative explanation.',
  ],
);
DEMONSTRATIONS.flyroom = model(
  'concept',
  'Worked example: read the developing vial',
  [
    'Adults lay eggs in the labelled cross vial. Record the parents and their collection history before following the developing offspring.',
    'Larvae hatch and feed through successive stages, called instars. The next generation can be developing before any new adults emerge.',
    'Pupae change into adults during metamorphosis. Keep parent-removal and generation records so you can distinguish parents from new F1 adults.',
    'New adults emerge, a process called eclosion. Use the clearing time and collection conditions to support virgin collection, rather than body colour alone.',
  ],
  { visual: 'life-cycle' },
);
DEMONSTRATIONS.strategies = model(
  'concept',
  'Worked example: a repressible clone marker',
  [
    'In this MARCM design, m and GAL80 lie on opposite chromosomes beyond matching FRT sites, away from the centromere. GAL4 and UAS-GFP are present, but GAL80 blocks the reporter.',
    'FLP/FRT exchange followed by chromosome segregation can separate m from GAL80. Follow the two daughter genotypes shown in the diagram.',
    "The m/m daughter loses GAL80. The +/+ daughter keeps it. Track each lineage's genotype separately from whether its marker is expressed.",
    'The clone without GAL80 can make GFP where GAL4 is active. Use this marker to identify the lineage, then compare control clones and measure the biological effect.',
  ],
  { visual: 'marcm' },
);
DIAGNOSES.flyroom = diagnosis('A white-eyed adult was found among a scored F1 sample. Could it simply be a parent left in the vial?', [
  [
    'Check whether a parent was left in the vial using the removal, generation and source records.',
    "Right. Appearance alone does not tell you an adult's generation, so use the records to link it to the intended cross.",
    true,
  ],
  [
    'No: every adult in a vial must belong to the same generation.',
    'Parents and new offspring can be in the vial together unless you remove the parents.',
  ],
]);
DIAGNOSES.strategies = diagnosis(
  'A marked mutant clone has a changed reporter pattern. What would best test whether the mutation caused it?',
  [
    [
      'Compare matched control clones, other alleles or rescue, and a separate measure of the biological effect.',
      "Right. The marker identifies the lineage, but controls must still separate the mutation's effect from induction, background or reporter effects.",
      true,
    ],
    [
      'Treat fluorescent marking alone as proof of gene function.',
      'Inheriting a marker identifies a lineage. It does not show which genetic change caused a biological effect.',
    ],
  ],
);
PATH[0].lessons.splice(1, 0, 'flyroom');
PATH[3].lessons.push('strategies');
CURRICULUM['research-project'].prerequisites.push('strategies');
