// The course hub and router. The app opens on the hub; microscope activities
// use the bench (scope.js), lessons and the planner use the desk.

import { SECTIONS, LESSONS, DIAGNOSTIC, progress, nextLesson } from './course.js';
import { mountLesson } from './lessonPlayer.js';
import { mountPlanner } from './planner.js';
import { mountSandbox } from './sandbox.js';
import { startTour } from './tour.js';
import { esc } from './chromosomes.js';

const desk = document.getElementById('desk');
const stage = document.getElementById('desk-stage');
let current = null; // mounted lesson or planner (has rerender)
let tour = null;

const KIND = { tour: 'Microscope · guided', scope: 'Microscope', lesson: 'Interactive lesson', planner: 'Puzzles', sandbox: 'Sandbox' };

function setView(view) {
  document.body.dataset.view = view;
  desk.hidden = view !== 'desk';
  if (view === 'desk') window.scrollTo(0, 0);
}

function hub() {
  tour?.stop(); tour = null; current = null;
  setView('desk');
  const p = progress.get();
  const next = nextLesson(p.done);
  const fresh = p.done.length === 0;
  stage.innerHTML = `<div class="hub">
    <section class="hero">
      <div><span class="eyebrow">${fresh ? 'Welcome' : 'Continue'}</span>
        <h2>${fresh ? 'Learn fly pushing and fly genetics by doing it' : next ? esc(next.title) : 'Course complete'}</h2>
        <p>${fresh ? 'Handle flies under a 3D microscope, then follow their chromosomes into the next generation. Every lesson is open: go in order or jump to what you need.' : next ? esc(next.summary) : 'Every lesson is done. Keep practising at the bench or in the cross planner.'}</p>
        <div class="tool-row">${next ? `<button type="button" class="primary big" data-open="${next.id}">${fresh ? 'Start with ' : 'Continue: '}${esc(next.title)}</button>` : ''}
          <button type="button" data-open="${DIAGNOSTIC.id}">${esc(DIAGNOSTIC.title)} · ${DIAGNOSTIC.minutes} min</button></div>
        ${fresh ? `<p class="secondary">Done some fly work before? The quick check suggests where to start.</p>` : ''}</div>
      <div class="progress-ring" style="--done:${LESSONS.filter((l) => p.done.includes(l.id)).length / LESSONS.length}"><strong>${LESSONS.filter((l) => p.done.includes(l.id)).length}/${LESSONS.length}</strong><span>done</span></div>
    </section>
    ${SECTIONS.map((s) => `<section class="hub-section"><h3>${esc(s.title)}</h3><p class="secondary">${esc(s.blurb)}</p><div class="cards">${
      LESSONS.filter((l) => l.section === s.id).map((l) => {
        const done = p.done.includes(l.id);
        const puzzles = l.id === 'planner' ? Object.keys(p.puzzles).length : 0;
        return `<button type="button" class="card ${done ? 'done' : ''} ${next?.id === l.id ? 'next' : ''}" data-open="${l.id}">
          <span class="eyebrow">${KIND[l.kind]}${l.practice ? ' · practice' : ''}</span><strong>${esc(l.title)}</strong><span>${esc(l.summary)}</span>
          <span class="meta">${done ? '✓ Done' : next?.id === l.id ? 'Suggested next' : l.minutes ? `${l.minutes} min` : 'Open any time'}${puzzles ? ` · ${puzzles}/6 puzzles` : ''}</span></button>`;
      }).join('')}</div></section>`).join('')}
    <p class="secondary hub-foot">Progress is saved on this computer. <button type="button" class="link" data-reset>Reset course progress</button></p>
  </div>`;
}

function open(id) {
  tour?.stop(); tour = null;
  if (id === DIAGNOSTIC.id) return lesson(id);
  const l = LESSONS.find((x) => x.id === id);
  if (!l) return hub();
  if (l.kind === 'lesson') return lesson(id);
  if (l.kind === 'planner') { setView('desk'); current = mountPlanner(stage, { onExit: hub }); return; }
  if (l.kind === 'sandbox') { setView('desk'); current = mountSandbox(stage, { onExit: hub }); progress.complete('sandbox'); return; }
  setView('scope');
  if (l.kind === 'scope') { window.scope.startActivity(l.activity); return; }
  // Guided tour runs on the reference bench.
  window.scope.startActivity('reference').then(() => {
    tour = startTour({ onDone: () => { progress.complete('tour'); tour = null; open('collection'); }, onExit: () => { tour = null; } });
  });
}

function lesson(id) {
  setView('desk');
  current = mountLesson(stage, id, {
    onExit: hub,
    onAction(action) {
      if (action.kind === 'scope') open(LESSONS.find((l) => l.activity === action.activity).id);
      else if (action.kind === 'planner') open('planner');
      else if (action.kind === 'lesson') open(action.id);
    },
  });
}

// Notation switch: diagram, notation or both, everywhere on the desk.
const notation = document.getElementById('notation');
function syncNotation() {
  notation.querySelectorAll('button').forEach((b) => { const on = b.dataset.notation === progress.notation; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
}
notation.addEventListener('click', (e) => {
  const b = e.target.closest('[data-notation]'); if (!b) return;
  progress.notation = b.dataset.notation; syncNotation(); current?.rerender();
});

stage.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.open) open(b.dataset.open);
  else if (b.hasAttribute('data-reset') && confirm('Reset course progress? Lesson completion and puzzle results are cleared; notebooks are kept.')) { progress.reset(); hub(); }
});
document.querySelectorAll('button[data-view="desk"]').forEach((b) => b.addEventListener('click', hub));
document.getElementById('desk-home').addEventListener('click', hub);
document.addEventListener('flytrainer:progress', () => { if (document.body.dataset.view === 'desk' && !current) hub(); });

syncNotation();
const start = new URLSearchParams(location.search).get('open');
if (start) open(start); else hub();

window.course = { hub, open, get tour() { return tour; }, get current() { return current; } };
