#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { Transform } = require("node:stream");

const root = path.resolve(process.env.ROOT || process.cwd());
const port = Number(process.env.PORT || 4173);
const latencyMs = Number(process.env.LATENCY_MS || 180);
const kbps = Number(process.env.KBPS || 800);
const cacheMode = process.env.CACHE || "prod";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".pdf": "application/pdf",
};

function isInsideRoot(filePath) {
  const relative = path.relative(root, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function cacheHeader(filePath) {
  if (cacheMode === "off") return "no-store";
  const ext = path.extname(filePath).toLowerCase();
  if (path.basename(filePath) === "index.html" || ext === ".css" || ext === ".js") {
    return "no-cache";
  }
  return "public, max-age=31536000, immutable";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function throttleStream(bytesPerSecond) {
  let nextTime = Date.now();

  return new Transform({
    transform(chunk, _encoding, callback) {
      if (!bytesPerSecond || bytesPerSecond <= 0) {
        callback(null, chunk);
        return;
      }

      const now = Date.now();
      const delay = Math.max(0, nextTime - now);
      nextTime = Math.max(now, nextTime) + (chunk.length / bytesPerSecond) * 1000;

      setTimeout(() => callback(null, chunk), delay);
    },
  });
}

function parseRange(rangeHeader, fileSize) {
  if (!rangeHeader) return null;
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  let start = match[1] === "" ? 0 : Number(match[1]);
  let end = match[2] === "" ? fileSize - 1 : Number(match[2]);

  if (Number.isNaN(start) || Number.isNaN(end) || start > end) return null;
  start = Math.max(0, start);
  end = Math.min(fileSize - 1, end);

  return { start, end };
}

async function serveFile(req, res, filePath) {
  const stats = await fs.promises.stat(filePath);
  const range = parseRange(req.headers.range, stats.size);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || "application/octet-stream";
  const headers = {
    "Accept-Ranges": "bytes",
    "Cache-Control": cacheHeader(filePath),
    "Content-Type": contentType,
    "X-Prod-Sim": `latency=${latencyMs}ms; kbps=${kbps}`,
  };

  await wait(latencyMs);

  if (range) {
    const contentLength = range.end - range.start + 1;
    res.writeHead(206, {
      ...headers,
      "Content-Length": contentLength,
      "Content-Range": `bytes ${range.start}-${range.end}/${stats.size}`,
    });
    fs.createReadStream(filePath, range).pipe(throttleStream((kbps * 1024) / 8)).pipe(res);
    return;
  }

  res.writeHead(200, {
    ...headers,
    "Content-Length": stats.size,
  });
  fs.createReadStream(filePath).pipe(throttleStream((kbps * 1024) / 8)).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const decodedPath = decodeURIComponent(url.pathname);
    let filePath = path.join(root, decodedPath);

    if (!isInsideRoot(filePath)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let stats;
    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      stats = null;
    }

    if (stats?.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    await serveFile(req, res, filePath);
  } catch (error) {
    const status = error.code === "ENOENT" ? 404 : 500;
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(status === 404 ? "Not found" : error.message);
  }
});

server.listen(port, () => {
  console.log(`Production simulation server`);
  console.log(`URL: http://localhost:${port}`);
  console.log(`Root: ${root}`);
  console.log(`Latency: ${latencyMs}ms per request`);
  console.log(`Bandwidth: ${kbps} kbps`);
  console.log(`Cache: ${cacheMode}`);
});
