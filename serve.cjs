const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf'};
http.createServer((q,r)=>{if(q.method==='POST'&&q.url==='/api/catering'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{console.log('CATERING ENQUIRY',b);r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({ok:true,demo:true}));});return;}let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end('404');}
r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8080);
