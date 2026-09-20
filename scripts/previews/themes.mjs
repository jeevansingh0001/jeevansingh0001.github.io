// Local review routes only: these assets are never copied to dist/.
export const palettes = {
  graphite: { name: 'Graphite & Ice', note: 'Neutral charcoal, cool silver, and crisp white.', mode: 'dark', dark: ['#141518','#23252b','#f4f5f7','#b5b8c1','#c4d6ee'], light: ['#f3f4f6','#ffffff','#20232a','#59616e','#405f86'] },
  ivory: { name: 'Ivory & Bronze', note: 'Warm ivory with restrained bronze detailing.', mode: 'light', dark: ['#211c19','#302823','#f5eee5','#c7b9aa','#d9b58b'], light: ['#f5f1e9','#fffdf8','#302921','#756554','#8c5d31'] },
  teal: { name: 'Deep Teal', note: 'Rich green, soft mint, and cool porcelain.', mode: 'dark', dark: ['#102323','#1b3636','#edf8f5','#aec8c2','#8ed8c3'], light: ['#edf5f2','#ffffff','#183c36','#526e66','#276e5c'] },
  violet: { name: 'Midnight Violet', note: 'Inky plum, muted lavender, and pearl white.', mode: 'dark', dark: ['#1c1928','#2c273d','#f3effa','#bfb6cf','#c9b6ed'], light: ['#f3eff8','#ffffff','#30283e','#6b5f7a','#77559f'] }
};

export const paletteCSS = Object.entries(palettes).flatMap(([id, palette]) => ['dark','light'].map(mode => {
  const [bg, surface, text, muted, accent] = palette[mode];
  return `html[data-palette="${id}"][data-theme="${mode}"] { --palette-bg:${bg}; --palette-surface:${surface}; --palette-text:${text}; --palette-muted:${muted}; --palette-accent:${accent}; }`;
})).join('\n') + `
html[data-palette] .home-page {
  --home-text: var(--palette-text); --home-muted: var(--palette-muted);
  --overview-accent: var(--palette-accent); --lime: var(--palette-accent);
  --glass: color-mix(in srgb, var(--palette-surface) 76%, transparent);
  --glass-line: color-mix(in srgb, var(--palette-muted) 22%, transparent);
  background: radial-gradient(ellipse at 4% 10%, color-mix(in srgb, var(--palette-accent) 9%, transparent), transparent 48%), var(--palette-bg);
  color: var(--palette-text);
}
html[data-palette] .overview-panel { background: linear-gradient(145deg, color-mix(in srgb, var(--palette-surface) 94%, transparent), color-mix(in srgb, var(--palette-surface) 40%, transparent)); border-color: var(--glass-line); box-shadow: 0 24px 75px #00000010; }
html[data-palette] .overview-card { background: var(--glass); border-color: var(--glass-line); }
html[data-palette] .overview-card:hover { border-color: color-mix(in srgb, var(--palette-accent) 45%, transparent); }
html[data-palette] .journey-card { background: linear-gradient(125deg, color-mix(in srgb, var(--palette-accent) 6%, transparent), var(--glass)); }
html[data-palette] .current-role strong, html[data-palette] .card-symbol, html[data-palette] .panel-symbol { color: var(--palette-accent); }
html[data-palette] .portrait-frame, html[data-palette] .brand-frame { border-color: color-mix(in srgb, var(--palette-accent) 30%, transparent); box-shadow: 0 0 40px color-mix(in srgb, var(--palette-accent) 5%, transparent); }
html[data-palette] .action { background: var(--glass); color: var(--palette-text); }
html[data-palette] .action-email { background: var(--palette-accent); color: var(--palette-bg); border-color: var(--palette-accent); }
html[data-palette] .action:hover { background: color-mix(in srgb, var(--palette-accent) 14%, var(--palette-surface)); }
html[data-palette] .action-email:hover { background: var(--palette-accent); }
html[data-palette] .journey-current::before { background: linear-gradient(to top, color-mix(in srgb, var(--palette-accent) 20%, transparent), var(--palette-accent)); }
html[data-palette] .journey-current .journey-marker { box-shadow: 0 0 0 5px color-mix(in srgb, var(--palette-accent) 10%, transparent); }
html[data-palette] .bottom-ribbon, html[data-palette] .scroll-header { background: var(--palette-surface); border-color: var(--glass-line); }
html[data-palette] .bottom-ribbon a { color: var(--palette-muted); }
html[data-palette] .bottom-ribbon a[aria-current], html[data-palette] .bottom-ribbon a:hover { color: var(--palette-accent); }
html[data-palette] .action:focus-visible, html[data-palette] .bottom-ribbon a:focus-visible, html[data-palette] .overview-panel:focus-visible { outline-color: var(--palette-accent); }
`;

export function renderThemeOptions() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portfolio — Color options</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f5f5f7;color:#202124;font-family:Inter,'Segoe UI',Arial,sans-serif;line-height:1.6}main{max-width:1440px;margin:auto;padding:48px 36px 60px}header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:34px}.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#767982}h1{font-size:clamp(30px,4vw,48px);line-height:1.15;letter-spacing:-.045em;margin:10px 0 16px;font-weight:600}header p{max-width:670px;margin:0;color:#62656d}a{color:inherit;text-decoration:none}a:hover{text-decoration:underline}a:focus-visible{outline:3px solid #426fa5;outline-offset:5px}.back{white-space:nowrap;font-size:13px;border:1px solid #d7d9de;padding:10px 18px;border-radius:24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}.option{border:1px solid #dddfe4;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 8px 30px #20212405}.miniature{position:relative;aspect-ratio:1200/850;overflow:hidden;background:#e9eaed;pointer-events:none}.miniature iframe{position:absolute;top:0;left:0;width:1200px;height:850px;border:0;transform:scale(var(--preview-scale,.4));transform-origin:top left}.copy{padding:22px 24px}.title-row{display:flex;gap:12px;justify-content:space-between;align-items:center}h2{font-size:21px;letter-spacing:-.025em;margin:0;font-weight:600}.swatches{display:flex;gap:5px}.swatches span{display:block;width:19px;height:19px;border-radius:50%;border:1px solid #00000016}.copy p{margin:8px 0 20px;color:#6a6d75;font-size:14px}.links{display:flex;gap:10px;flex-wrap:wrap}.links a{border-radius:18px;background:#f0f1f4;padding:7px 14px;font-size:12px}.links a.primary{background:#25272c;color:#fff}.note{font-size:12px;color:#777b83;margin-top:28px}@media(max-width:760px){main{padding:30px 16px}.grid{grid-template-columns:1fr}header{display:block}.back{display:inline-block;margin-top:20px}.copy{padding:18px}h2{font-size:19px}}
  </style></head><body><main><header><div><span class="eyebrow">Portfolio / Color study</span><h1>Four distinct directions.</h1><p>The same portfolio, shown in four new palettes. Open a full preview to try the animation and navigation. Each option includes a light and dark version.</p></div><a class="back" href="/">Current portfolio ↗</a></header><div class="grid">
  ${Object.entries(palettes).map(([id,p]) => `<article class="option"><div class="miniature" aria-hidden="true" inert><iframe title="${p.name} miniature" tabindex="-1" src="/?palette=${id}&mode=${p.mode}&thumbnail=1"></iframe></div><div class="copy"><div class="title-row"><h2>${p.name}</h2><div class="swatches" aria-label="Palette swatches">${p[p.mode].filter((_,i)=>i!==3).map(color=>`<span style="background:${color}"></span>`).join('')}</div></div><p>${p.note}</p><div class="links"><a class="primary" href="/?palette=${id}&mode=${p.mode}" target="_blank" rel="noopener">Open ${p.name} ↗</a><a href="/?palette=${id}&mode=light" target="_blank" rel="noopener">Light</a><a href="/?palette=${id}&mode=dark" target="_blank" rel="noopener">Dark</a></div></div></article>`).join('')}
  </div><p class="note">Local design previews. No palette is selected or applied to the live portfolio.</p></main><script>const observer = new ResizeObserver(entries => entries.forEach(({target, contentRect}) => target.style.setProperty('--preview-scale', contentRect.width / 1200))); document.querySelectorAll('.miniature').forEach(element => observer.observe(element));</script></body></html>`;
}
