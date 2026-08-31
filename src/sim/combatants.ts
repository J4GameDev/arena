import type { Combatant, MonsterDefinition, Weapon } from './types.ts';

/**
 * The hero has no class and no level. Everything that makes them anything comes
 * from the weapon in their hands.
 */
export const HERO_BASE_HEALTH = 100;

export function createHero(name: string, weapon: Weapon): Combatant {
  return {
    name,
    maxHealth: HERO_BASE_HEALTH,
    health: HERO_BASE_HEALTH,
    attack: weapon.attack,
    resource: {
      rule: weapon.resource,
      current: 0,
      threshold: weapon.threshold,
      empowerMultiplier: weapon.empowerMultiplier,
      maxDamageReduction: weapon.maxDamageReduction,
    },
    nextAttackAt: 0,
  };
}

export function createMonster(definition: MonsterDefinition): Combatant {
  return {
    name: definition.name,
    maxHealth: definition.maxHealth,
    health: definition.maxHealth,
    attack: definition.attack,
    resource: null,
    nextAttackAt: 0,
  };
}
