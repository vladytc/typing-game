// Secretos jugables: cada uno imita un secreto REAL de un juego de Nintendo (Mew en los 300 bytes
// que sobraron, el Mundo -1, escribir ZELDA...). Al encontrarlo sale su tarjeta con el dato real
// y se cuenta en la Sala de Secretos del museo (js/scenes/vitrina.js).
//
// Registro: SECRETOS[id] = { world, name, sprite, curio }
//   world   dónde está ('gb', 'nes', 'snes', 'n64', 'gc', 'wii' o 'pueblo')
//   name    nombre corto para el museo
//   sprite  sprite del museo cuando ya se encontró
//   curio   id de la curiosidad con el dato (addCuriosities en js/secretos/<mundo>.js)
// Para descubrir uno: await findSecret('gb_mew'). Si ya estaba, solo vuelve a mostrar la tarjeta.

const SECRETOS = {
  gb_mew: { world: 'gb', name: 'El Pokémon escondido', sprite: 'mew', curio: 'secreto_gb_mew' },
  gb_camion: { world: 'gb', name: 'El camión del rumor', sprite: 'camion', curio: 'secreto_gb_camion' },
  gb_ladron: { world: 'gb', name: 'LADRÓN', sprite: 'ladron', curio: 'secreto_gb_ladron' },
  nes_menos1: { world: 'nes', name: 'El Mundo -1', sprite: 'menos1', curio: 'secreto_nes_menos1' },
  nes_zelda: { world: 'nes', name: 'La Segunda Misión', sprite: 'zelda2q', curio: 'secreto_nes_zelda' },
  nes_nube: { world: 'nes', name: 'Nube y arbusto', sprite: 'nubearbusto', curio: 'secreto_nes_nube' },
  snes_otono: { world: 'snes', name: 'La Zona Especial', sprite: 'mascara_mario', curio: 'secreto_snes_otono' },
  n64_yoshi: { world: 'n64', name: 'Yoshi en el techo', sprite: 'yoshi64', curio: 'secreto_n64_yoshi' },
  n64_huevos: { world: 'gc', name: 'Stop \'n\' Swop', sprite: 'huevo_swop', curio: 'secreto_n64_huevos' },
  gc_nes: { world: 'gc', name: 'Una NES en tu casa', sprite: 'nes_mueble', curio: 'secreto_gc_nes' },
  wii_espejo: { world: 'wii', name: 'El mundo al espejo', sprite: 'espejo', curio: 'secreto_wii_espejo' },
  pueblo_konami: { world: 'pueblo', name: 'El código Konami', sprite: 'cartucho', curio: 'secreto_pueblo_konami' },
  pueblo_hanafuda: { world: 'pueblo', name: 'Las cartas hanafuda', sprite: 'hanafuda', curio: 'secreto_pueblo_hanafuda' },
};

// Huevos de Stop 'n' Swop: se juntan en el mundo N64 y se abren en el GameCube.
// Save.data.flags.swop = { [id]: true } con los ids de SWOP_EGGS.
const SWOP_EGGS = ['huevo_rosa', 'huevo_azul', 'llave_hielo'];
const swopEggs = () => SWOP_EGGS.filter((id) => (Save.data.flags.swop || {})[id]);

const secretFound = (id) => !!(Save.data.secrets || {})[id];
const secretCount = () => Object.keys(SECRETOS).filter(secretFound).length;

function findSecret(id, ctx = null) {
  const s = SECRETOS[id];
  if (!s) return Promise.resolve();
  const first = !secretFound(id);
  if (first) {
    Save.data.secrets = Save.data.secrets || {};
    Save.data.secrets[id] = true;
    Save.write();
  }
  const n = Object.keys(SECRETOS).length;
  return showCuriosity(ctx, s.curio, { tag: `★ ${first ? '¡SECRETO!' : 'SECRETO'} ${secretCount()}/${n}` });
}
