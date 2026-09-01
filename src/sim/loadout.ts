import type { Combatant, Item, ModifierKind } from './types.ts';

/**
 * Ceilings on the stats that run toward invulnerability or certainty if a build
 * stacks them hard enough. Without these, gear eventually removes the fight.
 */
export const EVASION_CAP = 0.6;
export const BLOCK_CAP = 0.75;
export const CRIT_CHANCE_CAP = 1;

/**
 * Apply a loadout to a bare combatant.
 *
 * Pure — the base combatant and the items are untouched. Affixes of the same
 * kind add together across every slot before anything is applied, so item order
 * never matters.
 */
export function equip(base: Combatant, items: readonly Item[]): Combatant {
  const totals = new Map<ModifierKind, number>();
  for (const item of items) {
    for (const modifier of item.modifiers) {
      totals.set(modifier.kind, (totals.get(modifier.kind) ?? 0) + modifier.value);
    }
  }
  const total = (kind: ModifierKind): number => totals.get(kind) ?? 0;

  const maxHealth = Math.max(
    1,
    Math.round((base.maxHealth + total('maxHealth')) * (1 + total('healthPercent'))),
  );

  return {
    ...base,
    maxHealth,
    health: maxHealth,
    attack: {
      damage: Math.max(1, (base.attack.damage + total('damage')) * (1 + total('damagePercent'))),
      attacksPerSecond: Math.max(0.05, base.attack.attacksPerSecond * (1 + total('attackSpeed'))),
      variance: Math.max(0, base.attack.variance + total('damageVariance')),
    },

    evasion: clamp(base.evasion + total('evasion'), 0, EVASION_CAP),
    flatDamageReduction: Math.max(0, base.flatDamageReduction + total('flatDamageReduction')),
    percentDamageReduction: Math.max(
      0,
      base.percentDamageReduction + total('percentDamageReduction'),
    ),
    blockChance: clamp(base.blockChance + total('blockChance'), 0, BLOCK_CAP),
    critResistance: Math.max(0, base.critResistance + total('critResistance')),

    critChance: clamp(base.critChance + total('critChance'), 0, CRIT_CHANCE_CAP),
    critMultiplier: Math.max(1, base.critMultiplier + total('critMultiplier')),
    lifesteal: Math.max(0, base.lifesteal + total('lifesteal')),
    initiative: clamp(base.initiative + total('initiative'), 0, 0.9),

    resource:
      base.resource === null
        ? null
        : {
            ...base.resource,
            // A new rule object rather than a mutated one — the rules in data/
            // are shared constants and must never be written to.
            rule: {
              ...base.resource.rule,
              gainPerDamageTaken:
                base.resource.rule.gainPerDamageTaken * (1 + total('resourceGain')),
              gainPerHitLanded: base.resource.rule.gainPerHitLanded * (1 + total('resourceGain')),
            },
            threshold: Math.max(
              1,
              Math.round(base.resource.threshold * (1 + total('resourceThreshold'))),
            ),
            empowerMultiplier: Math.max(
              1,
              base.resource.empowerMultiplier + total('empowerMultiplier'),
            ),
            retention: clamp(base.resource.retention + total('resourceRetention'), 0, 0.95),
          },
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
