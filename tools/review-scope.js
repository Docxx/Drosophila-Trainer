// Run with --snapshot-js=tools/review-scope.js from the project root.
// Exercise the rendered reference controls before capturing a focused male.
(async () => {
  await window.scope.startActivity('reference');
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const click = (selector) => {
    const button = document.querySelector(selector);
    assert(button && !button.disabled, `Missing or disabled control: ${selector}`);
    button.click();
  };
  const waitFrame = () => new Promise((resolve) => setTimeout(resolve, 500));
  assert(window.scope.ready && window.scope.specimens.length === 4, 'Four reference specimens must be ready');
  for (let i = 0; i < 4; i++) {
    click(`[data-specimen="${i}"]`);
    assert(document.querySelector(`[data-specimen="${i}"]`).getAttribute('aria-pressed') === 'true', 'Selected reference must be announced');
    assert(window.scope.holder === window.scope.specimens[i].holder, 'Selection must choose the correct individual');
    for (const angle of ['dorsal', 'lateral', 'ventral']) {
      click(`[data-act="${angle}"]`);
      await waitFrame();
      assert(window.scope.holder.quaternion.toArray().every(Number.isFinite), 'Invalid rotation');
      assert(Number.isFinite(window.scope.holder.position.y), 'Invalid resting height');
    }
  }
  click('[data-tool="rotate"]');
  assert(document.getElementById('scope').dataset.tool === 'rotate', 'Rotate tool did not activate');
  click('[data-tool="move"]');
  assert(document.getElementById('scope').dataset.tool === 'move', 'Move tool did not activate');
  click('[data-act="reset"]');
  for (const specimen of window.scope.specimens) {
    assert(specimen.holder.position.x === specimen.reference.x && specimen.holder.position.z === specimen.reference.z, 'Reset must restore specimen position');
  }
  const before = window.scope.holder.quaternion.clone();
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
  assert(before.angleTo(window.scope.holder.quaternion) > 0.2, 'Q must turn the selected fly');
  const other = window.scope.specimens.find((s) => s.holder !== window.scope.holder);
  const otherRotation = other.holder.quaternion.clone();
  click('[data-act="roll-right"]');
  assert(otherRotation.equals(other.holder.quaternion), 'Handling must affect only the selected individual');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  assert(window.scope.view.mag === 16 && window.scope.view.x === 0 && window.scope.view.z === 0, 'Escape must restore overview');
  click('[data-specimen="1"]');
  click('[data-act="ventral"]');
  await waitFrame();
  assert(window.scope.view.mag === 32, 'Reference selection must focus the microscope');
  return 'PASS: four specimen selections, twelve inspection views, move/rotate tools, keyboard shortcuts, individual rotation, focus and reset';
})();
