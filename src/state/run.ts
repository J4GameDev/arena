import type { Item, Slot } from '../sim/types.ts';

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

export interface RunState {
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
  /** Monster ids the player has beaten at least once. */
  readonly defeated: readonly string[];
  /** Advances on every roll so drops never repeat across a session. */
  readonly dropSeed: number;
}

export function newRun(weaponId: string): RunState {
  return {
    weaponId,
    ownedWeaponIds: [weaponId],
    equipped: {},
    backpack: [],
    defeated: [],
    dropSeed: 1,
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
