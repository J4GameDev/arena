import { runFight } from './combat.ts';
import { createMonster } from './combatants.ts';
import { Rng } from './rng.ts';
import { rollDrop } from './roll.ts';
import type { Area, Combatant, FightResult, Item, MaterialId, MonsterDefinition } from './types.ts';

/**
 * A hunt: the player picks an area and a length, goes out, and meets whatever
 * the area sends, one encounter after another, without coming home between.
 *
 * Health carries from fight to fight. The meter does not — each fight starts
 * with an empty one, so a full Focus meter cannot be banked for an opener.
 * When the hero falls, the hunt ends and half of what was gathered is lost.
 *
 * Pure, like runFight: the same hero, area, length and seed always produce
 * the same hunt. The balance harness leans on that.
 */

/** How many encounters a player can sign up for. Risk is theirs to assess. */
export const HUNT_LENGTHS = [3, 5, 10] as const;
export type HuntLength = (typeof HUNT_LENGTHS)[number];

/**
 * How often a person you kill was carrying a weapon you do not have.
 *
 * A weapon is a whole build pivot, so it has to be rarer than armor — but not
 * so rare that a player never sees a second archetype exist.
 */
export const WEAPON_FIND_CHANCE = 0.25;

/**
 * Eating on the road. Nobody is at the window between fights, so it is a
 * standing rule: after a fight, if you are below EAT_BELOW of your health and
 * you have a ration, you eat one and get RATION_HEAL back. Rations are cooked
 * at the bastion from meat, and every one you own goes out with you.
 *
 * These two numbers and the size of the Hunter's Pack are the dials for how
 * far a bare hunter can walk. Measured with `npm run hunts`.
 */
export const RATION_HEAL = 40;
export const EAT_BELOW = 0.5;

export type EncounterKind = 'animal' | 'person' | 'ambush';

export interface Encounter {
  readonly kind: EncounterKind;
  readonly monsters: readonly MonsterDefinition[];
  /** The named combatants that actually fought, in the order they arrived. */
  readonly combatants: readonly Combatant[];
  readonly result: FightResult;
}

/** What a hunt brings back. Materials and meat stack; items and weapons are listed. */
export interface Haul {
  readonly materials: Readonly<Partial<Record<MaterialId, number>>>;
  /** Every animal is meat as well as hide. Cooked at home into rations. */
  readonly meat: number;
  readonly items: readonly Item[];
  readonly weaponIds: readonly string[];
}

export const EMPTY_HAUL: Haul = { materials: {}, meat: 0, items: [], weaponIds: [] };

export interface HuntResult {
  readonly area: Area;
  readonly length: number;
  readonly encounters: readonly Encounter[];
  readonly survived: boolean;
  /** Everything picked up along the way. */
  readonly gathered: Haul;
  /** What actually made it home: all of it, or half of it after a fall. */
  readonly kept: Haul;
  /** Rations eaten on the way. Spent whether or not you made it back. */
  readonly rationsEaten: number;
}

export function runHunt(
  heroTemplate: Combatant,
  area: Area,
  length: number,
  seed: number,
  unownedWeaponIds: readonly string[],
  rations = 0,
): HuntResult {
  const rng = new Rng(seed);
  const encounters: Encounter[] = [];
  const materials: Partial<Record<MaterialId, number>> = {};
  const items: Item[] = [];
  const weaponIds: string[] = [];
  const unowned = [...unownedWeaponIds];

  let health = heroTemplate.health;
  let survived = true;
  let meat = 0;
  let rationsLeft = rations;
  let rationsEaten = 0;

  for (let i = 0; i < length; i += 1) {
    const { kind, monsters } = rollEncounter(area, rng);
    const combatants = nameDistinctly(monsters);
    const hero: Combatant = { ...heroTemplate, health };

    const result = runFight(hero, combatants, rng.int(1, 2_000_000_000));
    encounters.push({ kind, monsters, combatants, result });
    health = result.heroHealth;

    if (health <= 0) {
      survived = false;
      break;
    }

    // Only worth eating if there is another fight coming. Home has a kitchen.
    const moreToCome = i + 1 < length;
    if (moreToCome && health < heroTemplate.maxHealth * EAT_BELOW && rationsLeft > 0) {
      rationsLeft -= 1;
      rationsEaten += 1;
      health = Math.min(heroTemplate.maxHealth, health + RATION_HEAL);
    }

    // A timed-out fight is a standoff: nobody died, so nothing is taken.
    if (result.winner !== hero.name) continue;

    for (const monster of monsters) {
      // You do not loot your teacher. Only what dies leaves something behind.
      if (monster.defeat !== 'dies') continue;
      if (monster.material !== undefined) {
        materials[monster.material] = (materials[monster.material] ?? 0) + 1;
        meat += 1;
      }
      if (monster.lineage === 'person') {
        // People carry finished gear, from any slot, and sometimes a weapon.
        items.push(rollDrop(rng));
        if (unowned.length > 0 && rng.chance(WEAPON_FIND_CHANCE)) {
          const found = rng.pick(unowned);
          unowned.splice(unowned.indexOf(found), 1);
          weaponIds.push(found);
        }
      }
    }
  }

  const gathered: Haul = { materials, meat, items, weaponIds };
  return {
    area,
    length,
    encounters,
    survived,
    gathered,
    kept: survived ? gathered : halve(gathered),
    rationsEaten,
  };
}

interface RolledEncounter {
  readonly kind: EncounterKind;
  readonly monsters: readonly MonsterDefinition[];
}

function rollEncounter(area: Area, rng: Rng): RolledEncounter {
  const weight = (spawn: { readonly weight: number }): number => spawn.weight;

  if (area.people.length > 0 && rng.chance(area.personChance)) {
    return { kind: 'person', monsters: [rng.pickWeighted(area.people, weight).monster] };
  }

  if (rng.chance(area.ambushChance)) {
    const [min, max] = area.ambushSize;
    const size = rng.int(min, max);
    const monsters: MonsterDefinition[] = [];
    for (let i = 0; i < size; i += 1) monsters.push(rng.pickWeighted(area.animals, weight).monster);
    return { kind: 'ambush', monsters };
  }

  return { kind: 'animal', monsters: [rng.pickWeighted(area.animals, weight).monster] };
}

/** Two wolves become "Strange Wolf" and "Strange Wolf 2". runFight insists. */
function nameDistinctly(monsters: readonly MonsterDefinition[]): Combatant[] {
  const seen = new Map<string, number>();
  return monsters.map((monster) => {
    const count = (seen.get(monster.name) ?? 0) + 1;
    seen.set(monster.name, count);
    return createMonster(monster, count === 1 ? monster.name : `${monster.name} ${count}`);
  });
}

/**
 * The fall tax: half of everything, rounded in the player's favor. Weapons
 * are never lost — a weapon is a whole build, and taking one back would be
 * a punishment out of all proportion to a bad string of fights.
 */
function halve(haul: Haul): Haul {
  const materials: Partial<Record<MaterialId, number>> = {};
  for (const [id, count] of Object.entries(haul.materials)) {
    const kept = Math.ceil((count ?? 0) / 2);
    if (kept > 0) materials[id as MaterialId] = kept;
  }
  return {
    materials,
    meat: Math.ceil(haul.meat / 2),
    items: haul.items.slice(0, Math.ceil(haul.items.length / 2)),
    weaponIds: haul.weaponIds,
  };
}
