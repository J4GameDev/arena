import { MONSTERS } from '../data/monsters.ts';
import { WEAPONS } from '../data/weapons.ts';
import { runFight } from '../sim/combat.ts';
import { createHero, createMonster } from '../sim/combatants.ts';
import { Rng } from '../sim/rng.ts';
import { rollDrop } from '../sim/roll.ts';
import type { Combatant, Item, Modifier } from '../sim/types.ts';
import {
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
  type EquipPosition,
  type RunState,
} from '../state/run.ts';
import { loadRun, saveRun } from '../state/storage.ts';
import { playFight } from './fight-view.ts';
import { formatModifier, isBeneficial } from './format.ts';

const STARTING_WEAPON = 'greataxe';

export function start(mount: HTMLElement): void {
  let state = loadRun() ?? newRun(STARTING_WEAPON);
  let busy = false;

  const commit = (next: RunState): void => {
    state = next;
    saveRun(state);
    render();
  };

  function weapon() {
    const found = WEAPONS.find((candidate) => candidate.id === state.weaponId);
    if (found === undefined) throw new Error(`Unknown weapon: ${state.weaponId}`);
    return found;
  }

  function hero(): Combatant {
    return createHero(weapon().archetype, weapon(), equippedItems(state));
  }

  async function hunt(monsterId: string): Promise<void> {
    if (busy) return;
    const definition = MONSTERS.find((candidate) => candidate.id === monsterId);
    if (definition === undefined) return;

    busy = true;
    const you = hero();
    const foe = createMonster(definition);
    const rng = new Rng(state.dropSeed);
    const result = runFight(you, foe, rng.int(1, 1_000_000));

    mount.innerHTML = '';
    const stage = document.createElement('section');
    stage.className = 'stage';
    mount.append(stage);

    await playFight(stage, you, foe, result);

    const won = result.winner === you.name;
    let next = advanceDropSeed(state);
    let drop: Item | null = null;

    if (won) {
      next = recordDefeat(next, definition.id);
      drop = rollDrop(rng);
      next = addToBackpack(next, drop);
    }

    stage.append(outcome(definition.name, won, drop));
    stage.querySelector('.continue')?.addEventListener('click', () => {
      busy = false;
      commit(next);
    });

    state = next;
    saveRun(state);
  }

  function render(): void {
    const you = hero();

    mount.innerHTML = `
      <header class="top">
        <h1>The Bastion</h1>
        <p class="sub">${escape(weapon().name)} · ${escape(weapon().archetype)}</p>
      </header>

      <section class="panel">
        <h2>You</h2>
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

      <section class="panel">
        <h2>Worn</h2>
        <div class="slots">
          ${EQUIP_POSITIONS.map((position) => slotCard(position, state.equipped[position])).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Hunt</h2>
        <div class="hunts">
          ${MONSTERS.map((monster) => {
            const beaten = state.defeated.includes(monster.id);
            return `<button class="hunt" data-monster="${monster.id}">
              <span class="hunt-name">${escape(monster.name)}</span>
              <span class="hunt-note">${beaten ? 'defeated before' : 'never faced'}</span>
            </button>`;
          }).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Pack <span class="count">${state.backpack.length}</span></h2>
        ${
          state.backpack.length === 0
            ? '<p class="empty">Nothing yet. Hunt something.</p>'
            : `<div class="items">${state.backpack.map(itemCard).join('')}</div>`
        }
      </section>
    `;

    for (const button of mount.querySelectorAll<HTMLButtonElement>('.hunt')) {
      button.addEventListener('click', () => void hunt(button.dataset['monster'] ?? ''));
    }
    for (const button of mount.querySelectorAll<HTMLButtonElement>('[data-equip]')) {
      button.addEventListener('click', () => {
        const item = state.backpack.find((candidate) => candidate.id === button.dataset['equip']);
        if (item === undefined) return;
        commit(equipItem(state, item, positionFor(item, state)));
      });
    }
    for (const button of mount.querySelectorAll<HTMLButtonElement>('[data-discard]')) {
      button.addEventListener('click', () =>
        commit(discardItem(state, button.dataset['discard'] ?? '')),
      );
    }
    for (const button of mount.querySelectorAll<HTMLButtonElement>('[data-unequip]')) {
      button.addEventListener('click', () =>
        commit(unequipItem(state, button.dataset['unequip'] as EquipPosition)),
      );
    }
  }

  render();
}

/** Rings pick the empty finger first, then the left one. */
function positionFor(item: Item, state: RunState): EquipPosition {
  if (item.slot !== 'ring') return item.slot;
  return state.equipped.ring1 === undefined ? 'ring1' : 'ring2';
}

function slotCard(position: EquipPosition, item: Item | undefined): string {
  if (item === undefined) {
    return `<div class="slot empty"><p class="slot-name">${label(position)}</p></div>`;
  }
  return `
    <div class="slot">
      <p class="slot-name">${label(position)}</p>
      <p class="item-name">${escape(item.name)}</p>
      <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
      <button class="ghost" data-unequip="${position}" type="button">Remove</button>
    </div>
  `;
}

function itemCard(item: Item): string {
  return `
    <div class="item">
      <p class="item-name">${escape(item.name)}</p>
      <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
      <div class="item-actions">
        <button data-equip="${item.id}" type="button">Wear</button>
        <button class="ghost" data-discard="${item.id}" type="button">Discard</button>
      </div>
    </div>
  `;
}

function outcome(monsterName: string, won: boolean, drop: Item | null): HTMLElement {
  const node = document.createElement('div');
  node.className = 'outcome';
  node.innerHTML = `
    <h2>${won ? 'You held' : 'You fell'}</h2>
    <p>${won ? `${escape(monsterName)} is done.` : `${escape(monsterName)} was too much.`}</p>
    ${
      drop === null
        ? '<p class="empty">Nothing to carry back.</p>'
        : `<div class="item found">
             <p class="item-name">${escape(drop.name)}</p>
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

function stat(name: string, value: string): string {
  return `<li><span>${name}</span><strong>${escape(value)}</strong></li>`;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function label(position: EquipPosition): string {
  if (position === 'ring1') return 'Ring';
  if (position === 'ring2') return 'Ring';
  const slot = slotOf(position);
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
