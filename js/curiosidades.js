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
};

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
function showCuriosity(ctx, id) {
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
        <div class="curio-tag">${esc(upper(cons ? `${cons.name} · ${cons.year}` : c.console))}</div>
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
