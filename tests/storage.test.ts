import { describe, expect, it } from 'vitest';

import { Rng } from '../src/sim/rng.ts';
import { rollItem } from '../src/sim/roll.ts';
import { newRun } from '../src/state/run.ts';
import { migrateSave } from '../src/state/storage.ts';

/**
 * The game is live, so a save from the version before must still load. Each
 * step in migrateSave gets a test here; a shape change without one wipes
 * somebody's progress.
 */
describe('migrateSave', () => {
  const rng = new Rng(3);

  it('loads a current save as it is', () => {
    const state = newRun('greataxe');
    expect(migrateSave({ version: 7, state })).toEqual(state);
  });

  it('moves the one ring of a version 6 save onto the right hand', () => {
    const ring = rollItem('ring', rng);
    const hood = rollItem('head', rng);
    const old = { ...newRun('greataxe'), equipped: { head: hood, ring } };

    const migrated = migrateSave({ version: 6, state: old as never });

    expect(migrated?.equipped.ring1).toEqual(ring);
    expect(migrated?.equipped.ring2).toBeUndefined();
    expect(migrated?.equipped.head).toEqual(hood);
    expect(migrated?.equipped).not.toHaveProperty('ring');
  });

  it('carries a version 6 save with no ring across untouched', () => {
    const old = newRun('twin-daggers');
    expect(migrateSave({ version: 6, state: old })).toEqual(old);
  });

  it('discards a save older than the steps go back', () => {
    expect(migrateSave({ version: 5, state: newRun('greataxe') })).toBeNull();
  });

  it('discards a save with no state', () => {
    expect(migrateSave({ version: 7 })).toBeNull();
  });
});
