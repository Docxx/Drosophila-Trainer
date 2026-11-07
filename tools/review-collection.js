// Run inside the isolated Electron snapshot profile. Exercise real DOM controls
// and session persistence, then leave a clean exercise overview for visual QA.
(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const click = (selector) => {
    const button = document.querySelector(selector);
    assert(button && !button.disabled, `Missing/disabled control: ${selector}`);
    button.click();
  };
  const scope = window.scope;
  const publicState = () => scope.getSession();
  // Snapshots use a dedicated profile, so testing never changes a learner's notebook.
  if (publicState().submitted) { click('[data-act="submit"]'); click('[data-act="retry"]'); }
  for (let i = 0; i < scope.specimens.length; i++) {
    click(`[data-specimen="${i}"]`);
    const fly = publicState().flies[i];
    if (fly.destination !== 'pad') click('[data-transfer="pad"]');
  }
  assert(scope.specimens.length === 6, 'Exercise must have six flies');
  assert(publicState().report === null, 'No pre-submission feedback');
  assert(document.getElementById('specimens').textContent.match(/female|male|virgin/i) === null, 'Roster must not disclose biological answers');
  click('[data-act="notebook"]');
  assert(document.getElementById('notebook').open, 'Notebook did not open');
  const prediction = document.getElementById('prediction');
  prediction.value = 'Use sex combs and the clearing record. <plain text>';
  prediction.dispatchEvent(new Event('input', { bubbles: true }));
  assert(JSON.parse(localStorage.getItem('fly-trainer.collection.v1')).notes.prediction === prediction.value, 'Prediction was not saved');
  click('[data-close="notebook"]');
  const sexes = scope.specimens.map((s) => s.reference.sex);
  const femaleIndices = sexes.map((sex, i) => sex === 'F' ? i : -1).filter((i) => i >= 0);
  const maleIndex = sexes.indexOf('M');
  for (const i of [...femaleIndices.slice(0, 2), maleIndex]) {
    click(`[data-specimen="${i}"]`); click('[data-transfer="collection"]');
    assert(!scope.specimens[i].holder.visible, 'Transferred fly must leave the microscope pad');
    assert(publicState().report === null, 'Transfers must not reveal correctness');
  }
  assert(document.getElementById('collection-count').textContent === '3', 'Vial count must track transfers');
  click('[data-act="submit"]');
  assert(document.getElementById('review').open && publicState().report.success === false, 'Male contamination must fail after submission');
  assert(publicState().report.rows.length === 3, 'Review must describe only collected flies');
  assert(document.querySelector('[data-transfer="collection"]').disabled, 'Submitted decisions must be locked');
  click('[data-act="retry"]');
  click(`[data-specimen="${maleIndex}"]`); click('[data-transfer="rejected"]');
  click('[data-transfer="pad"]');
  assert(scope.specimens[maleIndex].holder.visible, 'A set-aside fly must be recoverable');
  assert(scope.specimens[maleIndex].holder.position.x === scope.specimens[maleIndex].reference.x, 'Returning a fly must restore a visible pad location');
  click('[data-act="submit"]');
  assert(publicState().report.success === true && document.getElementById('review-title').textContent === 'Collection ready', 'Corrected collection must pass');
  const saved = JSON.parse(localStorage.getItem('fly-trainer.collection.v1'));
  const { CollectionSession } = await import('./js/collection.js');
  const restored = new CollectionSession({ seed: saved.seed, saved });
  assert(JSON.stringify(restored.snapshot()) === JSON.stringify(publicState()), 'Saved notebook must restore exactly');
  click('[data-act="new-batch"]');
  const deadline = Date.now() + 30000;
  while (!scope.ready) { if (Date.now() > deadline) throw new Error('New batch failed to load'); await new Promise((r) => setTimeout(r, 100)); }
  assert(publicState().report === null && publicState().notes.prediction === '', 'New batch must reset decisions and notes');
  assert(document.getElementById('collection-count').textContent === '0', 'New batch must clear the vial');
  const bounds = document.querySelector('.eyepiece').getBoundingClientRect();
  const footer = document.querySelector('.bottom').getBoundingClientRect();
  assert(bounds.bottom < footer.top, 'Microscope must not overlap the control bar');
  return 'PASS: neutral roster, notebook autosave/restore, collection transfers, delayed failure, correction, success, new batch and layout';
})();
