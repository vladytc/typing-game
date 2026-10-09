// MINIJEFE B — LA MAZMORRA DE LLAVES y TRAGABOMBAS (guiño a The Legend of Zelda, 1986). Castillo 2.
// Una mazmorra vista desde arriba. Te mueves entre cuartos con las flechas; ENTER revisa.
// Las puertas cerradas se abren escribiendo una "llave": una frase con mayúscula y punto final.
// En tres cofres hay tres llaves (cada una es un reto de 3 frases). La puerta de madera es más
// fácil si tienes la Espada de madera del Anciano. Al fondo espera Tragabombas (combate normal).
//
//   [Entrada] - [Ladrillines] - [Llave 1]
//       |             |
//   [Llave 2] - [Puerta triple] - [Llave 3]
//                     |
//              [TRAGABOMBAS]

const MZ_ROOMS = {
  '0,0': { name: 'Entrada', sign: '* Un letrero viejo:\n* "Es peligroso ir solo."\n* ...Menos mal que vienes con Bit.' },
  '1,0': { name: 'Cuarto de los Ladrillines', guards: true, sign: '* Un letrero: ↑↑↓↓←→←→BA\n* "Este código daba 30 vidas en un juego de 1988.\n* Aquí da galletas. Es lo que hay."' },
  '2,0': { name: 'Cuarto del cofre', key: 1 },
  '0,1': { name: 'Cuarto del cofre', key: 2, sign: '* Un letrero: "En Japón este castillo era rojo con blanco y nació en 1983."\n* (Se llamaba Famicom.)' },
  '1,1': { name: 'Puerta triple' },
  '2,1': { name: 'Cuarto del cofre', key: 3, gold: true },
  '1,2': { name: 'Guarida de Tragabombas', boss: true },
};
// Conexiones entre cuartos. lock: 'frase' (una frase llave), 'madera' (espada) o 'triple' (3 llaves).
const MZ_DOORS = [
  { a: '0,0', b: '1,0', lock: 'frase' },
  { a: '1,0', b: '2,0' },
  { a: '0,0', b: '0,1', lock: 'madera' },
  { a: '1,0', b: '1,1' },
  { a: '0,1', b: '1,1', lock: 'frase' },
  { a: '1,1', b: '2,1', lock: 'frase' },
  { a: '1,1', b: '1,2', lock: 'triple' },
];
const MZ_DOOR_PHRASES = ['La puerta se abre.', 'Abro con cuidado.', 'Paso sin hacer ruido.', 'Bit ilumina la puerta.', 'Toco tres veces.'];
const MZ_KEY_PHRASES = ['La llave brilla en el cofre.', 'Mi espada es de madera.', 'El mapa marca un tesoro.',
  'Bit ilumina el pasillo oscuro.', 'Toby espera fuera del castillo.', 'La mazmorra tiene muchos cuartos.',
  'Nunca vayas solo al castillo.', 'El cofre se abre despacio.', 'Una bomba rompe la pared.',
  'Los ladrillos guardan secretos.', 'Kongo toca el tambor.', 'Tragabombas come bombas todo el día.',
  'El héroe no tiene nombre.', 'Don Chip cuida su museo.'];
const MZ_DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };

const mzKey = (x, y) => `${x},${y}`;
const mzXY = (k) => k.split(',').map(Number);
const mzDoorId = (d) => `${d.a}|${d.b}`;
function mzDoorBetween(a, b) { return MZ_DOORS.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a)); }

Scenes.mazmorra = nesScene({
  enter({ enemyId, back = 'map' } = {}) {
    const fresh = !!enemyId || !this.run;
    if (fresh) {
      Object.assign(this, { id: enemyId || 'mazmorra', back });
      const hpMax = playerMaxHp();
      this.run = { room: '0,0', visited: { '0,0': true }, open: {}, keys: {}, guards: true, gold: false, hp: hpMax, hpMax, bossAt: 0 };
    }
    this.backParams = undefined;
    this.mount('mz-scene', '<div class="mz-hud"></div>');
    Object.assign(this, { mode: 'explore', endMenu: null, pauseMenu: null, bumpT: 0, flashT: 0 });
    this.playMusic('mazmorra');
    this.renderHud();
    if (fresh) {
      this.say([
        '* ¡El Castillo 2 es una MAZMORRA!\n* Muévete con las flechas. ENTER revisa lo que hay en el cuarto.',
        '* Las puertas cerradas se abren escribiendo una LLAVE:\n* una frase con MAYUSCULA y punto final.',
        '* Tres cofres guardan tres llaves. Al fondo... algo ronca y huele a pólvora.',
      ], () => this.explore(), 'BIT');
      return;
    }
    // Volvimos del combate con Tragabombas: ¿ganamos?
    const last = Save.data.stats.battles[Save.data.stats.battles.length - 1];
    if (this.run.bossAt && last && last.enemy === 'tragabombas' && last.date >= this.run.bossAt) { this.complete(); return; }
    this.run.room = '1,1';
    this.run.hp = this.run.hpMax;
    this.say(['* ¡PUAJ! Tragabombas te sacó de su cuarto de un eructo.\n* Recuperas el aliento. Puedes volver a intentarlo.'], () => this.explore());
  },

  get room() { return MZ_ROOMS[this.run.room]; },

  renderHud() {
    const hud = $('.mz-hud');
    if (!hud) return;
    const keys = [1, 2, 3].map((n) => (this.run.keys[n] ? '♦' : '◇')).join('');
    hud.innerHTML = `${nesBar('HP', this.run.hp, this.run.hpMax)}<span>LLAVES ${keys}</span><span>${esc(upper(MZ_ROOMS[this.run.room].name))}</span>`;
  },

  // Texto del panel mientras exploras: qué hay en el cuarto.
  explore() {
    this.mode = 'explore';
    const r = MZ_ROOMS[this.run.room];
    const run = this.run;
    let what = '';
    if (r.guards && run.guards) what = '¡Unos Ladrillines bloquean el paso! (ENTER para enfrentarlos)';
    else if (r.key && !run.keys[r.key]) what = 'Hay un cofre cerrado. (ENTER para abrirlo)';
    else if (r.gold && !run.gold) what = 'Algo dorado brilla en el piso... (ENTER)';
    else if (r.sign) what = 'Hay un letrero. (ENTER para leerlo)';
    else if (this.run.room === '1,1') what = 'Una puerta enorme con TRES cerraduras, abajo.';
    this.panel.innerHTML = `<div class="mz-msg"><b>${esc(upper(r.name))}</b><br>${esc(what)}<br><span>↑ ↓ ← → moverse · ENTER revisar · ESC pausa</span></div>`;
    this.renderHud();
  },

  onKey(e) {
    if (!this.pauseMenu && !this.ui && !this.endMenu && this.mode === 'explore') {
      if (MZ_DIRS[e.key]) { this.move(MZ_DIRS[e.key]); return; }
      if (isConfirm(e)) { this.interact(); return; }
    }
    this.routeKey(e);
  },

  move([dx, dy]) {
    const [x, y] = mzXY(this.run.room);
    const target = mzKey(x + dx, y + dy);
    const door = MZ_ROOMS[target] && mzDoorBetween(this.run.room, target);
    if (!door) { Sfx.bump(); this.bumpT = 0.2; return; }
    if (this.room.guards && this.run.guards && target !== '0,0') {
      Sfx.bump();
      this.say(['* ¡Los Ladrillines se ponen enfrente de la puerta!\n* "¡No pasarás! ...Bueno, a menos que nos asustes."'], () => this.explore());
      return;
    }
    if (door.lock && !this.run.open[mzDoorId(door)]) { this.unlock(door); return; }
    this.goTo(target);
  },

  goTo(target) {
    this.run.room = target;
    this.run.visited[target] = true;
    Sfx.warp();
    this.flashT = 0.25;
    if (MZ_ROOMS[target].boss) { this.boss(); return; }
    this.explore();
  },

  hurt(n) {
    this.run.hp = Math.max(0, this.run.hp - scaledDmg(n));
    Sfx.hurt();
    this.renderHud();
    if (this.run.hp > 0) return false;
    this.mode = 'over';
    Music.stop();
    Sfx.lose();
    this.after(0.8, () => { this.run = null; Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'mazmorra' }); });
    return true;
  },

  open(door) {
    this.run.open[mzDoorId(door)] = true;
    Sfx.secret();
  },

  unlock(door) {
    if (door.lock === 'triple') {
      const n = Object.keys(this.run.keys).length;
      if (n < 3) {
        this.say([`* Una puerta con TRES cerraduras.\n* Tienes ${n} de 3 llaves. Búscalas en los cofres.`], () => this.explore());
        return;
      }
      this.say(['* ¡Tienes las tres llaves! Escribe la frase para girarlas.'], () => this.doorTask(door, 'Tres llaves, tres cerraduras.'));
      return;
    }
    if (door.lock === 'madera') {
      const sword = !!Save.data.treasures.espada;
      this.say([sword
        ? '* Una puerta de madera vieja.\n* ¡Tu ESPADA DE MADERA puede cortarla! (Frase corta.)'
        : '* Una puerta de madera muy pesada.\n* (Con una espada sería más fácil... el Anciano del pueblo regala una.)'],
      () => this.doorTask(door, sword ? 'Corto la madera.' : 'Empujo la puerta de madera con fuerza.'));
      return;
    }
    this.doorTask(door, rand(MZ_DOOR_PHRASES));
  },

  doorTask(door, phrase) {
    this.task({
      label: 'PUERTA CERRADA: escribe la llave (con mayúscula y punto)',
      texts: [phrase],
      timeLimit: phrase.length * 650 + 3000,
      onDone: (res) => {
        if (res.completed) {
          this.open(door);
          this.say(['* ¡CLIC! La puerta se abrió.'], () => this.goTo(door.a === this.run.room ? door.b : door.a));
          return;
        }
        if (this.hurt(2)) return;
        this.say(['* La puerta no se movió. ¡Inténtalo otra vez!'], () => this.explore());
      },
    });
  },

  interact() {
    const r = this.room;
    const run = this.run;
    if (r.guards && run.guards) { this.guards(); return; }
    if (r.key && !run.keys[r.key]) { this.chest(r.key); return; }
    if (r.gold && !run.gold) { this.goldCart(); return; }
    if (r.sign) { this.say([r.sign], () => this.explore()); return; }
    this.say(['* No hay nada más aquí. Solo ladrillos y eco.'], () => this.explore());
  },

  guards() {
    const words = pickWords(ENEMIES.ladrillin.words, 4);
    this.task({
      label: '¡ASUSTA A LOS LADRILLINES! (con mayúsculas)',
      texts: words,
      timeLimit: words.join('').length * 600 + 2500,
      onDone: (res) => {
        if (res.completed) {
          this.run.guards = false;
          Sfx.stomp();
          this.say(['* ¡Los Ladrillines huyen rodando!\n* "¡Está bien, está bien! ¡Pasa!"'], () => this.explore());
          return;
        }
        if (this.hurt(3)) return;
        this.say(['* ¡Un Ladrillín te pisó el pie!\n* (ENTER para intentarlo otra vez.)'], () => this.explore());
      },
    });
  },

  chest(n) {
    const phrases = pickWords(MZ_KEY_PHRASES, 3);
    this.task({
      label: 'COFRE: escribe las 3 frases para sacar la llave',
      texts: phrases,
      timeLimit: phrases.join('').length * 600 + 4000,
      onDone: (res) => {
        if (res.completed) {
          this.run.keys[n] = true;
          Save.data.flags[`nesKey${n}`] = true;
          Save.write();
          Quests.start('tres_llaves');
          Sfx.secret();
          this.renderHud();
          const left = 3 - Object.keys(this.run.keys).length;
          this.say([`* ¡Encontraste una LLAVE!\n* ${left ? `Te faltan ${left}.` : '¡Ya tienes las tres! La puerta triple te espera.'}`], () => this.explore());
          return;
        }
        if (this.hurt(2)) return;
        this.say(['* ¡El cofre se cerró de golpe! Casi te muerde.\n* (ENTER para intentarlo otra vez.)'], () => this.explore());
      },
    });
  },

  goldCart() {
    this.run.gold = true;
    const d = Save.data;
    const first = !d.treasures.cartucho_dorado;
    d.treasures.cartucho_dorado = true;
    Save.write();
    Sfx.coin();
    this.say([
      '* ¡Un CARTUCHO DORADO brilla en el piso!',
      '* Los cartuchos dorados guardaban tu partida con una pila.\n* ¡Era magia!',
      first ? '* (Se guardó en tu vitrina.)' : '* (Ya tienes uno en la vitrina. Este lo dejas para el siguiente aventurero.)',
    ], () => this.explore());
  },

  boss() {
    this.mode = 'boss';
    this.say([
      '* Una sombra enorme se mueve en la oscuridad...\n* Huele a pólvora y a zanahoria.',
      '* "¿Tienes bombas? ¡Me encantan las bombas!"',
    ], () => {
      this.run.bossAt = Date.now();
      Game.go('battle', { enemyId: 'tragabombas', back: 'mazmorra' });
    });
  },

  complete() {
    this.mode = 'win';
    this.noPause = true;
    this.playMusic('victory');
    this.musicId = null;
    this.run.room = '1,2';
    this.paje = true;
    this.say(PAJE_LINES[2], () => {
      this.paje = false;
      const pages = this.finish();
      this.run = null;
      this.say(['* ¡Saliste de la Mazmorra de Llaves!', ...pages], () => Game.go(this.back));
    }, 'HONGO-PAJE');
  },

  // ---------- Dibujo ----------

  update(dt) {
    this.bumpT = Math.max(0, this.bumpT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
  },

  draw(dt) {
    const g = this.g;
    if (!this.run) { g.fillStyle = NES.K; g.fillRect(0, 0, 640, 300); return; }
    const run = this.run;
    const r = MZ_ROOMS[run.room];
    const shake = this.bumpT > 0 ? Math.sin(this.bumpT * 80) * 3 : 0;
    g.save();
    g.translate(shake, 0);
    // Muros de ladrillo y piso de baldosas.
    g.fillStyle = NES.O;
    g.fillRect(0, 0, 640, 300);
    g.fillStyle = NES.K;
    for (let y = 0; y < 300; y += 12) {
      g.fillRect(0, y + 10, 640, 2);
      for (let x = (y / 12) % 2 ? 0 : 12; x < 640; x += 24) g.fillRect(x, y, 2, 10);
    }
    g.fillStyle = NES.K;
    g.fillRect(48, 40, 544, 220);
    g.fillStyle = NES.D;
    for (let y = 44; y < 256; y += 24) for (let x = 52; x < 588; x += 24) g.fillRect(x, y, 20, 20);
    g.fillStyle = NES.K;
    for (let y = 44; y < 256; y += 24) for (let x = 52; x < 588; x += 24) g.fillRect(x + 4, y + 4, 12, 12);
    // Puertas.
    const [x, y] = mzXY(run.room);
    [[0, -1, 'top'], [0, 1, 'bottom'], [-1, 0, 'left'], [1, 0, 'right']].forEach(([dx, dy, side]) => {
      const door = mzDoorBetween(run.room, mzKey(x + dx, y + dy));
      if (door) this.door(side, door.lock && !run.open[mzDoorId(door)] ? door.lock : null);
    });
    // Cosas del cuarto.
    if (r.sign) this.sign(90, 70);
    if (r.key) this.chestAt(300, 70, !!run.keys[r.key]);
    if (r.gold && !run.gold) paintNes(g, NES_SPRITES.sprites.cartucho_dorado.map((row) => row.replace(/[bcd]/g, (c) => ({ b: 'W', c: 'Y', d: 'K' }[c]))), 500, 190 + Math.sin(performance.now() / 200) * 3, 2);
    if (r.guards && run.guards) [200, 300, 400].forEach((gx, i) => paintNes(g, NES_ART.ladrillin, gx, 90 + Math.sin(performance.now() / 150 + i) * 3, 3));
    if (r.boss) paintNes(g, NES_ART.tragabombas, 272, 70, 6);
    // Héroe en el centro.
    paintTones(g, 'heroe', 304, 168, 2);
    g.restore();
    // Minimapa (con el Mapa de la mazmorra se ven todos los cuartos).
    const hasMap = !!Save.data.treasures.mapa_mazmorra;
    Object.keys(MZ_ROOMS).forEach((k) => {
      const [mx, my] = mzXY(k);
      if (!run.visited[k] && !hasMap) return;
      g.fillStyle = k === run.room ? NES.Y : run.visited[k] ? NES.W : NES.D;
      g.fillRect(560 + mx * 22, 6 + my * 10, 18, 7);
    });
    if (this.flashT > 0) { g.fillStyle = `rgba(0,0,0,${this.flashT * 4})`; g.fillRect(0, 0, 640, 300); }
    this.drawPops(dt);
  },

  door(side, lock) {
    const g = this.g;
    const rect = { top: [296, 0, 48, 44], bottom: [296, 256, 48, 44], left: [0, 126, 52, 48], right: [588, 126, 52, 48] }[side];
    const [x, y, w, h] = rect;
    g.fillStyle = NES.K;
    g.fillRect(x, y, w, h);
    if (!lock) return;
    g.fillStyle = lock === 'madera' ? NES.B : lock === 'triple' ? NES.Y : NES.W;
    g.fillRect(x + 4, y + 4, w - 8, h - 8);
    g.fillStyle = NES.K;
    if (lock === 'triple') {
      const keys = Object.keys(this.run.keys).length;
      for (let i = 0; i < 3; i++) {
        g.fillStyle = i < keys ? NES.O : NES.K;
        g.fillRect(x + 10 + i * 11, y + h / 2 - 4, 6, 9);
      }
    } else if (lock === 'madera') {
      g.fillRect(x + 4, y + h / 2 - 1, w - 8, 2);
      g.fillRect(x + w / 2 - 1, y + 4, 2, h - 8);
    } else {
      g.fillRect(x + w / 2 - 3, y + h / 2 - 6, 6, 6);
      g.fillRect(x + w / 2 - 1, y + h / 2, 2, 6);
    }
  },

  chestAt(x, y, opened) {
    const g = this.g;
    g.fillStyle = NES.B;
    g.fillRect(x, y + (opened ? 8 : 0), 40, opened ? 22 : 30);
    g.fillStyle = NES.Y;
    g.fillRect(x, y + 12, 40, 4);
    g.fillRect(x + 17, y + 10, 6, 10);
    if (opened) { g.fillStyle = NES.K; g.fillRect(x + 4, y + 8, 32, 4); }
  },

  sign(x, y) {
    const g = this.g;
    g.fillStyle = NES.B;
    g.fillRect(x + 14, y + 20, 6, 20);
    g.fillStyle = NES.Y;
    g.fillRect(x, y, 34, 22);
    g.fillStyle = NES.K;
    for (let i = 0; i < 3; i++) g.fillRect(x + 5, y + 5 + i * 5, 24, 2);
  },
});
