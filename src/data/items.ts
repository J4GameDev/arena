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
 * TUNING: first pass, not yet run through the balance harness. Expect movement.
 */

// --- Armour -----------------------------------------------------------------

export const BOARHIDE_JERKIN: Item = {
  id: 'boarhide-jerkin',
  name: 'Boarhide Jerkin',
  slot: 'torso',
  modifiers: [
    { kind: 'flatDamageReduction', value: 2 }, // slot identity: the plate absorbs
    { kind: 'maxHealth', value: 12 },
    { kind: 'attackSpeed', value: -0.05 }, // it is heavy; armour should cost something
  ],
};

export const TRAIL_BOOTS: Item = {
  id: 'trail-boots',
  name: 'Worn Trail Boots',
  slot: 'feet',
  modifiers: [
    { kind: 'evasion', value: 0.06 }, // slot identity: footwork
    { kind: 'attackSpeed', value: 0.08 },
    { kind: 'maxHealth', value: 5 },
  ],
};

export const TANNERS_GLOVES: Item = {
  id: 'tanners-gloves',
  name: "Tanner's Gloves",
  slot: 'hands',
  modifiers: [
    { kind: 'attackSpeed', value: 0.12 }, // slot identity: grip and handling
    { kind: 'damage', value: 1 },
    { kind: 'resourceGain', value: 0.05 },
  ],
};

export const HUNTERS_HOOD: Item = {
  id: 'hunters-hood',
  name: "Hunter's Hood",
  slot: 'head',
  modifiers: [
    { kind: 'damageVariance', value: -0.05 }, // slot identity: you read the attack
    { kind: 'evasion', value: 0.03 },
    { kind: 'maxHealth', value: 6 },
  ],
};

// --- Trinkets ---------------------------------------------------------------

export const FUSED_BONE_RING: Item = {
  id: 'fused-bone-ring',
  name: 'Fused Bone Ring',
  slot: 'ring',
  modifiers: [
    { kind: 'resourceGain', value: 0.2 }, // slot identity: bends the economy
    { kind: 'maxHealth', value: -8 }, // tainted gear costs you something
    { kind: 'damage', value: 2 },
  ],
};

export const TOOTH_ON_A_CORD: Item = {
  id: 'tooth-on-a-cord',
  name: 'Tooth on a Cord',
  slot: 'necklace',
  modifiers: [
    // Slot identity: amplify the archetype. A slower, heavier payoff — worth far
    // more to a Berserker's single enormous hit than to an Assassin's four.
    { kind: 'empowerMultiplier', value: 0.6 },
    { kind: 'resourceThreshold', value: 0.15 },
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
