// MUNDO 5 — Cubo Galáctico (GameCube, 2001): utilidades 3D propias encima del motor de la N64.
//
// Reusa js/scenes/poly3d.js (Poly.load, Poly.view, PolyView) SIN modificarlo. La diferencia con la
// N64 es el acabado: materiales "plásticos" con brillo especular (Phong suave), contornos negros
// gruesos tipo cel-shading en algunos modelos (guiño a Wind Waker), más polígonos y un cielo de
// espacio con estrellas. Si three.js no carga, todo se juega igual con los sprites 2D.
//
//   GC3.view(host, opts)       vista 3D con luces de "plástico pulido" (o null)
//   GC3.models.<x>(v)          modelos: cubito, disquin, delfin, sombracel, fantasmita, brotitos,
//                              casco, guante, arena, figurita(kind)
//   GC3.stars(v, n, r)         campo de estrellas
//   gcBattleEnter/Exit/Win     ganchos para el combate normal (onEnter/onExit/onWin del enemigo)

// Paleta del lore (§8.1).
const GCC = {
  indigo: '#4B3F9E', indigoD: '#2D2566', lila: '#8E86D9', sky: '#7EC8FF', green: '#3BB54A',
  orange: '#F28C28', yellow: '#F5D547', silver: '#C8CBD6', white: '#FFFFFF', water: '#2B9EDB',
  red: '#E04B4B', brown: '#8B5E3C', black: '#17162B', magenta: '#FF00FF', skin: '#F2C6A0',
};

// Progreso propio del mundo (cartas, escaneos, sombras, récords).
const GCS = () => {
  const d = Save.data;
  if (!d.gc) d.gc = {};
  const s = d.gc;
  s.cartas = s.cartas || {};   // vecino -> mejor precisión
  s.sombras = s.sombras || {}; // id de copia -> 'abrazo' | 'ida'
  return s;
};

// El Glitch habla con letras rotas: en el Mundo 5 ya casi limpio (1 de cada 14 letras).
function gcGlitchText(text, every = 14) {
  let n = 0;
  return [...text].map((ch) => (/[a-záéíóúñ]/i.test(ch) && ++n % every === 0 ? (n % 28 ? '#' : '%') : ch)).join('');
}

const GC3 = {
  // Vista 3D con una luz de contra (lila) y un brillo puntual: así el plástico "brilla".
  view(host, opts = {}) {
    const v = Poly.view(host, { fog: null, sky: GCC.indigoD, ...opts });
    if (!v) return null;
    v.gcMats = {};
    const rim = new THREE.DirectionalLight(GCC.lila, 0.45);
    rim.position.set(-20, 10, -25);
    v.scene.add(rim);
    const spark = new THREE.PointLight(0xffffff, 0.5, 60);
    spark.position.set(6, 8, 10);
    v.scene.add(spark);
    return v;
  },

  // Material plástico (se reutiliza por color). toon: true = sombreado de caricatura.
  shiny(v, color, extra) {
    if (extra) return new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x555566, ...extra });
    const k = String(color);
    if (!v.gcMats[k]) {
      v.gcMats[k] = new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x555566 });
      v.mats[`gc_${k}`] = v.gcMats[k]; // PolyView.dispose() también libera estos
    }
    return v.gcMats[k];
  },
  toon(v, color) {
    const k = `toon_${color}`;
    if (!v.gcMats[k]) {
      const M = THREE.MeshToonMaterial || THREE.MeshLambertMaterial;
      v.gcMats[k] = new M({ color });
      v.mats[`gc_${k}`] = v.gcMats[k];
    }
    return v.gcMats[k];
  },

  part(v, geo, color, parent, { toon = false, outline = 0 } = {}) {
    const m = new THREE.Mesh(geo, toon ? this.toon(v, color) : this.shiny(v, color));
    parent.add(m);
    if (outline) this.outline(v, m, outline);
    return m;
  },

  // Contorno negro grueso: una copia por dentro-fuera un poquito más grande.
  outline(v, mesh, s = 1.08) {
    const k = 'outline';
    if (!v.gcMats[k]) {
      v.gcMats[k] = new THREE.MeshBasicMaterial({ color: GCC.black, side: THREE.BackSide });
      v.mats.gc_outline = v.gcMats[k];
    }
    const o = new THREE.Mesh(mesh.geometry, v.gcMats[k]);
    o.scale.setScalar(s);
    mesh.add(o);
    return o;
  },

  eyes(v, parent, { y = 0, z = 0.5, x = 0.3, r = 0.18 } = {}) {
    [-x, x].forEach((ex) => {
      const w = this.part(v, new THREE.SphereGeometry(r, 12, 10), GCC.white, parent);
      w.position.set(ex, y, z);
      const p = this.part(v, new THREE.SphereGeometry(r * 0.55, 10, 8), GCC.black, parent);
      p.position.set(ex, y, z + r * 0.6);
      const s = this.part(v, new THREE.SphereGeometry(r * 0.18, 6, 6), GCC.white, parent);
      s.position.set(ex + r * 0.2, y + r * 0.25, z + r * 0.95); // brillito en el ojo
    });
  },

  stars(v, n = 260, r = 120) {
    const pos = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      pos.push(Math.sin(b) * Math.cos(a) * r, Math.cos(b) * r, Math.sin(b) * Math.sin(a) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false }));
    v.scene.add(pts);
    return pts;
  },

  models: {
    // Cubo índigo con manija, tapita y 4 puertos al frente.
    cubito(v) {
      const G = GC3;
      const g = new THREE.Group();
      const body = G.part(v, new THREE.BoxGeometry(1.8, 1.6, 1.8), GCC.indigo, g);
      body.position.y = 0;
      const lid = G.part(v, new THREE.CylinderGeometry(0.62, 0.62, 0.08, 24), GCC.indigoD, g);
      lid.position.set(0, 0.84, 0.1);
      const handle = G.part(v, new THREE.TorusGeometry(0.55, 0.09, 8, 20, Math.PI), GCC.indigoD, g);
      handle.position.set(0, 0.8, -0.7);
      [-0.6, -0.2, 0.2, 0.6].forEach((x) => { const p = G.part(v, new THREE.BoxGeometry(0.22, 0.16, 0.06), GCC.black, g); p.position.set(x, -0.55, 0.91); });
      const logo = G.part(v, new THREE.BoxGeometry(0.4, 0.4, 0.4), GCC.lila, g);
      logo.position.set(0, 0.55, 0.75);
      logo.scale.set(1, 1, 0.2);
      G.eyes(v, g, { y: 0.05, z: 0.9, x: 0.38, r: 0.2 });
      g.userData.anim = (t) => { g.rotation.y = Math.sin(t * 0.9) * 0.45; g.position.y = Math.abs(Math.sin(t * 2.4)) * 0.25; };
      return g;
    },

    // Disco de 8 cm que gira y se marea.
    disquin(v) {
      const G = GC3;
      const g = new THREE.Group();
      const disc = new THREE.Group();
      g.add(disc);
      const d = G.part(v, new THREE.CylinderGeometry(1.4, 1.4, 0.08, 40), GCC.silver, disc, {});
      d.material = G.shiny(v, GCC.silver, { shininess: 120, specular: 0xffffff });
      const ring = G.part(v, new THREE.TorusGeometry(0.95, 0.05, 6, 40), GCC.sky, disc);
      ring.rotation.x = Math.PI / 2;
      const ring2 = G.part(v, new THREE.TorusGeometry(1.2, 0.03, 6, 40), GCC.lila, disc);
      ring2.rotation.x = Math.PI / 2;
      const hole = G.part(v, new THREE.CylinderGeometry(0.22, 0.22, 0.1, 20), GCC.black, disc);
      hole.position.y = 0.01;
      disc.rotation.x = Math.PI / 2;
      G.eyes(v, g, { y: 0.45, z: 0.12, x: 0.42, r: 0.17 });
      g.userData.anim = (t) => { disc.rotation.y += 0.25; g.rotation.z = Math.sin(t * 2.2) * 0.35; g.rotation.x = Math.sin(t * 1.7) * 0.2; };
      return g;
    },

    // Delfín juguetón (nombre clave "Dolphin") que salta sobre un aro de agua.
    delfin(v) {
      const G = GC3;
      const g = new THREE.Group();
      const fish = new THREE.Group();
      g.add(fish);
      const body = G.part(v, new THREE.SphereGeometry(0.8, 18, 14), GCC.water, fish);
      body.scale.set(1.7, 0.85, 0.85);
      const belly = G.part(v, new THREE.SphereGeometry(0.7, 16, 12), GCC.sky, fish);
      belly.scale.set(1.5, 0.6, 0.75);
      belly.position.set(0.1, -0.2, 0.05);
      const snout = G.part(v, new THREE.ConeGeometry(0.28, 0.7, 12), GCC.water, fish);
      snout.rotation.z = -Math.PI / 2;
      snout.position.set(1.55, -0.1, 0);
      const fin = G.part(v, new THREE.ConeGeometry(0.3, 0.7, 4), GCC.indigo, fish);
      fin.position.set(-0.1, 0.75, 0);
      fin.rotation.z = 0.4;
      const tail = G.part(v, new THREE.ConeGeometry(0.45, 0.6, 4), GCC.indigo, fish);
      tail.rotation.z = Math.PI / 2;
      tail.position.set(-1.55, 0.05, 0);
      tail.scale.set(1, 1, 0.3);
      G.eyes(v, fish, { y: 0.15, z: 0.5, x: 0.25, r: 0.13 });
      fish.children.slice(-6).forEach((m) => { m.position.x += 0.85; });
      const water = G.part(v, new THREE.TorusGeometry(1.3, 0.12, 8, 30), GCC.water, g);
      water.material = G.shiny(v, GCC.water, { transparent: true, opacity: 0.7, shininess: 150, specular: 0xffffff });
      water.rotation.x = Math.PI / 2;
      water.position.y = -1.3;
      fish.rotation.y = -0.5;
      g.userData.anim = (t) => {
        const ph = (t * 0.8) % 1;
        fish.position.y = Math.sin(ph * Math.PI) * 1.1 - 0.4;
        fish.rotation.z = Math.cos(ph * Math.PI) * 0.6;
        water.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      };
      return g;
    },

    // Sombra con contorno negro grueso (cel-shading).
    sombracel(v) {
      const G = GC3;
      const g = new THREE.Group();
      const body = G.part(v, new THREE.SphereGeometry(1, 16, 12), '#5A5578', g, { toon: true, outline: 1.12 });
      body.scale.set(1, 1.25, 0.6);
      const head = G.part(v, new THREE.SphereGeometry(0.55, 14, 10), '#5A5578', g, { toon: true, outline: 1.15 });
      head.position.y = 1.35;
      [-1, 1].forEach((s) => {
        const arm = G.part(v, new THREE.CylinderGeometry(0.16, 0.12, 1.1, 8), '#5A5578', g, { toon: true, outline: 1.2 });
        arm.position.set(s * 1.05, 0.2, 0);
        arm.rotation.z = s * 0.5;
      });
      [-0.2, 0.2].forEach((x) => { const e = G.part(v, new THREE.BoxGeometry(0.12, 0.3, 0.05), GCC.yellow, g, { toon: true }); e.position.set(x, 1.4, 0.5); });
      const wall = G.part(v, new THREE.PlaneGeometry(5, 4), GCC.lila, g, { toon: true });
      wall.position.z = -0.9;
      g.userData.anim = (t) => { g.rotation.y = Math.sin(t * 0.7) * 0.3; body.scale.x = 1 + Math.sin(t * 3) * 0.04; };
      return g;
    },

    // Fantasmita traviesa que se esconde en un cuadro.
    fantasmita(v) {
      const G = GC3;
      const g = new THREE.Group();
      const frame = new THREE.Group();
      g.add(frame);
      [[0, 1.6, 3.4, 0.25], [0, -1.6, 3.4, 0.25], [-1.6, 0, 0.25, 3.4], [1.6, 0, 0.25, 3.4]].forEach(([x, y, w, h]) => {
        const b = G.part(v, new THREE.BoxGeometry(w, h, 0.25), GCC.orange, frame);
        b.position.set(x, y, -0.8);
      });
      const canvas = G.part(v, new THREE.PlaneGeometry(3.1, 3.1), GCC.indigoD, frame);
      canvas.position.z = -0.85;
      const ghost = new THREE.Group();
      g.add(ghost);
      const mat = G.shiny(v, GCC.white, { transparent: true, opacity: 0.85, shininess: 100, emissive: 0x333344 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 14), mat);
      ghost.add(head);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 18, 1, true), mat);
      tail.rotation.x = Math.PI;
      tail.position.y = -0.75;
      ghost.add(tail);
      [-0.28, 0.28].forEach((x) => { const e = G.part(v, new THREE.SphereGeometry(0.13, 8, 8), GCC.black, ghost); e.position.set(x, 0.1, 0.72); });
      const mouth = G.part(v, new THREE.SphereGeometry(0.12, 8, 8), GCC.indigoD, ghost);
      mouth.position.set(0, -0.2, 0.75);
      g.userData.anim = (t) => {
        ghost.position.y = Math.sin(t * 2) * 0.2;
        ghost.position.x = Math.sin(t * 0.9) * 0.8;
        mat.opacity = 0.45 + Math.abs(Math.sin(t * 0.8)) * 0.45; // a veces casi no se ve
      };
      return g;
    },

    // Tres brotitos (rojo, azul, amarillo) que siguen órdenes.
    brotitos(v) {
      const G = GC3;
      const g = new THREE.Group();
      const kids = [GCC.red, GCC.water, GCC.yellow].map((c, i) => {
        const k = new THREE.Group();
        const body = G.part(v, new THREE.SphereGeometry(0.42, 14, 10), c, k);
        body.scale.y = 1.35;
        const stem = G.part(v, new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), GCC.green, k);
        stem.position.y = 0.8;
        const leaf = G.part(v, new THREE.SphereGeometry(0.18, 8, 6), i === 2 ? GCC.white : GCC.green, k);
        leaf.scale.set(1.4, 0.4, 0.8);
        leaf.position.y = 1.12;
        G.eyes(v, k, { y: 0.2, z: 0.36, x: 0.13, r: 0.09 });
        k.position.set((i - 1) * 1.15, 0, 0);
        g.add(k);
        return k;
      });
      g.userData.anim = (t) => kids.forEach((k, i) => { k.position.y = Math.abs(Math.sin(t * 4 + i * 1.1)) * 0.35 - 0.4; k.rotation.z = Math.sin(t * 4 + i) * 0.12; });
      return g;
    },

    // Casco-visor flotante con un anillo de escaneo.
    casco(v) {
      const G = GC3;
      const g = new THREE.Group();
      const shell = G.part(v, new THREE.SphereGeometry(1.1, 22, 16), GCC.orange, g);
      shell.scale.set(1, 1.05, 1.1);
      const visor = G.part(v, new THREE.SphereGeometry(0.75, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2.2), GCC.green, g);
      visor.material = G.shiny(v, GCC.green, { transparent: true, opacity: 0.85, shininess: 160, specular: 0xffffff, emissive: 0x0b3a12 });
      visor.rotation.x = Math.PI / 2;
      visor.position.set(0, 0, 0.62);
      const fin = G.part(v, new THREE.BoxGeometry(0.2, 0.5, 1.4), GCC.red, g);
      fin.position.set(0, 1.05, -0.1);
      [-1, 1].forEach((s) => { const e = G.part(v, new THREE.CylinderGeometry(0.25, 0.3, 0.4, 12), GCC.silver, g); e.rotation.z = Math.PI / 2; e.position.set(s * 1.1, -0.1, 0); });
      const ring = G.part(v, new THREE.TorusGeometry(1.6, 0.04, 6, 48), GCC.sky, g);
      ring.material = G.shiny(v, GCC.sky, { emissive: 0x2266aa });
      ring.rotation.x = Math.PI / 2;
      g.userData.ring = ring;
      g.userData.anim = (t) => {
        g.position.y = Math.sin(t * 1.6) * 0.2;
        g.rotation.y = Math.sin(t * 0.6) * 0.5;
        ring.position.y = Math.sin(t * 2.5) * 1.2;
      };
      return g;
    },

    // El Guante Crossover: guante blanco con guantelete índigo.
    guante(v) {
      const G = GC3;
      const g = new THREE.Group();
      const hand = new THREE.Group();
      g.add(hand);
      const palm = G.part(v, new THREE.BoxGeometry(1.8, 1.9, 0.8), GCC.white, hand);
      palm.material = G.shiny(v, GCC.white, { shininess: 90 });
      [-0.66, -0.22, 0.22, 0.66].forEach((x, i) => {
        const len = i === 0 || i === 3 ? 0.9 : 1.15;
        const f = G.part(v, new THREE.CylinderGeometry(0.2, 0.22, len, 12), GCC.white, hand);
        f.position.set(x, 0.95 + len / 2, 0);
        const tip = G.part(v, new THREE.SphereGeometry(0.2, 12, 8), GCC.white, hand);
        tip.position.set(x, 0.95 + len, 0);
      });
      const thumb = G.part(v, new THREE.CylinderGeometry(0.22, 0.25, 0.9, 12), GCC.white, hand);
      thumb.rotation.z = 1.1;
      thumb.position.set(-1.2, 0.2, 0.1);
      [-0.5, 0, 0.5].forEach((x) => { const l = G.part(v, new THREE.BoxGeometry(0.06, 1.1, 0.05), '#D8DAE6', hand); l.position.set(x, 0.1, -0.42); });
      const cuff = G.part(v, new THREE.CylinderGeometry(1.05, 1.15, 0.9, 24), GCC.indigo, hand);
      cuff.position.y = -1.35;
      const band = G.part(v, new THREE.TorusGeometry(1.1, 0.1, 8, 24), GCC.yellow, hand);
      band.rotation.x = Math.PI / 2;
      band.position.y = -1.0;
      g.userData.hand = hand;
      g.userData.anim = (t) => { hand.position.y = Math.sin(t * 1.4) * 0.25; hand.rotation.z = Math.sin(t * 0.8) * 0.15; };
      return g;
    },

    // Figurita de un jefe anterior (en magenta "de estática" si shadow).
    figurita(v, kind, shadow = false) {
      const G = GC3;
      const g = new THREE.Group();
      const c = (x) => (shadow ? GCC.magenta : x);
      const base = G.part(v, new THREE.CylinderGeometry(0.6, 0.7, 0.25, 20), GCC.yellow, g);
      base.position.y = -0.6;
      if (kind === 'tetro') {
        [[0, 0], [0.42, 0], [-0.42, 0], [0, 0.42]].forEach(([x, y]) => { const b = G.part(v, new THREE.BoxGeometry(0.4, 0.4, 0.4), c('#3c8d3c'), g); b.position.set(x, y - 0.25, 0); });
      } else if (kind === 'caparazon') {
        const s = G.part(v, new THREE.SphereGeometry(0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), c('#2f9e44'), g);
        s.position.y = -0.45;
        const r = G.part(v, new THREE.TorusGeometry(0.55, 0.08, 6, 20), c(GCC.white), g);
        r.rotation.x = Math.PI / 2;
        r.position.y = -0.45;
      } else if (kind === 'nebula') {
        const s = G.part(v, new THREE.SphereGeometry(0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8), c('#9b8cff'), g);
        s.position.y = 0;
        for (let i = 0; i < 4; i++) { const t = G.part(v, new THREE.CylinderGeometry(0.04, 0.02, 0.6, 5), c('#5fcde4'), g); t.position.set(-0.3 + i * 0.2, -0.3, 0); }
      } else {
        [[0, 0.45, 0.9, 0.1], [0, -0.35, 0.9, 0.1], [-0.4, 0.05, 0.1, 0.9], [0.4, 0.05, 0.1, 0.9]].forEach(([x, y, w, h]) => { const b = G.part(v, new THREE.BoxGeometry(w, h, 0.12), c('#E8B830'), g); b.position.set(x, y, 0); });
      }
      return g;
    },

    // Arena Final: plataforma flotante con dos bordes, sobre las nubes del espacio.
    arena(v) {
      const G = GC3;
      const g = new THREE.Group();
      const top = G.part(v, new THREE.BoxGeometry(14, 0.6, 4), GCC.silver, g);
      top.material = G.shiny(v, GCC.silver, { shininess: 110 });
      const under = G.part(v, new THREE.CylinderGeometry(2, 0.3, 3, 6), GCC.indigo, g);
      under.position.y = -1.8;
      [-7, 7].forEach((x) => { const e = G.part(v, new THREE.BoxGeometry(0.3, 0.8, 4.1), GCC.yellow, g); e.position.set(x, 0.1, 0); });
      const stripe = G.part(v, new THREE.BoxGeometry(13.6, 0.05, 0.3), GCC.lila, g);
      stripe.position.set(0, 0.32, 1.6);
      return g;
    },
  },
};

// ---------- Ganchos del combate normal con escenario 3D ----------
// Enemigos con `gc: true` + `model`: se ve su modelo 3D en lugar del sprite, con fondo de espacio.
// Se conectan con los campos onEnter/onExit/onWin que ya acepta js/scenes/battle.js.

// Efectos de lectura (fx): circle (letras en círculo), neg (negativo), ghost (escondidas).
const GC_FX = {
  circle(scene) {
    // Cada vez que se dibuja la palabra actual, sus letras se acomodan en círculo (en orden, desde arriba).
    const lay = () => {
      const w = scene.box && scene.box.querySelector('.tt .w.cur');
      if (!w || w.dataset.circ) return;
      w.dataset.circ = '1';
      const cs = [...w.querySelectorAll('.c')];
      const R = Math.max(26, cs.length * 6.5);
      w.classList.add('gc-circ');
      w.style.width = w.style.height = `${R * 2 + 24}px`;
      cs.forEach((c, i) => {
        const a = (i / cs.length) * Math.PI * 2 - Math.PI / 2;
        c.style.left = `${R + 6 + Math.cos(a) * R}px`;
        c.style.top = `${R + 6 + Math.sin(a) * R}px`;
      });
    };
    if (typeof MutationObserver === 'undefined') return null;
    const mo = new MutationObserver(lay);
    mo.observe(scene.box, { childList: true, subtree: true });
    return mo;
  },
};

function gcBattleEnter(scene, pages) {
  const def = scene.def;
  const battle = $('.battle');
  battle.classList.add('gc', `fx-gc-${def.fx || 'none'}`);
  if (def.fx && GC_FX[def.fx]) scene.gcObs = GC_FX[def.fx](scene);
  // Primera batalla del mundo: Bit explica las reglas nuevas.
  if (!Save.data.flags.gcIntro) {
    Save.data.flags.gcIntro = true;
    pages.push(
      '* BIT: ¡Whoa! ¡Todo brilla como plástico nuevo!\n* Bienvenido al CUBO GALACTICO.',
      '* BIT: Aquí se escriben FRASES COMPLETAS:\n* con MAYUSCULAS (usa SHIFT), comas, puntos y dos puntos.',
      '* BIT: Y los acentos siguen contando.\n* ¡Un punto que falta también es un error!',
    );
  }
  const tok = scene.gctok = {};
  if (!def.model) return;
  Poly.load((ok) => {
    if (!ok || Game.scene !== scene || scene.gctok !== tok) return;
    const host = $('.esprite');
    const v = GC3.view(host, { w: 240, h: 144, alpha: true, fov: 40, cls: 'poly-cv gc-cv' });
    if (!v) return;
    scene.gcv = v;
    host.classList.add('has3d');
    const model = GC3.models[def.model](v);
    v.scene.add(model);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshBasicMaterial({ color: GCC.black, transparent: true, opacity: 0.3 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.7;
    v.scene.add(shadow);
    v.camera.position.set(0, 0.7, def.boss ? 9 : 7.2);
    v.camera.lookAt(0, 0, 0);
    v.start((dt, t) => {
      if (model.userData.anim) model.userData.anim(t, dt);
      if (scene.e && scene.e.mercy >= 100) model.rotation.y += dt * 3; // perdonado: gira de gusto
    });
  });
}

function gcBattleExit(scene) {
  scene.gctok = null;
  if (scene.gcObs) { scene.gcObs.disconnect(); scene.gcObs = null; }
  if (scene.gcv) { scene.gcv.dispose(); scene.gcv = null; }
}

function gcBattleWin(scene, { spared, first, pages }) {
  const def = scene.def;
  const d = Save.data;
  // Perdonar a Delfinito Salvaje te da el Tecloide Delfinito (§8.3).
  if (spared && def.gift && TECLOIDES[def.gift] && d.team && d.team.length && !d.team.some((t) => t.id === def.gift)) {
    if (d.team.length < 3) {
      d.team.push({ id: def.gift, lv: 8, xp: 0 });
      pages.push(`* ¡${upper(TECLOIDES[def.gift].name)} quiere ir contigo!\n* Se unió a tu equipo de TECLOIDES.`);
    } else pages.push(`* ${upper(TECLOIDES[def.gift].name)} quería unirse a tu equipo...\n* ...pero ya tienes 3 Tecloides. ¡Te saluda con la aleta!`);
  }
  if (first && def.gcWinPages) pages.push(...def.gcWinPages(spared));
}
