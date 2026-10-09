// MUNDO 2 — Castillo 8-Bit (NES, 1985). Diseño en docs/LORE.md §5.
addWorld({
  id: 'nes',
  order: 2,
  name: 'Castillo 8-Bit',
  theme: 'nes',
  requires: 'gameboy',      // se abre al rescatar la Game Boy
  console: 'nes',
  nodes: ['mario11'],
  enemies: {
    mario11: {
      name: 'Mundo 1-1',
      sprite: 'mario',
      mode: 'mario', // nivel de plataformas (js/scenes/mario.js)
      xp: 30,
      blurb: '¡El nivel más famoso de la historia! Mario avanza mientras escribes.',
      keysHint: 'Mayúsculas con SHIFT (Mario, Goomba)',
    },
  },
  quests: {
    // mundo_<id> se activa sola cuando Bit anuncia la tubería nueva.
    mundo_nes: {
      name: 'El Castillo 8-Bit',
      desc: 'Una tubería nueva lleva a un mundo de ladrillos y bloques ?. Explóralo.',
    },
  },
  treasures: {
    superhongo: { name: 'Súper hongo', desc: 'Premio por terminar el Mundo 1-1. Te hace grande... en la vitrina.' },
  },
});
