// Run in the isolated Electron snapshot profile.
(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const { VISUAL_GUIDES, guideScene } = await import('app://fly/src/js/lessonVisuals.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const { LESSON_CONTENT } = await import('app://fly/src/js/lessons.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const click = (s) => { const b = $(s); assert(b && !b.disabled, `Missing visual control: ${s}`); b.click(); };
  const frame = () => Number($('[data-visual-frame][aria-current="step"]').dataset.visualFrame);
  const goto = (n) => click(`[data-visual-frame="${n}"]`);
  progress.reset();
  for (const [guideId, guide] of Object.entries(VISUAL_GUIDES)) {
    const location = Object.entries(LESSON_CONTENT).flatMap(([id, lesson]) => lesson.steps.map((step, i) => ({ id, step, i })))
      .find(({ id, step }) => (step.visual || id) === guideId && !['choice','multi','pick','go','worked','mission'].includes(step.type));
    assert(location, `${guideId}: guide is connected to an actual teaching step`);
    const { id, i: stepIndex } = location;
    window.course.open(id); click('[data-restart]'); window.course.current.goTo(stepIndex);
    assert($('.visual-guide').open, `${guideId}: explanation opens visually`);
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
    assert(window.course.current.step === stepIndex, `${id}: correct lesson step resumes`);
    assert(frame() === 2, `${id}: guide position survives leaving and reopening`);
    assert(!progress.isDone(id), `${id}: watching never completes an assessment`);
    click('[data-restart]'); assert(frame() === 0, `${id}: restart clears the guide position`);
  }
  window.course.open('diagnostic'); assert(!$('.visual-guide'), 'diagnostic has no answer hints');

  window.course.open('inheritance'); click('[data-restart]'); goto(3);
  window.course.current.goTo(1); assert(frame() === 0, 'dominance does not inherit the chromosome-primer stage'); goto(1);
  window.course.current.goTo(0); assert(frame() === 3, 'chromosome-primer position is kept separately');
  window.course.hub(); window.course.open('inheritance');
  assert(frame() === 3, 'beginner concept position survives reopening');
  click('[data-restart]'); assert(frame() === 0, 'restart clears all beginner concept positions');

  // Real playback, pause, speed, single-step and end-stop behavior.
  window.course.open('recombination'); click('[data-restart]');
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
  window.course.open('threepoint'); window.course.current.goTo(LESSON_CONTENT.threepoint.steps.findIndex(s=>s.type==='threepoint'));
  assert(!$('.visual-guide').open, 'practice keeps its own visual task central');
  const before = JSON.stringify(progress.get().drafts.threepoint.state[window.course.current.step]);
  click('[data-guide-target=".mapping-counts"]');
  assert($('.mapping-counts').classList.contains('guide-highlight') && document.activeElement === $('.mapping-counts'), 'activity guide highlights and focuses the chromosome table');
  assert(JSON.stringify(progress.get().drafts.threepoint.state[window.course.current.step]) === before && $('[data-next]').disabled, 'activity guide leaves the answers untouched');
  for (const button of document.querySelectorAll('[data-guide-target]')) assert(document.querySelector(button.dataset.guideTarget), 'each guide points to an existing control or prerequisite');
  window.course.hub();
  await sleep(1100);
  assert(!$('.visual-scene'), 'leaving a lesson cleans up playback');

  // Leave a visual lesson on screen.
  window.course.open('recombination'); goto(1);
  $('.visual-guide').scrollIntoView({ block: 'start' });
  assert(document.documentElement.scrollWidth <= innerWidth, 'visual guide fits the supported window');
  return `PASS: ${Object.keys(VISUAL_GUIDES).length} visual guides / ${Object.values(VISUAL_GUIDES).reduce((n, g) => n + g.frames.length, 0)} scenes; playback, pause, speed, single-step, replay, persistence, notation, assessment isolation and activity highlighting`;
})();
