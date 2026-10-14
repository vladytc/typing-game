// JEFE del Mundo 1: TETRO REY en 3 fases (docs/LORE.md §4.5). Reutiliza la batalla normal.
//   Fase 1: LUCHAR / ACTUAR normales, hasta que le queda la mitad de HP.
//   Fase 2: ¡TETRIS VS! Dos pozos lado a lado, como dos Game Boy con el Cable Link (idea del niño).
//           Cada pieza trae una palabra: al escribirla cae SOLA en un buen lugar (en el mejor si no
//           hubo errores). Tus líneas le mandan basura al rey con las reglas del Tetris de Game Boy
//           (2 líneas → 1 fila, 3 → 2, ¡TETRIS! → 4) y él te manda la suya. Cada fila de basura
//           trae una palabra: escríbela y desaparece. La primera letra decide qué escribes.
//           Si tu pila llega al tope te duele y se limpia; si llega la del rey, pierde bastante HP.
//   Fase 3: batalla normal, pero LUCHAR se lee en vertical.
// Al final dice la primera pista del Glitch.

// ---------- Motor de TETRIS VS (fase 2) ----------
// Pozo de 10 x 18 como el de Game Boy. Cada fila es { c: [10 casillas], g, hole }:
// c[i] = null o la letra de la pieza ('I', 'O', ... o 'G' de basura); g = { word, pos } si la fila
// es basura con palabra (solo en tu pozo) y hole = la columna de su hueco.
const TVS = {
  cols: 10, rows: 18, cell: 17,
  rowMs: 430,         // Normal: tu pieza baja una fila cada 430 ms (÷ diff().speed, × pace)
  spawnMs: 420,       // espacio entre piezas
  reyEvery: 2000,     // el rey acomoda una pieza cada 2 s (÷ raíz de diff().speed)
  attackEvery: 15000, // y cada 15 s mete su barra si tiene 2+ filas listas (÷ diff().speed, × pace)
  reyStart: 2,        // filas con las que empieza su torre (cada una con un hueco)
  reySloppy: 0,       // qué tanto se equivoca al principio...
  reyTire: 250000,    // ...y cuánto más con el tiempo (+10 % cada 25 s)
  reyCap: { facil: 1, normal: 2, dificil: 4, experto: 4 }, // filas máximas por ataque del rey
  send: [0, 0, 1, 2, 4], // reglas reales del Tetris de Game Boy a 2 jugadores
  lineChip: 1,        // HP que le quita al rey cada línea que borras...
  chip: 2,            // ...y cada fila de basura que le mandas...
  chipFloor: 0.3,     // ...sin bajar del 30 %
  reyTopDmg: 12,      // y si su torre llega al tope: al menos esto...
  reyTopTo: 0.15,     // ...hasta quedar en 15 % para la fase 3
  topDmg: 8,          // si TU pila llega al tope (con scaledDmg)
};
// Las 7 piezas de verdad, en su posición de salida.
const TVS_SHAPES = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [1, 0], [2, 0], [2, 1]],
  L: [[0, 0], [1, 0], [2, 0], [0, 1]],
};
const TVS_ROTS = {};
// Giros distintos de una pieza (la O tiene 1; la I, la S y la Z, 2; las demás, 4).
function tvsRots(kind) {
  if (TVS_ROTS[kind]) return TVS_ROTS[kind];
  const out = [];
  const seen = {};
  let cells = TVS_SHAPES[kind];
  for (let i = 0; i < 4; i++) {
    const mx = Math.min(...cells.map(([x]) => x));
    const my = Math.min(...cells.map(([, y]) => y));
    const n = cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const key = n.join(';');
    if (!seen[key]) { seen[key] = true; out.push(n); }
    cells = cells.map(([x, y]) => [-y, x]);
  }
  return (TVS_ROTS[kind] = out);
}
const tvsRow = () => ({ c: Array(TVS.cols).fill(null), g: null, hole: -1 });
const tvsEmpty = () => Array.from({ length: TVS.rows }, tvsRow);

function tvsFits(board, cells, x, y) {
  return cells.every(([cx, cy]) => {
    const c = x + cx;
    const r = y + cy;
    return c >= 0 && c < TVS.cols && r < TVS.rows && (r < 0 || !board[r].c[c]);
  });
}

// Hasta dónde cae una pieza soltada en la columna x (la fila de su esquina de arriba).
function tvsDrop(board, cells, x) {
  let y = -4;
  if (!tvsFits(board, cells, x, y)) return null;
  while (tvsFits(board, cells, x, y + 1)) y++;
  return y;
}

// Pone la pieza y borra las filas llenas. over = parte de la pieza quedó afuera del pozo.
function tvsLock(board, cells, x, y, kind) {
  let over = false;
  cells.forEach(([cx, cy]) => {
    if (y + cy < 0) over = true;
    else board[y + cy].c[x + cx] = kind;
  });
  const rows = [];
  board.forEach((row, i) => { if (row.c.every(Boolean)) rows.push(i); });
  for (let k = rows.length - 1; k >= 0; k--) board.splice(rows[k], 1);
  rows.forEach(() => board.unshift(tvsRow()));
  return { lines: rows.length, rows, over };
}

// Sube n filas de basura por abajo, todas con el hueco en la misma columna (como en Game Boy).
// word() da la palabra de cada fila (solo en tu pozo). true = algo se salió por arriba.
function tvsPush(board, n, hole, word) {
  let over = false;
  for (let k = 0; k < n; k++) {
    const top = board.shift();
    if (top.c.some(Boolean)) over = true;
    const row = tvsRow();
    row.c = row.c.map((_, c) => (c === hole ? null : 'G'));
    row.hole = hole;
    board.push(row);
    if (word) row.g = { word: word(), pos: 0, errors: 0 };
  }
  return over;
}

const tvsTopped = (board) => board[0].c.some(Boolean);
// Alto de la pila (en filas).
function tvsHeight(board) {
  const r = board.findIndex((row) => row.c.some(Boolean));
  return r < 0 ? 0 : TVS.rows - r;
}

// El colocador automático: prueba todos los giros y columnas, y califica cómo queda el pozo.
// Prefiere completar líneas, y más si son varias juntas (eso manda basura); no le gustan los huecos
// tapados, los pozos hondos ni las torres. well = deja libre la última columna para meter ahí una
// barra I (así juega el rey; para ti no: si fallas la barra, ese pozo se queda tapado y sufres).
// Devuelve la lista de lugares del mejor al peor: { x, y, cells, lines, score }.
const TVS_AI = {
  low: [0, 2, 5, 8, 16],      // valor de borrar 0-4 líneas con la pila bajita...
  high: [0, 3, 6, 9, 14],     // ...y con la pila alta (de `tall` filas para arriba)
  tall: 9,
  agg: 0.3, holes: 2.6, bump: 0.32, pit: 1.2, well: 0.8,
  top: 0.4, // castigo por cada fila arriba de 6 de la columna más alta (para no hacer torres)
};
function tvsPlaces(board, kind, well, ai = TVS_AI) {
  const out = [];
  const R = TVS.rows;
  const W = TVS.cols;
  const A = ai;
  const val = tvsHeight(board) >= A.tall ? A.high : A.low;
  tvsRots(kind).forEach((cells) => {
    const w = Math.max(...cells.map(([cx]) => cx)) + 1;
    for (let x = 0; x + w <= W; x++) {
      const y = tvsDrop(board, cells, x);
      if (y === null) continue;
      // Simula en una copia de booleanos.
      const g = board.map((row) => row.c.map(Boolean));
      let over = false;
      cells.forEach(([cx, cy]) => { if (y + cy < 0) over = true; else g[y + cy][x + cx] = true; });
      const left = g.filter((row) => !row.every(Boolean));
      const lines = R - left.length;
      while (left.length < R) left.unshift(Array(W).fill(false));
      const hs = Array(W).fill(0);
      let holes = 0;
      for (let c = 0; c < W; c++) {
        let seen = false;
        for (let r = 0; r < R; r++) {
          if (left[r][c]) { if (!seen) { hs[c] = R - r; seen = true; } } else if (seen) holes++;
        }
      }
      const last = well ? W - 1 : W;
      let bump = 0;
      let pit = 0; // pozos de 1 de ancho y 3 o más de hondo (solo la I los llena)
      for (let c = 0; c < last; c++) {
        if (c + 1 < last) bump += Math.abs(hs[c] - hs[c + 1]);
        const l = c > 0 ? hs[c - 1] : 99;
        const r = c + 1 < last ? hs[c + 1] : 99;
        const deep = Math.min(l, r) - hs[c];
        if (deep >= 3) pit += deep - 2;
      }
      const agg = hs.reduce((a, b) => a + b, 0);
      let score = val[lines] - A.agg * agg - A.holes * holes - A.bump * bump - A.pit * pit - A.top * Math.max(0, Math.max(...hs) - 6);
      if (well) score -= A.well * hs[W - 1];
      if (over) score -= 1000;
      out.push({ x, y, cells, lines, score });
    }
  });
  return out.sort((a, b) => b.score - a.score);
}
// Con errores la pieza cae en otro lugar, al azar entre los que no son el mejor pero tampoco un
// desastre (cada error abre la puerta a lugares peores). list: la de tvsPlaces.
const TVS_WORSE = 1.5;
function tvsWorse(list, errors) {
  if (!errors || list.length < 2) return list[0];
  const ok = list.slice(1).filter((o) => o.score >= list[0].score - TVS_WORSE * errors);
  return ok.length ? rand(ok) : list[1];
}

Scenes.tetrorey = Object.assign(Object.create(Scenes.battle), {
  music: 'gb_tetrorey',

  enter(params) {
    this.stage = 1; // ('phase' ya lo usa la batalla para saber qué tecla toca)
    this.clued = false;
    Scenes.battle.enter.call(this, params);
    // La mancha imposible: un píxel magenta en la torre del rey.
    const px = document.createElement('div');
    px.className = 'glitch-px';
    $('.esprite').appendChild(px);
  },

  exit() {
    this.stopTetris();
    Scenes.battle.exit.call(this);
  },

  // ---------- Fases 1 y 3: LUCHAR ----------

  fight() {
    const tall = this.stage === 3;
    const words = pickWords(tall ? this.def.tallWords : this.def.words, tall ? 3 : this.def.fightWords);
    const total = words.join('').length;
    // En la fase 1 no baja de la mitad: ahí empieza TETRIS VS.
    const floor = this.stage === 1 ? Math.round(this.def.hp / 2) : 0;
    let dealt = 0;
    this.box.classList.toggle('tr-tall', tall);
    this.runTask({
      label: tall ? '¡LUCHAR! Lee como bloque, de arriba a abajo:' : '¡LUCHAR! Escribe rápido:',
      texts: words,
      timeLimit: total * (tall ? 700 : 560) + 2500,
      onUnit: (unit) => {
        const { dmg, perfect } = this.damageFor(unit);
        const before = this.e.hp;
        if (perfect) this.st.perfect++;
        this.e.hp = Math.max(floor, this.e.hp - dmg);
        dealt += before - this.e.hp;
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, perfect ? 'crit' : '');
        this.shake('.esprite');
        this.updateBars();
        return this.e.hp > floor;
      },
      onDone: (res) => {
        this.box.classList.remove('tr-tall');
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        if (this.stage === 1 && this.e.hp <= floor) {
          this.say([
            '* ¡El Tetro Rey se pone ROJO! Bueno, verde oscuro.',
            '* "¡SUFICIENTE! ¡Conecta tu cable, retador!\n* ¡¡TETRIS VS!!"',
            '* (Cada pieza trae una palabra: escríbela y cae sola.\n* Sin errores, cae en el MEJOR lugar.)',
            '* (2 líneas juntas le mandan basura al rey; ¡un TETRIS le manda 4!\n* Si te llega basura, escribe su palabra y se borra.)',
            '* (¡Llena la torre del rey hasta el tope!)',
          ], () => this.startTetris());
          return;
        }
        const pages = [];
        if (dealt === 0) pages.push('* ¡Se acabó el tiempo! No lograste atacar.');
        else if (res.completed) pages.push(`* ¡Combo completo! Hiciste ${dealt} de daño.`);
        else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  // ---------- Fase 2: TETRIS VS ----------
  // Dos pozos lado a lado, como dos Game Boy con el Cable Link: el tuyo y el del rey.

  startTetris() {
    this.stage = 2;
    this.phase = 'tvs';
    this.renderCmds();
    Music.play('gb_tetrisvs');
    const W = TVS.cols * TVS.cell;
    const H = TVS.rows * TVS.cell;
    const well = (side) => `
      <div class="tvs-side tvs-${side}">
        <div class="tvs-name">${side === 'me' ? 'TÚ' : 'TETRO REY'}</div>
        <div class="tvs-well" style="width:${W}px;height:${H}px">
          <div class="tvs-cells"></div>
          <div class="tvs-fx"></div>
        </div>
        <div class="tvs-meter"><i></i></div>
        <div class="tvs-under"></div>
      </div>`;
    const el = document.createElement('div');
    el.className = 'tvs';
    el.innerHTML = `
      <h2 class="tvs-title">TETRIS VS</h2>
      <div class="tvs-cable"></div>
      ${well('me')}${well('rey')}
      <div class="tvs-panel">
        <div class="tvs-box"><span>SIGUIENTE</span><div class="tvs-next"></div></div>
        <div class="tvs-box"><span>LINEAS</span><b class="tvs-lines">0</b></div>
        <div class="tvs-box"><span>BASURA ENVIADA</span><b class="tvs-sent">0</b></div>
        <div class="tvs-box"><span>TETRO REY</span><div class="bar tvs-ehp"><i></i></div></div>
        <div class="tvs-box"><span>TU HP</span><div class="bar tvs-php"><i></i></div></div>
      </div>
      <p class="tvs-help">Escribe la palabra de la pieza y cae sola.<br>Sin errores cae en el MEJOR lugar.<br>
        Escribe la de una fila de BASURA para borrarla.</p>`;
    $('.battle').appendChild(el);
    const side = (k) => {
      const s = $(`.tvs-${k}`, el);
      return { el: s, well: $('.tvs-well', s), cells: $('.tvs-cells', s), fx: $('.tvs-fx', s), meter: $('.tvs-meter i', s), under: $('.tvs-under', s), board: tvsEmpty() };
    };
    const sp = diff().speed / pace('tetrorey');
    this.tvsBagLeft = null;
    this.tvs = {
      el, me: side('me'), rey: side('rey'), active: true, elapsed: 0,
      piece: null, next: this.tvsBag(), wait: 900, queue: [], target: null, lines: 0, sent: 0,
      rowMs: TVS.rowMs / sp,        // cuánto tarda tu pieza en bajar una fila
      spawnMs: TVS.spawnMs / sp,    // espacio entre una pieza y la siguiente
      reyEvery: TVS.reyEvery / Math.pow(sp, 0.25), // el rey acomoda una pieza cada tanto...
      attackEvery: TVS.attackEvery / sp,      // ...y ataca más seguido en las dificultades altas
      reyWait: 0, attackWait: TVS.attackEvery / sp, retry: 0, got: 0,
      fast: false,
    };
    // El rey empieza con su torre a medio armar (con huequitos, como el Tipo B).
    const rb = this.tvs.rey.board;
    for (let r = TVS.rows - TVS.reyStart; r < TVS.rows; r++) {
      const hole = Math.floor(Math.random() * (TVS.cols - 1));
      rb[r].c = rb[r].c.map((_, c) => (c === hole ? null : 'G'));
    }
    this.tvs.rey.under.innerHTML = 'Cuando su barrita llega arriba,<br>mete una barra y ¡te ataca!';
    this.tvsDraw('me');
    this.tvsDraw('rey');
    this.tvsStats();
    this.tvsLast = performance.now();
    this.tvsRaf = requestAnimationFrame(this.tvsLoop);
  },

  stopTetris() {
    if (!this.tvs) return;
    this.tvs.active = false;
    cancelAnimationFrame(this.tvsRaf);
  },

  tvsLoop: function tvsLoop(ts) {
    const self = Scenes.tetrorey;
    const v = self.tvs;
    if (!v || !v.active) return;
    const dt = Math.max(0, Math.min(50, ts - self.tvsLast));
    self.tvsLast = ts;
    v.elapsed += dt;
    // Tu pieza baja poco a poco; si toca fondo sin escribirse, se queda donde cayó (mal).
    const p = v.piece;
    if (p) {
      p.y += dt / v.rowMs;
      const land = tvsDrop(v.me.board, p.cells, p.x);
      if (land === null || p.y >= land) self.tvsLock(p, land, true);
      else self.tvsMovePiece();
    } else if ((v.wait -= dt) <= 0) self.tvsSpawn();
    if (!v.active) return;
    // El rey juega en su pozo y de vez en cuando te manda basura.
    if ((v.reyWait -= dt) <= 0) { v.reyWait += v.reyEvery; self.tvsReyPlace(); }
    // Ataca cuando se llena su barrita, pero solo si ya tiene 2 o más filas listas. Si no, espera
    // un rato; y si en 8 s no lo logra, mete la barra de todos modos (para destapar su pozo).
    if (v.active && (v.attackWait -= dt) <= 0 && (v.retry -= dt) <= 0) {
      if (self.tvsReyAttack(v.attackWait < -8000)) v.attackWait = v.attackEvery;
      else v.retry = 800;
    }
    if (!v.active) return;
    v.rey.meter.style.height = `${Math.min(100, 100 * (1 - v.attackWait / v.attackEvery))}%`;
    // Con la pila alta, la música se apura (y se calma cuando bajas).
    const h = tvsHeight(v.me.board);
    if (!v.fast && h >= 12) { v.fast = true; Music.play('gb_tetrisvs_rapido'); }
    else if (v.fast && h <= 8) { v.fast = false; Music.play('gb_tetrisvs'); }
    self.tvsRaf = requestAnimationFrame(tvsLoop);
  },

  // Piezas en "bolsa" de 7: todas salen antes de repetir, así la I nunca tarda demasiado.
  tvsBag() {
    if (!this.tvsBagLeft || !this.tvsBagLeft.length) this.tvsBagLeft = Object.keys(TVS_SHAPES).sort(() => Math.random() - 0.5);
    return this.tvsBagLeft.pop();
  },

  // Primeras letras ocupadas (para que cada cosa empiece con una letra distinta).
  tvsUsed() {
    const v = this.tvs;
    const used = v.me.board.filter((r) => r.g).map((r) => norm(r.g.word[0]));
    if (v.piece) used.push(norm(v.piece.word[0]));
    return used;
  },

  tvsWord(pool) {
    const used = this.tvsUsed();
    const free = pool.filter((w) => !used.includes(norm(w[0])));
    return rand(free.length ? free : pool);
  },

  tvsSpawn() {
    const v = this.tvs;
    const kind = v.next;
    v.next = this.tvsBag();
    const rots = tvsRots(kind);
    const rot = Math.floor(Math.random() * rots.length);
    const cells = rots[rot];
    const w = Math.max(...cells.map(([x]) => x)) + 1;
    const h = Math.max(...cells.map(([, y]) => y)) + 1;
    // Cae por donde tenga más camino (si no, ni tiempo de leerla).
    const opts = [];
    for (let x = 0; x + w <= TVS.cols; x++) opts.push({ x, land: tvsDrop(v.me.board, cells, x) });
    const best = Math.max(...opts.map((o) => (o.land === null ? -99 : o.land)));
    const ok = opts.filter((o) => o.land !== null && o.land >= best - 2);
    const x = rand(ok.length ? ok : opts).x;
    const word = this.tvsWord(kind === 'I' ? this.def.vsLong : this.def.vsWords);
    const el = document.createElement('div');
    el.className = 'tvs-piece';
    el.innerHTML = cells.map(([cx, cy]) => `<i class="tvs-c k-${kind}" style="left:${cx * TVS.cell}px;top:${cy * TVS.cell}px"></i>`).join('') +
      '<b class="tvs-tag"></b>';
    v.me.well.appendChild(el);
    v.piece = { kind, cells, x, y: -h, h, w, word, pos: 0, errors: 0, t0: 0, el };
    this.tvsMovePiece();
    this.tvsRenderWord();
    this.tvsNext();
  },

  tvsMovePiece() {
    const p = this.tvs.piece;
    p.el.style.transform = `translate(${p.x * TVS.cell}px, ${Math.round(p.y * TVS.cell)}px)`;
    // La etiqueta con la palabra va arriba de la pieza (sin salirse del pozo).
    const tag = p.el.lastChild;
    const tw = p.word.length * 10 + 14; // ancho aproximado (letra pixelada de 10 px)
    const left = Math.max(0, Math.min(TVS.cols * TVS.cell - tw, p.x * TVS.cell + (p.w * TVS.cell - tw) / 2));
    tag.style.left = `${Math.round(left - p.x * TVS.cell)}px`;
    tag.style.top = `${Math.max(-p.y * TVS.cell, -22) | 0}px`;
  },

  // Coloca tu pieza. bad = tocó fondo sin escribirse (se queda donde cayó).
  tvsLock(p, landY, bad) {
    const v = this.tvs;
    let x = p.x;
    let cells = p.cells;
    let y = landY === null ? tvsDrop(v.me.board, cells, x) : landY;
    if (!bad) {
      // El colocador automático: sin errores, el mejor lugar; con errores, uno peor.
      const list = tvsPlaces(v.me.board, p.kind, false);
      if (list.length) ({ x, y, cells } = tvsWorse(list, p.errors));
    }
    if (bad) Sfx.hurt(); else Sfx.bump();
    p.el.remove();
    v.piece = null;
    if (v.target === p) v.target = null;
    const res = tvsLock(v.me.board, cells, x, y, p.kind);
    this.tvsLanded('me', cells, x, y, bad);
    if (res.lines) this.tvsCleared(res);
    // La basura que te mandó el rey sube al acomodar la pieza (como en el Tetris de Game Boy).
    let over = res.over;
    if (v.queue.length) {
      v.queue.forEach((g) => { over = tvsPush(v.me.board, g.n, g.hole, () => this.tvsWord(this.def.vsJunk)) || over; });
      v.queue = [];
      v.me.well.classList.remove('shake'); void v.me.well.offsetWidth; v.me.well.classList.add('shake');
    }
    v.wait = v.spawnMs;
    this.tvsDraw('me');
    this.tvsRenderWord();
    if (over || tvsTopped(v.me.board)) this.tvsTopOut();
  },

  // Líneas borradas en tu pozo: 2 → 1 fila de basura, 3 → 2, ¡TETRIS! → 4.
  tvsCleared(res) {
    const v = this.tvs;
    v.lines += res.lines;
    res.rows.forEach((r) => this.tvsFx('me', 'tvs-clear', r));
    const send = TVS.send[res.lines];
    if (res.lines === 4) {
      Sfx.powerup();
      setTimeout(() => Sfx.crit(), 300);
      this.tvsFlash('me', '¡TETRIS!', 'big');
      v.me.well.classList.remove('tvs-tetris'); void v.me.well.offsetWidth; v.me.well.classList.add('tvs-tetris');
    } else {
      Sfx.crit();
      this.tvsFlash('me', ['', '¡LINEA!', '¡DOBLE!', '¡TRIPLE!'][res.lines]);
    }
    this.tvsChip(res.lines * TVS.lineChip);
    if (send) this.tvsSendRey(send);
    this.tvsStats();
  },

  // Cada línea y cada fila de basura le quitan un poquito de HP al rey (sin bajar de chipFloor).
  tvsChip(dmg) {
    const floor = Math.round(this.def.hp * TVS.chipFloor);
    this.e.hp = Math.max(Math.min(floor, this.e.hp), this.e.hp - dmg);
    this.updateBars();
  },

  // Basura para el rey: sube su pila y le quita un poquito de HP.
  tvsSendRey(n) {
    const v = this.tvs;
    v.sent += n;
    const over = tvsPush(v.rey.board, n, Math.floor(Math.random() * TVS.cols));
    this.tvsFlash('rey', `+${n} BASURA`);
    v.rey.well.classList.remove('shake'); void v.rey.well.offsetWidth; v.rey.well.classList.add('shake');
    this.tvsChip(n * TVS.chip);
    this.tvsDraw('rey');
    this.tvsStats();
    if (over || tvsTopped(v.rey.board)) this.tvsReyTopOut();
  },

  // El rey acomoda una pieza: casi siempre bien y dejando libre la última columna (para su barra),
  // pero se va poniendo nervioso y cada vez se equivoca más.
  tvsReyPlace() {
    const v = this.tvs;
    const kind = rand(['O', 'T', 'S', 'Z', 'J', 'L']); // (las barras I las guarda para atacar)
    const all = tvsPlaces(v.rey.board, kind, true);
    if (!all.length) { this.tvsReyTopOut(); return; }
    const safe = all.filter((o) => o.x + Math.max(...o.cells.map(([cx]) => cx)) < TVS.cols - 1);
    const list = safe.length ? safe : all;
    // Se equivoca cada vez más seguido, y cada minuto sus errores son peores.
    const sloppy = TVS.reySloppy + v.elapsed / TVS.reyTire;
    const o = Math.random() < sloppy ? tvsWorse(list, 1 + Math.floor(v.elapsed / 60000)) : list[0];
    const res = tvsLock(v.rey.board, o.cells, o.x, o.y, kind);
    this.tvsLanded('rey', o.cells, o.x, o.y);
    res.rows.forEach((r) => this.tvsFx('rey', 'tvs-clear', r));
    this.tvsDraw('rey');
    if (res.over || tvsTopped(v.rey.board)) this.tvsReyTopOut();
  },

  // ¡Ataque! El rey mete una barra en su columna libre; las líneas que borre te llegan de basura.
  // Solo la mete si borraría 2 o más, o si force (devuelve false si todavía no está listo).
  tvsReyAttack(force) {
    const v = this.tvs;
    const cells = tvsRots('I')[1];
    const y = tvsDrop(v.rey.board, cells, TVS.cols - 1);
    if (y === null) return false;
    const test = v.rey.board.map((row) => ({ ...row, c: [...row.c] }));
    if (!force && tvsLock(test, cells, TVS.cols - 1, y, 'I').lines < 2) return false;
    const res = tvsLock(v.rey.board, cells, TVS.cols - 1, y, 'I');
    this.tvsLanded('rey', cells, TVS.cols - 1, y);
    res.rows.forEach((r) => this.tvsFx('rey', 'tvs-clear', r));
    this.tvsDraw('rey');
    const n = Math.min(TVS.send[res.lines], TVS.reyCap[Save.data.difficulty] || 4);
    if (n) {
      v.got += n;
      v.queue.push({ n, hole: Math.floor(Math.random() * TVS.cols) });
      this.tvsFlash('rey', res.lines === 4 ? '¡TETRIS!' : res.lines === 3 ? '¡TRIPLE!' : '¡DOBLE!');
      this.tvsFlash('me', `¡BASURA x${n}!`);
      Sfx.laugh();
      this.tvsMeter();
    }
    if (res.over || tvsTopped(v.rey.board)) this.tvsReyTopOut();
    return true;
  },

  // Tu pila llegó al tope: te cae encima, el pozo se limpia y sigues.
  tvsTopOut() {
    const v = this.tvs;
    if (!v.active) return; // (el rey ya se desbordó: ganaste la fase)
    if (v.piece) { v.piece.el.remove(); v.piece = null; }
    v.target = null;
    v.queue = [];
    v.me.board = tvsEmpty();
    v.wait = 1200;
    this.p.hp = Math.max(0, this.p.hp - scaledDmg(TVS.topDmg));
    this.updateBars();
    Sfx.hurt();
    this.tvsFlash('me', '¡TOPE! ¡AU!', 'big');
    this.tvsDraw('me');
    this.tvsRenderWord();
    this.tvsStats();
    this.tvsMeter();
    if (this.p.hp <= 0) {
      this.stopTetris();
      this.phase = 'busy';
      this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'tetrorey' }); }, 600);
    }
  },

  // ¡La torre del rey llegó al tope! Pierde bastante HP y pasa a la fase 3.
  tvsReyTopOut() {
    const v = this.tvs;
    if (!v.active) return;
    this.stopTetris();
    this.phase = 'busy';
    const before = this.e.hp;
    this.e.hp = Math.max(1, Math.min(this.e.hp - TVS.reyTopDmg, Math.round(this.def.hp * TVS.reyTopTo)));
    this.updateBars();
    this.tvsStats();
    Sfx.crit();
    v.rey.well.classList.add('tvs-over');
    this.tvsFlash('rey', `¡TOPE! -${before - this.e.hp}`, 'big');
    this.later(() => this.endTetris(), 1600);
  },

  endTetris() {
    if (this.tvs) {
      if (this.tvs.piece) this.tvs.piece.el.remove();
      this.tvs.el.remove();
    }
    const lines = this.tvs ? this.tvs.lines : 0;
    this.tvs = null;
    this.stage = 3;
    Music.play('gb_tetrorey3');
    this.updateBars();
    const go = () => this.say([
      `* ¡La torre del Tetro Rey se desborda!\n* Borraste ${lines} línea${lines === 1 ? '' : 's'}.`,
      '* El Tetro Rey se acuesta de lado.\n* "¡AHORA VAS A LEER COMO BLOQUE!"',
      '* (Fase final: las palabras de LUCHAR van de arriba a abajo.)',
    ], () => this.toMenu());
    // La primera vez, la tarjeta con el dato real del Tetris por cable.
    if (Save.data.flags.curioTetrisVs) { go(); return; }
    Save.data.flags.curioTetrisVs = true;
    Save.write();
    showCuriosity(null, 'gb_tetris_vs').then(go);
  },

  // ---------- TETRIS VS: dibujo ----------

  tvsDraw(who) {
    const v = this.tvs;
    const s = v[who];
    const C = TVS.cell;
    let html = '';
    s.board.forEach((row, r) => {
      row.c.forEach((k, c) => { if (k) html += `<i class="tvs-c k-${k}" style="left:${c * C}px;top:${r * C}px"></i>`; });
      if (row.g) {
        const g = row.g;
        const on = v.target === row;
        // La palabra va del lado contrario al hueco, para que el hueco se vea.
        const side = row.hole < TVS.cols / 2 ? `right:${C}px` : `left:${C}px`;
        html += `<i class="tvs-hole" style="left:${row.hole * C}px;top:${r * C}px"></i>` +
          `<b class="tvs-junk${on ? ' on' : ''}" style="top:${r * C}px;${side}"><span class="t">${esc(g.word.slice(0, g.pos))}</span>${esc(g.word.slice(g.pos))}</b>`;
      }
    });
    s.cells.innerHTML = html;
  },

  // Casillas recién puestas: parpadean un momento.
  tvsLanded(who, cells, x, y, bad) {
    cells.forEach(([cx, cy]) => { if (y + cy >= 0) this.tvsFx(who, bad ? 'tvs-land bad' : 'tvs-land', y + cy, x + cx); });
  },

  tvsFx(who, cls, row, col) {
    const s = this.tvs[who];
    const el = document.createElement('div');
    el.className = cls;
    el.style.top = `${row * TVS.cell}px`;
    if (col !== undefined) { el.style.left = `${col * TVS.cell}px`; el.style.width = `${TVS.cell}px`; }
    s.fx.appendChild(el);
    setTimeout(() => el.remove(), 450);
  },

  tvsFlash(who, text, cls = '') {
    const el = document.createElement('div');
    el.className = `tvs-flash ${cls}`;
    el.textContent = text;
    this.tvs[who].well.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  // Barrita al lado de tu pozo: cuánta basura te va a subir con la siguiente pieza.
  tvsMeter() {
    const v = this.tvs;
    const n = v.queue.reduce((a, g) => a + g.n, 0);
    v.me.meter.style.height = `${Math.min(100, (n / TVS.rows) * 100)}%`;
  },

  // La palabra que estás escribiendo, en grande debajo de tu pozo.
  tvsRenderWord() {
    const v = this.tvs;
    const p = v.piece;
    const t = v.target;
    const word = (w, pos, err) => `<span class="t">${esc(w.slice(0, pos))}</span><span class="nx${err ? ' bad' : ''}">${esc(w.slice(pos, pos + 1))}</span>${esc(w.slice(pos + 1))}`;
    let html;
    if (t && t.g) html = `<span class="lbl">BASURA</span><div class="w">${word(t.g.word, t.g.pos, this.tvsErr)}</div>`;
    else if (p) html = `<span class="lbl">${p.kind === 'I' ? 'BARRA: ¡PALABRA LARGA!' : 'PIEZA'}</span><div class="w">${word(p.word, p.pos, this.tvsErr)}</div>`;
    else html = '<span class="lbl">...</span><div class="w"></div>';
    v.me.under.innerHTML = html;
    if (p) p.el.lastChild.innerHTML = word(p.word, p.pos, this.tvsErr && t === p);
    this.tvsErr = false;
  },

  tvsNext() {
    const cells = tvsRots(this.tvs.next)[0];
    $('.tvs-next', this.tvs.el).innerHTML = cells.map(([x, y]) => `<i class="tvs-c k-${this.tvs.next}" style="left:${x * 12}px;top:${y * 12}px"></i>`).join('');
  },

  tvsStats() {
    const v = this.tvs;
    $('.tvs-lines', v.el).textContent = v.lines;
    $('.tvs-sent', v.el).textContent = v.sent;
    $('.tvs-ehp i', v.el).style.width = `${(this.e.hp / this.def.hp) * 100}%`;
    $('.tvs-php i', v.el).style.width = `${(this.p.hp / this.p.max) * 100}%`;
  },

  // ---------- TETRIS VS: teclado ----------
  // Como en la lluvia de Dodge: la primera letra decide qué escribes (la pieza o una fila de
  // basura). Todo empieza con letras distintas, así que nunca hay dudas.
  tvsKey(e) {
    const v = this.tvs;
    if (!v || !v.active || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    let t = v.target;
    if (t && t !== v.piece && !v.me.board.includes(t)) t = v.target = null; // esa fila ya no existe
    if (!t) {
      const p = v.piece;
      if (p && keyMatches(p.word[0], e.key)) t = p;
      else t = v.me.board.find((r) => r.g && keyMatches(r.g.word[0], e.key)) || null;
      if (!t) {
        if (p) { p.errors++; Stats.record(p.word[0], false); }
        this.st.errors++;
        Sfx.error();
        this.tvsErr = true;
        this.tvsRenderWord();
        return;
      }
      v.target = t;
    }
    const isPiece = t === v.piece;
    const w = isPiece ? t : t.g;
    const text = isPiece ? t.word : t.g.word;
    const expected = text[w.pos];
    if (!w.t0) w.t0 = performance.now();
    if (!keyMatches(expected, e.key)) {
      Stats.record(expected, false);
      w.errors = (w.errors || 0) + 1;
      this.st.errors++;
      Sfx.error();
      this.tvsErr = true;
      if (!isPiece) this.tvsDraw('me');
      this.tvsRenderWord();
      return;
    }
    Stats.record(expected, true);
    Sfx.key();
    w.pos++;
    this.st.chars++;
    if (w.pos < text.length) {
      if (!isPiece) this.tvsDraw('me');
      this.tvsRenderWord();
      return;
    }
    const ms = performance.now() - w.t0;
    this.st.ms += ms;
    if (this.def.onWord) this.def.onWord({ text, ms, errors: w.errors || 0 });
    v.target = null;
    if (isPiece) {
      this.tvsLock(t, null, false);
      return;
    }
    // ¡Fila de basura borrada! Lo de arriba baja una fila.
    const r = v.me.board.indexOf(t);
    this.tvsFx('me', 'tvs-clear', r);
    v.me.board.splice(r, 1);
    v.me.board.unshift(tvsRow());
    Sfx.pop();
    this.tvsDraw('me');
    this.tvsRenderWord();
  },

  // ---------- Fin: la primera pista del Glitch ----------

  win(spared) {
    if (this.clued) { Scenes.battle.win.call(this, spared); return; }
    this.clued = true;
    this.cleanup();
    Save.data.flags.pistaGlitch1 = true;
    const px = $('.glitch-px');
    if (px) px.classList.add('reveal');
    this.say([
      spared ? '* El Tetro Rey deja de girar por fin.\n* Se ve... aliviado.' : '* El Tetro Rey se tambalea y deja de girar.',
      '* "Yo no quería... algo morado me puso a girar y no me dejaba parar."',
      '* (Por un instante, un píxel de un color IMPOSIBLE parpadea en la torre... y desaparece.)',
    ], () => {
      if (px) px.remove();
      Scenes.battle.win.call(this, spared);
    });
  },

  onKey(e) {
    if (this.phase === 'tvs') { this.tvsKey(e); return; }
    Scenes.battle.onKey.call(this, e);
  },
});
