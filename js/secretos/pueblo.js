// Secretos jugables del mundo pueblo: curiosidades con el dato real (ver js/secretos.js).

addCuriosities({
  secreto_pueblo_konami: {
    console: 'nes',
    title: 'El código Konami',
    caption: 'Kazuhisa Hashimoto lo inventó al pasar Gradius a la Famicom (1986): el juego era tan difícil que se lo puso para poder probarlo. Se le olvidó quitarlo... y se volvió el código más famoso del mundo.',
    draw(g, w, h) {
      const C = NES10;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      // Control de NES: cuerpo gris, franja negra, cruz y los botones B y A rojos.
      p.r(6, 10, 52, 22, C.Z).r(7, 11, 50, 20, '#bcbcbc').r(7, 17, 50, 8, C.K);
      p.r(12, 16, 3, 10, C.K).r(9, 19, 9, 4, C.K).r(13, 17, 1, 8, C.Z).r(10, 20, 7, 2, C.Z);
      p.r(40, 19, 5, 5, C.F).r(48, 19, 5, 5, C.F);
      p.rows(40, 26, ['x.x...xx', 'xx...x.x', 'x.x..xxx'], { x: C.W });
      // ↑↑↓↓←→←→ arriba del control.
      const up = ['..x..', '.xxx.', 'xxxxx'];
      const down = [...up].reverse();
      const left = ['..x', '.xx', 'xxx', '.xx', '..x'];
      const right = left.map((r) => [...r].reverse().join(''));
      [[up, 3], [up, 10], [down, 17], [down, 24]].forEach(([a, x]) => p.rows(x, 3, a, { x: C.Y }));
      [[left, 32], [right, 38], [left, 44], [right, 50]].forEach(([a, x]) => p.rows(x, 2, a, { x: C.Y }));
      p.rows(26, 34, ['xx..x.', 'x.x.x.', 'xx..x.', 'x.x.x.', 'xx..xxx'].slice(0, 0), { x: C.W });
    },
  },
});

// ---------- LAS CARTAS HANAFUDA (pueblo_hanafuda) ----------
// Nintendo nació en 1889 haciendo cartas hanafuda. Don Chip guarda un mazo en el sótano del museo:
//   1. Pista: después de darte el cartucho de bloques, Don Chip a veces dice que en su sótano hay
//      algo más viejo que cualquier consola, y que la escotilla está "por atrás del museo".
//   2. Atrás del museo (casillas 3..7 de la fila 1), mirando hacia abajo a la pared, ENTER: la
//      escotilla. Bajas y encuentras el mazo → secreto. Funciona igual en todas las eras (2D o 3D),
//      porque es una revisión de casilla en Scenes.town.interact, no un dibujo.
//   3. Minijuego opcional: EMPAREJAR. 8 cartas boca abajo; escribe la palabra de una para voltearla.

Object.assign(SPRITES, {
  // Dos cartas: atrás una boca abajo (roja) y adelante la del pino con el sol rojo (enero).
  hanafuda: snesArt([
    '................',
    '...KKKKKKKK.....',
    '...KrrrrrrK.....',
    '.KKKKKKKKKrK....',
    '.KWWWWWWWKrK....',
    '.KWWRRRWWKrK....',
    '.KWRRRRRWKrK....',
    '.KWWRRRWWKrK....',
    '.KWWWWWWWKrK....',
    '.KGWGWGWGKrK....',
    '.KGGGGGGGKKK....',
    '.KWGGGGGWK......',
    '.KWWNNWWWK......',
    '.KWWNNWWWK......',
    '.KKKKKKKKK......',
    '................',
  ], { K: '#1a1a2e', W: '#fff8e7', R: '#e8393d', r: '#9c1f2a', G: '#1e7a2e', N: '#a0522d' }),
});

// Cuatro meses del mazo (son 12 meses con 4 cartas cada uno: 48 cartas).
const HANAFUDA_MESES = [
  { flor: 'PINO', mes: 'ENERO', color: '#1e7a2e' },
  { flor: 'CEREZO', mes: 'MARZO', color: '#e85a9a' },
  { flor: 'LUNA', mes: 'AGOSTO', color: '#c8901a' },
  { flor: 'ARCE', mes: 'OCTUBRE', color: '#e8393d' },
];
// Palabras de las cartas boca abajo (cada una empieza con otra letra).
const HANAFUDA_PALABRAS = ['sol', 'mar', 'luz', 'pan', 'oso', 'gato', 'nube', 'taza'];

const hanaShuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Memoria de cartas: escribe la palabra de una carta para voltearla. Devuelve { won, tries }.
// Como showCuriosity: su propio DOM sobre #game y se queda con las teclas mientras está abierto.
function hanafudaMemoria() {
  return new Promise((done) => {
    const faces = hanaShuffle([...HANAFUDA_MESES, ...HANAFUDA_MESES]);
    const words = hanaShuffle(HANAFUDA_PALABRAS);
    const cards = faces.map((f, i) => ({ f, word: words[i], up: false, got: false }));
    let buf = '';
    let tries = 0;
    let lock = false;
    let open = [];
    const root = Game.root || document.getElementById('game');
    const el = document.createElement('div');
    el.className = 'hanafuda-view';
    el.style.cssText = 'position:absolute;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6)';
    root.appendChild(el);

    const cardHtml = (c) => {
      const base = 'width:104px;height:132px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:4px solid #1a1a2e;font-size:10px;line-height:1.4;text-align:center';
      if (c.up || c.got) {
        return `<div style="${base};background:#fff8e7;color:#1a1a2e;${c.got ? 'opacity:0.75' : ''}">
          <div style="width:34px;height:34px;border-radius:50%;background:${c.f.color};border:3px solid #1a1a2e"></div>
          <div>${esc(c.f.flor)}</div><div style="font-size:8px">${esc(c.f.mes)}</div></div>`;
      }
      const w = upper(c.word);
      const n = buf && c.word.startsWith(buf) ? buf.length : 0;
      return `<div style="${base};background:#9c1f2a;color:#fff8e7;box-shadow:inset 0 0 0 4px #e8393d">
        <div style="font-size:14px"><span style="color:#ffd93d">${esc(w.slice(0, n))}</span>${esc(w.slice(n))}</div></div>`;
    };
    const render = () => {
      const pairs = cards.filter((c) => c.got).length / 2;
      el.innerHTML = `<div class="box" style="width:520px">
        <div style="text-align:center">CARTAS HANAFUDA · EMPAREJAR</div>
        <div style="display:grid;grid-template-columns:repeat(4,104px);gap:14px;justify-content:center;margin:12px 0">${cards.map(cardHtml).join('')}</div>
        <div style="text-align:center;font-size:10px">PAREJAS ${pairs}/4 · INTENTOS ${tries}<br>ESCRIBE LA PALABRA DE UNA CARTA · ESC: SALIR</div>
      </div>`;
    };
    const close = (won) => {
      window.removeEventListener('keydown', onKey, true);
      el.remove();
      done({ won, tries });
    };
    const flip = (c) => {
      c.up = true;
      open.push(c);
      Sfx.move();
      if (open.length < 2) return;
      tries++;
      const [a, b] = open;
      if (a.f === b.f) {
        a.got = b.got = true;
        open = [];
        Sfx.coin();
        if (cards.every((x) => x.got)) {
          lock = true;
          setTimeout(() => close(true), 900);
        }
        return;
      }
      lock = true;
      setTimeout(() => {
        a.up = b.up = false;
        open = [];
        lock = false;
        render();
      }, 1000);
    };
    // Captura las teclas antes que la escena (como el visor de curiosidades).
    const onKey = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === 'Escape') { Sfx.confirm(); close(false); return; }
      if (e.repeat || lock || e.key.length !== 1) return;
      const next = buf + e.key.toLowerCase();
      const hits = cards.filter((c) => !c.up && !c.got && c.word.startsWith(next));
      if (!hits.length) {
        Sfx.error();
        buf = '';
        render();
        return;
      }
      Sfx.key();
      buf = next;
      const c = hits.find((x) => x.word === buf);
      if (c) { buf = ''; flip(c); }
      render();
    };
    window.addEventListener('keydown', onKey, true);
    render();
  });
}

// El sótano de Don Chip: la escotilla, el mazo y el minijuego.
async function puebloSotano(ctx) {
  if (!secretFound('pueblo_hanafuda')) {
    await ctx.say(['* Entre las tablas de atrás del museo hay una escotilla vieja.\n* Un letrero dice: "SOTANO. NO TOCAR. (Firma: Don Chip)"']);
    if (await ctx.choose(['bajar', 'mejor no']) === 1) { await ctx.say(['* Mejor no. ...Por ahora.']); return; }
    Sfx.confirm();
    await ctx.say([
      '* Bajas por una escalera que rechina.\n* Huele a papel viejo, a madera... y a mucho, mucho tiempo.',
      '* Cajas de cartuchos, cables enredados, un control sin botones...\n* y al fondo, una cajita de madera con letras japonesas.',
      '* Adentro hay un mazo de cartas pequeñitas, con flores, pinos y una luna.\n* Son cartas HANAFUDA.',
    ]);
    Sfx.coin();
    await findSecret('pueblo_hanafuda', ctx);
  } else {
    await ctx.say(['* La escotilla del sótano de Don Chip.\n* El mazo de hanafuda sigue en su cajita de madera.']);
  }
  const best = Save.data.flags.hanafudaBest;
  await ctx.say([`* En la tapa de la cajita dice cómo jugar a EMPAREJAR:\n* escribe la palabra de una carta para voltearla y encuentra las 4 parejas.${best ? `\n* (Tu récord: ${best} intentos.)` : ''}`]);
  if (await ctx.choose(['emparejar', 'subir']) === 1) { await ctx.say(['* Subes con cuidado. La escotilla se cierra sola: ¡clac!']); return; }
  const res = await hanafudaMemoria();
  if (!res.won) { await ctx.say(['* Guardas las cartas en su cajita. Otro día.']); return; }
  Sfx.win();
  const record = !best || res.tries < best;
  if (record) { Save.data.flags.hanafudaBest = res.tries; Save.write(); }
  await ctx.say([res.tries <= 4
    ? '* ¡¡4 parejas en 4 intentos!! ¡Perfecto!\n* Ni Fusajiro Yamauchi lo hubiera hecho mejor.'
    : `* ¡Las 4 parejas en ${res.tries} intentos!${record ? ' ¡Récord nuevo!' : ''}\n* El mínimo posible es 4. ¿Te atreves?`]);
}

// Don Chip da la pista (a veces) y celebra cuando ya encontraste sus cartas.
(() => {
  const chip = TOWN.npcs.find((n) => n.id === 'donchip');
  if (!chip) return;
  const base = chip.talk;
  chip.talk = async function (ctx) {
    if (secretFound('pueblo_hanafuda') && !ctx.flag('chipHanafuda')) {
      ctx.setFlag('chipHanafuda');
      await ctx.say([
        '* ¡¿Bajaste a mi sótano?! ¡¿Y encontraste mis cartas hanafuda?!',
        '* Esas cartas son más viejas que todas las consolas de mi museo.\n* Así empezó todo, mi joven amigo. Eso es HISTORIA.',
      ], 'DON CHIP');
    } else if (ctx.flag('chipGB') && !secretFound('pueblo_hanafuda') && ctx.counter('chipSotano') % 3 === 0) {
      await ctx.say([
        '* Psst... ¿te acuerdas del cartucho de bloques que saqué del sótano?',
        '* Allá abajo guardo algo MÁS viejo que cualquier consola.\n* La escotilla está por atrás del museo... pero yo ya no me agacho tan bien.',
      ], 'DON CHIP');
    }
    return base.call(this, ctx);
  };
})();

// La escotilla: ENTER mirando hacia abajo desde atrás del museo (casillas 3..7 de la fila 1,
// contra el techo). Scenes.town carga después de este archivo: se envuelve cuando ya está todo.
window.addEventListener('DOMContentLoaded', () => {
  const town = Scenes.town;
  if (!town) return;
  const base = town.interact;
  town.interact = function () {
    const { x, y, face } = this.p;
    if (this.pueblo && face === 'down' && y === 1 && x >= 3 && x <= 7
      && this.rows[2] && this.rows[2][x] === 'R' && !this.entityAt(x, 2)) {
      this.run((ctx) => puebloSotano(ctx));
      return;
    }
    base.call(this);
  };
});

addCuriosities({
  secreto_pueblo_hanafuda: {
    console: 'secreto',   // no es de ninguna consola: solo sale como tarjeta del secreto
    title: 'Las cartas hanafuda',
    caption: 'Nintendo nació en Kioto el 23 de septiembre de 1889: Fusajiro Yamauchi hacía cartas hanafuda, 48 cartas con flores de los 12 meses. Su primera consola, la Color TV-Game, llegó hasta 1977.',
    draw(g, w, h) {
      const p = pixelArt(g, w, h, 64, 40, '#3a1a1a');
      const K = '#1a1a2e';
      const card = (x, y, face) => {
        p.r(x, y, 13, 19, K).r(x + 1, y + 1, 11, 17, face ? '#fff8e7' : '#9c1f2a');
        if (!face) p.r(x + 3, y + 3, 7, 13, '#e8393d').r(x + 4, y + 4, 5, 11, '#9c1f2a');
      };
      // Tapete de madera y cuatro cartas: una boca abajo y tres meses.
      p.r(0, 30, 64, 10, '#6a3a1a');
      card(4, 8, false);
      card(18, 6, true);    // enero: pino con sol rojo
      p.r(21, 9, 7, 5, '#e8393d').r(22, 8, 5, 7, '#e8393d');
      p.r(19, 17, 11, 4, '#1e7a2e').r(20, 16, 2, 1, '#1e7a2e').r(24, 16, 2, 1, '#1e7a2e').r(23, 21, 2, 3, '#a0522d');
      card(32, 8, true);    // marzo: cerezo
      [[35, 11], [39, 13], [36, 16], [40, 19]].forEach(([x, y]) => p.r(x, y, 3, 3, '#f79ac0').r(x + 1, y + 1, 1, 1, '#ffd93d'));
      p.r(33, 22, 11, 3, '#e8393d');
      card(46, 6, true);    // agosto: luna llena sobre el pasto
      p.r(47, 7, 11, 9, '#e8393d').r(49, 9, 7, 6, '#fff8e7').r(50, 8, 5, 8, '#fff8e7');
      p.r(47, 17, 11, 7, K).r(48, 16, 1, 2, K).r(52, 15, 1, 3, K).r(56, 16, 1, 2, K);
      pixText(p, 24, 32, '1889', '#ffd93d');
    },
  },
});
