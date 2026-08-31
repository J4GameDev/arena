import { describe, expect, it } from 'vitest';
import { GNOLL_RAVAGER, STONE_SENTINEL } from '../src/data/monsters';
import { GREATAXE, TWIN_DAGGERS } from '../src/data/weapons';
import { runFight } from '../src/sim/combat';
import { createHero, createMonster } from '../src/sim/combatants';

const hero = () => createHero('Hero', GREATAXE);
const gnoll = () => createMonster(GNOLL_RAVAGER);

describe('runFight', () => {
  it('is deterministic for a given seed', () => {
    const first = runFight(hero(), gnoll(), 1234);
    const second = runFight(hero(), gnoll(), 1234);

    expect(first.events).toEqual(second.events);
    expect(first.winner).toBe(second.winner);
    expect(first.durationSeconds).toBe(second.durationSeconds);
  });

  it('produces different fights for different seeds', () => {
    const a = runFight(hero(), gnoll(), 1);
    const b = runFight(hero(), gnoll(), 2);

    expect(a.events).not.toEqual(b.events);
  });

  it('does not mutate the combatants it is given', () => {
    const heroTemplate = hero();
    const monsterTemplate = gnoll();

    runFight(heroTemplate, monsterTemplate, 99);

    expect(heroTemplate.health).toBe(heroTemplate.maxHealth);
    expect(monsterTemplate.health).toBe(monsterTemplate.maxHealth);
    expect(heroTemplate.resource?.current).toBe(0);
  });

  it('always terminates with a winner or an explicit draw', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const result = runFight(hero(), gnoll(), seed);
      const ended = result.events.some(
        (event) => event.type === 'death' || event.type === 'timeout',
      );
      expect(ended).toBe(true);
    }
  });

  it('empowers an attack once the resource reaches its threshold', () => {
    // The Sentinel hits hard enough to fill Rage several times over.
    const result = runFight(createHero('Hero', GREATAXE), createMonster(STONE_SENTINEL), 5);

    const empoweredAttacks = result.events.filter(
      (event) => event.type === 'attack' && event.empowered,
    );

    expect(empoweredAttacks.length).toBeGreaterThan(0);
  });

  it('never lets a resource exceed its threshold', () => {
    const result = runFight(createHero('Hero', TWIN_DAGGERS), createMonster(STONE_SENTINEL), 3);

    for (const event of result.events) {
      if (event.type === 'resource') {
        expect(event.current).toBeLessThanOrEqual(event.threshold);
      }
    }
  });

  it('never reports negative health', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const result = runFight(createHero('Hero', TWIN_DAGGERS), gnoll(), seed);
      for (const event of result.events) {
        if (event.type === 'attack') {
          expect(event.defenderHealth).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
