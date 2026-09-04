import { MAGNITUDES, MAGNITUDE_SCALE, SLOT_POOLS, weightOf } from '../data/affixes.ts';
import type { Material } from '../data/materials.ts';
import type { Rng } from './rng.ts';
import type { Item, Modifier, ModifierKind, Slot } from './types.ts';

/** Every item carries exactly three affixes. No slot has a guaranteed primary. */
export const AFFIXES_PER_ITEM = 3;

/** How much more likely a favored affix is to appear on a crafted item. */
export const FAVOR_WEIGHT = 2;

export interface RollOptions {
  /** Affix kinds drawn at FAVOR_WEIGHT times their usual weight. */
  readonly favors?: readonly ModifierKind[];
  /** Overrides the slot's plain label: "Boar-hide Hood" instead of "Hood". */
  readonly name?: string;
}

/**
 * Generate an item for a slot.
 *
 * Affix kinds are drawn without replacement, so an item never rolls the same
 * affix twice — three lines of "+health" would read as a bug rather than as
 * luck. Weighting biases *which* kinds appear; it never forces one — and a
 * favored kind is still only more likely, never certain.
 */
export function rollItem(slot: Slot, rng: Rng, options: RollOptions = {}): Item {
  const pool = SLOT_POOLS[slot];
  const favors = options.favors ?? [];
  const remaining = [...pool.legal];
  const modifiers: Modifier[] = [];

  const weight = (candidate: ModifierKind): number =>
    weightOf(pool, candidate) * (favors.includes(candidate) ? FAVOR_WEIGHT : 1);

  for (let i = 0; i < AFFIXES_PER_ITEM && remaining.length > 0; i += 1) {
    const kind = rng.pickWeighted(remaining, weight);
    remaining.splice(remaining.indexOf(kind), 1);
    modifiers.push({ kind, value: rollMagnitude(kind, pool.magnitudeScale, rng) });
  }

  return {
    id: `${slot}-${rng.int(100000, 999999)}`,
    name: options.name ?? pool.label,
    slot,
    modifiers,
  };
}

/** What the tanner makes from a stack of hide: a named, tilted roll. */
export function craftItem(slot: Slot, material: Material, rng: Rng): Item {
  return rollItem(slot, rng, {
    favors: material.favors,
    name: `${material.adjective} ${SLOT_POOLS[slot].label}`,
  });
}

const DROPPABLE_SLOTS: readonly Slot[] = [
  'head',
  'torso',
  'legs',
  'feet',
  'hands',
  'ring',
  'necklace',
];

/**
 * What a person leaves behind: one finished item, in a slot chosen at random.
 * Animals do not use this — they leave hide, and the tanner does the rest.
 */
export function rollDrop(rng: Rng): Item {
  return rollItem(rng.pick(DROPPABLE_SLOTS), rng);
}

/** A full set: one of every slot. */
export function rollLoadout(rng: Rng): Item[] {
  const slots: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands', 'ring', 'necklace'];
  return slots.map((slot) => rollItem(slot, rng));
}

function rollMagnitude(kind: ModifierKind, scale: number, rng: Rng): number {
  const range = MAGNITUDES[kind];
  const raw = (range.min + rng.next() * (range.max - range.min)) * scale * MAGNITUDE_SCALE;

  // Round for legibility — a player should never read "+2.7391 health".
  const factor = 10 ** range.decimals;
  const rounded = Math.round(raw * factor) / factor;

  // Rounding must never erase an affix entirely, so nudge a zero back to the
  // smallest magnitude its sign allows.
  if (rounded === 0) return range.max < 0 ? -1 / factor : 1 / factor;
  return rounded;
}
