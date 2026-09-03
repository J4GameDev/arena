import { describe, expect, it } from 'vitest';
import { FOREST_EDGE } from '../src/data/areas';
import { MATERIALS } from '../src/data/materials';
import { STRANGE_WOLF, STRAYED_TRAPPER } from '../src/data/monsters';
import { GREATAXE, TWIN_DAGGERS } from '../src/data/weapons';
import { createHero } from '../src/sim/combatants';
import { runHunt } from '../src/sim/hunt';
import { Rng } from '../src/sim/rng';
import { craftItem } from '../src/sim/roll';
import type { Area } from '../src/sim/types';
import { canCraft, craft, newRun, addHaul } from '../src/state/run';

const hero = () => createHero('Hero', GREATAXE);

/** Bare, three wolves in a row can kill a Berserker. Some tests need a survivor. */
const tough = () => ({ ...hero(), maxHealth: 1000, health: 1000 });

/** An area with nothing in it but wolves, so what happens is predictable. */
const WOLF_COUNTRY: Area = {
  ...FOREST_EDGE,
  animals: [{ monster: STRANGE_WOLF, weight: 1 }],
  people: [],
  personChance: 0,
  ambushChance: 0,
};

describe('runHunt', () => {
  it('is deterministic for a given seed', () => {
    const a = runHunt(hero(), FOREST_EDGE, 5, 42, []);
    const b = runHunt(hero(), FOREST_EDGE, 5, 42, []);
    expect(a.encounters.map((e) => e.result.events)).toEqual(
      b.encounters.map((e) => e.result.events),
    );
  });

  it('runs exactly the length asked for when the hero survives', () => {
    const hunt = runHunt(tough(), WOLF_COUNTRY, 3, 1, []);
    expect(hunt.survived).toBe(true);
    expect(hunt.encounters).toHaveLength(3);
  });

  it('carries health from one fight into the next', () => {
    const hunt = runHunt(tough(), WOLF_COUNTRY, 3, 1, []);
    const [first, second] = hunt.encounters;
    const secondOpening = second?.result.events.find(
      (event) => event.type === 'attack' && event.defender === 'Hero',
    );
    expect(secondOpening?.type).toBe('attack');
    if (secondOpening?.type === 'attack' && first !== undefined) {
      // The first hit of fight two lands on whatever fight one left.
      expect(secondOpening.defenderHealth).toBeLessThan(first.result.heroHealth);
    }
  });

  it('stops when the hero falls and keeps half of what was gathered', () => {
    // Ten fights in a row is more than a bare Berserker can walk through.
    let fell = false;
    for (let seed = 0; seed < 30 && !fell; seed += 1) {
      const hunt = runHunt(hero(), FOREST_EDGE, 10, seed, []);
      if (hunt.survived) continue;
      fell = true;
      expect(hunt.encounters.length).toBeLessThanOrEqual(10);
      const last = hunt.encounters[hunt.encounters.length - 1];
      expect(last?.result.heroHealth).toBe(0);

      for (const [id, gathered] of Object.entries(hunt.gathered.materials)) {
        const kept = hunt.kept.materials[id as keyof typeof hunt.kept.materials] ?? 0;
        expect(kept).toBe(Math.ceil((gathered ?? 0) / 2));
      }
      expect(hunt.kept.items.length).toBe(Math.ceil(hunt.gathered.items.length / 2));
      expect(hunt.kept.weaponIds).toEqual(hunt.gathered.weaponIds);
    }
    expect(fell).toBe(true);
  });

  it('takes a hide from every animal killed and nothing from a lost fight', () => {
    const hunt = runHunt(tough(), WOLF_COUNTRY, 3, 1, []);
    const kills = hunt.encounters.filter((e) => e.result.winner === 'Hero').length;
    expect(hunt.gathered.materials['wolf-pelt']).toBe(kills);
  });

  it('gives two of the same animal distinct names in an ambush', () => {
    const packCountry: Area = { ...WOLF_COUNTRY, ambushChance: 1, ambushSize: [3, 3] };
    const hunt = runHunt(hero(), packCountry, 1, 1, []);
    const names = hunt.encounters[0]?.combatants.map((c) => c.name);
    expect(names).toEqual(['Strange Wolf', 'Strange Wolf 2', 'Strange Wolf 3']);
    expect(hunt.encounters[0]?.kind).toBe('ambush');
  });

  it('loots finished gear, and sometimes a weapon, only from people', () => {
    const roadOfPeople: Area = {
      ...FOREST_EDGE,
      people: [{ monster: STRAYED_TRAPPER, weight: 1 }],
      personChance: 1,
    };
    let sawItem = false;
    let sawWeapon = false;
    for (let seed = 0; seed < 40; seed += 1) {
      const hunt = runHunt(createHero('Hero', GREATAXE), roadOfPeople, 3, seed, [TWIN_DAGGERS.id]);
      if (hunt.gathered.items.length > 0) sawItem = true;
      if (hunt.gathered.weaponIds.includes(TWIN_DAGGERS.id)) sawWeapon = true;
      expect(Object.keys(hunt.gathered.materials)).toHaveLength(0);
      expect(hunt.gathered.weaponIds.length).toBeLessThanOrEqual(1);
    }
    expect(sawItem).toBe(true);
    expect(sawWeapon).toBe(true);
  });
});

describe('crafting', () => {
  it('names the item after the hide and tilts the roll toward what it favors', () => {
    const rng = new Rng(3);
    const item = craftItem('torso', MATERIALS['bear-hide'], rng);
    expect(item.name).toBe('Bear-hide Jerkin');
    expect(item.modifiers).toHaveLength(3);

    // Over many crafts the favored kinds show up more than their share.
    let favored = 0;
    let total = 0;
    for (let seed = 0; seed < 300; seed += 1) {
      for (const modifier of craftItem('torso', MATERIALS['bear-hide'], new Rng(seed)).modifiers) {
        total += 1;
        if (MATERIALS['bear-hide'].favors.includes(modifier.kind)) favored += 1;
      }
    }
    // Plain rolls give these two kinds well under a third of all lines.
    expect(favored / total).toBeGreaterThan(0.4);
  });

  it('spends hide and puts the piece in the pack', () => {
    const run = addHaul(newRun(GREATAXE.id), {
      materials: { 'boar-hide': 5 },
      items: [],
      weaponIds: [],
    });
    expect(canCraft(run, 'torso', 'boar-hide')).toBe(true);
    expect(canCraft(run, 'torso', 'wolf-pelt')).toBe(false);
    expect(canCraft(run, 'ring', 'boar-hide')).toBe(false);

    const after = craft(run, 'torso', 'boar-hide', new Rng(1));
    expect(after.materials['boar-hide']).toBe(1);
    expect(after.backpack).toHaveLength(1);
    expect(after.backpack[0]?.name).toBe('Boar-hide Jerkin');
    expect(() => craft(after, 'torso', 'boar-hide', new Rng(1))).toThrow(/Need 4/);
  });

  it('adds a haul to the stores and the arms', () => {
    const run = addHaul(newRun(GREATAXE.id), {
      materials: { 'elk-hide': 2 },
      items: [],
      weaponIds: [TWIN_DAGGERS.id],
    });
    const again = addHaul(run, { materials: { 'elk-hide': 1 }, items: [], weaponIds: [] });
    expect(again.materials['elk-hide']).toBe(3);
    expect(again.ownedWeaponIds).toEqual([GREATAXE.id, TWIN_DAGGERS.id]);
  });
});
