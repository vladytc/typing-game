// ZONA SECRETA — EARTHBOUND (Super Nintendo, 1995; en Japón, Mother 2, 1994). Secreto snes_earthbound.
// Se carga después de js/secretos/snes.js. Todo lo de la zona vive aquí; los estilos, en css/worlds/earthbound.css.
//
// Cómo se entra: después de vencer a la Reina Nébula, en Dinosaur Land (snes-colinas) sale humo de una
// colina del rincón de arriba a la derecha: es un METEORITO (38, 3). Lakitu ya contaba que vio caer uno;
// después de Nébula también dice dónde echa humo. Tocarlo te lleva a Onett, como al principio de EarthBound.
//
//   eb-onett     Onett chiquito: el meteorito en la colina, la casa de Ness (se une al equipo) y la de los
//                Minch (Pokey y Picky), Buzz Buzz, Lier X. Agerate cavando, la farmacia, las hamburguesas,
//                la biblioteca, el autobús de los Runaway Five, el campamento de los Mr. Saturn y la
//                barricada de Captain Strong ("¡Onett es famoso por sus barricadas!").
//   eb-moonside  Moonside: neón sobre negro, "sí" es "no". Abstract Art y Evil Mani-Mani pelean AL REVÉS
//                (escribes las palabras de la última letra a la primera). Vencer a Mani-Mani abre la barricada.
//   eb-pasado    La Cueva del Pasado: Paula, Jeff y Poo esperan. Al fondo, GIYGAS.
//
// Orden: Spiteful Crow (bajada de la colina) → New Age Retro Hippie (calle del café) → Moonside: Abstract Art →
//        Evil Mani-Mani → (se abre la barricada) → Starman → Pokey → Cueva del Pasado → Giygas.
//
// Batallas propias (Scenes.ebBattle hereda de Scenes.battle):
//   - Fondo psicodélico animado (EbBackdrop): capas de patrones que ondulan y ciclan colores.
//   - HP que RUEDA como odómetro: el daño baja poco a poco. Si ganas (o te curas) antes de que llegue
//     a cero, te salvas aunque fuera "daño mortal". Así funcionaba en EarthBound.
//   - "SMAAAASH!!": un PERFECTO en una palabra de 7 letras o más pega x1.5.
//   - Con Ness en el equipo (flag ebNess), después de cada combo batea él también.
// Giygas (Scenes.giygas): fase 1, la Máquina del Diablo con Pokey; fase 2, Giygas suelto: LUCHAR no le
// hace nada, hay que REZAR. Paula reza 8 veces (sus oraciones llegan a la gente, en el orden del juego)
// y al final reza el jugador: escribe su propio nombre. Al llegar a la fase 2 queda un punto de control.
// Fotos "Fuzzy Pickles": el fotógrafo baja al pisar ciertas casillas (m.ebFotos); al vencer a Giygas
// sale el álbum, como las fotos de los créditos.
//
// Para probar (consola del navegador):
//   Save.data.done.nebula = true; Game.go('town', { map: 'eb-onett', spawn: [15, 3, 'down'] })
//   Save.data.flags.ebNess = true; Game.go('giygas', { enemyId: 'giygas', back: 'town' })

// ---------- Paleta (colores de EarthBound: tonos pastel con contorno oscuro) ----------
const EB_PAL = {
  K: '#28202c', // contorno
  B: '#141018', // negro
  W: '#f8f8f8',
  F: '#f8c898', // piel
  f: '#d89068',
  R: '#e83838', // rojo
  r: '#a02428',
  U: '#3864d0', // azul
  u: '#22387c',
  Y: '#f8d838', // amarillo
  y: '#c8981c',
  O: '#f89038', // naranja
  N: '#98582c', // café
  n: '#c88850',
  L: '#f8e070', // rubio
  G: '#98d070', // pasto de Onett
  g: '#68a850',
  H: '#c0e898',
  T: '#3c8c48', // árbol
  t: '#22603a',
  P: '#f8a8c8', // rosa
  p: '#d05890',
  E: '#b8b8c8', // gris
  e: '#707084',
  S: '#ece0b8', // banqueta
  s: '#c8b48a',
  M: '#8858c0', // morado
  m: '#c8a8e8',
  C: '#60d0e8', // celeste
  Q: '#f8dcc4', // cara de Mr. Saturn
  q: '#e0a890',
  // Neón de Moonside
  X: '#ff3cf0',
  Z: '#3cfff0',
  V: '#c8ff3c',
  A: '#ffe23c',
};
const ebArt = (rows, pal = EB_PAL) => Object.assign(rows, { pal });
// Mismo dibujo con otros colores: ebRecolor(filas, { U: 'M' }).
const ebRecolor = (rows, map) => ebArt(rows.map((r) => [...r].map((c) => map[c] || c).join('')));
const ebRows = (fn) => ebArt(rowsOf(fn));
// Número pseudoazaroso fijo por casilla (pasto que no se ve repetido).
const ebHash = (x, y, s = 1) => {
  let n = Math.imul(x + 37 * s, 374761393) ^ Math.imul(y + 11 * s, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

// ---------- Personajes ----------
Object.assign(SPRITES, {
  // Ness: gorra roja de visera azul, playera de rayas, shorts azules, tenis rojos.
  eb_ness: ebArt([
    '................',
    '.....KKKKKK.....',
    '....KRRRRRRK....',
    '...KRRRWRRRRK...',
    '...KUUUUUUUUK...',
    '...KNFFFFFFNK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '....KFFffFFK....',
    '...KYUYUYUYUK...',
    '..KFYUYUYUYUFK..',
    '..KKUYUYUYUYKK..',
    '....KUUUUUUK....',
    '....KUUKKUUK....',
    '....KFK..KFK....',
    '...KRRK..KRRK...',
  ]),
  // Paula: pelo rubio con moño rojo y vestido rosa.
  eb_paula: ebArt([
    '......KRRK......',
    '...KKKRRRRKKK...',
    '..KLLLLKKLLLLK..',
    '..KLLLLLLLLLLK..',
    '..KLFFFFFFFFLK..',
    '..KLFKFFFFKFLK..',
    '..KLFFFFFFFFLK..',
    '..KLLFFppFFLLK..',
    '...KKPPPPPPKK...',
    '..KFPPPWWPPPFK..',
    '..KFPPPPPPPPFK..',
    '...KPPPPPPPPK...',
    '..KPPPPPPPPPPK..',
    '..KKKKKKKKKKKK..',
    '....KFK..KFK....',
    '...KRRK..KRRK...',
  ]),
  // Jeff: rubio, lentes redondos y traje verde de shorts.
  eb_jeff: ebArt([
    '................',
    '....KKKKKKKK....',
    '...KLLLLLLLLK...',
    '..KLLLLLLLLLLK..',
    '..KLFFFFFFFFLK..',
    '..KKWWKFFKWWKK..',
    '..KFKWKFFKWKFK..',
    '...KFFFFFFFFK...',
    '....KFFffFFK....',
    '...KgGGWWGGgK...',
    '..KFgGGRRGGgFK..',
    '..KKgGGRRGGgKK..',
    '....KgGGGGgK....',
    '....KgGKKGgK....',
    '....KFK..KFK....',
    '...KNNK..KNNK...',
  ]),
  // Poo: el príncipe de Dalaam, con su chongo y su traje blanco de artes marciales.
  eb_poo: ebArt([
    '.......KK.......',
    '......KBBK......',
    '.....KKBBKK.....',
    '....KBBBBBBK....',
    '...KBBBBBBBBK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '....KFFffFFK....',
    '...KWWWEWWWWK...',
    '..KFWWWEWWWWFK..',
    '..KKWWWEWWWWKK..',
    '....KWWEWWWK....',
    '....KEEKKEEK....',
    '....KFK..KFK....',
    '...KBBK..KBBK...',
  ]),
  // Pokey Minch: el vecino gordito y presumido.
  eb_pokey: ebArt([
    '................',
    '....KKKKKKKK....',
    '...KnnnnnnnnK...',
    '..KnnnnnnnnnnK..',
    '..KFFFFFFFFFFK..',
    '..KFKKFFFFKKFK..',
    '..KFFFFFFFFFFK..',
    '..KFFFFKKFFFFK..',
    '...KFFFFFFFFK...',
    '..KOOOOOOOOOOK..',
    '.KFOOOOOOOOOOFK.',
    '.KFOOOOOOOOOOFK.',
    '..KOOOOOOOOOOK..',
    '...KUUUUUUUUK...',
    '....KFK..KFK....',
    '...KNNK..KNNK...',
  ]),
  // Picky: el hermanito de Pokey (más chiquito).
  eb_picky: ebArt([
    '................',
    '................',
    '................',
    '................',
    '.....KKKKKK.....',
    '....KnnnnnnK....',
    '....KFFFFFFK....',
    '....KFKFFKFK....',
    '....KFFFFFFK....',
    '.....KFffFK.....',
    '....KOOOOOOK....',
    '...KFOOOOOOFK...',
    '....KUUUUUUK....',
    '....KUUKKUUK....',
    '....KFK..KFK....',
    '...KNNK..KNNK...',
  ]),
  // Buzz Buzz: una abeja (que no es abeja) que viene de 10 años en el futuro.
  eb_buzz: ebArt([
    '................',
    '................',
    '....KK....KK....',
    '...KWWK..KWWK...',
    '...KWWWKKWWWK...',
    '....KWWKKWWK....',
    '.....KYYYYK.....',
    '....KYKYYKYK....',
    '....KYYYYYYK....',
    '....KBBBBBBK....',
    '....KYYYYYYK....',
    '....KBBBBBBK....',
    '.....KYYYYK.....',
    '......KBBK......',
    '.......KK.......',
    '................',
  ]),
  // King, el perro de Ness, dormido.
  eb_king: ebArt([
    '................',
    '................',
    '................',
    '................',
    '................',
    '..KK............',
    '.KnnK.......KK..',
    '.KnKnKKKKKKKnnK.',
    '.KnnnnnnnnnnnnK.',
    'KnnnnnnnnnnnnnK.',
    'KnBnnnnnnnnnnnK.',
    '.KnnnnnnnnnnnnK.',
    '..KKnnKKKKnnKK..',
    '...KnK....KnK...',
    '....K......K....',
    '................',
  ]),
  // Mr. Saturn: cabezota rosita, narizota, bigotes, moño rojo y patitas.
  eb_saturn: ebArt([
    '.......RR.......',
    '......RRRR......',
    '.......KK.......',
    '.....KKKKKK.....',
    '...KKQQQQQQKK...',
    '..KQQQQQQQQQQK..',
    '.KQQQKQQQQKQQQK.',
    '.KQQQKQQQQKQQQK.',
    '.KQQQQQqqQQQQQK.',
    'KQQQQQqqqqQQQQQK',
    'KQKKQqqqqqqQKKQK',
    'KQQQQQqqqqQQQQQK',
    '.KQQQQQQQQQQQQK.',
    '..KKQQQQQQQQKK..',
    '....KKKKKKKK....',
    '.....KK..KK.....',
  ]),
  // Un Runaway Five: traje oscuro y lentes oscuros.
  eb_runaway: ebArt([
    '................',
    '....KKKKKKKK....',
    '...KBBBBBBBBK...',
    '...KBFFFFFFBK...',
    '...KKKKFFKKKK...',
    '...KFKKFFKKFK...',
    '...KFFFFFFFFK...',
    '....KFFRRFFK....',
    '...KBBBWWBBBK...',
    '..KBBBBWRBBBBK..',
    '..KBBBBWRBBBBK..',
    '..KFBBBWWBBBFK..',
    '....KBBBBBBK....',
    '....KBBKKBBK....',
    '....KBBK.KBBK...',
    '...KKKKK.KKKKK..',
  ]),
  // El fotógrafo: bigote, cámara y una nubecita para bajar del cielo.
  eb_foto: ebArt([
    '................',
    '.....KKKKKK.....',
    '....KNNNNNNK....',
    '....KFFFFFFK....',
    '....KFKFFKFK....',
    '....KBBBBBBK....',
    '.....KFFFFK.....',
    '...KKKeeKKKK....',
    '..KeeeeeeeeK....',
    '..KeCCeeeeeK....',
    '..KeeeeeeeeK....',
    '...KKKKKKKK.....',
    '.KKWWWKKWWWKK...',
    'KWWWWWWWWWWWWK..',
    'KWWWWWWWWWWWWWK.',
    '.KKKKKKKKKKKKK..',
  ]),
  // Lier X. Agerate: el buscador de tesoros de Onett, con su pala.
  eb_lier: ebArt([
    '................',
    '.....KKKKKK.....',
    '....KEEEEEEK....',
    '...KEFFFFFFEK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KEEEEEEEEK.K.',
    '....KEEEEEEK.KE.',
    '...KNNNNNNNNKE..',
    '..KFNNnNNnNNKE..',
    '..KKNNNNNNNKFK..',
    '....KNNNNNNKE...',
    '....KuuuuuuK.E..',
    '....KuuKKuuK..E.',
    '....KNNK.KNNK.KK',
    '...KKKKK.KKKKK..',
  ]),
  // Captain Strong, el jefe de la policía de Onett.
  eb_strong: ebArt([
    '................',
    '....KKKKKKKK....',
    '...KuuuuuuuuK...',
    '..KuuuuYYuuuuK..',
    '..KKKKKKKKKKKK..',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '....KFNNNNFK....',
    '..KKUUUUUUUUKK..',
    '.KFUUUYUUUUUUFK.',
    '.KFUUUUUUUUUUFK.',
    '..KKUUUUUUUUKK..',
    '....KuuuuuuK....',
    '....KuuK.KuuK...',
    '...KKKKK.KKKKK..',
  ]),
  // Vecino de Onett (en Moonside sale en neón).
  eb_vecino: ebArt([
    '................',
    '.....KKKKKK.....',
    '....KNNNNNNK....',
    '...KNNNNNNNNK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '....KFFFFFFK....',
    '...KCCCCCCCCK...',
    '..KFCCCCCCCCFK..',
    '..KFCCCCCCCCFK..',
    '...KCCCCCCCCK...',
    '....KssssssK....',
    '....KssKKssK....',
    '....KFK..KFK....',
    '...KNNK..KNNK...',
  ]),
  // La bibliotecaria (da el mapa del pueblo).
  eb_biblio: ebArt([
    '................',
    '....KKKKKKKK....',
    '...KMMMMMMMMK...',
    '..KMMMMMMMMMMK..',
    '..KMFFFFFFFFMK..',
    '..KMKWKFFKWKMK..',
    '..KMFFFFFFFFMK..',
    '...KFFFppFFFK...',
    '...KKmmmmmmKK...',
    '..KFmmmmmmmmFK..',
    '..KFmmmmmmmmFK..',
    '...KmmmmmmmmK...',
    '..KmmmmmmmmmmK..',
    '..KKKKKKKKKKKK..',
    '....KFK..KFK....',
    '...KBBK..KBBK...',
  ]),
  // El meteorito: roca negra con grietas que brillan.
  eb_meteorito: ebArt([
    '................',
    '................',
    '................',
    '.....KKKKK......',
    '...KKeeeeeKK....',
    '..KeeEeeeeeeK...',
    '.KeeEEeeeOeeeK..',
    '.KeeeeeeOOeeeK..',
    'KeeeeeeeeOeeeeK.',
    'KeeOeeeeeeeeeeK.',
    'KeeOOeeeeeEeeeK.',
    '.KeeeeeeeeEEeK..',
    '..KKeeeeeeeeKK..',
    'NNNKKKKKKKKKNNN.',
    'NnnNNNNNNNNNnnN.',
    '................',
  ]),
});

// Enemigos.
Object.assign(SPRITES, {
  // Spiteful Crow: cuervo negro con cara de presumido.
  eb_cuervo: ebArt([
    '................',
    '.....KKKK.......',
    '....KBBBBK......',
    '...KBBWKBBK.....',
    '...KBBKKBBKYY...',
    '...KBBBBBKYYYY..',
    '..KBBBBBBBKYY...',
    '.KBBBeBBBBBK....',
    'KBBBeeBBBBBBK...',
    'KBBeeeBBBBBBBK..',
    '.KBBBBBBBBBBBK..',
    '..KBBBBBBBBBK...',
    '...KKKKKKKKK....',
    '.....KY..KY.....',
    '....KYY.KYY.....',
    '................',
  ]),
  // New Age Retro Hippie: melena, lentes, barba, playera teñida, pantalones acampanados y su regla.
  eb_hippie: ebArt([
    '................',
    '....KKKKKKK.....',
    '...KNNNNNNNK....',
    '..KNNNNNNNNNK...',
    '..KNKKFFFKKNK...',
    '..KNKCKFKCKNK...',
    '..KNFFFFFFFNK...',
    '..KNNNNNNNNNK...',
    '..KNKNNNNNKNK...',
    '..KGMGMGMGMGK.Y.',
    '.KFGMGMGMGMGKFY.',
    '.KKMGMGMGMGMKKY.',
    '...KUUUUUUUK..Y.',
    '...KUUKKKUUK....',
    '..KUUUK.KUUUK...',
    '..KKKKK.KKKKK...',
  ]),
  // Starman: cuerpo de metal dorado y plateado, cabeza lisa, sin cara.
  eb_starman: ebArt([
    '.......KK.......',
    '......KWYK......',
    '.....KYYYYK.....',
    '....KYWYYYyK....',
    '....KYYYYYyK....',
    '.....KyyyyK.....',
    '...KKEEEEEEKK...',
    '..KYEWEEEEEEYK..',
    '.KYYKEEEEEEKYYK.',
    '.KYK.KEYYEK.KYK.',
    '.KK..KEEEEK..KK.',
    '.....KEEEEK.....',
    '....KEEKKEEK....',
    '....KYYK.KYYK...',
    '...KYYYK.KYYYK..',
    '...KKKKK.KKKKK..',
  ]),
  // Abstract Art: un cuadro vivo con manchas de neón.
  eb_arte: ebArt([
    'KKKKKKKKKKKKKKKK',
    'KyYYYYYYYYYYYYyK',
    'KYKKKKKKKKKKKKYK',
    'KYKXXBBBZZZBBKYK',
    'KYKXXXBBBZBVBKYK',
    'KYKBXBBAABBVBKYK',
    'KYKBBBAAAABBBKYK',
    'KYKZBBWKKWBBXKYK',
    'KYKZZBWKKWBXXKYK',
    'KYKBBBBBBBBBBKYK',
    'KYKVVBBXXBBZZKYK',
    'KYKBVBBBXBBBZKYK',
    'KYKKKKKKKKKKKKYK',
    'KyYYYYYYYYYYYYyK',
    'KKKKKKKKKKKKKKKK',
    '................',
  ]),
  // Evil Mani-Mani: la estatua dorada que crea la ilusión de Moonside.
  eb_manimani: ebArt([
    '................',
    '......KKKK......',
    '.....KYAAYK.....',
    '....KYAAAAYK....',
    '....KYKAAKYK....',
    '....KYXAAXYK....',
    '....KYAyyAYK....',
    '.....KYAAYK.....',
    '...KKYAAAAYKK...',
    '..KYAAYAAYAAYK..',
    '..KYAKYAAYKAYK..',
    '...KK.KAAK.KK...',
    '......KAAK......',
    '....KKyAAyKK....',
    '...KyyyyyyyyK...',
    '...KKKKKKKKKK...',
  ]),
  // La Máquina del Diablo: adentro está Giygas.
  eb_maquina: ebArt([
    '....KKKKKKKK....',
    '..KKeEEEEEEeKK..',
    '.KeEEKKKKKKEEeK.',
    '.KEEKrRRRRrKEEK.',
    'KeEKrRrRRrRrKEeK',
    'KEEKRRrKKrRRKEEK',
    'KEEKRrKBBKrRKEEK',
    'KEEKRrKBBKrRKEEK',
    'KEEKRRrKKrRRKEEK',
    'KeEKrRrRRrRrKEeK',
    '.KEEKrRRRRrKEEK.',
    '.KeEEKKKKKKEEeK.',
    '..KKeEEEEEEeKK..',
    '...KeK.KK.KeK...',
    '..KeeK.KK.KeeK..',
    '..KKKK.KK.KKKK..',
  ]),
});

// Variantes de color.
Object.assign(SPRITES, {
  eb_lucky: ebRecolor(SPRITES.eb_runaway, { B: 'u' }),
  eb_gorgeous: ebRecolor(SPRITES.eb_runaway, { B: 'B', R: 'Y' }),
  eb_moonvecino: ebRecolor(SPRITES.eb_vecino, { F: 'B', f: 'B', N: 'X', C: 'Z', s: 'V', K: 'X' }),
  eb_moonhombre: ebRecolor(SPRITES.eb_vecino, { F: 'B', f: 'B', N: 'A', C: 'X', s: 'Z', K: 'Z' }),
});

// ---------- Casillas ----------
Object.assign(SPRITES, {
  // Pasto de Onett: verde claro con puntitos.
  eb_pasto: ebRows((x, y) => {
    const r = ebHash(x, y, 3);
    if (r < 0.06) return 'g';
    if (r < 0.1) return 'H';
    return 'G';
  }),
  eb_flores: ebRows((x, y) => {
    const f = [[3, 3, 'P'], [11, 5, 'W'], [6, 11, 'Y'], [13, 12, 'P']];
    for (const [fx, fy, c] of f) {
      if (x === fx && y === fy) return 'Y';
      if (Math.abs(x - fx) + Math.abs(y - fy) === 1) return c === 'Y' ? 'W' : c;
    }
    return ebHash(x, y, 3) < 0.06 ? 'g' : 'G';
  }),
  // Calle: banqueta clara con junturas.
  eb_calle: ebRows((x, y) => {
    if (x % 8 === 7 || y % 8 === 7) return 's';
    return ebHash(x, y, 5) < 0.05 ? 's' : 'S';
  }),
  // Árbol redondito de Onett (va sobre el pasto).
  eb_arbol: ebRows((x, y) => {
    if (y >= 12) return x >= 6 && x <= 9 && y <= 14 ? (x === 6 || x === 9 ? 'K' : 'N') : y === 15 && x >= 6 && x <= 9 ? 'K' : '.';
    const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 6.5);
    if (d > 7.4) return '.';
    if (d > 6.5) return 'K';
    if (x + y < 9 && d > 2.5) return 'G';
    return ebHash(x, y, 7) < 0.25 || x + y > 18 ? 't' : 'T';
  }),
  // Colina: lomita café con pasto encima.
  eb_colina: ebRows((x, y) => {
    const d = Math.hypot((x + 0.5 - 8) / 1.1, y + 0.5 - 12);
    if (y > 14 || d > 9) return '.';
    if (d > 8.2) return 'K';
    if (y < 7) return x + y < 12 ? 'H' : 'G';
    return (x + y) % 5 === 0 ? 'N' : 'n';
  }),
  // Cráter del meteorito: tierra quemada.
  eb_crater: ebRows((x, y) => {
    const r = ebHash(x, y, 9);
    if (r < 0.1) return 'K';
    return r < 0.4 ? 'N' : 'n';
  }),
  // Techos de tejas (rojo y azul) y paredes con ventana.
  eb_techo: ebRows((x, y) => {
    if (y % 4 === 3) return 'r';
    return (x + (y >> 2) * 2) % 6 === 0 ? 'r' : 'R';
  }),
  eb_techoazul: ebRows((x, y) => {
    if (y % 4 === 3) return 'u';
    return (x + (y >> 2) * 2) % 6 === 0 ? 'u' : 'U';
  }),
  eb_pared: ebRows((x, y) => (y === 0 ? 'K' : y === 15 ? 's' : 'S')),
  eb_ventana: ebRows((x, y) => {
    if (y === 0) return 'K';
    if (x >= 3 && x <= 12 && y >= 3 && y <= 11) return x === 3 || x === 12 || y === 3 || y === 11 ? 'K' : x === 7 || x === 8 || y === 7 ? 'W' : 'C';
    return y === 15 ? 's' : 'S';
  }),
  eb_puerta: ebRows((x, y) => {
    if (y === 0) return 'K';
    if (x >= 3 && x <= 12 && y >= 2) {
      if (x === 3 || x === 12 || y === 2) return 'K';
      if (x === 10 && y === 9) return 'Y';
      return 'N';
    }
    return 'S';
  }),
  // Cerca blanca (sobre el pasto).
  eb_cerca: ebRows((x, y) => {
    if (y === 4 || y === 10) return 'W';
    if (x % 5 === 1) return y < 2 || y > 13 ? '.' : 'W';
    if (y === 5 || y === 11) return 'E';
    return '.';
  }),
  // Barricada de la policía (rayas amarillas y negras) sobre la calle.
  eb_barrera: ebRows((x, y) => {
    if (y >= 4 && y <= 9) return y === 4 || y === 9 ? 'K' : (x + y) % 6 < 3 ? 'Y' : 'B';
    if ((x === 2 || x === 13) && y > 9 && y < 15) return 'K';
    return x % 8 === 7 || y % 8 === 7 ? 's' : 'S';
  }),
  // El autobús de gira de los Runaway Five (dos casillas).
  eb_bus1: ebRows((x, y) => {
    if (y < 2 || y > 14) return '.';
    if (y === 2 || x === 0) return 'K';
    if (y >= 4 && y <= 8 && x >= 2) return x % 5 === 1 ? 'U' : 'C';
    if (y === 13 || y === 14) return x >= 2 && x <= 6 ? (y === 13 ? 'K' : 'B') : 'K';
    return y === 10 ? 'W' : 'U';
  }),
  eb_bus2: ebRows((x, y) => {
    if (y < 2 || y > 14) return '.';
    if (y === 2 || x === 15) return 'K';
    if (y >= 4 && y <= 8 && x <= 13) return x % 5 === 1 ? 'U' : 'C';
    if (y === 13 || y === 14) return x >= 9 && x <= 13 ? (y === 13 ? 'K' : 'B') : 'K';
    if (y === 10) return 'W';
    return x === 14 && y === 11 ? 'Y' : 'U';
  }),
  // Entrada de cueva (Paso Gigante).
  eb_cueva: ebRows((x, y) => {
    const d = Math.hypot((x + 0.5 - 8) / 1.2, y + 0.5 - 15);
    if (d < 6) return 'B';
    if (d < 7) return 'K';
    return (x * 3 + y) % 7 === 0 ? 'e' : 'E';
  }),
  eb_roca: ebRows((x, y) => {
    const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 9);
    if (d > 7) return '.';
    if (d > 6.2) return 'K';
    return x + y < 13 ? 'E' : 'e';
  }),
  // Moonside: suelo negro con puntitos de neón, edificios negros con orilla de neón, letreros.
  eb_moonpiso: ebRows((x, y) => {
    const r = ebHash(x, y, 13);
    if (r < 0.015) return 'X';
    if (r < 0.03) return 'Z';
    return 'B';
  }),
  eb_mooncalle: ebRows((x, y) => (y === 7 && x % 4 < 2 ? 'A' : 'B')),
  eb_moonmuro: ebRows((x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'X';
    if (x >= 4 && x <= 11 && y >= 4 && y <= 10) return x === 4 || x === 11 || y === 4 || y === 10 ? 'Z' : (x + y) % 3 ? 'B' : 'A';
    return 'B';
  }),
  eb_moonletrero: ebRows((x, y) => {
    if (y < 3 || y > 12) return 'B';
    if (y === 3 || y === 12 || x === 1 || x === 14) return 'V';
    return (x % 3 === 0 && y % 3 === 0) ? 'X' : 'B';
  }),
  eb_moonpuerta: ebRows((x, y) => {
    if (x >= 3 && x <= 12 && y >= 2) return x === 3 || x === 12 || y === 2 ? 'Z' : 'B';
    return 'X';
  }),
  // Cueva del Pasado: piedra rojiza que parece viva.
  eb_pasadopiso: ebRows((x, y) => {
    const r = ebHash(x, y, 17);
    if (r < 0.08) return 'r';
    if (r < 0.14) return 'K';
    return 'N';
  }),
  eb_pasadomuro: ebRows((x, y) => {
    const v = Math.sin(x * 0.9 + y * 0.4) + Math.sin(y * 1.3 - x * 0.2);
    if (v > 1.2) return 'R';
    if (v > 0.2) return 'r';
    if (v > -0.8) return 'N';
    return 'K';
  }),
});

// ---------- Eras: paletas para lo que no trae colores propios (Bit, tu héroe, letreros) ----------
HUB_ERAS.eb = {
  ...HUB_ERAS.snes,
  label: 'EARTHBOUND',
  theme: 'theme-eb',
  tiles: { ...HUB_ERAS.snes.tiles, sign: { a: '#f8f8f8', b: '#ece0b8', c: '#98582c', d: '#28202c' } },
};
HUB_ERAS.moonside = {
  ...HUB_ERAS.snes,
  label: 'MOONSIDE',
  theme: 'theme-moonside',
  tiles: { ...HUB_ERAS.snes.tiles, sign: { a: '#ffe23c', b: '#141018', c: '#ff3cf0', d: '#3cfff0' } },
  chars: { a: '#ffffff', b: '#ffe23c', c: '#ff3cf0', d: '#141018' },
  charOverrides: { ...HUB_ERAS.snes.charOverrides, heroe: { a: '#3cfff0', b: '#ffffff', c: '#ff3cf0', d: '#141018' }, bit: { a: '#ffffff', b: '#ffffff', c: '#c8ff3c', d: '#141018' } },
};
HUB_ERAS.pasado = { ...HUB_ERAS.snes, label: 'CUEVA DEL PASADO', theme: 'theme-pasado' };

// ---------- Utilidades ----------
const ebReverse = (s) => [...s].reverse().join('');
// Quita ¡ ¿ si el jugador apagó los acentos (su teclado no los tiene).
const ebSigns = (s) => (strictOn(true) ? s : s.replace(/[¡¿]/g, ''));
// Tu nombre (el que escribiste para Giygas). Antes de eso, "TÚ".
const ebName = () => Save.data.flags.ebNombre || 'TU';
// Experto: los tiempos de las oraciones se aprietan un poco más (a 80 PPM, sin esto sobraba tiempo).
const ebPace = () => (diff().pace || {}).giygas || (Save.data.difficulty === 'experto' ? 0.85 : 1);
// Sube o baja semitonos un texto de fichas (para bajos y voces dobladas).
const EB_PCS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function ebUp(s, n) {
  return s.replace(/([A-G])([#b]?)(\d)/g, (x, l, acc, o) => {
    const m = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[l] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + Number(o) * 12 + n;
    return `${EB_PCS[((m % 12) + 12) % 12]}${Math.floor(m / 12)}`;
  });
}

// ---------- Fondo psicodélico ----------
// Un canvas chiquito (128×96) que se estira a toda la pantalla, pixeleado. Cada capa es un patrón
// que se mece de lado (la oscilación horizontal de EarthBound) y cicla su paleta; dos capas se mezclan
// a la mitad, como las transparencias de aquellos fondos.
const EB_BG_W = 128;
const EB_BG_H = 96;
const ebRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const EB_PATTERNS = {
  // Bandas diagonales que se mecen.
  bandas: (x, y, t, c) => (x + c.amp * Math.sin(y * c.freq + t * c.speed) + y) / c.size,
  // Anillos que respiran desde el centro.
  anillos: (x, y, t, c) => (Math.hypot(x - 64, y - 48) + c.amp * Math.sin(y * c.freq + t * c.speed)) / c.size,
  // Cuadros que ondulan de arriba abajo.
  cuadros: (x, y, t, c) => {
    const yy = y + c.amp * Math.sin(x * c.freq + t * c.speed);
    const xx = x + c.amp * 0.5 * Math.sin(y * c.freq + t * c.speed * 0.7);
    return ((Math.floor(xx / c.size) + Math.floor(yy / c.size)) & 1) * 2 + yy / (c.size * 4);
  },
  // Ondas que se cruzan, como lámpara de lava.
  ondas: (x, y, t, c) => (Math.sin(x * c.freq + t * c.speed) + Math.sin(y * c.freq * 1.3 - t * c.speed * 0.7) + Math.sin((x + y) * c.freq * 0.5 + t)) * c.size,
  // Espiral (Giygas).
  espiral: (x, y, t, c) => {
    const dx = x - 64 + c.amp * 0.4 * Math.sin(y * c.freq + t * 1.7);
    const dy = y - 48;
    const r = Math.hypot(dx, dy);
    return (Math.atan2(dy, dx) * c.arms) / (2 * Math.PI) + r / c.size - t * c.speed + c.amp * 0.1 * Math.sin(r * c.freq - t * 2);
  },
};
const EB_LAYER = { kind: 'bandas', amp: 6, freq: 0.15, speed: 2, size: 6, cycle: 1.5, arms: 3 };

class EbBackdrop {
  constructor(canvas, layers) {
    this.canvas = canvas;
    this.set(layers);
  }

  set(layers) {
    this.layers = [].concat(layers).map((l) => ({ ...EB_LAYER, ...l, rgb: l.pal.map(ebRgb) }));
  }

  start() {
    this.g = this.canvas.getContext && this.canvas.getContext('2d');
    if (!this.g || !this.g.createImageData) return;
    this.img = this.g.createImageData(EB_BG_W, EB_BG_H);
    // Sin canvas de verdad (las pruebas en Node) no se pinta nada.
    if (!this.img || !this.img.data || this.img.data.length < EB_BG_W * EB_BG_H * 4) return;
    this.t0 = performance.now();
    this.frame = 0;
    this.on = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  loop = () => {
    if (!this.on) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.frame++ % 2) return; // ~30 cuadros por segundo bastan
    this.paint((performance.now() - this.t0) / 1000);
  };

  paint(t) {
    const d = this.img.data;
    const L = this.layers;
    const n = L.length;
    let k = 0;
    for (let y = 0; y < EB_BG_H; y++) {
      for (let x = 0; x < EB_BG_W; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0; i < n; i++) {
          const l = L[i];
          const v = EB_PATTERNS[l.kind](x, y, t, l);
          const m = l.rgb.length;
          const c = l.rgb[((Math.floor(v + t * l.cycle) % m) + m) % m];
          r += c[0];
          g += c[1];
          b += c[2];
        }
        d[k] = r / n;
        d[k + 1] = g / n;
        d[k + 2] = b / n;
        d[k + 3] = 255;
        k += 4;
      }
    }
    this.g.putImageData(this.img, 0, 0);
  }

  stop() {
    this.on = false;
    cancelAnimationFrame(this.raf);
  }
}

// ---------- El HP que rueda (odómetro) ----------
// Tres rueditas con 0-9 y otro 0 abajo (así el paso de 0 a 9 se ve continuo). Cada rueda gira
// cuando la de su derecha pasa por el 9.
const EB_DIG_H = 16;
const ebOdoHtml = () => `<div class="eb-odo">${[0, 1, 2].map(() =>
  `<span class="eb-dig"><i>${'01234567890'.split('').map((c) => `<b>${c}</b>`).join('')}</i></span>`).join('')}</div>`;
function ebOdoSet(el, value) {
  const v = Math.max(0, value);
  const digs = el.querySelectorAll('.eb-dig i');
  [100, 10, 1].forEach((p, j) => {
    let pos = Math.floor(v / p) % 10;
    if (p === 1) pos = v % 10;
    else pos += Math.max(0, (v % p) - (p - 1));
    digs[j].style.transform = `translateY(${-pos * EB_DIG_H}px)`;
  });
}
const EB_ROLL_DOWN = 9; // HP por segundo que rueda hacia abajo
const EB_ROLL_UP = 40; // al curarte sube rapidito
const EB_ITEM = { name: 'Hamburguesa', text: 'te comes la hamburguesa', heal: 22 };

// ---------- Tareas y lluvias propias ----------
// Moonside: todo al revés. Ves la palabra normal y la escribes de la última letra a la primera.
class MoonTask extends TypingTask {
  constructor(box, opts) {
    super(box, { ...opts, texts: opts.texts.map(ebReverse) });
    this.shown = opts.texts;
  }

  render(err = false) {
    this.wordsEl.innerHTML = this.shown.map((t, j) => {
      if (j < this.i) return `<span class="w done">${esc(t)}</span>`;
      if (j > this.i) return `<span class="w">${esc(t)}</span>`;
      const chars = [...t];
      const n = chars.length;
      return `<span class="w cur eb-alreves">${chars.map((c, k) => {
        const back = n - 1 - k; // cuántas letras faltan desde el final
        const st = back < this.pos ? 'ok' : back === this.pos ? `next${err ? ' err' : ''}` : '';
        return `<span class="c ${st}">${esc(c)}</span>`;
      }).join('')}</span>`;
    }).join(' ') + (this.tip ? `<div class="tt-tip">${esc(this.tip)}</div>` : '');
  }
}

// Lluvia que tiembla de lado y parpadea (Giygas y los de Moonside).
class EbWobbleDodge extends Dodge {
  start() {
    super.start();
    this.field.classList.add('eb-wobble');
    const lab = $('.dodge-label', this.box);
    if (lab && this.cfg.label) lab.textContent = this.cfg.label;
  }

  spawn() {
    super.spawn();
    const b = this.bullets[this.bullets.length - 1];
    b.ph = Math.random() * 6.28;
    if (this.cfg.glitch) b.el.classList.add('eb-glitch');
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.gap / diff().speed;
    }
    const amp = this.cfg.wobble || 24;
    for (const b of [...this.bullets]) {
      b.y += this.cfg.speed * diff().speed * dt;
      const wx = Math.sin(this.elapsed * 0.004 + b.ph) * amp;
      b.el.style.transform = `translate(${b.x + wx}px, ${b.y}px)`;
      if (b.y + b.h >= this.groundY) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };
}

// ---------- La batalla de EarthBound ----------
// Scenes.battle carga después de este archivo: las escenas se arman cuando ya está todo.
function ebMakeScenes() {
  Scenes.ebBattle = Object.assign(Object.create(Scenes.battle), {
    enter(params) {
      Object.assign(this, { ended: false, roll: null, odo: null });
      Scenes.battle.enter.call(this, params);
      this.ebDecorate();
    },

    ebDecorate() {
      const b = $('.battle');
      b.classList.add('eb-battle');
      const cv = document.createElement('canvas');
      cv.className = 'eb-bg';
      cv.width = EB_BG_W;
      cv.height = EB_BG_H;
      b.prepend(cv);
      this.bg = new EbBackdrop(cv, this.def.ebBg || EB_BGS.onett);
      this.bg.start();
      // La cajita de HP de EarthBound, con el odómetro.
      const box = document.createElement('div');
      box.className = 'eb-hpbox';
      box.innerHTML = `<div class="eb-hpname">${esc(upper(ebName()))}</div><div class="eb-hprow"><span>HP</span>${ebOdoHtml()}</div>`;
      $('.pinfo').appendChild(box);
      if (Save.data.flags.ebNess && this.def.ness !== false) {
        const nb = document.createElement('div');
        nb.className = 'eb-hpbox eb-nessbox';
        nb.innerHTML = '<div class="eb-hpname">NESS</div><div class="eb-hprow"><span>PSI</span><span class="eb-rockin">ROCKIN</span></div>';
        $('.pinfo').appendChild(nb);
      }
      this.odo = $('.eb-odo', box);
      this.roll = this.p.hp;
      this.target = this.p.hp;
      this.rollT = performance.now();
      clearInterval(this.rollIv);
      this.rollIv = setInterval(() => this.rollTick(), 50);
      this.updateBars();
    },

    // El HP rueda hacia su meta. Mientras lees un diálogo se detiene (no es justo morir leyendo).
    rollTick() {
      const now = performance.now();
      const dt = (now - this.rollT) / 1000;
      this.rollT = now;
      if (this.ended || this.roll === null) return;
      if (['dialog', 'intro', 'name'].includes(this.phase)) return;
      if (this.e.hp <= 0) return; // el enemigo ya cayó: te salvaste
      if (this.roll === this.target) return;
      if (this.roll > this.target) this.roll = Math.max(this.target, this.roll - EB_ROLL_DOWN * dt);
      else this.roll = Math.min(this.target, this.roll + EB_ROLL_UP * dt);
      this.p.hp = Math.max(0, Math.ceil(this.roll - 1e-6));
      this.updateBars();
      if (this.roll <= 0) this.ebLose();
    },

    ebLose() {
      if (this.ended) return;
      this.ended = true;
      if (this.task) this.task.stop();
      if (this.dodge) this.dodge.stop();
      this.phase = 'busy';
      this.renderCmds();
      this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: this.def.mode || 'ebBattle' }); }, 600);
    },

    hurt(n) {
      const was = this.target;
      this.target = Math.max(0, this.target - n);
      if (this.target === 0 && was > 0) {
        this.floatText('¡DAÑO MORTAL!', 'crit');
        Sfx.hurt();
      }
      this.updateBars();
    },

    heal(n) {
      this.target = Math.min(this.p.max, this.target + n);
      this.updateBars();
    },

    updateBars() {
      Scenes.battle.updateBars.call(this);
      if (!this.odo) return;
      ebOdoSet(this.odo, this.roll);
      const box = this.odo.closest('.eb-hpbox');
      if (box) box.classList.toggle('mortal', this.target <= 0);
    },

    cleanup() {
      Scenes.battle.cleanup.call(this);
      clearInterval(this.rollIv);
      if (this.bg) this.bg.stop();
    },

    // Como runTask, pero con la clase de tarea que toque (MoonTask en Moonside).
    ebTask(opts) {
      this.phase = 'typing';
      this.renderCmds();
      const { onDone, onUnit, Cls = this.def.alReves ? MoonTask : TypingTask } = opts;
      this.task = new Cls(this.box, {
        caps: !!this.def.caps,
        strict: this.strict,
        ...opts,
        onUnit: (unit) => (onUnit ? onUnit(unit) : true),
        onDone: (res) => {
          this.st.chars += res.chars;
          this.st.errors += res.errors;
          this.st.ms += res.ms;
          onDone(res);
        },
      });
      this.task.start();
    },

    fight() {
      let words = pickWords(this.def.words, this.def.fightWords);
      if (this.def.fightList) words = this.def.fightList(words);
      const total = words.join('').length;
      let dealt = 0;
      this.ebTask({
        label: this.def.alReves ? '¡LUCHAR! AL REVES: de la última letra a la primera' : '¡LUCHAR! Escribe rápido:',
        texts: words,
        timeLimit: (total * 560 + 2500) * (this.def.fightTime || 1),
        onUnit: (unit) => {
          let { dmg, perfect } = this.damageFor(unit);
          const smash = perfect && unit.text.length >= 7;
          if (smash) dmg = Math.round(dmg * 1.5);
          dealt += dmg;
          if (perfect) this.st.perfect++;
          this.e.hp = Math.max(0, this.e.hp - dmg);
          perfect ? Sfx.crit() : Sfx.hit();
          this.floatText(smash ? `SMAAAASH!! -${dmg}` : perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, smash ? 'crit eb-smash' : perfect ? 'crit' : '');
          this.shake('.esprite');
          this.updateBars();
          return this.e.hp > 0;
        },
        onDone: (res) => {
          if (this.ended) return;
          if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
          const pages = [];
          if (dealt === 0) pages.push('* ¡Se acabó el tiempo! No lograste atacar.');
          else if (res.completed) pages.push(`* ¡Combo completo! Hiciste ${dealt} de daño.`);
          else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
          // Ness batea después de tu combo.
          if (Save.data.flags.ebNess && this.def.ness !== false && dealt > 0) {
            const n = Math.max(1, Math.round((4 + Save.data.level) * (diff().hit || 1)));
            this.e.hp = Math.max(0, this.e.hp - n);
            this.floatText(`NESS -${n}`);
            Sfx.hit();
            this.updateBars();
            pages.push(`* ¡Ness batea con su bate de béisbol!\n* ${n} de daño más.`);
            if (this.e.hp <= 0) { this.say(pages, () => this.win(false)); return; }
          }
          this.say(pages, () => this.enemyTurn());
        },
      });
    },

    act(a) {
      this.ebTask({
        Cls: TypingTask,
        label: `ACTUAR: ${a.name}`,
        texts: [a.text],
        timeLimit: a.text.length * 600 + 3000,
        onDone: (res) => {
          if (this.ended) return;
          const gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
          const was = this.e.mercy;
          this.e.mercy = Math.min(100, this.e.mercy + gain);
          if (gain) { Sfx.mercy(); this.floatText(`PAZ +${this.e.mercy - was}%`, 'mercy'); }
          this.updateBars();
          const pages = [res.completed ? a.reply : '* ¡Casi! Se acabó el tiempo antes de terminar.'];
          if (this.e.mercy >= 100 && was < 100) pages.push(`* ${this.NAME} ya no quiere pelear.\n* ¡Usa PERDONAR!`);
          this.say(pages, () => this.enemyTurn());
        },
      });
    },

    itemMenu() {
      this.subMenu([{ label: `${EB_ITEM.name} x${this.items}`, disabled: this.items === 0 }], () => {
        this.ebTask({
          Cls: TypingTask,
          label: `OBJETO: ${EB_ITEM.name}`,
          texts: [EB_ITEM.text],
          timeLimit: EB_ITEM.text.length * 600 + 3000,
          onDone: (res) => {
            if (this.ended) return;
            this.items--;
            const heal = res.completed ? EB_ITEM.heal : Math.ceil(EB_ITEM.heal / 2);
            this.heal(heal);
            Sfx.heal();
            this.say([`* Te comiste la ${EB_ITEM.name}. ¡Recuperas ${heal} HP!\n* (Mira cómo sube la ruedita.)`], () => this.enemyTurn());
          },
        });
      });
    },

    // Qué lluvia y cuánto duele. Las escenas hijas (Giygas) lo cambian.
    dodgeSetup() {
      return { Cls: this.def.wobble ? EbWobbleDodge : Dodge, cfg: this.def.bullets, atk: this.def.atk };
    },

    startDodge() {
      this.phase = 'dodge';
      const { Cls, cfg, atk } = this.dodgeSetup();
      this.dodge = new Cls(this.box, { caps: !!this.def.caps, strict: this.strict, ...cfg }, {
        onHit: () => {
          this.hurt(scaledDmg(atk));
          this.shake('.pinfo');
        },
        onDone: (res) => {
          this.st.chars += res.chars;
          this.st.errors += res.errors;
          if (!this.ended) this.toMenu();
        },
      });
      this.dodge.start();
    },

    // Ganar: como siempre, más el aviso si te salvaste con daño mortal y el "YOU WON!".
    win(spared) {
      if (this.ended) return;
      this.ended = true;
      const mortal = this.target <= 0;
      this.say = (pages, done) => {
        delete this.say;
        pages[0] = pages[0].replace('* ¡GANASTE!', '* ¡GANASTE! (YOU WON!)');
        if (mortal) pages.splice(1, 0, '* ¡Uf! Tenías DAÑO MORTAL...\n* ...pero ganaste antes de que tu HP llegara a cero.');
        this.say(pages, this.afterWin ? () => this.afterWin(done) : done);
      };
      Scenes.battle.win.call(this, spared);
    },

    onKey(e) {
      if (this.phase === 'name') { this.nameKey(e); return; }
      Scenes.battle.onKey.call(this, e);
    },
  });

  Scenes.giygas = Object.assign(Object.create(Scenes.ebBattle), {
    enter(params) {
      Object.assign(this, { stage: 1, prayers: 0, afterWin: null });
      Scenes.ebBattle.enter.call(this, params);
      this.afterWin = (done) => ebAlbum(done);
      $('.battle').classList.add('eb-giygas');
      // Punto de control: si ya habías llegado a la fase 2, empiezas ahí.
      if (Save.data.flags.ebGiygasF2) {
        this.dialog.stop();
        this.toStage2(true);
      }
    },

    toStage2(retry = false) {
      this.stage = 2;
      Save.data.flags.ebGiygasF2 = true;
      Save.write();
      this.e.hp = this.def.hp2;
      this.e.mercy = 0;
      this.bg.set(EB_BGS.giygas2);
      $('.battle').classList.add('eb-stage2');
      $('.esprite').classList.add('eb-gone');
      $('.ename').textContent = 'GIYGAS';
      document.querySelectorAll('.cmd').forEach((c, i) => { c.textContent = ['REZAR', 'LUCHAR', 'OBJETO', 'AYUDA'][i]; });
      $('.emercy').classList.add('hidden');
      this.updateBars();
      Music.play('eb_giygas2');
      const pages = retry
        ? ['* (Vuelves a donde te quedaste: la Máquina del Diablo ya está apagada.)', ...EB_STAGE2_PAGES.slice(2)]
        : EB_STAGE2_PAGES;
      this.say(pages, () => this.toMenu());
    },

    toMenu() {
      if (this.stage === 1) { Scenes.ebBattle.toMenu.call(this); return; }
      this.phase = 'menu';
      this.renderCmds();
      this.box.innerHTML = '<div class="tb-text"></div>';
      const text = this.prayers === 0 ? '* No puedes comprender la verdadera forma del ataque de Giygas.\n* (Usa REZAR.)' : rand(EB_GIYGAS_IDLE);
      this.dialog = new Dialog($('.tb-text', this.box), [text], null, { wait: false });
    },

    choose() {
      if (this.stage === 1) { Scenes.ebBattle.choose.call(this); return; }
      Sfx.confirm();
      this.dialog.stop();
      if (this.cmd === 0) this.pray();
      else if (this.cmd === 1) this.say(['* Le pegas con todas tus fuerzas...', '* ...pero Giygas no siente nada.\n* (LUCHAR no sirve. Hay que REZAR.)'], () => this.enemyTurn());
      else if (this.cmd === 2) this.itemMenu();
      else this.say([rand(EB_AYUDA)], () => this.toMenu());
    },

    pray() {
      const n = this.prayers;
      const p = EB_PRAYERS[n];
      const text = ebSigns(p.text);
      this.ebTask({
        Cls: TypingTask,
        label: `REZAR · Paula reza (${n + 1}/${EB_PRAYERS.length}). Máximo ${EB_PRAY_ERR} errores:`,
        texts: [text],
        timeLimit: (text.length * 420 * ebPace() + 1500),
        onDone: (res) => {
          if (this.ended) return;
          const ok = res.completed && res.errors <= EB_PRAY_ERR;
          let pages;
          if (ok) {
            this.prayers++;
            const left = EB_PRAYERS.length - this.prayers;
            this.e.hp = Math.max(1, Math.round((this.def.hp2 * (left + 1)) / (EB_PRAYERS.length + 1)));
            Sfx.secret();
            this.floatText('♥ ORACION', 'mercy');
            this.shake('.battle');
            this.updateBars();
            pages = [p.reach, p.line];
          } else {
            pages = [res.completed
              ? `* Paula reza... pero las palabras se enredaron (${res.errors} errores).\n* La oración se pierde en la oscuridad.`
              : '* Paula reza... pero no alcanzaste a terminar.\n* La oración se pierde en la oscuridad.'];
          }
          if (ok && this.prayers === EB_PRAYERS.length) {
            pages.push(...EB_FINAL_PAGES);
            this.say(pages, () => this.askName());
            return;
          }
          this.say(pages, () => this.enemyTurn());
        },
      });
    },

    // ---------- Tu nombre ----------
    askName() {
      this.phase = 'name';
      this.renderCmds();
      Music.play('eb_rezo');
      this.nameBuf = Save.data.flags.ebNombre || '';
      this.box.innerHTML = `
        <div class="eb-name">
          <div class="tt-label">* La oración llegó... a alguien que nunca los había visto.</div>
          <div class="eb-name-q">¿COMO TE LLAMAS? (el de verdad)</div>
          <div class="eb-name-field"><span class="eb-name-t"></span><span class="eb-cursor">▮</span></div>
          <div class="eb-name-help">Escribe tu nombre · BORRAR corrige · ENTER listo</div>
        </div>`;
      this.nameRender();
    },

    nameRender() {
      const el = $('.eb-name-t', this.box);
      if (el) el.textContent = this.nameBuf;
    },

    nameKey(e) {
      if (e.key === 'Backspace') { this.nameBuf = this.nameBuf.slice(0, -1); Sfx.move(); this.nameRender(); return; }
      if (e.key === 'Enter') {
        const name = this.nameBuf.trim();
        if (!name) { Sfx.error(); return; }
        Save.data.flags.ebNombre = name;
        Save.write();
        Sfx.confirm();
        const box = $('.eb-hpbox .eb-hpname');
        if (box) box.textContent = upper(name);
        this.finalPrayer(name);
        return;
      }
      if (e.key.length !== 1 || e.repeat) return;
      if (this.nameBuf.length >= 12 || !/[a-záéíóúüñ0-9 ]/i.test(e.key)) { Sfx.error(); return; }
      if (e.key === ' ' && !this.nameBuf) return;
      this.nameBuf += e.key;
      Sfx.key();
      this.nameRender();
    },

    finalPrayer(name) {
      const N = upper(name);
      this.say([
        `* La oración de Paula y sus amigos tocó el corazón de ${N}.`,
        `* ${N} rezó por ellos, sin haberlos conocido nunca.\n* ¡Escribe tu nombre con todas tus fuerzas!`,
      ], () => {
        this.ebTask({
          Cls: TypingTask,
          label: `${N} reza:`,
          texts: [name, name, name],
          timeLimit: name.length * 3 * 700 + 4000,
          onUnit: () => { Sfx.crit(); this.shake('.battle'); this.floatText('♥', 'mercy'); return true; },
          onDone: (res) => {
            if (this.ended) return;
            if (!res.completed) {
              this.say(['* ¡Casi! Giygas se resiste...\n* ¡Otra vez! ¡Tú puedes!'], () => this.finalPrayer(name));
              return;
            }
            this.e.hp = 0;
            this.updateBars();
            $('.battle').classList.add('eb-whiteout');
            this.say(EB_GIYGAS_END(N), () => this.win(false));
          },
        });
      });
    },

    win(spared) {
      if (this.stage === 1) {
        if (this.ended) return;
        this.say(EB_STAGE1_END, () => this.toStage2());
        return;
      }
      delete Save.data.flags.ebGiygasF2;
      Scenes.ebBattle.win.call(this, spared);
    },

    enemyTurn() {
      if (this.stage === 1) { Scenes.ebBattle.enemyTurn.call(this); return; }
      this.phase = 'busy';
      this.renderCmds();
      this.box.innerHTML = '';
      const bubble = $('.bubble');
      // Pokey sigue ahí hasta la novena oración (la del jugador).
      bubble.textContent = Math.random() < 0.3 ? rand(EB_POKEY_TAUNTS) : rand(EB_GIYGAS_TAUNTS);
      bubble.classList.remove('hidden');
      this.later(() => {
        bubble.classList.add('hidden');
        if (!this.ended) this.startDodge();
      }, 1500);
    },

    dodgeSetup() {
      if (this.stage === 1) return { Cls: EbWobbleDodge, cfg: this.def.bullets, atk: this.def.atk };
      return { Cls: EbWobbleDodge, cfg: this.def.bullets2, atk: this.def.atk2 };
    },
  });
}
window.addEventListener('DOMContentLoaded', () => { if (Scenes.battle) ebMakeScenes(); });

// ---------- Fotos "Fuzzy Pickles" ----------
// Al pisar la casilla de una foto (m.ebFotos = { 'x,y': id }), baja el fotógrafo en su nube.
const ebFotoTaken = (id) => !!(Save.data.flags.ebFotos || {})[id];
async function ebFotoScene(scene, ctx, id) {
  const f = EB_FOTOS[id];
  const el = document.createElement('div');
  el.className = 'ent eb-fotografo';
  el.appendChild(spriteCanvas('eb_foto', 2));
  el.style.transform = `translate(${(scene.p.x + 1) * TILE}px, ${scene.p.y * TILE - 40}px)`;
  const world = $('.tworld');
  if (world) world.appendChild(el);
  await ctx.say([
    '* ¡Fotos al instante! Soy un genio de la fotografía, si me permiten decirlo.',
    '* Miren a la cámara... Listos...\n* Digan: «fuzzy pickles».',
  ], 'FOTOGRAFO');
  const town = $('.town');
  if (town) { town.classList.remove('eb-flash'); void town.offsetWidth; town.classList.add('eb-flash'); }
  Sfx.pop();
  Save.data.flags.ebFotos = { ...(Save.data.flags.ebFotos || {}), [id]: true };
  Save.write();
  await ctx.say([`* ¡CLIC! Foto: «${f.name}».\n* (Esta foto saldrá en el álbum... al final de todo.)`]);
  el.classList.add('eb-fotoadios');
  setTimeout(() => el.remove(), 600);
}
window.addEventListener('DOMContentLoaded', () => {
  const town = Scenes.town;
  if (!town) return;
  const baseArrive = town.arrive;
  town.arrive = function () {
    const spots = this.m && this.m.ebFotos;
    const id = spots && spots[`${this.p.x},${this.p.y}`];
    if (id && !ebFotoTaken(id) && !this.exitAt(this.p.x, this.p.y)) {
      if (this.grace > 0) this.grace--;
      this.savePos();
      this.run((ctx) => ebFotoScene(this, ctx, id));
      return;
    }
    baseArrive.call(this);
  };
});

// El álbum (como las fotos de los créditos de EarthBound). done() al cerrarlo.
function ebAlbum(done) {
  const el = document.createElement('div');
  el.className = 'eb-album';
  const ids = Object.keys(EB_FOTOS);
  el.innerHTML = `
    <div class="eb-album-t">ALBUM DE FOTOS · FUZZY PICKLES</div>
    <div class="eb-album-g">${ids.map((id) => `<div class="eb-foto ${ebFotoTaken(id) ? '' : 'falta'}" data-id="${id}" style="background:${EB_FOTOS[id].bg}"><div class="eb-foto-p"></div><div class="eb-foto-n">${esc(ebFotoTaken(id) ? EB_FOTOS[id].name : '¿...?')}</div></div>`).join('')}</div>
    <div class="eb-album-k">ENTER: seguir</div>`;
  (Game.root || document.body).appendChild(el);
  ids.forEach((id) => {
    if (!ebFotoTaken(id)) return;
    const p = $(`.eb-foto[data-id="${id}"] .eb-foto-p`, el);
    ['heroe', 'bit', ...EB_FOTOS[id].who].forEach((s) => {
      const colors = s === 'heroe' || s === 'bit' ? charColors(s, 'snes') : null;
      p.appendChild(spriteCanvas(s, 2, false, '', colors));
    });
  });
  Sfx.secret();
  const scene = Game.scene;
  scene.onKey = (e) => {
    if (!isConfirm(e)) return;
    delete scene.onKey; // vuelve la de siempre (la del prototipo)
    el.remove();
    done();
  };
}

// ---------- Fondos de batalla (capas de EbBackdrop) ----------
const EB_BGS = {
  onett: [
    { kind: 'bandas', pal: ['#58b0f0', '#88d0f8', '#b8e8f8', '#88d0f8'], amp: 8, freq: 0.12, speed: 2.2, size: 5, cycle: 1.2 },
    { kind: 'ondas', pal: ['#f8f0a0', '#f8c8e0', '#c8f0c0'], freq: 0.08, speed: 1.1, size: 1.4, cycle: 0.6 },
  ],
  cuervo: [
    { kind: 'cuadros', pal: ['#203878', '#3058b8', '#5888e0', '#3058b8'], amp: 5, freq: 0.15, speed: 2.5, size: 8, cycle: 1 },
    { kind: 'bandas', pal: ['#101828', '#384878'], amp: 10, freq: 0.1, speed: 3, size: 4, cycle: 2 },
  ],
  hippie: [
    { kind: 'ondas', pal: ['#f87830', '#f8c030', '#a8e048', '#48c0a0', '#a868e0', '#f058a0'], freq: 0.09, speed: 1.4, size: 1.8, cycle: 1.6 },
    { kind: 'anillos', pal: ['#f8f0c0', '#f8a860', '#f8f0c0', '#a8e048'], amp: 5, freq: 0.2, speed: 2, size: 5, cycle: 1.3 },
  ],
  moonside: [
    { kind: 'cuadros', pal: ['#000000', '#ff3cf0', '#000000', '#3cfff0'], amp: 6, freq: 0.13, speed: 2.8, size: 10, cycle: 1.5 },
    { kind: 'bandas', pal: ['#000000', '#c8ff3c', '#000000', '#ffe23c'], amp: 12, freq: 0.09, speed: 3.5, size: 3, cycle: 2.5 },
  ],
  manimani: [
    { kind: 'anillos', pal: ['#000000', '#ffe23c', '#c89818', '#000000', '#ff3cf0'], amp: 8, freq: 0.18, speed: 3, size: 4, cycle: 2.4 },
    { kind: 'ondas', pal: ['#000000', '#3cfff0', '#000000'], freq: 0.1, speed: 2, size: 1.5, cycle: 1 },
  ],
  starman: [
    { kind: 'anillos', pal: ['#081830', '#183870', '#3870c0', '#c8d8f0', '#3870c0', '#183870'], amp: 4, freq: 0.1, speed: 1.5, size: 6, cycle: 1.4 },
    { kind: 'cuadros', pal: ['#081830', '#f8d838'], amp: 3, freq: 0.1, speed: 1, size: 12, cycle: 0.5 },
  ],
  pokey: [
    { kind: 'bandas', pal: ['#f89038', '#f8c060', '#f8e0a0', '#f8c060'], amp: 14, freq: 0.08, speed: 4, size: 5, cycle: 1.8 },
    { kind: 'cuadros', pal: ['#98582c', '#f8e070'], amp: 4, freq: 0.2, speed: 3, size: 6, cycle: 1 },
  ],
  giygas1: [
    { kind: 'espiral', pal: ['#300810', '#701828', '#b02838', '#701828', '#300810', '#000000'], amp: 10, freq: 0.15, speed: 1.4, size: 9, cycle: 0.8, arms: 3 },
    { kind: 'ondas', pal: ['#000000', '#480818', '#000000', '#882030'], freq: 0.07, speed: 1, size: 1.2, cycle: 0.6 },
  ],
  giygas2: [
    { kind: 'espiral', pal: ['#000000', '#580810', '#a01020', '#e83030', '#a01020', '#580810'], amp: 22, freq: 0.22, speed: 2.4, size: 6, cycle: 1.6, arms: 5 },
    { kind: 'espiral', pal: ['#200008', '#e04050', '#200008', '#000000'], amp: 14, freq: 0.3, speed: -1.8, size: 11, cycle: -1, arms: 2 },
  ],
};

// ---------- Enemigos (todos con su escena: no son amigos del museo ni salen en el pasto) ----------
const EB_BASE = {
  theme: 'eb', mode: 'ebBattle', music: 'eb_batalla', strictAccents: true,
};
Object.assign(ENEMIES, {
  ebcuervo: {
    ...EB_BASE,
    name: 'Spiteful Crow', sprite: 'eb_cuervo', hp: 110, atk: 6, def: 4, xp: 40, fightWords: 5, ebBg: EB_BGS.cuervo,
    words: ['cuervo', 'pluma', 'pico', 'negro', 'rencor', 'ladrón', 'brillo', 'nido', 'graznido', 'colina', 'meteorito', 'travieso', 'risa', 'ala'],
    blurb: 'Un cuervo de Onett con cara de presumido.', keysHint: 'Palabras de Onett',
    intro: '* ¡Te enfrentas a un Spiteful Crow!',
    check: '* SPITEFUL CROW - ATQ 6 DEF 4\n* Uno de los primeros enemigos de Onett.\n* Se cree muy listo. (Lo es, un poquito.)',
    idle: ['* El Spiteful Crow se ríe de tu gorra.', '* El Spiteful Crow se arregla las plumas. Qué presumido.', '* Huele a meteorito quemado.'],
    calm: '* El Spiteful Crow ya no se ríe tanto.',
    taunts: ['¡Cra cra!', '¡Ja, jaaa!', '¿Y esa cara?'],
    acts: [
      { name: 'Brillo', text: 'le enseñas algo que brilla', mercy: 45, reply: '* El cuervo se queda viendo tu moneda...\n* "¿Me la das?" No. "Bueno."' },
      { name: 'Reírse', text: 'te ríes más fuerte que él', mercy: 40, reply: '* "¡Cra! ...Eso no es justo. Yo soy el que se ríe."' },
      { name: 'Ignorar', text: 'haces como que no lo ves', mercy: 30, reply: '* "¡Oye! ¡OYE! ¡Mírame!" Ser ignorado le duele.' },
    ],
    bullets: { count: 10, interval: 1100, speed: 36, pool: ['cra', 'pico', 'ala', 'nido', 'risa', 'pluma', 'cuervo', 'ja'] },
  },
  ebhippie: {
    ...EB_BASE,
    name: 'New Age Retro Hippie', sprite: 'eb_hippie', hp: 120, atk: 6, def: 4, xp: 42, fightWords: 5, ebBg: EB_BGS.hippie, wobble: true,
    words: ['paz', 'amor', 'flores', 'onda', 'guitarra', 'colores', 'sesenta', 'melena', 'buena vibra', 'retro', 'tranquilo', 'girasol', 'sandalias'],
    blurb: 'Un hippie que se perdió de camino a Twoson.', keysHint: 'Paz, amor y teclas',
    intro: '* ¡Te encuentras con un New Age Retro Hippie!',
    check: '* NEW AGE RETRO HIPPIE - ATQ 6 DEF 4\n* En EarthBound vive en Twoson, cerca de Burglin Park.\n* Vino a Onett porque "aquí hay buena onda".',
    idle: ['* El New Age Retro Hippie hace la señal de paz.', '* El hippie dice "qué onda" sin parar.', '* Todo huele a incienso. Y a hamburguesa.'],
    calm: '* El hippie está muy, muy relajado.',
    taunts: ['¡Paz, hermano!', '¡Qué onda!', '¡Buena vibra!'],
    acts: [
      { name: 'Paz', text: 'haces la señal de paz y amor', mercy: 50, reply: '* "¡Eso, hermano! ¡Paz y amor!"' },
      { name: 'Bailar', text: 'bailas muy despacito con él', mercy: 40, reply: '* Bailan en cámara lenta. Muy lenta. Demasiado lenta.' },
      { name: 'Flor', text: 'le regalas una flor del camino', mercy: 35, reply: '* Se la pone en la melena. "Qué buena onda."' },
    ],
    bullets: { count: 11, interval: 1100, speed: 36, label: '¡Las letras bailan!', wobble: 20, pool: ['paz', 'amor', 'onda', 'flor', 'vibra', 'sol', 'ritmo', 'retro'] },
  },
  ebarte: {
    ...EB_BASE,
    name: 'Abstract Art', sprite: 'eb_arte', hp: 125, atk: 5, def: 4, xp: 44, fightWords: 4, ebBg: EB_BGS.moonside, music: 'eb_moonside', alReves: true, wobble: true, fightTime: 1.35,
    words: ['luna', 'cuadro', 'pintura', 'neón', 'noche', 'espejo', 'revés', 'arte', 'color', 'marco', 'raro', 'sueño'],
    blurb: 'Un cuadro que se mueve. En Moonside, todo es arte. Y al revés.', keysHint: 'Escribe AL REVES',
    intro: '* ¡Te topas con un Abstract Art!\n* (En Moonside se pelea AL REVES: escribe cada palabra desde la última letra.)',
    check: '* ABSTRACT ART - ATQ 5 DEF 4\n* Un enemigo de Moonside. Nadie entiende qué pinta.\n* Ni él.',
    idle: ['* El Abstract Art cambia de colores.', '* Ves el cuadro de cabeza. ¿O el cuadro te ve a ti de cabeza?', '* Huele a pintura fresca de neón.'],
    calm: '* El Abstract Art se queda quieto. Como un cuadro normal.',
    taunts: ['etrA', '¡Séver la odnum!', '¿...?'],
    acts: [
      { name: 'Admirar', text: 'le dices que es una obra maestra', mercy: 45, reply: '* "¡ARGOM! ...Digo, ¡GRACIAS!"\n* (En Moonside hasta las gracias salen al revés.)' },
      { name: 'Voltear', text: 'lo cuelgas al derecho', mercy: 40, reply: '* "...Así se ve mejor, ¿verdad?" Sí.' },
      { name: 'Firmar', text: 'le pones tu firma en la esquina', mercy: 30, reply: '* "¡Ahora valgo un millón!" No.' },
    ],
    bullets: { count: 10, interval: 1300, speed: 36, label: 'Lo que cae, tal cual', glitch: true, pool: ['anul', 'etra', 'oran', 'arim', 'ehcon', 'olec', 'ojé'] },
  },
  ebmanimani: {
    ...EB_BASE,
    name: 'Evil Mani-Mani', sprite: 'eb_manimani', boss: true, hp: 210, atk: 7, def: 5, xp: 70, fightWords: 5, ebBg: EB_BGS.manimani, music: 'eb_moonside', alReves: true, wobble: true, fightTime: 1.35,
    words: ['estatua', 'dorada', 'ilusión', 'luna', 'neón', 'noche', 'revés', 'brillo', 'tesoro', 'espejo', 'mentira', 'ciudad', 'oro'],
    blurb: '¡JEFE DE MOONSIDE! La estatua dorada que inventó todo este mundo al revés.', keysHint: 'AL REVES y con acentos',
    intro: '* La estatua dorada abre los ojos...\n* ¡Te enfrentas a Evil Mani-Mani! (Todo AL REVES.)',
    check: '* EVIL MANI-MANI - ATQ 7 DEF 5\n* La Estatua Mani Mani crea ilusiones: Moonside es una.\n* Si la vences, la ilusión se acaba.',
    idle: ['* Mani-Mani brilla en dorado. Y en morado. Y en verde.', '* "Inam inam... MANI MANI."', '* Las luces de neón parpadean al ritmo de la estatua.'],
    calm: '* Mani-Mani brilla menos.',
    taunts: ['¡Edisnoom!', 'INAM INAM', '¡Séver la odnum!'],
    acts: [
      { name: 'Despertar', text: 'te dices que todo es una ilusión', mercy: 35, reply: '* Las luces tiemblan. "¿...Y si sí lo es?"' },
      { name: 'Pulir', text: 'le sacas brillo a la estatua', mercy: 30, reply: '* "...Nadie me había pulido. Desde que Lier me encontró."' },
      { name: 'Sí es no', text: 'le dices que no quieres pelear', mercy: 35, reply: '* "¿NO? ...En Moonside, NO es SI." Se confunde.' },
    ],
    bullets: { count: 12, interval: 1400, speed: 38, label: '¡Ilusiones!', glitch: true, pool: ['oro', 'inam', 'anul', 'is', 'on', 'edis', 'ojé', 'zul'] },
    onWin(scene, { first, pages }) {
      if (!first) return;
      pages.push('* Moonside se desvanece como un sueño...', '* (Allá en Onett, alguien quitó una barricada.)');
    },
  },
  ebstarman: {
    ...EB_BASE,
    name: 'Starman', sprite: 'eb_starman', hp: 150, atk: 6, def: 5, xp: 55, fightWords: 5, ebBg: EB_BGS.starman,
    words: ['estrella', 'espacio', 'metal', 'nave', 'láser', 'órbita', 'cósmico', 'planeta', 'galaxia', 'invasión', 'brillante', 'señal', 'mensaje'],
    blurb: 'Un soldado de Giygas de metal dorado. No tiene cara. Ni sentido del humor.', keysHint: 'Palabras espaciales con acento',
    intro: '* ¡Te enfrentas a un Starman!\n* Brilla como espejo. No tiene cara.',
    check: '* STARMAN - ATQ 6 DEF 5\n* Los Starman trabajan para Giygas.\n* Hay de muchos tipos: Super, Deluxe... y el Final, en la Cueva del Pasado.',
    idle: ['* El Starman flota sin hacer ruido.', '* Te ves reflejado en su cabeza de metal.', '* BIT: ¿Y si le hago cosquillas? ...No tiene dónde.'],
    calm: '* El Starman titubea. Eso no venía en sus órdenes.',
    taunts: ['...', '¡OBEDECE A GIYGAS!', 'bip... bip...'],
    acts: [
      { name: 'Espejo', text: 'te peinas en su cabeza de espejo', mercy: 40, reply: '* "...Nadie había usado mi cabeza de espejo." Le gustó.' },
      { name: 'Preguntar', text: 'le preguntas si es feliz', mercy: 40, reply: '* "...Error. Pregunta no reconocida."\n* Se queda pensando.' },
      { name: 'Saludar', text: 'saludas a su nave con la mano', mercy: 30, reply: '* El Starman te devuelve el saludo. Sin querer.' },
    ],
    bullets: { count: 11, interval: 1050, speed: 38, pool: ['bip', 'luz', 'rayo', 'nave', 'metal', 'zum', 'sol', 'astro'] },
  },
  ebpokey: {
    ...EB_BASE,
    name: 'Pokey', sprite: 'eb_pokey', hp: 130, atk: 6, def: 3, xp: 50, fightWords: 5, ebBg: EB_BGS.pokey,
    words: ['vecino', 'gordito', 'presumido', 'chismoso', 'cobarde', 'mentira', 'galletas', 'papá', 'hermano', 'quejarse', 'trampa', 'berrinche'],
    blurb: 'El vecino de Ness. En Japón se llama Porky. Siempre se mete donde no lo llaman.', keysHint: 'Aguanta sus berrinches',
    intro: '* ¡Pokey se mete en tu camino!\n* "¡Oye, yo llegué primero! ¡Esta aventura es MIA!"',
    check: '* POKEY - ATQ 6 DEF 3\n* El vecino de Ness. En Japón: Porky.\n* Hace trampa. Siempre.',
    idle: ['* Pokey se queja de que tiene hambre.', '* Pokey dice que su papá es más fuerte que el tuyo.', '* Pokey se esconde detrás de Bit. Bit no lo deja.'],
    calm: '* Pokey hace un puchero.',
    taunts: ['¡Mi papá te va a demandar!', '¡No es justo!', '¡Yo vi el meteorito primero!'],
    acts: [
      { name: 'Galleta', text: 'le das tu última galleta', mercy: 35, reply: '* "...¿Para mí? ¡Ñam! ...No creas que ya somos amigos."' },
      { name: 'Picky', text: 'le dices que su hermano lo busca', mercy: 35, reply: '* "¿Picky? ¡Ese chismoso!" Se distrae.' },
      { name: 'Paciencia', text: 'esperas a que se le pase el berrinche', mercy: 35, reply: '* Pokey patalea... patalea... y se cansa.' },
    ],
    bullets: { count: 11, interval: 1100, speed: 36, pool: ['bu', 'mío', 'papá', 'nah', 'ja', 'mamá', 'no', 'pff'] },
    onWin(scene, { pages }) {
      pages.push('* POKEY: ¡Ya verás! ¡Le voy a decir a... a alguien MUY poderoso!\n* (Pokey se fue corriendo hacia la cueva.)');
    },
  },
  giygas: {
    ...EB_BASE,
    name: 'Giygas', sprite: 'eb_maquina', boss: true, mode: 'giygas', music: 'eb_giygas', ebBg: EB_BGS.giygas1, wobble: true,
    hp: 300, hp2: 100, atk: 6, atk2: 6, def: 5, xp: 150, fightWords: 6,
    words: ['máquina', 'diablo', 'oscuridad', 'cósmico', 'destructor', 'profecía', 'universo', 'pasado', 'futuro', 'amistad', 'valor',
      'sabiduría', 'meteorito', 'eterno', 'pesadilla', 'leyenda', 'esperanza', 'corazón'],
    blurb: '¡JEFE SECRETO! Giygas, el destructor cósmico universal.', keysHint: 'Primero pelea. Después... REZA.',
    intro: '* Al fondo de la cueva late una máquina enorme.\n* ¡La Máquina del Diablo! Adentro está... GIYGAS.',
    check: '* GIYGAS (MAQUINA DEL DIABLO) - ATQ 6 DEF 5\n* Pokey la cuida. Mientras la máquina siga prendida,\n* Giygas está encerrado... y tus golpes sí le llegan.',
    idle: ['* POKEY: ¡Ja! ¡Esta máquina es lo máximo!', '* La máquina zumba. Algo adentro respira.', '* BIT: Esto... no me gusta nada. Pero aquí estoy.', '* GIYGAS: ...Ness...'],
    calm: '* La máquina tiembla.',
    taunts: ['...Ness...', '¡JA JA JA! (Pokey)', '...d-duele...'],
    acts: [{ name: 'Valor', text: 'te acuerdas de la sabiduría, el valor y la amistad', mercy: 0, reply: '* Sabiduría, valor y amistad. Lo que dijo Buzz Buzz.\n* (Te sientes más valiente. Pero la máquina no se rinde.)' }],
    bullets: { count: 10, interval: 1600, speed: 40, label: '¡La máquina dispara!', wobble: 18, pool: ['ness', 'duele', 'pokey', 'ja', 'oscuro', 'yo', 'tú', 'no'] },
    bullets2: { count: 10, interval: 1900, speed: 42, label: 'No puedes comprender este ataque', wobble: 36, glitch: true, pool: ['ness', 'duele', 'amigo', 'solo', 'bien', 'frío', 'yo', 'tú', 'paula', 'feliz', 'triste', 'ness...'] },
    onWin(scene, { first, pages }) {
      pages[0] = '* Giygas se deshizo en la oscuridad.\n* ...La Tierra se salvó.';
      if (!first) return;
      Save.data.flags.ebGiygas = true;
      pages.push('* BIT: ...Lo logramos. LO LOGRAMOS.\n* Tu nombre ya es parte de la leyenda. ¡De verdad!');
    },
  },
});

// La Máquina del Diablo se apaga: lo que pasa entre la fase 1 y la 2.
const EB_STAGE1_END = [
  '* La Máquina del Diablo echa chispas...',
  '* POKEY: ¡¿Ah, sí?! ¡Pues la APAGO!\n* ¡A ver qué hacen contra Giygas DE VERDAD!',
];
const EB_STAGE2_PAGES = [
  '* Pokey apagó la Máquina del Diablo.\n* Giygas quedó suelto. Ya no tiene forma.',
  '* GIYGAS: ...Ness... Ness... Ness...',
  '* No puedes comprender la verdadera forma del ataque de Giygas.',
  '* PAULA: ¡Los golpes no le hacen nada!\n* Hay que REZAR. Yo empiezo... ¡ayúdame a escribir!',
];
// Las 8 oraciones de Paula. Llegan a la gente en el mismo orden que en el juego; la octava se la traga
// la oscuridad. La novena es la tuya (con tu nombre).
const EB_PRAY_ERR = 3;
const EB_PRAYERS = [
  { text: 'por favor, danos fuerza', reach: '* La oración de Paula llegó hasta Onett...\n* ...a la mamá de Ness.', line: '* MAMA DE NESS: ¡Ness, hijo! Cuídate mucho.\n* Te estoy esperando en casa.' },
  { text: 'que alguien escuche mi oración', reach: '* La oración llegó hasta los Runaway Five.', line: '* LUCKY: ¡Esto merece una canción!\n* (La tocan bajito. Para no despertar a nadie.)' },
  { text: 'papá, mamá, ayúdenme a ser valiente', reach: '* La oración llegó hasta Twoson...\n* ...al papá de Paula.', line: '* PAPA DE PAULA: ¡Paula! Papá está rezando contigo.' },
  { text: 'que mi voz atraviese la oscuridad', reach: '* La oración llegó hasta Winters...\n* ...a Tony, el mejor amigo de Jeff.', line: '* TONY: ¡Jeff! ¡Sé que puedes!\n* ...Te guardé tu cama en el internado.' },
  { text: 'aunque esté muy lejos, sé que me oyen', reach: '* La oración llegó hasta Dalaam...\n* ...a una muchacha del palacio.', line: '* MUCHACHA DE DALAAM: Príncipe Poo...\n* Regresa con bien, por favor.' },
  { text: 'todos mis amigos están conmigo hoy', reach: '* La oración llegó otra vez a Onett...\n* ...a Frank, el jefe de los Sharks.', line: '* FRANK: ¡Échale ganas, Ness!\n* ...No le digan a nadie que dije eso.' },
  { text: 'que la luz llegue a cada rincón del mundo', reach: '* La oración llegó hasta Saturn Valley...\n* ...¡a TODOS los Mr. Saturn!', line: '* MR. SATURN: ¡Boing! ¡Ding! ¡Zoom!\n* (Todos rezan. A su manera.)' },
  { text: '¿alguien me escucha? ¡por favor, danos fuerza!', reach: '* La oración de Paula...', line: '* ...fue tragada por la oscuridad.\n* Pero Giygas se tambalea. ¡Algo le pasa!' },
];
const EB_FINAL_PAGES = [
  '* POKEY: ¡No, no, NO! ¡Esto no es justo!\n* (Pokey huye. Ni se despide.)',
  '* La oración de Paula y sus amigos sigue viajando...\n* ...lejos, muy lejos. Más allá de la pantalla.',
];
const EB_GIYGAS_TAUNTS = ['...Ness...', 'D-duele, Ness...', '...a... mi... gos...', 'Ness, Ness, Ness...', '...no está bien... no está bien...', '...f... e... l... i... z...'];
const EB_POKEY_TAUNTS = ['¡Ja! ¡Ríndete, Ness!', '¡Giygas es invencible!', '¡Mi papá ni se va a enterar!'];
const EB_GIYGAS_IDLE = [
  '* GIYGAS: ...Ness... me siento... b... i... e... n...',
  '* El rojo da vueltas y vueltas. No tiene principio ni fin.',
  '* POKEY: ¡Ja ja! ¡Nadie le puede ganar a Giygas!',
  '* PAULA: ¡Sigue rezando! ¡Ya casi!',
  '* JEFF y POO te cuidan la espalda. Ness aprieta su bate.',
];
const EB_AYUDA = [
  '* BIT: ¡REZAR! Paula reza y tú escribes su oración.\n* Máximo 3 errores... ¡y rápido!',
  '* BIT: Fíjate en tu HP: si rueda hacia cero, come una Hamburguesa\n* antes de que llegue. ¡El odómetro te da tiempo!',
  '* BIT: Cada oración llega a alguien. Cuando lleguen todas... falta una.',
];
const EB_GIYGAS_END = (N) => [
  '* GIYGAS: ...Ness... me siento... b... i... e... n...',
  `* La oración de ${N} atravesó la oscuridad.\n* Giygas ya no tenía a dónde huir.`,
  '* ...Y entonces, todo se puso blanco.',
];

// ---------- Fotos ----------
const EB_FOTOS = {
  meteorito: { name: 'El meteorito de Onett', bg: '#3c2c48', who: ['eb_buzz', 'eb_meteorito'] },
  runaway: { name: 'Con los Runaway Five', bg: '#3864d0', who: ['eb_lucky', 'eb_gorgeous'] },
  saturno: { name: 'Campamento Mr. Saturn', bg: '#98d070', who: ['eb_saturn', 'eb_saturn'] },
  moonside: { name: 'Bienvenido a Moonside', bg: '#141018', who: ['eb_moonvecino', 'eb_moonhombre'] },
  pasado: { name: 'Los cuatro y tú', bg: '#702020', who: ['eb_ness', 'eb_paula', 'eb_jeff', 'eb_poo'] },
};

// ---------- Zonas ----------
// Onett:
//   h colina  k cráter  R/U techo rojo/azul  W pared  w ventana  d puerta (cerrada)  O puerta del café (a Moonside)
//   F cerca  b c autobús de los Runaway Five  B barricada (se quita al vencer a Mani-Mani)  C cueva  # roca  S letrero
const EB_ONETT_MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'Thhh..*.......kkk........*.hhhhT',
  'Thh.......*...kkk............hhT',
  'Th.RRRR........:.......UUUU...hT',
  'T..RRRR........:.......UUUU....T',
  'T..WdwW........:.......WwdW....T',
  'T........*..S..:..*..........k.T',
  'T..............:...............T',
  'TTTTTTTTTTTTTTT:TTTTTTTTTTTTTTTT',
  'TRRRR.UUUURRRR.:TUUUUTRRRRTUUUUT',
  'TRRRR.UUUURRRR.:TUUUUTRRRRTUUUUT',
  'TWdwW.WwdWwdwWS:TWdwWTwwwWTWOwWT',
  'T::::::::::::::::::::::::::::::T',
  'TUUUU.*........:TFFFFFFFFFFFFFFT',
  'TUUUU...bc.*...:TTTTTTTTTTTTTTTT',
  'TWwdW.......*..:TTTTTTTTTTTTTTTT',
  'TTTTT.TTTTTTTTT:TTTTTTTTTTTTTTTT',
  'T........*.TTTTBTTTTTTTTTTTTTTTT',
  'T.*........TTTT:#TTTTTTTTTTTTTTT',
  'T..........TTTT:T#TTTTTTTTTTTTTT',
  'T..........TTTT:#TTTTTTTTTTTTTTT',
  'T.......*..TTTT:TTTTTTTTTTTTTTTT',
  'Th..*.....hTTT#C#TTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];
// Sin barricada (después de vencer a Evil Mani-Mani).
const EB_ONETT_ABIERTO = EB_ONETT_MAP.map((r, y) => (y === 17 ? `${r.slice(0, 15)}:${r.slice(16)}` : r));

// Moonside:  M edificio con orilla de neón  n letrero de neón  : calle  . banqueta
const EB_MOONSIDE_MAP = [
  'MMMMMMMMMMMMMMMMMMMMMMMM',
  'M...................MMMM',
  'M:::::::::::::::::::::MM',
  'M...................M:MM',
  'M.....n......n......M:MM',
  'M...............n...M:MM',
  'M...................M:MM',
  'MMMMMMMMMMMMMMMMMMMMM:MM',
  'MMMMMMMMMMMMMMMMMMMMM:MM',
  'MMMMnMMMMnMMMMnMMMMMM:MM',
  'MMMMMMMMMMMMMMMMMMMMM:MM',
  'MMMMMMMMMMMMMMMMMMMMM:MM',
  'M....................:MM',
  'M::::::::::::::::::::::M',
  'M......................M',
  'MMMMMMMMMMMMMMMMMMMMMMMM',
];

// Cueva del Pasado:  # roca que late  . piso
const EB_PASADO_MAP = [
  '######################',
  '######################',
  '######################',
  '##.......#...#########',
  '#.............########',
  '#.............######.#',
  '#................###.#',
  '#....................#',
  '#................###.#',
  '#.............######.#',
  '#.............########',
  '##...#.......#########',
  '######################',
  '######################',
  '######################',
];

const ebT = (s, extra = {}) => ({ s, ...extra });
function ebAddMaps(maps) {
  Object.entries(maps).forEach(([id, m]) => { MAPS[id] = Object.assign(m, { id, world: 'snes' }); });
}
const EB_ONETT_TILES = {
  '.': ebT('eb_pasto'),
  '*': ebT('eb_flores'),
  ':': ebT('eb_calle'),
  T: ebT('eb_arbol', { solid: true, look: 'arbol' }),
  h: ebT('eb_colina', { solid: true, look: 'colina' }),
  k: ebT('eb_crater', { look: 'crater' }),
  R: ebT('eb_techo', { solid: true }),
  U: ebT('eb_techoazul', { solid: true }),
  W: ebT('eb_pared', { solid: true, look: 'pared' }),
  w: ebT('eb_ventana', { solid: true, look: 'ventana' }),
  d: ebT('eb_puerta', { solid: true, look: 'puerta' }),
  O: ebT('eb_puerta'),
  F: ebT('eb_cerca', { solid: true, look: 'cerca' }),
  b: ebT('eb_bus1', { solid: true, under: 'eb_pasto', look: 'bus' }),
  c: ebT('eb_bus2', { solid: true, under: 'eb_pasto', look: 'bus' }),
  B: ebT('eb_barrera', { solid: true, look: 'barrera' }),
  C: ebT('eb_cueva'),
  '#': ebT('eb_roca', { solid: true, look: 'roca' }),
  S: ebT('sign', { solid: true, under: 'eb_pasto' }),
};

// Mr. Saturn habla con su letra especial (aquí, un estilo de texto propio).
async function ebSaturnSay(ctx, pages) {
  const box = $('.tbox');
  if (box) box.classList.add('eb-saturn-font');
  await ctx.say(pages, 'MR. SATURN');
  if (box) box.classList.remove('eb-saturn-font');
}

// Una plática que va rotando (como las de los NPC de los mundos).
const ebLines = (flag, lines, who) => async (ctx) => { await ctx.say(lines[ctx.counter(flag) % lines.length], who); };

const EB_BIT_ONETT = [
  '* ¡Mira cuántas casitas! Todo se ve como dibujado con crayolas.',
  '* Psst: aquí los enemigos se ven en el mapa. En EarthBound también.\n* ¡Nada de peleas sorpresa!',
  '* Si tu HP empieza a rodar hacia abajo... ¡no te espantes!\n* Rueda despacito. Gana o cómete algo antes de que llegue a cero.',
  '* ¿Ese señor de allá está cavando un hoyo? ¿En la colina?',
];

// Se agregan al mundo snes sin addMaps (addMaps cambiaría la entrada de su tubería).
ebAddMaps({
  'eb-onett': {
    name: 'Onett',
    theme: 'eb',
    music: 'eb_onett',
    ground: 'eb_pasto',
    map: EB_ONETT_MAP,
    tiles: EB_ONETT_TILES,
    variants: [{ when: () => !!Save.data.done.ebmanimani, map: EB_ONETT_ABIERTO }],
    spawns: { start: [15, 3, 'down'] },
    ebFotos: { '15,4': 'meteorito', '8,13': 'runaway', '5,18': 'saturno' },
    async intro(ctx) {
      await ctx.say([
        '* ...¿Dónde estamos? Huele a pasto... y a humo.',
        '* ¡Es ONETT! El pueblo de EarthBound.\n* Y ese meteorito... ¡es EL meteorito! ¡Cayó en la colina!',
      ], 'BIT');
      await findSecret('snes_earthbound', ctx);
    },
    exits: {
      '28,11': { map: 'eb-moonside', spawn: [2, 13, 'right'] },
      '15,22': { map: 'eb-pasado', spawn: [2, 7, 'right'] },
    },
    encounters: [
      { enemy: 'ebcuervo', x: 15, y: 8, say: ['* ¡Cra! ¡Esta bajada es MIA!\n* El que quiera bajar al pueblo, que me gane.'] },
      { enemy: 'ebhippie', x: 16, y: 12, say: ['* ¡Qué onda, hermano! Esta calle tiene muy buena vibra.\n* ...Tan buena que no te dejo pasar.'] },
      { enemy: 'ebstarman', x: 15, y: 18, say: ['* ...SER HUMANO DETECTADO.', '* GIYGAS ORDENA: NADIE ENTRA AL PASO GIGANTE.'] },
      { enemy: 'ebpokey', x: 15, y: 20, say: ['* ¡Oye! ¡Tú! ¡Yo vi el meteorito primero!', '* ¡Y la cueva también es MIA! ¡Mi papá dice!'] },
    ],
    signs: {
      '12,6': ['* COLINA DEL METEORITO\n* (Alguien escribió abajo: "¡NO TOCAR! — Pokey")', '* EarthBound salió en Japón como Mother 2 en 1994,\n* y en Estados Unidos en 1995.'],
      '14,11': ['* ONETT\n* "El pueblo de los meteoritos" (desde anoche).'],
      '4,5': '* La casa de Ness. Se oye a su mamá:\n* "¡Ness! ¡Lleva tu gorra!"',
      '25,5': '* La casa de los Minch.\n* Adentro, alguien grita: "¡¡POKEEEY!!"',
      '2,11': '* FARMACIA DE ONETT.\n* Venden gorras, yoyos y bates de béisbol. Lo normal en una farmacia.',
      '8,11': '* HAMBURGUESAS.\n* "Hoy: hamburguesa con meteorito." (Es broma. Es catsup.)',
      '11,11': '* BIBLIOTECA PUBLICA DE ONETT.\n* Silencio, por favor. Shhh.',
      '18,11': '* ARCADE DE ONETT.\n* Las maquinitas hacen bip-bip.',
      '28,11': '* JACKIE\'S CAFE\n* (En el juego de verdad está en Fourside. ¡Y detrás del mostrador empieza Moonside!)',
      '3,15': '* POLICIA DE ONETT.\n* Un letrero dice: "Hoy: barricadas. Mañana: más barricadas."',
    },
    looks: {
      arbol: '* Un árbol redondo, como de crayola.',
      colina: '* Una lomita de pasto. Desde aquí se ve todo Onett.',
      crater: '* Tierra quemada. Todavía está tibia.',
      pared: '* Una pared clarita. Muy de pueblo.',
      ventana: '* Por la ventana se ve una tele prendida. Pasan un programa de meteoritos.',
      puerta: '* Está cerrado. Aquí todos duermen temprano... menos los meteoritos.',
      cerca: '* Una cerca blanca, recién pintada.',
      bus: '* El autobús de gira de los Runaway Five.\n* Tiene una calcomanía: "DEBEMOS DINERO. TOQUE EL CLAXON."',
      barrera: () => (Save.data.done.ebmanimani ? '* Ya no hay barricada.' : '* Una barricada de la policía. No hay forma de pasar.\n* Ni apretándote. Lo intentaste, ¿verdad?'),
      roca: '* Una roca gris. Por aquí empieza el Paso Gigante.',
    },
    bitTips: EB_BIT_ONETT,
    npcs: [
      {
        id: 'eb-meteorito', sprite: 'eb_meteorito', x: 15, y: 1, cls: 'eb-humo',
        async talk(ctx) {
          await ctx.say(['* El meteorito sigue humeando.\n* Si lo tocas, regresas a Dinosaur Land.']);
          if (await ctx.choose(['tocar', 'quedarme']) !== 0) return;
          Sfx.warp();
          Game.go('town', { map: 'snes-colinas', spawn: [37, 3, 'left'] });
        },
      },
      {
        id: 'eb-buzz', sprite: 'eb_buzz', x: 13, y: 2,
        async talk(ctx) {
          if (!ctx.flag('ebBuzz')) {
            ctx.setFlag('ebBuzz');
            await ctx.say([
              '* Una abeja no soy... Soy BUZZ BUZZ.\n* Vengo de 10 años en el futuro.',
              '* Allá, Giygas, el destructor cósmico universal, lo dejó todo en la oscuridad.\n* Pero una leyenda habla de tres niños y una niña que lo derrotan.',
            ], 'BUZZ BUZZ');
            if (!secretFound('snes_earthbound')) await findSecret('snes_earthbound', ctx);
            return;
          }
          await ctx.say([rand([
            '* Tres cosas son lo más importante: sabiduría, valor y amistad.',
            '* Busca al niño de la gorra. Vive en la casa de la izquierda.',
            '* El camino a Giygas pasa por una ilusión... y por el Paso Gigante.',
          ])], 'BUZZ BUZZ');
        },
      },
      {
        id: 'eb-pokeycolina', sprite: 'eb_pokey', x: 17, y: 3, when: () => !Save.data.done.ebpokey,
        talk: ebLines('ebPokeyColina', [
          ['* ¡Oye! ¡Yo vi el meteorito primero!\n* Tú solo lo viste segundo. O tercero.'],
          ['* Mi papá dice que este meteorito vale un MILLON.\n* Y que es nuestro. Porque sí.'],
          ['* ¿Qué me ves? ¡Estoy cuidando el meteorito!\n* ...Bueno, me estoy escondiendo. Da miedo.'],
        ], 'POKEY'),
      },
      {
        id: 'eb-ness', sprite: 'eb_ness', x: 5, y: 6,
        async talk(ctx) {
          if (!ctx.flag('ebNess')) {
            await ctx.say([
              '* ¡Hola! Soy NESS. ¿Tú también viste caer el meteorito?',
              '* Una abeja del futuro dice que hay que detener a Giygas.\n* ...¿Vienes conmigo? Traigo mi bate.',
            ], 'NESS');
            if (await ctx.choose(['vamos', 'luego']) !== 0) { await ctx.say(['* Aquí te espero. Me voy a amarrar los tenis.'], 'NESS'); return; }
            ctx.setFlag('ebNess');
            Sfx.secret();
            await ctx.say(['* ¡NESS se unió al equipo!\n* (En las peleas, después de tu combo, Ness batea.)'], '');
            return;
          }
          await ctx.say([rand([
            '* Mi PSI favorito se llama "Rockin". Así se llamaba en el juego si no le cambiabas el nombre.',
            '* ¿Sabías que en EarthBound los bates y los yoyos se compran en la farmacia? Qué pueblo tan raro.',
            '* Mi papá nunca está en casa, pero siempre llama por teléfono. Y me deposita dinero.',
          ])], 'NESS');
        },
      },
      { id: 'eb-king', sprite: 'eb_king', x: 7, y: 6, talk: (ctx) => ctx.say(['* KING, el perro de Ness, está dormido.\n* ...Zzz. Hasta los meteoritos le dan flojera.']) },
      {
        id: 'eb-picky', sprite: 'eb_picky', x: 24, y: 6,
        talk: ebLines('ebPicky', [
          ['* Soy Picky, el hermano de Pokey.\n* Pokey se escapó otra vez. Mi mamá está furiosa.'],
          ['* Pokey dice que es muy valiente.\n* Pero anoche se escondió detrás de mí.'],
        ], 'PICKY'),
      },
      {
        id: 'eb-lier', sprite: 'eb_lier', x: 28, y: 6,
        talk: ebLines('ebLier', [
          ['* Soy Lier X. Agerate. Estoy cavando por un tesoro... uno ENORME.', '* Ya encontré uno: una estatua dorada.\n* Un señor insistió tanto en comprarla, que se la vendí.'],
          ['* Dicen que esa estatua se llama Mani Mani... y que crea ilusiones.\n* ¡Yo ya sabía! (No sabía.)'],
          ['* Voy a comer ajo y hacer ejercicio para cavar más fuerte.\n* Tú vete a tu casa. Estorbas.'],
        ], 'LIER X. AGERATE'),
      },
      {
        id: 'eb-biblio', sprite: 'eb_biblio', x: 12, y: 13,
        talk: ebLines('ebBiblio', [
          ['* Shhh. Bienvenido a la biblioteca de Onett.\n* En el juego de verdad, aquí te regalaban el MAPA DEL PUEBLO.'],
          ['* Shhh. ¿Un libro de meteoritos? Se lo llevó un niño gordito.\n* No lo ha devuelto. Nunca devuelve nada.'],
        ], 'BIBLIOTECARIA'),
      },
      {
        id: 'eb-lucky', sprite: 'eb_lucky', x: 7, y: 14,
        async talk(ctx) {
          if (!ctx.flag('ebRunaway')) {
            ctx.setFlag('ebRunaway');
            await ctx.say([
              '* ¡Somos los RUNAWAY FIVE! Yo soy Lucky, el de junto es Gorgeous.\n* (Nice, Groovy y Okay están en el autobús.)',
              '* Siempre andamos endeudados. En Twoson, en el Chaos Theater,\n* Ness nos pagó la deuda. ¡Y lo llevamos por el túnel hasta Threed!',
            ], 'LUCKY');
          }
          if (await ctx.choose(['cantar', 'adiós'], 'LUCKY') !== 0) { await ctx.say(['* ¡Aquí andaremos! Tocando... y debiendo.'], 'LUCKY'); return; }
          Music.play('eb_runaway');
          await ctx.say(['* ¡A-uno, a-dos, a-uno-dos-tres!\n* ¡Canta el coro con nosotros!'], 'GORGEOUS');
          const text = ebSigns(rand(['debemos la renta del teatro', '¡qué bonito es andar de gira!', 'tocamos jazz hasta el amanecer', 'el claxon suena, ¡bip bip!']));
          const res = await ctx.challenge({ label: 'Canta el coro:', texts: [text], timeLimit: text.length * 520 + 1500, strict: true });
          await ctx.say([res.completed
            ? (res.errors ? '* ¡Bien! Desafinaste poquito. Como nosotros.' : '* ¡PERFECTO! Te quedas en la banda. ...Bueno, no. Pero casi.')
            : '* ¡Se acabó la canción! No pasa nada: el público ni se dio cuenta.'], 'GORGEOUS');
          Music.play('eb_onett');
        },
      },
      {
        id: 'eb-gorgeous', sprite: 'eb_gorgeous', x: 10, y: 14,
        talk: ebLines('ebGorgeous', [
          ['* Dato: los fantasmas del túnel a Threed no soportan nada alegre.\n* Por eso nosotros pasamos tocando, ¡y todos se fueron!'],
          ['* En Fourside volvimos a deber, ahora en el Topolla Theater.\n* Ness pagó con un diamante. ¡UN DIAMANTE!'],
        ], 'GORGEOUS'),
      },
      {
        id: 'eb-strong', sprite: 'eb_strong', x: 14, y: 15,
        async talk(ctx) {
          if (Save.data.done.ebmanimani) {
            await ctx.say(['* Bueno, bueno. Ya quité la barricada.\n* Pero no le digas a nadie. Tengo una reputación.'], 'CAPTAIN STRONG');
            return;
          }
          await ctx.say(ctx.counter('ebStrong') % 2 === 0
            ? ['* ¡ALTO! Soy Captain Strong, jefe de la policía de Onett.\n* Nadie pasa al Paso Gigante.', '* Pasan cosas raras en el café: dicen que la gente entra... y sale al revés.\n* Hasta que eso se arregle, ¡barricada!']
            : ['* Como dicen por aquí: ¡Onett es famoso por sus barricadas!'], 'CAPTAIN STRONG');
        },
      },
      {
        id: 'eb-saturn1', sprite: 'eb_saturn', x: 3, y: 19,
        async talk(ctx) {
          const n = ctx.counter('ebSaturn1');
          if (n % 3 === 2) {
            await ebSaturnSay(ctx, ['* ¡Ding! ¿Tú quieres jugar? Escribe como yo. ¡Boing!']);
            const text = 'boing zoom ding';
            const res = await ctx.challenge({ label: 'Habla como Mr. Saturn:', texts: [text], timeLimit: text.length * 600 + 1500 });
            await ebSaturnSay(ctx, [res.completed ? '* ¡Oh, tú gracias! ¡Ding zoom! Tú hablas bonito.' : '* Kay-o. Otro día. Zoom.']);
            return;
          }
          await ebSaturnSay(ctx, [[
            '* Hola hola hola. ¿Tú vienes comprando?\n* Nosotros no vendemos. ¡Boing!',
            '* ¿Qué tú quieres, zoom?\n* Nosotros venimos de Saturn Valley de visita. Ding.',
          ][n % 3]]);
        },
      },
      {
        id: 'eb-saturn2', sprite: 'eb_saturn', x: 7, y: 20,
        async talk(ctx) {
          await ebSaturnSay(ctx, [rand([
            '* Dato. La letra de nosotros, en Japón, la sacaron de la letra de la hijita de Itoi. ¡Zoom!',
            '* Kay-o. Tú respiras. Nosotros respiramos. Todos respiramos. ¡Ding!',
            '* Gracias. ¡Boing! ...¿Por qué gracias? No sé. ¡Boing!',
          ])]);
        },
      },
    ],
  },

  'eb-moonside': {
    name: 'Moonside',
    theme: 'moonside',
    music: 'eb_moonside',
    ground: 'eb_moonpiso',
    map: EB_MOONSIDE_MAP,
    tiles: {
      '.': ebT('eb_moonpiso'),
      ':': ebT('eb_mooncalle'),
      M: ebT('eb_moonmuro', { solid: true, look: 'muro' }),
      n: ebT('eb_moonletrero', { solid: true, look: 'letrero' }),
    },
    spawns: { start: [2, 13, 'right'] },
    ebFotos: { '10,4': 'moonside' },
    intro: [
      '* ¿¡Qué pasó!? ¡Todo es negro y de neón!',
      '* Esto es MOONSIDE. Una ilusión de la estatua Mani Mani.\n* Aquí todo es al revés. ¡Hasta las peleas!',
    ],
    encounters: [
      { enemy: 'ebarte', x: 21, y: 8, say: ['* ¡Odinevneib! ...Digo: ¡bienvenido!', '* Para pasar, admira mi arte. AL REVES.'] },
      { enemy: 'ebmanimani', x: 3, y: 4, say: ['* ...', '* INAM INAM. Moonside es MIO.\n* Si quieres salir... rómpeme la ilusión.'] },
    ],
    signs: {},
    looks: {
      muro: '* Un edificio negro con orillas de neón.\n* Las ventanas parpadean en otro orden cada vez.',
      letrero: () => rand(['* El letrero dice: "EDISNOOM". Al revés dice... "MOONSIDE".', '* El letrero dice: "ABIERTO". O sea, cerrado.', '* "BIENVENIDO A MOONSIDE". Las letras cambian de color solas.']),
    },
    bitTips: [
      '* Aquí "sí" es "no" y "no" es "sí".\n* ...Así que NO me gusta este lugar. O sea, SI. Ay, ya me confundí.',
      '* ¡Las peleas son AL REVES! Empieza por la última letra.\n* "luna" se escribe a-n-u-l.',
      '* Si vencemos a la estatua dorada, la ilusión se acaba.',
    ],
    npcs: [
      {
        id: 'eb-moonsalida', sprite: 'eb_moonhombre', x: 2, y: 12,
        async talk(ctx) {
          if (!ctx.flag('ebMoonRegla')) {
            ctx.setFlag('ebMoonRegla');
            await ctx.say(['* Bienvenido a Moonside.', '* Aquí "sí" es "no" y "no" es "sí".\n* Tiene todo el sentido en Moonside.'], 'HOMBRE DE MOONSIDE');
          }
          await ctx.say(['* ¿Quieres quedarte en Moonside para siempre?'], 'HOMBRE DE MOONSIDE');
          const i = await ctx.choose(['sí', 'no'], 'HOMBRE DE MOONSIDE');
          if (i === 1) {
            await ctx.say(['* ¿No? O sea... ¡SI! ¡Bienvenido a Moonside!\n* (Te quedas. "No" quería decir "sí".)'], 'HOMBRE DE MOONSIDE');
            return;
          }
          await ctx.say(['* ¿Sí? O sea... ¡NO! Adiós. Hola. Adiós.'], 'HOMBRE DE MOONSIDE');
          Sfx.warp();
          Game.go('town', { map: 'eb-onett', spawn: [28, 12, 'down'] });
        },
      },
      { id: 'eb-moon1', sprite: 'eb_moonvecino', x: 7, y: 12, talk: (ctx) => ctx.say(['* Bienvenido a Moonside.'], 'VECINO') },
      { id: 'eb-moon2', sprite: 'eb_moonvecino', x: 13, y: 14, talk: (ctx) => ctx.say(['* Bien ve ni doa Moo nsi de.'], 'VECINO') },
      { id: 'eb-moon3', sprite: 'eb_moonhombre', x: 17, y: 12, talk: (ctx) => ctx.say(['* Venidobien a Sidemoon. Moonbien da venido.'], 'VECINO') },
      {
        id: 'eb-moon4', sprite: 'eb_moonvecino', x: 15, y: 3,
        async talk(ctx) {
          if (Save.data.done.ebmanimani) { await ctx.say(['* ...¿Despierto? Creo que ya no estoy en Moonside.\n* Pero me gustaba. Un poquito. Al revés.'], 'VECINO'); return; }
          await ctx.say(['* Psst. La estatua dorada vino de Onett.\n* Un señor que cava hoyos la encontró. ¡Y la vendió!'], 'VECINO');
        },
      },
    ],
  },

  'eb-pasado': {
    name: 'Cueva del Pasado',
    theme: 'pasado',
    music: 'eb_pasado',
    ground: 'eb_pasadopiso',
    map: EB_PASADO_MAP,
    tiles: {
      '.': ebT('eb_pasadopiso'),
      '#': ebT('eb_pasadomuro', { solid: true, look: 'muro' }),
    },
    spawns: { start: [2, 7, 'right'] },
    ebFotos: { '8,6': 'pasado' },
    intro: [
      '* La cueva... late. Como si estuviera viva.',
      '* En EarthBound, Ness y sus amigos llegaban aquí... ¡en cuerpos de ROBOT!\n* Nosotros venimos así nomás. Con suerte.',
    ],
    exits: { '1,7': { map: 'eb-onett', spawn: [15, 21, 'up'] } },
    encounters: [
      { enemy: 'giygas', x: 18, y: 7, say: ['* ...Ness...', '* ...Ness... Ness... Ness...'] },
    ],
    looks: { muro: '* La pared es tibia. Se mueve tantito, como si respirara.' },
    bitTips: [
      '* Tengo miedo. ...Pero no me voy. Somos un equipo.',
      '* Paula dice que, cuando los golpes no sirvan, hay que rezar.',
      '* Fíjate en la ruedita de tu HP. Si baja, ¡come algo antes de que llegue a cero!',
    ],
    npcs: [
      {
        id: 'eb-paula', sprite: 'eb_paula', x: 6, y: 4,
        talk: (ctx) => ctx.say([Save.data.flags.ebGiygas
          ? '* Lo logramos... gracias a TI. Tu nombre llegó hasta aquí.'
          : '* Soy PAULA, de Twoson. Puedo sentir lo que piensa la gente.\n* Allá adentro está Giygas. Si los golpes no sirven... voy a rezar. Y tú me ayudas.'], 'PAULA'),
      },
      {
        id: 'eb-jeff', sprite: 'eb_jeff', x: 8, y: 4,
        talk: (ctx) => ctx.say([Save.data.flags.ebGiygas
          ? '* Voy a arreglar todas las cosas rotas que dejó Giygas. Es lo mío.'
          : '* Soy JEFF. No tengo poderes PSI, pero arreglo cosas y tengo cohetes de botella.\n* ...Tony dice que soy valiente. Espero que tenga razón.'], 'JEFF'),
      },
      {
        id: 'eb-poo', sprite: 'eb_poo', x: 10, y: 4,
        talk: (ctx) => ctx.say([Save.data.flags.ebGiygas
          ? '* En Dalaam contarán esta historia por mil años. Contigo en ella.'
          : '* Soy POO, príncipe de Dalaam.\n* Mi maestro dice: el miedo también se entrena. Respira.'], 'POO'),
      },
      {
        id: 'eb-nesscueva', sprite: 'eb_ness', x: 4, y: 9,
        async talk(ctx) {
          if (Save.data.flags.ebGiygas) { await ctx.say(['* ¡Lo hicimos! Ya me quiero ir a casa. Mi mamá hizo cena.'], 'NESS'); return; }
          if (ctx.flag('ebNess')) { await ctx.say(['* Estoy listo. Tú escribe, yo bateo. ¡Vamos!'], 'NESS'); return; }
          // Si llegaste sin invitarlo en su casa, aquí se une.
          await ctx.say(['* ¡Hola! Soy NESS. Llegué solo... ¡pero llegué!\n* Tú escribe, yo bateo. ¿Va?'], 'NESS');
          ctx.setFlag('ebNess');
          Sfx.secret();
          await ctx.say(['* ¡NESS se unió al equipo!\n* (En las peleas, después de tu combo, Ness batea.)']);
        },
      },
    ],
  },
});

// ---------- Música ORIGINAL al estilo EarthBound ----------
// Nada de melodías de EarthBound ni de las canciones que citaba. Solo el estilo: bajo funky con
// "slap", golpes de metales sampleados, coros raros, eco de cinta y acordes de jazz. Un paso = semicorchea.
const EB_FX = { echo: { steps: 3, feedback: 0.28, mix: 0.16, tone: 2600 }, reverb: { time: 1.4, mix: 0.12 }, comp: true };
// Bajo funky: raíz, nota fantasma, octava y quinta (16 pasos por compás).
const ebFunk = (r) => `${r}/2! -/1 ${r}/1? ${ebUp(r, 12)}/2. ${r}/2 -/2 ${ebUp(r, 7)}/2 ${ebUp(r, 12)}/1 ${r}/1 -/2`;
// Golpes de metales a contratiempo.
const ebStab = (ch) => `-/2 ${ch}/2. -/4 ${ch}/2. -/2 ${ch}/2 -/2`;

Object.assign(TRACKS, {
  // Onett: pop funky en Fa con shuffle, 116 BPM. A A B A (32 compases, ~66 s).
  eb_onett: (() => {
    const melA = 'C5/2 F5/2 A5/3 G5/1 F5/2 C5/2 D5/2 F5/2 | A5/4 G5/2 F5/2 D5/6 -/2 | D5/2 F5/2 Bb5/3 A5/1 G5/2 F5/2 D5/2 F5/2 | G5/6 E5/2 C5/6 -/2 | ' +
      'C5/2 F5/2 A5/3 G5/1 A5/2 C6/2 A5/2 F5/2 | E5/4 A5/4 C6/4 B5/2 A5/2 | Bb5/3 A5/1 G5/2 F5/2 G5/3 A5/1 Bb5/2 G5/2 | F5/8 -/4 C5/2 E5/2';
    const melB = 'F5/2 D5/2 F5/2 Bb5/4 A5/2 G5/2 F5/2 | E5/2 G5/2 C6/4 Bb5/2 A5/2 G5/4 | A5/2 E5/2 A5/2 C6/4 B5/2 A5/2 E5/2 | F5/6 E5/2 D5/8 | ' +
      'D5/2 G5/2 Bb5/2 D6/4 C6/2 Bb5/2 G5/2 | C6/4 Bb5/2 A5/2 G5/4 E5/4 | F5/2 A5/2 C6/2 F6/4 E6/2 D6/2 C6/2 | Bb5/4 G5/4 E5/4 C5/4';
    const RA = ['F2', 'D2', 'Bb1', 'C2', 'F2', 'A1', 'Bb1', 'F2'];
    const RB = ['Bb1', 'C2', 'A1', 'D2', 'G1', 'C2', 'F2', 'C2'];
    const CH = { F2: 'F4+A4+C5', D2: 'D4+F4+A4', Bb1: 'D4+F4+Bb4', C2: 'E4+G4+C5', A1: 'E4+A4+C5', G1: 'D4+G4+Bb4' };
    const beat = 'k/2 h/2 s/2 h/1 k/1 k/2 h/2 s/2 h/2';
    const fill = 'k/2 h/2 s/2 h/1 k/1 s/1 s/1 t/2 t/1 T/1 T/2';
    // Coro "sampleado": dos golpecitos de voz al final de cada frase.
    const hey = `${rep('-/16', 3)} -/12 C5/2! F5/2 ${rep('-/16', 3)} -/8 A4/2. C5/2. F5/4!`;
    return {
      bpm: 116, swing: 0.18, vol: 1.2, fx: EB_FX, form: ['A', 'A', 'B', 'A'],
      voices: [
        { wave: 'flute', vol: 0.034, env: 'soft', vib: 'light', parts: { A: melA, B: melB } },
        { wave: 'brass', vol: 0.016, poly: true, env: 'stab', parts: { A: RA.map((r) => ebStab(CH[r])).join(' '), B: RB.map((r) => ebStab(CH[r])).join(' ') } },
        { wave: 'warmbass', vol: 0.085, env: 'pluck', fx: 0, parts: { A: RA.map(ebFunk).join(' '), B: RB.map(ebFunk).join(' ') } },
        { wave: 'vox', vol: 0.02, env: 'stab', parts: { A: hey, B: hey } },
        { wave: 'noise', vol: 0.028, kit: 'full', parts: { A: `${rep(beat, 7)} ${fill}`, B: `c+${rep(beat, 7)} ${fill}` } },
      ],
    };
  })(),

  // Batallas: rock psicodélico en Mi menor, 152 BPM, sinte que se tambalea (vibrato ancho). A B (16 compases).
  eb_batalla: (() => {
    const melA = 'E5/2 G5/2 B5/2 E6/2 D6/2 B5/2 G5/2 A5/2 | B5/6 A5/2 G5/2 F#5/2 E5/4 | E5/2 G5/2 C6/4 B5/2 A5/2 G5/4 | F#5/2 A5/2 D6/4 C6/2 A5/2 F#5/4 | ' +
      'E6/2 D6/2 B5/2 G5/2 E6/2 D6/2 B5/2 D6/2 | E6/8 -/4 B5/2 D6/2 | C6/2 B5/2 A5/2 G5/2 E5/2 G5/2 A5/2 C6/2 | B5/4 D#6/4 F#6/4 B5/4';
    const melB = 'A5/4 C6/4 E6/6 D6/2 | B5/4 G5/4 E5/8 | A5/2 C6/2 E6/2 A6/2 G6/2 E6/2 C6/2 E6/2 | D#6/6 F#6/2 B6/8 | ' +
      'G6/4 E6/4 C6/4 E6/4 | F#6/4 D6/4 A5/4 D6/4 | D#6/2 F#6/2 B6/2 A6/2 F#6/2 D#6/2 B5/2 A5/2 | B5/12 -/4';
    const RA = ['E2', 'E2', 'C2', 'D2', 'E2', 'E2', 'C2', 'B1'];
    const RB = ['A1', 'E2', 'A1', 'B1', 'C2', 'D2', 'B1', 'B1'];
    const CH = { E2: 'E4+G4+B4', C2: 'C4+E4+G4', D2: 'D4+F#4+A4', B1: 'D#4+F#4+B4', A1: 'C4+E4+A4' };
    const bass = (rs) => rs.map((r) => rep(`${r}/1 -/1 ${ebUp(r, 12)}/1 ${r}/1`, 4)).join(' ');
    const arp = (rs) => rs.map((r) => `${CH[r]}/8 ${CH[r]}/8`).join(' ');
    const beat = 'k/2 h/1 h/1 s/2 h/2 k/1 k/1 h/2 s/2 h/2';
    const fill = 'k/2 s/1 s/1 s/2 t/2 t/2 T/2 c+k/4';
    return {
      bpm: 152, vol: 1.2, fx: { ...EB_FX, echo: { steps: 2, feedback: 0.3, mix: 0.18 } }, form: ['A', 'B'],
      voices: [
        { wave: 'sawtooth', vol: 0.024, env: 'chip', vib: 'wide', filter: 3200, parts: { A: melA, B: melB } },
        { wave: 'square', vol: 0.012, arp: 0.035, arpMode: 'updown', env: 'soft', pan: 0.3, parts: { A: arp(RA), B: arp(RB) } },
        { wave: 'warmbass', vol: 0.085, env: 'pluck', fx: 0, parts: { A: bass(RA), B: bass(RB) } },
        { wave: 'vox', vol: 0.014, env: 'stab', pan: -0.4, parts: { A: `${rep('-/16', 3)} -/8 E5/2! -/2 B4/2! -/2 ${rep('-/16', 4)}`, B: `${rep('-/16', 3)} -/12 B4/2! D#5/2! ${rep('-/16', 4)}` } },
        { wave: 'noise', vol: 0.03, kit: 'full', parts: { A: `c+${rep(beat, 7)} ${fill}`, B: `c+${rep(beat, 7)} ${fill}` } },
      ],
    };
  })(),

  // Moonside: lounge de jazz chueco en Do menor, 96 BPM, con swing, vibráfono y todo desafinado. A B.
  eb_moonside: (() => {
    const melA = 'G5/3 Eb5/1 C5/4 -/2 D5/2 Eb5/4 | C6/3 Bb5/1 Ab5/4 Gb5/4 -/4 | F5/2 Ab5/2 C6/4 Bb5/2 Ab5/2 F5/4 | B4/4 D5/4 F5/4 Ab5/4 | ' +
      'G5/3 Eb5/1 C5/4 -/2 C6/2 B5/4 | Db6/4 C6/2 Ab5/2 F5/4 Db5/4 | D5/2 F5/2 Ab5/2 B5/2 D6/4 C6/2 B5/2 | G5/12 -/4';
    const melB = 'Bb5/4 G5/4 Eb5/4 G5/4 | C6/3 Ab5/1 Gb5/4 Eb5/8 | F5/2 Ab5/2 D6/4 C6/2 Ab5/2 F5/4 | G5/4 F5/2 D5/2 B4/8 | ' +
      'C5/2 Eb5/2 G5/2 C6/2 Eb6/4 D6/4 | C6/4 A5/4 F5/4 Eb5/4 | Eb5/2 Gb5/2 C6/4 Bb5/2 Ab5/2 Gb5/4 | G5/4 B5/4 D6/4 G6/4';
    const walk = (bars) => bars.map((b) => b.split(' ').map((n) => `${n}/4`).join(' ')).join(' ');
    const bA = ['C2 Eb2 G2 Bb2', 'Ab1 C2 Eb2 Gb2', 'F2 Ab2 C3 Ab2', 'G1 B1 D2 F2', 'C2 Eb2 G2 C3', 'Db2 F2 Ab2 F2', 'G1 B1 D2 F2', 'G2 F2 D2 B1'];
    const bB = ['Eb2 G2 Bb2 G2', 'Ab1 C2 Eb2 Gb2', 'D2 F2 Ab2 F2', 'G1 B1 D2 F2', 'C2 Eb2 G2 Eb2', 'F2 A2 C3 Eb3', 'Ab1 C2 Eb2 Gb2', 'G1 B1 D2 G2'];
    const pA = ['C4+Eb4+G4+Bb4', 'C4+Eb4+Gb4+Ab4', 'C4+Eb4+F4+Ab4', 'B3+D4+F4+G4', 'C4+Eb4+G4+Bb4', 'C4+F4+Ab4+Db5', 'B3+D4+F4+Ab4', 'B3+D4+F4+G4'];
    const pB = ['D4+G4+Bb4+Eb5', 'C4+Eb4+Gb4+Ab4', 'C4+D4+F4+Ab4', 'B3+D4+F4+G4', 'C4+Eb4+G4+Bb4', 'C4+Eb4+F4+A4', 'C4+Eb4+Gb4+Ab4', 'B3+D4+F4+G4'];
    const pad = (ch) => ch.map((c) => `${c}/16`).join(' ');
    const brush = 'k+h/4 h/2? h/2 s+h/4 h/2? h/2';
    return {
      bpm: 96, swing: 0.3, vol: 1.2, fx: { echo: { steps: 3, feedback: 0.45, mix: 0.25, tone: 1800 }, reverb: { time: 2, mix: 0.2 }, comp: true },
      form: ['A', 'B'],
      voices: [
        { wave: 'bell', vol: 0.04, env: 'bell', unison: 18, parts: { A: melA, B: melB } },
        { wave: 'strings', vol: 0.011, poly: true, env: 'pad', unison: 35, parts: { A: pad(pA), B: pad(pB) } },
        { wave: 'warmbass', vol: 0.08, env: 'pluck', fx: 0, parts: { A: walk(bA), B: walk(bB) } },
        { wave: 'noise', vol: 0.02, kit: 'full', parts: { A: rep(brush, 8), B: rep(brush, 8) } },
      ],
    };
  })(),

  // Cueva del Pasado: ambiente lento y raro, 70 BPM. Acordes que bajan por semitonos y campanitas.
  eb_pasado: (() => {
    const chords = ['Bb2+F3+C4', 'A2+E3+B3', 'Ab2+Eb3+Bb3', 'G2+D3+A3'];
    const drone = rep(chords.map((c) => `${c}/16`).join(' '), 2);
    const bell = 'F5/4 -/4 E5/2 -/6 | Db5/6 -/10 | C6/2 -/2 B5/2 -/10 | A5/8 -/8 | -/8 F5/2 -/2 Gb5/2 -/2 | Ab5/6 -/10 | B4/2 -/2 C5/2 -/2 Db5/8 | -/16';
    const pulse = rep(chords.map((c) => { const r = c.split('+')[0]; return `${r}/2 -/6 ${r}/2? -/6`; }).join(' '), 2);
    return {
      bpm: 70, vol: 1.2, fx: { echo: { steps: 6, feedback: 0.5, mix: 0.3, tone: 1400 }, reverb: { time: 3, mix: 0.3 } },
      voices: [
        { wave: 'strings', vol: 0.014, poly: true, env: 'swell', unison: 25, notes: drone },
        { wave: 'bell', vol: 0.03, env: 'bell', notes: bell },
        { wave: 'warmbass', vol: 0.06, env: 'soft', fx: 0.2, notes: pulse },
        { wave: 'noise', vol: 0.025, kit: 'lofi', notes: rep('k/1 -/2 k/1? -/12', 8) },
      ],
    };
  })(),

  // Giygas, fase 1: la máquina. Ostinato cromático en Do, 132 BPM, sirenas que se deslizan.
  eb_giygas: (() => {
    const R = ['C2', 'C2', 'Db2', 'C2', 'Bb1', 'B1', 'C2', 'C2'];
    const bass = R.map((r) => rep(`${r}/1 ${r}/1 ${ebUp(r, 1)}/1 ${r}/1`, 4)).join(' ');
    const lead = 'G5/4 Ab5/4^ G5/4 Gb5/4 | G5/8 -/4 Db6/4^ | C6/4 B5/4 Bb5/4 A5/4 | Ab5/12^ G5/4 | ' +
      'Eb6/4 D6/4^ Eb6/4 E6/4^ | F6/8 E6/4 Eb6/4 | D6/2 Db6/2 C6/2 B5/2 Bb5/2 A5/2 Ab5/2 G5/2 | G5/16';
    const hits = rep('C4+Gb4+B4/2! -/14', 8);
    const beat = 'k/2 s/2 k/1 k/1 s/2 k/2 s/2 k/1 h/1 s/2';
    return {
      bpm: 132, vol: 1.25, fx: { echo: { steps: 3, feedback: 0.35, mix: 0.2, tone: 2000 }, reverb: { time: 1.6, mix: 0.15 }, crush: 9, comp: true },
      voices: [
        { wave: 'sawtooth', vol: 0.022, env: 'soft', vib: 'wide', slide: 0.05, filter: 2600, notes: lead },
        { wave: 'brass', vol: 0.016, poly: true, env: 'stab', notes: hits },
        { wave: 'warmbass', vol: 0.085, env: 'pluck', fx: 0, notes: bass },
        { wave: 'noise', vol: 0.03, kit: 'full', notes: `c+${rep(beat, 7)} k/2 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2` },
      ],
    };
  })(),

  // Giygas, fase 2: lo que no se puede comprender. Racimos graves, voces desafinadas y latidos. 84 BPM.
  eb_giygas2: (() => {
    const cl = ['C2+Db2+G2', 'B1+C2+Gb2', 'Bb1+B1+F2', 'B1+C2+Gb2'];
    const drone = rep(cl.map((c) => `${c}/16`).join(' '), 2);
    const cry = 'G5/6^ Ab5/2^ G5/8 | -/8 Db6/8^ | C6/4^ B5/12 | -/16 | Eb5/6^ D5/2^ Db5/8 | -/8 G4/8^ | Ab4/4^ G4/12 | -/16';
    const beat = rep('k/2! -/2 k/1 -/11', 8);
    return {
      bpm: 84, vol: 1.25, fx: { echo: { steps: 4, feedback: 0.55, mix: 0.3, tone: 1200 }, reverb: { time: 3, mix: 0.3 }, crush: 7 },
      voices: [
        { wave: 'strings', vol: 0.016, poly: true, env: 'swell', unison: 60, notes: drone },
        { wave: 'vox', vol: 0.022, env: 'soft', vib: 'wide', slide: 0.2, unison: 40, notes: cry },
        { wave: 'sine', vol: 0.05, env: 'bass', fx: 0.3, notes: rep('C2/1 -/3', 32) },
        { wave: 'noise', vol: 0.03, kit: 'lofi', notes: beat },
      ],
    };
  })(),

  // La oración: himno lento y luminoso en Re, 72 BPM (para cuando escribes tu nombre).
  eb_rezo: (() => {
    const mel = 'F#5/8 E5/4 D5/4 | E5/8 A4/8 | D5/4 F#5/4 B5/8 | B5/4 A5/4 G5/8 | A5/8 F#5/4 D5/4 | G5/4 B5/4 D6/8 | C#6/4 B5/4 A5/4 E5/4 | D5/16';
    const ch = ['D4+F#4+A4', 'C#4+E4+A4', 'D4+F#4+B4', 'D4+G4+B4', 'D4+F#4+A4', 'D4+G4+B4', 'C#4+E4+A4', 'D4+F#4+A4'];
    const R = ['D2', 'C#2', 'B1', 'G1', 'D2', 'G1', 'A1', 'D2'];
    return {
      bpm: 72, vol: 1.2, fx: { reverb: { time: 2.6, mix: 0.3 }, echo: { steps: 4, feedback: 0.25, mix: 0.12 } },
      voices: [
        { wave: 'flute', vol: 0.04, env: 'soft', vib: 'slow', notes: mel },
        { wave: 'organ', vol: 0.014, poly: true, env: 'pad', notes: ch.map((c) => `${c}/16`).join(' ') },
        { wave: 'warmbass', vol: 0.06, env: 'soft', fx: 0, notes: R.map((r) => `${r}/8 ${ebUp(r, 7)}/8`).join(' ') },
      ],
    };
  })(),

  // Los Runaway Five: blues de 12 compases en Si bemol con metales, 132 BPM, shuffle.
  eb_runaway: (() => {
    const prog = ['Bb', 'Bb', 'Bb', 'Bb', 'Eb', 'Eb', 'Bb', 'Bb', 'F', 'Eb', 'Bb', 'F'];
    const RIFF = { Bb: ['Bb4', 'Db5', 'Eb5', 'Ab4'], Eb: ['Eb5', 'Gb5', 'Ab5', 'Db5'], F: ['F4', 'Ab4', 'Bb4', 'Eb5'] };
    const WALK = { Bb: 'Bb1 D2 F2 G2', Eb: 'Eb2 G2 Bb2 C3', F: 'F1 A1 C2 D2' };
    const CHD = { Bb: 'D4+Ab4+Bb4', Eb: 'Db4+G4+Bb4', F: 'Eb4+A4+C5' };
    const riff = (c) => { const [r, b3, p4, b7] = RIFF[c]; return `${r}/2! -/1 ${r}/1 ${b3}/2 ${p4}/2 -/2 ${b7}/2. ${r}/2 -/2`; };
    return {
      bpm: 132, swing: 0.33, vol: 1.2, fx: EB_FX,
      voices: [
        { wave: 'brass', vol: 0.03, env: 'stab', vib: 'light', notes: prog.map(riff).join(' ') },
        { wave: 'organ', vol: 0.012, poly: true, env: 'stab', notes: prog.map((c) => ebStab(CHD[c])).join(' ') },
        { wave: 'warmbass', vol: 0.08, env: 'pluck', fx: 0, notes: prog.map((c) => WALK[c].split(' ').map((n) => `${n}/4`).join(' ')).join(' ') },
        { wave: 'noise', vol: 0.028, kit: 'full', notes: rep('k+h/2 h/2 s+h/2 h/2 k+h/2 h/2 s+h/2 h/2', 12) },
      ],
    };
  })(),
});

// ---------- La tarjeta del secreto ----------
addCuriosities({
  secreto_snes_earthbound: {
    console: 'secreto',
    title: 'El juego que apesta',
    caption: 'EarthBound (1995) venía en una caja enorme, porque traía una guía del jugador... ¡con tarjetas para rascar y oler! Su anuncio en Estados Unidos decía «This game stinks!»: «¡Este juego apesta!». En Japón se llamó Mother 2 y salió en 1994.',
    draw(g, w, h) {
      const C = EB_PAL;
      const p = pixelArt(g, w, h, 64, 40, '#3c2c48');
      // La caja grande (y la guía saliendo), con un meteorito en la portada.
      p.r(6, 6, 26, 30, C.K).r(7, 7, 24, 28, '#e8e0d0').r(9, 10, 20, 14, '#28202c');
      p.rows(13, 11, ['...KKK...', '.KeeeeK..', 'KeeOeeeK.', 'KeeeeOeK.', '.KeeeeK..', '..KKKK...'], { K: C.K, e: C.e, O: C.O });
      p.r(9, 26, 20, 2, C.R).r(9, 29, 14, 2, C.U);
      p.r(30, 12, 14, 20, C.K).r(31, 13, 12, 18, '#f8f0d8').r(33, 15, 8, 2, C.N).r(33, 19, 8, 1, C.e).r(33, 21, 8, 1, C.e);
      // Las tarjetas de rascar y oler, con su olor saliendo.
      [[46, 8, C.P], [52, 16, C.Y], [46, 24, C.G]].forEach(([x, y, c]) => {
        p.r(x, y, 10, 7, C.K).r(x + 1, y + 1, 8, 5, c).r(x + 2, y + 2, 3, 1, C.W);
        p.r(x + 10, y - 2, 1, 1, c).r(x + 11, y - 3, 1, 1, c).r(x + 11, y - 1, 1, 1, c);
      });
    },
  },
});

// ---------- La entrada: el meteorito de Dinosaur Land ----------
(() => {
  const col = MAPS['snes-colinas'];
  if (!col) return;
  // Una colina en el rincón de arriba a la derecha, pasando el bosque; el meteorito cae junto a ella.
  const put = (x, y, ch) => { col.map[y] = col.map[y].slice(0, x) + ch + col.map[y].slice(x + 1); };
  put(38, 2, 'h');
  col.npcs.push(
    {
      id: 'eb-meteorito-frio', sprite: 'eb_meteorito', x: 38, y: 3, when: () => !Save.data.done.nebula,
      talk: (ctx) => ctx.say(['* Una roca negra y tibia, junto a la colina.\n* ...Adentro algo zumba: bzz... bzz...']),
    },
    {
      id: 'eb-meteorito', sprite: 'eb_meteorito', x: 38, y: 3, cls: 'eb-humo', when: () => !!Save.data.done.nebula,
      async talk(ctx) {
        await ctx.say(['* El meteorito echa humo. Huele a pasto de otro lugar...\n* Un pueblo con casitas, muy lejos de aquí.']);
        if (await ctx.choose(['tocar', 'no tocar']) !== 0) return;
        Sfx.warp();
        Game.go('town', { map: 'eb-onett', spawn: [15, 3, 'down'] });
      },
    },
  );
})();
// Lakitu ya contaba lo del meteorito; después de Nébula también dice dónde echa humo.
window.addEventListener('DOMContentLoaded', () => {
  const col = MAPS['snes-colinas'];
  const lak = col && col.npcs.find((n) => n.id === 'lakitu');
  if (!lak) return;
  const base = lak.talk;
  lak.talk = async function (ctx) {
    if (Save.data.done.nebula && !Save.data.flags['intro_eb-onett'] && ctx.counter('ebLakitu') % 2 === 0) {
      await ctx.say(['* ¡Ey! ¿Ves ese humito en el rincón de arriba a la derecha, pasando el bosque?\n* Es el METEORITO. Desde que se fue la Reina Nébula, no deja de humear.'], 'LAKITU');
      return;
    }
    await base.call(this, ctx);
  };
});
