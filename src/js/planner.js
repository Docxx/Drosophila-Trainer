// Cross planner UI: pick a puzzle, cross vials, keep classes by their visible
// markers, and declare a vial when you believe it is the target stock.

import { PUZZLES } from './genetics/puzzles.js';
import { ratioText } from './genetics/crosses.js';
import { genotypeHTML, esc } from './chromosomes.js';
import { PlannerSession, targetChroms } from './plannerSession.js';
import { progress } from './course.js';

export function mountPlanner(root, { onExit }) {
  let session = null;
  let pick = { F: null, M: null };
  let latest = null;
  let notice = null;
  let hints = [];

  function list() {
    const best = progress.get().puzzles;
    root.innerHTML = `<article class="planner-list">
      <header class="lesson-head"><button type="button" class="link" data-exit>← Course</button><div><span class="eyebrow">Building stocks</span><h2>Cross planner</h2></div></header>
      <p>Each puzzle gives you a few stocks and a target. Cross vials, keep the offspring classes you want by their markers, and declare the vial you believe is the target. You see what a geneticist sees: markers and eye colour, never the genotype. <strong>Par</strong> is the fewest generations that can do it.</p>
      <div class="cards">${PUZZLES.map((p, i) => `<button type="button" class="card ${best[p.id] ? 'done' : ''}" data-puzzle="${i}">
        <span class="eyebrow">${i + 1} · ${esc(p.skill)}</span><strong>${esc(p.title)}</strong><span>${esc(p.summary)}</span>
        <span class="meta">Par ${p.par}${best[p.id] ? ` · solved in ${best[p.id]}` : ''}</span></button>`).join('')}</div></article>`;
    root.querySelector('[data-exit]').addEventListener('click', onExit);
    root.querySelectorAll('[data-puzzle]').forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.puzzle))));
  }

  function open(i) {
    session = new PlannerSession(PUZZLES[i]);
    pick = { F: null, M: null }; latest = null; notice = null; hints = [];
    render();
  }

  const mode = () => progress.notation;

  function vialHTML(v) {
    const role = pick.F === v.id ? 'female' : pick.M === v.id ? 'male' : '';
    const body = v.stock
      ? genotypeHTML(stockGenotype(v), { mode: mode(), chroms: ['X', '2', '3'] })
      : `<p class="pheno">${esc(v.note)}</p>`;
    return `<li class="vial ${v.stock ? 'stock' : 'kept'} ${role}">
      <div class="vial-head"><strong>${esc(v.name)}</strong><span class="badge">${v.stock ? 'Stock' : `Gen ${v.generation}`}</span></div>
      ${v.stock ? `<p class="secondary">${esc(v.note)}</p>` : ''}${body}
      <div class="tool-row"><button type="button" data-f="${v.id}" ${v.F ? '' : 'disabled'} class="${pick.F === v.id ? 'on' : ''}">Virgins ♀</button><button type="button" data-m="${v.id}" ${v.M ? '' : 'disabled'} class="${pick.M === v.id ? 'on' : ''}">Males ♂</button>
      ${v.stock ? '' : `<button type="button" data-declare="${v.id}">Declare target</button><button type="button" class="link" data-discard="${v.id}" aria-label="Discard ${esc(v.name)}">Discard</button>`}</div></li>`;
  }

  function render() {
    const s = session;
    const p = s.puzzle;
    const t = targetChroms(s.target);
    const f = pick.F && s.vial(pick.F), m = pick.M && s.vial(pick.M);
    const gens = Math.max(0, ...s.vials.map((v) => v.generation));
    root.innerHTML = `<article class="planner">
      <header class="lesson-head"><button type="button" class="link" data-list>← Puzzles</button><div><span class="eyebrow">${esc(p.skill)} · par ${p.par}</span><h2>${esc(p.title)}</h2></div><span class="badge big">Generations used: ${gens}</span></header>
      <div class="planner-grid">
        <section class="brief"><p>${esc(p.story)}</p>${genotypeHTML(t, { mode: mode() === 'diagram' ? 'both' : mode(), caption: 'Target (either sex)' })}
          <div class="tool-row"><button type="button" data-hint ${s.hintsUsed >= p.hints.length ? 'disabled' : ''}>${s.hintsUsed ? 'Another hint' : 'Hint'}</button><button type="button" data-restart>Start again</button></div>
          ${hints.map((h, i) => `<p class="hint"><strong>Hint ${i + 1}.</strong> ${esc(h)}</p>`).join('')}</section>
        <section class="shelf"><h3>Shelf</h3><p class="secondary">Choose virgin females from one vial and males from another.</p><ul class="vials">${s.vials.map(vialHTML).join('')}</ul></section>
        <section class="bench-panel"><h3>Cross</h3>
          <div class="cross-pick"><div class="${f ? 'set' : ''}"><span class="eyebrow">Virgin females</span>${f ? esc(f.name) : 'Choose a vial'}</div><span class="times">×</span><div class="${m ? 'set' : ''}"><span class="eyebrow">Males</span>${m ? esc(m.name) : 'Choose a vial'}</div></div>
          <button type="button" class="primary" data-cross ${f && m ? '' : 'disabled'}>Cross them</button>
          ${notice ? `<div class="feedback ${notice.kind}" role="status">${notice.html}</div>` : ''}
          ${latest ? resultHTML(latest) : '<p class="secondary">The offspring appear here, sorted into classes by their markers and eye colour.</p>'}
          ${s.crosses.length > 1 ? `<details class="support"><summary>Earlier crosses (${s.crosses.length - 1})</summary><ul class="history">${s.crosses.filter((c) => c !== latest).map((c) => `<li><button type="button" class="link" data-show="${c.id}">Gen ${c.generation}: ${esc(s.vial(c.mother)?.name || 'discarded vial')} ♀ × ${esc(s.vial(c.father)?.name || 'discarded vial')} ♂</button></li>`).join('')}</ul></details>` : ''}
        </section>
      </div></article>`;
    wire();
  }

  function resultHTML(c) {
    return `<div class="result"><h4>Generation ${c.generation} offspring</h4>
      <table class="classes"><thead><tr><th>Class (what you see)</th><th>Share</th><th>Sexes</th><th></th></tr></thead><tbody>${c.classes.map((row, i) =>
        `<tr><td>${esc(row.label)}</td><td>${ratioText(row.p)}</td><td>${row.sexes.map((x) => (x === 'F' ? '♀' : '♂')).join(' ')}</td><td><button type="button" data-keep="${c.id}:${i}">Keep</button></td></tr>`).join('')}</tbody></table>
      ${c.dead > 0 ? `<p class="secondary">${ratioText(c.dead)} of the fertilised eggs died (lethal combinations).</p>` : ''}</div>`;
  }

  function wire() {
    const s = session;
    root.querySelector('[data-list]').addEventListener('click', list);
    root.querySelector('[data-restart]').addEventListener('click', () => open(PUZZLES.indexOf(s.puzzle)));
    root.querySelector('[data-hint]').addEventListener('click', () => { const h = s.hint(); if (h) hints.push(h); render(); });
    root.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { pick.F = pick.F === b.dataset.f ? null : b.dataset.f; render(); }));
    root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { pick.M = pick.M === b.dataset.m ? null : b.dataset.m; render(); }));
    root.querySelector('[data-cross]').addEventListener('click', () => { latest = s.cross(pick.F, pick.M); notice = null; render(); });
    root.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => { latest = s.crosses.find((c) => c.id === b.dataset.show); render(); }));
    root.querySelectorAll('[data-keep]').forEach((b) => b.addEventListener('click', () => {
      const [cid, i] = b.dataset.keep.split(':');
      const v = s.keep(cid, Number(i));
      notice = { kind: '', html: `Kept as a new vial: <strong>${esc(v.name)}</strong> (generation ${v.generation}). It is on the shelf.` };
      render();
    }));
    root.querySelectorAll('[data-discard]').forEach((b) => b.addEventListener('click', () => {
      s.discard(b.dataset.discard);
      if (pick.F === b.dataset.discard) pick.F = null;
      if (pick.M === b.dataset.discard) pick.M = null;
      render();
    }));
    root.querySelectorAll('[data-declare]').forEach((b) => b.addEventListener('click', () => {
      const r = s.declare(b.dataset.declare);
      if (r.ok) {
        progress.solvePuzzle(s.puzzle.id, r.generations);
        if (PUZZLES.every((p) => progress.get().puzzles[p.id])) progress.complete('planner');
        const verdict = r.generations <= r.par ? 'Par or better.' : `Par is ${r.par}: see if you can find a shorter route.`;
        notice = { kind: 'right', html: `<strong>Target built in ${r.generations} generation${r.generations === 1 ? '' : 's'}.</strong> ${verdict}${r.hints ? ` You used ${r.hints} hint${r.hints === 1 ? '' : 's'}.` : ''} <button type="button" class="link" data-list2>Next puzzle</button>` };
      } else notice = { kind: 'wrong', html: esc(r.message) };
      render();
      root.querySelector('[data-list2]')?.addEventListener('click', list);
    }));
  }

  list();
  return { rerender: () => (session ? render() : list()) };
}

function stockGenotype(v) {
  // Stocks are labelled vials, so their genotype is known: draw the female.
  return v.F[0].g;
}
