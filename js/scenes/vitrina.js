// El museo de Don Chip: una sala por cada era ya abierta (sin spoilers de las que vienen)
// y la Sala del Pueblo. Cada sala muestra su consola y sus tesoros, con la estética original
// de su consola. Los amigos no están aquí: viven en el pueblo (y cuentan datos, ver js/curiosidades.js).

const PER_ROW = 9;

Scenes.vitrina = {
  enter({ back = 'map' }) {
    this.back = back;
    this.rooms = [...WORLDS.filter(worldUnlocked).map((w) => w.id), 'pueblo'];
    // La Sala de Secretos aparece hasta que encuentras el primero.
    if (secretCount()) this.rooms.push('secretos');
    if (!this.rooms.includes(this.room)) this.room = this.rooms[0];
    this.r = 1;
    this.c = 0;
    this.fact = 0;
    this.build();
    this.render();
  },

  roomName(id) {
    if (id === 'pueblo') return 'PUEBLO';
    if (id === 'secretos') return '★ SECRETOS';
    const w = WORLDS.find((x) => x.id === id);
    const c = CONSOLES.find((x) => x.id === w.console);
    return upper(c ? c.name : w.name);
  },

  // Filas de la sala actual. La fila 0 son las pestañas de las salas.
  build() {
    const d = Save.data;
    const id = this.room;
    const w = WORLDS.find((x) => x.id === id);
    const era = w ? w.theme : hubEra();
    const look = (sprite) => charColors(sprite, era);
    const rows = [{ tabs: true }];
    if (id === 'secretos') {
      // Los que faltan se ven como cartuchos apagados: ni su nombre ni su forma.
      const all = Object.entries(SECRETOS).map(([sid, s]) => ({
        secret: sid, sprite: secretFound(sid) ? s.sprite : 'cartucho', got: secretFound(sid), name: s.name,
        desc: 'ENTER: ver la tarjeta del secreto.', colors: look(s.sprite),
      }));
      for (let i = 0; i < all.length; i += PER_ROW) rows.push({ title: i ? '' : 'SECRETOS ENCONTRADOS', slots: all.slice(i, i + PER_ROW) });
      this.rows = rows;
      this.r = Math.min(this.r, rows.length - 1);
      return;
    }
    if (w && w.console) {
      const c = CONSOLES.find((x) => x.id === w.console);
      if (c) rows.push({ title: 'CONSOLA', slots: [{ sprite: c.id, got: !!d.consoles[c.id], name: `${c.name} (${c.year})`, facts: c.facts, colors: look(c.id) }] });
    }
    const treasures = Object.entries(TREASURES).filter(([, t]) => (t.room || 'pueblo') === id)
      .map(([tid, t]) => ({ sprite: t.sprite || tid, got: !!d.treasures[tid], name: t.name, desc: t.desc, colors: look(t.sprite || tid) }));
    for (let i = 0; i < treasures.length; i += PER_ROW) {
      rows.push({ title: i ? '' : 'TESOROS', slots: treasures.slice(i, i + PER_ROW) });
    }
    this.rows = rows;
    this.r = Math.min(this.r, rows.length - 1); // una sala puede quedar sin repisas
  },

  render() {
    const all = this.rows.flatMap((r) => r.slots || []);
    const got = all.filter((s) => s.got).length;
    Game.root.innerHTML = `
      <div class="vitrina">
        <h2>MUSEO DE DON CHIP</h2>
        <div class="vtabs ${this.r === 0 ? 'sel' : ''}">${this.rooms.map((id) =>
          `<span class="vtab ${id === this.room ? 'on' : ''}" data-room="${id}">${esc(this.roomName(id))}</span>`).join('')}
          <span class="count">${got}/${all.length}</span>
        </div>
        <div class="vrows">${this.rows.map((row, r) => (row.tabs ? '' : `
          ${row.title ? `<div class="shelf-title">${row.title}</div>` : ''}
          <div class="shelf">${row.slots.map((s, c) =>
            `<div class="slot ${s.got ? 'got' : ''} ${r === this.r && c === this.c ? 'sel' : ''}" data-r="${r}" data-c="${c}"></div>`).join('')}
          </div>`)).join('')}
        </div>
        <div class="box vinfo"></div>
        <div class="map-keys"><span>FLECHAS: explorar</span><span data-k="Escape">[ESC] Volver</span></div>
      </div>`;
    document.querySelectorAll('.slot').forEach((el) => {
      const s = this.rows[+el.dataset.r].slots[+el.dataset.c];
      el.appendChild(spriteCanvas(s.sprite, 3, !s.got, '', s.got ? s.colors : null));
      el.onclick = () => { this.r = +el.dataset.r; this.c = +el.dataset.c; this.render(); };
    });
    document.querySelectorAll('.vtab').forEach((el) => {
      el.onclick = () => this.goRoom(el.dataset.room);
    });
    $('.map-keys span[data-k]').onclick = () => Game.go(this.back);
    this.renderInfo();
  },

  renderInfo() {
    const box = $('.vinfo');
    if (this.r === 0) {
      box.innerHTML = `* SALA ${esc(this.roomName(this.room))}<br>* FLECHAS IZQ/DER para cambiar de sala.`;
      return;
    }
    const s = this.rows[this.r].slots[this.c];
    if (!s.got) box.innerHTML = '* ???<br>* Sigue jugando para descubrirlo.';
    else if (s.facts) {
      const n = this.fact % s.facts.length;
      box.innerHTML = `* ${esc(upper(s.name))} <span class="dim">· DATO ${n + 1}/${s.facts.length} · ENTER: otro</span><br>* ${esc(s.facts[n])}`;
    } else box.innerHTML = `* ${esc(upper(s.name))}<br>* ${esc(s.desc)}`;
  },

  goRoom(id) {
    this.room = id;
    this.c = 0;
    this.fact = 0;
    this.build();
    this.r = Math.min(this.r, this.rows.length - 1);
    Sfx.move();
    this.render();
  },

  onKey(e) {
    if (isCancel(e)) { Game.go(this.back); return; }
    if (this.r === 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const i = this.rooms.indexOf(this.room);
      const n = this.rooms.length;
      this.goRoom(this.rooms[(i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n]);
      return;
    }
    const row = this.rows[this.r];
    if (e.key === 'ArrowRight' && row.slots) this.c = (this.c + 1) % row.slots.length;
    else if (e.key === 'ArrowLeft' && row.slots) this.c = (this.c - 1 + row.slots.length) % row.slots.length;
    else if (e.key === 'ArrowDown') this.r = Math.min(this.rows.length - 1, this.r + 1);
    else if (e.key === 'ArrowUp') this.r = Math.max(0, this.r - 1);
    else if (isConfirm(e)) {
      const s = row.slots && row.slots[this.c];
      if (s && s.secret && s.got) { findSecret(s.secret).then(() => this.render()); return; }
      this.fact++; Sfx.move(); this.render(); return;
    }
    else return;
    this.fact = 0;
    if (this.rows[this.r].slots) this.c = Math.min(this.c, this.rows[this.r].slots.length - 1);
    Sfx.move();
    this.render();
  },
};
