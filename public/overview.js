const themeButtons = document.querySelectorAll('.theme-toggle');
function syncTheme() {
  const light = document.documentElement.dataset.theme === 'light';
  themeButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(light));
    button.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    button.title = `Switch to ${light ? 'dark' : 'light'} theme`;
  });
}
themeButtons.forEach(button => button.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { if (!document.documentElement.dataset.palette) localStorage.setItem('portfolio-theme', theme); } catch {}
  syncTheme();
}));
syncTheme();
const header = document.querySelector('.scroll-header');
const profile = document.querySelector('.portrait-frame');
const mobile = matchMedia('(max-width: 760px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const contentPanel = document.querySelector('.overview-panel');
const main = document.querySelector('main');
function syncHeader() {
  const visible = mobile.matches && profile.getBoundingClientRect().bottom < 72;
  header.classList.toggle('is-visible', visible);
  header.inert = !visible;
}
const links = [...document.querySelectorAll('.bottom-ribbon a[data-panel-target]')];
const panels = [...document.querySelectorAll('.overview-panel .panel-view')];
const ribbon = document.querySelector('.bottom-ribbon');
function syncRibbon() {
  const active = links.find(link => link.hasAttribute('aria-current'));
  if (!active) return;
  ribbon.style.setProperty('--indicator-x', `${active.offsetLeft}px`);
  ribbon.style.setProperty('--indicator-y', `${active.offsetTop}px`);
  ribbon.style.setProperty('--indicator-width', `${active.offsetWidth}px`);
  ribbon.style.setProperty('--indicator-height', `${active.offsetHeight}px`);
  ribbon.classList.add('ribbon-ready');
}

function selectPanel(name, move = false) {
  const target = panels.find(panel => panel.dataset.panel === name) || panels[0];
  const changed = !target.classList.contains('is-active');
  panels.forEach(panel => {
    const active = panel === target;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
  links.forEach(link => {
    if (link.dataset.panelTarget === target.dataset.panel) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  syncRibbon();
  if (changed) contentPanel.scrollTop = 0;
  if (move && mobile.matches) {
    contentPanel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
}
links.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  selectPanel(link.dataset.panelTarget, true);
}));
selectPanel('overview');
let scheduled = false;
function update() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { syncHeader(); scheduled = false; });
}
addEventListener('scroll', update, { passive: true });
main.addEventListener('scroll', update, { passive: true });
addEventListener('resize', () => { update(); syncRibbon(); });
update();
