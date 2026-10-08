// Arranque: carga la partida, ajusta el tamaño de la pantalla y reparte las teclas a la escena activa.

Game.root = document.getElementById('game');
Save.load();
Sfx.muted = Save.data.muted;
Music.muted = Save.data.muted;

function fit() {
  const device = document.getElementById('device');
  const scale = Math.min(window.innerWidth / (device.offsetWidth + 24), window.innerHeight / (device.offsetHeight + 24));
  device.style.transform = `scale(${Math.min(scale, 2)})`;
}
window.addEventListener('resize', fit);
fit();

// Teclas que el navegador usaría para otra cosa (scroll, buscar, volver atrás).
const BLOCKED = new Set([' ', 'Backspace', 'Tab', "'", '/', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

document.addEventListener('keydown', (e) => {
  Sfx.unlock();
  if (e.ctrlKey || e.metaKey) return;
  if (BLOCKED.has(e.key)) e.preventDefault();
  if (Game.scene && performance.now() >= (Game.lockUntil || 0)) Game.scene.onKey(e);
});

document.addEventListener('keyup', (e) => {
  if (Game.scene && Game.scene.onKeyUp) Game.scene.onKeyUp(e);
});

// Dibuja todo hasta que cargue la fuente pixelada, para que las medidas sean correctas.
const startGame = () => Game.go('title');
if (document.fonts && document.fonts.load) {
  Promise.race([document.fonts.load('16px "Press Start 2P"'), new Promise((r) => setTimeout(r, 1500))]).then(startGame);
} else startGame();
