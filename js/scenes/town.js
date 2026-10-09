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
    const pipe = from && from.startsWith('pipe:') && WORLDS.find((w) => `pipe:${w.id}` === from);
    if (pipe) {
      const [px, py] = PIPE_SLOTS[pipe.order - 1];
      this.p = { x: px, y: py + 1, face: 'down' };
    } else if (from && m.spawns[from]) {
      const [x, y, face] = m.spawns[from];
      this.p = { x, y, face };
    } else if (!this.p) {
      const [x, y, face] = m.spawns.start;
      this.p = { x, y, face };
    }
    Object.assign(this, { mode: 'walk', moving: false, held: null, ui: null, idleAt: performance.now(), heyShown: false, grace: 3 });
    // Era del pueblo: si cambió desde la última visita, primero se ve la anterior y luego viaja en el tiempo.
    const era = hubEra();
    const lastEra = Save.data.flags.hubEra || 'gb';
    const warp = era !== lastEra && Save.data.flags.metBit;
    this.era = warp ? lastEra : era;
    document.body.className = HUB_ERAS[this.era].theme;

    Game.root.innerHTML = `
      <div class="town era-${this.era}">
        <canvas class="tmap" width="640" height="480"></canvas>
        <div class="ents"></div>
        <div class="area-name">${esc(upper(m.name))}<span>${HUB_ERAS[era].label}</span></div>
        <div class="town-keys">ENTER hablar · M misiones · V vitrina · E estadísticas · ESC título</div>
        <div class="tbox hidden"><div class="speaker hidden"></div><div class="tbody"></div></div>
      </div>`;
    this.paintMap();
    this.makeEntities();
    this.idleIv = setInterval(() => this.idleCheck(), 1000);
    window.onblur = () => { this.held = null; };

    if (!Save.data.flags.metBit) {
      Save.data.flags.hubEra = era;
      this.later = setTimeout(() => this.run(async (ctx) => { await bitIntro(ctx); ctx.setFlag('metBit'); }), 500);
      return;
    }
    // ¿Se abrió un mundo nuevo desde la última visita?
    const fresh = WORLDS.find((w) => w.requires && worldUnlocked(w) && !Save.data.flags[`pipe_${w.id}`]);
    if (!warp && !fresh) return;
    this.later = setTimeout(() => this.run(async (ctx) => {
      if (warp) await this.timeWarp(ctx, era);
      if (fresh) {
        ctx.setFlag(`pipe_${fresh.id}`);
        await announcePipe(ctx, fresh);
        if (QUESTS[`mundo_${fresh.id}`]) Quests.start(`mundo_${fresh.id}`);
      }
    }), 600);
  },

  // Cinemática: la pantalla se distorsiona, el pueblo cambia a la nueva era y Bit lo comenta.
  async timeWarp(ctx, era) {
    const town = $('.town');
    Sfx.warp();
    town.classList.add('warp-out');
    await new Promise((r) => setTimeout(r, 900));
    this.era = era;
    Save.data.flags.hubEra = era;
    Save.write();
    document.body.className = HUB_ERAS[era].theme;
    town.className = `town era-${era} warp-in`;
    this.paintMap();
    this.repaintEntities();
    Sfx.secret();
    await new Promise((r) => setTimeout(r, 900));
    town.classList.remove('warp-in');
    const lines = [...(ERA_CHANGE_LINES[era] || ['* ¡El pueblo viajó en el tiempo!'])];
    await ctx.say(lines, 'BIT');
    if (this.npcs.some((n) => n.era && n.era !== era)) await ctx.say([NATIVE_LOOK_LINE]);
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
    if (!row || !row[x]) return null;
    if (row[x] === 'P') return pipeWorldAt(x, y) ? TILES.P : TILES['.'];
    return TILES[row[x]];
  },

  // Cada casilla con la paleta de la era actual (como las paletas por zona de la NES).
  paintMap() {
    const g = $('.tmap').getContext('2d');
    const era = this.era;
    const shadows = HUB_ERAS[era].shadows;
    TOWN.map.forEach((row, y) => [...row].forEach((ch, x) => {
      paintSprite(g, 'grass', x * TILE, y * TILE, 2, tileColors(era, 'grass'));
      const t = this.tileAt(x, y);
      if (!t || t.s === 'grass') return;
      if (shadows && (t.s === 'tree' || t.s === 'sign')) {
        g.fillStyle = 'rgba(26, 26, 46, 0.28)';
        g.beginPath();
        g.ellipse(x * TILE + 18, y * TILE + 29, 13, 4, 0, 0, Math.PI * 2);
        g.fill();
      }
      paintSprite(g, t.s, x * TILE, y * TILE, 2, tileColors(era, t.s));
    }));
  },

  // Personajes del pueblo viajan en el tiempo; los amigos rescatados se quedan en su era.
  entityCanvas(e) {
    return spriteCanvas(e.sprite, e.big ? 3 : 2, false, '', charColors(e.sprite, e.era || this.era));
  },

  repaintEntities() {
    [...this.npcs, this.player, this.bit].forEach((e) => {
      e.el.replaceChild(this.entityCanvas(e), e.el.querySelector('canvas'));
    });
  },

  makeEntities() {
    const layer = $('.ents');
    const mk = (props) => {
      const e = { ...props };
      e.el = document.createElement('div');
      e.el.className = `ent ${props.cls || ''} ${props.era ? `native-${props.era}` : ''}`;
      e.el.appendChild(this.entityCanvas(e));
      layer.appendChild(e.el);
      return e;
    };
    // Los amigos rescatados (id 'f-<enemigo>') conservan la estética de su mundo.
    this.npcs = TOWN.npcs.filter((n) => !n.when || n.when())
      .map((n) => mk({ ...n, era: n.era || (n.id.startsWith('f-') && ENEMIES[n.id.slice(2)] ? eraOfEnemy(n.id.slice(2)) : undefined) }));
    // Amigos de otros mundos que llegan solos: enemigos perdonados con `home: [x, y]`.
    Object.entries(ENEMIES).forEach(([id, def]) => {
      if (!def.home || !Save.data.spared[id] || this.npcs.some((n) => n.id === `f-${id}`)) return;
      const [x, y] = def.home;
      const line = def.townLine || `* ¡Hola! Ahora vivo en el pueblo.`;
      this.npcs.push(mk({
        id: `f-${id}`, sprite: def.sprite, x, y, era: eraOfEnemy(id),
        talk: (ctx) => ctx.say([line], upper(def.name)),
      }));
    });
    this.player = mk({ id: 'player', sprite: 'heroe', cls: 'player', x: this.p.x, y: this.p.y });
    // Bit aparece detrás del jugador (o en cualquier lado libre).
    const order = [OPPOSITE[this.p.face], 'down', 'up', 'left', 'right'];
    const spot = order.map((d) => [this.p.x + DIRS[d][0], this.p.y + DIRS[d][1]]).find(([x, y]) => this.free(x, y) && !this.tileAt(x, y).warp);
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
      const w = pipeWorldAt(this.p.x, this.p.y);
      Sfx.warp();
      this.mode = 'busy';
      this.player.el.classList.add('sink');
      this.later = setTimeout(() => Game.go('map', { world: w.id }), 450);
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
