import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { palettes, paletteCSS, renderThemeOptions, renderPalettePreview } from './previews/themes.mjs';
import { renderLayoutPreview, renderLayoutComparison } from './previews/layouts.mjs';
const root=path.resolve('dist');
const port=Number(process.argv[2] || 4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.doc':'application/msword','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
 let url, parsed;try{parsed=new URL(req.url,'http://localhost');url=decodeURIComponent(parsed.pathname)}catch{res.writeHead(400);res.end('Invalid URL');return}
 if(url==='/theme-options/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(renderThemeOptions());return}
 if(url==='/layout-options/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(renderLayoutComparison());return}
 if(url==='/__preview/palettes.css'){res.writeHead(200,{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-store'});res.end(paletteCSS);return}
 let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 if(url.endsWith('/'))file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return}
 const layout=parsed.searchParams.get('layout');
 if(path.extname(file)==='.html' && ['sidebar','wide'].includes(layout)){
  res.writeHead(200,{'Content-Type':types['.html'],'Cache-Control':'no-store'});
  res.end(renderLayoutPreview(fs.readFileSync(file,'utf8'),layout));return;
 }
 const palette=parsed.searchParams.get('palette');
 if(path.extname(file)==='.html' && Object.hasOwn(palettes,palette)){
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(renderPalettePreview(fs.readFileSync(file,'utf8'),palette,parsed.searchParams.get('mode')));return;
 }
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
