# Tecla Quest

Un RPG de batallas por turnos (estilo Deltarune) donde atacas **tecleando**. Rescata las
consolas antiguas atrapadas en sus propios mundos y llena tu vitrina.

## Cómo jugar

Abre `index.html` con doble clic. No hay que instalar nada. El progreso se guarda en
ese navegador.

- **LUCHAR**: escribe las palabras. Más rápido = más daño. Sin errores = ¡PERFECTO!
- **ACTUAR**: haz algo amable para llenar la barra de **PAZ**.
- **PERDONAR**: con la PAZ llena, el enemigo se vuelve tu amigo.
- **OBJETO**: escribe para comerte una Galleta Pixel y recuperar HP.
- **Turno enemigo**: caen letras o palabras. Escríbelas antes de que toquen el suelo.

Los acentos y la Ñ son opcionales (escribir `a` vale por `á`).

### Batalla de monstruos (Entrenador Max)

Minijefe del Valle Game Boy. Escoges a tu compañero escribiendo su nombre y luego cada
ataque se usa **escribiendo su nombre**: más rápido = más daño. Fuego le gana a planta,
planta a agua, agua a fuego y eléctrico a agua. En el turno rival hay que escribir una
palabra corta a tiempo para recibir la mitad del daño.

### Minijuego: BLOQUES

En la máquina arcade del pueblo. Caen palabras; si no las escribes, se apilan. Las apiladas
valen doble. Llegar a 40 puntos da un premio.

### Pueblo Vitrina

El punto de partida. Muévete con las flechas y usa ENTER para hablar. Para contestar,
**escribes** tu respuesta. La tubería verde lleva al Valle Game Boy y la puerta del museo
lleva a la vitrina. Los enemigos que perdones se mudan al pueblo. La tecla **M** abre el
diario de misiones.

## Para papá

- **Estadísticas** muestra la velocidad en PPM (palabras por minuto), la precisión y un mapa
  de las teclas donde más se equivoca. El juego elige más seguido palabras con esas teclas.
- El contenido está en `js/data.js`: palabras, enemigos, frases, coleccionables y los datos
  curiosos de cada consola.
- El pueblo (mapa, personajes y sus diálogos) está en `js/town-data.js`. Cada personaje tiene
  un guion fácil de editar.
- Por ahora solo existe el Mundo 1. Los demás (`soon: true` en `WORLDS`) aparecen como
  "próximamente". La paleta de colores de cada mundo son 4 variables en `css/style.css`.
- Los sprites son dibujos de 16×16 hechos con letras en `js/sprites.js`.
- La música (`js/music.js`) son melodías originales escritas como notas (`E5/2` = mi de la
  quinta octava durante 2 pasos). Cada pantalla elige su pista.
- Las misiones están en `js/quests.js`; los monstruos y entrenadores, en `js/monsters.js`.

### Secretos (no se los cuentes 🤫)

- El código ↑↑↓↓←→←→BA en la pantalla de título da galletas extra en cada batalla.
- En el pasto alto aparecen enemigos salvajes.
- El anciano de la cueva, Champi, Toby (reto: "pato" ×3 sin errores) y el Roncatón son
  guiños a Zelda, Mario, Duck Hunt y Pokémon.
- Si te quedas quieto un rato en el pueblo, Bit dice algo conocido.
