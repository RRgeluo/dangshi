import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
let port = 4173;

for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--port' && args[index + 1]) {
    port = Number.parseInt(args[index + 1], 10);
    index += 1;
  }
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('A valid --port value is required.');
}

const rootDir = path.resolve(process.cwd(), 'dist');
const rootDirLower = rootDir.toLowerCase();
const fallbackFile = path.join(rootDir, 'index.html');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function safeResolve(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0]);
  const normalizedPath = path.normalize(decodedPath);
  const relativePath = normalizedPath.replace(/^([/\\]+)/, '');
  const resolvedPath = path.resolve(rootDir, relativePath);

  if (!resolvedPath.toLowerCase().startsWith(rootDirLower)) {
    return null;
  }

  return resolvedPath;
}

async function fileExists(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
    let filePath = safeResolve(url.pathname === '/' ? '/index.html' : url.pathname);

    if (!filePath) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    if (!(await fileExists(filePath))) {
      filePath = fallbackFile;
    }

    const data = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] ?? 'application/octet-stream';

    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Type': contentType,
    });
    response.end(data);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
    console.error(error);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`History tool running at http://127.0.0.1:${port}`);
});
