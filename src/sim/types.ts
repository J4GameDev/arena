/**
 * The combat domain model.
 *
 * Nothing in here knows the DOM exists. See CLAUDE.md for why that matters.
 */

/**
 * How a combatant's defeat reads. A sparring partner yields; a corrupted thing
 * dies. The simulation carries this so the view never has to guess.
 */
export type DefeatStyle = 'dies' | 'yields';

/**
 * What a creature used to be. Animals yield materials; people were carrying
 * gear when they turned, so only they can leave a weapon behind.
 */
export type Lineage = 'animal' | 'person';

/** Which resource engine a weapon runs on. The weapon is the class. */
export type ResourceKind = 'rage' | 'focus';

/**
 * Equipment positions. The weapon is not one of these — it sets the archetype
 * and is handled separately.
 *
 * Armor (head/torso/legs/feet/hands) is crafted from what you hunt and keeps
 * you alive. Trinkets (rings, necklace) come from the corruption and carry the
 * build-defining resource modifiers.
 */
export type Slot = 'head' | 'torso' | 'legs' | 'feet' | 'hands' | 'ring' | 'necklace';

/**
 * What an affix can do. Deliberately weighted toward effects *every* build can
 * use but values differently — attack speed is worth roughly double to a Focus
 * build than a Rage one. Affixes only some builds can use at all, like evasion,
 * are the minority on purpose: they make good chase items and bad common ones.
 */
export type ModifierKind =
  // --- Defensive: every armor slot ---
  /** Flat health added to the hero's maximum. */
  | 'maxHealth'
  /** Multiplier on maximum health. 0.1 means 10% more. */
  | 'healthPercent'
  /** Flat damage removed from every hit taken, applied before any percentage. */
  | 'flatDamageReduction'
  /** Fraction removed from every hit taken, applied after the flat reduction. */
  | 'percentDamageReduction'
  /** Added to evasion chance as a fraction. 0.05 means 5 percentage points. */
  | 'evasion'
  /** Subtracted from an attacker's crit chance. A helmet protects your skull. */
  | 'critResistance'
  /** Chance for a hit to be blocked, taking BLOCK_REDUCTION less damage. */
  | 'blockChance'

  // --- Feet only ---
  /** Fraction of your first attack timer already elapsed when a fight starts. */
  | 'initiative'

  // --- Offensive: weapons and trinkets, plus hands by exception ---
  /** Flat damage added to every swing. */
  | 'damage'
  /** Multiplier on damage. 0.1 means 10% more. */
  | 'damagePercent'
  /** Multiplier on attack rate. 0.1 means 10% faster. */
  | 'attackSpeed'
  /** Added to your own damage variance. Negative tightens your spread. */
  | 'damageVariance'
  /** Added to the chance a hit is critical. */
  | 'critChance'
  /** Added to the critical damage multiplier. */
  | 'critMultiplier'
  /** Fraction of damage dealt returned as health. */
  | 'lifesteal'

  // --- Resource: trinkets only ---
  /** Multiplier on how fast the resource fills. 0.2 means 20% faster. */
  | 'resourceGain'
  /** Multiplier on the resource threshold. Negative means it fills sooner. */
  | 'resourceThreshold'
  /** Fraction of the meter kept instead of emptied when the payoff is spent. */
  | 'resourceRetention'
  /** Added to the payoff multiplier on an empowered attack. */
  | 'empowerMultiplier';

export interface Modifier {
  readonly kind: ModifierKind;
  readonly value: number;
}

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly slot: Slot;
  /**
   * Three rolled affixes. No slot has a guaranteed primary — slots are
   * thematically *weighted*, never forced, so equipment never steers a player
   * toward a build. Modelled as a list rather than fixed fields so a generator
   * can produce these without rewriting every item in the game.
   */
  readonly modifiers: readonly Modifier[];
}

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
  /** Fraction of the meter kept when the payoff is spent. 0 empties it. */
  readonly retention: number;
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
  /** Player-facing archetype label: "Berserker", "Assassin". */
  readonly archetype: string;
  /** How this weapon plays, in the player's language. Shown when choosing. */
  readonly pitch: string;
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
  /**
   * Chance this monster lands a critical hit. Monsters must be able to crit or
   * the critResistance affix protects against nothing.
   */
  readonly critChance: number;
  readonly defeat: DefeatStyle;
  readonly lineage: Lineage;
  /**
   * Flat damage removed from every hit this monster takes. Guts a fast weapon's
   * small hits and barely dents a slow weapon's big ones. Defaults to 0.
   */
  readonly armor?: number;
  /** Chance to avoid a hit outright. Defaults to 0. */
  readonly evasion?: number;
  /** One line on what this monster is meant to punish. See pillar two. */
  readonly designRole: string;
}

export interface Combatant {
  readonly name: string;
  readonly maxHealth: number;
  health: number;
  readonly attack: AttackProfile;
  // --- Defence ---
  /** Chance to avoid an incoming attack outright, 0 to 1. */
  readonly evasion: number;
  /** Flat damage removed from every hit taken, before any percentage reduction. */
  readonly flatDamageReduction: number;
  /** Fraction removed after the flat reduction, stacking with Rage's reduction. */
  readonly percentDamageReduction: number;
  /** Chance a hit is blocked, taking BLOCK_REDUCTION less damage. */
  readonly blockChance: number;
  /** Subtracted from an attacker's crit chance. */
  readonly critResistance: number;

  // --- Offence ---
  /** Chance a hit is critical. Heroes start at zero — crit is entirely gear. */
  readonly critChance: number;
  /** Damage multiplier on a critical hit. Stacks with the empower multiplier. */
  readonly critMultiplier: number;
  /** Fraction of damage dealt returned to this combatant as health. */
  readonly lifesteal: number;
  /** Fraction of the opening attack timer already elapsed. Feet only. */
  readonly initiative: number;

  readonly defeat: DefeatStyle;

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
      /** One name in a hunt's ordinary fight, two or three in an ambush. */
      readonly monsters: readonly string[];
    }
  | {
      readonly type: 'attack';
      readonly at: number;
      readonly attacker: string;
      readonly defender: string;
      /** Damage actually dealt, after the defender's reduction. */
      readonly damage: number;
      /** Damage the defender's armor and resource absorbed. 0 if nothing was. */
      readonly prevented: number;
      readonly empowered: boolean;
      readonly critical: boolean;
      readonly blocked: boolean;
      /** Health the attacker drained back. 0 without lifesteal. */
      readonly healed: number;
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
  | {
      readonly type: 'defeat';
      readonly at: number;
      readonly who: string;
      readonly style: DefeatStyle;
    }
  | { readonly type: 'timeout'; readonly at: number };

export interface FightResult {
  /**
   * The hero's name if they are standing at the end, otherwise the name of the
   * first monster still up. null means the fight timed out.
   */
  readonly winner: string | null;
  readonly events: readonly CombatEvent[];
  readonly durationSeconds: number;
  /** What the hero walks away with. 0 if they did not walk away. */
  readonly heroHealth: number;
}
