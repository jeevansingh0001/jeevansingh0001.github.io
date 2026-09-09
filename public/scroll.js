// Ease in-page navigation without changing native wheel or touch scrolling.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation = null;
  const cancel = () => {
    if (animation !== null) window.cancelAnimationFrame(animation);
    animation = null;
  };
  function focusTarget(target) {
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    cancel();
    const start = window.scrollY;
    const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const end = Math.max(0, Math.min(start + target.getBoundingClientRect().top - margin,
      document.documentElement.scrollHeight - window.innerHeight));
    if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
    if (reducedMotion.matches || Math.abs(end - start) < 2) {
      window.scrollTo({ top: end, behavior: 'instant' });
      focusTarget(target);
      return;
    }
    const duration = Math.min(900, Math.max(420, Math.abs(end - start) * .22));
    const began = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: start + (end - start) * eased, behavior: 'instant' });
      if (progress < 1) animation = window.requestAnimationFrame(step);
      else { animation = null; focusTarget(target); }
    }
    animation = window.requestAnimationFrame(step);
  });
  for (const name of ['wheel', 'touchstart', 'pointerdown', 'resize', 'popstate', 'hashchange']) {
    window.addEventListener(name, cancel, { passive: true });
  }
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab', 'Escape'].includes(event.key)) cancel();
  });
  reducedMotion.addEventListener('change', cancel);
})();
