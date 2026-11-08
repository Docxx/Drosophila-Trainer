// Run with: npx electron . --snapshot=tmp/course.png --snapshot-js=tools/review-course.js
// Plays every lesson, the quick check, one planner puzzle and the guided tour
// through the real controls, as a learner would. Uses the isolated snapshot profile.
(async () => {
  const assert = (c, m) => { if (!c) throw new Error(m); };
  const L = await import('app://fly/src/js/lessons.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const click = (s) => { const b = typeof s === 'string' ? $(s) : s; assert(b && !b.disabled, `Missing/disabled: ${s}`); b.click(); };
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  localStorage.removeItem('fly-trainer.progress.v1');

  async function solve(step) {
    if (step.type === 'choice') {
      const i = step.options.findIndex((o) => o.correct);
      if (step.options.length > 1 && !step.area) { click(`[data-option="${(i + 1) % step.options.length}"]`); assert($('.feedback.wrong'), 'wrong answer explained'); assert($('[data-next], [data-finish]').disabled, 'Next waits for a right answer'); }
      click(`[data-option="${i}"]`);
    } else if (step.type === 'gametes') {
      const want = L.gametesFor(step.parent, step.chroms);
      click('[data-all-found]'); assert($('.feedback.wrong'), 'premature "all found" is challenged');
      for (const { gamete } of want) {
        const g = step.parent.split(';').map((s) => s.trim().split('/'));
        const order = { X: 0, 2: 1, 3: 2 };
        let crossover = false;
        for (const c of step.chroms) {
          let idx = g[order[c]].indexOf(gamete[c]);
          if (idx < 0) { crossover = true; idx = L.crossoverKey(step.parent, c, 0) === gamete[c] ? 0 : 1; }
          click(`.hom[data-chrom="${c}"][data-index="${idx}"]`);
        }
        const box = $('[data-crossover]');
        if (box && box.checked !== crossover) { box.checked = crossover; box.dispatchEvent(new Event('change')); }
        // Selection is cleared when the crossover switch changes: reselect.
        for (const c of step.chroms) if (!$(`.hom.on[data-chrom="${c}"]`)) {
          const idx = g[order[c]].indexOf(gamete[c]);
          click(`.hom[data-chrom="${c}"][data-index="${idx < 0 ? (L.crossoverKey(step.parent, c, 0) === gamete[c] ? 0 : 1) : idx}"]`);
        }
        click('[data-make]');
      }
      assert($$('.found li').length === want.length, `${step.title}: ${want.length} gametes found`);
    } else if (step.type === 'predict') {
      const { rows } = L.classesFor(step.mother, step.father, { traits: step.traits, bySex: step.bySex });
      click('[data-hint]'); assert($('.punnett'), 'squares drawn on request');
      for (const b of $$('.predict tbody tr')) {
        const label = b.querySelector('td').textContent;
        const p = rows.find((r) => r.label === label)?.p || 0;
        click(b.querySelector(`[data-frac="${L.FRACTIONS.find((f) => near(f.value, p)).label}"]`));
      }
      click('[data-check]');
      assert($('.punnett') && $('[data-next], [data-finish]') && !$('[data-next], [data-finish]').disabled, `${step.title}: correct prediction accepted`);
    } else if (step.type === 'pick') {
      const { rows } = L.classesFor(step.mother, step.father, { traits: step.traits });
      click(`[data-class="${rows.findIndex((r) => L.classMatches(r, step.target))}"]`);
      assert($('.feedback.right'), `${step.title}: right class confirmed`);
    }
  }

  async function play(id, stopAt = Infinity) {
    window.course.open(id);
    const steps = L.LESSON_CONTENT[id].steps;
    for (let i = 0; i < steps.length && i < stopAt; i++) {
      assert($('.lesson'), `${id} step ${i}: no lesson on screen (${document.body.dataset.view}, ${document.getElementById('desk-stage').textContent.slice(0, 80)})`);
      assert($('.lesson').dataset.stepType === steps[i].type, `${id} step ${i} renders`);
      await solve(steps[i]);
      if (i === steps.length - 1) { if (steps[i].type !== 'go') click('[data-finish]'); }
      else click('[data-next]');
    }
  }

  for (const id of ['inheritance', 'xlinked', 'balancers']) {
    await play(id, L.LESSON_CONTENT[id].steps.length - (L.LESSON_CONTENT[id].steps.at(-1).type === 'go' ? 1 : 0));
    if (L.LESSON_CONTENT[id].steps.at(-1).type === 'go') {
      click('[data-go]'); await sleep(100);
      window.course.hub();
    }
    assert(progress.isDone(id), `${id} completed`);
  }
  // Quick check: answer everything right; it recommends the planner.
  await play('diagnostic', 4);
  await solve(L.LESSON_CONTENT.diagnostic.steps[4]);
  assert($('[data-start="planner"]'), 'quick check recommends a start');

  // Notation switch re-renders genotypes in place.
  window.course.open('inheritance'); click('[data-next]');
  click('[data-notation="notation"]'); assert($('.lesson .notation') && !$('.lesson .hom'), 'notation only');
  click('[data-notation="both"]'); assert($('.lesson .notation') && $('.lesson .hom'), 'both');
  click('[data-notation="diagram"]');

  // Planner: puzzle 1 through the UI.
  window.course.open('planner');
  click('[data-puzzle="0"]');
  click('[data-f="s0"]'); click('[data-m="s1"]'); click('[data-cross]');
  const rowIdx = $$('.classes tbody tr').findIndex((tr) => /Curly/.test(tr.textContent) && !/Scutoid/.test(tr.textContent));
  click($$('[data-keep]')[rowIdx]);
  click($$('[data-declare]').at(-1));
  assert($('.bench-panel .feedback.right'), 'planner declares success');
  assert(progress.get().puzzles['cross-1'] === 1, 'puzzle result saved');

  // Guided tour: "Show me" on each step until it hands over to Virgin collection.
  window.course.open('tour');
  const deadline = Date.now() + 40000;
  while (!$('.coach')) { assert(Date.now() < deadline, 'tour starts'); await sleep(100); }
  click('.coach [data-next]');
  for (let n = 1; n < 8; n++) {
    const before = window.course.tour.step;
    click('.coach [data-show]');
    const t0 = Date.now();
    while (window.course.tour?.step === before) { assert(Date.now() - t0 < 5000, `tour step ${before + 1} completes after Show me`); await sleep(100); }
  }
  click('.coach [data-next]');
  assert(progress.isDone('tour'), 'tour completed');
  await sleep(200);
  assert(document.body.dataset.view === 'scope' && window.scope.mode === 'exercise', 'tour hands over to Virgin collection');
  while (!window.scope.ready) await sleep(100);

  // Leave the Curly × Curly reveal on screen for visual review.
  await play('inheritance', 6);
  await solve(L.LESSON_CONTENT.inheritance.steps[6]);
  return `PASS: 3 lessons, quick check, notation switch, planner puzzle 1, 9-step tour; done = ${progress.get().done.join(', ')}`;
})();
