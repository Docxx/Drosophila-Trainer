// Run with: npx electron . --snapshot=tmp/course.png --snapshot-js=tools/review-course.js
// Plays every lesson, the quick check, one planner puzzle and the guided tour
// through the real controls, as a learner would. Uses the isolated snapshot profile.
(async () => {
  const assert = (c, m) => {
    if (!c) throw new Error(m);
  };
  const L = await import('app://fly/src/js/lessons.js');
  const { progress } = await import('app://fly/src/js/course.js');
  const { PlannerSession } = await import('app://fly/src/js/plannerSession.js');
  const { PUZZLES } = await import('app://fly/src/js/genetics/puzzles.js');
  const R = await import('app://fly/src/js/research.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const click = (s) => {
    const b = typeof s === 'string' ? $(s) : s;
    assert(b && !b.disabled, `Missing/disabled: ${s}; lesson ${$('.lesson-head')?.textContent}; step ${window.course.current?.step}`);
    b.click();
  };
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  const indexOf = (id, type) => L.LESSON_CONTENT[id].steps.findIndex((s) => s.type === type);
  const stepOf = (id, type) => L.LESSON_CONTENT[id].steps[indexOf(id, type)];
  progress.reset();

  async function solve(step) {
    for (const button of $$('[data-guide-target]')) {
      assert($(button.dataset.guideTarget), `${step.type}: visual guide has an actual target`);
      click(button);
      assert($('.guide-highlight'), `${step.type}: visual activity guide highlights its target`);
    }
    if (step.type === 'reflection') {
      const note = $('[data-learning-note="hypothesis"]');
      note.value = 'A timed knockdown affects the assay only after protein depletion.';
      note.dispatchEvent(new Event('input'));
      window.course.hub();
      window.course.open('research-project');
      assert(
        $('[data-learning-note="hypothesis"]').value.includes('timed knockdown'),
        'research argument persists separately from quiz answers',
      );
    } else if (step.type === 'worked') {
      assert($('.worked-scene') && $('[data-next]').disabled, 'demonstration is not a preanswered quiz; all stages remain to view');
      for (let phase = 1; phase < 4; phase++) click(`[data-visual-frame="${phase}"]`);
      assert(
        !$('[data-next]').disabled && $('[data-guide-caption]').textContent === step.pages[3],
        'worked model reaches the explained conclusion',
      );
    } else if (step.type === 'mission') {
      const model = new PlannerSession(PUZZLES[step.puzzle]);
      const keep = (c, want) =>
        model.keep(
          c.id,
          c.classes.findIndex((r) => Object.entries(want).every(([k, v]) => r.pheno[k] === v)),
        );
      let target;
      if (step.puzzle === 3) {
        const a = keep(model.cross('s0', 's2'), { curly: false, scutoid: true, humeral: true, stubble: false });
        const b = keep(model.cross('s1', 's2'), { curly: true, scutoid: false, humeral: false, stubble: true });
        target = keep(model.cross(a.id, b.id), { curly: true, scutoid: false, humeral: true, stubble: false, eye: 'orange' });
      } else {
        const trans = keep(model.cross('s1', 's2'), { eye: 'darkorange' });
        const reporter = keep(model.cross('s0', 's3'), { curly: false, scutoid: true, humeral: true, stubble: false });
        const recombinant = keep(model.cross(trans.id, 's3'), {
          curly: true,
          scutoid: false,
          humeral: true,
          stubble: false,
          eye: 'darkorange',
        });
        target = keep(model.cross(recombinant.id, reporter.id), {
          curly: true,
          scutoid: false,
          humeral: true,
          stubble: false,
          eye: 'darkorange',
        });
      }
      assert(model.declare(target.id).ok, 'reference construction works');
      let n = 0;
      for (const action of model.actions) {
        if (action.method === 'cross') {
          for (const [sex, id] of [
            ['f', action.args[0]],
            ['m', action.args[1]],
          ])
            if (!$(`[data-${sex}="${id}"]`).classList.contains('on')) click(`[data-${sex}="${id}"]`);
          click('[data-cross]');
        } else if (action.method === 'keep') click(`[data-keep="${action.args[0]}:${action.args[1]}"]`);
        else if (action.method === 'declare') click(`[data-declare="${action.args[0]}"]`);
        if (++n === 2) {
          const id = step.puzzle === 3 ? 'investigation' : 'research-project';
          const before = $('.vials').textContent;
          window.course.hub();
          window.course.open(id);
          assert($('.vials').textContent === before, 'multi-generation mission restores its chosen classes');
        }
      }
      assert(!$('[data-next]').disabled && !$('[data-mission]'), 'only a constructed target unlocks the mission');
    } else if (step.type === 'choice') {
      const i = step.options.findIndex((o) => o.correct);
      if (step.options.length > 1 && !step.area) {
        click(`[data-option="${(i + 1) % step.options.length}"]`);
        assert($('.feedback.wrong'), 'wrong answer explained');
        assert($('[data-next], [data-finish]').disabled, 'Next waits for a right answer');
      }
      click(`[data-option="${i}"]`);
    } else if (step.type === 'gametes') {
      const want = L.gametesFor(step.parent, step.chroms);
      click('[data-all-found]');
      assert($('.feedback.wrong'), 'premature "all found" is challenged');
      for (const { gamete } of want) {
        const g = step.parent.split(';').map((s) => s.trim().split('/'));
        const order = { X: 0, 2: 1, 3: 2 };
        let crossover = false;
        for (const c of step.chroms) {
          let idx = g[order[c]].indexOf(gamete[c]);
          if (idx < 0) {
            crossover = true;
            idx = L.crossoverKey(step.parent, c, 0) === gamete[c] ? 0 : 1;
          }
          click(`.hom[data-chrom="${c}"][data-index="${idx}"]`);
        }
        const box = $('[data-crossover]');
        if (box && box.checked !== crossover) {
          box.checked = crossover;
          box.dispatchEvent(new Event('change'));
        }
        // Selection is cleared when the crossover switch changes: reselect.
        for (const c of step.chroms)
          if (!$(`.hom.on[data-chrom="${c}"]`)) {
            const idx = g[order[c]].indexOf(gamete[c]);
            click(`.hom[data-chrom="${c}"][data-index="${idx < 0 ? (L.crossoverKey(step.parent, c, 0) === gamete[c] ? 0 : 1) : idx}"]`);
          }
        click('[data-make]');
      }
      assert($$('.found li').length === want.length, `${step.title}: ${want.length} gametes found`);
    } else if (step.type === 'predict') {
      const { rows } = L.classesFor(step.mother, step.father, { traits: step.traits, bySex: step.bySex });
      click('[data-hint]');
      assert($('.punnett'), 'squares drawn on request');
      for (const b of $$('.predict tbody tr')) {
        const label = b.querySelector('td').textContent;
        const p = rows.find((r) => r.label === label)?.p || 0;
        click(b.querySelector(`[data-frac="${L.FRACTIONS.find((f) => near(f.value, p)).label}"]`));
      }
      click('[data-check]');
      assert(
        $('.punnett') && $('[data-next], [data-finish]') && !$('[data-next], [data-finish]').disabled,
        `${step.title}: correct prediction accepted`,
      );
    } else if (step.type === 'pick') {
      const { rows } = L.classesFor(step.mother, step.father, { traits: step.traits });
      click(`[data-class="${rows.findIndex((r) => L.classMatches(r, step.target))}"]`);
      assert($('.feedback.right'), `${step.title}: right class confirmed`);
    } else if (step.type === 'multi') {
      const wrong = step.options.findIndex((o) => !o.correct);
      if (wrong >= 0) {
        click(`[data-multi="${wrong}"]`);
        click('[data-check]');
        assert($('.feedback.wrong'), `${step.question}: wrong selection challenged`);
        click(`[data-multi="${wrong}"]`);
      }
      step.options.forEach((o, i) => {
        if (o.correct) click(`[data-multi="${i}"]`);
      });
      click('[data-check]');
    } else if (step.type === 'count') {
      const { rows } = L.classesFor(step.mother, step.father, { traits: step.traits });
      const answer = step.answer(L.sampleCounts(rows, step.n, L.rng(step.seed)));
      const input = $('[data-answer]');
      input.value = String(answer + step.tolerance * 3);
      input.dispatchEvent(new Event('input'));
      click('[data-check]');
      assert($('.feedback.wrong'), 'a wrong estimate gets a hint');
      const again = $('[data-answer]');
      again.value = answer.toFixed(1);
      again.dispatchEvent(new Event('input'));
      click('[data-check]');
    } else if (step.type === 'chance') {
      for (const n of step.sizes) for (let k = 0; k < step.need; k++) click(`[data-draw="${n}"]`);
      assert($$('.strip i').length === step.sizes.length * step.need, 'one dot per counted vial');
    } else if (step.type === 'chisq') {
      step.hypotheses.forEach((h, i) => {
        click(`[data-h="${i}"]`);
        const fits = L.chiSquare(
          step.observed.map((o) => o.n),
          h.shares,
        ).fits;
        click(`[data-judge="${fits ? 'reject' : 'fits'}"]`);
        assert($('.feedback.wrong'), 'a wrong verdict is explained');
        click(`[data-judge="${fits ? 'fits' : 'reject'}"]`);
      });
    } else if (step.type === 'threepoint') {
      const draft = progress.get().drafts.threepoint;
      const caseSeed = draft?.state[draft.index]?.caseSeed;
      if (caseSeed !== undefined) step = R.threePointPractice(step, caseSeed);
      const data = R.threePointData(step);
      assert(!$('[data-map-value]'), 'interval names stay hidden until order is inferred');
      click('[data-check-order]');
      assert($('.feedback.wrong') && $('[data-next]').disabled, 'incomplete chromosome classification is challenged');
      for (const i of data.parental) click(`[data-map-row="${i}"][data-map-kind="parental"]`);
      for (const i of data.dco) click(`[data-map-row="${i}"][data-map-kind="dco"]`);
      const middle = $('[data-middle]');
      middle.value = data.middle;
      middle.dispatchEvent(new Event('change'));
      click('[data-check-order]');
      assert($('[data-map-value="d1"]'), 'interval calculations unlock after correct chromosome order');
      for (const [interval, kind] of [
        [1, 'I'],
        [2, 'II'],
      ]) {
        data.counts.forEach((row, i) => {
          if (row.kind === kind || row.kind === 'D') {
            const input = $(`[data-interval="${interval}"][data-interval-row="${i}"]`);
            input.checked = true;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
      assert($$('.changed-allele').length === 2, 'chromosome comparison highlights just the middle locus');
      const enter = (key, value) => {
        const input = $(`[data-map-value="${key}"]`);
        input.value = value;
        input.dispatchEvent(new Event('input'));
      };
      enter('d1', '0');
      enter('d2', '0');
      enter('coc', '0');
      click('[data-check-map]');
      assert($('.feedback.wrong') && $('[data-next]').disabled, 'wrong map calculations are explained');
      enter('d1', data.d1.toFixed(2));
      enter('d2', data.d2.toFixed(2));
      enter('coc', data.coc.toFixed(3));
      click('[data-check-map]');
      assert(!$('[data-next]').disabled && /interference/.test($('.lesson-body').textContent), 'sampled map and interference accepted');
      const table = $('.mapping-counts').textContent;
      click('[data-notation="notation"]');
      assert($('.research-diagram .notation') && !$('.research-hom'), 'research notation display applies');
      click('[data-notation="both"]');
      assert($('.research-diagram .notation') && $('.research-hom'), 'research diagrams and notation coexist');
      click('[data-notation="diagram"]');
      click('[data-back]');
      click('[data-next]');
      assert($('.mapping-counts').textContent === table && !$('[data-next]').disabled, 'Back preserves counts, assignments and completion');
    } else if (step.type === 'clones') {
      const prediction = $('[data-clone-prediction]');
      prediction.value = 'larger';
      prediction.dispatchEvent(new Event('change'));
      click('[data-clone-run]');
      assert($('.feedback.wrong') && $('[data-next]').disabled, 'unsuitable induction is challenged');
      const plan = R.SHOCK_TIMES.flatMap((t) =>
        R.SHOCK_LENGTHS.map((l) => ({
          round: t.round,
          minutes: l.minutes,
          result: R.cloneCohort({ round: t.round, p: l.p, seed: step.seed, goal: step.goal }),
        })),
      ).find((p) => p.result.met >= 4);
      const round = $('[data-clone-round]');
      round.value = plan.round;
      round.dispatchEvent(new Event('change'));
      const length = $('[data-clone-length]');
      length.value = plan.minutes;
      length.dispatchEvent(new Event('change'));
      click('[data-clone-run]');
      assert(
        $('.clone-view svg rect') && !$('[data-next]').disabled && !$('.goal-checks .unmet'),
        'disc and checks agree with a feasible model plan',
      );
      assert($$('.clone-replicates tbody tr').length === 8, 'eight independent discs displayed');
      const disc = $('.clone-view svg').outerHTML;
      window.course.hub();
      window.course.open('mosaics');
      assert(
        $('.clone-view svg').outerHTML === disc && !$('[data-next]').disabled,
        'saved induction reconstructs independent discs and completion',
      );
      click('[data-notation="both"]');
      assert($('.clone-view svg').outerHTML === disc, 'notation changes do not reroll the tissue');
      click('[data-notation="diagram"]');
      const changed = $('[data-clone-round]');
      changed.value = R.SHOCK_TIMES[3].round;
      changed.dispatchEvent(new Event('change'));
      assert($('[data-next]').disabled && !$('.clone-view'), 'changing induction clears old result and completion');
      click('[data-clone-example]');
      assert(!$('[data-next]').disabled, 'working-plan support uses an achievable model setting');
    } else if (step.type === 'target') {
      click('[data-target-run]');
      assert($('.feedback.wrong') && $('[data-next]').disabled, 'uninduced target fails the knockdown objective');
      const plan = Array.from({ length: 64 }, (_, bits) =>
        Object.fromEntries(R.STAGES.map((st, i) => [st.id, bits & (1 << i) ? 29 : 18])),
      ).find((temps) => R.targetChecks(R.simulateTarget(temps), step.goal).every((c) => c.ok));
      for (const [stage, temp] of Object.entries(plan)) {
        const select = $(`[data-temp="${stage}"]`);
        select.value = temp;
        select.dispatchEvent(new Event('change'));
      }
      click('[data-target-run]');
      assert(
        $('.target-plot polyline') && !$('.goal-checks .unmet') && !$('[data-next]').disabled,
        'schedule plot and stage windows are checked',
      );
      assert($('.checked-window') && $('.target-threshold'), 'assessed windows and thresholds visible');
      const plot = $('.target-plot').outerHTML;
      window.course.hub();
      window.course.open('target');
      assert($('.target-plot').outerHTML === plot && !$('[data-next]').disabled, 'saved schedule reconstructs the time course and result');
      click('[data-notation="both"]');
      assert($('.target-plot').outerHTML === plot, 'notation preserves the simulated time course');
      click('[data-notation="diagram"]');
      const select = $('[data-temp="adult"]');
      select.value = plan.adult === 18 ? 29 : 18;
      select.dispatchEvent(new Event('change'));
      assert($('[data-next]').disabled && !$('.target-plot'), 'changed schedule cannot retain stale completion');
      click('[data-target-example]');
      assert(!$('[data-next]').disabled, 'working schedule satisfies the pure model checks');
    } else if (step.type === 'screen') {
      click('[data-screen-run]');
      assert($('.feedback.wrong') && $('[data-next]').disabled, 'high-complexity screen is challenged');
      const input = $('[data-lines]');
      input.value = '';
      input.dispatchEvent(new Event('input'));
      click('[data-screen-run]');
      assert($('.feedback.wrong') && !$('.screen-stats'), 'blank line count is not treated as a valid screen');
      const plan = R.DOSES.map((d) => ({
        dose: d.mM,
        n: Math.ceil(Math.log(1 - step.goal.minHit) / Math.log(1 - d.lambda * R.PER_GENE)),
      })).find((p) => R.screenChecks(p.dose, p.n, step.goal).every((c) => c.ok));
      const dose = $('[data-dose]');
      dose.value = plan.dose;
      dose.dispatchEvent(new Event('change'));
      const lines = $('[data-lines]');
      lines.value = plan.n;
      lines.dispatchEvent(new Event('input'));
      click('[data-screen-run]');
      assert(
        $('.screen-stats') && !$('.goal-checks .unmet') && !$('[data-next]').disabled,
        'screen coverage, complexity and capacity all met',
      );
      const stats = $('.screen-stats').textContent;
      window.course.hub();
      window.course.open('screens');
      assert($('.screen-stats').textContent === stats && !$('[data-next]').disabled, 'saved screen plan reconstructs its statistics');
      assert($('.screen-plot polyline') && $$('.screen-comparison tbody tr').length === 3, 'coverage curves and workload comparison');
      const changed = $('[data-lines]');
      changed.value = step.goal.maxLines + 1;
      changed.dispatchEvent(new Event('input'));
      assert($('[data-next]').disabled && !$('.screen-stats'), 'editing screen capacity clears stale statistics');
      click('[data-screen-run]');
      assert($('.goal-checks .unmet') && $('[data-next]').disabled, 'over-capacity plan fails');
      click('[data-screen-example]');
      assert(!$('[data-next]').disabled, 'feasible-plan support meets all constraints');
    } else if (step.type === 'grid') {
      while ($('[data-cell]')) click('[data-cell]');
      step.rows.forEach((r, i) =>
        step.cols.forEach((c, j) => {
          const td = $$('.grid tbody tr')[i].querySelectorAll('td')[j];
          assert(td.classList.contains(L.complements(r, c) ? 'comp' : 'fail'), `${r} × ${c} shows the engine's result`);
        }),
      );
    }
    const next = $('[data-next], [data-finish]');
    if (step.type !== 'go' && !L.LESSON_CONTENT.diagnostic.steps.includes(step))
      assert(next && !next.disabled, `${step.title || step.question}: unlocked after solving`);
  }

  async function play(id, stopAt = Infinity) {
    window.course.open(id);
    const steps = L.LESSON_CONTENT[id].steps;
    for (let i = 0; i < steps.length && i < stopAt; i++) {
      assert(
        $('.lesson'),
        `${id} step ${i}: no lesson on screen (${document.body.dataset.view}, ${document.getElementById('desk-stage').textContent.slice(0, 80)})`,
      );
      assert($('.lesson').dataset.stepType === steps[i].type, `${id} step ${i} renders`);
      await solve(steps[i]);
      if (i === steps.length - 1) {
        if (steps[i].type !== 'go') click('[data-finish]');
      } else click('[data-next]');
    }
  }

  window.course.open('threepoint');
  window.course.current.goTo(indexOf('threepoint', 'threepoint'));
  click('[data-map-row="0"][data-map-kind="parental"]');
  const mid = $('[data-middle]');
  mid.value = 'cv';
  mid.dispatchEvent(new Event('change'));
  window.course.hub();
  window.course.open('threepoint');
  assert(
    window.course.current.step === indexOf('threepoint', 'threepoint') &&
      $('[data-map-row="0"][data-map-kind="parental"]').getAttribute('aria-pressed') === 'true' &&
      $('[data-middle]').value === 'cv',
    'unfinished lesson resumes step and unchecked answers',
  );
  click('[data-restart]');
  assert(window.course.current.step === 0, 'explicit restart begins again');

  for (const id of [
    'flyroom',
    'foundations',
    'inheritance',
    'xlinked',
    'notation',
    'balancers',
    'chance',
    'recombination',
    'gal4uas',
    'complementation',
    'threepoint',
    'mosaics',
    'target',
    'screens',
    'strategies',
    'transgenesis',
    'gal80',
    'geneswitch',
    'recombination-tools',
    'investigation',
    'research-project',
  ]) {
    await play(id, L.LESSON_CONTENT[id].steps.length - (L.LESSON_CONTENT[id].steps.at(-1).type === 'go' ? 1 : 0));
    if (L.LESSON_CONTENT[id].steps.at(-1).type === 'go') {
      click('[data-go]');
      await sleep(100);
      window.course.hub();
    }
    assert(progress.isDone(id), `${id} completed`);
  }
  assert(
    progress.get().results.mosaics.assisted && progress.get().results.target.assisted && progress.get().results.screens.assisted,
    'working plans are recorded as supported completion',
  );
  // Fresh mapping case transfers the method to a new phase and counts.
  window.course.open('threepoint');
  for (let i = 0; i < indexOf('threepoint', 'threepoint'); i++) {
    await solve(L.LESSON_CONTENT.threepoint.steps[i]);
    click('[data-next]');
  }
  click('[data-fresh-map]');
  await solve(stepOf('threepoint', 'threepoint'));
  window.course.hub();
  window.course.open('threepoint');
  assert(!$('[data-next]').disabled, 'fresh case resumes');
  for (let i = indexOf('threepoint', 'threepoint') + 1; i < L.LESSON_CONTENT.threepoint.steps.length; i++) {
    click('[data-next]');
    await solve(L.LESSON_CONTENT.threepoint.steps[i]);
  }
  click('[data-finish]');
  assert(progress.get().results.threepoint.independentPractice, 'independent fresh case recorded');

  // Quick check: answer everything right; it recommends the planner.
  await play('diagnostic', 5);
  await solve(L.LESSON_CONTENT.diagnostic.steps[5]);
  assert($('[data-start="recombination"]'), 'quick check recommends a start');

  // Notation switch re-renders genotypes in place.
  window.course.open('inheritance');
  click('[data-next]');
  click('[data-notation="notation"]');
  assert($('.lesson .notation') && !$('.lesson .hom'), 'notation only');
  click('[data-notation="both"]');
  assert($('.lesson .notation') && $('.lesson .hom'), 'both');
  click('[data-notation="diagram"]');

  // Planner: puzzle 1 through the UI.
  window.course.open('planner');
  click('[data-puzzle="0"]');
  click('[data-f="s0"]');
  click('[data-m="s1"]');
  click('[data-cross]');
  const rowIdx = $$('.classes tbody tr').findIndex((tr) => /Curly/.test(tr.textContent) && !/Scutoid/.test(tr.textContent));
  click($$('[data-keep]')[rowIdx]);
  click($$('[data-declare]').at(-1));
  assert($('.bench-panel .feedback.right'), 'planner declares success');
  assert(progress.get().puzzles['cross-1'] === 1, 'puzzle result saved');

  // Genetics bench: change a chromosome, count a vial, answer practice problems.
  window.course.open('sandbox');
  const sel = $('select[data-sex="M"][data-chrom="2"][data-slot="0"]');
  sel.value = '+';
  sel.dispatchEvent(new Event('change'));
  assert(/Curly wings/.test($('.classes').textContent) && $$('.classes tbody tr').length === 2, 'bench recomputes after a change');
  click('[data-count]');
  assert($$('.classes thead th').length === 3 && /χ²/.test($('.bench-panel').textContent), 'vial counted and tested');
  const bad = $('select[data-sex="F"][data-chrom="2"][data-slot="1"]');
  bad.value = 'CyO';
  bad.dispatchEvent(new Event('change'));
  assert($('.feedback.wrong'), 'a lethal parent is flagged');
  click('[data-tab="practice"]');
  for (let k = 0; k < 5; k++) {
    const q = window.course.current.problem;
    click(`[data-answer="${q.options.findIndex((o) => Math.abs(o.p - q.answer) < 1e-9)}"]`);
    assert($('.practice .feedback.right'), 'practice answer marked right');
    click('[data-next-problem]');
  }
  assert(progress.get().bestStreak >= 5, 'streak recorded');
  click('[data-level="2"]');
  click('[data-answer="0"]');
  click('[data-explore]');
  assert($('.parent-card') && $('.classes'), 'practice cross opens on the bench');

  // Guided tour: "Show me" on each step until it hands over to Virgin collection.
  window.course.open('tour');
  const deadline = Date.now() + 40000;
  while (!$('.coach')) {
    assert(Date.now() < deadline, 'tour starts');
    await sleep(100);
  }
  click('.coach [data-next]');
  for (let n = 1; n < 8; n++) {
    const before = window.course.tour.step;
    click('.coach [data-show]');
    const t0 = Date.now();
    while (window.course.tour?.step === before) {
      assert(Date.now() - t0 < 5000, `tour step ${before + 1} completes after Show me`);
      await sleep(100);
    }
  }
  click('.coach [data-next]');
  assert(progress.isDone('tour'), 'tour completed');
  await sleep(200);
  assert(document.body.dataset.view === 'scope' && window.scope.mode === 'exercise', 'tour hands over to Virgin collection');
  while (!window.scope.ready) await sleep(100);

  window.course.open('screens');
  window.course.current.goTo(indexOf('screens', 'screen'));
  click('[data-restart]');
  window.course.current.goTo(indexOf('screens', 'screen'));
  const draftLines = $('[data-lines]');
  draftLines.value = '4567';
  draftLines.dispatchEvent(new Event('input'));
  window.course.hub();
  window.course.open('screens');
  assert(
    window.course.current.step === indexOf('screens', 'screen') && $('[data-lines]').value === '4567',
    'unchecked screen input survives leaving and reopening',
  );

  // Leave a working temporal-control plot on screen for visual review.
  window.course.open('target');
  window.course.current.goTo(indexOf('target', 'target'));
  await solve(stepOf('target', 'target'));
  $('.target-plot').scrollIntoView({ block: 'center' });
  assert(document.documentElement.scrollWidth <= window.innerWidth, 'lesson fits the window without horizontal overflow');
  return `PASS: saved-step/input/model restoration, supported completion, fresh independent mapping; 21 taught lessons, 19 worked demonstrations, two multi-generation investigations, transgenesis and expression-control lessons, bench and practice, quick check, notation switch, planner puzzle 1, 9-step tour; done = ${progress.get().done.join(', ')}`;
})();
