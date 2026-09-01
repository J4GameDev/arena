import type { Combatant, Item, ModifierKind } from './types.ts';

/**
 * Evasion can never exceed this, however much gear stacks it.
 *
 * Without a ceiling, evasion accessories run toward 100% and a build becomes
 * literally unkillable. 60% is high enough that stacking it feels powerful and
 * low enough that no fight becomes a formality.
 */
export const EVASION_CAP = 0.6;

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

  const maxHealth = Math.max(1, Math.round(base.maxHealth + total('maxHealth')));

  return {
    ...base,
    maxHealth,
    health: maxHealth,
    attack: {
      damage: Math.max(1, base.attack.damage + total('damage')),
      attacksPerSecond: Math.max(0.05, base.attack.attacksPerSecond * (1 + total('attackSpeed'))),
      variance: Math.max(0, base.attack.variance + total('damageVariance')),
    },
    evasion: clamp(base.evasion + total('evasion'), 0, EVASION_CAP),
    flatDamageReduction: Math.max(0, base.flatDamageReduction + total('flatDamageReduction')),
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
          },
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
