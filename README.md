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

### Pueblo Vitrina

El punto de partida. Muévete con las flechas y usa ENTER para hablar. Para contestar,
**escribes** tu respuesta. La tubería verde lleva al Valle Game Boy y la puerta del museo
lleva a la vitrina. Los enemigos que perdones se mudan al pueblo.

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

### Secretos (no se los cuentes 🤫)

- El código ↑↑↓↓←→←→BA en la pantalla de título da galletas extra en cada batalla.
- En el pasto alto aparecen enemigos salvajes.
- El anciano de la cueva, Champi, Toby (reto: "pato" ×3 sin errores) y el Roncatón son
  guiños a Zelda, Mario, Duck Hunt y Pokémon.
- Si te quedas quieto un rato en el pueblo, Bit dice algo conocido.
