import type { MonsterDefinition } from '../sim/types.ts';

/**
 * Monsters are puzzles, not stat checks (pillar two). Each one should make some
 * builds comfortable and some builds miserable, and `designRole` has to say
 * which — if you cannot write that line, the monster is not finished.
 *
 * The lever that actually matters here is *fight length*. Focus ramps on the
 * hero's own schedule, so a long fight feeds it repeatedly; Rage fills from
 * incoming damage, so a hard-hitting enemy feeds it in bursts.
 *
 * TUNING: first-pass guesses. Expect to move these a lot.
 */

export const GNOLL_RAVAGER: MonsterDefinition = {
  id: 'gnoll-ravager',
  name: 'Gnoll Ravager',
  maxHealth: 70,
  attack: { damage: 5, attacksPerSecond: 1.2, variance: 0.25 },
  designRole:
    'Short, low-damage fight. Dies before Focus finishes ramping and barely feeds Rage, ' +
    'so both archetypes fight it close to raw. The honest baseline.',
};

export const STONE_SENTINEL: MonsterDefinition = {
  id: 'stone-sentinel',
  name: 'Stone Sentinel',
  maxHealth: 200,
  attack: { damage: 30, attacksPerSecond: 0.35, variance: 0.1 },
  designRole:
    'Long fight, rare enormous hits. Each blow dumps Rage in a chunk, so the greataxe ' +
    'empowers often; daggers must survive the grind to cash in their ramp.',
};

export const MONSTERS: readonly MonsterDefinition[] = [GNOLL_RAVAGER, STONE_SENTINEL];
