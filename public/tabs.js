// Keep every contribution readable without JavaScript; enhance into a tab set.
(() => {
  for (const group of document.querySelectorAll('[data-tabs]')) {
    const list = group.querySelector('[role="tablist"]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = [...group.querySelectorAll('[data-tab-panel]')];
    if (!tabs.length || tabs.length !== panels.length) continue;
    function select(index, focus = false) {
      tabs.forEach((tab, position) => {
        const active = position === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[position].hidden = !active;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0);
    list.hidden = false;
  }
})();
