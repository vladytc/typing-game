// Efectos de sonido chiptune generados con WebAudio (sin archivos).
const Sfx = (() => {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'square', vol = 0.06, slide = 0, delay = 0 } = {}) {
    const c = ensure();
    if (!c || muted) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const seq = (notes, step, opts) => notes.forEach((f, i) => tone(f, step * 1.2, { ...opts, delay: i * step }));

  return {
    unlock: ensure,
    get muted() { return muted; },
    set muted(v) { muted = v; },
    key() { tone(880 + Math.random() * 120, 0.03, { vol: 0.03 }); },
    error() { tone(140, 0.12, { type: 'sawtooth', vol: 0.05 }); },
    move() { tone(660, 0.04, { vol: 0.04 }); },
    confirm() { tone(523, 0.06); tone(784, 0.08, { delay: 0.06 }); },
    text() { tone(520, 0.02, { vol: 0.015 }); },
    hit() { tone(420, 0.15, { slide: -300, vol: 0.08 }); },
    crit() { tone(988, 0.06); tone(1318, 0.1, { delay: 0.06 }); tone(420, 0.2, { slide: -300, delay: 0.12, vol: 0.08 }); },
    hurt() { tone(220, 0.2, { type: 'sawtooth', slide: -150, vol: 0.07 }); },
    pop() { tone(1100, 0.05, { slide: 500, vol: 0.04 }); },
    heal() { seq([523, 659, 784], 0.07, { type: 'triangle', vol: 0.08 }); },
    mercy() { seq([659, 784, 988], 0.06, { type: 'triangle', vol: 0.07 }); },
    spare() { seq([784, 659, 784, 1046, 1318], 0.09, { type: 'triangle', vol: 0.08 }); },
    win() { seq([523, 659, 784, 1046], 0.11); },
    levelup() { seq([523, 587, 659, 698, 784, 880, 988, 1046], 0.06, { vol: 0.05 }); },
    laugh() { seq([700, 600, 700, 600, 700], 0.09, { vol: 0.05 }); },
    warp() { tone(900, 0.5, { slide: -800, vol: 0.06 }); },
    secret() { seq([523, 659, 784, 1046, 784, 1046, 1318], 0.08, { type: 'triangle', vol: 0.08 }); },
    jump() { tone(300, 0.18, { slide: 500, vol: 0.05 }); },
    stomp() { tone(500, 0.08, { slide: -300, vol: 0.07 }); tone(300, 0.08, { delay: 0.06, slide: -150, vol: 0.06 }); },
    bump() { tone(150, 0.08, { type: 'triangle', vol: 0.12 }); },
    coin() { tone(988, 0.07, { vol: 0.05 }); tone(1319, 0.3, { delay: 0.07, vol: 0.05 }); },
    powerup() { seq([392, 523, 659, 784, 1047, 784, 1047, 1319], 0.04, { vol: 0.05 }); },
    die() { seq([494, 698, 698, 698, 659, 587, 523, 330, 262], 0.13, { vol: 0.06 }); },
    flag() { tone(1200, 1.2, { slide: -900, vol: 0.05 }); },
    firework() { tone(120, 0.3, { type: 'sawtooth', slide: -80, vol: 0.08 }); },
    lose() { seq([392, 330, 262, 196], 0.2, { type: 'triangle', vol: 0.08 }); },
  };
})();
