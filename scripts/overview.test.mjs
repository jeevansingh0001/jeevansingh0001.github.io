import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../public/overview.js', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');

function setup({ mobile = false, palette } = {}) {
  const stored = [];
  function element(dataset = {}) {
    const classes = new Set(), attributes = {}, events = {}, style = {};
    return { dataset, attributes, events, hidden: false, style: { setProperty(k,v) { style[k] = v; } },
      classList: { contains: k => classes.has(k), add: k => classes.add(k), toggle(k,active) { active ? classes.add(k) : classes.delete(k); } },
      setAttribute(k,v) { attributes[k] = v; }, removeAttribute(k) { delete attributes[k]; if (k === 'data-reveal') delete dataset.reveal; }, hasAttribute: k => k in attributes,
      addEventListener(k,fn) { events[k] = fn; }, querySelectorAll() { return this.children || []; },
      getBoundingClientRect: () => ({ bottom: 200 }), offsetLeft: 8, offsetTop: 8, offsetWidth: 80, offsetHeight: 45,
      scrollIntoView(options) { this.scrollOptions = options; }
    };
  }
  const panels = ['overview','experience','education','projects','skills','recognition','certifications'].map(panel => element({ panel }));
  panels[0].classList.add('is-active');
  panels.forEach(p => { p.children = [element(), element()]; });
  const links = panels.map(p => element({ panelTarget: p.dataset.panel }));
  const button = element(), content = element(), main = element(), ribbon = element();
  const viewport = { matches: mobile, addEventListener(k,fn) { this[k] = fn; } };
  const root = { dataset: { composition: 'sidebar', ...(palette ? { palette } : {}) } };
  const selectors = { '.overview-panel': content, main, '.bottom-ribbon': ribbon };
  const document = { documentElement: root, querySelector: s => selectors[s], querySelectorAll(s) { if (s === '.theme-toggle') return [button]; if (s.includes('a[data-panel-target]')) return links; if (s === '[data-reveal]') return panels.flatMap(p => p.children); return panels; } };
  const context = vm.createContext({ document, location: { hash: '' },
    matchMedia: () => viewport,
    localStorage: { setItem: (...args) => stored.push(args) }, addEventListener() {}, requestAnimationFrame: fn => fn() });
  vm.runInContext(theme, context);
  vm.runInContext(source, context);
  return { panels, content, main, root, viewport, links, stored, button, select: name => vm.runInContext(`selectPanel('${name}')`, context) };
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

test('tab changes preserve the desktop rail and the compact mobile header', () => {
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
  assert.equal(app.root.dataset.layout, 'studio');
  assert.equal(app.content.scrollTop, 0);
  assert.equal(app.main.scrollTop, 0);
  app.viewport.matches = false;
  app.viewport.change();
  assert.equal(app.root.dataset.layout, 'sidebar');
  assert.equal(app.panels[1].hidden, false);
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
