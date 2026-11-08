import { esc } from './chromosomes.js';

export const MOLECULAR_GUIDES = {
  transgenesis: {
    title: 'From a DNA donor to an inherited insertion',
    frames: [
      [
        'Choose the recipient',
        'The known recipient chromosome has attP. The donor plasmid carries attB and the construct you want to introduce.',
      ],
      ['Integrate the donor', 'PhiC31 integrase joins attB and attP. The inserted donor is now flanked by the hybrid sites attL and attR.'],
      [
        'Recover a family',
        'Cross a G0 founder separately. Candidate F1 offspring must inherit the insertion through the germline, not just show a body-cell signal.',
      ],
      [
        'Verify and maintain',
        'Confirm transmission, insertion junctions, construct sequence and function. Keep a recorded, verified family as the new stock.',
      ],
    ],
  },
  gal80: {
    title: 'GAL80 subtracts from the GAL4 expression pattern',
    frames: [
      [
        'Keep the DNA in view',
        'The known fly carries GAL4, UAS-reporter and GAL80 transgenes. Repression changes their activity without deleting these DNA sequences.',
      ],
      ['Find the driver domain', 'The driver makes GAL4 in A and B. Group C has the UAS DNA but lacks the GAL4 activator, so C stays off.'],
      ['Add the repressor domain', 'GAL80 is made in B and blocks GAL4 activity there. In A, GAL4 can still activate the UAS reporter.'],
      [
        'Read the remaining pattern',
        'Reporter activity remains in A. B is repressed and C lacks GAL4. Compare the actual pattern with and without GAL80.',
      ],
    ],
  },
  geneswitch: {
    title: 'GeneSwitch: inherited DNA, drug-controlled activation',
    frames: [
      [
        'Inherit both parts',
        'The fly inherits the GeneSwitch driver and UAS responder. The drug will change activation, not which chromosomes the fly carries.',
      ],
      [
        'Build the fusion protein',
        'GeneSwitch combines a GAL4 DNA-binding region, a progesterone-receptor drug-binding region and a p65 activation region.',
      ],
      [
        'Supply RU486',
        'RU486 activates the drug-responsive protein. UAS transcription can rise in cells that make GeneSwitch, followed by protein accumulation.',
      ],
      [
        'Compare matched treatments',
        'Compare drug and vehicle within the experimental genotype and suitable genetic controls. Check basal expression and the response at the assay time.',
      ],
    ],
  },
  'recombination-tools': {
    title: 'Read the starting DNA before predicting the product',
    frames: [
      [
        'Meiotic exchange',
        'An exchange between non-sister chromatids in female meiosis can turn AB and ab into Ab and aB. Recover offspring to keep an inherited product.',
      ],
      [
        'Same-direction FRT sites',
        'FLP can excise the DNA between two same-direction FRT sites on one molecule. One FRT remains at the chromosome junction.',
      ],
      [
        'Opposite-direction FRT sites',
        'Opposite FRT orientations allow the intervening DNA to invert. This is a different product from excision or a homozygous cell clone.',
      ],
      [
        'Integration or templated repair',
        'PhiC31 joins attB and attP to insert donor DNA. Homology-directed repair instead uses matching donor sequences to repair a targeted DNA break.',
      ],
    ],
  },
};

const amber = '#efb95f',
  blue = '#88ccec',
  purple = '#c89bdc',
  green = '#93d5a5';
const text = (x, y, s, cls = 'scene-note') => `<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${esc(s)}</text>`;
const title = (s) => text(450, 35, s, 'scene-title');
const box = (x, y, w, s, colour = amber) =>
  `<g class="scene-token"><rect x="${x - w / 2}" y="${y - 17}" width="${w}" height="34" rx="8" fill="${colour}"/>${text(x, y + 5, s, 'scene-alleles')}</g>`;
const line = (x1, y1, x2, y2) => `<path class="scene-arrow active-flow" d="M${x1} ${y1}L${x2} ${y2}" marker-end="url(#guide-arrow)"/>`;
const dna = (y) => `<path d="M100 ${y}H800" stroke="${blue}" stroke-width="8" stroke-linecap="round"/>`;
const plasmid = (x, y) =>
  `<g class="scene-token"><circle cx="${x}" cy="${y}" r="51" fill="none" stroke="${purple}" stroke-width="9"/>${text(x, y - 5, 'attB', 'scene-alleles')}${text(x, y + 18, 'donor')}</g>`;

function transgenesis(f) {
  if (f < 2)
    return (
      title(f ? 'Integrase joins the donor to the landing site' : 'Choose matching donor and recipient sites') +
      dna(228) +
      (f
        ? box(250, 228, 90, 'attL', purple) + box(450, 228, 230, 'introduced construct', green) + box(650, 228, 90, 'attR', purple)
        : box(450, 228, 115, 'attP', amber)) +
      (f
        ? text(450, 120, 'Donor DNA becomes part of the chromosome')
        : plasmid(270, 120) + line(330, 135, 420, 200) + text(610, 125, 'phiC31 integrase joins attB to attP')) +
      text(450, 304, f ? 'Verify both donor–chromosome boundaries' : 'Known recipient chromosome with an attP landing site')
    );
  return (
    title(f === 2 ? 'Follow a founder into its offspring' : 'Establish a verified stock') +
    box(180, 115, 160, 'one G0 founder') +
    line(275, 115, 410, 115) +
    box(550, 115, 210, 'separate F1 family', blue) +
    [300, 450, 600]
      .map((x, i) =>
        box(
          x,
          215,
          125,
          f === 2 ? ['candidate', 'candidate', 'unmarked'][i] : ['junctions', 'sequence', 'function'][i],
          f === 2 && i === 2 ? blue : green,
        ),
      )
      .join('') +
    line(550, 145, 450, 183) +
    text(450, 285, f === 2 ? 'Screen inheritance · keep families separate' : 'Confirm transmission · record the final genotype') +
    text(
      450,
      315,
      f === 2
        ? 'A body-cell signal alone does not establish germline transmission.'
        : 'Keep the verified line with suitable stock maintenance.',
    )
  );
}

function gal80(f) {
  if (!f)
    return (
      title('Three transgenes stay in the fly') +
      [175, 450, 725]
        .map((x, i) => box(x, 155, 210, ['driver: GAL4', 'responder: UAS', 'repressor: GAL80'][i], [amber, blue, purple][i]))
        .join('') +
      text(450, 250, 'DNA inheritance and gene activity are different questions.')
    );
  return (
    title(['', 'GAL4 is made in A and B', 'GAL80 overlaps with GAL4 only in B', 'Remaining reporter pattern: A'][f]) +
    [190, 450, 710]
      .map((x, i) => {
        const on = i === 0 || (i === 1 && f === 1),
          blocked = i === 1 && f >= 2;
        return (
          `<circle cx="${x}" cy="170" r="83" fill="${on ? green : '#304653'}" fill-opacity=".25" stroke="${blocked ? purple : blue}" stroke-width="3"/>` +
          text(x, 115, ['A', 'B', 'C'][i], 'scene-title') +
          text(x, 155, i < 2 ? 'GAL4 present' : 'no GAL4') +
          text(x, 190, blocked ? 'GAL80 present' : 'no GAL80 here') +
          text(x, 225, on ? 'reporter ON' : 'reporter OFF') +
          (on ? line(x, 248, x, 275) : '')
        );
      })
      .join('') +
    text(450, 314, 'All three groups still carry the UAS reporter DNA.')
  );
}

function geneswitch(f) {
  if (!f)
    return (
      title('Inherit a GeneSwitch driver and a UAS responder') +
      box(235, 140, 280, 'GeneSwitch driver', amber) +
      box(665, 140, 280, 'UAS · output gene', blue) +
      line(390, 140, 505, 140) +
      text(450, 245, 'Activation requires the drug-responsive driver protein.') +
      text(450, 285, 'Adding RU486 does not alter the chromosome combination.')
    );
  if (f === 1)
    return (
      title('Three regions make one GeneSwitch protein') +
      `<path d="M125 155H775" stroke="${blue}" stroke-width="8"/>` +
      box(235, 155, 210, 'GAL4 DNA binding', amber) +
      box(450, 155, 210, 'drug binding', purple) +
      box(665, 155, 210, 'p65 activation', green) +
      [235, 450, 665].map((x, i) => text(x, 235, ['recognises UAS', 'responds to RU486', 'activates transcription'][i])).join('') +
      text(450, 300, 'The driver control DNA decides where this protein is made.')
    );
  if (f === 2)
    return (
      title('Drug-dependent activation, then RNA and protein') +
      box(170, 135, 160, 'RU486', purple) +
      line(265, 135, 335, 135) +
      box(450, 135, 210, 'GeneSwitch', amber) +
      line(450, 160, 450, 205) +
      `<path d="M100 235H570" stroke="${blue}" stroke-width="8" stroke-linecap="round"/>` +
      box(450, 235, 200, 'UAS · output gene', blue) +
      line(565, 235, 690, 235) +
      box(750, 235, 95, 'RNA', green) +
      text(450, 310, 'Protein accumulates later · measure the response at your assay time.')
    );
  return (
    title('Separate induction from drug and driver effects') +
    [130, 210]
      .map(
        (y, i) =>
          text(125, y + 5, i ? 'genetic controls' : 'full system') + box(390, y, 190, 'vehicle', blue) + box(680, y, 190, 'RU486', purple),
      )
      .join('') +
    text(450, 280, 'Match age, background, food, handling and assay time.') +
    text(450, 312, 'Check basal activity and induced expression directly.')
  );
}

const site = (x, y, reverse = false) =>
  `<path d="M${x - 18} ${y - 16}L${x + 18} ${y}L${x - 18} ${y + 16}Z" fill="${amber}" transform="rotate(${reverse ? 180 : 0} ${x} ${y})"/>`;
function recombinationTools(f) {
  if (!f)
    return (
      title('Female meiosis: exchange between non-sister chromatids') +
      box(260, 110, 170, 'A · B', amber) +
      box(260, 190, 170, 'a · b', blue) +
      line(370, 150, 520, 150) +
      box(605, 110, 85, 'A', amber) +
      box(695, 110, 85, 'b', blue) +
      box(605, 190, 85, 'a', blue) +
      box(695, 190, 85, 'B', amber) +
      text(450, 280, 'New allele combinations can enter eggs and then offspring.')
    );
  if (f < 3)
    return (
      title(f === 1 ? 'FLP: same-direction sites allow excision' : 'FLP: opposite-direction sites allow inversion') +
      dna(110) +
      site(280, 110) +
      box(450, 110, 240, 'A → B', purple) +
      site(620, 110, f === 2) +
      text(160, 83, 'FRT') +
      text(740, 83, 'FRT') +
      line(450, 145, 450, 185) +
      (f === 1 ? `<path d="M100 230H540" stroke="${blue}" stroke-width="8" stroke-linecap="round"/>` : dna(230)) +
      (f === 1
        ? site(450, 230) +
          `<circle cx="700" cy="230" r="48" fill="none" stroke="${purple}" stroke-width="6"/>` +
          site(700, 182) +
          text(700, 235, 'A · B')
        : site(280, 230) + box(450, 230, 240, 'B ← A', purple) + site(620, 230, true)) +
      text(
        450,
        315,
        f === 1
          ? 'Chromosome retains one FRT · excised circle carries the segment'
          : 'The DNA stays on the chromosome, with the segment reversed.',
      )
    );
  return (
    title('Choose an insertion site or a repair template') +
    text(180, 105, 'phiC31 integration') +
    box(410, 100, 100, 'attL', purple) +
    box(560, 100, 160, 'donor DNA', green) +
    box(710, 100, 100, 'attR', purple) +
    text(180, 205, 'targeted HDR') +
    box(410, 200, 100, 'left match', blue) +
    box(560, 200, 160, 'planned edit', green) +
    box(710, 200, 100, 'right match', blue) +
    text(450, 280, 'Integration uses attachment sites; HDR copies a matching donor.') +
    text(450, 313, 'Recover and verify the inherited DNA product.')
  );
}

export const MOLECULAR_SCENES = { transgenesis, gal80, geneswitch, 'recombination-tools': recombinationTools };
