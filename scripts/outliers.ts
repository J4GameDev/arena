/**
 * Hunt for loadouts that break a fight.
 *
 *   npm run outliers
 *   npm run outliers -- --loadouts 500 --fights 200
 *
 * Fixed items could be swept exhaustively. Rolled ones cannot — the space is
 * combinatorial — so instead we sample it hard and look at the shape of the
 * distribution. What matters is not the average but the tails: the rolls that
 * trivialise a gate, and the rolls that make it unwinnable.
 *
 * This is only possible because runFight is a pure function.
 */
import { STRAYED_HUNTER } from '../src/data/monsters.ts';
import { WEAPONS } from '../src/data/weapons.ts';
import { runFight } from '../src/sim/combat.ts';
import { createHero, createMonster } from '../src/sim/combatants.ts';
import { Rng } from '../src/sim/rng.ts';
import { rollLoadout } from '../src/sim/roll.ts';
import type { Item, Weapon } from '../src/sim/types.ts';

const LOADOUTS = numberArg('--loadouts', 400);
const FIGHTS = numberArg('--fights', 150);

/** The band-one gate. Tuned for roughly 80% winnable in a full set. */
const TARGET_LOW = 70;
const TARGET_HIGH = 90;

console.log(`${LOADOUTS} random loadouts x ${FIGHTS} fights, against ${STRAYED_HUNTER.name}\n`);

for (const weapon of WEAPONS) {
  const results = sample(weapon);
  const rates = results.map((entry) => entry.winRate).sort((a, b) => a - b);

  console.log(`${weapon.archetype}`);
  console.log(
    `  win rate   min ${fmt(rates[0])}  p10 ${fmt(pct(rates, 0.1))}  median ${fmt(pct(rates, 0.5))}` +
      `  p90 ${fmt(pct(rates, 0.9))}  max ${fmt(rates[rates.length - 1])}`,
  );

  const trivial = rates.filter((rate) => rate > TARGET_HIGH).length;
  const hopeless = rates.filter((rate) => rate < TARGET_LOW).length;
  console.log(
    `  outside ${TARGET_LOW}-${TARGET_HIGH}%   ${trivial} trivialise the gate, ` +
      `${hopeless} cannot clear it  (of ${LOADOUTS})`,
  );

  const best = results.reduce((a, b) => (a.winRate >= b.winRate ? a : b));
  const worst = results.reduce((a, b) => (a.winRate <= b.winRate ? a : b));
  console.log(`  strongest roll ${fmt(best.winRate)} — ${describe(best.items)}`);
  console.log(`  weakest roll   ${fmt(worst.winRate)} — ${describe(worst.items)}`);
  console.log('');
}

interface Sampled {
  readonly items: readonly Item[];
  readonly winRate: number;
}

function sample(weapon: Weapon): Sampled[] {
  const loadoutRng = new Rng(1);
  const sampled: Sampled[] = [];

  for (let i = 0; i < LOADOUTS; i += 1) {
    const items = rollLoadout(loadoutRng);
    let wins = 0;

    for (let seed = 0; seed < FIGHTS; seed += 1) {
      const hero = createHero(weapon.archetype, weapon, items);
      if (runFight(hero, createMonster(STRAYED_HUNTER), seed).winner === hero.name) wins += 1;
    }

    sampled.push({ items, winRate: (wins / FIGHTS) * 100 });
  }

  return sampled;
}

/** The three biggest contributions in a loadout, so an outlier explains itself. */
function describe(items: readonly Item[]): string {
  const totals = new Map<string, number>();
  for (const item of items) {
    for (const modifier of item.modifiers) {
      totals.set(modifier.kind, (totals.get(modifier.kind) ?? 0) + modifier.value);
    }
  }

  return [...totals.entries()]
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([kind, value]) => `${kind} ${value > 0 ? '+' : ''}${round(value)}`)
    .join(', ');
}

function pct(sorted: readonly number[], fraction: number): number | undefined {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function fmt(value: number | undefined): string {
  return value === undefined ? '  n/a' : `${value.toFixed(1).padStart(5)}%`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
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
