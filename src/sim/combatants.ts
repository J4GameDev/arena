import { equip } from './loadout.ts';
import type { Combatant, Item, MonsterDefinition, Weapon } from './types.ts';

/**
 * The hero has no class and no level. Everything that makes them anything comes
 * from the weapon in their hands — including how much health they have.
 */

/**
 * What a critical hit multiplies damage by before any critMultiplier affixes.
 *
 * Everyone shares this baseline, but heroes start at zero crit *chance* — crit
 * is entirely something you build toward, never background noise.
 */
export const BASE_CRIT_MULTIPLIER = 1.5;

export function createHero(name: string, weapon: Weapon, items: readonly Item[] = []): Combatant {
  const bare: Combatant = {
    name,
    maxHealth: weapon.baseHealth,
    health: weapon.baseHealth,
    attack: weapon.attack,

    evasion: weapon.evasion,
    flatDamageReduction: 0,
    percentDamageReduction: 0,
    blockChance: 0,
    critResistance: 0,

    critChance: 0,
    critMultiplier: BASE_CRIT_MULTIPLIER,
    lifesteal: 0,
    initiative: 0,

    defeat: 'dies',

    resource: {
      rule: weapon.resource,
      current: 0,
      threshold: weapon.threshold,
      empowerMultiplier: weapon.empowerMultiplier,
      maxDamageReduction: weapon.maxDamageReduction,
      retention: 0,
    },
    nextAttackAt: 0,
  };

  return equip(bare, items);
}

/**
 * `name` overrides the definition's name so that two wolves in one fight can
 * be told apart — the simulation insists on distinct names.
 */
export function createMonster(definition: MonsterDefinition, name?: string): Combatant {
  return {
    name: name ?? definition.name,
    maxHealth: definition.maxHealth,
    health: definition.maxHealth,
    attack: definition.attack,

    evasion: definition.evasion ?? 0,
    flatDamageReduction: definition.armor ?? 0,
    percentDamageReduction: 0,
    blockChance: 0,
    critResistance: 0,

    critChance: definition.critChance,
    critMultiplier: BASE_CRIT_MULTIPLIER,
    lifesteal: 0,
    initiative: 0,

    defeat: definition.defeat,

    resource: null,
    nextAttackAt: 0,
  };
}
