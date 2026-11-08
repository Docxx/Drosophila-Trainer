// Run in the isolated Electron snapshot profile.
(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const { VISUAL_GUIDES, guideScene } = await import('app://fly/src/js/lessonVisuals.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const click = (s) => { const b = $(s); assert(b && !b.disabled, `Missing visual control: ${s}`); b.click(); };
  const frame = () => Number($('[data-visual-frame][aria-current="step"]').dataset.visualFrame);
  const goto = (n) => click(`[data-visual-frame="${n}"]`);
  progress.reset();
  for (const [id, guide] of Object.entries(VISUAL_GUIDES)) {
    window.course.open(id);
    assert($('.visual-guide').open, `${id}: explanation opens visually`);
    assert($('.visual-scene').getAttribute('role') === 'img', `${id}: accessible labelled scene`);
    const initial = $('.visual-scene').outerHTML;
    for (let i = 0; i < guide.frames.length; i++) {
      goto(i);
      assert(frame() === i && $('[data-guide-caption]').textContent === guide.frames[i][1], `${id}: correct stage and caption`);
      assert($('.visual-scene').getAttribute('aria-label').includes(guide.frames[i][0]), `${id}: stage available to screen readers`);
      assert($('.visual-scene text'), `${id}: chromosomes and objects have text labels`);
    }
    assert($('.visual-scene').outerHTML !== initial, `${id}: stages change the visual explanation`);
    click('[data-visual-replay]'); assert(frame() === 0, `${id}: replay returns to the beginning`);
    goto(2);
    const scene = $('.visual-scene').innerHTML;
    click('[data-notation="notation"]');
    assert(frame() === 2 && $('.visual-scene').innerHTML === scene, `${id}: notation changes preserve the visual example`);
    click('[data-notation="diagram"]');
    window.course.hub(); window.course.open(id);
    assert(frame() === 2, `${id}: guide position survives leaving and reopening`);
    assert(!progress.isDone(id), `${id}: watching never completes an assessment`);
    click('[data-restart]'); assert(frame() === 0, `${id}: restart clears the guide position`);
  }
  window.course.open('diagnostic'); assert(!$('.visual-guide'), 'diagnostic has no answer hints');

  // Real playback, pause, speed, single-step and end-stop behavior.
  window.course.open('recombination');
  const speed = $('[data-visual-speed]'); speed.value = '1000'; speed.dispatchEvent(new Event('change'));
  click('[data-visual-play]'); assert($('[data-visual-play]').textContent === 'Pause animation', 'play enters a running state');
  await sleep(1150); assert(frame() === 1, 'play actually advances the animation');
  click('[data-visual-play]'); const paused = frame(); await sleep(1150); assert(frame() === paused, 'pause stops advancement');
  click('[data-visual-next]'); assert(frame() === 2, 'manual next works');
  click('[data-visual-back]'); assert(frame() === 1, 'manual previous works');
  goto(2); click('[data-visual-play]'); await sleep(2200);
  assert(frame() === 3 && $('[data-visual-play]').textContent === 'Play animation', 'play stops at the final stage');
  click('[data-visual-replay]'); assert($('[data-visual-play]').textContent === 'Pause animation', 'Replay starts again'); $('.visual-guide').open = false;
  await sleep(1150); assert(frame() === 0 && $('[data-visual-play]').textContent === 'Play animation', 'closing a guide stops playback');
  window.course.hub(); window.course.open('recombination');
  assert($('[data-visual-speed]').value === '1000', 'preferred speed is restored');

  // Visual guides point to the real task without choosing or checking answers.
  window.course.open('threepoint'); window.course.current.goTo(2);
  assert(!$('.visual-guide').open, 'practice keeps its own visual task central');
  const before = JSON.stringify(progress.get().drafts.threepoint.state[2]);
  click('[data-guide-target=".mapping-counts"]');
  assert($('.mapping-counts').classList.contains('guide-highlight') && document.activeElement === $('.mapping-counts'), 'activity guide highlights and focuses the chromosome table');
  assert(JSON.stringify(progress.get().drafts.threepoint.state[2]) === before && $('[data-next]').disabled, 'activity guide leaves the answers untouched');
  for (const button of document.querySelectorAll('[data-guide-target]')) assert(document.querySelector(button.dataset.guideTarget), 'each guide points to an existing control or prerequisite');
  window.course.hub();
  await sleep(1100);
  assert(!$('.visual-scene'), 'leaving a lesson cleans up playback');

  // Leave a visual lesson on screen.
  window.course.open('recombination'); goto(1);
  $('.visual-guide').scrollIntoView({ block: 'start' });
  assert(document.documentElement.scrollWidth <= innerWidth, 'visual guide fits the supported window');
  return `PASS: ${Object.keys(VISUAL_GUIDES).length} visual guides / 44 scenes; playback, pause, speed, single-step, replay, persistence, notation, assessment isolation and activity highlighting`;
})();
