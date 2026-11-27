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
const profile = document.querySelector('.profile-block');
const mast = document.querySelector('.studio-mast');
const nameHeading = profile.querySelector('h1');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = () => document.documentElement.dataset.layout === 'mobile';
let wasMobile = mobileLayout();
const links = [...document.querySelectorAll('.bottom-ribbon a[data-panel-target]')];
const panels = [...document.querySelectorAll('.overview-panel .panel-view')];
const ribbon = document.querySelector('.bottom-ribbon');
const syncRibbon = createRibbon(ribbon, links, reducedMotion, activateLink);

function syncHeader() {
  const mobile = mobileLayout();
  const sheetTop = contentPanel.getBoundingClientRect().top;
  const visible = mobile && sheetTop <= Math.max(mast.offsetHeight + 1, nameHeading.getBoundingClientRect().bottom);
  mast.classList.toggle('is-visible', visible);
  mast.inert = mobile && !visible;
  profile.inert = mobile && sheetTop <= mast.offsetHeight + 1;
}

function measureLayout() {
  const mobile = mobileLayout();
  if (mobile) {
    main.style.setProperty('--mast-height', `${mast.offsetHeight}px`);
    // A tall intro must scroll normally so its last action stays reachable.
    profile.classList.toggle('is-pinned', profile.offsetHeight <= main.clientHeight + 1);
    if (!wasMobile && location.hash) readLocation();
  }
  wasMobile = mobile;
  syncHeader();
  syncRibbon(links.find(link => link.hasAttribute('aria-current')) || links[0]);
}

function selectPanel(name, scrollBehavior) {
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
  syncRibbon(links.find(link => link.dataset.panelTarget === target.dataset.panel), Boolean(scrollBehavior));
  if (changed) {
    contentPanel.scrollTop = 0;
    if (!mobileLayout()) main.scrollTop = 0;
  }
  if (mobileLayout() && scrollBehavior) {
    main.scrollTo({ top: main.scrollTop + contentPanel.getBoundingClientRect().top - mast.offsetHeight,
      behavior: reducedMotion.matches ? 'instant' : scrollBehavior });
  }
}
function activateLink(link) {
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  selectPanel(link.dataset.panelTarget, 'smooth');
}
links.forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  activateLink(link);
}));
function readLocation() {
  const hash = location.hash.slice(1);
  const role = /^role-\d{4}-\d{2}$/.test(hash) && document.getElementById(hash);
  const section = role ? 'experience' : /^skill-\d+-\d+$/.test(hash) ? 'skills' : hash;
  const name = section === 'work' ? 'projects' : section;
  selectPanel(name, panels.some(panel => panel.dataset.panel === name) ? 'instant' : undefined);
  if (!hash || hash === 'profile') main.scrollTop = 0;
  if (role) {
    role.open = true;
    role.querySelector('summary').focus({ preventScroll: true });
  }
}
addEventListener('hashchange', readLocation);
main.addEventListener('scroll', syncHeader, { passive: true });
// Observe text reflow and orientation changes as well as the initial layout.
const sizes = new ResizeObserver(measureLayout);
for (const element of [main, mast, profile, ribbon]) sizes.observe(element);
measureLayout();
readLocation();
