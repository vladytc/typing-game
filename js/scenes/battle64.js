// Combate normal en la Isla Polígono: es el MISMO combate de js/scenes/battle.js, pero si el
// enemigo trae `n64: true` se le agrega:
//   - el enemigo en 3D (modelo low-poly que gira y flota) en lugar del sprite 2D,
//   - la paleta .theme-n64 y la música de batalla N64,
//   - un efecto de lectura según el enemigo (`fx`): palabras borrosas, que llegan de lejos,
//     inclinadas, que tiemblan, o dentro de un marco que gira (Marco). Ver css/worlds/n64.css.
// Se envuelven enter/exit/win sin tocar battle.js: con cualquier otro enemigo no cambia nada.
// Si three.js no carga, el combate se queda con el sprite 2D de siempre.

(() => {
  const base = { enter: Scenes.battle.enter, exit: Scenes.battle.exit, win: Scenes.battle.win };

  Scenes.battle.enter = function (params) {
    const def = ENEMIES[params.enemyId];
    if (!def || !def.n64) { base.enter.call(this, params); return; }
    document.body.className = 'theme-n64'; // antes de dibujar el sprite, para que salga con la paleta N64
    base.enter.call(this, params);
    Music.play(def.boss ? 'n64marco' : 'n64battle');
    $('.battle').classList.add('n64', `fx-${def.fx || 'none'}`);
    // Marco: cada estrella PERFECTA de los cuadros le quita 20 HP antes de empezar (§7.5).
    if (def.hpCutPerStar) {
      const perfect = Object.values(N64S().stars).filter((s) => s === 2).length;
      const cut = Math.min(def.hp - 60, perfect * def.hpCutPerStar);
      if (cut > 0) {
        this.e.hp = def.hp - cut;
        this.updateBars();
        toast(`¡${perfect} ESTRELLAS PERFECTAS!\n${upper(def.name.split(',')[0])} PIERDE ${cut} HP`);
      }
    }
    const tok = this.n64tok = {};
    Poly.load((ok) => {
      if (!ok || Game.scene !== this || this.n64tok !== tok) return;
      const host = $('.esprite');
      const v = Poly.view(host, { w: 140, h: 86, alpha: true, fog: null, fov: 40, cls: 'poly-cv b64' });
      if (!v) return;
      this.v3 = v;
      host.classList.add('has3d');
      const model = Poly.models[def.model || 'trianguloso'](v);
      v.scene.add(model);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.3, 8), new THREE.MeshBasicMaterial({ color: N64C.black, transparent: true, opacity: 0.25 }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -1.6;
      v.scene.add(shadow);
      v.camera.position.set(0, 0.6, def.boss ? 9 : 7.5);
      v.camera.lookAt(0, 0, 0);
      v.start((dt, t) => {
        if (model.userData.anim) model.userData.anim(t, dt);
        // Cuando lo perdonas se pone a girar de gusto.
        if (this.e && this.e.mercy >= 100) model.rotation.y += dt * 3;
      });
    });
  };

  Scenes.battle.exit = function () {
    base.exit.call(this);
    this.n64tok = null;
    if (this.v3) { this.v3.dispose(); this.v3 = null; }
  };

  Scenes.battle.win = function (spared) {
    const def = this.def;
    const first = !Save.data.done[this.id];
    base.win.call(this, spared);
    if (!def.n64) return;
    const d = Save.data;
    // Perdonar a Cactín Salvaje te da el Tecloide Cactín (§7.3).
    if (spared && def.gift && TECLOIDES[def.gift] && d.team && d.team.length && d.team.length < 3 && !d.team.some((t) => t.id === def.gift)) {
      d.team.push({ id: def.gift, lv: 6, xp: 0 });
      Save.write();
      toast(`¡${upper(TECLOIDES[def.gift].name)} SE UNIO\nA TU EQUIPO DE TECLOIDES!`);
    }
    if (spared && def.startsQuest) Quests.start(def.startsQuest);
    if (first && def.console) Quests.complete('mundo_n64');
  };
})();
