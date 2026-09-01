import { equip } from './loadout.ts';
import type { Combatant, Item, MonsterDefinition, Weapon } from './types.ts';

/**
 * The hero has no class and no level. Everything that makes them anything comes
 * from the weapon in their hands.
 */
export const HERO_BASE_HEALTH = 100;

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
    maxHealth: HERO_BASE_HEALTH,
    health: HERO_BASE_HEALTH,
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

export function createMonster(definition: MonsterDefinition): Combatant {
  return {
    name: definition.name,
    maxHealth: definition.maxHealth,
    health: definition.maxHealth,
    attack: definition.attack,

    evasion: 0, // monsters stand and take it, for now
    flatDamageReduction: 0,
    percentDamageReduction: 0,
    blockChance: 0,
    critResistance: 0,

    critChance: definition.critChance,
    critMultiplier: BASE_CRIT_MULTIPLIER,
    lifesteal: 0,
    initiative: 0,

    resource: null,
    nextAttackAt: 0,
  };
}
