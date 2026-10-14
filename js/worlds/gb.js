// MUNDO 1 — Valle Game Boy (1989). Paleta de 4 verdes. Diseño en docs/LORE.md §4.

// Misión de récord "Racha de 20": 20 palabras seguidas sin error en batallas de este mundo.
// Cada enemigo del valle la llama con `onWord` al terminar una palabra o frase.
function gbRacha(unit) {
  const f = Save.data.flags;
  if (Quests.state('racha_gb') === 'done') return;
  if (!Quests.state('racha_gb')) Quests.start('racha_gb');
  const n = unit.text.trim().split(/\s+/).length;
  f.gbRacha = unit.errors ? 0 : (f.gbRacha || 0) + n;
  f.gbRachaMax = Math.max(f.gbRachaMax || 0, f.gbRacha);
  if (f.gbRacha >= 20) {
    Save.data.treasures.pila_extra = true;
    Quests.complete('racha_gb');
    toast(`¡RACHA DE 20!\nGanaste: ${upper(TREASURES.pila_extra.name)}`);
  }
  Save.write();
}

// Sprites del mundo (se pintan con la paleta de 4 verdes).
const GB_SPRITES = {
  monedin: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbaabbbbbd...',
    '..dbabbbbbbbbd..',
    '..dbbadbbadbbd..',
    '..dbbddbbddbbd..',
    '..dbbbbbbbbbbd..',
    '..dbcbbbbbbcbd..',
    '..dbbbddddbbbd..',
    '..dbbbbbbbbbbd..',
    '...dbbbbbbbbd...',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '....dd....dd....',
    '................',
  ],
  linkito: [
    '................',
    '...dddddddd.....',
    '...dbbbbbbd.....',
    '...dbadbadd.....',
    '...dbddbddd.....',
    '...dbbbbbbd.....',
    '...dbbddbbd.....',
    '...dddddddd.....',
    '....dccccd......',
    '.....dccd.......',
    '.....dcd....dd..',
    '.....dcd...dcd..',
    '.....dccd.dccd..',
    '......dcccccd...',
    '.......ddddd....',
    '................',
  ],
  chupin: [
    '................',
    '.....dddddd.....',
    '...ddbbbbbbdd...',
    '..dbbaabbbbbbd..',
    '..dbabbdbbdbbd..',
    '.dbbbbdbbdbbbbd.',
    '.dbbbbadbadbbbd.',
    '.dbcbbbbbbbbcbd.',
    '.dbbbbbddbbbbbd.',
    '.dbbbbdccdbbbbd.',
    '..dbbbbddbbbbd..',
    '..dbbbbbbbbbbd..',
    '...ddbbbbbbdd...',
    '..dccddddddccd..',
    '..dccccd.dcccd..',
    '...dddd...ddd...',
  ],
  moneda_verde: [
    '................',
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbaabbbbcd...',
    '...dbabddbbcd...',
    '...dbbdbbbbcd...',
    '...dbbbddbbcd...',
    '...dbbbbbdbcd...',
    '...dbbddddbcd...',
    '...dbbbbbbbcd...',
    '....dccccccd....',
    '.....dddddd.....',
    '................',
    '................',
    '................',
  ],
  cable_doble: [
    '................',
    '.dddd......dddd.',
    '.dbbd......dbbd.',
    '.dbbd......dbbd.',
    '.dddd......dddd.',
    '..dd........dd..',
    '..dc........cd..',
    '..dc........cd..',
    '..dcd......dcd..',
    '...dcd....dcd...',
    '....dcddddcd....',
    '.....dccccd.....',
    '......dccd......',
    '......dccd......',
    '.......dd.......',
    '................',
  ],
  gameboy_lupa: [
    '................',
    '....dddddd......',
    '...daabbbbd.....',
    '..dabbbbbbbd....',
    '..dabbbbbbbd....',
    '..dbbbbbbbbd....',
    '..dbbbbbbbbd....',
    '..dbbbbbbbbd....',
    '...dbbbbbbd.....',
    '....dddddddd....',
    '.........dccd...',
    '..........dccd..',
    '...........dccd.',
    '............dcd.',
    '.............d..',
    '................',
  ],
  tomate: [
    '................',
    '.......dd.......',
    '.....ddcdd......',
    '....dccdccd.....',
    '...ddddddddd....',
    '..dbbbbbbbbbd...',
    '.dbaabbbbbbbbd..',
    '.dbabdbbbbdbbd..',
    '.dbbbddbbddbbd..',
    '.dbbbdbddbdbbd..',
    '.dbbbdbbbbdbbd..',
    '.dbbbbbbbbbbcd..',
    '..dbbbbbbbbcd...',
    '...dccccccdd....',
    '....dddddd......',
    '................',
  ],
};
// La hermana de Monedín: la misma moneda, pero "dorada" (más clarita).
GB_SPRITES.monedina = GB_SPRITES.monedin.map((r) => r.replace(/c/g, 'a'));

// ---------- Música (melodías originales, salvo las piezas de dominio público marcadas) ----------
// Ayudantes para escribir las pistas del valle por acordes: cada compás es un texto con uno
// o dos acordes ('Dm' = compás entero, 'Gm A7' = medio y medio). Los usa también gb-mapa.js.
const GB_MUS = (() => {
  const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FL = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
  const pc = (r) => NN.indexOf(FL[r] || r);
  const num = (n) => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return pc(m[1]) + 12 * Number(m[2]); };
  const name = (k) => NN[((k % 12) + 12) % 12] + Math.floor(k / 12);
  const tr = (n, d) => name(num(n) + d);
  const Q = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6] };
  const parts = (c) => { const m = /^([A-G][#b]?)(.*)$/.exec(c); return { r: pc(m[1]), q: Q[m[2]] }; };
  // Raíz del acorde en la octava que empieza en `lo` (para el bajo).
  const root = (c, lo = 'E2') => { const b = num(lo); return name(b + ((parts(c).r - b) % 12 + 12) % 12); };
  // Notas del acorde, cerradas arriba de `lo` (de grave a agudo).
  const tones = (c, lo = 'A3') => {
    const { r, q } = parts(c);
    const b = num(lo);
    return q.map((x) => b + (((r + x - b) % 12) + 12) % 12).sort((a, z) => a - z).map(name);
  };
  const chord = (c, lo) => tones(c, lo).join('+');
  // Recorre la armonía: full(acorde, siguiente) da 16 pasos; half(acorde, siguiente) da 8.
  const bars = (harm, full, half) => {
    const list = harm.flatMap((b) => { const cs = b.split(' '); return cs.map((c) => ({ c, half: cs.length > 1 })); });
    return list.map((x, i) => (x.half ? half : full)(x.c, list[(i + 1) % list.length].c)).join(' | ');
  };
  return { tr, root, tones, chord, bars };
})();
const gbArp = (a, b, c) => `${rep(`${a} ${b} ${c}`, 5)} ${a}`; // 16 pasos de arpegio "en tresillos"

// Tetro Rey (fases 1 y 3): marcha de cosacos ORIGINAL en Re menor armónica, con la misma
// melodía en las dos fases (la 3 más rápida, con arpegios en tresillo y una sección extra).
function gbTetroTrack(fase3) {
  const { bars, chord, root, tr, tones } = GB_MUS;
  const H = {
    I: ['Dm', 'Dm A7'],
    A: ['Dm', 'Dm', 'Gm', 'A7', 'Dm', 'Bb', 'Gm A7', 'Dm'],
    B: ['Bb', 'C', 'F', 'Dm', 'Gm', 'Eb', 'A7', 'A7'],
    C: ['Dm', 'C', 'Bb', 'A7', 'Dm', 'C', 'Bb', 'A'],
    D: ['Dm', 'Bb', 'Gm', 'A7', 'Dm', 'Bb', 'Gm', 'A7'],
  };
  // A: marcha con puntillos; pregunta (4 compases que acaban en La) y respuesta (acaba en Re).
  const melA = 'D5/3! D5/1 A5/4 F5/3 E5/1 D5/4 | A5/3 A5/1 D6/4 C6/2 Bb5/2 A5/4 | Bb5/3 A5/1 G5/4 D5/3 E5/1 F5/2 G5/2 | ' +
    'A5/6 G5/2 E5/2 C#5/2 E5/2 G5/2 | F5/3 E5/1 D5/4 A5/3 G5/1 F5/4 | D6/3 C6/1 Bb5/4 F5/4 D5/4 | ' +
    'G5/2 Bb5/2 D6/2 Bb5/2 A5/2 C#6/2 E6/2 G5/2 | F5/2 E5/2 D5/4! A4/4 -/4';
  // B: secuencia que sube (Sib, Do, Fa) y cae en el Mib "napolitano" antes del La7.
  const melB = 'F5/2 Bb5/2 D6/4 C6/2 Bb5/2 F5/4 | G5/2 C6/2 E6/4 D6/2 C6/2 G5/4 | A5/3 G5/1 F5/2 A5/2 C6/4 A5/4 | D6/6 C6/2 A5/4 F5/4 | ' +
    'G5/3 A5/1 Bb5/4 D6/3 C6/1 Bb5/4 | Eb6/6 D6/2 Bb5/2 G5/2 Eb5/4 | C#6/4! E6/4 A5/4 G5/4 | E5/2 F5/2 G5/2 A5/2 Bb5/2 A5/2 G5/2 E5/2';
  // C: "el rey se enoja": semicorcheas con nota pedal sobre el bajo que baja Re-Do-Sib-La.
  const ped = (a, b, c, d, e) => `(${a}/1 ${b}/1 ${c}/1 ${b}/1)*2 ${d}/1 ${b}/1 ${c}/1 ${b}/1 ${a}/2 ${e}/2`;
  const c3 = `${ped('D6', 'A5', 'F5', 'E6', 'C6')} | ${ped('C6', 'G5', 'E5', 'D6', 'Bb5')} | ${ped('Bb5', 'F5', 'D5', 'C6', 'A5')}`;
  const melC = `${c3} | A5/4! C#6/4 E6/4 G6/4 | ${c3} | A6/8! G6/2 F6/2 E6/2 C#6/2`;
  // D (solo fase 3): golpes y escalas, cada vez más arriba.
  const d3 = 'D6/2! -/2 D6/2 -/2 F6/2 E6/2 D6/2 A5/2 | Bb5/2! -/2 Bb5/2 -/2 D6/2 C6/2 Bb5/2 F5/2 | G5/2! -/2 G5/2 -/2 Bb5/2 A5/2 G5/2 D5/2';
  const melD = `${d3} | A5/2 C#6/2 E6/2 A6/2 G6/2 E6/2 C#6/2 A5/2 | ${d3} | A6/4! G6/2 F6/2 E6/2 D6/2 C#6/2 A5/2`;
  const melI = 'A4/2! -/2 A4/2! -/2 A4/1 A4/1 A4/2 -/4 | D5/2 E5/2 F5/2 G5/2 A5/4! C#5/4';
  // Segunda voz: en A acordes de marcha a contratiempo, en B una línea larga, en C/D arpegios.
  const stab = (c) => `-/4 ${chord(c, 'A4')}/2. -/2`;
  const line = (c) => { const t = tones(c, 'D4'); return `${t[1]}/8 ${t[0]}/8`; };
  const lineH = (c) => `${tones(c, 'D4')[1]}/8`;
  const arp = (c) => `${chord(c, 'D5')}/16`;
  const arpH = (c) => `${chord(c, 'D5')}/8`;
  const tres = (c) => { const t = tones(c, 'D5'); return gbArp(t[0], t[1], t[2]); };
  const tresH = (c) => { const t = tones(c, 'D5'); return `${rep(`${t[0]} ${t[1]} ${t[2]}`, 2)} ${t[0]} ${t[1]}`; };
  const v2 = fase3
    ? { I: bars(H.I, tres, tresH), A: bars(H.A, tres, tresH), B: bars(H.B, tres, tresH), C: bars(H.C, arp, arpH), D: bars(H.D, tres, tresH) }
    : { I: '-/32', A: bars(H.A, (c) => `${stab(c)} ${stab(c)}`, stab), B: bars(H.B, line, lineH), C: bars(H.C, arp, arpH) };
  // Bajo: en A "um-pa" de marcha; en B octavas que corren; en C/D semicorcheas.
  const R = (c) => root(c, 'E2');
  const app = (n) => tr(R(n), -1);
  const march = (c, n) => `${R(c)}/2! -/2 ${tr(R(c), 7)}/2 -/2 ${R(c)}/2 ${tr(R(c), 12)}/2 ${tr(R(c), 7)}/2 ${app(n)}/2`;
  const marchH = (c, n) => `${R(c)}/2! ${tr(R(c), 12)}/2 ${tr(R(c), 7)}/2 ${app(n)}/2`;
  const oct = (c) => `(${R(c)}/2 ${tr(R(c), 12)}/2)*4`;
  const octH = (c) => `(${R(c)}/2 ${tr(R(c), 12)}/2)*2`;
  const run = (c) => `(${R(c)}/1 ${R(c)}/1 ${tr(R(c), 12)}/1 ${R(c)}/1)*4`;
  const runH = (c) => `(${R(c)}/1 ${R(c)}/1 ${tr(R(c), 12)}/1 ${R(c)}/1)*2`;
  const bas = fase3
    ? { I: bars(H.I, run, runH), A: bars(H.A, run, runH), B: bars(H.B, oct, octH), C: bars(H.C, run, runH), D: bars(H.D, run, runH) }
    : { I: bars(H.I, oct, octH), A: bars(H.A, march, marchH), B: bars(H.B, oct, octH), C: bars(H.C, run, runH) };
  // Batería de marcha (tarola con redobles) y un redoble al cerrar cada sección.
  const fill = 's/1 s/1 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2';
  const sec = (beat) => `c+${beat} (${beat})*6 ${fill}`;
  const dr = fase3
    ? { a: 'k/1 h/1 h/1 h/1 s/1 h/1 k/1 h/1 k/1 h/1 h/1 h/1 s/1 h/1 s/1 s/1', b: 'k/2 o/2 s/2 o/2 k/1 k/1 o/2 s/2 o/2' }
    : { a: 'k/2 -/2 s/2 s/1 s/1 k/2 k/2 s/2 h/2', b: 'k/2 h/2 s/2 h/2 k/2 h/2 s/2 s/1 s/1' };
  const drI = 'c+k/4 -/4 k/2 s/1 s/1 s/2 s/2 | s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/2! s/2! t/2 T/2';
  const drC = 'k/1 k/1 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
  return {
    bpm: fase3 ? 180 : 140, era: 'gb', intro: ['I'],
    form: fase3 ? ['A', 'B', 'C', 'D', 'A'] : ['A', 'B', 'C', 'A'],
    voices: [
      { wave: 'square', vol: 0.033, vib: { rate: 6, depth: 0.2, delay: 0.22 }, parts: { I: melI, A: melA, B: melB, C: melC, D: melD } },
      { wave: 'sawtooth', vol: fase3 ? 0.014 : 0.019, arp: 0.03, parts: v2 },
      { wave: 'triangle', vol: 0.085, fx: 0, parts: bas },
      { wave: 'noise', vol: 0.026, parts: { I: drI, A: sec(dr.a), B: sec(dr.b), C: sec(drC), D: sec(dr.a) } },
    ],
  };
}
// TETRIS VS (fase 2 de Tetro Rey): arreglo PROPIO de Korobeiniki, la canción folclórica rusa
// del siglo XIX (dominio público) que Tetris usó como "Tipo A". Solo la melodía es la del pueblo:
// el bajo de polka, los acordes a contratiempo, la segunda voz, las variaciones y el puente B
// son nuestros (nada del arreglo de Game Boy). La menor, forma A A' B A.
const GB_KORO_TRACK = (() => {
  // La melodía folclórica, 8 compases.
  const melA = 'E5/4! B4/2 C5/2 D5/4 C5/2 B4/2 | A4/4 A4/2 C5/2 E5/4 D5/2 C5/2 | B4/6 C5/2 D5/4 E5/4 | C5/4 A4/4 A4/8 | ' +
    '-/2 D5/4! F5/2 A5/4 G5/2 F5/2 | E5/6 C5/2 E5/4 D5/2 C5/2 | B4/4 B4/2 C5/2 D5/4 E5/4 | C5/4 A4/4 A4/4 -/4';
  // A': la misma, pero adornada (mordentes y rellenos donde había notas largas).
  const melA2 = 'E5/2! F5/1 E5/1 B4/2 C5/2 D5/2 E5/1 D5/1 C5/2 B4/2 | A4/4 A4/2 C5/2 E5/4 D5/2 C5/2 | ' +
    'B4/2 A4/1 B4/1 C5/2. C5/2 D5/4 E5/4 | C5/4 A4/2 E4/2 A4/2 C5/2 E5/4 | ' +
    '-/2 D5/4! F5/2 A5/4 G5/2 F5/2 | E5/2 D5/1 E5/1 F5/2 C5/2 E5/4 D5/2 C5/2 | B4/4 B4/2 C5/2 D5/2 E5/2 G#5/4 | A5/4! E5/2 C5/2 A4/4 -/4';
  // B: puente original en Do mayor que vuelve a Mi para caer otra vez en La menor.
  const melB = 'G5/4! E5/2 G5/2 C6/4 G5/4 | B5/4 G5/2 D5/2 G5/8 | A5/4! F5/2 A5/2 C6/4 A5/4 | G5/6 E5/2 C5/8 | ' +
    'D5/2 F5/2 A5/4 F5/2 A5/2 D6/4 | C6/2 B5/2 A5/4 E5/4 A5/4 | B4/2 C5/2 D5/2 E5/2 G#5/4 B5/4 | E6/8! D6/2 C6/2 B5/2 G#5/2';
  const CH = { Am: 'C4+E4+A4', E: 'B3+E4+G#4', Dm: 'D4+F4+A4', C: 'C4+E4+G4', G: 'B3+D4+G4', F: 'C4+F4+A4' };
  const harmA = ['Am', 'Am', 'E', 'Am', 'Dm', 'C', 'E', 'Am'];
  const harmB = ['C', 'G', 'F', 'C', 'Dm', 'Am', 'E', 'E'];
  // Bajo de polka: raíz y quinta con un paso que lleva al siguiente acorde.
  const BAS = { Am: ['A2', 'E3'], E: ['E2', 'B2'], Dm: ['D3', 'A2'], C: ['C3', 'G2'], G: ['G2', 'D3'], F: ['F2', 'C3'] };
  const PASO = { Am: 'G#2', E: 'D#2', Dm: 'C#3', C: 'B2', G: 'F#2', F: 'E2' };
  const bassOf = (harm) => harm.map((c, i) => {
    const [r, f] = BAS[c];
    const sig = harm[(i + 1) % harm.length];
    return `${r}/2! -/2 ${f}/2. -/2 ${r}/2 -/2 ${f}/2. ${PASO[sig]}/2.`;
  }).join(' ');
  const stabs = (harm) => harm.map((c) => `(-/2 ${CH[c]}/2.)*4`).join(' ');
  const beat = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
  const fill = 'k/2 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2';
  const drums = `(${beat})*7 ${fill}`;
  return {
    bpm: 150, era: 'gb', intro: ['I'], form: ['A', 'A2', 'B', 'A'],
    voices: [
      { wave: 'pulse25', vol: 0.034, vib: 'light', parts: { A: melA, A2: melA2, B: melB } },
      // Segunda voz: notas largas del acorde abajo de la melodía (en A va callada).
      { wave: 'pulse50', vol: 0.014, env: 'soft', parts: {
        A2: 'C5/8 A4/8 E4/8 A4/8 G#4/8 B4/8 A4/8 E4/8 F4/8 A4/8 G4/8 E4/8 G#4/8 B4/8 A4/16',
        B: 'E4/16 D4/16 C4/16 E4/16 F4/16 E4/16 G#4/16 B4/16' } },
      { wave: 'pulse12', vol: 0.011, arp: 0.03, parts: { A: stabs(harmA), A2: stabs(harmA), B: stabs(harmB) } },
      { wave: 'triangle', vol: 0.1, fx: 0, parts: { I: 'A2/2! -/2 E3/2. -/2 A2/2 -/2 E3/2. G#2/2.', A: bassOf(harmA), A2: bassOf(harmA), B: bassOf(harmB) } },
      { wave: 'noise', vol: 0.026, parts: { I: fill, A: drums, A2: drums, B: drums } },
    ],
  };
})();
// Chupín (Cueva de los Sueños): ORIGINAL, bailable y traviesa en Fa mayor, al estilo de los
// juegos de la bolita rosa de 1992: bajo saltarín en staccato, golpecitos a contratiempo,
// cromatismos de caricatura y la "inhalada" (una bajada cromática) al cerrar el puente.
const GB_CHUPIN_MUS = (() => {
  const { bars, chord, root, tr } = GB_MUS;
  const H = {
    I: ['C7'],
    A: ['F', 'Dm7', 'Gm7', 'C7', 'F', 'D7', 'Gm7 C7', 'F'],
    A2: ['F', 'Dm7', 'Gm7', 'C7', 'F F7', 'Bb Bbm', 'F C7', 'F'],
    B: ['Bb', 'Bb', 'Am7', 'D7', 'Gm7', 'Ab7', 'Gm7 C7', 'C7'],
  };
  const head = 'C5/2. F5/2. A5/2. -/2 G5/2 A5/2 C6/4 | A5/2. -/2 F5/2. D5/2 E5/2 F5/2 A5/4 | ' +
    'Bb5/2. -/2 G5/2. D5/2 F5/2 G5/2 Bb5/2 A5/2 | G5/6 E5/2 C5/2 D5/2 E5/2 G5/2';
  const mel = {
    I: 'C5/1 D5/1 E5/1 F5/1 G5/1 A5/1 Bb5/1 B5/1 C6/4! -/4',
    A: `${head} | A5/2. C6/2. F6/4 E6/2 D6/2 C6/2 A5/2 | F#5/2. A5/2. D6/4 C6/2 A5/2 F#5/2 D5/2 | ` +
      'G5/2 A5/2 Bb5/2 D6/2 C6/2 Bb5/2 G5/2 E5/2 | F5/4! A5/2. C5/2. F5/4 -/4',
    A2: `${head} | A5/2. C6/2. F6/2 Eb6/2 -/2 C6/2 A5/2 F5/2 | D6/4 Bb5/2 F5/2 Db6/4 Bb5/2 F5/2 | ` +
      'C6/2 A5/2 F5/2 A5/2 G5/2 Bb5/2 E5/2 G5/2 | F5/2 -/2 C6/2. -/2 F5/4! -/4',
    // Puente: sube por Sib y La7, se va al Lab7 (cromático) y se "inhala" todo de vuelta a Do.
    B: 'D6/2 C6/2 Bb5/2 F5/2 D5/4 F5/4 | G5/2 F5/2 D5/2 Bb4/2 C5/2 D5/2 F5/4 | E5/2 G5/2 C6/4 B5/2 C6/2 E6/4 | D6/6 C6/2 A5/2 F#5/2 C6/4 | ' +
      'Bb5/2. D6/2. F6/4 E6/2 D6/2 Bb5/4 | C6/2. Eb6/2. Gb6/4 F6/2 Eb6/2 C6/4 | Bb5/2 D6/2 F6/2 D6/2 E6/2 C6/2 Bb5/2 G5/2 | ' +
      'C6/1 B5/1 Bb5/1 A5/1 Ab5/1 G5/1 F#5/1 F5/1 E5/1 Eb5/1 D5/1 Db5/1 C5/4!',
  };
  const offH = (c) => `-/2 ${chord(c, 'A4')}/2. -/2 ${chord(c, 'A4')}/2.`;
  const off = (c) => `${offH(c)} ${offH(c)}`;
  const v2 = {
    I: '-/16', A: bars(H.A, off, offH), A2: bars(H.A2, off, offH),
    B: 'D5/16 F5/16 E5/8 G5/8 F#5/8 C5/8 D5/16 Eb5/16 D5/8 E5/8 -/16',
  };
  const R = (c) => root(c, 'E2');
  const app = (n) => tr(R(n), -1);
  const hop = (c, n) => `${R(c)}/2. -/2 ${tr(R(c), 12)}/2. ${R(c)}/2. ${tr(R(c), 7)}/2. -/2 ${tr(R(c), 12)}/2. ${app(n)}/2.`;
  const hopH = (c, n) => `${R(c)}/2. ${tr(R(c), 12)}/2. ${tr(R(c), 7)}/2. ${app(n)}/2.`;
  const walk = (c, n) => `${R(c)}/4 ${tr(R(c), 7)}/4 ${tr(R(c), 12)}/4 ${app(n)}/4`;
  const walkH = (c, n) => `${R(c)}/4 ${app(n)}/4`;
  const bas = { I: 'C3/2. -/2 G2/2. -/2 C3/2 D3/2 E3/2 E2/2', A: bars(H.A, hop, hopH), A2: bars(H.A2, hop, hopH), B: bars(H.B, walk, walkH) };
  const beat = 'k/2 -/2 s/2 h/2 k/2 k/2 s/2 h/2';
  const fill = 'k/2 s/1 s/1 s/2 s/1 s/1 t/2 t/2 T/2 T/2';
  const beatB = 'k/4 h/2 h/2 s/4 h/2 h/2';
  const dr = { I: 'k/2 -/2 s/2 -/2 s/1 s/1 s/1 s/1 t/2 T/2', A: `(${beat})*7 ${fill}`, A2: `(${beat})*7 ${fill}`, B: `(${beatB})*7 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 c+k/4` };
  return { H, mel, v2, bas, dr };
})();
// Chupín: 1 compás de intro + 32 (≈ 56 s).
const GB_CHUPIN_TRACK = {
  bpm: 138, era: 'gb', swing: 0.12, intro: ['I'], form: ['A', 'A2', 'B', 'A2'],
  voices: [
    { wave: 'pulse25', vol: 0.034, vib: { rate: 6.5, depth: 0.22, delay: 0.18 }, parts: GB_CHUPIN_MUS.mel },
    { wave: 'pulse12', vol: 0.02, parts: GB_CHUPIN_MUS.v2 },
    { wave: 'triangle', vol: 0.085, fx: 0, parts: GB_CHUPIN_MUS.bas },
    { wave: 'noise', vol: 0.022, parts: GB_CHUPIN_MUS.dr },
  ],
};

// CHUPA-LETRAS (minijuego de Chupín): galop frenético en Fa mayor, 1 compás + 512 pasos (≈ 46 s).
// La parte A es un arreglo PROPIO del "Galop infernal" de Jacques Offenbach (Orfeo en los
// infiernos, 1858; Offenbach murió en 1880: dominio público), el mismo cancán que Super Mario
// Land (Game Boy, 1989) usó para la estrella de invencibilidad. Fuentes: Super Mario Wiki,
// "Galop infernal" (https://www.mariowiki.com/Galop_infernal) y las notas del disco de Super Mario
// Land (https://www.mariowiki.com/Super_Mario_Land_(album)), y la trivia de GameFAQs del juego.
// Solo la melodía de Offenbach es la original (pasada a Fa); el bajo, los acordes, la segunda voz
// en terceras y la batería son nuestros. La parte B es el tema de Chupín a todo galope.
const GB_CHUPALETRAS_TRACK = (() => {
  const { bars, chord, root, tr } = GB_MUS;
  const G = (b8) => 'F5/4 G5/2 Bb5/2 | A5/2 G5/2 C6/4 | C6/4 C6/2 D6/2 | A5/2 Bb5/2 G5/4 | ' +
    `G5/4 G5/2 Bb5/2 | A5/2 G5/2 F5/2 F6/2 | E6/2 D6/2 C6/2 Bb5/2 | ${b8}`;
  const galop = `${G('A5/2 G5/2 F5/2 G5/2')} | ${G('A5/2 G5/2 F5/4!')}`;
  // Segunda voz de A2: la melodía una tercera abajo (como banda de pueblo).
  const T = (b8) => 'D5/4 E5/2 G5/2 | F5/2 E5/2 A5/4 | A5/4 A5/2 Bb5/2 | F5/2 G5/2 E5/4 | ' +
    `E5/4 E5/2 G5/2 | F5/2 E5/2 D5/2 D6/2 | C6/2 Bb5/2 A5/2 G5/2 | ${b8}`;
  const terceras = `${T('F5/2 E5/2 D5/2 E5/2')} | ${T('F5/2 E5/2 C5/4')}`;
  // Armonía del galop: un compás de 2/4 (8 pasos) por acorde.
  const hG = ['F', 'C7', 'F', 'C7', 'C7', 'F', 'C7', 'C7', 'F', 'C7', 'F', 'C7', 'C7', 'F', 'C7', 'F'];
  const R = (c) => root(c, 'E2');
  const oomH = (c) => `${R(c)}/2! -/2 ${tr(R(c), 7)}/2. -/2`;
  const stabH = (c) => `-/2 ${chord(c, 'A4')}/2. -/2 ${chord(c, 'A4')}/2.`;
  // bars() da 16 pasos por compás "entero": aquí cada acorde es medio compás de 4/4.
  const half = (list, f) => list.map((c) => f(c)).join(' | ');
  const C = GB_CHUPIN_MUS;
  const chupHead = C.mel.A.split(' | ').slice(0, 4).join(' | ');
  const chupB = C.mel.B.split(' | ').slice(4).join(' | ');
  const hB = C.H.A.slice(0, 4).concat(C.H.B.slice(4));
  const runH = (c) => `${R(c)}/1 ${R(c)}/1 ${tr(R(c), 12)}/1 ${R(c)}/1 ${tr(R(c), 7)}/1 ${R(c)}/1 ${tr(R(c), 12)}/1 ${tr(R(c), 7)}/1`;
  const galopDr = `(k/2 h/1 h/1 s/2 h/2)*15 k/2 s/1 s/1 s/2 t/1 T/1`;
  return {
    bpm: 168, era: 'gb', intro: ['I'], form: ['A', 'B', 'A2', 'B'],
    voices: [
      { wave: 'pulse25', vol: 0.034, vib: { rate: 6.5, depth: 0.18, delay: 0.2 }, parts: {
        I: '-/4 C5/2. C5/2. C5/1 D5/1 E5/1 G5/1 C6/2 E5/2', A: galop, A2: galop, B: `${chupHead} | ${chupB}` } },
      { wave: 'pulse12', vol: 0.019, parts: {
        I: '-/16', A: half(hG, stabH), A2: terceras, B: bars(hB, (c) => `${chord(c, 'A4')}/16`, (c) => `${chord(c, 'A4')}/8`) } },
      { wave: 'triangle', vol: 0.085, fx: 0, parts: {
        I: 'C3/2! -/2 C3/2! -/2 G2/2 A2/2 B2/2 C3/2', A: half(hG, oomH), A2: half(hG, oomH),
        B: bars(hB, (c) => `${runH(c)} ${runH(c)}`, runH) } },
      { wave: 'noise', vol: 0.024, parts: { I: 'k/2 -/2 k/2 -/2 s/1 s/1 s/1 s/1 s/2! s/2!', A: galopDr, A2: galopDr,
        B: '(k/2 h/1 h/1 s/2 h/2)*14 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 c+k/4' } },
    ],
  };
})();

addWorld({
  id: 'gb',
  order: 1,                 // posición en la Plaza de las Tuberías del pueblo
  name: 'Valle Game Boy',
  theme: 'gb',              // paleta en css/style.css (.theme-gb)
  console: 'gameboy',       // consola que se rescata al vencer al jefe
  nodes: ['pixelito', 'monedin', 'cartuchon', 'linkito', 'pilabat', 'dani', 'tetrorey', 'chupin'],
  enemies: {
    pixelito: {
      name: 'Pixelito',
      sprite: 'pixelito',
      hp: 30, atk: 2, def: 0, xp: 10,
      fightWords: 2, words: WORDS.t1,
      blurb: 'Un pixel saltarín que se escapó de la pantalla. Ideal para calentar los dedos.',
      intro: '* ¡Pixelito se escapó de la pantalla y rebota hacia ti!',
      check: '* PIXELITO - ATQ 2 DEF 0\n* Un pixel que se escapó de su pantalla. Busca un amigo.',
      idle: ['* Pixelito rebota en su lugar.', '* Huele a pantalla recién limpiada.', '* Pixelito parpadea... ¿o es la pantalla?'],
      calm: '* Pixelito te mira con ojitos brillantes.',
      taunts: ['¡Boing!', '¡Soy el pixel más rápido!', '¡Píxel, píxel!'],
      acts: [
        { name: 'Acariciar', text: 'acaricias a pixelito', mercy: 40, reply: '* Pixelito vibra de felicidad.' },
        { name: 'Saludar', text: 'hola pixelito', mercy: 35, reply: '* Pixelito te saluda con todo su cuerpo.' },
        { name: 'Bailar', text: 'haces un baile de ocho bits', mercy: 50, reply: '* Pixelito baila contigo. ¡Es buenísimo!' },
      ],
      bullets: { count: 7, interval: 1300, speed: 30, pool: 'asdfghjkl'.split('') },
      drop: 'manual',
      keysHint: 'Fila del medio: A S D F G H J K L',
      onWord: gbRacha,
    },
    monedin: {
      name: 'Monedín',
      sprite: 'monedin',
      hp: 40, atk: 2, def: 1, xp: 12,
      fightWords: 3,
      // Solo letras de la fila de arriba: Q W E R T Y U I O P.
      words: ['pie', 'rey', 'oye', 'tipo', 'tiro', 'reto', 'pero', 'otro', 'tuyo', 'quito', 'quiero', 'puerto',
        'perro', 'torre', 'yeti', 'peor', 'piropo', 'repite', 'ropero', 'trueque'],
      blurb: 'Una moneda que gira y gira. Se cree la cosa más valiosa del valle.',
      intro: '* ¡Ting ting! Monedín sale rodando de entre el pasto.',
      check: '* MONEDIN - ATQ 2 DEF 1\n* Una moneda de cuatro tonos. Se cree muy valiosa.',
      idle: [
        '* Monedín gira sobre su orilla. Ting, ting, ting.',
        '* Monedín se mira en un charco. Le gusta lo que ve.',
        '* Monedín presume: "Mi primo salió en Super Mario Land, el mismo año que la Game Boy."',
      ],
      calm: '* Monedín brilla un poquito más que antes.',
      taunts: ['¡Ting ting!', '¡Cien como yo valen una vida!', '¡No me gastes!'],
      acts: [
        { name: 'Contar', text: 'cuentas hasta diez con monedín', mercy: 40, reply: '* "¡Diez! ¡Soy diez veces más valioso!"' },
        { name: 'Pulir', text: 'pules la moneda hasta que brilla', mercy: 45, reply: '* "¡Me veo de oro! Bueno, de verde claro."' },
        { name: 'Guardar', text: 'guardas la moneda en la alcancía', mercy: 35, reply: '* "¡Por fin un lugar seguro!"' },
      ],
      bullets: { count: 8, interval: 1250, speed: 31, pool: 'qwertyuiop'.split('') },
      drop: 'moneda_verde',
      keysHint: 'Fila de arriba: Q W E R T Y U I O P',
      onWord: gbRacha,
    },
    cartuchon: {
      name: 'Cartuchón',
      sprite: 'cartuchon',
      hp: 45, atk: 3, def: 1, xp: 15,
      fightWords: 3, words: WORDS.t1.concat(WORDS.t2.slice(0, 12)),
      blurb: 'Un cartucho viejo y gruñón. Lleva años sin que nadie lo juegue.',
      intro: '* Cartuchón aparece. Está lleno de polvo.',
      check: '* CARTUCHON - ATQ 3 DEF 1\n* Un cartucho viejo que no ha jugado en años. Está gruñón.',
      idle: ['* Cartuchón tose una nube de polvo.', '* Se escucha un "error de lectura" a lo lejos.', '* Cartuchón se acomoda la etiqueta.'],
      calm: '* Cartuchón brilla como recién comprado.',
      taunts: ['¡No me soples!', '¡Antes era el más vendido!', '¡Error de lectura!'],
      acts: [
        { name: 'Soplar', text: 'soplas el cartucho con fuerza', mercy: 50, reply: '* ¡FFFFFF! El polvo vuela. Cartuchón se siente limpio.' },
        { name: 'Jugar', text: 'pones el cartucho en la consola', mercy: 50, reply: '* Cartuchón recuerda los viejos tiempos.' },
        { name: 'Elogiar', text: 'qué buenos gráficos tienes', mercy: 35, reply: '* Cartuchón se sonroja. Bueno, se pone más gris.' },
      ],
      bullets: { count: 9, interval: 1150, speed: 34, pool: 'qwertyuiopasdfghjkl'.split('') },
      drop: 'cartucho',
      keysHint: 'Fila de arriba + fila del medio',
      onWord: gbRacha,
    },
    linkito: {
      name: 'Linkito',
      sprite: 'linkito',
      hp: 50, atk: 3, def: 1, xp: 18,
      fightWords: 3,
      // Fila de abajo (Z X C V B N M) mezclada con la del medio.
      words: ['cama', 'vaca', 'banca', 'masa', 'nada', 'baja', 'caza', 'zanja', 'lana', 'manzana', 'hamaca',
        'calma', 'falda', 'gala', 'gana', 'mancha', 'salsa', 'balanza', 'alcanza', 'llama'],
      blurb: 'Un cablecito de intercambio. Anda buscando con quién conectarse.',
      intro: '* ¡Linkito se desenrolla frente a ti!\n* "¿Alguien tiene un puerto libre?"',
      check: '* LINKITO - ATQ 3 DEF 1\n* Un cable de intercambio. Sin alguien a quien conectarse, se siente solo.',
      idle: [
        '* Linkito busca un enchufe con la punta.',
        '* Linkito se hace nudo solito. Se desenreda. Se vuelve a hacer nudo.',
        '* Un letrero viejo dice: "Lugar de la Pokédex: aquí hubo 151. Contamos."',
      ],
      calm: '* Linkito mueve la punta como si fuera una colita.',
      taunts: ['¿Alguien tiene un puerto libre?', '¡Sin mí no hay intercambios!', '¡Conexión perdida!'],
      acts: [
        { name: 'Conectar', text: 'conectas el cable a otra consola', mercy: 50, reply: '* "¡Enlace establecido! ¡Ya no estoy solo!"' },
        { name: 'Enrollar', text: 'enrollas el cable sin nudos', mercy: 40, reply: '* "Qué orden. Qué paz."' },
        { name: 'Intercambiar', text: 'intercambias un tecloide con un amigo', mercy: 45, reply: '* "Eso es para lo que nací."' },
      ],
      bullets: { count: 10, interval: 1200, speed: 32, pool: 'zxcvbnm'.split('').concat(['za', 'co', 'vi', 'bu', 'mo']) },
      drop: 'cable_doble',
      keysHint: 'Fila de abajo: Z X C V B N M',
      onWord: gbRacha,
    },
    pilabat: {
      name: 'Pilabat',
      sprite: 'pilabat',
      hp: 55, atk: 3, def: 1, xp: 22,
      fightWords: 3, words: WORDS.t2,
      blurb: 'Un murciélago hecho de pilas. Casi sin energía y de muy mal humor.',
      intro: '* ¡Una Pilabat sale volando del compartimiento de pilas!',
      check: '* PILABAT - ATQ 3 DEF 1\n* Un murciélago hecho de pilas. Casi sin energía... y de mal humor.',
      idle: ['* Pilabat hace bzzzt.', '* El indicador de batería parpadea.', '* Pilabat cuelga de cabeza para pensar.'],
      calm: '* Pilabat ronronea como un cargador.',
      taunts: ['¡Bzzt!', '¡Me queda un diez por ciento!', '¡Energía al máximo... casi!'],
      acts: [
        { name: 'Recargar', text: 'conectas el cargador', mercy: 45, reply: '* Pilabat sube al 50 por ciento. Se ve más contenta.' },
        { name: 'Chiste', text: 'por qué la pila fue al doctor', mercy: 45, reply: '* "¡Porque estaba descargada!" Pilabat se ríe... un poco.' },
        { name: 'Apagar luz', text: 'apagas la luz para que duerma', mercy: 40, reply: '* Pilabat bosteza. Los murciélagos aman la oscuridad.' },
      ],
      bullets: {
        count: 11, interval: 1250, speed: 34,
        pool: 'abcdefghijklmnopqrstuvwxyz'.split('').concat(['la', 'me', 'si', 'to', 'pa', 'ru', 'co', 've', 'ni', 'da', 'zo', 'bi']),
      },
      drop: 'pilas',
      keysHint: 'Todas las letras + sílabas',
      onWord: gbRacha,
    },
    dani: {
      name: 'Dani Turbo',
      sprite: 'dani',
      mode: 'tecloides', // usa la batalla de Tecloides (js/scenes/tecloides.js)
      xp: 25,
      blurb: '¡MINIJEFE! En el Pasto Alto Grande te esperan la Profesora Letra y tu rival, Dani Turbo.',
      keysHint: 'Palabras de ataque + esquivar escribiendo',
    },
    tetrorey: {
      name: 'Tetro Rey',
      sprite: 'tetrorey',
      boss: true,
      mode: 'tetrorey', // jefe en 3 fases (js/scenes/tetrorey.js)
      friend: true,     // aunque tenga mode propio, se puede perdonar y sale en la vitrina
      hp: 120, atk: 4, def: 2, xp: 40,
      fightWords: 4, words: WORDS.t2,
      // Fase 2 (TETRIS VS): palabras de las piezas, las largas de la barra I y las cortitas de la
      // basura. Muchas primeras letras distintas (y ninguna con q o w): la primera letra decide qué escribes.
      vsWords: ['bloque', 'pieza', 'linea', 'torre', 'gira', 'cubo', 'caja', 'forma', 'nivel', 'punto', 'muro', 'suelo',
        'barra', 'cable', 'fila', 'rey', 'verde', 'pila', 'boton', 'jugar', 'salto', 'turbo', 'encaja', 'llave', 'dedo',
        'mapa', 'nube', 'tecla', 'union', 'hueco', 'zeta', 'ganar', 'rapido', 'alto', 'once', 'vamos', 'idea', 'yoyo'],
      vsLong: ['pantalla', 'cartucho', 'columnas', 'velocidad', 'torreones', 'tetromino', 'apilados', 'escaleras',
        'derribar', 'cuadritos', 'campeones', 'aventura', 'consolas', 'bloqueado'],
      vsJunk: ['sol', 'mar', 'pan', 'oso', 'uva', 'ajo', 'fin', 'gol', 'kilo', 'luz', 'dia', 'eco', 'hoy', 'isla',
        'nido', 'rio', 'tren', 'vaso', 'yate', 'zoo', 'jugo', 'bote', 'cola', 'taza'],
      // Fase 3: se leen en vertical, así que van cortitas.
      tallWords: ['torre', 'pieza', 'bloque', 'nivel', 'linea', 'cubo', 'caja', 'gira', 'fila', 'rey', 'muro', 'alto', 'tope', 'barra'],
      blurb: '¡JEFE! El rey de los bloques que caen. Tiene la Game Boy guardada en su torre.',
      intro: '* ¡EL TETRO REY baja girando desde lo alto!\n* "¿Quieres la Game Boy? ¡Tendrás que ganártela!"',
      check: '* TETRO REY - ATQ 4 DEF 2\n* Rey de los bloques que caen. Guarda la Game Boy en su torre.\n* Dicen que si se enoja... saca su Cable Link.',
      idle: ['* El Tetro Rey gira 90 grados. Se ve igual.', '* Una línea completa desaparece a lo lejos.', '* La música se pone más rápida...',
        '* En lo alto de la torre parpadea un puntito de un color... raro.'],
      calm: '* El Tetro Rey tararea una melodía muy famosa.',
      taunts: ['¡TODO ENCAJA EN MI REINO!', '¡CONECTA TU CABLE!', '¡LA GAME BOY ES MIA!'],
      acts: [
        { name: 'Girar', text: 'giras en el sentido del reloj', mercy: 30, reply: '* El Tetro Rey se marea un poquito. "¡Eso es trampa!"' },
        { name: 'Hacer línea', text: 'completas una línea perfecta', mercy: 35, reply: '* ¡LINEA! El Tetro Rey aplaude sin querer.' },
        { name: 'Reverencia', text: 'haces una reverencia a su majestad', mercy: 30, reply: '* "Hmm... por fin alguien con modales."' },
      ],
      bullets: {
        count: 12, interval: 1900, speed: 28, // con 1700 un niño a ~30 PPM no alcanza a esquivar y pierde
        pool: ['rey', 'bloque', 'gira', 'cae', 'torre', 'linea', 'pieza', 'nivel', 'fila', 'caja', 'rapido', 'punto'],
      },
      drop: 'cable',
      console: 'gameboy',
      keysHint: 'Palabras completas que caen (¡3 fases!)',
      onWord: gbRacha,
    },
    chupin: {
      name: 'Chupín',
      sprite: 'chupin',
      mode: 'chupin',   // minijefe que absorbe palabras (js/scenes/chupin.js)
      friend: true,
      hp: 90, atk: 3, def: 1, xp: 30,
      // Palabras que flotan en la Cueva de los Sueños (y que se puede tragar).
      words: ['nube', 'sueño', 'pastel', 'globo', 'siesta', 'cobija', 'luna', 'dulce', 'tomate', 'estrella',
        'flotar', 'cereza', 'helado', 'brinco', 'burbuja', 'almohada', 'aire', 'manzana', 'galleta', 'bostezo'],
      blurb: '¡MINIJEFE! En la Cueva de los Sueños vive una bolita que se traga TODO lo que escribes.',
      intro: '* Un letrero a la entrada de la Cueva de los Sueños dice:\n* "Aquí nació una bolita rosa en 1992."',
      intro2: '* ¡CHUPIN aparece flotando!\n* "Soy rosa. CONFIA EN MI."',
      check: '* CHUPIN - ATQ 3 DEF 1\n* Una bolita rosa... en cuatro tonos de verde.\n* Inhala palabras. ¡Escríbelas antes de que se las trague!',
      idle: ['* Chupín se infla como globo y flota un ratito.', '* Chupín bosteza. Casi te traga con todo y bostezo.',
        '* Se oye una musiquita de sueños a lo lejos.'],
      calm: '* Chupín tiene los cachetes rojos. Bueno, verde oscuro.',
      taunts: ['Hoy desayuné un diccionario.', '¡Poyo!... Perdón, eso es de otro.', '¡Ñam ñam!', '¡Todo cabe en mi pancita!'],
      acts: [
        { name: 'Dar de comer', text: 'le das una galleta pixel', mercy: 40, reply: '* Chupín se la traga entera. "¡Otra! ¡Otra!"' },
        { name: 'Flotar', text: 'inflas los cachetes y flotas', mercy: 35, reply: '* Flotan juntos. Chupín se ríe tanto que se desinfla.' },
        { name: 'Siesta', text: 'te acuestas a dormir con chupín', mercy: 45, reply: '* Zzz... Chupín ronca bajito. Es el mejor ronquido del mundo.' },
      ],
      bullets: { count: 12, interval: 1000, speed: 32, pool: 'asdfghjklqwertyuiop'.split('') }, // letras sueltas, pero seguiditas
      drop: 'gameboy_lupa',
      keysHint: 'Leer y escribir rápido (¡ABSORBER!)',
      onWord: gbRacha,
    },
  },
  treasures: {
    moneda_verde: { name: 'Moneda verde', desc: 'Moneda de cuatro tonos. No vale nada. Vale todo.' },
    cable_doble: { name: 'Cable doble', desc: 'Para intercambiar. Nunca supiste bien qué.' },
    gameboy_lupa: { name: 'Lupa con luz', desc: 'Para jugar debajo de la cobija. Regalo de Chupín.' },
    moneda_dorada: { name: 'Moneda dorada', sprite: 'monedina', desc: 'La hermana de Monedín te la regaló. Bueno, es ella. Dice que no se gasta.' },
    pila_extra: { name: 'Pila Extra', sprite: 'pilas', desc: 'Premio por 20 palabras seguidas sin error. ¡Dedos con batería llena!' },
    tomate: { name: 'Tomate máximo', desc: 'Premio de Chupa-Letras. Chupín jura que no se lo va a comer. Mentira.' },
  },
  sprites: GB_SPRITES,
  tracks: {
    // Tetro Rey fase 1: marcha de cosacos en Re menor a 140, 2 compases de intro + 32 (≈ 55 s).
    // Las fases van 140 → (TETRIS VS 140/178) → 180, como en docs/LORE.md §14.
    gb_tetrorey: gbTetroTrack(false),
    // Fase 2 (TETRIS VS): Korobeiniki; se acelera cuando tu pila está alta.
    gb_tetrisvs: GB_KORO_TRACK,
    gb_tetrisvs_rapido: { ...GB_KORO_TRACK, bpm: 178 },
    // Fase 3: la misma marcha a 180 con arpegios en tresillo y una sección D extra, 40 compases (≈ 53 s).
    gb_tetrorey3: gbTetroTrack(true),
    // Chupín (Fa mayor, bailable y traviesa) y su minijuego, el galop de Offenbach con su tema.
    gb_chupin: GB_CHUPIN_TRACK,
    gb_chupaletras: GB_CHUPALETRAS_TRACK,
  },
  quests: {
    moneda_perdida: {
      name: 'La moneda perdida',
      desc: 'Monedín busca a su hermana. Dice que se esconde en el pasto alto del pueblo, en la esquina de abajo.',
    },
    racha_gb: {
      name: 'Racha de 20',
      desc: 'Escribe 20 palabras seguidas sin ningún error en las batallas del Valle Game Boy.',
      progress: () => `Mejor: ${Math.min(20, Save.data.flags.gbRachaMax || 0)}/20`,
    },
    dulces_suenos: {
      name: 'Dulces sueños',
      desc: 'Chupín te regaló CHUPA-LETRAS. Juégalo en la máquina arcade del pueblo y cómete 30 palabras en una partida.',
      progress: () => `Mejor: ${(Save.data.arcade || {}).chupaEaten || 0}/30`,
    },
  },
});
