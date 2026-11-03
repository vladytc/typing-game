// MUNDO 5 — Personajes de Nintendo de verdad en el Cubo Galáctico (GameCube, 2001).
// Se carga después de js/worlds/gc-mapa.js (ya existen MAPS['gc-...']) y solo AGREGA cosas:
//   - ISLA INITIA (Outset, de The Wind Waker): Link, su hermana Abril con el catalejo, la Abuela
//     y Tetra en el muelle norte.
//   - JARDIN BROTITOS: el Capitán Olimar y tres Pikmin (rojo, amarillo y azul).
//   - PUEBLO DE BELLOTA (pueblo de Animal Crossing): Tom Nook con la deuda de la casa y
//     K.K. Slider, que toca de verdad los sábados.
//   - ESTACION VISOR: Luigi con la Poltergust 3000.
// Todos se ven en 3D con modelos propios de cel-shading (GC3: sombreado de caricatura y
// contorno negro), en GC3.models; gc-mapa.js los usa con GC_NPC_MODELS (sprite → modelo).
// Sin Isabelle (Canela): salió hasta New Leaf (3DS, 2012). No es de esta consola.

// ---------- Tesoros ----------
Object.assign(TREASURES, {
  catalejo_abril: { room: 'gc', name: 'Catalejo de Abril', desc: 'Te lo prestó "solo por un día". Ya pasaron muchos días. Abril no ha dicho nada.' },
  sopa_abuela: { room: 'gc', name: 'Sopa de la Abuela', desc: 'Cura los corazones y da fuerza doble... hasta que te peguen. Receta secreta de la Isla Initia.' },
  zanahoria_pikpik: { room: 'gc', name: 'Zanahoria Pikpik', desc: 'La favorita de Olimar. Los Pikmin se llaman así por ella. Ellos dicen que no se parecen.' },
  llave_casa: { room: 'gc', name: 'Llave de la casita', desc: 'Tom Nook te prestó una casita. Y también te prestó la deuda. Sí, sí.' },
  grabacion_kk: { room: 'gc', name: 'Grabación de K.K.', desc: 'Una canción de un sábado en la noche. "Para tu estéreo, perrito."' },
  gb_horror: { room: 'gc', name: 'Game Boy Horror', desc: 'Invento del Profesor E. Gadd. Parece un Game Boy Color: es mapa, radar y teléfono.' },
});

// ---------- Sprites 2D (para el modo clásico; colores fijos GC_PAL de js/worlds/gc.js) ----------
// gcRow16 empareja cada fila a 16 columnas (así un dibujo chueco no rompe el sprite).
const gcRow16 = (rows) => gcArt(rows.map((r) => `${r}................`.slice(0, 16)));
Object.assign(SPRITES, {
  // Link de caricatura: gorro verde que cae hacia atrás, pelo rubio y orejas puntiagudas.
  gc_link: gcRow16([
    '......nnnn......',
    '....nnggggnn....',
    '...nggggggggnn..',
    '...nyyyyyygggggn',
    '..enyeeeeeeyn.nn',
    '..eeneeeenee....',
    '...neeeeeeen....',
    '....neeeeen.....',
    '...nngggggnn....',
    '..nggggggggkn...',
    '..eggkkykkgge...',
    '..neggggggen....',
    '...nggggggn.....',
    '...neen.neen....',
    '...nkkn.nkkn....',
    '...nnn...nnn....',
  ]),
  // Abril: coletas rubias, vestido azul con flores y su catalejo.
  gc_abril: gcRow16([
    '................',
    '.....nnnnnn.....',
    '.nn.nyyyyyyn.nn.',
    'nyyn.yyyyyy.nyyn',
    'nyynyeeeeeeynyyn',
    '.nn.eneeeene.nn.',
    '....neeeeeen....',
    '.....neeeen.....',
    '....nssssssn....',
    '...nsswsswssn.kk',
    '...essssssssekyk',
    '...nsswssswsnkk.',
    '..nssssssssssn..',
    '..nnnnnnnnnnnn..',
    '.....nen.nen....',
    '.....nn...nn....',
  ]),
  // La Abuela: chonguito gris, rebozo lila y su olla de sopa.
  gc_abuela: gcRow16([
    '......nnn.......',
    '.....nppppn.....',
    '....nppppppn....',
    '...nppppppppn...',
    '...npeeeeeepn...',
    '...neneeeenen...',
    '....neeeeeen....',
    '....nleeeeln....',
    '...nlllllllln...',
    '..nllllllllll.n.',
    '..nlnoooooonln..',
    '..nlnokkkkonln..',
    '..nllnoooonlln..',
    '..nllllllllll.n.',
    '...nnnnnnnnnn...',
    '....nkn..nkn....',
  ]),
  // Tetra: chongo rubio, piel morena, pañoleta roja y blusa azul.
  gc_tetra: gcRow16([
    '......nyyn......',
    '.....nyyyyn.....',
    '....nyyyyyyn....',
    '...nyyyyyyyyny..',
    '...nykkkkkkyyyy.',
    '...nkknkkknkn.y.',
    '....nkkkkkkn....',
    '....nrrrrrrn....',
    '...nrruuuurrn...',
    '..nkuuuuuuuukn..',
    '..nkuuuuuuuukn.p',
    '...nuuuuuuuun.p.',
    '...nwwwwwwwwnp..',
    '....nwwn.nwwn...',
    '....nkkn.nkkn...',
    '....nnn...nnn...',
  ]),
  // Olimar: casco de vidrio con antena de foco rojo, nariz grande y traje crema con rayas rojas.
  gc_olimar: gcRow16([
    '.......r........',
    '.......n........',
    '.....nnnnn......',
    '....nswwwwsn....',
    '...nskkkkkkwn...',
    '...nseneeneswn..',
    '...nseeooeeswn..',
    '...nsseooessn...',
    '....nnnnnnnn....',
    '...nyyyyyyyyn...',
    '..rnyrrrrrrynr..',
    '..rnyyyyyyyynr..',
    '...nyyyyyyyyn...',
    '....nyyn.nyyn...',
    '....nrrn.nrrn...',
    '....nnn...nnn...',
  ]),
  // Tom Nook: mapache café con antifaz y su delantal azul con una hoja.
  gc_nook: gcRow16([
    '..nn........nn..',
    '.nkkn......nkkn.',
    '.nkkknnnnnnkkkn.',
    '..nkkkkkkkkkkn..',
    '..nnnnkkkknnnn..',
    '..nnwnnkknnwnn..',
    '..nkkkkwwkkkkn..',
    '...nkkwnnwkkn...',
    '....nkwwwwkn....',
    '...nkuuuuuukn...',
    '..nkkuuguuukkn..',
    '..nkkuggguukkn..',
    '...nkuuuuuukn...',
    '....nuuuuuun....',
    '....nkkn.nkkn...',
    '....nnn...nnn...',
  ]),
  // K.K. Slider: perro blanco con cejas, sentado con su guitarra.
  gc_kk: gcRow16([
    '................',
    '...nnnnnnnnn....',
    '..nwwwwwwwwwwn..',
    '.npwwnnwwnnwwpn.',
    '.npwwwwwwwwwwpn.',
    '.npwnnwwwwnnwpn.',
    '..nwwwwnnwwwwn..',
    '...nwwwwwwwwn...',
    '...nwwwwwwwwn...',
    '..nkkkkwwwwwwn..',
    '.nkookkkwwwwwn..',
    '.nkonokkkkkkkkkk',
    '.nkookkkwwwwwn..',
    '..nkkkkwwwwwwn..',
    '....nkkkkkkkn...',
    '....nkn...nkn...',
  ]),
  // Luigi: gorra verde con la L, bigote, overol azul y la Poltergust 3000 en la espalda.
  gc_luigi: gcRow16([
    '.....nnnnnn.....',
    '....ngggggggn...',
    '...nggwwgggggn..',
    '...nnnnnnnnnnnn.',
    '....neeneeneen..',
    '...neeeeeoooen..',
    '...nennnnnnnen..',
    '....neeeeeeen...',
    '..ppngggggggnpp.',
    '.pppnuggggguppp.',
    '.pppnuuuuuuuppp.',
    '..ppeuuyuuyuepp.',
    '...nuuuuuuuuun..',
    '....nuuun.nuun..',
    '....nkkkn.nkkn..',
    '....nnnn..nnnn..',
  ]),
  // Tesoros.
  catalejo_abril: gcRow16([
    '................',
    '................',
    '..........nnn...',
    '.........nyyyn..',
    '........nkyyyn..',
    '.......nkkkyn...',
    '......nkkkkn....',
    '.....nyykkn.....',
    '....nyyyyn......',
    '...nkkkkn.......',
    '..nkkkkn........',
    '.nyyykn.........',
    '.nyyyn..........',
    '..nnn...........',
    '................',
    '................',
  ]),
  sopa_abuela: gcRow16([
    '................',
    '.....w...w......',
    '......w.w..w....',
    '.....w...w......',
    '................',
    '..nnnnnnnnnnnn..',
    '.nooooooooooooon',
    '.nkooooooooookn.',
    'nkkkkkkkkkkkkkkn',
    '.nkkkkkkkkkkkkn.',
    '.nkkkkkkkkkkkkn.',
    '..nkkkkkkkkkkn..',
    '...nkkkkkkkkn...',
    '....nnnnnnnn....',
    '................',
    '................',
  ]),
  zanahoria_pikpik: gcRow16([
    '........g.g.....',
    '.......ggggg....',
    '........ggg.....',
    '.......noon.....',
    '......noooon....',
    '......noooon....',
    '......nowoon....',
    '.......ooon.....',
    '.......noon.....',
    '.......noon.....',
    '........on......',
    '........on......',
    '........n.......',
    '................',
    '................',
    '................',
  ]),
  llave_casa: gcRow16([
    '................',
    '................',
    '....nnnn........',
    '...nyyyyn.......',
    '..nyynnyyn......',
    '..nyn..nyn......',
    '..nyynnyynnnnnn.',
    '...nyyyyyyyyyyyn',
    '....nnnnnnynnyn.',
    '..........nnnn..',
    '................',
    '....ggg.........',
    '...ggggg........',
    '....gkg.........',
    '................',
    '................',
  ]),
  grabacion_kk: gcRow16([
    '................',
    '................',
    '.nnnnnnnnnnnnnn.',
    '.nppppppppppppn.',
    '.npwwwwwwwwwwpn.',
    '.npwnnwwwwnnwpn.',
    '.npwnnwwwwnnwpn.',
    '.npwwwwwwwwwwpn.',
    '.nppppppppppppn.',
    '.npppnnnnnpppn..',
    '.nppnppppnpppn..',
    '.nnnnnnnnnnnnnn.',
    '................',
    '.....y....y.....',
    '....yy...yy.....',
    '....n....n......',
  ]),
  gb_horror: gcRow16([
    '................',
    '....nnnnnnnn....',
    '...nlllllllln...',
    '...nlnnnnnnln...',
    '...nlnsssssnln..',
    '...nlnsgsssnln..',
    '...nlnsssssnln..',
    '...nlnnnnnnln...',
    '...nllllllllln..',
    '...nlnlllrrlln..',
    '...nnnnllrrlln..',
    '...nlnlllllln...',
    '...nlllllllln...',
    '....nnnnnnnn....',
    '................',
    '................',
  ]),
});

// ---------- Modelos 3D en cel-shading (encima de GC3: toon + contorno negro) ----------
// gcN: una pieza de caricatura con su contorno; gcBall/gcStick son atajos de esfera y cilindro.
const gcN = (v, geo, color, parent, [x, y, z] = [0, 0, 0], out = 1.1) => {
  const m = GC3.part(v, geo, color, parent, { toon: true, outline: out });
  m.position.set(x, y, z);
  return m;
};
const gcBall = (v, r, color, parent, pos, out) => gcN(v, new THREE.SphereGeometry(r, 14, 10), color, parent, pos, out);
const gcStick = (v, r, h, color, parent, pos, out) => gcN(v, new THREE.CylinderGeometry(r, r, h, 10), color, parent, pos, out);
// Ojos grandes de caricatura (los de Wind Waker): óvalo negro con su brillito.
function gcToonEyes(v, parent, y, z, x = 0.2, r = 0.13) {
  return [-x, x].map((ex) => {
    const e = GC3.part(v, new THREE.SphereGeometry(r, 10, 8), GCC.black, parent, { toon: true });
    e.scale.set(0.8, 1.35, 0.45);
    e.position.set(ex, y, z);
    const s = GC3.part(v, new THREE.SphereGeometry(r * 0.3, 6, 6), GCC.white, parent);
    s.position.set(ex + r * 0.2, y + r * 0.45, z + r * 0.4);
    return e;
  });
}
const GC_TAN = '#D9A066';

Object.assign(GC3.models, {
  // Link: túnica verde, gorro que cae para atrás, orejas de punta y la espada en la espalda.
  wwLink(v) {
    const g = new THREE.Group();
    [-0.18, 0.18].forEach((x) => gcStick(v, 0.12, 0.45, GCC.brown, g, [x, 0.22, 0]));
    gcN(v, new THREE.ConeGeometry(0.55, 1.05, 12), GCC.green, g, [0, 0.95, 0]);
    gcStick(v, 0.4, 0.1, GCC.brown, g, [0, 0.78, 0], 1.05);
    gcBall(v, 0.55, GCC.skin, g, [0, 1.85, 0.02]);
    gcBall(v, 0.56, GCC.yellow, g, [0, 2.02, -0.1], 1.06).scale.set(1, 0.7, 0.95);
    const cap = gcN(v, new THREE.ConeGeometry(0.5, 1.2, 12), GCC.green, g, [0, 2.3, -0.42]);
    cap.rotation.x = -1.05;
    [-1, 1].forEach((s) => { const ear = gcN(v, new THREE.ConeGeometry(0.1, 0.4, 6), GCC.skin, g, [s * 0.58, 1.85, 0]); ear.rotation.z = -s * 1.2; });
    gcToonEyes(v, g, 1.88, 0.48);
    const sword = gcN(v, new THREE.BoxGeometry(0.1, 1.0, 0.06), GCC.silver, g, [0.15, 1.4, -0.5]);
    sword.rotation.z = 0.5;
    g.userData.anim = (t) => { g.position.y = Math.abs(Math.sin(t * 3)) * 0.08; g.rotation.y = Math.sin(t * 0.8) * 0.3; };
    return g;
  },

  // Abril: vestido azul con flores blancas, coletas y su catalejo de bronce.
  wwAbril(v) {
    const g = new THREE.Group();
    gcN(v, new THREE.ConeGeometry(0.6, 1.1, 12), GCC.sky, g, [0, 0.6, 0]);
    [[0.25, 0.55, 0.42], [-0.3, 0.35, 0.42], [0.05, 0.85, 0.3]].forEach((p) => gcBall(v, 0.07, GCC.white, g, p, 1.0));
    gcBall(v, 0.5, GCC.skin, g, [0, 1.5, 0]);
    gcBall(v, 0.52, GCC.yellow, g, [0, 1.65, -0.08], 1.06).scale.set(1, 0.65, 0.95);
    [-1, 1].forEach((s) => gcBall(v, 0.2, GCC.yellow, g, [s * 0.55, 1.45, -0.1]));
    gcToonEyes(v, g, 1.52, 0.43, 0.17, 0.11);
    const tele = new THREE.Group();
    tele.position.set(0.45, 1.1, 0.3);
    g.add(tele);
    gcStick(v, 0.09, 0.7, GCC.brown, tele, [0, 0.2, 0]);
    gcStick(v, 0.12, 0.2, GCC.yellow, tele, [0, 0.58, 0]);
    tele.rotation.x = 0.9;
    g.userData.anim = (t) => { tele.rotation.z = Math.sin(t * 0.7) * 0.4; g.rotation.y = Math.sin(t * 0.5) * 0.4; };
    return g;
  },

  // La Abuela: chonguito gris, rebozo lila, un poco agachadita, con su olla de sopa.
  wwAbuela(v) {
    const g = new THREE.Group();
    const body = new THREE.Group();
    g.add(body);
    gcN(v, new THREE.ConeGeometry(0.62, 1.0, 12), GCC.lila, body, [0, 0.5, 0]);
    gcBall(v, 0.45, GCC.skin, body, [0, 1.25, 0.08]);
    gcBall(v, 0.46, GCC.silver, body, [0, 1.38, -0.05], 1.06).scale.set(1, 0.7, 0.95);
    gcBall(v, 0.2, GCC.silver, body, [0, 1.75, -0.12]);
    gcToonEyes(v, body, 1.25, 0.48, 0.15, 0.07);
    gcN(v, new THREE.CylinderGeometry(0.28, 0.22, 0.25, 12), GCC.orange, body, [0, 0.75, 0.55]);
    gcStick(v, 0.24, 0.04, GCC.brown, body, [0, 0.88, 0.55], 1.0);
    body.rotation.x = 0.15;
    g.userData.anim = (t) => { body.rotation.z = Math.sin(t * 1.2) * 0.05; };
    return g;
  },

  // Tetra: chongo rubio, piel morena, pañoleta roja, blusa azul y su espada al cinto. Guiña.
  wwTetra(v) {
    const g = new THREE.Group();
    [-0.17, 0.17].forEach((x) => gcStick(v, 0.12, 0.6, GCC.white, g, [x, 0.3, 0]));
    gcN(v, new THREE.CylinderGeometry(0.34, 0.4, 0.8, 12), GCC.water, g, [0, 0.95, 0]);
    gcN(v, new THREE.TorusGeometry(0.28, 0.08, 6, 14), GCC.red, g, [0, 1.38, 0]).rotation.x = Math.PI / 2;
    gcBall(v, 0.48, GC_TAN, g, [0, 1.8, 0]);
    gcBall(v, 0.5, GCC.yellow, g, [0, 1.93, -0.08], 1.06).scale.set(1, 0.7, 0.95);
    gcBall(v, 0.22, GCC.yellow, g, [0, 2.38, -0.1]);
    gcN(v, new THREE.ConeGeometry(0.14, 0.55, 8), GCC.yellow, g, [0, 2.2, -0.45]).rotation.x = -2.2;
    const eyes = gcToonEyes(v, g, 1.82, 0.42, 0.17, 0.11);
    const saber = gcN(v, new THREE.BoxGeometry(0.07, 0.8, 0.05), GCC.silver, g, [0.42, 0.7, 0.05]);
    saber.rotation.z = 0.3;
    g.userData.anim = (t) => { eyes[1].scale.y = (t % 4) < 0.25 ? 0.25 : 1.35; g.rotation.y = Math.sin(t * 0.6) * 0.25; };
    return g;
  },

  // Olimar con tres Pikmin: casco de vidrio, antena con foco rojo, nariz grande, traje crema.
  olimar(v) {
    const g = new THREE.Group();
    const cap = new THREE.Group();
    g.add(cap);
    [-0.15, 0.15].forEach((x) => gcStick(v, 0.1, 0.35, GCC.red, cap, [x, 0.18, 0]));
    gcBall(v, 0.42, '#F5E6B8', cap, [0, 0.65, 0]).scale.set(1, 1.1, 0.9);
    gcN(v, new THREE.TorusGeometry(0.41, 0.04, 6, 18), GCC.red, cap, [0, 0.65, 0]).rotation.x = Math.PI / 2;
    [-1, 1].forEach((s) => gcBall(v, 0.12, GCC.red, cap, [s * 0.48, 0.55, 0.1]));
    gcBall(v, 0.36, GCC.skin, cap, [0, 1.25, 0]);
    gcBall(v, 0.16, '#F0A582', cap, [0, 1.18, 0.34]);
    [-0.1, 0, 0.1].forEach((x) => gcStick(v, 0.02, 0.18, GCC.brown, cap, [x, 1.62, 0], 1.0));
    gcToonEyes(v, cap, 1.32, 0.3, 0.13, 0.06);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), GC3.shiny(v, GCC.white, { transparent: true, opacity: 0.25, shininess: 160, specular: 0xffffff }));
    glass.position.y = 1.28;
    cap.add(glass);
    gcStick(v, 0.025, 0.5, GCC.silver, cap, [0, 2.05, 0], 1.0);
    const bulb = GC3.part(v, new THREE.SphereGeometry(0.1, 10, 8), GCC.red, cap);
    bulb.material = GC3.shiny(v, GCC.red, { emissive: 0x991111 });
    bulb.position.y = 2.33;
    // Los Pikmin: el rojo con nariz, el amarillo con orejotas, el azul con su boquita.
    const kids = [[GCC.red, 'nariz'], [GCC.yellow, 'orejas'], ['#2B6FDB', 'boca']].map(([c, kind], i) => {
      const k = new THREE.Group();
      gcBall(v, 0.2, c, k, [0, 0.3, 0]).scale.set(1, 1.4, 1);
      gcStick(v, 0.015, 0.4, GCC.green, k, [0, 0.75, 0], 1.0);
      gcBall(v, 0.08, GCC.green, k, [0, 0.98, 0], 1.0).scale.set(1.6, 0.4, 0.8);
      GC3.eyes(v, k, { y: 0.4, z: 0.16, x: 0.07, r: 0.05 });
      if (kind === 'nariz') gcN(v, new THREE.ConeGeometry(0.05, 0.14, 6), c, k, [0, 0.33, 0.22]).rotation.x = Math.PI / 2;
      if (kind === 'orejas') [-1, 1].forEach((s) => gcBall(v, 0.09, c, k, [s * 0.2, 0.48, 0]).scale.set(0.5, 1.2, 0.8));
      if (kind === 'boca') gcBall(v, 0.04, GCC.black, k, [0, 0.27, 0.2], 1.0);
      k.position.set((i - 1) * 0.7, 0, 0.75);
      g.add(k);
      return k;
    });
    g.userData.anim = (t) => {
      bulb.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.4;
      kids.forEach((k, i) => { k.position.y = Math.abs(Math.sin(t * 4 + i)) * 0.15; });
      cap.rotation.y = Math.sin(t * 0.7) * 0.3;
    };
    return g;
  },

  // Tom Nook: mapache café con antifaz, panzita clara y su delantal azul con la hoja.
  nook(v) {
    const g = new THREE.Group();
    [-0.2, 0.2].forEach((x) => gcStick(v, 0.14, 0.35, GCC.brown, g, [x, 0.18, 0]));
    gcBall(v, 0.6, GCC.brown, g, [0, 0.85, 0]).scale.set(1, 1.05, 0.9);
    gcN(v, new THREE.BoxGeometry(0.8, 0.75, 0.1), GCC.water, g, [0, 0.78, 0.5], 1.04);
    gcBall(v, 0.1, GCC.green, g, [0, 0.85, 0.57], 1.0).scale.set(1.3, 0.7, 0.4);
    gcBall(v, 0.5, GCC.brown, g, [0, 1.7, 0]);
    gcBall(v, 0.3, '#F5E6B8', g, [0, 1.6, 0.32], 1.0).scale.set(1.3, 0.8, 0.7);
    gcBall(v, 0.22, '#4A3020', g, [0, 1.8, 0.32], 1.0).scale.set(2.1, 0.7, 0.6); // el antifaz
    GC3.eyes(v, g, { y: 1.8, z: 0.45, x: 0.18, r: 0.09 });
    gcBall(v, 0.08, GCC.black, g, [0, 1.62, 0.55], 1.0);
    [-1, 1].forEach((s) => gcN(v, new THREE.ConeGeometry(0.15, 0.3, 6), GCC.brown, g, [s * 0.32, 2.15, 0]));
    const tail = gcBall(v, 0.22, GCC.brown, g, [0, 0.6, -0.6]);
    tail.scale.set(0.8, 0.8, 1.5);
    g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 2) * 0.05; tail.rotation.y = Math.sin(t * 3) * 0.3; };
    return g;
  },

  // K.K. Slider: perro blanco con cejas, sentado en su banquito, rasgueando la guitarra.
  kk(v) {
    const g = new THREE.Group();
    gcStick(v, 0.35, 0.6, GCC.brown, g, [0, 0.3, 0]);
    gcBall(v, 0.5, GCC.white, g, [0, 1.05, 0]).scale.set(1, 1.1, 0.9);
    gcBall(v, 0.48, GCC.white, g, [0, 1.85, 0]);
    [-1, 1].forEach((s) => gcBall(v, 0.18, GCC.silver, g, [s * 0.48, 1.8, -0.05]).scale.set(0.6, 1.5, 0.8));
    [-0.17, 0.17].forEach((x) => gcN(v, new THREE.BoxGeometry(0.2, 0.05, 0.05), GCC.black, g, [x, 2.02, 0.42], 1.0));
    [-0.17, 0.17].forEach((x) => gcN(v, new THREE.BoxGeometry(0.14, 0.03, 0.03), GCC.black, g, [x, 1.88, 0.45], 1.0));
    gcBall(v, 0.09, GCC.black, g, [0, 1.75, 0.48], 1.0);
    const guit = new THREE.Group();
    guit.position.set(0, 1.0, 0.5);
    g.add(guit);
    gcBall(v, 0.3, GCC.orange, guit, [-0.1, -0.1, 0], 1.05).scale.set(1, 0.9, 0.35);
    gcBall(v, 0.08, GCC.black, guit, [-0.1, -0.08, 0.1], 1.0);
    gcN(v, new THREE.BoxGeometry(0.75, 0.08, 0.06), GCC.brown, guit, [0.45, 0.12, 0], 1.04).rotation.z = 0.3;
    g.userData.anim = (t) => { g.rotation.z = Math.sin(t * 3) * 0.06; guit.rotation.z = Math.sin(t * 6) * 0.05; };
    return g;
  },

  // Luigi: gorra verde con la L, bigote, overol azul y la Poltergust 3000 a la espalda. Tiembla.
  luigi(v) {
    const g = new THREE.Group();
    const body = new THREE.Group();
    g.add(body);
    [-0.18, 0.18].forEach((x) => gcStick(v, 0.13, 0.5, GCC.brown, body, [x, 0.25, 0]));
    gcN(v, new THREE.CylinderGeometry(0.4, 0.45, 0.85, 12), '#2B6FDB', body, [0, 0.9, 0]);
    gcBall(v, 0.38, GCC.green, body, [0, 1.35, 0]).scale.set(1.1, 0.6, 1);
    gcBall(v, 0.45, GCC.skin, body, [0, 1.85, 0]).scale.set(1, 1.1, 1);
    gcBall(v, 0.15, GCC.skin, body, [0, 1.8, 0.45]);
    gcN(v, new THREE.BoxGeometry(0.45, 0.1, 0.1), GCC.black, body, [0, 1.65, 0.42], 1.04);
    GC3.eyes(v, body, { y: 1.98, z: 0.38, x: 0.14, r: 0.09 });
    gcN(v, new THREE.SphereGeometry(0.47, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), GCC.green, body, [0, 2.05, 0]);
    gcN(v, new THREE.CylinderGeometry(0.4, 0.4, 0.05, 14, 1, false, -Math.PI / 2, Math.PI), GCC.green, body, [0, 2.05, 0.2], 1.04);
    gcStick(v, 0.12, 0.03, GCC.white, body, [0, 2.3, 0.33], 1.0).rotation.x = 1.2;
    // La Poltergust 3000: tanque, manguera y boquilla.
    gcStick(v, 0.3, 0.9, GCC.silver, body, [0, 1.1, -0.55]);
    gcN(v, new THREE.TorusGeometry(0.35, 0.06, 6, 16, Math.PI), GCC.indigoD, body, [0.4, 0.8, -0.2], 1.05).rotation.y = Math.PI / 2;
    gcN(v, new THREE.CylinderGeometry(0.08, 0.2, 0.4, 10), GCC.silver, body, [0.45, 0.6, 0.3]).rotation.x = Math.PI / 2;
    g.userData.anim = (t) => { body.position.x = Math.sin(t * 40) * 0.02; body.rotation.y = Math.sin(t * 0.9) * 0.5; };
    return g;
  },
});
// Sprite del NPC → modelo (gc-mapa.js lo consulta en gcModelKey).
Object.assign(GC_NPC_MODELS, {
  gc_link: 'wwLink', gc_abril: 'wwAbril', gc_abuela: 'wwAbuela', gc_tetra: 'wwTetra',
  gc_olimar: 'olimar', gc_nook: 'nook', gc_kk: 'kk', gc_luigi: 'luigi',
});

// ---------- K.K. Slider: canciones ORIGINALES (bossa de guitarra con su voz de "animalés") ----------
// Las de verdad son de Nintendo: aquí K.K. estrena tres propias, con la misma melodía en tres
// sabores (bossa, swing y balada). Do mayor, A y B de 8 compases.
TRACKS.gc_kk_cubo = (() => {
  const melA = 'E5/3 G5/3 B5/2 A5/4 G5/4 | C5/2 E5/2 G5/4 E5/6 -/2 | F5/3 A5/3 C6/2 B5/4 A5/4 | G5/6 F5/2 D5/8 | ' +
    'E5/3 G5/3 B5/2 D6/4 C6/4 | C#6/2 A5/2 E5/4 G5/6 -/2 | F5/2 E5/2 D5/2 F5/2 A5/4 G5/4 | F5/4 D5/4 B4/8';
  const melB = 'A5/6 G5/2 F5/4 E5/4 | G5/6 E5/2 B4/8 | D5/2 F5/2 A5/2 C6/2 B5/4 A5/4 | G5/8 E5/8 | ' +
    'A5/4 C6/4 E6/4 D6/4 | G#5/6 B5/2 E6/8 | F5/2 A5/2 D6/2 C6/2 B5/4 A5/4 | G5/4 F5/4 D5/4 B4/4';
  const hA = ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'A7', 'Dm7', 'G7'];
  const hB = ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7', 'Fmaj7', 'E7', 'Dm7', 'G7'];
  const CH = { Cmaj7: 'C4+E4+G4+B4', Am7: 'A3+C4+E4+G4', Dm7: 'D4+F4+A4+C5', G7: 'G3+B3+D4+F4', A7: 'A3+C#4+E4+G4',
    Fmaj7: 'F3+A3+C4+E4', Em7: 'E3+G3+B3+D4', E7: 'E3+G#3+B3+D4' };
  const BS = { Cmaj7: ['C3', 'G2'], Am7: ['A2', 'E3'], Dm7: ['D3', 'A2'], G7: ['G2', 'D3'], A7: ['A2', 'E3'],
    Fmaj7: ['F2', 'C3'], Em7: ['E2', 'B2'], E7: ['E2', 'B2'] };
  const comp = (h) => gcBars(h, (c) => `${CH[c]}/3. ${CH[c]}/3. ${CH[c]}/2 -/2 ${CH[c]}/3. ${CH[c]}/3?`);
  const bas = (h) => gcBars(h, (c) => `${BS[c][0]}/6 ${BS[c][1]}/2 ${BS[c][1]}/6 ${BS[c][0]}/2`);
  const shk = rep('k+h/2 h/2? h/2 s/2? h/2 h/2? k/2 h/2?', 8);
  return {
    bpm: 112, era: 'gc', form: ['A', 'B'],
    voices: [
      // La voz de K.K.: "canta" con la onda de voz y un vibrato ancho de cantante.
      { wave: 'vox', vol: 0.04, legato: 0.75, vib: { rate: 5.5, depth: 0.25, delay: 0.2 }, parts: { A: melA, B: melB } },
      { wave: GC_HARP, vol: 0.026, poly: true, env: 'pluck', fx: 0.4, pan: -0.2, parts: { A: comp(hA), B: comp(hB) } },
      { wave: 'triangle', vol: 0.09, env: 'bass', fx: 0, parts: { A: bas(hA), B: bas(hB) } },
      { wave: 'noise', vol: 0.014, fx: 0.15, parts: { A: shk, B: shk } },
    ],
  };
})();
TRACKS.gc_kk_tecla = { ...TRACKS.gc_kk_cubo, bpm: 150, swing: 0.2 };
TRACKS.gc_kk_bellota = { ...TRACKS.gc_kk_cubo, bpm: 76 };

// ---------- Ayudantes ----------
// Una línea distinta cada vez que hablas (como los vecinos de siempre).
const gcTurn = (ctx, key, lines) => lines[ctx.counter(key) % lines.length];
// Regresa la música de la zona después de un concierto.
const gcZoneMusic = () => { const t = Scenes.town; if (t && t.music) Music.play(t.music); };
const GC_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// ---------- ISLA INITIA ----------
const GC_NPC_ABRIL = {
  id: 'gc-abril', sprite: 'gc_abril', x: 4, y: 10,
  async talk(ctx) {
    if (!ctx.flag('gcAbril')) {
      await ctx.say([
        '* ¡Hola! Soy ABRIL. Este es mi mirador: desde aquí se ve TODO el mar.\n* Bueno... todo el cubo.',
        '* Hoy es el cumpleaños de mi hermano. Le presté mi catalejo...\n* ...¡pero solo por un día! ¿Quieres mirar tú?',
      ], 'ABRIL');
      if (await ctx.choose(['mirar', 'luego'], 'ABRIL') === 1) return;
      ctx.setFlag('gcAbril');
      await ctx.say([
        '* (Por el catalejo ves el muelle del norte: un barco con bandera de calavera.)',
        '* ABRIL: ¡Piratas! Mi abuela dice que no me acerque.\n* ...Tú sí puedes, ¿eh? Llévate el catalejo. ¡Solo por un día!',
      ], 'ABRIL');
      await ctx.give('catalejo_abril');
      return;
    }
    await ctx.say(gcTurn(ctx, 'gcAbrilN', [
      ['* Las gaviotas vienen a mi mirador. Les pongo nombre a todas.\n* Esa es Juana. Esa también. Esa... también es Juana.'],
      ['* ¿Sabes qué usaba mi hermano antes de su ropa verde?\n* ¡Una camisa azul con una langosta! Pijama de isla.'],
      ['* ¿Y mi catalejo? ...¿Todavía es el mismo día?\n* Bueno. Un día muuuy largo.'],
    ]), 'ABRIL');
  },
};

const GC_NPC_LINK = {
  id: 'gc-link', sprite: 'gc_link', x: 7, y: 10,
  async talk(ctx) {
    const first = !ctx.flag('gcLink');
    ctx.setFlag('gcLink');
    await ctx.say(first
      ? ['* (Un niño con ropa verde y gorro puntiagudo te mira fijo.)\n* LINK: ......', '* BIT: No habla. Nunca habla. Pero dice MUCHO con las cejas.\n* ...Creo que quiere entrenar contigo.']
      : gcTurn(ctx, 'gcLinkN', [
        ['* LINK: ......\n* BIT: Dice que su abuela hace la mejor sopa del mar. Lo dijo con las cejas.'],
        ['* BIT: En Smash le dicen "Toon Link", pero ese nombre llegó hasta 2008, con Brawl.\n* En su juego de GameCube era solo... Link.'],
        ['* LINK: ......!\n* BIT: Eso fue un "¡hyah!" en silencio. Quiere la revancha.'],
      ]), 'LINK');
    if (await ctx.choose(['entrenar', 'ahora no'], 'LINK') === 1) return;
    const texts = ['¡Hyah!', '¡Hyaaah!', '¡Hup!', '¡Kyah!'];
    const res = await ctx.challenge({ label: 'Grita como Link (con todo y signos):', texts, timeLimit: texts.join('').length * 600 + 4000, caps: true });
    await ctx.say([res.completed
      ? '* LINK: ...¡!\n* (Link levanta el puño. En idioma Link, eso es un abrazo.)'
      : '* (Link ladea la cabeza.)\n* BIT: Dice que otra vez. Con más "¡Hyah!".'], 'LINK');
  },
};

const GC_NPC_ABUELA = {
  id: 'gc-abuela', sprite: 'gc_abuela', x: 7, y: 15,
  async talk(ctx) {
    if (!Save.data.treasures.sopa_abuela) {
      await ctx.say([
        '* ¡Ay, qué niño tan educado! Soy la ABUELA de Link y de Abril.',
        '* Te ves cansado de tanto teclear. Ten, una sopita.\n* Cura los corazones... y da fuerza DOBLE. Hasta que te peguen.',
      ], 'ABUELA');
      await ctx.give('sopa_abuela');
      return;
    }
    await ctx.say(gcTurn(ctx, 'gcAbuela', [
      ['* Le cosí a mi nieto su ropa verde. Aquí es tradición:\n* cuando un niño llega a la edad del héroe, se viste de verde.'],
      ['* Si algún día me enfermo, tráeme un hada en una botella.\n* ...Nadie nunca trae un hada.'],
      ['* Mi sopa alcanza para dos veces en una botella.\n* ¡No te la tomes toda de un jalón!'],
    ]), 'ABUELA');
  },
};

const GC_NPC_TETRA = {
  id: 'gc-tetra', sprite: 'gc_tetra', x: 26, y: 4,
  async talk(ctx) {
    if (!ctx.flag('gcTetra')) {
      ctx.setFlag('gcTetra');
      await ctx.say([
        '* ¿Y tú qué miras, marinerito? Soy TETRA, capitana de ese barco.\n* Y no, no damos paseos.',
        '* ...Bueno, un dato gratis: en el Jardín hay una meseta con un cofre arriba.\n* Mis piratas no caben por la rampa. Tú sí.',
      ], 'TETRA');
      return;
    }
    await ctx.say(gcTurn(ctx, 'gcTetraN', [
      ['* Mis piratas me respetan. Bueno... me tienen miedo.\n* Una vez lanzamos a un niño en un barril con una catapulta. Idea mía.'],
      ['* (Tetra se cruza de brazos y te guiña un ojo.)\n* No le digas a nadie que soy buena onda. Tengo una reputación.'],
      ['* ¿Viste al de verde con la cara seria? Se llama Link.\n* Habla menos que mi ancla. Pero es valiente, eso sí.'],
    ]), 'TETRA');
  },
};

// ---------- JARDIN BROTITOS ----------
const GC_NPC_OLIMAR = {
  id: 'gc-olimar', sprite: 'gc_olimar', x: 18, y: 6,
  async talk(ctx) {
    if (!Save.data.treasures.zanahoria_pikpik) {
      if (!ctx.flag('gcOlimar')) {
        ctx.setFlag('gcOlimar');
        await ctx.say([
          '* ¡Hola, gigante! Soy el CAPITAN OLIMAR, de Hocotate Freight.\n* Mi nave, el S.S. Dolphin, chocó con un cometa.',
          '* Tengo 30 días para juntar sus 30 piezas.\n* ...Ese capitán de allá dice que a él le pasó IGUAL. Qué sospechoso.',
        ], 'OLIMAR');
      }
      await ctx.say(['* ¿Me ayudas a escribir mi bitácora? Los Pikmin la mordisquean.'], 'OLIMAR');
      if (await ctx.choose(['escribir', 'luego'], 'OLIMAR') === 1) return;
      const texts = ['Día 1: choqué con un cometa.', 'Los Pikmin me siguen.', 'Rojo, amarillo y azul.'];
      const res = await ctx.challenge({ label: 'Bitácora del capitán:', texts, timeLimit: texts.join('').length * 650 + 5000, caps: true });
      if (!res.completed) { await ctx.say(['* Un Pikmin se comió la última hoja. ¡Otra vez, por favor!'], 'OLIMAR'); return; }
      await ctx.say(['* ¡Gracias! Ten, mi última zanahoria Pikpik.\n* Les puse "Pikmin" porque se parecen a ella. Ellos dicen que no.'], 'OLIMAR');
      await ctx.give('zanahoria_pikpik');
      return;
    }
    await ctx.say(gcTurn(ctx, 'gcOlimarN', [
      ['* Mi nave se llama Dolphin por el nombre secreto de esta consola.\n* ¡Hasta mi nave es un guiño!'],
      ['* Los rojos aguantan el fuego. Los azules, el agua.\n* Los amarillos vuelan más alto y cargan bombas-roca.'],
      ['* Mi nombre en japonés tiene las mismas letras que "Mario". Orima, Mario.\n* ...Nunca nos han visto juntos.'],
      ['* Con todo y casco mido 3.9 centímetros. Sin el traje, 1.9.\n* Una moneda es más alta que yo.'],
    ]), 'OLIMAR');
  },
};

// ---------- PUEBLO DE BELLOTA (Animal Crossing) ----------
// La deuda: 19,800 bayas, y cada trabajito descuenta 1,400 (como en el juego de GameCube).
const GC_NOOK_DEUDA = 19800;
const GC_NOOK_PAGO = 1400;
const GC_NOOK_JOBS = [
  { label: 'Pon las etiquetas:', texts: ['Pala, red y caña.', 'Muebles nuevos.', 'Hoy: ¡ofertas!'] },
  { label: 'Planta las flores del pueblo:', texts: ['Una rosa aquí.', 'Un tulipán allá.', 'Riega, riega.'] },
  { label: 'Entrega el paquete:', texts: ['Para: Nuez.', 'De: Tom Nook.', 'Frágil, sí, sí.'] },
];
const gcBayas = (n) => n.toLocaleString('en-US');

const GC_NPC_NOOK = {
  id: 'gc-nook', sprite: 'gc_nook', x: 15, y: 9,
  async talk(ctx) {
    const s = GCS();
    const jobs = s.nook || 0;
    if (jobs >= GC_NOOK_JOBS.length) {
      await ctx.say(gcTurn(ctx, 'gcNookN', [
        ['* Mi tienda va a crecer: Nook\'s Cranny, Nook \'n\' Go, Nookway...\n* ¡y Nookington\'s! Sí, sí.'],
        ['* ¿Que cuándo me pagas lo demás? ¡Cuando quieras!\n* ...Pero que sea pronto. Sí, sí.'],
        ['* Cuando termines de pagar, te tengo una casa MÁS GRANDE.\n* Con una deuda más grande. ¡Es una oferta!'],
      ]), 'TOM NOOK');
      return;
    }
    const debe = GC_NOOK_DEUDA - jobs * GC_NOOK_PAGO;
    await ctx.say([jobs === 0
      ? '* ¡Hola, hola! Soy TOM NOOK, de la Tienda de Nook.\n* ¿Ves esa casita? Es TUYA. Cuesta 19,800 bayas. Sí, sí.'
      : `* ¡Mi empleado favorito! Todavía debes ${gcBayas(debe)} bayas.`,
    '* ¿No traes bayas? ¡No pasa nada! Trabaja en mi tienda.\n* Cada trabajito te descuenta 1,400. Ponte el delantal.'], 'TOM NOOK');
    if (await ctx.choose(['trabajar', 'luego'], 'TOM NOOK') === 1) return;
    const job = GC_NOOK_JOBS[jobs];
    const res = await ctx.challenge({ label: job.label, texts: job.texts, timeLimit: job.texts.join('').length * 650 + 5000, caps: true });
    if (!res.completed) { await ctx.say(['* Hmm, hmm. Eso no quedó bien.\n* ¡Otra vez! El delantal no se quita solo.'], 'TOM NOOK'); return; }
    s.nook = jobs + 1;
    Save.write();
    if (s.nook < GC_NOOK_JOBS.length) {
      await ctx.say([`* ¡Excelente! Te descuento 1,400 bayas.\n* Ahora debes ${gcBayas(debe - GC_NOOK_PAGO)}. Sí, sí.`], 'TOM NOOK');
      return;
    }
    await ctx.say([`* ¡Terminaste tu trabajito! Debes solo ${gcBayas(debe - GC_NOOK_PAGO)} bayas.\n* Toma la llave de tu casita. ¡Sin prisa! ...Bueno, con poquita prisa.`], 'TOM NOOK');
    await ctx.give('llave_casa');
  },
};

const GC_KK_SONGS = [['K.K. Cubo', 'gc_kk_cubo'], ['K.K. Tecla', 'gc_kk_tecla'], ['K.K. Bellota', 'gc_kk_bellota']];
const GC_NPC_KK = {
  id: 'gc-kk', sprite: 'gc_kk', x: 17, y: 9,
  async talk(ctx) {
    const hoy = new Date().getDay();
    const sabado = hoy === 6;
    const first = !ctx.flag('gcKK');
    ctx.setFlag('gcKK');
    await ctx.say([first
      ? '* Hey, perrito. Soy K.K. SLIDER. En español me dicen TOTAKEKE.\n* Toco los sábados en la noche. Como en mi primer pueblo.'
      : gcTurn(ctx, 'gcKKN', [
        '* En mi primer pueblo las canciones se pedían escribiendo el título.\n* Si inventabas uno, te tocaba una rarita que no te podías llevar.',
        '* Mi nombre, Totakeke, viene de Kazumi Totaka, un músico de Nintendo.\n* Él también hizo la canción de la mansión de Luigi.',
        '* Hay una canción secreta que se llama "K.K. Song".\n* Pero esa es otra historia, perrito.',
      ]),
    sabado ? '* ¡Y hoy es SABADO! Concierto de verdad. ¿Qué te toco?'
      : `* Hoy es ${GC_DIAS[hoy]}. No es sábado... pero ensayo un poquito.\n* (Los sábados toca en serio. Y regala grabación.)`], 'K.K. SLIDER');
    const i = await ctx.choose([...GC_KK_SONGS.map(([t]) => t), 'adiós'], 'K.K. SLIDER');
    if (i >= GC_KK_SONGS.length) return;
    const [title, track] = GC_KK_SONGS[i];
    const res = await ctx.challenge({ label: 'Pídela escribiendo el título:', texts: [title], timeLimit: title.length * 700 + 4000, caps: true, strict: true });
    if (!res.completed) { await ctx.say(['* ¿Mande? Esa no me la sé, perrito.\n* Escríbela tal cual: con puntos y mayúsculas.'], 'K.K. SLIDER'); return; }
    Music.play(track);
    await ctx.say([`* K.K.: Esta se llama "${title}". Es nueva.\n* ♪ Bau, bau, ba-dau... ♫ (Canta en un idioma que nadie entiende. Todos lo sienten.)`], 'K.K. SLIDER');
    gcZoneMusic();
    if (sabado && !Save.data.treasures.grabacion_kk) {
      await ctx.say(['* K.K.: Gracias por venir un sábado, perrito.\n* Toma: una grabación para tu estéreo.'], 'K.K. SLIDER');
      await ctx.give('grabacion_kk');
    }
  },
};

// ---------- ESTACION VISOR ----------
const GC_NPC_LUIGI = {
  id: 'gc-luigi', sprite: 'gc_luigi', x: 17, y: 16,
  async talk(ctx) {
    if (!ctx.flag('gcLuigi')) {
      ctx.setFlag('gcLuigi');
      await ctx.say([
        '* ¡¡AAAH!! ...Ah, eres tú. Hola. Soy LUIGI. El de verde. El alto.',
        '* Una vez gané una mansión en un concurso... al que nunca entré.\n* Desde entonces cargo esta aspiradora: la POLTERGUST 3000.',
      ], 'LUIGI');
    } else {
      await ctx.say(gcTurn(ctx, 'gcLuigiN', [
        [Save.data.done.fantasmita ? '* ¿La fantasmita ya se calmó? Uf.\n* Yo la iba a aspirar... mañana. O pasado.' : '* Hay una fantasmita en la puerta del laboratorio. Se esconde en el cuadro.\n* Yo no voy. Tú ve. Yo te... echo porras.'],
        ['* Cuando tengo miedo, tarareo. Cuando prendo la luz de un cuarto, chiflo.\n* ¡Pregúntale a mi juego!'],
        ['* En mi mansión había 50 Boos escondidos. ¡Cincuenta!\n* Los conté todos. Temblando, pero los conté.'],
        ['* Mi juego salió el mismo día que la GameCube en Japón: 14 de septiembre de 2001.\n* Mario no salía. Por fin me tocó a mí.'],
      ]), 'LUIGI');
    }
    if (await ctx.choose(['aspirar juntos', 'adiós'], 'LUIGI') === 1) return;
    const texts = ['¡Aspira, Luigi!', 'Fuuuuum.', '¿Mario?'];
    const res = await ctx.challenge({ label: 'Ayuda a Luigi a aspirar (¡rápido!):', texts, timeLimit: texts.join('').length * 600 + 4000, caps: true });
    if (!res.completed) { await ctx.say(['* (Algo hizo "¡buh!" y Luigi se escondió detrás de ti.)\n* LUIGI: ¡Otra vez! Pero tú adelante.'], 'LUIGI'); return; }
    if (Save.data.treasures.gb_horror) { await ctx.say(['* ¡Atrapado! ...Era una pelusa. Pero una pelusa MUY grande.'], 'LUIGI'); return; }
    await ctx.say(['* ¡Lo logramos! Toma, el Game Boy Horror del Profesor E. Gadd.\n* Es mapa, radar y teléfono. Yo nada más lo uso para no estar solo.'], 'LUIGI');
    await ctx.give('gb_horror');
  },
};

// ---------- Los personajes entran a sus zonas ----------
[['gc-celeste', [GC_NPC_ABRIL, GC_NPC_LINK, GC_NPC_ABUELA, GC_NPC_TETRA]], ['gc-jardin', [GC_NPC_OLIMAR]],
  ['gc-bellota', [GC_NPC_NOOK, GC_NPC_KK]], ['gc-visor', [GC_NPC_LUIGI]]].forEach(([id, list]) => {
  const m = MAPS[id];
  if (m) m.npcs = [...(m.npcs || []), ...list];
});
