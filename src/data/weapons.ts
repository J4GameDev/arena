import type { Weapon } from '../sim/types.ts';
import { FOCUS, RAGE } from './resources.ts';

/**
 * A weapon is an archetype, not a stat stick. Picking up a different weapon
 * type is a build pivot — see the combat model in CLAUDE.md.
 *
 * TUNING: raw damage-per-second is roughly matched on purpose (greataxe 14.3,
 * daggers 12.0) so that the *empower cadence* is what separates them, not the
 * base numbers. If you widen that gap, one archetype simply wins.
 */

export const GREATAXE: Weapon = {
  id: 'greataxe',
  name: 'Rusted Greataxe',
  archetype: 'Berserker',
  // Slow and enormous. Loses the opening exchange, wins the long one.
  attack: { damage: 22, attacksPerSecond: 0.65, variance: 0.2 },
  resource: RAGE,
  threshold: 60, // 60 damage suffered before an empowered swing
  empowerMultiplier: 2.5,
  // Toughens as Rage builds, then resets to fragile after the payoff. This is
  // what stops a full meter from being wasted by the greataxe's slow swing.
  maxDamageReduction: 0.4,
  evasion: 0, // the Berserker stands and takes it
};

export const TWIN_DAGGERS: Weapon = {
  id: 'twin-daggers',
  name: 'Twin Daggers',
  archetype: 'Assassin',
  // Fast and small. Ramps to a payoff on its own schedule, ignoring the enemy.
  attack: { damage: 6, attacksPerSecond: 2.0, variance: 0.15 },
  resource: FOCUS,
  threshold: 100, // five landed hits
  empowerMultiplier: 2.0,
  maxDamageReduction: 0, // stays fragile by design — that is the archetype
  // Defence by not being there. Swingy where the Berserker's is dependable:
  // some fights you dance through untouched, some you get flattened early.
  evasion: 0.25,
};

export const WEAPONS: readonly Weapon[] = [GREATAXE, TWIN_DAGGERS];
