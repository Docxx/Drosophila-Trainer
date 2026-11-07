// Cross Puzzles. Each puzzle: a target genotype, a shelf of stocks, and par
// (the fewest generations that can produce a class made only of target flies).
// Par values are checked by tools/check-puzzles.mjs.

const DB = { text: 'w; Sco/CyO; TM3/TM6B', name: 'Double balancer', note: 'Balancers on 2 and 3, each over a marked chromosome. The workhorse for building stocks.' };

export const PUZZLES = [
  {
    id: 'cross-1',
    title: 'Balance it',
    skill: 'One balancer',
    summary: 'Put a homozygous UAS-GFP insertion over CyO.',
    story:
      'A colleague sent you a UAS-GFP line that is homozygous. Before it gets mixed up with anything else, put it over a balancer so you can always follow it by the Curly wings.',
    target: 'w; UAS-GFP/CyO; +/+',
    par: 1,
    stocks: [
      { text: 'w; UAS-GFP; +', name: 'UAS-GFP', note: 'Homozygous transgene on chromosome 2, marked by mini-white.' },
      { text: 'w; Sco/CyO; +', name: 'Sco/CyO', note: 'Chromosome-2 balancer stock. Sco/Sco and CyO/CyO both die, so every fly is Sco/CyO.' },
    ],
    hints: [
      'Cross UAS-GFP virgins to Sco/CyO males (or the other way round).',
      'Each progeny fly gets UAS-GFP from one parent and either Sco or CyO from the other. Keep the Curly flies without Scutoid.',
    ],
  },
  {
    id: 'cross-2',
    title: 'Double trouble',
    skill: 'Reading two balancers',
    summary: 'Use a double-balancer stock and pick the one right class out of several.',
    story:
      'This time the lab wants UAS-GFP over CyO with TM6B on chromosome 3 as well, so the stock is ready to take a third-chromosome insertion later. Your only balancer stock carries both chromosomes balanced.',
    target: 'w; UAS-GFP/CyO; +/TM6B',
    par: 1,
    stocks: [{ text: 'w; UAS-GFP; +', name: 'UAS-GFP', note: 'Homozygous transgene on chromosome 2.' }, DB],
    hints: [
      'One cross does it. Score chromosome 2 and chromosome 3 separately.',
      'Curly but not Scutoid means CyO over UAS-GFP. Humeral and Tubby but not Stubble means TM6B over +.',
    ],
  },
  {
    id: 'cross-3',
    title: 'Driver meets reporter',
    skill: 'Two-generation build',
    summary: 'Build w; UAS-GFP/CyO; GAL4/TM6B from separate stocks.',
    story:
      'You want a balanced stock that carries both the reporter and the driver, so one cross later gives you GAL4 > GFP flies. The two transgenes are on different chromosomes and come from different stocks.',
    target: 'w; UAS-GFP/CyO; GAL4/TM6B',
    par: 2,
    stocks: [
      { text: 'w; UAS-GFP; +', name: 'UAS-GFP', note: 'Reporter on chromosome 2.' },
      { text: 'w; +; GAL4', name: 'GAL4 driver', note: 'Driver on chromosome 3.' },
      DB,
    ],
    hints: [
      'No single cross can do it: the final flies need UAS-GFP and CyO from different parents, and GAL4 and TM6B from different parents.',
      'Generation 1, in parallel: balance each transgene over the double balancer, keeping a different balancer from each. For example UAS-GFP/Sco; TM6B/+ from one cross and CyO/+; GAL4/TM3 from the other.',
      'Generation 2: cross those two together. Curly not Scutoid, Humeral not Stubble.',
    ],
  },
  {
    id: 'cross-4',
    title: 'The invisible lethal',
    skill: 'Following an unmarked mutation',
    summary: 'Move an unmarked lethal mutation into a new stock without losing track of it.',
    story:
      'mut¹ is a recessive lethal with no visible phenotype. It is kept over CyO. You need it in a stock with a GAL4 driver on 3, both balanced. Careful: once mut¹ leaves its balancer you can only follow it by knowing where it must be.',
    target: 'w; mut/CyO; GAL4/TM6B',
    par: 2,
    stocks: [
      { text: 'w; mut/CyO; +', name: 'mut¹/CyO', note: 'Recessive lethal, unmarked. Only mut¹/CyO flies survive in this stock.' },
      { text: 'w; +; GAL4', name: 'GAL4 driver', note: 'Driver on chromosome 3.' },
      DB,
    ],
    hints: [
      'The tempting route (mut¹/CyO × GAL4, then × the double balancer) loses mut¹: in the last cross mut¹/CyO and +/CyO look identical.',
      'Always swap mut¹ from one marked chromosome to another. mut¹/CyO × the double balancer gives mut¹/Sco, which you can recognise (Scutoid, not Curly).',
      'Then cross mut¹/Sco; TM6B/+ to CyO/+; GAL4/TM3 (from GAL4 × double balancer) and keep Curly, not Scutoid, Humeral, not Stubble.',
    ],
  },
  {
    id: 'cross-5',
    title: 'Two on one',
    skill: 'Recombination',
    summary: 'Recombine GAL4 and UAS-RNAi onto the same third chromosome.',
    story:
      'You want GAL4 and UAS-RNAi on one chromosome 3, so the pair is inherited as a unit and chromosome 2 stays free for other tools. That needs a crossover, and crossovers happen only in female meiosis.',
    target: 'w; +/+; GAL4,UAS-RNAi/TM6B',
    par: 2,
    stocks: [
      { text: 'w; +; GAL4', name: 'GAL4 driver', note: 'Driver on chromosome 3.' },
      { text: 'w; +; UAS-RNAi', name: 'UAS-RNAi', note: 'RNAi transgene on chromosome 3.' },
      { text: 'w; +; TM3/TM6B', name: 'TM3/TM6B', note: 'Chromosome-3 balancer stock.' },
    ],
    hints: [
      'First make GAL4/UAS-RNAi trans-heterozygotes. Neither chromosome is a balancer, so they can recombine.',
      'Only GAL4/UAS-RNAi females recombine. Males pass their chromosomes on intact, so crossing trans-heterozygous males gets you nowhere.',
      'Cross the trans-heterozygous virgins to TM3/TM6B males. A recombinant carries two mini-white copies: look for darker eyes with Humeral, not Stubble.',
    ],
  },
  {
    id: 'cross-6',
    title: 'The full build',
    skill: 'Putting it together',
    summary: 'Build w; UAS-GFP/CyO; GAL4,UAS-RNAi/TM6B from four stocks.',
    story:
      'The final stock carries a reporter on 2 and a driver-RNAi recombinant on 3, both balanced. It takes recombination, balancing and eye-colour dosage to get there.',
    target: 'w; UAS-GFP/CyO; GAL4,UAS-RNAi/TM6B',
    par: 3,
    stocks: [
      { text: 'w; UAS-GFP; +', name: 'UAS-GFP', note: 'Reporter on chromosome 2.' },
      { text: 'w; +; GAL4', name: 'GAL4 driver', note: 'Driver on chromosome 3.' },
      { text: 'w; +; UAS-RNAi', name: 'UAS-RNAi', note: 'RNAi transgene on chromosome 3.' },
      DB,
    ],
    hints: [
      'The recombinant chromosome first exists in generation 2 (it forms in the germline of generation-1 females), so par is 3.',
      'Generation 1: GAL4 × UAS-RNAi for trans-heterozygous virgins, and in parallel UAS-GFP × the double balancer, keeping UAS-GFP/Sco; TM6B/+.',
      'Generation 2: trans-heterozygous virgins × double balancer males. Keep Curly, Humeral, dark orange flies: +/CyO; GAL4,UAS-RNAi/TM6B.',
      'Generation 3: cross that to UAS-GFP/Sco; TM6B/+. Keep Curly not Scutoid, Humeral not Stubble, and dark orange eyes (three mini-white copies) rather than orange (one).',
    ],
  },
];
