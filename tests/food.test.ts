import { describe, expect, it } from 'vitest';
import { FOREST_EDGE } from '../src/data/areas';
import { STRANGE_WOLF } from '../src/data/monsters';
import { GREATAXE } from '../src/data/weapons';
import { createHero } from '../src/sim/combatants';
import { EAT_BELOW, RATION_HEAL, runHunt } from '../src/sim/hunt';
import type { Area } from '../src/sim/types';
import { cook, grantHuntersPack, HUNTERS_PACK, newRun, spendRations } from '../src/state/run';

const WOLF_COUNTRY: Area = {
  ...FOREST_EDGE,
  animals: [{ monster: STRANGE_WOLF, weight: 1 }],
  people: [],
  personChance: 0,
  ambushChance: 0,
};

describe('eating on the road', () => {
  it('eats a ration only after a fight leaves you under the line', () => {
    let sawEating = false;
    for (let seed = 0; seed < 20 && !sawEating; seed += 1) {
      const hero = createHero('Hero', GREATAXE);
      const hunt = runHunt(hero, WOLF_COUNTRY, 5, seed, [], 10);
      if (hunt.rationsEaten === 0) continue;
      sawEating = true;

      // Reconstruct: after every survived fight that ended under the line, the
      // next fight must open with at least RATION_HEAL more than it ended on.
      let expectedEaten = 0;
      for (let i = 0; i + 1 < hunt.encounters.length; i += 1) {
        const ended = hunt.encounters[i]?.result.heroHealth ?? 0;
        if (ended > 0 && ended < hero.maxHealth * EAT_BELOW) expectedEaten += 1;
      }
      expect(hunt.rationsEaten).toBe(expectedEaten);
    }
    expect(sawEating).toBe(true);
  });

  it('never eats more than it carries', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const hunt = runHunt(createHero('Hero', GREATAXE), WOLF_COUNTRY, 10, seed, [], 2);
      expect(hunt.rationsEaten).toBeLessThanOrEqual(2);
    }
  });

  it('gets further with rations than without', () => {
    let withFood = 0;
    let without = 0;
    for (let seed = 0; seed < 60; seed += 1) {
      withFood += runHunt(createHero('Hero', GREATAXE), FOREST_EDGE, 5, seed, [], 6).encounters
        .length;
      without += runHunt(createHero('Hero', GREATAXE), FOREST_EDGE, 5, seed, [], 0).encounters
        .length;
    }
    expect(withFood).toBeGreaterThan(without);
  });

  it('brings meat home with every hide', () => {
    const hunt = runHunt(
      { ...createHero('Hero', GREATAXE), maxHealth: 1000, health: 1000 },
      WOLF_COUNTRY,
      3,
      1,
      [],
    );
    expect(hunt.gathered.meat).toBe(hunt.gathered.materials['wolf-pelt']);
    expect(RATION_HEAL).toBeGreaterThan(0);
  });
});

describe('the cookfire and the pack', () => {
  it('cooks meat into rations one for one and never more than it has', () => {
    const run = { ...newRun(GREATAXE.id), meat: 3 };
    const one = cook(run, 1);
    expect(one.meat).toBe(2);
    expect(one.rations).toBe(1);
    const all = cook(one, 99);
    expect(all.meat).toBe(0);
    expect(all.rations).toBe(3);
    expect(cook(all, 1)).toBe(all);
  });

  it('spends what was eaten and never goes negative', () => {
    const run = { ...newRun(GREATAXE.id), rations: 2 };
    expect(spendRations(run, 1).rations).toBe(1);
    expect(spendRations(run, 5).rations).toBe(0);
  });

  it("gives the Hunter's Pack once", () => {
    const first = grantHuntersPack(newRun(GREATAXE.id));
    expect(first.rations).toBe(HUNTERS_PACK.rations);
    expect(first.materials['boar-hide']).toBe(HUNTERS_PACK.materials['boar-hide']);
    expect(first.packGiven).toBe(true);
    expect(grantHuntersPack(first)).toBe(first);
  });
});
