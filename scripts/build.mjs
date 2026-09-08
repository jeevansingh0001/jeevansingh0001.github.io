import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'content/profile.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(root, 'content/projects.json'), 'utf8'));
const e = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const emoji = value => `<span class="emoji" aria-hidden="true">${value}</span>`;
const tags = items => `<ul class="tags" aria-label="Technologies">${items.map(t => `<li>${e(t)}</li>`).join('')}</ul>`;
const download = (className = 'button primary') => `<a class="${className}" href="${profile.resume.file}" download="${profile.resume.filename}">Download résumé <span aria-hidden="true">↓</span></a>`;
const icon = name => {
  const shapes = {
    code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    spark:'<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z"/>',
    terminal:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[name]+'</svg>';
};
const themeSwitch = '<div class="theme-switch" role="group" aria-label="Color theme"><button type="button" data-theme-choice="light" aria-pressed="false">'+icon('sun')+'<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="false">'+icon('moon')+'<span>Dark</span></button></div>';
const sections = [['overview','Overview','◌'],['experience','Experience','▣'],['education','Education','▤'],['work','Projects','◇'],['skills','Skills','⌘'],['recognition','Recognition','✧'],['community','Community','◎'],['contact','Contact','↗']];

fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
function write(name, text) {
  const target = path.join(out, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}

function frame(title, description, route, body) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="author" content="${e(profile.name)}">
<meta name="theme-color" content="#111e2d"><link rel="canonical" href="${profile.url}${route}">
<meta property="og:type" content="website"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${profile.url}${route}"><meta property="og:site_name" content="${e(profile.name)}"><meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><script src="/theme.js"></script><link rel="stylesheet" href="/styles.css"><script src="/navigation.js" defer></script><script src="/scroll.js" defer></script><script src="/tabs.js" defer></script>
</head><body><a class="skip" href="#main">Skip to content</a>
<header class="header"><div class="header-inner"><a class="identity" href="/" aria-label="${e(profile.name)} home"><span class="monogram" aria-hidden="true">JJ<span>.</span></span><span class="identity-name">${e(profile.name)}<small>Software Developer</small></span></a><nav class="header-links" aria-label="Profile links"><a href="${profile.github}">GitHub ${arrow}</a><a href="${profile.linkedin}">LinkedIn ${arrow}</a>${themeSwitch}${download('button small')}</nav></div></header>
<main id="main">${body}</main>
<footer><div class="footer-inner"><span>© ${new Date().getUTCFullYear()} ${e(profile.name)}</span><a href="#main">Back to top ↑</a></div></footer>
</body></html>`;
}

function sectionHead(number, title, description = '') {
  return `<div class="section-head"><div>${number ? `<span class="section-number">${number}</span>` : ''}<h2>${title}</h2></div>${description ? `<p>${description}</p>` : ''}</div>`;
}
function journey(project) {
  return `<div class="journey" role="group" aria-label="How ${e(project.name)} works"><p class="eyebrow">How it works</p><ol>${project.journey.map((step,index) => `<li>${emoji(step.icon)}<div><strong>${e(step.title)}</strong><p>${e(step.text)}</p></div>${index < project.journey.length-1 ? '<span class="journey-connector" aria-hidden="true">↓</span>' : ''}</li>`).join('')}</ol></div>`;
}
function projectCard(project, index) {
  return `<article class="project-card" id="project-${project.slug}" data-accent="${e(project.accent)}">
<div class="project-heading"><span class="project-icon">${emoji(project.icon)}</span><div><p class="eyebrow">${e(project.category)}</p><h3><a href="/projects/${project.slug}/">${e(project.name)}</a></h3></div><span class="project-index">0${index+1}</span></div>
<div class="project-body"><div class="project-copy"><h4>${e(project.subtitle)}</h4><p>${e(project.summary)}</p><dl class="project-facts"><div><dt>My contribution</dt><dd>${e(project.plainRole)}</dd></div><div><dt>Result</dt><dd>${e(project.plainResult)}</dd></div></dl>${tags(project.tech)}</div>${journey(project)}</div>
<div class="project-footer"><span class="project-type">${e(project.type)}</span><a class="text-link" href="/projects/${project.slug}/">Explore ${e(project.name)} <span aria-hidden="true">→</span></a></div></article>`;
}

const overview = `<section class="panel overview" id="overview" data-section>
<div class="intro-heading"><p class="eyebrow">Software development · Enterprise telecom</p><span class="location">${e(profile.location)}</span></div><h1>Jagjeevan Singh Soni<span class="accent-dot">.</span></h1><p class="resume-summary">${e(profile.summary)}</p><div class="intro-actions"><a class="button primary" href="#work">Explore projects <span aria-hidden="true">↓</span></a><a class="button secondary" href="#experience">View experience <span aria-hidden="true">→</span></a></div>
<div class="profile-facts"><div><span>Currently</span><strong>Software Developer</strong><a href="#experience">Amdocs →</a></div><div><span>Education</span><strong>B.E. Computer Engineering</strong><a href="#education">Thapar Institute →</a></div><div><span>Selected work</span><strong>Four project case studies</strong><a href="#work">From audio to applications →</a></div></div></section>`;
const experience = `<section class="panel timeline-entry" id="experience" data-section><a class="timeline-logo company-logo" href="https://www.amdocs.com/" aria-label="Amdocs official website"><img src="/assets/amdocs-logo.svg" alt="Amdocs" width="80" height="48" loading="lazy"></a>${sectionHead('','Professional experience')}<div class="timeline-meta"><p class="timeline-date"><time datetime="2023-12">December 2023</time><span aria-hidden="true"> — </span><span>Present</span></p><span class="timeline-current">Current</span></div><div class="employer"><div><h3><a href="https://www.amdocs.com/">${e(profile.experience.company)}</a></h3><p>${e(profile.location)}</p></div></div><p class="roles"><strong>${e(profile.experience.current)}</strong><span>Previously ${e(profile.experience.previous)}</span></p><div class="experience-work" data-tabs><div class="work-tabs" role="tablist" aria-label="Projects and contributions at Amdocs" hidden>${profile.experience.areas.map((item,index) => `<button type="button" role="tab" id="work-tab-${index}" aria-controls="work-detail-${index}" aria-selected="false" tabindex="-1">${e(item.title)}<span aria-hidden="true">↗</span></button>`).join('')}</div><div class="work-details">${profile.experience.areas.map((item,index) => `<article class="work-detail" id="work-detail-${index}" data-tab-panel><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div></div></section>`;
const work = `<section class="project-section" id="work" data-section>${sectionHead('03','Projects','What I built, how it works, and where the work stands.')}<nav class="project-jump" aria-label="Jump to a project">${projects.map(p => `<a href="#project-${p.slug}" data-accent="${e(p.accent)}">${emoji(p.icon)} ${e(p.name)}</a>`).join('')}</nav><div class="project-list">${projects.map(projectCard).join('')}</div></section>`;
const education = `<section class="panel timeline-entry" id="education" data-section><a class="timeline-logo university-logo" href="https://www.thapar.edu/" aria-label="Thapar Institute official website"><img src="/assets/thapar-logo.png" alt="Thapar Institute of Engineering and Technology" width="80" height="64" loading="lazy"></a>${sectionHead('02','Education')}<div class="timeline-meta"><p class="timeline-date"><time datetime="2019-07">July 2019</time><span aria-hidden="true"> — </span><time datetime="2023-06">June 2023</time></p></div><div class="education-heading"><div><h3>${e(profile.education.degree)}</h3><p><a href="https://www.thapar.edu/">${e(profile.education.school)}</a></p><p class="muted">${e(profile.education.location)}</p></div><div class="grade"><strong>7.71</strong><span>/ 10 CGPA</span></div></div><p class="focus">${e(profile.education.focus)}</p><div class="coursework"><h3>Relevant coursework</h3><ul>${profile.education.courses.map(course => `<li>${e(course)}</li>`).join('')}</ul></div></section>`;
const skills = `<section class="panel" id="skills" data-section>${sectionHead('04','Technical skills')}<div class="skills-grid">${profile.skills.map((group,index) => `<article class="skill-card skill-${index}"><div class="skill-heading"><span class="skill-icon">${icon(group.icon)}</span><h3>${e(group.group)}</h3></div><p>${e(group.description)}</p>${tags(group.items)}</article>`).join('')}</div><p class="languages">Spoken languages: English · Punjabi · Hindi</p></section>`;
const recognition = `<section class="panel" id="recognition" data-section>${sectionHead('05','Recognition & learning')}<div class="recognition-grid">${profile.recognition.map(item => `<article><span class="recognition-icon" aria-hidden="true">✧</span><div><p class="eyebrow">${e(item.org)}</p><h3>${e(item.title)}</h3><p>${e(item.text)}</p></div></article>`).join('')}</div></section>`;
const community = `<section class="panel" id="community" data-section>${sectionHead('06','Leadership & community')}<div class="community-list">${profile.community.map(item => `<article><div><h3>${e(item.title)}</h3><p class="muted">${e(item.org)}</p></div><p>${e(item.text)}</p></article>`).join('')}</div></section>`;
const contact = `<section class="panel contact" id="contact" data-section><p class="eyebrow">Get in touch</p><h2>Let’s connect.</h2><p>For software engineering, graduate study, or a conversation about a project.</p><a class="email-link" href="mailto:${profile.email}">${profile.email} ${arrow}</a><div class="contact-links"><a href="${profile.linkedin}">LinkedIn ${arrow}</a><a href="${profile.github}">GitHub ${arrow}</a><a href="/resume/">View résumé ${arrow}</a></div></section>`;
const home = `<div class="site-layout"><aside class="section-nav"><nav aria-label="On this page"><p class="eyebrow">On this page</p>${sections.map(([id,label]) => `<a href="#${id}" data-section-link${id==='overview'?' aria-current="location"':''}>${label}</a>`).join('')}</nav></aside><div class="page-content">${overview}<div class="career-timeline">${experience}${education}</div>${work}${skills}${recognition}${community}${contact}</div></div>`;
write('index.html',frame(`${profile.name} — Software Developer`,'Explore Jagjeevan Singh Soni’s experience at Amdocs and clear case studies in audio recognition, EEG classification, driver monitoring, and web development.','/',home));

projects.forEach((project,index) => {
  const next=projects[(index+1)%projects.length];
  const caseLinks=[['overview','Overview'],['contribution','My contribution'],['approach','How it works'],['results','Results & scope'],['reflection','Reflection']];
  const body=`<div class="site-layout case-layout" data-accent="${e(project.accent)}"><aside class="section-nav"><a class="back-link" href="/#project-${project.slug}">← All projects</a><nav aria-label="Case study sections"><p class="eyebrow">In this case study</p>${caseLinks.map(([id,label])=>`<a href="#${id}" data-section-link>${label}</a>`).join('')}</nav><nav class="other-projects" aria-label="Other projects"><p class="eyebrow">Projects</p>${projects.map(p=>`<a href="/projects/${p.slug}/"${p.slug===project.slug?' aria-current="page"':''}>${emoji(p.icon)} ${e(p.name)}</a>`).join('')}</nav></aside><div class="page-content">
<section class="panel case-overview" id="overview" data-section><div class="case-heading"><span class="project-icon">${emoji(project.icon)}</span><p class="eyebrow">${e(project.category)}</p></div><h1>${e(project.name)}</h1><p class="case-subtitle">${e(project.subtitle)}</p><p>${e(project.summary)}</p><div class="case-meta"><span class="project-type">${e(project.type)}</span></div>${tags(project.tech)}<div class="input-output"><div><span>Input</span><strong>${e(project.input)}</strong></div><span aria-hidden="true">→</span><div><span>Output</span><strong>${e(project.output)}</strong></div></div></section>
<section class="panel" id="contribution" data-section>${sectionHead('01','My contribution')}<p>${e(project.role)}</p><details class="context-details"><summary>Project background <span aria-hidden="true">+</span></summary><p>${e(project.context)}</p></details></section>
<section class="panel" id="approach" data-section>${sectionHead('02','How it works')}${journey(project)}<div class="technical-steps">${project.work.map((step,i)=>`<article><span class="item-number">0${i+1}</span><div><h3>${e(step.title)}</h3><p>${e(step.text)}</p></div></article>`).join('')}</div></section>
<section class="panel" id="results" data-section>${sectionHead('03','Results & scope')}${project.metric?`<div class="result"><strong>${e(project.metric.value)}</strong><span>${e(project.metric.label)}</span></div>`:''}<p>${e(project.outcome)}</p><div class="scope-note"><h3>What this result covers</h3><p>${e(project.plainLimit)}</p></div></section>
<section class="panel" id="reflection" data-section>${sectionHead('04','Engineering reflection')}<p>${e(project.takeaway)}</p></section>
<a class="next-project panel" href="/projects/${next.slug}/"><div><span class="eyebrow">Next project</span><strong>${emoji(next.icon)} ${e(next.name)}</strong></div><span aria-hidden="true">→</span></a></div></div>`;
  write(`projects/${project.slug}/index.html`,frame(`${project.name} — ${profile.name}`,project.summary,`/projects/${project.slug}/`,body));
});
const resume=`<div class="single-page"><a class="back-link" href="/">← Back to portfolio</a><section class="panel resume-page"><div class="resume-heading"><div><p class="eyebrow">Résumé</p><h1>${e(profile.name)}</h1><p>${e(profile.role)} · ${e(profile.location)}</p></div></div><p class="resume-summary">${e(profile.summary)}</p><div class="pdf-toolbar"><span>Master résumé · ${profile.resume.pages} pages</span><a href="${profile.resume.file}">Open PDF ${arrow}</a></div><iframe class="pdf-viewer" src="${profile.resume.file}" title="Jagjeevan Singh Soni — master résumé PDF"></iframe><p class="pdf-fallback">If your browser cannot display the PDF, <a href="${profile.resume.file}">open it here</a> or download it from the header.</p></section></div>`;
write('resume/index.html',frame(`Résumé — ${profile.name}`,'View and download Jagjeevan Singh Soni’s master résumé.','/resume/',resume));
write('404.html',frame(`Page not found — ${profile.name}`,'Return to the portfolio homepage.','/404.html',`<div class="single-page"><section class="panel not-found"><p class="eyebrow">404 / Page not found</p><h1>Let’s get you<br>back on track.</h1><p>Explore my experience, projects, and résumé from the homepage.</p><a class="button primary" href="/">Back to portfolio →</a></section></div>`));
write('.nojekyll','');
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${profile.url}/sitemap.xml\n`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/resume/',...projects.map(p=>`/projects/${p.slug}/`)].map(url=>`<url><loc>${profile.url}${url}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${projects.length+3} HTML pages in dist/`);
