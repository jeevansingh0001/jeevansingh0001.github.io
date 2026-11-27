import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../public/overview.js', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');
const ribbonSource = fs.readFileSync(new URL('../public/ribbon.js', import.meta.url), 'utf8');

function setup({ mobile = false, palette, hash = '' } = {}) {
  const stored = [];
  function element(dataset = {}) {
    const classes = new Set(), attributes = {}, events = {}, style = {};
    return { dataset, attributes, events, hidden: false, style: { setProperty(k,v) { style[k] = v; } },
      classList: { contains: k => classes.has(k), add: k => classes.add(k), toggle(k,active) { active ? classes.add(k) : classes.delete(k); } },
      setAttribute(k,v) { attributes[k] = v; }, removeAttribute(k) { delete attributes[k]; if (k === 'data-reveal') delete dataset.reveal; }, hasAttribute: k => k in attributes,
      addEventListener(k,fn) { events[k] = fn; }, querySelectorAll() { return this.children || []; },
      getBoundingClientRect: () => ({ bottom: 200 }), offsetLeft: 8, offsetTop: 8, offsetWidth: 80, offsetHeight: 45,
      clientWidth: 390, clientHeight: 844, scrollLeft: 0, scrollTop: 0,
      scrollTo({ top, left }) { if (top !== undefined) this.scrollTop = top; if (left !== undefined) this.scrollLeft = left; }
    };
  }
  const panels = ['overview','experience','education','projects','skills','recognition','certifications'].map(panel => element({ panel }));
  panels[0].classList.add('is-active');
  panels.forEach(p => { p.children = [element(), element()]; });
  const links = panels.map(p => element({ panelTarget: p.dataset.panel }));
  const button = element(), content = element(), main = element(), ribbon = element();
  const lens = element();
  ribbon.querySelector = () => lens;
  const profile = element(), mast = element();
  profile.querySelector = () => element();
  content.getBoundingClientRect = () => ({ top: 750 - main.scrollTop });
  const viewport = { matches: mobile, addEventListener(k,fn) { this[k] = fn; } };
  const root = { dataset: { composition: 'sidebar', ...(palette ? { palette } : {}) } };
  const selectors = { '.overview-panel': content, main, '.bottom-ribbon': ribbon, '.profile-block': profile, '.studio-mast': mast };
  const document = { documentElement: root, querySelector: s => selectors[s], querySelectorAll(s) { if (s === '.theme-toggle') return [button]; if (s.includes('a[data-panel-target]')) return links; if (s === '[data-reveal]') return panels.flatMap(p => p.children); return panels; } };
  const context = vm.createContext({ document, location: { hash }, ResizeObserver: class { observe() {} },
    matchMedia: query => query.includes('reduced-motion') ? { matches: true, addEventListener() {} } : viewport,
    localStorage: { setItem: (...args) => stored.push(args) }, addEventListener() {}, requestAnimationFrame: fn => fn() });
  vm.runInContext(theme, context);
  vm.runInContext(ribbonSource, context);
  vm.runInContext(source, context);
  return { panels, content, main, root, viewport, links, stored, button, mast, profile,
    select: name => vm.runInContext(`selectPanel('${name}', 'instant')`, context) };
}

test('every ribbon selection updates immediately, including rapid repeated clicks', () => {
  const app = setup();
  app.select('experience');
  assert.equal(app.panels[1].hidden, false);
  app.select('education');
  assert.deepEqual(app.panels.filter(p=>!p.hidden).map(p=>p.dataset.panel), ['education']);
  assert.equal(app.links[2].attributes['aria-current'], 'location');
  app.select('experience');
  app.select('education');
  assert.equal(app.panels[2].hidden, false);
});

test('tab changes reveal the selected section below the mobile header', () => {
  const app = setup();
  for (const panel of app.panels) {
    app.select(panel.dataset.panel);
    assert.equal(app.root.dataset.layout, 'sidebar');
  }
  app.viewport.matches = true;
  app.viewport.change();
  app.content.scrollTop = 400;
  app.main.scrollTop = 400;
  app.select('experience');
  assert.equal(app.root.dataset.layout, 'mobile');
  assert.equal(app.content.scrollTop, 0);
  assert.equal(app.content.getBoundingClientRect().top, app.mast.offsetHeight);
  app.viewport.matches = false;
  app.viewport.change();
  assert.equal(app.root.dataset.layout, 'sidebar');
  assert.equal(app.panels[1].hidden, false);
});

test('the phone opens on the profile and restores it when scrolling back to the top', () => {
  const app = setup({ mobile: true });
  assert.equal(app.main.scrollTop, 0);
  assert.equal(app.mast.inert, true);
  assert.equal(app.profile.inert, false);
  app.main.scrollTop = 720;
  app.main.events.scroll();
  assert.equal(app.mast.inert, false);
  assert.equal(app.profile.inert, true);
  app.main.scrollTop = 0;
  app.main.events.scroll();
  assert.equal(app.mast.inert, true);
  assert.equal(app.profile.inert, false);
});

test('direct section links on phones bypass the profile intro', () => {
  const app = setup({ mobile: true, hash: '#certifications' });
  assert.equal(app.content.getBoundingClientRect().top, app.mast.offsetHeight);
  assert.equal(app.links.at(-1).attributes['aria-current'], 'location');
});

test('all selected panel content is available without waiting for intersection or animation', () => {
  const app = setup();
  app.select('experience');
  assert(app.panels.flatMap(p=>p.children).every(e=>!e.dataset.reveal));
  app.content.scrollTop = 200;
  app.select('experience');
  assert.equal(app.content.scrollTop, 200, 'reselecting the current tab preserves its scroll');
});

test('palette previews do not overwrite the main portfolio theme preference', () => {
  const preview = setup({ palette: 'graphite' });
  preview.button.events.click();
  assert.equal(preview.stored.length, 0);
  const normal = setup();
  normal.button.events.click();
  assert.deepEqual(normal.stored, [['portfolio-theme','light']]);
});
