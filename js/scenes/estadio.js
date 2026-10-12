// ESTADIO POLÍGONO — Dani Turbo, Tecloides 3 vs 3 con público (guiño a Pokémon Stadium, N64).
// Es la MISMA batalla de Tecloides (js/scenes/tecloides.js): esta escena hereda de ella y solo
// agrega el estadio 3D de fondo (gradas con público que salta), un locutor que comenta en texto
// y la regla del lore: la palabra para esquivar aparece con 0.3 s menos de tiempo.
// Los Tecloides siguen siendo sprites 2D encima del 3D (como figuritas en la cancha): así la
// lógica de la batalla no se toca y, si no hay 3D, se juega igual que siempre.

const LOCUTOR = {
  hit: ['¡Y ESE ATAQUE FUE MUY EFICAZ, QUERIDO PÚBLICO!', '¡QUÉ GOLPE! ¡LAS GRADAS TIEMBLAN!', '¡EL PÚBLICO ENLOQUECE!', '¡ESO SE ESCRIBIÓ A TODA VELOCIDAD!'],
  hurt: ['¡AUCH! ESO DOLIÓ HASTA EN LAS GRADAS.', '¡DANI NO SE QUEDA ATRÁS, SEÑORAS Y SEÑORES!', '¡UF! ¡QUÉ RESPUESTA DEL RIVAL!'],
  start: ['¡BIENVENIDOS AL ESTADIO POLÍGONO!', '¡CUATRO PUERTOS, MILES DE FANS!'],
};

Scenes.estadio = Object.assign(Object.create(Scenes.tecloides), {
  music: 'n64estadio',

  enter(params) {
    document.body.className = 'theme-n64';
    Scenes.tecloides.enter.call(this, params);
    const mon = $('.mon');
    mon.classList.add('estadio');
    const bg = document.createElement('div');
    bg.className = 'est-3d';
    mon.insertBefore(bg, mon.firstChild);
    const loc = document.createElement('div');
    loc.className = 'locutor';
    loc.innerHTML = `<b>LOCUTOR:</b> <span>${esc(upper(rand(LOCUTOR.start)))}</span>`;
    mon.appendChild(loc);
    this.cheer = 0;
    Poly.attach(this, mon, () => this.build3d(bg));
  },

  exit() {
    Scenes.tecloides.exit.call(this);
    this.tok = null;
    if (this.v) { this.v.dispose(); this.v = null; }
  },

  build3d(host) {
    const v = Poly.view(host, { sky: N64C.sky, fog: [40, 160] });
    if (!v) return;
    this.v = v;
    Poly.sky(v, { radius: 140, mountains: 6, clouds: 5 });
    const field = v.mesh(new THREE.PlaneGeometry(30, 20), N64C.grass);
    field.rotation.x = -Math.PI / 2;
    const lines = v.mesh(new THREE.RingGeometry(3, 3.3, 16), N64C.white);
    lines.rotation.x = -Math.PI / 2;
    lines.position.y = 0.02;
    const mid = v.mesh(new THREE.PlaneGeometry(0.3, 20), N64C.white);
    mid.rotation.x = -Math.PI / 2;
    mid.position.y = 0.02;
    const track = v.mesh(new THREE.PlaneGeometry(44, 34), N64C.orange);
    track.rotation.x = -Math.PI / 2;
    track.position.y = -0.02;
    // Gradas en escalones alrededor de la cancha, con público de cubitos de colores.
    const colors = [N64C.red, N64C.yellow, N64C.water, N64C.purple, N64C.white, N64C.orange, N64C.grassD];
    this.fans = [];
    const stand = (cx, cz, w, rotY) => {
      const g = new THREE.Group();
      g.position.set(cx, 0, cz);
      g.rotation.y = rotY;
      v.scene.add(g);
      for (let row = 0; row < 4; row++) {
        const step = v.mesh(new THREE.BoxGeometry(w, 1, 2), row % 2 ? N64C.rock : N64C.rockD, null, g);
        step.position.set(0, row + 0.5, -row * 2);
        for (let k = 0; k < w / 1.6; k++) {
          const fan = v.mesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), colors[(k * 3 + row) % colors.length], null, g);
          fan.position.set(-w / 2 + 0.8 + k * 1.6, row + 1.45, -row * 2);
          fan.userData.base = fan.position.y;
          fan.userData.ph = Math.random() * 6;
          this.fans.push(fan);
        }
      }
    };
    stand(0, -19, 40, 0);
    stand(-24, 0, 30, Math.PI / 2);
    stand(24, 0, 30, -Math.PI / 2);
    // Pantalla gigante y reflectores.
    const screen = v.mesh(new THREE.PlaneGeometry(10, 4), v.mat(N64C.white, { map: v.textTex('ESTADIO\nPOLIGONO', { w: 128, h: 48, bg: N64C.black, fg: N64C.yellow, size: 10 }) }));
    screen.position.set(0, 14, -28);
    [-1, 1].forEach((s) => {
      const pole = v.mesh(new THREE.CylinderGeometry(0.3, 0.3, 18, 5), N64C.rockD);
      pole.position.set(s * 22, 9, -22);
      const lamp = v.mesh(new THREE.BoxGeometry(3, 1.5, 1), N64C.yellow);
      lamp.position.set(s * 22, 18.5, -22);
    });
    v.start((dt, t) => {
      this.cheer = Math.max(0, this.cheer - dt * 0.7);
      const amp = 0.12 + this.cheer * 0.6;
      this.fans.forEach((f) => { f.position.y = f.userData.base + Math.max(0, Math.sin(t * (6 + this.cheer * 6) + f.userData.ph)) * amp; });
      v.camera.position.set(Math.sin(t * 0.08) * 16, 9, 22 + Math.cos(t * 0.08) * 3);
      v.camera.lookAt(0, 2, -4);
    });
  },

  announce(text) {
    const s = $('.locutor span');
    if (!s) return;
    s.textContent = upper(text);
    const l = $('.locutor');
    l.classList.remove('pop');
    void l.offsetWidth;
    l.classList.add('pop');
  },

  // Los golpes hacen saltar al público y comentar al locutor.
  pulse(sel, cls) {
    Scenes.tecloides.pulse.call(this, sel, cls);
    if (cls !== 'hit') return;
    this.cheer = 1;
    this.announce(rand(sel === '.foe-spr' ? LOCUTOR.hit : LOCUTOR.hurt));
  },

  // Como en tecloides.js, con 0.3 s menos para esquivar (§7.4). Pero con 300 ms por letra en vez
  // de 100: a ~30 PPM "pausa eterna" toma casi 5 s y con 100 ms por letra no se alcanzaba nunca.
  dodge(word) {
    return new Promise((done) => {
      this.phase = 'defend';
      this.announce(`¡VIENE "${word}"! ¡ESQUIVA RAPIDO!`);
      $('.mtext').innerHTML = '';
      this.ui = new TypingTask($('.mtext'), {
        label: '¡ESQUIVA! Escribe su ataque:',
        texts: [word],
        timeLimit: 1700 + word.length * 300,
        onDone: (res) => {
          this.st.chars += res.chars;
          this.st.errors += res.errors;
          done(res);
        },
      });
      this.ui.start();
    });
  },

  async lose() {
    Music.stop();
    Sfx.lose();
    Save.write();
    this.announce('¡Y DANI SE LLEVA LA VICTORIA, QUERIDO PÚBLICO!');
    await this.talk([...this.tr.win, ...this.tr.retry]);
    this.phase = 'sub';
    this.ui = new ListMenu($('.mtext'), [{ label: 'Revancha' }, { label: 'Volver al mapa' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('estadio', { enemyId: this.id, back: this.back }) : Game.go(this.back)),
    });
  },
});
