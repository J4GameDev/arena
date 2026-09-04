/**
 * How survivable is a hunt?
 *
 *   npm run hunts
 *   npm run hunts -- --hunts 500 --sets 40
 *
 * The balance table measures one fight. A hunt is several with the wounds
 * carried, which is a different question: not "can you win this fight" but
 * "how far can you walk". This answers it for every weapon at every length,
 * bare and in crafted gear, and reports where the falls happen.
 *
 * Everyone carries the Hunter's Pack's six rations unless told otherwise.
 *
 * "Crafted" means what the tanner actually makes: five armor pieces from a
 * random mix of hides, plus two trinkets taken off people. As with the
 * balance harness, read p90 — a player keeps the good set.
 */
import { AREAS } from '../src/data/areas.ts';
import { MATERIAL_LIST } from '../src/data/materials.ts';
import { WEAPONS } from '../src/data/weapons.ts';
import { createHero } from '../src/sim/combatants.ts';
import { HUNT_LENGTHS, runHunt } from '../src/sim/hunt.ts';
import { Rng } from '../src/sim/rng.ts';
import { craftItem, rollItem } from '../src/sim/roll.ts';
import type { Area, Item, Slot, Weapon } from '../src/sim/types.ts';

const HUNTS = numberArg('--hunts', 400);
const SETS = numberArg('--sets', 30);
/** Rations carried. Six is what the Hunter's Pack gives a brand-new hunter. */
const RATIONS = numberArg('--rations', 6);

console.log(`${HUNTS} hunts per cell, bare; ${SETS} crafted sets x ${HUNTS / 4} hunts, geared.\n`);
console.log(
  pad('Weapon', 12) +
    pad('Area', 14) +
    pad('Length', 8) +
    pad('Bare home', 11) +
    pad('Bare avg', 10) +
    pad('Crafted p50', 13) +
    pad('Crafted p90', 13) +
    'Where bare falls (fight #)',
);
console.log('-'.repeat(100));

for (const weapon of WEAPONS) {
  for (const area of AREAS) {
    for (const length of HUNT_LENGTHS) {
      const bare = bareSample(weapon, area, length);
      const geared = gearedRates(weapon, area, length);
      console.log(
        pad(weapon.archetype, 12) +
          pad(area.name, 14) +
          pad(String(length), 8) +
          pad(fmt(bare.homeRate), 11) +
          pad(bare.averageFights.toFixed(1), 10) +
          pad(fmt(percentile(geared, 0.5)), 13) +
          pad(fmt(percentile(geared, 0.9)), 13) +
          bare.fallHistogram,
      );
    }
  }
}

interface BareSample {
  readonly homeRate: number;
  readonly averageFights: number;
  readonly fallHistogram: string;
}

function bareSample(weapon: Weapon, area: Area, length: number): BareSample {
  let home = 0;
  let fights = 0;
  const falls = new Map<number, number>();

  for (let seed = 0; seed < HUNTS; seed += 1) {
    const hunt = runHunt(createHero(weapon.archetype, weapon), area, length, seed, [], RATIONS);
    fights += hunt.encounters.length;
    if (hunt.survived) home += 1;
    else falls.set(hunt.encounters.length, (falls.get(hunt.encounters.length) ?? 0) + 1);
  }

  const histogram = [...falls.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([fight, count]) => `${fight}:${count}`)
    .join(' ');

  return {
    homeRate: (home / HUNTS) * 100,
    averageFights: fights / HUNTS,
    fallHistogram: histogram,
  };
}

/** Survival rate per crafted set, sorted ascending. */
function gearedRates(weapon: Weapon, area: Area, length: number): number[] {
  const setRng = new Rng(7);
  const rates: number[] = [];
  const perSet = Math.max(20, Math.floor(HUNTS / 4));

  for (let i = 0; i < SETS; i += 1) {
    const items = craftedSet(setRng);
    let home = 0;
    for (let seed = 0; seed < perSet; seed += 1) {
      const hunt = runHunt(
        createHero(weapon.archetype, weapon, items),
        area,
        length,
        seed,
        [],
        RATIONS,
      );
      if (hunt.survived) home += 1;
    }
    rates.push((home / perSet) * 100);
  }

  return rates.sort((a, b) => a - b);
}

/** What a player who has hunted for a while is wearing. */
function craftedSet(rng: Rng): Item[] {
  const armor: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands'];
  const trinkets: Slot[] = ['ring', 'necklace'];
  return [
    ...armor.map((slot) => craftItem(slot, rng.pick(MATERIAL_LIST), rng)),
    ...trinkets.map((slot) => rollItem(slot, rng)),
  ];
}

function percentile(sorted: readonly number[], fraction: number): number | undefined {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
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
