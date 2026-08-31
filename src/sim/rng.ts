/**
 * Deterministic seeded RNG (mulberry32).
 *
 * Every random decision in `sim/` must go through this. `Math.random()` inside
 * the simulation breaks replayability, tests, and brute-force balancing.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** True with the given probability (0..1). */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Uniform pick from a non-empty array. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Rng.pick called with an empty array');
    return items[this.int(0, items.length - 1)];
  }

  /**
   * Independent copy at the current position. Useful for speculative rolls
   * (previews, "what if" calculations) that must not disturb the real stream.
   */
  clone(): Rng {
    const copy = new Rng(0);
    copy.state = this.state;
    return copy;
  }
}

/** Convenience for one-off seeds outside the sim (run generation, etc.). */
export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}
