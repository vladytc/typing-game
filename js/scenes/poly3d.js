// MOTOR 3D de la Isla Polígono (Nintendo 64): three.js desde el CDN, cargado solo cuando hace falta.
//
// Regla de este mundo: el 3D es una CAPA DE ADORNO. Toda la jugada (tecleo, HUD, menús) es HTML
// encima del canvas, así que si three.js no carga (sin internet) o la compu no tiene WebGL,
// el juego sigue funcionando en "modo clásico" y avisa con un mensaje amable.
//
//   Poly.load(cb)            carga three.js una sola vez; cb(true) si hay 3D
//   Poly.view(host, opts)    crea una vista 3D (PolyView) dentro de host, o null si no se puede
//   Poly.models.<x>(v)       modelos low-poly (enemigos, karts, héroe, árboles...)
//   view.start(update)       bucle de animación; view.dispose() libera TODO lo de WebGL

// Paleta del lore (§7.1): colores "lavados" de los primeros 3D con niebla.
const N64C = {
  sky: '#9FD3FF', fog: '#C9D6E3', grass: '#58B85C', grassD: '#3E8E44', rock: '#9A8C7A', rockD: '#6B5F52',
  water: '#3C8DD6', sand: '#E8D8A8', orange: '#F0953C', purple: '#7E57C2', red: '#D64545',
  yellow: '#F7E463', white: '#F4F4F4', black: '#202030', skin: '#F2C6A0', gold: '#E8B830',
};

// Progreso propio del mundo (estrellas de los cuadros, melodías aprendidas, paredes encontradas).
const N64S = () => {
  const d = Save.data;
  if (!d.n64) d.n64 = {};
  const s = d.n64;
  s.stars = s.stars || {};
  s.songs = s.songs || 0;
  s.walls = s.walls || {};
  s.played = s.played || {};
  return s;
};

class PolyView {
  constructor(host, { w = 320, h = 240, sky = N64C.sky, fog = [40, 140], fogColor = N64C.fog, alpha = false, fov = 60, cls = 'poly-cv' } = {}) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    if (alpha) this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = cls;
    this.scene = new THREE.Scene();
    if (!alpha) this.scene.background = new THREE.Color(sky);
    if (fog) this.scene.fog = new THREE.Fog(fogColor, fog[0], fog[1]);
    this.camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 500);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6b5f52, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 0.65);
    sun.position.set(30, 60, 25);
    this.scene.add(sun);
    this.mats = {};
    this.texs = [];
    this.t = 0;
    host.appendChild(this.canvas);
  }

  // Material plano (sombreado por cara, como los polígonos de 1996). Se reutiliza por color.
  mat(color, extra) {
    if (extra) return new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 0, ...extra });
    if (!this.mats[color]) this.mats[color] = new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 0 });
    return this.mats[color];
  }

  mesh(geo, color, extra, parent) {
    const m = new THREE.Mesh(geo, typeof color === 'string' || typeof color === 'number' ? this.mat(color, extra) : color);
    (parent || this.scene).add(m);
    return m;
  }

  // Textura dibujada en un canvas 2D. draw(g, w, h).
  tex(w, h, draw, { nearest = false, repeat = null } = {}) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; }
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    t.canvas = c;
    this.texs.push(t);
    return t;
  }

  // Letrero de texto (para placas, cuadros y el MISSING del cielo).
  textTex(text, { w = 128, h = 32, bg = N64C.white, fg = N64C.black, size = 12 } = {}) {
    return this.tex(w, h, (g) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = fg;
      g.font = `${size}px "Press Start 2P", TQSym, monospace`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      String(text).split('\n').forEach((line, i, all) => g.fillText(line, w / 2, h / 2 + (i - (all.length - 1) / 2) * size * 1.5));
    }, { nearest: true });
  }

  start(update) {
    this.running = true;
    this.last = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
      this.last = ts;
      this.t += dt;
      if (update) update(dt, this.t);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  // Quita un pedazo de la escena y libera sus geometrías y materiales propios.
  free(root) {
    const cached = new Set(Object.values(this.mats));
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m && !cached.has(m)) m.dispose(); });
    });
    if (root.parent) root.parent.remove(root);
  }

  // Libera geometrías, materiales, texturas y el contexto WebGL.
  dispose() {
    this.stop();
    const seen = new Set();
    const free = (m) => { if (m && !seen.has(m)) { seen.add(m); if (m.map) m.map.dispose(); m.dispose(); } };
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (Array.isArray(o.material)) o.material.forEach(free); else free(o.material);
    });
    Object.values(this.mats).forEach(free);
    this.texs.forEach((t) => t.dispose());
    this.texs = [];
    this.renderer.dispose();
    if (this.renderer.forceContextLoss) this.renderer.forceContextLoss();
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  }
}

const Poly = {
  URL: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  status: 'idle', // idle | loading | ready | failed
  waiting: [],

  load(cb) {
    if (typeof THREE !== 'undefined') this.status = 'ready';
    if (this.status === 'ready' || this.status === 'failed') { cb(this.status === 'ready'); return; }
    this.waiting.push(cb);
    if (this.status === 'loading') return;
    this.status = 'loading';
    let timer = 0;
    const done = (ok) => {
      if (this.status !== 'loading') return;
      clearTimeout(timer);
      this.status = ok && typeof THREE !== 'undefined' ? 'ready' : 'failed';
      const list = this.waiting;
      this.waiting = [];
      list.forEach((f) => f(this.status === 'ready'));
    };
    const s = document.createElement('script');
    s.src = this.URL;
    s.onload = () => done(true);
    s.onerror = () => done(false);
    timer = setTimeout(() => done(false), 9000);
    document.head.appendChild(s);
  },

  // Carga el 3D para una escena: muestra "cargando", llama build() si hay 3D, o avisa si no.
  // scene.tok evita que una respuesta tardía construya algo en una escena que ya se cerró.
  attach(scene, host, build, onFail) {
    const tok = scene.tok = {};
    const loading = typeof THREE === 'undefined' && this.status !== 'failed' ? this.note(host, 'CARGANDO POLIGONOS...') : null;
    this.load((ok) => {
      if (loading) loading.remove();
      if (Game.scene !== scene || scene.tok !== tok) return;
      if (ok) build();
      if (!scene.v) { this.noteFail(host); if (onFail) onFail(); }
    });
  },

  view(host, opts) {
    if (typeof THREE === 'undefined') return null;
    try { return new PolyView(host, opts); } catch (e) { return null; }
  },

  // Aviso que se pone mientras carga o cuando no hay 3D.
  note(host, text) {
    const el = document.createElement('div');
    el.className = 'poly-note';
    el.textContent = text;
    host.appendChild(el);
    return el;
  },
  noteFail(host) {
    const el = this.note(host, 'SIN MOTOR 3D: MODO CLASICO');
    el.classList.add('fail');
    el.title = 'three.js no se pudo cargar (¿sin internet?). Todo se puede jugar igual.';
    return el;
  },

  // Cuántos "polígonos faltantes" quedan en el cielo: el Glitch pausó la isla (§7.2).
  // Cada melodía de Ocarín re-dibuja una parte; al vencer a Marco el cielo queda completo.
  missing() {
    if (Save.data.done.marco) return 0;
    return Math.max(0, 4 - N64S().songs);
  },

  // Cielo: montañas al fondo, nubes poligonales y los parches MISSING.
  sky(v, { radius = 150, mountains = 9, clouds = 7, missing = this.missing(), y = 0 } = {}) {
    const g = new THREE.Group();
    v.scene.add(g);
    for (let i = 0; i < mountains; i++) {
      const a = (i / mountains) * Math.PI * 2 + 0.3;
      const h = 30 + ((i * 37) % 25);
      const m = this.models.mountain(v, 18 + (i % 3) * 6, h);
      m.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      g.add(m);
    }
    for (let i = 0; i < clouds; i++) {
      const c = this.models.cloud(v);
      const a = (i / clouds) * Math.PI * 2;
      c.position.set(Math.cos(a) * radius * 0.7, y + 40 + (i % 3) * 8, Math.sin(a) * radius * 0.7);
      c.scale.setScalar(3 + (i % 2));
      g.add(c);
    }
    if (missing) {
      const t = v.textTex('MISSING', { w: 64, h: 32, bg: N64C.black, fg: N64C.white, size: 8 });
      const mat = new THREE.MeshBasicMaterial({ map: t, fog: false, side: THREE.DoubleSide });
      for (let i = 0; i < missing * 3; i++) {
        const a = (i / (missing * 3)) * Math.PI * 2 + 0.7;
        const p = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), mat);
        p.position.set(Math.cos(a) * radius * 0.9, y + 55 + (i % 4) * 9, Math.sin(a) * radius * 0.9);
        p.lookAt(0, y + 20, 0);
        g.add(p);
      }
    }
    return g;
  },

  // ---------- Modelos low-poly ----------
  models: {
    eyes(v, parent, { y = 0, z = 0.5, x = 0.32, r = 0.2, one = false } = {}) {
      const xs = one ? [0] : [-x, x];
      xs.forEach((ex) => {
        const w = v.mesh(new THREE.IcosahedronGeometry(r, 0), N64C.white, null, parent);
        w.position.set(ex, y, z);
        const p = v.mesh(new THREE.IcosahedronGeometry(r * 0.5, 0), N64C.black, null, parent);
        p.position.set(ex, y, z + r * 0.75);
      });
    },

    trianguloso(v) {
      const g = new THREE.Group();
      const body = v.mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 3), N64C.orange, null, g);
      body.rotation.x = Math.PI / 2;
      body.rotation.y = Math.PI / 2;
      this.eyes(v, g, { y: 0, z: 0.35, r: 0.42, one: true });
      [-0.4, 0.4].forEach((x) => { const l = v.mesh(new THREE.BoxGeometry(0.15, 0.7, 0.15), N64C.black, null, g); l.position.set(x, -0.95, 0); });
      g.userData.anim = (t) => { g.rotation.y = Math.sin(t * 1.3) * 0.5; g.position.y = Math.abs(Math.sin(t * 3)) * 0.25; };
      return g;
    },

    texturin(v) {
      const g = new THREE.Group();
      // Textura de ladrillo de 8x8 estirada sin filtro "nearest": se ve borrosísima, como debe ser.
      const t = v.tex(8, 8, (c) => {
        c.fillStyle = N64C.orange; c.fillRect(0, 0, 8, 8);
        c.fillStyle = N64C.rockD;
        c.fillRect(0, 3, 8, 1); c.fillRect(0, 7, 8, 1); c.fillRect(3, 0, 1, 3); c.fillRect(6, 4, 1, 3);
      });
      v.mesh(new THREE.BoxGeometry(2, 2, 0.5), v.mat(N64C.white, { map: t }), null, g);
      this.eyes(v, g, { y: 0.2, z: 0.3, r: 0.25 });
      g.userData.anim = (t2) => { const s = 1 + Math.sin(t2 * 4) * 0.06; g.scale.set(s, 2 - s, 1); g.rotation.y = Math.sin(t2) * 0.4; };
      return g;
    },

    niebla(v) {
      const g = new THREE.Group();
      const mat = v.mat(N64C.fog, { transparent: true, opacity: 0.85 });
      [[0, 0, 0, 1.1], [-1, -0.2, -0.2, 0.8], [1, -0.1, -0.1, 0.85], [0.4, 0.7, -0.3, 0.7], [-0.5, 0.6, 0.1, 0.6]].forEach(([x, y, z, r]) => {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat);
        m.position.set(x, y, z);
        g.add(m);
      });
      this.eyes(v, g, { y: 0.1, z: 0.95, r: 0.16 });
      g.userData.anim = (t) => { g.position.x = Math.sin(t * 0.7) * 0.4; mat.opacity = 0.65 + Math.sin(t * 1.5) * 0.2; };
      return g;
    },

    camaraloca(v) {
      const g = new THREE.Group();
      v.mesh(new THREE.BoxGeometry(1.7, 1.1, 1.1), N64C.rockD, null, g);
      const lens = v.mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 8), N64C.black, null, g);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.8;
      const glass = v.mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), N64C.water, null, g);
      glass.rotation.x = Math.PI / 2;
      glass.position.z = 1.12;
      const rec = v.mesh(new THREE.IcosahedronGeometry(0.12, 0), N64C.red, null, g);
      rec.position.set(0.6, 0.4, 0.56);
      const wings = [-1, 1].map((s) => {
        const w = v.mesh(new THREE.BoxGeometry(1.4, 0.06, 0.7), N64C.white, null, g);
        w.position.set(s * 1.4, 0.3, 0);
        return w;
      });
      g.userData.anim = (t) => {
        wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(t * 14) * 0.6; });
        g.rotation.z = Math.sin(t * 0.9) * 0.3;
        g.rotation.y = Math.sin(t * 0.6) * 0.5;
        rec.visible = Math.floor(t * 2) % 2 === 0;
      };
      return g;
    },

    pakito(v) {
      const g = new THREE.Group();
      v.mesh(new THREE.BoxGeometry(1.7, 1.5, 1.2), '#8A8A96', null, g);
      const top = v.mesh(new THREE.BoxGeometry(1.5, 0.2, 1), '#B4B4C0', null, g);
      top.position.y = 0.85;
      this.eyes(v, g, { y: 0.15, z: 0.62, r: 0.2 });
      g.userData.anim = () => { g.position.x = (Math.random() - 0.5) * 0.12; g.position.y = (Math.random() - 0.5) * 0.12; };
      return g;
    },

    cactin(v) {
      const g = new THREE.Group();
      v.mesh(new THREE.CylinderGeometry(0.6, 0.7, 2.2, 6), N64C.grass, null, g);
      [-1, 1].forEach((s) => {
        const a = v.mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 5), N64C.grassD, null, g);
        a.position.set(s * 0.85, 0.2, 0);
        const b = v.mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 5), N64C.grassD, null, g);
        b.rotation.z = Math.PI / 2;
        b.position.set(s * 0.6, -0.15, 0);
      });
      const brim = v.mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.1, 8), N64C.yellow, null, g);
      brim.position.y = 1.15;
      const crown = v.mesh(new THREE.ConeGeometry(0.6, 0.8, 8), N64C.orange, null, g);
      crown.position.y = 1.55;
      this.eyes(v, g, { y: 0.45, z: 0.6, r: 0.17 });
      g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 2) * 0.1; g.rotation.y = Math.sin(t * 0.8) * 0.4; };
      return g;
    },

    marco(v) {
      const g = new THREE.Group();
      const face = v.tex(64, 80, (c, w, h) => {
        c.fillStyle = '#FBE7C6'; c.fillRect(0, 0, w, h);
        c.fillStyle = N64C.black;
        c.fillRect(16, 26, 8, 12); c.fillRect(40, 26, 8, 12);       // ojos
        c.fillRect(14, 20, 12, 3); c.fillRect(38, 20, 12, 3);       // cejas
        c.fillStyle = '#6B3E1E'; c.fillRect(14, 48, 36, 7);          // bigote
        c.fillStyle = N64C.red; c.fillRect(24, 58, 16, 5);           // boca
      }, { nearest: true });
      v.mesh(new THREE.PlaneGeometry(2.2, 2.8), v.mat(N64C.white, { map: face }), null, g);
      [[0, 1.55, 2.8, 0.3], [0, -1.55, 2.8, 0.3], [-1.25, 0, 0.3, 3.4], [1.25, 0, 0.3, 3.4]].forEach(([x, y, w, h]) => {
        const b = v.mesh(new THREE.BoxGeometry(w, h, 0.35), N64C.gold, null, g);
        b.position.set(x, y, 0.05);
      });
      const crown = v.mesh(new THREE.ConeGeometry(0.5, 0.7, 4), N64C.yellow, null, g);
      crown.position.y = 2.0;
      g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 0.8) * 0.18; g.rotation.y = Math.sin(t * 0.5) * 0.35; };
      return g;
    },

    hero(v) {
      const g = new THREE.Group();
      const body = v.mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5), N64C.water, null, g);
      body.position.y = 1.0;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.42, 0), N64C.skin, null, g);
      head.position.y = 1.8;
      const cap = v.mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.25, 6), N64C.red, null, g);
      cap.position.y = 2.15;
      const brim = v.mesh(new THREE.BoxGeometry(0.5, 0.06, 0.4), N64C.red, null, g);
      brim.position.set(0, 2.05, 0.35);
      g.userData.legs = [-0.2, 0.2].map((x) => {
        const l = v.mesh(new THREE.BoxGeometry(0.28, 0.55, 0.3), N64C.black, null, g);
        l.position.set(x, 0.3, 0);
        return l;
      });
      return g;
    },

    kart(v, color, cap) {
      const g = new THREE.Group();
      const bodyMat = v.mat(color, {}); // material propio: la estrella lo pinta de colores
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.3), bodyMat);
      body.position.y = 0.45;
      g.add(body);
      const nose = v.mesh(new THREE.BoxGeometry(1.1, 0.3, 0.6), color, null, g);
      nose.position.set(0, 0.4, 1.35);
      const seat = v.mesh(new THREE.BoxGeometry(0.9, 0.6, 0.3), N64C.black, null, g);
      seat.position.set(0, 0.85, -0.6);
      [[-0.8, 0.8], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8]].forEach(([x, z]) => {
        const w = v.mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 8), N64C.black, null, g);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.33, z);
      });
      const head = v.mesh(new THREE.IcosahedronGeometry(0.38, 0), N64C.skin, null, g);
      head.position.set(0, 1.15, -0.25);
      const hat = v.mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.25, 6), cap || color, null, g);
      hat.position.set(0, 1.45, -0.25);
      g.userData.bodyMat = bodyMat;
      return g;
    },

    ocarin(v) {
      const g = new THREE.Group();
      const robe = v.mesh(new THREE.ConeGeometry(1.1, 2.4, 6), N64C.grassD, null, g);
      robe.position.y = 1.2;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.5, 0), N64C.skin, null, g);
      head.position.y = 2.7;
      const hat = v.mesh(new THREE.ConeGeometry(0.5, 1.3, 5), N64C.purple, null, g);
      hat.position.y = 3.6;
      hat.rotation.z = 0.25;
      const flute = v.mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.4, 5), N64C.yellow, null, g);
      flute.rotation.z = Math.PI / 2;
      flute.position.set(0.5, 2.45, 0.5);
      [-0.2, 0.2].forEach((x) => { const e = v.mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), N64C.black, null, g); e.position.set(x, 2.8, 0.47); });
      return g;
    },

    star(v, color = N64C.yellow) {
      const s = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const r = i % 2 ? 0.45 : 1;
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false });
      geo.center();
      const g = new THREE.Group();
      v.mesh(geo, color, null, g);
      [-0.18, 0.18].forEach((x) => { const e = v.mesh(new THREE.BoxGeometry(0.08, 0.28, 0.05), N64C.black, null, g); e.position.set(x, 0.1, 0.2); });
      return g;
    },

    itembox(v) {
      const t = v.textTex('?', { w: 32, h: 32, bg: '#ffffff', fg: N64C.black, size: 20 });
      const mat = v.mat('#ffffff', { map: t, transparent: true, opacity: 0.85 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat);
      m.userData.mat = mat;
      return m;
    },

    tree(v, s = 1) {
      const g = new THREE.Group();
      const trunk = v.mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 5), N64C.rockD, null, g);
      trunk.position.y = 0.6;
      const top = v.mesh(new THREE.ConeGeometry(1.3, 2.8, 6), N64C.grassD, null, g);
      top.position.y = 2.4;
      g.scale.setScalar(s);
      return g;
    },

    mountain(v, r = 20, h = 34) {
      const g = new THREE.Group();
      const m = v.mesh(new THREE.ConeGeometry(r, h, 5), N64C.rock, null, g);
      m.position.y = h / 2;
      const cap = v.mesh(new THREE.ConeGeometry(r * 0.3, h * 0.3, 5), N64C.white, null, g);
      cap.position.y = h * 0.86;
      return g;
    },

    cloud(v) {
      const g = new THREE.Group();
      [[0, 0, 1], [1, -0.2, 0.75], [-1, -0.2, 0.8]].forEach(([x, y, r]) => {
        const c = v.mesh(new THREE.IcosahedronGeometry(r, 0), N64C.white, null, g);
        c.position.set(x, y, 0);
        c.scale.y = 0.6;
      });
      return g;
    },

    // Guiño (§7.8): un oso con un pájaro en la mochila pasa al fondo. Sin nombres.
    bear(v) {
      const g = new THREE.Group();
      const body = v.mesh(new THREE.BoxGeometry(1.2, 1.4, 0.9), '#A0642D', null, g);
      body.position.y = 1;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.55, 0), '#A0642D', null, g);
      head.position.y = 2.05;
      [-0.35, 0.35].forEach((x) => { const e = v.mesh(new THREE.IcosahedronGeometry(0.18, 0), '#A0642D', null, g); e.position.set(x, 2.5, 0); });
      const pack = v.mesh(new THREE.BoxGeometry(0.9, 0.8, 0.5), N64C.water, null, g);
      pack.position.set(0, 1.3, -0.65);
      const bird = v.mesh(new THREE.IcosahedronGeometry(0.3, 0), N64C.red, null, g);
      bird.position.set(0, 1.9, -0.65);
      const beak = v.mesh(new THREE.ConeGeometry(0.1, 0.3, 4), N64C.yellow, null, g);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 1.9, -0.3);
      return g;
    },

    console64(v) {
      const g = new THREE.Group();
      v.mesh(new THREE.BoxGeometry(3, 0.8, 2.2), '#3A3A44', null, g);
      const slot = v.mesh(new THREE.BoxGeometry(1.4, 0.3, 0.4), '#202028', null, g);
      slot.position.set(0, 0.5, -0.2);
      [-1.05, -0.35, 0.35, 1.05].forEach((x) => { const p = v.mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), N64C.black, null, g); p.position.set(x, -0.1, 1.12); });
      [N64C.red, N64C.grass, N64C.water, N64C.yellow].forEach((c, i) => { const b = v.mesh(new THREE.BoxGeometry(0.25, 0.08, 0.25), c, null, g); b.position.set(-0.6 + i * 0.4, 0.42, 0.7); });
      return g;
    },
  },
};
