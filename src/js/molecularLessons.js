// Concept lessons use separate, known examples rather than adding fictitious
// insertion sites or expression rules to the stock-building engine.
const text = (title, visual, ...body) => ({ type: 'text', title, visual, body });
const choice = (question, options, stage) => ({
  type: 'choice',
  question,
  stage,
  options: options.map(([text, why, correct = false]) => ({ text, why, correct })),
});
const multi = (question, options) => ({
  ...choice(question, options, 'practise'),
  type: 'multi',
  explain: 'Use these checks to connect the inherited DNA, gene activity and the phenotype you measure.',
});
export const MOLECULAR_LESSONS = {
  transgenesis: {
    title: 'Create and establish a transgenic line',
    model: [
      'The diagrams show a planned insertion and its recovery. They do not simulate embryo injection, transformation efficiency, mosaic germlines or sequence validation. Chromosome positions are schematic. A marker is a screening aid, not proof of a correct construct.',
    ],
    steps: [
      text(
        'Start with the chromosome you want',
        'transgenesis',
        'A transgene is DNA introduced into a fly. A stable transgenic line passes that DNA through eggs or sperm. First decide what the DNA must do: for example, make a UAS-controlled fluorescent protein.',
        'A construct is the DNA design you prepare. It contains the sequence you want, the control sequences it needs and a way to find candidate offspring. A plasmid is a circular DNA molecule used to carry this design.',
      ),
      text(
        'Choose how the DNA will enter',
        'transgenesis',
        'For phiC31 integration, the recipient chromosome already carries an attP landing site: a short DNA sequence recognised by the integration system. The donor plasmid carries an attB site. The enzyme phiC31 integrase joins attB to attP, inserting the donor DNA.',
        'A P-element vector instead uses transposase, an enzyme that moves DNA between P-element ends into the genome. Its insertion position is not chosen in the same way.',
        'To tag a gene at its own locus, consider CRISPR-directed repair. A guide RNA directs the DNA-cutting enzyme Cas9 to a chosen sequence. Repair can then copy the tag from a donor with matching DNA on each side.',
      ),
      choice('Your donor has attB. What must you check before choosing a phiC31 recipient?', [
        [
          'The recipient has the intended attP site, and integrase will be supplied.',
          'Right. Integration needs the matching chromosome site as well as the donor and enzyme.',
          true,
        ],
        ['The recipient has any UAS insertion.', 'UAS controls gene expression. It is not the attP site recognised by phiC31.'],
        ['GAL4 will insert the donor DNA.', 'GAL4 activates transcription at UAS. It does not integrate a plasmid into a chromosome.'],
      ]),
      text(
        'Recover an inherited insertion',
        'transgenesis',
        'DNA is delivered to early embryos. The adults that develop from these embryos are called G0 founders. An insertion must reach a cell that makes eggs or sperm to be inherited; a change in body cells alone cannot establish a line.',
        'Cross founders separately to suitable partners. Screen their F1 offspring for the construct marker and keep candidate families separate. Then test transmission in the next generation. This connects the candidate insertion to a recorded founder.',
      ),
      choice('A G0 fly has a patch of fluorescence. Have you established a transgenic line?', [
        [
          'No. Recover offspring that inherit the insertion and confirm continued transmission.',
          'Right. A fluorescent body-cell patch does not establish that eggs or sperm carry the insertion.',
          true,
        ],
        [
          'Yes. Every cell must carry the same insertion.',
          'A founder can contain genetically different cell groups. Its body-cell signal does not identify its germline.',
        ],
      ]),
      text(
        'Verify before building the experimental stock',
        'transgenesis',
        'Check the insertion junctions, where donor and chromosome meet, and the sequence of the important construct regions. Confirm the insertion site and copy structure using suitable molecular tests. Then test the intended expression or function.',
        'Record the verified chromosome and remove inherited helper constructs, such as an unwanted transposase source. Use a suitable balancer if the insertion cannot be kept homozygous. Keep independent recovered lines until you know which are suitable.',
      ),
      multi('You recover marker-positive F1 flies from separate founders. Which actions help establish reliable lines?', [
        [
          'Keep founder families separate and confirm inheritance.',
          'Right. Separate families preserve the history of independently recovered insertions.',
          true,
        ],
        [
          'Check insertion junctions and construct sequence.',
          'Right. The marker does not tell you whether the required DNA is intact at the intended site.',
          true,
        ],
        [
          'Test the intended expression and record the final stock genotype.',
          'Right. A stable insertion still needs a functional check before you use it in an experiment.',
          true,
        ],
        [
          'Pool all marker-positive flies before checking their insertions.',
          'Pooling loses the link between a founder, its insertion and later results.',
        ],
      ]),
      choice(
        'Two UAS constructs will be compared. Which design best reduces insertion-site differences?',
        [
          [
            'Use the same verified landing site and match copy number and genetic background.',
            'Right. Matching these features makes the construct difference easier to interpret.',
            true,
          ],
          [
            'Use whichever two lines have the brightest markers.',
            'Marker brightness can change with insertion context and does not match the experimental constructs.',
          ],
        ],
        'practise',
      ),
    ],
  },
  gal80: {
    title: 'GAL80: restrict where GAL4 works',
    model: [
      'Expression diagrams use an on/off view of known driver domains. They do not predict expression strength, incomplete repression or the behaviour of every GAL4-derived driver. GAL80ts timing and protein lag are explored separately in the TARGET lesson.',
    ],
    steps: [
      text(
        'Three inherited parts, one expression decision',
        'gal80',
        'The fly carries a GAL4 driver, a UAS responder and a GAL80 transgene. GAL4 is a protein that activates the UAS-controlled gene. GAL80 is a repressor: it binds the activation region of GAL4 and blocks its activity.',
        'The chromosome carrying UAS stays in the cell when expression is repressed. GAL80 changes whether GAL4 can activate it. It does not remove the responder DNA.',
      ),
      text(
        'Subtract one cell group from a driver pattern',
        'gal80',
        'Imagine GAL4 is made in cell groups A and B. A separate control sequence makes GAL80 only in B. The UAS reporter can be activated in A, where GAL4 acts without GAL80. It is repressed in B, where the two proteins overlap.',
        'This is subtractive expression: start with the GAL4 pattern, then exclude cells with effective GAL80 repression. Cells outside the GAL4 pattern stay off even if they have no GAL80.',
      ),
      choice('GAL4 is active in A and B. GAL80 is present only in B. Where should you first look for the UAS reporter?', [
        ['In A.', 'Right. A has GAL4 without GAL80 repression, while B has both proteins.', true],
        ['Only in B.', 'B is where GAL80 represses GAL4. It is the excluded part of the driver pattern.'],
        ['In every cell lacking GAL80.', 'A cell also needs active GAL4 to express the UAS reporter.'],
      ]),
      text(
        'Separate ordinary GAL80 from GAL80ts',
        'gal80',
        'Ordinary GAL80 is used to repress GAL4 in a chosen pattern. GAL80ts is a temperature-sensitive form used in TARGET: it represses strongly at the cool setting and loses effective repression at the warm setting.',
        'A temperature shift does not delete a transgene. New RNA and protein take time to appear, and existing protein takes time to disappear. Continue to the TARGET lesson to plan measurements around those delays.',
      ),
      choice('A UAS reporter is off in cells containing GAL4 and GAL80. What does that tell you about the UAS chromosome?', [
        [
          'It can still be present while GAL4 activity is blocked.',
          'Right. Repression changes gene activity without removing the chromosome.',
          true,
        ],
        ['GAL80 must have cut it out.', 'GAL80 is a protein repressor, not a DNA-excision enzyme.'],
      ]),
      multi('Which checks help interpret a restricted GAL4 pattern?', [
        [
          'Compare the reporter pattern with and without GAL80.',
          'Right. This comparison tests which part of the original driver pattern is suppressed.',
          true,
        ],
        [
          'Confirm the offspring inherited driver, responder and repressor.',
          'Right. Missing a component can mimic a change in regulation.',
          true,
        ],
        [
          'Measure the relevant tissue and developmental stage.',
          'Right. A pattern at one stage does not establish the pattern at another.',
          true,
        ],
        [
          'Treat ordinary GAL80 as a heat-triggered DNA deletion.',
          'Ordinary GAL80 represses GAL4 activity; it does not delete DNA when heated.',
        ],
      ]),
      choice(
        'Group C has the UAS reporter but neither GAL4 nor GAL80. Will removing GAL80 elsewhere activate C?',
        [
          ['No. C still lacks the activator GAL4.', 'Right. Absence of a repressor cannot replace the missing activator.', true],
          ['Yes. Every cell without GAL80 turns on UAS.', 'UAS needs an activator; it is not switched on simply by the absence of GAL80.'],
        ],
        'practise',
      ),
    ],
  },
  geneswitch: {
    title: 'GeneSwitch: control expression with a drug',
    model: [
      'The animation shows the intended off/on logic, not a dose-response curve. Basal expression, drug uptake, toxicity and induction or recovery times vary with the driver, responder, tissue and conditions. No dose or waiting time in this lesson is a laboratory prescription.',
    ],
    steps: [
      text(
        'A different driver protein',
        'geneswitch',
        'The driver chromosome encodes GeneSwitch, a protein assembled from three parts. A GAL4 DNA-binding region recognises UAS. A progesterone-receptor region responds to the drug RU486, also called mifepristone. A p65 activation region helps turn transcription on.',
        'A tissue-specific control sequence determines where GeneSwitch is made. The responder chromosome carries the UAS-controlled gene. The driver and responder must both be inherited by the experimental offspring.',
      ),
      text(
        'Add the signal, then allow time',
        'geneswitch',
        'Without RU486, GeneSwitch is intended to have little activity. With the drug, it can activate the UAS responder in cells that make GeneSwitch. The drug changes protein activity; it does not add or remove the responder chromosome.',
        'After induction, RNA must be made and the output protein must accumulate. For RNAi, existing target protein must also fall. Removing the drug does not instantly remove those molecules. Measure the timing in the tissue you will assay.',
      ),
      choice('Will RU486 make a standard GAL4 driver behave like GeneSwitch?', [
        [
          'No. The driver must encode the drug-responsive GeneSwitch protein.',
          'Right. Standard GAL4 lacks the engineered drug-binding and p65 combination used by GeneSwitch.',
          true,
        ],
        [
          'Yes. RU486 activates every GAL4 protein.',
          'The drug-dependent response comes from the engineered GeneSwitch protein, not from UAS or ordinary GAL4 alone.',
        ],
      ]),
      text(
        'Keep drug effects separate from responder effects',
        'geneswitch',
        'Split matched experimental offspring into RU486 and vehicle-only groups. A vehicle is the substance used to deliver the drug without the drug itself. Keep age, food, handling and assay conditions matched.',
        'Also compare suitable genetic controls with and without drug, such as driver-only and responder-only offspring. These comparisons help identify effects of the drug, driver or responder that do not require the complete induced system. Check expression directly as well as the final phenotype.',
      ),
      choice(
        'Drug-treated GeneSwitch plus UAS-RNAi flies show a phenotype. Is comparison with untreated experimental flies enough to attribute it to RNAi?',
        [
          [
            'No. Test drug-treated and vehicle-treated genetic controls as well.',
            'Right. The drug or driver can affect the assay without the intended target reduction.',
            true,
          ],
          [
            'Yes. Any change after RU486 must come from the target gene.',
            'A drug-associated change does not identify which molecular change caused the phenotype.',
          ],
        ],
      ),
      multi('Which observations would make an adult GeneSwitch experiment easier to interpret?', [
        [
          'Measure basal responder activity in vehicle-treated flies.',
          'Right. Basal activity can expose the tissue before the planned induction.',
          true,
        ],
        [
          'Measure induced expression or target reduction at the assay time.',
          'Right. Drug delivery does not by itself establish the amount or timing of the molecular change.',
          true,
        ],
        [
          'Compare matched genetic controls under both treatments.',
          'Right. These comparisons test whether the drug-associated effect needs the complete system.',
          true,
        ],
        [
          'Assume all tissues take up RU486 at the same rate.',
          'Drug delivery and response can differ between tissues, so validate the tissue you use.',
        ],
      ]),
      choice(
        'Can you assume GAL80ts will repress GeneSwitch just because it recognises UAS?',
        [
          [
            'No. Check the actual driver design and validate the proposed control.',
            'Right. GeneSwitch uses a p65 activation region, so ordinary GAL4–GAL80 regulation cannot simply be assumed.',
            true,
          ],
          [
            'Yes. Every protein that binds UAS has the same GAL80 response.',
            'DNA binding and the activation region are different parts of a protein; a shared DNA target does not establish shared repression.',
          ],
        ],
        'practise',
      ),
    ],
  },
  'recombination-tools': {
    title: 'Recombination: choose the mechanism',
    model: [
      'These are separate, known DNA examples. The diagrams do not simulate reaction rates, crossover positions or every repair and segregation outcome. FLP/FRT rearrangements depend on the location and orientation of the sites.',
    ],
    steps: [
      text(
        'Ask which DNA molecules exchange',
        'recombination-tools',
        'Recombination changes how DNA segments are joined. The word covers different mechanisms. First identify the starting chromosomes, the DNA sites involved and whether you want changed offspring, changed cell lineages or a changed DNA construct.',
        'In ordinary Drosophila female meiosis, matching chromosomes can exchange segments between non-sister chromatids. A chromatid is one copy of a replicated chromosome. For a starting pair AB and ab, an exchange between the genes can make Ab and aB gametes.',
      ),
      text(
        'An offspring chromosome or a cell clone?',
        'recombination-tools',
        'To combine inherited insertions, recover recombinant offspring from a suitable female and verify the chromosome you keep. Ordinary meiotic crossing over is absent in Drosophila males. A balancer suppresses recovery of many recombinant products.',
        'FLP is an enzyme that recognises FRT DNA sites. An exchange between replicated homologues at matching FRT sites, followed by the right mitotic segregation, can make homozygous daughter cells inside one fly. Their descendants form clones; they are not offspring from a mating.',
      ),
      choice('You want GAL4 and UAS-RNAi on the same inherited chromosome. Which existing approach fits?', [
        [
          'Recover recombinants from a female carrying the insertions on opposite homologues.',
          'Right. Female meiotic exchange can create a combined chromosome that is transmitted to offspring.',
          true,
        ],
        [
          'Make a marked body-cell clone and assume every egg now carries it.',
          'A body-cell clone does not establish a changed germline or a heritable stock.',
        ],
        ['Cross through an ordinary male and wait for meiotic exchange.', 'Drosophila males do not normally make meiotic crossovers.'],
      ]),
      text(
        'Two FRT sites can change one DNA molecule',
        'recombination-tools',
        'Sites on the same DNA molecule can also recombine. Two FRT sites pointing in the same direction allow FLP to excise the DNA between them as a circle. One FRT site remains at the chromosome junction.',
        'If those FRT sites point in opposite directions, FLP can invert the intervening DNA instead. The product depends on site arrangement, so draw the arrows before predicting deletion or inversion.',
      ),
      choice('Two FRT arrows point towards each other on one chromosome. What rearrangement should you consider?', [
        ['Inversion of the intervening DNA.', 'Right. Opposite site orientations allow the intervening DNA segment to flip.', true],
        [
          'Excision of the segment as if both arrows pointed the same way.',
          'Same-direction sites support excision; opposite orientations give a different arrangement.',
        ],
      ]),
      text(
        'Integration and repair answer different questions',
        'recombination-tools',
        'PhiC31 integrase joins a donor attB site to a chromosomal attP site. The integrated DNA is flanked by hybrid sites called attL and attR. Integrase alone does not simply reverse this reaction to restore the original sites.',
        'Homology-directed repair, or HDR, uses a matching DNA template to repair a DNA break. With a suitable CRISPR design, the cell can copy a planned tag or replacement from a donor into an endogenous locus. This differs from inserting a construct at a pre-existing attP site.',
      ),
      choice(
        'You need to label the protein made from its own gene locus. Which plan directly addresses that aim?',
        [
          [
            'Design and verify an endogenous tag using targeted repair with a matching donor.',
            'Right. The tag is placed at the gene you want to follow rather than at an unrelated landing site.',
            true,
          ],
          [
            'Put a generic UAS-GFP reporter at any attP site and call it a tag on that protein.',
            'A separate reporter can mark cells without being attached to the protein of interest.',
          ],
        ],
        'practise',
      ),
    ],
  },
};

const plan = (prerequisites, objectives, terms, coach) => ({ level: 'Advanced', prerequisites, objectives, terms, coach });
export const MOLECULAR_CURRICULUM = {
  transgenesis: plan(
    ['notation', 'gal4uas'],
    [
      'Choose an insertion strategy for a defined DNA design.',
      'Distinguish founder expression from germline transmission.',
      'Recover, verify and maintain separate transgenic lines.',
    ],
    {
      transgene: 'Introduced DNA that can be passed through the germline.',
      construct: 'The DNA design prepared for an experiment.',
      'landing site': 'A known chromosome site used for targeted integration.',
      founder: 'An adult developed from a treated embryo.',
      junction: 'The boundary between introduced DNA and the recipient chromosome.',
    },
    [
      'Draw the recipient chromosome and donor.',
      'Follow one founder family into its offspring.',
      'Separate marker screening from molecular and functional validation.',
    ],
  ),
  gal80: plan(
    ['gal4uas'],
    [
      'Explain how GAL80 represses GAL4.',
      'Predict the expression pattern left after GAL80 repression.',
      'Distinguish ordinary GAL80 from GAL80ts.',
    ],
    {
      repressor: 'A protein that reduces gene activation.',
      'subtractive expression': 'Restricting a driver pattern by repressing part of it.',
      GAL80ts: 'A temperature-sensitive GAL80 protein used to control GAL4 activity.',
    },
    [
      'Check which transgenes are inherited.',
      'Find cells where GAL4 and GAL80 overlap.',
      'Distinguish a change in expression from a change in DNA.',
    ],
  ),
  geneswitch: plan(
    ['gal4uas', 'gal80'],
    [
      'Identify the three functional parts of GeneSwitch.',
      'Explain drug-dependent UAS activation and response delays.',
      'Choose genetic and treatment controls for an induction experiment.',
    ],
    {
      GeneSwitch: 'An engineered UAS activator with GAL4 DNA-binding, drug-binding and p65 activation regions.',
      RU486: 'Mifepristone, the drug used to induce GeneSwitch.',
      vehicle: 'The drug-delivery mixture without the drug.',
      'basal expression': 'Activity present before the intended induction.',
    },
    [
      'Check that the driver is GeneSwitch.',
      'Match drug and vehicle groups within each relevant genotype.',
      'Measure the molecular change at the assay time.',
    ],
  ),
  'recombination-tools': plan(
    ['recombination', 'mosaics', 'transgenesis'],
    [
      'Distinguish meiotic exchange from mitotic clone formation.',
      'Predict FRT excision or inversion from site orientation.',
      'Choose integration or targeted repair for a defined chromosome change.',
    ],
    {
      chromatid: 'One copy of a replicated chromosome.',
      excision: 'Removal of a DNA segment from a molecule.',
      inversion: 'Reversal of a DNA segment.',
      HDR: 'Homology-directed repair: repair using a matching DNA template.',
    },
    [
      'Draw both starting DNA molecules or chromosome copies.',
      'Mark the enzyme sites and their directions.',
      'Track the product into offspring or into a cell lineage.',
    ],
  ),
};

export const MOLECULAR_DEMONSTRATIONS = Object.fromEntries(
  [
    [
      'transgenesis',
      'Worked example: from donor to verified family',
      [
        'Start with a known recipient chromosome carrying attP and a donor plasmid carrying attB plus the desired construct.',
        'PhiC31 integrase joins the sites. The donor becomes part of the chromosome, with attL and attR at its boundaries.',
        'Cross one G0 founder separately. Screen its F1 offspring and test whether the candidate insertion is inherited again.',
        'Keep the family separate, verify the insertion and test its function before maintaining the final recorded stock.',
      ],
    ],
    [
      'gal80',
      'Worked example: subtract group B',
      [
        'The known fly carries GAL4, UAS-reporter and GAL80 transgenes. The same inherited DNA is present across these example cells.',
        'GAL4 is made in groups A and B. Without repression, those groups can activate the UAS-controlled reporter.',
        'GAL80 is made in group B. Its overlap with GAL4 represses the reporter there while leaving group A available.',
        'Group A remains on. B is repressed and C lacks GAL4. Check the actual reporter pattern before using this restriction in an assay.',
      ],
    ],
    [
      'geneswitch',
      'Worked example: induce a known responder',
      [
        'The example fly inherits the GeneSwitch driver and a UAS reporter. No DNA insertion or excision occurs during the induction.',
        'The driver makes a fusion protein with GAL4 DNA-binding, drug-binding and p65 activation regions in the chosen tissue.',
        'RU486 activates the drug-responsive system. UAS transcription can rise where GeneSwitch is made, followed by reporter accumulation.',
        'Compare drug and vehicle groups alongside genetic controls. Measure expression at the assay time rather than treating drug addition as instant induction.',
      ],
    ],
    [
      'recombination-tools',
      'Worked example: draw the DNA product',
      [
        'Female meiotic exchange can turn parental AB and ab combinations into Ab and aB. Recover an offspring to establish a changed chromosome.',
        'With two same-direction FRT sites on one molecule, FLP can excise the intervening DNA and leave one FRT site at the junction.',
        'With opposite-direction FRT sites, the intervening segment can invert. The starting site orientation changes the DNA product.',
        'PhiC31 joins attB and attP to insert a donor. HDR instead copies a matching donor during repair; choose the mechanism that gives the required product.',
      ],
    ],
  ].map(([id, title, pages]) => [id, { type: 'worked', kind: 'concept', stage: 'demonstrate', visual: id, title, pages }]),
);

export const MOLECULAR_DIAGNOSES = {
  transgenesis: choice(
    'Marker-positive offspring are recovered, but the intended protein is absent. What should you do next?',
    [
      [
        'Check construct sequence, insertion junctions and the expression design before using the line.',
        'Right. Marker transmission does not establish that the complete functional construct is correct.',
        true,
      ],
      [
        'Call the experiment successful because the marker is inherited.',
        'The marker is a candidate screen. The required construct and its function still need verification.',
      ],
    ],
    'diagnose',
  ),
  gal80: choice(
    'The reporter is absent in both A and B, although GAL80 was intended only in B. What is the best next check?',
    [
      [
        'Confirm inheritance, driver activity and the actual GAL80 pattern.',
        'Right. A missing component or broader repression can give the same absent-reporter observation.',
        true,
      ],
      [
        'Conclude that GAL80 deleted the UAS chromosome in every cell.',
        'Reporter absence does not establish a DNA deletion, and GAL80 is a repressor.',
      ],
    ],
    'diagnose',
  ),
  geneswitch: choice(
    'Drug-treated driver-only flies show the same assay change as the full GeneSwitch experiment. What follows?',
    [
      [
        'The change cannot yet be assigned to the UAS target; test the treatment and driver effects.',
        'Right. The effect occurs without the responder, so target-specific induction is not established as its cause.',
        true,
      ],
      ['The target gene must cause the effect in both groups.', 'Driver-only flies lack the UAS responder used to test that target.'],
    ],
    'diagnose',
  ),
  'recombination-tools': choice(
    'An induced body-cell clone has the desired genotype. Does that establish a stock carrying it?',
    [
      [
        'No. A stock needs germline transmission and verified offspring.',
        'Right. A changed body-cell lineage is separate from the chromosomes passed through eggs or sperm.',
        true,
      ],
      [
        'Yes. Every cell in the fly must now carry the clone genotype.',
        'A clone is a subset of cells; its genotype does not describe every cell or the germline.',
      ],
    ],
    'diagnose',
  ),
};
