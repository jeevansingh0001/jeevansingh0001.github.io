export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
));
const e = escapeHtml;
const external = 'target="_blank" rel="noopener noreferrer"';
const arrow = '<span aria-hidden="true">↗</span>';
const art = project => `/assets/showcase/${project.slug}.webp`;
const projectUrl = project => `/projects/${project.slug}/`;
const joinMeta = (...parts) => parts.filter(Boolean).map(e).join(' · ');

export function heading(id, first, last, description) {
  return `<header class="collection-head"><div><h2 id="panel-title-${id}">${e(first)} <em>${e(last)}</em></h2>
    <p>${e(description)}</p></div></header>`;
}

function panel(id, content) {
  return `<section class="panel-view showcase" id="${id}" data-panel="${id}" aria-labelledby="panel-title-${id}">${content}</section>`;
}

function projectTab(project) {
  return `<button type="button" role="tab" id="pick-${project.slug}" aria-controls="feature-${project.slug}" class="project-picker">
    <img src="${art(project)}" alt="" loading="lazy" width="76" height="66">
    <span><strong>${e(project.name)}</strong><small>${e(project.category)}</small></span><b aria-hidden="true">↗</b></button>`;
}

export function projectGallery(projects) {
  const tabs = projects.map(projectTab).join('');
  const documents = projects.filter(p => p.artifacts?.length).map(p => {
    const cover = p.artifacts.find(a => a.label.toLowerCase().includes('poster')) ?? p.artifacts[0];
    const files = p.artifacts.map(a => `<a ${a.preview ? previewAttrs({ ...a, title: a.label, description: p.name }, 'files-' + p.slug) : `href="${e(a.href)}" download`}>
      <span>${e(a.label)}</span><small>${e(a.format)} ${arrow}</small></a>`).join('');
    return `<details class="file-folder"><summary>
      <span class="folder-cover" aria-hidden="true">${cover.preview ? `<img src="${e(cover.preview)}" alt="" loading="lazy">` : '<span class="word-sheet">W</span>'}</span>
      <strong>${e(p.name)}</strong><i class="disclosure-plus" aria-hidden="true"></i></summary><div class="folder-files">${files}</div></details>`;
  }).join('');
  const features = projects.map(p => `<article class="project-feature" id="feature-${p.slug}" data-tab-panel>
    <div class="feature-art"><img src="${art(p)}" alt="" loading="lazy"></div>${p.slug === 'shabad-shazam' ? '<span class="shabad-script" lang="pa-Guru">ਸ਼ਬਦ</span>' : ''}
    <div class="feature-copy"><span class="studio-kicker"><i></i>${e(p.category)}</span><h3>${e(p.name)}</h3>
    <p>${e(p.subtitle)}</p><div class="feature-actions"><a class="studio-cta" href="${projectUrl(p)}">Read case study ${arrow}</a>
    ${p.artifacts?.length ? `<a class="artifact-shortcut" href="${projectUrl(p)}#artifacts">Artifacts (${p.artifacts.length})</a>` : ''}</div></div></article>`).join('');
  return panel('projects', heading('projects','Project','gallery','Explore the builds, experiments, and decisions behind each project.') +
    `<div class="project-explorer" data-tabs><div class="project-index" role="tablist" aria-label="Choose a project" hidden>${tabs}</div>
    <div class="project-stage">${features}</div></div>
    <section class="project-files"><h3>From the project files</h3><div>${documents}</div></section>`);
}

function skillDetail(skill, group, id, projects) {
  const project = projects.find(p => p.slug === skill.context);
  const link = project ? `<a href="${projectUrl(project)}">Explore ${e(project.name)} ${arrow}</a>` :
    skill.context === 'experience' ? '<a href="#experience">Explore my work at Amdocs <span aria-hidden="true">→</span></a>' : '';
  return `<article class="skill-detail" id="${id}" data-skill-detail>
    <div class="skill-object" aria-hidden="true"><span>${e(skill.emoji)}</span></div>
    <div><span class="studio-kicker">${e(group)}</span><h3>${e(skill.name)}</h3><h4>${e(skill.heading)}</h4>
    <p>${e(skill.detail)}</p>${link}</div></article>`;
}

export function skillsGallery(groups, projects) {
  const tabs = groups.map((group, i) => `<button type="button" role="tab" id="skill-tab-${i}" aria-controls="skill-group-${i}">
    <span aria-hidden="true">${e(group.icon)}</span> ${e(group.short)}</button>`).join('');
  const sections = groups.map((group, i) => `<section class="skill-group" id="skill-group-${i}" data-tab-panel data-skill-group>
    <div class="skill-directory"><h3>${e(group.group)}</h3><div class="skill-keys">
    ${group.items.map((skill, j) => `<button type="button" aria-controls="skill-${i}-${j}" data-skill-key aria-pressed="${j === 0}">
    <span class="key-emoji" aria-hidden="true">${e(skill.emoji)}</span><span>${e(skill.name)}</span></button>`).join('')}</div></div>
    <div class="skill-inspector" aria-live="polite">${group.items.map((skill, j) => skillDetail(skill, group.group, `skill-${i}-${j}`, projects)).join('')}</div></section>`).join('');
  return panel('skills', heading('skills','Technical','toolkit','Choose a discipline and select a skill to see where it fits into my work.') +
    `<div data-tabs><div class="collection-filters" role="tablist" aria-label="Skill disciplines" hidden>${tabs}</div>${sections}</div>`);
}

function filters(items, label) {
  const categories = [...new Set(items.map(item => item.category))];
  return `<div class="collection-filters" role="group" aria-label="${e(label)}">
    ${['All', ...categories].map((category, i) => `<button type="button" data-filter="${i ? e(category) : ''}" aria-pressed="${!i}">${e(category)}</button>`).join('')}</div>`;
}

function previewAttrs({ href, preview, title, description, format }, group) {
  return `href="${e(href)}" ${external} data-lightbox="${e(group)}" data-preview="${e(preview)}"
    data-title="${e(title)}" data-caption="${e(description)}" data-format="${e(format)}"`;
}

function recognitionEvidence(item) {
  return item.artifacts.map(a => `<a class="evidence-print" ${previewAttrs({ ...a, title: a.label, description: item.description }, item.id)}>
    <img src="${e(a.preview)}" alt="" loading="lazy"><span>${e(a.label)} ${arrow}</span></a>`).join('');
}

function recognitionEntry(item, featured) {
  const meta = joinMeta(item.org, item.date);
  if (featured) return `<article class="award-feature" data-entry data-category="${e(item.category)}">
    <div class="award-copy"><span class="studio-kicker"><i></i>${e(meta)}</span><h3>${e(item.title)}</h3>
    <p>${e(item.description)}</p></div><div class="award-pair">${recognitionEvidence(item)}</div></article>`;
  return `<article class="archive-entry" data-entry data-category="${e(item.category)}">
    <details class="recognition-record"><summary>
    <span class="record-label">${e(item.category)}</span><strong>${e(item.title)}</strong><small>${meta}</small>
    <i class="disclosure-plus" aria-hidden="true"></i></summary>
    <div class="record-detail"><p>${e(item.description)}</p></div></details>
    ${item.artifacts.length ? `<div class="record-artifacts">${recognitionEvidence(item)}</div>` : ''}</article>`;
}

export function recognitionGallery(items) {
  const featured = items.find(item => item.id === 'ownership-excellence');
  return panel('recognition', heading('recognition','Recognition','& leadership','Awards, team leadership, and community work, with the records behind them.') +
    `<div data-collection>${filters(items, 'Recognition categories')}${featured ? recognitionEntry(featured, true) : ''}
    <div class="recognition-archive">${items.filter(item => item !== featured).map(item => recognitionEntry(item, false)).join('')}</div></div>`);
}

export function certificateGallery(items) {
  const cards = items.map(item => {
    const format = item.format ?? 'PDF';
    const badge = item.category === 'Agentic AI badges';
    return `<article class="certificate-card${badge ? ' badge-card' : ''}" data-entry data-category="${e(item.category)}">
    <a ${previewAttrs({ ...item, description: [item.issuer, item.date, item.description].filter(Boolean).join(' · '), format }, 'certificates')}>
    <div class="certificate-mount"><img src="${e(item.preview)}" alt="" loading="lazy"><span aria-hidden="true">⤢</span></div>
    <div class="certificate-info"><small>${joinMeta(item.issuer,item.date)}</small><h3>${e(item.title)}</h3>
    <span class="certificate-link">View ${badge ? 'badge' : 'certificate'} ${arrow}</span></div></a></article>`;
  }).join('');
  return panel('certifications', heading('certifications','Certifications','& badges','Agentic AI badges, engineering programs, coursework, and competition credentials.') +
    `<div data-collection><div class="certificate-tools">${filters(items, 'Credential categories')}
    <label class="certificate-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search credentials" placeholder="Search credentials" data-search></label></div>
    <div class="certificate-grid">${cards}</div>
    <p class="filter-feedback" role="status" data-feedback></p></div>`);
}

export const previewDialog = `<dialog class="evidence-dialog" aria-labelledby="preview-title"><div class="preview-toolbar">
  <h2 id="preview-title"></h2><button type="button" data-close aria-label="Close preview">×</button></div>
  <div class="preview-canvas"><img data-full-preview alt=""></div><div class="preview-footer">
  <p data-preview-caption></p><div class="preview-controls"><button type="button" data-previous aria-label="Previous artifact">←</button>
  <button type="button" data-next aria-label="Next artifact">→</button><a class="studio-cta" data-original ${external}>Open original ${arrow}</a></div></div></dialog>`;

function submittedWork(p) {
  if (!p.artifacts?.length) return '';
  const links = p.artifacts.map(a => `<a class="submission" href="${e(a.href)}" ${external}>
    ${a.preview ? `<img src="${e(a.preview)}" alt="" loading="lazy">` : `<span class="document-icon" aria-hidden="true">${e(a.format)}</span>`}
    <span><small>${e(a.format)}</small><strong>${e(a.label)}</strong></span>${arrow}</a>`).join('');
  return `<section id="artifacts"><h2>Submitted work</h2><div class="submission-list">${links}</div></section>`;
}

export function caseStudy(p, next) {
  return `<div class="case-study" data-project="${e(p.slug)}"><section class="study-cover"><div class="wrap">
    <a class="back-link" href="/#projects">← Project gallery</a><div class="study-lead"><div><span class="studio-kicker"><i></i>${e(p.category)}</span>
    ${p.slug === 'shabad-shazam' ? '<div class="study-script" lang="pa-Guru">ਸ਼ਬਦ</div>' : ''}<h1>${e(p.name)}</h1><p>${e(p.subtitle)}</p><div class="study-meta">${joinMeta(p.type,p.status)}</div>
    <ul class="study-stack" aria-label="Technologies">${p.tech.map(t => `<li>${e(t)}</li>`).join('')}</ul></div>
    <img src="${art(p)}" alt=""></div></div></section><div class="wrap case-body"><nav class="case-sidebar" aria-label="On this page">
    <h2>Case study</h2><a href="#overview">The question</a><a href="#contribution">My contribution</a><a href="#approach">Implementation</a>
    <a href="#results">Results</a>${p.artifacts?.length ? '<a href="#artifacts">Submitted work</a>' : ''}<a href="#reflection">Reflection</a></nav>
    <div class="case-text"><section id="overview"><span class="study-label">The question</span><h2>${e(p.question)}</h2><p>${e(p.context)}</p></section>
    <section id="contribution"><h2>My contribution</h2><p>${e(p.role)}</p></section><section id="approach"><h2>Implementation</h2>
    <ol class="study-flow" aria-label="${e(p.figureLabel)}">${p.flow.map(s => `<li>${e(s)}</li>`).join('')}</ol>
    ${p.work.map(w => `<article class="approach"><div><h3>${e(w.title)}</h3><p>${e(w.text)}</p></div></article>`).join('')}</section>
    <section id="results"><h2>Results</h2>${p.metric ? `<div class="result"><strong>${e(p.metric.value)}</strong><span>${e(p.metric.label)}</span></div>` : ''}
    <p>${e(p.outcome)}</p><div class="scope-note"><h3>Scope of the work</h3><p>${e(p.limits)}</p></div></section>${submittedWork(p)}
    <section id="reflection"><h2>Engineering reflection</h2><p>${e(p.takeaway)}</p></section></div></div>
    <div class="wrap next-project"><span class="study-label">Next case study</span><a href="${projectUrl(next)}">${e(next.name)} ${arrow}</a></div></div>`;
}
