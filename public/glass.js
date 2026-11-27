// A small reflection follows a fine pointer. Touch and keyboard keep the static bevel.
(() => {
  const hover = matchMedia('(any-hover: hover) and (prefers-reduced-motion: no-preference)');
  const controls = 'button, .action, .studio-mast-actions a, .studio-cta, .button, .submission, .skill-pills a';
  let control, frame, x, y;

  function reflect() {
    frame = 0;
    if (!control) return;
    const bounds = control.getBoundingClientRect();
    control.style.setProperty('--glint-x', (x - bounds.left) + 'px');
    control.style.setProperty('--glint-y', (y - bounds.top) + 'px');
  }
  function clear() {
    if (!control) return;
    control.style.removeProperty('--glint-x');
    control.style.removeProperty('--glint-y');
    control = null;
  }
  document.addEventListener('pointermove', event => {
    if (!hover.matches || event.pointerType === 'touch') return;
    const next = event.target.closest(controls);
    if (next !== control) clear();
    control = next;
    if (!control) return;
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(reflect);
  }, { passive: true });
  document.addEventListener('pointerout', event => {
    if (control && !control.contains(event.relatedTarget)) clear();
  });
  hover.addEventListener('change', clear);
})();
