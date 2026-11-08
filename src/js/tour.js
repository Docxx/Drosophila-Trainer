// "Meet the fly": a coach card over the eyepiece that teaches the microscope by
// doing. Each step watches the real scope state and moves on when the learner
// has done it. "Show me" does the step for them; nothing is assessed.

const UP = { x: 0, y: 1, z: 0 };

function dorsalY() {
  const h = window.scope.holder;
  if (!h) return 0;
  const v = new window.scope.THREE.Vector3(UP.x, UP.y, UP.z).applyQuaternion(h.quaternion);
  return v.y;
}
const underside = () => dorsalY() < -0.7;
const fromAbove = () => dorsalY() > 0.7;
const is = (id) => window.scope.selectedId === id;
const mag = () => window.scope.view.mag;
const click = (act) => document.querySelector(`[data-act="${act}"]`)?.click();
const pick = (id) => {
  window.scope.selectById(id);
  window.scope.focusSelected();
};

/** Distance (mm, on the pad) from the view centre to the nearest sex comb of the selected fly. */
export function combDistance() {
  const fly = window.scope.getFly?.();
  if (!fly) return Infinity;
  const { THREE, view } = window.scope;
  let best = Infinity;
  fly.object.traverse((o) => {
    if (o.name !== 'sex-combs') return;
    const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    best = Math.min(best, Math.hypot(c.x - view.x, c.z - view.z));
  });
  return best;
}
function centreOnComb() {
  const fly = window.scope.getFly?.();
  if (!fly) return;
  const { THREE, view } = window.scope;
  let best = null;
  fly.object.traverse((o) => {
    if (o.name !== 'sex-combs') return;
    const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    if (!best || c.y > best.y) best = c; // the comb nearer the eyepiece
  });
  if (best) {
    view.x = best.x;
    view.z = best.z;
    view.mag = 45;
    window.scope.updateCamera();
  }
}

export const TOUR_STEPS = [
  {
    title: 'Your microscope',
    text: 'Five flies lie on a CO₂ pad, knocked out, just as they would be at the bench. You will learn to handle them, then tell males from females. Nothing here is marked.',
    check: () => true,
    auto: false,
  },
  {
    title: 'Pick up a fly',
    text: 'Click the mature male in the top row, or his name in the list on the right. The ring shows which fly you are handling.',
    check: () => is('reference-male'),
    show: () => pick('reference-male'),
  },
  {
    title: 'Zoom in',
    text: 'Scroll over the eyepiece, or drag the Magnification slider at the bottom, until it reads 30× or more.',
    check: () => mag() >= 30,
    show: () => {
      window.scope.view.mag = 32;
      window.scope.updateCamera();
    },
  },
  {
    title: 'Turn him over',
    text: 'Press Underside at the bottom. Flies usually land on their side or back, so you will turn them all the time. Try Flip (F) and Turn (Q, E) too.',
    check: () => is('reference-male') && underside(),
    show: () => click('ventral'),
  },
  {
    title: 'Find the sex combs',
    text: 'Males have a row of thick black bristles, the sex comb, on the first foot segment of each front leg. Drag the empty pad (or right-drag) to bring one into the middle of the view, at 40× or more.',
    check: () => is('reference-male') && mag() >= 40 && combDistance() < 0.35,
    show: centreOnComb,
    wait: 600,
  },
  {
    title: 'Now a female',
    text: 'Pick the mature female, top left, and look at her underside. Her front legs have no combs. That one check settles the sex of any fly, however pale.',
    check: () => is('reference-female') && underside(),
    show: () => {
      pick('reference-female');
      setTimeout(() => click('ventral'), 50);
    },
  },
  {
    title: 'From above',
    text: 'Press Back. Her abdomen is longer and pointed, with separate dark bands. A mature male’s tip is solidly dark, but young males are pale, so trust the combs.',
    check: () => is('reference-female') && fromAbove(),
    show: () => click('dorsal'),
  },
  {
    title: 'A brand-new fly',
    text: 'Pick the just-eclosed female, top right, and view her underside. Very pale body, wings still folded, and a dark spot in the abdomen: the meconium, her first gut contents. All three mean she hatched within the last hour or so.',
    check: () => is('reference-teneral-female') && underside(),
    show: () => {
      pick('reference-teneral-female');
      setTimeout(() => click('ventral'), 50);
    },
  },
  {
    title: 'That is the toolkit',
    text: 'Sex combs tell you the sex; pale colour, folded wings and meconium tell you a fly is young. Next, use anatomy and the source-vial clearing record to collect virgin females. Colour alone cannot establish virginity. The Reference bench stays open whenever you want to compare.',
    check: () => true,
    auto: false,
    final: true,
  },
];

export function startTour({ onDone, onExit }) {
  const host = document.querySelector('.microscope');
  const card = document.createElement('aside');
  card.className = 'coach';
  card.setAttribute('aria-live', 'polite');
  host.append(card);
  let i = 0,
    timer = 0,
    metAt = 0;

  function render() {
    const s = TOUR_STEPS[i];
    card.innerHTML = `<div class="coach-head"><span class="eyebrow">Meet the fly · ${i + 1} of ${TOUR_STEPS.length}</span><button type="button" class="link" data-exit>Exit tour</button></div>
      <h3>${s.title}</h3><p>${s.text}</p>
      <div class="tool-row">${i > 0 ? '<button type="button" data-back>Back</button>' : ''}
        ${s.show ? '<button type="button" data-show>Show me</button>' : ''}
        ${s.auto === false ? `<button type="button" class="primary" data-next>${s.final ? 'Go to Virgin collection' : 'Start'}</button>` : '<span class="waiting">Waiting for you…</span>'}</div>`;
    card.querySelector('[data-exit]').onclick = () => {
      stop();
      onExit();
    };
    if (card.querySelector('[data-back]'))
      card.querySelector('[data-back]').onclick = () => {
        i--;
        metAt = 0;
        render();
      };
    if (card.querySelector('[data-show]')) card.querySelector('[data-show]').onclick = () => s.show();
    if (card.querySelector('[data-next]')) card.querySelector('[data-next]').onclick = () => advance();
  }
  function advance() {
    if (TOUR_STEPS[i].final) {
      stop();
      onDone();
      return;
    }
    i++;
    metAt = 0;
    render();
  }
  function tick() {
    const s = TOUR_STEPS[i];
    if (!window.scope.ready || s.auto === false) return;
    if (s.check()) {
      metAt ||= performance.now();
      if (performance.now() - metAt >= (s.wait || 250)) {
        card.classList.add('met');
        setTimeout(() => card.classList.remove('met'), 500);
        advance();
      }
    } else metAt = 0;
  }
  function stop() {
    clearInterval(timer);
    card.remove();
  }

  render();
  timer = setInterval(tick, 250);
  return {
    stop,
    get step() {
      return i;
    },
  };
}
