# TECLA QUEST — Biblia de Lore y Diseño

> Documento de referencia para crear el contenido del juego. Todo lo que está aquí es
> implementable con las mecánicas existentes (batalla Deltarune, overworld por casillas con
> diálogo escrito, retos de tecleo) y las que se están construyendo (motor chiptune, batalla de
> monstruos, marco de minijuegos, diario de misiones).
>
> Convenciones: los textos de juego van en español de México/Latinoamérica, tono cálido y
> chistoso, sin groserías. Nadie "muere": los enemigos **huyen**, se **desarman**, se **apagan**
> o se **hacen amigos**. Las acentos y la Ñ son opcionales en los mundos 1 y 2, y se vuelven
> requisito a partir del Mundo 3 (ver §9).
>
> Nota de consistencia: todo lo que ya existe en `js/data.js` y `js/town-data.js` (Pixelito,
> Cartuchón, Pilabat, Tetro Rey, Bit, Don Chip, Champi, el Anciano, Toby, el Roncatón, los
> tesoros, los datos curiosos) se conserva tal cual. Este documento lo amplía.

---

## Índice

1. [Arco general](#1-arco-general)
2. [Personajes recurrentes](#2-personajes-recurrentes)
3. [Sistemas compartidos (Tecloides, minijuegos, diario)](#3-sistemas-compartidos)
4. [Mundo 1 — Valle Game Boy](#4-mundo-1--valle-game-boy-1989)
5. [Mundo 2 — Castillo 8-Bit (NES)](#5-mundo-2--castillo-8-bit-nes-1985)
6. [Mundo 3 — Reino 16-Bit (Super Nintendo)](#6-mundo-3--reino-16-bit-super-nintendo-1990)
7. [Mundo 4 — Isla Polígono (Nintendo 64)](#7-mundo-4--isla-polígono-nintendo-64-1996)
8. [Mundo 5 — Cubo Galáctico (GameCube)](#8-mundo-5--cubo-galáctico-gamecube-2001)
9. [Mundo 6 — Ciudad Sensor (Wii)](#9-mundo-6--ciudad-sensor-wii-2006)
10. [Final — El Canal Vacío](#10-final--el-canal-vacío)
11. [Post-game y mundo secreto — La Cueva Roja](#11-post-game-y-mundo-secreto--la-cueva-roja)
12. [Pueblo Vitrina a lo largo del juego](#12-pueblo-vitrina-a-lo-largo-del-juego)
13. [Progresión de mecanografía](#13-progresión-de-mecanografía)
14. [Música](#14-música)
15. [Prioridades de implementación](#15-prioridades-de-implementación)
16. [Apéndice: listas de palabras sugeridas por mundo](#16-apéndice-listas-de-palabras-por-mundo)

---

## 1. Arco general

### 1.1 Premisa (en tres frases)

Las consolas antiguas de Don Chip vivían felices en una vitrina hasta que un **apagón
mágico** las mandó dentro de sus propios juegos, donde quedaron atrapadas y custodiadas por
monstruos de píxeles. El héroe (tú, sin nombre, sin voz) y Bit, un cursor con ojos, las van
rescatando mundo por mundo a punta de teclado, descubriendo que el apagón no fue un
accidente: lo provocó **El Glitch**, un personaje de un juego que nunca se terminó y que tiene
miedo de que lo olviden. Al final, el héroe puede vencerlo... o hacer lo que nadie hizo en
treinta años: **escribir su nombre** y darle un lugar en la vitrina.

### 1.2 El orden de los mundos y por qué

| # | Mundo | Consola | Año | Motivo narrativo |
|---|-------|---------|-----|------------------|
| 1 | Valle Game Boy | Game Boy | 1989 | Ya existe. Paleta de 4 tonos: perfecta como tutorial. Es la consola "del bolsillo", la que más cerca estaba de la puerta del museo. |
| 2 | Castillo 8-Bit | NES | 1985 | La más antigua de las caseras. Aquí se descubre que el apagón fue provocado. |
| 3 | Reino 16-Bit | Super Nintendo | 1990 | Más colores, más velocidad. Aparece el Glitch en persona por primera vez. |
| 4 | Isla Polígono | Nintendo 64 | 1996 | El salto al 3D. Se obtiene la **flauta** que despierta al Roncatón. |
| 5 | Cubo Galáctico | GameCube | 2001 | El Glitch crea copias de los jefes anteriores. Se entiende su motivo. |
| 6 | Ciudad Sensor | Wii | 2006 | El mundo más "moderno" y el más cercano al presente. El Glitch intenta apagarlo todo. |
| F | El Canal Vacío | — | — | El juego que nunca existió. Batalla final. |
| S | La Cueva Roja | Virtual Boy | 1995 | Mundo secreto post-game, detrás del Roncatón. |

Se respeta el orden de `WORLDS` en `data.js` (GB → NES → SNES → N64 → GC → Wii). La Game Boy
va antes que la NES aunque sea más nueva porque el jugador ya empezó ahí y porque su paleta
de 4 colores es el mejor tutorial visual. En el juego se explica con una frase de Don Chip:
*"La Game Boy estaba junto a la puerta; las demás están más adentro del museo... y más
adentro de sus juegos."* Cada mundo está "más profundo" dentro del museo: el museo es como
una mazmorra de la que cada sala es una era.

### 1.3 El villano: EL GLITCH

**Quién es.** Un personaje de un cartucho que nunca se terminó: un prototipo de 1989 sin
etiqueta, sin título, sin nombre de protagonista. En la pantalla de "ESCRIBE TU NOMBRE" de su
juego, nadie escribió nunca nada. Durante treinta años vivió en la vitrina de Don Chip, en un
cajón, oyendo cómo los demás juegos recordaban sus aventuras con cariño. Él no tenía ninguna.

**Cómo se ve.** Un cuerpo de píxeles que no se decide de forma: a veces parece un héroe de
RPG, a veces un cursor, a veces un montón de estática. Tiene un color que **ninguna consola
del juego puede mostrar**: magenta eléctrico `#FF00FF` sobre negro, con rayas horizontales de
"señal mala". En cada mundo, su color aparece como una mancha imposible dentro de la paleta
(un píxel magenta en el Valle Game Boy es una señal de que anduvo por ahí).

**Qué hizo.** Aprendió a mover la estática ("el ruido") y provocó el apagón para mandar a las
consolas dentro de sus juegos. Su lógica, entendible para un niño:

> *"Si todas las consolas se quedan dentro de sus juegos para siempre, nadie las va a apagar
> nunca. Nadie va a cerrar la vitrina. Nadie va a olvidar a nadie. Ni a mí."*

No quiere destruir nada. Quiere **congelar** todo en un "pausa" eterno. Por eso sus poderes son
de pausa, estática, repetición y borrado: enemigos que repiten la misma frase, jefes que
"se traban", letras que se congelan en el aire.

**Cómo habla.** Con letras que a veces se corrompen. En el texto del juego, reemplazar 1 de cada
8 letras por `#`, `%` o `▒` en sus primeras apariciones; cada vez que avanza la historia,
habla más limpio. En la batalla final habla perfecto. Nunca grita; habla bajito, como quien
no está acostumbrado a que lo escuchen.

Frases de ejemplo:
- *"N%die me pr#gunta mi n▒mbre. Porque no tengo."*
- *"¿Sabes qué pasa cuando apagas una consola sin guardar? ...Yo soy lo que pasa."*
- *"Tú tampoco tienes nombre. Somos iguales. ...¿Verdad?"* (siembra para el final)
- *"No las estoy encerrando. Las estoy CUIDANDO."*

**El giro amable (final estilo Deltarune).** En la batalla final, cuando la barra de PAZ se
llena, aparece la pantalla de su juego inédito: `NOMBRE: _______`. El jugador **escribe un
nombre** (libre; se guarda en `Save.data.glitchName`). Es el único momento del juego donde
se teclea sin tiempo límite y sin contar errores. El Glitch se "compila" por primera vez:
sus píxeles toman forma estable (un chico pequeño con una gorra de píxeles y el color
magenta ya solo en la bufanda). Se muda al Pueblo Vitrina como el último "amigo perdonado" y
su cartucho entra a la vitrina con el nombre que el niño eligió. Si el jugador elige
vencerlo peleando, el Glitch se desarma en estática, se guarda como "CARTUCHO SIN NOMBRE" en
la vitrina y Bit dice: *"...Creo que había otra forma. Si quieres, un día volvemos."* (se
puede repetir la batalla desde el museo).

### 1.4 Cómo escala la historia (mundo por mundo)

| Mundo | Lo que pasa | Pista que se siembra |
|------|-------------|----------------------|
| GB | Rescate de la Game Boy (ya existe). | Al derrotar/perdonar a Tetro Rey, dice: *"Yo no quería... algo me puso a girar y no me dejaba parar."* En la vitrina, aparece un **cartucho sin etiqueta** que "no se puede revisar todavía". |
| NES | Las 3 torres del Castillo: *"tu consola está en otro castillo"* dos veces. El jefe Lord Caparazón repite su frase como disco rayado: está "trabado". Al liberarlo confiesa que una **sombra morada** lo congeló. | Don Chip recuerda: *"Hubo un apagón de verdad en 1989... pero este no fue de la luz."* Champi: la nota en la casa cerrada ("Salí a jugar, vuelvo en 5 minutos, 1989"). |
| SNES | Primer encuentro cara a cara con El Glitch, que huye tras un diálogo corto. Aparece el rival Dani Turbo diciendo que "un tipo morado" le dio un Tecloide raro. | El Tecloide del rival se llama "???" y tiene tipo desconocido. El Glitch deja caer un objeto: **Etiqueta en blanco**. |
| N64 | Se obtiene la **Flauta Polígono** (jefe Ocarina). El Glitch intenta pausar el mundo entero: el cielo se queda a medio render. | El Anciano de la cueva empieza a hablar del "juego que nunca salió". Se abre la Cueva del pueblo (ver §12). |
| GC | El Glitch invoca **copias de los jefes anteriores** (guiño Smash). Al final del mundo, muestra su pantalla de nombre vacía. Bit se queda callado por primera vez. | Don Chip encuentra la caja del prototipo en el sótano: *"Lo compré en una venta de garaje. Nunca prendió. Nunca lo tiré... no sé por qué."* |
| Wii | El Glitch intenta apagar la Ciudad Sensor con un "apagón definitivo". El jefe Capitán Cometa ayuda a mantener la gravedad. Al final se abre **El Canal Vacío**. | Todos los amigos perdonados del pueblo te dan una frase cada uno para la batalla final (ver §10). |
| Final | Batalla en 3 fases + decisión. | — |
| Post | Cueva Roja (Virtual Boy), torneo de Tecloides, Modo Turbo. | — |

### 1.5 Temas (para que todo el texto apunte al mismo lado)

- **Teclear es recordar.** Cada palabra escrita "guarda la partida" de alguien. Los enemigos
  perdonados se mudan al pueblo: literalmente les das un lugar.
- **Nadie es obsoleto.** Las consolas viejas no son basura; son historia. Los datos curiosos
  refuerzan esto.
- **Tener nombre.** El héroe no tiene nombre fijo; el Glitch tampoco. La diferencia es que el
  héroe tiene amigos que lo llaman "tú". El final resuelve esto.

---

## 2. Personajes recurrentes

### 2.1 El héroe

Silencioso, sin nombre fijo. En diálogos, los demás le dicen "tú", "héroe", "dedos rápidos",
"campeón del teclado". Nunca aparece un nombre en pantalla. Sprite: niño/niña genérico con
gorra; en cada mundo cambia a la paleta local (en N64 se ve "poligonal", en GC con brillito).

### 2.2 BIT (compañero)

- **Qué es:** el cursor que vivía en el teclado. Un rectangulito parpadeante con dos ojos.
- **Personalidad:** entusiasta, parlanchín, fan de los datos curiosos, un poquito miedoso con
  las cosas que se quedan quietas (porque un cursor que no parpadea es un cursor muerto).
- **Función en juego:** explica mecánicas nuevas, da pistas si el jugador se atora (si hay 3
  derrotas seguidas contra el mismo jefe, sugiere ACTUAR o el minijuego correspondiente), y
  dice una línea especial por mundo cuando el jugador se queda quieto.
- **Cómo habla:** frases cortas, muchas exclamaciones, usa "¡Órale!", "¡Qué chido!", y hace
  chistes malos de computadora.
- **Arco:** en el Mundo 5 descubre que él también salió "de un juego que nadie terminó": Bit
  era el cursor del prototipo del Glitch, que se escapó al teclado. Por eso el Glitch lo busca.
  Bit lo cuenta con nervios: *"...Entonces, técnicamente, él es mi hermano. Mi hermano
  mayor. ¡Mi hermano mayor que da miedo!"*

Frases por mundo cuando el jugador está quieto:
- GB: *"...Pssst. ¿Te quedaste sin pilas?"*
- NES: *"¿Sabías que en 1985 el control solo tenía dos botones? ¡Y bastaban!"*
- SNES: *"Mira el piso. ¿Ves cómo gira? Eso se llamaba Modo 7. No sé por qué 7."*
- N64: *"Cuidado con la cámara. En esta época la cámara era un enemigo más."*
- GC: *"Esta consola tenía manija. Yo también quiero manija."*
- Wii: *"Aquí todos se mueven agitando los brazos. Yo no tengo brazos. Qué envidia."*

### 2.3 DON CHIP (El Coleccionista)

- **Quién es:** dueño del museo. Señor mayor, lentes gruesos, chaleco con pins de consolas.
- **Personalidad:** sabelotodo cariñoso. Cada dato lo dice como si fuera un secreto.
- **Función:** entrega los datos curiosos, abre la vitrina, da el cartucho de Bloques, y en
  cada mundo rescatado agrega un ala nueva al museo (ver §12). Es también quien revela, en el
  Mundo 5, la historia del cartucho sin etiqueta.
- **Frases:** *"¡No soples los cartuchos!"*, *"Eso, mi joven amigo, es HISTORIA."*, *"En mis
  tiempos, guardar la partida era un lujo."*

### 2.4 EL GLITCH (villano) — ver §1.3

### 2.5 DANI TURBO (rival de Tecloides)

- **Quién es:** niño de tu edad con lentes de sol de píxeles y una bufanda roja. Dice ser "el
  tecleador más rápido del museo". Escribe con dos dedos, pero rapidísimo (chiste recurrente:
  Bit dice que eso no cuenta).
- **Personalidad:** presumido pero no malo. Al estilo rival de Pokémon: aparece justo cuando
  no lo esperas, te reta, pierde, dice que te dejó ganar. Con el tiempo se vuelve tu amigo y
  en el final te presta su equipo.
- **Equipo:** 3 Tecloides que evolucionan de mundo a mundo (ver §3.1). En el Mundo 3 recibe
  del Glitch un Tecloide "???" de tipo ESTÁTICA que no obedece bien; en el Mundo 5 lo libera.
- **Frases:** *"¡Ja! ¿Eso fue un intento? Yo tecleo más rápido dormido."*, *"Te dejé ganar.
  Para que no llores."*, *"...Ok, ok. Fuiste rápido. No se lo digas a nadie."*
- **Aparece en:** GB (pasto alto, primer combate de Tecloides), SNES (Arena Modo 7), N64
  (Estadio Polígono), Wii (Torneo Sensor) y en el post-game (torneo del pueblo).

### 2.6 LA PROFESORA LETRA

- **Quién es:** la entrenadora/científica que te regala tu primer Tecloide. Bata blanca con
  botones de teclado, pelo recogido con un lápiz.
- **Función:** explica tipos y ventajas, cura a tu equipo en cada mundo (tiene un "Centro
  Tecloide" en su laboratorio del pueblo a partir del Mundo 1).
- **Frases:** *"¡Bienvenido al mundo de los TECLOIDES! Criaturas que viven en las teclas."*,
  *"Un Tecloide bien escrito nunca falla."*

### 2.7 EL ANCIANO DE LA CUEVA

Ya existe (da la espada de madera). Se amplía: es el guardián de la Cueva del pueblo. Fue
"probador de juegos" en su juventud. Sabe del cartucho sin nombre. En el Mundo 4 abre la cueva
y vende mapas; en el post-game es quien explica la Cueva Roja. Habla lento, con "...", y
siempre termina con un consejo de mazmorra.

### 2.8 CHAMPI, TOBY, RONCATÓN

Ya existen. Champi cuida la casa de "su amigo que salió a jugar en 1989": en el Mundo 5 se
revela que ese amigo es el **dueño original de las consolas**, un niño de 1989 que hoy es...
Don Chip (que se emociona: *"¿Champi? ¿CHAMPI? ¡Yo te dibujé en mi cuaderno de tercero!"*).
Toby es el perro de Duck Hunt. El Roncatón bloquea el camino al este y necesita la Flauta
Polígono (§7). Detrás está la Cueva Roja (§11).

### 2.9 Nuevos NPC del pueblo (llegan con cada mundo)

| NPC | Llega en | Qué hace |
|-----|----------|----------|
| **Profesora Letra** | Mundo 1 | Laboratorio de Tecloides. Cura, cambia equipo, explica tipos. |
| **Dani Turbo** | Mundo 1 | Rival. Anda por el pueblo entre mundos; se le puede retar. |
| **Doña Tecla** | Mundo 2 | Tienda: Galletas Pixel, objetos nuevos (ver §3.4). Habla en refranes de teclado. |
| **Gorro & Berenjena** | Mundo 2 | Dos plomeros gemelos que arreglan la tubería. Abren el **Mapa de Mundos** (viajar entre mundos). Guiño a Mario/Luigi sin nombrarlos. |
| **Maestra Modo** | Mundo 3 | Sala de arcade: aquí viven todos los minijuegos desbloqueados. |
| **Ocarín** | Mundo 4 | Músico de polígonos. Te enseña las melodías (teclas) y toca las que ya sabes. |
| **Alcaldesa Bellota** | Mundo 5 | Guiño Animal Crossing: buzón del pueblo. Quests de cartas (frases largas con mayúsculas y puntuación). |
| **Entrenador Mi** | Mundo 6 | Gimnasio Wii Sports del pueblo: repite los minijuegos de ritmo. |
| **El Glitch (perdonado)** | Final | Se sienta junto a la vitrina. Cuenta chistes malísimos. |

---

## 3. Sistemas compartidos

### 3.1 Tecloides (batalla de monstruos estilo Pokémon)

**Concepto.** Criaturitas que viven en las teclas. Cada Tecloide "sabe" 4 ataques, y cada
ataque es **una palabra** que escribes. Daño = velocidad y precisión al escribirla × poder
base × ventaja de tipo.

**Tipos (piedra-papel-tijera + 1 neutral + 1 secreto):**

| Tipo | Color | Le gana a | Pierde contra | Idea |
|------|-------|-----------|---------------|------|
| **CHISPA** (eléctrico) | amarillo | GOTA | BROTE | velocidad: palabras cortas, muchas |
| **GOTA** (agua) | azul | BROTE | CHISPA | fluidez: palabras medianas sin errores |
| **BROTE** (planta) | verde | CHISPA | GOTA | resistencia: palabras largas |
| **BYTE** (neutral) | gris | — | — | sin ventajas; ataques equilibrados |
| **ESTÁTICA** (secreto) | magenta | todos ×1.2 | BYTE ×2 | solo lo usan el Glitch y Dani (Mundo 3-4). Sus palabras tienen una letra "rota" que hay que escribir igual (ej. `tru#no` se escribe `truno`) |

Ventaja = ×1.5; desventaja = ×0.67. Mostrar siempre "¡Es muy eficaz!" / "No es muy eficaz..."
en texto.

**Ataques.** Cada ataque = {nombre, palabra, poder, tipo, efecto opcional}. La palabra la
escribe el jugador en un reto corto (tiempo = letras × 500 ms + 1500). Ejemplos:

| Ataque | Palabra | Poder | Tipo | Efecto |
|--------|---------|-------|------|--------|
| Chispazo | `zas` | 20 | CHISPA | — |
| Trueno | `trueno` | 45 | CHISPA | si PERFECTO, el rival pierde su siguiente turno |
| Salpicón | `salpica` | 30 | GOTA | — |
| Marea | `marea alta` | 50 | GOTA | — |
| Hojita | `hoja` | 20 | BROTE | — |
| Raíz | `raíces profundas` | 55 | BROTE | cura 10 % si PERFECTO |
| Tecleo | `tecla` | 25 | BYTE | — |
| Barra | `barra espaciadora` | 60 | BYTE | el poder sube con la longitud escrita sin error |

**Turno del rival.** Su Tecloide ataca: aparece su palabra en pantalla y el jugador debe
escribirla **antes** de que termine una barra de tiempo (2 s + 100 ms por letra). Si lo logra,
"esquiva" (daño ×0.5). Así el turno enemigo también es tecleo, igual que el combate normal.

**Equipos.** Máximo 3. Se consiguen: uno de regalo (Profesora Letra), uno por mundo al
perdonar a cierto enemigo (ver cada mundo) y uno en el pasto alto (encuentro raro). Suben de
nivel con XP; evolucionan al nivel 10 y 20 (cambia sprite y nombre).

**Los 9 Tecloides base (3 por tipo) + evoluciones:**

| Tipo | Etapa 1 | Etapa 2 | Etapa 3 | Dónde |
|------|---------|---------|---------|-------|
| CHISPA | **Voltín** (chispa con ojos) | Voltón | Voltrueno | Inicial |
| CHISPA | **Pilín** (pila AA con patas) | Pilote | Pilatormenta | GB (pasto alto) |
| CHISPA | **Zumbito** (abeja de LED) | Zumbón | Zumbarrayo | Wii |
| GOTA | **Gotín** (gota con gorra) | Gotón | Gotamar | Inicial |
| GOTA | **Burbujín** (burbuja de pantalla) | Burbujón | Burbumar | NES |
| GOTA | **Delfinito** (guiño a "Dolphin") | Delfinón | Delfimar | GC |
| BROTE | **Brotín** (brote de tubería) | Brotón | Brotárbol | Inicial |
| BROTE | **Hongoló** (honguito saltarín) | Hongolón | Hongobosque | SNES |
| BROTE | **Cactín** (cactus de polígonos) | Cactón | Cactiglobo | N64 |
| BYTE | **Bitito** (primito de Bit) | Bytón | Kilobyte | Regalo de Bit, Mundo 2 |

El equipo de Dani Turbo siempre tiene el tipo que le gana al inicial que elegiste (como todo
buen rival).

### 3.2 Marco de minijuegos

Todos los minijuegos viven en la **Sala de Arcade** de Maestra Modo (pueblo, desde Mundo 3) y
además aparecen en su mundo. Reglas compartidas:
- Cada minijuego tiene 3 dificultades (Fácil / Normal / Turbo) y una tabla de récords local.
- Dan **Fichas** (moneda del arcade) para comprar tesoros cosméticos y Galletas.
- Las palabras siempre se toman del pool del mundo (§16) + palabras que el jugador falla más.

Lista completa de minijuegos (detalle en cada mundo):

| Minijuego | Mundo | Guiño | Habilidad |
|-----------|-------|-------|-----------|
| **Bloques** | GB | Tetris | palabras completas, ritmo |
| **Chupa-Letras** | GB | Kirby | reconocer y escribir palabras rápido |
| **Patos de Letras** | NES | Duck Hunt | reacción, letras sueltas |
| **Barriles** | NES | Donkey Kong | mayúsculas (Shift) |
| **Pista Cero** | SNES | F-Zero | velocidad sostenida, acentos |
| **Escuadrón Zorrino** | SNES | Star Fox | ráfagas de palabras, puntuación |
| **Carrera Polígono** | N64 | Mario Kart 64 | números y palabras alternadas |
| **Melodías** | N64 | Ocarina | secuencias de teclas, memoria |
| **Correo de Bellota** | GC | Animal Crossing | frases largas, mayúsculas, puntuación |
| **Brotitos** | GC | Pikmin | órdenes cortas, cambio de contexto |
| **Boliche Sensor** | Wii | Wii Sports | ritmo constante |
| **Tenis Sensor** | Wii | Wii Sports | alternar manos (izquierda/derecha) |
| **Eco Rojo** | Secreto | Virtual Boy | profundidad: escribir la palabra "de adelante" |

### 3.3 Diario de misiones (quests)

Formato de cada misión en código (sugerencia):

```js
{ id: 'nes_patos', world: 'nes', title: 'Los patos de Toby', giver: 'toby',
  steps: ['Habla con Toby en el pueblo', 'Juega Patos de Letras y saca 20 patos', 'Vuelve con Toby'],
  reward: { treasure: 'zapper_dorada', fichas: 30 }, flagDone: 'q_nes_patos' }
```

Tipos de misión: **Principal** (rescatar la consola), **Secundaria** (NPC), **Amistad**
(perdonar a cierto enemigo), **Récord** (lograr X PPM / precisión en Y). Las misiones de
Récord son las que más empujan la mecanografía; cada mundo tiene al menos una.

### 3.4 Objetos (ampliación de OBJETO)

| Objeto | Texto que se escribe | Efecto | Dónde |
|--------|----------------------|--------|-------|
| Galleta Pixel | `comes la galleta pixel` | +12 HP | ya existe |
| Refresco 8-Bit | `tomas el refresco con burbujas` | +25 HP | Doña Tecla (Mundo 2) |
| Pila Extra | `cambias las pilas rapidito` | +3 s en el siguiente reto de tecleo | Mundo 1 |
| Cartucho Soplado | `soplas aunque no sirva` | el siguiente LUCHAR cuenta como PERFECTO si tiene ≤1 error | Mundo 2 |
| Caramelo Modo 7 | `giras el caramelo tres veces` | las letras que caen bajan 20 % más lento ese turno | Mundo 3 |
| Estrella Polígono | `brillas en tres dimensiones` | +40 HP, cura completo si PERFECTO | Mundo 4 |
| Pizza Cubo | `comes la pizza en forma de cubo` | +30 HP y +10 % PAZ | Mundo 5 |
| Jugo Sensor | `agitas el jugo antes de tomarlo` | +20 HP y el siguiente ACTUAR da PAZ doble | Mundo 6 |

---

## 4. Mundo 1 — Valle Game Boy (1989)

### 4.1 Identidad visual

| | |
|--|--|
| **Paleta** | `#0F380F` (oscuro), `#306230`, `#8BAC0F`, `#9BBC0F` (claro). Ya definida en `style.css`. |
| **Resolución mental** | sprites 16×16, pantalla "160×144" de referencia. Nada de degradados; solo 4 tonos. |
| **Overworld** | valle con pasto alto, tubería de entrada, torre de bloques al fondo. Todo con borde grueso oscuro como el dibujo de un manual. |
| **Detalle** | una **mancha magenta** de 1 píxel en la torre de Tetro Rey (pista del Glitch). |

### 4.2 Historia

Ya existe. Se agrega: antes de la torre de Tetro Rey hay un **Pasto Alto Grande** donde
vive la Profesora Letra (laboratorio pequeño) y donde Dani Turbo te reta por primera vez.
Después de Tetro Rey, en la Cueva de los Sueños (zona nueva), vive Chupín, el minijefe.
Al terminar el mundo, Tetro Rey (perdonado o no) dice la primera pista:
*"Yo no quería... algo morado me puso a girar y no me dejaba parar."*

### 4.3 Enemigos normales

Los tres existentes (Pixelito, Cartuchón, Pilabat) + dos nuevos:

**Monedín** — una moneda que gira y se cree muy valiosa.
- Entrena: fila de arriba (Q W E R T Y U I O P), palabras cortas.
- HP 40 / ATQ 2 / DEF 1 / XP 12.
- ACTUAR: `Contar` → "cuentas hasta diez con monedín" (+40 PAZ) → *"¡Diez! ¡Soy diez
  veces más valioso!"*; `Pulir` → "pules la moneda hasta que brilla" (+45) → *"¡Me veo de
  oro! Bueno, de verde claro."*; `Guardar` → "guardas la moneda en la alcancía" (+35) →
  *"¡Por fin un lugar seguro!"*
- Diálogo: *"¡Ting ting!"*, *"¡Cien como yo valen una vida!"*, *"¡No me gastes!"*
- Lluvia: 8 letras de la fila de arriba, intervalo 1250 ms.
- Drop: `moneda_verde` ("Moneda de cuatro tonos. No vale nada. Vale todo.").

**Linkito** — un cablecito de intercambio que anda buscando con quién conectarse.
- Entrena: fila de abajo (Z X C V B N M) mezclada con la del medio.
- HP 50 / ATQ 3 / DEF 1 / XP 18.
- ACTUAR: `Conectar` → "conectas el cable a otra consola" (+50) → *"¡Enlace establecido!
  ¡Ya no estoy solo!"*; `Enrollar` → "enrollas el cable sin nudos" (+40) → *"Qué orden. Qué
  paz."*; `Intercambiar` → "intercambias un tecloide con un amigo" (+45) → *"Eso es para lo
  que nací."*
- Diálogo: *"¿Alguien tiene un puerto libre?"*, *"¡Sin mí no hay intercambios!"*
- Lluvia: 10 unidades: letras de abajo + sílabas `za`, `co`, `vi`, `bu`, `mo`.
- Drop: `cable_doble`. Si lo perdonas, Pilín aparece en el pasto alto (Tecloide de este mundo).

### 4.4 Minijefes

#### Minijefe A — DANI TURBO, primer combate de Tecloides (guiño: Pokémon Rojo/Verde, 1996)

**El papá lo pidió así: una batalla Pokémon con su música y todo.**

- **Dónde:** Pasto Alto Grande, justo después del laboratorio de la Profesora Letra.
- **Antes:** la Profesora te regala tu Tecloide inicial (eliges entre Voltín, Gotín y
  Brotín escribiendo su nombre). Dani llega: *"¿Tú también recibiste uno? ¡Pues a ver si sabes
  usarlo!"*
- **Mecánica:** batalla de Tecloides 1 vs 1 (su inicial es el que le gana al tuyo). Primera
  vez: tutorial de tipos integrado. Usa la pantalla de batalla de monstruos (no la de
  Deltarune): dos plataformas, tu Tecloide de espaldas abajo-izquierda, el rival arriba-derecha,
  barras de HP con nombre y nivel, menú `ATACAR / TECLOIDE / OBJETO / HUIR`.
- **Victoria:** reducir su HP a 0. Si pierdes, la Profesora cura y Dani te deja reintentar
  (*"Te doy otra oportunidad porque soy generoso."*).
- **Escalado:** nivel 5 vs nivel 5. En la revancha del Mundo 3, equipo de 3.
- **Música:** ver §14 (tema "Reto de Tecloides").

#### Minijefe B — CHUPÍN, el que absorbe palabras (guiño: Kirby's Dream Land, 1992)

- **Concepto:** bolita rosada... en 4 tonos de verde (chiste: *"Soy rosa. CONFÍA EN MÍ."*).
  Vive en la Cueva de los Sueños. Se traga todo lo que escribes.
- **Mecánica — "Absorber":** en lugar de LUCHAR normal, en pantalla flotan 6 palabras. Chupín
  **inhala** una al azar cada 3 s (se marca con flechas). Si escribes la palabra marcada antes
  de que llegue a su boca, Chupín la "escupe" de vuelta y recibe daño; si no, la absorbe y
  **copia su habilidad**: la palabra absorbida se añade al pool de su lluvia (cada palabra
  que te robó cae en el turno enemigo). ACTUAR: `Dar de comer` (`le das una galleta pixel`),
  `Flotar` (`inflas los cachetes y flotas`), `Siesta` (`te acuestas a dormir con chupín`).
- **Victoria:** HP 90 a 0, o PAZ llena y PERDONAR. Perdonado: te da el minijuego Chupa-Letras.
- **Escalado:** cada 25 % de HP perdido, Chupín inhala 0.3 s más rápido.
- **Diálogo:** *"Hoy desayuné un diccionario."*, *"¡Poyo!... Perdón, eso es de otro."*

### 4.5 JEFE — TETRO REY (guiño: Tetris, 1989 en Game Boy)

Ya existe. Se agrega una fase especial que usa el minijuego **Bloques** para que la batalla se
sienta distinta a las normales:

- **Fase 1 (actual):** LUCHAR/ACTUAR normales; lluvia de palabras completas (ya definido).
- **Fase 2 (al 50 % de HP):** *"¡LLUEVEN BLOQUES!"* La pantalla cambia al minijuego Bloques
  por 45 segundos: caen palabras-bloque; cada palabra escrita se "coloca" y cada 4 colocadas
  seguidas sin error se limpia una línea (= 15 de daño). Si la pila llega al tope, recibes 8
  de daño y se reinicia la pila.
- **Fase 3 (al 20 %):** vuelve a la batalla normal, pero las palabras de LUCHAR giran 90°
  (se muestran en vertical, una letra por renglón) para que leas "como bloque".
- Al terminar: suelta la **Game Boy** y el Cable Link (ya existe).

### 4.6 Minijuegos

**Bloques (guiño: Tetris).** Ya en desarrollo.
- Caen palabras de arriba, una a la vez, en una de 4 columnas. Escribirla completa la
  "coloca" en la columna (ocupa 1 bloque de altura). Si no la escribes antes de que llegue al
  piso, se coloca igual pero **con una grieta** (no cuenta para la línea).
- Una **línea** = las 4 columnas con la misma altura y sin grietas → desaparece, +100 pts.
- Pierdes cuando una columna alcanza 8 de altura.
- Dificultad: la velocidad de caída sube cada 5 palabras; Turbo empieza con palabras de t2.
- Récord: líneas limpiadas.

**Chupa-Letras (guiño: Kirby).**
- 60 segundos. Flotan palabras que se mueven lento hacia una boca al centro. Escribirlas las
  "come" (+10 pts); si una toca la boca sin escribirse, te quita 5 s.
- Cada 10 comidas aparece una **palabra dorada** (de t2) que vale 50.

### 4.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"Mi primer Tecloide"** (Profesora Letra) | 1. Hablar con la Profesora. 2. Escribir el nombre del inicial que eliges. 3. Vencer a Dani. | Tecloide inicial + Fichas 20 |
| **"La moneda perdida"** (Monedín perdonado) | 1. Perdonar a Monedín. 2. En el pueblo, Monedín te pide buscar a su "hermana" en el pasto alto (encuentro fijo con un Monedín dorado: reto de 5 palabras t1 sin error). 3. Volver. | Tesoro `moneda_verde` + 15 Fichas |
| **"Racha de 20"** (Récord, Bit) | Escribir 20 palabras seguidas sin error en cualquier batalla del mundo. | Pila Extra ×3 |
| **"Dulces sueños"** (Chupín) | Perdonar a Chupín y luego ganar Chupa-Letras con 30 palabras. | Minijuego Chupa-Letras en el arcade + Galleta ×5 |

### 4.8 Easter eggs y referencias

- Letrero en la Cueva de los Sueños: *"Aquí nació una bolita rosa en 1992. Dicen que su
  creador también hizo el juego de Bloques."* (Dato real: Kirby's Dream Land salió en 1992 y
  su diseñador, Masahiro Sakurai, trabajó después en Smash Bros.; no es necesario el nombre.)
- Un NPC-pixel en el valle: *"Mi primo salió en 'Super Mario Land' el mismo año que la
  consola."* (real: Super Mario Land, 1989).
- Un letrero: *"Lugar de la Pokédex: aquí hubo 151. Contamos."*
- Si escribes `tetris` como respuesta a cualquier `choose` de Tetro Rey, responde *"¡No digas
  esa palabra! Me da vértigo."*

### 4.9 Consola y tesoros

Se rescata la **Game Boy**. Tesoros: manual, cartucho misterioso, pilas AA, Cable Link (ya
existen), `moneda_verde`, `cable_doble` ("Para intercambiar. Nunca supiste bien qué."),
`gameboy_lupa` ("Lupa con luz. Para jugar debajo de la cobija.").

### 4.10 Mecanografía

Filas del medio y de arriba, minúsculas, palabras de 3-6 letras. Objetivo: **15-20 PPM**,
precisión 90 %. La lluvia usa letras sueltas y sílabas.

---

## 5. Mundo 2 — Castillo 8-Bit (NES, 1985)

### 5.1 Identidad visual

| | |
|--|--|
| **Paleta** | Fondo `#000000`; cielo `#5C94FC`; ladrillo `#C84C0C`; ladrillo claro `#F8B800`; verde tubería `#00A800`; verde claro `#B8F818`; piel `#FCA044`; blanco `#FCFCFC`; rojo `#F83800`; gris `#7C7C7C`. (Diez colores tomados del rango que mostraba la NES, que podía poner ~25 colores en pantalla de 54 posibles.) |
| **Regla** | Cada sprite usa máximo **3 colores + transparente** (como en la NES real). Esto se explica en el juego: *"Aquí todos somos de tres colores. Es la ley del castillo."* |
| **Sprites** | 16×16, pero los jefes en 32×32 compuestos de 4 bloques (como se hacía). |
| **Overworld** | lateral/"plataformero": un mapa de casillas pero decorado con ladrillos, bloques `?`, tuberías y tres castillos en fila (Castillo 1, 2 y 3). Fondo negro con nubes blancas dibujadas con la misma forma que los arbustos (chiste visual clásico). |

### 5.2 Historia

Hay **tres castillos**. En el primero y el segundo, al vencer al guardián, un hongo-paje te
dice *"¡Gracias! Pero tu consola está en otro castillo."* (el segundo castillo con tono de
"ya sé, ya sé"). En el tercero está Lord Caparazón, "trabado": repite la misma frase
como disco rayado. Al liberarlo revela que *"una sombra morada entró por la pantalla y me
dijo que si nadie apaga la consola, el juego no termina nunca. Y me gustó la idea... hasta
que no pude dejar de repetir el nivel."* Primera confirmación de que el apagón fue
provocado. Además, en el pueblo, Don Chip aporta: *"Hubo un apagón de verdad en 1989 en mi
cuadra. Pero este no fue de la luz. Fue de... otra cosa."*

Zonas: **Patio de Ladrillos** (enemigos básicos) → **Castillo 1** (minijefe Kongo Tambor) →
**Bosque Oscuro** (Toby te acompaña; minijuego Patos de Letras) → **Castillo 2** (Mazmorra de
Llaves con el minijefe Tragabombas) → **Ring de la Plaza** (minijefe Campeón Puñín, opcional)
→ **Castillo 3** (Lord Caparazón).

### 5.3 Enemigos normales

| Enemigo | Concepto | HP/ATQ/DEF/XP | Entrena |
|---------|----------|---------------|---------|
| **Ladrillín** | bloque de ladrillo con cejas; se enoja si saltas debajo | 45/3/2/16 | fila de arriba + mayúscula inicial (`Ladrillo`) |
| **Caparacho** | tortuguita que se mete a su caparazón y patina | 55/3/1/18 | palabras que empiezan con mayúscula (nombres propios) |
| **Bombita Mecha** | bomba con mecha corta y mucha prisa | 50/4/0/20 | palabras cortas contra reloj (tiempo 20 % menor) |
| **Patoloco** | pato de Duck Hunt que se burla porque nunca le atinan | 40/2/1/14 | letras sueltas muy rápidas (reacción) |
| **Fantasmín de Pantalla** | fantasma pálido que aparece en la tele vieja; se asusta de su reflejo | 60/3/2/22 | palabras con `h` muda y `qu` (`hada`, `queso`, `hueso`) |
| **Robotito** (guiño R.O.B.) | robot gris que quiere jugar contigo pero no entiende las reglas | 65/3/3/25 | números del 1 al 9 (introducción a la fila numérica) |

ACTUAR (frase que se escribe → respuesta):

- **Ladrillín:** `Tocar` → "tocas el bloque con cuidado" → *"¡Ting! ...Ah, eso se sintió
  bien."* (+40); `Preguntar` → "qué guardas adentro" → *"Una moneda. O un hongo. Nunca sé."*
  (+35); `Apilar` → "apilas tres ladrillos derechitos" → *"¡Por fin alguien construye en vez
  de romper!"* (+50).
- **Caparacho:** `Rascar` → "le rascas el caparazón" → *"Más a la izquierda... ahí. AHÍ."*
  (+45); `Patinar` → "patinas a su lado por el pasillo" → *"¡Vuuum!"* (+40); `Devolver` →
  "le devuelves su caparazón perdido" → *"Oh. Pensé que no volvería a verlo."* (+50).
- **Bombita Mecha:** `Soplar` → "soplas la mecha hasta apagarla" → *"...¡Ay! Qué alivio."*
  (+50); `Calmar` → "respiras hondo con bombita" → *"Inhala... exhala... ¡Me gusta!"* (+45);
  `Contar` → "cuentas hasta tres muy despacio" → *"¿Tres? ¡Pensé que era uno!"* (+35).
- **Patoloco:** `Silbar` → "silbas como pato" → *"¡Cuac! ¿Eres primo mío?"* (+40); `Reír` →
  "te ríes con el pato y no de él" → *"Nadie se había reído CONMIGO."* (+50); `Pan` → "le
  das un pedazo de pan" → *"¡Cuac cuac cuac!"* (+35).
- **Fantasmín:** `Luz` → "prendes la luz del cuarto" → *"¡Ay! ...Bueno, mejor."* (+45);
  `Espejo` → "le muestras que es muy guapo" → *"¿Ese soy yo? ¡Qué pálido tan elegante!"*
  (+45); `Buu` → "dices buu primero" → *"¡AAH! ...Me ganaste."* (+40).
- **Robotito:** `Reglas` → "le explicas las reglas del juego" → *"Entendido. Casi."* (+40);
  `Jugar` → "juegas una partida con el robot" → *"Ganaste. Yo gané. Todos ganamos."* (+50);
  `Aceitar` → "le pones aceite en los codos" → *"Ahhh. Mis codos de 1985."* (+45).

Diálogos de burla (`taunts`): Ladrillín *"¡No me saltes encima!"*; Caparacho *"¡Patina
esto!"*; Bombita *"¡Tres... dos...!"*; Patoloco *"¡Ja ja ja! ¡Fallaste!"*; Fantasmín *"Buuu
(perdón, era obligatorio)"*; Robotito *"Iniciando... juego... amistoso."*

Perdonados → se mudan al pueblo. Burbujín (Tecloide GOTA) se obtiene al perdonar a
Fantasmín (*"Toma, vivía en mi pantalla. Hace burbujas."*).

### 5.4 Minijefes

#### Minijefe A — KONGO TAMBOR (guiño: Donkey Kong, arcade 1981 / NES 1983)

- **Concepto:** gorila con corbata de píxeles que toca el tambor y avienta barriles desde
  lo alto de una estructura de vigas inclinadas. Guarda el Castillo 1.
- **Mecánica — "Subir las vigas":** la pantalla muestra 4 vigas en zigzag. Tú estás abajo;
  Kongo arriba. Cada **barril** que rueda trae una palabra **con mayúscula inicial**
  (`Barril`, `Viga`, `Martillo`). Escribirla antes de que te alcance = "saltas" el barril y
  subes un escalón; fallar = bajas uno y pierdes 4 HP. Cada 5 barriles saltados llegas a la
  siguiente viga. Al llegar a la 4ª, aparece un **Martillo**: reto de 3 palabras t2 con
  mayúscula; completarlo golpea a Kongo (30 de daño) y lo manda a la Fase 2 (barriles de dos
  palabras: `Barril Rodante`).
- **Victoria:** HP 110 a 0 (3 martillazos + LUCHAR normales entre fases) o PAZ: ACTUAR `Tambor`
  ("tocas el tambor con él"), `Plátano` ("le das un plátano amarillo"), `Corbata` ("le
  acomodas la corbata").
- **Escalado:** velocidad de barril +10 % por viga.
- **Diálogo:** *"¡BUM BUM BUM!"*, *"¿Quién dijo que los gorilas no saben de ritmo?"*,
  *"Mi primo salió en un juego en 1981. ¡Yo nací en 1985 y ya tengo corbata!"*

#### Minijefe B — TRAGABOMBAS y la Mazmorra de Llaves (guiño: The Legend of Zelda, 1986)

- **Concepto:** el Castillo 2 es una **mazmorra de 6 cuartos** vista desde arriba. Cada
  puerta cerrada se abre escribiendo una **llave**: una frase corta con mayúscula y punto
  final (`La puerta se abre.`). Hay 3 llaves escondidas en 3 cuartos distintos (cada una es
  un reto de tecleo de 3 frases de 4-6 palabras); una puerta extra se abre con la
  **Espada de madera** del Anciano (si la tienes, el reto es más fácil).
- **Mapa:** 

  ```
  [Entrada] - [Cuarto de Ladrillines] - [Llave 1]
       |             |
  [Llave 2] -  [Puerta cerrada x2] - [Llave 3]
                     |
             [TRAGABOMBAS]
  ```
- **Tragabombas:** dinosaurio verde-gris que come bombas. Mecánica: en LUCHAR, cada tercera
  palabra del combo es `bomba`; si la escribes PERFECTO, Tragabombas se la traga y recibe
  daño triple (*"¡Tragabombas no le gusta el humo!"*). Si fallas, la bomba explota en tu
  lado (−5 HP). Lluvia: letras que salen de su boca en ráfagas de 3.
- **Victoria:** HP 100 a 0 o PAZ con `Dieta` ("le ofreces una zanahoria"), `Cepillar` ("le
  cepillas los dientes"), `Mapa` ("le muestras la salida del laberinto").
- **Diálogo:** *"¿Tienes bombas? Me encantan las bombas."*, *"Es peligroso ir solo. Por
  eso como acompañado."*

#### Minijefe C (opcional) — CAMPEÓN PUÑÍN (guiño: Punch-Out!!, NES 1987)

- **Concepto:** boxeador enorme con guantes verdes. Él está de frente y tú abajo,
  pequeño, como en el original.
- **Mecánica — "Esquivar escribiendo":** Puñín avisa su golpe con una palabra que parpadea
  durante 1.2 s (`izquierda`, `derecha`, `gancho`, `abajo`). Escribirla antes de que termine
  el parpadeo = esquivas. Tras 3 esquives seguidos, se "marea" (una estrella aparece) y se
  abre una ventana de 4 s para LUCHAR con un reto de 4 palabras t2: cada palabra PERFECTA es
  un golpe de 12. Si fallas un esquive, −6 HP y el combo de esquives vuelve a 0.
- **Victoria:** 3 "caídas" (cada caída = 40 de daño acumulado) o PAZ con `Guantes` ("chocas
  los guantes con respeto"), `Entrenar` ("corres con él por el parque"), `Admirar` ("le dices
  que es tu ídolo").
- **Escalado:** palabra de aviso dura 1.2 s → 1.0 s → 0.8 s por ronda.
- **Diálogo:** *"¡Vas a necesitar más que dos dedos!"*, *"Cuando parpadeo, lo digo en
  serio."*
- Recompensa: tesoro `guantes_verdes` y Dani Turbo ve el combate y te respeta un poquito.

### 5.5 JEFE — LORD CAPARAZÓN (guiño: Super Mario Bros., 1985)

- **Concepto:** rey tortuga con corona y una melena de fuego de píxeles. Vive en el Castillo 3
  sobre un puente encima de "lava" naranja. Está trabado por el Glitch: repite su frase
  *"¡BIENVENIDO A MI CASTILLO! ¡BIENVENIDO A MI CASTI— ¡BIENVENIDO!"*
- **Mecánica — "Plataformas al ritmo":** la caja de batalla se convierte en una pista lateral
  con bloques flotantes. Hay un **metrónomo** (la música del jefe, 120 BPM). Cada compás
  aparece una palabra sobre el siguiente bloque: si la terminas **dentro del compás** (4
  tiempos = 2 s), el héroe salta al bloque y avanza; si no, cae al "hoyo" y pierde 5 HP y
  vuelve al bloque anterior. Cada 6 bloques llegas al **hacha** al final del puente:
  escribir `cortas la cuerda del puente` PERFECTO = 35 de daño (el puente cae, Caparazón
  "se moja", sale enojado y se reinicia la pista más rápida).
- **Fases:**
  1. 120 BPM, palabras t1. Lluvia: bolas de fuego (palabras `fuego`, `llama`, `calor`).
  2. 135 BPM, palabras t2. Lanza martillos: en la lluvia aparecen palabras con mayúscula.
  3. 150 BPM, se le ve "glitcheado" (franjas magenta); palabras se repiten dos veces
     (`salto salto`) porque "está trabado". Al vencer, las franjas desaparecen.
- **PAZ:** `Reverencia` ("haces una reverencia al rey"), `Hijos` ("le preguntas por sus
  hijos" → *"¡Tengo muchos! Y todos gritan."*), `Pausa` ("pulsas pausa para que descanse" → *"...
  ¿Pausa? ¿Se puede? ...Gracias."* esto es lo que lo "destraba"; da +50 PAZ y quita la fase
  3).
- **Victoria:** HP 200 a 0 o PAZ. Suelta la **NES**.
- **Diálogo tras liberarlo:** *"Una sombra morada entró por la pantalla. Me dijo que si nadie
  apaga la consola, el juego nunca termina... y me gustó la idea. Hasta que no pude dejar de
  repetir el nivel."*

### 5.6 Minijuegos

**Patos de Letras (guiño: Duck Hunt).**
- Toby acompaña. Vuelan patos de izquierda a derecha, cada uno con **una letra**. Escribir
  la letra = pato "atrapado con red" (Toby lo trae y lo suelta: nada de disparos reales; es
  "red de letras"). 3 patos por ronda, 10 rondas; cada ronda vuelan 8 % más rápido.
- Fallar 3 patos en una ronda = Toby se ríe (fin de ronda, no de juego).
- Turbo: patos con sílabas de 2 letras.

**Barriles (guiño: Donkey Kong).**
- Versión arcade del minijefe: barriles infinitos con palabras **con mayúscula inicial**.
  Sube lo más que puedas; cada viga sube la velocidad. Récord: vigas subidas.

### 5.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"Los patos de Toby"** | 1. Hablar con Toby en el Bosque Oscuro. 2. Sacar 20 patos en Patos de Letras. 3. Volver. | `zapper_dorada` + 30 Fichas |
| **"Las tres llaves"** (Anciano) | 1. Encontrar las 3 llaves del Castillo 2. 2. Mostrárselas al Anciano. | `mapa_mazmorra` (desde entonces los cuartos se ven en el minimapa) |
| **"Se busca robot"** (Don Chip) | 1. Perdonar a Robotito. 2. En el pueblo, Robotito pide que le escribas sus instrucciones: reto de 5 frases numeradas (`1. Prende la luz.`). | Robotito se queda en el museo y abre el **Modo Práctica** (batalla sin HP para practicar). |
| **"Récord de ring"** (Puñín) | Vencer a Puñín con 9 esquives seguidos. | `guantes_verdes`, Dani te saluda distinto |

### 5.8 Easter eggs

- Código ↑↑↓↓←→←→BA ya existe; aquí un letrero: *"Este código daba 30 vidas en un juego de
  1988. Aquí da galletas. Es lo que hay."*
- Las nubes y los arbustos son el mismo sprite con distinto color; Bit lo nota si te quedas
  quieto.
- Un cartucho dorado brillando en la mazmorra: *"Los cartuchos dorados guardaban tu partida
  con una pila. ¡Era magia!"*
- NPC Hongo-paje: *"Soy el paje. Es mi trabajo decirte que la consola está en otro
  castillo. ¡Me encanta mi trabajo!"*
- Un letrero sobre Famicom: *"En Japón este castillo era rojo con blanco y nació en 1983."*
- Si escribes `rob` cuando Robotito te pregunta tu nombre: *"¡Hermano!"*

### 5.9 Consola y tesoros

Se rescata la **NES**. Tesoros: `zapper_dorada` ("Pistola de luz dorada. Solo brilla en
teles de tubo."), `guantes_verdes`, `mapa_mazmorra`, `ladrillo_dorado` ("Todavía tiene un
signo de interrogación. Nadie lo ha golpeado."), `robot_amigo` ("Un robotito que jugaba
contigo en 1985. Entendía dos juegos.").

### 5.10 Mecanografía

Todas las letras + **mayúsculas con Shift** (nombres propios, inicio de frase), **punto
final**. Primer contacto con números 1-9 (Robotito). Objetivo: **20-25 PPM**, precisión 92 %.

---

## 6. Mundo 3 — Reino 16-Bit (Super Nintendo, 1990)

### 6.1 Identidad visual

| | |
|--|--|
| **Paleta** | 16 colores por sprite (la SNES permitía 15 + transparente por paleta, de 32 768 posibles). Base del mundo: cielo `#5FCDE4`, cielo oscuro `#2E5C9A`, pasto `#3FBF3F`, pasto oscuro `#1E7A2E`, tierra `#A0522D`, tierra clara `#D29A5B`, piedra `#8C8C9C`, piedra oscura `#4A4A5E`, amarillo `#FFD93D`, naranja `#FF8C1A`, rojo `#E8393D`, morado `#8E44AD`, rosa `#F79AC0`, blanco `#FFFFFF`, negro `#1A1A2E`, dorado `#F2C14E`. |
| **Estilo** | sprites 16×16 con sombreado de 2-3 tonos por color; fondos con **parallax** (dos capas); el suelo del overworld en las zonas "Modo 7" se dibuja en perspectiva (filas que se encogen hacia el horizonte). |
| **Overworld** | reino colorido con colinas redondas, castillo rosa al fondo, un río con reflejos (dos tonos alternando), y una zona de **pista** con cuadrícula en perspectiva. |

### 6.2 Historia

Al entrar, Bit se emociona: *"¡COLORES! ¡Mira cuántos!"*. Dani Turbo aparece con un Tecloide
nuevo de tipo ESTÁTICA que se "traba": *"Me lo dio un tipo morado en la pista. Dice que es
único."* En el Bosque de Dinosaurios el jugador ve por primera vez al **Glitch** de frente:
diálogo corto, intento fallido de "pausar" al héroe (los textos del diálogo se congelan y Bit
los destraba parpadeando), y huye dejando la **Etiqueta en blanco** (tesoro). Zonas: Colinas
Dinosaurio → Pista Cero (minijefe Rayo Cero) → Hangar (minijefe Capitán Vulpino) → Arena
Modo 7 (revancha con Dani) → Planeta Oscuro (JEFE Reina Nébula).

### 6.3 Enemigos normales

| Enemigo | Concepto | HP/ATQ/DEF/XP | Entrena |
|---------|----------|---------------|---------|
| **Dino Huevín** | dinosaurio verde pequeño que sale de un huevo con manchas; come todo | 70/4/2/28 | acentos: `plátano`, `cántalo`, `árbol` |
| **Modosiete** | plano cuadriculado que gira y se agranda; marea a quien lo mira | 65/3/3/26 | palabras que se muestran en perspectiva (letras más chicas hacia el fondo) |
| **Caballero Bloque** | caballero de armadura brillante hecha de 16 tonos | 90/5/4/35 | signos `¿?` y `¡!` (`¿quién va?`, `¡alto!`) |
| **Gema Flotante** | gema que presume sus 32 mil colores | 60/3/2/24 | palabras con `ñ`: `piña`, `niño`, `sueño` |
| **Mono Barril** | monito que avienta barriles pre-renderizados (guiño DK Country) | 80/4/2/30 | comas en listas: `plátano, uva, pera` |
| **Setita Saltarina** | hongo pequeño que rebota (evoluciona de Hongoló) | 55/3/1/22 | palabras largas (8-10 letras): `tubería`, `castillo`, `princesa` |

ACTUAR (una por enemigo, las otras dos a criterio):
- **Dino Huevín:** `Alimentar` → "le das una fruta con la lengua larga" → *"¡Ñam! ¿Hay
  más?"* (+50); `Montar` → "te subes en su lomo" → *"¡A trotar!"* (+45); `Huevo` → "cuidas
  su huevo hasta que se duerme" → *"...zzz."* (+40).
- **Modosiete:** `Mirar` → "miras el horizonte y respiras" → *"¿Ves? Giro para ti."* (+45);
  `Dibujar` → "dibujas una cuadrícula perfecta" → *"¡Qué ortogonal!"* (+40); `Parar` →
  "le pides que pare un poquito" → *"Está bien. Pausa... no, pausa no. Alto."* (+45).
- **Caballero Bloque:** `Reverencia` → "¡saludos, noble caballero!" → *"¡Un escudero con
  modales!"* (+45); `Pulir` → "pules su armadura hasta verte" → *"¡Dieciséis tonos de
  brillo!"* (+40); `Pregunta` → "¿cuál es tu misión?" → *"...No me acuerdo. Qué alivio."*
  (+50).
- **Gema Flotante:** `Admirar` → "qué bonitos colores tienes" → *"¡Treinta y dos mil!
  Bueno, uso dieciséis."* (+45); `Contar` → "cuentas sus caras una por una" → *"¿Ocho? ¡Nadie
  me había contado!"* (+40); `Lupa` → "la miras con lupa" → *"¡Qué nítida me veo!"* (+40).
- **Mono Barril:** `Plátano` → "le das un plátano, el amarillo" → *"¡Mi favorito!"* (+50);
  `Rodar` → "ruedas en un barril con él" → *"¡Uuuuh!"* (+45); `Foto` → "le tomas una foto
  en tres dimensiones" → *"¡Me veo renderizado!"* (+35).
- **Setita:** `Saltar` → "saltas al mismo ritmo que ella" → *"¡Boing, boing!"* (+45);
  `Sombra` → "la pones en la sombra" → *"Ahh. Los hongos amamos la sombrita."* (+45);
  `Chiste` → "¿por qué el hongo era popular? porque era un buen tipo" → *"¡JA! Pésimo. Me
  encanta."* (+50).

Hongoló (Tecloide BROTE) se obtiene al perdonar a Setita Saltarina.

### 6.4 Minijefes

#### Minijefe A — RAYO CERO (guiño: F-Zero, 1990, juego de lanzamiento)

- **Concepto:** nave de carreras con casco y cara de velocidad. Te reta a una vuelta en la
  Pista Cero, que se dibuja en "Modo 7" (cuadrícula en perspectiva que se mueve).
- **Mecánica — "Carrera de tecleo continuo":** una pista horizontal con dos naves (tú y Rayo).
  Avanzas **escribiendo un párrafo continuo** (frases encadenadas del pool del mundo, con
  acentos). Cada carácter correcto = +1 de velocidad; cada error = frenazo (−15 de velocidad y
  la nave "chispea"). Rayo Cero avanza a velocidad fija (ajustable por dificultad; Normal =
  equivalente a 28 PPM). Hay **3 "boosts"** en la pista: una palabra en mayúsculas (`TURBO`);
  escribirla PERFECTO da un impulso. La carrera es de 60 segundos: gana quien recorra más.
- **Victoria:** ganarle la carrera (no hay HP). Perder = reintento inmediato con Rayo 10 %
  más lento (hasta 3 veces).
- **Escalado:** vuelta 1 a 28 PPM; en el arcade, Normal 32, Turbo 40.
- **Diálogo:** *"¡Aquí no se gana con fuerza, se gana con dedos!"*, *"Mi pista gira con el
  Modo 7. Nadie sabe por qué siete."*
- Recompensa: minijuego Pista Cero + `casco_cero`.

#### Minijefe B — CAPITÁN VULPINO (guiño: Star Fox, 1993, chip Super FX)

- **Concepto:** zorro piloto con chaleco y una nave triangular de polígonos planos (el jefe
  más "3D" del mundo, como el juego original). Habla con un radio que se entrecorta.
- **Mecánica — "Disparar a palabras":** vista desde atrás de tu nave. Vienen palabras desde el
  fondo (chicas) hacia ti (grandes), en oleadas de 3-5. Escribir una palabra = disparo que la
  destruye (la primera letra apunta: al escribir la primera letra se marca la palabra que
  empieza así; si hay dos candidatas, la más cercana). Las palabras que llegan te quitan 4 HP.
  Cada oleada completa sin daño llena el **anillo de carga**; con 3 anillos aparece Vulpino de
  frente: reto de una frase de 6-8 palabras con puntuación → daño 40.
- **Victoria:** HP 150 o PAZ: `Rodar` ("haces un giro completo"), `Equipo` ("le dices
  que su escuadrón lo necesita"), `Radio` ("¡Vulpino, contesta!").
- **Escalado:** oleadas 3→4→5 palabras; tiempo de llegada 5 s→4 s→3 s.
- **Diálogo:** *"¡Haz un giro! ...¿No sabes? ¡Escribe 'giro'!"*, *"Mi nave tiene 20
  polígonos. Y todos son triángulos."*
- Recompensa: minijuego Escuadrón Zorrino + `chip_fx` ("Un chip extra dentro del cartucho.
  Dibujaba polígonos.").

#### Minijefe C — DANI TURBO, Arena Modo 7 (revancha de Tecloides, equipo de 3)

Equipo: su inicial evolucionado (etapa 2, nv 14), un Tecloide del tipo que te gana (nv 12) y
**"???"** (tipo ESTÁTICA, nv 15), que a veces "no obedece" (salta su turno con el mensaje
*"??? se quedó congelado."*). Victoria = vencer a los 3. Es el primer combate donde se
necesita cambiar de Tecloide (`TECLOIDE` en el menú) para aprovechar tipos.

### 6.5 JEFE — REINA NÉBULA (guiño: Super Metroid, 1994)

- **Concepto:** una medusa espacial enorme, translúcida, con un núcleo brillante y muchos
  "hijitos" (pequeñas medusas). Vive en el Planeta Oscuro, una caverna donde la paleta se
  vuelve azul oscuro y morado. No es malvada; cuida a sus crías y el Glitch le hizo creer que
  tú vienes a llevártelas.
- **Mecánica — "Oscuridad y rayo cargado":**
  1. **Oscuridad:** la caja de batalla está a oscuras; las palabras de LUCHAR aparecen
     **parcialmente ocultas** (letras al azar reemplazadas por `·`). Antes de escribir, tienes
     1.5 s de "escáner" en el que la palabra se ve completa; luego se oculta. Hay que
     recordarla (memoria + tecleo).
  2. **Rayo cargado:** en vez de 4 palabras, LUCHAR ofrece **una palabra larga (10-14
     letras)** o frase. Mientras la escribes sin errores, una barra se carga; al terminar
     PERFECTO = "rayo cargado" (daño ×2.5). Un error = el rayo se dispara a medias (daño
     normal hasta ahí) y se corta.
  3. **Drenaje:** mientras no estás tecleando (menús), Nébula drena 1 HP cada 2 s. Decidir
     rápido es parte del reto. Bit lo avisa: *"¡No te quedes pensando, te chupa la
     energía!"*
  4. **Las crías:** en el turno enemigo caen "medusitas" (sílabas de 2-3 letras) en
     espiral desde el centro hacia afuera, no de arriba abajo.
- **Fases:** al 60 % se encienden luces (menos letras ocultas) y aparece la cría más grande:
  si la escribes 3 veces (`nebulita`), la madre se calma (+30 PAZ). Al 25 % aparece una
  mancha magenta sobre su núcleo: ACTUAR `Limpiar` ("limpias la estática de su núcleo")
  da +50 PAZ y revela la verdad.
- **PAZ:** `Cantar` ("le cantas bajito a las medusitas"), `Prometer` ("prometes no
  llevarte a nadie"), `Limpiar`.
- **Victoria:** HP 260 a 0 o PAZ. Suelta la **Super Nintendo**.
- **Diálogo:** *"...Vienes por mis hijas. Como todos."* → al final: *"Él me dijo que si el
  juego se pausaba, nunca crecerían y nunca se irían. ...Pero crecer no es irse, ¿verdad?"*

### 6.6 Minijuegos

**Pista Cero (guiño: F-Zero).** Versión infinita del minijefe: 60/90/120 s; récord = metros
recorridos (= caracteres correctos). Turbo exige acentos y `ñ`.

**Escuadrón Zorrino (guiño: Star Fox).** Oleadas infinitas; 3 vidas; récord = oleadas. A
partir de la oleada 5 hay palabras con `¿?` y `¡!`; a partir de la 10, frases de 2 palabras.

**Barriles 3D (variante opcional, guiño: Donkey Kong Country, 1994).** Mismo que Barriles pero
con palabras separadas por comas en listas (`plátano, uva, kiwi`).

### 6.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"La etiqueta en blanco"** (Bit) | 1. Recoger la etiqueta que soltó el Glitch. 2. Llevarla a Don Chip ("...es de la misma marca que el cartucho sin nombre."). | Abre una línea de diálogo nueva de Don Chip y el cartucho sin etiqueta "parpadea" en la vitrina |
| **"Huevos perdidos"** (Dino Huevín perdonado) | 1. Encontrar 3 huevos en las Colinas (cada uno es un reto de 2 palabras con acento). 2. Volver con Dino. | Tecloide Hongoló si no lo tienes; si ya, `huevo_pintado` |
| **"Piloto de pruebas"** (Rayo Cero) | Ganar Pista Cero en Normal con 0 errores los primeros 20 s. | `casco_cero` + 40 Fichas |
| **"Las crías de Nébula"** (post-jefe) | Volver al Planeta Oscuro y escribir 10 nombres de medusitas sin error (reto de ñ: `ñami`, `ñoñita`...). | `nebulita` (tesoro: una medusita que brilla en la vitrina) |

### 6.8 Easter eggs

- Letrero en Pista Cero: *"Este tipo de piso que gira se llamaba Modo 7 y fingía 3D."*
- Hangar: *"El chip que dibujaba polígonos venía DENTRO del cartucho."*
- El control de la SNES: un NPC con botones de colores dice *"En Japón y Europa soy de
  colores; en Estados Unidos soy morado. Es por la moda."*
- Un dinosaurio verde: *"Nací en un juego que venía con la consola. ¡Y tengo lengua
  larga!"*
- Planeta Oscuro: un casco espacial abandonado: *"Alguien exploró esto en 1994. Volvió
  cambiada."*
- Un NPC con un reloj y una rana: *"Un amigo mío viajó en el tiempo en 1995. Dice que
  este reino es su favorito."* (Chrono Trigger, 1995, sin nombrarlo).

### 6.9 Consola y tesoros

Se rescata la **Super Nintendo**. Tesoros: `etiqueta_blanca` ("Una etiqueta sin nada. Da
escalofríos."), `casco_cero`, `chip_fx`, `huevo_pintado`, `nebulita`, `control_colores`
("Botones de colores. Dicen que es el control más cómodo de la historia. Dicen.").

### 6.10 Mecanografía

**Acentos y ñ obligatorios desde aquí** (configurable: `Save.data.strictAccents`), signos
`¿? ¡!`, comas. Palabras de 8-10 letras y frases cortas. Objetivo: **25-32 PPM**, precisión 93 %.

---

## 7. Mundo 4 — Isla Polígono (Nintendo 64, 1996)

### 7.1 Identidad visual

| | |
|--|--|
| **Paleta** | Colores "lavados" de los primeros 3D con niebla: cielo `#9FD3FF`, niebla `#C9D6E3`, pasto `#58B85C`, pasto sombra `#3E8E44`, roca `#9A8C7A`, roca sombra `#6B5F52`, agua `#3C8DD6`, arena `#E8D8A8`, naranja `#F0953C`, morado `#7E57C2`, rojo `#D64545`, amarillo `#F7E463`, blanco `#F4F4F4`, negro `#202030`. |
| **Estilo** | Los sprites siguen siendo 16×16, pero dibujados **como si fueran polígonos**: pocas caras planas, sombreado por cara (lado claro/lado oscuro), texturas borrosas (2×2 píxeles del mismo tono). Todo el overworld tiene **niebla**: las casillas a más de 5 de distancia se tiñen al color niebla. |
| **Overworld** | isla con playa, un castillo con cuadros, un estadio y un templo musical. La "cámara" es un chiste recurrente: al entrar a cuartos, un texto dice *"(La cámara se atora en una pared.)"* |

### 7.2 Historia

El Glitch intenta **pausar la isla**: el cielo se queda a medio dibujar (polígonos que
faltan: casillas negras con `MISSING` en texto chiquito). Para arreglarlo hay que aprender
las **melodías** de Ocarín, el músico del templo; cada melodía re-dibuja una parte de la
isla (abre zonas). La última melodía es la **Canción de Despertar**, que al final del mundo
te da la **Flauta Polígono**... la misma que despierta al Roncatón del pueblo (§12).
Zonas: Playa (enemigos) → Estadio Polígono (Dani, Tecloides 3v3 con público) → Circuito
Isla (minijefe Kart) → Templo de la Melodía (minijefe Ocarín) → Castillo de los Cuadros
(JEFE Marco, Rey de los Cuadros).

### 7.3 Enemigos normales

| Enemigo | Concepto | HP/ATQ/DEF/XP | Entrena |
|---------|----------|---------------|---------|
| **Trianguloso** | triángulo con un ojo; se cree el átomo del 3D | 85/5/3/34 | fila numérica: `3 lados`, `1 ojo` |
| **Texturín** | una textura borrosa que anda buscando su modelo | 90/5/2/36 | palabras que aparecen borrosas 0.5 s y luego se aclaran (lectura rápida) |
| **Niebla Lejana** | nube gris que dice "no me veas, no estoy cargada" | 80/4/4/32 | palabras que llegan desde el fondo (chicas→grandes); hay que escribir en orden de cercanía |
| **Cámara Loca** | cámara con alas que se atora en las paredes | 95/5/3/38 | la caja de texto gira ±15° (las palabras están inclinadas) |
| **Pakito Vibra** (guiño Rumble Pak) | cubito gris que vibra todo el tiempo | 100/6/3/40 | palabras que tiemblan; precisión bajo presión |
| **Cactín Salvaje** | cactus poligonal con sombrero | 75/4/2/30 | números y palabras mezclados: `4 espinas`, `2 flores` |

ACTUAR (una fila por enemigo; 3 acciones):
- **Trianguloso:** `Contar` ("cuentas sus tres lados": *"¡Tres! Soy perfecto."* +45) /
  `Dibujar` ("dibujas un cuadrado a su lado": *"¡Un amigo con cuatro!"* +50) / `Elogiar`
  ("eres la base de todo lo 3d": *"Lo sé, pero gracias."* +35).
- **Texturín:** `Enfocar` ("ajustas el enfoque despacio": *"¡Me veo! ¡Soy un ladrillo!"*
  +50) / `Pegar` ("la pegas en un cubo": *"Por fin tengo forma."* +45) / `Filtro` ("le
  pones un filtro bilineal": *"Ahh, suavecito."* +40).
- **Niebla Lejana:** `Esperar` ("esperas a que cargue": *"...Ya. Gracias por la
  paciencia."* +50) / `Acercar` ("caminas hacia ella sin miedo": *"¡Nadie se acerca!"* +45) /
  `Dibujar` ("dibujas montañas detrás de la niebla": *"¿Eso había?"* +40).
- **Cámara Loca:** `Centrar` ("pulsas el botón de centrar cámara": *"¡Ahh! ¡Mi botón
  favorito!"* +50) / `Pared` ("le dices que las paredes no muerden": *"¿Segura?"* +40) /
  `Foto` ("posas para la foto": *"¡Clic! Salió borrosa. Perfecta."* +45).
- **Pakito Vibra:** `Abrazar` ("lo abrazas hasta que se calma": *"brrr... brr... b."* +50)
  / `Pilas` ("le quitas una pila": *"¡Oye! ...bueno, vibro menos."* +40) / `Ritmo` ("vibras
  al mismo ritmo": *"¡Somos una banda!"* +45).
- **Cactín:** `Sombrero` ("le acomodas el sombrero": *"Gracias, el sol pega fuerte."* +45) /
  `Agua` ("le das una gota de agua, solo una": *"Justo lo que necesitaba."* +50) / `Cantar`
  ("cantas una ranchera corta": *"¡Ajúa!"* +40).

Cactín (Tecloide BROTE) se obtiene perdonando a Cactín Salvaje.

### 7.4 Minijefes

#### Minijefe A — PILOTO SOMBRA, Circuito Isla (guiño: Mario Kart 64, 1996)

- **Concepto:** kart con un piloto que es tu propia sombra (una copia morada: regalo del
  Glitch). Carrera de 3 vueltas con **objetos**.
- **Mecánica — "Carrera con objetos":** igual que Pista Cero (tecleo continuo = velocidad)
  pero sobre un circuito en lazo (barra de progreso ×3 vueltas) y con **cajas de objeto**
  cada 25 % de vuelta: al pasar una, aparece un objeto que se activa escribiendo su palabra:
  - `plátano` → el rival derrapa 1.5 s.
  - `caparazón` → el rival se detiene 2 s (solo si está adelante).
  - `rayo` → el rival se encoge y baja 30 % su velocidad por 4 s.
  - `estrella` → tú eres inmune a objetos 5 s y +20 % velocidad.
  El rival también usa objetos: cuando te lanza uno, aparece una **palabra de defensa** de 1
  s (`esquiva`) — escribirla a tiempo anula el objeto.
  Rival a velocidad fija equivalente a 33 PPM (Normal) con "goma elástica": si vas muy
  adelante, acelera 10 %.
- **Victoria:** cruzar la meta primero. Hay **4 corredores** (tú, Piloto Sombra, Dani Turbo y
  Rayo Cero de visita): tienes que quedar 1º para el tesoro, 2º o 3º deja continuar.
- **Diálogo:** *"Soy tu sombra. Sé exactamente qué tan lento escribes."*, *"¡Cuatro puertos,
  cuatro corredores!"*

#### Minijefe B — OCARÍN y el Templo de la Melodía (guiño: Ocarina of Time, 1998)

- **Concepto:** músico poligonal con una **flauta de polígonos**. No pelea: te enseña melodías. "Vencerlo" es tocar las 5 melodías perfectas.
- **Mecánica — "Melodías con teclas":** las notas son 5 teclas: `s d f j k` (dos manos, la
  posición base). Ocarín toca una melodía (se iluminan las teclas en pantalla y suena cada
  nota con el motor chiptune), de 4 a 8 notas. Tú la repites escribiendo la secuencia; cada
  nota tiene una ventana de ritmo (±250 ms respecto al tempo) para un "¡PERFECTO!"; fuera de
  ventana pero correcta = "bien"; tecla incorrecta = la melodía se reinicia. 
- **Las 5 melodías (originales):**

  | Melodía | Notas (`s d f j k`) | Efecto en la isla |
  |---------|---------------------|-------------------|
  | Canción del Sol | `s f k f` | quita la niebla de la Playa |
  | Canción de la Lluvia | `d j d j s` | llena el río, abre el Circuito |
  | Canción del Viento | `f k j f d s` | abre el Estadio |
  | Canción del Cuadro | `k j f d j k s` | abre el Castillo de los Cuadros |
  | Canción de Despertar | `s d f j k j f d` | se aprende al final del mundo; despierta al Roncatón |

- **Victoria:** tocar las 5 (las 4 primeras durante el mundo, la 5ª tras el jefe). Cada
  melodía nueva se agrega a un submenú del diario: se puede tocar en el overworld
  escribiendo su secuencia.
- **Diálogo:** *"La música es tecleo con ritmo. O el tecleo es música sin ritmo. Uno de
  los dos."*, *"Cinco notas bastan. Siempre bastaron."*
- Recompensa: minijuego Melodías; al final, la **Flauta Polígono**.

#### Minijefe C — DANI TURBO, Estadio Polígono (guiño: Pokémon Stadium, N64)

Tecloides 3 vs 3 con **público** (la pantalla tiene gradas y un locutor que comenta en
texto: *"¡Y ESE ATAQUE FUE MUY EFICAZ, QUERIDO PÚBLICO!"*). Su `???` ya evolucionó y es más
fuerte; Dani está incómodo: *"No me hace caso... pero es fuerte."* Novedad: antes de cada
ataque, el locutor dice el nombre del ataque y la palabra aparece **con 0.3 s menos** de
tiempo. Ganar: 60 Fichas y Dani empieza a dudar del Glitch.

### 7.5 JEFE — MARCO, REY DE LOS CUADROS (guiño: Super Mario 64, 1996)

- **Concepto:** un marco de cuadro dorado con cara, que custodia un castillo lleno de
  **pinturas que son mundos**. El Glitch le pidió que "guardara" las 8 Estrellas Polígono
  dentro de los cuadros para que la isla nunca termine de cargar. La N64 está en el cuadro del
  sótano.
- **Mecánica — "Saltar al cuadro":** la batalla es un **recorrido por 8 cuadros**, no una
  pelea fija. Cada cuadro es un mini-reto de tecleo de ~25 s, temático, que al completarse da
  una **Estrella**. Con 8 estrellas se abre la pelea final con Marco. Si fallas un cuadro,
  sales "despedido" al pasillo (−8 HP) y puedes volver a entrar.

  | Cuadro | Reto |
  |--------|------|
  | 1. Campo de Bob | 6 palabras t1 (calentamiento) |
  | 2. Fortaleza Rápida | 6 palabras con mayúscula inicial en 20 s |
  | 3. Bahía Grande | frase larga (12 palabras) con comas |
  | 4. Montaña Fría | palabras que "se congelan": tienes 2 s para empezar cada una o se bloquea y hay que escribir `derretir` |
  | 5. Caverna de Números | 8 números de 2-3 cifras (`64`, `120`, `1996`) |
  | 6. Reloj Tic-Tac | 10 palabras al ritmo exacto de un reloj (1 por segundo) |
  | 7. Arcoíris | palabras con acento y ñ, 8 seguidas sin error |
  | 8. Cuadro del Sótano | mezcla de todo; aquí está la N64 "pintada" |

- **Pelea final con Marco** (HP 300): LUCHAR normal pero las palabras aparecen **dentro de un
  marco que gira lentamente** (texto rotado hasta ±30°). Lluvia: "pinceladas" (palabras de
  colores que caen de los lados, no solo de arriba). Cada estrella obtenida PERFECTA (sin
  errores en todo el cuadro) resta 20 HP a Marco antes de empezar.
- **PAZ:** `Colgar` ("lo cuelgas derechito en la pared" → *"Ahh, llevaba 30 años
  chueco."*), `Admirar` ("admiras su arte en silencio"), `Pausa` ("le dices que un cuadro ya
  es una pausa" → *"...Eso es cierto. No necesito al morado para eso."* +50).
- **Victoria:** HP 0 o PAZ. Suelta la **Nintendo 64**. Tras el jefe, Ocarín enseña la Canción
  de Despertar y entrega la **Flauta Polígono**.
- **Diálogo:** *"Toda pintura es un mundo. Todo mundo es una pausa."*, *"Trescientas
  ventanas... bueno, ocho cuadros. Presupuesto."*

### 7.6 Minijuegos

**Carrera Polígono (guiño: Mario Kart 64).** Versión arcade del minijefe, 3 dificultades, 4
corredores. Récord: mejor tiempo por vuelta.

**Melodías (guiño: Ocarina).** Modo "repite la secuencia": Ocarín toca secuencias cada vez
más largas (4 → 12 notas) sobre `s d f j k` (Turbo añade `a` y `l` = 7 notas). Récord:
secuencia más larga. Es, en el fondo, un entrenador de posición base de las manos.

### 7.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"Las 8 estrellas perfectas"** (Marco) | Completar los 8 cuadros sin un solo error (se puede repetir desde el castillo). | `estrella_120` ("Hay una leyenda sobre 120 estrellas. Tú tienes una. Es suficiente.") |
| **"El concierto de Ocarín"** | 1. Tocar las 5 melodías en Melodías modo Normal. 2. Tocar una melodía de 10 notas PERFECTA. | Ocarín se muda al pueblo + `flauta_repuesto` |
| **"Cuatro puertos"** (Dani) | Ganar la Carrera Polígono quedando 1º contra los 3 rivales. | 60 Fichas + sprite de kart para Bit |
| **"La cámara se atora"** (Cámara Loca perdonada) | Encontrar 4 paredes donde "la cámara se atora" (letreros ocultos) y escribir la palabra de cada una (`pared`, `esquina`, `techo`, `puerta`). | `camara_amiga` ("Ahora apunta a donde tú quieres. Milagro.") |

### 7.8 Easter eggs

- El castillo tiene un letrero: *"Este castillo tiene menos cuadros que el original. Pero
  los nuestros hablan."*
- Un cubo gris en la playa: *"Soy un paquete que hace vibrar. Nací en 1997 con un zorro."*
  (Rumble Pak, Star Fox 64).
- Cuatro sillas frente a una tele: *"Cuatro puertos. Cuatro amigos. Cero cables largos."*
- Una máscara en el templo: *"Tengo tres días. Siempre tengo tres días."* (Majora's Mask,
  2000, sin nombrar).
- Bit al quedarse quieto: *"Dicen que esta consola seguía usando cartuchos cuando todos ya
  usaban CD. Cargaba rapidísimo."*
- Un oso con un pájaro en la mochila pasan al fondo sin hablar (sin nombres).

### 7.9 Consola y tesoros

Se rescata la **Nintendo 64**. Tesoros: `flauta_poligono` (clave: despierta al Roncatón),
`estrella_120`, `camara_amiga`, `pak_vibra` ("Hace brrr. Es todo. Es suficiente."),
`palanca_analogica` ("La primera palanca de Nintendo. Se desgastaba, pero valía la pena."),
`flauta_repuesto`.

### 7.10 Mecanografía

**Fila numérica** (0-9), fechas y cifras, secuencias de teclas con ritmo (posición base `s d
f j k`), lectura rápida de palabras inclinadas/borrosas. Objetivo: **32-38 PPM**, precisión 94 %.

---

## 8. Mundo 5 — Cubo Galáctico (GameCube, 2001)

### 8.1 Identidad visual

| | |
|--|--|
| **Paleta** | Índigo de la consola y brillos "plásticos": índigo `#4B3F9E`, índigo oscuro `#2D2566`, lila `#8E86D9`, cielo `#7EC8FF`, verde A `#3BB54A` (el botón verde), naranja `#F28C28`, amarillo C `#F5D547`, gris plata `#C8CBD6`, blanco `#FFFFFF`, azul agua `#2B9EDB`, rojo `#E04B4B`, café `#8B5E3C`, negro `#17162B`. |
| **Estilo** | sprites 16×16 con **brillo especular** (un píxel blanco en la esquina de todo, como plástico pulido) y sombras proyectadas bajo cada personaje. El overworld tiene **agua con reflejos** y cel-shading (contornos negros gruesos en algunas zonas, guiño a Wind Waker). |
| **Overworld** | una isla-cubo que flota en el espacio: cada cara del cubo es una zona (Isla Celeste, Jardín Brotitos, Pueblo de Bellota, Estación Visor, Arena Final). Se gira el cubo desde un centro. |

### 8.2 Historia

Este es el mundo del **giro emocional**. El Glitch ya no se esconde: invoca **copias en
sombra de los jefes anteriores** (Tetro Rey, Lord Caparazón, Reina Nébula, Marco), hechas de
estática magenta, para detenerte. Al vencer a cada copia, la copia dice una frase del
original pero "al revés" (triste): por ejemplo la copia de Tetro Rey: *"Todo encaja... menos
yo."* En la Estación Visor, Bit descubre por un escáner que **él también salió del cartucho
sin nombre**: era el cursor de ese prototipo. El Glitch, al final del mundo, aparece y muestra
su pantalla `NOMBRE: _______`, vacía. No pelea. Solo dice: *"Yo también quería que alguien
escribiera aquí."* y se va. Don Chip, en el pueblo, encuentra la caja del prototipo en el
sótano. Y se descubre que Champi era el dibujo del cuaderno del Don Chip niño: el "amigo que
salió a jugar en 1989" era el propio Don Chip.

Zonas: Isla Celeste (navegación con batuta, enemigos) → Jardín Brotitos (minijefe Capitán
Brotes) → Pueblo de Bellota (quests de cartas) → Estación Visor (minijefe Casco Escáner,
revelación de Bit) → Arena Final (JEFE El Guante Crossover).

### 8.3 Enemigos normales

| Enemigo | Concepto | HP/ATQ/DEF/XP | Entrena |
|---------|----------|---------------|---------|
| **Cubito** | cubo índigo con manija; quiere que lo cargues | 100/6/4/42 | frases completas: `El cubo tiene manija.` |
| **Disquín** | disco de 8 cm que gira y se marea | 95/5/3/40 | palabras circulares: las letras aparecen en círculo y se escriben en orden |
| **Delfinito Salvaje** | delfín juguetón (guiño al nombre clave "Dolphin") | 110/6/3/45 | frases con dos mayúsculas: `Salta Delfinito, salta.` |
| **Sombra de Cel** | sombra con contorno negro grueso; se pega a las paredes | 105/6/5/44 | palabras en negativo (blanco sobre negro) |
| **Fantasmita Aspirada** (guiño Luigi's Mansion) | fantasma travieso que se esconde en cuadros | 90/5/4/40 | palabras que se esconden: solo se ven cuando escribes la primera letra |
| **Brotito Rojo/Azul/Amarillo** | criaturitas-planta de 3 colores que siguen órdenes | 60/3/2/30 (vienen de 3 en 3) | cambio de contexto: la palabra dice a cuál le hablas (`rojo: cava`) |

ACTUAR (3 por enemigo):
- **Cubito:** `Cargar` ("lo cargas de la manija con cuidado" → *"¡Vamos a la casa de un
  amigo!"* +50) / `Cubo` ("le dices que es el cubo más bonito" → *"Soy índigo, no morado.
  ÍNDIGO."* +40) / `Abrir` ("abres la tapita de arriba" → *"¡Mi disco está aquí!"* +45).
- **Disquín:** `Parar` ("lo detienes con un dedo suave" → *"Uff. El mundo seguía girando."*
  +50) / `Limpiar` ("lo limpias del centro hacia afuera" → *"¡Así es como se hace!"* +45) /
  `Chico` ("le dices que ser chico es práctico" → *"¡Ocho centímetros de pura potencia!"*
  +40).
- **Delfinito:** `Nadar` ("nadas a su lado" → *"¡Iiiik!"* +45) / `Aro` ("lanzas un aro al
  agua" → *"¡Lo atrapo! ¡Otra vez!"* +50) / `Nombre` ("le preguntas por su nombre secreto"
  → *"Shh. Es Dolphin. No lo digas."* +40).
- **Sombra de Cel:** `Luz` ("le das luz de frente" → *"Mi contorno se ve genial."* +45) /
  `Dibujar` ("delineas su borde con cuidado" → *"¡Más grueso! ¡Más!"* +50) / `Viento` ("la
  despegas de la pared con un soplo" → *"¡Libre!"* +40).
- **Fantasmita:** `Aspirar` ("la aspiras... no, mejor la saludas" → *"¡Buh! Digo, hola."*
  +45) / `Cuadro` ("miras el cuadro donde se esconde" → *"Me encontraste. Juguemos otra."*
  +50) / `Linterna` ("prendes la linterna un segundo" → *"¡Ay, mis ojitos!"* +35).
- **Brotitos:** `Silbar` ("silbas para que vengan los tres" → *"¡Sí, capitán!"* +50) /
  `Plantar` ("los plantas un rato al sol" → *"Crecen las hojitas."* +45) / `Contar` ("cuentas
  uno, dos, tres" → *"¡Estamos todos!"* +40).

Delfinito (Tecloide GOTA) se obtiene perdonando a Delfinito Salvaje.

### 8.4 Minijefes

#### Minijefe A — CAPITÁN BROTES (guiño: Pikmin, 2001)

- **Concepto:** explorador diminuto con casco y antena que dirige a los Brotitos. Cree que tú
  eres un "gigante" y manda a sus tropas contra ti... hasta que entiende.
- **Mecánica — "Órdenes de colores":** la pantalla tiene 3 escuadrones (ROJO, AZUL, AMARILLO)
  de Brotitos y 3 tareas (fuego, agua, altura). Caen **órdenes** con prefijo de color: `rojo:
  apagar`, `azul: nadar`, `amarillo: saltar`. Escribir la orden completa (con el prefijo y los
  dos puntos) manda al escuadrón correcto y gana terreno (barra de "día"). Orden con color
  equivocado = el escuadrón se pierde (pierdes 1 de los 10 Brotitos de ese color). Cada 6
  órdenes correctas seguidas, el Capitán pierde 25 HP ("¡se me acaban los brotes!"). El sol se
  pone en 90 s: si no venciste, "termina el día" y se reinicia con 10 % menos de HP.
- **Victoria:** HP 150 o PAZ: `Silbato` ("silbas la nota de reunión"), `Gigante` ("le
  explicas que no eres gigante, solo normal"), `Nave` ("le ayudas a juntar piezas de su
  nave").
- **Escalado:** órdenes de 1 → 2 palabras (`rojo: apagar fuego`).
- **Diálogo:** *"¡Diez brotitos rojos, a mí!"*, *"Tengo 30 días. Este es el 29."*

#### Minijefe B — CASCO ESCÁNER (guiño: Metroid Prime, 2002)

- **Concepto:** un casco-visor flotante que te "escanea" y guarda tu información. Es el
  momento de la revelación: al escanear a Bit, muestra *"ORIGEN: CARTUCHO SIN NOMBRE"*.
- **Mecánica — "Visor de escaneo":** la batalla alterna dos visores:
  - **Visor de Combate:** LUCHAR normal.
  - **Visor de Escaneo:** aparecen 4 "objetos" en la pantalla con texto de datos (una línea
    cada uno, 6-10 palabras con mayúsculas y puntos). Escribir una línea completa la
    "escanea": revela una debilidad del casco (p.ej. *"Su visera se nubla con el vapor."*) y
    desbloquea un ACTUAR nuevo con +50 PAZ. Escanear las 4 = Casco se queda sin secretos y
    pierde su DEF (de 6 a 0).
  - Cambia de visor cada turno; Bit lo anuncia.
- **Victoria:** HP 170 o PAZ (los ACTUAR se desbloquean escaneando). Al vencerlo, el casco
  dice el dato sobre Bit.
- **Diálogo:** *"Escaneo completo. Sujeto: rápido. Nervioso. Sin nombre."*, *"Toda la
  información es... información."*

#### Las 4 Copias de Sombra (mini-encuentros, guiño al concepto crossover de Smash)

Entre zonas, aparece una copia magenta de un jefe anterior con **la misma mecánica
resumida a 30 s** y HP al 40 %. Ganarlas no es obligatorio pero cada copia perdonada da una
**frase para el final** (§10). La copia habla triste: Tetro Rey: *"Todo encaja... menos yo."*;
Caparazón: *"Mi castillo es otro castillo."*; Nébula: *"Mis hijas no me reconocen."*;
Marco: *"Un cuadro sin nadie que lo mire."* Si se les perdona (`Abrazar` → "abrazas a la
sombra aunque pique"), se desvanecen diciendo *"...gracias."* y su original en el pueblo lo
nota.

### 8.5 JEFE — EL GUANTE CROSSOVER (guiño: Super Smash Bros. Melee, 2001)

- **Concepto:** un guante blanco gigante con guantelete índigo que "coleccionó" copias de
  todos los jefes como figuritas. Está en la Arena Final, una plataforma flotante con dos
  bordes. Es el jefe que representa al Glitch "jugando con sus juguetes".
- **Mecánica — "Porcentaje y lanzamiento":**
  - No hay HP: hay **PORCENTAJE** (empieza en 0 %). Cada palabra que escribes bien sube su %
    (velocidad × longitud, igual que el daño actual pero mostrado como %). Tu HP también se
    muestra como %.
  - **Golpe Smash:** cuando su % ≥ 100, LUCHAR ofrece un **SMASH**: una frase larga (8-10
    palabras, con mayúsculas y puntuación) que hay que escribir PERFECTA en 12 s. Si lo logras,
    el Guante sale volando fuera de la plataforma = **1 caída** (necesitas 3). Si fallas, su %
    baja a 60 y hay que volver a subirlo.
  - **Tu lanzamiento:** en el turno del Guante, caen palabras desde los lados (puñetazos
    horizontales) y desde arriba. Cada golpe sube tu %. Si tu % ≥ 100 y te pega otra vez, sales
    volando: aparece `recuperar` con 2 s para escribirla y volver al borde (tu % baja a 50 si
    lo logras); si no, pierdes una de tus **3 vidas** (no HP).
  - **Figuritas:** cada 2 turnos, el Guante "tira" una figurita de jefe anterior: durante un
    turno se usa la lluvia de ese jefe (bloques, bolas de fuego, medusitas, pinceladas).
- **PAZ:** `Chocar` ("chocas la mano con el guante" → *"...Nadie me había chocado."* +45),
  `Figuras` ("le dices que las figuritas no son juguetes" → *"...Son amigos. Ya lo sé."*
  +40), `Suelta` ("le pides que suelte a Bit" → el Guante tiene a Bit atrapado en la 3ª fase;
  +50).
- **Victoria:** 3 caídas o PAZ. Suelta la **GameCube** (con manija; Bit la carga).
- **Diálogo:** *"¡Bienvenido a la Arena! Todos contra todos. Yo contra todos."*, *"Esta
  consola vendió más de mi juego que de ninguno. Lo digo con humildad."* (real: Melee fue el
  juego más vendido de GameCube).

### 8.6 Minijuegos

**Correo de Bellota (guiño: Animal Crossing).**
- La Alcaldesa Bellota te pide escribir **cartas** a los vecinos. Cada carta = 3 renglones
  dictados (frases de 6-10 palabras con mayúsculas, comas, puntos, signos de pregunta). Un
  vecino responde según tu precisión: ≥ 97 % → carta feliz y regalo; 90-96 % → "gracias";
  < 90 % → *"Tu letra está rara, pero gracias."*
- Hay 10 vecinos (animales originales: Bellota la ardilla alcaldesa, Nabo el cerdito, Lima
  el gato, Canela la perrita, Piñón el búho...). Cada uno tiene 3 cartas. Récord: cartas
  perfectas.
- Es el minijuego de **frases largas y puntuación** del juego. Turbo: tú redactas la
  respuesta libremente con un mínimo de 15 palabras (sin tiempo; se califica solo con que
  empiece con mayúscula y termine con punto; Bellota responde siempre feliz).

**Brotitos (guiño: Pikmin).** Versión arcade del minijefe: 90 s, récord = órdenes correctas.
Turbo añade un 4º color (`morado`).

**Batuta del Viento (guiño: The Wind Waker, 2002/2003).** Navegación: para cruzar el mar de
la Isla Celeste, se "dirige" el viento escribiendo una secuencia de direcciones con ritmo
(`norte sur este`, cada palabra en un tiempo del compás a 3/4). Mini, dura 15 s, pero es
necesario para moverse entre islotes.

### 8.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"Diez cartas"** (Bellota) | 1. Escribir una carta a cada vecino. 2. Recibir 5 respuestas felices. | `buzon_rojo` + Bellota se muda al pueblo (abre el buzón del pueblo) |
| **"La caja del sótano"** (Don Chip, principal secundaria) | 1. Después de la Estación Visor, hablar con Don Chip. 2. Ayudarle a leer la caja: reto de 4 líneas (texto de la caja). 3. Escuchar la historia. | Diálogo clave + `caja_prototipo` |
| **"Las cuatro sombras"** | Perdonar a las 4 copias de sombra. | 4 frases para la batalla final + `figurita_dorada` |
| **"El día 30"** (Capitán Brotes) | Ganar Brotitos Normal con 40 órdenes correctas. | `silbato_brotes` + 50 Fichas |

### 8.8 Easter eggs

- Un cubo con manija en la plaza: *"Tengo manija. Soy portátil. Técnicamente."*
- Un disco de 8 cm: *"Soy chiquito y guardo mil cuatrocientos megas. Más o menos."* (los
  discos de GameCube guardaban ~1.5 GB; se redondea).
- Un NPC con dos personajes en un kart: *"Dos en un kart. Uno maneja, otro avienta. 2003."*
  (Double Dash, sin nombrar).
- Dispositivo en el laboratorio del pueblo: *"Con este aparato jugabas Game Boy en la tele.
  2003."* (Game Boy Player).
- Bit: *"¿Sabías que el nombre secreto de este cubo era 'Dolphin'? Por eso hay tantos
  delfines."*
- El botón verde grande en una fuente: *"Soy el botón A. Soy grande para que no te
  equivoques."*

### 8.9 Consola y tesoros

Se rescata la **GameCube**. Tesoros: `caja_prototipo` ("Caja de cartón, sin dibujo, sin
nombre. Pesa mucho para lo que es."), `buzon_rojo`, `figurita_dorada`, `silbato_brotes`,
`disco_mini` ("Ocho centímetros de aventura."), `manija` ("La manija de la consola. Para
llevarla a casa de un amigo.").

### 8.10 Mecanografía

**Frases completas** con mayúsculas, comas, puntos, signos de pregunta/exclamación; dos
puntos (`rojo:`); cambio de contexto. Objetivo: **38-44 PPM**, precisión 95 %.

---

## 9. Mundo 6 — Ciudad Sensor (Wii, 2006)

### 9.1 Identidad visual

| | |
|--|--|
| **Paleta** | Blanco y azul-cielo del menú de la consola, muy limpio: blanco `#FAFAFA`, gris claro `#E6E9EE`, gris `#AAB2BD`, azul cielo `#5BC0EB`, azul menú `#1E88E5`, azul oscuro `#0D47A1`, verde `#43D17A`, amarillo `#FFD54F`, naranja `#FF8A3D`, rojo `#F44336`, rosa `#F48FB1`, morado `#9C6ADE`, negro `#222222`. |
| **Estilo** | sprites 16×16 **redondos y simples**, caras de personajes tipo "muñeco" (ojos puntitos, sin nariz) para guiñar a los Mii sin copiarlos. Overworld muy luminoso, con **canales** cuadrados (ventanas flotantes) que son las zonas, como el menú de la consola. Un "cursor-mano" flota en el fondo (chiste con Bit: *"Es mi tío."*). |
| **Overworld** | una ciudad moderna con gimnasio, estadio, observatorio y una gran pantalla central que muestra "canales": Canal Deportes, Canal Observatorio, Canal Galaxia, y un canal apagado: **Canal Vacío** (el final). |

### 9.2 Historia

El Glitch, ya desesperado, intenta el **apagón definitivo**: apagar la Ciudad Sensor con su
"luz de standby". Los canales se van apagando uno por uno; el jugador los "enciende" al
ganar en cada zona. Dani Turbo llega **sin** su Tecloide `???`: lo liberó. *"No era mío. Era
de él. Y tampoco era de él, la verdad."* Al encender el Canal Galaxia, el Capitán Cometa (el
jefe) resulta ser un aliado forzado: el Glitch le quitó la gravedad y tiene que pelear
contigo para recuperarla. Tras vencerlo, se abre el **Canal Vacío** (§10). Zonas: Plaza
Canal (enemigos) → Gimnasio Sensor (minijefes de deporte) → Torneo Sensor (Dani, 3v3 final)
→ Observatorio (JEFE Capitán Cometa) → Canal Vacío.

### 9.3 Enemigos normales

| Enemigo | Concepto | HP/ATQ/DEF/XP | Entrena |
|---------|----------|---------------|---------|
| **Sensorín** | la barra sensora con dos ojitos LED que te "ve" | 120/7/4/50 | palabras que aparecen en dos puntos de la pantalla (izquierda/derecha) alternados |
| **Correíta** | la correa de seguridad del control; muy preocupada por todos | 110/6/5/48 | frases de advertencia con mayúsculas: `¡Ponte la correa!` |
| **Nunchuquín** | el control chiquito que cuelga de un cable; siempre va de segundo | 115/6/4/48 | palabras partidas en dos mitades que se escriben seguidas |
| **Muñequito** | habitante de la ciudad con cara simple; copia tus gestos | 100/6/3/45 | **repetir lo que el enemigo "dice"**: escribe su frase exacta, incluida puntuación |
| **Canal Clima** | una nubecita con pronóstico | 105/5/5/46 | números y símbolos: `24°`, `75%`, `10 km/h` |
| **Zumbito Salvaje** | abeja de LED que zumba al ritmo | 90/5/3/42 | ritmo constante: letras cada 600 ms exactos |

ACTUAR:
- **Sensorín:** `Alinear` ("la pones derechita sobre la tele" → *"¡Ahora sí te veo!"* +50) /
  `Lejos` ("te paras a la distancia correcta" → *"Un metro... dos. ¡Perfecto!"* +45) /
  `Luz` ("apagas la lámpara que la confunde" → *"¡Gracias! Esa lámpara me daba
  dolor de cabeza."* +40).
- **Correíta:** `Ponerse` ("te pones la correa en la muñeca" → *"¡Por fin alguien
  responsable!"* +55) / `Tele` ("le prometes no romper la tele" → *"...Lo voy a anotar."*
  +40) / `Calma` ("le dices que todo va a estar bien" → *"¿Seguro? ...Ok."* +45).
- **Nunchuquín:** `Primero` ("lo dejas ir primero" → *"¿Yo? ¿Primero? ¡Wow!"* +55) /
  `Cable` ("desenredas su cable" → *"Llevaba desde 2006 enredado."* +45) / `Palanca` ("mueves
  su palanquita con cuidado" → *"Jiji, cosquillas."* +40).
- **Muñequito:** `Imitar` ("imitas su cara de puntitos" → *"¡Jaja! ¡Te pareces a mí!"* +50)
  / `Crear` ("le diseñas unas cejas nuevas" → *"¡Cejas! ¡Qué expresivo!"* +45) / `Saludar`
  ("lo saludas agitando la mano" → agita la mano igual +40).
- **Canal Clima:** `Pronóstico` ("le preguntas si va a llover" → *"Veinte por ciento. Trae
  paraguas igual."* +45) / `Sol` ("le pides un día soleado" → *"Para ti, 25 grados."* +50) /
  `Nube` ("la abrazas aunque esté fría" → *"Brrr. Pero gracias."* +40).
- **Zumbito:** `Ritmo` ("aplaudes a su ritmo" → *"¡Bzz bzz bzz!"* +50) / `Flor` ("le das
  una flor de LED" → *"¡Mi favorita!"* +45) / `Silencio` ("le pides un segundo de silencio"
  → *"...bzz? Un segundo. Ya."* +35).

Zumbito (Tecloide CHISPA) se obtiene perdonando a Zumbito Salvaje.

### 9.4 Minijefes

#### Minijefe A — ENTRENADOR MI y el Gimnasio Sensor (guiño: Wii Sports, 2006)

- **Concepto:** un instructor con cara simple y chaleco blanco que te hace pasar tres
  pruebas deportivas de **ritmo**. Es un "jefe" de tres rondas; no hay HP, se pasan las
  pruebas.
- **Prueba 1 — Boliche Sensor:** aparece una palabra; cada letra debe escribirse a un ritmo
  **constante** (metrónomo a 90 BPM). Una barra muestra tu ritmo; si todas las letras caen en
  ventana (±120 ms), la bola va derecha = **chuza** (10 pinos). Letras irregulares = la bola
  se curva (menos pinos). 10 tiros. Victoria: ≥ 60 pinos.
- **Prueba 2 — Tenis Sensor:** la pelota va y viene; cada golpe es **una palabra que solo
  usa la mano izquierda** (`gato`, `casa`, `verde`) o **solo la derecha** (`pollo`, `lima`,
  `nulo`) — se indica con el lado de la cancha. Alternan. Un error = pierdes el punto. Set a
  7 puntos.
- **Prueba 3 — Box Sensor:** como Puñín pero en ritmo: `izq` / `der` / `agacha` aparecen al
  compás de 100 BPM; escribirlas en el tiempo correcto = golpe; fuera de tiempo = recibes.
  Victoria: 20 golpes antes de 5 recibidos.
- **Diálogo:** *"¡El deporte es ritmo! ¡El tecleo es ritmo! ¡Todo es ritmo!"*, *"Recuerda
  ponerte la correa. Correíta me lo pidió."*
- Recompensa: los 3 minijuegos de deporte en el arcade y `pelota_boliche`.

#### Minijefe B — DANI TURBO, Torneo Sensor (Tecloides 3v3, final del rival)

Su equipo definitivo (etapa 3, nv 28), sin `???`. Es el combate de Tecloides más difícil del
juego principal: sus palabras de ataque son de 8-12 letras con acento, y en su turno las
palabras de esquiva tienen 20 % menos de tiempo. Si ganas: *"...Ok. Eres el más rápido del
museo. Lo digo yo, que soy el segundo."* Te presta a su inicial para la batalla final
(aparece como 4º Tecloide solo en §10).

### 9.5 JEFE — CAPITÁN COMETA (guiño: Super Mario Galaxy, 2007)

- **Concepto:** un capitán de nave-observatorio con capa azul y estrellitas que orbitan a su
  alrededor. Custodia la Wii en el Observatorio. El Glitch le robó la gravedad: ahora todo
  cae en cualquier dirección y las estrellitas (sus amigas) salen disparadas. Pelea contigo
  porque "solo un tecleo muy estable puede restaurar la órbita". Al final es tu aliado.
- **Mecánica — "Gravedad de planetitas":**
  - La caja de batalla tiene al centro un **planeta pequeño**. En el turno enemigo, las
    palabras caen **desde los 4 lados** hacia el centro (gravedad hacia el planeta). Van más
    lento cerca del borde y más rápido cerca del planeta (aceleración). Hay que escribirlas
    antes de que toquen el planeta.
  - **Cambio de gravedad:** cada 2 turnos, el Capitán gira el planeta: el **texto de las
    palabras de LUCHAR aparece invertido vertical (de cabeza) o en espejo** por un turno.
    ACTUAR `Estabilizar` ("estabilizas la órbita con calma", +40 PAZ) cancela el giro.
  - **Estrellitas:** 7 estrellitas orbitan al Capitán. Cada PERFECTO en LUCHAR "rescata"
    una (se pone de tu lado y baja la velocidad de la lluvia 5 %). Con 7 rescatadas, el
    Capitán dice *"...Ya tienes mi gravedad. Úsala."* y entra en fase final.
  - **Fase final:** "Caída libre": un párrafo continuo de 40 palabras mientras el fondo gira
    lento; cada 10 palabras sin error = 30 de daño; errores no quitan HP pero reinician el
    conteo.
- **PAZ:** `Estabilizar`, `Estrellas` ("le devuelves una estrellita en la mano" → +45),
  `Observar` ("miras el cielo con él en silencio" → *"...Ahí. Esa es mi casa."* +50).
- **Victoria:** HP 380 a 0 o PAZ. Suelta la **Wii**. Luego, como aliado, enciende el Canal
  Galaxia y aparece el **Canal Vacío**.
- **Diálogo:** *"Cada palabra que escribes bien tiene su propia gravedad. Lo noto."*,
  *"Las estrellas no se apagan. Se van lejos. No es lo mismo."*

### 9.6 Minijuegos

**Boliche Sensor, Tenis Sensor, Box Sensor** (guiño: Wii Sports): versiones arcade de las 3
pruebas. Récords: pinos / puntos seguidos / golpes.

**Rueda Sensor (guiño: Mario Kart Wii, 2008, volante):** variante de carrera en la que las
palabras de "curva" (`izquierda`, `derecha`) se intercalan en el párrafo y hay que escribirlas
**sin retraso** o te sales de la pista. Opcional.

### 9.7 Quests secundarias

| Misión | Pasos | Recompensa |
|--------|-------|------------|
| **"Enciende los canales"** (principal secundaria) | Ganar las 3 pruebas del Gimnasio, el Torneo y el Observatorio: cada uno enciende un canal en la pantalla central. | Abre el Canal Vacío |
| **"Chuza perfecta"** | 10 chuzas seguidas en Boliche Sensor Normal. | `pelota_dorada` + 80 Fichas |
| **"Las 7 estrellitas"** | Rescatar las 7 estrellitas del Capitán en una sola batalla (7 PERFECTOS). | `estrellita_capitan` + Capitán Cometa se muda al pueblo (observatorio) |
| **"Caras nuevas"** (Muñequito) | Diseñar 5 caras: cada una es escribir una descripción corta dictada (`Ojos grandes, boca chica, gorra azul.`). | Nuevo sprite opcional para el héroe (cara simple estilo ciudad) |

### 9.8 Easter eggs

- La pantalla central muestra un "Canal Tienda" cerrado: *"Aquí se compraban juegos
  viejitos para jugarlos en la nueva. Se llamaba Consola Virtual."*
- Un letrero: *"El nombre secreto de esta ciudad era 'Revolution'."*
- Correíta: *"En 2006, hubo gente que rompió su tele por no ponerse la correa. No seas esa
  gente."*
- Una balanza blanca en el gimnasio: *"Pésate y haz yoga. 2007."* (Wii Fit, sin nombrar).
- Bit: *"Esta consola vendió más de cien millones. Cien. Millones."*
- Una ranura con un control de cubo: *"Los primeros modelos
  de esta consola todavía leían los discos del cubo. Familia es familia."*

### 9.9 Consola y tesoros

Se rescata la **Wii**. Tesoros: `pelota_boliche`, `pelota_dorada`, `estrellita_capitan`,
`correa` ("Para que el control no vuele. Y la tele no llore."), `sensor` ("Barra sensora.
Solo son dos luces. En serio, solo eso."), `canal_vacio` (se obtiene al terminar: "Un canal
que no debería existir. Ya existe.").

### 9.10 Mecanografía

**Velocidad y ritmo**: todo mezclado (mayúsculas, acentos, números, símbolos `° % /`),
textos invertidos/espejo (lectura), mano izquierda/derecha por separado. Objetivo: **44-50
PPM**, precisión 96 %.

---

## 10. Final — El Canal Vacío

### 10.1 Identidad visual

Fondo negro con estática magenta `#FF00FF` y gris `#444444`; la interfaz "se rompe": bordes
de la caja de batalla desalineados, texto con 1 de cada 10 letras corrompidas al inicio.
Conforme avanza la batalla, **la paleta se va arreglando**: fase 1 en 4 verdes (GB), fase 2
en NES, fase 3 en SNES... hasta terminar en los colores de la Wii. Es decir: la batalla
final es un viaje por todas las eras, y el jugador lo nota solo por los colores y la música.

### 10.2 Antes de la batalla

Al entrar al Canal Vacío, todo el pueblo aparece detrás de ti (todos los perdonados). Cada
uno te da una **frase** (las copias de sombra perdonadas dan frases extra). Las frases se
guardan en `Save.data.finalPhrases` y son las que se usan en la fase 3. Ejemplos:
- Pixelito: *"¡Boing!"* → frase: `un pixel también cuenta`
- Tetro Rey: `todo encaja si lo giras`
- Don Chip: `nada viejo es basura`
- Dani Turbo: `el segundo más rápido te apoya`
- Toby: `guau` (Bit: *"...Gracias, Toby."*)
- Bit (al final, bajito): `no estás solo`

### 10.3 La batalla: EL GLITCH (3 fases + decisión)

**Fase 1 — "Pausa" (paleta GB).** HP 200. El Glitch intenta **congelar** tus palabras: en
LUCHAR, cada 3ª palabra aparece como `[PAUSA]`; escribir `continuar` la destraba (cuenta como
PERFECTO si en < 1.5 s). Lluvia: letras que **se detienen en el aire** 1 s a mitad de caída y
luego caen el doble de rápido. ACTUAR aquí no funciona todavía: *"No te oigo."* (PAZ no
sube; Bit: *"No nos escucha... todavía."*).

**Fase 2 — "Repetición" (paletas NES → SNES → N64).** HP 250. Usa las mecánicas de los jefes
anteriores en versión corta, en orden: 20 s de plataformas al ritmo (Caparazón), 20 s de
oscuridad (Nébula), 20 s de un cuadro (Marco). Cada una que completas sin error quita 50
HP. Lluvia: palabras repetidas (`nombre nombre nombre`) que hay que escribir una sola vez
(enseñanza: no repitas lo que te dicen; escribe lo que es). ACTUAR se desbloquea: `Escuchar`
("te quedas quieto y lo escuchas" +25), `Hermano` (solo Bit: "bit dice que lo recuerda"
+35).

**Fase 3 — "Nombre" (paletas GC → Wii).** HP 300. El Glitch deja de atacar con estática y
**te pregunta cosas**; respondes **escribiendo las frases de tus amigos** (§10.2): aparece la
pregunta (*"¿Por qué sigues?"*) y tres frases de amigos; eliges una escribiéndola. Cada
frase escrita PERFECTA sube la PAZ +20 y quita 40 HP (el daño aquí es simbólico: "le
llega"). Lluvia: la de la fase 1 pero con letras magenta que, al escribirlas, se vuelven del
color del mundo (visual de "arreglar").

**Decisión.** Con PAZ 100 aparece `NOMBRE: _______` y el comando PERDONAR cambia a
**NOMBRAR**. El jugador escribe un nombre (sin tiempo, sin errores contados, 2-12 letras,
se guarda en `Save.data.glitchName`). Si prefiere pelear hasta 0 HP, también termina; ver
§1.3 para ambos finales.

### 10.4 Después

- Final bueno: el Glitch (ahora con nombre) se muda al pueblo; su cartucho entra a la
  vitrina con el nombre escrito por el niño; la vitrina muestra las 6 consolas y el cartucho
  en medio. Créditos: desfile de todos los perdonados con un reto de tecleo opcional (los
  nombres de los créditos; sin castigo).
- Final neutral: cartucho "SIN NOMBRE" en la vitrina; Bit sugiere volver. La batalla se puede
  repetir desde el museo.
- Ambos desbloquean §11.

---

## 11. Post-game y mundo secreto — La Cueva Roja

### 11.1 El Roncatón y la flauta

Con la **Flauta Polígono** (Mundo 4), al hablar con el Roncatón aparece la opción `tocar la
flauta`: se toca la Canción de Despertar (`s d f j k j f d`) con ritmo. El Roncatón despierta,
bosteza, y resulta ser un **Tecloide gigante de tipo BYTE** que llevaba dormido "desde
1995". No pelea: pide que le escribas su sueño (reto de 3 frases) y luego se hace a un lado:
*"Soñé que todo era rojo. ...Ah, no. Eso está allá atrás."* Se puede seguir hablando con él;
funciona como "banca" de récords. Si se lo perdona (sin batalla: se le "perdona" por
haberte bloqueado el camino 6 mundos) se mueve a la entrada del este.

### 11.2 La Cueva Roja (Virtual Boy, 1995)

| | |
|--|--|
| **Paleta** | **Solo rojo y negro**, 4 tonos: `#000000`, `#550000`, `#AA0000`, `#FF0000`. Como el Virtual Boy real, que solo mostraba rojo. |
| **Estilo** | Todo con **profundidad falsa**: cada sprite se dibuja dos veces con un desplazamiento de 1-2 píxeles (fantasma más oscuro detrás) para simular el 3D estereoscópico. Overworld oscuro, con "capas": cercana (rojo vivo) y lejana (rojo oscuro). |
| **Datos reales** (Don Chip) | Salió en 1995. Solo mostraba rojo sobre negro. Se descontinuó en menos de un año. Lo diseñó el mismo creador del Game Boy, Gunpei Yokoi, quien también hizo los Game & Watch. |

**Historia.** Detrás del Roncatón hay un cartucho que todos olvidaron: la consola que
"fracasó". Don Chip la guardaba en el sótano con pena. Aquí vive **Visorio**, el jefe
secreto: un visor rojo con patas que cree que nadie lo quiere. Es el espejo del Glitch:
otra cosa olvidada, pero esta vez el jugador ya sabe qué hacer.

**Enemigos (3):** **Rojito** (píxel rojo, idéntico a Pixelito pero en rojo; se saludan como
primos), **Doble Visión** (enemigo que se dibuja dos veces: sus palabras aparecen
desfasadas y hay que escribir la "de adelante", la más brillante), **Trípode** (soporte
que se tambalea; sus palabras oscilan).

**JEFE SECRETO — VISORIO (guiño: Virtual Boy, 1995).** Mecánica "Profundidad": las palabras
de LUCHAR y de la lluvia aparecen en **dos capas** (adelante = rojo brillante, atrás = rojo
oscuro) y la regla es escribir **siempre la capa de adelante**; cada 10 s las capas se
intercambian (un parpadeo lo avisa). Escribir una de atrás = daño 0 y "se te cansan los
ojos" (−3 HP, guiño al problema real del aparato). HP 420. PAZ: `Descanso` ("tomas un
descanso cada quince minutos" → +50; dato real: el Virtual Boy recomendaba pausas),
`Rojo` ("le dices que el rojo es tu color favorito"), `Abuelo` ("le cuentas que su creador
también hizo la game boy" → *"...¿En serio? ...Entonces soy familia."* +50). Recompensa:
**Virtual Boy** en la vitrina (7ª consola, en su propio estante con un letrero: "Fracaso
famoso. Lo queremos igual."), tesoro `tripode` y minijuego **Eco Rojo** (palabras en dos
capas, récord de capa correcta).

### 11.3 Otras cosas de post-game

- **Torneo de Tecloides** en el pueblo (Profesora Letra): 8 entrenadores (todos los NPC con
  equipos), bracket, Dani en la final. Premio: Tecloide **Kilobyte** brillante.
- **Modo Turbo** en el museo: repetir cualquier jefe con +25 % de velocidad en todo y
  mostrar PPM en pantalla. Objetivo final: **50+ PPM**.
- **Vitrina completa:** con las 7 consolas y el cartucho con nombre, Don Chip da un último
  dato: *"La mejor consola es la que juegas con alguien."* y regala `foto_vitrina`.
- **Nueva partida +:** conserva Tecloides y Fichas; acentos estrictos desde el Mundo 1.

---

## 12. Pueblo Vitrina a lo largo del juego

### 12.1 Cómo crece

El mapa actual (20×15) se conserva; se agregan "salidas" nuevas al este (Roncatón) y al
norte (cueva) y los edificios cerrados se abren.

| Después de | Cambio en el pueblo |
|-----------|---------------------|
| Inicio | Lo que existe hoy. Se agrega el **Laboratorio de la Profesora Letra** (casa cerrada `d` en la esquina superior derecha: ahora abre). Dani Turbo pasea. |
| Mundo 1 | Pixelito, Cartuchón, Pilabat, Tetro Rey, Monedín, Linkito, Chupín se mudan (los que se perdonaron). Don Chip abre el **Ala Game Boy** del museo (sala con la consola y sus tesoros). Tetro Rey "ordena" las flores en bloques. |
| Mundo 2 | Llegan **Doña Tecla** (tienda) y los gemelos **Gorro y Berenjena**, que arreglan la tubería: ahora, al pararse en la tubería, aparece un **Mapa de Mundos** para elegir destino. Robotito en el museo (Modo Práctica). Hongo-paje: *"Tu consola está en... ¡en la vitrina! ¡Por fin!"* |
| Mundo 3 | **Maestra Modo** abre la **Sala de Arcade** (nuevo edificio al oeste del lago): todos los minijuegos. Dino Huevín pasta junto al lago. La etiqueta en blanco se puede ver en la vitrina. |
| Mundo 4 | **Ocarín** se instala con un quiosco de música junto al letrero del pueblo. Se abre la **Cueva** del norte (Anciano): dentro, el Anciano vende mapas y cuenta la leyenda del cartucho sin nombre. Con la flauta, el **Roncatón** despierta (puede hacerse ya o después). |
| Mundo 5 | **Alcaldesa Bellota** y el **buzón**: cartas semanales (quests cortas de frases largas). Don Chip tiene la caja del prototipo sobre el mostrador. Champi se reencuentra con Don Chip (escena corta). |
| Mundo 6 | **Entrenador Mi** abre el gimnasio (los 3 deportes). Capitán Cometa instala un observatorio en el techo del museo (muestra tus récords como constelaciones). |
| Final | El Glitch (con nombre) sentado en la banca junto a la vitrina. Cuenta un chiste nuevo cada día (fecha real). La Cueva Roja abre detrás del Roncatón. |

### 12.2 La quest de la flauta (completa)

1. **Mundo 1-3:** el Roncatón bloquea el camino del este. Bit sugiere una flauta.
2. **Mundo 4:** Ocarín enseña 4 melodías para abrir la isla; tras el jefe, enseña la
   **Canción de Despertar** y entrega la **Flauta Polígono**.
3. **Pueblo:** con la flauta, opción `tocar la flauta` frente al Roncatón → reto de ritmo
   (la melodía de 8 notas). Despierta, cuenta su sueño, se mueve.
4. **Detrás:** el camino del este lleva a un claro con un cartucho rojo gigante: la entrada
   a la **Cueva Roja** (§11), que se abre al terminar el juego (antes, dice *"Zzz... todavía
   no. Primero lo morado."*).

### 12.3 Los amigos perdonados (reglas de diálogo)

Cada perdonado tiene: 1 línea de llegada, 1 dato curioso real, 1 línea nueva cuando se
termina cada mundo siguiente (así el pueblo "habla del presente"). Ejemplo, Tetro Rey tras
el Mundo 2: *"Conocí a Lord Caparazón. Ese castillo no encaja con NADA."* Si se perdonaron
las copias de sombra (§8.4), el original lo menciona: *"Sentí que alguien me abrazaba desde
lejos. ¿Fuiste tú?"*

---

## 13. Progresión de mecanografía

| Mundo | Teclas / habilidad | Longitud | PPM objetivo | Precisión | Tiempo de lluvia base |
|------|---------------------|----------|--------------|-----------|------------------------|
| 1 GB | fila del medio, fila de arriba, fila de abajo; minúsculas; sílabas | 3-6 letras | 15-20 | 90 % | 1300 ms / 30 px/s |
| 2 NES | todas las letras; **Shift** (mayúscula inicial, nombres propios); punto final; números 1-9 | 4-8 letras, frases de 3 palabras | 20-25 | 92 % | 1150 ms / 34 px/s |
| 3 SNES | **acentos y ñ obligatorios**; `¿? ¡!`; comas; palabras largas | 8-10 letras, frases de 4-6 palabras | 25-32 | 93 % | 1050 ms / 38 px/s |
| 4 N64 | **fila numérica** 0-9; fechas; posición base `s d f j k` con ritmo; lectura rápida | frases de 6-8 palabras; cifras | 32-38 | 94 % | 950 ms / 42 px/s |
| 5 GC | **frases completas** con puntuación, dos puntos, cambio de contexto; cartas | frases de 8-12 palabras | 38-44 | 95 % | 900 ms / 46 px/s |
| 6 Wii | todo mezclado + símbolos `° % /`; ritmo constante; mano izq/der; texto invertido | párrafos de 30-40 palabras | 44-50 | 96 % | 800 ms / 50 px/s |
| Final | todo; frases libres | — | 50 | — | variable por fase |
| Secreto | lectura de profundidad | — | 50+ | 97 % | 750 ms / 54 px/s |

Reglas generales:
- El juego ya elige palabras según las teclas falladas (`Stats`): mantener eso y agregar
  que cada mundo tiene **teclas de enfoque** que entran al pool con peso extra.
- Los retos de tecleo del diálogo (`ctx.challenge`) usan la misma tabla de PPM para calcular
  `timeLimit`: `letras × (60000 / (PPM_objetivo × 5)) × 1.4 + 1500`.
- Las "palabras invertidas / inclinadas / borrosas" son solo **presentación** (CSS
  transform / blur) del mismo `TypingTask`; lo que se escribe es la palabra normal.
- Mostrar siempre al final de cada batalla: PPM, precisión y una tecla a mejorar ("Hoy la
  tecla ñ te costó. Dino Huevín te espera.").

---

## 14. Música

Todas las pistas son **originales**, descritas por estilo para componer con el motor chiptune
propio. No se transcribe ninguna melodía existente. Convención de canales: `P1` y `P2` =
ondas cuadradas (melodía y armonía), `T` = triángulo (bajo), `N` = ruido (percusión), `W` =
tabla de ondas (solo mundos 3+), `S` = muestras cortas (solo mundo 6, si el motor las
soporta; si no, se usa `W`).

### 14.1 Paleta sonora por era

| Era | Canales | Carácter |
|-----|---------|----------|
| GB | P1 P2 (con duty 12.5 %/25 %/50 %), W simple, N | Melodías pegajosas, bajo marcado, mucho **arpegio** rápido para fingir acordes. Eco simulado repitiendo la nota a menor volumen. |
| NES | P1 P2 T N | Bajo en triángulo (sin volumen, suena "hueco"), percusión de ruido corta, melodía con **vibrato** manual y duty 50 %. Tempos vivos 140-170. |
| SNES | P1 P2 T N W + "reverb" (repetición a −6 dB, 90 ms) | Más capas, **acordes reales** en 3 voces, sonidos tipo orquesta de 16 bits (metales y cuerdas imitados con W). Tempos variados. |
| N64 | igual que SNES + pads largos | Ambientes amplios, melodías más lentas y "cinemáticas", sonidos de viento y eco; percusión más seca. |
| GC | igual + bajo "slap" (T con ataque rápido) | Pop alegre, ritmos latin/swing, campanitas (W de ataque corto). |
| Wii | todo | Limpio y luminoso, marimbas/campanas, ritmos de 2 compases que se repiten (como música de menú), silbidos. |
| Canal Vacío | todo, con "corrupción" | Notas desafinadas ±30 cents aleatorias, cortes de canal, silencio súbito; se va limpiando por fase. |
| Cueva Roja | P1 P2 N, mono | Grave, lento, un solo canal "doblado" con desfase (eco estéreo-falso), misterioso. |

### 14.2 Pistas por mundo

| Pista | Tempo | Compás | Tono / ánimo | Notas de composición |
|-------|-------|--------|--------------|----------------------|
| Pueblo Vitrina | 96 | 4/4 | Do mayor, hogareño | Melodía de 8 compases en P1 (duty 25 %), contramelodía en P2 a terceras; bajo T en negras; sin percusión. Debe poder sonar en loop 10 minutos sin cansar. |
| Valle Game Boy (overworld) | 128 | 4/4 | Sol mayor, alegre y verde | Arpegios rápidos en P2 (semicorcheas), melodía saltarina con muchas notas repetidas, bajo que alterna tónica-quinta. |
| Batalla normal GB | 150 | 4/4 | Mi menor → Sol mayor en el estribillo | Riff de 2 compases en P1, N marcando corchea, bajo en octavas. |
| **Reto de Tecloides** (GB; es la pista "Pokémon") | 160 | 4/4 | La menor, urgente | Empieza con 4 golpes de N + un "subidón" cromático en P1 (como una sirena), luego riff de bajo T muy rítmico (tónica, octava, séptima) y melodía en P1 con frases de 2 compases que terminan en nota larga con vibrato. Puente a Do mayor cuando el rival tiene poca vida ("¡casi!"). Variación "estadio" en N64 con pads W. |
| Chupín (minijefe) | 138 | 4/4 | Fa mayor, dulce y traviesa | Melodía redonda, staccato; un "inhalar" = glissando descendente en P2. |
| **Tetro Rey (jefe)** | 140 → 160 → 180 | 4/4 | Re menor, marcial y "de Europa del Este" por el estilo (sin citar nada) | Ritmo de marcha en N; melodía en P1 con saltos de octava; en fase 2 (Bloques) la pista se acelera cada 20 segundos; fase 3 añade arpegios de P2 en tresillos. |
| Castillo 8-Bit (overworld) | 150 | 4/4 | Do mayor, muy "brincadora" | Bajo T sincopado (como caminar), melodía con muchas síncopas y notas de adorno, N solo en hi-hat. |
| Batalla normal NES | 165 | 4/4 | Sol menor | Riff de 1 compás, cambios de acorde cada 2 compases. |
| Mazmorra de Llaves | 100 | 4/4 | La menor, misteriosa | Solo P1 con eco (repetición en P2 un tiempo después a −6 dB), bajo largo, N como "gotas" cada 4 tiempos. |
| Kongo Tambor | 132 | 4/4 | Mi menor, percusiva | N protagonista con patrón de tambores (bombo-caja-bombo-bombo-caja), melodía corta y repetitiva de 4 notas. |
| Campeón Puñín | 170 | 4/4 | Si bemol mayor, de gimnasio | Metales imitados con duty 12.5 %, fanfarria de 2 compases, silencios para los "avisos". |
| **Lord Caparazón (jefe)** | 120 → 135 → 150 | 4/4 | Do menor, grandiosa | Debe tener **pulso evidente** (el jefe usa metrónomo): N en cada negra, bajo T en cada tiempo, melodía heroica de 4 compases. Fase 3: cada 4 compases un "tartamudeo" (nota repetida 4 veces en semicorcheas) para sonar trabada. |
| Reino 16-Bit (overworld) | 118 | 4/4 | Re mayor, luminosa | Acordes de 3 voces, melodía en W (tipo flauta), pad largo, percusión suave con "reverb". |
| Batalla normal SNES | 155 | 4/4 | Mi menor, orquestal | Metales en P1+P2 a quintas, timbal en N, cuerdas W. |
| Rayo Cero (carrera) | 175 | 4/4 | Fa# menor, rock | Bajo T en corcheas constantes, "guitarra" P1 duty 50 % con ritmo de power chords, N con bombo en 4. Loop corto de 8 compases. |
| Capitán Vulpino | 140 | 4/4 | Si bemol mayor, espacial-heroica | Fanfarria de metales, arpegio en W, N con redoble en cada oleada. |
| Arena Modo 7 (Dani) | 165 | 4/4 | Variación del Reto de Tecloides con cuerdas W y acordes completos | — |
| **Reina Nébula (jefe)** | 92 | 6/8 | Do menor, submarina y lenta | Pad largo en W, melodía de 3 notas repetidas en P1 con mucho vibrato, bajo muy grave en T, N casi inaudible (burbujas). Al 60 %: sube a 110 y entra un contratiempo en N. |
| Isla Polígono (overworld) | 104 | 4/4 | La mayor, aventurera y ventosa | Pads largos, melodía "silbada" en P1 duty 12.5 %, bajo lento, N seco con eco. |
| Batalla normal N64 | 148 | 4/4 | Re menor | Percusión más seca, bajo slap, melodía angular. |
| Circuito Isla (kart) | 160 | 4/4 | Mi mayor, alegre | Ritmo de "ska" (acordes en contratiempo en P2), melodía pegajosa, campanas W. |
| Templo de la Melodía | 80 | 3/4 | Fa mayor, serena | Solo W (flauta) y pad; cada melodía aprendida se **superpone** como contramelodía al loop del templo (sistema: capas que se activan por flag). |
| Estadio Polígono | 165 | 4/4 | Reto de Tecloides con "público": N con palmadas en 2 y 4 | — |
| **Marco, Rey de los Cuadros (jefe)** | 112 (pasillo) / varía por cuadro | 4/4 | Sol mayor, juguetona | El pasillo es un vals lento disfrazado de 4/4; cada cuadro tiene una **variación de 8 compases** del mismo tema (fría = notas largas; reloj = tempo exacto 60 BPM con N en cada segundo; arcoíris = modulación por tonos). La pelea final es el tema en Sol menor a 150. |
| Cubo Galáctico (overworld) | 124 | 4/4 | Do mayor, pop y brillante | Campanitas W, bajo slap, ritmo de bossa simplificada en N, melodía con muchos silencios. |
| Batalla normal GC | 158 | 4/4 | La menor | Riff de bajo funky, "metales" cortos. |
| Capitán Brotes | 130 | 4/4 | Fa mayor, de expedición | Marcha ligera, silbido en P1, "pasos" en N; cada escuadrón tiene un motivo de 2 notas (rojo: ascendente, azul: descendente, amarillo: repetida). |
| Casco Escáner | 96 | 4/4 | Si menor, fría | Pad, pulsos de N cada 2 tiempos, melodía escasa; al escanear, sube un semitono. |
| Copias de sombra | — | — | La pista del jefe original, **desafinada −30 cents** y con cortes | Se implementa como efecto sobre la pista existente. |
| **El Guante Crossover (jefe)** | 170 | 4/4 | Mi menor, épica de torneo | Fanfarria inicial de 2 compases, luego riff rápido, cada "figurita" cambia el **timbre** del canal P1 al de la era correspondiente por un turno (duty, filtro). SMASH = redoble de N + silencio de 1 tiempo + acorde completo. |
| Ciudad Sensor (overworld) | 110 | 4/4 | Do mayor, limpia y moderna | Marimba W, silbido P1, bajo redondo, ritmo de 2 compases repetido; sensación de "menú". |
| Batalla normal Wii | 160 | 4/4 | Sol menor | Más "electrónica": N con patrón de 16 pasos, P2 en arpegio sincopado. |
| Gimnasio Sensor | 90 (boliche) / 120 (tenis) / 100 (box) | 4/4 | Fa mayor | **El tempo es la mecánica**: el metrónomo visible es la N de la pista. Melodías simples, repetitivas, alegres. |
| Torneo Sensor | 170 | 4/4 | Reto de Tecloides versión final: todas las capas, modulación a mitad | — |
| **Capitán Cometa (jefe)** | 100 → 128 | 3/4 → 4/4 | Mi bemol mayor, majestuosa y espacial | Vals lento con pads W y melodía larga en P1; cuando cambia la gravedad, la pista **se invierte** (melodía al revés durante 4 compases); fase final en 4/4 a 128 con arpegios de 7 notas (una por estrellita). |
| **El Glitch (final)** | 60 → 120 → 150 | libre → 4/4 | Fase 1: una sola nota en P1 que se corta; fase 2: collage de 2 compases de cada jefe, cada vez más limpio; fase 3: tema nuevo en Do mayor, sencillo (8 notas), que es **el tema del Pueblo Vitrina tocado lento** | La revelación musical: el tema del Glitch siempre fue el del pueblo, porque siempre fue parte del pueblo. |
| Pantalla de NOMBRAR | 70 | 4/4 | Do mayor, solo P1 | Las 8 notas del pueblo, una por cada letra que el niño escribe (si escribe más, se repite el motivo). |
| Créditos | 112 | 4/4 | Popurrí: 4 compases de cada mundo, terminando en el pueblo | — |
| Cueva Roja | 72 | 4/4 | Do# menor, mono grave | P1 doblado en P2 con 20 ms de desfase, N como latido, melodía de 5 notas. |
| Visorio | 126 | 4/4 | Do# menor, tensa | Dos melodías "capas": una brillante (P1) y una oscura (P2 una octava abajo) que se intercambian cada 10 s, igual que la mecánica. |

### 14.3 Efectos de sonido (chiptune)

Tecla correcta: blip P1 corto (C6, 30 ms). Error: N 60 ms + nota baja. PERFECTO: arpegio
ascendente de 4 notas. PAZ +: dos notas a quinta. Perdonar: arpegio mayor lento. Jefe
derrotado: fanfarria de 2 compases en la paleta de la era. Glitch presente: nota desafinada
que corta la música 200 ms.

---

## 15. Prioridades de implementación

Ordenadas por **diversión por hora de trabajo**, aprovechando lo que ya existe y lo que se
está construyendo.

1. **Terminar el Reto de Tecloides en el Mundo 1 con su música** (Profesora Letra, 3
   iniciales, Dani Turbo 1v1, tipos). Es lo que el niño pidió a través del papá y reutiliza
   el `TypingTask`. Incluye la pista "Reto de Tecloides" en el motor chiptune.
2. **Mundo 2 (Castillo 8-Bit) completo con 4 enemigos + Lord Caparazón** usando el
   combate existente. Para el jefe, la mecánica de "plataformas al ritmo" se puede
   simplificar en v1 a: LUCHAR normal + el metrónomo visual que acelera (el salto se hace
   solo si la palabra sale dentro del compás). Nuevo contenido con el sistema ya hecho =
   muchas horas de juego nuevas.
3. **Bloques integrado como fase 2 de Tetro Rey + Sala de Arcade con Bloques y Patos de
   Letras.** El marco de minijuegos ya está en curso; Patos es muy barato (letras sueltas) y
   Toby ya existe.
4. **Diario de misiones con 6 quests** (las 4 del Mundo 1 + "Los patos de Toby" + "La
   etiqueta en blanco" como gancho de historia) y el Mapa de Mundos en la tubería. Esto le da
   al niño "cosas que hacer" y hace visible la historia del Glitch desde temprano.
5. **Las pistas sembradas del Glitch** (línea final de Tetro Rey, cartucho sin etiqueta en
   la vitrina, píxel magenta, Don Chip en el Mundo 2). Cuesta solo texto y da sensación de
   un juego grande.

Después, en este orden: Mundo 3 (acentos obligatorios + Rayo Cero, que reusa la carrera) →
Mundo 4 (Melodías reusa el motor chiptune + Marco, que reusa retos cortos) → Mundo 5 →
Mundo 6 → Final → Cueva Roja.

Reglas de ahorro:
- Las carreras (Rayo Cero, Kart, Rueda) son **un solo componente** con parámetros.
- Las variantes visuales (inclinado, borroso, invertido, dos capas) son **CSS sobre el
  mismo TypingTask**.
- Los deportes de la Wii y Puñín comparten el componente "palabra en ventana de tiempo".
- Las copias de sombra reutilizan los jefes con `hp × 0.4` y una pista desafinada.

---

## 16. Apéndice: listas de palabras por mundo

Sugerencia de pools (`WORDS.nes`, `WORDS.snes`, etc.) para `data.js`. Siempre palabras
comunes para un niño de 11 años; nada de nombres con derechos.

**NES (mayúscula inicial y nombres propios):** `Castillo`, `Ladrillo`, `Tubería`, `Hongo`,
`Moneda`, `Bandera`, `Puente`, `Lava`, `Nube`, `Robot`, `Pato`, `Red`, `Bosque`, `Llave`,
`Mazmorra`, `Mapa`, `Bomba`, `Escudo`, `Ring`, `Guante`, `Campeón`, `Torre`, `Princesa`,
`Paje`, `Puerta`, `Cofre`, `Corona`, `Hacha`, `Cuerda`, `Martillo`.

**SNES (acentos, ñ, signos):** `plátano`, `dinosaurio`, `caballero`, `armadura`, `piña`,
`niño`, `sueño`, `montaña`, `cañón`, `pequeño`, `rápido`, `música`, `fácil`, `difícil`,
`galaxia`, `polígono`, `órbita`, `medusa`, `océano`, `estrellita`, `¡alto!`, `¿quién va?`,
`¡turbo!`, `¿listo?`, `piloto, nave, pista`, `uva, pera, kiwi`.

**N64 (números, fechas, posición base):** `64`, `120`, `1996`, `4 puertos`, `3 lados`, `8
cuadros`, `estrella`, `cuadro`, `castillo`, `niebla`, `cámara`, `polígono`, `textura`,
`triángulo`, `isla`, `playa`, `templo`, `melodía`, `flauta`, `kart`, `plátano`, `caparazón`,
`rayo`, `derretir`, `reloj`.

**GC (frases):** `El cubo tiene manija.`, `Salta Delfinito, salta.`, `rojo: apagar`, `azul:
nadar`, `amarillo: saltar`, `Querido vecino, ¿cómo estás?`, `Hoy llovió en la isla.`, `La
fantasmita se escondió en el cuadro.`, `Gracias por tu carta.`, `Nos vemos en la plaza a las
cinco.`

**Wii (todo + símbolos):** `24°`, `75%`, `10 km/h`, `¡Ponte la correa!`, `izq`, `der`,
`agacha`, `chuza`, `saque`, `raqueta`, `estrella`, `gravedad`, `planeta`, `observatorio`,
`canal`, `sensor`, `remoto`, `gimnasio`, `boliche`, `tenis`, `cometa`.

**Final (frases de amigos):** ver §10.2; se generan a partir de `Save.data.spared`.

---

*Fin de la biblia. Cualquier dato curioso nuevo que se agregue debe verificarse antes; los de
este documento se limitaron a hechos ampliamente documentados (años de lanzamiento, nombres
clave "Dolphin" y "Revolution", 4 puertos de la N64, discos de 8 cm, pantalla roja del
Virtual Boy, etc.).*
