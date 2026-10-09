// Renderer 3D de los mapas que se caminan (desde la era N64).
//
// Scenes.town (js/scenes/town.js) sigue haciendo TODA la lógica: casillas, flechas, diálogos,
// encuentros, cofres, salidas, guardar, ESC, pasto alto, variantes. Este archivo solo DIBUJA:
// convierte las mismas filas de casillas en un mundo low-poly con three.js (js/scenes/poly3d.js)
// y sigue al jugador con una cámara en tercera persona.
//
// El 2D sigue vivo debajo (escondido). Si three.js no carga (sin internet) o no hay WebGL,
// simplemente se queda el 2D de siempre y nada se rompe.
//
//   Town3D.wants(scene)            ¿este mapa se dibuja en 3D? (map.render === '3d' o era con render: '3d')
//   Town3D.open(scene)             carga three.js y pone el 3D encima (queda en scene.r3)
//   Town3D.riseTo(scene, era)      cinemática del pueblo: el mapa plano "se levanta" en 3D
//   r3.place(e) · face() · sink(e) · repaint(e) · screenPos(e) · dispose()
//
// Qué se dibuja (ver docs/MUNDOS.md §3f): cada casilla se vuelve suelo (con la textura de su
// sprite, borrosa como en la N64), agua más abajo, o un modelo de polígonos planos según su
// sprite (árbol, casa, roca, tubería, letrero...). Una casilla puede pedir otro modelo con
// `d3: 'palm'` y otra altura con `h: 1.2`. Los barrios de eras viejas (regions) se ven como
// "relieves" de pixel art con su paleta, y los personajes sin modelo, como cartones (billboards).

const T3S = 2; // unidades de mundo por casilla

const T3Hash = (x, y, s = 1) => {
  let n = Math.imul(x + 57 * s, 374761393) ^ Math.imul(y + 23 * s, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

// Modelos de casilla según el sprite (si la casilla no trae `d3`).
const T3_KIND = {
  water: 'water', tree: 'tree', roof: 'house', wall: 'house', door: 'house', pipe: 'pipe',
  sign: 'sign', cave: 'cave', rock: 'rock', rocas: 'rock', puente: 'bridge', s16_puente: 'bridge', nes_puente: 'bridge',
};
// Personajes con modelo 3D propio (Poly.models), por sprite.
const T3_MODELS = { trianguloso: 'trianguloso', cactin: 'cactin', texturin: 'texturin', niebla: 'niebla', camaraloca: 'camaraloca', pakito: 'pakito', marco: 'marco', ocarin: 'ocarin' };
const T3_ROOFS = ['#D64545', '#3C8DD6', '#F0953C', '#7E57C2', '#E8B830'];

// Junta muchas geometrías en UNA sola malla (una llamada de dibujo por material).
class T3Bake {
  constructor() { this.p = []; this.n = []; this.c = []; this.u = []; }

  // geo se libera aquí. color: '#hex'. uv: [u0, v0, u1, v1] o (cara) => [...] para texturas de atlas.
  add(geo, m, color, uv) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (m) g.applyMatrix4(m);
    g.computeVertexNormals(); // sin índices = una normal por cara: sombreado plano de 1996
    const P = g.attributes.position.array;
    const N = g.attributes.normal.array;
    const U = g.attributes.uv && g.attributes.uv.array;
    const col = new THREE.Color(color || '#ffffff');
    for (let i = 0; i < P.length / 3; i++) {
      this.p.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      this.n.push(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
      this.c.push(col.r, col.g, col.b);
      if (uv) {
        const r = typeof uv === 'function' ? uv(Math.floor(i / 6)) : uv;
        this.u.push(r[0] + (r[2] - r[0]) * (U ? U[i * 2] : 0), r[1] + (r[3] - r[1]) * (U ? U[i * 2 + 1] : 0));
      }
    }
    if (g !== geo) g.dispose();
    geo.dispose();
  }

  // Cuadro con 4 esquinas [x, y, z] en orden (antihorario visto desde el frente).
  quad(a, b, c, d, color) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    this.add(g, null, color);
  }

  mesh(mat) {
    if (!this.p.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    if (this.u.length) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    return new THREE.Mesh(g, mat);
  }
}

const T3M = (x, y, z, sx = 1, sy = sx, sz = sx, ry = 0, rx = 0, rz = 0) => new THREE.Matrix4().compose(
  new THREE.Vector3(x, y, z),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
  new THREE.Vector3(sx, sy, sz),
);

// Un techo de dos aguas: base w × d en y = 0, cumbrera a lo largo de x a altura h.
function t3Roof(w, d, h) {
  const x = w / 2;
  const z = d / 2;
  const v = [
    -x, 0, z, x, 0, z, x, h, 0, -x, 0, z, x, h, 0, -x, h, 0,      // agua del frente
    x, 0, -z, -x, 0, -z, -x, h, 0, x, 0, -z, -x, h, 0, x, h, 0,   // agua de atrás
    -x, 0, -z, -x, 0, z, -x, h, 0,                                // hastial izquierdo
    x, 0, z, x, 0, -z, x, h, 0,                                   // hastial derecho
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return g;
}

class Town3D {
  // ¿Esta era se dibuja en 3D? (render: '3d' en HUB_ERAS / BARRIO_ERAS)
  static eraIs3d(era) {
    const d = typeof eraDef === 'function' && eraDef(era);
    return !!(d && d.render === '3d');
  }

  static wants(scene) {
    return scene.m.render === '3d' || (scene.pueblo && Town3D.eraIs3d(scene.era));
  }

  // Carga three.js (si hace falta) y pone el 3D encima del 2D. Sin 3D: aviso amable y sigue el 2D.
  static open(scene) {
    const tok = scene.tok3 = {};
    const host = $('.town');
    const note = typeof THREE === 'undefined' && Poly.status !== 'failed' ? Poly.note(host, 'CARGANDO POLIGONOS...') : null;
    Poly.load((ok) => {
      if (note) note.remove();
      if (Game.scene !== scene || scene.tok3 !== tok) return;
      if (ok) scene.r3 = Town3D.make(scene);
      if (!scene.r3) Town3D.failNote(host);
    });
  }

  static make(scene, opts) {
    try { return new Town3D(scene, opts); } catch (e) { console.warn('Town3D:', e); return null; }
  }

  static failNote(host) {
    const n = Poly.noteFail(host);
    setTimeout(() => n.remove(), 4000);
  }

  // El salto del pueblo a una era 3D: el pueblo plano se levanta. Devuelve false si no hay 3D
  // (entonces town.js hace el viaje en el tiempo de siempre, en 2D).
  static riseTo(scene, era) {
    return new Promise((done) => {
      const host = $('.town');
      const flat = document.createElement('canvas');
      const old = $('.tmap');
      flat.width = old.width;
      flat.height = old.height;
      flat.getContext('2d').drawImage(old, 0, 0);
      const note = typeof THREE === 'undefined' && Poly.status !== 'failed' ? Poly.note(host, 'CARGANDO POLIGONOS...') : null;
      Poly.load((ok) => {
        if (note) note.remove();
        if (Game.scene !== scene) { done(false); return; }
        if (!ok) { Town3D.failNote(host); done(false); return; }
        scene.setEra(era);
        const r3 = Town3D.make(scene, { flat });
        if (!r3) { Town3D.failNote(host); done(true); return; }
        scene.r3 = r3;
        r3.rising.then(() => done(true));
      });
    });
  }

  constructor(scene, { flat = null } = {}) {
    this.sc = scene;
    const m = scene.m;
    const opt = { ...(scene.pueblo ? { edge: 'forest', fog: [24, 72] } : {}), ...(m.view3d || {}) };
    this.opt = opt;
    const host = $('.town');
    this.v = Poly.view(host, { sky: opt.sky || N64C.sky, fogColor: opt.fogColor || N64C.fog, fog: opt.fog || [20, 64], fov: 55, cls: 'poly-cv t3d' });
    if (!this.v) throw new Error('sin WebGL');
    const tworld = $('.tworld');
    if (tworld && this.v.canvas.parentNode === host) host.insertBefore(this.v.canvas, tworld.nextSibling);
    this.fogFar = this.v.scene.fog.far;
    this.fogNear0 = this.v.scene.fog.near;
    this.ents = new Map();
    this.anims = [];
    this.build(flat);
    this.makeEnts();
    host.classList.add('r3d');
    this.snap();
    this.v.start((dt, t) => this.update(dt, t));
    if (flat) this.rising = this.rise(flat);
  }

  // ---------- Casillas ----------

  // Casilla, su modelo, si es nativa 3D (o un barrio de era vieja) y la altura del suelo.
  cell(x, y) {
    const sc = this.sc;
    const t = sc.tileAt(x, y);
    if (!t) return null;
    const re = sc.regionEra(x, y);
    const native = re ? Town3D.eraIs3d(re) : true;
    const kind = (t.d3 === 'fog' ? 'ground' : t.d3) || T3_KIND[t.s] || (t.solid ? 'block' : 'ground'); // fog = suelo con nubecitas
    let h = t.h || 0;
    if (kind === 'water' || kind === 'bridge') h = native ? -0.7 : -0.45;
    if (kind === 'void' || (kind === 'bridge' && t.over === 'void')) h = -40; // puente colgado sobre el vacío
    return { t, kind, native, era: re || sc.era, h };
  }

  groundH(x, y) {
    const c = this.cells[y] && this.cells[y][x];
    if (c) return c.h;
    const edge = this.opt.edge;
    return edge === 'sea' ? -0.7 : edge === 'void' ? -40 : 0;
  }

  // Altura a la que camina un personaje en esa casilla.
  walkH(x, y) {
    const c = this.cells[y] && this.cells[y][x];
    if (!c) return 0;
    if (c.kind === 'bridge') return 0.32;
    if (c.kind === 'pipe') return c.native ? 1.12 : 2;
    return c.h;
  }

  // Atlas de 16×16 para los relieves de pixel art de las eras viejas (y algunos letreros).
  atlasCell(key, paint) {
    if (this.atlasIdx[key] != null) return this.atlasUV(this.atlasIdx[key]);
    const i = this.atlasN++;
    this.atlasIdx[key] = i;
    const g = this.atlas.getContext('2d');
    paint(g, (i % 32) * 16, Math.floor(i / 32) * 16);
    return this.atlasUV(i);
  }

  atlasUV(i) {
    const e = 0.02;
    const px = (i % 32) * 16;
    const py = Math.floor(i / 32) * 16;
    return [(px + e) / 512, 1 - (py + 16 - e) / 512, (px + 16 - e) / 512, 1 - (py + e) / 512];
  }

  spriteCell(sprite, x, y, under) {
    const t = this.sc.tileAt(x, y);
    const re = this.sc.regionEra(x, y);
    const c = this.sc.tileCols(sprite, sprite === t.s ? t : null, re);
    const cu = under && this.sc.tileCols(under, null, re);
    return this.atlasCell(`${under || ''}|${sprite}|${JSON.stringify(c)}`, (g, px, py) => {
      if (under) paintSprite(g, under, px, py, 1, cu);
      paintSprite(g, sprite, px, py, 1, c);
    });
  }

  build(flat) {
    const { W, H } = this.sc;
    const S = T3S;
    const v = this.v;
    this.cells = [];
    for (let y = 0; y < H; y++) {
      this.cells.push([]);
      for (let x = 0; x < W; x++) this.cells[y].push(this.cell(x, y));
    }
    this.atlas = document.createElement('canvas');
    this.atlas.width = this.atlas.height = 512;
    this.atlasIdx = {};
    this.atlasN = 0;

    // Suelo: una textura con el sprite de cada casilla (16 px), borrosa en lo 3D, nítida en lo retro.
    const gc = document.createElement('canvas');
    gc.width = W * 16;
    gc.height = H * 16;
    const g = gc.getContext('2d');
    const ground = this.sc.m.ground || 'grass';
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = this.cells[y][x];
        if (!c || c.h < -10) continue;
        const re = this.sc.regionEra(x, y);
        const under = c.t.under || ground;
        paintSprite(g, under, x * 16, y * 16, 1, this.sc.tileCols(under, null, re));
        if (c.kind === 'bridge' && c.native) paintSprite(g, 'water', x * 16, y * 16, 1, this.sc.tileCols('water', null, re));
        else if ((c.kind === 'ground' || c.kind === 'water' || c.kind === 'bridge') && c.t.s !== under) paintSprite(g, c.t.s, x * 16, y * 16, 1, this.sc.tileCols(c.t.s, c.t, re));
      }
    }
    const texOf = (nearest) => {
      const t = new THREE.CanvasTexture(gc);
      t.generateMipmaps = false;
      t.minFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
      t.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
      v.texs.push(t);
      return t;
    };
    const atlasTex = new THREE.CanvasTexture(this.atlas);
    atlasTex.generateMipmaps = false;
    atlasTex.minFilter = atlasTex.magFilter = THREE.NearestFilter;
    v.texs.push(atlasTex);
    this.atlasTex = atlasTex;
    this.mats = {
      vc: new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 0 }),
      g3: new THREE.MeshLambertMaterial({ map: texOf(false), vertexColors: true }),
      g2: new THREE.MeshLambertMaterial({ map: texOf(true), vertexColors: true }),
      atlas: new THREE.MeshLambertMaterial({ map: atlasTex, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }),
      water: new THREE.MeshLambertMaterial({ color: N64C.water, transparent: true, opacity: 0.62, depthWrite: false }),
      puff: new THREE.MeshLambertMaterial({ color: '#EEF2F7', transparent: true, opacity: 0.4, depthWrite: false }),
    };

    // Bandas por distancia al jugador: en la cinemática se levantan una tras otra.
    const BANDS = flat ? 7 : 1;
    const maxD = Math.hypot(W, H);
    const bandOf = (x, y) => (flat ? Math.min(BANDS - 1, Math.floor((Math.hypot(x - this.sc.p.x, y - this.sc.p.y) / maxD) * BANDS * 1.6)) : 0);
    this.bands = Array.from({ length: BANDS }, () => ({ vc: new T3Bake(), atlas: new T3Bake(), puff: new T3Bake(), grp: new THREE.Group() }));
    const gnd = { g3: new T3Bake(), g2: new T3Bake(), cliff: new T3Bake(), water: new T3Bake() };
    this.gnd = gnd;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = this.cells[y][x];
        if (!c) continue;
        const X = x * S + S / 2;
        const Z = y * S + S / 2;
        const b = this.bands[bandOf(x, y)];
        if (c.h > -10) {
          // Suelo con su pedazo de textura y un poquito de variación de brillo (sombreado por vértice).
          const tone = 0.9 + T3Hash(x, y, 9) * 0.1;
          const col = new THREE.Color(tone, tone, tone);
          const uv = [x / W, 1 - (y + 1) / H, (x + 1) / W, 1 - y / H];
          (c.native ? gnd.g3 : gnd.g2).add(new THREE.PlaneGeometry(S, S), T3M(X, c.h, Z, 1, 1, 1, 0, -Math.PI / 2), `#${col.getHexString()}`, uv);
          if (c.kind === 'water' || c.kind === 'bridge') {
            if (this.opt.edge !== 'sea') gnd.water.add(new THREE.PlaneGeometry(S, S), T3M(X, -0.18, Z, 1, 1, 1, 0, -Math.PI / 2));
          }
          this.cliffs(x, y, c, gnd.cliff);
        }
        this.prop(x, y, c, X, Z, b);
      }
    }
    this.edge(gnd);

    const add = (mesh, parent = v.scene) => { if (mesh) parent.add(mesh); return mesh; };
    add(gnd.g3.mesh(this.mats.g3));
    add(gnd.g2.mesh(this.mats.g2));
    add(gnd.cliff.mesh(this.mats.vc));
    this.waterMesh = add(gnd.water.mesh(this.mats.water));
    if (this.waterMesh) this.waterMesh.renderOrder = 2;
    this.bands.forEach((b) => {
      add(b.vc.mesh(this.mats.vc), b.grp);
      add(b.atlas.mesh(this.mats.atlas), b.grp);
      const p = add(b.puff.mesh(this.mats.puff), b.grp);
      if (p) p.renderOrder = 3;
      v.scene.add(b.grp);
    });
    atlasTex.needsUpdate = true;

    // Cielo con montañas y nubes (y los polígonos MISSING de la isla, si los hay).
    const cx = (W * S) / 2;
    const cz = (H * S) / 2;
    const sky = Poly.sky(v, { radius: Math.max(W, H) * S * 0.75 + 70, missing: this.opt.missing ? Poly.missing() : 0, y: this.opt.edge === 'void' ? -8 : 0 });
    sky.position.x += cx;
    sky.position.z += cz;
    (this.sc.m.decor3d || []).forEach((d) => this.decor(d));
  }

  // Paredes de tierra/roca donde el suelo de al lado está más abajo (orillas, plataformas, islas).
  cliffs(x, y, c, bake) {
    const S = T3S;
    const x0 = x * S;
    const z0 = y * S;
    const x1 = x0 + S;
    const z1 = z0 + S;
    const top = c.h;
    const color = c.native ? (c.t.c3s || (top > 0.2 ? N64C.rockD : '#B9A57E')) : (this.sc.tileCols(c.t.under || this.sc.m.ground || 'grass', null, this.sc.regionEra(x, y)).c || '#555');
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      let low = this.groundH(x + dx, y + dy);
      if (low >= top - 0.01) return;
      if (low < -10) low = top - 7; // isla flotante: la roca cuelga hacia el vacío
      if (dy === -1) bake.quad([x1, low, z0], [x0, low, z0], [x0, top, z0], [x1, top, z0], color);
      if (dy === 1) bake.quad([x0, low, z1], [x1, low, z1], [x1, top, z1], [x0, top, z1], color);
      if (dx === -1) bake.quad([x0, low, z0], [x0, low, z1], [x0, top, z1], [x0, top, z0], color);
      if (dx === 1) bake.quad([x1, low, z1], [x1, low, z0], [x1, top, z0], [x1, top, z1], color);
    });
    if (this.groundH(x, y + 1) < -10 || this.groundH(x, y - 1) < -10 || this.groundH(x - 1, y) < -10 || this.groundH(x + 1, y) < -10) {
      bake.add(new THREE.ConeGeometry(S * 0.62, 5, 5), T3M(x0 + S / 2, top - 7.2, z0 + S / 2, 1, 1, 1, T3Hash(x, y) * 3, Math.PI), N64C.rockD);
    }
  }

  // Lo que hay fuera del mapa: mar hasta el horizonte, bosque o vacío con nubes.
  edge(gnd) {
    const { W, H } = this.sc;
    const S = T3S;
    const v = this.v;
    const edge = this.opt.edge || 'grass';
    if (edge === 'sea') {
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshLambertMaterial({ color: N64C.water, transparent: true, opacity: 0.82 }));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set((W * S) / 2, -0.18, (H * S) / 2);
      sea.renderOrder = 2;
      v.scene.add(sea);
      this.waterMesh = sea;
      return;
    }
    if (edge === 'void') {
      for (let i = 0; i < 16; i++) {
        const c = Poly.models.cloud(v);
        c.scale.setScalar(3 + T3Hash(i, 3) * 3);
        c.position.set(T3Hash(i, 1) * W * S * 1.4 - W * S * 0.2, -14 - T3Hash(i, 2) * 8, T3Hash(i, 4) * H * S * 1.4 - H * S * 0.2);
        v.scene.add(c);
      }
      return;
    }
    // Pasto alrededor (un marco de 4 rectángulos, para no tapar el agua del mapa) y más bosque.
    const bake = new T3Bake();
    const R = 160;
    const MW = W * S;
    const MH = H * S;
    const col = this.sc.tileCols(this.sc.m.ground || 'grass', null, null).a || N64C.grass;
    [[-R, -R, MW + R, 0], [-R, MH, MW + R, MH + R], [-R, 0, 0, MH], [MW, 0, MW + R, MH]].forEach(([x0, z0, x1, z1]) => {
      bake.quad([x0, -0.02, z1], [x1, -0.02, z1], [x1, -0.02, z0], [x0, -0.02, z0], col);
    });
    if (edge === 'forest') {
      for (let i = 0; i < 260; i++) {
        const a = T3Hash(i, 7) * Math.PI * 2;
        const d = 2 + T3Hash(i, 8) * 16;
        const px = MW / 2 + Math.cos(a) * (MW / 2 + d * S * 0.6);
        const pz = MH / 2 + Math.sin(a) * (MH / 2 + d * S * 0.6);
        if (px > -1 && px < MW + 1 && pz > -1 && pz < MH + 1) continue;
        this.pine(bake, px, 0, pz, i, 1 + T3Hash(i, 5) * 0.5);
      }
    }
    const mesh = bake.mesh(this.mats.vc);
    if (mesh) v.scene.add(mesh);
  }

  // ---------- Modelos de casilla ----------

  pine(b, X, Y, Z, seed, s = 1) {
    const j = (k) => T3Hash(seed, k, 3);
    const ry = j(1) * 6;
    b.add(new THREE.CylinderGeometry(0.18, 0.26, 1, 5), T3M(X, Y + 0.5 * s, Z, s, s, s, ry), N64C.rockD);
    b.add(new THREE.ConeGeometry(1.05, 1.8, 6), T3M(X, Y + 1.55 * s, Z, s, s, s, ry), j(2) < 0.5 ? N64C.grassD : '#357A3B');
    b.add(new THREE.ConeGeometry(0.75, 1.5, 6), T3M(X, Y + 2.45 * s, Z, s, s, s, ry + 0.5), j(3) < 0.5 ? N64C.grass : '#4CA651');
  }

  prop(x, y, c, X, Z, band) {
    const S = T3S;
    const b = band.vc;
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    if (!c.native) { this.relief(x, y, c, X, Z, band); return; }
    switch (c.kind) {
      case 'tree': {
        this.pine(b, X + (j(1) - 0.5) * 0.5, h, Z + (j(2) - 0.5) * 0.5, x * 97 + y, 0.85 + j(3) * 0.35);
        break;
      }
      case 'palm': {
        const lean = (j(1) - 0.5) * 0.5;
        for (let i = 0; i < 4; i++) b.add(new THREE.CylinderGeometry(0.17, 0.22, 0.8, 5), T3M(X + lean * i * 0.4, h + 0.4 + i * 0.75, Z, 1, 1, 1, i, 0, -lean * 0.4), i % 2 ? '#B88A50' : '#9A6C3A');
        const tx = X + lean * 1.6;
        const ty = h + 3.1;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + j(2);
          b.add(new THREE.ConeGeometry(0.32, 2.0, 4), T3M(tx + Math.cos(a) * 0.9, ty - 0.1, Z + Math.sin(a) * 0.9, 1, 1, 0.35, -a, 0, Math.PI / 2 + 0.35), i % 2 ? N64C.grass : N64C.grassD);
        }
        [0, 2, 4].forEach((i) => b.add(new THREE.IcosahedronGeometry(0.2, 0), T3M(tx + Math.cos(i) * 0.25, ty - 0.35, Z + Math.sin(i) * 0.25), '#6B4A2A'));
        break;
      }
      case 'rock': {
        b.add(new THREE.DodecahedronGeometry(0.95, 0), T3M(X, h + 0.7, Z, 1, 0.85 + j(1) * 0.4, 1, j(2) * 3), j(3) < 0.5 ? N64C.rock : '#8C8070');
        if (j(4) < 0.6) b.add(new THREE.DodecahedronGeometry(0.45, 0), T3M(X + 0.6, h + 0.3, Z + 0.5, 1, 1, 1, j(5) * 3), N64C.rockD);
        break;
      }
      case 'cliff': {
        const top = c.t.bh || 2.6;
        b.add(new THREE.BoxGeometry(S, top, S), T3M(X, h + top / 2, Z), j(1) < 0.5 ? N64C.rock : '#8C8070');
        b.add(new THREE.DodecahedronGeometry(0.8, 0), T3M(X + (j(2) - 0.5), h + top, Z + (j(3) - 0.5), 1, 0.6, 1, j(4) * 3), N64C.grass);
        break;
      }
      case 'house': this.house(x, y, band); break;
      case 'pipe': {
        const col = c.t.c3 || '#3EA346';
        b.add(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 10), T3M(X, h + 0.4, Z), col);
        b.add(new THREE.CylinderGeometry(0.9, 0.9, 0.32, 10), T3M(X, h + 0.96, Z), '#5FD06A');
        b.add(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 10), T3M(X, h + 1.12, Z), '#163A1A');
        break;
      }
      case 'sign': {
        b.add(new THREE.BoxGeometry(0.18, 1.1, 0.18), T3M(X, h + 0.55, Z), '#6B4A2A');
        b.add(new THREE.BoxGeometry(1.4, 0.85, 0.14), T3M(X, h + 1.25, Z + 0.05), '#C9A66B');
        b.add(new THREE.BoxGeometry(1.0, 0.08, 0.02), T3M(X, h + 1.38, Z + 0.13), '#6B4A2A');
        b.add(new THREE.BoxGeometry(0.8, 0.08, 0.02), T3M(X, h + 1.15, Z + 0.13), '#6B4A2A');
        break;
      }
      case 'cave': {
        b.add(new THREE.DodecahedronGeometry(1.3, 0), T3M(X, h + 1.0, Z - 0.2, 1.1, 1.1, 1), N64C.rockD);
        b.add(new THREE.BoxGeometry(1.0, 1.2, 0.2), T3M(X, h + 0.6, Z + 0.95), '#101018');
        break;
      }
      case 'bridge': {
        const horiz = this.passable(x - 1, y) || this.passable(x + 1, y);
        for (let i = 0; i < 4; i++) {
          const o = -0.75 + i * 0.5;
          b.add(new THREE.BoxGeometry(horiz ? 0.44 : 2, 0.14, horiz ? 2 : 0.44), T3M(X + (horiz ? o : 0), 0.25, Z + (horiz ? 0 : o)), i % 2 ? '#A0642D' : '#B87A3E');
        }
        [-0.95, 0.95].forEach((o) => {
          const px = horiz ? X : X + o;
          const pz = horiz ? Z + o : Z;
          b.add(new THREE.BoxGeometry(0.14, 0.8, 0.14), T3M(px, 0.55, pz), '#6B4A2A');
          b.add(new THREE.BoxGeometry(horiz ? 2 : 0.08, 0.08, horiz ? 0.08 : 2), T3M(px, 0.85, pz), '#C9A66B');
        });
        break;
      }
      case 'ground': case 'water': case 'void': {
        const s = c.t.s;
        if (c.t.tall || s === 'tall') {
          for (let i = 0; i < 5; i++) b.add(new THREE.ConeGeometry(0.13, 0.75 + j(i) * 0.3, 4), T3M(X + (j(i + 1) - 0.5) * 1.6, h + 0.38, Z + (j(i + 2) - 0.5) * 1.6), i % 2 ? N64C.grassD : '#2F7D3A');
        } else if (s === 'flower') {
          for (let i = 0; i < 3; i++) {
            const fx = X + (j(i + 3) - 0.5) * 1.4;
            const fz = Z + (j(i + 4) - 0.5) * 1.4;
            b.add(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 3), T3M(fx, h + 0.2, fz), N64C.grassD);
            b.add(new THREE.IcosahedronGeometry(0.14, 0), T3M(fx, h + 0.45, fz), [N64C.red, N64C.yellow, N64C.white][(x + y + i) % 3]);
          }
        }
        if (c.t.d3 === 'fog') {
          // Nubecitas de niebla flotando (no en todas las casillas, para que se vea el camino).
          if (j(6) < 0.45) band.puff.add(new THREE.IcosahedronGeometry(0.5 + j(7) * 0.35, 0), T3M(X + (j(8) - 0.5) * 1.2, h + 1.0 + j(9) * 0.9, Z + (j(10) - 0.5) * 1.2, 1.4, 0.5, 1));
        }
        break;
      }
      case 'castle': {
        const top = c.t.bh || 3.2;
        b.add(new THREE.BoxGeometry(S, top, S), T3M(X, h + top / 2, Z), c.t.c3 || '#E8DCB5');
        [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([ox, oz], i) => { if ((x + y + i) % 2 === 0) b.add(new THREE.BoxGeometry(0.7, 0.6, 0.7), T3M(X + ox, h + top + 0.3, Z + oz), c.t.c3 || '#E8DCB5'); });
        b.add(new THREE.BoxGeometry(S * 1.01, 0.18, S * 1.01), T3M(X, h + top - 0.4, Z), '#C9B88E');
        break;
      }
      case 'tower': {
        b.add(new THREE.CylinderGeometry(0.95, 1.05, 5, 8), T3M(X, h + 2.5, Z), c.t.c3 || '#E8DCB5');
        b.add(new THREE.ConeGeometry(1.25, 2.2, 8), T3M(X, h + 6.1, Z), N64C.red);
        b.add(new THREE.BoxGeometry(0.4, 0.7, 0.1), T3M(X, h + 3.6, Z + 0.98), '#202030');
        break;
      }
      case 'pillar': {
        b.add(new THREE.CylinderGeometry(0.45, 0.5, 3.0, 8), T3M(X, h + 1.5, Z), c.t.c3 || N64C.white);
        b.add(new THREE.BoxGeometry(1.3, 0.3, 1.3), T3M(X, h + 3.1, Z), '#C9D6E3');
        b.add(new THREE.BoxGeometry(1.3, 0.3, 1.3), T3M(X, h + 0.15, Z), '#C9D6E3');
        break;
      }
      case 'stand': {
        // Gradas del estadio: escalones que suben alejándose de la cancha, con público de bolitas.
        const ry = this.passable(x, y + 1) ? 0 : this.passable(x, y - 1) ? Math.PI : this.passable(x + 1, y) ? Math.PI / 2 : this.passable(x - 1, y) ? -Math.PI / 2 : 0;
        const rot = new THREE.Matrix4().makeRotationY(ry);
        for (let i = 0; i < 3; i++) {
          const hh = 0.6 + i * 0.8;
          const off = S / 3 - i * (S / 3);
          b.add(new THREE.BoxGeometry(S, hh, S / 3), T3M(X, h, Z).multiply(rot).multiply(T3M(0, hh / 2, off)), [N64C.purple, '#6A48A8', '#5A3C90'][i]);
          if (j(i) < 0.75) b.add(new THREE.IcosahedronGeometry(0.24, 0), T3M(X, h, Z).multiply(rot).multiply(T3M((j(i + 3) - 0.5) * 1.3, hh + 0.25, off)), [N64C.red, N64C.yellow, N64C.water, N64C.orange, N64C.white][(x + y + i) % 5]);
        }
        break;
      }
      case 'wall': {
        const top = c.t.bh || 2.2;
        b.add(new THREE.BoxGeometry(S, top, S), T3M(X, h + top / 2, Z), c.t.c3 || N64C.purple);
        b.add(new THREE.BoxGeometry(S * 1.02, 0.3, S * 1.02), T3M(X, h + top - 0.15, Z), c.t.c3b || N64C.yellow);
        break;
      }
      case 'tire': {
        [0.28, 0.72].forEach((yy, i) => b.add(new THREE.TorusGeometry(0.55, 0.24, 4, 8), T3M(X, h + yy, Z, 1, 1, 1, 0, Math.PI / 2), i ? '#2A2A34' : (x + y) % 2 ? N64C.red : N64C.white));
        break;
      }
      case 'cube': b.add(new THREE.BoxGeometry(1.3, 1.1, 1.1), T3M(X, h + 0.55, Z, 1, 1, 1, 0.3), '#8A8A96'); break;
      case 'tv': {
        b.add(new THREE.BoxGeometry(1.0, 0.6, 1.0), T3M(X, h + 0.3, Z), '#6B4A2A');
        b.add(new THREE.BoxGeometry(1.6, 1.2, 1.0), T3M(X, h + 1.2, Z), '#3A3A44');
        b.add(new THREE.BoxGeometry(1.3, 0.9, 0.05), T3M(X, h + 1.25, Z + 0.51), N64C.water);
        break;
      }
      case 'chair': {
        b.add(new THREE.BoxGeometry(0.9, 0.5, 0.9), T3M(X, h + 0.25, Z), [N64C.red, N64C.yellow, N64C.water, N64C.grass][x % 4]);
        b.add(new THREE.BoxGeometry(0.9, 0.8, 0.2), T3M(X, h + 0.8, Z + 0.4), [N64C.red, N64C.yellow, N64C.water, N64C.grass][x % 4]);
        break;
      }
      case 'mask': {
        b.add(new THREE.BoxGeometry(0.16, 1.4, 0.16), T3M(X, h + 0.7, Z), '#6B4A2A');
        b.add(new THREE.CylinderGeometry(0.6, 0.45, 0.12, 6), T3M(X, h + 1.6, Z + 0.1, 1, 1, 1, 0, Math.PI / 2), N64C.purple);
        [-0.22, 0.22].forEach((o) => b.add(new THREE.BoxGeometry(0.16, 0.16, 0.05), T3M(X + o, h + 1.65, Z + 0.18), N64C.yellow));
        for (let i = 0; i < 5; i++) b.add(new THREE.ConeGeometry(0.1, 0.4, 3), T3M(X - 0.6 + i * 0.3, h + 2.05, Z + 0.1), N64C.orange);
        break;
      }
      case 'itembox': {
        const box = Poly.models.itembox(this.v);
        box.position.set(X, h + 1.3, Z);
        band.grp.add(box);
        this.anims.push((dt, t) => { box.rotation.y = t * 1.4 + x; box.rotation.x = 0.4; box.position.y = h + 1.3 + Math.sin(t * 2 + y) * 0.15; });
        break;
      }
      case 'missing': {
        if (!this.missMat) {
          const tex = this.v.textTex('MISSING', { w: 64, h: 32, bg: N64C.black, fg: N64C.white, size: 8 });
          this.missMat = new THREE.MeshBasicMaterial({ map: tex });
        }
        const m = new THREE.Mesh(new THREE.BoxGeometry(S * 0.96, S * 0.96, S * 0.96), this.missMat);
        m.position.set(X, h + 1 + j(1) * 0.6, Z);
        band.grp.add(m);
        this.anims.push((dt, t) => { m.visible = Math.sin(t * 7 + x * 3 + y) > -0.85; m.rotation.y = Math.sin(t + x) * 0.1; });
        break;
      }
      default: {
        // Casilla sólida sin modelo: un bloque con la textura de su sprite.
        const uv = this.spriteCell(c.t.s, x, y, c.t.under || this.sc.m.ground || 'grass');
        band.atlas.add(new THREE.BoxGeometry(S, c.t.bh || S, S), T3M(X, h + (c.t.bh || S) / 2, Z), '#ffffff', uv);
      }
    }
  }

  passable(x, y) {
    const t = this.sc.tileAt(x, y);
    return !!t && !t.solid;
  }

  // Casa low-poly: junta todas las casillas de techo/pared/puerta pegadas en una sola casa
  // con paredes, techo de dos aguas, puertas y ventanas.
  house(x, y, band) {
    this.housed = this.housed || new Set();
    if (this.housed.has(`${x},${y}`)) return;
    const isHouse = (i, j) => { const c = this.cells[j] && this.cells[j][i]; return c && c.native && c.kind === 'house'; };
    const stack = [[x, y]];
    let x0 = x; let x1 = x; let y0 = y; let y1 = y;
    const parts = [];
    while (stack.length) {
      const [i, j] = stack.pop();
      const k = `${i},${j}`;
      if (this.housed.has(k) || !isHouse(i, j)) continue;
      this.housed.add(k);
      parts.push([i, j]);
      x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j);
      stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
    }
    const S = T3S;
    const b = band.vc;
    const w = (x1 - x0 + 1) * S - 0.3;
    const d = (y1 - y0 + 1) * S - 0.5;
    const cx = (x0 + x1 + 1) * S / 2;
    const cz = (y0 + y1 + 1) * S / 2 - 0.1;
    const wallH = 2.3;
    const front = cz + d / 2;
    const museum = parts.some(([i, j]) => this.cells[j][i].t.warp === 'vitrina');
    const roof = museum ? N64C.purple : T3_ROOFS[Math.floor(T3Hash(x0, y0, 4) * T3_ROOFS.length)];
    b.add(new THREE.BoxGeometry(w, wallH, d), T3M(cx, wallH / 2, cz), museum ? '#F4F4F4' : '#EFE3C8');
    b.add(new THREE.BoxGeometry(w + 0.1, 0.3, d + 0.1), T3M(cx, 0.15, cz), '#C9B88E');
    b.add(t3Roof(w + 0.6, d + 0.6, Math.min(2.2, 0.9 + d * 0.28)), T3M(cx, wallH, cz), roof);
    if (T3Hash(x0, y1, 2) < 0.6 && !museum) b.add(new THREE.BoxGeometry(0.45, 1.2, 0.45), T3M(cx + w * 0.25, wallH + 1.0, cz - d * 0.15), '#8C5A3C');
    // Puertas y ventanas en la fila de abajo (la fachada).
    for (let i = x0; i <= x1; i++) {
      const c = this.cells[y1][i];
      if (!c || c.kind !== 'house') continue;
      const X = i * S + S / 2;
      if (c.t.s === 'door') {
        b.add(new THREE.BoxGeometry(0.95, 1.6, 0.14), T3M(X, 0.8, front + 0.02), museum ? N64C.red : '#7A4A2A');
        b.add(new THREE.IcosahedronGeometry(0.07, 0), T3M(X + 0.3, 0.8, front + 0.12), N64C.gold);
      } else {
        b.add(new THREE.BoxGeometry(0.7, 0.6, 0.1), T3M(X, 1.35, front + 0.02), '#F7E463');
        b.add(new THREE.BoxGeometry(0.08, 0.6, 0.12), T3M(X, 1.35, front + 0.04), '#6B4A2A');
      }
    }
    if (museum) {
      const tex = this.v.textTex('MUSEO', { w: 64, h: 16, bg: N64C.gold, fg: N64C.black, size: 8 });
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshLambertMaterial({ map: tex }));
      plaque.position.set(cx, wallH - 0.35, front + 0.06);
      band.grp.add(plaque);
    }
  }

  // Barrios de eras viejas: relieves de pixel art (bloques y cartones con la paleta de su era).
  relief(x, y, c, X, Z, band) {
    const S = T3S;
    const h = Math.max(0, c.h);
    const under = c.t.under || this.sc.m.ground || 'grass';
    const s = c.t.s;
    if (c.kind === 'ground' || c.kind === 'water' || c.kind === 'bridge' || c.kind === 'void') return;
    if (c.kind === 'tree') {
      // Árbol de "cartón cruzado" (dos planos en X), el truco de muchos juegos de 1996.
      const uv = this.spriteCell(s, x, y);
      const k = S * 1.05;
      [Math.PI / 4, -Math.PI / 4].forEach((r) => band.atlas.add(new THREE.PlaneGeometry(k, k), T3M(X, h + k / 2, Z, 1, 1, 1, r), '#ffffff', uv));
      return;
    }
    if (c.kind === 'sign') {
      const uv = this.spriteCell(s, x, y);
      band.atlas.add(new THREE.PlaneGeometry(S, S), T3M(X, h + S / 2, Z + 0.2), '#ffffff', uv);
      return;
    }
    // Casas, rocas, cuevas, tuberías...: un bloque con el sprite en los lados y el techo arriba.
    const roofish = s === 'roof';
    const tall = c.kind === 'house' ? (roofish ? 1.7 : 1.3) : c.kind === 'pipe' ? 1.0 : 1.1;
    const side = this.spriteCell(s, x, y, under);
    const topRoof = c.kind === 'house' ? this.spriteCell('roof', x, y, under) : side;
    band.atlas.add(new THREE.BoxGeometry(S, tall, S), T3M(X, h + tall / 2, Z), '#ffffff', (f) => (f === 2 ? topRoof : side));
  }

  // Adornos 3D que no son casillas: { model: 'bear', path: [[x, y], [x, y]], speed }.
  decor(d) {
    if (!Poly.models[d.model]) return;
    const o = Poly.models[d.model](this.v);
    const S = T3S;
    const pts = (d.path || [[d.x, d.y]]).map(([x, y]) => new THREE.Vector3(x * S + S / 2, d.y3 || 0, y * S + S / 2));
    o.position.copy(pts[0]);
    if (d.scale) o.scale.setScalar(d.scale);
    this.v.scene.add(o);
    if (pts.length < 2) return;
    const legs = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = pts[i].distanceTo(pts[i + 1]); legs.push(l); total += l; }
    const speed = d.speed || 1.2;
    this.anims.push((dt, t) => {
      // Va y viene por su camino, sin prisa.
      let k = (t * speed) % (total * 2);
      const back = k > total;
      if (back) k = total * 2 - k;
      let i = 0;
      while (i < legs.length - 1 && k > legs[i]) { k -= legs[i]; i++; }
      const a = pts[i];
      const b = pts[i + 1];
      o.position.lerpVectors(a, b, Math.min(1, k / legs[i]));
      o.position.y = (d.y3 || 0) + Math.abs(Math.sin(t * 6)) * 0.12;
      const dir = back ? a.clone().sub(b) : b.clone().sub(a);
      o.rotation.y = Math.atan2(dir.x, dir.z);
    });
  }

  // ---------- Personajes ----------

  makeEnts() {
    this.entGrp = new THREE.Group();
    this.v.scene.add(this.entGrp);
    this.sc.allEnts().forEach((e) => this.addEnt(e));
  }

  // Modelo 3D (si es de una era 3D y existe) o cartón con su sprite y su paleta original.
  body(e) {
    const v = this.v;
    const era = e.era || this.sc.regionEra(e.x, e.y) || this.sc.era;
    const native = Town3D.eraIs3d(era);
    let o = null;
    let hgt = 2.1;
    if (e.id === 'player') { o = Poly.models.hero(v); hgt = 1.9; }
    else if (e.kind === 'chest') { o = this.chest(e.sprite === 'cofre_abierto'); hgt = 0; }
    else if (native) {
      const key = (e.kind === 'foe' && ENEMIES[e.enemy] && ENEMIES[e.enemy].model) || T3_MODELS[e.sprite];
      if (key && Poly.models[key]) o = Poly.models[key](v);
      else if (e.sprite === 'piloto') o = Poly.models.kart(v, N64C.purple, '#3A2A5A');
      if (o) hgt = e.big ? 3.4 : 2.2;
    }
    if (!o) {
      // Cartón (billboard): el mismo dibujo del 2D, con la paleta de su era.
      const cv = this.sc.entityCanvas(e);
      const tex = new THREE.CanvasTexture(cv);
      tex.generateMipmaps = false;
      tex.minFilter = tex.magFilter = THREE.NearestFilter;
      v.texs.push(tex);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, alphaTest: 0.5 }));
      sp.center.set(0.5, 0);
      const k = e.big ? 3.2 : e.id === 'bit' ? 1.5 : 2.1;
      sp.scale.set(k, k, 1);
      return { o: sp, card: true };
    }
    // Ajusta tamaño y pone los pies en el suelo (los modelos de batalla vienen centrados).
    const wrap = new THREE.Group();
    const lift = new THREE.Group();
    lift.add(o);
    wrap.add(lift);
    if (hgt) {
      const box = new THREE.Box3().setFromObject(o);
      const size = box.max.y - box.min.y || 1;
      const s = Math.max(0.35, Math.min(1.3, hgt / size));
      lift.scale.setScalar(s);
      lift.position.y = -box.min.y * s;
    }
    return { o: wrap, model: o };
  }

  chest(open) {
    const v = this.v;
    const g = new THREE.Group();
    v.mesh(new THREE.BoxGeometry(1.3, 0.7, 0.9), '#A0642D', null, g).position.y = 0.35;
    v.mesh(new THREE.BoxGeometry(1.34, 0.12, 0.94), N64C.gold, null, g).position.y = 0.62;
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.7, -0.45);
    g.add(pivot);
    const lid = v.mesh(new THREE.BoxGeometry(1.3, 0.35, 0.9), '#B87A3E', null, pivot);
    lid.position.set(0, 0.17, 0.45);
    const lock = v.mesh(new THREE.BoxGeometry(0.22, 0.28, 0.08), N64C.gold, null, g);
    lock.position.set(0, 0.62, 0.47);
    if (open) { pivot.rotation.x = -1.9; lock.visible = false; }
    return g;
  }

  addEnt(e) {
    const holder = new THREE.Group();
    const b = this.body(e);
    holder.add(b.o);
    this.entGrp.add(holder);
    const r = { e, holder, ...b, from: null, t0: 0, dur: 0, sink: 0 };
    this.ents.set(e, r);
    this.place(e, true);
    if (e.id === 'player') this.face();
    return r;
  }

  tilePos(x, y) {
    return new THREE.Vector3(x * T3S + T3S / 2, this.walkH(x, y), y * T3S + T3S / 2);
  }

  place(e, instant = false) {
    const r = this.ents.get(e);
    if (!r) return;
    const to = this.tilePos(e.x, e.y);
    if (e.big && r.card) to.z -= 0.6;
    r.from = instant || !r.to ? to.clone() : r.holder.position.clone();
    r.to = to;
    r.t0 = performance.now();
    r.dur = instant ? 0 : STEP_MS;
    if (instant) r.holder.position.copy(to);
  }

  face() {
    const r = this.ents.get(this.sc.player);
    if (!r || !r.model) return;
    r.model.rotation.y = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[this.sc.p.face] || 0;
  }

  sink(e) {
    const r = this.ents.get(e);
    if (!r) return;
    r.sink = performance.now();
    r.scale0 = r.o.scale.clone();
  }

  repaint(e) {
    const r = this.ents.get(e);
    if (!r || e.id === 'player') return; // el héroe 3D no cambia de paleta
    r.holder.remove(r.o);
    this.v.free(r.o);
    const b = this.body(e);
    Object.assign(r, { o: b.o, model: b.model || null, card: !!b.card });
    r.holder.add(b.o);
    if (e.id === 'player') this.face();
  }

  // Dónde se ve un personaje en la pantalla de 640×480 (para la burbuja de "¡Oye! ¡Escucha!").
  screenPos(e) {
    const r = this.ents.get(e);
    if (!r) return [320, 200];
    const p = r.holder.position.clone();
    p.y += 2.4;
    p.project(this.v.camera);
    return [(p.x + 1) * 320, (1 - p.y) * 240];
  }

  // ---------- Cámara y animación ----------

  camGoal() {
    const r = this.ents.get(this.sc.player);
    const p = r ? r.holder.position : new THREE.Vector3();
    const [up, back] = this.opt.cam || [11.5, 9];
    return { pos: new THREE.Vector3(p.x, p.y + up, p.z + back), look: new THREE.Vector3(p.x, p.y + 1, p.z - 2) };
  }

  snap() {
    const g = this.camGoal();
    this.camPos = g.pos;
    this.camLook = g.look;
    this.v.camera.position.copy(g.pos);
    this.v.camera.lookAt(g.look);
  }

  update(dt, t) {
    const now = performance.now();
    this.ents.forEach((r) => {
      const k = r.dur ? Math.min(1, (now - r.t0) / r.dur) : 1;
      if (r.to) {
        r.holder.position.lerpVectors(r.from, r.to, k);
        if (Math.abs(r.to.y - r.from.y) > 0.25 && k < 1) r.holder.position.y += Math.sin(k * Math.PI) * 0.9; // ¡salto!
      }
      const e = r.e;
      if (e.id === 'player' && r.model && r.model.userData.legs) {
        const walking = k < 1 || this.sc.moving;
        r.model.userData.legs.forEach((l, i) => { l.rotation.x = walking ? Math.sin(t * 22 + i * Math.PI) * 0.7 : 0; });
      }
      if (e.id === 'bit') r.o.position.y = 0.5 + Math.sin(t * 3) * 0.18;
      if (r.model && r.model.userData.anim) r.model.userData.anim(t);
      if (r.sink) {
        const s = Math.min(1, (now - r.sink) / 420);
        r.o.position.y = -s * 2.2;
        r.o.scale.copy(r.scale0).multiplyScalar(1 - s * 0.6);
      }
    });
    this.anims.forEach((f) => f(dt, t));
    if (this.waterMesh) this.waterMesh.position.y = -0.18 + Math.sin(t * 1.4) * 0.05;
    if (this.cine) { this.cine(dt, t); return; }
    const g = this.camGoal();
    const a = 1 - Math.exp(-dt * 5);
    this.camPos.lerp(g.pos, a);
    this.camLook.lerp(g.look, a);
    this.v.camera.position.copy(this.camPos);
    this.v.camera.lookAt(this.camLook);
  }

  // Cinemática: el pueblo plano (el dibujo 2D de la era anterior) se levanta en polígonos.
  rise(flatCanvas) {
    const v = this.v;
    const { W, H } = this.sc;
    const tex = new THREE.CanvasTexture(flatCanvas);
    tex.generateMipmaps = false;
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    v.texs.push(tex);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false });
    const flat = new THREE.Mesh(new THREE.PlaneGeometry(W * T3S, H * T3S), mat);
    flat.rotation.x = -Math.PI / 2;
    flat.position.set((W * T3S) / 2, 0.08, (H * T3S) / 2);
    flat.renderOrder = 5;
    v.scene.add(flat);
    this.bands.forEach((b) => b.grp.scale.set(1, 0.001, 1));
    this.entGrp.scale.set(1, 0.001, 1);
    const fog = v.scene.fog;
    fog.far = 400;
    fog.near = 300;
    const p = this.ents.get(this.sc.player).holder.position.clone();
    // Arriba: la cámara mira el pueblo desde el cielo, como el 2D (el norte hacia arriba).
    // (Un poquito inclinada, para que la cámara nunca gire sobre sí misma al bajar.)
    const topPos = new THREE.Vector3(p.x, 30, p.z + 3);
    const topLook = new THREE.Vector3(p.x, 0, p.z - 0.5);
    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
    const back = (k) => { const c = 1.9; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
    const T = 4.2;
    let t0 = null;
    return new Promise((done) => {
      this.cine = (dt, t) => {
        if (t0 == null) t0 = t;
        const s = t - t0;
        // 1) Tiembla el dibujo plano. 2) Se levantan las bandas desde el jugador hacia afuera.
        // 3) La cámara baja del cielo y se pone detrás del jugador.
        const shake = s < 1.0 ? Math.sin(s * 60) * 0.08 * s : 0;
        this.bands.forEach((b, i) => {
          const k = Math.max(0, Math.min(1, (s - 0.9 - i * 0.28) / 0.7));
          b.grp.scale.y = Math.max(0.001, back(k));
        });
        this.entGrp.scale.y = Math.max(0.001, back(Math.max(0, Math.min(1, (s - 1.0) / 0.6))));
        mat.opacity = 1 - Math.max(0, Math.min(1, (s - 1.0) / 1.8));
        const kc = ease(Math.max(0, Math.min(1, (s - 1.4) / 2.6)));
        const g = this.camGoal();
        this.camPos = topPos.clone().lerp(g.pos, kc);
        this.camLook = topLook.clone().lerp(g.look, kc);
        this.camPos.x += shake;
        fog.near = 300 + (this.fogNear0 - 300) * kc;
        fog.far = 400 + (this.fogFar - 400) * kc;
        v.camera.up.set(0, 1, 0);
        v.camera.position.copy(this.camPos);
        v.camera.lookAt(this.camLook);
        if (s >= T) {
          this.cine = null;
          v.scene.remove(flat);
          flat.geometry.dispose();
          mat.dispose();
          fog.near = this.fogNear0;
          fog.far = this.fogFar;
          done();
        }
      };
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cine = null;
    this.v.dispose();
    const host = $('.town');
    if (host) host.classList.remove('r3d');
  }
}
