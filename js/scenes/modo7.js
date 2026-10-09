// MODO 7 — el truco de la Super Nintendo (1990) para fingir 3D: un piso plano que gira y se
// agranda con perspectiva. Lo usan la Pista Cero, el Escuadrón Zorrino, la Arena de Dani y
// Modosiete. También trae paintArt(), para pintar sprites "a todo color" en un canvas.
//
//   const tex = m7Texture(128, (g, n) => { ...dibuja el piso... });
//   const m7 = new Mode7(canvas, tex, { horizon: 0.3, height: 24, focal: 160 });
//   m7.render(camX, camY, angulo);           // pinta el piso debajo del horizonte
//   m7.project(x, y) -> { x, y, s } | null   // dónde cae un punto del piso en la pantalla

// Pinta filas de letras con una paleta (ver SNES_PAL en js/worlds/snes.js).
function paintArt(g, rows, x, y, scale = 2, flip = false, pal = rows.pal || SNES_PAL) {
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const color = pal[row[c]];
      if (!color) continue;
      g.fillStyle = color;
      const cx = flip ? row.length - 1 - c : c;
      g.fillRect(Math.round(x + cx * scale), Math.round(y + r * scale), scale, scale);
    }
  });
}

// Textura cuadrada (lado potencia de 2) que se repite. outside: color fuera del piso si wrap = false.
function m7Texture(size, paint, { wrap = true, outside = '#000000' } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  paint(g, size);
  const data = g.getImageData(0, 0, size, size).data;
  const px = new Uint32Array(data.buffer.slice(0));
  // El color de afuera en el mismo formato de 32 bits que los píxeles.
  g.fillStyle = outside;
  g.fillRect(0, 0, 1, 1);
  const out = new Uint32Array(g.getImageData(0, 0, 1, 1).data.buffer.slice(0))[0];
  return { size, mask: size - 1, px, wrap, out };
}

class Mode7 {
  constructor(canvas, tex, { horizon = 0.3, height = 24, focal = 160, fog = null } = {}) {
    this.cv = canvas;
    this.g = canvas.getContext('2d');
    this.tex = tex;
    this.w = canvas.width;
    this.h = canvas.height;
    this.hy = Math.floor(this.h * horizon);
    this.height = height;
    this.focal = focal;
    this.fog = fog; // color de la neblina en el horizonte (oculta que el piso se repite)
    this.img = this.g.createImageData(this.w, this.h);
    this.buf = new Uint32Array(this.img.data.buffer);
    this.cam = { x: 0, y: 0, a: 0 };
  }

  render(x, y, a) {
    this.cam = { x, y, a };
    const { w, h, hy, tex, buf } = this;
    const { size, mask, px, wrap, out } = tex;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    buf.fill(0, 0, (hy + 1) * w);
    for (let row = hy + 1; row < h; row++) {
      const z = (this.height * this.focal) / (row - hy); // distancia de esta fila
      const k = z / this.focal;                           // unidades del piso por píxel
      // Hacia adelante = (ca, sa); hacia la derecha = (-sa, ca).
      let wx = x + ca * z + sa * k * (w / 2);
      let wy = y + sa * z - ca * k * (w / 2);
      const dx = -sa * k;
      const dy = ca * k;
      let o = row * w;
      if (wrap) {
        for (let col = 0; col < w; col++) {
          buf[o++] = px[((wy | 0) & mask) * size + ((wx | 0) & mask)];
          wx += dx;
          wy += dy;
        }
      } else {
        for (let col = 0; col < w; col++) {
          const ix = Math.floor(wx);
          const iy = Math.floor(wy);
          buf[o++] = ix >= 0 && ix < size && iy >= 0 && iy < size ? px[iy * size + ix] : out;
          wx += dx;
          wy += dy;
        }
      }
    }
    this.g.putImageData(this.img, 0, 0);
    if (this.fog) {
      const grad = this.g.createLinearGradient(0, hy, 0, hy + (h - hy) * 0.45);
      grad.addColorStop(0, this.fog);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.g.fillStyle = grad;
      this.g.fillRect(0, hy, w, h - hy);
    }
  }

  // Punto del piso -> pantalla. s = cuánto se agranda un sprite a esa distancia (1 = a "focal").
  project(px, py) {
    const { x, y, a } = this.cam;
    const rx = px - x;
    const ry = py - y;
    const z = rx * Math.cos(a) + ry * Math.sin(a);
    const lat = -rx * Math.sin(a) + ry * Math.cos(a);
    if (z < 4) return null;
    return { x: this.w / 2 + (lat * this.focal) / z, y: this.hy + (this.height * this.focal) / z, s: this.focal / z, z };
  }
}

// ---------- Pisos listos para usar ----------

const M7_FLOORS = {
  // Cuadrícula de colores (Modosiete).
  grid: () => m7Texture(64, (g, n) => {
    const cols = ['#8e44ad', '#f79ac0', '#2e5c9a', '#ffd93d'];
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      g.fillStyle = cols[(x + y * 2) % 4];
      g.fillRect(x * 16, y * 16, 16, 16);
    }
    g.fillStyle = '#1a1a2e';
    for (let i = 0; i < n; i += 16) { g.fillRect(i, 0, 1, n); g.fillRect(0, i, n, 1); }
  }),

  // Pista de carreras a lo largo del eje X, con orillas de energía y marcas en el piso.
  track: () => m7Texture(256, (g, n) => {
    g.fillStyle = '#1e7a2e';
    g.fillRect(0, 0, n, n);
    // Pasto con cuadros, para que se sienta la velocidad.
    for (let y = 0; y < n; y += 16) for (let x = 0; x < n; x += 16) {
      if ((x + y) % 32 === 0) { g.fillStyle = '#3fbf3f'; g.fillRect(x, y, 16, 16); }
    }
    // Asfalto (centrado en y = 128).
    g.fillStyle = '#4a4a5e';
    g.fillRect(0, 88, n, 80);
    g.fillStyle = '#5a5a70';
    for (let x = 0; x < n; x += 8) g.fillRect(x, 92 + ((x / 8) % 3) * 24, 4, 2);
    // Orillas de energía amarillo / rojo.
    for (let x = 0; x < n; x += 16) {
      g.fillStyle = (x / 16) % 2 ? '#ffd93d' : '#e8393d';
      g.fillRect(x, 82, 16, 6);
      g.fillRect(x, 168, 16, 6);
    }
    // Línea del centro.
    g.fillStyle = '#ffffff';
    for (let x = 0; x < n; x += 32) g.fillRect(x, 127, 16, 2);
    // Flechas de turbo.
    g.fillStyle = '#f79ac0';
    for (let i = 0; i < 6; i++) g.fillRect(200 + i * 2, 100 + i, 2, 30 - i * 2);
  }),

  // Arena redonda (Dani Turbo). Fuera de la arena: el vacío del espacio.
  arena: () => m7Texture(256, (g, n) => {
    g.fillStyle = '#1a1a2e';
    g.fillRect(0, 0, n, n);
    const ring = (r, color) => { g.fillStyle = color; g.beginPath(); g.arc(n / 2, n / 2, r, 0, Math.PI * 2); g.fill(); };
    ring(124, '#ffd93d');
    ring(118, '#2e5c9a');
    for (let i = 0; i < 16; i++) {
      g.fillStyle = i % 2 ? '#3b7bd8' : '#2e5c9a';
      g.beginPath();
      g.moveTo(n / 2, n / 2);
      g.arc(n / 2, n / 2, 116, (i / 16) * Math.PI * 2, ((i + 1) / 16) * Math.PI * 2);
      g.fill();
    }
    ring(64, '#ffffff');
    ring(60, '#e8393d');
    ring(40, '#ffffff');
    ring(34, '#f79ac0');
    g.fillStyle = '#ffffff';
    g.fillRect(n / 2 - 116, n / 2 - 1, 232, 2);
  }, { wrap: false, outside: '#0b0b1e' }),

  // Superficie de un planeta, con cuadrícula (Escuadrón Zorrino).
  planet: () => m7Texture(128, (g, n) => {
    g.fillStyle = '#1e5a3a';
    g.fillRect(0, 0, n, n);
    g.fillStyle = '#2a7a4e';
    for (let y = 0; y < n; y += 32) for (let x = 0; x < n; x += 32) if ((x + y) % 64 === 0) g.fillRect(x, y, 32, 32);
    g.fillStyle = '#7fe0ff';
    for (let i = 0; i < n; i += 32) { g.fillRect(i, 0, 1, n); g.fillRect(0, i, n, 1); }
    g.fillStyle = '#3a9a6e';
    g.fillRect(70, 20, 20, 10);
    g.fillRect(14, 80, 10, 24);
  }),
};

// Fondo de cielo con dos capas de montañas que se mueven distinto (parallax).
function paintParallaxSky(g, w, hy, shift, { top = '#2e5c9a', bottom = '#5fcde4', far = '#8c8c9c', near = '#4a4a5e' } = {}) {
  const grad = g.createLinearGradient(0, 0, 0, hy);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, hy + 1);
  const ridge = (color, period, amp, base, off) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, hy + 1);
    for (let x = 0; x <= w; x += 4) {
      const t = (x + off) / period;
      const yy = base - Math.abs(Math.sin(t)) * amp - Math.abs(Math.sin(t * 2.3 + 1)) * amp * 0.4;
      g.lineTo(x, yy);
    }
    g.lineTo(w, hy + 1);
    g.fill();
  };
  ridge(far, 46, 18, hy, shift * 0.4);
  ridge(near, 30, 10, hy + 1, shift);
}
