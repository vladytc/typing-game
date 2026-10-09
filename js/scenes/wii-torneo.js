// TORNEO SENSOR — Minijefe B del Mundo 6: la batalla FINAL contra el rival (LORE.md §9.4).
// Es la MISMA batalla de Tecloides (js/scenes/tecloides.js), 3 contra 3, con:
//   - el estadio blanco de la Ciudad Sensor de fondo (gradas de muñequitos y la pantalla gigante),
//   - la regla del lore: para esquivar tienes 20 % MENOS de tiempo,
//   - Dani llega SIN su Tecloide "???": lo liberó.
// Al ganar, Dani te "presta" a su inicial para la batalla final (Save.data.flags.daniPresta).

Scenes.wiitorneo = Object.assign(Object.create(Scenes.tecloides), {
  enter(params) {
    document.body.className = 'theme-wii';
    Scenes.tecloides.enter.call(this, params);
    this.items = 5 + (Save.data.konami ? 3 : 0); // 3 contra 3: unas galletas más
    const mon = $('.mon');
    mon.classList.add('wiitorneo');
    const cv = document.createElement('canvas');
    cv.className = 'wt-stadium';
    cv.width = 640;
    cv.height = 480;
    mon.insertBefore(cv, mon.firstChild);
    const board = document.createElement('div');
    board.className = 'wt-board';
    board.innerHTML = '<b>TORNEO SENSOR</b> <span>FINAL</span>';
    mon.appendChild(board);
    this.cheer = 0;
    const g = cv.getContext('2d');
    // Público: muñequitos de colores con cara de puntitos que brincan.
    const crowd = [];
    const colors = [WIIC.sky, WIIC.pink, WIIC.green, WIIC.yellow, WIIC.orange, WIIC.purple, WIIC.blue, WIIC.red];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 22; i++) crowd.push({ x: 14 + i * 29 + (row % 2) * 14, y: 52 + row * 26, c: colors[(i * 3 + row) % colors.length], ph: Math.random() * 6 });
    const step = (ts) => {
      if (!g) return;
      this.cheer = Math.max(0, this.cheer - 0.012);
      g.fillStyle = WIIC.white;
      g.fillRect(0, 0, 640, 480);
      // Gradas.
      g.fillStyle = WIIC.light;
      g.fillRect(0, 40, 640, 90);
      crowd.forEach((p) => {
        const hop = Math.max(0, Math.sin(ts / (160 - this.cheer * 80) + p.ph)) * (3 + this.cheer * 8);
        g.fillStyle = p.c;
        g.fillRect(p.x - 6, p.y + 6 - hop, 12, 10);
        g.fillStyle = WIIC.skin;
        g.beginPath(); g.arc(p.x, p.y - hop, 7, 0, Math.PI * 2); g.fill();
        g.fillStyle = WII_PAL.K;
        g.fillRect(p.x - 3, p.y - 1 - hop, 2, 2);
        g.fillRect(p.x + 1, p.y - 1 - hop, 2, 2);
      });
      // Cancha con líneas, como el piso del menú.
      g.fillStyle = '#EEF6FB';
      g.fillRect(0, 130, 640, 350);
      g.strokeStyle = WIIC.sky;
      g.lineWidth = 2;
      for (let y = 150; y < 480; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
      g.strokeStyle = WIIC.blue;
      g.lineWidth = 4;
      g.beginPath(); g.ellipse(320, 250, 160, 50, 0, 0, Math.PI * 2); g.stroke();
      // Pantalla gigante arriba.
      g.fillStyle = WIIC.navy;
      wiiRoundRect(g, 220, 4, 200, 32, 8); g.fill();
      g.fillStyle = WIIC.sky;
      g.font = '10px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText(Math.floor(ts / 1200) % 2 ? '¡DA-NI! ¡DA-NI!' : 'TECLOIDES 3 VS 3', 320, 25);
      this.floorRaf = requestAnimationFrame(step);
    };
    this.floorRaf = requestAnimationFrame(step);
  },

  exit() {
    cancelAnimationFrame(this.floorRaf);
    Scenes.tecloides.exit.call(this);
  },

  pulse(sel, cls) {
    Scenes.tecloides.pulse.call(this, sel, cls);
    if (cls === 'hit') this.cheer = 1;
  },

  // Igual que en tecloides.js, pero con 20 % menos de tiempo (§9.4).
  dodge(word) {
    return new Promise((done) => {
      this.phase = 'defend';
      $('.mtext').innerHTML = '';
      this.ui = new TypingTask($('.mtext'), {
        label: '¡ESQUIVA! (20 % menos de tiempo)',
        texts: [word],
        timeLimit: (2000 + word.length * 100) * 0.8,
        strict: true,
        onDone: (res) => {
          this.st.chars += res.chars;
          this.st.errors += res.errors;
          done(res);
        },
      });
      this.ui.start();
    });
  },

  async win() {
    const d = Save.data;
    const first = !d.done[this.id];
    if (first) {
      // Dani te presta a su inicial para la batalla final (§10).
      const starter = (d.team && d.team[0] && d.team[0].id) || 'voltin';
      d.flags.daniPresta = WII_FINAL_OF[COUNTER[starter] || 'voltin'] || 'voltrueno';
      this.tr = {
        ...this.tr,
        lose: [...this.tr.lose,
          '* ¡En la gran pantalla de la ciudad se prende otro cuadrito!\n* CANAL TORNEO: ENCENDIDO.',
          `* DANI: Toma. Llévate a ${upper(TECLOIDES[d.flags.daniPresta].name)} cuando vayas con el tipo morado.\n* ...Es un préstamo. Me lo regresas, ¿eh?`],
      };
      Save.write();
    }
    return Scenes.tecloides.win.call(this);
  },
});
