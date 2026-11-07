// Local-only static server for previewing Fly Trainer in a browser.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 5180;
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.bin': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

http
  .createServer((req, res) => {
    let urlPath;
    try { urlPath = decodeURIComponent(req.url.split('?')[0]); }
    catch { return res.writeHead(400).end(); }
    // Preserve the document's base URL so its CSS, modules and models resolve.
    if (urlPath === '/') return res.writeHead(302, { Location: '/src/index.html' }).end();
    const file = path.join(root, urlPath);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end('Not found');
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => console.log(`Fly Trainer at http://127.0.0.1:${port}`));
