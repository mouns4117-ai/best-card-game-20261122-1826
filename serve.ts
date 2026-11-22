// Ember Court — a tiny dev server for the game folder.
// Serves game/ on localhost so the game can be played and screenshotted in a
// desktop browser with no build step: `node serve.ts` (or `node serve.ts 8090`
// for another port). Only files under game/ are ever served.

import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const port = Number(process.argv[2] ?? 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = normalize(join(root, rel));
  if (!file.startsWith(root) || !existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(port, () => {
  console.log(`Ember Court at http://localhost:${port}`);
});
