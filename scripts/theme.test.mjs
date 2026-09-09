import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../public/theme.js',import.meta.url),'utf8');
function start({saved=null,dark=false,storageBlocked=false,loading=false}={}) {
  const documentEvents={},windowEvents={},systemEvents={};
  const storage=new Map(saved===null?[]:[['portfolio-theme',saved]]);
  const buttons=['light','dark'].map(theme=>({dataset:{themeChoice:theme},attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.events[k]=fn;}}));
  const meta={setAttribute(k,v){this[k]=v;}};
  const document={documentElement:{dataset:{}},readyState:loading?'loading':'complete',querySelectorAll(){return loading?[]:buttons;},querySelector(){return meta;},addEventListener(k,fn){documentEvents[k]=fn;}};
  const system={matches:dark,addEventListener(k,fn){systemEvents[k]=fn;}};
  const localStorage={getItem(k){if(storageBlocked)throw new Error('blocked');return storage.get(k)??null;},setItem(k,v){if(storageBlocked)throw new Error('blocked');storage.set(k,v);}};
  vm.runInNewContext(script,{document,localStorage,window:{matchMedia(){return system;},addEventListener(k,fn){windowEvents[k]=fn;}}});
  return {document,buttons,meta,storage,system,systemEvents,windowEvents,ready(){loading=false;document.readyState='complete';documentEvents.DOMContentLoaded?.();}};
}
test('saved choice applies before page content loads and buttons synchronize after loading',()=>{
  const app=start({saved:'dark',loading:true});
  assert.equal(app.document.documentElement.dataset.theme,'dark');
  app.ready();
  assert.equal(app.buttons[1].attributes['aria-pressed'],'true');
  assert.equal(app.buttons[0].attributes['aria-pressed'],'false');
  assert.equal(app.meta.content,'#111e2d');
});
test('system preference is the default until the visitor makes a persistent choice',()=>{
  const app=start({dark:true});
  app.buttons[0].events.click();
  assert.equal(app.storage.get('portfolio-theme'),'light');
  assert.equal(app.document.documentElement.dataset.theme,'light');
  app.systemEvents.change();
  assert.equal(app.document.documentElement.dataset.theme,'light');
  assert.equal(app.buttons[0].attributes['aria-pressed'],'true');
});
test('theme selection remains functional when storage is blocked',()=>{
  const app=start({storageBlocked:true});
  app.buttons[1].events.click();
  assert.equal(app.document.documentElement.dataset.theme,'dark');
  assert.equal(app.buttons[1].attributes['aria-pressed'],'true');
});
test('other tabs synchronize their choices and removing the preference restores system theme',()=>{
  const app=start({saved:'light',dark:true});
  app.windowEvents.storage({key:'portfolio-theme',newValue:'dark'});
  assert.equal(app.buttons[1].attributes['aria-pressed'],'true');
  app.windowEvents.storage({key:'portfolio-theme',newValue:null});
  app.system.matches=false;
  app.systemEvents.change();
  assert.equal(app.document.documentElement.dataset.theme,'light');
});
test('invalid stored values fall back to the operating-system preference',()=>{
  assert.equal(start({saved:'unexpected',dark:true}).document.documentElement.dataset.theme,'dark');
});
