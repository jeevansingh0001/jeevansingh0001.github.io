// The scroller owns touch momentum. Only the glass lens animates between tabs.
function createRibbon(ribbon, links, reducedMotion, activate) {
  const lens = ribbon.querySelector('.ribbon-lens');
  let selected, frame, previousTime;
  let center = 0, width = 0, velocity = 0, targetCenter = 0, targetWidth = 0;
  let drag = null, suppressClick = false;

  function paint() {
    const stretch = Math.min(16, Math.abs(velocity) * .009);
    const drawnWidth = width + stretch;
    lens.style.transform = `translate3d(${center - drawnWidth / 2}px, 0, 0) scaleX(${drawnWidth / 100})`;
  }

  function settle() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    center = targetCenter;
    width = targetWidth;
    velocity = 0;
    paint();
  }

  function step(now) {
    const dt = Math.min((now - previousTime) / 1000, .064);
    previousTime = now;
    // Exact critically damped spring step, independent of display refresh rate.
    const rate = 22, decay = Math.exp(-rate * dt);
    const distance = center - targetCenter;
    const impulse = velocity + rate * distance;
    center = targetCenter + (distance + impulse * dt) * decay;
    velocity = (velocity - rate * impulse * dt) * decay;
    width += (targetWidth - width) * (1 - decay);
    if (Math.abs(center - targetCenter) < .1 && Math.abs(velocity) < 3 && Math.abs(width - targetWidth) < .1) {
      settle();
    } else {
      paint();
      frame = requestAnimationFrame(step);
    }
  }

  function aim(x, w, instant) {
    targetCenter = x;
    targetWidth = w;
    if (instant || reducedMotion.matches) settle();
    else if (!frame) {
      previousTime = performance.now();
      frame = requestAnimationFrame(step);
    }
  }

  function sync(link, reveal = false) {
    const first = !selected;
    selected = link;
    lens.style.top = link.offsetTop + 'px';
    lens.style.height = link.offsetHeight + 'px';
    ribbon.classList.toggle('can-pan', ribbon.scrollWidth > ribbon.clientWidth + 1);
    if (!drag) aim(link.offsetLeft + link.offsetWidth / 2, link.offsetWidth, first || !reveal);
    ribbon.classList.add('ribbon-ready');
    if (!reveal) return;
    // Reveal the nearest clipped edge. Leave a fully visible tab under the finger.
    const left = link.offsetLeft - 6, right = link.offsetLeft + link.offsetWidth + 6;
    const viewLeft = ribbon.scrollLeft, viewRight = viewLeft + ribbon.clientWidth;
    if (left < viewLeft || right > viewRight) {
      ribbon.scrollTo({ left: left < viewLeft ? left : right - ribbon.clientWidth,
        behavior: first || reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }

  function linkAt(x) {
    return links.find(link => x < link.offsetLeft + link.offsetWidth) || links.at(-1);
  }

  ribbon.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (!event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const overflow = ribbon.scrollWidth > ribbon.clientWidth + 1;
    if (overflow && event.pointerType !== 'mouse') return;
    drag = { id: event.pointerId, start: event.clientX, scroll: ribbon.scrollLeft, pan: overflow, moved: false };
  });
  ribbon.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.start;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      ribbon.setPointerCapture(event.pointerId);
      ribbon.classList.add('is-dragging');
    }
    if (drag.pan) {
      ribbon.scrollLeft = drag.scroll - dx;
    } else {
      const x = event.clientX - ribbon.getBoundingClientRect().left + ribbon.scrollLeft;
      const w = linkAt(x).offsetWidth;
      aim(Math.max(w / 2, Math.min(ribbon.clientWidth - w / 2, x)), w, true);
    }
  });
  function finish(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const { moved, pan } = drag;
    drag = null;
    ribbon.classList.remove('is-dragging');
    if (!moved) return;
    suppressClick = true;
    if (!pan && event.type === 'pointerup') {
      activate(linkAt(event.clientX - ribbon.getBoundingClientRect().left + ribbon.scrollLeft));
    } else if (!pan) sync(selected);
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) ribbon.addEventListener(type, finish);
  ribbon.addEventListener('pointerleave', () => { if (drag && !drag.moved) drag = null; });
  ribbon.addEventListener('dragstart', event => event.preventDefault());
  ribbon.addEventListener('click', event => {
    if (suppressClick && event.detail) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  ribbon.addEventListener('keydown', event => {
    const index = links.indexOf(event.target);
    if (index < 0 || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const positions = { ArrowLeft: (index + links.length - 1) % links.length, ArrowRight: (index + 1) % links.length,
      Home: 0, End: links.length - 1 };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    const link = links[positions[event.key]];
    link.focus({ preventScroll: true });
    activate(link);
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settle(); });
  return sync;
}
