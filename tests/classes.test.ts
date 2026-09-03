import { describe, expect, it } from 'vitest';
import { STRANGE_BEAR, STRANGE_ELK, STRANGE_WOLF, STRAYED_HUNTER } from '../src/data/monsters';
import { SHORT_BOW, STAFF, SWORD_AND_SHIELD } from '../src/data/weapons';
import { runFight } from '../src/sim/combat';
import { createHero, createMonster } from '../src/sim/combatants';

const fight = (weapon: typeof STAFF, monster: typeof STRANGE_WOLF, seed: number) =>
  runFight(createHero('Hero', weapon), [createMonster(monster)], seed);

describe('Resolve', () => {
  it('counts blows taken and blocked, not damage', () => {
    // Against the wolf: many small bites. Every one that lands or is blocked
    // is one point, so the meter reads as a whole number of blows.
    const result = fight(SWORD_AND_SHIELD, STRANGE_WOLF, 4);
    let blows = 0;
    for (const event of result.events) {
      // The bash spends the meter; blows are counted from there.
      if (event.type === 'attack' && event.attacker === 'Hero' && event.empowered) blows = 0;
      if (event.type === 'attack' && event.defender === 'Hero') blows += 1;
      if (event.type === 'resource' && event.who === 'Hero') {
        expect(event.current).toBe(Math.min(SWORD_AND_SHIELD.threshold, blows));
      }
    }
  });

  it('turns a share of every blow aside, with no roll', () => {
    // A tenth off a 39-damage swing: never blocked, always a little softer.
    const result = fight(SWORD_AND_SHIELD, STRAYED_HUNTER, 2);
    const taken = result.events.filter(
      (event) => event.type === 'attack' && event.defender === 'Hero',
    );
    expect(taken.length).toBeGreaterThan(0);
    for (const event of taken) {
      if (event.type !== 'attack') continue;
      expect(event.blocked).toBe(false);
      expect(event.prevented).toBeGreaterThan(0);
    }
  });

  it('staggers the target for a second on the bash', () => {
    const result = fight(SWORD_AND_SHIELD, STRANGE_WOLF, 4);
    const bashes = result.events.filter((event) => event.type === 'attack' && event.snared);
    expect(bashes.length).toBeGreaterThan(0);
  });
});

describe('Snare', () => {
  it('fills with time, even against something that never swings', () => {
    // The Elk barely attacks. Snare does not care.
    const result = fight(SHORT_BOW, STRANGE_ELK, 2);
    const fills = result.events.filter(
      (event) =>
        event.type === 'resource' && event.who === 'Hero' && event.current >= event.threshold,
    );
    expect(fills.length).toBeGreaterThan(0);
  });

  it('pushes the target’s next swing back when it springs', () => {
    const result = fight(SHORT_BOW, STRANGE_BEAR, 3);
    const events = result.events;
    const bearSwings = events.filter(
      (event) =>
        (event.type === 'attack' || event.type === 'evade') && event.attacker === 'Strange Bear',
    );
    const snares = events.filter((event) => event.type === 'attack' && event.snared);
    expect(snares.length).toBeGreaterThan(0);

    // After a snare, the bear's next swing arrives at least snareSeconds later
    // than its usual cadence would put it.
    const cadence = 1 / STRANGE_BEAR.attack.attacksPerSecond;
    for (const snare of snares) {
      const before = bearSwings.filter((swing) => swing.at <= snare.at).pop();
      const after = bearSwings.find((swing) => swing.at > snare.at);
      if (before === undefined || after === undefined) continue;
      expect(after.at - before.at).toBeGreaterThanOrEqual(cadence + SHORT_BOW.snareSeconds - 1e-9);
    }
  });

  it('works on the heavy blow too', () => {
    // The gate's every third swing cannot be evaded. It can be delayed.
    let delayedAHeavyBlow = false;
    for (let seed = 0; seed < 30 && !delayedAHeavyBlow; seed += 1) {
      const events = fight(SHORT_BOW, STRAYED_HUNTER, seed).events;
      const cadence = 1 / STRAYED_HUNTER.attack.attacksPerSecond;
      const swings = events.filter(
        (event) =>
          (event.type === 'attack' || event.type === 'evade') &&
          event.attacker === 'Strayed Hunter',
      );
      for (const snare of events.filter((event) => event.type === 'attack' && event.snared)) {
        const next = swings.find((swing) => swing.at > snare.at);
        const prev = swings.filter((swing) => swing.at <= snare.at).pop();
        if (next?.type === 'attack' && next.unavoidable && prev !== undefined) {
          expect(next.at - prev.at).toBeGreaterThanOrEqual(cadence + SHORT_BOW.snareSeconds - 1e-9);
          delayedAHeavyBlow = true;
        }
      }
    }
    expect(delayedAHeavyBlow).toBe(true);
  });
});

describe('Mana', () => {
  it('fills from health actually lost, so armor starves it', () => {
    const bare = createHero('Hero', STAFF);
    const armored = { ...bare, flatDamageReduction: 6 };
    const monster = () => createMonster(STRANGE_WOLF);

    const fills = (hero: typeof bare): number =>
      runFight(hero, [monster()], 5).events.filter(
        (event) =>
          event.type === 'resource' && event.who === 'Hero' && event.current >= event.threshold,
      ).length;

    expect(fills(armored)).toBeLessThan(fills(bare));
  });

  it('bursts once enough has been taken', () => {
    const result = fight(STAFF, STRAYED_HUNTER, 1);
    const bursts = result.events.filter(
      (event) => event.type === 'attack' && event.attacker === 'Hero' && event.empowered,
    );
    expect(bursts.length).toBeGreaterThan(0);
  });
});
