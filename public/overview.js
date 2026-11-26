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
const contentPanel = document.querySelector('.overview-panel');
const main = document.querySelector('main');
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

function selectPanel(name) {
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
  if (changed) {
    contentPanel.scrollTop = 0;
    main.scrollTop = 0;
  }
}
links.forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  selectPanel(link.dataset.panelTarget);
}));
function readLocation() {
  const hash = location.hash.slice(1);
  const role = /^role-\d{4}-\d{2}$/.test(hash) && document.getElementById(hash);
  const section = role ? 'experience' : /^skill-\d+-\d+$/.test(hash) ? 'skills' : hash;
  selectPanel(section === 'work' ? 'projects' : section || 'overview');
  if (role) {
    role.open = true;
    role.querySelector('summary').focus({ preventScroll: true });
  }
}
addEventListener('hashchange', readLocation);
readLocation();
addEventListener('resize', syncRibbon);
