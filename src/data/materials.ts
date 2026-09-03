import type { MaterialId, ModifierKind, Slot } from '../sim/types.ts';

/**
 * What the animals of band one are worth to a tanner.
 *
 * Crafting is how a player steers the loot: they cannot pick an affix, but
 * they can pick what they hunt, and every hide favors two things from the
 * armor pool. Favored affixes roll at double weight — a tilt, not a guarantee,
 * so the same pillar that keeps drops from steering a build keeps crafting
 * from becoming a vending machine.
 *
 * Names follow one convention for the whole first band: "<Material> <Slot>",
 * so Boar-hide Hood, Wolf-pelt Gloves. What deeper bands yield, and what it is
 * called, is a bridge to cross when we get there.
 */
export interface Material {
  readonly id: MaterialId;
  readonly name: string;
  /** Goes in front of the slot label on a crafted item. */
  readonly adjective: string;
  readonly favors: readonly ModifierKind[];
  /** One line on why this hide makes the armor it makes. */
  readonly note: string;
}

export const MATERIALS: Readonly<Record<MaterialId, Material>> = {
  'boar-hide': {
    id: 'boar-hide',
    name: 'Boar Hide',
    adjective: 'Boar-hide',
    favors: ['blockChance', 'flatDamageReduction'],
    note: 'Thick and stubborn. Turns a blow aside as often as it soaks one.',
  },
  'wolf-pelt': {
    id: 'wolf-pelt',
    name: 'Wolf Pelt',
    adjective: 'Wolf-pelt',
    favors: ['evasion', 'initiative'],
    note: 'Light and quick. You move like the thing it came off.',
  },
  'elk-hide': {
    id: 'elk-hide',
    name: 'Elk Hide',
    adjective: 'Elk-hide',
    favors: ['maxHealth', 'healthPercent'],
    note: 'There is a great deal of it. Armor with room to bleed in.',
  },
  'bear-hide': {
    id: 'bear-hide',
    name: 'Bear Hide',
    adjective: 'Bear-hide',
    favors: ['flatDamageReduction', 'percentDamageReduction'],
    note: 'The thickest thing in the woods. Heavy, and worth it.',
  },
};

export const MATERIAL_LIST: readonly Material[] = Object.values(MATERIALS);

/**
 * Hides per piece. Small pieces are cheap; the torso is most of an animal.
 * A full set of five is thirteen kills of the player's choosing.
 *
 * Trinkets are not on this list: they come from the corruption, which means
 * from the people who went out into it and came back carrying odd things.
 */
export const CRAFT_COST: Readonly<Partial<Record<Slot, number>>> = {
  head: 2,
  hands: 2,
  feet: 2,
  legs: 3,
  torso: 4,
};

export const CRAFTABLE_SLOTS: readonly Slot[] = ['head', 'torso', 'legs', 'feet', 'hands'];
