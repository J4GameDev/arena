/**
 * Where art lives and how big it is drawn. The simulation never imports this.
 */

/** Sprites live in public/sprites and are looked up by id. */
export const spriteFor = (id: string): string => `/sprites/${id}.png`;

/**
 * A face, for when someone speaks. Lives in public/portraits. The full-body
 * sprite is for the fight; a conversation wants eyes.
 */
export const portraitFor = (id: string): string => `/portraits/${id}.png`;

/** One icon per slot: every item in a slot shares a name, so it shares a picture. */
export const iconFor = (slot: string): string => `/icons/${slot}.png`;

/**
 * The same picture as a dim gray silhouette, for an empty slot: "a hood goes
 * here". Derived from the slot icon rather than drawn, so the two always match.
 */
export const emptyIconFor = (slot: string): string => `/icons/${slot}-empty.png`;

/** Scenes live in public/scenes. An area names its own; a chosen fight names one too. */
export const sceneFor = (sceneId: string): string => `/scenes/${sceneId}.png`;

/**
 * How tall each figure really is, so sizes make sense side by side.
 *
 * Every sprite fills its 64px canvas, so drawn at one size a boar comes out
 * as big as a man and an elk smaller than a wolf. Instead each figure is
 * given a real-world height in meters, and the scene draws it to a shared
 * scale (`--ppm`, pixels per meter, in the stylesheet).
 *
 * `figurePx` is the height of the opaque pixels on the 64px canvas, measured
 * once when the sprite landed. Re-measure it if the sprite is regenerated.
 * `meters` is the top of the figure as drawn to the ground — antlers count,
 * a bear on all fours is measured at the hump.
 */
interface FigureHeight {
  readonly meters: number;
  readonly figurePx: number;
}

const FIGURE_HEIGHTS: Readonly<Record<string, FigureHeight>> = {
  greataxe: { meters: 1.85, figurePx: 52 },
  'twin-daggers': { meters: 1.75, figurePx: 59 },
  oswald: { meters: 1.75, figurePx: 61 },
  'strange-boar': { meters: 1.0, figurePx: 57 },
  'strange-elk': { meters: 2.3, figurePx: 54 },
  'strange-wolf': { meters: 0.85, figurePx: 32 },
  'strange-bear': { meters: 1.2, figurePx: 43 },
  'strayed-hunter': { meters: 2.0, figurePx: 60 },
  bandit: { meters: 1.75, figurePx: 57 },
  mugger: { meters: 1.9, figurePx: 54 },
};

/** Fallback for a sprite nobody has measured yet: drawn as if it were a person. */
const UNMEASURED: FigureHeight = { meters: 1.8, figurePx: 56 };

/** A sprite plus how many meters its whole 64px canvas stands for. */
export interface Figure {
  readonly sprite: string;
  readonly canvasMeters: number;
}

export function figureFor(id: string): Figure {
  const height = FIGURE_HEIGHTS[id] ?? UNMEASURED;
  return { sprite: spriteFor(id), canvasMeters: (height.meters * 64) / height.figurePx };
}
