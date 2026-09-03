import type { Weapon } from '../sim/types.ts';
import { FOCUS, MANA, RAGE, RESOLVE, SNARE } from './resources.ts';

/**
 * A weapon is an archetype, not a stat stick. Picking up a different weapon
 * type is a build pivot — see the combat model in CLAUDE.md.
 *
 * TUNING: raw damage-per-second is roughly matched on purpose (greataxe 14.3,
 * daggers 12.0) so that the *empower cadence* is what separates them, not the
 * base numbers. If you widen that gap, one archetype simply wins.
 */

export const GREATAXE: Weapon = {
  id: 'greataxe',
  name: 'Rusted Greataxe',
  archetype: 'Berserker',
  baseHealth: 100,
  pitch:
    'Slow, heavy swings. Blows aimed at you fill Rage and harden you as it climbs. ' +
    'Full, it spends itself on one swing at two and a half times the damage.',
  // Slow and enormous. Loses the opening exchange, wins the long one.
  attack: { damage: 22, attacksPerSecond: 0.65, variance: 0.2 },
  resource: RAGE,
  threshold: 60, // 60 damage suffered before an empowered swing
  empowerMultiplier: 2.5,
  // Toughens as Rage builds, then resets to fragile after the payoff. This is
  // what stops a full meter from being wasted by the greataxe's slow swing.
  maxDamageReduction: 0.4,
  evasion: 0, // the Berserker stands and takes it
  blockChance: 0,
  damageReduction: 0,
  initiative: 0,
  snareSeconds: 0,
};

export const TWIN_DAGGERS: Weapon = {
  id: 'twin-daggers',
  name: 'Twin Daggers',
  archetype: 'Assassin',
  baseHealth: 100,
  pitch:
    'Fast, light cuts. Every hit you land fills Focus, and the fifth spends it on a ' +
    'finisher at double damage. You slip one blow in seven. The rest you take in full.',
  // Fast and small. Ramps to a payoff on its own schedule, ignoring the enemy.
  // 7 rather than 6: measured over hunts, one point of dagger damage was
  // worth more than ten points of evasion, because the Assassin's problem
  // is how long it stands in front of things. Damage for fragility is the
  // trade this weapon is.
  attack: { damage: 7, attacksPerSecond: 2.0, variance: 0.15 },
  resource: FOCUS,
  threshold: 100, // five landed hits
  empowerMultiplier: 2.0,
  maxDamageReduction: 0, // stays fragile by design — that is the archetype
  // Defence by not being there. Swingy where the Berserker's is dependable.
  //
  // Deliberately low. This is a *baseline* that evasion accessories build on
  // top of — at 25% the weapon had already spent the whole budget and those
  // items would have had nothing left to give. Raised from 10% to 15% for
  // hunts, where a bare Assassin was dying in fight two; 20% closed the last
  // gap to the Berserker but spent too much of that budget.
  evasion: 0.15,
  blockChance: 0,
  damageReduction: 0,
  initiative: 0,
  snareSeconds: 0,
};

export const SWORD_AND_SHIELD: Weapon = {
  id: 'sword-and-shield',
  name: 'Sword and Shield',
  archetype: 'Warden',
  baseHealth: 100,
  pitch:
    'The shield takes a tenth off every blow, no luck to it. Every blow you take fills ' +
    'Resolve, and the fifth spends it on a bash that staggers your enemy for a second.',
  // The sword hits harder than it looks, because the shield is all the
  // defense there is. Measured against the gate: 12 damage gave a geared p90
  // of 17%, 14 gave 40%, 16 gave 73%. The gate is the fight Resolve never
  // fires in (one blow every three seconds), so damage carries it there.
  attack: { damage: 16, attacksPerSecond: 1.0, variance: 0.15 },
  resource: RESOLVE,
  threshold: 5, // five blows taken
  // Reduced from x2.5 by the owner: the bash is a stagger now, not a haymaker.
  empowerMultiplier: 1.5,
  maxDamageReduction: 0,
  evasion: 0,
  // No block roll. The first shield was a 35% chance to halve a blow, and
  // against the gate it left the Warden at 68% geared and 9% bare. The owner
  // asked for a steady share off every blow instead. Measured, geared p90 at
  // the gate: 25% gave 98, 20% gave 96, 15% gave 91, 10% gave 84 — a steady
  // share moves the boss from three hits to kill to four as soon as gear adds
  // a little, so bare stays at zero and geared jumps. Ten percent is the one
  // that fits the band and hunts level with the Berserker.
  blockChance: 0,
  damageReduction: 0.1,
  initiative: 0,
  // The bash staggers: the target's next swing comes a second late.
  snareSeconds: 1,
};

export const SHORT_BOW: Weapon = {
  id: 'short-bow',
  name: 'Short Bow',
  archetype: 'Ranger',
  baseHealth: 100,
  pitch:
    'Arrows, from a distance. The snare sets itself while the fight runs, six seconds ' +
    'whoever is swinging. The next arrow springs it, and your enemy loses two seconds, ' +
    'heavy blow or not.',
  // Starts at range, so the first arrow is already nocked when the fight begins.
  // 10 rather than 9: on hunts the Ranger died in fight two, the way the
  // Assassin did before its fix, and the same lever applies — end fights
  // sooner. Ordered by the owner with the evasion below.
  attack: { damage: 10, attacksPerSecond: 1.2, variance: 0.2 },
  resource: SNARE,
  threshold: 60, // six seconds
  empowerMultiplier: 1.5,
  maxDamageReduction: 0,
  // Fights at range, so some of what is swung at it never arrives. Ten
  // percent: a baseline the boots and rings build on, not the whole budget.
  evasion: 0.1,
  blockChance: 0,
  damageReduction: 0,
  initiative: 0.5,
  // The whole payoff. A snared enemy's next swing comes two seconds late:
  // a free arrow or two against most things, and a delayed heavy blow at
  // the gate. Three seconds sent a bare Ranger past the gate one time in
  // five; two seconds cost nothing on hunts and put the gate on target.
  snareSeconds: 2,
};

export const STAFF: Weapon = {
  id: 'staff',
  name: 'Crystal Staff',
  archetype: 'Warlock',
  baseHealth: 100,
  pitch:
    'Something wrong is set in the head of it. Every point of health you lose fills the ' +
    'crystal, and at thirty it gives it back as one burst at nearly four times the damage. ' +
    'It wants you hurt.',
  // At 10 damage and a x3 burst the Warlock lost to the Mugger bare and had a
  // 2% gate; the burst has to be worth the blood it costs. Measured: 12 and
  // x4 gave 86% at the gate, x3.5 gave 74%, x3.75 gave 78%.
  // 13 rather than 12 for the same reason as the Ranger: hunts, fight two.
  attack: { damage: 13, attacksPerSecond: 0.9, variance: 0.25 },
  resource: MANA,
  threshold: 60, // thirty health actually lost
  empowerMultiplier: 3.75,
  maxDamageReduction: 0,
  evasion: 0,
  blockChance: 0,
  damageReduction: 0,
  initiative: 0,
  snareSeconds: 0,
};

export const WEAPONS: readonly Weapon[] = [
  GREATAXE,
  TWIN_DAGGERS,
  SWORD_AND_SHIELD,
  SHORT_BOW,
  STAFF,
];
