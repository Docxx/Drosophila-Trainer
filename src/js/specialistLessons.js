// Source-aligned teaching beyond the scored stock-building engine.
// A multiple-choice step: options are [text, why, correct?].
const choice = (question, options, stage) => ({
  type: 'choice',
  stage,
  question,
  options: options.map(([text, why, correct]) => ({ text, why, correct: !!correct })),
});
export const SPECIALIST_LESSONS = {
  flyroom: {
    title: 'From a vial to a reliable cross',
    steps: [
      {
        type: 'text',
        visual: 'life-cycle',
        title: 'Recognise the generation in the vial',
        body: [
          'Flies develop from eggs through three larval stages, called instars, then pupae and adults. Larvae feed in the food and later leave it to pupate. An adult emerges from the pupa; this is called eclosion.',
          'Development time changes with temperature and rearing conditions. Keep track of which adults were already present and which emerged after you cleared the vial. A vial without new adults can still contain developing offspring.',
        ],
      },
      {
        type: 'text',
        visual: 'life-cycle',
        title: 'A stock is also a record',
        body: [
          "Give each vial a unique label. Keep the original genotype, source/stock identifier, dates and notes about problems. Keep the donor's original notes even if you use a shorter everyday label.",
          "Keep labelled backup vials and check cultures using your laboratory's routine. Record which vials supplied the females and males, with clearing and collection times. Mark an uncertain history as uncertain.",
        ],
      },
      choice('A vial has larvae but no newly emerged adults. Does this show the cross failed?', [
        [
          'No: the offspring may still be developing.',
          'Right. Larvae must develop through pupae before you can score the new adults.',
          true,
        ],
        [
          'Yes: successful crosses immediately produce adults.',
          'Eggs must pass through larval and pupal stages. A cross does not immediately produce adults.',
        ],
      ]),
      {
        type: 'text',
        visual: 'sex-gametes',
        title: 'Sex and virginity answer different questions',
        body: [
          'Use body features to identify sex. Use the source-vial history to support virgin collection. A fly that looks young is not automatically known to be unmated.',
          'A previously mated female can use stored sperm, changing which male fathers her offspring. Set uncertain flies aside at the microscope, or discard the batch and re-clear the source in First cross.',
        ],
      },
      choice('Two females look equally pale, but only one has a trusted source-vial record. What is established?', [
        [
          'Only one has a record supporting collection as a virgin.',
          "Right. A chromosome prediction depends on the parents, so record the mating evidence separately from the fly's colour.",
          true,
        ],
        ['Matching colour proves matching virginity.', 'Colour can suggest age. It does not record whether the fly has mated.'],
      ]),
      {
        type: 'text',
        visual: 'life-cycle',
        title: 'Separate parents from the scored offspring',
        body: [
          'Label each generation and record which stock supplied each parent. Remove parents at a recorded stage so you do not mistake them for new F1 adults.',
          "Follow your laboratory's protocol and check the flies' actual development. Use the recorded generation and collection times when deciding which adults to score.",
        ],
      },
    ],
  },
  strategies: {
    title: 'Choose the genetic strategy for the question',
    model: [
      'These diagrams show mechanisms, not a simulation of transgene insertion, stock recovery or every clone-segregation outcome. The stock builder uses the chromosome types shown on its shelf.',
    ],
    steps: [
      {
        type: 'text',
        visual: 'screens',
        title: 'Start with the question, not the favourite tool',
        body: [
          'Forward genetics starts with a phenotype and searches for the gene responsible. Reverse genetics starts with a chosen gene and tests what happens when it is changed. Both need checks of chromosome identity and cause.',
          'Loss of function reduces gene activity. Gain of function can increase activity or change where it occurs or what it does. Dominant and recessive describe how an effect is inherited; they do not directly tell you the molecular change.',
        ],
      },
      {
        type: 'text',
        visual: 'gal4uas',
        title: 'What exactly does the fluorescent signal report?',
        body: [
          "An enhancer is DNA that controls gene expression. An enhancer/reporter construct tests a chosen DNA fragment, while an enhancer trap reports nearby regulatory activity. A protein trap or endogenous tag labels the gene's own protein so you can follow where it is made and accumulates.",
          "GAL4-driven UAS fluorescence reports where the driver is active. It does not automatically show where the gene's own protein sits. Decide whether you need to measure gene activity, protein location or the behaviour of a marked cell group.",
        ],
      },
      choice("You want to see where a gene's own protein accumulates. Which distinction matters most?", [
        [
          'A checked tag on that protein measures its location more directly than a generic GAL4-driven GFP pattern.',
          'Right. A driver-driven reporter and a tag attached to the protein measure different things.',
          true,
        ],
        [
          'Any GFP signal proves the endogenous protein has that localisation.',
          'A driver-driven reporter can label a cell without being attached to the protein you want to study.',
        ],
      ]),
      {
        type: 'text',
        visual: 'marcm',
        title: 'Why a repressible clone marker helps',
        body: [
          'MARCM means mosaic analysis with a repressible cell marker. GAL80 initially blocks GAL4 from activating the marker. FLP/FRT exchange and chromosome segregation can give mutant daughter cells no GAL80, while the other daughter keeps it.',
          'Without GAL80, the mutant cells can become fluorescent where GAL4 is active. Check control clones and marker timing, then measure the biological effect you want to explain.',
        ],
      },
      choice('A GFP-marked mutant clone is smaller than nearby tissue. Does this show the gene is needed for growth?', [
        [
          'Not yet: compare matched control clones across independent tissues.',
          'Right. The marker identifies the clone, but induction time, position and survival can also affect its size.',
          true,
        ],
        [
          'Yes: a fluorescent marker eliminates every lineage-history effect.',
          'A fluorescent marker does not give every clone the same growth history or survival.',
        ],
      ]),
      {
        type: 'text',
        visual: 'maternal',
        title: 'A mutant embryo can inherit functional maternal product',
        body: [
          'A mother can put RNA or protein into her eggs. An embryo with two mutant alleles may still use this maternal supply, hiding an early defect.',
          'Germline cells make eggs or sperm. A germline clone can change what the mother supplies to an egg without changing every cell in her body. Track the germline genotype, egg allele and paternal allele separately, and check that the resulting embryos survive long enough to score.',
        ],
      },
      choice('Early m/m embryos from heterozygous mothers look normal. What remains plausible?', [
        [
          'Protein or RNA from the mother could hide the early defect; test maternal supply and later embryo expression.',
          "Right. An embryo's early behaviour depends on what its mother supplied as well as the DNA it inherited.",
          true,
        ],
        [
          'The absence of an early phenotype proves the gene has no developmental role.',
          "The mother's RNA or protein may hide a requirement at this stage. Test later stages and the effect of removing that supply.",
        ],
      ]),
      {
        type: 'text',
        visual: 'complementation',
        title: 'From candidate to a causal argument',
        body: [
          'Mapping links a phenotype to a chromosome region or candidate gene. Test the candidate with another allele, a rescue that restores gene function, or a direct measurement of its activity. Choose the comparison that rules out the main alternative explanation.',
          "Ask which new result would distinguish the possible causes. Repeating an ambiguous observation will not resolve it. Check each tool's original stock record and supporting evidence before relying on its label.",
        ],
      },
    ],
  },
};
