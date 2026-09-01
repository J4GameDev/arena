import { describe, expect, it } from 'vitest';
import { STRAYED_HUNTER, TURNED_BOAR } from '../src/data/monsters';
import { GREATAXE, TWIN_DAGGERS } from '../src/data/weapons';
import { BLOCK_REDUCTION, runFight } from '../src/sim/combat';
import { createHero, createMonster } from '../src/sim/combatants';
import { BLOCK_CAP, CRIT_CHANCE_CAP } from '../src/sim/loadout';
import type { Item, ModifierKind } from '../src/sim/types';

/** A one-affix trinket, for isolating a single mechanic. */
function trinket(kind: ModifierKind, value: number): Item {
  return { id: kind, name: kind, slot: 'ring', modifiers: [{ kind, value }] };
}

const boar = () => createMonster(TURNED_BOAR);
const hunter = () => createMonster(STRAYED_HUNTER);

describe('crit', () => {
  it('never happens without gear, because heroes start at zero crit chance', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const result = runFight(createHero('Hero', GREATAXE), boar(), seed);
      const heroCrits = result.events.filter(
        (event) => event.type === 'attack' && event.attacker === 'Hero' && event.critical,
      );
      expect(heroCrits).toHaveLength(0);
    }
  });

  it('always happens at 100% crit chance', () => {
    const hero = createHero('Hero', GREATAXE, [trinket('critChance', 1)]);
    const result = runFight(hero, boar(), 4);

    const heroAttacks = result.events.filter(
      (event) => event.type === 'attack' && event.attacker === 'Hero',
    );

    expect(heroAttacks.length).toBeGreaterThan(0);
    for (const attack of heroAttacks) {
      if (attack.type === 'attack') expect(attack.critical).toBe(true);
    }
  });

  it('stacks with an empowered hit rather than replacing it', () => {
    const hero = createHero('Hero', GREATAXE, [trinket('critChance', 1)]);
    const result = runFight(hero, hunter(), 7);

    const both = result.events.some(
      (event) =>
        event.type === 'attack' && event.attacker === 'Hero' && event.empowered && event.critical,
    );

    expect(both).toBe(true);
  });

  it('is suppressed entirely by enough crit resistance', () => {
    // Monsters sit at 5% base crit, so 5 points of resistance zeroes them out.
    const hero = createHero('Hero', GREATAXE, [trinket('critResistance', 0.05)]);

    for (let seed = 0; seed < 40; seed += 1) {
      const result = runFight(hero, hunter(), seed);
      const critsTaken = result.events.filter(
        (event) => event.type === 'attack' && event.defender === 'Hero' && event.critical,
      );
      expect(critsTaken).toHaveLength(0);
    }
  });

  it('caps crit chance so it can never exceed certainty', () => {
    const hero = createHero('Hero', GREATAXE, [trinket('critChance', 5), trinket('critChance', 5)]);
    expect(hero.critChance).toBe(CRIT_CHANCE_CAP);
  });
});

describe('block', () => {
  it('reduces a hit rather than avoiding it', () => {
    const hero = createHero('Hero', GREATAXE, [trinket('blockChance', 1)]);
    const result = runFight(hero, boar(), 3);

    const blockedHits = result.events.filter(
      (event) => event.type === 'attack' && event.defender === 'Hero' && event.blocked,
    );

    expect(blockedHits.length).toBeGreaterThan(0);
    for (const hit of blockedHits) {
      // Blocked, not evaded — damage still lands.
      if (hit.type === 'attack') expect(hit.damage).toBeGreaterThan(0);
    }
    expect(BLOCK_REDUCTION).toBeGreaterThan(0);
  });

  it('is capped so blocking never becomes guaranteed', () => {
    const hero = createHero('Hero', GREATAXE, [
      trinket('blockChance', 1),
      trinket('blockChance', 1),
    ]);
    expect(hero.blockChance).toBe(BLOCK_CAP);
  });
});

describe('lifesteal', () => {
  it('returns health to the attacker and never overheals', () => {
    const hero = createHero('Hero', TWIN_DAGGERS, [trinket('lifesteal', 0.5)]);
    const result = runFight(hero, hunter(), 2);

    const drained = result.events.filter(
      (event) => event.type === 'attack' && event.attacker === 'Hero' && event.healed > 0,
    );
    expect(drained.length).toBeGreaterThan(0);

    // Health is reported for the defender, so check the hero never exceeds max
    // by reading the hits taken.
    for (const event of result.events) {
      if (event.type === 'attack' && event.defender === 'Hero') {
        expect(event.defenderHealth).toBeLessThanOrEqual(event.defenderMaxHealth);
      }
    }
  });
});

describe('initiative', () => {
  it('makes the hero swing sooner', () => {
    const slow = runFight(createHero('Hero', GREATAXE), boar(), 1);
    const quick = runFight(createHero('Hero', GREATAXE, [trinket('initiative', 0.5)]), boar(), 1);

    const firstHeroSwing = (events: typeof slow.events): number => {
      for (const event of events) {
        if (event.type === 'attack' && event.attacker === 'Hero') return event.at;
      }
      return Number.POSITIVE_INFINITY;
    };

    expect(firstHeroSwing(quick.events)).toBeLessThan(firstHeroSwing(slow.events));
  });
});

describe('resource retention', () => {
  it('keeps part of the meter instead of emptying it', () => {
    const hero = createHero('Hero', GREATAXE, [trinket('resourceRetention', 0.5)]);
    const result = runFight(hero, hunter(), 5);

    let sawEmpower = false;
    for (let i = 0; i < result.events.length; i += 1) {
      const event = result.events[i];
      if (event?.type !== 'attack' || !event.empowered || event.attacker !== 'Hero') continue;
      sawEmpower = true;

      // The next resource reading for the hero must not have dropped to zero.
      for (let j = i + 1; j < result.events.length; j += 1) {
        const later = result.events[j];
        if (later?.type === 'resource' && later.who === 'Hero') {
          expect(later.current).toBeGreaterThan(0);
          break;
        }
      }
    }

    expect(sawEmpower).toBe(true);
  });
});
