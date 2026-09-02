import type { ModifierKind, Slot } from '../sim/types.ts';

/**
 * What can roll where, how likely it is, and how big it lands.
 *
 * Two rules from the gear framework in CLAUDE.md govern this file:
 *
 * 1. **No slot has a guaranteed primary.** Slots are weighted, never forced, so
 *    equipment never steers a player toward a build.
 * 2. **The zeros follow from a principle.** Lifesteal cannot roll on boots — not
 *    because it is unlikely, but because armour is not what does that. Armour is
 *    defensive, weapons are offensive, and trinkets are offensive *and* the only
 *    direct source of resource affixes, because they are made of corruption.
 *
 * Hands are the one stated exception: they are the only armour touching the
 * weapon, so they may roll attack speed and damage. Initiative is feet-only.
 */

const WEIGHT_COMMON = 4;
const WEIGHT_UNCOMMON = 2;
const WEIGHT_RARE = 1;

/** Defensive affixes, legal on every armour slot. */
const ARMOUR: readonly ModifierKind[] = [
  'maxHealth',
  'healthPercent',
  'flatDamageReduction',
  'percentDamageReduction',
  'evasion',
  'critResistance',
  'blockChance',
];

/** Offensive affixes, legal on weapons and trinkets. */
const OFFENSIVE: readonly ModifierKind[] = [
  'damage',
  'damagePercent',
  'attackSpeed',
  'damageVariance',
  'critChance',
  'critMultiplier',
  'lifesteal',
];

/** Resource affixes. Trinkets only — nothing else may say "resource". */
const RESOURCE: readonly ModifierKind[] = [
  'resourceGain',
  'resourceThreshold',
  'resourceRetention',
  'empowerMultiplier',
];

export interface SlotPool {
  /** Every affix legal on this slot. Anything absent cannot roll here at all. */
  readonly legal: readonly ModifierKind[];
  readonly common: readonly ModifierKind[];
  readonly uncommon: readonly ModifierKind[];
  /**
   * Multiplies every magnitude rolled on this slot. Torso and legs share a pool
   * and are told apart by size: the torso covers more of you.
   */
  readonly magnitudeScale: number;
  /** Player-facing noun for a generated item in this slot. */
  readonly label: string;
}

export const SLOT_POOLS: Readonly<Record<Slot, SlotPool>> = {
  head: {
    legal: ARMOUR,
    common: ['critResistance', 'percentDamageReduction'],
    uncommon: ['maxHealth', 'evasion'],
    magnitudeScale: 0.9,
    label: 'Hood',
  },
  torso: {
    legal: ARMOUR,
    common: ['maxHealth', 'healthPercent', 'flatDamageReduction', 'percentDamageReduction'],
    uncommon: ['blockChance'],
    magnitudeScale: 1.2,
    label: 'Jerkin',
  },
  legs: {
    // Deliberately the same pool as the torso. They are the two largest pieces
    // of armour and offering the same things is honest; size tells them apart.
    legal: ARMOUR,
    common: ['maxHealth', 'healthPercent', 'flatDamageReduction', 'percentDamageReduction'],
    uncommon: ['blockChance'],
    magnitudeScale: 1,
    label: 'Leggings',
  },
  feet: {
    legal: [...ARMOUR, 'initiative'],
    common: ['evasion', 'initiative'],
    uncommon: ['maxHealth'],
    magnitudeScale: 0.9,
    label: 'Boots',
  },
  hands: {
    // The exception. Gauntlets are the only armour touching the weapon.
    legal: [...ARMOUR, 'attackSpeed', 'damage'],
    common: ['attackSpeed', 'damage'],
    uncommon: ['blockChance', 'flatDamageReduction'],
    magnitudeScale: 0.9,
    label: 'Gloves',
  },
  ring: {
    legal: [...OFFENSIVE, ...RESOURCE],
    common: ['resourceGain', 'resourceThreshold', 'resourceRetention'],
    uncommon: ['critChance', 'lifesteal', 'damagePercent'],
    magnitudeScale: 1,
    label: 'Ring',
  },
  necklace: {
    legal: [...OFFENSIVE, ...RESOURCE],
    common: ['empowerMultiplier', 'resourceRetention'],
    uncommon: ['resourceGain', 'critMultiplier', 'lifesteal'],
    magnitudeScale: 1.1,
    label: 'Charm',
  },
};

export function weightOf(pool: SlotPool, kind: ModifierKind): number {
  if (pool.common.includes(kind)) return WEIGHT_COMMON;
  if (pool.uncommon.includes(kind)) return WEIGHT_UNCOMMON;
  return WEIGHT_RARE;
}

export interface MagnitudeRange {
  readonly min: number;
  readonly max: number;
  /**
   * Decimal places to keep. Percentage affixes carry three so that scaling does
   * not collapse a 1-2% range onto a single value; the *display* still rounds
   * to something a player can read, so legibility is unaffected.
   */
  readonly decimals: number;
}

/**
 * How big a roll lands, before the slot's magnitude scale.
 *
 * TUNING: derived by the outlier hunter, not chosen. The first pass trivialised
 * the band-one gate — every Berserker loadout cleared it — so every range here
 * was halved. Gear is an edge, not a doubling, and eight slots of three affixes
 * add up much faster than any single line suggests.
 *
 * The ranges below are the *designed* values. MAGNITUDE_SCALE tunes all of them
 * at once, so the gate can be brought to target without rewriting every line
 * and fighting rounding on the integer affixes.
 */

/**
 * Global multiplier on every rolled magnitude.
 *
 * Measured, not chosen: at 1.0 the band-one gate fell to 97-99% of good
 * loadouts against a target near 80%. Halving overshot to 64% and 39% and
 * opened a 25-point gap between archetypes. 0.7 lands both at 83-84%, one
 * point apart. Retune this before touching individual ranges.
 */
export const MAGNITUDE_SCALE = 0.7;

export const MAGNITUDES: Readonly<Record<ModifierKind, MagnitudeRange>> = {
  maxHealth: { min: 1, max: 4, decimals: 0 },
  healthPercent: { min: 0.01, max: 0.03, decimals: 3 },
  // One decimal, not zero: at MAGNITUDE_SCALE these ranges are narrow enough that
  // integer rounding collapsed every roll onto the same value.
  flatDamageReduction: { min: 1, max: 2, decimals: 1 },
  percentDamageReduction: { min: 0.01, max: 0.03, decimals: 3 },
  evasion: { min: 0.01, max: 0.02, decimals: 3 },
  critResistance: { min: 0.01, max: 0.02, decimals: 3 },
  blockChance: { min: 0.02, max: 0.04, decimals: 3 },

  initiative: { min: 0.03, max: 0.1, decimals: 3 },

  damage: { min: 1, max: 2, decimals: 1 },
  damagePercent: { min: 0.02, max: 0.04, decimals: 3 },
  attackSpeed: { min: 0.01, max: 0.03, decimals: 3 },
  // Rolls either way on purpose: some builds genuinely want swingier damage.
  damageVariance: { min: -0.02, max: 0.02, decimals: 3 },
  critChance: { min: 0.01, max: 0.03, decimals: 3 },
  critMultiplier: { min: 0.05, max: 0.12, decimals: 3 },
  lifesteal: { min: 0.01, max: 0.03, decimals: 3 },

  resourceGain: { min: 0.02, max: 0.05, decimals: 3 },
  // Negative is the good direction here — the meter fills sooner.
  resourceThreshold: { min: -0.04, max: -0.01, decimals: 3 },
  resourceRetention: { min: 0.03, max: 0.08, decimals: 3 },
  empowerMultiplier: { min: 0.05, max: 0.12, decimals: 3 },
};
