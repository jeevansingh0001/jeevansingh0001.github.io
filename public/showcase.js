for (const group of document.querySelectorAll('[data-skill-group]')) {
  const keys = [...group.querySelectorAll('[data-skill-key]')];
  const details = group.querySelectorAll('[data-skill-detail]');
  function inspect(key) {
    const id = key.getAttribute('aria-controls');
    for (const button of keys) button.setAttribute('aria-pressed', String(button === key));
    for (const detail of details) detail.hidden = detail.id !== id;
  }
  for (const key of keys) key.addEventListener('click', () => inspect(key));
  inspect(keys[0]);
}

function openLinkedSkill() {
  const match = /^#skill-(\d+)-(\d+)$/.exec(location.hash);
  if (!match) return;
  const key = document.querySelector(`[data-skill-key][aria-controls="skill-${match[1]}-${match[2]}"]`);
  if (!key) return;
  document.getElementById('skill-tab-' + match[1]).click();
  key.click();
}
addEventListener('hashchange', openLinkedSkill);
openLinkedSkill();

for (const collection of document.querySelectorAll('[data-collection]')) {
  const entries = [...collection.querySelectorAll('[data-entry]')];
  const buttons = [...collection.querySelectorAll('[data-filter]')];
  const search = collection.querySelector('[data-search]');
  const feedback = collection.querySelector('[data-feedback]');
  let category = '';
  function filter() {
    const query = (search?.value ?? '').trim().toLocaleLowerCase();
    let matches = 0;
    for (const entry of entries) {
      const text = (entry.textContent + ' ' + entry.dataset.category).toLocaleLowerCase();
      entry.hidden = Boolean((category && entry.dataset.category !== category) || !text.includes(query));
      if (!entry.hidden) matches++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    if (feedback) feedback.textContent = matches === 0 ? 'No credentials match. Try another search or category.' :
      category || query ? `Showing ${matches} of ${entries.length} credentials.` : '';
  }
  for (const button of buttons) button.addEventListener('click', () => {
    category = button.dataset.filter;
    filter();
  });
  search?.addEventListener('input', filter);
}

const dialog = document.querySelector('.evidence-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const preview = dialog.querySelector('[data-full-preview]');
  const title = dialog.querySelector('#preview-title');
  const caption = dialog.querySelector('[data-preview-caption]');
  const original = dialog.querySelector('[data-original]');
  const previous = dialog.querySelector('[data-previous]');
  const next = dialog.querySelector('[data-next]');
  const triggers = [...document.querySelectorAll('a[data-lightbox]')];
  let current = 0;
  let group = [];

  function show(index) {
    current = (index + group.length) % group.length;
    const link = group[current];
    preview.src = link.dataset.preview;
    preview.alt = link.dataset.title;
    title.textContent = link.dataset.title;
    caption.textContent = link.dataset.caption;
    original.href = link.href;
    original.textContent = `Open ${link.dataset.format} ↗`;
    previous.hidden = next.hidden = group.length < 2;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    group = triggers.filter(item => item.dataset.lightbox === link.dataset.lightbox && !item.closest('[data-entry][hidden]'));
    show(group.findIndex(item => item.href === link.href));
    dialog.showModal();
  });
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (group.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
}
