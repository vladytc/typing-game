// MINIJUEGO — PATOS DE LETRAS (guiño a Duck Hunt, NES 1984). Bosque Oscuro, con Toby.
// Vuelan patos de izquierda a derecha con una letra. Escribir la letra = pato atrapado con la
// RED DE LETRAS (nada de disparos: Toby lo trae y lo suelta). 3 patos por ronda, 10 rondas;
// cada ronda vuelan 12 % más rápido. Desde la ronda 7 traen MAYUSCULAS (SHIFT).
// Fallar en una ronda = Toby se ríe (termina la ronda, no el juego). Turbo: sílabas de 2 letras.
// En el mapa hay que atrapar PATOS_GOAL para abrir el camino; en el arcade solo cuenta el récord.

const PATOS_ROUNDS = 10;
const PATOS_PER_ROUND = 3;
const PATOS_GOAL = 21;
const PATOS_CAPS_FROM = 7;
const PATOS_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const PATOS_SYL = ['pa', 'to', 'me', 'lo', 'su', 'ra', 'ni', 'ca', 'de', 'fi', 'go', 'ju', 'ke', 'vi', 'ze', 'bo', 'qu', 'ya', 'wi', 'he'];

Scenes.patos = nesScene({
  enter({ enemyId = 'patos', back = 'map', turbo = false, arcade = false } = {}) {
    Object.assign(this, { id: enemyId, back, turbo, arcade: !!arcade, backParams: undefined });
    this.mount('patos-scene', '<div class="pt-hud"></div>');
    Object.assign(this, {
      round: 0, ducks: [], caught: 0, results: [], target: null, toby: null, mode: 'intro',
      spawned: 0, spawnT: 0, endMenu: null, pauseMenu: null,
    });
    this.playMusic('patos');
    Quests.start('patos_toby');
    this.renderHud();
    const pages = [
      '* ¡Guau! ¡Bienvenido al Bosque Oscuro!\n* Hoy no cazamos: ¡hoy ATRAPAMOS!',
      `* Cada pato trae ${turbo ? 'una sílaba' : 'una letra'}. Escríbela y ¡ZAS!, cae en tu RED DE LETRAS.\n* Yo te lo traigo y luego lo suelto. Promesa de perro.`,
      `* Desde la ronda ${PATOS_CAPS_FROM} vienen en MAYUSCULAS: usa SHIFT.${this.arcade ? '' : `\n* Atrapa ${PATOS_GOAL} de 30 para seguir el camino.`}`,
    ];
    this.say(pages, () => {
      if (Math.random() < 0.5) {
        this.say(['* ¿Ya viste las nubes y los arbustos?\n* ¡Son el MISMO dibujo con otro color! Así ahorraban memoria en 1985.'], () => this.nextRound(), 'BIT');
      } else this.nextRound();
    }, 'TOBY');
  },

  // ---------- Rondas ----------

  renderHud() {
    const hud = $('.pt-hud');
    if (!hud) return;
    const dots = Array.from({ length: PATOS_ROUNDS * PATOS_PER_ROUND }, (_, i) => {
      const r = this.results[i];
      return `<i class="${r === true ? 'hit' : r === false ? 'miss' : ''}"></i>`;
    }).join('');
    const best = (Save.data.arcade || {})[this.turbo ? 'patos_turbo' : 'patos'] || 0;
    hud.innerHTML = `<span>RONDA ${Math.max(1, this.round)}/${PATOS_ROUNDS}</span><span class="pt-dots">${dots}</span><span>RECORD ${best}</span>`;
  },

  nextRound() {
    this.round++;
    if (this.round > PATOS_ROUNDS) { this.end(); return; }
    this.mode = 'round';
    this.toby = null;
    this.spawned = 0;
    this.roundMissed = 0;
    this.roundCaught = 0;
    this.ducks = [];
    this.target = null;
    this.dur = 4.4 / Math.pow(1.12, this.round - 1) / diff().speed * pace('patos'); // segundos para cruzar la pantalla
    this.spawnT = 0.9;
    this.panel.innerHTML = `<div class="pt-msg">RONDA ${this.round}${this.round >= PATOS_CAPS_FROM ? ' · ¡MAYUSCULAS!' : ''}<br><span>Escribe ${this.turbo ? 'la sílaba' : 'la letra'} de cada pato.</span></div>`;
    this.renderHud();
  },

  pickText() {
    const flying = this.ducks.filter((d) => d.state === 'fly').map((d) => norm(d.text[0]));
    const pool = (this.turbo ? PATOS_SYL : PATOS_LETTERS).filter((t) => !flying.includes(t[0]));
    let t = rand(pool);
    if (this.round >= PATOS_CAPS_FROM) t = t[0].toUpperCase() + t.slice(1);
    return t;
  },

  spawn() {
    const i = (this.round - 1) * PATOS_PER_ROUND + this.spawned;
    this.ducks.push({ text: this.pickText(), pos: 0, i, t: 0, x: -40, y0: 70 + Math.random() * 110, y: 0, ph: Math.random() * 6, state: 'fly', fall: 0 });
    this.spawned++;
  },

  actionKey(k) {
    if (this.mode !== 'round') return;
    let d = this.target && this.target.state === 'fly' ? this.target : null;
    if (d) {
      const exp = d.text[d.pos];
      if (!capsMatch(exp, k)) { Stats.record(exp, false); this.tally.errors++; Sfx.error(); return; }
      Stats.record(exp, true);
    } else {
      const flying = this.ducks.filter((x) => x.state === 'fly');
      const options = flying.filter((x) => capsMatch(x.text[0], k));
      if (!options.length) {
        if (flying.length === 1) Stats.record(flying[0].text[0], false);
        this.tally.errors++;
        Sfx.error();
        return;
      }
      d = options.reduce((a, x) => (x.x > a.x ? x : a)); // el que está por escaparse
      Stats.record(d.text[0], true);
    }
    this.tally.chars++;
    d.pos++;
    if (d.pos >= d.text.length) { this.catchDuck(d); return; }
    Sfx.key();
    this.target = d;
  },

  catchDuck(d) {
    d.state = 'net';
    d.netT = 0.35;
    this.target = null;
    this.caught++;
    this.roundCaught++;
    this.results[d.i] = true;
    Sfx.pop();
    this.pop('¡RED!', d.x + 16, d.y - 10, NES.Y);
    this.renderHud();
  },

  roundEnd() {
    this.mode = 'toby';
    const laugh = this.roundMissed > 0;
    this.toby = { kind: laugh ? 'laugh' : 'show', n: this.roundCaught, t: 0 };
    if (laugh) Sfx.laugh(); else Sfx.coin();
    this.panel.innerHTML = `<div class="pt-msg">${laugh ? 'TOBY: ¡Je je je je!' : `TOBY: ¡Guau! ¡${this.roundCaught} de ${PATOS_PER_ROUND}!`}<br><span>${laugh ? '(Toby se ríe... pero con cariño.)' : '(Toby los suelta y salen volando felices.)'}</span></div>`;
    this.after(1.7, () => this.nextRound());
  },

  end() {
    this.mode = 'over';
    this.noPause = true;
    Music.stop();
    this.musicId = null;
    const d = Save.data;
    const a = d.arcade || (d.arcade = {});
    const key = this.turbo ? 'patos_turbo' : 'patos';
    const record = this.caught > (a[key] || 0);
    if (record) a[key] = this.caught;
    d.flags.nesDucks = (d.flags.nesDucks || 0) + this.caught;
    const pages = [`* ¡Se acabaron los patos!\n* Atrapaste ${this.caught} de ${PATOS_ROUNDS * PATOS_PER_ROUND}.${record ? ' ¡NUEVO RECORD!' : ''}`];
    const giveZapper = d.flags.nesDucks >= 20 && Quests.state('patos_toby') !== 'done';
    if (giveZapper) {
      d.treasures.zapper_dorada = true;
      pages.push('* TOBY: ¡Guau! ¡Ya van 20 patos en total!\n* Toma: mi PISTOLA DE LUZ DORADA. Ya no la uso, ahora soy de redes.');
    }
    if (!this.arcade) {
      if (this.caught >= PATOS_GOAL) pages.push(...this.finish());
      else pages.push(`* TOBY: ¡Casi! Necesitas ${PATOS_GOAL} patos para seguir.\n* ¡Otra vez! ¡Otra vez!`);
    }
    Save.write();
    if (giveZapper) Quests.complete('patos_toby');
    if (this.caught >= 25) Sfx.win(); else Sfx.text();
    this.say(pages, () => {
      const again = (turbo) => Game.go('patos', { enemyId: this.id, back: this.back, turbo, arcade: this.arcade });
      this.endMenuShow([
        { label: 'Otra vez', go: () => again(this.turbo) },
        { label: this.turbo ? 'Normal' : 'Turbo', go: () => again(!this.turbo) },
        { label: 'Salir', go: () => Game.go(this.back) },
      ]);
    }, 'TOBY');
  },

  // ---------- Bucle y dibujo ----------

  update(dt) {
    if (this.toby) this.toby.t += dt;
    if (this.mode !== 'round') return;
    this.spawnT -= dt;
    if (this.spawned < PATOS_PER_ROUND && this.spawnT <= 0) {
      this.spawn();
      this.spawnT = this.dur * 0.45;
    }
    this.ducks.forEach((d) => {
      if (d.state === 'fly') {
        d.t += dt;
        d.x = -40 + 720 * (d.t / this.dur);
        d.y = d.y0 + Math.sin(d.t * 5 + d.ph) * 26;
        if (d.t >= this.dur) {
          d.state = 'gone';
          this.results[d.i] = false;
          this.roundMissed++;
          if (this.target === d) this.target = null;
          this.renderHud();
        }
      } else if (d.state === 'net') {
        d.netT -= dt;
        if (d.netT <= 0) d.state = 'falling';
      } else if (d.state === 'falling') {
        d.fall += dt;
        d.y += (60 + d.fall * 300) * dt;
        if (d.y > 230) d.state = 'down';
      }
    });
    const busy = this.ducks.some((d) => d.state === 'fly' || d.state === 'net' || d.state === 'falling');
    if (this.spawned >= PATOS_PER_ROUND && !busy) this.roundEnd();
  },

  draw(dt) {
    const g = this.g;
    g.fillStyle = NES.U;
    g.fillRect(0, 0, 640, 300);
    // Nubes y arbustos: la misma forma, distinto color (como en el juego de 1985).
    [[70, 40], [300, 24], [500, 56]].forEach(([x, y]) => this.puff(x, y, NES.W));
    [[40, 212], [420, 212]].forEach(([x, y]) => this.puff(x, y, NES.L));
    // Árbol.
    g.fillStyle = NES.B;
    g.fillRect(560, 120, 18, 110);
    g.fillStyle = NES.G;
    g.beginPath();
    g.arc(569, 110, 44, 0, Math.PI * 2);
    g.fill();
    // Patos.
    const frame = Math.floor(performance.now() / 160) % 2;
    this.ducks.forEach((d) => {
      if (d.state === 'gone' || d.state === 'down') return;
      paintNes(g, d.state === 'fly' && frame ? PATO_VUELA : NES_ART.patoloco, d.x, d.y, 2);
      if (d.state === 'net' || d.state === 'falling') this.net(d.x, d.y);
      if (d.state === 'fly') this.label(d.text, d.x + 16, d.y - 8, { pos: d.pos, active: d === this.target });
    });
    // Toby sale del pasto: orgulloso con sus patos o muerto de risa.
    if (this.toby) {
      const up = Math.min(1, this.toby.t / 0.3);
      const ty = 236 - up * 52 + (this.toby.kind === 'laugh' ? Math.sin(this.toby.t * 30) * 3 : 0);
      paintTones(g, 'toby', 288, ty, 4);
      if (this.toby.kind === 'show') for (let i = 0; i < this.toby.n; i++) paintNes(g, NES_ART.patoloco, 250 + i * 40, ty - 26, 1.5);
      else {
        g.font = '12px "Press Start 2P", TQSym, monospace';
        g.fillStyle = NES.W;
        g.fillText('JE JE JE', 270, ty - 10);
      }
    }
    // Pasto alto por delante (Toby se esconde detrás).
    g.fillStyle = NES.G;
    g.fillRect(0, 236, 640, 64);
    g.fillStyle = NES.L;
    for (let x = 0; x < 640; x += 12) g.fillRect(x, 230 + ((x / 12) % 3) * 2, 6, 10);
    g.fillStyle = NES.B;
    g.fillRect(0, 286, 640, 14);
    this.drawPops(dt);
  },

  puff(x, y, color) {
    const g = this.g;
    g.fillStyle = color;
    [[0, 10, 16], [20, 0, 20], [44, 10, 16]].forEach(([dx, dy, r]) => {
      g.beginPath();
      g.arc(x + dx + 16, y + dy + 16, r, 0, Math.PI * 2);
      g.fill();
    });
  },

  net(x, y) {
    const g = this.g;
    g.strokeStyle = NES.W;
    g.lineWidth = 2;
    g.strokeRect(x - 2, y - 2, 36, 36);
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(x - 2 + i * 9, y - 2);
      g.lineTo(x - 2 + i * 9, y + 34);
      g.moveTo(x - 2, y - 2 + i * 9);
      g.lineTo(x + 34, y - 2 + i * 9);
      g.stroke();
    }
  },
});
