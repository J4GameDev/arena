import type { MonsterDefinition } from '../sim/types.ts';

/**
 * Where art lives and how big it is drawn. The simulation never imports this.
 */

/** Sprites live in public/sprites and are looked up by id. */
export const spriteFor = (id: string): string => `/sprites/${id}.png`;

/** One icon per slot: every item in a slot shares a name, so it shares a picture. */
export const iconFor = (slot: string): string => `/icons/${slot}.png`;

/**
 * Where a fight happens. The spar is inside the walls; everything else is out
 * past them. Decided here, in the view, because the simulation has no idea
 * that places exist.
 */
export const sceneFor = (definition: MonsterDefinition): string =>
  `/scenes/${definition.defeat === 'yields' ? 'bastion' : 'forest-edge'}.png`;

/**
 * How tall each figure really is, so sizes make sense side by side.
 *
 * Every sprite fills its 64px canvas, so drawn at one size a boar comes out
 * as big as a man and an elk smaller than a wolf. Instead each figure is
 * given a real-world height in metres, and the scene draws it to a shared
 * scale (`--ppm`, pixels per metre, in the stylesheet).
 *
 * `figurePx` is the height of the opaque pixels on the 64px canvas, measured
 * once when the sprite landed. Re-measure it if the sprite is regenerated.
 * `metres` is the top of the figure as drawn to the ground — antlers count,
 * a bear on all fours is measured at the hump.
 */
interface FigureHeight {
  readonly metres: number;
  readonly figurePx: number;
}

const FIGURE_HEIGHTS: Readonly<Record<string, FigureHeight>> = {
  greataxe: { metres: 1.85, figurePx: 52 },
  'twin-daggers': { metres: 1.75, figurePx: 59 },
  oswald: { metres: 1.75, figurePx: 57 },
  'strange-boar': { metres: 1.0, figurePx: 57 },
  'strange-elk': { metres: 2.3, figurePx: 54 },
  'strange-wolf': { metres: 0.85, figurePx: 32 },
  'strange-bear': { metres: 1.2, figurePx: 43 },
  'strayed-hunter': { metres: 2.0, figurePx: 60 },
};

/** Fallback for a sprite nobody has measured yet: drawn as if it were a person. */
const UNMEASURED: FigureHeight = { metres: 1.8, figurePx: 56 };

/** A sprite plus how many metres its whole 64px canvas stands for. */
export interface Figure {
  readonly sprite: string;
  readonly canvasMetres: number;
}

export function figureFor(id: string): Figure {
  const height = FIGURE_HEIGHTS[id] ?? UNMEASURED;
  return { sprite: spriteFor(id), canvasMetres: (height.metres * 64) / height.figurePx };
}
