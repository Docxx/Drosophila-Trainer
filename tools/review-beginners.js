// Focused beginner QA, using the actual lessons and their controls.
(async () => {
  const { LESSON_CONTENT } = await import('app://fly/src/js/lessons.js');
  const { VISUAL_GUIDES } = await import('app://fly/src/js/lessonVisuals.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const $ = (selector) => document.querySelector(selector);
  const click = (selector) => { const b = $(selector); assert(b && !b.disabled, `Missing beginner control ${selector}`); b.click(); };
  progress.reset();
  let checked = 0;
  for (const id of ['inheritance', 'xlinked', 'balancers']) {
    window.course.open(id);
    for (let i = 0; i < LESSON_CONTENT[id].steps.length; i++) {
      const step = LESSON_CONTENT[id].steps[i];
      if (!step.visual) continue;
      window.course.current.goTo(i);
      assert($('.visual-guide summary strong').textContent === VISUAL_GUIDES[step.visual].title, `${id}/${step.title}: specific concept`);
      assert($('.visual-guide').open === !['choice','multi','pick','go'].includes(step.type), `${id}: teaching visible, quiz optional`);
      for (let frame = 0; frame < 4; frame++) {
        click(`[data-visual-frame="${frame}"]`);
        assert($('[data-guide-caption]').textContent === VISUAL_GUIDES[step.visual].frames[frame][1], `${id}/${i}: stage caption`);
      }
      assert(!progress.isDone(id), 'viewing the primer does not complete the lesson');
      checked++;
    }
  }
  // A manual animation does not build a gamete or answer a prediction for the learner.
  window.course.open('inheritance'); click('[data-restart]'); window.course.current.goTo(3);
  click('[data-visual-frame="3"]');
  assert($('.found li') === null && $('[data-next]').disabled, 'gametes must still be constructed');
  window.course.current.goTo(4); click('[data-visual-frame="3"]');
  assert(!$('.fractions .on') && $('[data-next]').disabled, 'predictions are left unanswered');
  // Leave the basic chromosome primer on screen for visual review.
  click('[data-restart]'); click('[data-visual-frame="1"]');
  $('.visual-guide').scrollIntoView({ block: 'start' });
  assert(document.documentElement.scrollWidth <= innerWidth, 'beginner primer fits the minimum window');
  return `PASS: ${checked} step-specific beginner guides; all stages, visible teaching, separate quiz support, manual gametes and predictions`;
})();
