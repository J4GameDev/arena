import type { MonsterDefinition } from '../sim/types.ts';

/**
 * Monsters are puzzles, not stat checks (pillar two). Each one should make some
 * builds comfortable and some builds miserable, and `designRole` has to say
 * which — if you cannot write that line, the monster is not finished.
 *
 * Every creature starts from a real animal and a corruption band, never from a
 * fantasy monster. See the escalation rule in CLAUDE.md. Band one is named
 * "Strange": something is off, without saying what. "Turned" read as undead.
 *
 * The levers that actually separate the two archetypes:
 *   - Fight length feeds Focus, which ramps on the hero's own swings.
 *   - Damage swung at the hero feeds Rage. An enemy that barely attacks starves it.
 *   - Armour guts small fast hits and barely dents big slow ones.
 *
 * Everything corrupted crits — enough that critResistance protects against
 * something real, low enough that a lucky roll does not decide fights alone.
 *
 * TUNING: verified over thousands of fights with `npm run balance`. Regular
 * enemies are meant to be winnable bare most of the time — they are the grind.
 * Only the gate is tuned to be impossible without gear.
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
  lineage: 'person',
  designRole:
    'The teacher. An experienced hunter sparring with you, first to yield. He always ' +
    'loses, but hits hard and steadily enough that every build reaches a full meter ' +
    'and sees its payoff at least once. Tuned for guaranteed demonstration, not for ' +
    'difficulty — and never for lethality.',
};

export const STRANGE_BOAR: MonsterDefinition = {
  id: 'strange-boar',
  name: 'Strange Boar',
  maxHealth: 100,
  // Charges. Fewer, heavier hits than Oswald with a wide swing — the first
  // thing you fight that is actually trying to hurt you. Lives just long
  // enough to fill Rage once; at 90 health it died a few points short.
  attack: { damage: 12, attacksPerSecond: 1.0, variance: 0.3 },
  critChance: 0.05,
  defeat: 'dies',
  lineage: 'animal',
  designRole:
    'The first real hunt. Recognisably a boar with something wrong about it. An even ' +
    'fight for both builds: feeds Rage in decent chunks, dies before Focus ramps far.',
};

export const STRANGE_ELK: MonsterDefinition = {
  id: 'strange-elk',
  name: 'Strange Elk',
  maxHealth: 220,
  // Barely swings. That is the whole point: Rage fills from damage aimed at
  // you, so an enemy that will not attack leaves the Berserker's meter empty
  // while the Assassin's Focus ramps freely off its own hits.
  attack: { damage: 5, attacksPerSecond: 0.4, variance: 0.2 },
  critChance: 0.02,
  defeat: 'dies',
  lineage: 'animal',
  designRole:
    'The Berserker-punisher, and the first enemy that favours the Assassin. Huge health, ' +
    'almost no offence. Prey that has stopped being afraid: it does not flee and it ' +
    'barely fights back. It just stands there and will not die.',
};

export const STRANGE_WOLF: MonsterDefinition = {
  id: 'strange-wolf',
  name: 'Strange Wolf',
  maxHealth: 110,
  // Fast, light bites. Feeds Rage steadily and chips through evasion by volume.
  // Health is what makes the drip add up — at 80 it died before Rage filled.
  attack: { damage: 4, attacksPerSecond: 2.0, variance: 0.3 },
  critChance: 0.08,
  defeat: 'dies',
  lineage: 'animal',
  designRole:
    'Fast chip. A steady drip of small hits keeps Rage climbing so the Berserker cruises, ' +
    'and gets through the Assassin by sheer volume. Hunts alone, with no interest in a pack.',
};

export const STRANGE_BEAR: MonsterDefinition = {
  id: 'strange-bear',
  name: 'Strange Bear',
  // A regular, not a gate. At 150 health and 16 damage a bare Assassin won
  // one fight in ten — a wall wearing the wrong label. This keeps the armour,
  // which is the whole identity, and lets the Assassin win almost always
  // while making it grind for it.
  maxHealth: 130,
  attack: { damage: 12, attacksPerSecond: 0.5, variance: 0.15 },
  critChance: 0.05,
  // Thick hide in patches where hide should not grow. Takes 3 off every hit:
  // a rounding error to a 22-damage greataxe, half of a 6-damage dagger.
  armour: 3,
  defeat: 'dies',
  lineage: 'animal',
  designRole:
    'The Assassin-punisher, and the hardest regular hunt — but still a regular. Armour ' +
    'that barely dents the Berserker halves the Assassin, so the same fight is quick for ' +
    'one build and a long grind for the other. Different fight, same outcome.',
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
  lineage: 'person',
  designRole:
    'The wall, and the warning. A hunter who went too far out and came back wrong — ' +
    'the same figure you sparred with in the opening, at the other end of the road. ' +
    'Long fight, rare enormous hits: each blow dumps Rage in a chunk so the greataxe ' +
    'empowers often, while the Assassin must survive the grind to cash in its ramp. ' +
    'Tuned as a gate: unwinnable bare, roughly 80% winnable in good gear.',
};

export const MONSTERS: readonly MonsterDefinition[] = [
  OSWALD,
  STRANGE_BOAR,
  STRANGE_ELK,
  STRANGE_WOLF,
  STRANGE_BEAR,
  STRAYED_HUNTER,
];
