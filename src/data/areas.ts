import type { Area } from '../sim/types.ts';
import {
  STRANGE_BEAR,
  STRANGE_BOAR,
  STRANGE_ELK,
  STRANGE_WOLF,
  BANDIT,
  MUGGER,
} from './monsters.ts';

/**
 * The places a hunter can go. One for now. A second band is a second area
 * with its own table — that is the whole content pipeline.
 *
 * The chances are written as fractions so they read the way they were
 * decided: "one in seven is a person, one in eight is an ambush".
 */
export const FOREST_EDGE: Area = {
  id: 'forest-edge',
  name: 'Forest Edge',
  description:
    'The woods nearest the walls. Still green, still quiet, still where the town gets ' +
    'its meat and hide. The animals have started to look at you differently.',
  scene: 'forest-edge',
  animals: [
    { monster: STRANGE_BOAR, weight: 1 },
    { monster: STRANGE_ELK, weight: 1 },
    { monster: STRANGE_WOLF, weight: 1 },
    { monster: STRANGE_BEAR, weight: 1 },
  ],
  people: [
    { monster: BANDIT, weight: 1 },
    { monster: MUGGER, weight: 1 },
  ],
  personChance: 1 / 7,
  ambushChance: 1 / 8,
  ambushSize: [2, 3],
};

export const AREAS: readonly Area[] = [FOREST_EDGE];
