import { MONSTERS } from '../data/monsters.ts';
import { WEAPONS } from '../data/weapons.ts';
import { runFight } from '../sim/combat.ts';
import { createHero, createMonster } from '../sim/combatants.ts';
import { Rng } from '../sim/rng.ts';
import { rollDrop } from '../sim/roll.ts';
import type { Combatant, Item, Modifier, MonsterDefinition, Slot, Weapon } from '../sim/types.ts';
import {
  acquireWeapon,
  addToBackpack,
  advanceDropSeed,
  discardItem,
  equipItem,
  equippedItems,
  EQUIP_POSITIONS,
  newRun,
  recordDefeat,
  slotOf,
  unequipItem,
  wieldWeapon,
  type EquipPosition,
  type RunState,
} from '../state/run.ts';
import { loadRun, saveRun } from '../state/storage.ts';
import { playFight } from './fight-view.ts';
import { formatModifier, isBeneficial } from './format.ts';

/** Sprites live in public/sprites and are looked up by id. */
const spriteFor = (id: string): string => `/sprites/${id}.png`;

/** One icon per slot: every item in a slot shares a name, so it shares a picture. */
const iconFor = (slot: Slot): string => `/icons/${slot}.png`;

/**
 * Where a fight happens. The spar is inside the walls; everything else is out
 * past them. Decided here, in the view, because the simulation has no idea
 * that places exist.
 */
const sceneFor = (definition: MonsterDefinition): string =>
  `/scenes/${definition.defeat === 'yields' ? 'bastion-yard' : 'forest-edge'}.png`;

/**
 * How often a corrupted kill yields a weapon you do not already have.
 *
 * A weapon is a whole build pivot, so it has to be rarer than armour — but not
 * so rare that a player never sees a second archetype exist.
 */
const WEAPON_FIND_CHANCE = 0.25;

export function start(mount: HTMLElement): void {
  let state: RunState | null = loadRun();
  let busy = false;

  const commit = (next: RunState): void => {
    state = next;
    saveRun(state);
    render();
  };

  function weaponById(id: string): Weapon {
    const found = WEAPONS.find((candidate) => candidate.id === id);
    if (found === undefined) throw new Error(`Unknown weapon: ${id}`);
    return found;
  }

  function heroFrom(run: RunState): Combatant {
    const weapon = weaponById(run.weaponId);
    return createHero(weapon.archetype, weapon, equippedItems(run));
  }

  async function hunt(run: RunState, definition: MonsterDefinition): Promise<void> {
    if (busy) return;
    busy = true;

    const you = heroFrom(run);
    const foe = createMonster(definition);
    const rng = new Rng(run.dropSeed);
    const result = runFight(you, foe, rng.int(1, 1_000_000));

    mount.innerHTML = '';
    const stage = document.createElement('section');
    stage.className = 'stage';
    mount.append(stage);

    await playFight(stage, you, foe, result, {
      hero: spriteFor(run.weaponId),
      foe: spriteFor(definition.id),
      scene: sceneFor(definition),
    });

    const won = result.winner === you.name;
    let next = advanceDropSeed(run);
    let drop: Item | null = null;
    let weaponFound: Weapon | null = null;

    // Oswald yields rather than dies, and you do not loot your teacher.
    if (won && definition.defeat === 'dies') {
      drop = rollDrop(rng);
      next = addToBackpack(next, drop);

      // Only people leave weapons. A boar was never carrying a greataxe — the
      // corrupted hunters are still holding what they went out with.
      const unowned = WEAPONS.filter((candidate) => !next.ownedWeaponIds.includes(candidate.id));
      if (definition.lineage === 'person' && unowned.length > 0 && rng.chance(WEAPON_FIND_CHANCE)) {
        weaponFound = rng.pick(unowned);
        next = acquireWeapon(next, weaponFound.id);
      }
    }
    if (won) next = recordDefeat(next, definition.id);

    stage.append(outcome(definition, won, drop, weaponFound));
    stage.querySelector('.continue')?.addEventListener('click', () => {
      busy = false;
      commit(next);
    });

    state = next;
    saveRun(state);
  }

  function renderChoice(): void {
    mount.innerHTML = `
      <header class="top">
        <h1>The Bastion</h1>
        <p class="sub">Pick up something and go out. You only get to choose once.</p>
      </header>
      <section class="panel">
        <h2>Take a weapon</h2>
        <div class="choices">
          ${WEAPONS.map(
            (weapon) => `
            <button class="choice" data-weapon="${weapon.id}" type="button">
              <span class="choice-name">${escape(weapon.name)}</span>
              <span class="choice-archetype">${escape(weapon.archetype)}</span>
              <span class="choice-pitch">${escape(weapon.pitch)}</span>
            </button>`,
          ).join('')}
        </div>
        <p class="aside">Anything else you carry, you will have to find out there.</p>
      </section>
    `;

    for (const button of mount.querySelectorAll<HTMLButtonElement>('.choice')) {
      button.addEventListener('click', () => commit(newRun(button.dataset['weapon'] ?? '')));
    }
  }

  function render(): void {
    const run = state;
    if (run === null) {
      renderChoice();
      return;
    }

    const you = heroFrom(run);
    const weapon = weaponById(run.weaponId);

    mount.innerHTML = `
      <header class="top">
        <h1>The Bastion</h1>
        <p class="sub">${escape(weapon.name)} · ${escape(weapon.archetype)}</p>
      </header>

      <section class="panel">
        <h2>You</h2>
        <img class="portrait large" src="${spriteFor(run.weaponId)}" alt="" onerror="this.remove()" />
        <ul class="stats">
          ${stat('Health', String(you.maxHealth))}
          ${stat('Damage', String(Math.round(you.attack.damage)))}
          ${stat('Attacks / sec', you.attack.attacksPerSecond.toFixed(2))}
          ${stat('Armour', String(you.flatDamageReduction))}
          ${stat('Evasion', percent(you.evasion))}
          ${stat('Block', percent(you.blockChance))}
          ${stat('Crit', percent(you.critChance))}
          ${stat('Lifesteal', percent(you.lifesteal))}
        </ul>
      </section>

      ${
        run.ownedWeaponIds.length > 1
          ? `<section class="panel">
              <h2>Arms</h2>
              <div class="items">
                ${run.ownedWeaponIds
                  .map((id) => weaponCard(weaponById(id), id === run.weaponId))
                  .join('')}
              </div>
            </section>`
          : ''
      }

      <section class="panel">
        <h2>Worn</h2>
        <div class="slots">
          ${EQUIP_POSITIONS.map((position) => slotCard(position, run.equipped[position])).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Hunt</h2>
        <div class="hunts">
          ${MONSTERS.map(
            (monster) => `<button class="hunt" data-monster="${monster.id}" type="button">
              <span class="hunt-name">${escape(monster.name)}</span>
              <span class="hunt-note">${
                run.defeated.includes(monster.id) ? 'defeated before' : 'never faced'
              }</span>
            </button>`,
          ).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Pack <span class="count">${run.backpack.length}</span></h2>
        ${
          run.backpack.length === 0
            ? '<p class="empty">Nothing yet. Hunt something.</p>'
            : `<div class="items">${run.backpack.map(itemCard).join('')}</div>`
        }
      </section>
    `;

    bind('.hunt', (button) => {
      const definition = MONSTERS.find((m) => m.id === button.dataset['monster']);
      if (definition !== undefined) void hunt(run, definition);
    });
    bind('[data-equip]', (button) => {
      const item = run.backpack.find((candidate) => candidate.id === button.dataset['equip']);
      if (item !== undefined) commit(equipItem(run, item, positionFor(item, run)));
    });
    bind('[data-discard]', (button) => commit(discardItem(run, button.dataset['discard'] ?? '')));
    bind('[data-unequip]', (button) =>
      commit(unequipItem(run, button.dataset['unequip'] as EquipPosition)),
    );
    bind('[data-wield]', (button) => commit(wieldWeapon(run, button.dataset['wield'] ?? '')));
  }

  function bind(selector: string, handler: (button: HTMLButtonElement) => void): void {
    for (const button of mount.querySelectorAll<HTMLButtonElement>(selector)) {
      button.addEventListener('click', () => handler(button));
    }
  }

  render();
}

/** Rings take the empty finger first. */
function positionFor(item: Item, run: RunState): EquipPosition {
  if (item.slot !== 'ring') return item.slot;
  return run.equipped.ring1 === undefined ? 'ring1' : 'ring2';
}

function weaponCard(weapon: Weapon, inHand: boolean): string {
  return `
    <div class="item ${inHand ? 'in-hand' : ''}">
      <div class="item-head">
        ${icon(spriteFor(weapon.id))}
        <div>
          <p class="item-name">${escape(weapon.name)}</p>
          <p class="slot-name">${escape(weapon.archetype)}</p>
        </div>
      </div>
      <p class="pitch">${escape(weapon.pitch)}</p>
      <div class="item-actions">
        ${
          inHand
            ? '<span class="in-hand-note">In hand</span>'
            : `<button data-wield="${weapon.id}" type="button">Take up</button>`
        }
      </div>
    </div>
  `;
}

function slotCard(position: EquipPosition, item: Item | undefined): string {
  if (item === undefined) {
    return `
      <div class="slot empty">
        <div class="item-head">
          ${icon(iconFor(slotOf(position)))}
          <p class="slot-name">${label(position)}</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="slot">
      <div class="item-head">
        ${icon(iconFor(item.slot))}
        <div>
          <p class="slot-name">${label(position)}</p>
          <p class="item-name">${escape(item.name)}</p>
        </div>
      </div>
      <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
      <button class="ghost" data-unequip="${position}" type="button">Remove</button>
    </div>
  `;
}

function itemCard(item: Item): string {
  return `
    <div class="item">
      <div class="item-head">
        ${icon(iconFor(item.slot))}
        <p class="item-name">${escape(item.name)}</p>
      </div>
      <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
      <div class="item-actions">
        <button data-equip="${item.id}" type="button">Wear</button>
        <button class="ghost" data-discard="${item.id}" type="button">Discard</button>
      </div>
    </div>
  `;
}

function outcome(
  definition: MonsterDefinition,
  won: boolean,
  drop: Item | null,
  weaponFound: Weapon | null,
): HTMLElement {
  const node = document.createElement('div');
  node.className = 'outcome';

  const headline = won ? (definition.defeat === 'yields' ? 'He calls it' : 'You held') : 'You fell';

  const line = won
    ? definition.defeat === 'yields'
      ? `${escape(definition.name)} steps back and nods. That will do.`
      : `${escape(definition.name)} is done.`
    : `${escape(definition.name)} was too much.`;

  node.innerHTML = `
    <h2>${headline}</h2>
    <p>${line}</p>
    ${
      weaponFound === null
        ? ''
        : `<div class="item found weapon">
             <p class="slot-name">Taken from the body</p>
             <div class="item-head">
               ${icon(spriteFor(weaponFound.id))}
               <p class="item-name">${escape(weaponFound.name)}</p>
             </div>
             <p class="pitch">${escape(weaponFound.pitch)}</p>
           </div>`
    }
    ${
      drop === null
        ? '<p class="empty">Nothing to carry back.</p>'
        : `<div class="item found">
             <div class="item-head">
               ${icon(iconFor(drop.slot))}
               <p class="item-name">${escape(drop.name)}</p>
             </div>
             <ul class="affixes">${drop.modifiers.map(affixLine).join('')}</ul>
           </div>`
    }
    <button class="continue" type="button">Back to the bastion</button>
  `;
  return node;
}

function affixLine(modifier: Modifier): string {
  const text = formatModifier(modifier);
  return `<li class="${isBeneficial(modifier) ? 'good' : 'bad'}">${escape(text)}</li>`;
}

/** Missing art removes itself rather than showing a broken image. */
function icon(src: string): string {
  return `<img class="icon" src="${src}" alt="" onerror="this.remove()" />`;
}

function stat(name: string, value: string): string {
  return `<li><span>${name}</span><strong>${escape(value)}</strong></li>`;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function label(position: EquipPosition): string {
  const slot = slotOf(position);
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
