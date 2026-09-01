/**
 * Run one fight and print it.
 *
 *   npm run fight
 *   npm run fight -- --weapon twin-daggers --monster stone-sentinel --seed 7
 *
 * There is no UI yet on purpose. Read the log, find the number that looks
 * wrong, change it in src/data, run it again.
 */
import { MONSTERS } from '../src/data/monsters.ts';
import { WEAPONS } from '../src/data/weapons.ts';
import { runFight } from '../src/sim/combat.ts';
import { createHero, createMonster } from '../src/sim/combatants.ts';
import { formatFight } from '../src/sim/log.ts';

const args = parseArgs(process.argv.slice(2));

const weaponId = args.get('weapon') ?? 'greataxe';
const monsterId = args.get('monster') ?? 'oswald';
const seed = Number(args.get('seed') ?? '1');

const weapon = WEAPONS.find((candidate) => candidate.id === weaponId);
if (weapon === undefined) {
  exitWith(`Unknown weapon "${weaponId}". Try: ${WEAPONS.map((w) => w.id).join(', ')}`);
}

const monsterDefinition = MONSTERS.find((candidate) => candidate.id === monsterId);
if (monsterDefinition === undefined) {
  exitWith(`Unknown monster "${monsterId}". Try: ${MONSTERS.map((m) => m.id).join(', ')}`);
}

if (!Number.isFinite(seed)) {
  exitWith(`Seed must be a number, got "${args.get('seed')}".`);
}

const hero = createHero(weapon.archetype, weapon);
const monster = createMonster(monsterDefinition);

console.log(`${weapon.name} (${weapon.archetype}) vs ${monsterDefinition.name} — seed ${seed}`);
console.log(`  ${monsterDefinition.designRole}`);
console.log('');
console.log(formatFight(runFight(hero, monster, seed)));

function parseArgs(argv: readonly string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined || !token.startsWith('--')) continue;
    const value = argv[i + 1];
    if (value === undefined) continue;
    parsed.set(token.slice(2), value);
  }
  return parsed;
}

function exitWith(message: string): never {
  console.error(message);
  process.exit(1);
}
