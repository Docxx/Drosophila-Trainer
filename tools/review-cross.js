// Renderer integration checks. Snapshot mode uses an isolated learner profile.
(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const click = (selector) => {
    const button = document.querySelector(selector);
    assert(button && !button.disabled, `Missing/disabled control: ${selector}`);
    button.click();
  };
  const scope = window.scope;
  const ready = async () => {
    const deadline = Date.now() + 40000;
    while (!scope.ready) {
      if (scope.error) throw new Error(scope.error);
      if (Date.now() > deadline) throw new Error('Microscope did not become ready');
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  };
  const originalCollection = localStorage.getItem('fly-trainer.collection.v2');
  await scope.startActivity('cross');
  async function newBatch(scenario, { reclear = false } = {}) {
    document.getElementById('cross-scenario').value = scenario;
    click('[data-act="cross-new"]'); await ready();
    assert(scope.getSession().phase === 'collecting', 'New experiment must begin with parent collection');
    const reclearButton = document.querySelector('[data-act="cross-reclear"]');
    assert(reclearButton.hidden === (scenario !== 'uncertain'), 'Re-clear is offered only for an uncertain vial');
    if (reclear) {
      click('[data-act="cross-reclear"]'); await ready();
      assert(scope.getSession().recleared && reclearButton.hidden, 'Re-clear must start a new batch once');
      assert(document.getElementById('cross-source-title').textContent === 'Re-cleared vial', 'Source record must show the re-clear');
      assert(/8 hours/.test(document.getElementById('cross-progress').textContent), 'The time cost must be shown');
      assert(scope.specimens.every((s) => s.reference.stage !== 'mature'), 'A re-cleared vial holds only young flies');
    }
    assert(scope.specimens.every((s) => s.reference.eye === 'white'), 'Cross mission must use its own white-eyed stock');
    assert(!/female|male/.test(document.getElementById('specimens').textContent), 'Candidate roster must not reveal sex');
    const prediction = document.getElementById('cross-prediction');
    prediction.value = 'expected'; prediction.dispatchEvent(new Event('change'));
    for (let i = 0; i < scope.specimens.length; i++) {
      if (scope.specimens[i].reference.sex !== 'F') continue;
      click(`[data-specimen="${i}"]`); click('[data-transfer="collection"]');
    }
    assert(scope.getSession().report === null, 'No parent verdict before the cross');
    click('[data-act="cross-start"]'); await ready();
    assert(scope.specimens.length === 0 && scope.getSession().offspringCount === null, 'No visible offspring before development');
    click('[data-act="cross-advance"]'); await ready();
    assert(scope.getSession().day === 2 && scope.getSession().offspringCount === null, 'Parent-removal event must precede offspring');
    click('[data-act="cross-advance"]'); await ready();
    assert(scope.getSession().day === 12 && scope.specimens.length === 6, 'Six of twelve F1 flies must load');
    const observed = [];
    for (let page = 0; page < 2; page++) {
      for (let i = 0; i < scope.specimens.length; i++) {
        const fly = scope.specimens[i].reference;
        observed.push(`${fly.eye}-${fly.sex}`);
        click(`[data-specimen="${i}"]`);
        click(`[data-score="${fly.eye}-${fly.sex}"]`);
        assert(scope.getSession().report === null, 'Scoring must not reveal correctness');
      }
      if (page === 0) { click('[data-act="cross-next"]'); await ready(); }
    }
    assert(scope.getSession().scored === 12, 'Observations must persist across pages');
    const interpretation = document.getElementById('cross-interpretation');
    interpretation.value = observed.includes('white-F') ? 'unintended' : 'consistent';
    interpretation.dispatchEvent(new Event('change'));
    click('[data-act="cross-submit"]');
    assert(document.getElementById('cross-review').open, 'Evidence review must open');
    assert(scope.getSession().report.correct === 12 && scope.getSession().report.interpretationSupported, 'Correct observations and evidence-based interpretation must be recognised');
    const saved = JSON.parse(localStorage.getItem('fly-trainer.cross.v2'));
    const { CrossSession } = await import('./js/experiment.js');
    assert(JSON.stringify(new CrossSession({ saved }).snapshot()) === JSON.stringify(scope.getSession()), 'Experiment notebook must restore exactly');
    click('[data-close="cross-review"]');
    return observed;
  }
  const clean = await newBatch('documented');
  assert(clean.every((category) => ['red-F', 'white-M'].includes(category)), 'Documented female-only cross must follow X-linked inheritance');
  // A mistaken male-only selection should reach a diagnosable empty vial,
  // rather than being blocked by a hidden answer-key check at parent selection.
  document.getElementById('cross-scenario').value = 'documented';
  click('[data-act="cross-new"]'); await ready();
  for (let i = 0; i < scope.specimens.length; i++) {
    if (scope.specimens[i].reference.sex !== 'M') continue;
    click(`[data-specimen="${i}"]`); click('[data-transfer="collection"]');
  }
  click('[data-act="cross-start"]'); await ready();
  click('[data-act="cross-advance"]'); await ready();
  click('[data-act="cross-advance"]'); await ready();
  assert(scope.getSession().offspringCount === 0 && scope.specimens.length === 0, 'Male-only parents must produce an empty F1 observation');
  document.getElementById('cross-interpretation').value = 'none';
  document.getElementById('cross-interpretation').dispatchEvent(new Event('change'));
  click('[data-act="cross-submit"]');
  assert(scope.getSession().report.interpretationSupported, 'Empty vial must allow an evidence review');
  click('[data-close="cross-review"]');
  const recleared = await newBatch('uncertain', { reclear: true });
  assert(recleared.every((category) => ['red-F', 'white-M'].includes(category)), 'Your own clearing must give only virgin mothers');
  await newBatch('uncertain');
  assert(localStorage.getItem('fly-trainer.collection.v2') === originalCollection, 'Cross mission must preserve the original collection notebook');
  click('[data-act="cross-previous"]'); await ready();
  scope.overview();
  const bounds = document.querySelector('.eyepiece').getBoundingClientRect();
  assert(bounds.bottom < document.querySelector('.bottom').getBoundingClientRect().top, 'Microscope must not overlap the controls');
  return 'PASS: documented/uncertain source records, white-eyed parents, prediction, two development events, paged F1 scoring, evidence review and isolated notebook persistence';
})();
