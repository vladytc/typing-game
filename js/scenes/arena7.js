// ARENA MODO 7 — revancha de Tecloides contra Dani Turbo, 3 contra 3 (LORE.md §6.4).
// Es la misma batalla de js/scenes/tecloides.js, pero sobre un piso Modo 7 que gira
// alrededor de la arena, con la paleta del Reino 16-Bit. El equipo está en TRAINERS.dani3.

Scenes.arena7 = Object.create(Scenes.tecloides);
Object.assign(Scenes.arena7, {
  enter(params) {
    document.body.className = 'theme-snes';
    Scenes.tecloides.enter.call(this, params);
    this.items = 5 + (Save.data.konami ? 3 : 0); // 3 contra 3: unas galletas más
    const mon = $('.mon');
    mon.classList.add('arena7');
    const cv = document.createElement('canvas');
    cv.className = 'arena-floor';
    cv.width = 320;
    cv.height = 240;
    mon.insertBefore(cv, mon.firstChild);
    const m7 = new Mode7(cv, M7_FLOORS.arena(), { horizon: 0.28, height: 30, focal: 150, fog: 'rgba(11,11,30,0.9)' });
    const t0 = performance.now();
    const step = (ts) => {
      const a = ((ts - t0) / 1000) * 0.18;
      // La cámara gira alrededor del centro de la arena, siempre mirándolo.
      const r = 170;
      m7.render(128 - Math.cos(a) * r, 128 - Math.sin(a) * r, a);
      const g = m7.g;
      const sky = g.createLinearGradient(0, 0, 0, m7.hy);
      sky.addColorStop(0, '#0b0b1e');
      sky.addColorStop(1, '#2e5c9a');
      g.fillStyle = sky;
      g.fillRect(0, 0, 320, m7.hy + 1);
      // Gradas con público (puntitos que brincan).
      for (let x = 0; x < 320; x += 6) {
        const hop = Math.sin(ts / 150 + x) > 0.7 ? 1 : 0;
        g.fillStyle = ['#e8393d', '#ffd93d', '#9be86e', '#f79ac0', '#5fcde4'][(x / 6 + Math.floor(a * 20)) % 5];
        g.fillRect(x + 1, m7.hy - 6 - hop, 3, 3);
      }
      this.floorRaf = requestAnimationFrame(step);
    };
    this.floorRaf = requestAnimationFrame(step);
  },

  exit() {
    cancelAnimationFrame(this.floorRaf);
    Scenes.tecloides.exit.call(this);
  },
});
