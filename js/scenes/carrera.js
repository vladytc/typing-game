// RAYO CERO — carrera de tecleo continuo (guiño a F-Zero, 1990). LORE.md §6.4.
// La pista se dibuja en Modo 7. Avanzas escribiendo un párrafo sin parar:
//   cada letra correcta te acelera, cada error es un frenazo (la nave chispea),
//   y la palabra TURBO escrita sin errores te da un impulso. Gana quien recorra más en 60 s.
// Con { arcade: true } es el minijuego PISTA CERO (récord en metros).

const RACE = {
  secs: 60,
  unit: 70,     // unidades de pista que avanzas por cada letra
  gain: 0.7,    // cuánto acelera cada letra correcta
  decay: 0.7,   // cuánto se frena la nave sola (con gain = decay, la velocidad = letras por segundo)
  brake: 1.2,   // frenazo por error
  boost: 2.5,   // impulso del TURBO
  meters: 10,   // metros por letra
};

// Naves vistas por detrás (12 x 10). La del jugador es azul; la de Rayo, roja.
const RACER_ART = [
  '......KKKK......',
  '.....KVVVLK.....',
  '....KVWVLLBK....',
  'KK.KKKKKKKKKK.KK',
  'KRKRRRRRRRRRRKRK',
  'KRRRRYYYYYYRRRRK',
  'KrrRRRRRRRRRRrrK',
  '.KKrrrrrrrrrrKK.',
  '...KOYK..KOYK...',
  '....KK....KK....',
];
const PLAYER_RACER = RACER_ART.map((r) => r.replace(/R/g, 'U').replace(/r/g, 'B').replace(/Y/g, 'V'));

// Sprite a un canvas pequeño (para dibujarlo escalado sin suavizar).
function artCanvas(rows, pal = SNES_PAL) {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  paintArt(c.getContext('2d'), rows, 0, 0, 1, false, pal);
  return c;
}

// Párrafo continuo: frases del mundo + 3 TURBO repartidos al principio de la carrera.
function buildRaceText() {
  const phrases = [];
  let pool = [];
  while (phrases.join(' ').length < 900) {
    if (!pool.length) pool = pickWords(SNES_PHRASES, SNES_PHRASES.length);
    phrases.push(pool.shift());
  }
  let text = '';
  const turbo = [];
  const marks = [24, 64, 104];
  phrases.forEach((p) => {
    text += (text ? ' ' : '') + p;
    if (turbo.length < marks.length && text.length >= marks[turbo.length]) {
      turbo.push([text.length + 1, text.length + 6]);
      text += ' TURBO';
    }
  });
  return { text, turbo };
}

Scenes.carrera = {
  enter({ enemyId = 'rayocero', back = 'map', arcade = false, tries = 0 } = {}) {
    document.body.className = 'theme-snes';
    Object.assign(this, {
      id: enemyId, def: ENEMIES[enemyId], back, arcade, tries,
      strict: strictOn(true),
      phase: 'intro', running: false, t: 0, count: 3,
      pos: 0, errors: 0, chars: 0, errors20: 0, turboOk: true, boostT: 0, sparks: [],
      v: 0, d: 0, rv: 0, rd: 0,
    });
    // Rayo va a 28 PPM (en el arcade, 32). Cada derrota lo hace 10 % más lento (hasta 3 veces).
    const slow = Math.pow(0.9, Math.min(3, tries));
    this.rivalRate = (((arcade ? 32 : 28) * 5) / 60) * diff().speed * slow;
    Object.assign(this, buildRaceText());
    Game.root.innerHTML = `
      <div class="race">
        <canvas class="race-cv" width="320" height="200"></canvas>
        <div class="race-hud">
          <div>TIEMPO<br><b class="r-time">${RACE.secs}</b></div>
          <div class="r-pos">1º</div>
          <div><b class="r-speed">0</b> KM/H<br><span class="r-dist">0 M</span></div>
        </div>
        <div class="race-prog"><span>META</span><i class="rp-foe"></i><i class="rp-me"></i></div>
        <div class="race-flash hidden"></div>
        <div class="race-type"><div class="rt-hint"></div><div class="rt-line"></div></div>
        <div class="box race-card hidden"></div>
      </div>`;
    this.cv = $('.race-cv');
    this.g = this.cv.getContext('2d');
    this.m7 = new Mode7(this.cv, M7_FLOORS.track(), { horizon: 0.33, height: 22, focal: 150, fog: 'rgba(95,205,228,0.9)' });
    this.shipMe = artCanvas(PLAYER_RACER);
    this.shipFoe = artCanvas(RACER_ART);
    this.renderLine();
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame((ts) => this.loop(ts));

    const pages = arcade
      ? ['* MAESTRA MODO: ¡Bienvenido a PISTA CERO!\n* 60 segundos. Escribe sin parar. ¡A ver cuántos metros haces!',
        '* (Cada error es un frenazo. TURBO sin errores = ¡impulso!)']
      : tries
        ? ['* RAYO CERO: ¿Otra vuelta? Va, esta vez voy un poquito más lento.']
        : ['* RAYO CERO: ¡Aquí no se gana con fuerza, se gana con dedos!',
          '* RAYO CERO: Mi pista gira con el Modo 7.\n* Nadie sabe por qué siete.',
          '* Un letrero en la orilla dice:\n* "Este tipo de piso que gira se llamaba Modo 7 y fingía 3D."',
          '* (Escribe el texto sin parar para acelerar. Cada error es un frenazo.\n* Si escribes TURBO sin errores, ¡sales disparado!)'];
    if (this.strict) pages.push('* (Los acentos y la Ñ cuentan. ¡Sin acento es un frenazo!)');
    this.card(true);
    this.dialog = new Dialog($('.race-card'), pages, () => { this.card(false); this.countdown(); });
  },

  exit() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearInterval(this.countIv);
    if (this.dialog) this.dialog.stop();
  },

  card(show) { $('.race-card').classList.toggle('hidden', !show); },

  countdown() {
    this.phase = 'count';
    this.count = 3;
    const flash = $('.race-flash');
    const show = (txt) => { flash.textContent = txt; flash.classList.remove('hidden'); };
    show('3');
    Sfx.move();
    this.countIv = setInterval(() => {
      if (this.phase === 'paused') return;
      this.count--;
      if (this.count > 0) { show(String(this.count)); Sfx.move(); return; }
      clearInterval(this.countIv);
      show('¡YA!');
      Sfx.confirm();
      setTimeout(() => flash.classList.add('hidden'), 600);
      this.phase = 'race';
      Music.play('snes_rayo');
    }, 800);
  },

  // ---------- Tecleo ----------

  inTurbo(i) { return this.turbo.find(([a, b]) => i >= a && i < b); },

  onKey(e) {
    if (this.phase === 'intro') { this.dialog.key(e); return; }
    if (this.phase === 'over' || this.phase === 'paused') { if (this.menu) this.menu.key(e); return; }
    if (e.key === 'Escape') { if (this.phase === 'race' || this.phase === 'count') this.pause(); return; }
    if (this.phase !== 'race' || e.repeat || e.key.length !== 1) return;
    const expected = this.text[this.pos];
    const ok = (this.strict ? strictMatch : keyMatches)(expected, e.key);
    Stats.record(expected, ok);
    if (!ok) {
      this.errors++;
      if (this.t < 20) this.errors20++;
      this.v = Math.max(0, this.v - RACE.brake);
      if (this.inTurbo(this.pos)) this.turboOk = false;
      Sfx.error();
      for (let i = 0; i < 8; i++) this.sparks.push({ x: 160, y: 150, vx: (Math.random() - 0.5) * 80, vy: -Math.random() * 60, t: 0 });
      this.renderLine((this.strict && strictTip(expected, e.key)) || '¡FRENAZO!', true);
      return;
    }
    Sfx.key();
    const wasTurbo = this.inTurbo(this.pos);
    this.pos++;
    const nextTurbo = this.inTurbo(this.pos);
    if (nextTurbo && this.pos === nextTurbo[0]) this.turboOk = true;
    this.chars++;
    this.v += RACE.gain;
    if (wasTurbo && this.pos === wasTurbo[1] && this.turboOk) {
      this.v += RACE.boost;
      this.boostT = 1.2;
      Sfx.powerup();
      const flash = $('.race-flash');
      flash.textContent = '¡TURBO!';
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 700);
    }
    this.renderLine();
  },

  renderLine(hint = '', err = false) {
    const from = Math.max(0, this.pos - 8);
    const html = [];
    for (let i = from; i < this.pos + 22 && i < this.text.length; i++) {
      const c = this.text[i];
      const cls = [i < this.pos ? 'ok' : '', i === this.pos ? `nx${err ? ' bad' : ''}` : '', this.inTurbo(i) ? 'turbo' : ''].join(' ');
      html.push(`<span class="${cls}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`);
    }
    // Relleno a la izquierda para que el cursor siempre quede en el mismo lugar.
    const pad = '<span>&nbsp;</span>'.repeat(8 - (this.pos - from));
    $('.rt-line').innerHTML = pad + html.join('');
    $('.rt-hint').textContent = hint || (this.inTurbo(this.pos) ? '¡TURBO! Sin errores...' : '');
    $('.rt-hint').classList.toggle('bad', err);
  },

  pause() {
    this.prevPhase = this.phase;
    this.phase = 'paused';
    const el = document.createElement('div');
    el.className = 'snes-pause';
    el.innerHTML = '<div>PAUSA</div><div class="snes-pmenu"></div>';
    $('.race').appendChild(el);
    const resume = () => { el.remove(); this.menu = null; this.phase = this.prevPhase; this.last = performance.now(); };
    this.menu = new ListMenu($('.snes-pmenu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 1 ? Game.go(this.back) : resume()),
      onCancel: resume,
    });
  },

  // ---------- Bucle ----------

  loop(ts) {
    if (!this.running) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    if (this.phase === 'race') this.update(dt);
    this.draw(ts / 1000);
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    this.t += dt;
    this.v *= Math.exp(-RACE.decay * dt);
    // Rayo acelera hasta su ritmo y "respira" un poquito para que haya emoción.
    const target = this.rivalRate * (1 + 0.08 * Math.sin(this.t * 0.9));
    this.rv += (target - this.rv) * Math.min(1, dt * 1.5);
    this.d += this.v * dt;
    this.rd += this.rv * dt;
    this.boostT = Math.max(0, this.boostT - dt);
    const left = Math.max(0, RACE.secs - this.t);
    $('.r-time').textContent = Math.ceil(left);
    $('.r-speed').textContent = Math.round(this.v * 150);
    $('.r-dist').textContent = `${Math.round(this.d * RACE.meters)} M`;
    $('.r-pos').textContent = this.d >= this.rd ? '1º' : '2º';
    const goal = this.rivalRate * RACE.secs * 1.15;
    $('.rp-me').style.left = `${Math.min(100, (this.d / goal) * 100)}%`;
    $('.rp-foe').style.left = `${Math.min(100, (this.rd / goal) * 100)}%`;
    if (left <= 0) this.finish();
  },

  draw(time) {
    const g = this.g;
    const U = RACE.unit;
    const sway = this.phase === 'race' ? Math.sin(this.t * 0.35) * 0.14 : 0;
    const camX = this.d * U - 50;
    this.m7.render(camX, 128, sway);
    paintParallaxSky(g, 320, this.m7.hy, camX * 0.05 + sway * 400);
    g.imageSmoothingEnabled = false;
    // Rayo Cero, proyectado sobre la pista (la distancia se comprime para que se vea aunque vaya lejos).
    const p = this.m7.project(this.d * U + (this.rd - this.d) * U * 0.25, 128 + 16 * Math.sin(time * 0.5));
    const drawFoe = () => {
      if (!p || p.z <= 10) return;
      const sc = Math.min(3, p.s * 0.7);
      g.drawImage(this.shipFoe, p.x - 8 * sc, p.y - 10 * sc, 16 * sc, 10 * sc);
    };
    if (p && p.z >= 50) drawFoe(); // va adelante: se dibuja detrás de tu nave
    const gap = Math.round((this.d - this.rd) * RACE.meters);
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';
    if (this.phase === 'race' && gap > 6 && (!p || p.z <= 10)) g.fillText(`RAYO -${gap} M`, 8, 196);
    // Tu nave (se mece al teclear).
    const bob = Math.sin(time * 12) * (this.v > 0.3 ? 1 : 0);
    const shipX = 160 - 24 + sway * -40;
    if (this.boostT > 0 || this.v > 0.5) {
      g.fillStyle = this.boostT > 0 ? '#9be7ff' : '#ff8c1a';
      const fl = this.boostT > 0 ? 14 : 4 + Math.random() * 4;
      g.fillRect(shipX + 12, 166 + bob, 6, fl);
      g.fillRect(shipX + 30, 166 + bob, 6, fl);
    }
    g.drawImage(this.shipMe, shipX, 140 + bob, 48, 30);
    if (p && p.z < 50) drawFoe(); // va atrás (más cerca de la cámara): encima
    // Chispas del frenazo.
    this.sparks = this.sparks.filter((s) => (s.t += 1 / 60) < 0.4);
    this.sparks.forEach((s) => {
      g.fillStyle = Math.random() < 0.5 ? '#ffd93d' : '#ffffff';
      g.fillRect(s.x + s.vx * s.t, s.y + s.vy * s.t + 40 * s.t * s.t, 2, 2);
    });
  },

  // ---------- Final ----------

  finish() {
    this.phase = 'over';
    Music.stop();
    const d = Save.data;
    const won = this.d > this.rd;
    const meters = Math.round(this.d * RACE.meters);
    const gap = Math.abs(Math.round((this.d - this.rd) * RACE.meters));
    const wpm = Math.round(this.chars / 5 / (RACE.secs / 60));
    const typed = this.chars + this.errors;
    const acc = typed ? Math.round((this.chars / typed) * 100) : 100;
    const lines = [won ? '¡GANASTE LA CARRERA!' : '¡RAYO CERO GANÓ!', `${meters} M · ${wpm} PPM · Precisión ${acc}%`];
    let items;
    if (this.arcade) {
      const best = (d.arcade || {}).pistacero || 0;
      if (meters > best) { d.arcade.pistacero = meters; lines.push('¡NUEVO RÉCORD!'); } else lines.push(`Récord: ${best} M`);
      Stats.addBattle({ enemy: 'pistacero', wpm, acc, date: Date.now() });
      // Misión "Piloto de pruebas": ganar en Normal sin errores los primeros 20 segundos.
      if (won && d.difficulty === 'normal' && this.errors20 === 0 && Quests.state('snes_piloto') === 'active') {
        Quests.complete('snes_piloto');
        if (!d.treasures.control_colores) { d.treasures.control_colores = true; lines.push('Recibiste: CONTROL DE COLORES'); }
      } else if (won && this.errors20 === 0 && d.difficulty !== 'normal') lines.push('(La misión de piloto se cumple en Normal.)');
      items = [{ label: 'Otra vez', go: () => Game.go('carrera', { arcade: true, back: this.back }) }, { label: 'Salir', go: () => Game.go(this.back) }];
    } else if (won) {
      Music.play('victory');
      const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
      const ups = addXp(this.def.xp);
      lines.push(`Le ganaste por ${gap} M. Ganaste ${this.def.xp} XP.`);
      if (isRecord && d.stats.battles.length > 1) lines.push(`¡NUEVO RÉCORD: ${wpm} PPM!`);
      if (ups) { lines.push(`¡Subiste a nivel ${d.level}!`); Sfx.levelup(); }
      if (!d.done[this.id]) {
        d.done[this.id] = true;
        d.treasures.casco_cero = true;
        d.flags.arcade_pistacero = true;
        lines.push('Recibiste: CASCO CERO', '¡PISTA CERO ya está en el arcade de la Maestra Modo!');
        Quests.start('snes_piloto');
      }
      lines.push('RAYO CERO: "¡Qué dedos! Me voy a revisar el motor."');
      items = [{ label: 'Continuar', go: () => Game.go(this.back) }];
    } else {
      Sfx.lose();
      lines.push(`Te faltaron ${gap} M.`, this.tries < 3 ? 'RAYO CERO: "¡Revancha! Te doy ventaja: voy 10 % más lento."' : 'RAYO CERO: "¡Otra! Ya casi."');
      items = [{ label: 'Revancha', go: () => Game.go('carrera', { enemyId: this.id, back: this.back, tries: this.tries + 1 }) }, { label: 'Salir', go: () => Game.go(this.back) }];
    }
    Save.write();
    const card = $('.race-card');
    card.classList.remove('hidden');
    card.classList.add('end');
    card.innerHTML = `${lines.map((l) => `<div>${esc(upper(l))}</div>`).join('')}<div class="snes-pmenu"></div>`;
    this.menu = new ListMenu($('.snes-pmenu', card), items, { cols: items.length, onPick: (i) => items[i].go() });
  },
};
