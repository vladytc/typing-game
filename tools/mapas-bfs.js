// Revisa con un BFS que las zonas explorables de un mundo se puedan jugar (docs/MUNDOS.md §3d).
// Uso: NODE_PATH=<node_modules con jsdom> node tools/mapas-bfs.js nes
//
// Camina desde la entrada del mundo por todos sus mapas (las salidas llevan de un mapa a otro) y,
// venciendo a los enemigos en el orden de `nodes`, comprueba:
//   - que el siguiente enemigo se pueda tocar y los que siguen todavía no (nadie se brinca a nadie);
//   - al final, que cada salida, cofre, personaje y letrero se alcance, y que cada lugar de llegada
//     (spawns de las salidas y `spawns.start`) sea una casilla libre.
// Imprime "BFS OK" o la lista de problemas.
const fs = require('fs'); const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = process.env.GAME_ROOT || path.join(__dirname, '..');
const WORLD = process.argv[2] || 'nes';
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
html = html.replace(/<link[^>]*>/g, '').replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (m, a, src) =>
  src.startsWith('http') ? '' : `<script>//# sourceURL=${src}\n${esc(fs.readFileSync(path.join(ROOT, src), 'utf8'))}\n</script>`);
// Canvas y audio de mentira (como tools/smoke.js): aquí solo importa la lógica de los mapas.
html = html.replace('<head>', `<head><script>
const __ctx = new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 10 }) : /ImageData$/.test(k) ? () => ({ data: new Uint8ClampedArray(4) }) : /Gradient$|Pattern$/.test(k) ? () => ({ addColorStop() {} }) : typeof k === 'string' ? (k in t ? t[k] : () => {}) : undefined), set: (t, k, v) => { t[k] = v; return true; } });
HTMLCanvasElement.prototype.getContext = function (type) { return type === '2d' ? __ctx : null; };
HTMLCanvasElement.prototype.toDataURL = () => '';
window.AudioContext = function () {
  const p = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, setValueCurveAtTime() {}, value: 1 });
  const node = () => ({ connect() { return node(); }, disconnect() {}, start() {}, stop() {}, setPeriodicWave() {}, frequency: p(), gain: p(), delayTime: p(), Q: p(), detune: p(), pan: p(), threshold: p(), knee: p(), ratio: p(), attack: p(), release: p(), playbackRate: p(), type: '', buffer: null, curve: null, onended: null });
  return { currentTime: 0, state: 'running', resume() { return Promise.resolve(); }, destination: {}, sampleRate: 44100,
    createOscillator: node, createGain: node, createBufferSource: node, createBiquadFilter: node, createDelay: node,
    createDynamicsCompressor: node, createWaveShaper: node, createStereoPanner: node, createConvolver: node, createChannelMerger: node, createChannelSplitter: node,
    createPeriodicWave: () => ({}), createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(Math.max(1, n | 0)), numberOfChannels: c, length: n }) };
};
document.fonts = { load: () => Promise.resolve(), ready: Promise.resolve() };
</script>`);
const vc = new VirtualConsole();
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://127.0.0.1/', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;

setTimeout(() => {
  const out = w.eval(`(() => {
    Save.reset(); Save.write = () => {};
    const problems = [];
    const world = WORLDS.find((x) => x.id === ${JSON.stringify(WORLD)});
    if (!world || !world.entry) return ['El mundo no existe o no tiene zonas: ' + ${JSON.stringify(WORLD)}];
    const maps = Object.keys(MAPS).filter((k) => MAPS[k].world === world.id);
    const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const info = (id) => {
      const m = MAPS[id];
      const v = mapVariant(m);
      const rows = v ? v.map : m.map;
      const tiles = { ...TILES, ...(m.tiles || {}) };
      const tile = (x, y) => (rows[y] && rows[y][x] ? tiles[rows[y][x]] || null : null);
      const busy = new Map();
      [...(m.npcs || []), ...((v && v.npcs) || [])].filter((n) => !n.when || n.when()).forEach((n) => busy.set(n.x + ',' + n.y, 'npc ' + n.id));
      (m.encounters || []).filter((e) => !Save.data.done[e.enemy]).forEach((e) => busy.set(e.x + ',' + e.y, 'enemigo ' + e.enemy));
      (m.chests || []).forEach((c) => busy.set(c.x + ',' + c.y, 'cofre ' + c.id));
      const ok = (x, y) => { const t = tile(x, y); return !!t && !t.solid && !busy.has(x + ',' + y); };
      return { m, rows, tile, ok, busy, exits: m.exits || {} };
    };
    // BFS por todos los mapas del mundo. Devuelve las casillas pisadas y las salidas usadas.
    const walk = () => {
      const I = Object.fromEntries(maps.map((id) => [id, info(id)]));
      const seen = new Set();
      const used = new Set();
      const q = [];
      const push = (map, x, y) => { const k = map + ':' + x + ',' + y; if (!seen.has(k)) { seen.add(k); q.push([map, x, y]); } };
      push(world.entry.map, world.entry.spawn[0], world.entry.spawn[1]);
      while (q.length) {
        const [map, x, y] = q.shift();
        const z = I[map];
        const ex = z.exits[x + ',' + y];
        // Al pisar una salida te lleva (la casilla de llegada de una salida no cuenta como pisarla).
        if (ex && !(map === world.entry.map && x === world.entry.spawn[0] && y === world.entry.spawn[1])) {
          used.add(map + ':' + x + ',' + y);
          if (ex.map && I[ex.map]) push(ex.map, ex.spawn[0], ex.spawn[1]);
          continue;
        }
        DIR.forEach(([dx, dy]) => { if (z.ok(x + dx, y + dy)) push(map, x + dx, y + dy); });
      }
      const touch = (map, x, y) => DIR.some(([dx, dy]) => seen.has(map + ':' + (x + dx) + ',' + (y + dy)));
      return { I, seen, used, touch };
    };
    const where = {};
    maps.forEach((id) => (MAPS[id].encounters || []).forEach((e) => { where[e.enemy] = [id, e.x, e.y]; }));
    world.nodes.forEach((n) => { if (!where[n]) problems.push('El nodo ' + n + ' no está en ningún mapa'); });
    // Por etapas: vencidos los primeros k nodos.
    for (let k = 0; k <= world.nodes.length; k++) {
      Save.data.done = {};
      world.nodes.slice(0, k).forEach((n) => { Save.data.done[n] = true; });
      const { touch } = walk();
      world.nodes.forEach((n, j) => {
        if (!where[n] || j < k) return;
        const can = touch(...where[n]);
        if (j === k && !can) problems.push('Etapa ' + k + ': no se llega a ' + n + ' (' + where[n].join(' ') + ')');
        if (j > k && can) problems.push('Etapa ' + k + ': se puede llegar a ' + n + ' antes que a ' + world.nodes[k]);
      });
    }
    // Todo vencido: ¿se alcanza todo?
    const { I, used, touch } = walk();
    let count = 0;
    maps.forEach((id) => {
      const z = I[id];
      Object.entries(z.exits).forEach(([k, ex]) => {
        count++;
        if (!used.has(id + ':' + k)) problems.push(id + ': no se llega a la salida ' + k + ' -> ' + (ex.map || 'pueblo'));
        if (ex.map) {
          const t = I[ex.map];
          if (!t) problems.push(id + ': la salida ' + k + ' lleva a un mapa que no existe: ' + ex.map);
          else if (!t.ok(ex.spawn[0], ex.spawn[1])) problems.push(id + ': la salida ' + k + ' llega a una casilla ocupada en ' + ex.map + ' ' + ex.spawn.slice(0, 2));
        }
      });
      const st = (z.m.spawns || {}).start;
      if (st && !z.ok(st[0], st[1])) problems.push(id + ': spawns.start ocupado ' + st);
      (z.m.chests || []).forEach((c) => { count++; if (!touch(id, c.x, c.y)) problems.push(id + ': no se llega al cofre ' + c.id); });
      (z.m.npcs || []).filter((n) => !n.when || n.when()).forEach((n) => { count++; if (!touch(id, n.x, n.y)) problems.push(id + ': no se llega a ' + n.id + ' (' + n.x + ',' + n.y + ')'); });
      Object.keys(z.m.signs || {}).forEach((k) => {
        count++;
        const [x, y] = k.split(',').map(Number);
        if (!z.tile(x, y)) problems.push(id + ': letrero fuera del mapa ' + k);
        else if (!touch(id, x, y)) problems.push(id + ': no se llega al letrero ' + k);
      });
    });
    return problems.length ? problems : ['BFS OK: ' + maps.length + ' mapas, ' + world.nodes.length + ' enemigos en orden, ' + count + ' salidas/cofres/personajes/letreros alcanzables'];
  })()`);
  console.log(out.join('\n'));
  process.exit(0);
}, 1500);
