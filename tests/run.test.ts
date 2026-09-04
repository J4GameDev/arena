import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/rng';
import { rollItem } from '../src/sim/roll';
import {
  addToBackpack,
  equipItem,
  equippedItems,
  newRun,
  slotOf,
  unequipItem,
} from '../src/state/run';

const rng = new Rng(1);
const ring = () => rollItem('ring', rng);
const torso = () => rollItem('torso', rng);

describe('run state', () => {
  it('maps both ring positions to the ring slot', () => {
    expect(slotOf('ring')).toBe('ring');
    expect(slotOf('torso')).toBe('torso');
  });

  it('equips an item out of the backpack', () => {
    const item = torso();
    const state = equipItem(addToBackpack(newRun('greataxe'), item), item, 'torso');

    expect(state.equipped.torso).toBe(item);
    expect(state.backpack).toHaveLength(0);
    expect(equippedItems(state)).toEqual([item]);
  });

  it('returns a displaced item to the backpack', () => {
    const first = torso();
    const second = torso();

    let state = equipItem(newRun('greataxe'), first, 'torso');
    state = equipItem(state, second, 'torso');

    expect(state.equipped.torso).toBe(second);
    expect(state.backpack).toEqual([first]);
  });

  it('has one ring position, so a second ring displaces the first', () => {
    const first = ring();
    const second = ring();

    let state = equipItem(newRun('greataxe'), first, 'ring');
    state = equipItem(state, second, 'ring');

    expect(state.equipped.ring).toBe(second);
    expect(state.backpack).toEqual([first]);
    expect(equippedItems(state)).toHaveLength(1);
  });

  it('refuses an item that does not belong in the position', () => {
    expect(() => equipItem(newRun('greataxe'), torso(), 'ring')).toThrow();
  });

  it('unequips back into the backpack', () => {
    const item = torso();
    const state = unequipItem(equipItem(newRun('greataxe'), item, 'torso'), 'torso');

    expect(state.equipped.torso).toBeUndefined();
    expect(state.backpack).toEqual([item]);
    expect(equippedItems(state)).toHaveLength(0);
  });

  it('never mutates the state it is given', () => {
    const before = newRun('greataxe');
    const snapshot = structuredClone(before);

    equipItem(before, torso(), 'torso');

    expect(before).toEqual(snapshot);
  });
});
