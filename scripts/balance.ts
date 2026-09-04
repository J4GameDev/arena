/**
 * Run every weapon against every monster and report how it went.
 *
 *   npm run balance
 *   npm run balance -- --loadouts 100 --fights 200
 *
 * One fight is an anecdote. This is the tool that turns a hunch about a number
 * into evidence, and it is why the simulation is a pure function.
 *
 * "Geared" means **rolled** items, the ones the game actually drops. It used to
 * mean six hand-authored items that no player would ever wear, which quietly
 * made every number here describe a scenario that does not happen — the real
 * game was a good deal easier than this table claimed.
 *
 * Because rolls vary, geared is reported as a distribution rather than a
 * number. **Read the p90 column, not the median.** A player keeps good drops
 * and bins bad ones, so they converge on the top of the distribution; the
 * median describes a loadout nobody keeps.
 *
 * The p90 is one loadout out of a batch, so one batch makes it jumpy: at 60
 * loadouts the same unchanged game read three points apart between batches,
 * and the Warden eleven even at 200, because his gate fight is pass-or-fail
 * per loadout. So the harness rolls several batches, prints the average, and
 * prints the range beside it (4 Sep 2026). A difference between two runs
 * that sits inside the range is not a finding. About a minute and a half a run.
 */
import { MONSTERS } from '../src/data/monsters.ts';
import { WEAPONS } from '../src/data/weapons.ts';
import { runFight } from '../src/sim/combat.ts';
import { createHero, createMonster } from '../src/sim/combatants.ts';
import { Rng } from '../src/sim/rng.ts';
import { rollLoadout } from '../src/sim/roll.ts';
import type { Item, MonsterDefinition, Weapon } from '../src/sim/types.ts';

const LOADOUTS = numberArg('--loadouts', 200);
const FIGHTS = numberArg('--fights', 300);
const BARE_FIGHTS = numberArg('--bare-fights', 2000);
/** How many batches of loadouts to roll. The geared columns average them. */
const BATCHES = numberArg('--batches', 3);
/** The first batch's seed; each batch after it uses the next number. */
const LOADOUT_SEED = numberArg('--seed', 1);

/** What a geared player should sit at against a band gate. See CLAUDE.md. */
const GATE_TARGET = 'p90 near 80%';

console.log(
  `${BATCHES} batches of ${LOADOUTS} rolled loadouts x ${FIGHTS} fights, plus ${BARE_FIGHTS} bare fights, per matchup`,
);
console.log(
  `Gate target: ${GATE_TARGET}. Read p90, not the median. The range is the batch-to-batch wobble.\n`,
);

console.log(
  pad('Weapon', 12) +
    pad('Monster', 17) +
    pad('Bare', 9) +
    pad('Bare avg s', 12) +
    pad('Geared p50', 12) +
    pad('Geared p90', 12) +
    pad('p90 range', 12) +
    'Big hits bare (fewest in any fight)',
);
console.log('-'.repeat(116));

for (const weapon of WEAPONS) {
  for (const monster of MONSTERS) {
    const bare = bareSample(weapon, monster);
    const p50s: number[] = [];
    const p90s: number[] = [];
    for (let batch = 0; batch < BATCHES; batch += 1) {
      const geared = gearedRates(weapon, monster, LOADOUT_SEED + batch);
      p50s.push(percentile(geared, 0.5) ?? 0);
      p90s.push(percentile(geared, 0.9) ?? 0);
    }

    console.log(
      pad(weapon.archetype, 12) +
        pad(monster.name, 17) +
        pad(fmt(bare.winRate), 9) +
        pad(`${bare.averageSeconds.toFixed(1)}s`, 12) +
        pad(fmt(average(p50s)), 12) +
        pad(fmt(average(p90s)), 12) +
        pad(`${Math.min(...p90s).toFixed(0)}-${Math.max(...p90s).toFixed(0)}`, 12) +
        String(bare.fewestEmpowered),
    );
  }
}

interface BareSample {
  readonly winRate: number;
  readonly averageSeconds: number;
  /** Fewest big hits in any single fight. 0 means the mechanic can hide. */
  readonly fewestEmpowered: number;
}

function bareSample(weapon: Weapon, monster: MonsterDefinition): BareSample {
  let wins = 0;
  let seconds = 0;
  let fewestEmpowered = Number.POSITIVE_INFINITY;

  for (let seed = 0; seed < BARE_FIGHTS; seed += 1) {
    const hero = createHero(weapon.archetype, weapon);
    const result = runFight(hero, [createMonster(monster)], seed);
    if (result.winner === hero.name) wins += 1;
    seconds += result.durationSeconds;

    let empowered = 0;
    for (const event of result.events) {
      if (event.type === 'attack' && event.empowered && event.attacker === hero.name) {
        empowered += 1;
      }
    }
    fewestEmpowered = Math.min(fewestEmpowered, empowered);
  }

  return {
    winRate: (wins / BARE_FIGHTS) * 100,
    averageSeconds: seconds / BARE_FIGHTS,
    fewestEmpowered,
  };
}

/** One win rate per rolled loadout in a batch, sorted ascending. */
function gearedRates(weapon: Weapon, monster: MonsterDefinition, batchSeed: number): number[] {
  const loadoutRng = new Rng(batchSeed);
  const rates: number[] = [];

  for (let i = 0; i < LOADOUTS; i += 1) {
    const items: readonly Item[] = rollLoadout(loadoutRng);
    let wins = 0;

    for (let seed = 0; seed < FIGHTS; seed += 1) {
      const hero = createHero(weapon.archetype, weapon, items);
      if (runFight(hero, [createMonster(monster)], seed).winner === hero.name) wins += 1;
    }

    rates.push((wins / FIGHTS) * 100);
  }

  return rates.sort((a, b) => a - b);
}

function percentile(sorted: readonly number[], fraction: number): number | undefined {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fmt(value: number | undefined): string {
  return value === undefined ? 'n/a' : `${value.toFixed(1)}%`;
}

function pad(text: string, width: number): string {
  return text.padEnd(width);
}

function numberArg(flag: string, fallback: number): number {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  const parsed = Number(process.argv[index + 1]);
  if (!Number.isFinite(parsed) || parsed < 1) {
    console.error(`${flag} must be a positive number`);
    process.exit(1);
  }
  return parsed;
}
