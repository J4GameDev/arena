import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/rng';

describe('Rng', () => {
  it('produces the same sequence for the same seed', () => {
    const first = new Rng(99);
    const second = new Rng(99);
    for (let i = 0; i < 100; i++) {
      expect(first.next()).toBe(second.next());
    }
  });

  it('produces different sequences for different seeds', () => {
    expect(new Rng(1).next()).not.toBe(new Rng(2).next());
  });

  it('stays within bounds', () => {
    const rng = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);

      const roll = rng.int(1, 6);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    }
  });

  it('clone does not disturb the parent stream', () => {
    const rng = new Rng(42);
    rng.next();

    // Draining a clone should not affect what the parent yields next.
    const speculative = rng.clone();
    for (let i = 0; i < 10; i++) speculative.next();

    const reference = new Rng(42);
    reference.next();

    expect(rng.next()).toBe(reference.next());
  });

  it('pick rejects empty arrays', () => {
    expect(() => new Rng(1).pick([])).toThrow();
  });
});
