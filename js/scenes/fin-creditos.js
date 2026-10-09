// CREDITOS (docs/LORE.md §10.4): desfile de todos los amigos con un reto OPCIONAL (escribe el nombre
// de quien pasa para saludarlo; sin castigo), la vitrina con las 6 consolas y el cartucho en medio,
// tus estadísticas y FIN. Después, el pueblo con el epílogo (js/fin-pueblo.js).
//   Game.go('fincreditos', { final: 'bueno' | 'neutral' })

const FIN_CRED_GAP = 1700;   // ms entre un personaje y otro
const FIN_CRED_SPEED = 95;   // px por segundo

Scenes.fincreditos = {
  enter({ final = 'bueno' } = {}) {
    this.final = final;
    this.stage = 'roll';
    this.buf = '';
    this.greeted = 0;
    document.body.className = 'theme-fincred';
    Music.play('fin_creditos');
    this.members = this.parade();
    const dur = (this.members.length * FIN_CRED_GAP + (640 / FIN_CRED_SPEED) * 1000) / 1000;
    Game.root.innerHTML = `
      <div class="fincred">
        <div class="fcr-roll"><div class="fcr-lines" style="animation-duration:${dur}s">${this.lines().map((l) => (l === '' ? '<br>' : `<div class="${l.startsWith('#') ? 'fcr-h' : ''}">${esc(l.replace(/^#/, ''))}</div>`)).join('')}</div></div>
        <div class="fcr-parade"></div>
        <div class="fcr-type"><span class="fcr-hint">(Opcional) Escribe el nombre de quien pasa para saludarlo</span><span class="fcr-buf"></span></div>
        <div class="fcr-count">SALUDOS: <b>0</b></div>
        <div class="fcr-skip">ESC: saltar</div>
      </div>`;
    this.walkers = [];
    this.spawned = 0;
    this.elapsed = 0;
    this.t0 = performance.now();
    this.last = this.t0;
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },

  exit() {
    cancelAnimationFrame(this.raf);
  },

  // Quiénes pasan: la gente del pueblo, los amigos y, al final, él.
  parade() {
    const era = 'snes';
    const out = FIN_PUEBLO.filter((p) => !p.when || p.when()).map((p) => ({ name: p.who, sprite: p.sprite, colors: charColors(p.sprite, era) }));
    finFriendIds().forEach((id) => {
      const def = ENEMIES[id] || {};
      out.push({ name: upper(def.name || id), sprite: def.sprite || id, colors: charColors(def.sprite || id, eraOfEnemy(id)) });
    });
    out.push({ name: 'BIT', sprite: 'bit', colors: charColors('bit', era) });
    if (this.final === 'bueno' && finName()) out.push({ name: upper(finName()), sprite: 'glitch_ok', colors: charColors('glitch_ok', era), star: true });
    return out.filter((m) => SPRITES[m.sprite]);
  },

  lines() {
    const d = Save.data;
    const L = ['#TECLA QUEST', 'Una aventura para dedos veloces', '', '#HEROE', 'TU', '', '#COMPAÑERO', 'BIT, el cursor que se escapó', '',
      '#EL COLECCIONISTA', 'DON CHIP', '', '#LA QUE ESPERO DESDE 1989', 'CHAMPI', '', '#EL RIVAL (EL SEGUNDO MAS RAPIDO)', 'DANI TURBO', '',
      '#CIENCIA TECLOIDE', 'PROFESORA LETRA', '', '#CONSEJOS GRATIS', 'DOÑA TECLA', '', '#RISAS', 'TOBY', '', '#RONQUIDOS', 'EL RONCATON', ''];
    const friends = finFriendIds().map((id) => upper((ENEMIES[id] || {}).name || id));
    if (friends.length) L.push('#LOS AMIGOS DEL PUEBLO', ...friends, '');
    L.push('#LAS CONSOLAS RESCATADAS', ...CONSOLES.filter((c) => d.consoles[c.id] && c.id !== 'virtualboy').map((c) => `${upper(c.name)} (${c.year})`), '');
    L.push('#Y TAMBIEN', this.final === 'bueno' && finName() ? `${upper(finName())}, que por fin tiene nombre` : 'UN CARTUCHO SIN NOMBRE', '', '#GRACIAS POR JUGAR', 'Teclear es recordar.');
    return L;
  },

  loop(ts) {
    if (this.stage !== 'roll') return;
    const dt = Math.min(60, ts - this.last) / 1000;
    this.last = ts;
    const host = $('.fcr-parade');
    if (!host) return;
    this.elapsed = (this.elapsed || 0) + dt * 1000; // tiempo de juego (si la pestaña se oculta, todo se pausa junto)
    if (this.spawned < this.members.length && this.elapsed >= this.spawned * FIN_CRED_GAP) {
      const m = this.members[this.spawned++];
      const el = document.createElement('div');
      el.className = `fcr-walker${m.star ? ' fcr-star' : ''}`;
      el.innerHTML = `<div class="fcr-name"></div>`;
      el.appendChild(spriteCanvas(m.sprite, 3, false, '', m.colors));
      host.appendChild(el);
      const w = { m, el, x: 650, typed: 0, done: false };
      this.walkers.push(w);
      this.renderWalker(w);
    }
    for (const w of [...this.walkers]) {
      w.x -= FIN_CRED_SPEED * dt;
      w.el.style.transform = `translateX(${w.x}px)`;
      if (w.x < -140) {
        w.el.remove();
        this.walkers.splice(this.walkers.indexOf(w), 1);
        if (this.target === w) { this.target = null; this.buf = ''; this.renderBuf(); }
      }
    }
    if (this.spawned >= this.members.length && !this.walkers.length) { this.toVitrina(); return; }
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },

  renderWalker(w) {
    const n = w.m.name;
    const k = w === this.target ? this.buf.length : 0;
    $('.fcr-name', w.el).innerHTML = `<span class="t">${esc(n.slice(0, k))}</span>${esc(n.slice(k))}`;
  },

  renderBuf() {
    const b = $('.fcr-buf');
    if (b) b.textContent = this.buf ? upper(this.buf) : '';
  },

  // Saludar: escribe el nombre del que va más adelante (sin castigo si te equivocas).
  type(e) {
    if (e.key === 'Backspace') { this.buf = this.buf.slice(0, -1); this.renderBuf(); if (this.target) this.renderWalker(this.target); return; }
    if (e.key.length !== 1 || e.repeat) return;
    const open = this.walkers.filter((w) => !w.done && w.x < 600);
    if (!this.target || this.target.done || !open.includes(this.target)) { this.target = open[0] || null; this.buf = ''; }
    const w = this.target;
    if (!w) return;
    const want = w.m.name[this.buf.length];
    if (!want || !keyMatches(want, e.key)) { Sfx.move(); return; }
    this.buf += e.key;
    Sfx.key();
    if (this.buf.length >= w.m.name.length) {
      w.done = true;
      w.el.classList.add('fcr-hi');
      this.greeted++;
      $('.fcr-count b').textContent = this.greeted;
      Sfx.coin();
      this.target = null;
      this.buf = '';
    }
    this.renderBuf();
    this.renderWalker(w);
  },

  toVitrina() {
    this.stage = 'vitrina';
    cancelAnimationFrame(this.raf);
    const d = Save.data;
    const cons = CONSOLES.filter((c) => c.id !== 'virtualboy');
    const left = cons.slice(0, 3);
    const right = cons.slice(3);
    const slot = (c) => `<div class="fcr-slot ${d.consoles[c.id] ? '' : 'off'}" data-s="${c.id}"><div class="fcr-cn">${esc(upper(c.name))}<br>${c.year}</div></div>`;
    const label = this.final === 'bueno' && finName() ? upper(finName()) : 'SIN NOMBRE';
    Game.root.innerHTML = `
      <div class="fincred fcr-vit">
        <h2>LA VITRINA DE DON CHIP</h2>
        <div class="fcr-shelf">${left.map(slot).join('')}
          <div class="fcr-slot fcr-cart" data-s="fin_cartucho"><div class="fcr-cn">${esc(label)}<br>1989</div></div>
          ${right.map(slot).join('')}</div>
        <p class="fcr-cap">* ${cons.filter((c) => d.consoles[c.id]).length} consolas rescatadas.</p>
        <p class="fcr-cap">* Y en medio, un cartucho de 1989 con una etiqueta que dice: ${esc(label)}.</p>
        <div class="fcr-skip">ENTER: seguir</div>
      </div>`;
    document.querySelectorAll('.fcr-slot').forEach((el) => {
      const s = el.dataset.s;
      el.prepend(spriteCanvas(s, 3, !(s === 'fin_cartucho' || d.consoles[s]), '', charColors(s, 'snes')));
    });
    Sfx.secret();
  },

  toStats() {
    this.stage = 'stats';
    const d = Save.data;
    const s = d.stats;
    const accAll = s.battles.length ? Math.round(s.battles.reduce((a, b) => a + (b.acc || 0), 0) / s.battles.length) : 0;
    const weak = Stats.weakKeys(1);
    const friends = Object.keys(d.spared).length;
    const tre = Object.keys(d.treasures).length;
    Game.root.innerHTML = `
      <div class="fincred fcr-stats">
        <h2>TUS ESTADISTICAS</h2>
        <div class="tiles">
          <div class="tile"><b>${s.bestWpm}</b><span>RECORD PPM</span></div>
          <div class="tile"><b>${accAll}%</b><span>PRECISION</span></div>
          <div class="tile"><b>${d.flags.finWpm || 0}</b><span>PPM EN LA FINAL</span></div>
          <div class="tile"><b>NV ${d.level}</b><span>NIVEL</span></div>
          <div class="tile"><b>${friends}</b><span>AMIGOS</span></div>
          <div class="tile"><b>${tre}</b><span>TESOROS</span></div>
          <div class="tile"><b>${this.greeted}</b><span>SALUDOS</span></div>
          <div class="tile"><b>${d.flags.finAcc || 0}%</b><span>PRECISION FINAL</span></div>
        </div>
        <p class="fcr-cap">${weak.length ? `* La tecla que más te costó: ${esc(upper(weak[0]))}. ¡Ya casi la dominas!` : '* Ninguna tecla se te resistió. ¡Dedos de campeón!'}</p>
        <p class="fcr-cap">* ${s.bestWpm >= 50 ? '¡Más de 50 PPM! Eres más rápido que Dani. No se lo digas.' : 'Meta secreta: 50 PPM. Dani dice que no puedes. (Sí puedes.)'}</p>
        <div class="fcr-skip">ENTER: seguir</div>
      </div>`;
    Sfx.confirm();
  },

  toFin() {
    this.stage = 'fin';
    Game.root.innerHTML = `
      <div class="fincred fcr-fin">
        <h1>FIN</h1>
        <p>${this.final === 'bueno' ? '* Gracias por darle un nombre.' : '* ...¿Seguro que este es el final?'}</p>
        <p class="fcr-cap">* (Hay algo rojo despertando al este del pueblo...)</p>
        <div class="fcr-skip">ENTER: volver al pueblo</div>
      </div>`;
    Sfx.win();
  },

  onKey(e) {
    if (this.stage === 'roll') {
      if (e.key === 'Escape') { this.toVitrina(); return; }
      this.type(e);
      return;
    }
    if (!isConfirm(e) && e.key !== 'Escape') return;
    if (this.stage === 'vitrina') this.toStats();
    else if (this.stage === 'stats') this.toFin();
    else if (this.stage === 'fin') {
      this.stage = 'done';
      Game.go('town', { map: 'pueblo', spawn: [5, 6, 'up'] });
    }
  },
};
