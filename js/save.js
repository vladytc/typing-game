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
    difficulty: 'normal', // ver DIFFICULTIES
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
  facil: { name: 'Fácil', desc: 'Más tiempo para escribir, todo cae más lento y los golpes duelen menos.', time: 1.5, speed: 0.7, dmg: 0.6 },
  normal: { name: 'Normal', desc: 'El reto pensado para el juego.', time: 1, speed: 1, dmg: 1 },
  dificil: { name: 'Difícil', desc: 'Menos tiempo, todo más rápido y los golpes duelen más. ¡Para dedos turbo!', time: 0.75, speed: 1.3, dmg: 1.4 },
  experto: { name: 'Experto', desc: 'Para dedos de 80 palabras por minuto. Aquí los jefes sí pegan.', time: 0.5, speed: 2, dmg: 1.2, hit: 0.55,
    pace: { chupin: 0.98, kongo: 0.95, patos: 0.55, mazmorra: 0.7, caparazon: 0.65, punin: 0.99, vulpino: 1.03, nebula: 0.92, castillo: 0.7,
      brotes: 0.8, sombra_tetro: 0.9, tetrorey: 0.7, sombra_nebula: 0.75, sombra_marco: 0.8, guante: 0.7, boliche: 0.5, tenis: 0.93, box: 0.93 } },
};
const diff = () => DIFFICULTIES[Save.data.difficulty] || DIFFICULTIES.normal;
// pace('escena'): multiplicador de esa escena en diff().pace (1 si no está; Fácil, Normal y Difícil no lo tienen).
const pace = (k) => (diff().pace || {})[k] || 1;
const scaledDmg = (n) => Math.max(1, Math.round(n * diff().dmg));

const xpToNext = (level) => 15 + level * 10;
const playerMaxHp = () => 20 + Save.data.level * 4;

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
