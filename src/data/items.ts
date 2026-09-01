import type { Item } from '../sim/types.ts';

/**
 * Every item carries exactly three affixes: the first is the slot's guaranteed
 * identity, the other two are the interesting part. When a generator exists it
 * will roll the last two; these are hand-authored stand-ins with the same shape.
 *
 * The pool leans toward affixes *every* build can use but values differently.
 * Attack speed is the model case — a Focus build converts it straight into more
 * payoffs, a Rage build just swings sooner. Same number, worth roughly double
 * to one of them. Affixes only one build can use, like evasion, stay rare.
 *
 * ARMOUR comes from what you hunt. TRINKETS come from the corruption, which is
 * why they are the ones that bend the rules.
 *
 * TUNING: gear is an *edge*, not a doubling. Magnitudes here are deliberately
 * small — a full set should be worth roughly a third more, and the fights it
 * gates should be tuned around having it. If an affix here looks unexciting on
 * its own, that is correct: eight slots of three affixes add up fast.
 */

// --- Armour -----------------------------------------------------------------

export const BOARHIDE_JERKIN: Item = {
  id: 'boarhide-jerkin',
  name: 'Boarhide Jerkin',
  slot: 'torso',
  modifiers: [
    { kind: 'flatDamageReduction', value: 2 }, // slot identity: the plate absorbs
    { kind: 'maxHealth', value: 6 },
    { kind: 'attackSpeed', value: -0.03 }, // it is heavy; armour should cost something
  ],
};

export const TRAIL_BOOTS: Item = {
  id: 'trail-boots',
  name: 'Worn Trail Boots',
  slot: 'feet',
  modifiers: [
    { kind: 'evasion', value: 0.03 }, // slot identity: footwork
    { kind: 'attackSpeed', value: 0.03 },
    { kind: 'maxHealth', value: 3 },
  ],
};

export const TANNERS_GLOVES: Item = {
  id: 'tanners-gloves',
  name: "Tanner's Gloves",
  slot: 'hands',
  modifiers: [
    { kind: 'attackSpeed', value: 0.05 }, // slot identity: grip and handling
    { kind: 'damage', value: 1 },
    { kind: 'resourceGain', value: 0.03 },
  ],
};

export const HUNTERS_HOOD: Item = {
  id: 'hunters-hood',
  name: "Hunter's Hood",
  slot: 'head',
  modifiers: [
    { kind: 'damageVariance', value: -0.03 }, // slot identity: you read the attack
    { kind: 'evasion', value: 0.02 },
    { kind: 'maxHealth', value: 3 },
  ],
};

// --- Trinkets ---------------------------------------------------------------

export const FUSED_BONE_RING: Item = {
  id: 'fused-bone-ring',
  name: 'Fused Bone Ring',
  slot: 'ring',
  modifiers: [
    { kind: 'resourceGain', value: 0.08 }, // slot identity: bends the economy
    { kind: 'maxHealth', value: -4 }, // tainted gear costs you something
    { kind: 'damage', value: 1 },
  ],
};

export const TOOTH_ON_A_CORD: Item = {
  id: 'tooth-on-a-cord',
  name: 'Tooth on a Cord',
  slot: 'necklace',
  modifiers: [
    // Slot identity: amplify the archetype. A heavier payoff is worth more to a
    // Berserker's single enormous hit than to an Assassin's four smaller ones.
    { kind: 'empowerMultiplier', value: 0.2 },
    { kind: 'resourceThreshold', value: 0.05 },
    { kind: 'flatDamageReduction', value: 1 },
  ],
};

export const ITEMS: readonly Item[] = [
  BOARHIDE_JERKIN,
  TRAIL_BOOTS,
  TANNERS_GLOVES,
  HUNTERS_HOOD,
  FUSED_BONE_RING,
  TOOTH_ON_A_CORD,
];
