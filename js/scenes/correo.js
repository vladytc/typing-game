// CORREO DE BELLOTA (guiño: Animal Crossing, 2001). LORE §8.6. El minijuego de FRASES LARGAS y
// PUNTUACION: la Alcaldesa Bellota te pide escribir cartas a los vecinos. Cada carta = 3 renglones
// dictados (con mayúsculas, comas, puntos y signos). El vecino responde según tu precisión:
//   97 % o más → carta feliz · 90-96 % → "gracias" · menos de 90 % → "Tu letra está rara, pero gracias."
// En el mapa, la parada se cumple al mandar 3 cartas. "Carta libre" (Turbo): escribes lo que quieras,
// sin tiempo, con al menos 15 palabras; empieza con mayúscula y termina con punto.
// Misión "Diez cartas": una carta a cada vecino y 5 respuestas felices → Buzón rojo.
// ESC durante una carta la guarda en el cajón (se cancela) y en el menú, sale.

const GC_CORREO_PPM = 38; // objetivo del Mundo 5 (§13)
const GC_VECINOS = [
  { id: 'nabo', name: 'Nabo', who: 'el cerdito', lines: ['Querido Nabo, ¿cómo estás en tu granja hoy?', 'Te escribo porque encontré una trufa enorme.', 'Nos vemos en la plaza a las cinco.'], happy: '¡Una trufa! Oink. Ya estoy corriendo a la plaza.' },
  { id: 'lima', name: 'Lima', who: 'la gata', lines: ['Hola, Lima. Gracias por tu carta tan bonita.', 'Hoy llovió en la isla y olía a pan.', '¿Vamos a pescar el sábado con tu caña?'], happy: 'Miau. Pegué tu carta en mi refri. Nos vemos el sábado.' },
  { id: 'canela', name: 'Canela', who: 'la perrita', lines: ['Querida Canela, ¡feliz cumpleaños de parte de todos!', 'Te guardé un pastel de fresa con velitas.', 'Ven a mi casa y jugamos con la pelota.'], happy: '¡GUAU! ¡Nadie se había acordado! Llevo la pelota.' },
  { id: 'pinon', name: 'Piñón', who: 'el búho', lines: ['Estimado Piñón, ¿sigues despierto de noche?', 'Yo vi una estrella fugaz sobre el museo.', 'Mañana te presto mi libro de constelaciones.'], happy: 'Uuuh. Qué letra tan clara. Hasta de noche se lee.' },
  { id: 'tofu', name: 'Tofu', who: 'el conejo', lines: ['Hola, Tofu. ¿Ya creció tu huerto de zanahorias?', 'Bit dice que saltas más alto que nadie.', 'Te mando semillas de girasol para tu jardín.'], happy: '¡Brinco de gusto! Ya planté las semillas.' },
  { id: 'olivo', name: 'Olivo', who: 'la rana', lines: ['Querido Olivo, el estanque está precioso hoy.', 'Escuché tu canción y me gustó mucho.', '¿Me enseñas a saltar de hoja en hoja?'], happy: '¡Croac! Te compuse otra canción. Se llama "Tu carta".' },
  { id: 'brisa', name: 'Brisa', who: 'la pingüina', lines: ['Hola, Brisa. ¿Hace mucho frío en tu casa?', 'Te tejí una bufanda azul con estrellas.', 'Cuando nieve, haremos un muñeco gigante juntos.'], happy: '¡La bufanda es perfecta! Ya no tengo frío. Bueno, un poquito.' },
  { id: 'mango', name: 'Mango', who: 'el oso', lines: ['Querido Mango, gracias por la miel tan rica.', 'El Capitán Brotes dice que roncas muy fuerte.', '¿Quieres ir al festival de la plaza conmigo?'], happy: 'Jo, jo. Yo no ronco. Bueno, sí. ¡Vamos al festival!' },
  { id: 'ciruela', name: 'Ciruela', who: 'la ovejita', lines: ['Hola, Ciruela. Tu lana está suavecita y esponjosa.', 'El viento se llevó mi sombrero al mar.', 'Si lo encuentras, ¿me lo guardas, por favor?'], happy: '¡Beee! Encontré tu sombrero. Le puse una flor.' },
  { id: 'bellota', name: 'Bellota', who: 'la alcaldesa', lines: ['Estimada Alcaldesa Bellota, gracias por el buzón nuevo.', 'El Pueblo de Bellota es el mejor de la isla.', 'Prometo escribir con mayúsculas y puntos siempre.'], happy: '¡Ay, qué carta tan formal! La voy a enmarcar en la alcaldía.' },
];

Scenes.correo = {
  music: 'gc_map',

  enter({ enemyId = 'correo', back = 'map' } = {}) {
    document.body.className = 'theme-gc';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, ui: null, phase: 'intro', st: { chars: 0, errors: 0, ms: 0 } });
    Game.root.innerHTML = `
      <div class="correo">
        <div class="co-head">
          <div class="co-bellota"></div>
          <div class="co-title">CORREO DE BELLOTA</div>
          <div class="co-count"></div>
        </div>
        <div class="co-paper">
          <div class="co-to"></div>
          <div class="co-body"></div>
        </div>
        <div class="box co-box"></div>
      </div>`;
    $('.co-bellota').appendChild(spriteCanvas('bellota', 4));
    this.box = $('.co-box');
    this.renderCount();
    Quests.start('diez_cartas');
    const first = !Save.data.flags.gcBellota;
    const pages = first ? [
      '* ALCALDESA BELLOTA: ¡Ay, hola, hola! Soy Bellota, la alcaldesa.\n* Nuestro cartero se fue de vacaciones... a otra consola.',
      '* ALCALDESA BELLOTA: ¿Me ayudas a escribir cartas a los vecinos?\n* Yo te las dicto: tú las escribes con tu mejor letra.',
      '* BIT: ¡Ojo! Las cartas llevan MAYUSCULAS, comas, puntos, ¿signos? y ¡signos!\n* Mientras más preciso escribas, más feliz se pone el vecino.',
      '* ALCALDESA BELLOTA: Con 3 cartas ya eres cartero oficial.\n* (ESC guarda la carta en el cajón.)',
    ] : ['* ALCALDESA BELLOTA: ¡Mi cartero favorito! ¿A quién le escribimos hoy?'];
    Save.data.flags.gcBellota = true;
    Save.write();
    this.say(pages, () => this.menu());
  },

  exit() {
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  say(pages, done) {
    this.phase = 'dialog';
    this.box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', this.box), pages, () => { this.ui = null; done(); });
  },

  renderCount() {
    const c = GCS().cartas;
    const happy = Object.values(c).filter((a) => a >= 97).length;
    $('.co-count').textContent = `CARTAS ${Object.keys(c).length}/10 · FELICES ${happy}/5`;
  },

  menu() {
    this.phase = 'menu';
    $('.co-to').textContent = '';
    $('.co-body').innerHTML = '<div class="co-hint">¿A quién le escribes?</div>';
    const c = GCS().cartas;
    const items = GC_VECINOS.map((v) => {
      const a = c[v.id];
      return { label: `${a >= 97 ? '♥' : a !== undefined ? '✓' : '✉'} ${upper(v.name)}` };
    });
    items.push({ label: '✎ CARTA LIBRE' }, { label: 'SALIR' });
    this.ui = new ListMenu(this.box, items, {
      cols: 3,
      onPick: (i) => {
        if (i === items.length - 1) { this.leave(); return; }
        if (i === items.length - 2) { this.freeLetter(); return; }
        this.letter(GC_VECINOS[i]);
      },
      onCancel: () => this.leave(),
      onMove: (i) => {
        const v = GC_VECINOS[i];
        $('.co-body').innerHTML = `<div class="co-hint">${v ? esc(`${upper(v.name)}, ${v.who}.`) : i === GC_VECINOS.length ? 'Escribe lo que quieras. Sin tiempo.' : 'Volver.'}</div>`;
      },
    });
  },

  leave() {
    if (this.ui && this.ui.stop) this.ui.stop();
    Game.go(this.back);
  },

  // ---------- Carta dictada ----------

  letter(v) {
    this.phase = 'typing';
    this.cur = v;
    $('.co-to').textContent = `PARA: ${upper(v.name)}, ${upper(v.who)}`;
    const chars = v.lines.join('').length;
    // Tiempo según el PPM objetivo del mundo (§13): letras × (60000 / (PPM × 5)) × 1.4 + 1500 por renglón.
    const limit = chars * (60000 / (GC_CORREO_PPM * 5)) * 1.4 + 1500 * v.lines.length;
    this.ui = new TypingTask($('.co-body'), {
      label: 'Escribe la carta (cada renglón):',
      texts: v.lines,
      timeLimit: limit,
      caps: true,
      strict: true,
      onDone: (res) => this.sent(v, res),
    });
    this.ui.start();
    this.box.innerHTML = `<div class="co-dict">* ALCALDESA BELLOTA: Yo te dicto, tú escribes. ¡Con todo y puntos!</div>`;
  },

  sent(v, res) {
    this.ui = null;
    this.st.chars += res.chars;
    this.st.errors += res.errors;
    this.st.ms += res.ms;
    if (!res.completed) {
      this.say(['* ¡Se acabó el tiempo! La carta quedó a medias.\n* ALCALDESA BELLOTA: No pasa nada, la guardamos. ¡Otra vez!'], () => this.menu());
      return;
    }
    const typed = res.chars + res.errors;
    const acc = typed ? Math.round((res.chars / typed) * 100) : 100;
    const c = GCS().cartas;
    const before = c[v.id];
    c[v.id] = Math.max(before || 0, acc);
    const wpm = Math.round((res.chars / 5) / Math.max(res.ms / 60000, 0.01));
    const pages = [`* (Metes la carta al buzón. ¡Tlin!)\n* Precisión: ${acc}% · Velocidad: ${wpm} PPM`];
    if (acc >= 97) { Sfx.spare(); pages.push(`* RESPUESTA DE ${upper(v.name)}:\n* "${v.happy}"`, '* (¡Es una carta FELIZ! ♥)'); } else if (acc >= 90) { Sfx.mercy(); pages.push(`* RESPUESTA DE ${upper(v.name)}:\n* "Gracias por tu carta."`); } else pages.push(`* RESPUESTA DE ${upper(v.name)}:\n* "Tu letra está rara, pero gracias."`, '* BIT: ¡Despacito y sin errores sale mejor!');
    Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    pages.push(...this.rewards());
    Save.write();
    this.renderCount();
    this.say(pages, () => this.menu());
  },

  // Parada del mapa (3 cartas) y misión "Diez cartas".
  rewards() {
    const d = Save.data;
    const c = GCS().cartas;
    const n = Object.keys(c).length;
    const happy = Object.values(c).filter((a) => a >= 97).length;
    const pages = [];
    if (n >= 3 && !d.done[this.id]) {
      d.done[this.id] = true;
      const ups = addXp(this.def.xp);
      Music.play('victory');
      pages.push(`* ALCALDESA BELLOTA: ¡Tres cartas! Ya eres CARTERO OFICIAL del pueblo.\n* Ganaste ${this.def.xp} XP.`, '* ¡Se abrió el camino a la ESTACION VISOR!');
      if (ups) pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`);
      pages.push('* ALCALDESA BELLOTA: Y cuando quieras, búscame en tu pueblo.\n* ¡Me encantan los pueblos con museo!');
    }
    if (n >= 10 && happy >= 5 && Quests.state('diez_cartas') !== 'done') {
      if (!d.treasures.buzon_rojo) { d.treasures.buzon_rojo = true; pages.push('* ALCALDESA BELLOTA: ¡Diez cartas y cinco vecinos felices!\n* Toma: el BUZON ROJO de la alcaldía. (Se guardó en tu vitrina.)'); }
      Quests.complete('diez_cartas');
    }
    return pages;
  },

  // ---------- Carta libre (Turbo) ----------

  freeLetter() {
    this.phase = 'free';
    this.free = '';
    $('.co-to').textContent = 'PARA: ALCALDESA BELLOTA (CARTA LIBRE)';
    this.box.innerHTML = '<div class="co-dict">* Escribe lo que quieras. Mínimo 15 palabras.<br>* Empieza con MAYUSCULA y termina con punto. ENTER manda · ESC cancela.</div>';
    this.renderFree();
  },

  freeCheck() {
    const t = this.free.trim();
    const words = t.split(/\s+/).filter(Boolean).length;
    return { words, cap: /^[¿¡"]?[A-ZÁÉÍÓÚÑ]/.test(t), dot: /[.!?]$/.test(t) };
  },

  renderFree(err = '') {
    const ck = this.freeCheck();
    $('.co-body').innerHTML = `<div class="co-free">${esc(this.free)}<span class="co-caret">▌</span></div>
      <div class="co-rules"><span class="${ck.words >= 15 ? 'ok' : ''}">PALABRAS ${ck.words}/15</span>
      <span class="${ck.cap ? 'ok' : ''}">MAYUSCULA</span><span class="${ck.dot ? 'ok' : ''}">PUNTO FINAL</span></div>
      ${err ? `<div class="co-err">${esc(err)}</div>` : ''}`;
  },

  freeKey(e) {
    if (e.key === 'Escape') { this.menu(); return; }
    if (e.key === 'Backspace') { this.free = this.free.slice(0, -1); this.renderFree(); return; }
    if (e.key === 'Enter') {
      const ck = this.freeCheck();
      if (ck.words < 15) { Sfx.error(); this.renderFree(`Te faltan ${15 - ck.words} palabras.`); return; }
      if (!ck.cap) { Sfx.error(); this.renderFree('Empieza con mayúscula (usa SHIFT).'); return; }
      if (!ck.dot) { Sfx.error(); this.renderFree('Termina con un punto.'); return; }
      Sfx.spare();
      const d = GCS();
      d.libres = (d.libres || 0) + 1;
      Save.write();
      this.say([`* (Metes la carta al buzón. ¡Tlin!)\n* ${ck.words} palabras. ¡Qué bárbaro!`, '* RESPUESTA DE BELLOTA:\n* "¡Ay, la leí tres veces! Es la carta más bonita del buzón."'], () => this.menu());
      return;
    }
    if (e.key.length !== 1 || e.repeat || this.free.length > 400) return;
    Sfx.key();
    this.free += e.key;
    this.renderFree();
  },

  onKey(e) {
    if (this.phase === 'free') { this.freeKey(e); return; }
    if (this.phase === 'typing') {
      if (e.key === 'Escape') {
        this.ui.stop();
        this.ui = null;
        this.say(['* Guardas la carta en el cajón. Nadie la verá.\n* (Ni siquiera Bit. Prometido.)'], () => this.menu());
        return;
      }
      this.ui.key(e);
      return;
    }
    if (this.ui) this.ui.key(e);
  },
};
