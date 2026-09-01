import type { Item, Modifier, ModifierKind } from '../sim/types.ts';

/**
 * How an affix reads to a player.
 *
 * Internal names describe the mechanic; these describe the effect. "Flat damage
 * reduction" is what the code does, "Armour" is what the player understands, and
 * pillar four says the player wins that argument.
 */
interface Display {
  readonly label: string;
  /** Shown as a percentage rather than a raw number. */
  readonly percent: boolean;
  /** True when a *lower* value is better, so the sign can be read correctly. */
  readonly lowerIsBetter?: boolean;
}

const DISPLAY: Readonly<Record<ModifierKind, Display>> = {
  maxHealth: { label: 'Health', percent: false },
  healthPercent: { label: 'Health', percent: true },
  flatDamageReduction: { label: 'Armour', percent: false },
  percentDamageReduction: { label: 'Damage Reduction', percent: true },
  evasion: { label: 'Evasion', percent: true },
  critResistance: { label: 'Crit Resistance', percent: true },
  blockChance: { label: 'Block Chance', percent: true },

  initiative: { label: 'Initiative', percent: true },

  damage: { label: 'Damage', percent: false },
  damagePercent: { label: 'Damage', percent: true },
  attackSpeed: { label: 'Attack Speed', percent: true },
  damageVariance: { label: 'Damage Swing', percent: true },
  critChance: { label: 'Crit Chance', percent: true },
  critMultiplier: { label: 'Crit Damage', percent: true },
  lifesteal: { label: 'Lifesteal', percent: true },

  resourceGain: { label: 'Meter Fill Rate', percent: true },
  resourceThreshold: { label: 'Meter Needed', percent: true, lowerIsBetter: true },
  resourceRetention: { label: 'Meter Kept', percent: true },
  empowerMultiplier: { label: 'Payoff Damage', percent: true },
};

export function formatModifier(modifier: Modifier): string {
  const display = DISPLAY[modifier.kind];
  const value = display.percent ? Math.round(modifier.value * 100) : modifier.value;
  const sign = value > 0 ? '+' : '−';
  const magnitude = Math.abs(value);

  return `${sign}${magnitude}${display.percent ? '%' : ''} ${display.label}`;
}

/** Whether an affix helps, so the UI can colour it without re-deriving the rule. */
export function isBeneficial(modifier: Modifier): boolean {
  const display = DISPLAY[modifier.kind];
  return display.lowerIsBetter === true ? modifier.value < 0 : modifier.value > 0;
}

export function slotLabel(item: Item): string {
  return item.slot.charAt(0).toUpperCase() + item.slot.slice(1);
}
