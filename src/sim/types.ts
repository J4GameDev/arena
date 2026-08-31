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
      readonly damage: number;
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
  | { readonly type: 'death'; readonly at: number; readonly who: string }
  | { readonly type: 'timeout'; readonly at: number };

export interface FightResult {
  /** null means the fight timed out — neither side could finish it. */
  readonly winner: string | null;
  readonly events: readonly CombatEvent[];
  readonly durationSeconds: number;
}
