# Tecla Quest

Un RPG de batallas por turnos (estilo Deltarune) donde atacas **tecleando**. Rescata las
consolas antiguas atrapadas en sus propios mundos y llena tu vitrina.

## Cómo jugar

Abre `index.html` con doble clic. No hay que instalar nada. El progreso se guarda en
ese navegador. Al empezar se elige la dificultad (**Fácil / Normal / Difícil**); se puede
cambiar cuando quieras desde la pantalla de título.

- **LUCHAR**: escribe las palabras. Más rápido = más daño. Sin errores = ¡PERFECTO!
- **ACTUAR**: haz algo amable para llenar la barra de **PAZ**.
- **PERDONAR**: con la PAZ llena, el enemigo se vuelve tu amigo.
- **OBJETO**: escribe para comerte una Galleta Pixel y recuperar HP.
- **Turno enemigo**: caen letras o palabras. Escríbelas antes de que toquen el suelo.

Los acentos y la Ñ son opcionales (escribir `a` vale por `á`).

### Tecloides (minijefe Dani Turbo)

En el Valle Game Boy, la Profesora Letra te regala tu primer Tecloide (Voltín, Gotín o
Brotín: se escoge escribiendo su nombre) y tu rival Dani Turbo te reta. Cada ataque se usa
**escribiendo su palabra**: más rápido y sin errores = más daño. CHISPA le gana a GOTA,
GOTA a BROTE y BROTE a CHISPA. En el turno rival, escribe la palabra de su ataque para
esquivar.

### Mundo 2: Castillo 8-Bit (NES) — Nivel 1-1

Se abre al rescatar la Game Boy. Mario avanza mientras
escribes; cada tubería, hoyo, Goomba o bloque ? tiene su palabra. Las palabras con
mayúscula (Mario, Goomba...) se escriben con SHIFT. Hay súper hongo, monedas, reloj,
3 vidas y bandera. Dato real: si el tiempo termina en 1, 3 o 6 al tocar la bandera, hay
fuegos artificiales.

### Minijuego: BLOQUES

En la máquina arcade del pueblo. Caen palabras; si no las escribes, se apilan. Las apiladas
valen doble. Llegar a 40 puntos da un premio.

### Pueblo Vitrina

El punto de partida y el centro de todo. Muévete con las flechas y usa ENTER para hablar.
Para contestar, **escribes** tu respuesta. En la **Plaza de las Tuberías** (al sur) hay una
tubería por cada mundo abierto: cada consola rescatada hace brotar la siguiente, así que
nunca se ve qué mundo viene. La puerta del museo lleva a la vitrina. Los enemigos que perdones se mudan al pueblo. La tecla **M** abre el
diario de misiones.

## Para papá

- **Para agregar mundos y niveles** (incluso en paralelo): `docs/MUNDOS.md`.

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
- Las misiones están en `js/quests.js`; los Tecloides y entrenadores, en `js/tecloides.js`.
- La biblia de la historia (mundos, jefes, personajes) está en `docs/LORE.md`.

### Secretos (no se los cuentes 🤫)

- El código ↑↑↓↓←→←→BA en la pantalla de título da galletas extra en cada batalla.
- En el pasto alto aparecen enemigos salvajes.
- El anciano de la cueva, Champi, Toby (reto: "pato" ×3 sin errores) y el Roncatón son
  guiños a Zelda, Mario, Duck Hunt y Pokémon.
- Si te quedas quieto un rato en el pueblo, Bit dice algo conocido.

## Publicarlo en Railway

`server.js` sirve el juego (solo `index.html`, `css/` y `js/`) detrás de una contraseña.
Tras 5 intentos fallidos desde una IP, esa IP queda bloqueada 15 minutos; si entre todas
las IPs suman 20 fallos, se bloquea la entrada para todos 15 minutos. Quien ya entró sigue
jugando (la sesión dura 30 días). Los bloqueos viven en memoria: se reinician al redesplegar.

La infraestructura está en `.railway/railway.ts` (Infrastructure as Code de Railway). La
contraseña **no** está en el repositorio: se pone en Railway como variable `APP_PASSWORD`.

Primera vez:

```sh
npm install                      # instala el SDK de Railway (solo para la IaC)
npx @railway/cli login
npx @railway/cli init            # crea el proyecto "tecla-quest" (o `link` si ya existe)
npx @railway/cli config plan     # muestra lo que va a crear
npx @railway/cli config apply    # crea el servicio conectado a GitHub
npx @railway/cli variables --service tecla-quest --set "APP_PASSWORD=..."
npx @railway/cli domain --service tecla-quest   # genera la URL pública
```

Después, cada `git push` a `main` redespliega solo. Los cambios a `.railway/` se hacen por
pull request: `.github/workflows/railway.yml` muestra el plan en el PR y lo aplica al hacer
merge (necesita el secreto `RAILWAY_TOKEN` en GitHub con un token del proyecto).

Probar en local: `APP_PASSWORD=algo-largo npm start` y abrir http://localhost:8080.
