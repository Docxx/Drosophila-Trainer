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
          'A fly is made of cells. Inside a typical body cell, a nucleus holds the chromosomes. Each chromosome carries many genes. We draw it as a bar so you can follow it from parent to offspring.',
          'This female cell has four chromosome pairs: X, 2, 3 and the tiny 4. Both members of a pair are inside the same cell. A cell with paired chromosomes is called diploid.',
        ],
      },
      {
        type: 'text',
        visual: 'chromosomes',
        title: 'A gene is not a chromosome',
        body: [
          'A gene sits at a particular place on a chromosome, called its locus. An allele is a version of that gene. The matching chromosomes in a pair are homologues. They carry the same loci but can carry different alleles.',
          'Here A and a label different alleles. Drosophila gene names use other naming rules, so do not rely on capital letters alone. You will learn to read stock labels in a later lesson.',
        ],
      },
      {
        type: 'text',
        visual: 'dominance',
        title: 'What you carry and what you see',
        body: [
          'Genotype means the genetic combination a fly carries. Phenotype means a trait you can observe, such as wing shape. Different genotypes can sometimes give the same visible trait.',
          'One Curly copy on CyO is enough to affect the wings: Curly is dominant. A recessive effect can be hidden by a working gene copy on the other chromosome. Dominant does not mean healthier or more common.',
        ],
      },
      {
        type: 'text',
        visual: 'inheritance',
        title: 'Why an egg contains half a set',
        body: [
          'An egg or sperm is called a gamete. During meiosis, the division that makes gametes, each takes one chromosome from every pair. Fertilisation joins an egg and sperm, restoring the pairs.',
          'Half a set means one whole chromosome from each pair. If both chromosomes carry the same allele, the eggs can all look the same genetically at that gene. Each egg still receives only one member of the pair.',
        ],
      },
      choice('A bar is labelled CyO. What is the bar in these diagrams?', [
        [
          'A chromosome carrying a set of genes and markers.',
          'Right. The bar is a whole chromosome carrying many genes; its marker helps you follow it.',
          true,
        ],
        ['A complete fly.', 'One fly has several chromosome pairs. Each bar is just one chromosome.'],
        ['One visible wing.', 'A wing is part of the fly. Its shape can reveal a trait carried on a chromosome.'],
      ]),
      choice('A mother carries A/a at one gene. Can an egg carry A without a?', [
        [
          'Yes: an egg receives one chromosome from that pair.',
          'Right. Meiosis separates the pair, and the sperm supplies the other chromosome at fertilisation.',
          true,
        ],
        [
          'No: every egg must contain the A/a pair.',
          'An egg with both members would not have half the chromosome set. Each egg takes just one member of the pair.',
        ],
      ]),
      choice("Does a fly's normal wing shape tell you every allele it carries?", [
        [
          'No: some genetic differences do not show in its wings.',
          "Right. Wing shape does not reveal every gene on the fly's chromosomes.",
          true,
        ],
        [
          'Yes: a normal appearance means every chromosome is +.',
          'Different genotypes can give the same normal wing shape. Appearance alone cannot tell them apart.',
        ],
      ]),
      {
        type: 'text',
        visual: 'fertilisation',
        title: 'Carry this reasoning into the next lesson',
        body: [
          'For each cross, first list the chromosomes each parent can pass on. Then join egg and sperm chromosomes. Finally, check which offspring survive and show the trait you are scoring.',
          'Draw the chromosomes before memorising a ratio. The drawing shows where the ratio comes from and why it may change.',
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
          'The record lists X; chromosome 2; chromosome 3. Semicolons separate these groups. A slash separates the two matching chromosomes in one fly. The tiny chromosome 4 is left out of these records.',
          'In w/w; CyO/+; TM3/+, the female has w on both Xs. CyO is paired with a normal chromosome 2, and TM3 with a normal chromosome 3. The corresponding male record is w/Y; CyO/+; TM3/+.',
        ],
        diagrams: [{ g: 'w/w; CyO/+; TM3/+', mode: 'both', caption: 'Known reference female: compare the record with the pairs' }],
      },
      {
        type: 'text',
        visual: 'dominance',
        title: 'Distinguish names, markers and function',
        body: [
          'CyO and TM3 name balancer chromosomes. Their visible markers are Curly and Stubble. UAS-GFP names a chromosome carrying a DNA insertion. These names help you follow the chromosomes.',
          'A + means normal at the genes being described. A marker can identify a chromosome inherited in a known cross. It does not identify every hidden allele in an unrelated fly.',
        ],
      },
      {
        type: 'text',
        visual: 'fertilisation',
        title: 'Read the cross direction',
        body: [
          'Write the virgin female first, then ×, then the male. Always record the sexes: X-linked inheritance and crossing over can depend on which parent carries an allele.',
          'CyO/+ is a pair of chromosomes inside one fly. CyO/+ × +/+ is a cross between two flies. Record the vial, generation, markers you selected and the checks you plan to make.',
        ],
      },
      choice('In w/w; CyO/+; TM3/+, what does the first semicolon separate?', [
        [
          'The X pair from chromosome pair 2.',
          'Right. A semicolon separates different chromosome pairs; a slash separates the members of one pair.',
          true,
        ],
        ['The female from the male.', "The × symbol separates parents. This record describes one fly's chromosome pairs."],
      ]),
      {
        type: 'gametes',
        title: 'Read before choosing',
        visual: 'assortment',
        parent: 'w/w; CyO/+; TM3/+',
        chroms: ['2', '3'],
        intro: 'Read the record, then find every chromosome-2/chromosome-3 egg type. Choose one chromosome from each pair.',
        done: 'Four combinations, each with one chromosome 2 and one chromosome 3. The semicolon separates chromosome groups within a gamete.',
      },
      choice('Which record describes a male carrying w on his only X?', [
        ['w/Y; +/+; +/+', 'Right. This male has Y paired with his X, and w is the allele on that X.', true],
        ['w/w; +/+; +/+', 'This record has two X chromosomes carrying w. A male record needs an X paired with Y.'],
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
          'You need to move a lethal mutation with no visible marker into a stock carrying GAL4. A colleague crosses mut/CyO to a driver stock with normal chromosome-2s. They keep non-Curly offspring and cross these to a double balancer.',
          'The final Curly group can contain both mut/CyO and +/CyO. Curly identifies CyO, but the other parent could pass on mut or +. Keeping more Curly flies cannot separate these hidden alternatives.',
        ],
      },
      choice(
        'What needs changing before the final generation?',
        [
          [
            'Use a marked intermediate so you can distinguish mut from +.',
            'Right. You must be able to follow the wanted chromosome at every selection, not just the last.',
            true,
          ],
          [
            'Keep more of the ambiguous Curly class.',
            'The two genotypes look the same. More flies with that appearance do not tell you which unmarked chromosome each carries.',
          ],
        ],
        'guide',
      ),
      {
        type: 'mission',
        stage: 'practise',
        title: 'Build the verified target class',
        puzzle: 3,
        intro:
          'Build a stock with mut/CyO and GAL4/TM6B. Choose the crosses and which offspring to keep across generations. A poor selection can leave different hidden genotypes together in a vial.',
      },
      choice(
        'Your crosses produced the target class. What have you established?',
        [
          [
            'The selected class has the target genotype, assuming the recorded stocks and crosses are correct.',
            'Right. The recorded chromosome inheritance supports this genotype, but stock identity and laboratory checks still matter.',
            true,
          ],
          [
            'Every other vial on the shelf also has the target.',
            'Each kept group has its own chromosome combination. Building the target in one vial says nothing about the others.',
          ],
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
          'The target carries UAS-GFP/CyO on chromosome 2 and GAL4,UAS-RNAi over TM6B on chromosome 3. GAL4 and UAS-RNAi start on separate chromosome-3s. A crossover during egg formation must bring them together.',
          'Work backwards from the target. Prepare the chromosome-2 stock while you make virgin females carrying the two different chromosome-3 insertions. At each generation, record the markers that identify the wanted chromosomes and the checks still needed.',
        ],
      },
      {
        type: 'mission',
        stage: 'practise',
        title: 'Build the complete research stock',
        puzzle: 5,
        intro:
          'Use the stocks on the shelf to build the target over three generations. Plan the crossover and balancing steps, prepare stocks in parallel and use marker dosage to choose the right flies.',
      },
      choice(
        'A candidate has the expected eye colour and balancer markers. What should you check before using its RNAi phenotype to infer gene function?',
        [
          [
            'Confirm both insertions are present and work, then compare independent lines and matched controls.',
            'Right. The markers help identify the chromosome combination, but do not show that both insertions work or that RNAi caused the phenotype.',
            true,
          ],
          [
            "Treat the markers as proof of the gene's biological function.",
            'The markers help track chromosomes. They do not establish which genetic change caused the phenotype.',
          ],
        ],
        'diagnose',
      ),
      choice(
        'A phenotype appears only after warming the flies. Which evidence best supports a knockdown during that period?',
        [
          [
            'The target protein falls during the assay, with temperature-matched controls and independent checks of the target effect.',
            'Right. You need evidence linking the constructs to a protein change and that change to the phenotype.',
            true,
          ],
          [
            'Only the experimental flies were warmed.',
            'Then temperature and knockdown change together. You cannot tell which caused the phenotype.',
          ],
          [
            'The DNA record alone confirms when protein disappeared.',
            'A DNA record shows which constructs are present. It does not measure their activity or when the protein changes.',
          ],
        ],
        'diagnose',
      ),
      {
        type: 'reflection',
        stage: 'diagnose',
        title: 'Write your experimental argument',
        prompts: {
          hypothesis: 'What biological explanation are you testing? What result would show it is wrong?',
          design: 'Which genotypes, separately derived lines, controls and scoring rules will you use? When will you measure the result?',
          evidence: 'How will you check that the constructs work and separate the target effect from other genetic or temperature effects?',
        },
      },
      {
        type: 'text',
        stage: 'diagnose',
        visual: 'screens',
        title: 'A research conclusion includes its limits',
        body: [
          'Keep your cross records, line identities, sampling unit, scoring rules, control results and measurement times with the conclusion. Building the right stock is the starting point for testing the biological question.',
          'Try these skills with unfamiliar stocks under supervision. Use independent checks of identity and function before relying on a line in an experiment.',
        ],
      },
    ],
  },
};
