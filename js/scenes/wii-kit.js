// KIT de la Ciudad Sensor (Wii, 2006). Lo comparten las escenas del Mundo 6:
//   wii-battle.js (enemigos), wii-gym.js (Entrenador Mi), wii-torneo.js (Dani), wii-cometa.js (jefe).
//
//   WIIC                 paleta del lore §9.1 (blanco y azul cielo del menú de la consola)
//   WIIS()               progreso propio del mundo en Save.data.wii (pruebas del gimnasio, récords...)
//   WiiPoly.view(...)    vista 3D más limpia y brillante que la de la N64 (usa Poly.view de poly3d.js)
//   WiiPoly.models.<x>   modelos redonditos (Sensorín, Correíta, Nunchuquín, muñequitos tipo Mii...)
//   wiiPauseDodge(...)   pausa con ESC durante la lluvia de palabras (cualquier Dodge)
//   wiiPause(...)        el mismo menú de PAUSA para escenas propias
// No toca js/scenes/poly3d.js: solo lo usa. Sin three.js todo se juega igual (modo clásico).

const WIIC = {
  white: '#FAFAFA', light: '#E6E9EE', gray: '#AAB2BD', sky: '#5BC0EB', blue: '#1E88E5', navy: '#0D47A1',
  green: '#43D17A', yellow: '#FFD54F', orange: '#FF8A3D', red: '#F44336', pink: '#F48FB1', purple: '#9C6ADE',
  black: '#222222', skin: '#F6D2B0', space: '#0B1638',
};

// Letras de los sprites a todo color (las a/b/c/d siguen siendo los 4 tonos del tema).
const WII_PAL = {
  K: '#2B3445', // contorno gris azulado (más suave que el negro)
  W: WIIC.white, L: WIIC.light, G: WIIC.gray, S: WIIC.sky, B: WIIC.blue, N: WIIC.navy,
  V: WIIC.green, Y: WIIC.yellow, O: WIIC.orange, R: WIIC.red, P: WIIC.pink, M: WIIC.purple,
  F: WIIC.skin, X: '#FF00FF',
};
const wiiArt = (rows, pal = WII_PAL) => Object.assign(rows, { pal });
const wiiRecolor = (rows, map) => wiiArt(rows.map((r) => [...r].map((c) => map[c] || c).join('')), rows.pal || WII_PAL);

// Progreso del mundo.
const WIIS = () => {
  const d = Save.data;
  if (!d.wii) d.wii = {};
  const s = d.wii;
  s.gym = s.gym || {};        // pruebas del gimnasio ganadas: { boliche, tenis, box }
  s.chuzas = s.chuzas || 0;   // chuzas seguidas (misión "Chuza perfecta")
  return s;
};

// Texto del Glitch: en la Ciudad Sensor ya habla casi limpio (1 de cada 14 letras).
const wiiGlitch = (s) => (typeof glitchText === 'function' ? glitchText(s, 14) : s);

// ¿El teclado escribe acentos y signos? Si se apagaron (Maestra Modo), se quitan ¡ ¿ y el ° se dice "grados".
function wiiSigns(text) {
  if (strictOn(true)) return text;
  return text.replace(/[¡¿]/g, '').replace(/°C/g, ' grados').replace(/°/g, ' grados').replace(/\s+/g, ' ').trim();
}

// ---------- Dibujo en lienzo ----------

// Dibujos a todo color con la paleta de la Wii (para el lienzo).
function wiiPaint(g, name, x, y, s) {
  const rows = SPRITES[name];
  if (!rows) return;
  const pal = rows.pal || WII_PAL;
  const four = { a: WIIC.white, b: WIIC.sky, c: WIIC.blue, d: WII_PAL.K };
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return;
    g.fillStyle = pal[ch] || four[ch] || WII_PAL.K;
    g.fillRect(Math.round(x + i * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s));
  }));
}

function wiiRoundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// ---------- Pausa ----------

// Menú de pausa encima de `host`. onQuit: salir. Devuelve una función para cerrarlo.
function wiiPause(host, { onResume, onQuit, quitLabel = 'Salir' }) {
  const el = document.createElement('div');
  el.className = 'smb-pause wii-pause';
  el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
  host.appendChild(el);
  let done = false;
  const close = () => { if (!done) { done = true; el.remove(); } };
  const menu = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: quitLabel }], {
    cols: 2,
    onPick: (i) => { close(); if (i === 1) onQuit(); else onResume(); },
    onCancel: () => { close(); onResume(); },
  });
  return { menu, close };
}

// Pausa la lluvia de palabras (cualquier Dodge) y la reanuda donde se quedó.
function wiiPauseDodge(scene, dodge, host) {
  if (!dodge || !dodge.active || scene.paused) return false;
  dodge.active = false;
  cancelAnimationFrame(dodge.raf);
  scene.paused = wiiPause(host, {
    onResume: () => {
      scene.paused = null;
      if (dodge.stopped) return;
      dodge.active = true;
      dodge.last = performance.now();
      dodge.raf = requestAnimationFrame(dodge.loop);
    },
    onQuit: () => { scene.paused = null; Game.go(scene.back || 'map'); },
  });
  return true;
}

// ---------- 3D limpio y brillante ----------

const WiiPoly = {
  // Vista 3D: más resolución que la N64, luz blanca y nada de niebla.
  view(host, { w = 640, h = 480, sky = WIIC.white, alpha = false, fov = 45, cls = 'poly-cv wii-cv' } = {}) {
    const v = Poly.view(host, { w, h, sky, alpha, fog: null, fov, cls });
    if (!v) return null;
    v.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const rim = new THREE.DirectionalLight(0xdff4ff, 0.35);
    rim.position.set(-20, 15, -10);
    v.scene.add(rim);
    // Material liso y brillante (como plástico blanco de 2006), reutilizado por color.
    v.wiiMats = {};
    v.soft = (color, extra) => {
      if (extra) return new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x444444, ...extra });
      if (!v.wiiMats[color]) v.wiiMats[color] = new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x444444 });
      return v.wiiMats[color];
    };
    v.glow = (color) => new THREE.MeshBasicMaterial({ color });
    // mesh con material liso: s(geo, color, parent)
    v.s = (geo, color, parent, extra) => v.mesh(geo, typeof color === 'object' ? color : v.soft(color, extra), null, parent);
    const baseDispose = v.dispose.bind(v);
    v.dispose = () => { Object.values(v.wiiMats).forEach((m) => m.dispose()); baseDispose(); };
    return v;
  },

  sphere: (r, ws = 20, hs = 14) => new THREE.SphereGeometry(r, ws, hs),

  // Fondo del menú de la consola: piso blanco con líneas grises y "canales" flotando.
  menuBackdrop(v, { channels = 6, y = -2 } = {}) {
    const g = new THREE.Group();
    v.scene.add(g);
    const floor = v.s(new THREE.PlaneGeometry(80, 80), WIIC.light, g);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = y;
    for (let i = -6; i <= 6; i++) {
      const line = v.s(new THREE.PlaneGeometry(80, 0.06), WIIC.gray, g);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, y + 0.01, i * 3);
    }
    g.userData.tiles = [];
    for (let k = 0; k < channels; k++) {
      const tile = v.s(new THREE.BoxGeometry(2.6, 1.6, 0.18), WIIC.white, g);
      const face = v.s(new THREE.PlaneGeometry(2.3, 1.3), [WIIC.sky, WIIC.green, WIIC.yellow, WIIC.pink, WIIC.blue, WIIC.orange][k % 6], g);
      const a = (k / channels) * Math.PI * 2;
      tile.position.set(Math.cos(a) * 9, 2.5 + (k % 2) * 1.4, -6 + Math.sin(a) * 3);
      face.position.copy(tile.position);
      face.position.z += 0.1;
      g.userData.tiles.push([tile, face]);
    }
    g.userData.anim = (t) => g.userData.tiles.forEach(([tile, face], k) => {
      const yy = 2.5 + (k % 2) * 1.4 + Math.sin(t * 1.2 + k) * 0.25;
      tile.position.y = yy;
      face.position.y = yy;
    });
    return g;
  },

  models: {
    // Ojos de puntito (sin nariz), como los muñequitos de la ciudad.
    dots(v, parent, { y = 0.1, z = 0.78, x = 0.26, r = 0.08, color = WIIC.black } = {}) {
      [-x, x].forEach((ex) => {
        const e = v.s(WiiPoly.sphere(r, 10, 8), color, parent);
        e.position.set(ex, y, z);
      });
    },
    smile(v, parent, { y = -0.22, z = 0.76, w = 0.3 } = {}) {
      const m = v.s(new THREE.TorusGeometry(w / 2, 0.035, 6, 12, Math.PI), WIIC.black, parent);
      m.position.set(0, y, z);
      m.rotation.z = Math.PI;
      return m;
    },

    // Muñequito tipo Mii (sin copiarlo): cabezota, ojos de puntito, manos que flotan.
    mii(v, { hair = WIIC.navy, shirt = WIIC.sky, skin = WIIC.skin, pants = WIIC.gray } = {}) {
      const g = new THREE.Group();
      const head = v.s(WiiPoly.sphere(0.85), skin, g);
      head.position.y = 1.3;
      head.scale.set(1, 1.05, 0.95);
      const hairM = v.s(new THREE.SphereGeometry(0.88, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), hair, g);
      hairM.position.y = 1.36;
      const face = new THREE.Group();
      face.position.y = 1.3;
      g.add(face);
      this.dots(v, face, { y: 0.08, z: 0.8, x: 0.28, r: 0.09 });
      this.smile(v, face, { y: -0.25, z: 0.78 });
      const body = v.s(new THREE.CylinderGeometry(0.42, 0.55, 1.0, 16), shirt, g);
      body.position.y = 0.05;
      [-0.25, 0.25].forEach((x) => {
        const leg = v.s(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 10), pants, g);
        leg.position.set(x, -0.65, 0);
      });
      g.userData.hands = [-1, 1].map((s) => {
        const hnd = v.s(WiiPoly.sphere(0.17, 10, 8), skin, g);
        hnd.position.set(s * 0.85, 0.05, 0.1);
        return hnd;
      });
      g.userData.head = head;
      g.userData.face = face;
      g.userData.anim = (t) => {
        g.position.y = Math.abs(Math.sin(t * 2.2)) * 0.12;
        g.userData.hands.forEach((h, i) => { h.position.y = 0.05 + Math.sin(t * 3 + i * Math.PI) * 0.15; });
        g.rotation.y = Math.sin(t * 0.7) * 0.35;
      };
      return g;
    },

    munequito(v) {
      const g = this.mii(v, { hair: WIIC.navy, shirt: WIIC.sky });
      return g;
    },

    sensorin(v) {
      const g = new THREE.Group();
      v.s(new THREE.BoxGeometry(3.6, 0.55, 0.55), WIIC.white, g);
      const panel = v.s(new THREE.BoxGeometry(3.3, 0.35, 0.05), WIIC.black, g);
      panel.position.z = 0.28;
      const eyes = [-1.1, 1.1].map((x) => {
        const e = v.mesh(WiiPoly.sphere(0.13, 10, 8), v.glow(WIIC.pink), null, g);
        e.position.set(x, 0, 0.32);
        return e;
      });
      const stand = v.s(new THREE.CylinderGeometry(0.15, 0.4, 0.5, 12), WIIC.light, g);
      stand.position.y = -0.5;
      g.userData.anim = (t) => {
        g.position.y = Math.sin(t * 1.6) * 0.1;
        g.rotation.y = Math.sin(t * 0.8) * 0.4;
        // Los LED parpadean al mismo tiempo: "te ve".
        const on = Math.sin(t * 5) > -0.6;
        eyes.forEach((e) => { e.scale.setScalar(on ? 1 : 0.4); });
      };
      return g;
    },

    correita(v) {
      const g = new THREE.Group();
      const loop = v.s(new THREE.TorusGeometry(0.9, 0.09, 8, 28), WIIC.blue, g);
      loop.position.y = 1.0;
      const clip = v.s(new THREE.BoxGeometry(0.5, 0.3, 0.3), WIIC.gray, g);
      clip.position.y = 0.05;
      const face = v.s(new THREE.BoxGeometry(1.3, 0.9, 0.35), WIIC.light, g);
      face.position.y = -0.6;
      const f = new THREE.Group();
      f.position.set(0, -0.6, -0.6);
      g.add(f);
      this.dots(v, f, { y: 0.12, z: 0.8, x: 0.26, r: 0.07 });
      const mouth = v.s(new THREE.TorusGeometry(0.09, 0.03, 6, 12), WIIC.black, f); // boquita de "¡oh no!"
      mouth.position.set(0, -0.17, 0.8);
      g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 2.4) * 0.15; loop.rotation.y = Math.sin(t) * 0.5; };
      return g;
    },

    nunchuquin(v) {
      const g = new THREE.Group();
      const body = v.s(WiiPoly.sphere(0.9), WIIC.white, g);
      body.scale.set(0.8, 1.15, 0.8);
      const stick = v.s(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 14), WIIC.gray, g);
      stick.position.y = 1.1;
      const cap = v.s(WiiPoly.sphere(0.24, 12, 8), WIIC.light, g);
      cap.position.y = 1.25;
      this.dots(v, g, { y: 0.25, z: 0.72, x: 0.22, r: 0.07 });
      this.smile(v, g, { y: 0, z: 0.7, w: 0.22 });
      // Su cable, que siempre va detrás de alguien.
      const pts = [];
      for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(-0.2 - i * 0.18, -0.9 - Math.sin(i * 0.8) * 0.3, -0.2));
      v.s(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 6), WIIC.gray, g);
      g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 1.8) * 0.12; g.position.y = Math.sin(t * 2) * 0.1; };
      return g;
    },

    canalclima(v) {
      const g = new THREE.Group();
      [[0, 0, 0, 0.9], [-0.9, -0.2, 0, 0.65], [0.9, -0.15, 0, 0.7], [0.4, 0.5, -0.2, 0.6]].forEach(([x, y, z, r]) => {
        const c = v.s(WiiPoly.sphere(r), WIIC.white, g);
        c.position.set(x, y, z);
      });
      const sun = v.s(WiiPoly.sphere(0.55), WIIC.yellow, g);
      sun.position.set(1.0, 0.9, -0.6);
      this.dots(v, g, { y: 0.05, z: 0.86, x: 0.25, r: 0.07 });
      this.smile(v, g, { y: -0.18, z: 0.84, w: 0.22 });
      const drops = [-0.6, 0, 0.6].map((x) => {
        const d = v.s(new THREE.ConeGeometry(0.08, 0.25, 8), WIIC.sky, g);
        d.rotation.x = Math.PI;
        d.position.set(x, -1, 0);
        return d;
      });
      g.userData.anim = (t) => {
        g.position.x = Math.sin(t * 0.8) * 0.3;
        sun.rotation.z = t;
        drops.forEach((d, i) => { d.position.y = -0.9 - ((t * 1.5 + i * 0.33) % 1) * 0.9; });
      };
      return g;
    },

    zumbito(v) {
      const g = new THREE.Group();
      const body = v.s(WiiPoly.sphere(0.8), WIIC.yellow, g);
      body.scale.set(1.25, 1, 1);
      [-0.3, 0.3].forEach((x) => {
        const stripe = v.s(new THREE.TorusGeometry(0.72, 0.09, 8, 24), WIIC.black, g);
        stripe.rotation.y = Math.PI / 2;
        stripe.position.x = x;
        stripe.scale.set(1, 1.05, 1);
      });
      this.dots(v, g, { y: 0.15, z: 0.74, x: 0.24, r: 0.08 });
      this.smile(v, g, { y: -0.12, z: 0.74, w: 0.2 });
      const wingMat = new THREE.MeshBasicMaterial({ color: WIIC.sky, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const wings = [-1, 1].map((s) => {
        const w = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), wingMat);
        w.position.set(s * 0.35, 0.85, -0.1);
        w.rotation.x = -Math.PI / 2.4;
        g.add(w);
        return w;
      });
      const led = v.mesh(WiiPoly.sphere(0.1, 8, 6), v.glow(WIIC.sky), null, g);
      led.position.set(0, 0.95, 0.3);
      g.userData.anim = (t) => {
        wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.3 + Math.sin(t * 30) * 0.4); });
        // Se mueve al ritmo: un saltito cada 600 ms.
        const beat = (t % 0.6) / 0.6;
        g.position.y = (1 - beat) * 0.18;
        led.visible = beat < 0.5;
      };
      return g;
    },

    cometa(v) {
      const g = this.mii(v, { hair: WIIC.white, shirt: WIIC.white, pants: WIIC.navy });
      const hat = v.s(new THREE.CylinderGeometry(0.75, 0.85, 0.45, 20), WIIC.navy, g);
      hat.position.y = 2.15;
      const brim = v.s(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 24), WIIC.navy, g);
      brim.position.y = 1.95;
      const star = WiiPoly.models.star(v, WIIC.yellow, 0.32);
      star.position.set(0, 2.2, 0.78);
      g.add(star);
      // Capa azul que ondea.
      const capeGeo = new THREE.PlaneGeometry(1.8, 1.6, 6, 4);
      const cape = v.s(capeGeo, v.soft(WIIC.blue, { side: THREE.DoubleSide }), g);
      cape.position.set(0, 0.2, -0.5);
      const pos = capeGeo.attributes.position;
      const base = Float32Array.from(pos.array);
      const anim = g.userData.anim;
      g.userData.anim = (t, dt) => {
        anim(t, dt);
        for (let i = 0; i < pos.count; i++) {
          const x = base[i * 3];
          const y = base[i * 3 + 1];
          pos.array[i * 3 + 2] = base[i * 3 + 2] - Math.sin(t * 3 + x * 2) * 0.12 * (0.8 - y) ;
        }
        pos.needsUpdate = true;
        star.rotation.y = t * 2;
      };
      return g;
    },

    // Estrellita limpia con bisel (más redonda que la de la N64).
    star(v, color = WIIC.yellow, size = 1, eyes = false) {
      const s = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const r = (i % 2 ? 0.48 : 1) * size;
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.2 * size, bevelEnabled: true, bevelThickness: 0.08 * size, bevelSize: 0.08 * size, bevelSegments: 2 });
      geo.center();
      const g = new THREE.Group();
      v.s(geo, color, g);
      if (eyes) WiiPoly.models.dots(v, g, { y: 0.1 * size, z: 0.25 * size, x: 0.2 * size, r: 0.07 * size });
      return g;
    },

    planet(v, r = 2) {
      const g = new THREE.Group();
      v.s(WiiPoly.sphere(r, 28, 20), WIIC.green, g);
      const sea = v.s(WiiPoly.sphere(r * 1.005, 28, 20), v.soft(WIIC.sky, { transparent: true, opacity: 0.55 }), g);
      sea.scale.y = 0.4;
      const ring = v.s(new THREE.TorusGeometry(r * 1.5, r * 0.04, 6, 48), WIIC.yellow, g);
      ring.rotation.x = Math.PI / 2.3;
      return g;
    },
  },
};
