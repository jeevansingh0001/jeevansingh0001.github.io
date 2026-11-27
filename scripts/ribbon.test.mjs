import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/ribbon.js', import.meta.url), 'utf8');
function dock(reduce = false) {
  const frames = new Map(), lens = { style: {} };
  let now = 0, id = 0;
  const ribbon = {
    clientWidth: 240, scrollWidth: 440, scrollLeft: 0, classList: { toggle() {}, add() {} },
    querySelector: () => lens, addEventListener() {}, scrollTo({ left }) { this.scrollLeft = left; }
  };
  const links = [6, 110, 214, 318].map(offsetLeft => ({ offsetLeft, offsetTop: 5, offsetWidth: 98, offsetHeight: 44 }));
  const init = vm.runInNewContext(source + '\ncreateRibbon', {
    performance: { now: () => now },
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; },
    cancelAnimationFrame(key) { frames.delete(key); }
  });
  const select = init(ribbon, links, { matches: reduce, addEventListener() {} }, () => {});
  const tick = () => {
    now += 1000 / 60;
    for (const [key, fn] of [...frames]) { frames.delete(key); fn(now); }
  };
  return { ribbon, lens, links, select, tick, frames };
}

test('re-measuring the active tab preserves a manual swipe, selection reveals only the clipped edge', () => {
  const { ribbon, links, select } = dock(true);
  select(links[0]);
  ribbon.scrollLeft = 180;
  select(links[0]);
  assert.equal(ribbon.scrollLeft, 180);
  select(links[1], true);
  assert.equal(ribbon.scrollLeft, 104);
  select(links[2], true);
  assert.equal(ribbon.scrollLeft, 104);
});

test('rapid retargeting continues the current motion and settles exactly on the last selected tab', () => {
  const { select, links, lens, tick, frames } = dock();
  select(links[0]);
  select(links[3], true);
  tick(); tick();
  const moving = lens.style.transform;
  select(links[1], true);
  assert.equal(lens.style.transform, moving);
  assert.equal(frames.size, 1);
  for (let i = 0; i < 90; i++) tick();
  assert.equal(frames.size, 0);
  assert.equal(lens.style.transform, 'translate3d(110px, 0, 0) scaleX(0.98)');
});
