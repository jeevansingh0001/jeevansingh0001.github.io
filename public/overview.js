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
  try { localStorage.setItem('portfolio-theme', theme); } catch {}
  syncTheme();
}));
syncTheme();
const header = document.querySelector('.scroll-header');
const profile = document.querySelector('.portrait-frame');
const mobile = matchMedia('(max-width: 760px)');
function syncHeader() {
  const visible = mobile.matches && profile.getBoundingClientRect().bottom < 72;
  header.classList.toggle('is-visible', visible);
  header.inert = !visible;
}
const links = [...document.querySelectorAll('.bottom-ribbon a[data-panel-target]')];
const panels = [...document.querySelectorAll('.overview-panel .panel-view')];
function selectPanel(name, move = false) {
  const target = panels.find(panel => panel.dataset.panel === name) || panels[0];
  panels.forEach(panel => {
    const active = panel === target;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
  links.forEach(link => {
    if (link.dataset.panelTarget === target.dataset.panel) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (move && window.matchMedia('(max-width: 760px)').matches) {
    document.querySelector('.overview-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
addEventListener('resize', update);
update();
