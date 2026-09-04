/**
 * Where art lives and how big it is drawn. The simulation never imports this.
 */

/** Sprites live in public/sprites and are looked up by id. */
export const spriteFor = (id: string): string => `/sprites/${id}.png`;

/** The hero's sprite: one per class and body, `greataxe-female.png`. */
export const heroSpriteFor = (weaponId: string, sex: string): string =>
  `/sprites/${weaponId}-${sex}.png`;

/**
 * A face, for when someone speaks. Lives in public/portraits. The full-body
 * sprite is for the fight; a conversation wants eyes.
 */
export const portraitFor = (id: string): string => `/portraits/${id}.png`;

/** One icon per slot: every item in a slot shares a name, so it shares a picture. */
export const iconFor = (slot: string): string => `/icons/${slot}.png`;

/**
 * What each weapon puts in the hands. A greataxe fills both; daggers are one
 * each; the Warden has a sword and a shield; a bow is held in the left with
 * the right free to draw; a staff is held in the right.
 */
export interface Hands {
  readonly left: string | null;
  readonly right: string | null;
  /** One thing held in both hands: its icon shows in the right hand only. */
  readonly twoHanded?: boolean;
}

const HANDS: Readonly<Record<string, Hands>> = {
  greataxe: { left: 'greataxe', right: 'greataxe', twoHanded: true },
  'twin-daggers': { left: 'dagger', right: 'dagger' },
  'sword-and-shield': { left: 'shield', right: 'sword' },
  'short-bow': { left: 'bow', right: null },
  staff: { left: null, right: 'staff' },
};

export const handsFor = (weaponId: string): Hands => HANDS[weaponId] ?? { left: null, right: null };

/**
 * Weapon icons live in public/icons/weapons, one per thing a hand can hold,
 * each chosen by the owner from a sheet of candidates. A hand holding
 * something without an icon yet keeps its engraved glyph.
 */
const WEAPON_ICONS: ReadonlySet<string> = new Set(['greataxe']);
export const hasWeaponIcon = (id: string): boolean => WEAPON_ICONS.has(id);
export const weaponIconFor = (id: string): string => `/icons/weapons/${id}.png`;

/**
 * The gold line that runs around one thing in the town painting when it is
 * hovered (the tanner's frame, the cookfire, the gate): a ring one painting
 * pixel wide, drawn by scripts/cutouts.py from scenes/town.png. Remake them
 * if the painting changes.
 */
export const lineFor = (place: string): string => `/scenes/town-${place}-line.png`;

/**
 * The engraved glyph on an empty cell of the gear table: one dark line
 * drawing per slot, traced from a plain silhouette so it reads as a mark on
 * stone rather than as any item we own. Keyed by cell, so the two hands have
 * a sword and a shield.
 */
export const slotGlyphFor = (cell: string): string => `/icons/slots/${cell}.png`;

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
  'sword-and-shield': { meters: 1.8, figurePx: 61 },
  'short-bow': { meters: 1.75, figurePx: 58 },
  staff: { meters: 1.8, figurePx: 61 },
  oswald: { meters: 1.75, figurePx: 61 },
  'strange-boar': { meters: 1.0, figurePx: 57 },
  'strange-elk': { meters: 2.3, figurePx: 54 },
  'strange-wolf': { meters: 0.85, figurePx: 32 },
  'strange-bear': { meters: 1.2, figurePx: 43 },
  'strayed-hunter': { meters: 2.0, figurePx: 60 },
  bandit: { meters: 1.75, figurePx: 57 },
  mugger: { meters: 1.9, figurePx: 54 },
};

/**
 * The hero sprites come in two bodies, and each body stands at its own
 * pixel height on the canvas. Measured once per sprite when it was chosen;
 * re-measure if one is replaced. The class row above supplies the meters.
 */
const HERO_FIGURE_PX: Readonly<Record<string, number>> = {
  'greataxe-male': 59,
  'greataxe-female': 60,
  'twin-daggers-male': 57,
  'twin-daggers-female': 60,
  'sword-and-shield-male': 61,
  'sword-and-shield-female': 61,
  'short-bow-male': 58,
  'short-bow-female': 58,
  'staff-male': 61,
  'staff-female': 54,
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

/** The hero's figure: the class's height, the chosen body's picture. */
export function heroFigureFor(weaponId: string, sex: string): Figure {
  const height = FIGURE_HEIGHTS[weaponId] ?? UNMEASURED;
  const figurePx = HERO_FIGURE_PX[`${weaponId}-${sex}`] ?? height.figurePx;
  return {
    sprite: heroSpriteFor(weaponId, sex),
    canvasMeters: (height.meters * 64) / figurePx,
  };
}
