// Chromosome diagrams: each pair drawn as two bars, with conventional notation
// beside or instead. Balancers carry a zig-zag (their inversions) and a tag for
// their dominant marker; the Y is a short hooked bar.

import { CHROMS, MARKERS, formatGenotype } from './genetics/genetics.js';

export const ORDER = ['X', '2', '3'];

// One colour per kind of chromosome, so the same thing always looks the same.
const COLOURS = {
  '+': '#5d6870', w: '#e4e0d2', yw: '#d9cf78', FM7a: '#8a6fd1', Y: '#4f84b8',
  CyO: '#d46a6a', 'UAS-GFP': '#5fbf7f', GAL4: '#e8b064', Sco: '#5aa6b8', mut: '#b0453f', mut2: '#c0603a', mut3: '#a04f74',
  Df1: '#8d8f4a', Df2: '#6f9a6a', Df3: '#4f8a8f',
  TM3: '#c27bb6', TM3Ser: '#b27bc6', TM6B: '#6f8fd1', 'UAS-RNAi': '#8fc95f', 'GAL4,UAS-RNAi': '#c9a04f',
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Plain-language description of one chromosome, for tooltips and screen readers. */
export function describeHomolog(chrom, key) {
  const h = CHROMS[chrom][key];
  if (h.isY) return 'Y chromosome (makes the fly male; carries no white gene)';
  if (key === '+') return `normal (wild-type) chromosome ${chrom}`;
  const bits = [h.label];
  if (h.balancer) bits.push('a balancer');
  for (const m of h.markers) if (MARKERS[m]) bits.push(`${MARKERS[m].name}: ${MARKERS[m].desc.toLowerCase().replace(/\.$/, '')}`);
  if (h.deficiency) bits.push(`deficiency: deletes genes ${h.lethal.join(', ')}`);
  else if (h.recLethal) bits.push('recessive lethal, no visible marker');
  return bits.join(' · ');
}

function homolog(chrom, key, { index, interactive, selected, dim }) {
  const h = CHROMS[chrom][key];
  const cls = ['hom', h.balancer ? 'balancer' : '', h.isY ? 'ychrom' : '', key === '+' ? 'wild' : '', h.parts ? 'recomb' : '', h.deficiency ? 'deficiency' : '', selected ? 'on' : '', dim ? 'dim' : ''].filter(Boolean).join(' ');
  // A recombinant is drawn in two halves, one from each parental chromosome.
  const colour = h.parts ? `--c:${COLOURS[h.parts[0]]};--c2:${COLOURS[h.parts[1]]}` : `--c:${COLOURS[key] || '#888'}`;
  const tags = h.markers.filter((m) => m !== 'mw' && MARKERS[m] && !MARKERS[m].recessive).map((m) => `<i class="tag">${esc(m)}</i>`).join('');
  const label = `${esc(h.label)}${tags}`;
  const attrs = `class="${cls}" style="${colour}" title="${esc(describeHomolog(chrom, key))}" data-chrom="${chrom}" data-index="${index}" data-key="${esc(key)}"`;
  return interactive
    ? `<button type="button" ${attrs} aria-pressed="${selected ? 'true' : 'false'}">${label}</button>`
    : `<span ${attrs}>${label}</span>`;
}

/**
 * HTML for a genotype. `chroms` limits which pairs are drawn. With `interactive`,
 * each homolog is a button (used to build gametes); `selected` maps chrom -> index.
 */
export function genotypeHTML(g, { chroms = ORDER, mode = 'diagram', interactive = false, selected = {}, caption = '' } = {}) {
  const parts = [];
  if (mode !== 'notation') {
    const rows = chroms.map((c) => {
      const pair = g[c].map((key, index) => homolog(c, key, { index, interactive, selected: selected[c] === index, dim: interactive && selected[c] !== undefined && selected[c] !== index }));
      return `<div class="chrom-row"><span class="chrom-name">${c === 'X' ? 'X' : c}</span><div class="chrom-pair">${pair.join('')}</div></div>`;
    });
    parts.push(`<div class="chroms">${rows.join('')}</div>`);
  }
  if (mode !== 'diagram') parts.push(`<code class="notation">${esc(formatGenotype(g))}</code>`);
  return `<figure class="genotype">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}${parts.join('')}</figure>`;
}

/** HTML for a gamete: one chromosome from each pair. */
export function gameteHTML(gamete, { chroms = ORDER, mode = 'diagram' } = {}) {
  if (mode === 'notation') return `<code class="notation">${esc(chroms.map((c) => CHROMS[c][gamete[c]].label).join('; '))}</code>`;
  return `<div class="gamete">${chroms.map((c) => homolog(c, gamete[c], { index: 0 })).join('')}</div>`;
}

export { esc };
