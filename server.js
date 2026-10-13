// Servidor para publicar Tecla Quest (Railway). Sin dependencias: solo Node.
// Todo el juego queda detrás de una contraseña. Después de MAX_ATTEMPTS intentos fallidos
// desde la misma IP, esa IP queda bloqueada LOCKOUT_MINUTES. Y si entre todas las IPs suman
// GLOBAL_MAX_ATTEMPTS fallos, se bloquea el login para todos (por si alguien cambia de IP).
// Quien ya entró sigue jugando: el bloqueo solo afecta al formulario de entrada.
//
// Variables de entorno:
//   APP_PASSWORD          (obligatoria) la contraseña
//   SESSION_SECRET        (opcional) firma de la sesión; si falta, se deriva de la contraseña
//   MAX_ATTEMPTS          intentos por IP antes de bloquear (5)
//   LOCKOUT_MINUTES       minutos de bloqueo (15)
//   GLOBAL_MAX_ATTEMPTS   intentos fallidos entre todas las IPs antes de bloquear a todos (20)
//   SESSION_DAYS          días que dura la sesión (30)
//   PORT                  lo pone Railway (8080 en local)

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PASSWORD = process.env.APP_PASSWORD || '';
if (PASSWORD.length < 8) {
  console.error('Falta APP_PASSWORD (mínimo 8 caracteres).');
  process.exit(1);
}
const num = (v, d) => (Number.isFinite(+v) && +v > 0 ? +v : d);
const MAX_ATTEMPTS = num(process.env.MAX_ATTEMPTS, 5);
const LOCKOUT_MS = num(process.env.LOCKOUT_MINUTES, 15) * 60 * 1000;
const GLOBAL_MAX = num(process.env.GLOBAL_MAX_ATTEMPTS, 20);
const SESSION_MS = num(process.env.SESSION_DAYS, 30) * 24 * 60 * 60 * 1000;
const PORT = num(process.env.PORT, 8080);
// La llave de la sesión depende de la contraseña: si la cambias, todas las sesiones caducan.
const KEY = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'tecla-quest').update(PASSWORD).digest();
const COOKIE = 'tq_session';
const ROOT = __dirname;

// ---------- Intentos y bloqueos (en memoria: se reinician al redesplegar) ----------
const byIp = new Map(); // ip -> { fails, lockedUntil }
let globalFails = [];   // marcas de tiempo de fallos recientes (todas las IPs)
let globalLockedUntil = 0;

function lockLeft(ip, now) {
  const r = byIp.get(ip);
  return Math.max(0, globalLockedUntil - now, r ? r.lockedUntil - now : 0);
}

function fail(ip, now) {
  const r = byIp.get(ip) || { fails: 0, lockedUntil: 0 };
  r.fails++;
  if (r.fails >= MAX_ATTEMPTS) { r.lockedUntil = now + LOCKOUT_MS; r.fails = 0; }
  byIp.set(ip, r);
  globalFails = globalFails.filter((t) => now - t < LOCKOUT_MS);
  globalFails.push(now);
  if (globalFails.length >= GLOBAL_MAX) { globalLockedUntil = now + LOCKOUT_MS; globalFails = []; }
  return MAX_ATTEMPTS - r.fails;
}

// Limpieza para que el mapa no crezca sin fin.
setInterval(() => {
  const now = Date.now();
  for (const [ip, r] of byIp) if (r.lockedUntil < now && r.fails === 0) byIp.delete(ip);
}, 10 * 60 * 1000).unref();

// ---------- Sesión firmada en cookie ----------
const sign = (v) => crypto.createHmac('sha256', KEY).update(v).digest('base64url');

function newSession() {
  const exp = String(Date.now() + SESSION_MS);
  return `${exp}.${sign(exp)}`;
}

function validSession(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function passwordOk(given) {
  const h = (s) => crypto.createHash('sha256').update(s).digest();
  return crypto.timingSafeEqual(h(given), h(PASSWORD));
}

// Railway pone la IP real del cliente en X-Real-IP; si no está, la última de X-Forwarded-For.
function clientIp(req) {
  const real = req.headers['x-real-ip'];
  if (real) return String(real).trim();
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
  return fwd.length ? fwd[fwd.length - 1] : req.socket.remoteAddress || '?';
}

const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https';

// ---------- Respuestas ----------
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY, ...headers });
  res.end(body);
}

const minutes = (ms) => Math.max(1, Math.ceil(ms / 60000));

function loginPage(msg = '', locked = false) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tecla Quest</title><meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>
  :root { --bg: #0f0f1b; --fg: #f2f2f2; --dim: #8b8ba7; --accent: #ffd447; --err: #ff6b6b; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--fg);
    font-family: 'Press Start 2P', ui-monospace, Menlo, monospace; padding: 16px; }
  form { width: 100%; max-width: 360px; border: 4px solid var(--fg); padding: 28px 22px; box-shadow: 8px 8px 0 #000; }
  h1 { font-size: 18px; margin: 0 0 6px; color: var(--accent); text-align: center; }
  p { font-size: 9px; line-height: 1.8; color: var(--dim); text-align: center; margin: 0 0 22px; }
  label { font-size: 9px; display: block; margin-bottom: 8px; }
  input { width: 100%; font: inherit; font-size: 12px; padding: 12px; background: #000; color: var(--fg); border: 3px solid var(--fg); outline: none; }
  input:focus { border-color: var(--accent); }
  button { margin-top: 18px; width: 100%; font: inherit; font-size: 11px; padding: 12px; background: var(--fg); color: var(--bg); border: 0; cursor: pointer; }
  button:disabled { opacity: 0.4; cursor: default; }
  .msg { font-size: 9px; line-height: 1.8; color: var(--err); margin-top: 16px; text-align: center; min-height: 1em; }
</style></head><body>
<form method="post" action="/login">
  <h1>TECLA QUEST</h1>
  <p>♥ Escribe la contraseña ♥</p>
  <label for="pw">CONTRASEÑA</label>
  <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required ${locked ? 'disabled' : ''}>
  <button ${locked ? 'disabled' : ''}>ENTRAR</button>
  <div class="msg">${msg}</div>
</form></body></html>`;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

// Solo se sirve el juego: index.html, css/ y js/. Nada de .git, docs, el servidor, etc.
function serveFile(req, res, urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath).replace(/^\/+/, '') || 'index.html'; } catch { return send(res, 400, 'Ruta inválida'); }
  rel = path.posix.normalize(rel);
  const ok = rel === 'index.html' || /^(css|js)\/[\w\-./]+$/.test(rel);
  if (!ok || rel.includes('..') || rel.split('/').some((p) => p.startsWith('.'))) return send(res, 404, 'No encontrado');
  const file = path.join(ROOT, rel);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'No encontrado');
    res.writeHead(200, {
      ...SECURITY,
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-cache', // revalida siempre: al publicar cambios, se ven al recargar
      'Last-Modified': st.mtime.toUTCString(),
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

function readBody(req, limit, cb) {
  let data = '';
  req.on('data', (c) => {
    data += c;
    if (data.length > limit) { req.destroy(); }
  });
  req.on('end', () => cb(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const now = Date.now();

  if (url.pathname === '/health') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });

  if (url.pathname === '/login' && req.method === 'POST') {
    const ip = clientIp(req);
    const left = lockLeft(ip, now);
    if (left) return send(res, 429, loginPage(`Demasiados intentos. Espera ${minutes(left)} min.`, true), { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': String(Math.ceil(left / 1000)) });
    return readBody(req, 2048, (body) => {
      const given = new URLSearchParams(body).get('password') || '';
      if (passwordOk(given)) {
        byIp.delete(ip);
        const cookie = `${COOKIE}=${newSession()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS / 1000)}${isHttps(req) ? '; Secure' : ''}`;
        return send(res, 303, '', { Location: '/', 'Set-Cookie': cookie });
      }
      const remaining = fail(ip, Date.now());
      const lock = lockLeft(ip, Date.now());
      console.warn(`[login] fallo desde ${ip}${lock ? ' (bloqueada)' : ''}`);
      // Un poco de espera en cada fallo: hace más lento adivinar.
      setTimeout(() => {
        const msg = lock ? `Demasiados intentos. Espera ${minutes(lock)} min.` : (remaining === 1 ? "Contraseña incorrecta. Te queda 1 intento." : `Contraseña incorrecta. Te quedan ${remaining} intentos.`);
        send(res, lock ? 429 : 401, loginPage(msg, !!lock), { 'Content-Type': 'text/html; charset=utf-8' });
      }, 600);
    });
  }

  if (url.pathname === '/logout') {
    return send(res, 303, '', { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método no permitido');

  if (!validSession(req)) {
    if (url.pathname !== '/' && url.pathname !== '/index.html') return send(res, 401, 'Sin sesión');
    const left = lockLeft(clientIp(req), now);
    return send(res, 200, loginPage(left ? `Demasiados intentos. Espera ${minutes(left)} min.` : '', !!left), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  }

  serveFile(req, res, url.pathname);
});

server.listen(PORT, () => console.log(`Tecla Quest en el puerto ${PORT}`));
