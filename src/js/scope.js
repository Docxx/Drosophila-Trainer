// Stereo-microscope reference bench with independently handled flies. Units are millimetres.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFly } from './flyModel.js';
import { CollectionSession, SOURCE_RECORD } from './collection.js';
import { CrossSession, SCORE_CLASSES, CROSS_PREDICTIONS, CROSS_INTERPRETATIONS } from './experiment.js';

const canvas = document.getElementById('scope');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9e6dd);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

// ---- CO2 pad: porous white polyethylene -------------------------------------
function padTexture() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#efece5';
  g.fillRect(0, 0, size, size);
  const img = g.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 2600; i++) {
    const r = 1 + Math.random() * 3.5;
    g.fillStyle = `rgba(120,112,98,${0.08 + Math.random() * 0.18})`;
    g.beginPath();
    g.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const padTex = padTexture();
const pad = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ map: padTex, bumpMap: padTex, bumpScale: 0.6, roughness: 0.95 }),
);
pad.rotation.x = -Math.PI / 2;
pad.receiveShadow = true;
scene.add(pad);

// ---- Lighting: a ring light above plus soft fill ---------------------------
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d0c0, 0.35));
const key = new THREE.DirectionalLight(0xfff4e6, 2.1);
key.position.set(-6, 22, -8);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -4;
key.shadow.camera.right = key.shadow.camera.top = 4;
key.shadow.camera.near = 1;
key.shadow.camera.far = 60;
key.shadow.radius = 6;
key.shadow.bias = -0.0004;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xe8f0ff, 0.9);
rim.position.set(10, 14, 12);
scene.add(rim);

// ---- Camera: looking straight down the scope -------------------------------
const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 500);
camera.up.set(0, 0, -1); // screen-up = away from the user
const view = { x: 0, z: 0, mag: 16 };
function fieldOfViewMm(mag) {
  return 160 / mag; // ~10 mm across at 16x, typical for a dissecting scope
}
function updateCamera() {
  const h = fieldOfViewMm(view.mag) / 2 / Math.tan(THREE.MathUtils.degToRad(10));
  camera.position.set(view.x, h, view.z);
  camera.lookAt(view.x, 0, view.z);
  document.getElementById('magOut').textContent = `${view.mag}×`;
  document.getElementById('mag').value = view.mag;
}

function resize() {
  const r = canvas.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);

// ---- Activities and saved notebook ------------------------------------------
const STORAGE_KEY = 'fly-trainer.collection.v1';
let persistenceWarning = '';
function restoreSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return new CollectionSession({ seed: saved.seed, saved });
    }
  } catch { persistenceWarning = 'The previous notebook could not be restored. A fresh batch is open.'; }
  return new CollectionSession();
}
let session = restoreSession();
const CROSS_STORAGE_KEY = 'fly-trainer.cross.v1';
function restoreCross() {
  try {
    const raw = localStorage.getItem(CROSS_STORAGE_KEY);
    if (raw) return new CrossSession({ saved: JSON.parse(raw) });
  } catch { persistenceWarning = 'The previous cross notebook could not be restored. A fresh cross batch is open.'; }
  return new CrossSession();
}
let crossSession = restoreCross();
let crossPage = 0;
let mode = 'exercise';
function activeSession() { return mode === 'cross' ? crossSession : session; }
function isCollecting() { return mode === 'exercise' || mode === 'cross' && crossSession.snapshot().phase === 'collecting'; }
let busy = false;
let generation = 0;
let selected = null;
let tool = 'move';
let tween = null;
let drag = null;
let helpVisits = 0;
const specimens = [];
const references = [
  { id: 'reference-female', label: 'Mature female', sex: 'F', stage: 'mature', x: -1.65, z: -1.5, heading: -1.25, note: 'Inspect the pointed abdomen and separated pigment bands. Females lack foreleg sex combs.' },
  { id: 'reference-male', label: 'Mature male', sex: 'M', stage: 'mature', x: 1.65, z: -1.5, heading: -1.25, note: 'Compare the shorter abdomen and dark posterior tergites. Inspect the first tarsal segment of each foreleg for sex combs.' },
  { id: 'reference-pale-female', label: 'Pale female', sex: 'F', stage: 'fresh', x: -1.65, z: 1.5, heading: -1.25, note: 'Pale colour is a developmental cue, not a mating record. These reference wings are expanded; unexpanded wings and meconium are not modelled yet.' },
  { id: 'reference-pale-male', label: 'Pale male', sex: 'M', stage: 'fresh', x: 1.65, z: 1.5, heading: -1.25, note: 'The abdomen has little pigmentation. Inspect the forelegs for sex combs; pale colour alone does not identify a female.' },
];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const padPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
function startingRotation(heading) {
  return new THREE.Quaternion().setFromAxisAngle(Y_AXIS, heading)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session.serialize()));
    localStorage.setItem(CROSS_STORAGE_KEY, JSON.stringify(crossSession.serialize()));
    persistenceWarning = '';
  } catch { persistenceWarning = 'Notebook is in memory only: local saving is unavailable. Export it before closing.'; }
  document.getElementById('save-status').textContent = persistenceWarning || 'Notebook saved on this computer';
}
function record(action, detail) {
  if (mode === 'reference') return;
  activeSession().log(action, selected?.reference.id || null, detail);
  save();
}
function destination(specimen) {
  if (mode === 'reference' || mode === 'cross' && !isCollecting()) return 'pad';
  return activeSession().snapshot().flies.find((f) => f.id === specimen.reference.id)?.destination;
}
function canHandle() { return selected && destination(selected) === 'pad' && !busy; }
function samplePoints(root) {
  const pts = [];
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  root.traverse((o) => {
    if (!o.isMesh || ['bristles', 'sex-combs'].includes(o.parent?.name)) return;
    const p = o.geometry.attributes.position;
    const step = Math.max(1, Math.floor(p.count / 400));
    const transform = new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld);
    for (let i = 0; i < p.count; i += step) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(transform));
  });
  return pts;
}
function settle(specimen) {
  let min = Infinity;
  const v = new THREE.Vector3();
  for (const point of specimen.samples) min = Math.min(min, v.copy(point).applyQuaternion(specimen.holder.quaternion).y);
  specimen.holder.position.y = -min;
}
const ring = new THREE.Mesh(new THREE.RingGeometry(1.38, 1.4, 96),
  new THREE.MeshBasicMaterial({ color: 0x9d6d27, side: THREE.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false }));
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.008;
ring.visible = false;
scene.add(ring);

function renderInventory() {
  const state = activeSession().snapshot();
  const shelf = document.getElementById('specimens');
  shelf.replaceChildren();
  for (const specimen of specimens) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.specimen = specimens.indexOf(specimen);
    const place = destination(specimen);
    button.textContent = specimen.reference.label + (mode !== 'reference' && place !== 'pad' ? ` · ${place === 'collection' ? 'in vial' : 'set aside'}` : '');
    button.classList.toggle('on', specimen === selected);
    button.setAttribute('aria-pressed', String(specimen === selected));
    button.addEventListener('click', () => { select(specimen); if (place === 'pad') focusSelected(); });
    shelf.append(button);
    specimen.holder.visible = place === 'pad';
  }
  for (const place of ['collection', 'rejected']) {
    const flies = state.flies.filter((f) => f.destination === place);
    document.getElementById(`${place}-count`).textContent = flies.length;
    document.getElementById(`${place}-contents`).textContent = flies.length ? flies.map((f) => f.label).join(', ') : 'Empty';
  }
  renderCrossControls();
  const submit = document.querySelector('[data-act="submit"]');
  submit.textContent = state.submitted ? 'View collection review' : 'Declare collection ready';
  submit.disabled = busy || mode !== 'exercise';
}
function select(specimen, log = true) {
  tween = null;
  selected = specimen;
  const onPad = specimen && destination(specimen) === 'pad';
  ring.visible = !!onPad;
  document.getElementById('specimen-name').textContent = specimen?.reference.label || (mode === 'cross' && crossSession.snapshot().phase === 'developing' ? 'Cross in progress' : 'Select a fly');
  document.getElementById('specimen-note').textContent = mode === 'reference'
    ? specimen?.reference.note || 'Choose a reference specimen.'
    : mode === 'cross' && crossSession.snapshot().phase === 'developing' ? 'The vial is developing in the incubator. Advance to the next event using the timeline.'
    : mode === 'cross' && !isCollecting() ? 'Record eye colour and sex. Use Uncertain if the view does not support a confident identification.'
    : !specimen ? 'Inspect a fly, then collect it or set it aside. No answer is given until you submit.'
    : onPad ? 'Inspect the abdomen and forelegs from different angles. Use the source-vial record when deciding whether to collect.'
    : 'Return this fly to the pad if you want to inspect it again.';
  document.querySelectorAll('[data-needs-selection]').forEach((b) => b.disabled = !onPad || busy);
  const locked = !isCollecting() || activeSession().snapshot().submitted || busy;
  document.querySelectorAll('[data-transfer]').forEach((b) => b.disabled = locked || !specimen || b.dataset.transfer === destination(specimen));
  document.querySelectorAll('[data-specimen]').forEach((b) => {
    const on = Number(b.dataset.specimen) === specimens.indexOf(specimen);
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
  });
  if (log && specimen && mode !== 'reference') {
    record('inspect', `Inspected ${specimen.reference.label}.`);
    helpVisits++;
    if (helpVisits === 4 && document.getElementById('supervisor-enabled').checked)
      document.getElementById('supervisor-note').textContent = 'Try the underside view at higher magnification. Can you identify the foreleg sex combs?';
  }
  renderCrossControls();
}
async function loadActivity(nextMode) {
  const load = ++generation;
  busy = true;
  window.scope.ready = false;
  window.scope.error = null;
  drag = null; tween = null;
  canvas.classList.remove('dragging');
  select(null, false);
  for (const s of specimens) { scene.remove(s.holder); s.fly.dispose(); }
  specimens.length = 0;
  document.getElementById('specimens').replaceChildren();
  document.querySelector('[data-act="submit"]').disabled = true;
  mode = nextMode;
  document.body.dataset.mode = mode;
  document.body.dataset.phase = mode === 'cross' ? crossSession.snapshot().phase : '';
  renderCrossControls();
  document.querySelectorAll('[data-mode]').forEach((b) => { b.disabled = true; b.classList.toggle('on', b.dataset.mode === mode); b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
  document.getElementById('mode-label').textContent = mode === 'exercise' ? 'Virgin collection' : mode === 'cross' ? 'First genetic cross' : 'Reference bench';
  document.getElementById('inventory-title').textContent = mode === 'exercise' ? 'Your batch · six flies' : mode === 'cross' ? (isCollecting() ? 'White-eyed stock · six flies' : crossSession.snapshot().phase === 'developing' ? 'Cross vial · developing' : `F1 sample · page ${crossPage + 1}`) : 'Known reference specimens';
  const loading = document.querySelector('.loading');
  loading.classList.remove('done');
  const population = mode === 'exercise' ? session.appearance : mode === 'cross' ? crossSession.specimens(crossPage) : references;
  for (const reference of population) {
    loading.textContent = `Preparing flies ${specimens.length + 1}/${population.length}…`;
    const fly = await buildFly(reference);
    if (load !== generation) { fly.dispose(); return; }
    const holder = new THREE.Group(); holder.add(fly.object);
    holder.position.set(reference.x, 0, reference.z);
    scene.add(holder);
    const specimen = { reference, holder, fly, samples: samplePoints(holder), start: startingRotation(reference.heading) };
    holder.quaternion.copy(specimen.start);
    settle(specimen); specimens.push(specimen);
  }
  busy = false;
  renderInventory();
  select(specimens.find((s) => destination(s) === 'pad') || null, false);
  overview();
  loading.classList.add('done');
  document.querySelectorAll('[data-mode]').forEach((b) => b.disabled = false);
  window.scope.ready = true;
  save();
}
function startActivity(nextMode) {
  return loadActivity(nextMode).catch((error) => {
    console.error(error); window.scope.error = error.message;
    document.querySelector('.loading').textContent = 'The flies could not be loaded. Restart Fly Trainer to try again.';
  });
}
function transferSelected(place) {
  if (!selected || !isCollecting() || activeSession().snapshot().submitted || busy) return;
  tween = null;
  activeSession().move(selected.reference.id, place);
  if (place === 'pad') {
    // A drag can finish over a vial outside the eyepiece. Return the fly to a
    // visible pad location rather than leaving it at that off-screen drop point.
    selected.holder.position.set(selected.reference.x, 0, selected.reference.z);
    settle(selected);
  }
  renderInventory(); select(selected, false); save();
  if (place === 'pad') focusSelected();
  document.getElementById('activity-status').textContent = `${selected.reference.label}: ${place === 'pad' ? 'returned to pad' : place === 'collection' ? 'moved to collection vial' : 'set aside'}.`;
}
function cast(e) {
  const bounds = canvas.getBoundingClientRect();
  pointer.set((e.clientX - bounds.left) / bounds.width * 2 - 1, -(e.clientY - bounds.top) / bounds.height * 2 + 1);
  scene.updateMatrixWorld(true); camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
}
function hitSpecimen(e) {
  cast(e);
  const hits = raycaster.intersectObjects(specimens.filter((s) => s.holder.visible).map((s) => s.holder), true);
  if (!hits.length) return null;
  let node = hits[0].object;
  while (node && !specimens.some((s) => s.holder === node)) node = node.parent;
  return specimens.find((s) => s.holder === node) || null;
}
function onPad(e) { cast(e); return raycaster.ray.intersectPlane(padPlane, new THREE.Vector3()); }
function setTool(next) {
  tool = next; canvas.dataset.tool = tool;
  document.querySelectorAll('[data-tool]').forEach((b) => { b.classList.toggle('on', b.dataset.tool === tool); b.setAttribute('aria-pressed', String(b.dataset.tool === tool)); });
}
function rotateWorld(axis, angle) {
  if (!canHandle()) return;
  tween = null;
  selected.holder.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, angle)); settle(selected);
}
function animateTo(q, ms = 400) {
  if (canHandle()) tween = { specimen: selected, from: selected.holder.quaternion.clone(), to: q, t0: performance.now(), ms };
}
function turn(deg = 90) { rotateWorld(Y_AXIS, THREE.MathUtils.degToRad(deg)); }
function flipOver() {
  if (canHandle()) animateTo(selected.holder.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI)));
}
function focusSelected() {
  if (!canHandle()) return;
  view.x = selected.holder.position.x; view.z = selected.holder.position.z; view.mag = 32; updateCamera();
}
function overview() { view.x = view.z = 0; view.mag = mode === 'reference' ? 16 : 12; updateCamera(); }

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  if (![0, 1, 2].includes(e.button) || busy || document.querySelector('dialog[open]')) return;
  const hit = hitSpecimen(e), pan = e.button !== 0 || !hit;
  if (!pan) select(hit);
  const point = onPad(e); if (!point) return;
  tween = null; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, point, pan, moved: false,
    rotate: !pan && (tool === 'rotate' || e.altKey), turn: e.shiftKey, origin: selected?.holder.position.clone() };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY; drag.moved ||= Math.abs(dx) + Math.abs(dy) > 0;
  if (drag.pan) {
    const mmPerPx = fieldOfViewMm(view.mag) / canvas.clientHeight;
    view.x -= dx * mmPerPx; view.z -= dy * mmPerPx; updateCamera();
  } else if (drag.rotate) {
    if (drag.turn || e.shiftKey) turn(-dx * 0.7);
    else { rotateWorld(new THREE.Vector3(0, 0, -1), dx * 0.01); rotateWorld(new THREE.Vector3(1, 0, 0), dy * 0.01); }
  } else {
    const point = onPad(e); if (!point) return;
    const proposed = drag.origin.clone().add(point.sub(drag.point));
    proposed.x = THREE.MathUtils.clamp(proposed.x, -20, 20); proposed.z = THREE.MathUtils.clamp(proposed.z, -20, 20);
    if (specimens.some((s) => s !== selected && s.holder.visible && Math.hypot(s.holder.position.x - proposed.x, s.holder.position.z - proposed.z) < 2.7)) return;
    selected.holder.position.x = proposed.x; selected.holder.position.z = proposed.z; settle(selected);
  }
});
function endDrag(e) {
  if (!drag || drag.id !== e.pointerId) return;
  const completed = drag; drag = null; canvas.classList.remove('dragging');
  if (completed.moved && !completed.pan) {
    const drop = e.type === 'pointerup' && !completed.rotate && document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]');
    if (drop && isCollecting() && !activeSession().snapshot().submitted) transferSelected(drop.dataset.drop);
    else record(completed.rotate ? 'rotate' : 'move', `${completed.rotate ? 'Rotated' : 'Moved'} ${selected.reference.label} on the pad.`);
  }
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('lostpointercapture', endDrag);
canvas.addEventListener('dblclick', (e) => { const hit = hitSpecimen(e); if (hit && !busy) { select(hit); focusSelected(); } });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault(); view.mag = THREE.MathUtils.clamp(Math.round(view.mag * Math.exp(-e.deltaY * 0.0012)), 8, 50); updateCamera();
}, { passive: false });
document.getElementById('mag').addEventListener('input', (e) => { view.mag = Number(e.target.value); updateCamera(); });

// ---- Notebook and delayed review --------------------------------------------
const notebook = document.getElementById('notebook');
const review = document.getElementById('review');
function renderNotebook() {
  const state = activeSession().snapshot();
  document.getElementById('notebook-context').textContent = mode === 'cross' ? 'White-eyed stock · First genetic cross' : 'Canton-S · First collection';
  for (const field of ['prediction', 'conclusion']) document.getElementById(field).value = state.notes[field];
  const history = document.getElementById('history'); history.replaceChildren();
  for (const event of [...state.events].reverse()) {
    const item = document.createElement('li');
    const time = new Date(event.at);
    item.textContent = `${Number.isNaN(time.getTime()) ? '' : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · '}${event.detail}`;
    history.append(item);
  }
}
for (const field of ['prediction', 'conclusion']) document.getElementById(field).addEventListener('input', (e) => { activeSession().setNote(field, e.target.value); save(); });
function showReview() {
  if (busy || mode !== 'exercise') return;
  const result = session.submit(); save(); select(selected, false); renderInventory();
  document.getElementById('review-title').textContent = result.success ? 'Collection ready' : 'Review your collection';
  document.getElementById('review-summary').textContent = result.success
    ? `You collected ${result.females} female flies with no males. The source-vial history supports using these females as virgins in this exercise.`
    : result.errors ? `Your vial contains ${result.errors} male ${result.errors === 1 ? 'fly' : 'flies'}. Recheck the forelegs before collecting again.`
    : `You collected ${result.females} female flies. The objective is at least ${SOURCE_RECORD.target}; you can return set-aside flies to the pad and inspect them again.`;
  const rows = document.getElementById('review-rows'); rows.replaceChildren();
  for (const row of result.rows) {
    const item = document.createElement('li'); item.className = row.correct ? 'review-good' : 'review-error';
    const title = document.createElement('strong'); title.textContent = row.label;
    const reason = document.createElement('p'); reason.textContent = row.reason;
    item.append(title, reason); rows.append(item);
  }
  if (!review.open) review.showModal();
}
function renderCrossControls() {
  const empty = document.getElementById('experiment-empty');
  const tip = document.querySelector('.scope-tip');
  if (mode !== 'cross') {
    empty.hidden = true;
    document.getElementById('scope-heading').textContent = 'Dissecting microscope';
    document.getElementById('scope-context').textContent = 'CO₂ pad · practice time is paused';
    tip.textContent = mode === 'reference' ? 'Compare known specimens from different angles.' : 'Select a fly to inspect it. Drag onto a destination or use the collection buttons.';
    return;
  }
  const state = crossSession.snapshot();
  document.getElementById('scope-heading').textContent = state.phase === 'developing' ? 'Cross vial' : 'Dissecting microscope';
  document.getElementById('scope-context').textContent = state.phase === 'developing' ? `Incubator · 25 °C · day ${state.day}` : `CO₂ pad · experiment day ${state.day}`;
  tip.textContent = state.phase === 'collecting' ? 'Choose candidate parents. Their identities are not assessed before this cross.' : state.phase === 'developing' ? 'Advance to the next event using the timeline on the left.' : 'Inspect F1 flies, then record eye colour and sex on the right. View both pages.';
  document.body.dataset.phase = state.phase;
  document.getElementById('cross-source-title').textContent = state.source.title;
  document.getElementById('cross-source-record').textContent = state.source.clearing;
  document.getElementById('cross-source-evidence').textContent = state.source.evidence;
  document.getElementById('cross-day').textContent = `Day ${state.day}`;
  const labels = state.flies.filter((f) => f.destination === 'collection').map((f) => f.label);
  document.getElementById('cross-parents').textContent = labels.length ? `Parent vial: ${labels.join(', ')}${state.phase === 'collecting' ? '' : ' + two verified Canton-S males'}.` : 'No candidate parents collected yet.';
  document.getElementById('cross-progress').textContent = state.phase === 'collecting' ? 'Choose candidate females, record a prediction, then set up the cross.'
    : state.phase === 'developing' ? state.day === 0 ? 'Cross set up. Next event: remove all parents on day 2.' : 'Parents removed. Next event: examine an F1 sample on day 12.'
    : state.phase === 'review' ? 'Evidence reviewed. You can revisit your observations or start another batch.'
    : `Record each F1 fly by eye colour and sex: ${state.scored}/${state.offspringCount} observations. Uncertain is an acceptable observation.`;
  const prediction = document.getElementById('cross-prediction');
  prediction.value = state.prediction; prediction.disabled = state.phase !== 'collecting' || busy;
  const interpretation = document.getElementById('cross-interpretation');
  interpretation.value = state.interpretation; interpretation.disabled = state.phase !== 'scoring' || busy;
  document.querySelector('[data-act="cross-start"]').disabled = !labels.length || state.phase !== 'collecting' || busy;
  document.querySelector('[data-act="cross-advance"]').disabled = state.phase !== 'developing' || busy;
  document.querySelector('[data-act="cross-advance"]').textContent = state.day === 0 ? 'Advance to day 2 · remove parents' : 'Advance to day 12 · examine F1';
  document.querySelector('[data-act="cross-submit"]').disabled = busy || !['scoring', 'review'].includes(state.phase) || state.scored !== state.offspringCount;
  document.querySelector('[data-act="cross-submit"]').textContent = state.phase === 'review' ? 'View evidence review' : 'Review my observations';
  document.querySelector('[data-act="cross-new"]').disabled = busy;
  document.querySelector('[data-act="cross-previous"]').disabled = busy || crossPage === 0;
  document.querySelector('[data-act="cross-next"]').disabled = busy || (crossPage + 1) * 6 >= (state.offspringCount || 0);
  document.getElementById('cross-page').textContent = `${crossPage + 1} / ${Math.max(1, Math.ceil((state.offspringCount || 0) / 6))}`;
  document.querySelectorAll('[data-score]').forEach((button) => {
    button.disabled = busy || state.phase !== 'scoring' || !selected;
    const on = !!selected && state.scores[selected.reference.id] === button.dataset.score;
    button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));
  });
  const tally = document.getElementById('cross-tally'); tally.replaceChildren();
  for (const [category, label] of Object.entries(SCORE_CLASSES)) {
    const row = document.createElement('div');
    row.textContent = `${label}: ${Object.values(state.scores).filter((score) => score === category).length}`;
    tally.append(row);
  }
  empty.hidden = state.phase !== 'developing' && !(state.phase !== 'collecting' && state.offspringCount === 0);
  document.getElementById('experiment-empty-title').textContent = state.phase === 'developing' ? `Cross vial · day ${state.day}` : 'No F1 adults observed';
  document.getElementById('experiment-empty-note').textContent = state.phase === 'developing' ? state.day === 0 ? 'Egg laying · next, remove the parent flies' : 'Larvae and pupae developing · parent flies removed' : 'Use the vial history and parent-selection record to consider possible causes.';
}
function showCrossReview() {
  if (busy || mode !== 'cross') return;
  const report = crossSession.submit(); save(); renderCrossControls();
  document.getElementById('cross-review-summary').textContent = report.explanation;
  document.getElementById('cross-review-learning').textContent = `Identification: ${report.correct}/${report.total} observations match; ${report.uncertain} marked uncertain. ${report.interpretation === 'unknown' ? 'You requested more evidence.' : report.interpretationSupported ? 'Your interpretation is supported by these observations.' : 'Reconsider your interpretation using the observed counts below.'} ${crossSession.snapshot().prediction === 'unknown' ? 'No definite prediction recorded.' : report.predictionCorrect ? 'Your prediction for the intended cross was correct.' : 'For the intended cross, daughters receive a normal paternal X; sons receive the paternal Y.'}`;
  const counts = document.getElementById('cross-review-counts'); counts.replaceChildren();
  for (const [category, count] of Object.entries(report.counts)) {
    const row = document.createElement('div'); row.textContent = `${SCORE_CLASSES[category]}: ${count}`; counts.append(row);
  }
  const corrections = document.getElementById('cross-review-corrections'); corrections.replaceChildren();
  for (const row of report.rows.filter((row) => !row.correct)) {
    const item = document.createElement('li');
    item.textContent = `${row.label}: recorded ${SCORE_CLASSES[row.observed] || 'unscored'}; review observation ${SCORE_CLASSES[row.actual].toLowerCase()}.`;
    corrections.append(item);
  }
  document.getElementById('cross-review-limitations').textContent = report.limitations;
  const dialog = document.getElementById('cross-review'); if (!dialog.open) dialog.showModal();
}
document.getElementById('cross-prediction').addEventListener('change', (event) => { crossSession.setPrediction(event.target.value); save(); });
document.getElementById('cross-interpretation').addEventListener('change', (event) => { crossSession.setInterpretation(event.target.value); save(); });
document.querySelector('[data-act="cross-rescore"]').addEventListener('click', () => { document.getElementById('cross-review').close(); crossSession.retryScoring(); save(); renderInventory(); select(selected, false); });
document.querySelector('[data-act="next-cross"]').addEventListener('click', () => { review.close(); crossPage = 0; startActivity('cross'); });
function exportNotebook() {
  const state = activeSession().snapshot();
  const lines = [mode === 'cross' ? 'Fly Trainer · First genetic cross' : 'Fly Trainer · Virgin collection',
    mode === 'cross' ? `Source: white-eyed maternal stock; ${state.source.title}; ${state.source.clearing}` : `Source: ${SOURCE_RECORD.stock}, cleared ${SOURCE_RECORD.clearedAt}, collected ${SOURCE_RECORD.collectedAt}, ${SOURCE_RECORD.temperature}`,
    '\nPrediction', state.notes.prediction || '(not recorded)', '\nConclusion', state.notes.conclusion || '(not recorded)', '\nAction history', ...state.events.map((e) => `${e.at} ${e.detail}`)];
  if (mode === 'cross') {
    lines.push('\nCross record', `Day ${state.day}; ${state.phase}`, `Prediction: ${CROSS_PREDICTIONS[state.prediction]}`, `Interpretation: ${CROSS_INTERPRETATIONS[state.interpretation]}`,
      ...Object.entries(state.scores).map(([id, score]) => `${id}: ${SCORE_CLASSES[score]}`));
    if (state.report) lines.push('\nEvidence review', state.report.explanation, state.report.limitations);
  } else lines.push('\nReview', state.report ? `${state.report.success ? 'Ready' : 'Needs review'}; females ${state.report.females}; males ${state.report.errors}` : 'Not submitted',
    ...(state.report?.rows.map((row) => `${row.label}: ${row.reason}`) || []));
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = mode === 'cross' ? 'fly-trainer-cross-notebook.txt' : 'fly-trainer-notebook.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.querySelector('.bench').addEventListener('click', (e) => {
  const button = e.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.mode) { crossPage = 0; startActivity(button.dataset.mode); return; }
  if (button.dataset.tool) setTool(button.dataset.tool);
  if (button.dataset.transfer) { transferSelected(button.dataset.transfer); return; }
  if (button.dataset.score && mode === 'cross' && selected && !busy) { crossSession.score(selected.reference.id, button.dataset.score); save(); renderInventory(); select(selected, false); return; }
  const act = button.dataset.act;
  if (act === 'flip') flipOver();
  else if (act === 'turn') turn();
  else if (act === 'roll-left') rotateWorld(new THREE.Vector3(1, 0, 0), -Math.PI / 6);
  else if (act === 'roll-right') rotateWorld(new THREE.Vector3(1, 0, 0), Math.PI / 6);
  else if (act === 'focus') focusSelected();
  else if (act === 'overview') overview();
  else if (act === 'dorsal') animateTo(new THREE.Quaternion());
  else if (act === 'lateral' && selected) animateTo(selected.start.clone());
  else if (act === 'ventral') animateTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
  else if (act === 'reset') {
    for (const s of specimens) { s.holder.position.set(s.reference.x, 0, s.reference.z); s.holder.quaternion.copy(s.start); settle(s); }
    tween = null; overview(); record('reset', 'Reset pad positions and inspection angles; collection decisions retained.');
  } else if (act === 'submit') showReview();
  else if (act === 'notebook') { renderNotebook(); notebook.showModal(); }
  else if (act === 'cross-start') { crossSession.start(); crossPage = 0; save(); startActivity('cross'); }
  else if (act === 'cross-advance') { crossSession.advance(); crossPage = 0; save(); startActivity('cross'); }
  else if (act === 'cross-submit') showCrossReview();
  else if (act === 'cross-previous' || act === 'cross-next') { crossPage += act === 'cross-next' ? 1 : -1; startActivity('cross'); }
  else if (act === 'cross-new') { crossSession = new CrossSession({ scenario: document.getElementById('cross-scenario').value }); crossPage = 0; save(); startActivity('cross'); }
  else if (act === 'hint') {
    document.getElementById('supervisor-note').textContent = mode === 'cross' ? 'Use the maternal stock record and tester X chromosome to predict daughters separately from sons. Unexpected daughters can reveal an unintended father, but cannot identify an individual mother’s mating history.' : 'Separate the two decisions: identify a female from her anatomy, then use the clearing record to support virgin collection. Try the underside view and zoom in on the forelegs.';
    record('hint', 'Requested a supervisor hint.');
  }
  if (['flip', 'turn', 'roll-left', 'roll-right', 'dorsal', 'lateral', 'ventral'].includes(act) && canHandle()) record('rotate', `${selected.reference.label}: inspected ${button.textContent.trim().toLowerCase()}.`);
});
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelector('[data-act="retry"]').addEventListener('click', () => { review.close(); session.retry(); save(); renderInventory(); select(selected, false); });
document.querySelector('[data-act="new-batch"]').addEventListener('click', () => { review.close(); session = new CollectionSession(); helpVisits = 0; save(); startActivity('exercise'); });
document.querySelector('[data-act="export"]').addEventListener('click', exportNotebook);
addEventListener('keydown', (e) => {
  if (document.querySelector('dialog[open]') || (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) || e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toLowerCase();
  if (key === 'q') turn(-15);
  else if (key === 'e') turn(15);
  else if (key === 'f') flipOver();
  else if (key === 'g') setTool('move');
  else if (key === 'r') setTool('rotate');
  else if (e.key === 'Escape') { tween = null; overview(); }
  if (['q', 'e', 'f'].includes(key) && canHandle()) record('rotate', `${selected.reference.label}: used the ${key.toUpperCase()} inspection shortcut.`);
});
function frame(now) {
  if (tween) {
    const t = Math.min(1, (now - tween.t0) / tween.ms);
    tween.specimen.holder.quaternion.slerpQuaternions(tween.from, tween.to, t * t * (3 - 2 * t)); settle(tween.specimen);
    if (t === 1) tween = null;
  }
  if (selected && selected.holder.visible) {
    ring.position.x = selected.holder.position.x; ring.position.z = selected.holder.position.z;
    key.target.position.set(selected.holder.position.x, 0, selected.holder.position.z);
  }
  renderer.render(scene, camera); requestAnimationFrame(frame);
}
resize(); updateCamera(); setTool('move');
window.scope = { THREE, scene, camera, view, updateCamera, specimens, select, setTool, focusSelected, overview, flipOver, turn,
  get holder() { return selected?.holder; }, getFly: () => selected?.fly, ready: false,
  // Development/test controls return the same public session snapshot as the UI.
  startActivity, getSession: () => activeSession().snapshot() };
startActivity(mode);
requestAnimationFrame(frame);
