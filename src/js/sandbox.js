// Genetics bench: build any two flies the engine supports and see what they
// make, count vials with a χ² test, or drill generated practice problems.

import { CHROMS, parseGenotype } from './genetics/genetics.js';
import { genotypeHTML, esc } from './chromosomes.js';
import { progress } from './course.js';
import { homologOptions, PRESETS, benchCross, countVial, practiceProblem, ratioText } from './sandboxLogic.js';

const ORDER = ['X', '2', '3'];
const split = (text) => Object.fromEntries(text.split(';').map((p, i) => [ORDER[i], p.trim().split('/')]));
const join = (g) => ORDER.map((c) => g[c].join('/')).join('; ');

export function mountSandbox(root, { onExit, initial } = {}) {
  let tab = 'bench';
  const fly = { F: split(initial?.mother || 'w/w; CyO/+; +/+'), M: split(initial?.father || 'w/Y; CyO/+; +/+') };
  let bySex = false;
  let vial = null, vialN = 100, vialSeed = 1;
  let problem = null, chosen = null, level = 1, seed = Math.floor(Math.random() * 1e6);
  let streak = 0, solved = 0, tried = 0;

  const mode = () => progress.notation;

  function parentHTML(sex) {
    const g = fly[sex];
    let ok = true;
    try { parseGenotype(join(g)); } catch { ok = false; }
    const selects = ORDER.map((c) => `<div class="slot"><span class="chrom-name">${c}</span>${[0, 1].map((slot) => {
      const opts = homologOptions(c, { male: sex === 'M', slot });
      return `<select data-sex="${sex}" data-chrom="${c}" data-slot="${slot}" aria-label="${sex === 'F' ? 'Mother' : 'Father'} chromosome ${c}, copy ${slot + 1}" ${opts.length === 1 ? 'disabled' : ''}>${opts.map((k) =>
        `<option value="${esc(k)}" ${g[c][slot] === k ? 'selected' : ''}>${esc(CHROMS[c][k].label)}</option>`).join('')}</select>`;
    }).join('')}</div>`).join('');
    return `<section class="parent-card"><div class="vial-head"><h3>${sex === 'F' ? 'Mother ♀ (virgin)' : 'Father ♂'}</h3>
        <select data-preset="${sex}" aria-label="Load a stock"><option value="">Load a stock…</option>${PRESETS.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="slots">${selects}</div>${ok ? genotypeHTML(parseGenotype(join(g)), { mode: mode() }) : ''}</section>`;
  }

  function benchHTML() {
    const res = benchCross(join(fly.F), join(fly.M), { bySex });
    let out = `<div class="sandbox-grid">${parentHTML('F')}<span class="times">×</span>${parentHTML('M')}</div>`;
    if (!res.motherOk || !res.fatherOk) {
      return `${out}<p class="feedback wrong" role="status">${res.motherOk ? 'The father' : 'The mother'} could not survive: two copies of the same balancer, or two lethals in the same gene. Change a chromosome.</p>`;
    }
    out += `<section class="bench-panel static"><div class="vial-head"><h3>Offspring</h3><label class="check-label"><input type="checkbox" data-bysex ${bySex ? 'checked' : ''}/> Split by sex</label></div>
      <p class="secondary">${res.eggs} kind${res.eggs === 1 ? '' : 's'} of egg × ${res.sperm} kind${res.sperm === 1 ? '' : 's'} of sperm.${res.dead > 0 ? ` ${ratioText(res.dead)} of fertilised eggs die (lethal combinations).` : ''} Shares are of the adults that hatch.</p>
      <table class="classes"><thead><tr><th>Class (what you see)</th><th>Expected share</th>${vial ? '<th>Counted</th>' : ''}</tr></thead><tbody>${res.rows.map((r, i) =>
        `<tr><td>${esc(r.label)}</td><td>${ratioText(r.p)}</td>${vial ? `<td>${vial.counts[i]?.n ?? ''}</td>` : ''}</tr>`).join('')}</tbody></table>
      <div class="tool-row count-row"><label>Count a vial of <input type="number" min="5" max="5000" step="5" value="${vialN}" data-n /> flies</label><button type="button" class="primary" data-count>Count</button>${vial ? '<button type="button" data-clear>Clear counts</button>' : ''}</div>
      ${vial?.test ? `<p class="feedback ${vial.test.fits ? 'right' : 'wrong'}" role="status">χ² = ${vial.test.chi.toFixed(2)} with ${vial.test.df} degree${vial.test.df === 1 ? '' : 's'} of freedom (5% critical value ${vial.test.critical}), p ${vial.test.p < 0.001 ? '< 0.001' : `= ${vial.test.p.toFixed(3)}`}. ${vial.test.fits ? 'Consistent with the expected ratio.' : 'A deviation this large is rare by chance alone: count again and see whether it repeats.'}${vial.lowExpected ? ' Some expected counts are below 5, so treat the test with caution: count more flies.' : ''}</p>` : ''}
      </section>`;
    return out;
  }

  function practiceHTML() {
    problem ||= practiceProblem(seed, level);
    const p = problem;
    const right = chosen !== null && Math.abs(p.options[chosen].p - p.answer) < 1e-9;
    return `<div class="practice">
      <div class="vial-head"><div class="tool-row" role="group" aria-label="Difficulty"><button type="button" data-level="1" class="${level === 1 ? 'on' : ''}">One chromosome</button><button type="button" data-level="2" class="${level === 2 ? 'on' : ''}">Two chromosomes</button></div>
        <span class="badge big">Streak ${streak} · ${solved}/${tried} right · best ${progress.get().bestStreak || 0}</span></div>
      <div class="cross-line">${genotypeHTML(parseGenotype(p.mother), { mode: mode(), caption: 'Mother ♀' })}<span class="times">×</span>${genotypeHTML(parseGenotype(p.father), { mode: mode(), caption: 'Father ♂' })}</div>
      <p class="question">What share of the adult offspring are <strong>${esc(p.label.charAt(0).toLowerCase() + p.label.slice(1))}</strong>?</p>
      <div class="options four">${p.options.map((o, i) => `<button type="button" class="option ${chosen === i ? (right ? 'right' : 'wrong') : chosen !== null && Math.abs(o.p - p.answer) < 1e-9 ? 'right' : ''}" data-answer="${i}" ${chosen !== null ? 'disabled' : ''}>${o.label}</button>`).join('')}</div>
      ${chosen !== null ? `<div class="feedback ${right ? 'right' : 'wrong'}" role="status">${right ? 'Right.' : `Not quite: the answer is ${ratioText(p.answer)}.`} All the classes from this cross:
        <table class="classes"><tbody>${p.rows.map((r) => `<tr class="${r.label === p.label ? 'hl' : ''}"><td>${esc(r.label)}</td><td>${ratioText(r.p)}</td></tr>`).join('')}</tbody></table>
        <p class="secondary">Work chromosome by chromosome, multiply the shares, and remember that lethal classes are removed before you take shares of the survivors.</p></div>
        <div class="tool-row"><button type="button" class="primary" data-next-problem>Next problem</button><button type="button" data-explore>Explore this cross on the bench</button></div>` : ''}
    </div>`;
  }

  function render() {
    root.innerHTML = `<article class="planner sandbox">
      <header class="lesson-head"><button type="button" class="link" data-exit>← Course</button><div><span class="eyebrow">Open practice</span><h2>Genetics bench</h2></div>
        <div class="tool-row" role="tablist"><button type="button" role="tab" data-tab="bench" class="${tab === 'bench' ? 'on' : ''}" aria-selected="${tab === 'bench'}">Bench</button><button type="button" role="tab" data-tab="practice" class="${tab === 'practice' ? 'on' : ''}" aria-selected="${tab === 'practice'}">Practice problems</button></div></header>
      ${tab === 'bench' ? `<p class="secondary">Build any two flies from the chromosomes in this course. Females can recombine GAL4 and UAS-RNAi on chromosome 3; males never recombine. Results update as you change a chromosome.</p>${benchHTML()}` : practiceHTML()}
    </article>`;
    wire();
  }

  function wire() {
    root.querySelector('[data-exit]').addEventListener('click', onExit);
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
    root.querySelectorAll('select[data-chrom]').forEach((s) => s.addEventListener('change', () => {
      fly[s.dataset.sex][s.dataset.chrom][Number(s.dataset.slot)] = s.value; vial = null; render();
    }));
    root.querySelectorAll('[data-preset]').forEach((s) => s.addEventListener('change', () => {
      if (s.value === '') return;
      const p = PRESETS[Number(s.value)];
      fly[s.dataset.preset] = split(s.dataset.preset === 'F' ? p.F : p.M); vial = null; render();
    }));
    root.querySelector('[data-bysex]')?.addEventListener('change', (e) => { bySex = e.target.checked; vial = null; render(); });
    root.querySelector('[data-n]')?.addEventListener('input', (e) => { vialN = Math.max(5, Math.min(5000, Number(e.target.value) || 100)); });
    root.querySelector('[data-count]')?.addEventListener('click', () => {
      const res = benchCross(join(fly.F), join(fly.M), { bySex });
      vial = countVial(res.rows, vialN, vialSeed++); render();
    });
    root.querySelector('[data-clear]')?.addEventListener('click', () => { vial = null; render(); });
    root.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => { level = Number(b.dataset.level); problem = null; chosen = null; render(); }));
    root.querySelectorAll('[data-answer]').forEach((b) => b.addEventListener('click', () => {
      chosen = Number(b.dataset.answer); tried++;
      if (Math.abs(problem.options[chosen].p - problem.answer) < 1e-9) { solved++; streak++; progress.recordStreak(streak); } else streak = 0;
      render();
    }));
    root.querySelector('[data-next-problem]')?.addEventListener('click', () => { seed++; problem = null; chosen = null; render(); });
    root.querySelector('[data-explore]')?.addEventListener('click', () => {
      fly.F = split(problem.mother); fly.M = split(problem.father); bySex = problem.bySex; vial = null; tab = 'bench'; render();
    });
  }

  render();
  return { rerender: render, get problem() { return problem; } };
}
