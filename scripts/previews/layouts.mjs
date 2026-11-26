const compositions = new Set(['sidebar', 'wide']);
export function renderLayoutPreview(html, composition) {
  if (!compositions.has(composition)) return html;
  return html.replace('data-composition="sidebar"', `data-composition="${composition}"`)
    .replace(/href="(\/(?:projects\/[a-z-]+\/|resume\/)?)(#[a-z-]+)?"/g,
      (_, route, hash = '') => `href="${route}?layout=${composition}${hash}"`);
}

const layouts = [
  ['sidebar','Persistent profile','The desktop profile stays on the left. On a phone, a compact profile bar stays at the top.'],
  ['wide','Full-width gallery','Each section uses the full canvas. On a phone, the profile header scrolls with the section.']
];
const sections = ['Projects','Overview','Experience','Education','Skills','Recognition','Certifications'];
export function renderLayoutComparison() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex"><title>Portfolio layout comparison</title><style>
  *{box-sizing:border-box}body{margin:0;background:#11161b;color:#eff1eb;font:15px/1.55 "Segoe UI",Arial,sans-serif}
  main{width:min(1580px,100%);padding:clamp(20px,3vw,46px);margin:auto}h1,h2,p{margin:0}
  h1{font-size:clamp(32px,4.5vw,64px);font-weight:520;letter-spacing:-.06em;line-height:1.05}
  h1 em{color:#d9ef9d;font:italic 1em Georgia,serif}p{color:#b5bdbb}
  .tools,.buttons,header,.choice{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  header,.choice{justify-content:space-between;gap:14px}header{border-bottom:1px solid #343e43;padding-bottom:20px}
  header p{max-width:600px;margin-top:9px}.tools{margin-block:18px;gap:12px 24px}
  button,select{font:inherit;color:#eff1eb;background:#1e282d;border:1px solid #48545a;padding:7px 13px;border-radius:18px;cursor:pointer}
  button[aria-pressed=true]{background:#d9ef9d;color:#1d2516;border-color:#d9ef9d}label{display:flex;align-items:center;gap:9px}
  .options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}article{min-width:0;background:#1b2229;border:1px solid #364048;border-radius:17px;padding:14px}
  h2{font-size:1.17rem}.choice a{font-size:.8rem;color:#d9ef9d}.note{font-size:.85rem;margin:6px 0 14px}
  .screen{position:relative;width:100%;margin:auto;overflow:hidden;background:#11161b;border:1px solid #404950;border-radius:10px}
  iframe{border:0;position:absolute;left:0;top:0;transform-origin:0 0;background:#11161b}
  body.phone .screen{max-width:390px;border-radius:21px}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid #d9ef9d;outline-offset:3px}
  @media(max-width:730px){.options{grid-template-columns:1fr}article{padding:10px}.note{margin-bottom:8px}}
  </style></head><body><main><header><div><h1>Compare <em>layouts</em></h1><p>Choose a section and screen size to compare the two working portfolios.</p></div></header>
  <div class="tools"><div class="buttons" role="group" aria-label="Preview size"><button data-device="desktop" aria-pressed="true">Desktop</button><button data-device="phone" aria-pressed="false">Phone</button></div>
  <label>Section <select>${sections.map(name=>`<option value="${name.toLowerCase()}">${name}</option>`).join('')}</select></label></div>
  <div class="options">${layouts.map(([id,title,note])=>`<article data-mode="${id}"><div class="choice"><h2>${title}</h2><a href="/?layout=${id}#projects" target="_blank" rel="noopener">Open full size ↗</a></div><p class="note">${note}</p>
  <div class="screen"><iframe title="${title} preview" src="/?layout=${id}#projects"></iframe></div></article>`).join('')}</div></main>
  <script>
  const cards=[...document.querySelectorAll('article')],menu=document.querySelector('select'),buttons=[...document.querySelectorAll('[data-device]')];
  const params=new URLSearchParams(location.search);
  if([...menu.options].some(o=>o.value===params.get('section'))) menu.value=params.get('section');
  let phone=params.get('device')==='phone';
  function fit(){document.body.classList.toggle('phone',phone);for(const card of cards){const host=card.querySelector('.screen'),frame=card.querySelector('iframe');const w=phone?390:1366,h=phone?844:864;const scale=host.clientWidth/w;frame.style.width=w+'px';frame.style.height=h+'px';frame.style.transform='scale('+scale+')';host.style.height=(h*scale+2)+'px'}buttons.forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.device==='phone')===phone)))}
  function select(){for(const card of cards){const url='/?layout='+card.dataset.mode+'#'+menu.value;card.querySelector('a').href=url;card.querySelector('iframe').src=url}}
  buttons.forEach(b=>b.addEventListener('click',()=>{phone=b.dataset.device==='phone';fit()}));menu.addEventListener('change',select);
  if(menu.value!=='projects')select();new ResizeObserver(fit).observe(document.querySelector('.options'));fit();
  </script></body></html>`;
}
