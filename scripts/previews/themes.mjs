// Local review routes only: these assets are never copied to dist/.
export const palettes = {
  graphite: { name: 'Graphite & Ice', note: 'Neutral charcoal, cool silver, and crisp white.', mode: 'dark', dark: ['#141518','#23252b','#f4f5f7','#b5b8c1','#c4d6ee'], light: ['#f3f4f6','#ffffff','#20232a','#59616e','#405f86'] },
  ivory: { name: 'Ivory & Bronze', note: 'Warm ivory with restrained bronze detailing.', mode: 'light', dark: ['#211c19','#302823','#f5eee5','#c7b9aa','#d9b58b'], light: ['#f5f1e9','#fffdf8','#302921','#756554','#8c5d31'] },
  teal: { name: 'Deep Teal', note: 'Rich green, soft mint, and cool porcelain.', mode: 'dark', dark: ['#102323','#1b3636','#edf8f5','#aec8c2','#8ed8c3'], light: ['#edf5f2','#ffffff','#183c36','#526e66','#276e5c'] },
  violet: { name: 'Midnight Violet', note: 'Inky plum, muted lavender, and pearl white.', mode: 'dark', dark: ['#1c1928','#2c273d','#f3effa','#bfb6cf','#c9b6ed'], light: ['#f3eff8','#ffffff','#30283e','#6b5f7a','#77559f'] }
};

// Keep previous palette URLs available while the review page presents the new shortlist.
const shortlist = ['lagoon', 'porcelain', 'afterglow'];
Object.assign(palettes, {
  lagoon: { name: 'Midnight Lagoon', note: 'Deep navy, sea glass and glacier blue.', mode: 'dark',
    dark: ['#0b1825','#14293b','#edf7fb','#afc5d2','#83e4e1'], light: ['#e9f4f6','#f8ffff','#102e39','#435e6a','#006c74'], sheen: '#67b6fc' },
  porcelain: { name: 'Porcelain & Copper', note: 'Warm porcelain with a burnished copper edge.', mode: 'light',
    dark: ['#221b19','#362b28','#fff4e8','#d4bfb2','#f4b58d'], light: ['#f4eee5','#fffaf3','#372a24','#69594f','#964724'], sheen: '#edb783' },
  afterglow: { name: 'Orchid Afterglow', note: 'Black plum, orchid and a rose reflection.', mode: 'dark',
    dark: ['#1b1426','#302238','#f9f0fc','#cdbacf','#ecaaec'], light: ['#f5edf5','#fff8fc','#37273b','#69546c','#8a377e'], sheen: '#fa8a9b' }
});

export const paletteCSS = Object.entries(palettes).flatMap(([id, p]) =>
  ['dark', 'light'].map(mode => {
    const [bg, panel, text, muted, accent] = p[mode];
    return `html[data-palette="${id}"][data-theme="${mode}"] {
      --studio-bg: ${bg}; --studio-panel: ${panel}; --studio-text: ${text}; --studio-muted: ${muted};
      --studio-accent: ${accent}; --studio-ink: ${bg};
      --studio-line: color-mix(in srgb, ${muted} 30%, ${panel});
      --studio-raised: color-mix(in srgb, ${panel} 90%, ${muted});
      --palette-sheen: ${p.sheen || accent};
      --glass-wash: color-mix(in srgb, var(--palette-sheen) 23%, transparent);
      --lime: ${accent};
    }`;
  })).join('\n') + `
html[data-palette] :is(.home-page, .inner-page) {
  --home-text: var(--studio-text); --home-muted: var(--studio-muted);
  --overview-accent: var(--studio-accent); --ink: var(--studio-text); --muted: var(--studio-muted);
  --paper: var(--studio-bg); --line: var(--studio-line);
  color: var(--studio-text); background-color: var(--studio-bg);
  background-image: radial-gradient(ellipse at 4% 0, color-mix(in srgb, var(--palette-sheen) 13%, transparent), transparent 52%),
    radial-gradient(ellipse at 96% 100%, color-mix(in srgb, var(--studio-accent) 8%, transparent), transparent 48%);
}
html[data-palette] .current-role strong { color: var(--studio-accent); }
html[data-palette][data-layout="sidebar"] .overview-panel { background: transparent; box-shadow: none; }
html[data-palette] .brand-frame { border-color: color-mix(in srgb, var(--studio-accent) 30%, transparent); }
html[data-palette] .inner-page :is(.header, footer) { background: var(--studio-panel); color: var(--studio-text); }
html[data-palette] .grade, html[data-palette] .inner-page .small-label { color: var(--studio-muted); }
`;

// Runs only in the local portfolio preview. Preserve the chosen palette on internal page links.
export function renderPalettePreview(html, id, requestedMode) {
  const mode = ['light','dark'].includes(requestedMode) ? requestedMode : palettes[id].mode;
  return html.replace('</head>', `<link rel="stylesheet" href="/__preview/palettes.css"><script>
    const previewRoot = document.documentElement;
    previewRoot.dataset.palette = '${id}';
    previewRoot.dataset.theme = '${mode}';
    function syncPreviewLinks() {
      const mode = previewRoot.dataset.theme;
      for (const link of document.querySelectorAll('a[href^="/"]')) {
        const url = new URL(link.href);
        if (url.origin !== location.origin || !url.pathname.endsWith('/')) continue;
        url.searchParams.set('palette', '${id}');
        url.searchParams.set('mode', mode);
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
      const url = new URL(location.href);
      url.searchParams.set('mode', mode);
      history.replaceState(history.state, '', url);
    }
    document.addEventListener('DOMContentLoaded', () => {
      syncPreviewLinks();
      new MutationObserver(syncPreviewLinks).observe(previewRoot, {attributes:true, attributeFilter:['data-theme']});
    });
  </script></head>`);
}

export function renderThemeOptions() {
  const first = palettes[shortlist[0]];
  const firstURL = '/?palette=' + shortlist[0] + '&mode=' + first.mode;
  const options = shortlist.map((id, i) => {
    const p = palettes[id], [bg, , , , accent] = p[p.mode];
    return `<label class="choice" style="--sample:${bg};--tint:${accent};--sheen:${p.sheen}">
      <input type="radio" name="palette" value="${id}" data-mode="${p.mode}" ${i === 0 ? 'checked' : ''}>
      <i aria-hidden="true"></i><span><strong>${p.name}</strong><small>${p.note}</small></span></label>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex"><title>Portfolio theme previews</title><style>
    *{box-sizing:border-box}body{margin:0;color:#e8eaee;background:#111418;font:15px/1.45 "Segoe UI",Arial,sans-serif}
    main{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100dvh}
    aside{padding:30px 18px;background:#181c21;border-right:1px solid #353941}h1{font-size:1.65rem;line-height:1.1;letter-spacing:-.045em;margin:0 0 24px;font-weight:580}
    fieldset{border:0;margin:0;padding:0}legend{position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden}
    .choice{position:relative;display:grid;grid-template-columns:32px 1fr;gap:11px;align-items:center;padding:12px 10px;margin:6px 0;border:1px solid transparent;border-radius:13px;cursor:pointer}
    .choice input{position:absolute;opacity:0;width:1px;height:1px}.choice:has(:checked){background:#ffffff0c;border-color:color-mix(in srgb,var(--tint) 62%,#555)}
    .choice:has(:focus-visible),a:focus-visible,button:focus-visible{outline:2px solid #acd5ff;outline-offset:2px}
    .choice i{width:32px;height:32px;border-radius:50%;background:radial-gradient(ellipse at 27% 13%,#fff9,transparent 38%),linear-gradient(145deg,var(--tint),var(--sample) 54%,var(--sheen));box-shadow:inset 0 0 0 1px #ffffff47}
    strong,small{display:block}strong{font-size:.88rem}small{margin-top:3px;color:#b1b6c0;line-height:1.45}
    .viewer{min-width:0;padding:16px;display:flex;flex-direction:column;gap:12px;background:#101216}
    .tools,.sizes{display:flex;align-items:center;gap:4px}.tools{justify-content:space-between;gap:12px}.sizes{padding:3px;background:#20242a;border:1px solid #393e48;border-radius:24px}
    button,a{font:inherit;color:inherit}button{border:0;background:transparent;color:#c1c6cf;border-radius:20px;padding:7px 13px;font-size:.8rem;cursor:pointer}button[aria-pressed=true]{background:#454c55;color:white}
    a{font-size:.82rem;text-decoration:none}a:hover{text-decoration:underline}
    iframe{display:block;width:100%;height:calc(100dvh - 88px);min-height:420px;margin:0 auto;border:1px solid #41464f;border-radius:16px;background:#11161b}
    iframe.phone{max-width:392px}
    @media(max-width:800px){main{display:block}aside{padding:14px;border:0}h1{font-size:1.3rem;margin:0 0 8px}fieldset{display:flex;gap:4px}.choice{flex:1;display:flex;gap:6px;margin:0;padding:7px}.choice i{width:16px;height:16px;flex:none}.choice strong{font-size:.75rem}.choice small{display:none}.viewer{padding:8px}.tools{padding:0 3px}iframe{height:calc(100dvh - 154px)}}
    </style></head><body><main><aside><h1>Theme previews</h1><fieldset><legend>Portfolio theme</legend>${options}</fieldset></aside>
    <section class="viewer" aria-label="Interactive portfolio"><div class="tools"><div class="sizes" role="group" aria-label="Preview size">
    <button type="button" data-size="full" aria-pressed="true">Full width</button><button type="button" data-size="phone" aria-pressed="false">Phone</button></div>
    <a id="open" href="${firstURL}" target="_blank" rel="noopener">Open full preview ↗</a></div>
    <iframe title="Interactive portfolio preview" src="${firstURL}"></iframe></section></main><script>
    const frame = document.querySelector('iframe');
    const full = document.querySelector('#open');
    function previewURL() { return new URL(frame.contentWindow.location.href); }
    frame.addEventListener('load', () => {
      full.href = previewURL();
      frame.contentWindow.addEventListener('hashchange', () => { full.href = previewURL(); });
    });
    full.addEventListener('click', () => { full.href = previewURL(); });
    for (const radio of document.querySelectorAll('input[name=palette]')) radio.addEventListener('change', () => {
      const url = previewURL();
      url.searchParams.set('palette', radio.value); url.searchParams.set('mode', radio.dataset.mode);
      frame.src = url; full.href = url;
    });
    for (const button of document.querySelectorAll('[data-size]')) button.addEventListener('click', () => {
      for (const item of document.querySelectorAll('[data-size]')) item.setAttribute('aria-pressed', String(item === button));
      frame.classList.toggle('phone', button.dataset.size === 'phone');
    });
    </script></body></html>`;
}
