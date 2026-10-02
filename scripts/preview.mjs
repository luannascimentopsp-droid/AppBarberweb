import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml' };
http.createServer(async (req, res) => {
    try {
        const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
        if (!path.startsWith(root + sep)) throw new Error('path');
        const bytes = await readFile(path);
        res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
        res.end(bytes);
    } catch { res.writeHead(404); res.end('Arquivo não encontrado.'); }
}).listen(Number(process.env.PORT || 8766), '127.0.0.1', () => console.log('Prévia: http://127.0.0.1:' + (process.env.PORT || 8766)));
