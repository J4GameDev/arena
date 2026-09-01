import { describe, expect, it } from 'vitest';
import { SLOT_POOLS } from '../src/data/affixes';
import { Rng } from '../src/sim/rng';
import { AFFIXES_PER_ITEM, rollItem, rollLoadout } from '../src/sim/roll';
import type { ModifierKind, Slot } from '../src/sim/types';

const ALL_SLOTS: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands', 'ring', 'necklace'];

describe('rollItem', () => {
  it('always produces three distinct affixes', () => {
    const rng = new Rng(1);
    for (const slot of ALL_SLOTS) {
      for (let i = 0; i < 200; i += 1) {
        const item = rollItem(slot, rng);
        expect(item.modifiers).toHaveLength(AFFIXES_PER_ITEM);

        const kinds = item.modifiers.map((modifier) => modifier.kind);
        expect(new Set(kinds).size).toBe(AFFIXES_PER_ITEM);
      }
    }
  });

  it('never rolls an affix outside the legal pool for its slot', () => {
    const rng = new Rng(2);
    for (const slot of ALL_SLOTS) {
      const legal = new Set<ModifierKind>(SLOT_POOLS[slot].legal);
      for (let i = 0; i < 500; i += 1) {
        for (const modifier of rollItem(slot, rng).modifiers) {
          expect(legal.has(modifier.kind)).toBe(true);
        }
      }
    }
  });

  it('keeps resource affixes off armour entirely', () => {
    const rng = new Rng(3);
    const resourceAffixes: ModifierKind[] = [
      'resourceGain',
      'resourceThreshold',
      'resourceRetention',
      'empowerMultiplier',
    ];
    const armourSlots: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands'];

    for (const slot of armourSlots) {
      for (let i = 0; i < 500; i += 1) {
        for (const modifier of rollItem(slot, rng).modifiers) {
          expect(resourceAffixes).not.toContain(modifier.kind);
        }
      }
    }
  });

  it('keeps lifesteal and crit off armour, except crit resistance', () => {
    const rng = new Rng(4);
    const armourSlots: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands'];

    for (const slot of armourSlots) {
      for (let i = 0; i < 500; i += 1) {
        for (const modifier of rollItem(slot, rng).modifiers) {
          expect(['lifesteal', 'critChance', 'critMultiplier']).not.toContain(modifier.kind);
        }
      }
    }
  });

  it('only ever puts initiative on feet', () => {
    const rng = new Rng(5);
    for (const slot of ALL_SLOTS) {
      if (slot === 'feet') continue;
      for (let i = 0; i < 500; i += 1) {
        for (const modifier of rollItem(slot, rng).modifiers) {
          expect(modifier.kind).not.toBe('initiative');
        }
      }
    }
  });

  it('favours common affixes over rare ones without ever forcing them', () => {
    const rng = new Rng(6);
    const counts = new Map<ModifierKind, number>();
    const RUNS = 4000;

    for (let i = 0; i < RUNS; i += 1) {
      for (const modifier of rollItem('feet', rng).modifiers) {
        counts.set(modifier.kind, (counts.get(modifier.kind) ?? 0) + 1);
      }
    }

    const evasion = counts.get('evasion') ?? 0;
    const critResistance = counts.get('critResistance') ?? 0;

    // Common should clearly beat rare...
    expect(evasion).toBeGreaterThan(critResistance);
    // ...but rare must still happen, or the weighting has become a rule.
    expect(critResistance).toBeGreaterThan(0);
  });

  it('never rolls a magnitude of zero', () => {
    const rng = new Rng(7);
    for (const slot of ALL_SLOTS) {
      for (let i = 0; i < 300; i += 1) {
        for (const modifier of rollItem(slot, rng).modifiers) {
          expect(modifier.value).not.toBe(0);
        }
      }
    }
  });

  it('is deterministic for a given seed', () => {
    expect(rollItem('torso', new Rng(42))).toEqual(rollItem('torso', new Rng(42)));
  });
});

describe('rollLoadout', () => {
  it('fills all eight positions, with two rings', () => {
    const loadout = rollLoadout(new Rng(9));

    expect(loadout).toHaveLength(8);
    expect(loadout.filter((item) => item.slot === 'ring')).toHaveLength(2);
  });

  it('rolls the two rings independently', () => {
    // Over many loadouts the two ring slots must sometimes differ, or they are
    // not being rolled separately.
    const differ = Array.from({ length: 50 }, (_unused, seed) => rollLoadout(new Rng(seed))).some(
      (loadout) => {
        const rings = loadout.filter((item) => item.slot === 'ring');
        return JSON.stringify(rings[0]?.modifiers) !== JSON.stringify(rings[1]?.modifiers);
      },
    );

    expect(differ).toBe(true);
  });
});
