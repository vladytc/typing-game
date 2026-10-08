// El pueblo que se explora: caminar con flechas, hablar con ENTER y contestar escribiendo.

const TILE = 32;
const STEP_MS = 150;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEY_DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

Scenes.town = {
  music: 'town',
  p: null, // posición del jugador; se recuerda al volver de batallas o del museo

  enter({ from } = {}) {
    const m = TOWN;
    if (from && m.spawns[from]) {
      const [x, y, face] = m.spawns[from];
      this.p = { x, y, face };
    } else if (!this.p) {
      const [x, y, face] = m.spawns.start;
      this.p = { x, y, face };
    }
    Object.assign(this, { mode: 'walk', moving: false, held: null, ui: null, idleAt: performance.now(), heyShown: false, grace: 3 });

    Game.root.innerHTML = `
      <div class="town">
        <canvas class="tmap" width="640" height="480"></canvas>
        <div class="ents"></div>
        <div class="area-name">${esc(upper(m.name))}</div>
        <div class="town-keys">ENTER hablar · M misiones · V vitrina · E estadísticas · ESC título</div>
        <div class="tbox hidden"><div class="speaker hidden"></div><div class="tbody"></div></div>
      </div>`;
    this.paintMap();
    this.makeEntities();
    this.idleIv = setInterval(() => this.idleCheck(), 1000);
    window.onblur = () => { this.held = null; };

    if (!Save.data.flags.metBit) {
      this.later = setTimeout(() => this.run(async (ctx) => { await bitIntro(ctx); ctx.setFlag('metBit'); }), 500);
    }
  },

  exit() {
    clearInterval(this.idleIv);
    clearTimeout(this.stepT);
    clearTimeout(this.later);
    window.onblur = null;
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  // ---------- Mapa y personajes ----------

  tileAt(x, y) {
    const row = TOWN.map[y];
    return row && row[x] ? TILES[row[x]] : null;
  },

  paintMap() {
    const g = $('.tmap').getContext('2d');
    const colors = paletteColors();
    TOWN.map.forEach((row, y) => [...row].forEach((ch, x) => {
      paintSprite(g, 'grass', x * TILE, y * TILE, 2, colors);
      const t = TILES[ch];
      if (t && t.s !== 'grass') paintSprite(g, t.s, x * TILE, y * TILE, 2, colors);
    }));
  },

  makeEntities() {
    const layer = $('.ents');
    const mk = (props) => {
      const e = { ...props };
      e.el = document.createElement('div');
      e.el.className = `ent ${props.cls || ''}`;
      e.el.appendChild(spriteCanvas(props.sprite, props.big ? 3 : 2));
      layer.appendChild(e.el);
      return e;
    };
    this.npcs = TOWN.npcs.filter((n) => !n.when || n.when()).map((n) => mk({ ...n }));
    this.player = mk({ id: 'player', sprite: 'heroe', cls: 'player', x: this.p.x, y: this.p.y });
    // Bit aparece detrás del jugador (o en cualquier lado libre).
    const order = [OPPOSITE[this.p.face], 'down', 'up', 'left', 'right'];
    const spot = order.map((d) => [this.p.x + DIRS[d][0], this.p.y + DIRS[d][1]]).find(([x, y]) => this.free(x, y));
    const [bx, by] = spot || [this.p.x, this.p.y];
    this.bit = mk({ id: 'bit', sprite: 'bit', cls: 'bit', x: bx, y: by, talk: bitTalk });
    [...this.npcs, this.player, this.bit].forEach((e) => this.place(e, true));
    this.facePlayer();
  },

  place(e, instant = false) {
    const off = e.big ? -8 : 0;
    e.el.style.transition = instant ? 'none' : `transform ${STEP_MS}ms linear`;
    e.el.style.transform = `translate(${e.x * TILE + off}px, ${e.y * TILE + off * 2}px)`;
    e.el.style.zIndex = 10 + e.y;
  },

  facePlayer() {
    this.player.el.classList.toggle('flip', this.p.face === 'left');
  },

  entityAt(x, y) {
    return [...this.npcs, this.bit].find((e) => e.x === x && e.y === y);
  },

  free(x, y) {
    const t = this.tileAt(x, y);
    return !!t && !t.solid && !this.npcs.some((n) => n.x === x && n.y === y);
  },

  // ---------- Caminar ----------

  step(dir) {
    if (this.mode !== 'walk' || this.moving) return;
    this.p.face = dir;
    this.facePlayer();
    const nx = this.p.x + DIRS[dir][0];
    const ny = this.p.y + DIRS[dir][1];
    if (!this.free(nx, ny)) return;
    // Bit sigue al jugador ocupando su casilla anterior (y si estorba, cambian de lugar).
    Object.assign(this.bit, { x: this.p.x, y: this.p.y });
    Object.assign(this.p, { x: nx, y: ny });
    Object.assign(this.player, { x: nx, y: ny });
    this.place(this.player);
    this.place(this.bit);
    this.player.el.classList.add('walking');
    this.moving = true;
    this.stepT = setTimeout(() => {
      this.moving = false;
      this.player.el.classList.remove('walking');
      this.arrive();
    }, STEP_MS);
  },

  arrive() {
    const t = this.tileAt(this.p.x, this.p.y);
    if (this.grace > 0) this.grace--;
    if (t.warp === 'world') {
      Sfx.warp();
      this.p = null;
      this.enterFrom = 'world';
      this.mode = 'busy';
      this.player.el.classList.add('sink');
      this.later = setTimeout(() => Game.go('map'), 450);
      return;
    }
    if (t.warp === 'vitrina') {
      Sfx.confirm();
      const [x, y, face] = TOWN.spawns.vitrina;
      this.p = { x, y, face };
      Game.go('vitrina', { back: 'town' });
      return;
    }
    if (t.tall && !this.grace && Math.random() < 0.1) { this.wildEncounter(); return; }
    if (this.held) this.step(this.held);
  },

  // Guiño a Pokémon: en el pasto alto aparecen enemigos salvajes para practicar.
  wildEncounter() {
    const d = Save.data;
    const pool = ['pixelito', ...Object.keys(ENEMIES).filter((id) => d.done[id] && !ENEMIES[id].boss && !ENEMIES[id].mode)];
    const id = rand(pool);
    this.grace = 4;
    $('.town').classList.add('flash');
    this.run(async (ctx) => {
      await ctx.say([`* ¡Un ${upper(ENEMIES[id].name)} salvaje apareció!`]);
      Game.go('battle', { enemyId: id, back: 'town' });
    });
  },

  interact() {
    const [dx, dy] = DIRS[this.p.face];
    const x = this.p.x + dx;
    const y = this.p.y + dy;
    const ent = this.entityAt(x, y);
    if (ent && ent.talk) { this.run((ctx) => ent.talk(ctx)); return; }
    const t = this.tileAt(x, y);
    if (!t) return;
    const text = t.s === 'sign' ? TOWN.signs[`${x},${y}`] : t.look && TOWN.looks[t.look];
    if (text) this.run((ctx) => ctx.say([text]));
  },

  idleCheck() {
    if (this.mode !== 'walk' || this.heyShown) return;
    if (performance.now() - this.idleAt < 25000) return;
    // Guiño a Zelda: el compañero que no deja de decir "¡Oye! ¡Escucha!".
    this.heyShown = true;
    const b = document.createElement('div');
    b.className = 'tbubble';
    b.textContent = '¡Oye! ¡Escucha!';
    b.style.left = `${this.bit.x * TILE + 16}px`;
    b.style.top = `${this.bit.y * TILE - 30}px`;
    $('.town').appendChild(b);
    Sfx.text();
    setTimeout(() => b.remove(), 3000);
  },

  // ---------- Guiones de diálogo ----------

  run(script) {
    this.mode = 'script';
    this.held = null;
    const ctx = this.makeCtx();
    Promise.resolve(script(ctx)).finally(() => {
      if (Game.scene !== this) return;
      this.hideBox();
      this.mode = 'walk';
      this.idleAt = performance.now();
    });
  },

  showBox(speaker) {
    $('.tbox').classList.remove('hidden');
    const sp = $('.tbox .speaker');
    sp.textContent = speaker || '';
    sp.classList.toggle('hidden', !speaker);
    return $('.tbox .tbody');
  },

  hideBox() {
    $('.tbox').classList.add('hidden');
    this.ui = null;
  },

  makeCtx() {
    const flags = Save.data.flags;
    return {
      say: (pages, speaker) => new Promise((done) => {
        const body = this.showBox(speaker);
        body.innerHTML = '<div class="tb-text"></div>';
        this.ui = new Dialog($('.tb-text', body), pages, done);
      }),
      choose: (options, speaker) => new Promise((done) => {
        this.ui = new ChoicePrompt(this.showBox(speaker), options, done);
      }),
      challenge: (opts) => new Promise((done) => {
        this.ui = new TypingTask(this.showBox(), { ...opts, onDone: (res) => { Save.write(); done(res); } });
        this.ui.start();
      }),
      give: async (id) => {
        Save.data.treasures[id] = true;
        Save.write();
        Sfx.win();
        await new Promise((done) => {
          const body = this.showBox();
          body.innerHTML = '<div class="tb-text"></div>';
          this.ui = new Dialog($('.tb-text', body), [`* Recibiste: ${upper(TREASURES[id].name)}.\n* (Se guardó en tu vitrina.)`], done);
        });
      },
      flag: (k) => !!flags[k],
      setFlag: (k) => { flags[k] = true; Save.write(); },
      counter: (k) => { const n = flags[k] || 0; flags[k] = n + 1; Save.write(); return n; },
    };
  },

  // ---------- Teclas ----------

  onKey(e) {
    this.idleAt = performance.now();
    if (this.mode === 'script') { if (this.ui) this.ui.key(e); return; }
    if (this.mode !== 'walk') return;
    const dir = KEY_DIRS[e.key];
    if (dir) {
      this.held = dir;
      if (!e.repeat) this.step(dir);
      return;
    }
    if (isConfirm(e)) this.interact();
    else if (e.key === 'v' || e.key === 'V') Game.go('vitrina', { back: 'town' });
    else if (e.key === 'e' || e.key === 'E') Game.go('stats', { back: 'town' });
    else if (e.key === 'm' || e.key === 'M') Game.go('diario', { back: 'town' });
    else if (e.key === 'Escape') Game.go('title');
  },

  onKeyUp(e) {
    if (KEY_DIRS[e.key] === this.held) this.held = null;
  },
};
