/**
 * The combat domain model.
 *
 * Nothing in here knows the DOM exists. See CLAUDE.md for why that matters.
 */

/** Which resource engine a weapon runs on. The weapon is the class. */
export type ResourceKind = 'rage' | 'focus';

/**
 * How a resource fills. This is the whole personality of an archetype:
 * Rage cares about the *enemy's* attack rate, Focus cares about its own.
 */
export interface ResourceRule {
  readonly kind: ResourceKind;
  /** Resource gained per point of damage taken. Rage lives here. */
  readonly gainPerDamageTaken: number;
  /** Resource gained per landed hit, regardless of damage. Focus lives here. */
  readonly gainPerHitLanded: number;
}

export interface ResourceState {
  readonly rule: ResourceRule;
  /** Never exceeds `threshold` — it spends itself the moment it arrives. */
  current: number;
  readonly threshold: number;
  /** Damage multiplier on the attack that spends a full resource. */
  readonly empowerMultiplier: number;
  /**
   * Damage reduction at a full meter, scaling linearly from empty. 0.4 means a
   * full meter absorbs 40% of incoming damage.
   *
   * Note the deliberate feedback loop: Rage fills from damage taken, so
   * reducing that damage also slows the fill. The Berserker gets tough right
   * before the payoff, then resets to fragile. 0 for archetypes without it.
   */
  readonly maxDamageReduction: number;
}

export interface AttackProfile {
  readonly damage: number;
  readonly attacksPerSecond: number;
  /** Damage varies by this fraction either way. 0.15 means ±15%. */
  readonly variance: number;
}

export interface Weapon {
  readonly id: string;
  readonly name: string;
  /** Player-facing archetype label: "Berserker", "Duelist". */
  readonly archetype: string;
  readonly attack: AttackProfile;
  readonly resource: ResourceRule;
  readonly threshold: number;
  readonly empowerMultiplier: number;
  /** See ResourceState.maxDamageReduction. 0 for archetypes that don't tank. */
  readonly maxDamageReduction: number;
  /**
   * Chance to avoid an attack outright, 0 to 1. Deliberately a *different kind*
   * of defence from Rage's damage reduction: unreliable but total, where Rage is
   * reliable but partial. 0 for archetypes that stand and take it.
   */
  readonly evasion: number;
}

export interface MonsterDefinition {
  readonly id: string;
  readonly name: string;
  readonly maxHealth: number;
  readonly attack: AttackProfile;
  /** One line on what this monster is meant to punish. See pillar two. */
  readonly designRole: string;
}

export interface Combatant {
  readonly name: string;
  readonly maxHealth: number;
  health: number;
  readonly attack: AttackProfile;
  /** Chance to avoid an incoming attack outright, 0 to 1. */
  readonly evasion: number;
  /** null for combatants with no resource engine — every monster, for now. */
  resource: ResourceState | null;
  /** Seconds on the fight clock when this combatant next swings. */
  nextAttackAt: number;
}

/**
 * The complete record of a fight. The view is a dumb playback layer over this
 * list — it never recomputes anything.
 */
export type CombatEvent =
  | {
      readonly type: 'fight-start';
      readonly at: number;
      readonly hero: string;
      readonly monster: string;
    }
  | {
      readonly type: 'attack';
      readonly at: number;
      readonly attacker: string;
      readonly defender: string;
      /** Damage actually dealt, after the defender's reduction. */
      readonly damage: number;
      /** Damage the defender's resource absorbed. 0 when nothing was reduced. */
      readonly prevented: number;
      readonly empowered: boolean;
      readonly defenderHealth: number;
      readonly defenderMaxHealth: number;
    }
  | {
      readonly type: 'resource';
      readonly at: number;
      readonly who: string;
      readonly kind: ResourceKind;
      readonly current: number;
      readonly threshold: number;
    }
  | {
      readonly type: 'evade';
      readonly at: number;
      readonly attacker: string;
      readonly defender: string;
    }
  | { readonly type: 'death'; readonly at: number; readonly who: string }
  | { readonly type: 'timeout'; readonly at: number };

export interface FightResult {
  /** null means the fight timed out — neither side could finish it. */
  readonly winner: string | null;
  readonly events: readonly CombatEvent[];
  readonly durationSeconds: number;
}
