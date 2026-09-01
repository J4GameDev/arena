import { Rng } from './rng.ts';
import type { Combatant, CombatEvent, FightResult } from './types.ts';

/**
 * A fight that reaches this length is called a draw. Guards against pairings
 * that cannot kill each other — which balancing *will* produce by accident.
 */
const FIGHT_TIMEOUT_SECONDS = 120;

/** How much a blocked hit is reduced by. Blocking is partial but reliable. */
export const BLOCK_REDUCTION = 0.5;

/** Ceiling on stacked percentage reduction, so no build becomes untouchable. */
export const MAX_PERCENT_REDUCTION = 0.8;

/**
 * Resolve a whole fight.
 *
 * Pure: the same combatants and seed always produce the same events, and the
 * combatants passed in are never mutated. That is what makes it possible to run
 * ten thousand fights to check balance, and to test a fight by its event list.
 */
export function runFight(
  heroTemplate: Combatant,
  monsterTemplate: Combatant,
  seed: number,
): FightResult {
  const rng = new Rng(seed);
  const hero = copyOf(heroTemplate);
  const monster = copyOf(monsterTemplate);

  const events: CombatEvent[] = [
    { type: 'fight-start', at: 0, hero: hero.name, monster: monster.name },
  ];

  // Initiative eats into the opening wind-up, so it decides who swings first.
  hero.nextAttackAt = secondsPerAttack(hero) * (1 - clamp(hero.initiative, 0, 0.9));
  monster.nextAttackAt = secondsPerAttack(monster) * (1 - clamp(monster.initiative, 0, 0.9));

  let clock = 0;
  while (hero.health > 0 && monster.health > 0 && clock < FIGHT_TIMEOUT_SECONDS) {
    // Ties go to the hero. Arbitrary, but fixed — a coin flip here would make
    // fights non-reproducible for no design benefit.
    const heroSwings = hero.nextAttackAt <= monster.nextAttackAt;
    const attacker = heroSwings ? hero : monster;
    const defender = heroSwings ? monster : hero;

    clock = attacker.nextAttackAt;
    resolveAttack(attacker, defender, clock, rng, events);
    attacker.nextAttackAt = clock + secondsPerAttack(attacker);
  }

  if (hero.health > 0 && monster.health > 0) {
    events.push({ type: 'timeout', at: clock });
    return { winner: null, events, durationSeconds: clock };
  }

  return {
    winner: hero.health > 0 ? hero.name : monster.name,
    events,
    durationSeconds: clock,
  };
}

function resolveAttack(
  attacker: Combatant,
  defender: Combatant,
  at: number,
  rng: Rng,
  events: CombatEvent[],
): void {
  // Short-circuits keep a defender with no evasion from consuming randomness,
  // so tuning one stat does not reshuffle every unrelated matchup.
  if (defender.evasion > 0 && rng.chance(defender.evasion)) {
    events.push({ type: 'evade', at, attacker: attacker.name, defender: defender.name });
    return;
  }

  const resource = attacker.resource;
  const empowered = resource !== null && resource.current >= resource.threshold;

  let rawDamage = rollDamage(attacker, rng);

  if (empowered && resource !== null) {
    rawDamage = Math.round(rawDamage * resource.empowerMultiplier);
    resource.current = Math.round(resource.threshold * clamp(resource.retention, 0, 0.95));
  }

  // Crit stacks on top of an empowered hit. Deliberately explosive — the peak
  // is the point, and the balance harness exists to catch it going too far.
  const critChance = attacker.critChance - defender.critResistance;
  const critical = critChance > 0 && rng.chance(critChance);
  if (critical) {
    rawDamage = Math.round(rawDamage * attacker.critMultiplier);
  }

  // Flat first, then percentage. That ordering is what makes flat reduction
  // shine against many small hits and near-worthless against one huge one.
  const afterFlat = Math.max(0, rawDamage - defender.flatDamageReduction);
  const percent = Math.min(
    MAX_PERCENT_REDUCTION,
    defender.percentDamageReduction + resourceReductionOf(defender),
  );
  let damage = afterFlat * (1 - percent);

  const blocked = defender.blockChance > 0 && rng.chance(defender.blockChance);
  if (blocked) damage *= 1 - BLOCK_REDUCTION;

  // Always at least 1 through, so no combination of items can make you immortal.
  const dealt = Math.max(1, Math.round(damage));
  const prevented = Math.max(0, rawDamage - dealt);

  defender.health = Math.max(0, defender.health - dealt);

  const healed =
    attacker.lifesteal > 0
      ? Math.min(Math.round(dealt * attacker.lifesteal), attacker.maxHealth - attacker.health)
      : 0;
  attacker.health += healed;

  events.push({
    type: 'attack',
    at,
    attacker: attacker.name,
    defender: defender.name,
    damage: dealt,
    prevented,
    empowered,
    critical,
    blocked,
    healed,
    defenderHealth: defender.health,
    defenderMaxHealth: defender.maxHealth,
  });

  // The attacker's engine fills from landing the hit; the defender's fills from
  // eating it. One attack can feed both sides' resources — that is the point.
  //
  // The defender gains from the damage that was *swung at them*, not from what
  // got through. This matters: gaining from damage actually taken meant every
  // defensive item slowed your own engine, and a fully armoured Berserker never
  // filled Rage at all. Rage answers what is coming at you, not how much it hurt.
  gainResource(attacker, attacker.resource?.rule.gainPerHitLanded ?? 0, at, events);
  gainResource(defender, (defender.resource?.rule.gainPerDamageTaken ?? 0) * rawDamage, at, events);

  if (defender.health <= 0) {
    events.push({ type: 'defeat', at, who: defender.name, style: defender.defeat });
  }
}

function gainResource(
  combatant: Combatant,
  amount: number,
  at: number,
  events: CombatEvent[],
): void {
  const resource = combatant.resource;
  if (resource === null || amount <= 0) return;

  const before = resource.current;
  resource.current = Math.min(resource.threshold, resource.current + amount);
  if (resource.current === before) return;

  events.push({
    type: 'resource',
    at,
    who: combatant.name,
    kind: resource.rule.kind,
    current: resource.current,
    threshold: resource.threshold,
  });
}

/** Scales linearly with how full the resource is. Empty meter, no reduction. */
function resourceReductionOf(combatant: Combatant): number {
  const resource = combatant.resource;
  if (resource === null || resource.maxDamageReduction === 0) return 0;
  return (resource.current / resource.threshold) * resource.maxDamageReduction;
}

function rollDamage(combatant: Combatant, rng: Rng): number {
  const { damage, variance } = combatant.attack;
  const swing = damage * variance;
  return Math.max(1, Math.round(damage - swing + rng.next() * swing * 2));
}

function secondsPerAttack(combatant: Combatant): number {
  return 1 / combatant.attack.attacksPerSecond;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** Deep enough for a Combatant — resource is the only nested mutable part. */
function copyOf(combatant: Combatant): Combatant {
  return {
    ...combatant,
    resource: combatant.resource === null ? null : { ...combatant.resource },
  };
}
