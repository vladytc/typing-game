// Motor de mapas que se exploran caminando: el Pueblo Vitrina y las zonas de cada mundo.
// Caminar con flechas, hablar con ENTER y contestar escribiendo.
// Los mapas viven en MAPS (js/data.js); el esquema está en docs/MUNDOS.md, "Zonas explorables".
//
//   Game.go('town')                                       se queda en el mapa y lugar de siempre
//   Game.go('town', { map: 'gb-valle', spawn: [x, y, 'up'] })   va a otro mapa
//   Game.go('town', { from: 'pipe:gb' })                  al pueblo, junto a la tubería de un mundo

const TILE = 32;
const STEP_MS = 150;
const VIEW_W = 640;
const VIEW_H = 480;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEY_DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const townWait = (ms) => new Promise((r) => setTimeout(r, ms));

// Variante activa de un mapa: la última cuyo `when()` se cumple (o ninguna).
function mapVariant(m) {
  return (m.variants || []).filter((v) => v.when()).pop() || null;
}

// Lo que un mapa y su variante juntan: regiones, letreros y casas de los personajes.
//   regions: [{ x0, y0, x1, y1, era, name }]  pedazos del mapa pintados con la paleta de otra era
//   homes:   { idPersonaje: [x, y] } (o una función (variante) => {...}): dónde se para cada quien
function mapExtras(m, v) {
  const val = (x) => (typeof x === 'function' ? x(v) : x);
  return {
    regions: [...(val(m.regions) || []), ...((v && val(v.regions)) || [])],
    signs: { ...(val(m.signs) || {}), ...((v && val(v.signs)) || {}) },
    homes: { ...(val(m.homes) || {}), ...((v && val(v.homes)) || {}) },
  };
}

Scenes.town = {
  music: 'town',
  mapId: null,
  p: null, // posición del jugador; es la misma que se guarda en Save.data.pos

  enter({ map, spawn, from } = {}) {
    // ¿En qué mapa? El que piden, o el pueblo si vienes de una tubería, o donde te quedaste.
    const pos = Save.data.pos;
    const toPipe = from && from.startsWith('pipe:');
    const id = (map && MAPS[map] && map) || (toPipe && 'pueblo') || (pos && MAPS[pos.map] && pos.map) || 'pueblo';
    const m = MAPS[id];
    const pueblo = id === 'pueblo';
    const pipe = pueblo && toPipe && WORLDS.find((w) => `pipe:${w.id}` === from);
    const spawns = m.spawns || {};
    let p;
    if (spawn) p = spawn;
    else if (pipe) { const [px, py] = PIPE_SLOTS[pipe.order - 1]; p = [px, py + 1, 'down']; }
    else if (from && spawns[from]) p = spawns[from];
    else if (pos && pos.map === id) p = [pos.x, pos.y, pos.face];
    else p = spawns.start || [1, 1, 'down'];
    this.p = { x: p[0], y: p[1], face: p[2] || 'down' };

    Object.assign(this, { mapId: id, m, pueblo, mode: 'walk', moving: false, held: null, ui: null, idleAt: performance.now(), heyShown: false, grace: 3 });
    const variant = mapVariant(m);
    this.rows = variant ? variant.map : m.map;
    this.variant = variant;
    Object.assign(this, mapExtras(m, variant));
    this.regionNow = this.regionAt(this.p.x, this.p.y);
    this.tiles = { ...TILES, ...(m.tiles || {}) };
    this.W = Math.max(...this.rows.map((r) => r.length));
    this.H = this.rows.length;
    this.music = m.music || (pueblo ? 'town' : 'title');
    this.savePos();
    Save.write();

    // Era / paleta. En el pueblo: si cambió desde la última visita, primero se ve la anterior y luego viaja en el tiempo.
    let era;
    let warp = false;
    let label;
    const world = WORLDS.find((w) => w.id === m.world);
    if (pueblo) {
      era = hubEra();
      const lastEra = Save.data.flags.hubEra || 'gb';
      warp = era !== lastEra && Save.data.flags.metBit;
      this.era = warp ? lastEra : era;
      document.body.className = HUB_ERAS[this.era].theme;
      label = HUB_ERAS[era].label;
    } else {
      this.era = m.theme || (world && world.theme) || 'gb';
      document.body.className = `theme-${this.era}`;
      label = world ? (upper(m.name) === upper(world.name) ? `MUNDO ${world.order}` : `MUNDO ${world.order} · ${upper(world.name)}`) : '';
    }
    this.css = paletteColors();

    Game.root.innerHTML = `
      <div class="town era-${this.era}">
        <div class="tworld" style="width:${this.W * TILE}px;height:${this.H * TILE}px">
          <canvas class="tmap" width="${this.W * TILE}" height="${this.H * TILE}"></canvas>
          <div class="ents"></div>
        </div>
        <div class="area-name">${esc(upper(m.name))}<span>${esc(label)}</span></div>
        <div class="town-keys">ENTER hablar · M misiones · V vitrina · E estadísticas · ESC ${pueblo ? 'título' : 'menú'}</div>
        <div class="tbox hidden"><div class="speaker hidden"></div><div class="tbody"></div></div>
      </div>`;
    this.paintMap();
    this.makeEntities();
    this.camera(true);
    this.idleIv = setInterval(() => this.idleCheck(), 1000);
    window.onblur = () => { this.held = null; };

    if (!pueblo) {
      // Zona de un mundo: `intro` (páginas o función async (ctx)) se dice la primera vez que entras.
      if (m.intro && !Save.data.flags[`intro_${id}`]) {
        this.later = setTimeout(() => this.run(async (ctx) => {
          ctx.setFlag(`intro_${id}`);
          if (typeof m.intro === 'function') await m.intro(ctx);
          else await ctx.say([].concat(m.intro), 'BIT');
        }), 600);
      }
      return;
    }
    if (!Save.data.flags.metBit) {
      Save.data.flags.hubEra = era;
      this.later = setTimeout(() => this.run(async (ctx) => { await bitIntro(ctx); ctx.setFlag('metBit'); }), 500);
      return;
    }
    // ¿Se abrió un mundo nuevo desde la última visita? ¿Creció el pueblo (variante con `announce`)?
    const fresh = WORLDS.find((w) => w.requires && worldUnlocked(w) && !Save.data.flags[`pipe_${w.id}`]);
    const news = variant && variant.id && variant.announce && !Save.data.flags[`variant_${variant.id}`] ? variant : null;
    if (!warp && !fresh && !news) return;
    this.later = setTimeout(() => this.run(async (ctx) => {
      if (warp) await this.timeWarp(ctx, era);
      if (fresh) {
        ctx.setFlag(`pipe_${fresh.id}`);
        await announcePipe(ctx, fresh);
        if (QUESTS[`mundo_${fresh.id}`]) Quests.start(`mundo_${fresh.id}`);
      }
      if (news) {
        ctx.setFlag(`variant_${news.id}`);
        Sfx.secret();
        await ctx.say([].concat(typeof news.announce === 'function' ? news.announce() : news.announce), 'BIT');
      }
    }), 600);
  },

  // Cinemática: la pantalla se distorsiona, el pueblo cambia a la nueva era y Bit lo comenta.
  async timeWarp(ctx, era) {
    const town = $('.town');
    Sfx.warp();
    town.classList.add('warp-out');
    await townWait(900);
    this.era = era;
    Save.data.flags.hubEra = era;
    Save.write();
    document.body.className = HUB_ERAS[era].theme;
    this.css = paletteColors();
    town.className = `town era-${era} warp-in`;
    this.paintMap();
    this.repaintEntities();
    Sfx.secret();
    await townWait(900);
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
    Save.write();
  },

  savePos() {
    Save.data.pos = { map: this.mapId, x: this.p.x, y: this.p.y, face: this.p.face };
  },

  // ---------- Mapa y personajes ----------

  tileAt(x, y) {
    const row = this.rows[y];
    if (!row || !row[x]) return null;
    // Plaza de las Tuberías: sin mundo abierto, ahí solo hay pasto (¡nada de spoilers!).
    if (this.pueblo && row[x] === 'P') return pipeWorldAt(x, y) ? TILES.P : TILES['.'];
    return this.tiles[row[x]] || null;
  },

  // Región (barrio) en una casilla: la última de la lista que la contiene.
  regionAt(x, y) {
    return (this.regions || []).filter((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1).pop() || null;
  },

  regionEra(x, y) {
    const r = this.regionAt(x, y);
    return r && eraDef(r.era) ? r.era : null;
  },

  // Colores de una casilla: los de la era (como las paletas por zona de la NES) o los del tema del mundo.
  // `era` = la de su región, si está en un barrio de otra era.
  tileCols(sprite, t, era) {
    if (t && t.colors) return t.colors;
    if (era) return tileColors(era, sprite);
    return HUB_ERAS[this.era] ? tileColors(this.era, sprite) : this.css;
  },

  paintMap() {
    const g = $('.tmap').getContext('2d');
    const ground = this.m.ground || 'grass';
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const t = this.tileAt(x, y);
        const era = this.regionEra(x, y);
        const def = eraDef(era || this.era);
        const shadows = def && def.shadows;
        const under = (t && t.under) || ground;
        paintSprite(g, under, x * TILE, y * TILE, 2, this.tileCols(under, null, era));
        if (!t || t.s === under) continue;
        if (shadows && (t.s === 'tree' || t.s === 'sign')) {
          g.fillStyle = 'rgba(26, 26, 46, 0.28)';
          g.beginPath();
          g.ellipse(x * TILE + 18, y * TILE + 29, 13, 4, 0, 0, Math.PI * 2);
          g.fill();
        }
        paintSprite(g, t.s, x * TILE, y * TILE, 2, this.tileCols(t.s, t, era));
      }
    }
  },

  // Personajes del pueblo viajan en el tiempo; los amigos rescatados y los enemigos se quedan en su era.
  // Quien no tiene era propia toma la de la región donde está parado (los barrios de cada era).
  entityCanvas(e) {
    const era = e.era || this.regionEra(e.x, e.y) || this.era;
    e.shownEra = era;
    const colors = !HUB_ERAS[era] && era === this.era ? null : charColors(e.sprite, era);
    return spriteCanvas(e.sprite, e.big ? 3 : 2, false, '', colors);
  },

  allEnts() {
    return [...this.solids, this.player, this.bit];
  },

  repaint(e) {
    e.el.replaceChild(this.entityCanvas(e), e.el.querySelector('canvas'));
  },

  repaintEntities() {
    this.allEnts().forEach((e) => this.repaint(e));
  },

  makeEntities() {
    const layer = $('.ents');
    const d = Save.data;
    const mk = (props) => {
      const e = { ...props };
      e.el = document.createElement('div');
      e.el.className = `ent ${props.cls || ''} ${props.era ? `native-${props.era}` : ''}`;
      e.el.appendChild(this.entityCanvas(e));
      layer.appendChild(e.el);
      return e;
    };
    // Los amigos rescatados (id 'f-<enemigo>') conservan la estética de su mundo.
    // `homes` (del mapa o la variante) cambia dónde se para cada quien: así los amigos viven en su casa.
    const npcs = [...(this.m.npcs || []), ...((this.variant && this.variant.npcs) || [])];
    const at = (n) => (this.homes[n.id] ? { x: this.homes[n.id][0], y: this.homes[n.id][1] } : {});
    this.npcs = npcs.filter((n) => !n.when || n.when())
      .map((n) => mk({ ...n, ...at(n), era: n.era || (n.id.startsWith('f-') && ENEMIES[n.id.slice(2)] ? eraOfEnemy(n.id.slice(2)) : undefined) }));
    // Amigos de otros mundos que llegan solos al pueblo: enemigos perdonados con casa en su barrio
    // (BARRIOS, js/town-data.js) o con `home: [x, y]`.
    if (this.pueblo) {
      Object.entries(ENEMIES).forEach(([id, def]) => {
        const home = this.homes[`f-${id}`] || def.home;
        if (!home || !d.spared[id] || this.npcs.some((n) => n.id === `f-${id}`)) return;
        const [x, y] = home;
        const line = def.townLine || '* ¡Hola! Ahora vivo en el pueblo.';
        this.npcs.push(mk({
          id: `f-${id}`, sprite: def.sprite, x, y, era: eraOfEnemy(id),
          talk: (ctx) => (typeof friendTalk === 'function' ? friendTalk(ctx, id) : ctx.say([line], upper(def.name))),
        }));
      });
    }
    // Enemigos parados en el mapa (los que ya venciste o perdonaste ya no están).
    this.foes = (this.m.encounters || []).filter((en) => ENEMIES[en.enemy] && !d.done[en.enemy]).map((en) => {
      const def = ENEMIES[en.enemy];
      return mk({ kind: 'foe', id: `foe-${en.enemy}`, enemy: en.enemy, say: en.say, sprite: def.sprite, big: !!def.boss, era: eraOfEnemy(en.enemy), cls: `foe ${def.boss ? 'boss' : ''}`, x: en.x, y: en.y });
    });
    this.chests = (this.m.chests || []).map((c) => mk({
      kind: 'chest', id: `chest-${c.id}`, chest: c, cls: 'chest', x: c.x, y: c.y,
      sprite: d.flags[`chest_${c.id}`] ? 'cofre_abierto' : 'cofre',
    }));
    this.solids = [...this.npcs, ...this.foes, ...this.chests];
    this.player = mk({ id: 'player', sprite: 'heroe', cls: 'player', x: this.p.x, y: this.p.y });
    // Bit aparece detrás del jugador (o en cualquier lado libre).
    const order = [OPPOSITE[this.p.face], 'down', 'up', 'left', 'right'];
    const spot = order.map((dir) => [this.p.x + DIRS[dir][0], this.p.y + DIRS[dir][1]])
      .find(([x, y]) => this.free(x, y) && !this.tileAt(x, y).warp && !this.exitAt(x, y));
    const [bx, by] = spot || [this.p.x, this.p.y];
    const tips = this.m.bitTips;
    this.bit = mk({ id: 'bit', sprite: 'bit', cls: 'bit', x: bx, y: by, talk: tips && tips.length ? (ctx) => ctx.say([rand(tips)], 'BIT') : bitTalk });
    this.allEnts().forEach((e) => this.place(e, true));
    this.facePlayer();
  },

  place(e, instant = false) {
    const off = e.big ? -8 : 0;
    e.el.style.transition = instant ? 'none' : `transform ${STEP_MS}ms linear`;
    e.el.style.transform = `translate(${e.x * TILE + off}px, ${e.y * TILE + off * 2}px)`;
    e.el.style.zIndex = 10 + e.y;
  },

  // La cámara sigue al jugador sin salirse del mapa (si el mapa es más chico que la pantalla, lo centra).
  cameraAt(x, y) {
    const axis = (size, view, at) => (size <= view ? (size - view) / 2 : Math.max(0, Math.min(size - view, at * TILE + TILE / 2 - view / 2)));
    return [axis(this.W * TILE, VIEW_W, x), axis(this.H * TILE, VIEW_H, y)];
  },

  camera(instant = false) {
    const [cx, cy] = this.cameraAt(this.p.x, this.p.y);
    const el = $('.tworld');
    el.style.transition = instant ? 'none' : `transform ${STEP_MS}ms linear`;
    el.style.transform = `translate(${-cx}px, ${-cy}px)`;
  },

  facePlayer() {
    this.player.el.classList.toggle('flip', this.p.face === 'left');
  },

  entityAt(x, y) {
    return [...this.solids, this.bit].find((e) => e.x === x && e.y === y);
  },

  exitAt(x, y) {
    return (this.m.exits || {})[`${x},${y}`];
  },

  free(x, y) {
    const t = this.tileAt(x, y);
    return !!t && !t.solid && !this.solids.some((n) => n.x === x && n.y === y);
  },

  // ---------- Caminar ----------

  step(dir) {
    if (this.mode !== 'walk' || this.moving) return;
    this.p.face = dir;
    this.facePlayer();
    const nx = this.p.x + DIRS[dir][0];
    const ny = this.p.y + DIRS[dir][1];
    if (!this.free(nx, ny)) {
      // Chocar con un enemigo empieza el combate.
      const foe = this.foes.find((f) => f.x === nx && f.y === ny);
      if (foe) this.fight(foe);
      return;
    }
    // Bit sigue al jugador ocupando su casilla anterior (y si estorba, cambian de lugar).
    Object.assign(this.bit, { x: this.p.x, y: this.p.y });
    Object.assign(this.p, { x: nx, y: ny });
    Object.assign(this.player, { x: nx, y: ny });
    [this.player, this.bit].forEach((e) => { if ((this.regionEra(e.x, e.y) || this.era) !== e.shownEra) this.repaint(e); });
    this.place(this.player);
    this.place(this.bit);
    this.camera();
    this.player.el.classList.add('walking');
    this.moving = true;
    this.stepT = setTimeout(() => {
      this.moving = false;
      this.player.el.classList.remove('walking');
      this.arrive();
    }, STEP_MS);
  },

  arrive() {
    const { x, y } = this.p;
    const t = this.tileAt(x, y);
    if (this.grace > 0) this.grace--;
    this.regionCheck(x, y);
    const ex = this.exitAt(x, y);
    if (ex) { this.useExit(ex, t); return; }
    if (this.pueblo && t.warp === 'world') {
      const w = pipeWorldAt(x, y);
      Sfx.warp();
      this.mode = 'busy';
      this.player.el.classList.add('sink');
      // Mundos con zonas explorables entran caminando; los demás, a su mapa de paradas.
      this.later = setTimeout(() => (w.entry
        ? Game.go('town', { map: w.entry.map, spawn: w.entry.spawn })
        : Game.go('map', { world: w.id })), 450);
      return;
    }
    if (this.pueblo && t.warp === 'vitrina') {
      Sfx.confirm();
      const [vx, vy, face] = this.m.spawns.vitrina;
      this.p = { x: vx, y: vy, face };
      this.savePos();
      Game.go('vitrina', { back: 'town' });
      return;
    }
    this.savePos();
    const rate = this.m.wildRate || (this.pueblo ? 0.1 : 0.07);
    if (t.tall && !this.grace && Math.random() < rate && this.wildPool().length) { this.wildEncounter(); return; }
    if (this.held) this.step(this.held);
  },

  // Al entrar a una región con nombre (un barrio), sale su cartel.
  regionCheck(x, y) {
    const r = this.regionAt(x, y);
    if (r === this.regionNow) return;
    this.regionNow = r;
    if (!r || !r.name) return;
    const old = $('.region-name');
    if (old) old.remove();
    const b = document.createElement('div');
    b.className = `region-name region-${r.era}`;
    b.textContent = upper(r.name);
    $('.town').appendChild(b);
    setTimeout(() => b.remove(), 2600);
  },

  // Salida a otro mapa ({ map, spawn }) o al pueblo, junto a la tubería de un mundo ({ pueblo: 'gb' }).
  useExit(ex, t) {
    this.mode = 'busy';
    this.held = null;
    const pipe = t && t.s === 'pipe';
    if (pipe) { Sfx.warp(); this.player.el.classList.add('sink'); } else { Sfx.confirm(); $('.town').classList.add('fade'); }
    this.later = setTimeout(() => (ex.pueblo
      ? Game.go('town', { map: 'pueblo', from: `pipe:${ex.pueblo}` })
      : Game.go('town', { map: ex.map, spawn: ex.spawn })), pipe ? 450 : 300);
  },

  // Guiño a Pokémon: en el pasto alto aparecen enemigos salvajes para practicar.
  // En los mundos salen los de `wild` que ya venciste; en el pueblo, Pixelito y los normales vencidos.
  wildPool() {
    const d = Save.data;
    if (this.m.wild) return this.m.wild.filter((id) => ENEMIES[id] && d.done[id]);
    if (!this.pueblo) return [];
    return ['pixelito', ...Object.keys(ENEMIES).filter((id) => d.done[id] && !ENEMIES[id].boss && !ENEMIES[id].mode)];
  },

  wildEncounter() {
    const id = rand(this.wildPool());
    this.grace = 4;
    $('.town').classList.add('flash');
    this.run(async (ctx) => {
      await ctx.say([`* ¡Un ${upper(ENEMIES[id].name)} salvaje apareció!`]);
      Game.go(ENEMIES[id].mode || 'battle', { enemyId: id, back: 'town' });
    });
  },

  // Encuentro con un enemigo del mapa: (lo que dice), parpadeo y a su escena.
  fight(foe) {
    if (this.mode !== 'walk') return;
    const def = ENEMIES[foe.enemy];
    this.run(async (ctx) => {
      if (foe.say) await ctx.say(foe.say, upper(def.name));
      this.hideBox();
      Sfx.hit();
      $('.town').classList.add('flash');
      await townWait(850);
      if (Game.scene === this) Game.go(def.mode || 'battle', { enemyId: foe.enemy, back: 'town' });
    });
  },

  // Cofre con candado de letras: escribe su palabra y te da su tesoro.
  async openChest(ctx, e) {
    const c = e.chest;
    if (ctx.flag(`chest_${c.id}`)) {
      await ctx.say(['* El cofre está vacío.\n* Bueno, tiene un poquito de polvo de 1989.']);
      return;
    }
    await ctx.say(['* ¡Un cofre! Tiene un candado de letras.\n* Se abre con la palabra correcta.']);
    // Tiempo como en docs/LORE.md §13 (15 PPM) ; TypingTask ya lo ajusta a la dificultad.
    const res = await ctx.challenge({ label: 'Escribe para abrir el cofre:', texts: [c.word], timeLimit: c.timeLimit || c.word.length * 1120 + 1500 });
    if (!res.completed) {
      await ctx.say(['* El candado hizo "clic"... pero al revés.\n* ¡Inténtalo otra vez!']);
      return;
    }
    ctx.setFlag(`chest_${c.id}`);
    e.sprite = 'cofre_abierto';
    this.repaint(e);
    Sfx.coin();
    if (c.say) await ctx.say([].concat(c.say));
    if (TREASURES[c.treasure]) await ctx.give(c.treasure);
  },

  interact() {
    const [dx, dy] = DIRS[this.p.face];
    const x = this.p.x + dx;
    const y = this.p.y + dy;
    const ent = this.entityAt(x, y);
    if (ent && ent.kind === 'foe') { this.fight(ent); return; }
    if (ent && ent.kind === 'chest') { this.run((ctx) => this.openChest(ctx, ent)); return; }
    if (ent && ent.talk) { this.run((ctx) => ent.talk(ctx)); return; }
    const t = this.tileAt(x, y);
    if (!t) return;
    const looks = this.m.looks || {};
    let text = this.signs[`${x},${y}`] || (t.look && (looks[t.look] || TOWN.looks[t.look]));
    if (typeof text === 'function') text = text();
    if (text) this.run((ctx) => ctx.say([].concat(text)));
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
    $('.tworld').appendChild(b);
    Sfx.text();
    setTimeout(() => b.remove(), 3000);
  },

  // Menú corto de los mundos (ESC).
  openMenu() {
    this.mode = 'menu';
    this.held = null;
    const box = document.createElement('div');
    box.className = 'box tmenu';
    box.innerHTML = `<div class="tmenu-t">${esc(upper(this.m.name))}</div><div class="tmenu-l"></div>`;
    $('.town').appendChild(box);
    const close = () => {
      box.remove();
      this.ui = null;
      this.mode = 'walk';
      this.idleAt = performance.now();
    };
    this.ui = new ListMenu($('.tmenu-l', box), [{ label: 'Seguir explorando' }, { label: 'Volver al pueblo' }], {
      onPick: (i) => {
        if (i === 0) { close(); return; }
        Sfx.warp();
        Game.go('town', { map: 'pueblo', from: `pipe:${this.m.world}` });
      },
      onCancel: close,
    });
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
    if (this.mode === 'script' || this.mode === 'menu') { if (this.ui) this.ui.key(e); return; }
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
    else if (e.key === 'Escape') { if (this.pueblo) Game.go('title'); else this.openMenu(); }
  },

  onKeyUp(e) {
    if (KEY_DIRS[e.key] === this.held) this.held = null;
  },
};
