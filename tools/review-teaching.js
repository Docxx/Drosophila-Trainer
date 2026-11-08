// Read the teaching as a learner would, separately from solving exercises.
(async () => {
  const assert = (c, m) => {
    if (!c) throw new Error(m);
  };
  const { LESSON_CONTENT } = await import('app://fly/src/js/lessons.js');
  const { DEMONSTRATIONS, PATH } = await import('app://fly/src/js/curriculum.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const $ = (s) => document.querySelector(s),
    click = (s) => {
      const b = $(s);
      assert(b && !b.disabled, `Missing teaching control ${s}`);
      b.click();
    };
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  progress.reset();
  window.course.hub();
  assert(document.querySelectorAll('.path-stages > section').length === PATH.length, 'five visible learning stages');
  let count = 0;
  for (const [id, demo] of Object.entries(DEMONSTRATIONS)) {
    window.course.open(id);
    click('[data-restart]');
    assert($('.lesson-orientation[open]') && $('.lesson-glossary dt'), 'goals and definitions lead the module');
    const index = LESSON_CONTENT[id].steps.findIndex((s) => s.type === 'worked');
    window.course.current.goTo(index);
    assert($('.worked-scene') && $('[data-next]').disabled, 'worked content precedes an unlocked task');
    click('[data-visual-frame="3"]');
    assert($('[data-next]').disabled, 'jumping to the answer does not count as viewing the whole explanation');
    click('[data-visual-frame="1"]');
    const body = $('.worked-scene').textContent;
    window.course.hub();
    window.course.open(id);
    assert(
      window.course.current.step === index && $('.worked-scene').textContent === body,
      'unfinished teaching restores the stage and model evidence',
    );
    click('[data-visual-frame="2"]');
    click('[data-visual-frame="3"]');
    assert(
      !$('[data-next]').disabled && $('[data-guide-caption]').textContent === demo.pages[3],
      'all stages reach an explained conclusion',
    );
    assert(!progress.isDone(id), 'viewing does not complete the module');
    count++;
  }
  window.course.open('inheritance');
  click('[data-restart]');
  click('[data-start-activity]');
  assert($('.teaching-cycle [aria-current="step"]').textContent === 'Guided practice', 'experienced users can start the activity');
  assert($('.dots .skipped') && $('[data-next]').disabled, 'skipped teaching is recorded distinctly and an answer is still required');
  // An untrusted saved completion cannot replace the actual construction history.
  window.course.open('investigation');
  click('[data-restart]');
  const missionIndex = LESSON_CONTENT.investigation.steps.findIndex((s) => s.type === 'mission');
  window.course.current.goTo(missionIndex);
  const saved = progress.get();
  saved.drafts.investigation.state[missionIndex].done = true;
  saved.drafts.investigation.state[missionIndex].resultSummary = { generations: 2, hints: 0 };
  saved.drafts.investigation.state[missionIndex].plan = { puzzle: 'cross-4', actions: [] };
  localStorage.setItem('fly-trainer.progress.v1', JSON.stringify(saved));
  window.course.hub();
  window.course.open('investigation');
  assert($('[data-mission]') && $('[data-next]').disabled, 'mission completion is checked by replaying construction evidence');
  // Playback advances teaching pages as well as their captions.
  window.course.open('inheritance');
  click('[data-restart]');
  const i = LESSON_CONTENT.inheritance.steps.findIndex((s) => s.type === 'worked');
  window.course.current.goTo(i);
  const speed = $('[data-visual-speed]');
  speed.value = '1000';
  speed.dispatchEvent(new Event('change'));
  click('[data-visual-play]');
  await pause(1150);
  click('[data-visual-play]');
  assert(
    $('[data-visual-frame="1"]').getAttribute('aria-current') === 'step' && $('.worked-gametes'),
    'playback shows actual model gametes',
  );
  click('[data-visual-frame="2"]');
  $('.visual-guide').scrollIntoView({ block: 'start' });
  assert(document.documentElement.scrollWidth <= innerWidth, 'teaching fits the window');
  return `PASS: ${count} complete teaching demonstrations; goals, glossary, restore, gated stages, skip option, verified construction and live playback`;
})();
