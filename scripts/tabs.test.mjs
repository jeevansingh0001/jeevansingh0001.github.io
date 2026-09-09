import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../public/tabs.js',import.meta.url),'utf8');
function start() {
  const element=()=>({attributes:{},events:{},hidden:false,focused:false,setAttribute(key,value){this.attributes[key]=value;},addEventListener(key,fn){this.events[key]=fn;},focus(){this.focused=true;}});
  const tabs=Array.from({length:11},(_,i)=>({...element(),id:`work-tab-${i}`}));
  const panels=tabs.map(element);
  const list={hidden:true,querySelectorAll(){return tabs;}};
  const group={querySelector(){return list;},querySelectorAll(){return panels;}};
  vm.runInNewContext(script,{document:{querySelectorAll(){return [group];}}});
  return {tabs,panels,list};
}
test('one work item is selected, labeled, visible, and keyboard reachable on initialization',()=>{
  const {tabs,panels,list}=start();
  assert.equal(list.hidden,false);
  assert.equal(panels.filter(panel=>!panel.hidden).length,1);
  assert.equal(tabs.filter(tab=>tab.tabIndex===0).length,1);
  assert.equal(tabs[0].attributes['aria-selected'],'true');
  assert.equal(panels[0].attributes['aria-labelledby'],tabs[0].id);
  assert.equal(panels[0].attributes.role,'tabpanel');
});
test('every heading reveals its matching detail and hides the previous detail',()=>{
  const {tabs,panels}=start();
  tabs.forEach((tab,index)=>{
    tab.events.click();
    assert.equal(panels[index].hidden,false);
    assert.equal(panels.filter(panel=>!panel.hidden).length,1);
    assert.equal(tab.attributes['aria-selected'],'true');
    assert.equal(tabs.filter(item=>item.tabIndex===0).length,1);
  });
});
test('arrow keys wrap, Home and End select endpoints, and Tab keeps native behavior',()=>{
  const {tabs,panels}=start();
  for(const [from,key,to] of [[0,'ArrowLeft',10],[10,'ArrowRight',0],[0,'End',10],[10,'Home',0]]){
    let prevented=false;
    tabs[from].events.keydown({key,preventDefault(){prevented=true;}});
    assert(prevented);assert.equal(panels[to].hidden,false);assert(tabs[to].focused);
  }
  tabs[0].events.keydown({key:'Tab',preventDefault(){assert.fail('Tab should move to the detail panel');}});
});
