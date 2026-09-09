import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script = fs.readFileSync(new URL('../public/scroll.js', import.meta.url), 'utf8');
function start({ reduced = false, targetTop = 1800, margin = 194 } = {}) {
  const events = {}, frames = new Map(), positions = [], history = [];
  let sequence = 0, click;
  const target = { attributes: {}, focused: false, events: {},
    hasAttribute(key) { return key in this.attributes; },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    getBoundingClientRect() { return { top: targetTop - window.scrollY }; },
    focus(options) { this.focused = options.preventScroll; },
    addEventListener(key, callback) { this.events[key] = callback; }
  };
  const location = new URL('https://portfolio.example/');
  const window = { scrollY: 0, innerHeight: 800, location,
    matchMedia() { return { matches: reduced, addEventListener() {} }; },
    getComputedStyle() { return { scrollMarginTop: `${margin}px` }; },
    history: { pushState(_, __, hash) { history.push(hash); location.hash = hash; } },
    scrollTo({ top, behavior }) { assert.equal(behavior, 'instant'); this.scrollY = top; positions.push(top); },
    requestAnimationFrame(callback) { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame(id) { frames.delete(id); },
    addEventListener(name, callback) { events[name] = callback; }
  };
  const document = { documentElement: { scrollHeight: 5000 },
    getElementById(id) { return id === 'work' ? target : null; },
    addEventListener(_, callback) { click = callback; }
  };
  vm.runInNewContext(script, { window, document, URL, performance: { now: () => 0 } });
  return { target, window, frames, positions, history, events,
    click({ href = '#work', download = false, ...flags } = {}) {
      const link = { href, target: '', hasAttribute: () => download };
      const event = { button: 0, target: { closest: () => link }, prevented: false,
        preventDefault() { this.prevented = true; }, ...flags };
      click(event); return event;
    },
    tick(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)); }
  };
}
test('section navigation eases to the sticky-header offset, updates URL, and transfers focus', () => {
  const app = start();
  assert.equal(app.click().prevented, true);
  app.tick(100);
  assert(app.window.scrollY > 0 && app.window.scrollY < 803);
  assert.equal(app.target.focused, false);
  app.tick(1000);
  assert.equal(app.window.scrollY, 1606);
  assert.deepEqual(app.history, ['#work']);
  assert.equal(app.target.focused, true);
  assert.equal(app.target.attributes.tabindex, '-1');
  app.target.events.blur();
  assert.equal(app.target.hasAttribute('tabindex'), false);
});
test('reduced motion goes directly to the destination with no animation', () => {
  const app = start({ reduced: true }); app.click();
  assert.equal(app.window.scrollY, 1606); assert.equal(app.frames.size, 0);
  assert.equal(app.target.focused, true);
});
test('wheel, touch, keyboard, and history actions cancel an active scroll without stealing focus', () => {
  for (const name of ['wheel', 'touchstart', 'pointerdown', 'resize', 'popstate', 'hashchange', 'keydown']) {
    const app = start(); app.click(); app.tick(100);
    const position = app.window.scrollY;
    app.events[name]({ key: 'PageDown' }); app.tick(1000);
    assert.equal(app.window.scrollY, position, name);
    assert.equal(app.frames.size, 0, name); assert.equal(app.target.focused, false, name);
  }
});
test('external pages, modified clicks, downloads, and missing fragments keep browser behavior', () => {
  for (const options of [{ href: 'https://other.example/#work' }, { href: '/resume/#work' },
    { href: '?preview=1#work' }, { ctrlKey: true }, { metaKey: true }, { button: 1 },
    { download: true }, { href: '#missing' }, { href: '#%invalid' }, { defaultPrevented: true }]) {
    const app = start(); assert.equal(app.click(options).prevented, false);
    assert.equal(app.frames.size, 0); assert.equal(app.history.length, 0);
  }
});
test('destinations clamp to the available scroll range and a second click replaces the first animation', () => {
  const app = start({ targetTop: 4900 }); app.click(); app.click();
  assert.equal(app.frames.size, 1); app.tick(1000);
  assert.equal(app.window.scrollY, 4200); assert.equal(app.history.length, 1);
  const top = start({ targetTop: 30 }); top.click();
  assert.equal(top.window.scrollY, 0); assert.equal(top.frames.size, 0);
});
