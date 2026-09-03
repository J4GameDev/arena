import { CRAFT_COST, MATERIALS } from '../data/materials.ts';
import type { Haul, HuntLength } from '../sim/hunt.ts';
import type { Rng } from '../sim/rng.ts';
import { craftItem } from '../sim/roll.ts';
import type { Item, MaterialId, Slot } from '../sim/types.ts';

/**
 * Where an item actually sits. Distinct from Slot because there are two ring
 * positions and only one ring *slot* — a ring can go in either.
 */
export type EquipPosition =
  'head' | 'torso' | 'legs' | 'feet' | 'hands' | 'ring1' | 'ring2' | 'necklace';

export const EQUIP_POSITIONS: readonly EquipPosition[] = [
  'head',
  'torso',
  'legs',
  'feet',
  'hands',
  'ring1',
  'ring2',
  'necklace',
];

/** Which slot's items a position accepts. */
export function slotOf(position: EquipPosition): Slot {
  return position === 'ring1' || position === 'ring2' ? 'ring' : position;
}

/**
 * Who the hunter is, before the weapon. Chosen once at the start, like the
 * weapon, and it decides which sprite stands in the yard. It changes no
 * number anywhere: the build is the character, and this is only the body.
 */
export type Sex = 'male' | 'female';

export interface RunState {
  /** The body the player chose at the start. Art only. */
  readonly sex: Sex;
  /** The weapon currently in hand. This is the player's class. */
  readonly weaponId: string;
  /**
   * Every weapon the player has. One is chosen at the very start; the rest have
   * to be found, because picking up a new weapon type is a whole build pivot
   * and handing those out freely would make the choice meaningless.
   */
  readonly ownedWeaponIds: readonly string[];
  /** A position with no entry is empty. */
  readonly equipped: Partial<Record<EquipPosition, Item>>;
  readonly backpack: readonly Item[];
  /** Hides brought back from hunts, by material. What the tanner works with. */
  readonly materials: Readonly<Partial<Record<MaterialId, number>>>;
  /** Raw. Cooked at the bastion, one for one, into rations. */
  readonly meat: number;
  /** Cooked. Every one you own goes out with you and is eaten when needed. */
  readonly rations: number;
  /** Oswald gives the Hunter's Pack once, after the first spar. */
  readonly packGiven: boolean;
  /** How far the player last chose to go. Remembered so the choice sticks. */
  readonly huntLength: HuntLength;
  /** Monster ids the player has beaten at least once. */
  readonly defeated: readonly string[];
  /** Advances on every roll so drops never repeat across a session. */
  readonly dropSeed: number;
}

export function newRun(weaponId: string, sex: Sex = 'male'): RunState {
  return {
    sex,
    weaponId,
    ownedWeaponIds: [weaponId],
    equipped: {},
    backpack: [],
    materials: {},
    meat: 0,
    rations: 0,
    packGiven: false,
    huntLength: 3,
    defeated: [],
    dropSeed: 1,
  };
}

export function setHuntLength(state: RunState, huntLength: HuntLength): RunState {
  return { ...state, huntLength };
}

/** Everything a hunt brought home goes into the pack, the stores, and the arms. */
export function addHaul(state: RunState, haul: Haul): RunState {
  const materials = { ...state.materials };
  for (const [id, count] of Object.entries(haul.materials)) {
    materials[id as MaterialId] = (materials[id as MaterialId] ?? 0) + (count ?? 0);
  }

  let next: RunState = {
    ...state,
    materials,
    meat: state.meat + haul.meat,
    backpack: [...state.backpack, ...haul.items],
  };
  for (const weaponId of haul.weaponIds) next = acquireWeapon(next, weaponId);
  return next;
}

/** Rations eaten on the road are gone whether or not the hunt came home. */
export function spendRations(state: RunState, eaten: number): RunState {
  return { ...state, rations: Math.max(0, state.rations - eaten) };
}

/** The cookfire: meat becomes rations one for one, at home only. */
export function cook(state: RunState, count: number): RunState {
  const cooked = Math.min(count, state.meat);
  if (cooked <= 0) return state;
  return { ...state, meat: state.meat - cooked, rations: state.rations + cooked };
}

/**
 * What Oswald hands over after the first spar. Enough to eat through a bad
 * first trip and make one piece of armor, and not a scrap more. He gives it
 * once; it is not a shop.
 */
export const HUNTERS_PACK = {
  rations: 6,
  materials: { 'boar-hide': 4, 'wolf-pelt': 2 } as Readonly<Partial<Record<MaterialId, number>>>,
} as const;

export function grantHuntersPack(state: RunState): RunState {
  if (state.packGiven) return state;
  const materials = { ...state.materials };
  for (const [id, count] of Object.entries(HUNTERS_PACK.materials)) {
    materials[id as MaterialId] = (materials[id as MaterialId] ?? 0) + (count ?? 0);
  }
  return { ...state, materials, rations: state.rations + HUNTERS_PACK.rations, packGiven: true };
}

export function craftCost(slot: Slot): number | undefined {
  return CRAFT_COST[slot];
}

export function canCraft(state: RunState, slot: Slot, materialId: MaterialId): boolean {
  const cost = craftCost(slot);
  return cost !== undefined && (state.materials[materialId] ?? 0) >= cost;
}

/**
 * Spend hide, get armor. Throws rather than silently failing when the player
 * cannot afford it: the view is responsible for not offering what it cannot
 * deliver, and a crash is cheaper than a hood that never arrives.
 */
export function craft(state: RunState, slot: Slot, materialId: MaterialId, rng: Rng): RunState {
  const cost = craftCost(slot);
  if (cost === undefined) throw new Error(`${slot} cannot be crafted`);
  const have = state.materials[materialId] ?? 0;
  if (have < cost) throw new Error(`Need ${cost} ${materialId}, have ${have}`);

  const item = craftItem(slot, MATERIALS[materialId], rng);
  return {
    ...state,
    materials: { ...state.materials, [materialId]: have - cost },
    backpack: [...state.backpack, item],
  };
}

export function acquireWeapon(state: RunState, weaponId: string): RunState {
  if (state.ownedWeaponIds.includes(weaponId)) return state;
  return { ...state, ownedWeaponIds: [...state.ownedWeaponIds, weaponId] };
}

/** Switching weapons switches archetype. Gear stays; everything else changes. */
export function wieldWeapon(state: RunState, weaponId: string): RunState {
  if (!state.ownedWeaponIds.includes(weaponId)) {
    throw new Error(`Cannot wield a weapon you do not have: ${weaponId}`);
  }
  return { ...state, weaponId };
}

/** Everything currently worn, in position order. */
export function equippedItems(state: RunState): Item[] {
  return EQUIP_POSITIONS.map((position) => state.equipped[position]).filter(
    (item): item is Item => item !== undefined,
  );
}

/**
 * Move an item from the pack into a position, returning whatever was displaced.
 *
 * Throws on a slot mismatch rather than silently ignoring it — a crash during
 * development is cheaper than a ring quietly refusing to go on a finger.
 */
export function equipItem(state: RunState, item: Item, position: EquipPosition): RunState {
  if (item.slot !== slotOf(position)) {
    throw new Error(`Cannot put a ${item.slot} item in ${position}`);
  }

  const displaced = state.equipped[position];
  const backpack = state.backpack.filter((candidate) => candidate.id !== item.id);

  return {
    ...state,
    equipped: { ...state.equipped, [position]: item },
    backpack: displaced === undefined ? backpack : [...backpack, displaced],
  };
}

export function unequipItem(state: RunState, position: EquipPosition): RunState {
  const item = state.equipped[position];
  if (item === undefined) return state;

  const equipped = { ...state.equipped };
  delete equipped[position];

  return { ...state, equipped, backpack: [...state.backpack, item] };
}

export function addToBackpack(state: RunState, item: Item): RunState {
  return { ...state, backpack: [...state.backpack, item] };
}

export function discardItem(state: RunState, itemId: string): RunState {
  return { ...state, backpack: state.backpack.filter((item) => item.id !== itemId) };
}

export function recordDefeat(state: RunState, monsterId: string): RunState {
  if (state.defeated.includes(monsterId)) return state;
  return { ...state, defeated: [...state.defeated, monsterId] };
}

export function advanceDropSeed(state: RunState): RunState {
  return { ...state, dropSeed: state.dropSeed + 1 };
}
