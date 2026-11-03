// Progreso guardado en el navegador (localStorage) y estadísticas de tecleo.
const SAVE_KEY = 'teclaquest_v1';

function defaultSave() {
  return {
    level: 1,
    xp: 0,
    done: {},      // enemigos vencidos o perdonados
    spared: {},    // enemigos perdonados (amigos)
    treasures: {},
    consoles: {},
    seenIntro: false,
    tutorialDone: false,
    muted: false,
    konami: false,
    secrets: {},   // secretos jugables encontrados (js/secretos.js)
    difficulty: 'auto', // ver DIFFICULTIES (las partidas nuevas empiezan en Automática)
    team: [],      // Tecloides: [{ id, lv, xp }]
    flags: {},
    quests: {},    // id -> 'active' | 'done'
    arcade: {},    // récords de minijuegos
    pos: null,     // dónde estaba explorando: { map, x, y, face }     // cosas que pasaron en el pueblo (diálogos, quests)
    stats: { keys: {}, battles: [], bestWpm: 0 },
  };
}

const Save = {
  data: defaultSave(),
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) this.data = Object.assign(defaultSave(), JSON.parse(raw));
    } catch (e) { /* sin guardado disponible: se juega igual */ }
  },
  write() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignorar */ }
  },
  reset() {
    this.data = defaultSave();
    this.write();
  },
};

// Dificultad: multiplica el tiempo para escribir, la velocidad de lo que cae y el daño recibido.
// Experto (~80 PPM) es como Normal para un niño de ~30 PPM pero con todo al doble de rápido: speed 2 también
// parte a la mitad el espaciado mínimo de 360 ms por letra del Dodge (gap / speed). Campos solo de Experto (1 si faltan):
// - hit: multiplica el daño que TÚ haces (a 80 PPM las peleas duraban un suspiro y el jefe casi no atacaba).
// - pace: por escena, multiplica tiempos fijos pensados para ~30 PPM que no escalaban con time (menor = más apretado).
const DIFFICULTIES = {
  // Automática: no tiene números fijos; diff() los arma con Auto según la velocidad real (va primera en el menú).
  auto: { name: 'Automática', desc: 'Se ajusta sola a tu velocidad: si escribes más rápido, los enemigos se ponen serios.', auto: true },
  facil: { name: 'Fácil', desc: 'Más tiempo para escribir, todo cae más lento y los golpes duelen menos.', time: 1.5, speed: 0.7, dmg: 0.6 },
  normal: { name: 'Normal', desc: 'El reto pensado para el juego.', time: 1, speed: 1, dmg: 1 },
  dificil: { name: 'Difícil', desc: 'Menos tiempo, todo más rápido y los golpes duelen más. ¡Para dedos turbo!', time: 0.75, speed: 1.3, dmg: 1.4 },
  experto: { name: 'Experto', desc: 'Para dedos de 80 palabras por minuto. Aquí los jefes sí pegan.', time: 0.5, speed: 2, dmg: 1.2, hit: 0.55,
    pace: { chupin: 0.98, kongo: 0.95, patos: 0.55, mazmorra: 0.7, caparazon: 0.65, punin: 0.99, vulpino: 1.03, nebula: 0.92, castillo: 0.7,
      brotes: 0.8, sombra_tetro: 0.9, tetrorey: 0.7, sombra_nebula: 0.75, sombra_marco: 0.8, guante: 0.7, boliche: 0.5, tenis: 0.93, box: 0.93 } },
};
// Dificultad automática: mide la velocidad real con las últimas peleas (Stats) y mezcla los multiplicadores
// entre Normal (niño de 30 PPM) y Experto (niño de 80 PPM). Ojo: el PPM que guardan las peleas sale algo más
// alto que la velocidad real (las letras del Dodge cuentan sin su tiempo): el niño de 30 marca ~35-40 y el de
// 80 marca ~70-77. Por eso es Normal de 25 a 40 PPM medidos, llega a Experto en 72 medidos, sigue apretando un poco
// más arriba (con topes) y abajo de 25 va hacia Fácil (12 o menos = Fácil).
// Con muchos errores cuenta como si escribiera más lento.
// Se recalcula solo al cambiar de escena (Game.go llama a Auto.refresh), así nunca cambia a mitad de una pelea.
const Auto = {
  cur: null,
  // Velocidad efectiva estimada: media móvil ponderada de las últimas 6 peleas (la más nueva pesa más).
  // Sin datos arranca en 30 (Normal) con un "previo" que pesa menos en cada pelea y desaparece a la 3ª.
  estimate() {
    const bs = Save.data.stats.battles.filter((b) => b.wpm > 0).slice(-6).reverse();
    const prior = 0.6 * Math.max(0, 3 - bs.length) / 3;
    // Algunos minijuegos miden la velocidad raro (muy alta o muy baja): ninguna pelea cuenta más de 120 PPM
    // y, con 3+ peleas, cada una se recorta a entre 70% y 125% de la mediana (si de verdad mejoró, igual sube).
    let lo = 0, hi = 120;
    if (bs.length >= 3) {
      const s = bs.map((b) => Math.min(120, b.wpm)).sort((x, y) => x - y);
      const med = (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2;
      lo = med * 0.7; hi = Math.min(120, med * 1.25);
    }
    const v = (b) => Math.min(hi, Math.max(lo, b.wpm));
    let w = prior, sw = prior * 30, sa = prior * 96, k = 1;
    for (const b of bs) { w += k; sw += k * v(b); sa += k * (b.acc == null ? 96 : b.acc); k *= 0.7; }
    const wpm = sw / w, acc = sa / w;
    // Precisión: debajo de 93% afloja (1,5% menos por cada punto, hasta 30% menos).
    const ppm = wpm * Math.max(0.7, 1 - Math.max(0, 93 - acc) * 0.015);
    return { n: bs.length, wpm: Math.round(wpm), acc: Math.round(acc), ppm };
  },
  // Mezcla los multiplicadores para la velocidad estimada.
  build(est) {
    const ppm = est.ppm;
    const N = DIFFICULTIES.normal, E = DIFFICULTIES.experto, F = DIFFICULTIES.facil;
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
    const label = est.n ? `Automática (≈ ${est.wpm} PPM)` : 'Automática (aprendiendo)';
    const o = { name: label, desc: DIFFICULTIES.auto.desc, auto: true, ppm };
    if (ppm < 25) {
      const t = clamp((25 - ppm) / 13, 0, 1); // 25 → Normal, 12 o menos → Fácil
      return Object.assign(o, { time: lerp(N.time, F.time, t), speed: lerp(N.speed, F.speed, t), dmg: lerp(N.dmg, F.dmg, t) });
    }
    const t = clamp((ppm - 40) / 32, 0, 1.3); // hasta 40 → Normal, 72 medidos (≈ 80 reales) → Experto, tope ≈ 82
    o.time = Math.max(0.4, lerp(N.time, E.time, t));
    o.speed = Math.min(2.4, lerp(N.speed, E.speed, t));
    o.dmg = Math.min(1.3, lerp(N.dmg, E.dmg, t));
    o.hit = Math.max(0.45, lerp(1, E.hit, t));
    o.pace = {};
    for (const k in E.pace) o.pace[k] = clamp(lerp(1, E.pace[k], t), 0.45, 1.05);
    return o;
  },
  refresh() {
    if (Save.data.difficulty !== 'auto') { this.cur = null; return; }
    const est = this.estimate();
    this.cur = this.build(est);
    // Mensajito cuando sube bastante (y se recuerda en la partida para no repetirlo).
    const f = Save.data.flags;
    const told = f.autoTold || 30;
    if (est.n && est.ppm >= Math.max(told + 10, 50)) { f.autoTold = Math.round(est.ppm); this.note = '¡Tus dedos van rápido! Los enemigos se pusieron serios.'; }
    else if (est.ppm < told - 15) f.autoTold = Math.round(est.ppm);
  },
  // Normal o Fácil promediando más de 60 PPM en las últimas 3 peleas: sugerir una vez Automática o Experto.
  shouldSuggest() {
    const d = Save.data;
    if (!['normal', 'facil'].includes(d.difficulty) || d.flags.autoSugerido) return false;
    const bs = d.stats.battles.filter((b) => b.wpm > 0).slice(-3);
    return bs.length === 3 && bs.reduce((a, b) => a + b.wpm, 0) / 3 > 60;
  },
};
const diff = () => {
  if (Save.data.difficulty === 'auto') return Auto.cur || (Auto.refresh(), Auto.cur);
  return DIFFICULTIES[Save.data.difficulty] || DIFFICULTIES.normal;
};
// Para lo que no es un multiplicador (topes, modo turbo, misiones): Automática cuenta como la fija más parecida.
const diffKey = () => {
  const id = Save.data.difficulty;
  if (id !== 'auto') return DIFFICULTIES[id] ? id : 'normal';
  const p = diff().ppm;
  return p < 18 ? 'facil' : p < 55 ? 'normal' : p < 68 ? 'dificil' : 'experto';
};
// pace('escena'): multiplicador de esa escena en diff().pace (1 si no está; Fácil, Normal y Difícil no lo tienen).
const pace = (k) => (diff().pace || {})[k] || 1;
const scaledDmg = (n) => Math.max(1, Math.round(n * diff().dmg));

const xpToNext = (level) => 15 + level * 10;
// (los tesoros con effect.hp suman un poquito, ver treasureBonus en js/data.js)
const playerMaxHp = () => 20 + Save.data.level * 4 + treasureBonus('hp');

function addXp(n) {
  const d = Save.data;
  d.xp += n;
  let ups = 0;
  while (d.xp >= xpToNext(d.level)) {
    d.xp -= xpToNext(d.level);
    d.level++;
    ups++;
  }
  return ups;
}

// Quita acentos y mayúsculas: "Ó" -> "o", "ñ" -> "n".
// Así no importa si el teclado no tiene acentos o Bloq Mayús está prendido.
function norm(ch) {
  return ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function keyMatches(expected, typed) {
  return typed === expected || norm(typed) === norm(expected);
}

const Stats = {
  record(expected, ok) {
    const k = norm(expected);
    const keys = Save.data.stats.keys;
    const r = keys[k] || (keys[k] = { n: 0, e: 0 });
    r.n++;
    if (!ok) r.e++;
  },
  // Las teclas con más errores (con suficientes intentos para que cuente).
  weakKeys(n = 3) {
    return Object.entries(Save.data.stats.keys)
      .filter(([k, r]) => k !== ' ' && r.n >= 8 && r.e / r.n >= 0.04)
      .sort((a, b) => b[1].e / b[1].n - a[1].e / a[1].n)
      .slice(0, n)
      .map(([k]) => k);
  },
  addBattle(rec) {
    const s = Save.data.stats;
    rec.diff = Save.data.difficulty;
    s.battles.push(rec);
    if (s.battles.length > 50) s.battles.shift();
    const isRecord = rec.wpm > s.bestWpm;
    if (isRecord) s.bestWpm = rec.wpm;
    return isRecord;
  },
};

// Elige palabras al azar, pero con más probabilidad las que tienen las teclas
// donde más se equivoca. Así practica justo lo que le cuesta.
function pickWords(pool, n) {
  const weak = Stats.weakKeys(3);
  const left = pool.map((w) => ({ w, weight: 1 + 2 * [...norm(w)].filter((c) => weak.includes(c)).length }));
  const out = [];
  while (out.length < n && left.length) {
    const total = left.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    let i = 0;
    while ((r -= left[i].weight) > 0 && i < left.length - 1) i++;
    out.push(left[i].w);
    left.splice(i, 1);
  }
  return out;
}
