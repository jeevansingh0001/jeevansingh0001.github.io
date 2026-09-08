// Section links work without scripting; this adds the current reading position.
(() => {
  const links = [...document.querySelectorAll('[data-section-link]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  if (!links.length || !sections.length) return;
  let queued = false;
  function update() {
    queued = false;
    const navigation = document.querySelector('.section-nav');
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const header = document.querySelector('.header');
    const threshold = (header?.getBoundingClientRect().height || 0)
      + (narrow ? navigation?.getBoundingClientRect().height || 0 : 0) + 40;
    let active = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) active = section.id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = sections.at(-1).id;
    for (const link of links) {
      if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function schedule() {
    if (!queued) { queued = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('hashchange', schedule);
  update();
})();
