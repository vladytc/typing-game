// ANTES DE LA BATALLA FINAL (docs/LORE.md §10.2): entras al Canal Vacío y todo el pueblo aparece
// detrás de ti. Cada amigo te da una FRASE (Save.data.finalPhrases); en la fase 3 contestas con ellas.
// Se llega desde la tele de la plaza (js/fin-pueblo.js). Al terminar: Game.go('fin').

const FIN_CANAL_MAX = 8; // cuántos amigos hablan uno por uno (los demás llegan juntos)
const FIN_PRIMERO = ['tetrorey', 'caparazon', 'nebula', 'guante', 'capbrotes', 'casco', 'chupin', 'cometa', 'marco', 'ocarin', 'pixelito'];
const FIN_SALUDOS = ['¡Aquí estoy!', '¡No vas solo!', '¡Vine corriendo!', '¡Llévate esto!', '¡Te acompaño!', '¡Yo también vine!'];

Scenes.fincanal = {
  enter({ back = 'town' } = {}) {
    this.back = back;
    this.dialog = null;
    this.alive = true;
    document.body.className = 'theme-fin';
    Music.play('fin_pausa');
    Game.root.innerHTML = `
      <div class="fincanal">
        <canvas class="fc-static" width="160" height="120"></canvas>
        <div class="fc-title">CANAL VACIO</div>
        <div class="fc-crowd"></div>
        <div class="fc-hero"></div>
        <div class="fc-bag">FRASES: <b>0</b></div>
        <div class="box fc-box"><div class="fc-speaker hidden"></div><div class="tb-text"></div></div>
      </div>`;
    const hero = $('.fc-hero');
    hero.appendChild(spriteCanvas('heroe', 4, false, '', charColors('heroe', 'snes')));
    hero.appendChild(spriteCanvas('bit', 3, false, 'fc-bit', charColors('bit', 'snes')));
    this.st = setInterval(() => this.noise(), 90);
    this.noise();
    Save.data.finalPhrases = finCollectPhrases();
    Save.data.flags.finFase = 1;
    Save.write();
    this.got = 0;
    this.run().catch(() => {});
  },

  exit() {
    this.alive = false;
    clearInterval(this.st);
    if (this.dialog) this.dialog.stop();
  },

  noise() {
    const c = $('.fc-static');
    const g = c && c.getContext('2d');
    if (!g || !g.fillRect) return;
    g.fillStyle = '#050005';
    g.fillRect(0, 0, 160, 120);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,0,255,0.55)' : 'rgba(90,90,90,0.5)';
      g.fillRect(Math.random() * 160 | 0, Math.random() * 120 | 0, 1, 1);
    }
    if (Math.random() < 0.3) { g.fillStyle = 'rgba(255,0,255,0.18)'; g.fillRect(0, Math.random() * 120, 160, 2); }
  },

  say(pages, speaker = '') {
    return new Promise((done) => {
      if (!this.alive) return;
      const sp = $('.fc-speaker');
      sp.textContent = speaker;
      sp.classList.toggle('hidden', !speaker);
      this.dialog = new Dialog($('.fc-box .tb-text'), pages, done);
    });
  },

  // Llega alguien al grupo (con la paleta de su era).
  arrive(sprite, era, big = false) {
    const el = spriteCanvas(sprite, big ? 3 : 2, false, 'fc-friend', charColors(sprite, era));
    $('.fc-crowd').appendChild(el);
    Sfx.pop();
  },

  frase(text) {
    this.got++;
    $('.fc-bag b').textContent = this.got;
    $('.fc-bag').classList.remove('fc-pulse');
    void $('.fc-bag').offsetWidth;
    $('.fc-bag').classList.add('fc-pulse');
    Sfx.coin();
    return this.say([`* (Guardas la frase: "${text}")`]);
  },

  async run() {
    const d = Save.data;
    const era = hubEra();
    await this.say(['* (Entras a la tele. Todo es negro, con estática magenta.)', '* Arriba, en letras que tiemblan, dice: CANAL VACIO.'], '');
    await this.say(['* ...Aquí es. Aquí está él.', '* Oye... ¿escuchas eso? Detrás de nosotros.'], 'BIT');
    await this.say(['* (Pasos. Muchos pasos. Alguien tropieza. Alguien dice "¡guau!".)']);

    // La gente del pueblo.
    for (const p of FIN_PUEBLO.filter((x) => !x.when || x.when())) {
      if (!this.alive) return;
      this.arrive(p.sprite, era);
      await this.say([p.say, `* Toma. Te doy mi frase: "${p.frase}".`], p.who);
      if (p.bit) await this.say([p.bit]);
      await this.frase(p.frase);
    }

    // Los amigos que perdonaste: algunos hablan, los demás llegan todos juntos.
    const ids = finFriendIds();
    const first = [...FIN_PRIMERO.filter((id) => ids.includes(id)), ...ids.filter((id) => !FIN_PRIMERO.includes(id))];
    const talk = first.slice(0, FIN_CANAL_MAX);
    const rest = first.slice(FIN_CANAL_MAX);
    for (const id of talk) {
      if (!this.alive) return;
      const def = ENEMIES[id] || {};
      this.arrive(def.sprite || id, eraOfEnemy(id));
      const line = id.startsWith('sombra_') ? '* (Una copia de sombra. Ya no es magenta: es de tu color.)' : `* ${rand(FIN_SALUDOS)}`;
      await this.say([line, `* Mi frase es: "${FIN_FRASES[id]}".`], upper(def.name || id));
      await this.frase(FIN_FRASES[id]);
    }
    if (rest.length) {
      for (const id of rest) { const def = ENEMIES[id] || {}; this.arrive(def.sprite || id, eraOfEnemy(id)); }
      this.got += rest.length;
      $('.fc-bag b').textContent = this.got;
      Sfx.secret();
      await this.say([`* ...¡y llegan ${rest.length} amigos más!\n* Cada uno te da su frase. Se te llenan los bolsillos de palabras.`]);
    }
    if (!ids.length) await this.say(['* (Nadie más vino... pero los del pueblo gritan tan fuerte que suenan como cien.)']);

    if (d.flags.daniPresta && TECLOIDES[d.flags.daniPresta]) {
      await this.say([`* Y no se te olvide que traes a ${upper(TECLOIDES[d.flags.daniPresta].name)}.\n* Si se pone feo, ¡llámalo en ACTUAR!`], 'DANI TURBO');
    }

    // Bit, al final, bajito.
    await this.say(['* ...', '* Y yo también tengo una. Te la digo bajito, para que nadie más oiga.', `* "${FIN_BIT_FRASE}".`], 'BIT');
    await this.frase(FIN_BIT_FRASE);
    await this.say([`* (Tienes ${this.got} frases. Las vas a necesitar.)`, '* ¡Vamos! Todos juntos.'], '');
    if (!this.alive) return;
    $('.fincanal').classList.add('fc-out');
    Sfx.warp();
    setTimeout(() => { if (Game.scene === this) Game.go('fin', { back: this.back, fase: 1 }); }, 700);
  },

  onKey(e) {
    if (this.dialog) this.dialog.key(e);
  },
};
