import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml as e, heading, projectGallery, skillsGallery, recognitionGallery, certificateGallery, caseStudy, previewDialog } from './showcase.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'content/profile.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(root, 'content/projects.json'), 'utf8'));
const credentials = JSON.parse(fs.readFileSync(path.join(root, 'content/credentials.json'), 'utf8'));
const resumeUrl = '/assets/MS_Resume_Jagjeevan_FINAL.pdf';
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
function write(name, text) { const p = path.join(out, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); }
const arrow = '<span aria-hidden="true">↗</span>';

const icon = name => {
 const shapes = {
   overview: '<rect x="3" y="3" width="7" height="18" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="13" y="14" width="8" height="7" rx="2"/>',
   experience: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12q9 6 18 0M12 12v3"/>',
   education: '<path d="m2 9 10-5 10 5-10 5zM6 11v5q6 5 12 0v-5m4-2v7"/>',
   projects: '<path d="m3 7 9-4 9 4-9 4zM3 12l9 4 9-4m-18 5 9 4 9-4"/>',
   skills: '<path d="M4 6h6m4 0h6M4 12h11m4 0h1M4 18h2m4 0h10"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
   recognition: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
   certifications: '<circle cx="12" cy="9" r="6"/><path d="m9 9 2 2 4-4M8 14l-2 7 6-3 6 3-2-7"/>',
   email:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',linkedin:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/>',github:'<path d="M9 19c-5 1-5-3-7-3m14 5v-4c0-1-.3-2-1-2 4-.5 6-2 6-6 0-1-.5-3-1-3 0-1 0-3-.5-3-2 0-3 1-3 1-3-1-5-1-8 0 0 0-1-1-3-1-.5 0-.5 2-.5 3-1 1-1 2-1 3 0 4 2 5.5 6 6-.7.5-1 1-1 2v4"/>',resume:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/>',theme:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[name]+'</svg>';
};
const portrait = () => profile.photo ? '<img class="portrait" src="'+e(profile.photo)+'" alt="'+e(profile.name)+'" width="200" height="200">' : '<div class="portrait portrait-placeholder" role="img" aria-label="Profile photo placeholder"><svg viewBox="0 0 200 200" fill="none" aria-hidden="true"><circle cx="100" cy="76" r="30"/><path d="M40 173c0-58 120-58 120 0"/></svg></div>';
const brandLogo = (brand, label, symbolOnly=false) => '<span class="brand-frame brand-'+brand+'">'+(symbolOnly?'<span class="brand-symbol-window">':'')+'<img src="/assets/'+brand+(brand==='amdocs'?'-symbol.':'-logo.')+(brand==='amdocs'?'svg':'png')+'" alt="'+(label?e(label)+' logo':'')+'" width="56" height="56">'+(symbolOnly?'</span>':'')+'</span>';
const actions = () => '<div class="profile-actions">'+[['resume','View résumé',resumeUrl],['email','Email','mailto:'+profile.email],['linkedin','LinkedIn',profile.linkedin],['github','GitHub',profile.github]].map(([key,label,url])=>'<a class="action action-'+key+'" href="'+e(url)+'" aria-label="'+label+'" '+(key!=='email'?'target="_blank" rel="noopener noreferrer"':'')+'>'+icon(key)+'<span>'+label+'</span><b aria-hidden="true">↗</b></a>').join('')+'<button class="action theme-toggle" type="button" aria-label="Switch to light theme" aria-pressed="false">'+icon('theme')+'<span>Theme</span></button></div>';

function frame(title, description, route, body, isHome=false) {
  return `<!doctype html>
<html lang="en"${isHome ? ' data-composition="sidebar"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="author" content="${e(profile.name)}">
<meta name="theme-color" content="#111e2d"><link rel="canonical" href="${profile.url}${route}">
<meta property="og:type" content="website"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${profile.url}${route}"><meta property="og:site_name" content="${e(profile.name)}">
<meta name="twitter:card" content="summary"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/showcase.css">
<script src="/theme.js"></script></head><body class="${isHome?'home-page':'inner-page'}"><a class="skip" href="#main">Skip to content</a>
${isHome?'':`<header class="header"><div class="wrap nav"><a class="home-link" href="/">${e(profile.name)}</a><nav aria-label="Main navigation"><a href="/#projects">Projects</a><a href="/#experience">Experience</a><a href="/resume/">View Resume ${arrow}</a></nav></div></header>`}
<main id="main">${body}</main>
<footer><div class="wrap footer"><span>© ${new Date().getUTCFullYear()} ${e(profile.name)}</span><div><a href="${profile.github}">GitHub ${arrow}</a><a href="${profile.linkedin}">LinkedIn ${arrow}</a><a href="mailto:${profile.email}">Email ${arrow}</a></div><a href="#main">Back to top ↑</a></div></footer>
${isHome?'<script src="/overview.js" defer></script><script src="/tabs.js" defer></script><script src="/showcase.js" defer></script>':''}</body></html>`;
}
// Priorities control contribution order without appearing in the rendered page.
const experienceAreas = [...profile.experience.areas].sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));
const experienceRoles = [...profile.experience.roles].sort((a, b) => b.start.localeCompare(a.start));
const roleId = role => 'role-' + role.start;
const riseList = (items, label) => `<ol class="rise-list" aria-label="${e(label)}">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
function milestone(brand, period, title, organization) {
  return `${brandLogo(brand, '', brand === 'thapar')}<span class="rise-copy"><small>${e(period)}</small><strong>${e(title)}</strong>${organization ? `<span>${e(organization)} ${arrow}</span>` : ''}</span>`;
}
const overviewCareer = riseList([
  ...experienceRoles.map(role => `<a class="rise-stop" href="#${roleId(role)}">${milestone('amdocs', role.period, role.title, profile.experience.company)}</a>`),
  `<a class="rise-stop" href="#education">${milestone('thapar', profile.education.period, profile.education.degree, profile.education.school)}</a>`
], 'Career and education, most recent first');
const experienceCompany = `<div class="experience-company">
  <header class="experience-company-heading"><h3>${e(profile.experience.company)}</h3><p>${e(profile.experience.period)} · ${e(profile.experience.location)}</p></header>
  ${riseList(experienceRoles.map(role => `<details class="rise-role" id="${roleId(role)}"><summary class="rise-stop">${milestone('amdocs', role.period, role.title)}<i class="disclosure-plus" aria-hidden="true"></i></summary><p>${e(role.summary)}</p></details>`), 'Roles at Amdocs, most recent first')}
</div>`;
const experienceContributions = `<h3 class="experience-work-label">Work &amp; contributions</h3><div class="experience-contributions">${experienceAreas.map(area => `<details class="experience-contribution"><summary><span class="experience-title">${area.emoji?`<span class="experience-emoji" aria-hidden="true">${e(area.emoji)}</span>`:''}<span>${e(area.title)}</span></span><span class="experience-toggle" aria-hidden="true"></span></summary><p>${e(area.text)}</p></details>`).join('')}</div>`;
const educationCourses = profile.education.courses.map(course => typeof course==='string'?{ name:course, codes:[] }:course);
const coursework = `<h3 class="coursework-heading">UG Coursework</h3><ul class="course-cloud">${educationCourses.map(course => `<li><span class="course-name">${e(course.name)}</span>${profile.education.showCourseIds && course.codes?.length?`<span class="course-code">${course.codes.map(e).join(' · ')}</span>`:''}</li>`).join('')}</ul>`;
const skillLinks = profile.skills.flatMap((group, i) => group.items.map((skill, j) => ({
  ...skill, href: `#skill-${i}-${j}`
})));
const overviewSkills = profile.overviewSkills.map(name => {
  const skill = skillLinks.find(item => item.name === name);
  return `<li><a href="${skill.href}"><span aria-hidden="true">${e(skill.emoji)}</span>${e(skill.name)}</a></li>`;
}).join('');
const panelViews = `
<section class="panel-view profile-section" id="experience" data-panel="experience" aria-labelledby="panel-title-experience">${heading("experience", "Engineering", "experience", profile.experience.headline)}${experienceCompany}${experienceContributions}</section>
<section class="panel-view profile-section" id="education" data-panel="education" aria-labelledby="panel-title-education">${heading("education", "Academic", "foundations", profile.education.summary)}<article class="detail-card school-detail"><div class="school-wordmark"><img src="/assets/thapar-logo.png" alt="Thapar Institute of Engineering and Technology" width="176" height="85"></div><div class="school-info"><span class="eyebrow">${e(profile.education.period)}</span><h3>${e(profile.education.degree)}</h3><p class="school-name">${e(profile.education.school)}</p><p class="school-location">${e(profile.education.location)}</p><strong>${e(profile.education.grade)}</strong><p class="school-focus">${e(profile.education.focus)}</p></div></article>${coursework}</section>
${projectGallery(projects)}${skillsGallery(profile.skills, projects)}${recognitionGallery(credentials.recognition)}${certificateGallery(credentials.certifications)}`;
const home = `
<div class="studio-mast"><div class="studio-mast-inner"><a class="studio-identity" href="#overview">${portrait()}<span>${e(profile.name)}<small>Software developer</small></span></a>
<div class="studio-mast-actions"><a href="${resumeUrl}" target="_blank" rel="noopener noreferrer">${icon('resume')}<span>View résumé</span> ${arrow}</a><button class="theme-toggle" type="button" aria-label="Switch theme">${icon('theme')}</button></div></div></div>
<section class="landing" id="overview" aria-label="Profile overview"><div class="landing-grid">
<div class="profile-block"><div class="portrait-frame">${portrait()}</div><h1>Jagjeevan<br><em>Singh Soni</em></h1><div class="role-identity">${brandLogo('amdocs','Amdocs')}<p class="current-role">${e(profile.experience.current)} <span>at</span> <strong>${e(profile.experience.company)}</strong></p></div><p class="profile-location">${icon('pin')}${e(profile.location)}</p>${actions()}</div>
<div class="overview-panel" id="overview-panel" tabindex="0" role="region" aria-label="Portfolio sections">
<section class="panel-view profile-section is-active" data-panel="overview" aria-labelledby="panel-title-overview">
${heading("overview", "Professional", "overview", profile.intro)}
<div class="overview-content">
  <article class="overview-card career-foundations"><h3 class="overview-card-title">Career &amp; foundations</h3>${overviewCareer}<p class="overview-summary">${e(profile.overviewSummary)}</p></article>
  <aside class="overview-card overview-companion"><section class="technologies-card"><div class="card-label">${icon('skills')}<h3>Technologies &amp; skills</h3></div><ul class="skill-pills">${overviewSkills}</ul><a class="explore-skills" href="#skills">Explore the toolkit <span aria-hidden="true">→</span></a></section>
    <section class="testimonials"><span class="quote-mark" aria-hidden="true">“</span><div><h3>Testimonials</h3><p>Coming soon</p></div></section></aside>
</div>
<nav class="overview-contacts" aria-label="Contact Jagjeevan"><a href="mailto:${e(profile.email)}">Email ${arrow}</a><a href="${e(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ${arrow}</a><a href="${e(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></nav>
</section>${panelViews}</div></div></section>
<nav class="bottom-ribbon" aria-label="Portfolio sections">${[['overview','Overview'],['experience','Experience'],['education','Education'],['projects','Projects'],['skills','Skills'],['recognition','Recognition'],['certifications','Certifications']].map(([id,label],i)=>'<a href="#'+id+'" data-panel-target="'+id+'"'+(i===0?' aria-current="location"':'')+'>'+icon(id)+'<span>'+label+'</span></a>').join('')}</nav>
${previewDialog}`;
write('index.html', frame(`${profile.name} — Software Developer`, 'Software developer at Amdocs. Explore enterprise software experience and projects in audio recognition, EEG classification, computer vision, and web applications.', '/', home, true));
projects.forEach((p,i)=>{
 const next=projects[(i+1)%projects.length];
 const body=caseStudy(p, next);
 write(`projects/${p.slug}/index.html`,frame(`${p.name} — ${profile.name}`,p.summary,`/projects/${p.slug}/`,body));
});
const resume=`<section class="wrap section resume-page"><a class="back-link" href="/">← Back to portfolio</a><div class="resume-heading"><div><p class="eyebrow">Professional résumé</p><h1>${e(profile.name)}</h1><p>${e(profile.role)} · ${e(profile.location)}</p></div><a class="button dark" href="${resumeUrl}" target="_blank" rel="noopener noreferrer">View Resume ↗</a></div><p class="resume-summary">${e(profile.about)}</p><div class="resume-section"><h2>Experience</h2><h3>Amdocs · ${e(profile.experience.current)}</h3><p class="small-label">${e(profile.experience.period)} · Previously ${e(profile.experience.previous)}</p><ul>${experienceAreas.map(a=>`<li>${e(a.text)}</li>`).join('')}</ul></div><div class="resume-section"><h2>Education</h2><h3>${e(profile.education.degree)}</h3><p>${e(profile.education.school)} · ${e(profile.education.period)}<br>${e(profile.education.grade)} · ${e(profile.education.focus)}</p></div><div class="resume-section"><h2>Selected projects</h2>${projects.map(p=>`<article><h3><a href="/projects/${p.slug}/">${e(p.name)} ${arrow}</a></h3><p>${e(p.summary)}</p><p class="small-label">${p.tech.map(e).join(' · ')}<br>${e(p.status)}</p></article>`).join('')}</div><div class="resume-section"><h2>Technical skills</h2>${profile.skills.map(s=>`<p><strong>${e(s.group)}:</strong> ${s.items.map(skill => e(skill.name)).join(', ')}</p>`).join('')}</div><div class="resume-section"><h2>Recognition & leadership</h2>${credentials.recognition.map(x=>`<p><strong>${e(x.title)}</strong> · ${e(x.org)}<br>${e(x.description)}</p>`).join('')}</div><p><a href="mailto:${profile.email}">${profile.email}</a> · <a href="${profile.linkedin}">LinkedIn</a> · <a href="${profile.github}">GitHub</a></p></section>`;
write('resume/index.html',frame(`Résumé — ${profile.name}`,'Experience, education, projects, and technical skills. View the professional résumé as a PDF.','/resume/',resume));
write('404.html',frame(`Page not found — ${profile.name}`,'Return to the portfolio homepage.','/404.html',`<section class="wrap section not-found"><p class="eyebrow">404 / Page not found</p><h1>This page has<br>moved off course.</h1><p>You can find my experience and selected projects on the homepage.</p><a class="button dark" href="/">Back to the portfolio →</a></section>`));
write('.nojekyll','');
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${profile.url}/sitemap.xml\n`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/resume/',...projects.map(p=>`/projects/${p.slug}/`)].map(u=>`<url><loc>${profile.url}${u}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${projects.length+3} HTML pages in dist/`);
