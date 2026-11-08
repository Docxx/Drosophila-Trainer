// New entry lessons and integrated investigations. No prior knowledge assumed.
// A multiple-choice step: options are [text, why, correct?].
const choice = (question, options, stage = undefined) => ({
  type: 'choice',
  stage,
  question,
  options: options.map(([text, why, correct]) => ({ text, why, correct: !!correct })),
});
export const ADDITIONAL_LESSONS = {
  foundations: {
    title: 'Start here: the language of genetics',
    steps: [
      {
        type: 'text',
        visual: 'chromosomes',
        title: 'A fly, a cell, a chromosome',
        body: [
          'Start with the animal. A fly is made of cells, and chromosomes in a typical body-cell nucleus carry many genes. We draw chromosomes as bars so you can follow inheritance without first learning a molecular diagram.',
          'The female example has four pairs: two corresponding X chromosomes, pairs 2 and 3, and tiny pair 4. A pair is not two different flies: both homologs are inside the same diploid cell.',
        ],
      },
      {
        type: 'text',
        visual: 'chromosomes',
        title: 'A gene is not a chromosome',
        body: [
          'A chromosome contains many genes. A gene occupies a locus; an allele is a version of that gene. Homologs carry corresponding loci, so a fly can carry different alleles at the same locus on its two homologs.',
          'A and a are labels in our schematic example. Capital letters are a convention in some examples, not a general rule for reading Drosophila gene names. The course will introduce actual stock notation separately.',
        ],
      },
      {
        type: 'text',
        visual: 'dominance',
        title: 'What you carry and what you see',
        body: [
          'Genotype describes the alleles or chromosome combination. Phenotype describes an observation such as wing shape or eye colour. A genetic difference need not be visible in every fly carrying it.',
          'For the Curly marker, one copy on CyO is enough to affect wings. A recessive effect can be masked by a functional copy on the other homolog. Dominant does not mean healthier, more common or stronger.',
        ],
      },
      {
        type: 'text',
        visual: 'inheritance',
        title: 'Why an egg contains half a set',
        body: [
          'An egg and a sperm are gametes. Meiosis gives each gamete one chromosome from every pair. Fertilisation joins the two reduced sets and restores pairs in the offspring.',
          'Half a set means one intact member of each pair, not half of each chromosome. When two homologs carry the same allele, their eggs may be the same scored type even though each egg has only one homolog.',
        ],
      },
      choice('A bar is labelled CyO. What is the bar in these diagrams?', [
        [
          'A chromosome carrying a set of genes and markers.',
          'The marker can help you follow that chromosome; the whole bar is not a single allele.',
          true,
        ],
        ['A complete fly.', 'One fly has several chromosome pairs; a bar represents one chromosome.'],
        ['One visible wing.', 'Wing shape is a phenotype that can help follow a chromosome, not the chromosome itself.'],
      ]),
      choice('A mother has A/a at a locus. Can one of her eggs carry just A at that locus?', [
        [
          'Yes: the egg receives one homolog of that pair.',
          'Meiosis separates the homologs; the sperm supplies the other member at fertilisation.',
          true,
        ],
        ['No: every egg must contain the A/a pair.', 'Carrying the entire pair in every gamete would not reduce the chromosome set.'],
      ]),
      choice('A fly has normal-looking wings. Does this establish every allele it carries?', [
        [
          'No: many genetic differences are unseen or masked.',
          'An observation is not a complete readout of every gene on every homolog.',
          true,
        ],
        ['Yes: a normal appearance means every chromosome is +.', 'A normal appearance can be shared by different genotypes.'],
      ]),
      {
        type: 'text',
        visual: 'fertilisation',
        title: 'Carry this reasoning into the next lesson',
        body: [
          'For every cross, ask three questions in order: what chromosomes can each parent pass on, which pairs result when gametes meet, and which resulting flies survive and show the scored trait?',
          'You do not need to memorise ratios first. Drawing the chromosomes explains where a ratio comes from and when it changes.',
        ],
      },
    ],
  },
  notation: {
    title: 'Read a fly stock and a cross',
    steps: [
      {
        type: 'text',
        visual: 'chromosomes',
        title: 'Decode a stock record one pair at a time',
        body: [
          'The trainer writes X; chromosome 2; chromosome 3, separated by semicolons. Each slash separates the two homologs in one fly. Chromosome 4 is not simulated in the stock-building engine.',
          'For example, w/w; CyO/+; TM3/+ is a female with w on both Xs, CyO over a normal chromosome 2, and TM3 over a normal chromosome 3. A male can be written w/Y; CyO/+; TM3/+.',
        ],
        diagrams: [{ g: 'w/w; CyO/+; TM3/+', mode: 'both', caption: 'Known reference female: compare the record with the pairs' }],
      },
      {
        type: 'text',
        visual: 'dominance',
        title: 'Distinguish names, markers and function',
        body: [
          'CyO and TM3 name balancer chromosomes, carrying Curly and Stubble markers respectively in this catalogue. UAS-GFP names an insertion-bearing chromosome at its stated location. The label is shorthand for a genetic object, not a complete sequence.',
          'A + homolog is normal at the loci being described. A marker can establish which known parental homolog was inherited, but cannot prove every unobserved locus in an unrelated fly.',
        ],
      },
      {
        type: 'text',
        visual: 'fertilisation',
        title: 'Read the cross direction',
        body: [
          'Write the virgin female stock first, then ×, then the male stock. Assign the sexes explicitly: X-linked outcomes and recombination can depend on that choice.',
          'A slash is not a cross. CyO/+ describes homologs in one fly; CyO/+ × +/+ describes two parental genotypes. Keep the vial identity, generation, selected markers and intended verification in the notebook.',
        ],
      },
      choice('In w/w; CyO/+; TM3/+, what does the first semicolon separate?', [
        ['The X pair from chromosome pair 2.', 'Semicolons separate chromosome groups, not individual alleles within one pair.', true],
        ['The female from the male.', 'The cross symbol separates parents; this record describes one fly.'],
      ]),
      {
        type: 'gametes',
        title: 'Read before choosing',
        visual: 'assortment',
        parent: 'w/w; CyO/+; TM3/+',
        chroms: ['2', '3'],
        intro: 'Use the record to find every chromosome-2/chromosome-3 gamete type. Select one homolog of each pair.',
        done: 'Four combinations: each contains one chromosome 2 and one chromosome 3. A semicolon separates the groups; it does not separate different flies.',
      },
      choice('Which record describes a male carrying w on his only X?', [
        ['w/Y; +/+; +/+', 'Y identifies the paternal sex chromosome in the usual XY male model; w is the allele on his X.', true],
        ['w/w; +/+; +/+', 'This has two X homologs carrying w, not an X plus Y.'],
      ]),
    ],
  },
  investigation: {
    title: 'Investigation: do not lose the invisible chromosome',
    steps: [
      {
        type: 'text',
        stage: 'teach',
        visual: 'balancers',
        title: 'A plausible plan fails',
        body: [
          'You must move an unmarked recessive lethal into a stock with a GAL4 driver. A colleague first crosses mut/CyO to a normal chromosome-2 driver stock, keeps a non-Curly intermediate, then crosses to a double balancer.',
          'The final Curly class can contain mut/CyO and +/CyO. Curly establishes the balancer, but the unmarked intermediate could pass either mut or +. Those hidden homologs cannot be separated by selecting more Curly siblings.',
        ],
      },
      choice(
        'What needs changing before the final generation?',
        [
          [
            'Use a marked intermediate that keeps mut distinguishable from +.',
            'The chromosome must stay traceable at every selection, not just the final one.',
            true,
          ],
          ['Keep more of the ambiguous Curly class.', 'More copies of an indistinguishable mixture do not establish the unmarked homolog.'],
        ],
        'guide',
      ),
      {
        type: 'mission',
        stage: 'practise',
        title: 'Build the verified target class',
        puzzle: 3,
        intro:
          'Build mut/CyO with GAL4/TM6B using the available stocks. You choose crosses and kept classes across generations. Incorrect choices remain on your shelf and can give ambiguous descendants.',
      },
      choice(
        'The target class was obtained by a valid model route. What does that establish?',
        [
          [
            'The selected class has the target composition within the stated stock and inheritance model; real work still needs reliable records and appropriate verification.',
            'Construction evidence follows the parental chromosomes. It does not establish every possible background change or laboratory error.',
            true,
          ],
          ['Every other vial on the shelf also has the target.', 'Different kept classes carry different chromosome combinations.'],
        ],
        'diagnose',
      ),
    ],
  },
  'research-project': {
    title: 'Research project: construct, verify and interpret',
    steps: [
      {
        type: 'text',
        stage: 'teach',
        visual: 'recombination',
        title: 'Work backwards from the experimental fly',
        body: [
          'The target stock carries UAS-GFP/CyO on chromosome 2 and a GAL4,UAS-RNAi recombinant over TM6B on chromosome 3. Its two insertions start on different chromosome-3 homologs, so a female meiosis must first generate the combined chromosome.',
          'Plan the generations backwards. Prepare the chromosome-2 intermediate in parallel while making chromosome-3 trans-heterozygous virgins. In each generation record which visible class proves the needed homologs, and where a verification test is still required.',
        ],
      },
      {
        type: 'mission',
        stage: 'practise',
        title: 'Build the complete research stock',
        puzzle: 5,
        intro:
          'Use the full stock shelf to construct the target. This is the three-generation integration challenge: recombination, balancing, parallel intermediates and marker dosage must agree.',
      },
      choice(
        'A candidate has the expected eye dosage and balancer markers. Before using its RNAi phenotype to assign gene function, what is the priority?',
        [
          [
            'Verify insertion identity and function, then test independent lines and matched controls.',
            'The selected chromosome combination is a construction result. Marker dosage alone does not establish functional constructs or causal specificity.',
            true,
          ],
          [
            'Treat the visible markers as proof of the gene’s biological function.',
            'The markers report genetic tools, not whether the intended biological perturbation caused the phenotype.',
          ],
        ],
        'diagnose',
      ),
      choice(
        'The phenotype appears only after a warm shift. Which result most strengthens a timing-specific knockdown explanation?',
        [
          [
            'Target protein changes in the assayed window, with matched-temperature genetic controls and independent evidence for specificity.',
            'Genotype, regulation, protein abundance and phenotype are different levels of evidence. They must be connected rather than assumed.',
            true,
          ],
          ['Only the experimental flies were warmed.', 'That confounds temperature with the genetic perturbation.'],
          [
            'The DNA record alone confirms when protein disappeared.',
            'Possessing the constructs does not measure activity or protein turnover.',
          ],
        ],
        'diagnose',
      ),
      {
        type: 'reflection',
        stage: 'diagnose',
        title: 'Write your experimental argument',
        prompts: {
          hypothesis: 'What biological hypothesis are you testing, and which result would contradict it?',
          design: 'Which genotypes, independent lines, controls, scoring rules and assay window will you use?',
          evidence:
            'How will you verify the constructs and distinguish target effects from background, marker, temperature or timing effects?',
        },
      },
      {
        type: 'text',
        stage: 'diagnose',
        visual: 'screens',
        title: 'A research conclusion includes its limits',
        body: [
          'Keep the construction record, independent-line identities, sample unit, scoring rules, control outcomes and assay window with the result. A model-correct stock build is one part of a research argument.',
          'You have integrated the trainer’s supported methods. Transfer to unfamiliar photographs, real stocks and real experiments still requires supervised practice and independent validation; lesson completion alone does not certify expertise.',
        ],
      },
    ],
  },
};
