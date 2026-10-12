// LA BATALLA FINAL: EL GLITCH (docs/LORE.md §10.3). Hereda de la batalla normal (js/scenes/battle.js).
//
//   Fase 1 "PAUSA" (paleta Game Boy, HP 200): en LUCHAR, cada 3ª palabra sale como [PAUSA] y se
//     destraba escribiendo CONTINUAR (en menos de 1.5 s = PERFECTO). En su turno, las letras se
//     CONGELAN 1 s a media caída y luego caen más rápido. ACTUAR no funciona: "No te oigo."
//     (Si Dani te prestó su Tecloide, aquí puedes llamarlo una vez: escribe su ataque.)
//   Fase 2 "REPETICION" (NES → Super → N64, HP 250): LUCHAR es un ECO de un jefe viejo, uno por
//     turno: Lord Caparazón (al ritmo, con mayúsculas), Reina Nébula (en la oscuridad, con acentos)
//     y Marco (dentro de un cuadro que se mueve). Sin errores = ¡ECO LIMPIO! (90 de daño).
//     Lluvia: palabras repetidas ("eco eco eco") que se escriben UNA vez. ACTUAR ya sirve.
//   Fase 3 "NOMBRE" (GameCube → Wii, HP 300): el Glitch pregunta; RESPONDER es contestar
//     escribiendo una de las frases que te dieron tus amigos (sin reloj). PERFECTA = PAZ +25 (si no, +15).
//     Lluvia de letras magenta que se vuelven del color del mundo al escribirlas.
//   Decisión: con PAZ 100, PERDONAR cambia a NOMBRAR: escribes un nombre (sin tiempo, sin errores
//     que cuenten, 2-12 letras) y se guarda en Save.data.glitchName. Si lo vences a 0 HP en la
//     fase 3 con LUCHAR, es el final neutral (se puede repetir desde la tele de la plaza).
// Si pierdes, "Reintentar" vuelve a la fase en la que ibas (Save.data.flags.finFase).

const FIN_FASES = {
  1: { hp: 200, theme: 'gb', music: 'fin_pausa', atk: 6, roto: 1 },
  2: { hp: 250, theme: 'nes', music: 'fin_repe', atk: 6, roto: 2 },
  3: { hp: 300, theme: 'gc', music: 'fin_nombre', atk: 4, roto: 3 },
};

const FIN_ECOS = [
  {
    id: 'caparazon', theme: 'nes', cls: 'fin-eco-metro', caps: true, who: 'LORD CAPARAZON',
    label: 'ECO DE LORD CAPARAZON: al ritmo y con MAYUSCULAS',
    words: ['Castillo', 'Bandera', 'Tubería', 'Moneda', 'Puente', 'Hongo', 'Ladrillo', 'Corona', 'Princesa', 'Martillo'],
    clean: '* Las franjas moradas se caen del eco de Lord Caparazón.\n* "¡BIENVENIDO! ...Una sola vez. Sin trabarme."',
  },
  {
    id: 'nebula', theme: 'snes', cls: 'fin-eco-oscuro', strict: true, who: 'REINA NEBULA',
    label: 'ECO DE LA REINA NEBULA: en la oscuridad',
    words: ['océano', 'medusa', 'galaxia', 'órbita', 'montaña', 'sueño', 'pequeño', 'música', 'niño', 'cañón'],
    clean: '* La mancha magenta del eco de la Reina Nébula se limpia.\n* Por un segundo, el mar del Reino brilla.',
  },
  {
    id: 'marco', theme: 'n64', cls: 'fin-eco-cuadro', who: 'MARCO',
    label: 'ECO DE MARCO: escribe dentro del cuadro',
    words: ['1996', 'cuadro', 'estrella', 'cámara', '4 puertos', 'polígono', '8 cuadros', 'castillo', 'niebla', '64'],
    clean: '* El cuadro deja de temblar. Ya no dice MISSING.\n* "Un cuadro ya es una pausa. No necesito al morado para eso."',
  },
];

// Preguntas de la fase 3 y lo que contesta el Glitch cuando le escribes una frase de un amigo.
const FIN_PREGUNTAS = [
  { q: '¿Por qué sigues? Ya rescataste todas las consolas.', r: '...¿Por ellos? ¿Todos ellos te dijeron eso?' },
  { q: 'Tú tampoco tienes nombre. Somos iguales. ...¿Verdad?', r: 'Pero a ti te dicen "tú". Te dicen "amigo".\n* ...A mí nadie me dice nada.' },
  { q: '¿Para qué sirve un juego que nadie terminó?', r: '...Nunca lo había pensado así.' },
  { q: '¿Y si un día te olvidan a ti también?', r: 'Ellos no te van a olvidar. ...Se nota.' },
  { q: '¿Por qué no me odias? Te apagué el mundo seis veces.', r: '...Eres muy raro. Raro bonito.' },
  { q: 'Si suelto la pausa... ¿qué va a pasar conmigo?', r: '...Tengo miedo. Pero menos que antes.' },
];

// ---------- La lluvia del Glitch: se congela, se repite o se arregla ----------
class FinDodge extends Dodge {
  start() {
    super.start();
    this.field.classList.add(`fin-dodge-${this.cfg.finMode}`);
    const lab = $('.dodge-label', this.box);
    if (lab) lab.textContent = { pausa: '¡Se congelan... y caen rápido!', rep: 'Lo repetido se escribe UNA vez', mag: 'Escríbelas: se vuelven de color' }[this.cfg.finMode] || lab.textContent;
  }

  spawn() {
    super.spawn();
    const b = this.bullets[this.bullets.length - 1];
    if (this.cfg.finMode === 'rep') {
      b.rep = true;
      this.renderBullet(b);
      const w = b.el.offsetWidth;
      b.x = 10 + Math.random() * Math.max(0, this.W - w - 20);
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    }
    if (this.cfg.finMode === 'mag') b.el.classList.add('fin-mag');
  }

  renderBullet(b) {
    const rest = b.rep ? `<span class="fin-rep"> ${esc(b.text)} ${esc(b.text)}</span>` : '';
    b.el.innerHTML = `<span class="t">${esc(b.text.slice(0, b.pos))}</span>${esc(b.text.slice(b.pos))}${rest}`;
  }

  // Igual que la lluvia normal, pero en la fase 1 cada palabra se congela 1 s a media caída.
  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.gap / diff().speed; // como la lluvia normal: no más seguido de lo que alcanza un niño
    }
    for (const b of [...this.bullets]) {
      let v = this.cfg.speed * diff().speed;
      if (this.cfg.finMode === 'pausa') {
        if (!b.froze && b.y > this.groundY * 0.3) { b.froze = this.elapsed + 1000; b.el.classList.add('fin-frozen'); }
        if (b.froze && this.elapsed < b.froze) v = 0;
        else if (b.froze) { v *= 1.7; b.el.classList.remove('fin-frozen'); }
      }
      b.y += v * dt;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      if (b.y + b.h >= this.groundY) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };
}

// ---------- El dibujo del Glitch: estática que se va acomodando ----------
class FinGlitchArt {
  constructor(host, scale = 9) {
    this.c = document.createElement('canvas');
    this.c.className = 'fin-art';
    this.c.width = this.c.height = 16 * scale + 24;
    this.scale = scale;
    this.jit = 1;
    this.sprite = 'glitch';
    host.innerHTML = '';
    host.appendChild(this.c);
    this.g = this.c.getContext('2d');
    this.iv = setInterval(() => this.draw(), 80);
    this.draw();
  }

  draw() {
    const { g, scale: k } = this;
    const rows = SPRITES[this.sprite];
    if (!g || !rows || !g.clearRect) return;
    const pal = { ...SPRITE_PALETTES[this.sprite], ...(rows.pal || {}) };
    const j = this.jit;
    g.clearRect(0, 0, this.c.width, this.c.height);
    rows.forEach((row, y) => {
      const off = Math.random() < j * 0.45 ? Math.round((Math.random() - 0.5) * j * 7) : 0;
      for (let x = 0; x < 16; x++) {
        const ch = row[x];
        if (!ch || ch === '.') continue;
        let col = pal[ch];
        if (j > 0.05 && Math.random() < j * 0.12) col = rand(['#FF00FF', '#444444', '#FFFFFF']);
        g.fillStyle = col;
        g.fillRect(12 + (x + off) * k, 12 + y * k, k, k);
      }
    });
    // Píxeles sueltos y rayas de "señal mala" alrededor.
    const n = Math.round(j * 26);
    for (let i = 0; i < n; i++) {
      g.fillStyle = Math.random() < 0.6 ? '#FF00FF' : '#555555';
      g.fillRect(Math.floor(Math.random() * this.c.width / k) * k, Math.floor(Math.random() * this.c.height / k) * k, k, k);
    }
    if (Math.random() < j * 0.5) {
      g.fillStyle = 'rgba(255, 0, 255, 0.35)';
      g.fillRect(0, Math.random() * this.c.height, this.c.width, 3 + Math.random() * 6);
    }
  }

  stop() { clearInterval(this.iv); }
}

Scenes.fin = Object.assign(Object.create(Scenes.battle), {
  enter(params = {}) {
    const fase = Math.min(3, Math.max(1, params.fase || Save.data.flags.finFase || 1));
    this.fase = 0;
    this.ecoIdx = 0;
    this.qIdx = 0;
    this.used = new Set();
    this.warned = false;
    this.daniUsed = false;
    this.maxHp = FIN_FASES[fase].hp;
    if (!Save.data.finalPhrases || !Save.data.finalPhrases.length) Save.data.finalPhrases = finCollectPhrases();
    Scenes.battle.enter.call(this, { enemyId: 'glitch', back: params.back || 'town' });
    this.dialog.stop();
    $('.battle').classList.add('fin-battle', 'fin-roto-0');
    this.art = new FinGlitchArt($('.esprite'));
    this.p.hp = this.p.max;
    this.updateBars();
    const retry = fase > 1 || Save.data.flags.finVisto;
    Save.data.flags.finVisto = true;
    Save.write();
    const pages = retry ? [
      '* (La estática vuelve a zumbar.)',
      `* EL GLITCH: ${finRuido('¿Otra vez tú? ...Está bien. Te estaba esperando.', fase === 3 ? 0 : 9)}`,
      fase > 1 ? `* BIT: ¡Seguimos donde nos quedamos! FASE ${fase}.` : '* BIT: ¡Vamos otra vez! ¡Tú puedes!',
    ] : this.introPages();
    this.say(pages, () => this.startFase(fase));
  },

  introPages() {
    const d = Save.data;
    const pages = [
      '* ...',
      '* (Todo está negro. Al fondo, una estática magenta zumba bajito.)',
      `* ???: ${finRuido('Llegaste. Bienvenido al Canal Vacío.', 6)}`,
      `* ???: ${finRuido('Aquí iba a estar mi juego. Mi pantalla de título. Mi música.', 6)}`,
      `* ???: ${finRuido('Pero en 1989 hubo un apagón. Alguien apagó la consola sin guardar.', 7)}\n* ${finRuido('Y yo me quedé así. Sin terminar.', 7)}`,
    ];
    if (d.treasures.etiqueta_blanca) pages.push(`* ???: ${finRuido('Esa etiqueta en blanco que traes... era mía.', 8)}\n* ${finRuido('La guardaba para cuando tuviera nombre.', 8)}`);
    if (d.treasures.caja_prototipo) pages.push(`* ???: ${finRuido('Y la caja de Don Chip. "Protagonista: sin nombre." Soy yo.', 8)}`);
    pages.push(
      `* EL GLITCH: ${finRuido('Si todo se queda en PAUSA, nadie apaga nada.', 8)}\n* ${finRuido('Nadie cierra la vitrina. Nadie olvida a nadie.', 8)}`,
      `* EL GLITCH: ${finRuido('...Ni a mí.', 8)}`,
      '* BIT: Es él. El del cartucho sin nombre.\n* ¡Hay que sacarlo de esta pausa!',
    );
    return pages;
  },

  exit() {
    if (this.art) this.art.stop();
    Scenes.battle.exit.call(this);
  },

  // ---------- Fases ----------

  setTheme(era) {
    document.body.className = `theme-${era}`;
  },

  startFase(n) {
    const F = FIN_FASES[n];
    this.fase = n;
    Save.data.flags.finFase = n;
    Save.write();
    this.maxHp = F.hp;
    this.e.hp = F.hp;
    if (n === 1) this.e.mercy = 0;
    if (n === 2) this.e.mercy = Math.min(this.e.mercy, 40);
    this.def.atk = F.atk;
    // Cada fase empieza con la vida llena (igual que "Reintentar", que vuelve a la fase con todo el HP):
    // con 100 HP para las tres fases seguidas, un niño de ~30 PPM casi nunca llegaba a la fase 3.
    if (n > 1 && this.p.hp < this.p.max) { this.p.hp = this.p.max; Sfx.heal(); }
    this.setTheme(n === 2 ? FIN_ECOS[this.ecoIdx % 3].theme : F.theme);
    Music.play(F.music);
    const bt = $('.battle');
    bt.classList.remove('fin-roto-0', 'fin-roto-1', 'fin-roto-2', 'fin-roto-3');
    bt.classList.add(`fin-roto-${F.roto}`);
    this.art.jit = [1, 0.8, 0.55, 0.3][n];
    this.updateBars();
    this.renderCmds();
    const pages = {
      1: ['* ¡EL GLITCH te congela la pantalla!\n* FASE 1: PAUSA.', '* (En LUCHAR, algunas palabras salen como [PAUSA].\n* Escribe CONTINUAR para destrabarlas.)'],
      2: ['* FASE 2: REPETICION.\n* (En LUCHAR, cada ECO es un jefe viejo. Sin errores = ¡ECO LIMPIO!)', '* BIT: ¡Y mira! ACTUAR ya funciona.\n* Creo que... empieza a oírnos.'],
      3: ['* FASE 3: NOMBRE.\n* (Usa RESPONDER: contesta con las frases que te dieron tus amigos.\n* No hay reloj. Escríbelas con cariño.)'],
    }[n];
    this.say(pages, () => this.toMenu());
  },

  endFase1() {
    this.say([
      '* ¡La pausa se rompe en mil pedacitos!',
      `* EL GLITCH: ${finRuido('¿No te quedas quieto? Entonces... otra vez.', 10)}\n* ${finRuido('Y otra vez. Y otra vez. Y otra vez.', 10)}`,
      '* (La pantalla se llena de colores de la NES. Luego de la Super. Luego de polígonos.)',
      '* BIT: ¡Está repitiendo a los jefes que perdonaste!\n* ¡Con sus mismas mecánicas!',
    ], () => this.startFase(2));
  },

  endFase2() {
    this.say([
      '* Los ecos se apagan uno por uno.',
      `* EL GLITCH: ${finRuido('...Ya no sé qué más repetir.', 14)}`,
      '* (Los colores se ponen brillantes, como de plástico recién sacado de la caja.)',
      '* EL GLITCH: Oye.\n* ...¿Puedo preguntarte algo?',
      '* BIT: ¡Ya habla limpio! ¡Ni una letra rota!',
    ], () => this.startFase(3));
  },

  // ---------- Interfaz ----------

  updateBars() {
    const max = this.maxHp || this.def.hp;
    $('.ehp i').style.width = `${(this.e.hp / max) * 100}%`;
    $('.emercy i').style.width = `${this.e.mercy}%`;
    $('.ename').classList.toggle('spareable', this.fase === 3 && this.e.mercy >= 100);
    $('.pbar i').style.width = `${(this.p.hp / this.p.max) * 100}%`;
    $('.phpn').textContent = `${this.p.hp}/${this.p.max}`;
  },

  renderCmds() {
    const labels = ['LUCHAR', this.fase === 3 ? 'RESPONDER' : 'ACTUAR', 'OBJETO', this.fase === 3 && this.e.mercy >= 100 ? 'NOMBRAR' : 'PERDONAR'];
    document.querySelectorAll('.cmd').forEach((c, i) => {
      if (c.textContent !== labels[i]) c.textContent = labels[i];
      c.classList.toggle('sel', i === this.cmd);
      c.classList.toggle('fin-nombrar', labels[i] === 'NOMBRAR');
    });
    $('.hud').classList.toggle('inactive', this.phase !== 'menu');
  },

  toMenu() {
    this.phase = 'menu';
    this.renderCmds();
    this.box.innerHTML = '<div class="tb-text"></div>';
    let text;
    if (this.fase === 1) text = rand(['* El Glitch no se mueve. Nada se mueve.', '* Una letra se quedó flotando en el aire. No cae.', `* EL GLITCH: ${finRuido('Shhh. Todo está en pausa.', 8)}`]);
    else if (this.fase === 2) text = rand(['* El Glitch cambia de forma: un caparazón, una medusa, un cuadro...', `* EL GLITCH: ${finRuido('Otra vez. Otra vez. Otra vez.', 12)}`, '* Huele a cartucho viejo y a pila nueva.']);
    else if (this.e.mercy >= 100) text = `* El Glitch espera.\n* Arriba de su cabeza: NOMBRE: _______\n* ¡Usa NOMBRAR!`;
    else text = rand(['* El Glitch te mira. Espera tu respuesta.', '* La estática suena bajito. Casi parece música.', '* El Glitch se sienta en el piso del canal. Ya no flota.']);
    this.dialog = new Dialog($('.tb-text', this.box), [text], null, { wait: false });
  },

  // runTask de la batalla, con un "decorado" opcional antes de empezar.
  runTask(opts) {
    this.phase = 'typing';
    this.renderCmds();
    const { onDone, onUnit, decorate } = opts;
    this.task = new TypingTask(this.box, {
      caps: !!opts.caps,
      strict: !!opts.strict,
      ...opts,
      onUnit: (unit) => (onUnit ? onUnit(unit) : true),
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        onDone(res);
      },
    });
    if (decorate) decorate(this.task);
    this.task.start();
  },

  // ---------- LUCHAR ----------

  fight() {
    if (this.fase === 2) { this.eco(); return; }
    if (this.fase === 3 && !this.warned && this.e.hp <= this.maxHp * 0.4) {
      this.warned = true;
      this.say(['* BIT: Oye... espera.', '* BIT: Si le seguimos pegando, se va a desarmar en estática.\n* ¿Y si mejor le contestamos? (RESPONDER)'], () => {
        this.subMenu([{ label: 'Seguir peleando' }, { label: 'Mejor no' }], (i) => (i === 0 ? this.doFight() : this.toMenu()));
      });
      return;
    }
    this.doFight();
  },

  doFight() {
    let words = pickWords(this.def.words, this.fase === 1 ? 6 : 5);
    if (this.fase === 1) words = words.map((w, i) => (i % 3 === 2 ? 'continuar' : w));
    const total = words.join('').length;
    let dealt = 0;
    this.runTask({
      label: this.fase === 1 ? '¡LUCHAR! [PAUSA] = escribe CONTINUAR' : '¡LUCHAR! Escribe rápido:',
      texts: words,
      timeLimit: total * 560 + 2500,
      decorate: (task) => {
        if (this.fase !== 1) return;
        const base = task.render.bind(task);
        task.render = (err) => {
          base(err);
          task.wordsEl.querySelectorAll('.w').forEach((el, j) => {
            if (task.texts[j] !== 'continuar') return;
            if (j > task.i) { el.textContent = '[PAUSA]'; el.classList.add('fin-pausa'); } else if (j === task.i) el.classList.add('fin-pausa-cur');
          });
        };
      },
      onUnit: (unit) => {
        let { dmg, perfect } = this.damageFor(unit);
        if (unit.text === 'continuar') {
          perfect = unit.errors === 0 && unit.ms < 1500;
          if (perfect) dmg = Math.round(dmg * 1.3);
        }
        dealt += dmg;
        if (perfect) this.st.perfect++;
        this.e.hp = Math.max(0, this.e.hp - dmg);
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(unit.text === 'continuar' ? (perfect ? `¡DESTRABADO! -${dmg}` : `-${dmg}`) : (perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`), perfect ? 'crit' : '');
        this.shake('.esprite');
        this.updateBars();
        return this.e.hp > 0;
      },
      onDone: (res) => {
        if (this.e.hp <= 0) {
          if (this.fase === 1) this.later(() => this.endFase1(), 600);
          else this.later(() => this.neutral(), 600);
          return;
        }
        const pages = [];
        if (dealt === 0) pages.push('* ¡Se acabó el tiempo! No lograste atacar.');
        else if (res.completed) pages.push(`* ¡Combo completo! Hiciste ${dealt} de daño.`);
        else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
        if (this.fase === 3) pages.push(`* EL GLITCH: ...Así terminan todos los juegos, ¿verdad? Peleando.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  // Fase 2: un ECO de un jefe viejo (uno por turno).
  eco() {
    const E = FIN_ECOS[this.ecoIdx % 3];
    this.setTheme(E.theme);
    const words = pickWords(E.words, 4);
    this.runTask({
      label: E.label,
      texts: words,
      timeLimit: 20000,
      caps: !!E.caps,
      strict: !!E.strict,
      decorate: (task) => {
        const base = task.start.bind(task);
        task.start = () => {
          base();
          this.box.querySelector('.tt').classList.add(E.cls);
          if (E.id === 'caparazon') this.box.querySelector('.tt').insertAdjacentHTML('beforeend', '<div class="fin-metro"><i></i><i></i><i></i><i></i></div>');
          if (E.id === 'marco') this.box.querySelector('.tt').insertAdjacentHTML('beforeend', '<div class="fin-marco-tag">MISSING</div>');
        };
      },
      onUnit: () => { Sfx.key(); return true; },
      onDone: (res) => {
        this.ecoIdx++;
        let dmg;
        let text;
        if (res.completed && res.errors === 0) { dmg = 90; text = `¡ECO LIMPIO! -${dmg}`; Sfx.crit(); this.st.perfect++; } else if (res.completed) { dmg = 55; text = `-${dmg}`; Sfx.hit(); } else { dmg = Math.round(40 * res.progress); text = dmg ? `-${dmg}` : 'NADA'; if (dmg) Sfx.hit(); }
        this.e.hp = Math.max(0, this.e.hp - dmg);
        this.floatText(text, res.completed && !res.errors ? 'crit' : '');
        if (dmg) this.shake('.esprite');
        this.updateBars();
        if (this.e.hp <= 0) { this.later(() => this.endFase2(), 600); return; }
        const pages = [];
        if (res.completed && res.errors === 0) pages.push(E.clean);
        else if (res.completed) pages.push(`* El eco de ${E.who} se tambalea. Hiciste ${dmg} de daño.\n* (Sin errores sería un ECO LIMPIO.)`);
        else pages.push(`* El eco de ${E.who} sigue repitiéndose... Hiciste ${dmg} de daño.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  // ---------- ACTUAR / RESPONDER ----------

  actMenu() {
    if (this.fase === 3) { this.responder(); return; }
    const d = Save.data;
    if (this.fase === 1) {
      const items = [{ label: 'Revisar' }, { label: 'Hablar' }];
      const tec = d.flags.daniPresta && TECLOIDES[d.flags.daniPresta];
      if (tec && !this.daniUsed) items.push({ label: tec.name });
      this.subMenu(items, (i) => {
        if (i === 0) { this.say([this.def.check, '* (Ahora mismo no escucha nada. Está en PAUSA.)'], () => this.toMenu()); return; }
        if (i === 1) { this.say(['* Le hablas al Glitch.', `* EL GLITCH: ${finRuido('...No te oigo.', 6)}`, '* BIT: No nos escucha... todavía.'], () => this.enemyTurn()); return; }
        this.daniTecloide(tec);
      });
      return;
    }
    const acts = [
      { name: 'Escuchar', text: 'te quedas quieto y lo escuchas', mercy: 25, reply: '* EL GLITCH: ...Nadie se había quedado quieto para oírme.\n* Ni el cursor.' },
      { name: 'Hermano', text: 'bit dice que lo recuerda', mercy: 35, reply: '* BIT: Yo era tu cursor. Me escapé por el cable del teclado...\n* ¡Perdóname, hermano mayor!', reply2: '* EL GLITCH: ...¿Bit? ¿Eres tú? Te busqué en cada mundo.' },
    ];
    if (d.treasures.etiqueta_blanca) acts.push({ name: 'Etiqueta', text: 'le enseñas la etiqueta en blanco', mercy: 30, reply: '* EL GLITCH: Esa etiqueta... la guardé para cuando tuviera nombre.\n* ...Nunca llegó.' });
    if (d.treasures.caja_prototipo) acts.push({ name: 'Caja', text: 'le cuentas que don chip nunca tiró su caja', mercy: 30, reply: '* EL GLITCH: ...¿Nunca? ¿En treinta años?\n* ...Nunca.' });
    this.subMenu([{ label: 'Revisar' }, ...acts.map((a) => ({ label: a.name }))], (i) => {
      if (i === 0) { this.say(['* EL GLITCH - Repite a los jefes que ya perdonaste.\n* Cada ECO LIMPIO lo destraba un poco.'], () => this.toMenu()); return; }
      this.act2(acts[i - 1]);
    });
  },

  // El Tecloide que Dani te prestó (Mundo 6): una vez por batalla, escribe su ataque más fuerte.
  daniTecloide(tec) {
    this.daniUsed = true;
    const mv = tec.moves[tec.moves.length - 1];
    this.say([`* ¡${upper(tec.name)}, el Tecloide de Dani, salta de tu bolsillo!`, `* ¡Escribe su ataque: ${upper(mv.name)}!`], () => {
      this.runTask({
        label: `${upper(tec.name)}: ${upper(mv.name)}`,
        texts: [mv.word],
        timeLimit: mv.word.length * 700 + 2500,
        strict: true,
        onDone: (res) => {
          const dmg = res.completed ? (res.errors ? 40 : 60) : 15;
          this.e.hp = Math.max(0, this.e.hp - dmg);
          Sfx.crit();
          this.floatText(`-${dmg}`, 'crit');
          this.shake('.esprite');
          this.updateBars();
          if (this.e.hp <= 0) { this.later(() => this.endFase1(), 600); return; }
          this.say([`* ¡${upper(mv.name)}! La pausa se agrieta. Hiciste ${dmg} de daño.`, '* (Desde muy lejos se oye a Dani: "¡ESO! ¡Ese es MI Tecloide!")'], () => this.enemyTurn());
        },
      });
    });
  },

  act2(a) {
    this.runTask({
      label: `ACTUAR: ${a.name}`,
      texts: [a.text],
      timeLimit: a.text.length * 600 + 3000,
      onDone: (res) => {
        const gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
        const was = this.e.mercy;
        this.e.mercy = Math.min(40, this.e.mercy + gain); // en la fase 2 la PAZ llega hasta 40
        if (this.e.mercy > was) { Sfx.mercy(); this.floatText(`PAZ +${this.e.mercy - was}%`, 'mercy'); }
        this.updateBars();
        const pages = res.completed ? [a.reply, ...(a.reply2 ? [a.reply2] : [])] : ['* ¡Casi! Se acabó el tiempo antes de terminar.'];
        if (res.completed && this.e.mercy >= 40 && was < 40) pages.push('* (El Glitch ya escucha... pero mientras repita a los jefes, no puede contestar.)');
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  // Fase 3: el Glitch pregunta y contestas escribiendo la frase de un amigo (sin reloj).
  responder() {
    const Q = FIN_PREGUNTAS[this.qIdx % FIN_PREGUNTAS.length];
    this.qIdx++;
    const opts = this.pickPhrases(this.e.mercy >= 80);
    this.say([`* EL GLITCH: ${Q.q}`], () => {
      this.phase = 'typing';
      this.renderCmds();
      const cp = new ChoicePrompt(this.box, opts.map((o) => o.frase), (i, { errors }) => {
        const o = opts[i];
        this.used.add(o.frase);
        this.st.chars += o.frase.length;
        this.st.errors += errors;
        const perfect = errors === 0;
        const gain = perfect ? 25 : 15; // 4 o 5 respuestas (con 20/12 eran 7 turnos y la fase se hacía eterna)
        const dmg = perfect ? 40 : 20;
        const was = this.e.mercy;
        this.e.mercy = Math.min(100, this.e.mercy + gain);
        this.e.hp = Math.max(1, this.e.hp - dmg);
        Sfx.mercy();
        this.floatText(perfect ? `¡LE LLEGA! PAZ +${this.e.mercy - was}%` : `PAZ +${this.e.mercy - was}%`, 'mercy');
        this.updateBars();
        if (this.e.mercy >= 60) this.setTheme('wii');
        this.art.jit = Math.max(0.05, 0.3 * (1 - this.e.mercy / 100));
        const pages = [
          `* (Escribes la frase de ${o.quien}.)\n* "${o.frase}"`,
          o.quien === 'BIT' ? '* BIT: ...Lo dije bajito. Pero lo dije en serio.' : null,
          `* EL GLITCH: ${Q.r}`,
        ].filter(Boolean);
        if (this.e.mercy >= 100 && was < 100) {
          pages.push(
            '* EL GLITCH: ¿Sabes qué es lo peor de no tener nombre?\n* ...Que nadie te puede llamar.',
            '* (Arriba de su cabeza se abre una ventana vieja, de 1989.)\n*\n*      NOMBRE: _______',
            '* BIT: ¡Mira el último botón! PERDONAR cambió...\n* ¡Ahora dice NOMBRAR!',
          );
          this.say(pages, () => this.toMenu());
          return;
        }
        this.say(pages, () => this.enemyTurn());
      }, { prompt: 'Contesta escribiendo la frase de un amigo:', tags: opts.map((o) => o.quien) });
      cp.stop = () => { cp.done = true; };
      this.task = cp;
    });
  },

  // Tres frases distintas (sin repetir las usadas y con distinta primera letra, para que no se confundan).
  pickPhrases(withBit) {
    const all = Save.data.finalPhrases || [];
    let pool = all.filter((p) => !this.used.has(p.frase) && p.quien !== 'BIT');
    if (pool.length < 3) pool = all.filter((p) => p.quien !== 'BIT');
    pool = [...pool].sort(() => Math.random() - 0.5);
    const out = [];
    const bit = all.find((p) => p.quien === 'BIT');
    if (withBit && bit && !this.used.has(bit.frase)) out.push(bit);
    const first = (p) => norm(p.frase[0]);
    for (const p of pool) {
      if (out.length >= 3) break;
      if (!out.some((o) => first(o) === first(p))) out.push(p);
    }
    for (const p of pool) {
      if (out.length >= 3) break;
      if (!out.includes(p) && !out.some((o) => o.frase.startsWith(p.frase) || p.frase.startsWith(o.frase))) out.push(p);
    }
    return out.sort(() => Math.random() - 0.5);
  },

  // ---------- PERDONAR / NOMBRAR ----------

  mercy() {
    if (this.fase === 3 && this.e.mercy >= 100) { this.nombrar(); return; }
    const pages = this.fase === 1
      ? ['* Le ofreces la paz al Glitch...', `* EL GLITCH: ${finRuido('...No te oigo.', 6)}`]
      : ['* Le ofreces la paz al Glitch...', '* ...pero todavía no puede soltar la pausa.\n* (Llena la barra de PAZ.)'];
    this.say(pages, () => this.enemyTurn());
  },

  nombrar() {
    this.say(['* Te acercas a la ventana vieja.', '* EL GLITCH: Nadie ha escrito aquí nunca.\n* ...¿Tú quieres?'], () => this.openName());
  },

  openName() {
    Music.stop();
    this.phase = 'nombrar';
    this.renderCmds();
    this.nameBuf = '';
    const ov = document.createElement('div');
    ov.className = 'fin-nombre';
    ov.innerHTML = `
      <div class="fn-head">PROTOTIPO · 1989 · SIN TITULO</div>
      <div class="fn-q">ESCRIBE SU NOMBRE</div>
      <div class="fn-line">NOMBRE: <span class="fn-name"></span><span class="fn-cur">_</span><span class="fn-rest"></span></div>
      <div class="fn-hint">Sin prisa. Aquí no hay errores ni reloj.<br>2 a 12 letras · BORRAR corrige · ENTER listo</div>
      <div class="fn-ask"></div>`;
    $('.battle').appendChild(ov);
    this.nameEl = ov;
    this.renderName();
  },

  renderName() {
    const shown = upper(this.nameBuf);
    $('.fn-name', this.nameEl).textContent = shown;
    $('.fn-rest', this.nameEl).textContent = '_'.repeat(Math.max(0, 11 - shown.length));
    $('.fn-cur', this.nameEl).classList.toggle('hidden', this.nameBuf.length >= 12);
  },

  nameKey(e) {
    if (e.key === 'Backspace') {
      if (this.nameBuf) { this.nameBuf = this.nameBuf.slice(0, -1); Sfx.move(); this.renderName(); }
      return;
    }
    if (e.key === 'Enter') {
      const name = this.nameBuf.trim();
      if (name.replace(/[\s-]/g, '').length < 2) {
        const h = $('.fn-hint', this.nameEl);
        h.classList.remove('fn-nudge');
        void h.offsetWidth;
        h.classList.add('fn-nudge');
        Sfx.move();
        return;
      }
      this.askName(name);
      return;
    }
    if (e.key.length !== 1 || e.repeat) return;
    const ch = e.key;
    if (!/[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ \-]/.test(ch)) return;
    if (ch === ' ' && (!this.nameBuf || this.nameBuf.endsWith(' '))) return;
    if (this.nameBuf.length >= 12) { Sfx.bump(); return; }
    this.nameBuf += ch;
    finNote(FIN_MELODIA[(this.nameBuf.length - 1) % FIN_MELODIA.length]);
    this.renderName();
  },

  askName(name) {
    this.phase = 'nombrar-ok';
    const box = $('.fn-ask', this.nameEl);
    this.task = new ChoicePrompt(box, ['sí', 'no'], (i) => {
      box.innerHTML = '';
      if (i === 1) { this.phase = 'nombrar'; this.task = null; return; }
      this.compile(name);
    }, { prompt: `¿Se llama "${upper(name)}"? (escribe sí o no)` });
    this.task.stop = () => { this.task.done = true; };
  },

  // ¡Se "compila" por primera vez!
  compile(raw) {
    const name = raw.replace(/\s+/g, ' ').trim();
    const nice = name[0].toUpperCase() + name.slice(1);
    Save.data.glitchName = nice;
    Save.write();
    this.phase = 'busy';
    this.nameEl.classList.add('fn-out');
    setTimeout(() => { if (this.nameEl) this.nameEl.remove(); }, 900);
    FIN_MELODIA.forEach((n, i) => setTimeout(() => finNote(n, 0.3, 0.04, 'triangle'), i * 140));
    this.later(() => {
      this.art.stop();
      this.art.sprite = 'glitch_ok';
      this.art.jit = 0;
      this.art.draw();
      $('.esprite').classList.add('fin-compilado');
      $('.ename').textContent = upper(nice);
      $('.ename').classList.remove('spareable');
      this.cmd = 0;
      this.fase = 4; // ya no hay botón NOMBRAR
      this.renderCmds();
      $('.battle').classList.remove('fin-roto-3');
      this.setTheme('wii');
      Music.play('town');
      const N = upper(nice);
      const k = norm(nice);
      const pages = [
        `* (Escribes: ${N}.)`,
        '* ¡Los píxeles del Glitch dejan de temblar!\n* Se acomodan uno por uno, como cuando por fin GUARDAS la partida.',
        `* ${N}: ...${nice}.\n* Me llamo ${nice}.`,
      ];
      if (k === 'glitch' || k === 'el glitch') pages.push(`* ${N}: ...Así me decían todos. Pero cuando TÚ lo escribes...\n* suena distinto. Suena a nombre. Me lo quedo.`);
      else if (k === 'bit') pages.push('* BIT: ¡Oye! ¡Ese es MI nombre!\n* ...Bueno. Dos hermanos con el mismo nombre. Como en las telenovelas.');
      else if (k === 'nadie' || k === 'sin nombre') pages.push(`* ${N}: Je. ¿${nice}? Ahora "${nice}" es alguien.\n* ...Eres muy chistoso.`);
      else if (k.includes('chip')) pages.push(`* ${N}: ¿Como Don Chip? ...Él me guardó treinta años en un cajón.\n* Me gusta. Es como un apellido.`);
      else pages.push(`* ${N}: ${nice}... Lo repito bajito para que no se me olvide.\n* ${nice}. ${nice}. ...Me gusta.`);
      pages.push(
        `* ${N}: Gracias por escribirlo.\n* Nadie lo había hecho en treinta años.`,
        '* BIT: ¡HERMANO! ...Digo. Hola, hermano.\n* Ya no das miedo. ¡Ahora das... ternura!',
        `* ${N}: Tú tampoco, cursor. ...Bueno, un poquito.`,
        `* ${N}: Las consolas ya pueden apagarse cuando quieran.\n* Ya sé que nadie las va a olvidar. Ni a mí.`,
        `* ${N}: ...¿Puedo ir al pueblo? ¿Hay lugar para alguien como yo?`,
        '* BIT: ¡Claro! Hay una banca junto a la vitrina.\n* Nadie se sienta ahí. Te estaba esperando.',
      );
      this.say(pages, () => this.finish('bueno'));
    }, 1000);
  },

  // ---------- Final neutral: lo venciste peleando ----------

  neutral() {
    this.cleanup();
    $('.esprite').classList.add('fin-desarma');
    this.art.jit = 1.2;
    Music.stop();
    Sfx.lose();
    this.say([
      '* El Glitch se desarma en estática...',
      '* EL GLITCH: ...Ya veo. Así termina siempre.\n* Peleando. Y sin nombre.',
      '* (La estática se junta en un cartucho gris, sin etiqueta.)',
      '* BIT: ...',
      '* BIT: ...Creo que había otra forma.\n* Si quieres, un día volvemos. La tele de la plaza sigue prendida.',
    ], () => this.finish('neutral'));
  },

  // ---------- Fin: estadísticas, recompensas y créditos ----------

  finish(final) {
    this.cleanup();
    const d = Save.data;
    const wpm = this.st.ms > 0 ? Math.round((this.st.chars / 5) / (this.st.ms / 60000)) : 0;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    Stats.addBattle({ enemy: 'glitch', wpm, acc, date: Date.now() });
    addXp(this.def.xp);
    d.done.glitch = true;
    d.treasures.fin_cartucho = true;
    d.flags.finJugado = true;
    d.flags.finFase = 1;
    d.flags.finWpm = wpm;
    d.flags.finAcc = acc;
    d.flags.finEpilogo = final;
    if (final === 'bueno') {
      d.flags.finBueno = true;
      if (Quests.state('fin_nombre') === 'active') Quests.complete('fin_nombre');
    } else {
      d.flags.finNeutral = true;
      Quests.start('fin_nombre');
    }
    Quests.complete('wii_canal_vacio');
    Save.write();
    Game.go('fincreditos', { final });
  },

  // ---------- Turno del Glitch ----------

  enemyTurn() {
    this.phase = 'busy';
    this.renderCmds();
    this.box.innerHTML = '';
    const bubble = $('.bubble');
    bubble.textContent = this.fase === 1 ? finRuido(rand(['Quieto.', 'Pausa.', 'Shhh.', 'Nadie se mueve.']), 5)
      : this.fase === 2 ? finRuido(rand(['Otra vez.', '¡Repite!', 'Igual que antes.', 'Eco, eco, eco.']), 9)
        : rand(['Perdón por la lluvia.', 'No sé hacer otra cosa.', '...Ya casi no duele, ¿verdad?']);
    bubble.classList.remove('hidden');
    this.later(() => {
      bubble.classList.add('hidden');
      this.startDodge();
    }, 1500);
  },

  startDodge() {
    this.phase = 'dodge';
    const cfg = {
      1: { count: 10, interval: 1150, speed: 34, finMode: 'pausa', pool: this.def.bullets.pool },
      2: { count: 9, interval: 1300, speed: 32, finMode: 'rep', pool: ['nombre', 'pausa', 'igual', 'siempre', 'repite', 'eco', 'copia', 'otra', 'vez', 'nada'] },
      3: { count: 7, interval: 1150, speed: 34, finMode: 'mag', pool: ['luz', 'casa', 'amigo', 'banca', 'pueblo', 'hola', 'juntos', 'vitrina', 'guardar', 'recuerdo', 'nombre'] },
    }[this.fase];
    this.dodge = new FinDodge(this.box, cfg, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(this.def.atk));
        this.updateBars();
        this.shake('.pinfo');
        if (this.p.hp <= 0) {
          this.dodge.stop();
          this.phase = 'busy';
          this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: 'glitch', back: this.back, scene: 'fin' }); }, 600);
        }
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.toMenu();
      },
    });
    this.dodge.start();
  },

  onKey(e) {
    if (this.phase === 'nombrar') { this.nameKey(e); return; }
    if (this.phase === 'nombrar-ok') { if (this.task) this.task.key(e); return; }
    Scenes.battle.onKey.call(this, e);
  },
});
