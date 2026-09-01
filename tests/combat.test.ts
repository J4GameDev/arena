import { describe, expect, it } from 'vitest';
import { TURNED_BOAR, STRAYED_HUNTER } from '../src/data/monsters';
import { GREATAXE, TWIN_DAGGERS } from '../src/data/weapons';
import { runFight } from '../src/sim/combat';
import { createHero, createMonster } from '../src/sim/combatants';

const hero = () => createHero('Hero', GREATAXE);
const boar = () => createMonster(TURNED_BOAR);

describe('runFight', () => {
  it('is deterministic for a given seed', () => {
    const first = runFight(hero(), boar(), 1234);
    const second = runFight(hero(), boar(), 1234);

    expect(first.events).toEqual(second.events);
    expect(first.winner).toBe(second.winner);
    expect(first.durationSeconds).toBe(second.durationSeconds);
  });

  it('produces different fights for different seeds', () => {
    const a = runFight(hero(), boar(), 1);
    const b = runFight(hero(), boar(), 2);

    expect(a.events).not.toEqual(b.events);
  });

  it('does not mutate the combatants it is given', () => {
    const heroTemplate = hero();
    const monsterTemplate = boar();

    runFight(heroTemplate, monsterTemplate, 99);

    expect(heroTemplate.health).toBe(heroTemplate.maxHealth);
    expect(monsterTemplate.health).toBe(monsterTemplate.maxHealth);
    expect(heroTemplate.resource?.current).toBe(0);
  });

  it('always terminates with a winner or an explicit draw', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const result = runFight(hero(), boar(), seed);
      const ended = result.events.some(
        (event) => event.type === 'defeat' || event.type === 'timeout',
      );
      expect(ended).toBe(true);
    }
  });

  it('empowers an attack once the resource reaches its threshold', () => {
    // The Strayed Hunter hits hard enough to fill Rage several times over.
    const result = runFight(createHero('Hero', GREATAXE), createMonster(STRAYED_HUNTER), 5);

    const empoweredAttacks = result.events.filter(
      (event) => event.type === 'attack' && event.empowered,
    );

    expect(empoweredAttacks.length).toBeGreaterThan(0);
  });

  it('never lets a resource exceed its threshold', () => {
    const result = runFight(createHero('Hero', TWIN_DAGGERS), createMonster(STRAYED_HUNTER), 3);

    for (const event of result.events) {
      if (event.type === 'resource') {
        expect(event.current).toBeLessThanOrEqual(event.threshold);
      }
    }
  });

  it('absorbs damage once Rage has started building', () => {
    const result = runFight(createHero('Hero', GREATAXE), createMonster(STRAYED_HUNTER), 5);

    const absorbedSomething = result.events.some(
      (event) => event.type === 'attack' && event.defender === 'Hero' && event.prevented > 0,
    );

    expect(absorbedSomething).toBe(true);
  });

  it('absorbs nothing for an archetype with no damage reduction', () => {
    const result = runFight(createHero('Hero', TWIN_DAGGERS), createMonster(STRAYED_HUNTER), 5);

    for (const event of result.events) {
      if (event.type === 'attack' && event.defender === 'Hero') {
        expect(event.prevented).toBe(0);
      }
    }
  });

  it('always lets at least 1 damage through, however full the meter', () => {
    const result = runFight(createHero('Hero', GREATAXE), createMonster(STRAYED_HUNTER), 11);

    for (const event of result.events) {
      if (event.type === 'attack') {
        expect(event.damage).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('lets an evasive hero avoid attacks entirely', () => {
    // Scan seeds rather than trusting one: any change to what consumes
    // randomness shifts the stream, and a magic seed would break for no reason.
    const evadedSomewhere = Array.from({ length: 30 }, (_unused, seed) =>
      runFight(createHero('Hero', TWIN_DAGGERS), createMonster(STRAYED_HUNTER), seed),
    ).some((result) =>
      result.events.some((event) => event.type === 'evade' && event.defender === 'Hero'),
    );

    expect(evadedSomewhere).toBe(true);
  });

  it('never lets a non-evasive hero evade', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const result = runFight(createHero('Hero', GREATAXE), createMonster(STRAYED_HUNTER), seed);
      expect(result.events.some((event) => event.type === 'evade')).toBe(false);
    }
  });

  it('never reports negative health', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const result = runFight(createHero('Hero', TWIN_DAGGERS), boar(), seed);
      for (const event of result.events) {
        if (event.type === 'attack') {
          expect(event.defenderHealth).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
