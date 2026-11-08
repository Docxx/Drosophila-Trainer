// Review the new teaching through the real lesson UI, including narrow windows.
(async () => {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const { LESSON_CONTENT } = await import('app://fly/src/js/lessons.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const { MOLECULAR_LESSONS } = await import('app://fly/src/js/molecularLessons.js');
  const $ = (s) => document.querySelector(s);
  const click = (s) => {
    const b = $(s);
    assert(b && !b.disabled, `Missing or disabled: ${s}`);
    b.click();
  };
  progress.reset();
  let scenes = 0;
  for (const id of Object.keys(MOLECULAR_LESSONS)) {
    window.course.open(id);
    click('[data-restart]');
    assert($('.lesson-glossary dt') && $('.lesson-orientation'), `${id}: objectives and terms visible`);
    assert($('.visual-guide').open, `${id}: visual explanation leads teaching`);
    for (let frame = 0; frame < 4; frame++) {
      click(`[data-visual-frame="${frame}"]`);
      assert($('[data-guide-caption]').textContent.length > 40, `${id}: explanatory caption`);
      for (const node of document.querySelectorAll('.visual-scene text')) {
        const box = node.getBBox();
        assert(
          box.x >= 0 && box.x + box.width <= 900 && box.y >= 0 && box.y + box.height <= 340,
          `${id}, frame ${frame}: label fits viewBox: ${node.textContent}`,
        );
      }
      assert(document.documentElement.scrollWidth <= window.innerWidth, `${id}: no horizontal overflow`);
      scenes++;
    }
    const demoIndex = LESSON_CONTENT[id].steps.findIndex((s) => s.type === 'worked');
    window.course.current.goTo(demoIndex);
    assert($('[data-next]').disabled, `${id}: explanation must be viewed before continuing`);
    for (const frame of [1, 2, 3]) click(`[data-visual-frame="${frame}"]`);
    assert(!$('[data-next]').disabled, `${id}: worked example can be completed`);
    window.course.hub();
    window.course.open(id);
    assert(window.course.current.step === demoIndex, `${id}: draft step survives reopening`);
    assert($('[data-guide-caption]').textContent === LESSON_CONTENT[id].steps[demoIndex].pages[3], `${id}: explanation restores`);
  }
  window.course.open('geneswitch');
  const demo = LESSON_CONTENT.geneswitch.steps.findIndex((s) => s.type === 'worked');
  window.course.current.goTo(demo);
  click('[data-visual-frame="1"]');
  $('.worked-scene').scrollIntoView({ block: 'center' });
  return `PASS: four complete molecular lessons; ${scenes} labelled scenes fit; objectives, glossary, worked teaching and draft restoration`;
})();
