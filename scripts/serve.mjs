import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { palettes, paletteCSS, renderThemeOptions } from './previews/themes.mjs';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
 let url, parsed;try{parsed=new URL(req.url,'http://localhost');url=decodeURIComponent(parsed.pathname)}catch{res.writeHead(400);res.end('Invalid URL');return}
 if(url==='/theme-options/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(renderThemeOptions());return}
 if(url==='/__preview/palettes.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-store'});res.end(paletteCSS);return}
 let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 if(url.endsWith('/'))file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return}
 const palette=parsed.searchParams.get('palette');
 if(url==='/' && Object.hasOwn(palettes,palette)){
  const requestedMode=parsed.searchParams.get('mode');
  const mode=['light','dark'].includes(requestedMode)?requestedMode:palettes[palette].mode;
  const still=parsed.searchParams.get('thumbnail')==='1'?'<style>*{animation:none!important;transition:none!important}[data-reveal],.journey-step{opacity:1!important;transform:none!important;filter:none!important}.journey-current::before{transform:none!important}.journey-timeline::after{opacity:1!important}</style>':'';
  const injection=`<link rel="stylesheet" href="/__preview/palettes.css">${still}<script>document.documentElement.dataset.palette='${palette}';document.documentElement.dataset.theme='${mode}';</script>`;
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(fs.readFileSync(file,'utf8').replace('</head>',injection+'</head>'));return;
 }
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
