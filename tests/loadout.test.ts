import { describe, expect, it } from 'vitest';
import { RAGE } from '../src/data/resources';
import { GREATAXE, TWIN_DAGGERS } from '../src/data/weapons';
import { createHero } from '../src/sim/combatants';
import { EVASION_CAP, equip } from '../src/sim/loadout';
import type { Item } from '../src/sim/types';

function item(id: string, modifiers: Item['modifiers']): Item {
  return { id, name: id, slot: 'ring', modifiers };
}

describe('equip', () => {
  it('stacks affixes of the same kind across items', () => {
    const hero = createHero('Hero', GREATAXE, [
      item('a', [{ kind: 'maxHealth', value: 10 }]),
      item('b', [{ kind: 'maxHealth', value: 15 }]),
    ]);

    expect(hero.maxHealth).toBe(125);
    expect(hero.health).toBe(125);
  });

  it('does not care what order items are equipped in', () => {
    const one = item('one', [
      { kind: 'attackSpeed', value: 0.2 },
      { kind: 'maxHealth', value: 10 },
    ]);
    const two = item('two', [
      { kind: 'attackSpeed', value: -0.1 },
      { kind: 'damage', value: 3 },
    ]);

    expect(createHero('Hero', GREATAXE, [one, two])).toEqual(
      createHero('Hero', GREATAXE, [two, one]),
    );
  });

  it('caps evasion however much gear stacks it', () => {
    const hero = createHero('Hero', TWIN_DAGGERS, [
      item('a', [{ kind: 'evasion', value: 0.5 }]),
      item('b', [{ kind: 'evasion', value: 0.5 }]),
      item('c', [{ kind: 'evasion', value: 0.5 }]),
    ]);

    expect(hero.evasion).toBe(EVASION_CAP);
  });

  it('never lets health, damage or attack speed reach zero', () => {
    const hero = createHero('Hero', GREATAXE, [
      item('ruinous', [
        { kind: 'maxHealth', value: -9999 },
        { kind: 'damage', value: -9999 },
        { kind: 'attackSpeed', value: -9999 },
      ]),
    ]);

    expect(hero.maxHealth).toBeGreaterThan(0);
    expect(hero.attack.damage).toBeGreaterThan(0);
    expect(hero.attack.attacksPerSecond).toBeGreaterThan(0);
  });

  it('does not mutate the shared resource rules in data/', () => {
    const before = { ...RAGE };

    createHero('Hero', GREATAXE, [item('a', [{ kind: 'resourceGain', value: 5 }])]);

    expect(RAGE).toEqual(before);
  });

  it('does not mutate the combatant it is given', () => {
    const bare = createHero('Hero', GREATAXE);
    const snapshot = structuredClone(bare);

    equip(bare, [
      item('a', [
        { kind: 'maxHealth', value: 50 },
        { kind: 'evasion', value: 0.3 },
      ]),
    ]);

    expect(bare).toEqual(snapshot);
  });

  it('applies resource gain as a multiplier on the fill rate', () => {
    const hero = createHero('Hero', GREATAXE, [item('a', [{ kind: 'resourceGain', value: 0.5 }])]);

    expect(hero.resource?.rule.gainPerDamageTaken).toBeCloseTo(RAGE.gainPerDamageTaken * 1.5);
  });

  it('lowers the threshold when resourceThreshold is negative', () => {
    const hero = createHero('Hero', GREATAXE, [
      item('a', [{ kind: 'resourceThreshold', value: -0.25 }]),
    ]);

    expect(hero.resource?.threshold).toBe(45); // 60 base, a quarter off
  });
});
