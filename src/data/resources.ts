import type { ResourceRule } from '../sim/types.ts';

/**
 * Resource generation rules. These are the personality of an archetype — the
 * numbers below decide how *often* a build gets its payoff, which matters far
 * more to how it feels than the size of the payoff does.
 *
 * TUNING: first-pass guesses, deliberately not optimised. Change them freely.
 */

/** Fills from damage taken, so it fills faster the worse the fight is going. */
export const RAGE: ResourceRule = {
  kind: 'rage',
  gainPerDamageTaken: 1.0, // 1 Rage per point of damage suffered
  gainPerHitLanded: 0,
};

/** Fills from landing hits, so it rewards a fast weapon and a long fight. */
export const FOCUS: ResourceRule = {
  kind: 'focus',
  gainPerDamageTaken: 0,
  gainPerHitLanded: 20, // every 5th hit empowers, at threshold 100
};
