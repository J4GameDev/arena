import { Rng } from './rng.ts';
import type { Combatant, CombatEvent, FightResult } from './types.ts';

/**
 * A fight that reaches this length is called a draw. Guards against pairings
 * that cannot kill each other — which balancing *will* produce by accident.
 */
const FIGHT_TIMEOUT_SECONDS = 120;

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

  hero.nextAttackAt = secondsPerAttack(hero);
  monster.nextAttackAt = secondsPerAttack(monster);

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
  // Short-circuit so a defender with no evasion consumes no randomness — that
  // keeps non-evasive matchups reproducible as evasion is tuned.
  if (defender.evasion > 0 && rng.chance(defender.evasion)) {
    events.push({ type: 'evade', at, attacker: attacker.name, defender: defender.name });
    return;
  }

  const resource = attacker.resource;
  const empowered = resource !== null && resource.current >= resource.threshold;

  let rawDamage = rollDamage(attacker, rng);
  if (empowered && resource !== null) {
    rawDamage = Math.round(rawDamage * resource.empowerMultiplier);
    resource.current = 0;
  }

  // Always at least 1 through, so no combination of items can make you immortal.
  const damage = Math.max(1, Math.round(rawDamage * (1 - damageReductionOf(defender))));
  const prevented = rawDamage - damage;

  defender.health = Math.max(0, defender.health - damage);

  events.push({
    type: 'attack',
    at,
    attacker: attacker.name,
    defender: defender.name,
    damage,
    prevented,
    empowered,
    defenderHealth: defender.health,
    defenderMaxHealth: defender.maxHealth,
  });

  // The attacker's engine fills from landing the hit; the defender's fills from
  // eating it. One attack can feed both sides' resources — that is the point.
  //
  // The defender gains from damage *actually taken*, which is what makes Rage
  // self-limiting: the tougher it makes you, the slower it fills.
  gainResource(attacker, attacker.resource?.rule.gainPerHitLanded ?? 0, at, events);
  gainResource(defender, (defender.resource?.rule.gainPerDamageTaken ?? 0) * damage, at, events);

  if (defender.health <= 0) {
    events.push({ type: 'death', at, who: defender.name });
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
function damageReductionOf(combatant: Combatant): number {
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

/** Deep enough for a Combatant — resource is the only nested mutable part. */
function copyOf(combatant: Combatant): Combatant {
  return {
    ...combatant,
    resource: combatant.resource === null ? null : { ...combatant.resource },
  };
}
