import { MAGNITUDES, SLOT_POOLS, weightOf } from '../data/affixes.ts';
import type { Rng } from './rng.ts';
import type { Item, Modifier, ModifierKind, Slot } from './types.ts';

/** Every item carries exactly three affixes. No slot has a guaranteed primary. */
export const AFFIXES_PER_ITEM = 3;

/**
 * Generate an item for a slot.
 *
 * Affix kinds are drawn without replacement, so an item never rolls the same
 * affix twice — three lines of "+health" would read as a bug rather than as
 * luck. Weighting biases *which* kinds appear; it never forces one.
 */
export function rollItem(slot: Slot, rng: Rng): Item {
  const pool = SLOT_POOLS[slot];
  const remaining = [...pool.legal];
  const modifiers: Modifier[] = [];

  for (let i = 0; i < AFFIXES_PER_ITEM && remaining.length > 0; i += 1) {
    const kind = drawWeighted(remaining, (candidate) => weightOf(pool, candidate), rng);
    remaining.splice(remaining.indexOf(kind), 1);
    modifiers.push({ kind, value: rollMagnitude(kind, pool.magnitudeScale, rng) });
  }

  return {
    id: `${slot}-${rng.int(100000, 999999)}`,
    name: pool.label,
    slot,
    modifiers,
  };
}

/** A full set: one of every slot, with two rings. */
export function rollLoadout(rng: Rng): Item[] {
  const slots: Slot[] = ['head', 'torso', 'legs', 'feet', 'hands', 'ring', 'ring', 'necklace'];
  return slots.map((slot) => rollItem(slot, rng));
}

function rollMagnitude(kind: ModifierKind, scale: number, rng: Rng): number {
  const range = MAGNITUDES[kind];
  const raw = (range.min + rng.next() * (range.max - range.min)) * scale;

  // Round for legibility — a player should never read "+2.7391 health".
  const factor = 10 ** range.decimals;
  const rounded = Math.round(raw * factor) / factor;

  // Rounding must never erase an affix entirely, so nudge a zero back to the
  // smallest magnitude its sign allows.
  if (rounded === 0) return range.max < 0 ? -1 / factor : 1 / factor;
  return rounded;
}

function drawWeighted<T>(candidates: readonly T[], weight: (item: T) => number, rng: Rng): T {
  let total = 0;
  for (const candidate of candidates) total += weight(candidate);

  let roll = rng.next() * total;
  for (const candidate of candidates) {
    roll -= weight(candidate);
    if (roll < 0) return candidate;
  }

  // Only reachable through floating-point drift on the final candidate.
  const last = candidates[candidates.length - 1];
  if (last === undefined) throw new Error('drawWeighted called with no candidates');
  return last;
}
