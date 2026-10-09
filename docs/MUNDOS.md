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
  terminar el anterior.
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
propio pero se puede perdonar y sale en AMIGOS de la vitrina) y `onWord(unit)` (se llama con cada palabra
terminada en la batalla, p. ej. para misiones de racha).

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

## 4. Sprites

Dibujos de 16×16 con letras, en `sprites` de tu mundo:
`.` transparente · `a` más claro · `b` claro · `c` oscuro · `d` más oscuro.
Se pintan con la paleta del mundo (`.theme-<id>`), así que el mismo dibujo cambia de color
por mundo. Para sprites a todo color (como Mario), mira `paintNes()` en `js/scenes/mario.js`.

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
