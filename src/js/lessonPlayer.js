// Plays one interactive lesson from lessons.js inside a container element.
// Each step must be worked through (answered, built or predicted) before Next
// unlocks; Back is always available, and every lesson can be left at any time.

import { parseGenotype, CHROMS } from './genetics/genetics.js';
import { genotypeHTML, gameteHTML, esc } from './chromosomes.js';
import {
  LESSON_CONTENT, classesFor, gametesFor, gameteKey, canCrossOver, crossoverBlock, crossoverKey,
  punnett, FRACTIONS, fractionLabel, classMatches, recommendStart,
} from './lessons.js';
import { progress, LESSONS } from './course.js';

const near = (a, b) => Math.abs(a - b) < 1e-6;
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
        <span class="secondary">${index + 1} / ${lesson.steps.length}${!s.done ? ` · ${step.type === 'choice' ? 'choose an answer' : step.type === 'pick' ? 'pick a class' : step.type === 'gametes' ? 'find every gamete' : 'check your prediction'}` : ''}</span>
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
