// Secretos jugables del mundo pueblo: curiosidades con el dato real (ver js/secretos.js).

addCuriosities({
  secreto_pueblo_konami: {
    console: 'nes',
    title: 'El código Konami',
    caption: 'Kazuhisa Hashimoto lo inventó al pasar Gradius a la Famicom (1986): el juego era tan difícil que se lo puso para poder probarlo. Se le olvidó quitarlo... y se volvió el código más famoso del mundo.',
    draw(g, w, h) {
      const C = NES10;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      // Control de NES: cuerpo gris, franja negra, cruz y los botones B y A rojos.
      p.r(6, 10, 52, 22, C.Z).r(7, 11, 50, 20, '#bcbcbc').r(7, 17, 50, 8, C.K);
      p.r(12, 16, 3, 10, C.K).r(9, 19, 9, 4, C.K).r(13, 17, 1, 8, C.Z).r(10, 20, 7, 2, C.Z);
      p.r(40, 19, 5, 5, C.F).r(48, 19, 5, 5, C.F);
      p.rows(40, 26, ['x.x...xx', 'xx...x.x', 'x.x..xxx'], { x: C.W });
      // ↑↑↓↓←→←→ arriba del control.
      const up = ['..x..', '.xxx.', 'xxxxx'];
      const down = [...up].reverse();
      const left = ['..x', '.xx', 'xxx', '.xx', '..x'];
      const right = left.map((r) => [...r].reverse().join(''));
      [[up, 3], [up, 10], [down, 17], [down, 24]].forEach(([a, x]) => p.rows(x, 3, a, { x: C.Y }));
      [[left, 32], [right, 38], [left, 44], [right, 50]].forEach(([a, x]) => p.rows(x, 2, a, { x: C.Y }));
      p.rows(26, 34, ['xx..x.', 'x.x.x.', 'xx..x.', 'x.x.x.', 'xx..xxx'].slice(0, 0), { x: C.W });
    },
  },
});
