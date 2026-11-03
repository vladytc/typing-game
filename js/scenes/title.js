// Pantalla de título, historia inicial y pantalla de "game over".

Scenes.title = {
  music: 'title',
  enter() {
    const d = Save.data;
    const started = d.seenIntro;
    Game.root.innerHTML = `
      <div class="title">
        <div class="title-sprite"></div>
        <h1>TECLA<br>QUEST</h1>
        <p class="sub">Una aventura para dedos veloces</p>
        <div class="title-menu"></div>
        <p class="hint">↑ ↓ elegir · ENTER aceptar</p>
      </div>`;
    $('.title-sprite').appendChild(spriteCanvas('pixelito', 5, false, 'bounce'));
    const items = [
      { label: started ? 'Continuar' : 'Comenzar', go: () => (started ? this.continuar() : Game.go('dificultad', { next: 'story' })) },
      { label: 'Vitrina', go: () => Game.go('vitrina', { back: 'title' }) },
      { label: 'Estadísticas', go: () => Game.go('stats', { back: 'title' }) },
      { label: `Dificultad: ${diff().name}`, go: () => Game.go('dificultad', { next: 'title' }) },
      { label: `Sonido: ${Sfx.muted ? 'NO' : 'SI'}`, go: () => this.toggleSound() },
    ];
    this.menu = new ListMenu($('.title-menu'), items, { onPick: (i) => items[i].go(), start: this.lastPick || 0 });
  },
  // Partidas de antes de que existiera Automática: preguntar una sola vez si se quieren cambiar.
  continuar() {
    const d = Save.data;
    if (d.difficulty === 'auto' || d.flags.autoPreguntado) { Game.go('town'); return; }
    d.flags.autoPreguntado = true;
    Save.write();
    Game.go('autoPregunta', { then: ['town', {}], ask: Auto.shouldSuggest() ? 'rapido' : 'nueva' });
  },
  toggleSound() {
    Sfx.muted = !Sfx.muted;
    Music.muted = Sfx.muted;
    Save.data.muted = Sfx.muted;
    Save.write();
    this.lastPick = 4;
    this.enter();
  },
  // Guiño al código más famoso de los videojuegos (Gradius, Contra...).
  onKey(e) {
    if (this.secret) {
      if (isConfirm(e)) { this.secret = false; findSecret('pueblo_konami').then(() => this.enter()); }
      return;
    }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    this.seq = (this.seq || []).concat(k).slice(-KONAMI.length);
    if (this.seq.join() === KONAMI.join()) { this.seq = []; this.unlockKonami(); return; }
    this.menu.key(e);
  },
  unlockKonami() {
    const first = !Save.data.konami;
    Save.data.konami = true;
    Save.write();
    Sfx.secret();
    this.secret = true;
    Game.root.insertAdjacentHTML('beforeend', `
      <div class="box secret-box">
        * ¡¡CODIGO SECRETO!!<br>
        * En 1988 este código daba 30 vidas en Contra.<br>
        * Aquí te da 3 Galletas Pixel extra en cada batalla.${first ? '' : '<br>* (Ya lo tenías activado. ¡Eres un experto!)'}
        <span class="more">▼</span>
      </div>`);
  },
};

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Elegir dificultad (se puede cambiar cuando quieras desde el título).
Scenes.dificultad = {
  music: 'title',
  enter({ next = 'title' }) {
    const ids = Object.keys(DIFFICULTIES);
    Game.root.innerHTML = `
      <div class="title diff">
        <h2>DIFICULTAD</h2>
        <div class="diff-menu"></div>
        <div class="box diff-desc"></div>
        <p class="hint">↑ ↓ elegir · ENTER aceptar · Puedes cambiarla después desde el título</p>
      </div>`;
    const show = (i) => { $('.diff-desc').textContent = `* ${DIFFICULTIES[ids[i]].desc}`; };
    const start = Math.max(0, ids.indexOf(Save.data.difficulty));
    this.menu = new ListMenu($('.diff-menu'), ids.map((id) => ({ label: DIFFICULTIES[id].name })), {
      start,
      onMove: show,
      onPick: (i) => {
        Save.data.difficulty = ids[i];
        Save.data.flags.autoPreguntado = true; // ya eligió: no volver a preguntar por Automática
        Save.write();
        Game.go(next);
      },
      onCancel: next === 'title' ? () => Game.go('title') : null,
    });
    show(start);
  },
  onKey(e) { this.menu.key(e); },
};

// Pregunta corta de una vez: cambiarse a Automática (partida vieja) o subir porque va muy rápido.
Scenes.autoPregunta = {
  music: 'title',
  enter({ then = ['town', {}], ask = 'rapido' }) {
    const d = Save.data;
    const text = ask === 'nueva'
      ? '* ¡Novedad! Dificultad AUTOMÁTICA: se ajusta sola a tu velocidad real.\n* ¿Quieres cambiarte? (Puedes cambiarla después desde el título.)'
      : '* ¡Wow! Vas a más de 60 PPM: tus dedos son muy rápidos para esta dificultad.\n* ¿Quieres subirle?';
    const opts = ask === 'nueva'
      ? [{ label: 'Sí, Automática', id: 'auto' }, { label: `No, seguir en ${diff().name}`, id: null }]
      : [{ label: 'Automática', id: 'auto' }, { label: 'Experto', id: 'experto' }, { label: `Seguir en ${diff().name}`, id: null }];
    if (ask !== 'nueva') { d.flags.autoSugerido = true; Save.write(); }
    Game.root.innerHTML = `
      <div class="title diff">
        <h2>DIFICULTAD</h2>
        <div class="box diff-desc">${esc(text).replace(/\n/g, '<br>')}</div>
        <div class="diff-menu"></div>
      </div>`;
    this.menu = new ListMenu($('.diff-menu'), opts, {
      onPick: (i) => {
        if (opts[i].id) d.difficulty = opts[i].id;
        Save.write();
        Game.go(then[0], then[1]);
      },
    });
  },
  onKey(e) { this.menu.key(e); },
};

Scenes.story = {
  music: 'title',
  enter() {
    Game.root.innerHTML = `
      <div class="story">
        <div class="story-art"></div>
        <div class="box story-box"><div class="tb-text"></div></div>
      </div>`;
    const art = $('.story-art');
    CONSOLES.filter((c) => !c.secret).forEach((c) => art.appendChild(spriteCanvas(c.id, 4, true)));
    this.dialog = new Dialog($('.story-box .tb-text'), INTRO_STORY, () => {
      Save.data.seenIntro = true;
      Save.write();
      Game.go('town');
    });
  },
  exit() { this.dialog.stop(); },
  onKey(e) { this.dialog.key(e); },
};

Scenes.gameover = {
  enter({ enemyId, back = 'map', scene = 'battle' }) {
    Save.write();
    Music.stop(); // guarda las estadísticas de tecleo aunque haya perdido
    Game.root.innerHTML = `
      <div class="gameover">
        <h1>GAME OVER</h1>
        <div class="go-heart">♥</div>
        <p>* ¡No te rindas!<br>* Tus dedos son más fuertes de lo que crees.</p>
        <div class="go-menu"></div>
      </div>`;
    const items = [
      { label: 'Reintentar', go: () => Game.go(scene, { enemyId, back }) },
      { label: back === 'town' ? 'Volver a explorar' : 'Volver al mapa', go: () => Game.go(back, back === 'town' ? {} : undefined) },
    ];
    this.menu = new ListMenu($('.go-menu'), items, { onPick: (i) => items[i].go() });
  },
  onKey(e) { this.menu.key(e); },
};
