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
 * Everything corrupted crits at 5% — enough that the critResistance affix
 * protects against something real, low enough that a lucky roll does not decide
 * fights on its own.
 *
 * TUNING: these numbers are verified over thousands of fights. The fiction has
 * changed underneath them more than once; the numbers have not.
 */

export const OSWALD: MonsterDefinition = {
  id: 'oswald',
  name: 'Oswald',
  maxHealth: 110,
  // Both numbers here are motivated by who he is rather than excused. He hits
  // in a controlled, repeatable rhythm because he is disciplined, and that
  // predictability is what guarantees your meter fills before the spar ends.
  attack: { damage: 9, attacksPerSecond: 1.2, variance: 0.1 },
  // He is not trying to kill you. A teacher pulls his strikes.
  critChance: 0,
  defeat: 'yields',
  designRole:
    'The teacher. An experienced hunter sparring with you, first to yield. He always ' +
    'loses, but hits hard and steadily enough that every build reaches a full meter ' +
    'and sees its payoff at least once. Tuned for guaranteed demonstration, not for ' +
    'difficulty — and never for lethality.',
};

export const TURNED_BOAR: MonsterDefinition = {
  id: 'turned-boar',
  name: 'Turned Boar',
  maxHealth: 110,
  attack: { damage: 9, attacksPerSecond: 1.2, variance: 0.25 },
  critChance: 0.05,
  defeat: 'dies',
  designRole:
    'The first thing you hunt that hunts back. Band one — recognisably a boar, with ' +
    'something wrong about it. Inherited the teaching numbers and no longer needs ' +
    'them; wants a retune now that Oswald carries the tutorial.',
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
  defeat: 'dies',
  designRole:
    'The wall, and the warning. A hunter who went too far out and came back wrong — ' +
    'the same figure you sparred with in the opening, at the other end of the road. ' +
    'Long fight, rare enormous hits: each blow dumps Rage in a chunk so the greataxe ' +
    'empowers often, while the Assassin must survive the grind to cash in its ramp. ' +
    'Tuned as a gate: unwinnable bare, roughly 80% winnable in a full set.',
};

export const MONSTERS: readonly MonsterDefinition[] = [OSWALD, TURNED_BOAR, STRAYED_HUNTER];
