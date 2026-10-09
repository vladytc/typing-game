// MUNDO 3 — Reino 16-Bit explorable (docs/LORE.md §6). Se carga después de js/worlds/snes.js
// y de js/town-eras.js (agrega casillas a HUB_ERAS.snes.tiles).
// Cuatro zonas conectadas por salidas; cada encuentro está parado en un paso angosto:
//
//   COLINAS DINOSAURIO (40×24)                PISTA CERO (40×22)
//   +---------+-+--------------+-+-----[x]--+  +-----------+-+----------------+--+--------+
//   | B colinas |Modosiete C río |  Setita   |  | paddock   |b| pista en S     |~~| castillo|
//   |   (h h)   |-> :::::        | D bosque  |  | (pits,    |b| ====> ↑        |==Caballero |
//   |-Dino Huevín-  ~~Gema~~     |  (Glitch) |  |  robot)   |b| <==== ↑        |~~| rosa    |-> hangar
//   | A tubería |   C abajo  ::::::> D       |  |           |Rayo Cero ====> |~~|         |
//   +-----P-----+-----------------+----------+  +----[x]----+-+----------------+--+--------+
//
//   HANGAR (36×22)                            PLANETA OSCURO (30×20)
//   +----------+-----------+------[P]----+    +--P---------------------------+
//   | entrada  | bodega de | ::Dani::    |    | entrada  cristales  charcos  |
//   | (conejo) | barriles  | ARENA MODO 7|    |   ...cueva que baja...       |
//  <-   ::::Vulpino::::    |  (piso que  |    |          ::::Reina Nébula:: nido |
//   |          | ::::Mono Barril  gira)  |    +------------------------------+
//   +----------+-----------+-------------+
//
// Orden: Dino Huevín → Modosiete → Gema → Setita → Rayo Cero → Caballero → Vulpino →
//        Mono Barril → Dani (Arena Modo 7) → Reina Nébula. (El mismo de `nodes` en snes.js.)

const SNES_FACTS = CONSOLES.find((c) => c.id === 'snes').facts;

// ---------- Casillas 16-bit (16×16, letras a/b/c/d + colores fijos de SNES_PAL) ----------
// Número pseudoazaroso fijo por casilla (para que el pasto no se vea repetido a cuadritos).
const s16Hash = (x, y, s = 1) => {
  let n = Math.imul(x + 31 * s, 374761393) ^ Math.imul(y + 17 * s, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
// Sombra suave (semitransparente) que se pinta dentro del sprite.
const S16_SHADE = 'rgba(26, 26, 46, 0.28)';
const s16Pal = (rows, extra = {}) => Object.assign(rows, { pal: { ...SNES_PAL, Q: S16_SHADE, ...extra } });
// Bolitas con borde, brillo y sombra (rocas, muros orgánicos). Fuera de ellas: `bg`.
const s16Blobs = (list, bg = '.') => rowsOf((x, y) => {
  for (const [cx, cy, r] of list) {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const dd = Math.hypot(dx, dy);
    if (dd > r) continue;
    if (dd > r - 1.1) return 'd';
    if (dx + dy < -r * 0.6) return 'a';
    if (dx + dy > r * 0.5) return 'c';
    return 'b';
  }
  return bg;
});
// Una florecita: centro y cuatro pétalos.
const s16Flower = (x, y, petal, center = 'Y') => [[x, y, center], [x - 1, y, petal], [x + 1, y, petal], [x, y - 1, petal], [x, y + 1, petal]];
// Briznas de pasto: punta clara y tallo oscuro.
const s16Blades = (spots) => spots.flatMap(([x, y]) => [[x, y, 'b'], [x, y + 1, 'c'], [x + 2, y, 'b'], [x + 2, y + 1, 'c'], [x + 1, y + 1, 'c'], [x + 1, y + 2, 'c']]);

Object.assign(SPRITES, {
  // --- Colinas Dinosaurio ---
  s16_pasto: tileFrom('a', s16Blades([[1, 2], [9, 0], [12, 9], [4, 11]]).concat(speckles(7, 21, 'd'))),
  s16_alto: rowsOf((x, y) => {
    const k = (x + (y >= 8 ? 2 : 0)) % 4;
    const yy = y % 8;
    if (yy === 0) return 'a';
    if (k === 0 && yy >= 2) return 'c';
    if (k === 1) return yy < 3 ? 'b' : 'c';
    if (k === 2 && yy >= 4) return 'c';
    return yy >= 6 ? 'd' : 'a';
  }),
  s16_flores: s16Pal(tileFrom('a', s16Blades([[9, 1], [1, 8]]).concat(
    s16Flower(3, 3, 'R'), s16Flower(11, 6, 'Y', 'O'), s16Flower(6, 12, 'I'), s16Flower(13, 13, 'W'),
  ))),
  // Camino de piedras acomodadas (con brillo arriba y sombra abajo).
  s16_piedra: rowsOf((x, y) => {
    const row = y >> 2;
    const sx = (x + (row % 2) * 4) % 8;
    const sy = y % 4;
    if (sx === 7 || sy === 3) return 'd';
    if (sy === 0 && sx < 6) return 'a';
    if (sx === 6 || sy === 2) return 'c';
    return s16Hash(x, y, 4) < 0.1 ? 'c' : 'b';
  }),
  // Río con reflejos (dos tonos alternando) y destellos.
  s16_agua: rowsOf((x, y) => {
    const band = (y >> 2) % 2;
    const wave = (x + band * 4 + (y % 4)) % 8;
    if ((x === 4 && y === 2) || (x === 12 && y === 10) || (x === 5 && y === 2)) return 'a';
    if (y % 4 === 1 && wave < 3) return 'b';
    return band ? 'd' : 'c';
  }),
  s16_puente: rowsOf((x, y) => {
    if (x === 0 || x === 15) return 'd';
    if (x === 1 || x === 14) return 'c';
    if (y % 4 === 3) return 'c';
    if (y % 4 === 0) return 'a';
    return s16Hash(x, y, 5) < 0.08 ? 'c' : 'b';
  }),
  // Árbol redondo con brillo, tronco y sombra suave.
  s16_arbol: s16Pal(rowsOf((x, y) => {
    const dx = x + 0.5 - 8;
    const dy = y + 0.5 - 6;
    const d = Math.hypot(dx, dy);
    if (d <= 6.4) {
      if (d > 5.5) return 'd';
      if (dx + dy < -3.5) return 'a';
      if (dx + dy > 3) return 'c';
      return s16Hash(x, y, 3) < 0.12 ? 'c' : 'b';
    }
    if (y >= 12 && y <= 14 && x >= 6 && x <= 9) return x === 6 || x === 9 ? 'K' : x === 7 ? 'n' : 'N';
    if (y >= 13 && Math.abs(x + 0.5 - 8) < 6.5 - (y - 13) * 1.5) return 'Q';
    return '.';
  })),
  // Colina redonda con ojos (como en el juego del dinosaurio verde).
  s16_colina: s16Pal(rowsOf((x, y) => {
    const dx = (x + 0.5 - 8) / 7.6;
    const dy = (y + 0.5 - 16) / 13;
    const d = Math.hypot(dx, dy);
    if (d > 1) return '.';
    if (d > 0.9) return 'd';
    if ((x === 5 || x === 6 || x === 9 || x === 10) && y >= 7 && y <= 10) return y === 7 && (x === 5 || x === 9) ? 'W' : 'd';
    if (dx < -0.3 && dy < -0.45) return 'a';
    if (dx > 0.45) return 'c';
    return 'b';
  })),
  // Huevo con manchas en su nido.
  s16_huevo: s16Pal(rowsOf((x, y) => {
    const dx = (x + 0.5 - 8) / 4.6;
    const dy = (y + 0.5 - 7.5) / 6;
    const d = Math.hypot(dx, dy);
    if (y >= 11 && y <= 14 && x >= 2 && x <= 13 && (d > 0.95 || y >= 13)) return (x + y) % 3 === 0 ? 'N' : 'n';
    if (d > 1) return y === 15 && x >= 3 && x <= 12 ? 'Q' : '.';
    if (d > 0.85) return 'd';
    if ((x === 6 && y === 4) || (x === 9 && y === 7) || (x === 10 && y === 8) || (x === 6 && y === 9) || (x === 7 && y === 9)) return 'b';
    if (dx > 0.4) return 'c';
    return 'a';
  })),
  s16_roca: s16Pal(rowsOf((x, y) => {
    const dx = x + 0.5 - 8;
    const dy = (y + 0.5 - 9) * 1.2;
    const d = Math.hypot(dx, dy);
    if (d <= 6.5) {
      if (d > 5.5) return 'd';
      if (dx + dy < -3.5) return 'a';
      if (dx + dy > 2.5) return 'c';
      return 'b';
    }
    if (y >= 14 && Math.abs(dx) < 6) return 'Q';
    return '.';
  })),

  // --- Pista Cero ---
  // Piso "Modo 7": cuadrícula brillante sobre azul.
  s16_pista: rowsOf((x, y) => {
    const gx = x % 8;
    const gy = y % 8;
    if (gx === 0 && gy === 0) return 'a';
    if (gx === 0 || gy === 0) return 'b';
    return ((x >> 3) + (y >> 3)) % 2 ? 'd' : 'c';
  }),
  s16_barrera: rowsOf((x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'd';
    if (x === 1 || y === 1) return 'a';
    if (x >= 6 && x <= 9 && y >= 6 && y <= 9) return 'a';
    if (x >= 4 && x <= 11 && y >= 4 && y <= 11) return 'b';
    return 'c';
  }),
  s16_meta: rowsOf((x, y) => (((x >> 2) + (y >> 2)) % 2 ? 'd' : 'a')),
  // Placa turbo: flechas hacia la derecha.
  s16_turbo: rowsOf((x, y) => {
    if (y === 0 || y === 15) return 'd';
    const v = Math.abs(y + 0.5 - 8);
    const u = 7 - (x % 8);
    if (v < 6 && Math.abs(u - (v * 0.6 + 1.5)) < 1) return 'b';
    if (v < 6 && Math.abs(u - (v * 0.6 + 2.5)) < 0.5) return 'a';
    return 'c';
  }),
  // Zona de pits: placa gris con un cuadro de rayas de precaución.
  s16_pits: rowsOf((x, y) => {
    if (x === 0 || y === 0) return 'd';
    if (x >= 3 && x <= 12 && y >= 3 && y <= 12) {
      if (x === 3 || x === 12 || y === 3 || y === 12) return 'd';
      return (x + y) % 4 < 2 ? 'b' : 'd';
    }
    return (x === 15 || y === 15) ? 'a' : 'c';
  }),
  // Castillo rosa.
  s16_castillo: rowsOf((x, y) => {
    const row = y >> 2;
    const bx = (x + (row % 2) * 4) % 8;
    const sy = y % 4;
    if (sy === 3 || bx === 7) return 'c';
    if (sy === 0 && bx < 6) return 'a';
    return s16Hash(x, y, 6) < 0.06 ? 'd' : 'b';
  }),
  s16_almena: rowsOf((x, y) => {
    const mx = x % 8;
    if (y < 6) {
      if (mx >= 5) return '.';
      if (y === 0 || mx === 0 || mx === 4) return 'd';
      return y === 1 ? 'a' : 'b';
    }
    if (y === 6 || y === 15) return 'd';
    return y % 4 === 3 ? 'c' : (y === 7 ? 'a' : 'b');
  }),
  s16_baldosa: rowsOf((x, y) => {
    if (x % 8 === 7 || y % 8 === 7) return 'c';
    if (x % 8 === 0 || y % 8 === 0) return 'a';
    return ((x >> 3) + (y >> 3)) % 2 ? 'b' : 'a';
  }),
  s16_alfombra: rowsOf((x, y) => {
    const d = Math.abs(x + 0.5 - 8) + Math.abs(y + 0.5 - 8);
    if (d < 3) return 'a';
    if (d < 4) return 'c';
    if ((x === 1 || x === 14) && (y === 1 || y === 14)) return 'a';
    return 'b';
  }),
  s16_pilar: s16Pal(rowsOf((x, y) => {
    if (y <= 2) return x >= 2 && x <= 13 ? (y === 0 || x === 2 || x === 13 ? 'K' : y === 1 ? 'Y' : 'D') : '.';
    if (y >= 13) return x >= 3 && x <= 12 ? (y === 15 || x === 3 || x === 12 ? 'd' : 'c') : (y === 15 ? 'Q' : '.');
    if (x < 4 || x > 11) return '.';
    if (x === 4 || x === 11) return 'd';
    if (x === 5) return 'a';
    if (x === 10) return 'c';
    return 'b';
  })),
  // Portón del castillo (abierto).
  s16_puerta: s16Pal(rowsOf((x, y) => {
    if (x <= 1 || x >= 14) return x === 0 || x === 15 ? 'd' : 'b';
    if (y < 7 && Math.hypot(x + 0.5 - 8, y + 0.5 - 7) > 6) return y % 4 === 3 ? 'd' : 'b';
    if (x <= 3 || x >= 12) return y % 3 === 0 ? 'n' : 'N';
    return y < 9 ? 'd' : 'c';
  })),

  // --- Hangar ---
  s16_metal: rowsOf((x, y) => {
    if (x === 15 || y === 15) return 'd';
    if (x === 0 || y === 0) return 'a';
    if ((x === 2 || x === 13) && (y === 2 || y === 13)) return 'a';
    if ((x === 3 || x === 14) && (y === 3 || y === 14)) return 'd';
    return s16Hash(x, y, 7) < 0.05 ? 'c' : 'b';
  }),
  // Piso con guía amarilla (marca el camino de las naves).
  s16_guia: s16Pal(rowsOf((x, y) => {
    if (x === 15 || y === 15) return 'd';
    if (x === 0 || y === 0) return 'a';
    const d = Math.abs(x + 0.5 - 8) + Math.abs(y + 0.5 - 8);
    if (d < 3) return 'Y';
    if (d < 4) return 'D';
    return 'b';
  })),
  s16_pared: rowsOf((x, y) => {
    if (y === 0 || y >= 14) return 'd';
    if (y === 5 || y === 6) return x % 4 === 1 ? 'a' : 'd';
    if (x % 8 === 0) return 'c';
    if (y === 1) return 'a';
    return y > 10 ? 'c' : 'b';
  }),
  s16_caja: rowsOf((x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'd';
    if (x <= 2 || x >= 13 || y <= 2 || y >= 13) return x === 1 || y === 1 ? 'a' : 'c';
    if (Math.abs(x - y) <= 1) return 'c';
    return y % 4 === 0 ? 'c' : 'b';
  }),
  // Arena Modo 7: aro de luces y el gran 7 del centro.
  s16_aro: rowsOf((x, y) => {
    if (x % 4 === 1 && y % 4 === 1) return ((x + y) >> 2) % 2 ? 'b' : 'a';
    if (x % 8 === 0 || y % 8 === 0) return 'd';
    return 'c';
  }),
  s16_siete: rowsOf((x, y) => {
    const bar = y >= 3 && y <= 5 && x >= 3 && x <= 12;
    const c = 12 - (y - 5) * 0.75;
    const stroke = y > 5 && y <= 13 && x >= c - 2.5 && x <= c + 0.5;
    if (bar || stroke) return y === 3 ? 'a' : 'b';
    const near = [[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      const nc = 12 - (ny - 5) * 0.75;
      return (ny >= 3 && ny <= 5 && nx >= 3 && nx <= 12) || (ny > 5 && ny <= 13 && nx >= nc - 2.5 && nx <= nc + 0.5);
    });
    if (near) return 'd';
    return x % 8 === 0 || y % 8 === 0 ? 'd' : 'c';
  }),

  // --- Planeta Oscuro ---
  s16_oscuro: rowsOf((x, y) => {
    const r = s16Hash(x, y, 8);
    if (r < 0.012) return 'a';
    if (r < 0.08) return 'b';
    if (r < 0.12) return 'd';
    return 'c';
  }),
  s16_oscuromuro: s16Blobs([[4, 4, 4.2], [12, 3, 3.6], [8, 10, 4.8], [2, 13, 3], [14, 12, 3.4]], 'd'),
  s16_charco: rowsOf((x, y) => {
    for (const [cx, cy] of [[4, 4], [11, 9], [6, 13]]) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d < 1.6) return d < 0.8 ? 'c' : 'a';
    }
    if ((y % 6 === 2 && (x + y) % 7 < 4)) return 'b';
    return y % 8 < 4 ? 'c' : 'd';
  }),
  // Cristales que brillan solos.
  s16_cristal: s16Pal(rowsOf((x, y) => {
    for (const [cx, top, w] of [[8, 1, 3.2], [4, 6, 2.2], [12.5, 7, 2.2]]) {
      const dx = x + 0.5 - cx;
      const half = Math.min(w, (y - top) * 0.8);
      if (y < top || Math.abs(dx) > half) continue;
      if (Math.abs(dx) > half - 0.9 || y === 15) return 'd';
      return dx < -0.5 ? 'a' : dx < 0.5 ? 'b' : 'c';
    }
    if (y >= 14 && x >= 1 && x <= 14) return 'Q';
    return '.';
  })),

  // ---------- Personajes de las zonas ----------
  // Una tortuga que perdió su caparazón (anda en camiseta).
  tortuga: snesArt([
    '................',
    '......KKKK......',
    '.....KYYYYK.....',
    '....KYYWWYYK....',
    '....KYYWKYYK....',
    '....KYYYYYYYK...',
    '.....KYYYYYK....',
    '......KYYYK.....',
    '.....KUUUUUK....',
    '....KYKUUUKYK...',
    '....KYKUWUKYK...',
    '.....KKUUUKK....',
    '......KUUUK.....',
    '......KYKYK.....',
    '.....KOOKOOK....',
    '.....KKKKKKK....',
  ]),
  // Robot de los pits.
  robopits: snesArt([
    '................',
    '.......R........',
    '.......K........',
    '.....KKKKK......',
    '....KSSSSSK.....',
    '....KSLKLSK.....',
    '....KSSSSSK.....',
    '....KPPPPPK.....',
    '.....KKKKK......',
    '...KKSSSSSKK....',
    '..KSKSYYYSKSK...',
    '..KSKSYOYSKSK...',
    '..KK.KSSSK.KK...',
    '.....KPKPK......',
    '....KPPKPPK.....',
    '....KKKKKKK.....',
  ]),
  // Conejo piloto, veterano del hangar.
  conejo: snesArt([
    '....KK....KK....',
    '...KSIK..KISK...',
    '...KSIK..KISK...',
    '...KSIK..KISK...',
    '....KSKKKKSK....',
    '...KSSSSSSSSK...',
    '...KSWKSSKWSK...',
    '...KSSSIISSSK...',
    '....KSSWWSSK....',
    '.....KKKKKK.....',
    '....KGGGGGGK....',
    '...KSKGYYGKSK...',
    '...KSKGGGGKSK...',
    '....KKGGGGKK....',
    '.....KgKKgK.....',
    '....KKKKKKKK....',
  ]),

  // ---------- Tesoros de las zonas ----------
  pluma_capa: snesArt([
    '................',
    '...........KK...',
    '.........KKWYK..',
    '........KWWYYK..',
    '.......KWWYYDK..',
    '......KWWYYDK...',
    '.....KWWYYDK....',
    '....KWWYYDK.....',
    '...KWWYYDK......',
    '...KWYYDK.......',
    '..KWYDDK........',
    '..KYDKK.........',
    '.KDK............',
    '.KK.............',
    'K...............',
    '................',
  ]),
  gatillos_lr: snesArt(rowsOf((x, y) => {
    const side = x < 8 ? 1 : 0;
    const lx = side ? x : x - 8;
    if (y < 4 || y > 12) return '.';
    if ((lx === 0 || lx === 7) && (y === 4 || y === 12)) return '.';
    if (lx === 0 || lx === 7 || y === 4 || y === 12) return 'K';
    const glyph = side ? ['K..', 'K..', 'K..', 'K..', 'KKK'] : ['KK.', 'K.K', 'KK.', 'K.K', 'K.K'];
    const gx = lx - 2;
    const gy = y - 6;
    if (gx >= 0 && gx < 3 && gy >= 0 && gy < 5 && glyph[gy][gx] === 'K') return 'K';
    if (y === 5) return 'Z';
    if (y === 11) return 'P';
    return 'S';
  })),
  // Un cristal con los 16 colores de una paleta adentro.
  cristal_paleta: snesArt(rowsOf((x, y) => {
    const d = Math.abs(x + 0.5 - 8) + Math.abs(y + 0.5 - 8);
    if (d > 7.6) return '.';
    if (d > 6.6) return 'K';
    if (x >= 4 && x <= 11 && y >= 4 && y <= 11) return 'ROYGgLUBMmIFDNPW'[((y - 4) >> 1) * 4 + ((x - 4) >> 1)];
    return x + y < 16 ? 'W' : 'V';
  })),
});

// Paletas de las casillas nuevas en la era 16 bits (sin tocar las que ya hay).
Object.assign(HUB_ERAS.snes.tiles, {
  s16_pasto: { a: '#3fbf3f', b: '#9be86e', c: '#1e7a2e', d: '#5fd65f' },
  s16_alto: { a: '#3fbf3f', b: '#9be86e', c: '#1e7a2e', d: '#2a9e3a' },
  s16_flores: { a: '#3fbf3f', b: '#9be86e', c: '#1e7a2e', d: '#5fd65f' },
  s16_piedra: { a: '#f2e6c8', b: '#c8b48c', c: '#9a8462', d: '#6a5a44' },
  s16_agua: { a: '#ffffff', b: '#9be7ff', c: '#3b7bd8', d: '#2e5c9a' },
  s16_puente: { a: '#f2c14e', b: '#d29a5b', c: '#a0522d', d: '#5a2e14' },
  s16_arbol: { a: '#9be86e', b: '#3fbf3f', c: '#1e7a2e', d: '#0f3d1a' },
  s16_colina: { a: '#c8f5a0', b: '#5fd65f', c: '#2a9e3a', d: '#1a1a2e' },
  s16_huevo: { a: '#ffffff', b: '#3fbf3f', c: '#c0c8d8', d: '#1a1a2e' },
  s16_roca: { a: '#ffffff', b: '#8c8c9c', c: '#4a4a5e', d: '#1a1a2e' },
  s16_pista: { a: '#ffffff', b: '#5fcde4', c: '#1c2468', d: '#26307e' },
  s16_barrera: { a: '#ffffff', b: '#ffd93d', c: '#8c8c9c', d: '#4a4a5e' },
  s16_meta: { a: '#ffffff', b: '#ffffff', c: '#1a1a2e', d: '#1a1a2e' },
  s16_turbo: { a: '#ffffff', b: '#f79ac0', c: '#1c2468', d: '#8e44ad' },
  s16_pits: { a: '#c0c8d8', b: '#ffd93d', c: '#8c8c9c', d: '#4a4a5e' },
  s16_castillo: { a: '#ffd0e4', b: '#f79ac0', c: '#c86a9a', d: '#7a2e5a' },
  s16_almena: { a: '#ffd0e4', b: '#f79ac0', c: '#c86a9a', d: '#7a2e5a' },
  s16_baldosa: { a: '#fff8e7', b: '#f2d0dc', c: '#d8a0b8', d: '#b07090' },
  s16_alfombra: { a: '#ffd93d', b: '#e8393d', c: '#9c1f2a', d: '#5a0f1a' },
  s16_pilar: { a: '#ffd0e4', b: '#f79ac0', c: '#c86a9a', d: '#7a2e5a' },
  s16_puerta: { a: '#ffd0e4', b: '#f79ac0', c: '#7a4a6a', d: '#3a1a3a' },
  s16_metal: { a: '#c0c8d8', b: '#6a7488', c: '#4a5268', d: '#2a2e40' },
  s16_guia: { a: '#c0c8d8', b: '#6a7488', c: '#4a5268', d: '#2a2e40' },
  s16_pared: { a: '#9be7ff', b: '#4a5268', c: '#353b50', d: '#1a1a2e' },
  s16_caja: { a: '#f2c14e', b: '#d29a5b', c: '#a0522d', d: '#1a1a2e' },
  s16_aro: { a: '#ffffff', b: '#ffd93d', c: '#1c2468', d: '#8e44ad' },
  s16_siete: { a: '#ffffff', b: '#ffd93d', c: '#1c2468', d: '#e8393d' },
  s16_oscuro: { a: '#5fcde4', b: '#4a3a80', c: '#2a2050', d: '#150f30' },
  s16_oscuromuro: { a: '#8e7ad0', b: '#5a4a9a', c: '#3a2a6a', d: '#0d0b26' },
  s16_charco: { a: '#9be7ff', b: '#2e8a9a', c: '#1c4a6a', d: '#0d2a40' },
  s16_cristal: { a: '#ffffff', b: '#9be7ff', c: '#8e44ad', d: '#1a1a2e' },
});

// Tesoros nuevos de las zonas (salen en la sala Super Nintendo del museo).
Object.assign(TREASURES, {
  pluma_capa: { room: 'snes', name: 'Pluma voladora', desc: 'En el juego del dinosaurio verde, una pluma te daba una capa para volar y planear por todo el nivel.' },
  gatillos_lr: { room: 'snes', name: 'Botones L y R', desc: 'Los primeros botones de hombro en un control de Nintendo. Desde entonces casi todos los controles los tienen.' },
  cristal_paleta: { room: 'snes', name: 'Cristal de paleta', desc: 'Guarda 16 colores. Cada paleta de la Super Nintendo tenía 16: quince colores y uno transparente.' },
});

// Planeta Oscuro (zona): Do menor, lenta, con gotas y eco. (La pelea usa snes_nebula.)
const SNES_PLANETA_MEL = 'C4/8 D#4/4 G4/4 F4/8 D#4/4 D4/4 C4/8 G3/8 G#3/8 C4/4 D4/4 D#4/8 D4/8';
Object.assign(TRACKS, {
  snes_planeta: {
    bpm: 80,
    voices: [
      { wave: 'sine', vol: 0.045, notes: SNES_PLANETA_MEL },
      { wave: 'sine', vol: 0.016, notes: echoVoice(SNES_PLANETA_MEL, 3) },
      { wave: 'triangle', vol: 0.1, notes: 'C2/16 G#1/16 F1/16 G1/16 C2/16' },
      { wave: 'sine', vol: 0.018, notes: 'D#4/20 C4/20 G#3/20 B3/20' },
      { wave: 'noise', vol: 0.006, notes: rep('-/7 x/1', 10) },
    ],
  },
});

// ---------- Mapas ----------
// Leyenda de las Colinas (además de TILES):
//   .  pasto 16-bit   ,  pasto alto   *  flores de colores   :  camino de piedras   T  árbol redondo
//   ~  río            =  puente        h  colina con ojos     o  huevo en su nido    #  roca
const SNES_COLINAS_MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:TTTTTT',
  'T.*..h....*..T..*....h.....T..T.T:T.*..T',
  'T..,,,..h....T.,,,......,,.T.T..T:T..T.T',
  'Th.,,,.......T.,,,......,,.T....T:T....T',
  'T.h...:::::::::::::::......T.T...:..T..T',
  'T.....:..*...T..h...:...h..T..T..:.T...T',
  'T..S..:...h..T......:..**..TT....:....TT',
  'T.h...:.,,,..T.*....:......T..T..:.T...T',
  'T...*.:.,,,..T..h...:...h..T.T...:...T.T',
  'T..#..:....h.T.....S:......T...T.:.T...T',
  'T.....:.**...T~~~~~~=~~~~~~TT....:....TT',
  'T.h...:......T~~~~~~=~~~~~~T..T..:..T..T',
  'T.....:..h...T......:......T.S...:.T...T',
  'TTTTTT:TTTTTTT.,,...:...h..T...T.:..T..T',
  'T.....:......T.,,...:......T.T...:....TT',
  'T.**..:...,,.T......::::::::::::::.T...T',
  'T..h..:...,,.T.........*...T.T..T..T..TT',
  'T.....:......T.h.......,,,.T...T....*..T',
  'T..,,.:..*..hT....h....,,,.TT.....T....T',
  'T..,,.:......T.**..........T..T.,,,..T.T',
  'T..::::......T......h......T.T..,,,..o.T',
  'T..P.S.......T..,,......*..T...T...T.T.T',
  'T.*.....**...T..,,.........TT.........TT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

// Pista Cero y el Castillo Rosa:
//   g  piso Modo 7   b  barrera de energía   t  placa turbo   m  meta   u  pits
//   K  muro del castillo   A  almenas   M  baldosas   r  alfombra   J  pilar   Q  portón
//   Y  letrero sobre la pista   Z  letrero dentro del castillo
const SNES_PISTA_MAP = [
  'TTTTTTTTTTTTbbbbbbbbbbbbbbbbb~~AAAAAAAAT',
  'T.*..T....*.bYggggggggggggggg~~KMMMMMMKT',
  'T...........bggggggtgggggtggg~~KMMMMMMKT',
  'T.,,,...uuuubgggggggggggggggg==QrrrMMMKT',
  'T.,,,...uuuubggggtgggggtggggg~~KMMrMMMKT',
  'T.......uuuubgggggggggggggggg~~KMMrMMMKT',
  'T..*........bbbbbbbbbbbbbbggg~~KMJrMJMKT',
  'T.T....,,,..bgggggggggggggggg~~KMMrMMMKT',
  'T.......,,,.bggtgggggtggggtgg~~KMMrMMMKT',
  'T...S.......bgggggggggggggggg~~KZMrMMMKT',
  'T.....*.....bgggggggggggggggg~~KMMrrrrQ:',
  'T.,,,......Tbgggbbbbbbbbbbbbb~~KMMMMMMKT',
  'T.,,,.......bgggggggggggggggg~~K*MMMM*KT',
  'T.......*...bggggtggggggtgggg~~KMMMMMMKT',
  'T...T.......bgggggggggggggggg~~KMJMMJMKT',
  'T.........,,bgggggggggggggggg~~KMMMMMMKT',
  'T..*......,,bbbbbbbbbbbbbbggg~~K**MM**KT',
  'T.....:.....bmggggggggggggggg~~KMJMMJMKT',
  'T.....:::::::mggggtgggggtgggg~~KMMMMMMKT',
  'T.....:.....bmggggggggggggggg~~K*MMMM*KT',
  'T.....:.....bmggggggggggggggg~~K*MMMM*KT',
  'TTTTTT:TTTTTbbbbbbbbbbbbbbbbb~~KKKKKKKKT',
];

// Hangar y Arena Modo 7:
//   .  piso de metal   :  guía amarilla   W  pared con luces   B  barriles   X  cajas
//   y  plataforma de aterrizaje   g  piso Modo 7   o  aro de luces   7  el gran 7   P  tubería al planeta
const SNES_HANGAR_MAP = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WXX......XXWBBB.....BBBWWWW..P..WWWW',
  'WX........XWBB.......BBWWW.......WWW',
  'W..........WB...BBB...BWWW...:...WWW',
  'W..yyyyyy..W....BBB....WWWWWW:WWWWWW',
  'W..y....y..W...........W....o:o....W',
  'W..y....y..WBB.......BBW..oogggoo..W',
  'W..yyyyyy..WB...XXX...BW.ogggggggo.W',
  'W..........W....XXX....W.ggggggggg.W',
  'W.S........W...........WogggggggggoW',
  '::::::::::::::::.......WogggggggggoW',
  'W..........W...:..BB...Wogggg7ggggoW',
  'W..yyyyyy..W...:..BB...WogggggggggoW',
  'W..y....y..W...:.......WogggggggggoW',
  'W..y....y..WB..:....XX.W.ggggggggg.W',
  'W..yyyyyy..W...:::::::::gogggggggo.W',
  'W..........WB.........BW..oogggoo..W',
  'WX........XWBB...B...BBW....ooo....W',
  'WXX......XXWB....B....BW...........W',
  'WXXX....XXXWBB.......BBWS..........W',
  'WXXXX..XXXXWBBB.....BBBW...........W',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
];

// Planeta Oscuro:
//   .  piso oscuro   #  pared que late   ~  charco oscuro   c  cristal   :  paso al nido   P  tubería al hangar
const SNES_PLANETA_MAP = [
  '##############################',
  '###P##########################',
  '##....c#######.......c########',
  '##.......####...........######',
  '###...S.......~~~........#####',
  '####........c.~~~.........####',
  '#####....######.....c.....####',
  '######...#######S.........####',
  '#####c...######....c.....#####',
  '####.....######.........######',
  '###......~~~~...........######',
  '###..c..~~~~~~.........#######',
  '####....~~~~~~....c....#######',
  '#####............~......######',
  '#######.....c......###########',
  '#########..........#.....c.###',
  '##########.........:.......###',
  '###########..c.....#.......###',
  '##############.....#..c....###',
  '##############################',
];

const s16Tile = (s, extra = {}) => ({ s, ...extra });
const S16_COUNTRY = {
  '.': s16Tile('s16_pasto'),
  ',': s16Tile('s16_alto', { tall: true }),
  '*': s16Tile('s16_flores'),
  ':': s16Tile('s16_piedra'),
  T: s16Tile('s16_arbol', { solid: true, look: 'arbol' }),
};

addMaps('snes', {
  entry: { map: 'snes-colinas', spawn: [3, 20, 'up'] },
  maps: {
    'snes-colinas': {
      name: 'Colinas Dinosaurio',
      intro: ['* ¡¡COLORES!! ¡Mira cuántos colores!', '* Pasto de dos verdes, flores rosas, cielo azul...\n* Bienvenido al REINO 16-BIT. Aquí los acentos sí cuentan, ¿eh?'],
      music: 'snes_map',
      ground: 's16_pasto',
      map: SNES_COLINAS_MAP,
      tiles: {
        ...S16_COUNTRY,
        '~': s16Tile('s16_agua', { solid: true, look: 'agua' }),
        '=': s16Tile('s16_puente'),
        h: s16Tile('s16_colina', { solid: true, look: 'colina' }),
        o: s16Tile('s16_huevo', { solid: true, look: 'huevo' }),
        '#': s16Tile('s16_roca', { solid: true, look: 'roca' }),
      },
      spawns: { start: [3, 20, 'up'] },
      exits: {
        '3,21': { pueblo: 'snes' },
        '33,0': { map: 'snes-pista', spawn: [6, 20, 'up'] },
      },
      encounters: [
        { enemy: 'dinohuevin', x: 6, y: 13, say: ['* ¡Ñam! ¿Eso que traes son dedos o plátanos?\n* ...Déjame probar uno.'] },
        { enemy: 'modosiete', x: 13, y: 4, say: ['* ¡Gira, gira! Para pasar al río tienes que marearte conmigo.'] },
        { enemy: 'gema', x: 20, y: 10, say: ['* ¡Alto! Este puente es solo para cosas BRILLANTES.\n* ...Tú brillas poquito. A ver qué tal escribes.'] },
        { enemy: 'setita', x: 33, y: 2, say: ['* ¡Boing! ¡Boing! La salida del bosque es MIA.\n* Bueno, mía y de mi sombrero.'] },
      ],
      chests: [
        { id: 'snes_pluma', x: 36, y: 22, treasure: 'pluma_capa', word: 'capa mágica' },
      ],
      wild: ['dinohuevin', 'modosiete', 'gema', 'setita'],
      signs: {
        '5,21': ['* REINO 16-BIT\n* COLINAS DINOSAURIO\n* (Tubería al Pueblo Vitrina)', `* ${SNES_FACTS[2]}`],
        '3,6': ['* MIRADOR DE LAS COLINAS', '* El juego del dinosaurio verde tenía 96 salidas para descubrir.\n* ¡Y sus colinas tenían ojos! Como estas.'],
        '19,9': ['* RIO DE LOS REFLEJOS\n* (Prohibido presumir colores. Firma: la Gema.)', '* La Super Nintendo salió en Japón el 21 de noviembre de 1990.'],
        '29,12': ['* BOSQUE DE LOS DINOSAURIOS', '* Dicen que aquí se esconde algo que no tiene nombre.\n* ...Y que no es un dinosaurio.'],
      },
      looks: {
        arbol: '* Un árbol redondito.\n* Tiene más tonos de verde que todo el Valle Game Boy junto.',
        agua: '* El río brilla en dos tonos de azul.\n* Te ves reflejado... ¡a todo color!',
        colina: '* Una colina redonda.\n* ...¿Te acaba de parpadear?',
        huevo: '* Un huevo con manchas en su nido.\n* No es de los que perdió Dino Huevín: esos tienen nombre.',
        roca: '* Una roca con sombra suave.\n* En 16 bits hasta las rocas se ven elegantes.',
      },
      bitTips: [
        '* ¡COLORES! ¡Mira cuántos!\n* Ni en mis sueños de 4 tonos me imaginé esto.',
        '* Aquí los ACENTOS cuentan.\n* "plátano" no es lo mismo que "platano". ¡Ojo!',
        '* Esas colinas... ¿tienen ojos?\n* No me mires así, colina.',
        '* Los monstruos cuidan los pasos angostos, como en el valle.\n* ¡Dedos listos!',
        '* El bosque de allá huele a... estática.\n* Como cuando se traba un juego.',
      ],
      npcs: [
        {
          id: 'tortuga', sprite: 'tortuga', x: 17, y: 17,
          async talk(ctx) {
            const lines = [
              ['* ¡Ay! ¿No has visto un caparazón verde? Era mío.', '* Un dinosaurio verde pasó corriendo y ¡GLUP!\n* Se lo tragó. Así nada más.'],
              ['* En el juego donde nació ese dino, si se tragaba un caparazón ROJO, ¡escupía fuego!', '* Si era AZUL, le salían alas.\n* Y si era AMARILLO, hacía temblar el piso al caer.'],
              ['* Por ahora ando en camiseta. Es bastante cómodo.\n* No se lo digas a nadie de mi familia.'],
            ];
            await ctx.say(lines[ctx.counter('snesTortuga') % lines.length], 'TORTUGA PELONA');
          },
        },
      ],
    },

    'snes-pista': {
      name: 'Pista Cero',
      music: 'snes_rayo',
      ground: 's16_pasto',
      map: SNES_PISTA_MAP,
      tiles: {
        ...S16_COUNTRY,
        g: s16Tile('s16_pista'),
        b: s16Tile('s16_barrera', { solid: true, look: 'barrera' }),
        t: s16Tile('s16_turbo', { look: 'turbo' }),
        m: s16Tile('s16_meta'),
        u: s16Tile('s16_pits'),
        '~': s16Tile('s16_agua', { solid: true, look: 'foso' }),
        '=': s16Tile('s16_puente'),
        K: s16Tile('s16_castillo', { solid: true, look: 'castillo' }),
        A: s16Tile('s16_almena', { solid: true, look: 'castillo' }),
        M: s16Tile('s16_baldosa'),
        r: s16Tile('s16_alfombra'),
        J: s16Tile('s16_pilar', { solid: true, under: 's16_baldosa', look: 'pilar' }),
        Q: s16Tile('s16_puerta'),
        Y: s16Tile('sign', { solid: true, under: 's16_pista' }),
        Z: s16Tile('sign', { solid: true, under: 's16_baldosa' }),
      },
      spawns: { start: [6, 20, 'up'] },
      exits: {
        '6,21': { map: 'snes-colinas', spawn: [33, 1, 'down'] },
        '39,10': { map: 'snes-hangar', spawn: [1, 10, 'right'] },
      },
      encounters: [
        { enemy: 'rayocero', x: 12, y: 18, say: ['* ¡Aquí no se gana con fuerza, se gana con dedos!', '* ¿Quieres entrar a MI pista? Primero, una vuelta. ¡Ahora!'] },
        { enemy: 'caballero', x: 30, y: 3, say: ['* ¡CLANK! ¿QUIEN VA?\n* Nadie cruza al castillo sin decir sus signos.'] },
      ],
      chests: [
        { id: 'snes_gatillos', x: 14, y: 2, treasure: 'gatillos_lr', word: 'botón' },
      ],
      wild: ['modosiete', 'gema'],
      signs: {
        '4,9': ['* PISTA CERO\n* ¡Nada de frenos!', '* Este tipo de piso que gira se llamaba Modo 7 y fingía 3D.', `* ${SNES_FACTS[1]}`],
        '13,1': ['* CURVA DE LOS GATILLOS', `* ${SNES_FACTS[0]}`],
        '32,9': ['* CASTILLO ROSA DEL REINO', `* ${SNES_FACTS[4]}`],
      },
      looks: {
        barrera: '* Una barrera de energía. Zumba.\n* Si chocas, la nave pierde energía.',
        turbo: '* Una placa turbo.\n* Pisarla a pie no hace nada. Lo intentaste, ¿verdad?',
        arbol: '* Un árbol redondito al lado de la pista.\n* Tiene las hojas peinadas hacia atrás, por el viento.',
        foso: '* El foso del castillo.\n* Algo con escamas nada allá abajo.',
        castillo: '* Un castillo rosa. Muy rosa.\n* Rosa nivel dieciséis bits.',
        pilar: '* Un pilar con adornos dorados.\n* Alguien escribió en la base: "á". Con acento y todo.',
      },
      bitTips: [
        '* ¡Mira el piso! Es una cuadrícula como las del Modo 7.\n* Aquí todo va RAPIDISIMO.',
        '* Rayo Cero no pelea: corre.\n* Escribe sin parar y sin errores para ganarle.',
        '* ¿Un castillo rosa? En este reino hasta los castillos tienen estilo.',
        '* El robot de los pits sabe de carreras. ¡Pregúntale!',
      ],
      npcs: [
        {
          id: 'robopits', sprite: 'robopits', x: 9, y: 4,
          async talk(ctx) {
            if (!ctx.flag('snesRobopits')) {
              ctx.setFlag('snesRobopits');
              await ctx.say([
                '* BIP. Bienvenido a los PITS.\n* Aquí se recarga la energía de las naves.',
                '* En el juego de las carreras, cada choque te bajaba la energía.\n* Si llegaba a cero... ¡BUM! Fuera de la carrera.',
              ], 'ROBOT DE PITS');
            }
            if (Save.data.done.rayocero) await ctx.say(['* BIP. Le ganaste a RAYO CERO.\n* Mis sensores marcan: dedos al 100%.'], 'ROBOT DE PITS');
            const i = await ctx.choose(['recarga', 'adiós'], 'ROBOT DE PITS');
            if (i === 1) { await ctx.say(['* BIP BIP. ¡Buena carrera!'], 'ROBOT DE PITS'); return; }
            await ctx.say(['* RECARGA DE DEDOS. Escribe la frase sin errores.\n* (Acentos incluidos. BIP.)'], 'ROBOT DE PITS');
            const text = rand(SNES_PHRASES);
            const res = await ctx.challenge({ label: 'Recarga de energía:', texts: [text], timeLimit: text.length * 900 + 2000, strict: true });
            if (res.completed && !res.errors) await ctx.say(['* ENERGIA AL 100%. ¡BIP BIP BIP!\n* Lista para la pista.'], 'ROBOT DE PITS');
            else if (res.completed) await ctx.say([`* ENERGIA AL ${Math.max(10, 100 - res.errors * 12)}%.\n* Algunos chispazos. BIP. ¡Otra vuelta!`], 'ROBOT DE PITS');
            else await ctx.say(['* ...Energía en reserva. BIP.\n* No pasa nada: hasta las naves rápidas paran en los pits.'], 'ROBOT DE PITS');
          },
        },
      ],
    },

    'snes-hangar': {
      name: 'Hangar del Escuadrón',
      music: 'snes_vulpino',
      ground: 's16_metal',
      map: SNES_HANGAR_MAP,
      tiles: {
        '.': s16Tile('s16_metal'),
        ':': s16Tile('s16_guia'),
        W: s16Tile('s16_pared', { solid: true, look: 'pared' }),
        B: s16Tile('barril_3d', { solid: true, look: 'barril' }),
        X: s16Tile('s16_caja', { solid: true, look: 'caja' }),
        y: s16Tile('s16_pits'),
        g: s16Tile('s16_pista'),
        o: s16Tile('s16_aro'),
        7: s16Tile('s16_siete', { look: 'siete' }),
      },
      spawns: { start: [1, 10, 'right'] },
      exits: {
        '0,10': { map: 'snes-pista', spawn: [38, 10, 'left'] },
        '29,1': { map: 'snes-planeta', spawn: [3, 2, 'down'] },
      },
      encounters: [
        { enemy: 'vulpino', x: 11, y: 10, say: ['* kzzt... Aquí el CAPITAN VULPINO.\n* Nadie entra a la bodega sin pasar mi prueba de vuelo. kzzt.'] },
        { enemy: 'monobarril', x: 23, y: 15, say: ['* ¡Uh, uh! ¡Esta puerta es de MIS barriles!\n* ¿Sabes contar con comas? ¡Plátano, uva, pera!'] },
        { enemy: 'dani3', x: 29, y: 4, say: ['* DANI: ¡Por fin! El Planeta Oscuro está detrás de mí...', '* DANI: ...y para llegar tienes que ganarme en MI arena.\n* ¡Esta vez traigo TRES Tecloides!'] },
      ],
      signs: {
        '2,9': ['* HANGAR DEL ESCUADRON\n* Solo pilotos con dedos rápidos.', `* ${SNES_FACTS[3]}`],
        '24,19': ['* ARENA MODO 7\n* Hoy: DANI TURBO contra... ¿quién?', '* El chip de sonido de la Super Nintendo lo hizo Sony.\n* Tocaba 8 sonidos a la vez... ¡y hasta tenía eco!'],
      },
      looks: {
        pared: '* Luces que parpadean en la pared del hangar.\n* Una dice "despegue". Otra dice "botana".',
        barril: '* Un barril que se ve 3D... pero son puros píxeles.\n* Huele a plátano.',
        caja: '* Una caja: "REPUESTOS. FRAGIL. POLIGONOS."',
        siete: '* Un 7 gigante pintado en el piso.\n* Nadie sabe por qué siete. Ni el piso.',
      },
      bitTips: [
        '* ¡Naves de triángulos! Bueno, de polígonos.\n* En 1993 eso era lo más moderno del mundo.',
        '* ¿Esa arena de allá gira? ¡Me mareo nomás de verla!',
        '* Dani siempre llega antes que nosotros. ¿Cómo le hace?',
        '* Esa tubería del fondo... baja a un lugar muy oscuro.',
      ],
      npcs: [
        {
          id: 'conejo', sprite: 'conejo', x: 5, y: 5,
          async talk(ctx) {
            if (!ctx.flag('snesConejo')) {
              ctx.setFlag('snesConejo');
              await ctx.say([
                '* ¡Hola, piloto! Soy el veterano de este hangar.',
                '* El CAPITAN VULPINO cuida la puerta.\n* Dispara escribiendo palabras: ¡las más cercanas, primero!',
              ], 'CONEJO PILOTO');
              return;
            }
            if (Save.data.done.vulpino && !ctx.flag('snesConejoVulpino')) {
              ctx.setFlag('snesConejoVulpino');
              await ctx.say(['* ¡Le ganaste al capitán!\n* Yo le enseñé todo lo que sabe. Bueno, casi todo.'], 'CONEJO PILOTO');
              return;
            }
            const lines = [
              '* Mi consejo: si algo te persigue... ¡haz un giro de barril!\n* (Esa frase la hice famosa después, en otra consola.)',
              '* Más adelante hay una arena donde el piso GIRA.\n* Dani Turbo se la pasa ahí presumiendo.',
              '* ¿Ves esas cajas? Dicen "POLIGONOS".\n* Cuando se acaben, las naves serán puros cuadritos.',
            ];
            await ctx.say([lines[ctx.counter('snesConejo') % lines.length]], 'CONEJO PILOTO');
          },
        },
      ],
    },

    'snes-planeta': {
      name: 'Planeta Oscuro',
      music: 'snes_planeta',
      ground: 's16_oscuro',
      map: SNES_PLANETA_MAP,
      tiles: {
        '.': s16Tile('s16_oscuro'),
        ':': s16Tile('s16_oscuro'),
        '#': s16Tile('s16_oscuromuro', { solid: true, look: 'muro' }),
        '~': s16Tile('s16_charco', { solid: true, look: 'charco' }),
        c: s16Tile('s16_cristal', { solid: true, look: 'cristal' }),
      },
      spawns: { start: [3, 2, 'down'] },
      exits: {
        '3,1': { map: 'snes-hangar', spawn: [29, 2, 'down'] },
      },
      encounters: [
        { enemy: 'nebula', x: 19, y: 16, say: ['* ...', '* ¿Vienes por mis hijas?\n* Él me dijo que vendrías.'] },
      ],
      chests: [
        { id: 'snes_cristal', x: 3, y: 10, treasure: 'cristal_paleta', word: 'dieciséis' },
      ],
      signs: {
        '6,4': ['* PLANETA OSCURO\n* (Nadie escribió este letrero. Ya estaba aquí.)', '* En un juego de 1991, un héroe vestido de verde viajaba entre un mundo de luz y un mundo OSCURO.\n* Este se parece. Pero con más medusas.'],
        '16,7': ['* Alguien rayó la piedra:\n* "Un niño con gorra y bate de béisbol pasó por aquí buscando su casa."', '* Ese niño es de un juego de Super Nintendo de 1994.\n* ¡Y ese juego inspiró a otros donde puedes perdonar a los monstruos!'],
      },
      looks: {
        muro: '* La pared está tibia...\n* y late despacito.',
        charco: '* Agua oscura.\n* Algo pequeñito brilla allá abajo.',
        cristal: '* Un cristal que brilla solo.\n* Adentro se cuentan 16 colores.',
      },
      bitTips: [
        '* Qu-qué oscuro está aquí.\n* Quédate cerca, ¿sí? Yo alumbro poquito.',
        '* Los cristales brillan solos. Como yo. Bueno, menos que yo.',
        '* Algo grande respira al fondo de la cueva...',
      ],
      npcs: [
        {
          id: 'medusita', sprite: 'nebulita', x: 16, y: 16, when: () => !Save.data.done.nebula,
          async talk(ctx) {
            await ctx.say([
              '* ...¿Eres tú el que viene a llevarse a las crías?',
              '* Un señor morado le dijo a mamá que vendrías.\n* ...Tú no pareces malo. Tienes cara de escribir bonito.',
            ], 'MEDUSITA');
          },
        },
        {
          id: 'medusita_nido', sprite: 'nebulita', x: 23, y: 16, when: () => !!Save.data.done.nebula,
          async talk(ctx) {
            const q = Quests.state('snes_crias');
            if (q === 'active') {
              await ctx.say(['* ¡Volviste! Mis hermanas quieren jugar.\n* ¿Te sabes nuestros nombres? Tienen muchas Ñ.'], 'MEDUSITA');
              const i = await ctx.choose(['jugar', 'después'], 'MEDUSITA');
              if (i === 0) Game.go('nebula', { enemyId: 'nebula', back: 'town' });
              else await ctx.say(['* Bueno. Aquí te esperamos. Brillando.'], 'MEDUSITA');
              return;
            }
            await ctx.say([q === 'done'
              ? '* ¡Ya nos sabes a todas! Mamá dice que eres de confianza.\n* Crecer no es irse. Ahora lo sabemos.'
              : '* Mamá ya no está triste.\n* Ese señor morado nos mintió. ¿Quién será?'], 'MEDUSITA');
          },
        },
      ],
    },
  },
});
