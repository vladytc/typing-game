// Música chiptune: un secuenciador sencillo con WebAudio.
// Todas las melodías son originales, compuestas "al estilo" de cada época.
//
// Notación de cada voz: notas separadas por espacios, "E5/2" = nota E5 durante 2 pasos
// (un paso = semicorchea). "-" es silencio. En la voz de ruido, "x" es un golpe.
// `intro` (opcional) suena una sola vez antes de que empiece el loop de `notes`.
const Music = (() => {
  let current = null;
  let timer = null;
  let master = null;
  let noiseBuf = null;
  let muted = false;

  const NOTE = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  const freq = (n) => {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    return m ? 440 * Math.pow(2, (NOTE[m[1]] + (Number(m[2]) - 4) * 12) / 12) : 0;
  };
  const parse = (s) => s.trim().split(/\s+/).map((tok) => {
    const [n, d] = tok.split('/');
    return { n, d: Number(d || 1) };
  });

  function ctx() { return Sfx.unlock(); }

  function setup(c) {
    if (master) return;
    master = c.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(c.destination);
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  function playNote(c, voice, note, t, dur) {
    if (note.n === '-') return;
    const g = c.createGain();
    g.connect(master);
    if (voice.wave === 'noise') {
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      g.gain.setValueAtTime(voice.vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      src.connect(g);
      src.start(t);
      src.stop(t + 0.08);
      return;
    }
    const o = c.createOscillator();
    o.type = voice.wave;
    o.frequency.setValueAtTime(freq(note.n), t);
    const len = dur * (voice.legato || 0.85);
    g.gain.setValueAtTime(voice.vol, t);
    g.gain.setValueAtTime(voice.vol, t + len * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  function tick() {
    const c = ctx();
    if (!c || !current) return;
    const step = 60 / current.bpm / 4;
    let ended = 0;
    current.voices.forEach((v) => {
      while (v.next < c.currentTime + 0.25) {
        if (v.i >= v.seq.length) {
          if (v.seq !== v.notes) { v.seq = v.notes; v.i = 0; continue; } // terminó la intro
          if (!current.loop) { ended++; return; }
          v.i = 0;
        }
        const note = v.seq[v.i++];
        playNote(c, v, note, v.next, note.d * step);
        v.next += note.d * step;
      }
    });
    if (!current.loop && ended === current.voices.length) stop();
  }

  function play(name) {
    const track = TRACKS[name];
    if (!track) return;
    if (current && current.name === name) return;
    stop();
    const c = ctx();
    if (!c) return;
    setup(c);
    const start = c.currentTime + 0.05;
    current = {
      name, bpm: track.bpm, loop: track.loop !== false,
      voices: track.voices.map((v) => {
        const notes = parse(v.notes);
        return { ...v, notes, seq: v.intro ? parse(v.intro) : notes, i: 0, next: start };
      }),
    };
    tick();
    timer = setInterval(tick, 50);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    current = null;
  }

  return {
    play,
    stop,
    get playing() { return current && current.name; },
    set muted(v) {
      muted = v;
      if (master) master.gain.value = v ? 0 : 1;
    },
  };
})();

// ---------- Pistas ----------
const rep = (s, n) => Array(n).fill(s).join(' ');

const TRACKS = {
  // Pueblo: tranquilo y alegre (Do mayor).
  town: {
    bpm: 104,
    voices: [
      {
        wave: 'square', vol: 0.035,
        notes: 'E5/2 G5/2 A5/2 G5/2 E5/2 D5/2 C5/4 D5/2 E5/2 G5/2 E5/2 D5/8 ' +
          'E5/2 G5/2 A5/2 C6/2 B5/2 A5/2 G5/4 A5/2 G5/2 E5/2 D5/2 C5/8',
      },
      {
        wave: 'triangle', vol: 0.09,
        notes: rep('C3/4 G3/4 C3/4 G3/4', 1) + ' ' + rep('A2/4 E3/4 A2/4 E3/4', 1) + ' ' +
          rep('F2/4 C3/4 F2/4 C3/4', 1) + ' ' + rep('G2/4 D3/4 G2/4 B2/4', 1),
      },
    ],
  },

  // Título: misteriosa y con ganas de aventura.
  title: {
    bpm: 96,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'A4/4 C5/4 E5/4 D5/2 C5/2 B4/4 G4/4 A4/8 E5/4 D5/4 C5/4 B4/4 C5/8 A4/8',
      },
      { wave: 'triangle', vol: 0.09, notes: 'A2/8 A2/8 G2/8 G2/8 F2/8 F2/8 E2/8 E2/8' },
    ],
  },

  // Batalla normal: con energía (La menor).
  battle: {
    bpm: 150,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'A4 C5 E5 A5/2 G5 E5/2 D5 E5/2 C5 D5/2 B4 C5 ' +
          'A4 C5 E5 A5/2 B5 C6/2 B5 A5/2 G5 E5/4 ' +
          'F5/2 E5 D5/2 C5 D5/2 E5/2 F5/2 G5/4 E5/2 C5/2 D5/4 E5/4 B4/4',
      },
      { wave: 'triangle', vol: 0.1, notes: rep('A2 A3', 8) + ' ' + rep('F2 F3', 8) + ' ' + rep('G2 G3', 8) + ' ' + rep('E2 E3', 8) },
      { wave: 'noise', vol: 0.025, notes: rep('x/2 -/2 x -/1 x/2', 8) },
    ],
  },

  // Jefe: pesada y dramática (Re menor).
  boss: {
    bpm: 138,
    voices: [
      {
        wave: 'square', vol: 0.032,
        notes: 'D5/2 D5 F5/2 D5 G5/2 A5/4 -/2 A5 G5/2 F5 E5/2 C5 D5/6 -/5 ' +
          'A#4/2 D5/2 F5/2 A#5/4 A5/2 G5/2 F5/2 E5/2 C#5/2 E5/2 A5/4 -/6',
      },
      { wave: 'square', vol: 0.018, notes: rep('D4 A3', 8) + ' ' + rep('A#3 F3', 8) + ' ' + rep('C4 G3', 8) + ' ' + rep('A3 E3', 8) },
      { wave: 'triangle', vol: 0.11, notes: rep('D2/2 D3/2', 4) + ' ' + rep('A#1/2 A#2/2', 4) + ' ' + rep('C2/2 C3/2', 4) + ' ' + rep('A1/2 A2/2', 4) },
      { wave: 'noise', vol: 0.03, notes: rep('x x - x x/2 x/2', 8) },
    ],
  },

  // Reto de Tecloides (la pista "de batalla de monstruos"): La menor, urgente, 160 BPM.
  // Abre con 4 golpes y una subida cromática como sirena; bajo de tónica-octava-séptima.
  tecloides: {
    bpm: 160,
    voices: [
      {
        wave: 'square', vol: 0.032,
        intro: '-/4 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6/4',
        notes: 'A5/2 E5 A5 C6/2 B5/2 A5 G5 E5/2 G5/2 A5/2 B5/2 C6/2 D6/2 B5/2 A5/8 ' +
          'C6/2 B5 A5 G5/2 E5/2 F5 G5 A5/2 F5/2 E5/2 D5/2 E5/2 F5/2 G#5/2 A5/8',
      },
      {
        wave: 'triangle', vol: 0.11,
        intro: '-/8 E2/8',
        notes: rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('C3 C4 B3 C4', 4) + ' ' + rep('D2 D3 C3 D3', 2) + ' ' + rep('E2 E3 D3 E3', 2),
      },
      { wave: 'noise', vol: 0.028, intro: 'x x x x -/12', notes: rep('x - x x', 16) },
    ],
  },

  // "¡Casi!": puente a Do mayor cuando al rival le queda poca vida.
  tecloides_casi: {
    bpm: 168,
    voices: [
      {
        wave: 'square', vol: 0.032,
        notes: 'C6/2 G5 C6 E6/2 D6/2 C6 B5 G5/2 B5/2 C6/2 D6/2 E6/2 F6/2 D6/2 C6/8 ' +
          'E6/2 D6 C6 B5/2 G5/2 A5 B5 C6/2 A5/2 G5/2 F5/2 G5/2 A5/2 B5/2 C6/8',
      },
      { wave: 'triangle', vol: 0.11, notes: rep('C3 C4 B3 C4', 4) + ' ' + rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('G2 G3 F3 G3', 4) },
      { wave: 'noise', vol: 0.03, notes: rep('x x x x', 16) },
    ],
  },

  // Minijuegos de arcade: alegre y rápida.
  arcade: {
    bpm: 160,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'E5 B4 C5 D5/2 C5 B4 A4/2 A4 C5 E5/2 D5 C5 B4/3 C5 D5/2 E5/2 C5/2 A4/2 A4/4 ' +
          '-/2 D5/2 F5 A5/2 G5 F5 E5/3 C5 E5/2 D5 C5 B4/2 B4 C5 D5/2 E5/2 C5/2 A4/2 A4/4',
      },
      { wave: 'triangle', vol: 0.1, notes: rep('A2 A3', 8) + ' ' + rep('E2 E3', 8) + ' ' + rep('D2 D3', 8) + ' ' + rep('A2 A3', 8) },
      { wave: 'noise', vol: 0.022, notes: rep('x - x -', 16) },
    ],
  },

  // Jingle de victoria (no se repite).
  victory: {
    bpm: 150, loop: false,
    voices: [
      { wave: 'square', vol: 0.04, notes: 'C5 E5 G5 C6/3 -/1 G5 C6/8' },
      { wave: 'triangle', vol: 0.1, notes: 'C3/2 G3/2 C4/4 G3/2 C3/6' },
    ],
  },
};
