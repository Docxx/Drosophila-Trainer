// Plays one interactive lesson from lessons.js inside a container element.
// Each step must be worked through (answered, built or predicted) before Next
// unlocks; Back is always available, and every lesson can be left at any time.

import { parseGenotype, CHROMS } from './genetics/genetics.js';
import { genotypeHTML, gameteHTML, esc } from './chromosomes.js';
import {
  LESSON_CONTENT, classesFor, gametesFor, gameteKey, canCrossOver, crossoverBlock, crossoverKey,
  punnett, FRACTIONS, fractionLabel, classMatches, recommendStart,
  sampleCounts, rng, chiSquare, complementationCross, deficiencyMap,
} from './lessons.js';
import { progress, LESSONS } from './course.js';

const near = (a, b) => Math.abs(a - b) < 1e-6;
const STATUS = {
  choice: 'choose an answer', pick: 'pick a class', gametes: 'find every gamete', predict: 'check your prediction',
  multi: 'select and check', count: 'work it out from the counts', chance: 'count more vials', chisq: 'judge each hypothesis', grid: 'run every cross',
};
const paras = (body = []) => body.map((p) => `<p>${esc(p)}</p>`).join('');

export function mountLesson(root, id, { onExit, onAction }) {
  const lesson = LESSON_CONTENT[id];
  let index = 0;
  const state = lesson.steps.map(() => ({ done: false }));
  const diagnosticAnswers = [];

  const mode = () => progress.notation;
  const fly = (text, opts = {}) => genotypeHTML(parseGenotype(text), { mode: mode(), ...opts });

  function crossHTML(step) {
    const chroms = step.chroms || ['X', '2', '3'];
    return `<div class="cross-line">${fly(step.mother, { chroms, caption: 'Mother ♀' })}<span class="times" aria-hidden="true">×</span>${fly(step.father, { chroms, caption: 'Father ♂' })}</div>`;
  }

  // ---- step renderers: each returns HTML and an optional wire(el) ------------------

  const RENDER = {
    text(step) {
      const figs = (step.diagrams || []).map((d) => fly(d.g, { chroms: d.chroms, caption: d.caption })).join('');
      return { html: `${paras(step.body)}${figs ? `<div class="figures">${figs}</div>` : ''}`, ready: true };
    },

    choice(step, s) {
      const html = `<p class="question">${esc(step.question)}</p><div class="options">${step.options.map((o, i) =>
        `<button type="button" class="option ${s.picked === i ? (o.correct ? 'right' : 'wrong') : ''}" data-option="${i}">${esc(o.text)}</button>`).join('')}</div>
        ${s.picked !== undefined ? `<p class="feedback ${step.options[s.picked].correct ? 'right' : 'wrong'}" role="status">${esc(step.options[s.picked].why)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-option]').forEach((b) => b.addEventListener('click', () => {
          const i = Number(b.dataset.option);
          if (lesson.diagnostic && s.picked !== undefined) return; // first answer counts
          s.picked = i;
          if (lesson.diagnostic) { diagnosticAnswers[index] = !!step.options[i].correct; s.done = true; }
          else if (step.options[i].correct) s.done = true;
          render();
        }));
      } };
    },

    gametes(step, s) {
      const chroms = step.chroms;
      const all = gametesFor(step.parent, chroms);
      s.found ||= [];
      s.sel ||= {};
      s.crossover ||= false;
      const g = parseGenotype(step.parent);
      const complete = all.every((x) => s.found.includes(gameteKey(x.gamete, chroms)));
      if (complete) s.done = true;
      const ready = chroms.every((c) => s.sel[c] !== undefined);
      const crossChrom = chroms.find((c) => g[c][0] !== g[c][1]) || chroms[0];
      const block = step.crossover ? crossoverBlock(step.parent, crossChrom) : '';
      const foundHTML = s.found.map((k) => {
        const gamete = Object.fromEntries(chroms.map((c, i) => [c, k.split('|')[i]]));
        const p = all.find((x) => gameteKey(x.gamete, chroms) === k)?.p;
        return `<li>${gameteHTML(gamete, { chroms, mode: mode() })}${s.done ? `<span class="share">${fractionLabel(p)}</span>` : ''}</li>`;
      }).join('');
      const html = `<p>${esc(step.intro)}</p>
        <div class="gamete-bench">
          <div class="parent">${genotypeHTML(g, { chroms, mode: mode() === 'notation' ? 'both' : mode(), interactive: true, selected: s.sel, caption: 'Parent: click one chromosome from each pair' })}
            ${step.crossover ? `<label class="check-label"><input type="checkbox" data-crossover ${s.crossover ? 'checked' : ''}/> Crossover between the chromosome ${crossChrom} pair</label>` : ''}
            ${s.crossover && block ? `<p class="feedback wrong" role="status">${esc(block)}</p>` : ''}
            <div class="tool-row"><button type="button" class="primary" data-make ${ready ? '' : 'disabled'}>Make gamete</button>${complete ? '' : '<button type="button" data-all-found>I have found them all</button>'}</div>
            ${s.note ? `<p class="feedback ${s.noteKind || ''}" role="status">${esc(s.note)}</p>` : ''}
          </div>
          <div class="found"><h4>${s.found.length ? `Gametes found: ${s.found.length}` : 'No gametes yet'}</h4><ul>${foundHTML}</ul></div>
        </div>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('.hom[data-chrom]').forEach((b) => b.addEventListener('click', () => {
          s.sel[b.dataset.chrom] = Number(b.dataset.index); s.note = ''; render();
        }));
        el.querySelector('[data-crossover]')?.addEventListener('change', (e) => { s.crossover = e.target.checked; s.note = ''; render(); });
        el.querySelector('[data-make]')?.addEventListener('click', () => {
          const gamete = {};
          for (const c of chroms) {
            gamete[c] = g[c][s.sel[c]];
            if (s.crossover && c === crossChrom && canCrossOver(step.parent, c)) gamete[c] = crossoverKey(step.parent, c, s.sel[c]);
          }
          const k = gameteKey(gamete, chroms);
          if (s.found.includes(k)) { s.note = 'You already have that one. Try a different combination.'; s.noteKind = ''; }
          else {
            s.found.push(k);
            s.note = s.crossover && gamete[crossChrom] !== g[crossChrom][s.sel[crossChrom]]
              ? `A recombinant: the crossover joined the two chromosomes into ${CHROMS[crossChrom][gamete[crossChrom]].label === '+' ? 'one carrying neither insertion' : `one carrying ${CHROMS[crossChrom][gamete[crossChrom]].label}`}.`
              : '';
            s.noteKind = 'right';
          }
          s.sel = {}; render();
        });
        el.querySelector('[data-all-found]')?.addEventListener('click', () => {
          const missing = all.length - s.found.length;
          s.note = missing === 1 ? 'Not quite: there is one more kind to find.' : `Not quite: there are ${missing} more kinds to find.`;
          if (step.crossover && !s.crossover && all.length > 2) s.note += ' Have you tried the crossover?';
          s.noteKind = 'wrong'; render();
        });
      } };
    },

    predict(step, s) {
      const { rows, dead } = classesFor(step.mother, step.father, { traits: step.traits, bySex: step.bySex });
      const options = [...rows.map((r) => ({ label: r.label, p: r.p })),
        ...(step.decoys || []).filter((d) => !rows.some((r) => r.label === d)).map((label) => ({ label, p: 0 }))]
        .sort((a, b) => a.label.localeCompare(b.label));
      s.guess ||= {};
      const sum = options.reduce((t, o) => t + (FRACTIONS.find((f) => f.label === s.guess[o.label])?.value || 0), 0);
      const marks = s.checked ? options.map((o) => near(FRACTIONS.find((f) => f.label === s.guess[o.label])?.value ?? -1, o.p)) : [];
      const sq = punnett(step.mother, step.father, { chroms: step.chroms, traits: step.traits, bySex: step.bySex });
      const square = (reveal) => {
        const name = (gam) => step.chroms.map((c) => CHROMS[c][gam[c]].label).join('; ');
        return `<table class="punnett"><thead><tr><th>Eggs ↓ · Sperm →</th>${sq.sperm.map((x) => `<th>${esc(name(x))}</th>`).join('')}</tr></thead><tbody>${
          sq.eggs.map((e, i) => `<tr><th>${esc(name(e))}</th>${sq.cells[i].map((c) => `<td class="${reveal && !c.viable ? 'lethal' : ''}">${esc(c.label)}${reveal && !c.viable ? '<small>dies</small>' : ''}</td>`).join('')}</tr>`).join('')
        }</tbody></table>`;
      };
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <table class="predict"><thead><tr><th>Offspring class</th><th>Your prediction</th>${s.revealed ? '<th>Answer</th>' : ''}</tr></thead><tbody>${options.map((o, i) =>
          `<tr class="${s.checked ? (marks[i] ? 'right' : 'wrong') : ''}"><td>${esc(o.label)}</td><td><div class="fractions" role="group" aria-label="${esc(o.label)}">${FRACTIONS.map((f) =>
            `<button type="button" data-row="${esc(o.label)}" data-frac="${f.label}" class="${s.guess[o.label] === f.label ? 'on' : ''}" ${s.revealed ? 'disabled' : ''}>${f.label}</button>`).join('')}</div></td>${s.revealed ? `<td><strong>${fractionLabel(o.p)}</strong></td>` : ''}</tr>`).join('')}
        </tbody></table>
        ${!s.revealed ? `<p class="secondary">Shares of the adults that hatch. Yours add up to ${fractionLabel(sum)}${near(sum, 1) ? '.' : ' (they should add up to all).'}</p>` : ''}
        <div class="tool-row">${s.revealed ? '' : `<button type="button" class="primary" data-check ${options.every((o) => s.guess[o.label]) ? '' : 'disabled'}>Check</button>`}
          ${!s.revealed && !s.hint ? '<button type="button" data-hint>Draw the squares</button>' : ''}
          ${s.checked && !s.revealed ? '<button type="button" data-reveal>Show me</button>' : ''}</div>
        ${s.checked && !s.revealed ? `<p class="feedback wrong" role="status">${marks.filter((m) => !m).length} of your predictions ${marks.filter((m) => !m).length === 1 ? 'is' : 'are'} off. Change them and check again, or ask to be shown.</p>` : ''}
        ${s.hint || s.revealed ? `<div class="square-wrap"><h4>${s.revealed ? 'Every egg meets every sperm' : 'Every combination of egg and sperm is equally likely'}</h4>${square(s.revealed)}</div>` : ''}
        ${s.revealed ? `<p class="feedback ${s.firstTry ? 'right' : ''}" role="status">${s.firstTry ? 'Spot on. ' : ''}${esc(step.explain)}${dead > 0 ? ` (${fractionLabel(dead)} of the fertilised eggs die.)` : ''}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-frac]').forEach((b) => b.addEventListener('click', () => { s.guess[b.dataset.row] = b.dataset.frac; s.checked = false; render(); }));
        el.querySelector('[data-hint]')?.addEventListener('click', () => { s.hint = true; render(); });
        el.querySelector('[data-reveal]')?.addEventListener('click', () => { s.revealed = true; s.done = true; render(); });
        el.querySelector('[data-check]')?.addEventListener('click', () => {
          const ok = options.every((o) => near(FRACTIONS.find((f) => f.label === s.guess[o.label]).value, o.p));
          s.attempts = (s.attempts || 0) + 1;
          s.checked = true;
          if (ok) { s.revealed = true; s.done = true; s.firstTry = s.attempts === 1; }
          render();
        });
      } };
    },

    pick(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const html = `<p>${esc(step.intro)}</p>${crossHTML({ ...step, chroms: [step.target.chrom] })}
        <p class="secondary">The offspring, sorted by what you can see:</p>
        <div class="options">${rows.map((r, i) => `<button type="button" class="option ${s.picked === i ? (classMatches(r, step.target) ? 'right' : 'wrong') : ''}" data-class="${i}">${esc(r.label)} <span class="share">${fractionLabel(r.p)}</span></button>`).join('')}</div>
        ${s.picked !== undefined ? `<p class="feedback ${classMatches(rows[s.picked], step.target) ? 'right' : 'wrong'}" role="status">${esc(classMatches(rows[s.picked], step.target) ? step.right : step.wrong)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-class]').forEach((b) => b.addEventListener('click', () => {
          s.picked = Number(b.dataset.class);
          if (classMatches(rows[s.picked], step.target)) s.done = true;
          render();
        }));
      } };
    },

    multi(step, s) {
      s.sel ||= [];
      const right = (i) => !!step.options[i].correct;
      const html = `<p class="question">${esc(step.question)}</p><p class="secondary">Select all that apply, then check.</p>
        <div class="options">${step.options.map((o, i) => {
          const on = s.sel.includes(i);
          const mark = s.checked ? (on && right(i) ? 'right' : on ? 'wrong' : right(i) ? 'missed' : '') : '';
          return `<button type="button" class="option multi ${on ? 'on' : ''} ${mark}" data-multi="${i}" aria-pressed="${on}" ${s.done ? 'disabled' : ''}><span>${esc(o.text)}</span>${s.checked && (on || right(i)) ? `<small>${esc(o.why)}</small>` : ''}</button>`;
        }).join('')}</div>
        ${s.done ? '' : `<button type="button" class="primary" data-check ${s.sel.length ? '' : 'disabled'}>Check</button>`}
        ${s.checked && !s.done ? `<p class="feedback wrong" role="status">Not quite. Read the notes on the marked options, change your selection and check again.</p>` : ''}
        ${s.done && step.explain ? `<p class="feedback right" role="status">${esc(step.explain)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-multi]').forEach((b) => b.addEventListener('click', () => {
          const i = Number(b.dataset.multi);
          s.sel = s.sel.includes(i) ? s.sel.filter((x) => x !== i) : [...s.sel, i];
          s.checked = false; render();
        }));
        el.querySelector('[data-check]')?.addEventListener('click', () => {
          s.checked = true;
          if (step.options.every((o, i) => s.sel.includes(i) === right(i))) s.done = true;
          render();
        });
      } };
    },

    count(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const counts = sampleCounts(rows, step.n, rng(step.seed));
      const answer = step.answer(counts);
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <table class="counts"><thead><tr><th>Class</th><th>Flies counted</th></tr></thead><tbody>${counts.map((c) => `<tr><td>${esc(c.label)}</td><td>${c.n}</td></tr>`).join('')}
          <tr class="total"><td>Total</td><td>${step.n}</td></tr></tbody></table>
        <label class="answer">${esc(step.question)} <input type="number" step="any" data-answer value="${s.value ?? ''}" ${s.done ? 'disabled' : ''}/> ${esc(step.unit || '')}</label>
        ${s.done ? '' : `<div class="tool-row"><button type="button" class="primary" data-check>Check</button>${s.tries ? '<button type="button" data-reveal>Show me</button>' : ''}</div>`}
        ${s.tries && !s.done ? `<p class="feedback wrong" role="status">${esc(step.hint)}</p>` : ''}
        ${s.done ? `<p class="feedback ${s.revealed ? '' : 'right'}" role="status"><strong>${answer.toFixed(step.decimals ?? 1)} ${esc(step.unit || '')}.</strong> ${esc(step.explain)}</p>` : ''}`;
      return { html, wire(el) {
        const input = el.querySelector('[data-answer]');
        input?.addEventListener('input', () => { s.value = input.value; });
        el.querySelector('[data-check]')?.addEventListener('click', () => {
          const v = Number(s.value);
          if (s.value !== undefined && s.value !== '' && Math.abs(v - answer) <= step.tolerance) s.done = true;
          else s.tries = (s.tries || 0) + 1;
          render();
        });
        el.querySelector('[data-reveal]')?.addEventListener('click', () => { s.done = true; s.revealed = true; render(); });
      } };
    },

    chance(step, s) {
      const { rows } = classesFor(step.mother, step.father, { traits: step.traits });
      const expected = rows.find((r) => r.label === step.focus).p;
      s.samples ||= Object.fromEntries(step.sizes.map((n) => [n, []]));
      s.k ||= 0;
      if (step.sizes.every((n) => s.samples[n].length >= step.need)) s.done = true;
      const strip = (n) => {
        const xs = s.samples[n];
        const range = xs.length ? `${Math.round(Math.min(...xs) * 100)}–${Math.round(Math.max(...xs) * 100)}%` : '';
        return `<div class="strip-row"><button type="button" data-draw="${n}">Count a vial of ${n}</button>
          <div class="strip" aria-label="Shares of ${esc(step.focus)} in vials of ${n}"><span class="expect" style="left:${expected * 100}%"></span>${xs.map((x, i) => `<i style="left:${x * 100}%" class="${i === xs.length - 1 ? 'new' : ''}"></i>`).join('')}</div>
          <span class="range">${xs.length ? `${xs.length} vial${xs.length === 1 ? '' : 's'} · ${range}` : ''}</span></div>`;
      };
      const html = `<p>${esc(step.intro)}</p>${crossHTML(step)}
        <div class="strips"><div class="strip-axis"><span>0%</span><span>${esc(step.focus)}: expected ${fractionLabel(expected)}</span><span>100%</span></div>${step.sizes.map(strip).join('')}</div>
        <p class="secondary">Each dot is one vial: the share of ${esc(step.focus.toLowerCase())} among the flies counted. Count at least ${step.need} vials of each size.</p>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-draw]').forEach((b) => b.addEventListener('click', () => {
          const n = Number(b.dataset.draw);
          const c = sampleCounts(rows, n, rng((step.seed || 1) * 1000 + ++s.k));
          s.samples[n].push(c.find((r) => r.label === step.focus).n / n);
          render();
        }));
      } };
    },

    chisq(step, s) {
      s.judged ||= {};
      const obs = step.observed.map((o) => o.n);
      const h = s.h ?? null;
      const test = h === null ? null : chiSquare(obs, step.hypotheses[h].shares);
      if (step.hypotheses.every((_, i) => s.judged[i] === true)) s.done = true;
      const html = `<p>${esc(step.intro)}</p>
        <table class="counts"><thead><tr><th>Class</th><th>Observed (O)</th>${test ? '<th>Expected (E)</th><th>(O − E)² / E</th>' : ''}</tr></thead><tbody>${step.observed.map((o, i) =>
          `<tr><td>${esc(o.label)}</td><td>${o.n}</td>${test ? `<td>${test.rows[i].e.toFixed(1)}</td><td>${test.rows[i].part.toFixed(2)}</td>` : ''}</tr>`).join('')}
          ${test ? `<tr class="total"><td colspan="3">χ² (${test.df} degree${test.df === 1 ? '' : 's'} of freedom; 5% critical value ${test.critical})</td><td>${test.chi.toFixed(2)}</td></tr>` : ''}</tbody></table>
        <p>Test against:</p><div class="tool-row">${step.hypotheses.map((x, i) => `<button type="button" data-h="${i}" class="${h === i ? 'on' : ''} ${s.judged[i] === true ? 'done' : ''}">${esc(x.label)}${s.judged[i] === true ? ' ✓' : ''}</button>`).join('')}</div>
        ${test ? `<p class="secondary">p = ${test.p < 0.001 ? '< 0.001' : test.p.toFixed(3)}. What do you conclude about the ${esc(step.hypotheses[h].label)} hypothesis?</p>
          <div class="tool-row"><button type="button" data-judge="fits">Consistent: cannot reject it</button><button type="button" data-judge="reject">Reject it</button></div>
          ${s.note ? `<p class="feedback ${s.noteOk ? 'right' : 'wrong'}" role="status">${esc(s.note)}</p>` : ''}` : '<p class="secondary">Choose a hypothesis to test.</p>'}
        ${s.done ? `<p class="feedback right" role="status">${esc(step.explain)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-h]').forEach((b) => b.addEventListener('click', () => { s.h = Number(b.dataset.h); s.note = ''; render(); }));
        el.querySelectorAll('[data-judge]').forEach((b) => b.addEventListener('click', () => {
          const sayFits = b.dataset.judge === 'fits';
          const ok = sayFits === test.fits;
          s.judged[h] = ok || s.judged[h] === true;
          s.noteOk = ok;
          s.note = ok
            ? (test.fits ? `Right: χ² = ${test.chi.toFixed(2)} is below ${test.critical}, so the data are consistent with ${step.hypotheses[h].label}. That is not proof it is true.` : `Right: χ² = ${test.chi.toFixed(2)} is above ${test.critical}. A deviation this large would happen less than 5% of the time by chance.`)
            : (test.fits ? `χ² = ${test.chi.toFixed(2)} is below the critical value ${test.critical}: the deviation is the kind chance produces, so you cannot reject it.` : `χ² = ${test.chi.toFixed(2)} is above the critical value ${test.critical}: chance alone rarely gives a deviation this large.`);
          render();
        }));
      } };
    },

    grid(step, s) {
      s.results ||= {};
      const name = (k) => CHROMS['2'][k].label;
      const keyOf = (r, c) => `${r}|${c}`;
      if (step.rows.every((r) => step.cols.every((c) => s.results[keyOf(r, c)]))) s.done = true;
      let mapHTML = '';
      if (step.map) {
        const m = deficiencyMap(step.cols);
        const w = 100 / m.genes.length;
        mapHTML = `<div class="dfmap"><div class="genes">${m.genes.map((g) => `<span style="width:${w}%">gene ${g}</span>`).join('')}</div>
          ${m.dfs.map((d) => { const i0 = m.genes.indexOf(d.genes[0]); return `<div class="dfrow"><span class="dfbar" style="left:${i0 * w}%;width:${d.genes.length * w}%">${esc(d.label)}</span></div>`; }).join('')}
          <p class="secondary">Each bar is a deficiency: the stretch of chromosome 2 it deletes.</p></div>`;
      }
      const html = `<p>${esc(step.intro)}</p>${mapHTML}
        <table class="grid"><thead><tr><th>♀ (over CyO) ↓ · ♂ (over CyO) →</th>${step.cols.map((c) => `<th>${esc(name(c))}</th>`).join('')}</tr></thead><tbody>${step.rows.map((r, i) =>
          `<tr><th>${esc(name(r))}</th>${step.cols.map((c, j) => {
            const res = s.results[keyOf(r, c)];
            return `<td class="${res ? (res.complements ? 'comp' : 'fail') : ''}">${res
              ? `<strong>${res.complements ? 'Complements' : 'Fails'}</strong><small>${res.straight} of ${res.total} straight-winged</small>`
              : `<button type="button" data-cell="${i}:${j}">Cross</button>`}</td>`;
          }).join('')}</tr>`).join('')}</tbody></table>
        <p class="secondary">Each cross: females of the row stock × males of the column stock, 60 offspring scored. Straight wings can only be the two mutant chromosomes together.</p>
        ${s.done ? `<p class="feedback right" role="status">${esc(step.done)}</p>` : ''}`;
      return { html, wire(el) {
        el.querySelectorAll('[data-cell]').forEach((b) => b.addEventListener('click', () => {
          const [i, j] = b.dataset.cell.split(':').map(Number);
          s.results[keyOf(step.rows[i], step.cols[j])] = complementationCross(step.rows[i], step.cols[j], 60, 11 + i * 7 + j);
          render();
        }));
      } };
    },

    go(step) {
      return { html: `${paras(step.body)}<button type="button" class="primary big" data-go>${esc(step.action.label)}</button>`, ready: true,
        wire(el) { el.querySelector('[data-go]').addEventListener('click', () => { progress.complete(id); onAction(step.action); }); } };
    },
  };

  function finishHTML() {
    if (!lesson.diagnostic) return '';
    const right = diagnosticAnswers.filter(Boolean).length;
    const start = LESSONS.find((l) => l.id === recommendStart(diagnosticAnswers));
    return `<div class="result-card"><p><strong>${right} of ${lesson.steps.length}</strong> right first time.</p>
      <p>Suggested start: <strong>${esc(start.title)}</strong>. ${esc(start.summary)}</p>
      <button type="button" class="primary" data-start="${start.id}">Start ${esc(start.title)}</button></div>`;
  }

  function render() {
    const step = lesson.steps[index];
    const s = state[index];
    const out = RENDER[step.type](step, s);
    if (out.ready) s.done = true;
    const last = index === lesson.steps.length - 1;
    const heading = step.title || (step.type === 'choice' ? (lesson.diagnostic ? `Question ${index + 1}` : 'Check your thinking') : '');
    root.innerHTML = `<article class="lesson" data-step-type="${step.type}">
      <header class="lesson-head"><button type="button" class="link" data-exit>← Course</button>
        <div><span class="eyebrow">${esc(lesson.title)}</span><h2>${esc(heading)}</h2></div>
        <ol class="dots" aria-label="Progress">${lesson.steps.map((_, i) => `<li class="${i === index ? 'now' : state[i].done ? 'done' : ''}" aria-current="${i === index ? 'step' : 'false'}"></li>`).join('')}</ol></header>
      <div class="lesson-body">${out.html}${last && s.done ? finishHTML() : ''}</div>
      <footer class="lesson-foot"><button type="button" data-back ${index === 0 ? 'disabled' : ''}>Back</button>
        <span class="secondary">${index + 1} / ${lesson.steps.length}${!s.done ? ` · ${STATUS[step.type] || 'check your answer'}` : ''}</span>
        ${last ? (step.type === 'go' ? '<button type="button" data-finish>Back to course</button>' : `<button type="button" class="primary" data-finish ${s.done ? '' : 'disabled'}>Finish</button>`)
          : `<button type="button" class="primary" data-next ${s.done ? '' : 'disabled'}>Next</button>`}</footer></article>`;
    out.wire?.(root);
    root.querySelector('[data-exit]').addEventListener('click', onExit);
    root.querySelector('[data-back]').addEventListener('click', () => { index--; render(); });
    root.querySelector('[data-next]')?.addEventListener('click', () => { index++; render(); root.scrollTop = 0; });
    root.querySelector('[data-finish]')?.addEventListener('click', () => { if (s.done) progress.complete(id); onExit(); });
    root.querySelector('[data-start]')?.addEventListener('click', (e) => { progress.complete(id); onAction({ kind: 'lesson', id: e.currentTarget.dataset.start }); });
  }

  render();
  return { rerender: render, get step() { return index; }, goTo(i) { index = i; render(); } };
}
