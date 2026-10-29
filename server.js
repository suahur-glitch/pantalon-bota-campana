// Servidor estático sin dependencias para Hostinger (Node).
// Sirve los archivos de esta carpeta, escucha en process.env.PORT
// y soporta peticiones Range (necesario para el video en Safari/iOS).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

// Archivos del proyecto que no deben servirse
const BLOCKED = /^\/(server\.js|package(-lock)?\.json|node_modules|\.)/;

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, headers));
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Método no permitido', { Allow: 'GET, HEAD' });
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, 'Petición inválida');
  }
  if (BLOCKED.test(urlPath)) return send(res, 404, 'No encontrado');
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT + path.sep)) return send(res, 403, 'Prohibido');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'No encontrado');

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Last-Modified': stat.mtime.toUTCString(),
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800'
    };

    const size = stat.size;
    const range = req.headers.range;
    let start = 0;
    let end = size - 1;
    let status = 200;

    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!m || (m[1] === '' && m[2] === '')) {
        return send(res, 416, '', { 'Content-Range': `bytes */${size}` });
      }
      if (m[1] === '') {
        // bytes=-N → últimos N bytes
        start = Math.max(size - Number(m[2]), 0);
      } else {
        start = Number(m[1]);
        if (m[2] !== '') end = Math.min(Number(m[2]), size - 1);
      }
      if (start > end || start >= size) {
        return send(res, 416, '', { 'Content-Range': `bytes */${size}` });
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }

    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Landing Kosmika en http://localhost:${PORT}`);
});
