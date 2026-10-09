# Cómo agregar mundos y niveles

Guía para trabajar en mundos nuevos **en paralelo** sin pisarse. El diseño de cada mundo
(historia, enemigos, jefes, minijuegos, música) está en `docs/LORE.md`; este documento explica
**dónde va el código**.

## Regla de oro: cada mundo en sus propios archivos

| Qué | Dónde | ¿Compartido? |
|---|---|---|
| Datos del mundo (enemigos, niveles, tesoros, sprites, música, misiones) | `js/worlds/<id>.js` | No, es tuyo |
| Mecánica nueva (p. ej. carrera, plataformas, ritmo) | `js/scenes/<mecanica>.js` | No, es tuyo |
| Paleta de colores del mundo | `css/style.css` (`.theme-<id>`) | Sí: solo agrega un bloque |
| Estilos de tu mecánica | `css/style.css` (al final, sección propia) | Sí: solo agrega una sección |
| Cargar tus archivos | `index.html` (etiquetas `<script>`) | Sí: solo agrega líneas |

Si solo agregas (nunca editas lo de otros), los cambios se juntan sin conflictos.
Recomendado: una rama de git por mundo (`git switch -c mundo-snes`).

## 1. Registrar el mundo

Crea `js/worlds/<id>.js`:

```js
addWorld({
  id: 'snes',
  order: 3,                 // lugar de su tubería en la Plaza de las Tuberías (1-6)
  name: 'Reino 16-Bit',
  theme: 'snes',            // usa .theme-snes de css/style.css
  requires: 'nes',          // la tubería brota al rescatar esta consola
  console: 'snes',          // consola del mundo (informativo; quien la rescata es el jefe, ver abajo)
  nodes: ['modosiete', 'setita', 'nebula'],   // camino del mapa, en orden
  enemies: { /* un objeto por cada id de `nodes` (ver abajo) */ },
  treasures: { /* id: { name, desc, sprite? } */ },
  sprites: { /* id: [16 filas de 16 letras] (ver "Sprites") */ },
  tracks: { /* id: pista de música (ver "Música") */ },
  quests: {
    // mundo_<id> se activa sola cuando Bit anuncia la tubería nueva.
    mundo_snes: { name: 'El Reino 16-Bit', desc: '...' },
  },
});
```

Y cárgalo en `index.html`, junto a los otros mundos:

```html
<script src="js/worlds/snes.js"></script>
```

Con eso pasa todo solo:
- Al rescatar la consola de `requires`, en el pueblo **brota la tubería** del mundo, Bit la
  anuncia y empieza la misión `mundo_<id>`. Antes de eso no se ve nada (sin spoilers).
- La tubería lleva al mapa del mundo con los `nodes` en orden. Cada uno se desbloquea al
  terminar el anterior. Si el mundo tiene **zonas explorables** (sección 3c), la tubería
  lleva a caminar por ellas.
- Para abrir el mundo y probarlo sin jugar todo, en la consola del navegador:
  `Save.data.consoles.nes = true; Game.go('town')`.

## 2. Nodos del mapa (enemigos y niveles)

Cada nodo es una entrada en `enemies`. Campos que usa el mapa:

```js
nebula: {
  name: 'Reina Nébula',
  sprite: 'nebula',        // sprite de 4 tonos para el mapa
  boss: true,              // se dibuja más grande y lleva la etiqueta (JEFE)
  console: 'snes',         // solo el jefe: rescata la consola al ganar
  mode: 'battle',          // qué escena lo juega (si no se pone: 'battle')
  xp: 40,
  blurb: 'Texto corto que sale en el mapa.',
  keysHint: 'Qué practica (p. ej. "Acentos y frases largas")',
  // ...más campos según el modo (ver abajo)
}
```

### Modos que ya existen

| `mode` | Escena | Qué es | Campos propios |
|---|---|---|---|
| `battle` (por defecto) | `js/scenes/battle.js` | Combate estilo Deltarune: LUCHAR/ACTUAR/OBJETO/PERDONAR + lluvia de letras | `hp, atk, def, fightWords, words, intro, check, idle, calm, taunts, acts[], bullets{count, interval, speed, pool}, drop, console` (copia a Pixelito en `worlds/gb.js`) |
| `tecloides` | `js/scenes/tecloides.js` | Batalla de Tecloides contra un entrenador de `TRAINERS` (`js/tecloides.js`) | El id del nodo = id del entrenador |
| `mario` | `js/scenes/mario.js` | Nivel de plataformas por tecleo (Mundo 1-1) | — (el nivel está en `L11` dentro de la escena) |
| `tetrorey` | `js/scenes/tetrorey.js` | Jefe en 3 fases: batalla → lluvia de bloques → palabras en vertical | Los de `battle` + `blockWords`, `tallWords` |
| `chupin` | `js/scenes/chupin.js` | Batalla donde LUCHAR es ABSORBER (escribe la palabra inhalada) | Los de `battle` (`words` = palabras que flotan) |

Una escena puede **heredar de la batalla** con `Object.assign(Object.create(Scenes.battle), {...})` y cambiar
solo lo que necesite (mira `tetrorey.js`). Campos opcionales extra de un enemigo: `friend: true` (tiene `mode`
propio pero se puede perdonar, se muda al pueblo y cuenta en la misión "Amigos del pueblo") y `onWord(unit)` (se llama con cada palabra
terminada en la batalla, p. ej. para misiones de racha).
| `kongo` | `js/scenes/kongo.js` | Subir vigas saltando barriles con mayúsculas (`{ endless: true }` = arcade BARRILES) | — |
| `patos` | `js/scenes/patos.js` | Patos de Letras: atrapar patos escribiendo su letra (`{ turbo: true }` = sílabas) | — |
| `mazmorra` | `js/scenes/mazmorra.js` | Mazmorra por cuartos: puertas y cofres que se abren con frases; al fondo, combate con `tragabombas` | — |
| `punin` | `js/scenes/punin.js` | Boxeo: esquivar escribiendo el aviso, golpear cuando se marea | `drop` |
| `caparazon` | `js/scenes/caparazon.js` | Jefe del Mundo 2: saltar bloques al ritmo de un metrónomo | `console` |
| `wiigym` | `js/scenes/wii-gym.js` | Mundo 6: Entrenador Mi, 3 pruebas de ritmo (boliche, tenis por manos, box al compás). `{ arcade: 'boliche' \| 'tenis' \| 'box' }` = minijuego suelto | `drop` |
| `wiitorneo` | `js/scenes/wii-torneo.js` | Mundo 6: Tecloides 3 contra 3 (hereda de `tecloides`), esquivar con 20 % menos de tiempo | entrenador en `TRAINERS` |
| `cometa` | `js/scenes/wii-cometa.js` | Jefe del Mundo 6: lluvia desde 4 lados hacia un planeta, texto de cabeza/espejo, 7 estrellitas, caída libre | los de `battle` + `fallWords` |

Enemigos de la Wii en el combate normal: `wii: true` (+ `model`, `wiiTask`, `wiiDodge`) los pasa por `js/scenes/wii-battle.js` (3D, tareas propias y PAUSA con ESC en la lluvia).

Campos opcionales extra del modo `battle`: `caps: true` (exige mayúsculas con SHIFT), `music`,
`fightTime` (multiplica el tiempo de LUCHAR), `fightList(words)` y `fightUnit(unit, dmg, battle)`
(cambian las palabras y el daño; ejemplo: Tragabombas en `worlds/nes.js`). La batalla se pinta con
el `theme` del mundo dueño del enemigo. `TypingTask` y `Dodge` aceptan `caps: true` (usa `capsMatch`).

Las escenas del Mundo 2 comparten `js/nes-kit.js`: paleta `NES`, `paintNes()`, `nesArt()` (dibujos
NES → sprites con su propia paleta) y `nesScene({...})` (lienzo + panel + pausa con ESC).

### Crear una mecánica nueva (`mode` nuevo)

Crea `js/scenes/<mode>.js` con una escena:

```js
Scenes.carrera = {
  music: 'carrera',                 // opcional: pista que suena al entrar
  enter({ enemyId, back = 'map' }) {
    this.def = ENEMIES[enemyId];
    this.id = enemyId;
    this.back = back;
    // dibuja en Game.root.innerHTML
  },
  onKey(e) { /* e.key = tecla */ },
  exit() { /* limpia timers y requestAnimationFrame */ },
};
```

Al **ganar**, haz lo mismo que las otras escenas:

```js
Save.data.done[this.id] = true;              // abre el siguiente nodo del mapa
addXp(this.def.xp);                          // devuelve cuántos niveles subió
Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });  // estadísticas
if (this.def.console) Save.data.consoles[this.def.console] = true; // jefe: rescata la consola
Save.write();
Game.go(this.back);
```

Al perder, `Game.go('gameover', { enemyId, back, scene: '<mode>' })` ofrece reintentar.

## 3. Herramientas compartidas (úsalas, no las copies)

| Herramienta | Para qué |
|---|---|
| `new TypingTask(el, { label, texts, timeLimit, onUnit, onDone })` | Escribir palabras/frases contra el reloj. Ya respeta la dificultad. |
| `new ChoicePrompt(el, opciones, onPick, { prompt, tags })` | Elegir escribiendo una opción. `onPick(i, { ms, errors })` |
| `new Dodge(el, { count, interval, speed, pool }, { onHit, onDone })` | Lluvia de letras/palabras |
| `new Dialog(el, páginas, onDone)` / `new ListMenu(el, items, {...})` | Texto estilo RPG / menú con corazón |
| `keyMatches(esperada, tecleada)` | Compara sin importar acentos ni mayúsculas |
| `Stats.record(letra, ok)` | Registra cada tecla para el mapa de teclas difíciles |
| `pickWords(lista, n)` | Elige palabras con prioridad a las teclas que más falla |
| `diff().time / .speed / .dmg`, `scaledDmg(n)` | **Dificultad**: multiplica tus tiempos, velocidades y daño |
| `Quests.start(id)` / `Quests.complete(id)` | Misiones del diario |
| `Sfx.*`, `Music.play(id)` | Sonidos y música |
| `upper(texto)` | Mayúsculas sin acentos (la fuente no los tiene) |

**Dificultad:** si tu mecánica tiene un tiempo, multiplícalo por `diff().time`. Si algo se
mueve, multiplica su velocidad por `diff().speed`. Si algo hace daño, pásalo por `scaledDmg()`.

## 3b. El pueblo y el museo (ya funcionan solos)

- **Eras del pueblo** (`js/town-eras.js`): el pueblo toma la estética del mundo más avanzado
  abierto. Si tu mundo trae una era nueva, agrega su entrada en `HUB_ERAS` (paleta por casilla
  y por personaje). Si no, el pueblo se queda en la era anterior.
- **Amigos perdonados**: viven en el **barrio de su era**, cada uno en su casa (ver §3e).
  Agrega su id a la lista `friends` del barrio de tu mundo en `BARRIOS` y dale
  `townLine: '* ...'` y `townFacts: ['* Dato: ...']` (un dato real "propio" del personaje); al
  perdonarlo aparece frente a su casa con la estética de tu mundo y platica con `friendTalk`
  (ver "Curiosidades"). Si quieres una plática especial, agrega su NPC con
  `townFriend(id, { say, facts, curio, extra, bye })` (js/town-data.js). Sin barrio todavía,
  `home: [x, y]` en el enemigo sigue sirviendo como lugar de respaldo. Los amigos ya no salen
  en la vitrina.
- **Museo**: solo consolas y tesoros. Tus `treasures` salen solos en la sala de tu mundo; la consola sale si tu mundo
  tiene `console` y existe en `CONSOLES`.

## 3c. Curiosidades (datos con imagen)

Los amigos del pueblo y Don Chip enseñan **curiosidades**: un dato real de la consola con una
ilustración en pixel art (`js/curiosidades.js`). Agrega las de tu consola en tu `addWorld`:

```js
curiosities: {
  snes_modo7: {
    console: 'snes',                      // id de CONSOLES
    title: 'El Modo 7',                   // se muestra con upper()
    caption: 'El Modo 7 giraba y agrandaba el piso para fingir 3D.',  // 1 a 3 renglones
    draw(g, w, h) {                       // canvas de 384 x 240
      const p = pixelArt(g, w, h, 64, 40, '#1a1a2e');   // cuadrícula de 64 x 40 "píxeles"
      p.r(x, y, ancho, alto, color);      // rectángulo
      p.round(x, y, ancho, alto, relleno, contorno);   // caja con esquinas redondas
      p.rows(x, y, ['.ab.', 'abba'], { a: '#fff', b: '#f00' });  // dibujito con letras
    },
    // o, sin draw: rows: [...], palette: { a: '#fff' }, bg: '#000'
  },
},
```

(Si tu archivo se carga después de `js/curiosidades.js`, también sirve `addCuriosities({...})`.)
Usa los colores de tu consola, y **solo datos reales y verificables**.

- **Mínimo 5 curiosidades por consola** (hoy: Game Boy 6, NES 6, Super Nintendo 5, N64 5).
  Para dibujar hay ayudas: `pixText(p, x, y, '1996', color, tamaño)` (números y algunas
  letras de 3×5), `drawGameBoy`, `drawN64Pad`, `ARROWS`, `SPARKLE`.
- `friendTalk(ctx, enemyId, { say, facts, curio, extra, bye })`: plática de un amigo. Dice su línea y
  ofrece `cuéntame un dato` (sus `facts` + los `facts` de su consola en `CONSOLES`) y
  `enséñame algo` (las curiosidades de su consola). No repite hasta agotarlos.
- `showCuriosity(ctx, id)`: abre el visor desde cualquier guion del pueblo (promesa; ENTER cierra).
- Atajo para probar en la consola del navegador: `showCuriosity(null, 'gb_tetris')`.

## 3d. Zonas explorables (caminar por el mundo, como en Deltarune)

El pueblo y las zonas de los mundos usan el **mismo motor** (`Scenes.town`, en
`js/scenes/town.js`). Un mundo con zonas entra caminando por su tubería; un mundo sin zonas
sigue usando el mapa de paradas (`js/scenes/map.js`). Ejemplo completo: `js/worlds/gb-mapa.js`.

Crea `js/worlds/<id>-mapa.js` (cárgalo en `index.html` **después** de `js/worlds/<id>.js`):

```js
addMaps('snes', {
  entry: { map: 'snes-jardin', spawn: [3, 12, 'up'] },   // dónde apareces al entrar por la tubería
  maps: {
    'snes-jardin': {
      name: 'Jardín del Reino',         // sale en el letrero al entrar
      theme: 'snes',                    // paleta (opcional; por defecto la del mundo)
      music: 'snes_jardin',             // pista de TRACKS (por defecto 'title')
      ground: 'grass',                  // casilla que se pinta debajo de todo (opcional)
      map: [                            // filas del mismo largo, mínimo 20×15 (casillas de 32 px)
        'TTTTTTTTTTTTTTTTTTTT',
        // ...
      ],
      tiles: {                          // leyenda extra; se mezcla con TILES (js/town-data.js)
        B: { s: 'bloque', solid: true, look: 'muro' },  // s = sprite; solid = no se pasa
        '=': { s: 'puente' },                            // tall: true = pasto alto
        // también: under (sprite de abajo), colors ({ a, b, c, d } propios)
      },
      spawns: { start: [3, 12, 'up'] },              // lugar por defecto si no se da spawn
      signs: { '5,10': '* Texto del letrero' },      // por casilla 'x,y' (texto o lista de páginas)
      looks: { muro: '* Un muro muy alto.' },        // lo que se ve al revisar casillas con `look`
      npcs: [{ id: 'jardinero', sprite: 'viejo', x: 7, y: 9, when: () => true, async talk(ctx) { /* ... */ } }],
      encounters: [{ enemy: 'setita', x: 10, y: 6, say: ['* ¡Alto!'] }],   // say es opcional
      chests: [{ id: 'snes_mapa', x: 2, y: 2, treasure: 'mapa_reino', word: 'castillo' }],
      exits: {
        '3,13': { pueblo: 'snes' },                           // al pueblo, junto a la tubería del mundo
        '19,6': { map: 'snes-castillo', spawn: [1, 6, 'right'] },   // a otro mapa
      },
      wild: ['setita', 'modosiete'],    // salen en el pasto alto, solo si ya los venciste
      wildRate: 0.07,                   // probabilidad por paso en pasto alto (opcional)
      bitTips: ['* Lo que dice Bit en esta zona.'],
      variants: [                       // el mapa cambia con el progreso (la última que se cumpla)
        { when: () => !!Save.data.done.setita, map: [/* filas */], npcs: [/* se agregan */] },
        // opcionales en la variante: id + announce (Bit lo dice una vez), regions, signs, homes
      ],
      regions: [{ x0: 20, y0: 0, x1: 31, y1: 14, era: 'gb', name: 'Barrio Game Boy' }], // otra paleta
      homes: { donchip: [7, 5] },       // dónde se para cada NPC (o función (variante) => {...})
    },
  },
});
```

Cómo funciona:
- **Encuentros**: el enemigo se ve parado en el mapa con su sprite (más grande si es `boss`).
  Chocar con él o darle ENTER parpadea la pantalla y abre `ENEMIES[id].mode || 'battle'` con
  `back: 'town'`. Al ganar (o perdonar) regresas al mismo lugar y ya no está
  (`Save.data.done[id]`). **Ponlos en pasos angostos**: así el orden del mundo sale del mapa.
- **Cofres**: sprite `cofre`. Al abrirlo hay que escribir su `word` (respeta la dificultad);
  da su `treasure` y queda abierto para siempre (flag `chest_<id>`, sprite `cofre_abierto`).
  Usa tesoros nuevos de tu mundo (en `treasures` de `addWorld`).
- **Salidas**: al pisar la casilla. Si la casilla es una tubería (`P`), el jugador se hunde.
- **Variantes**: sirven para abrir caminos (p. ej. quitar rocas después del jefe). Sus `npcs`
  se **suman** a los del mapa base; no cambies coordenadas de lo que ya existe. Sus `regions`
  y `signs` se suman a las del mapa; con `id` y `announce: ['* ...']`, Bit lo anuncia una vez.
- **Regiones** (`regions`): rectángulos que se pintan con la paleta de otra era (`HUB_ERAS` o
  `BARRIO_ERAS` de js/town-eras.js). Los personajes sin `era` propia, el jugador y Bit
  también toman la paleta de la región donde están. Si tiene `name`, sale un cartel al entrar.
- **Casas** (`homes`): `{ idNpc: [x, y] }` gana sobre el `x, y` del NPC. El pueblo lo usa para
  mandar a cada amigo a su casa.
- **Letreros** (`signs`): el texto también puede ser una función (por ejemplo, la puerta de una
  casa dice de quién es solo si ese amigo ya llegó).
- **ESC** en un mundo abre "Seguir explorando / Volver al pueblo". En el pueblo va al título.
- Se guarda el mapa y la casilla en `Save.data.pos`: "Continuar" regresa ahí.
- Lo exclusivo del pueblo (tuberías, eras, museo, intro de Bit) solo pasa en el mapa `pueblo`.
- **Valida tu mapa**: haz un BFS en Node que, venciendo a los enemigos en orden, compruebe que
  cada uno es alcanzable y el siguiente todavía no (como se hizo para el Valle Game Boy).

Para probar desde la consola del navegador:

```js
Game.go('town', { map: 'gb-valle', spawn: [3, 26, 'up'] });   // ir directo a una zona
Save.data.done.tetrorey = true; Game.go('town');               // ver una variante
```

## 3e. El pueblo crece: barrios por era

El Pueblo Vitrina crece con los amigos que haces (`BARRIOS` en `js/town-data.js`). Cada barrio
es un pedazo de mapa que se pega a la derecha o abajo del pueblo (lo que ya existe no se mueve)
y se construye cuando hay `min` amigos en total **y** su mundo (`world`) está abierto. Cada
etapa es una variante del pueblo con sus `regions` (el barrio se pinta con la paleta de su era,
aunque el resto del pueblo esté en otra), letreros y anuncio de Bit.

| Etapa | Cuándo | Mapa |
|---|---|---|
| Pueblo de siempre | 0-2 amigos | 20×15 |
| + Barrio Game Boy (este) | 3 amigos | 32×15 |
| + Barrio 8 Bits (sur) y tienda de Doña Tecla | 8 amigos + Castillo 8-Bit abierto | 32×27 |
| + Barrio 16 Bits (sureste) y Sala de Arcade de la Maestra Modo | 13 amigos + Reino 16-Bit | 32×27 |
| + Barrio Polígono (más al este) y quiosco de Ocarín | 18 amigos + Isla Polígono | 44×27 |

Con la Isla Polígono abierta, el pueblo entero pasa a la **era Polígono** y se ve en 3D (§3f).

Agregar el barrio de un mundo nuevo:

```js
// En BARRIOS (js/town-data.js), al final (el orden es el orden de construcción):
{
  id: 'gc', era: 'gc', name: 'Barrio Cubo', x: 44, y: 0, min: 24, world: 'gc',
  friends: ['enemigo1', 'enemigo2'],        // una casa por amigo, en orden de lectura
  sign: [44, 5, '* BARRIO CUBO\n* ...'],     // letrero de la entrada (casilla S del pedazo)
  places: { idNpc: [x, y, 'TITULO', '* texto de la puerta'] },  // lugares con dueño (opcional)
  map: [ /* filas del mismo largo; h = puerta de una casa, el amigo se para justo abajo */ ],
},
```

- Agrega en `TOWN_GATES` las casillas de paso entre tu pedazo y los vecinos (son árbol
  mientras tu barrio no exista) y una frase en `BARRIO_NEWS`.
- Si la era todavía no es de todo el pueblo, pon su paleta en `BARRIO_ERAS` (js/town-eras.js).
  Si es 3D, ponle `render: '3d'`: con el pueblo ya en 3D, su barrio va con polígonos (§3f).
- Si un amigo llega antes que su barrio, espera en el pueblo viejo (`TOWN_CAMP`); los lugares
  sin barrio usan `PLACE_CAMP`.
- **Valida** con un BFS en Node, en cada etapa y con muchas combinaciones de amigos: filas del
  mismo ancho, cada NPC en casilla caminable y distinta, y que se llegue a cada amigo, letrero,
  tubería y a la puerta del museo.

Para probar desde la consola del navegador:

```js
Object.assign(Save.data.consoles, { gameboy: true, nes: true, snes: true });   // abrir mundos
BARRIOS.flatMap((b) => b.friends).slice(0, 13).forEach((id) => { Save.data.spared[id] = true; });
Game.go('town');                       // el pueblo con los barrios que tocan
townStage();                           // cuántos barrios hay (0-4)
```

## 3f. Zonas en 3D (N64, GameCube, Wii...)

Desde la N64 las zonas se ven en **3D de verdad**, pero se juegan **igual**: mismas filas de
casillas, mismas flechas casilla por casilla, mismos encuentros, cofres, salidas, letreros,
pasto alto, variantes y ESC. `Scenes.town` hace toda la lógica; el **renderer 3D**
(`js/scenes/town3d.js`, clase `Town3D`) solo dibuja. Ejemplo completo: `js/worlds/n64-mapa.js`.

Para que un mapa se dibuje en 3D, agrega `render: '3d'` (y, si quieres, `view3d`):

```js
'gc-plaza': {
  name: 'Plaza Cubo',
  render: '3d',
  view3d: {
    edge: 'sea',          // fuera del mapa: 'sea' (mar), 'grass', 'forest' (pasto y pinos) o 'void' (islas flotantes)
    fog: [22, 70],        // niebla: empieza y termina (en unidades; 1 casilla = 2)
    fogColor: '#C9D6E3', sky: '#9FD3FF',
    missing: false,       // parches MISSING en el cielo (los de la Isla Polígono)
    cam: [11.5, 9],       // cámara: altura y distancia detrás del jugador
  },
  tiles: {
    '^': { s: 'grass', colors: {...}, h: 1.2 },             // h = altura del suelo (mesetas, escalones)
    p: { s: 'tree', solid: true, d3: 'palm' },              // d3 = qué modelo 3D usar
    b: { s: 's16_puente', d3: 'bridge', over: 'void' },      // puente colgado sobre el vacío
    v: { s: 'water', solid: true, d3: 'void' },             // vacío: no hay suelo
  },
  decor3d: [{ model: 'bear', path: [[24, 2], [26, 2]], speed: 0.8 }],  // adornos que caminan (Poly.models)
  // ... todo lo demás igual que en §3d (map, npcs, encounters, chests, exits, signs, wild...)
},
```

Cómo se dibuja cada casilla (en `Town3D.prop`):
- **Suelo**: un cuadro con la textura de su sprite de 16 px (los mismos colores que el 2D). En lo
  3D va con filtro suave (borroso, como la N64); en los barrios de eras viejas, nítido.
- **Por sprite** (si no trae `d3`): `water` agua (más abajo, con plano transparente), `tree` pino,
  `roof`/`wall`/`door` casa (las casillas pegadas se juntan en UNA casa con techo de dos aguas,
  puertas y ventanas), `pipe` tubería, `sign` letrero, `cave` cueva, `rock` roca, puentes.
  Sólida sin modelo = bloque con la textura de su sprite. Caminable = suelo.
- **`d3`** disponibles: `palm`, `rock`, `cliff`, `bridge`, `void`, `fog` (suelo con nubecitas),
  `castle` (muralla con almenas), `tower`, `pillar`, `wall` (muro con franja, `c3`/`c3b`),
  `stand` (gradas que miran a la cancha), `tire`, `itembox` (caja ? que gira), `missing`,
  `cube`, `tv`, `chair`, `mask`. Opcionales: `bh` (alto del bloque), `c3` (color).
- Las paredes de tierra/roca entre alturas distintas salen solas; junto al vacío, la roca cuelga.
- **Personajes**: si su sprite (o `model` del enemigo) existe en `Poly.models`, se ve el modelo
  3D; si no, un **cartón** (billboard) con su sprite y la paleta de SU era. El jugador es el
  héroe 3D. Para un mundo nuevo, agrega sus modelos a `Poly.models` (js/scenes/poly3d.js) y su
  sprite a `T3_MODELS` (town3d.js).
- **Regiones de eras 2D** (`regions` con era sin `render: '3d'`): se ven como relieves de pixel
  art (bloques con su sprite, árboles de dos planos cruzados) con su paleta original.

Reglas para que vaya fluido: todo lo quieto se **junta en pocas mallas** (`T3Bake`: una por
material), sin sombras, render a 320×240 escalado (como `poly3d.js`) y `dispose()` al salir
(libera el contexto WebGL). Si three.js no carga, el 2D de siempre se queda (con la paleta de
la era) y aparece "SIN MOTOR 3D: MODO CLASICO".

**El pueblo en 3D**: una era con `render: '3d'` en `HUB_ERAS` (js/town-eras.js) dibuja el pueblo
con este renderer. La primera vez, `Town3D.riseTo()` hace la cinemática: el pueblo plano (el
dibujo 2D de la era anterior) se ve desde el cielo, los árboles y casas se levantan en ondas
desde el jugador y la cámara baja detrás de él. Los barrios viejos siguen con su estética.
Para GameCube/Wii: agrega su era a `HUB_ERAS` con `render: '3d'` y sus `ERA_CHANGE_LINES`.

**Valida** con el BFS de siempre (las casillas y reglas son las mismas que en 2D).

Para probar desde la consola del navegador:

```js
Save.data.flags.metBit = true; Object.assign(Save.data.consoles, { gameboy: true, nes: true, snes: true });
Game.go('town', { map: 'n64-playa' });             // la Isla Polígono en 3D
Save.data.flags.hubEra = 'snes'; Game.go('town', { map: 'pueblo' });   // ver al pueblo levantarse
Scenes.town.r3                                     // el renderer 3D activo (null = 2D)
```

## 4. Sprites

Dibujos de 16×16 con letras, en `sprites` de tu mundo:
`.` transparente · `a` más claro · `b` claro · `c` oscuro · `d` más oscuro.
Se pintan con la paleta del mundo (`.theme-<id>`), así que el mismo dibujo cambia de color
por mundo. Si un sprite necesita sus propios colores, ponlos en `palettes` de tu mundo
(`{ id: { a, b, c, d } }` en hex; ganan sobre la paleta del mundo). Para dibujos a todo color en un
canvas propio (como Mario), mira `paintNes()` en `js/nes-kit.js`.

## 5. Música

Pistas en `tracks` de tu mundo. Notación: `'E5/2'` = Mi de la octava 5 durante 2 pasos
(1 paso = semicorchea); `'-'` silencio; en la voz `noise`, `'x'` es un golpe. Todas las voces
deben sumar los mismos pasos (64 está bien) para que el loop no se desfase; `intro` suena una
vez antes del loop. Ejemplos en `js/music.js`.

**Melodías originales** (inspiradas en el estilo, no copiadas): la música real tiene derechos.

## 6. Convenciones

- Todo en español. Los enemigos "huyen", no mueren.
- Mayúsculas en pantalla sin acentos (`RECORD`, no `RÉCORD`); usa `upper()`.
- Datos curiosos: solo si son reales y verificables.
- Personajes reales de Nintendo se valen "de vez en cuando" (proyecto personal), mezclados
  con los propios del lore.

## 7. Probar

Abre `index.html` (o sirve la carpeta con `python3 -m http.server`). Atajos en la consola del
navegador:

```js
Save.data.seenIntro = true; Save.data.flags.metBit = true;   // saltar la intro
Save.data.consoles.nes = true;                               // abrir el mundo que pide la NES
Game.go('map', { world: 'snes' });                           // ir directo al mapa de un mundo
Game.go('battle', { enemyId: 'nebula' });                    // ir directo a un nodo
localStorage.removeItem('teclaquest_v1'); location.reload(); // empezar de cero
```
