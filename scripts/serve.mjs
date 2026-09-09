import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end('Invalid URL');return}
 let file=path.resolve(root,'.'+url);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 if(url.endsWith('/'))file=path.join(file,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
