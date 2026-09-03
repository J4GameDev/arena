import type { ResourceRule } from '../sim/types.ts';

/**
 * Resource generation rules. These are the personality of an archetype — the
 * numbers below decide how *often* a build gets its payoff, which matters far
 * more to how it feels than the size of the payoff does.
 *
 * Five meters, five different relationships with the attack timeline:
 *
 *   Rage     weighs the blows aimed at you       wants the enemy swinging hard
 *   Focus    counts the hits you land            wants your own timer fast
 *   Resolve  counts the blows you take or block  wants the enemy swinging often
 *   Snare    fills with time, whoever swings     wants a long fight
 *   Mana     drinks the health you lose          wants you hurt, and dangerous
 *
 * TUNING: first-pass guesses, deliberately not optimised. Change them freely,
 * then run `npm run balance` and `npm run hunts`.
 */

const NOTHING = {
  gainPerDamageTaken: 0,
  gainPerHitLanded: 0,
  gainPerHitTaken: 0,
  gainPerSecond: 0,
  gainPerHealthLost: 0,
};

/** Fills from damage swung at you, so it fills faster the worse the fight is going. */
export const RAGE: ResourceRule = {
  ...NOTHING,
  kind: 'rage',
  gainPerDamageTaken: 1.0, // 1 Rage per point of damage swung at you
};

/** Fills from landing hits, so it rewards a fast weapon and a long fight. */
export const FOCUS: ResourceRule = {
  ...NOTHING,
  kind: 'focus',
  gainPerHitLanded: 20, // every 5th hit empowers, at threshold 100
};

/**
 * Fills from being hit, counted rather than weighed: a wolf's nip and a
 * mugger's axe are one blow each. Blocked blows count too — the shield is
 * the point. A big slow enemy starves it; fast chip feeds it.
 */
export const RESOLVE: ResourceRule = {
  ...NOTHING,
  kind: 'resolve',
  gainPerHitTaken: 1, // at threshold 6, every sixth blow taken or blocked
};

/**
 * Fills with time. Setting a trap is something you do while the fight
 * happens, whoever is swinging — the only meter that ignores the timeline.
 * An enemy that will not attack cannot starve it; a fight that ends fast can.
 */
export const SNARE: ResourceRule = {
  ...NOTHING,
  kind: 'snare',
  gainPerSecond: 10, // at threshold 60, a trap every six seconds
};

/**
 * Fills from the health you actually lose. The crystal in the staff is a
 * piece of the corruption, and it takes from the one holding it: the
 * Warlock is strongest when hurt and the staff wants it hurt. Armor that
 * stops a blow also starves the meter — the opposite of Rage, on purpose.
 */
export const MANA: ResourceRule = {
  ...NOTHING,
  kind: 'mana',
  gainPerHealthLost: 2, // at threshold 60, a burst for every 30 health lost
};
