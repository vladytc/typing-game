// Curiosidades con imagen: datos reales de cada consola con una ilustración en pixel art.
// Los amigos del pueblo las enseñan (friendTalk) y Don Chip también.
//
// Registro: CURIOSIDADES[id] = { console, title, caption, draw(g, w, h) }
//   console  id de la consola en CONSOLES ('gameboy', 'nes', ...)
//   title    nombre corto (se muestra con upper())
//   caption  el dato, de 1 a 3 renglones. ¡Solo datos reales y verificables!
//   draw     dibuja la ilustración en un canvas de w x h (usa pixelArt() para no batallar).
//            En lugar de draw puedes dar `rows` (filas de letras) y `palette` ({ letra: color }).
// Mundos nuevos: `curiosities: { ... }` dentro de addWorld(), o addCuriosities({ ... }) en un
// archivo que se cargue después de este (ver docs/MUNDOS.md, "Curiosidades").

const CURIO_W = 384;
const CURIO_H = 240;

// Paleta del Castillo 8-Bit (docs/LORE.md §5.1).
const NES10 = {
  K: '#000000', S: '#5c94fc', R: '#c84c0c', Y: '#f8b800', G: '#00a800',
  L: '#b8f818', P: '#fca044', W: '#fcfcfc', F: '#f83800', Z: '#7c7c7c',
};

// Lienzo de "píxeles gordos": una cuadrícula de gw x gh centrada en el canvas.
function pixelArt(g, w, h, gw, gh, bg) {
  const s = Math.max(1, Math.floor(Math.min(w / gw, h / gh)));
  const ox = Math.floor((w - gw * s) / 2);
  const oy = Math.floor((h - gh * s) / 2);
  g.imageSmoothingEnabled = false;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const p = {
    bg,
    r(x, y, rw, rh, c) { g.fillStyle = c; g.fillRect(ox + x * s, oy + y * s, rw * s, rh * s); return p; },
    // Filas de letras; cada letra se pinta con pal[letra] ('.' o letras sin color = transparente).
    rows(x, y, rows, pal) {
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (pal[ch]) p.r(x + i, y + j, 1, 1, pal[ch]); }));
      return p;
    },
    // Figura con contorno: inside(i, j) dice qué casillas son parte de la figura.
    shape(x, y, sw, sh, fill, line, inside = () => true) {
      const at = (i, j) => i >= 0 && j >= 0 && i < sw && j < sh && inside(i, j);
      for (let j = 0; j < sh; j++) {
        for (let i = 0; i < sw; i++) {
          if (!at(i, j)) continue;
          const edge = !at(i - 1, j) || !at(i + 1, j) || !at(i, j - 1) || !at(i, j + 1);
          p.r(x + i, y + j, 1, 1, edge ? line : fill);
        }
      }
      return p;
    },
    // Rectángulo con esquinas redondeadas (sin las 4 esquinas).
    round(x, y, sw, sh, fill, line) {
      return p.shape(x, y, sw, sh, fill, line, (i, j) => !((i === 0 || i === sw - 1) && (j === 0 || j === sh - 1)));
    },
    // Botón redondito de 4 x 4.
    button(x, y, c) { p.r(x + 1, y, 2, 4, c); p.r(x, y + 1, 4, 2, c); return p; },
  };
  return p;
}

// ---------- Piezas que se reusan ----------

// Una Game Boy de 22 x 36. screen(p, sx, sy) dibuja dentro de su pantalla (12 x 11).
function drawGameBoy(p, x, y, P, { screen, battered } = {}) {
  const W = 22;
  const H = 36;
  const cut = [5, 3, 2, 1]; // la esquina de abajo a la derecha es redonda, como la de verdad
  p.shape(x, y, W, H, P.b, P.d, (i, j) => {
    if (j === 0 && (i === 0 || i === W - 1)) return false;
    const r = H - 1 - j;
    return i < W - (r < cut.length ? cut[r] : 0) && !(r === 0 && i === 0);
  });
  p.r(x + 2, y + 3, W - 4, 15, P.c);           // marco de la pantalla
  p.r(x + 5, y + 5, 12, 11, P.a);              // pantalla
  p.r(x + 3, y + 9, 1, 1, P.a);                // foquito de las pilas
  p.r(x + 2, y + 19, 7, 1, P.c);               // logotipo
  p.r(x + 4, y + 22, 2, 6, P.d).r(x + 2, y + 24, 6, 2, P.d); // cruceta
  p.button(x + 12, y + 24, P.c).button(x + 16, y + 22, P.c);  // B y A
  p.r(x + 7, y + 30, 3, 1, P.c).r(x + 11, y + 30, 3, 1, P.c); // SELECT y START
  for (let k = 0; k < 3; k++) for (let t = 0; t < 3; t++) p.r(x + 12 + 2 * k + t, y + 33 - t, 1, 1, P.c); // bocina
  if (battered) {
    // Quemaduras y plástico derretido (pero la pantalla sigue viva).
    [[1, 2], [2, 1], [3, 2], [1, 3], [2, 4], [1, 10], [1, 11], [2, 12], [1, 16], [19, 1], [20, 2], [19, 20],
      [20, 21], [19, 22], [20, 26], [3, 31], [2, 32], [4, 33], [9, 21], [10, 22], [8, 34], [9, 34]]
      .forEach(([i, j]) => p.r(x + i, y + j, 1, 1, P.d));
    p.r(x - 1, y + 13, 1, 3, P.d).r(x - 1, y + 27, 1, 2, P.d); // gotitas derretidas en la orilla
  }
  if (screen) screen(p, x + 5, y + 5);
}

// Un bloque de Tetris de 3 x 3: oscuro con centro claro.
function tetroBlock(p, x, y, P, dark = true) {
  p.r(x, y, 3, 3, dark ? P.d : P.c).r(x + 1, y + 1, 1, 1, dark ? P.b : P.a);
}

// Pantallita con bloques apilados (para Game Boys chiquitas).
function miniTetris(p, sx, sy, P) {
  p.r(sx + 1, sy + 10, 10, 1, P.c).r(sx + 1, sy + 9, 4, 1, P.c).r(sx + 7, sy + 9, 4, 1, P.c);
  p.r(sx + 5, sy + 2, 1, 4, P.d);
}

const ARROWS = {
  up: ['..x..', '.xxx.', 'x.x.x', '..x..', '..x..'],
  down: ['..x..', '..x..', 'x.x.x', '.xxx.', '..x..'],
  left: ['..x..', '.x...', 'xxxxx', '.x...', '..x..'],
  right: ['..x..', '...x.', 'xxxxx', '...x.', '..x..'],
  B: ['xxxx.', 'x...x', 'xxxx.', 'x...x', 'xxxx.'],
  A: ['.xxx.', 'x...x', 'xxxxx', 'x...x', 'x...x'],
};

const SPARKLE = ['.x.', 'xxx', '.x.'];

// Paletas de la Super Nintendo y la Nintendo 64 para sus curiosidades.
const SNES16 = {
  K: '#1a1a2e', D: '#4a4a5e', G: '#8c8c9c', L: '#c8c8d4', W: '#ffffff', R: '#e8393d', Y: '#ffd93d',
  N: '#3fbf3f', B: '#2e5c9a', P: '#8e44ad', V: '#b48ad8', S: '#5fcde4', O: '#ff8c1a', E: '#1e7a2e',
};
const N64P = {
  K: '#202030', D: '#4a4a5e', G: '#8c8c9c', L: '#c9d6e3', W: '#ffffff', R: '#d64545', Y: '#f7e463',
  N: '#58b85c', B: '#3c8dd6', P: '#7e57c2', S: '#9fd3ff', O: '#f0a040',
};

// Letritas de 3 x 5 para escribir números y siglas en los dibujos (s = tamaño).
const PIX_FONT = {
  0: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xxx', '..x', 'xxx', 'x..', 'xxx'],
  3: ['xxx', '..x', 'xxx', '..x', 'xxx'], 6: ['xxx', 'x..', 'xxx', 'x.x', 'xxx'], 9: ['xxx', 'x.x', 'xxx', '..x', 'xxx'],
  L: ['x..', 'x..', 'x..', 'x..', 'xxx'], R: ['xx.', 'x.x', 'xx.', 'x.x', 'x.x'], F: ['xxx', 'x..', 'xx.', 'x..', 'x..'],
  X: ['x.x', 'x.x', '.x.', 'x.x', 'x.x'],
};
function pixText(p, x, y, text, c, s = 1) {
  [...String(text)].forEach((ch, k) => (PIX_FONT[ch] || []).forEach((row, j) => [...row].forEach((v, i) => {
    if (v === 'x') p.r(x + k * 4 * s + i * s, y + j * s, s, s, c);
  })));
}

// Control de N64 (48 x 30), con sus tres agarraderas.
function drawN64Pad(p, x, y, C, body = C.G) {
  p.shape(x, y, 48, 30, body, C.K, (i, j) => (j < 13 && i >= 1 && i <= 46)
    || (j >= 13 && ((i >= 1 && i <= 12 && j <= 27) || (i >= 18 && i <= 29 && j <= 29) || (i >= 35 && i <= 46 && j <= 27))));
  p.r(x + 5, y + 5, 3, 9, C.K).r(x + 2, y + 8, 9, 3, C.K);              // cruceta
  p.r(x + 22, y + 10, 4, 4, C.D).r(x + 23, y + 11, 2, 2, C.L);          // palanca
  p.r(x + 23, y + 5, 2, 2, C.R);                                        // START
  p.button(x + 36, y + 8, C.B).button(x + 32, y + 4, C.N);               // A y B
  p.r(x + 41, y + 2, 2, 2, C.Y).r(x + 44, y + 4, 2, 2, C.Y).r(x + 38, y + 4, 2, 2, C.Y).r(x + 41, y + 6, 2, 2, C.Y); // botones C
}

// ---------- Las curiosidades ----------

const CURIOSIDADES = {
  // ===== Game Boy (4 verdes) =====
  gb_tetris: {
    console: 'gameboy',
    title: 'Tetris incluido',
    caption: 'En América y Europa, la Game Boy venía con Tetris dentro de la caja. ¡Fueron la pareja perfecta!',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.a);
      drawGameBoy(p, 4, 2, P, { screen: (q, sx, sy) => miniTetris(q, sx, sy, P) });
      // Lupa: la pantalla en grande.
      [[27, 9], [29, 8], [31, 7]].forEach(([x, y]) => p.r(x, y, 1, 1, P.c));
      p.r(33, 3, 28, 34, P.d).r(34, 4, 26, 32, P.a);
      const stack = ['XXXXXX.X', 'XX.XXX.X', 'X...XX..'];
      stack.forEach((row, k) => [...row].forEach((ch, i) => {
        if (ch === 'X') tetroBlock(p, 35 + i * 3, 33 - k * 3, P, (i + k) % 2 === 0);
      }));
      for (let k = 0; k < 4; k++) tetroBlock(p, 35 + 6 * 3, 12 + k * 3, P, false); // la pieza larga que va cayendo
      p.rows(53, 6, SPARKLE, { x: P.c });
    },
  },
  gb_pilas: {
    console: 'gameboy',
    title: 'Cuatro pilas AA',
    caption: 'La Game Boy funcionaba con 4 pilas AA. Podías jugar en el carro, en el parque... ¡donde fuera!',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.a);
      [9, 21, 33, 45].forEach((x, k) => {
        const y = 7 + (k % 2);
        p.r(x + 3, y - 2, 4, 3, P.d).r(x + 4, y - 1, 2, 1, P.b); // polo +
        p.round(x, y, 10, 28, P.c, P.d);
        p.r(x + 1, y + 2, 8, 7, P.b);                              // etiqueta
        p.r(x + 4, y + 3, 2, 5, P.d).r(x + 2, y + 5, 6, 1, P.d); // signo +
        p.r(x + 2, y + 11, 1, 14, P.b);                            // brillo
        p.r(x + 1, y + 25, 8, 2, P.b);                             // polo -
      });
      // Rayitos de energía.
      p.rows(3, 16, ['..x', '.x.', 'xxx', '.x.', 'x..'], { x: P.d }).rows(58, 16, ['..x', '.x.', 'xxx', '.x.', 'x..'], { x: P.d });
    },
  },
  gb_verdes: {
    console: 'gameboy',
    title: 'Solo 4 tonos de verde',
    caption: 'La pantalla no tenía colores: todo se dibujaba con 4 tonos de verde. ¡Igual que este mundo!',
    draw(g, w, h) {
      const P = GB4;
      const tones = [P.a, P.b, P.c, P.d];
      const heart = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];
      const p = pixelArt(g, w, h, 64, 40, P.a);
      tones.forEach((c, k) => {
        const x = 5 + k * 14;
        p.r(x, 4, 12, 28, P.d).r(x + 1, 5, 10, 26, c);
        p.rows(x + 3, 15, heart, { x: tones[(k + 2) % 4] });
        for (let n = 0; n <= k; n++) p.r(x + 1 + n * 3, 35, 2, 2, P.d); // 1, 2, 3, 4
      });
    },
  },
  gb_cable: {
    console: 'gameboy',
    title: 'El Cable Link',
    caption: 'Con el Cable Link conectabas dos Game Boy. Así se intercambiaban Pokémon en Rojo y Verde (Japón, 1996).',
    draw(g, w, h) {
      const P = GB4;
      const blob = ['.ddddd.', 'dcccccd', 'dcdcdcd', 'dcccccd', '.dcccd.', '..d.d..'];
      const p = pixelArt(g, w, h, 64, 40, P.a);
      p.r(15, 1, 34, 1, P.c).r(15, 1, 1, 3, P.c).r(48, 1, 1, 3, P.c); // el cable
      drawGameBoy(p, 5, 4, P, { screen: (q, sx, sy) => q.rows(sx + 2, sy + 3, blob, { d: P.d, c: P.c }) });
      drawGameBoy(p, 37, 4, P, { screen: (q, sx, sy) => q.rows(sx + 3, sy + 3, blob, { d: P.c, c: P.b }) });
      p.r(14, 3, 3, 2, P.d).r(47, 3, 3, 2, P.d); // conectores
      p.rows(28, 18, ['..x...x..', '.x.....x.', 'xxxxxxxxx', '.x.....x.', '..x...x..'], { x: P.d });
    },
  },
  gb_guerra: {
    console: 'gameboy',
    title: 'La Game Boy sobreviviente',
    caption: 'Una Game Boy se quemó en un bombardeo de la Guerra del Golfo... ¡y todavía prendía! La exhibieron en la tienda de Nintendo en Nueva York.',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 72, 45, P.b);
      // Vitrina de cristal.
      p.r(21, 1, 30, 40, P.a).r(22, 2, 28, 38, P.b);
      [[24, 12], [25, 11], [26, 10], [27, 9], [44, 36], [45, 35], [46, 34]].forEach(([x, y]) => p.r(x, y, 1, 1, P.a));
      drawGameBoy(p, 25, 4, P, { battered: true, screen: (q, sx, sy) => miniTetris(q, sx, sy, P) });
      p.r(17, 40, 38, 5, P.d).r(18, 41, 36, 3, P.c).r(31, 42, 10, 1, P.a); // pedestal con placa
      p.rows(8, 10, SPARKLE, { x: P.a }).rows(60, 18, SPARKLE, { x: P.a }).rows(12, 30, SPARKLE, { x: P.c });
    },
  },
  gb_pantalla: {
    console: 'gameboy',
    title: '160 x 144 pixeles',
    caption: 'La pantalla medía 160 x 144 píxeles. Los dibujos se armaban con cuadritos de 8 x 8 píxeles.',
    draw(g, w, h) {
      const P = GB4;
      const guy = ['..dddd..', '.dccccd.', 'dcaccacd', 'dccccccd', 'dcdccdcd', 'dccddccd', '.dccccd.', '..d..d..'];
      const pal = { '.': P.a, a: P.a, c: P.b, d: P.d };
      const p = pixelArt(g, w, h, 64, 40, P.b);
      p.r(4, 3, 33, 33, P.c);
      guy.forEach((row, j) => [...row].forEach((ch, i) => p.r(5 + i * 4, 4 + j * 4, 3, 3, pal[ch])));
      p.rows(38, 17, ['..x', '.xx', 'xxx', '.xx', '..x'], { x: P.d }); // flechita: "esto, en chiquito"
      p.r(43, 11, 18, 16, P.d).r(44, 12, 16, 14, P.a);
      p.rows(48, 15, guy, { a: P.a, c: P.b, d: P.d });
    },
  },

  // ===== NES (paleta del Castillo 8-Bit) =====
  nes_famicom: {
    console: 'nes',
    title: 'La Famicom',
    caption: 'En Japón la NES se llamaba Famicom (1983). Era roja con blanco y sus dos controles iban pegados a la consola.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.S);
      p.round(14, 6, 36, 18, N.W, N.K);
      p.r(15, 17, 34, 6, N.F);                                   // franja roja
      p.round(24, 1, 16, 9, N.Y, N.K).r(26, 3, 12, 4, N.W).r(30, 4, 4, 2, N.F); // cartucho
      p.r(22, 9, 20, 1, N.K);                                    // ranura
      p.r(17, 12, 3, 2, N.F).r(44, 12, 3, 2, N.F);               // POWER y RESET
      p.r(11, 18, 3, 1, N.K).r(11, 18, 1, 10, N.K).r(50, 18, 3, 1, N.K).r(52, 18, 1, 10, N.K); // cables
      [[2, 28, false], [42, 28, true]].forEach(([x, y, mic]) => {
        p.round(x, y, 20, 9, N.F, N.K).r(x + 2, y + 2, 16, 5, N.Y);
        p.r(x + 4, y + 3, 1, 3, N.K).r(x + 3, y + 4, 3, 1, N.K); // cruceta
        p.button(x + 11, y + 3, N.F).button(x + 15, y + 3, N.F);
        if (mic) p.r(x + 7, y + 3, 1, 1, N.K).r(x + 9, y + 3, 1, 1, N.K).r(x + 8, y + 4, 1, 1, N.K).r(x + 7, y + 5, 1, 1, N.K).r(x + 9, y + 5, 1, 1, N.K);
        else p.r(x + 7, y + 5, 2, 1, N.K).r(x + 7, y + 3, 2, 1, N.K);
      });
    },
  },
  nes_microfono: {
    console: 'nes',
    title: 'Un control con microfono',
    caption: 'El control 2 de la Famicom traía un micrófono. En el Zelda japonés, si gritabas, los enemigos orejones Pols Voice se derrotaban.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.S);
      p.rows(24, 2, [
        '....WWWWWWWWW....',
        '..WW.........WW..',
        '.W....WWWWW....W.',
        'W...WW.....WW...W',
        '...W..WWWWW..W...',
        '.....W.....W.....',
      ], { W: N.W });
      p.round(10, 12, 44, 22, N.F, N.K).r(12, 15, 40, 16, N.Y);
      p.r(17, 18, 3, 10, N.K).r(13, 21, 11, 3, N.K);             // cruceta grande
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) p.r(28 + 2 * i, 18 + 2 * j, 1, 1, N.K); // micrófono
      p.r(28, 27, 8, 1, N.K).r(31, 26, 2, 3, N.W);              // perilla de volumen
      p.shape(40, 21, 5, 5, N.F, N.K, (i, j) => !((i === 0 || i === 4) && (j === 0 || j === 4)));
      p.shape(46, 21, 5, 5, N.F, N.K, (i, j) => !((i === 0 || i === 4) && (j === 0 || j === 4)));
    },
  },
  nes_rob: {
    console: 'nes',
    title: 'R.O.B., el robot',
    caption: 'Algunas NES traían a R.O.B., un robot que recibía órdenes con destellos de luz de la tele. Solo tuvo dos juegos.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.S);
      p.round(17, 35, 30, 4, N.Z, N.K);                          // base
      p.shape(29, 15, 6, 21, N.W, N.K);                          // torso
      p.r(31, 13, 2, 3, N.Z);                                    // cuello
      p.round(24, 3, 16, 11, N.W, N.K).r(26, 6, 12, 4, N.K).r(28, 7, 2, 2, N.F).r(34, 7, 2, 2, N.F); // cabeza
      p.shape(19, 18, 26, 3, N.Z, N.K);                          // hombros
      p.shape(18, 20, 4, 7, N.Z, N.K).shape(42, 20, 4, 7, N.Z, N.K); // brazos y pinzas
      [[N.G, 22], [N.Y, 26], [N.F, 30]].forEach(([c, y]) => p.shape(8, y, 7, 4, c, N.K)); // bloques para apilar
      p.r(47, 29, 9, 2, N.Y).r(51, 25, 1, 9, N.K);                // trompo
      p.rows(4, 4, SPARKLE, { x: N.W }).rows(56, 9, SPARKLE, { x: N.W });
    },
  },
  nes_zelda: {
    console: 'nes',
    title: 'El cartucho dorado',
    caption: 'The Legend of Zelda venía en un cartucho dorado, y traía una pila adentro para guardar tu partida.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.K);
      p.round(18, 4, 28, 33, N.Y, N.R);
      for (let k = 0; k < 3; k++) p.r(20, 6 + 2 * k, 24, 1, N.P);  // rayitas para agarrarlo
      p.r(22, 13, 20, 15, N.R).r(23, 14, 18, 13, N.P);
      p.rows(25, 16, [
        '.......Y.......',
        '......YYY......',
        '.....YYYYY.....',
        '....YYYYYYY....',
        '...Y.......Y...',
        '..YYY.....YYY..',
        '.YYYYY...YYYYY.',
        'YYYYYYY.YYYYYYY',
      ], { Y: N.Y });
      p.r(20, 32, 24, 1, N.P);
      p.shape(50, 27, 8, 8, N.Z, N.K, (i, j) => Math.abs(i - 3.5) + Math.abs(j - 3.5) < 6)
        .r(53, 29, 2, 4, N.W).r(52, 30, 4, 2, N.W);              // la pila redonda (+)
      p.rows(8, 8, SPARKLE, { x: N.W }).rows(52, 10, SPARKLE, { x: N.Y }).rows(10, 28, SPARKLE, { x: N.Y });
    },
  },
  nes_vhs: {
    console: 'nes',
    title: 'Como una videocasetera',
    caption: 'En EE. UU. la NES parecía una videocasetera: el cartucho entraba por el frente, bajo una tapa. Así las tiendas confiaban en ella.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.S);
      p.round(24, 1, 16, 12, N.Z, N.K).r(26, 3, 12, 6, N.F).r(28, 4, 8, 3, N.Y); // cartucho
      p.rows(29, 13, ['xxxxxx', '.xxxx.', '..xx..'], { x: N.W });               // flecha: ¡adentro!
      p.shape(10, 17, 42, 16, N.W, N.K);
      p.r(11, 24, 40, 8, N.Z).r(11, 24, 40, 1, N.K);              // frente gris oscuro
      p.r(22, 25, 22, 5, N.K).r(23, 26, 20, 1, N.Z);              // la tapa
      p.r(13, 26, 3, 2, N.K).r(17, 26, 3, 2, N.K).r(13, 25, 1, 1, N.F); // POWER, RESET y foquito
      p.r(24, 31, 3, 1, N.K).r(39, 31, 3, 1, N.K);                // puertos de control
      p.round(53, 26, 10, 6, N.K, N.K).r(55, 28, 2, 2, N.W).r(59, 28, 2, 2, N.W); // un casete de video
    },
  },
  nes_konami: {
    console: 'nes',
    title: 'El codigo Konami',
    caption: 'Arriba, arriba, abajo, abajo, izquierda, derecha, izquierda, derecha, B, A. Salió en Gradius, y en Contra te daba 30 vidas.',
    draw(g, w, h) {
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, N.S);
      ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A'].forEach((k, i) => {
        p.rows(2 + i * 6, 6, ARROWS[k], { x: k.length === 1 ? N.F : N.W });
      });
      p.round(10, 20, 44, 17, N.Z, N.K).r(12, 22, 40, 13, N.K);
      p.r(16, 25, 3, 8, N.Z).r(14, 27, 7, 3, N.Z);                // cruceta
      p.r(25, 24, 13, 3, N.Z).r(26, 30, 4, 1, N.Z).r(32, 30, 4, 1, N.Z); // SELECT y START
      p.button(41, 27, N.F).button(46, 27, N.F);
    },
  },
  // ===== Super Nintendo (16 bits) =====
  snes_lr: {
    console: 'snes',
    title: 'Botones L y R',
    caption: 'La Super Nintendo fue la primera consola de Nintendo con botones L y R en los hombros del control.',
    draw(g, w, h) {
      const C = SNES16;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      p.rows(15, 2, ARROWS.down, { x: C.W }).rows(45, 2, ARROWS.down, { x: C.W });
      p.round(9, 9, 16, 8, C.Y, C.K).round(39, 9, 16, 8, C.Y, C.K);     // los hombros, brillando
      pixText(p, 15, 10, 'L', C.K);
      pixText(p, 45, 10, 'R', C.K);
      p.shape(4, 15, 56, 22, C.L, C.K, (i, j) => {
        const x = i + 4;
        const y = j + 15;
        return (x - 15) ** 2 + (y - 26) ** 2 <= 110 || (x - 49) ** 2 + (y - 26) ** 2 <= 110 || (x >= 15 && x <= 49 && y >= 17 && y <= 35);
      });
      p.r(13, 21, 3, 11, C.D).r(9, 25, 11, 3, C.D);                     // cruceta
      p.r(26, 27, 4, 2, C.D).r(33, 27, 4, 2, C.D);                      // SELECT y START
      p.button(46, 19, C.B).button(41, 24, C.N).button(51, 24, C.R).button(46, 29, C.Y); // X Y A B
      p.rows(3, 5, SPARKLE, { x: C.W }).rows(58, 5, SPARKLE, { x: C.W });
    },
  },
  snes_modo7: {
    console: 'snes',
    title: 'El Modo 7',
    caption: 'El Modo 7 giraba y agrandaba un fondo para fingir 3D. Así se hicieron las pistas de F-Zero y Super Mario Kart.',
    draw(g, w, h) {
      const C = SNES16;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      for (let i = 0; i < 64; i++) {
        const hh = 2 + Math.round(3 * Math.abs(Math.sin(i / 6)));
        p.r(i, 14 - hh, 1, hh, C.P);                                    // montañas a lo lejos
      }
      // El piso en perspectiva: cada fila de más abajo se ve más grande (eso hacía el Modo 7).
      for (let y = 14; y < 40; y++) {
        const z = 40 / (y - 11);
        const half = (y - 11) * 1.1;
        for (let x = 0; x < 64; x++) {
          const chk = (Math.floor(((x - 32) * z) / 8) + Math.floor(z * 1.2)) & 1;
          const dx = Math.abs(x - 32);
          let c = chk ? C.N : C.E;
          if (dx < half) c = dx > half - 2 ? (chk ? C.R : C.W) : (chk ? C.G : C.L);
          p.r(x, y, 1, 1, c);
        }
      }
      p.rows(26, 33, ['....RRRR....', '...RSSSSR...', '..RRRRRRRR..', 'KKRRRRRRRRKK', 'KK.KKKKKK.KK'], { R: C.R, S: C.S, K: C.K });
      p.rows(4, 3, SPARKLE, { x: C.W });
    },
  },
  snes_superfx: {
    console: 'snes',
    title: 'Un chip en el cartucho',
    caption: 'Star Fox (1993) traía el chip Super FX dentro del cartucho: una ayuda extra para dibujar polígonos.',
    draw(g, w, h) {
      const C = SNES16;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      p.round(4, 4, 26, 32, C.G, C.L);                                  // el cartucho, abierto
      p.r(6, 7, 22, 22, C.E);                                           // la tarjeta de adentro
      p.r(8, 10, 6, 5, C.K).r(8, 17, 6, 5, C.K);                        // otros chips
      p.r(16, 11, 10, 10, C.K);                                         // el Super FX
      for (let k = 0; k < 4; k++) {
        p.r(17 + 2 * k, 10, 1, 1, C.L).r(17 + 2 * k, 21, 1, 1, C.L).r(15, 12 + 2 * k, 1, 1, C.L).r(26, 12 + 2 * k, 1, 1, C.L);
      }
      pixText(p, 17, 14, 'FX', C.Y);
      for (let k = 0; k < 10; k++) p.r(7 + 2 * k, 31, 1, 4, C.Y);      // contactos dorados
      p.rows(32, 17, ARROWS.right, { x: C.W });
      // La nave hecha de triángulos.
      const nose = (i, j) => Math.abs(i - 11) <= j / 2 && !(j > 15 && Math.abs(i - 11) < (j - 15));
      p.shape(40, 8, 23, 24, C.L, C.K, (i, j) => nose(i, j) && i >= 11);
      p.shape(40, 8, 23, 24, C.G, C.K, (i, j) => nose(i, j) && i <= 11);
      p.r(49, 18, 5, 2, C.B).r(39, 30, 3, 1, C.O).r(60, 30, 3, 1, C.O);
      p.rows(56, 6, SPARKLE, { x: C.Y });
    },
  },
  snes_yoshi: {
    console: 'snes',
    title: 'Llega Yoshi',
    caption: 'Yoshi apareció por primera vez en Super Mario World, el juego que venía con la Super Nintendo.',
    draw(g, w, h) {
      const C = SNES16;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      p.r(0, 34, 64, 6, C.E).r(0, 34, 64, 1, C.N);
      p.rows(8, 12, [
        '......gggggg........',
        '....gggggggggg......',
        '...gggggggggwwww....',
        '..gggggggggwwkww....',
        '..ggggggggggwwww....',
        '.ggggggggggggggggg..',
        '.gggggggggggggggggg.',
        '..ggwwwwwwwwwwggg...',
        '...gwwwwwwwwwwgg....',
        '....gggggggggg......',
        '.....rrrgggg........',
        '....rrrrrgggg.......',
        '....wwwwwgggg.......',
        '.....ggggggggg......',
        '.....gg.....gg......',
        '....oooo...oooo.....',
      ], { g: C.N, k: C.K, w: C.W, r: C.R, o: C.O });
      p.shape(38, 16, 14, 18, C.W, C.K, (i, j) => ((i - 6.5) / 7) ** 2 + ((j - 10) / (j < 10 ? 10 : 8)) ** 2 <= 1);
      p.r(41, 20, 3, 3, C.N).r(46, 25, 3, 3, C.N).r(42, 28, 2, 2, C.N).r(47, 19, 2, 2, C.N);   // manchitas del huevo
      p.rows(53, 10, SPARKLE, { x: C.W }).rows(32, 6, SPARKLE, { x: C.Y });
    },
  },
  snes_morada: {
    console: 'snes',
    title: 'Redondita o cuadrada',
    caption: 'En Japón y Europa era redondita, con botones de colores. En Estados Unidos era más cuadrada, gris con botones morados.',
    draw(g, w, h) {
      const C = SNES16;
      const p = pixelArt(g, w, h, 64, 40, C.B);
      // Japón y Europa: curvita.
      p.shape(3, 10, 27, 17, C.L, C.K, (i, j) => ((i - 13) / 13.6) ** 4 + ((j - 8) / 8.6) ** 4 <= 1);
      p.r(9, 12, 15, 2, C.D);                                           // ranura del cartucho
      p.r(8, 17, 2, 2, C.R).r(11, 17, 2, 2, C.Y).r(14, 17, 2, 2, C.N).r(17, 17, 2, 2, C.B);
      p.r(7, 21, 4, 2, C.G).r(22, 21, 4, 2, C.G);
      // Estados Unidos: cuadrada y morada.
      p.shape(34, 9, 27, 19, C.L, C.K);
      p.r(36, 12, 23, 1, C.G).r(41, 14, 13, 2, C.D);
      p.r(37, 20, 5, 3, C.P).r(53, 20, 5, 3, C.P).r(45, 21, 5, 2, C.V);  // POWER, RESET y expulsar
      // Banderitas.
      p.r(10, 30, 13, 8, C.W).r(14, 32, 5, 4, C.R);
      p.r(41, 30, 13, 8, C.W);
      for (let k = 0; k < 4; k++) p.r(41, 30 + 2 * k, 13, 1, C.R);
      p.r(41, 30, 6, 4, C.B);
    },
  },

  // ===== Nintendo 64 =====
  n64_palanca: {
    console: 'n64',
    title: 'La palanca analogica',
    caption: 'El control de la N64 trajo palanca analógica: si la movías poquito caminabas despacio, y si la movías mucho, ¡corrías!',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      drawN64Pad(p, 8, 6, C);
      p.r(29, 15, 6, 6, C.Y).r(30, 16, 4, 4, C.L);                      // la palanca, iluminada
      p.rows(30, 11, ['.x.', 'xxx'], { x: C.R }).rows(30, 22, ['xxx', '.x.'], { x: C.R });
      p.rows(26, 17, ['.x', 'xx', '.x'], { x: C.R }).rows(36, 17, ['x.', 'xx', 'x.'], { x: C.R });
      p.rows(2, 2, SPARKLE, { x: C.W }).rows(58, 34, SPARKLE, { x: C.W });
    },
  },
  n64_mario64: {
    console: 'n64',
    title: 'El mismo dia',
    caption: 'En Japón, Super Mario 64 salió el mismo día que la Nintendo 64: el 23 de junio de 1996.',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      p.round(13, 5, 12, 11, C.G, C.K).r(15, 7, 8, 6, C.R).r(18, 8, 2, 4, C.Y).r(17, 9, 4, 2, C.Y); // el cartucho
      p.shape(3, 15, 32, 17, C.D, C.K, (i, j) => !(j < 2 && (i < 3 || i > 28)));
      p.r(11, 15, 16, 2, C.K);                                          // ranura
      p.r(7, 19, 3, 2, C.G).r(28, 19, 3, 2, C.G);                       // POWER y RESET
      for (let k = 0; k < 4; k++) p.r(7 + 7 * k, 28, 3, 2, C.K);        // los 4 puertos
      p.shape(38, 6, 22, 29, C.W, C.K);                                 // el calendario
      p.r(39, 7, 20, 5, C.R).r(42, 4, 2, 4, C.K).r(54, 4, 2, 4, C.K);
      pixText(p, 42, 14, '23', C.K, 2);
      pixText(p, 42, 27, '1996', C.B);
      p.rows(29, 4, SPARKLE, { x: C.Y });
    },
  },
  n64_rumble: {
    console: 'n64',
    title: 'El Rumble Pak',
    caption: 'El Rumble Pak se conectaba al control y lo hacía vibrar. Debutó con Star Fox 64 (1997), que lo traía en la caja.',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.B);
      drawN64Pad(p, 8, 1, C);
      p.round(27, 27, 10, 12, C.K, C.D).r(29, 30, 6, 3, C.R);          // el Rumble Pak, puesto abajo
      const zig = ['x.', '.x', 'x.', '.x', 'x.', '.x'];
      p.rows(3, 8, zig, { x: C.Y }).rows(59, 8, zig, { x: C.Y }).rows(22, 31, zig, { x: C.Y }).rows(40, 31, zig, { x: C.Y });
    },
  },
  n64_cuatro: {
    console: 'n64',
    title: 'Cuatro puertos',
    caption: 'La Nintendo 64 traía 4 puertos para controles: ¡cuatro amigos jugando, sin comprar nada extra!',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      const pad = (i, j) => j < 4 || i < 3 || (i >= 4 && i <= 6) || i >= 8;
      [C.G, C.R, C.B, C.N].forEach((c, k) => {
        const px = 2 + k * 16;
        const port = 19 + 8 * k;
        p.r(px + 5, 11, 1, 9, c).r(Math.min(px + 5, port + 1), 20, Math.abs(px + 5 - port - 1) + 1, 1, c).r(port + 1, 20, 1, 13, c); // el cable
        p.shape(px, 3, 11, 8, c, C.K, pad);
        p.r(px + 5, 4, 1, 1, C.K);
      });
      p.shape(14, 24, 36, 13, C.D, C.K, (i, j) => !(j < 2 && (i < 3 || i > 32)));
      for (let k = 0; k < 4; k++) p.r(19 + 8 * k, 33, 4, 2, C.K);
    },
  },
  n64_expansion: {
    console: 'n64',
    title: 'El Expansion Pak',
    caption: 'The Legend of Zelda: Majora\'s Mask (2000) necesitaba el Expansion Pak, que le daba más memoria a la consola.',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      p.shape(3, 16, 34, 20, C.D, C.G);                                 // la consola vista desde arriba
      p.r(7, 18, 10, 4, C.K).r(13, 26, 16, 3, C.K);                     // tapita de la memoria y ranura
      p.r(9, 6, 6, 6, C.G).round(8, 1, 8, 6, C.R, C.W);                 // el Expansion Pak (tapa roja)
      p.rows(10, 12, ['xxxx', '.xx.'], { x: C.Y });
      // Una máscara con forma de corazón.
      p.shape(41, 9, 20, 19, C.P, C.Y, (i, j) => {
        const x = (i - 9.5) / 8.5;
        const y = (9 - j) / 8;
        return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0;
      });
      p.r(45, 15, 4, 3, C.Y).r(53, 15, 4, 3, C.Y).r(46, 16, 2, 1, C.N).r(54, 16, 2, 1, C.N);
      [[40, 10], [62, 10], [42, 6], [60, 6], [51, 29]].forEach(([x, y]) => p.r(x, y, 1, 2, C.O));
      p.rows(28, 4, SPARKLE, { x: C.W });
    },
  },

  // ===== GameCube (Mundo 5, js/worlds/gc.js). Ayudas de dibujo: GCP, gcPixText, drawGCCube (abajo). =====
  gc_disco: {
    console: 'gamecube',
    title: 'Discos de 8 cm',
    caption: 'La GameCube usaba discos chiquitos de 8 cm, en vez de los de 12 cm de un DVD. ¡Y aun así guardaban cerca de 1.5 GB!',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.D);
      const circle = (r, cx, cy) => (i, j) => (i - cx) ** 2 + (j - cy) ** 2 <= r * r;
      p.shape(2, 1, 31, 31, '#3A3180', C.L, circle(15, 15, 15));          // un disco normal (12 cm)
      p.shape(13, 12, 9, 9, C.D, C.L, circle(4, 4, 4));
      gcPixText(p, 10, 34, '12CM', C.L);
      p.shape(38, 8, 23, 23, C.P, C.K, circle(11, 11, 11));               // el disco de GameCube (8 cm)
      for (let j = 0; j < 23; j++) for (let i = 0; i < 23; i++) {
        const d = (i - 11) ** 2 + (j - 11) ** 2;
        if (d >= 42 && d <= 64) p.r(38 + i, 8 + j, 1, 1, (i + j) % 3 ? C.S : C.L);   // arcoíris del disco
      }
      p.shape(46, 16, 7, 7, C.K, C.K, circle(3, 3, 3));                     // el hoyito del centro
      gcPixText(p, 44, 34, '8CM', C.Y);
      p.rows(56, 4, SPARKLE, { x: C.W }).rows(34, 1, SPARKLE, { x: C.Y });
    },
  },
  gc_manija: {
    console: 'gamecube',
    title: 'La consola con manija',
    caption: '¡La GameCube tenía manija atrás! Era una consola de mesa, pero la podías cargar como lonchera a casa de un amigo.',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      p.r(0, 32, 64, 8, C.G).r(0, 32, 64, 1, '#2f8a3c');                 // pasto
      drawGCCube(p, 20, 10, C, 24);
      p.rows(2, 3, SPARKLE, { x: C.W }).rows(58, 6, SPARKLE, { x: C.W });
      // Flechitas de "¡vámonos!"
      p.rows(48, 20, ['..x..', '...x.', 'xxxxx', '...x.', '..x..'], { x: C.R }).rows(54, 20, ['..x..', '...x.', 'xxxxx', '...x.', '..x..'], { x: C.R });
    },
  },
  gc_dolphin: {
    console: 'gamecube',
    title: 'Nombre clave: Dolphin',
    caption: 'Mientras la inventaban, la GameCube se llamaba "Dolphin" (delfín). Su procesador era Gekko y su chip de gráficos, Flipper.',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      p.r(0, 26, 64, 14, C.U);
      for (let x = 0; x < 64; x += 8) p.r(x + 2, 27, 4, 1, C.W);            // olas con reflejos
      p.rows(14, 6, [
        '..........KK..........',
        '.........KUUK.........',
        '......KKKUUUUKKK......',
        '....KKUUUUUUUUUWKK....',
        '..KKUUUUUUUUUUUUKWK...',
        '.KUUUUUUUUUUUUUUUUUKKK',
        'KUUSSSSSSSSSSSUUUUUUUK',
        'KUKSSSSSSSSSSSSKKKKKK.',
        'KK.KKSSSSSSSSKK.......',
        '.....KKKKKKKK.........',
      ], { K: C.K, U: C.U, S: C.W, W: C.W });
      p.r(31, 10, 1, 1, C.K);                                               // el ojito
      for (let k = 0; k < 6; k++) p.r(8 + k * 2, 20 + k, 1, 1, C.W).r(40 + k * 2, 25 - k, 1, 1, C.W); // salpicadas
      drawGCCube(p, 48, 30, C, 10);
    },
  },
  gc_gbplayer: {
    console: 'gamecube',
    title: 'El Game Boy Player',
    caption: 'El Game Boy Player (2003) se conectaba debajo de la GameCube: ¡con él jugabas cartuchos de Game Boy en la tele!',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.D);
      p.round(30, 2, 32, 24, C.P, C.K).r(33, 5, 26, 18, C.K).r(34, 6, 24, 16, '#9bbc0f'); // la tele
      p.r(36, 14, 6, 6, '#306230').r(44, 10, 4, 4, '#0f380f').r(50, 16, 6, 4, '#8bac0f'); // un juego de Game Boy
      p.r(43, 26, 6, 2, C.K);
      drawGCCube(p, 6, 8, C, 18);                                            // la GameCube...
      p.round(6, 28, 18, 6, C.K, C.K).r(7, 29, 16, 4, '#3A3180').r(11, 30, 8, 2, C.K); // ...con el Game Boy Player abajo
      p.round(12, 34, 6, 6, C.P, C.K).r(13, 35, 4, 2, C.L);                  // el cartucho de Game Boy
      p.r(24, 31, 6, 1, C.L).r(29, 26, 1, 6, C.L);                          // el cable a la tele
      gcPixText(p, 37, 33, '2003', C.Y);
    },
  },
  gc_melee: {
    console: 'gamecube',
    title: 'El mas vendido',
    caption: 'Super Smash Bros. Melee (2001) fue el juego más vendido de la GameCube: ¡más de 7 millones de copias!',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.I);
      p.r(0, 30, 64, 10, C.D).r(4, 29, 56, 2, C.P);                         // la plataforma de la arena
      p.shape(22, 4, 20, 14, C.Y, C.K, (i, j) => j < 9 || (i >= 3 + (j - 9) && i <= 16 - (j - 9))); // la copa
      p.r(18, 6, 4, 2, C.Y).r(42, 6, 4, 2, C.Y).r(18, 6, 1, 6, C.Y).r(45, 6, 1, 6, C.Y); // las asas
      p.r(30, 18, 4, 5, C.Y).round(25, 23, 14, 5, C.O, C.K);                 // la base
      p.r(26, 6, 2, 6, C.W);                                                // brillo
      p.rows(29, 7, ['..x..', '.xxx.', 'xxxxx', '.x.x.'], { x: C.W });       // estrellita
      gcPixText(p, 4, 6, '+7M', C.W, 2);
      p.rows(56, 3, SPARKLE, { x: C.Y }).rows(50, 18, SPARKLE, { x: C.W });
      // Cuatro jugadores en la plataforma.
      [C.R, C.U, C.Y, C.G].forEach((c, k) => p.r(8 + k * 14, 24, 4, 5, c).r(8 + k * 14, 23, 4, 1, C.K));
    },
  },
  gc_boton_a: {
    console: 'gamecube',
    title: 'El gran boton A',
    caption: 'En el control de la GameCube, el botón A era verde y GRANDE, justo en medio: ¡el más importante, imposible de fallar!',
    draw(g, w, h) {
      const C = GCP;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      // El control: cuerpo índigo con dos agarraderas.
      p.shape(4, 6, 56, 30, C.I, C.K, (i, j) => (j < 18 && i >= 2 && i <= 53) || (j >= 18 && ((i >= 2 && i <= 18 && j <= 28) || (i >= 37 && i <= 53 && j <= 28))));
      p.round(10, 10, 9, 9, C.P, C.K).r(13, 13, 3, 3, C.L);                  // palanca
      p.rows(18, 21, ['.x.', 'xxx', '.x.'], { x: C.K });                     // cruceta
      p.round(36, 20, 7, 7, C.Y, C.K);                                        // palanca C (amarilla)
      p.round(41, 9, 9, 9, C.G, C.K).r(43, 11, 2, 2, C.W);                   // ¡el botón A!
      p.round(37, 15, 5, 5, C.R, C.K);                                        // B (rojo)
      p.round(51, 7, 4, 7, C.P, C.K).round(42, 4, 7, 4, C.P, C.K);           // X y Y
      p.r(30, 12, 3, 2, C.P);                                                 // START
      p.rows(44, 12, ['.x.', 'x.x', 'xxx', 'x.x'], { x: C.W });              // la letra A
      p.rows(2, 2, SPARKLE, { x: C.W }).rows(58, 34, SPARKLE, { x: C.W });
    },
  },
  // ===== Wii =====
  wii_revolution: {
    console: 'wii',
    title: 'Su nombre secreto',
    caption: 'Mientras la inventaban, su nombre secreto era "Revolution" (Revolución). En abril de 2006 Nintendo anunció su nombre de verdad: Wii.',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.L);
      for (let y = 0; y < 40; y += 4) p.r(0, y, 64, 2, C.W);           // franjas del menú
      p.round(8, 6, 12, 30, C.W, C.G).r(10, 9, 8, 1, C.S);               // la consola parada, con su luz azul
      p.r(13, 13, 2, 18, C.L).r(11, 32, 6, 2, C.G);
      p.rows(26, 17, ['..x..', '...x.', 'xxxxx', '...x.', '..x..'], { x: C.B }); // flecha
      p.round(34, 10, 26, 18, C.W, C.G);                                 // la tarjeta con el nombre nuevo
      p.rows(37, 14, ['x...x.x.x', 'x...x....', 'x.x.x.x.x', 'x.x.x.x.x', '.x.x..x.x'], { x: C.B });
      pixText(p, 39, 21, '2006', C.N);
      p.rows(2, 2, SPARKLE, { x: C.S }).rows(58, 33, SPARKLE, { x: C.Y });
    },
  },
  wii_sports: {
    console: 'wii',
    title: 'Wii Sports',
    caption: 'Wii Sports venía incluido con la consola (en casi todo el mundo, menos en Japón). Vendió más de 80 millones: ¡uno de los juegos más vendidos de la historia!',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.W);
      p.r(0, 28, 64, 12, C.T);                                           // el carril
      for (let x = 2; x < 64; x += 8) p.r(x, 28, 1, 12, C.O);
      const pin = (x, y) => p.r(x, y, 3, 8, C.W).r(x, y + 2, 3, 1, C.R).r(x - 1, y + 4, 5, 3, C.W).r(x, y - 1, 3, 1, C.G);
      [[44, 18], [49, 18], [54, 18], [46.5, 14], [51.5, 14]].forEach(([x, y]) => pin(Math.round(x), y));
      p.shape(8, 20, 12, 12, C.B, C.N, (i, j) => (i - 5.5) ** 2 + (j - 5.5) ** 2 <= 33);  // la bola
      p.r(11, 23, 2, 2, C.N).r(15, 23, 2, 2, C.N).r(13, 26, 2, 2, C.N);
      p.shape(24, 3, 12, 14, C.W, C.G, (i, j) => (i - 5.5) ** 2 / 36 + (j - 6.5) ** 2 / 49 <= 1); // raqueta
      for (let k = 0; k < 4; k++) { p.r(26, 6 + k * 3, 8, 1, C.L); p.r(27 + k * 2, 5, 1, 10, C.L); }
      p.r(29, 17, 2, 8, C.N);
      p.shape(38, 4, 6, 6, C.V, C.N, (i, j) => (i - 2.5) ** 2 + (j - 2.5) ** 2 <= 7);  // pelotita
      p.rows(56, 3, SPARKLE, { x: C.Y });
    },
  },
  wii_ventas: {
    console: 'wii',
    title: 'Cien millones',
    caption: 'Se vendieron más de 100 millones de Wii en todo el mundo. ¡Fue una de las consolas más vendidas de Nintendo!',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      // Una montaña de consolas blancas, cada vez más alta.
      [[4, 8], [12, 14], [20, 20], [28, 26]].forEach(([x, n]) => {
        for (let k = 0; k < n; k += 3) p.round(x, 36 - k - 3, 6, 3, C.W, C.G);
      });
      pixText(p, 38, 8, '100', C.W, 3);
      p.r(38, 26, 22, 2, C.W);
      p.rows(40, 30, ['x.x.x.x.x.x', 'xxxxxxxxxxx'], { x: C.N });          // "millones" de rayitas
      p.rows(2, 2, SPARKLE, { x: C.W }).rows(58, 20, SPARKLE, { x: C.Y });
    },
  },
  wii_gamecube: {
    console: 'wii',
    title: 'Familia es familia',
    caption: 'Las primeras Wii leían los discos de GameCube y tenían, bajo una tapita, 4 puertos para sus controles y 2 ranuras para sus tarjetas de memoria.',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.L);
      p.shape(4, 14, 34, 16, C.W, C.G);                                  // la Wii acostada, vista desde arriba
      p.r(8, 17, 26, 3, C.G);                                            // la tapita abierta
      for (let k = 0; k < 4; k++) p.r(8 + k * 7, 21, 5, 4, C.K).r(9 + k * 7, 22, 3, 2, C.M);   // 4 puertos
      p.r(8, 26, 8, 2, C.K).r(20, 26, 8, 2, C.K);                        // 2 ranuras de memoria
      p.shape(44, 10, 16, 16, C.M, C.K, (i, j) => (i - 7.5) ** 2 + (j - 7.5) ** 2 <= 60); // el disquito de 8 cm
      p.shape(50, 16, 4, 4, C.L, C.K, (i, j) => (i - 1.5) ** 2 + (j - 1.5) ** 2 <= 3);
      p.rows(39, 18, ['..x.', 'xxxx', '..x.'], { x: C.B });
      p.rows(58, 31, SPARKLE, { x: C.S });
    },
  },
  wii_mii: {
    console: 'wii',
    title: 'Los Mii',
    caption: 'En la Wii nacieron los Mii: muñequitos que tú creabas en el Canal Mii para que se parecieran a ti. ¡Luego jugaban contigo en Wii Sports!',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.W);
      for (let y = 0; y < 40; y += 4) p.r(0, y, 64, 2, C.L);
      const face = (x, y, hair, extra) => {
        p.shape(x, y, 14, 16, C.F, C.K, (i, j) => (i - 6.5) ** 2 / 49 + (j - 7.5) ** 2 / 64 <= 1);
        p.shape(x, y, 14, 7, hair, C.K, (i, j) => (i - 6.5) ** 2 / 49 + (j - 7.5) ** 2 / 64 <= 1 && j < 6);
        p.r(x + 4, y + 8, 1, 2, C.K).r(x + 9, y + 8, 1, 2, C.K);          // ojos de puntito
        p.r(x + 5, y + 12, 4, 1, C.K);                                   // boquita
        if (extra) extra(x, y);
      };
      face(4, 12, C.N);
      face(25, 6, C.O, (x, y) => p.r(x + 2, y + 7, 4, 1, C.K).r(x + 8, y + 7, 4, 1, C.K)); // con lentes
      face(46, 12, C.Y, (x, y) => p.r(x + 10, y + 1, 4, 3, C.P));        // con moño
      p.r(4, 30, 14, 6, C.S).r(25, 24, 14, 6, C.V).r(46, 30, 14, 6, C.R); // camisetas
      p.rows(20, 2, SPARKLE, { x: C.S }).rows(42, 36, SPARKLE, { x: C.Y });
    },
  },
  wii_sensor: {
    console: 'wii',
    title: 'La barra que no siente',
    caption: 'La barra sensora no "siente" nada: solo tiene luces infrarrojas. La cámara está en la punta del control, y así sabe a dónde apuntas.',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.N);
      p.round(6, 4, 52, 22, C.K, C.G).r(9, 7, 46, 16, C.S);              // la tele
      p.round(16, 1, 32, 4, C.W, C.G).r(19, 2, 4, 2, C.R).r(41, 2, 4, 2, C.R); // la barra con sus 2 luces
      p.round(28, 28, 8, 12, C.W, C.G).r(31, 29, 2, 2, C.K).r(31, 33, 2, 1, C.B); // el control, apuntando
      // Los rayos invisibles (aquí sí se ven) van de las luces a la cámara del control.
      for (let k = 0; k < 6; k++) { p.r(21 + k * 2, 6 + k * 4, 1, 2, C.P); p.r(42 - k * 2, 6 + k * 4, 1, 2, C.P); }
      p.rows(28, 12, ['..x..', '.xxx.', 'xxxxx', '.xxx.', '..x..'], { x: C.W }); // el cursor en la tele
    },
  },
};

// Paleta de la Wii (lore §9.1) para sus curiosidades.
const WIIP = {
  K: '#222222', W: '#FAFAFA', L: '#E6E9EE', G: '#AAB2BD', S: '#5BC0EB', B: '#1E88E5', N: '#0D47A1', V: '#43D17A',
  Y: '#FFD54F', O: '#FF8A3D', R: '#F44336', P: '#F48FB1', M: '#9C6ADE', F: '#F6D2B0', T: '#F3D9A4',
};

// ---------- Ayudas de dibujo de la GameCube ----------
const GCP = {
  K: '#17162B', I: '#4B3F9E', D: '#2D2566', L: '#8E86D9', S: '#7EC8FF', G: '#3BB54A', O: '#F28C28',
  Y: '#F5D547', P: '#C8CBD6', W: '#FFFFFF', U: '#2B9EDB', R: '#E04B4B',
};
// Letras de 3 x 5 que le faltan a PIX_FONT (sin tocarla).
const GC_GLYPHS = {
  4: ['x.x', 'x.x', 'xxx', '..x', '..x'], 7: ['xxx', '..x', '.x.', '.x.', '.x.'], 8: ['xxx', 'x.x', 'xxx', 'x.x', 'xxx'],
  C: ['xxx', 'x..', 'x..', 'x..', 'xxx'], M: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'], '+': ['...', '.x.', 'xxx', '.x.', '...'],
};
function gcPixText(p, x, y, text, c, s = 1) {
  [...String(text)].forEach((ch, k) => (GC_GLYPHS[ch] || PIX_FONT[ch] || []).forEach((row, j) => [...row].forEach((v, i) => {
    if (v === 'x') p.r(x + k * 4 * s + i * s, y + j * s, s, s, c);
  })));
}
// La GameCube vista de 3/4: cubo índigo con tapa, manija atrás y 4 puertos (sz = ancho).
function drawGCCube(p, x, y, C, sz = 20) {
  const t = Math.max(3, Math.round(sz / 4));
  const hy = y - Math.round(sz / 3);
  p.r(x + 3, hy, sz - 6, 2, C.D).r(x + 3, hy, 2, Math.round(sz / 3) + 1, C.D).r(x + sz - 5, hy, 2, Math.round(sz / 3) + 1, C.D); // manija
  p.shape(x + t, y, sz, t, C.L, C.K, (i, j) => i >= t - j - 1);           // tapa de arriba
  p.round(x, y + t, sz, sz, C.I, C.K);                                    // frente
  p.shape(x + sz - 1, y + 1, t + 1, sz + t - 1, C.D, C.K, (i, j) => j >= t - i - 1 && j <= sz + t - 2 - i + t); // costado
  p.r(x + Math.round(sz / 2) - 2, y + t + 3, 4, 4, C.L);                  // el cubito del logo
  for (let k = 0; k < 4; k++) p.r(x + 2 + k * Math.round((sz - 4) / 4), y + t + sz - 4, 2, 2, C.K); // 4 puertos
  p.r(x + 2, y + t + 2, 2, 1, C.W);                                       // brillo de plástico
}

function addCuriosities(list) { Object.assign(CURIOSIDADES, list); }

// Los mundos pueden traer las suyas en addWorld({ curiosities }).
function syncCuriosities() {
  WORLDS.forEach((w) => { if (w.curiosities) Object.assign(CURIOSIDADES, w.curiosities); });
}

// Ids de las curiosidades de una o varias consolas.
function curiositiesFor(consoleIds) {
  syncCuriosities();
  const ids = [].concat(consoleIds || []);
  return Object.keys(CURIOSIDADES).filter((id) => ids.includes(CURIOSIDADES[id].console));
}

// El siguiente de una lista sin repetir hasta agotarla. again = ya dio la vuelta completa.
function pickNext(ctx, key, list) {
  const n = ctx.counter(key);
  return { item: list[n % list.length], again: n > 0 && n % list.length === 0 };
}

// ---------- El visor ----------

// Recuadro con la ilustración grande, el título y el dato. Se cierra con ENTER.
// Usa su propio DOM sobre #game y se queda con las teclas mientras está abierto.
// opts.tag reemplaza la etiqueta de arriba (los secretos dicen "★ SECRETO 3/13").
function showCuriosity(ctx, id, opts = {}) {
  syncCuriosities();
  const c = CURIOSIDADES[id];
  if (!c) return Promise.resolve();
  const cons = CONSOLES.find((x) => x.id === c.console);
  return new Promise((done) => {
    const root = Game.root || document.getElementById('game');
    const el = document.createElement('div');
    el.className = `curio-view curio-${c.console}`;
    el.innerHTML = `
      <div class="curio-card">
        <div class="curio-tag">${esc(opts.tag || upper(cons ? `${cons.name} · ${cons.year}` : c.console))}</div>
        <canvas width="${CURIO_W}" height="${CURIO_H}"></canvas>
        <div class="curio-title">${esc(upper(c.title))}</div>
        <div class="curio-text">${esc(c.caption).replace(/\n/g, '<br>')}</div>
        <div class="curio-keys">ENTER: cerrar</div>
      </div>`;
    root.appendChild(el);
    const g = el.querySelector('canvas').getContext('2d');
    try {
      if (c.draw) c.draw(g, CURIO_W, CURIO_H);
      else if (c.rows) {
        const gw = Math.max(...c.rows.map((r) => r.length));
        pixelArt(g, CURIO_W, CURIO_H, gw, c.rows.length, c.bg || '#000').rows(0, 0, c.rows, c.palette || {});
      }
    } catch (err) { console.error(`Curiosidad ${id}:`, err); }
    Sfx.secret();
    const t0 = performance.now();
    const close = () => {
      window.removeEventListener('keydown', onKey, true);
      el.remove();
      done();
    };
    // Captura las teclas antes que la escena para que el ENTER no avance el diálogo de atrás.
    const onKey = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.repeat || performance.now() - t0 < 300) return;
      if (isConfirm(e) || e.key === 'Escape') { Sfx.confirm(); close(); }
    };
    window.addEventListener('keydown', onKey, true);
    el.onclick = () => { if (performance.now() - t0 >= 300) close(); };
  });
}

// ---------- Los amigos del pueblo cuentan datos de su consola ----------

// Amigos que se pueden reclutar (los que se perdonan en vez de vencer).
const recruitableFriends = () => Object.keys(ENEMIES).filter((id) => !ENEMIES[id].mode || ENEMIES[id].friend);

// Consola de la era de un amigo: la `console` de su mundo.
function consoleOfEnemy(id) {
  const w = WORLDS.find((x) => (x.nodes || []).includes(id) || (x.enemies && x.enemies[id]))
    || WORLDS.find((x) => x.theme === eraOfEnemy(id));
  return w && CONSOLES.find((c) => c.id === w.console);
}

function checkFriendsQuest() {
  if (!QUESTS.amigos) return;
  Quests.start('amigos');
  const all = recruitableFriends();
  if (all.length && all.every((id) => Save.data.spared[id])) Quests.complete('amigos');
}

// Plática con un amigo: su línea de siempre y luego datos y curiosidades de su consola.
//   opts.say    páginas de su línea (o función ctx => páginas). Si no: ENEMIES[id].townLine
//   opts.facts  datos "propios" del personaje (van primero). Si no: ENEMIES[id].townFacts
//   opts.extra  opciones propias: [{ opt: 'que te paso', run: async (ctx) => {...} }]
//   opts.curio  id de "su" curiosidad: la enseña primero. Si no: ENEMIES[id].townCurio
//   opts.bye    lo que dice al despedirse
//   opts.name   nombre en el cuadro (si no: el del enemigo)
async function friendTalk(ctx, enemyId, opts = {}) {
  const def = ENEMIES[enemyId] || {};
  const name = opts.name || upper(def.name || enemyId);
  const line = typeof opts.say === 'function' ? await opts.say(ctx) : opts.say;
  const pages = line || (def.townLine ? [].concat(def.townLine) : ['* ¡Hola! Ahora vivo en el pueblo.']);
  if (pages.length) await ctx.say(pages, name);
  checkFriendsQuest();

  const cons = consoleOfEnemy(enemyId);
  const facts = [...(opts.facts || def.townFacts || []), ...(cons ? cons.facts.map((f) => `* ${f}`) : [])];
  const own = opts.curio || def.townCurio;
  const curios = curiositiesFor(cons && cons.id).sort((a, b) => (b === own) - (a === own)); // la suya, primero
  const extra = opts.extra || [];
  const key = `amigo_${enemyId}`;
  const consName = cons ? upper(cons.name) : 'MI CONSOLA';
  for (;;) {
    const options = [...extra.map((x) => x.opt)];
    if (facts.length) options.push('cuéntame un dato');
    if (curios.length) options.push('enséñame algo');
    options.push('adiós');
    const pick = options[await ctx.choose(options, name)];
    const ex = extra.find((x) => x.opt === pick);
    if (ex) { await ex.run(ctx); continue; }
    if (pick === 'cuéntame un dato') {
      const { item, again } = pickNext(ctx, `${key}_dato`, facts);
      if (again) await ctx.say([`* Ya te conté todo lo que sé de la ${consName}.\n* ...¡Pero lo bueno se repite!`], name);
      await ctx.say([item], name);
    } else if (pick === 'enséñame algo') {
      const { item, again } = pickNext(ctx, `${key}_curio`, curios);
      await ctx.say([again ? '* Ya te enseñé todo mi álbum.\n* ¡Vamos a verlo otra vez!' : `* ¡Mira esto! Es de la ${consName}.`], name);
      await showCuriosity(ctx, item);
    } else {
      await ctx.say([opts.bye || '* ¡Vuelve pronto!'], name);
      return;
    }
  }
}
