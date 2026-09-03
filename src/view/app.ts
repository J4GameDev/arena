import { AREAS } from '../data/areas.ts';
import { CRAFTABLE_SLOTS, MATERIAL_LIST } from '../data/materials.ts';
import { MONSTERS, OSWALD, STRAYED_HUNTER } from '../data/monsters.ts';
import { WEAPONS } from '../data/weapons.ts';
import { createHero } from '../sim/combatants.ts';
import { HUNT_LENGTHS, runHunt, type Haul, type HuntLength, type HuntResult } from '../sim/hunt.ts';
import { Rng } from '../sim/rng.ts';
import type {
  Area,
  Combatant,
  Item,
  MaterialId,
  Modifier,
  MonsterDefinition,
  Weapon,
} from '../sim/types.ts';
import {
  addHaul,
  advanceDropSeed,
  canCraft,
  craft,
  craftCost,
  discardItem,
  equipItem,
  equippedItems,
  EQUIP_POSITIONS,
  newRun,
  recordDefeat,
  setHuntLength,
  slotOf,
  unequipItem,
  wieldWeapon,
  type EquipPosition,
  type RunState,
} from '../state/run.ts';
import { loadRun, saveRun } from '../state/storage.ts';
import { figureFor, iconFor, sceneFor, spriteFor } from './art.ts';
import { playFight } from './fight-view.ts';
import { formatModifier, isBeneficial } from './format.ts';

/**
 * A fight you choose rather than stumble into, wrapped as a one-encounter
 * area so it plays through the same code as a hunt. The spar and the gate
 * are the only two: everything else is out in an area's table.
 */
function chosenFight(
  monster: MonsterDefinition,
  name: string,
  description: string,
  scene: string,
): Area {
  return {
    id: monster.id,
    name,
    description,
    scene,
    animals: [{ monster, weight: 1 }],
    people: [],
    personChance: 0,
    ambushChance: 0,
    ambushSize: [1, 1],
  };
}

const THE_YARD = chosenFight(
  OSWALD,
  'The yard',
  'Spar with Oswald. He hits hard enough to teach and no harder.',
  'bastion',
);

const THE_ROAD_OUT = chosenFight(
  STRAYED_HUNTER,
  'The road out',
  'Past the forest, where a hunter went too far and came back wrong. One fight, and it is not fair.',
  'forest-edge',
);

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

  async function goOut(run: RunState, area: Area, length: number): Promise<void> {
    if (busy) return;
    busy = true;

    const you = heroFrom(run);
    const rng = new Rng(run.dropSeed);
    const unowned = WEAPONS.filter((w) => !run.ownedWeaponIds.includes(w.id)).map((w) => w.id);
    const hunt = runHunt(you, area, length, rng.int(1, 2_000_000_000), unowned);

    mount.innerHTML = '';
    const stage = document.createElement('section');
    stage.className = 'stage';
    const arena = document.createElement('div');
    stage.append(arena);
    mount.append(stage);

    // One button outside the fight that ends the whole trip early.
    let skipAll = false;
    if (hunt.encounters.length > 1) {
      const skipHunt = document.createElement('button');
      skipHunt.className = 'ghost skip-hunt';
      skipHunt.type = 'button';
      skipHunt.textContent = 'Skip the rest';
      skipHunt.addEventListener('click', () => {
        skipAll = true;
        skipHunt.disabled = true;
      });
      stage.append(skipHunt);
    }

    let health = you.health;
    for (const [i, encounter] of hunt.encounters.entries()) {
      await playFight(
        arena,
        { ...you, health },
        encounter.combatants,
        encounter.result,
        {
          hero: figureFor(run.weaponId),
          foes: encounter.monsters.map((monster) => figureFor(monster.id)),
          scene: sceneFor(area.scene),
        },
        {
          place: area.name,
          note: length > 1 ? `${i + 1} of ${length}` : '',
        },
        () => skipAll,
      );
      health = encounter.result.heroHealth;
    }

    let next = addHaul(advanceDropSeed(run), hunt.kept);
    for (const encounter of hunt.encounters) {
      if (encounter.result.winner !== you.name) continue;
      for (const monster of encounter.monsters) next = recordDefeat(next, monster.id);
    }

    stage.append(outcome(hunt, you.name));
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
        <p class="aside">Anything else you carry, you will have to make or find out there.</p>
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
          ${stat('Armor', String(you.flatDamageReduction))}
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
        <h2>Go out</h2>
        <div class="length">
          <span class="length-label">How far</span>
          ${HUNT_LENGTHS.map(
            (
              length,
            ) => `<button class="length-choice ${length === run.huntLength ? 'selected' : ''}"
              data-length="${length}" type="button">${length} fights</button>`,
          ).join('')}
          <span class="length-note">Your wounds go with you. Fall and half of what you carry stays out there.</span>
        </div>
        <div class="hunts">
          ${AREAS.map((area) => areaCard(area, `${run.huntLength} fights`, run)).join('')}
          ${areaCard(THE_YARD, 'One fight', run)}
          ${areaCard(THE_ROAD_OUT, 'One fight', run)}
        </div>
      </section>

      <section class="panel">
        <h2>Tanner</h2>
        <div class="tanner">
          ${MATERIAL_LIST.map((material) => materialRow(material.id, run)).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Pack <span class="count">${run.backpack.length}</span></h2>
        ${
          run.backpack.length === 0
            ? '<p class="empty">Nothing yet. Make something, or take it off someone.</p>'
            : `<div class="items">${run.backpack.map(itemCard).join('')}</div>`
        }
      </section>
    `;

    bind('[data-length]', (button) => {
      const length = Number(button.dataset['length']) as HuntLength;
      commit(setHuntLength(run, length));
    });
    bind('[data-hunt]', (button) => {
      const id = button.dataset['hunt'];
      const area = [...AREAS, THE_YARD, THE_ROAD_OUT].find((candidate) => candidate.id === id);
      if (area === undefined) return;
      const length = AREAS.includes(area) ? run.huntLength : 1;
      void goOut(run, area, length);
    });
    bind('[data-craft]', (button) => {
      const slot = button.dataset['craft'] as (typeof CRAFTABLE_SLOTS)[number];
      const material = button.dataset['material'] as MaterialId;
      if (!canCraft(run, slot, material)) return;
      commit(advanceDropSeed(craft(run, slot, material, new Rng(run.dropSeed))));
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

function areaCard(area: Area, lengthNote: string, run: RunState): string {
  const faced = area.animals
    .concat(area.people)
    .map((spawn) => spawn.monster)
    .filter((monster) => run.defeated.includes(monster.id)).length;
  const known = area.animals.length + area.people.length;

  return `
    <button class="hunt" data-hunt="${area.id}" type="button">
      <span class="hunt-name">${escape(area.name)}</span>
      <span class="hunt-desc">${escape(area.description)}</span>
      <span class="hunt-note">${escape(lengthNote)} · ${faced === 0 ? 'nothing faced yet' : `${faced} of ${known} kinds faced`}</span>
    </button>
  `;
}

function materialRow(materialId: MaterialId, run: RunState): string {
  const material = MATERIAL_LIST.find((candidate) => candidate.id === materialId);
  if (material === undefined) return '';
  const have = run.materials[materialId] ?? 0;
  const source = MONSTERS.find((monster) => monster.material === materialId);

  return `
    <div class="material ${have === 0 ? 'none' : ''}">
      <div class="material-head">
        <p class="item-name">${escape(material.name)} <span class="count">×${have}</span></p>
        <p class="pitch">${escape(material.note)}${source === undefined ? '' : ` From the ${escape(source.name)}.`}</p>
      </div>
      <div class="craft-actions">
        ${CRAFTABLE_SLOTS.map((slot) => {
          const cost = craftCost(slot) ?? 0;
          const affordable = canCraft(run, slot, materialId);
          return `<button class="craft" data-craft="${slot}" data-material="${materialId}"
            type="button" ${affordable ? '' : 'disabled'}>
            <img class="icon small" src="${iconFor(slot)}" alt="" onerror="this.remove()" />
            <span>${label(slot)}</span><span class="cost">${cost}</span>
          </button>`;
        }).join('')}
      </div>
    </div>
  `;
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

function outcome(hunt: HuntResult, heroName: string): HTMLElement {
  const node = document.createElement('div');
  node.className = 'outcome';

  const last = hunt.encounters[hunt.encounters.length - 1];
  const spar = last?.monsters.every((monster) => monster.defeat === 'yields') ?? false;

  const headline = !hunt.survived ? 'You fell' : spar ? 'He calls it' : 'You came back';
  const line = !hunt.survived
    ? `${escape(last?.monsters[0]?.name ?? 'It')} was too much. You woke up inside the walls with half of what you carried.`
    : spar
      ? 'Oswald steps back and nods. That will do.'
      : `${hunt.encounters.length} ${hunt.encounters.length === 1 ? 'fight' : 'fights'}, and you walked home from the last one.`;

  node.innerHTML = `
    <h2>${headline}</h2>
    <p>${line}</p>
    <ol class="road">
      ${hunt.encounters.map((encounter) => `<li>${escape(encounterLine(encounter, heroName))}</li>`).join('')}
    </ol>
    ${haulMarkup(hunt.kept)}
    <button class="continue" type="button">Back to the bastion</button>
  `;
  return node;
}

function encounterLine(encounter: HuntResult['encounters'][number], heroName: string): string {
  const names = encounter.monsters.map((monster) => monster.name);
  const who =
    encounter.kind === 'ambush'
      ? `Ambushed by ${names.length}: ${names.join(', ')}`
      : (names[0] ?? '');
  const won = encounter.result.winner === heroName;
  const yielded = encounter.monsters.every((monster) => monster.defeat === 'yields');
  return `${who} — ${won ? (yielded ? 'yielded' : 'killed') : encounter.result.winner === null ? 'a standoff' : 'you fell'}`;
}

function haulMarkup(haul: Haul): string {
  const materials = Object.entries(haul.materials).filter(([, count]) => (count ?? 0) > 0);
  const weapons = haul.weaponIds
    .map((id) => WEAPONS.find((weapon) => weapon.id === id))
    .filter((weapon): weapon is Weapon => weapon !== undefined);

  if (materials.length === 0 && haul.items.length === 0 && weapons.length === 0) {
    return '<p class="empty">Nothing to carry back.</p>';
  }

  return `
    <div class="haul">
      ${materials
        .map(([id, count]) => {
          const material = MATERIAL_LIST.find((candidate) => candidate.id === id);
          return `<p class="haul-line">${escape(material?.name ?? id)} <strong>×${count}</strong></p>`;
        })
        .join('')}
      ${weapons
        .map(
          (weapon) => `<div class="item found weapon">
             <p class="slot-name">Taken from the body</p>
             <div class="item-head">
               ${icon(spriteFor(weapon.id))}
               <p class="item-name">${escape(weapon.name)}</p>
             </div>
             <p class="pitch">${escape(weapon.pitch)}</p>
           </div>`,
        )
        .join('')}
      ${haul.items
        .map(
          (item) => `<div class="item found">
             <div class="item-head">
               ${icon(iconFor(item.slot))}
               <p class="item-name">${escape(item.name)}</p>
             </div>
             <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
           </div>`,
        )
        .join('')}
    </div>
  `;
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

function label(position: EquipPosition | string): string {
  const slot = slotOf(position as EquipPosition);
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
