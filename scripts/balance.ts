/**
 * Run every weapon against every monster, many times, and report how it went.
 *
 *   npm run balance
 *   npm run balance -- --runs 5000
 *
 * One fight is an anecdote. This is the tool that turns a hunch about a number
 * into evidence, and it is why the simulation is a pure function.
 */
import { ITEMS } from '../src/data/items.ts';
import { MONSTERS } from '../src/data/monsters.ts';
import { WEAPONS } from '../src/data/weapons.ts';
import { runFight } from '../src/sim/combat.ts';
import { createHero, createMonster } from '../src/sim/combatants.ts';
import type { CombatEvent, Item, MonsterDefinition, Weapon } from '../src/sim/types.ts';

/** Bare versus fully kitted, so the value of a loadout is visible per archetype. */
const LOADOUTS: readonly { label: string; items: readonly Item[] }[] = [
  { label: 'bare', items: [] },
  { label: 'geared', items: ITEMS },
];

const runsArgIndex = process.argv.indexOf('--runs');
const RUNS = runsArgIndex === -1 ? 2000 : Number(process.argv[runsArgIndex + 1] ?? '2000');

if (!Number.isFinite(RUNS) || RUNS < 1) {
  console.error('--runs must be a positive number');
  process.exit(1);
}

console.log(`${RUNS} fights per matchup\n`);
console.log(
  pad('Weapon', 12) +
    pad('Kit', 8) +
    pad('Monster', 17) +
    pad('Win', 8) +
    pad('Avg time', 10) +
    pad('Big hits', 11) +
    pad('Fewest', 8) +
    pad('Worst HP', 10) +
    'Died with a full meter',
);
console.log('-'.repeat(100));

for (const weapon of WEAPONS) {
  for (const loadout of LOADOUTS) {
    for (const monster of MONSTERS) {
      report(weapon, loadout.label, monster, sample(weapon, loadout.items, monster));
    }
  }
}

interface Sample {
  readonly wins: number;
  readonly totalSeconds: number;
  readonly totalEmpowered: number;
  /** Fewest big hits seen in any single fight. 0 means the mechanic can hide. */
  readonly fewestEmpowered: number;
  /** Lowest the hero's health ever fell. The worst-case scare. */
  readonly lowestHealth: number;
  readonly deathsAtFullMeter: number;
}

function sample(weapon: Weapon, items: readonly Item[], monster: MonsterDefinition): Sample {
  let wins = 0;
  let totalSeconds = 0;
  let totalEmpowered = 0;
  let fewestEmpowered = Number.POSITIVE_INFINITY;
  let lowestHealth = Number.POSITIVE_INFINITY;
  let deathsAtFullMeter = 0;

  for (let seed = 0; seed < RUNS; seed += 1) {
    const hero = createHero(weapon.archetype, weapon, items);
    const result = runFight(hero, createMonster(monster), seed);

    if (result.winner === hero.name) wins += 1;
    totalSeconds += result.durationSeconds;

    let empoweredThisFight = 0;
    for (const event of result.events) {
      if (event.type !== 'attack') continue;
      if (event.empowered && event.attacker === hero.name) empoweredThisFight += 1;
      if (event.defender === hero.name) {
        lowestHealth = Math.min(lowestHealth, event.defenderHealth);
      }
    }

    totalEmpowered += empoweredThisFight;
    fewestEmpowered = Math.min(fewestEmpowered, empoweredThisFight);

    if (result.winner !== hero.name && endedWithFullMeter(result.events, hero.name)) {
      deathsAtFullMeter += 1;
    }
  }

  return {
    wins,
    totalSeconds,
    totalEmpowered,
    fewestEmpowered,
    lowestHealth,
    deathsAtFullMeter,
  };
}

/** A loss with a loaded meter is wasted potential — the thing we're hunting. */
function endedWithFullMeter(events: readonly CombatEvent[], heroName: string): boolean {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i];
    if (event === undefined || event.type !== 'resource' || event.who !== heroName) continue;
    return event.current >= event.threshold;
  }
  return false;
}

function report(weapon: Weapon, kit: string, monster: MonsterDefinition, s: Sample): void {
  const losses = RUNS - s.wins;
  const wastedShare = losses === 0 ? '—' : `${s.deathsAtFullMeter} of ${losses} losses`;

  console.log(
    pad(weapon.archetype, 12) +
      pad(kit, 8) +
      pad(monster.name, 17) +
      pad(`${((s.wins / RUNS) * 100).toFixed(1)}%`, 8) +
      pad(`${(s.totalSeconds / RUNS).toFixed(2)}s`, 10) +
      pad((s.totalEmpowered / RUNS).toFixed(2), 11) +
      pad(String(s.fewestEmpowered), 8) +
      pad(String(s.lowestHealth), 10) +
      wastedShare,
  );
}

function pad(text: string, width: number): string {
  return text.padEnd(width);
}
