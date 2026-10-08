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
    flags: {},     // cosas que pasaron en el pueblo (diálogos, quests)
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
