// Visual teaching examples. They explain mechanisms without reading exercise
// answers or revealing an unknown stock. Chromosome positions are schematic.
import { esc } from './chromosomes.js';

export const VISUAL_GUIDES = {
  inheritance: { title: 'Follow a chromosome into the next generation', frames: [
    ['Two homologs', 'A diploid parent has two homologs of this chromosome, carrying A and a. Only one chromosome pair is shown.'],
    ['Separate into gametes', 'Meiosis separates the homologs. Each gamete receives one member of the pair.'],
    ['Fertilisation', 'Here either kind of egg can meet a sperm carrying a. Follow each chromosome’s label and colour.'],
    ['Restore the pair', 'The offspring receives one homolog from each parent: A/a or a/a in this example.'],
  ] },
  xlinked: { title: 'Trace the X from mother to offspring', frames: [
    ['Parental chromosomes', 'Example: an Xᴬ/Xᵃ mother and Xᴬ/Y father. A is a functional allele; a is recessive.'],
    ['Follow one maternal egg', 'We follow an egg carrying Xᵃ. The father can contribute Xᴬ or Y. The other maternal egg type is not shown.'],
    ['Two possible offspring', 'With paternal Xᴬ, this egg makes an Xᵃ/Xᴬ daughter. With paternal Y, it makes an Xᵃ/Y son.'],
    ['Read the allele copies', 'The daughter has a functional A copy; the son has only a at this locus. The Y does not provide a normal allele here. This example uses usual XX/XY flies.'],
  ] },
  balancers: { title: 'Keep a lethal chromosome in a stock', frames: [
    ['A recessive lethal', 'The mutation m is carried on one homolog. An m/+ fly survives because the other homolog supplies a functional copy.'],
    ['Pair it with a balancer', 'In this teaching example, Bal carries a visible dominant marker and is lethal when homozygous. Its inversions suppress recovery of recombinants.'],
    ['Transmit whole chromosomes', 'The simplified model transmits m or Bal without recombination between them. Real balancers are not absolute barriers to exchange.'],
    ['Cross two carriers', 'For m/Bal × m/Bal, m/m and Bal/Bal die. Surviving m/Bal carriers retain the lethal chromosome and the visible marker.'],
  ] },
  chance: { title: 'From chromosome probabilities to counts', frames: [
    ['A chromosome pair', 'For this example, follow transmission of A or a from an A/a parent.'],
    ['Equal probabilities', 'Each gamete has a 1/2 chance of receiving either homolog. Probability describes repeated events, not a fixed quota.'],
    ['A small sample', 'An illustrative sample has 12 A and 8 a transmissions. Chance can move a small sample away from its expected 1:1 ratio.'],
    ['A larger sample', 'Here 104 of 200 transmissions carry A. Compare relative deviations: larger samples usually vary less in proportion. A close fit does not prove a hypothesis.'],
  ] },
  recombination: { title: 'Watch a crossover exchange chromosome segments', frames: [
    ['Replicated homologs', 'A female has homologs AB and ab. Each has replicated into two sister chromatids; the four bars are chromatids.'],
    ['Exchange between non-sisters', 'Two non-sister chromatids exchange corresponding segments between A and B. The other two do not participate in this event.'],
    ['Read the products', 'This single crossover produces two parental chromatids, AB and ab, and two recombinant chromatids, Ab and aB.'],
    ['Score gametes', 'Gametes receive individual products of meiosis. Recombinant counts estimate exchange frequency; not every meiosis has the single crossover illustrated here. Drosophila males do not have meiotic crossovers.'],
  ] },
  gal4uas: { title: 'Assemble a genetic expression switch', frames: [
    ['Two DNA components', 'The driver carries GAL4; the responder carries UAS linked to an output gene. Insertion sites are unspecified.'],
    ['Make the activator', 'The driver produces GAL4 protein in its expression pattern. GAL4 can bind the responder’s UAS sequence.'],
    ['Activate the output', 'When both components are present and active in the same cell, GAL4 drives expression of the UAS-linked output.'],
    ['Compare controls', 'Driver alone and responder alone lack one component. Compare them with the combined genotype; additional controls depend on the experiment.'],
  ] },
  complementation: { title: 'Ask whether a functional gene copy remains', frames: [
    ['Two recessive mutations', 'Each chromosome carries a loss-of-function mutation. The question is which gene each mutation disrupts.'],
    ['Different genes', 'In a⁻ b⁺ / a⁺ b⁻, each gene has a functional copy on the other homolog. The mutations complement in this simplified example.'],
    ['The same gene', 'In a¹ b⁺ / a² b⁺, neither homolog provides functional a. These two recessive alleles fail to complement.'],
    ['Interpret the cross', 'Complementation tests gene function, not whether two DNA changes are identical. This example assumes recessive loss-of-function alleles without unusual interactions.'],
  ] },
  threepoint: { title: 'See why a third marker exposes two exchanges', frames: [
    ['An example chromosome order', 'Separate demonstration: the known order here is A–B–C, with homologs ABC and abc. These are not the exercise’s marker identities or answer.'],
    ['Two exchanges', 'After replication, the same two non-sister chromatids exchange once in each interval. This illustrates one kind of double crossover.'],
    ['Compare parental and DCO', 'ABC becomes AbC; abc becomes aBc. The outside alleles keep their parental arrangement, while the middle allele changes.'],
    ['Count both intervals', 'Each double-crossover product is recombinant in A–B AND B–C. Include it once in each interval total; an outside-marker-only score misses these two exchanges.'],
  ] },
  mosaics: { title: 'From chromosome exchange to a clone', frames: [
    ['A heterozygous cell', 'Start with an m/+ chromosome-arm pair. The FRT site lies between the centromere and the mutation.'],
    ['Mitotic recombination', 'After replication, FLP can induce exchange between matching FRT sites on non-sister chromatids.'],
    ['Reciprocal daughters', 'The segregation illustrated here gives m/m and +/+ daughters. Other segregation outcomes need not produce homozygous twins.'],
    ['Expand the lineages', 'Further divisions expand the two daughter lineages into neighbouring patches. Earlier induction leaves more divisions for expansion; colour labels genotype, not microscope fluorescence.'],
  ] },
  target: { title: 'Separate a temperature shift from its biological effect', frames: [
    ['Keep the DNA', 'The same fly retains GAL4, UAS-RNAi and GAL80ts. Temperature changes activity, not which transgenes it carries.'],
    ['Repress at 18 °C', 'Active GAL80ts represses GAL4. The target protein can be maintained while RNAi expression is suppressed.'],
    ['Shift to 29 °C', 'Repression is relieved and GAL4 activates RNAi. Existing target protein remains at first; a temperature shift is not an instant knockout.'],
    ['Wait for protein turnover', 'RNAi reduces new target-protein production. Existing protein turns over, so depletion lags behind activation. The time course depends on the construct and protein.'],
  ] },
  screens: { title: 'Connect independent chromosomes to screen coverage', frames: [
    ['Maintain one chromosome', 'A mutagenised chromosome is maintained over a balancer. One independent chromosome defines one line in this model.'],
    ['Build independent lines', 'Each new independently mutagenised chromosome adds another opportunity to recover an allele. Duplicating the same chromosome does not add independence.'],
    ['Find a target-gene allele', 'A target-gene allele may appear among many lines. More independent lines increase its recovery probability; they never guarantee it.'],
    ['Check mutation burden', 'Stronger mutagenesis can place several mutations on one chromosome. Balance coverage against interpretation and the vials needed to maintain the lines.'],
  ] },
};

const amber = '#efb95f', blue = '#88ccec', purple = '#c89bdc', green = '#93d5a5';
const text = (x, y, label, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(label)}</text>`;
const label = (x, y, title, subtitle = '') => text(x, y, title, 'scene-title') + (subtitle ? text(x, y + 24, subtitle, 'scene-note') : '');
const arrow = (x1, y1, x2, y2, active = true) => `<path class="scene-arrow ${active ? 'active-flow' : ''}" d="M${x1} ${y1} L${x2} ${y2}" marker-end="url(#guide-arrow)"/>`;
const cell = (x, y, r = 67, colour = '#304653') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${colour}" fill-opacity=".28" stroke="${colour}" stroke-width="2"/>`;
function chrom(x, y, alleles, colour = amber, { from = 0, balancer = false } = {}) {
  return `<g transform="translate(${x} ${y})"><g class="scene-token" style="--travel:${from}px"><rect x="-72" y="-13" width="144" height="26" rx="13" fill="${colour}"/>${balancer ? '<path d="M-55 -8l15 16 15-16 15 16 15-16 15 16 15-16 15 16" fill="none" stroke="#252737" stroke-width="3"/>' : ''}${text(0, 5, alleles, 'scene-alleles')}</g></g>`;
}
const pair = (x, y, a, b, ca = amber, cb = blue) => chrom(x, y - 20, a, ca, { balancer: a === 'Bal' }) + chrom(x, y + 20, b, cb, { balancer: b === 'Bal' });
const protein = (x, y, colour = green, ghost = false) => `<circle class="scene-protein ${ghost ? 'protein-ghost' : ''}" cx="${x}" cy="${y}" r="7" fill="${colour}"/>`;

function inheritance(frame) {
  if (frame === 0) return cell(450, 168, 85) + pair(450, 168, 'A', 'a') + label(450, 54, 'One chromosome pair', 'Homologs carry the same loci') + text(450, 294, 'A and a label different alleles of one gene.', 'scene-note');
  const xs = [250, 650];
  return xs.map((x, i) => cell(x, 168, frame >= 3 ? 85 : 67) + chrom(x, frame >= 3 ? 148 : 168, i ? 'a' : 'A', i ? blue : amber, { from: i ? -200 : 200 }) + (frame >= 3 ? chrom(x, 188, 'a', purple) : '') + label(x, 54, frame >= 3 ? `Offspring ${i ? 'a/a' : 'A/a'}` : `Egg carrying ${i ? 'a' : 'A'}`) + (frame === 2 ? cell(x + 110, 235, 37, purple) + text(x + 110, 240, 'a', 'scene-white') + arrow(x + 100, 208, x + 48, 180) : '')).join('') + text(450, 300, frame >= 3 ? 'One chromosome from the egg + one from the sperm' : frame === 2 ? 'Both eggs can meet a sperm carrying a (purple).' : 'Alternative gamete types: one homolog per pair', 'scene-note');
}
function xlinked(frame) {
  if (frame === 0) return cell(250, 175, 88) + pair(250, 175, 'Xᴬ', 'Xᵃ') + label(250, 48, 'Mother · Xᴬ/Xᵃ') + cell(650, 175, 88) + pair(650, 175, 'Xᴬ', 'Y', purple, purple) + label(650, 48, 'Father · Xᴬ/Y');
  if (frame === 1) return cell(230, 170) + chrom(230, 170, 'Xᵃ', blue, { from: 120 }) + label(230, 48, 'One possible egg') + [560, 760].map((x, i) => cell(x, 170, 67, purple) + chrom(x, 170, i ? 'Y' : 'Xᴬ', purple) + label(x, 48, i ? 'Y sperm' : 'X sperm')).join('') + text(450, 295, 'The other possible maternal egg carries Xᴬ; it is not followed here.', 'scene-note');
  return [270, 650].map((x, i) => cell(x, 168, 87) + pair(x, 168, 'Xᵃ', i ? 'Y' : 'Xᴬ', blue, purple) + label(x, 48, i ? 'Son · Xᵃ/Y' : 'Daughter · Xᵃ/Xᴬ') + (frame === 3 ? text(x, 293, i ? 'No functional A copy at this locus' : 'Functional A supplied by paternal X', 'scene-note') : '')).join('');
}
function balancers(frame) {
  if (frame < 2) return cell(450, 169, 90) + chrom(450, 149, 'm', amber) + chrom(450, 189, frame ? 'Bal' : '+', frame ? purple : blue, { balancer: !!frame }) + label(450, 44, frame ? 'Maintain m over Bal' : 'Carry m over a functional homolog') + text(450, 300, frame ? 'Bal: visible marker + inversions + homozygous lethal in this example' : 'm is recessive lethal; this m/+ carrier survives.', 'scene-note');
  if (frame === 2) return [270, 650].map((x, i) => cell(x, 170) + chrom(x, 170, i ? 'Bal' : 'm', i ? purple : amber, { from: i ? -180 : 180, balancer: !!i }) + label(x, 48, i ? 'Gamete carrying Bal' : 'Gamete carrying m')).join('') + text(450, 300, 'Follow the mutation chromosome and the balancer as distinct units.', 'scene-note');
  return [210, 450, 690].map((x, i) => cell(x, 170, 87, i === 1 ? green : '#9d6262') + pair(x, 170, i === 2 ? 'Bal' : 'm', i === 0 ? 'm' : 'Bal', i === 2 ? purple : amber, i === 0 ? amber : purple) + label(x, 45, ['m/m', 'm/Bal', 'Bal/Bal'][i]) + text(x, 296, i === 1 ? 'Survives · visible marker' : 'Homozygous lethal', 'scene-note')).join('');
}
function chance(frame) {
  if (frame < 2) return cell(270, 175, 85) + pair(270, 175, 'A', 'a') + arrow(370, 175, 495, 175) + (frame ? chrom(650, 130, 'A · probability ½', amber) + chrom(650, 220, 'a · probability ½', blue) : label(650, 170, 'Which homolog enters a gamete?')) + label(450, 45, frame ? 'Probability is not a quota' : 'Transmission from A/a');
  const n = frame === 2 ? 20 : 200, a = frame === 2 ? 12 : 104, cols = frame === 2 ? 10 : 25;
  return label(450, 40, `${a} A transmissions in a sample of ${n}`, 'Illustrative independent draws') + Array.from({ length: n }, (_, i) => `<circle class="scene-dot" style="--delay:${i * (frame === 2 ? 24 : 2)}ms" cx="${frame === 2 ? 225 + i % cols * 50 : 150 + i % cols * 25}" cy="${100 + Math.floor(i / cols) * (frame === 2 ? 52 : 18)}" r="${frame === 2 ? 15 : 5.5}" fill="${i < a ? amber : blue}"/>`).join('') + text(450, 285, `A: ${a} (${Math.round(a / n * 100)}%)    ·    a: ${n - a}    ·    Expected A share: 50%`, 'scene-note');
}
// Segment colours retain parental origin after exchange; labels carry meaning
// even when colour is not distinguishable.
function markedChrom(x, y, alleles, colours, width = 160, from = 0) {
  const size = width / alleles.length;
  return `<g transform="translate(${x} ${y})"><g class="scene-token" style="--travel:${from}px">${alleles.map((a, i) => `<rect x="${-width / 2 + i * size}" y="-13" width="${size}" height="26" rx="4" fill="${colours[i]}"/>${text(-width / 2 + (i + .5) * size, 5, a, 'scene-alleles')}`).join('')}</g></g>`;
}
function exchange(frame, three = false) {
  const top = three ? ['A', 'B', 'C'] : ['A', 'B'], bottom = three ? ['a', 'b', 'c'] : ['a', 'b'];
  if (frame < 2) {
    const strands = [top, top, bottom, bottom].map((a, i) => markedChrom(450, 98 + i * 48, a, a.map(() => i < 2 ? amber : blue), 440)).join('');
    return label(450, 38, frame ? (three ? 'Exchange in each interval on the same two non-sisters' : 'Exchange between non-sister chromatids') : 'Replicated maternal homologs') + strands
      + (frame ? `<rect x="${three ? 345 : 420}" y="126" width="${three ? 210 : 95}" height="88" rx="10" fill="#c89bdc" fill-opacity=".09" stroke="${purple}" stroke-dasharray="4 4"/>
        <path class="exchange-path" d="M${three ? 357 : 432} 146 C${three ? 380 : 455} 146 ${three ? 380 : 455} 194 ${three ? 403 : 478} 194 M${three ? 357 : 432} 194 C${three ? 380 : 455} 194 ${three ? 380 : 455} 146 ${three ? 403 : 478} 146" stroke="${purple}" fill="none" stroke-width="4"/>
        ${three ? `<path class="exchange-path" d="M500 146 C525 146 525 194 550 194 M500 194 C525 194 525 146 550 146" stroke="${green}" fill="none" stroke-width="4"/>` : ''}`
        : text(150, 126, 'Homolog 1', 'scene-note') + text(150, 222, 'Homolog 2', 'scene-note'))
      + text(450, 305, 'Four chromatids · coloured segments track their parental origin', 'scene-note');
  }
  const products = [top, three ? ['A', 'b', 'C'] : ['A', 'b'], three ? ['a', 'B', 'c'] : ['a', 'B'], bottom];
  if (three && frame === 3) return label(450, 40, 'One DCO chromosome contributes to BOTH intervals') + markedChrom(450, 135, ['A', 'b', 'C'], [amber, blue, amber], 360)
    + `<path d="M330 163v30h120v-30 M450 163v30h120v-30" fill="none" stroke="${purple}" stroke-width="3"/>`
    + text(390, 222, 'A–B', 'scene-note') + text(510, 222, 'B–C', 'scene-note') + text(450, 285, 'Outside A and C stay parental. Middle B changes to b.', 'scene-note');
  return label(450, 40, three ? 'Compare the outside alleles and the middle allele' : frame === 3 ? 'Each gamete receives one chromatid' : 'Two parental + two recombinant products')
    + products.map((a, i) => {
      const x = 150 + i * 200, changed = i === 1 || i === 2;
      return (frame === 3 ? cell(x, 170, 88) : '') + markedChrom(x, 170, a, a.map((gene) => gene === gene.toUpperCase() ? amber : blue), 160, 450 - x)
        + text(x, 265, changed ? three ? 'Double crossover' : 'Recombinant' : 'Parental', 'scene-note');
    }).join('') + text(450, 312, 'The allele labels and the segment colours both record chromosome origin.', 'scene-note');
}

function gal4uas(frame) {
  if (frame === 3) return [220, 450, 680].map((x, i) => cell(x, 170, 87, i === 2 ? green : '#667785') + text(x, 156, ['GAL4', 'UAS–output', 'GAL4 + UAS–output'][i], 'scene-white') + text(x, 190, i === 2 ? 'Output ON' : 'Output OFF', 'scene-white') + label(x, 43, i === 2 ? 'Both components' : 'Single-component control')).join('');
  return label(450, 40, 'Two DNA components in the same cell', 'Insertion sites are not specified') + chrom(230, 142, 'GAL4 driver', amber) + chrom(670, 142, 'UAS → output', blue) + (frame >= 1 ? arrow(310, 142, 570, 142) + text(445, 120, 'GAL4 protein', 'scene-note') + `<g class="scene-token" style="--travel:-290px">${protein(590, 142, amber)}</g>` : '') + (frame >= 2 ? cell(670, 237, 43, green) + text(670, 243, 'ON', 'scene-white') + arrow(670, 165, 670, 190) : '') + text(450, 305, frame === 0 ? 'Driver and responder can be inherited as separate genetic components.' : 'GAL4 activates the UAS-linked gene where the driver is active.', 'scene-note');
}
function complementation(frame) {
  if (frame === 3) return label(450, 44, 'Read functional copies across the chromosome pair') + [270, 650].map((x, i) => cell(x, 170, 87, i ? '#9d6262' : green) + text(x, 155, i ? 'No functional a' : 'Functional a AND b', 'scene-white') + text(x, 191, i ? 'Fails to complement' : 'Complements', 'scene-white') + text(x, 300, i ? 'Same gene disrupted' : 'Different genes disrupted', 'scene-note')).join('');
  const same = frame === 2;
  return label(450, 40, frame === 0 ? 'Mutations reside on chromosomes' : same ? 'Two mutations in the same gene' : 'Mutations in different genes') + pair(450, 160, same ? 'a¹     b⁺' : 'a⁻     b⁺', same ? 'a²     b⁺' : 'a⁺     b⁻') + (frame > 0 ? `<rect x="365" y="104" width="170" height="115" rx="14" fill="none" stroke="${same ? '#df9993' : green}" stroke-width="3"/>` + text(450, 270, same ? 'Both a copies are defective; normal b cannot replace a.' : 'Each homolog supplies the gene the other lacks.', 'scene-note') : text(450, 270, 'a and b are different genes, not alternative names for one gene.', 'scene-note'));
}
function mosaics(frame) {
  if (frame < 2) return label(450, 40, frame ? 'Replicated chromosomes · FLP at matching FRTs' : 'One cell · two homologs') + (frame ? [0, 1, 2, 3].map((i) => chrom(450, 98 + i * 45, i < 2 ? '●   FRT   m' : '●   FRT   +', i < 2 ? purple : green)).join('') : cell(450, 170, 88) + pair(450, 170, '●   FRT   m', '●   FRT   +', purple, green)) + (frame ? arrow(210, 163, 355, 163) + text(210, 140, 'FLP', 'scene-note') : '') + text(450, 305, '● centromere     ·     FRT proximal to the mutation', 'scene-note');
  if (frame === 2) return [270, 650].map((x, i) => cell(x, 175, 88, i ? green : purple) + pair(x, 175, i ? '+' : 'm', i ? '+' : 'm', i ? green : purple, i ? green : purple) + label(x, 44, i ? 'Reciprocal +/+ daughter' : 'Mutant m/m daughter')).join('');
  return label(450, 40, 'Daughter lineages expand as tissue grows') + `<ellipse cx="450" cy="180" rx="240" ry="105" fill="#53616a"/>` + Array.from({ length: 63 }, (_, i) => {
    const x = 275 + i % 9 * 43, y = 112 + Math.floor(i / 9) * 23;
    const mutant = i % 9 >= 2 && i % 9 <= 4 && Math.floor(i / 9) >= 2 && Math.floor(i / 9) <= 5;
    const twin = i % 9 >= 5 && i % 9 <= 7 && Math.floor(i / 9) >= 1 && Math.floor(i / 9) <= 4;
    return `<rect class="scene-patch" x="${x}" y="${y}" width="38" height="19" rx="4" fill="${mutant ? purple : twin ? green : '#74828c'}"/>`;
  }).join('') + text(450, 312, 'Purple m/m clone · Green +/+ twin · Grey m/+ tissue', 'scene-note');
}
function target(frame) {
  return label(450, 40, ['The DNA stays in the fly', '18 °C · GAL4 repressed', '29 °C · RNAi turns on', '29 °C · protein depletion follows'][frame]) + chrom(200, 110, 'GAL4', amber) + chrom(450, 110, 'UAS–RNAi', blue) + chrom(700, 110, 'GAL80ts', purple) + (frame > 0 ? arrow(280, 110, 367, 110, frame >= 2) + (frame === 1 ? `<path d="M320 88v44" stroke="${purple}" stroke-width="5"/>` : '') : '') + text(245, 202, frame >= 2 ? 'RNAi active' : 'RNAi suppressed', 'scene-white') + text(650, 202, 'Target protein', 'scene-white') + Array.from({ length: 10 }, (_, i) => protein(570 + i % 5 * 35, 235 + Math.floor(i / 5) * 30, green, frame === 3 && i > 1)).join('') + (frame === 3 ? arrow(350, 242, 490, 242) + text(420, 220, 'Turnover', 'scene-note') : '') + text(450, 315, frame >= 2 ? 'Activation and protein depletion happen on different timescales.' : 'Temperature changes activity; it does not remove the transgenes.', 'scene-note');
}
function screens(frame) {
  if (frame === 0) return label(450, 40, 'One independent mutagenised chromosome per line') + cell(450, 170, 88) + pair(450, 170, 'mutagenised', 'Bal', amber, purple) + text(450, 305, 'Maintain the chromosome while testing its effects.', 'scene-note');
  return label(450, 40, ['','Many independent opportunities', 'A candidate allele appears', 'More hits can complicate interpretation'][frame]) + Array.from({ length: 10 }, (_, i) => {
    const x = 155 + i % 5 * 150, y = 92 + Math.floor(i / 5) * 105, hit = frame >= 2 && i === 6;
    return `<g class="${frame === 1 ? 'scene-line' : ''}" style="--delay:${i * 35}ms"><path d="M${x - 25} ${y}v57q25 22 50 0v-57" fill="${hit ? '#493e29' : '#243541'}" stroke="${hit ? amber : blue}" stroke-width="2"/><path d="M${x - 27} ${y}h54" stroke="#a6b3bd" stroke-width="7"/>${text(x, y + 84, `Line ${i + 1}`, 'scene-note')}${hit ? text(x, y + 40, frame === 3 ? '★ + •' : '★', 'scene-hit') : ''}</g>`;
  }).join('') + text(450, 318, frame === 3 ? '★ target allele · • additional hit on the same chromosome · Two vials per line in the model' : frame === 2 ? 'Illustrative hit placement: most real screens need far more than ten lines.' : 'Different lines must represent independent mutagenised chromosomes.', 'scene-note');
}
const SCENES = { inheritance, xlinked, balancers, chance, recombination: (f) => exchange(f), gal4uas, complementation, threepoint: (f) => exchange(f, true), mosaics, target, screens };

// Point to the learner's actual controls without filling in an answer.
const ACTION_GUIDES = {
  gametes: [['Choose chromosomes', '.gamete-bench .parent'], ['Build a gamete', '[data-make]'], ['Compare your products', '.found']],
  predict: [['Inspect the parents', '.cross-line'], ['Set the shares', '.predict'], ['Check your prediction', '[data-check], .punnett']],
  count: [['Read the counts', '.counts'], ['Enter your estimate', '[data-answer]'], ['Check the calculation', '[data-check], .feedback']],
  chance: [['Choose a sample size', '[data-draw]'], ['Compare repeated samples', '.strip-row'], ['Look for the expected share', '.expect']],
  chisq: [['Inspect the observed counts', '.counts'], ['Test a hypothesis', '[data-h]'], ['Judge the fit', '[data-judge], .feedback, [data-h]']],
  grid: [['Read the chromosome evidence', '.dfmap, .grid'], ['Run a cross', '[data-cell], .grid'], ['Compare the outcomes', '.grid']],
  threepoint: [['Classify chromosomes', '.mapping-counts'], ['Infer the middle locus', '[data-middle]'], ['Count each interval', '.interval-rows, [data-check-order]']],
  clones: [['Predict the age effect', '[data-clone-prediction]'], ['Set the induction plan', '.research-controls'], ['Compare independent discs', '.clone-replicates, [data-clone-run]']],
  target: [['Set stage temperatures', '.temperature-schedule'], ['Run the time course', '[data-target-run]'], ['Compare assessed windows', '.target-plot, .goal-checks']],
  screen: [['Choose dose and line count', '.research-controls'], ['Evaluate your plan', '[data-screen-run]'], ['Compare coverage and workload', '.screen-comparison, .screen-stats, [data-screen-run]']],
};
export function actionGuideHTML(type) {
  const actions = ACTION_GUIDES[type];
  if (!actions) return '';
  return `<nav class="action-guide" aria-label="Visual activity guide">${actions.map(([title, selector], i) => `<button type="button" data-guide-target="${esc(selector)}"><span>${i + 1}</span>${esc(title)}<span aria-hidden="true">↗</span></button>`).join('')}</nav>`;
}
export function wireActionGuide(root) {
  root.querySelectorAll('[data-guide-target]').forEach((button) => button.addEventListener('click', () => {
    let target = root.querySelector(button.dataset.guideTarget);
    if (!target) return;
    if (target.disabled) target = target.parentElement;
    root.querySelectorAll('.guide-highlight').forEach((node) => node.classList.remove('guide-highlight'));
    target.classList.add('guide-highlight');
    if (!target.matches('button, input, select, textarea, [tabindex]')) target.tabIndex = -1;
    target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'center' });
    target.addEventListener('blur', () => target.classList.remove('guide-highlight'), { once: true });
  }));
}

export function guideScene(id, frame, animate = false) {
  const guide = VISUAL_GUIDES[id];
  if (!guide) return '';
  const i = Math.max(0, Math.min(guide.frames.length - 1, frame));
  return `<svg class="visual-scene ${animate ? 'is-moving' : ''}" viewBox="0 0 900 340" role="img" aria-label="${esc(guide.frames[i][0] + ': ' + guide.frames[i][1])}"><defs><marker id="guide-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#a4afb9"/></marker></defs>${SCENES[id](i)}</svg>`;
}

export function visualGuideHTML(id, expanded = true) {
  const guide = VISUAL_GUIDES[id];
  if (!guide) return '';
  return `<details class="visual-guide" ${expanded ? 'open' : ''}><summary><span class="visual-badge">Animated guide</span><strong>${esc(guide.title)}</strong></summary><div class="guide-content"><p class="guide-example">Separate teaching example · labels and chromosome positions are schematic</p><div data-guide-scene></div><ol class="guide-frames" aria-label="Animation stages">${guide.frames.map(([title], i) => `<li><button type="button" data-visual-frame="${i}"><span>${i + 1}</span>${esc(title)}</button></li>`).join('')}</ol><div class="guide-controls"><button type="button" data-visual-back aria-label="Previous animation stage">←</button><button type="button" class="primary" data-visual-play>Play animation</button><button type="button" data-visual-next aria-label="Next animation stage">→</button><button type="button" data-visual-replay>Replay</button><label>Speed <select data-visual-speed><option value="3000">Slow</option><option value="1800" selected>Normal</option><option value="1000">Fast</option></select></label></div><p class="guide-caption" data-guide-caption aria-live="polite"></p></div></details>`;
}

export function wireVisualGuide(root, id, { frame = 0, initialSpeed = 1800, onFrame = () => {}, onSpeed = () => {} } = {}) {
  const el = root.querySelector('.visual-guide'), guide = VISUAL_GUIDES[id];
  if (!el || !guide) return () => {};
  let index = Number.isInteger(frame) ? Math.max(0, Math.min(guide.frames.length - 1, frame)) : 0;
  let timer = null, playing = false, speed = [1000, 1800, 3000].includes(initialSpeed) ? initialSpeed : 1800;
  el.querySelector('[data-visual-speed]').value = String(speed);
  const stop = () => { clearTimeout(timer); timer = null; playing = false; el.querySelector('[data-visual-play]').textContent = 'Play animation'; };
  const draw = (animate = false) => {
    el.querySelector('[data-guide-scene]').innerHTML = guideScene(id, index, animate);
    el.querySelector('[data-guide-caption]').textContent = guide.frames[index][1];
    el.querySelectorAll('[data-visual-frame]').forEach((b, i) => { b.setAttribute('aria-current', i === index ? 'step' : 'false'); });
    el.querySelector('[data-visual-back]').disabled = index === 0;
    el.querySelector('[data-visual-next]').disabled = index === guide.frames.length - 1;
  };
  const show = (i) => { index = i; draw(true); onFrame(index); };
  const tick = () => { timer = setTimeout(() => {
    if (!el.isConnected || !el.open || document.hidden) { stop(); return; }
    if (index < guide.frames.length - 1) { show(index + 1); tick(); } else stop();
  }, speed); };
  el.querySelectorAll('[data-visual-frame]').forEach((b) => b.addEventListener('click', () => { stop(); show(Number(b.dataset.visualFrame)); }));
  el.querySelector('[data-visual-back]').addEventListener('click', () => { stop(); show(Math.max(0, index - 1)); });
  el.querySelector('[data-visual-next]').addEventListener('click', () => { stop(); show(Math.min(guide.frames.length - 1, index + 1)); });
  const play = () => {
    if (index === guide.frames.length - 1) show(0);
    playing = true; el.querySelector('[data-visual-play]').textContent = 'Pause animation'; tick();
  };
  el.querySelector('[data-visual-play]').addEventListener('click', () => {
    if (playing) stop(); else play();
  });
  el.querySelector('[data-visual-replay]').addEventListener('click', () => { stop(); show(0); play(); });
  el.querySelector('[data-visual-speed]').addEventListener('change', (e) => { speed = Number(e.target.value); onSpeed(speed); if (playing) { clearTimeout(timer); tick(); } });
  el.addEventListener('toggle', () => { if (!el.open) stop(); });
  draw();
  return stop;
}
