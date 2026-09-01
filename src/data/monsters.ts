import type { MonsterDefinition } from '../sim/types.ts';

/**
 * Monsters are puzzles, not stat checks (pillar two). Each one should make some
 * builds comfortable and some builds miserable, and `designRole` has to say
 * which — if you cannot write that line, the monster is not finished.
 *
 * Every creature starts from a real animal and a corruption band, never from a
 * fantasy monster. See the escalation rule in CLAUDE.md.
 *
 * The lever that actually matters for balance is *fight length*. Focus ramps on
 * the hero's own schedule, so a long fight feeds it repeatedly; Rage fills from
 * incoming damage, so a hard-hitting enemy feeds it in bursts.
 *
 * Every monster crits. 5% is the baseline — enough that the critResistance
 * affix protects against something real, low enough that a lucky roll does not
 * decide fights on its own.
 *
 * TUNING: these numbers are tuned and verified over thousands of fights. The
 * names and fiction changed after the world was settled; the numbers did not.
 */

export const TURNED_BOAR: MonsterDefinition = {
  id: 'turned-boar',
  name: 'Turned Boar',
  maxHealth: 110,
  // The low variance is load-bearing twice over. Mechanically, predictable
  // damage guarantees the player's meter fills before the boar dies. In the
  // fiction it *is* the corruption: a real boar fights erratically, and this
  // one attacks on a fixed interval, like something keeping time.
  attack: { damage: 9, attacksPerSecond: 1.2, variance: 0.1 },
  critChance: 0.05,
  designRole:
    'The teacher. Always loses, but hits hard and steadily enough that every build ' +
    'reaches a full meter and sees its payoff at least once before the fight ends. ' +
    'Tuned for guaranteed demonstration, not for difficulty.',
};

export const STRAYED_HUNTER: MonsterDefinition = {
  id: 'strayed-hunter',
  name: 'Strayed Hunter',
  maxHealth: 200,
  // Swollen and slow — far enough gone that the body has stopped being a
  // person's. Rare enormous blows dump Rage in chunks, which is what makes
  // this fight favour the greataxe.
  attack: { damage: 38, attacksPerSecond: 0.35, variance: 0.1 },
  critChance: 0.05,
  designRole:
    'The wall, and the warning. A hunter who went too far out and came back wrong. ' +
    'Long fight, rare enormous hits: each blow dumps Rage in a chunk so the greataxe ' +
    'empowers often, while the Assassin must survive the grind to cash in its ramp. ' +
    'Tuned as a gate: unwinnable bare, roughly 85% winnable in a full set. You are ' +
    'meant to grind gear before attempting it.',
};

export const MONSTERS: readonly MonsterDefinition[] = [TURNED_BOAR, STRAYED_HUNTER];
