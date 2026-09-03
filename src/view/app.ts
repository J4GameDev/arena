import { AREAS } from '../data/areas.ts';
import { CRAFTABLE_SLOTS, MATERIAL_LIST } from '../data/materials.ts';
import { MONSTERS, OSWALD, STRAYED_HUNTER } from '../data/monsters.ts';
import { WEAPONS } from '../data/weapons.ts';
import { createHero } from '../sim/combatants.ts';
import {
  EAT_BELOW,
  HUNT_LENGTHS,
  RATION_HEAL,
  runHunt,
  type Haul,
  type HuntLength,
  type HuntResult,
} from '../sim/hunt.ts';
import { Rng } from '../sim/rng.ts';
import type {
  Area,
  Combatant,
  Item,
  MaterialId,
  Modifier,
  MonsterDefinition,
  Slot,
  Weapon,
} from '../sim/types.ts';
import {
  addHaul,
  advanceDropSeed,
  canCraft,
  cook,
  craft,
  craftCost,
  discardItem,
  equipItem,
  equippedItems,
  grantHuntersPack,
  HUNTERS_PACK,
  newRun,
  recordDefeat,
  setHuntLength,
  slotOf,
  spendRations,
  unequipItem,
  wieldWeapon,
  type EquipPosition,
  type RunState,
  type Sex,
} from '../state/run.ts';
import { clearRun, loadRun, saveRun } from '../state/storage.ts';
import {
  emptyIconFor,
  figureFor,
  handsFor,
  heroFigureFor,
  heroSpriteFor,
  iconFor,
  portraitFor,
  sceneFor,
  spriteFor,
  weaponIconFor,
} from './art.ts';
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
  'town',
);

const THE_ROAD_OUT = chosenFight(
  STRAYED_HUNTER,
  'The road out',
  'Past the forest, where a hunter went too far and came back wrong. One fight, and it is not fair.',
  'forest-edge',
);

/**
 * The opening, before there is a run to save: a title, the morning you come
 * of age, and Oswald handing over the choice.
 *
 * The player was born inside the wall. There is nowhere safe to have
 * arrived from, so nobody arrives: today is the first day the gate is open
 * for them, and the man waiting by the rack is the one who taught them to
 * set a snare. It is a scene, not a briefing — the player is shown the
 * place they have always known on the one morning it looks different, and
 * is told nothing the world cannot show them later. Nobody explains the
 * corruption. Somebody boils bones. Nothing here is a speech.
 */
type IntroStep = 'title' | 'body' | 'story' | 'meeting' | 'rack';

const STORY: readonly string[] = [
  'You were born inside this wall. Split logs, taller than two men, older than anyone who remembers them going up. You have never been past it. This morning, for the first time, the gate is open for you.',
  'The town smells the way it always has: woodsmoke, wet hide, somebody boiling bones. The same faces at the same doors. A few of them look at you differently today. A few look away.',
  'Past the wall the woods are still green. The elk still come down to the river at dusk. The hunters say that lately some of them look up when they hear you, and do not run. The hunters have been saying less, lately.',
  'Oswald taught you to set a snare when you were eight, and to keep quiet about it. He has been waiting by the rack since before you were up.',
];

/**
 * The town is the front door: the painting with the places you can go, and
 * under it the tabs about you. A place opens a panel over the painting;
 * closing it puts you back in the square. Nothing is on display that was
 * not asked for.
 */
type Tab = 'gear' | 'stats' | 'inventory';

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: 'gear', label: 'Gear' },
  { id: 'stats', label: 'Stats' },
  { id: 'inventory', label: 'Inventory' },
];

/** Somewhere in town you can walk to. The smithy is held back until it has a job. */
type Place = 'tanner' | 'cookfire' | 'oswald' | 'gate';

interface Spot {
  readonly id: Place;
  readonly label: string;
  /** Where on the painting the spot sits, as percentages of its width and height. */
  readonly x: number;
  readonly y: number;
}

const SPOTS: readonly Spot[] = [
  { id: 'tanner', label: 'Tanner', x: 14, y: 62 },
  { id: 'cookfire', label: 'Cookfire', x: 38, y: 74 },
  { id: 'oswald', label: 'Oswald', x: 78, y: 66 },
  { id: 'gate', label: 'Hunt', x: 55, y: 55 },
];

/**
 * The gear table's cells: the two hands, then every wearable position. Laid
 * out in the shape of a body, the way the old MMOs did it: head on top, the
 * hands either side of the torso, trinkets beside the legs, feet at the
 * bottom. The order here is reading order; the stylesheet places each cell
 * by name.
 */
type GearCell = 'leftHand' | 'rightHand' | EquipPosition;

const GEAR_CELLS: readonly GearCell[] = [
  'head',
  'rightHand',
  'torso',
  'leftHand',
  'necklace',
  'ring1',
  'legs',
  'ring2',
  'hands',
  'feet',
];

export function start(mount: HTMLElement): void {
  let state: RunState | null = loadRun();
  let busy = false;

  // Screen state, not run state: forgotten on reload, never saved.
  let tab: Tab = 'gear';
  let openCell: GearCell | null = null;
  let place: Place | null = null;
  let intro: IntroStep = 'title';
  let beat = 0;
  let sex: Sex = 'male';
  /** Start over asks twice, in the page. Browser pop-ups get swallowed by some viewers. */
  let confirmingRestart = false;

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
    const hunt = runHunt(you, area, length, rng.int(1, 2_000_000_000), unowned, run.rations);

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
          hero: heroFigureFor(run.weaponId, run.sex),
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

    let next = spendRations(addHaul(advanceDropSeed(run), hunt.kept), hunt.rationsEaten);
    for (const encounter of hunt.encounters) {
      if (encounter.result.winner !== you.name) continue;
      for (const monster of encounter.monsters) next = recordDefeat(next, monster.id);
    }

    // The first time Oswald yields, he hands over the Hunter's Pack.
    const packNow = area === THE_YARD && hunt.survived && !run.packGiven;
    if (packNow) next = grantHuntersPack(next);

    stage.append(outcome(hunt, you.name, packNow, run.sex));
    stage.querySelector('.continue')?.addEventListener('click', () => {
      busy = false;
      place = null;
      commit(next);
    });

    state = next;
    saveRun(state);
  }

  function renderIntro(): void {
    if (intro === 'title') {
      mount.innerHTML = `
        <section class="title-screen">
          <h1 class="title">Farther</h1>
          <p class="tagline">There is still green out there. Bring some of it home.</p>
          <button class="begin" data-begin type="button">Begin</button>
        </section>
      `;
      bind('[data-begin]', () => {
        intro = 'body';
        render();
      });
      return;
    }

    if (intro === 'body') {
      // Who you are, before what you carry. Art only; it changes no number.
      mount.innerHTML = `
        <section class="rack">
          <p class="speaker-name">Who you are</p>
          <div class="choices">
            <button class="choice body-choice" data-sex="male" type="button">
              <img class="portrait" src="${spriteFor('base-male')}" alt="" onerror="this.remove()" />
              <span class="choice-name">A man</span>
            </button>
            <button class="choice body-choice" data-sex="female" type="button">
              <img class="portrait" src="${spriteFor('base-female')}" alt="" onerror="this.remove()" />
              <span class="choice-name">A woman</span>
            </button>
          </div>
        </section>
      `;
      bind('[data-sex]', (button) => {
        sex = button.dataset['sex'] as Sex;
        intro = 'story';
        beat = 0;
        render();
      });
      return;
    }

    if (intro === 'story') {
      const line = STORY[beat] ?? '';
      const last = beat >= STORY.length - 1;
      mount.innerHTML = `
        <section class="story">
          <p class="story-line">${escape(line)}</p>
          <div class="story-actions">
            <button data-next type="button">${last ? 'Go on' : 'Next'}</button>
            ${last ? '' : '<button class="ghost" data-skip type="button">Skip</button>'}
          </div>
          <p class="story-count">${beat + 1} / ${STORY.length}</p>
        </section>
      `;
      bind('[data-next]', () => {
        if (last) intro = 'meeting';
        else beat += 1;
        render();
      });
      bind('[data-skip]', () => {
        intro = 'meeting';
        render();
      });
      return;
    }

    if (intro === 'meeting') {
      // Oswald, the old way: his face top left, the words starting beside it
      // and opening up underneath once they clear it.
      mount.innerHTML = `
        <section class="meeting dialog">
          <img class="face" src="${portraitFor(OSWALD.id)}" alt="" onerror="this.remove()" />
          <p class="speaker-name">Oswald</p>
          <p class="speech">He looks the way he always has: gray in the beard, the scar through one eyebrow, hands that never seem to be doing nothing. Today he looks at you a little longer than usual.</p>
          <p class="speech quote">${escape(`"So. Today."`)}</p>
          <p class="speech">He does not look up from the snare he is mending.</p>
          <p class="speech quote">${escape(`"Plenty of people told you not to. I know, because they told me too. I'll tell you what I told them: better you learn this from me than from the woods."`)}</p>
          <p class="speech">He nods at the rack.</p>
          <p class="speech quote">${escape(`"Pick one. Whichever sits right in your hands. You'll carry it from here on, so take your time. Then meet me in the yard and show me what I taught you."`)}</p>
          <div class="story-actions">
            <button data-rack type="button">Go to the rack</button>
          </div>
        </section>
      `;
      bind('[data-rack]', () => {
        intro = 'rack';
        render();
      });
      return;
    }

    // The rack: the only choice the game makes for you, and nothing else on the screen.
    mount.innerHTML = `
      <section class="rack">
        <p class="speaker-name">The rack</p>
        <p class="speech">Five things on it worth taking. Everything else is rope.</p>
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
        <p class="aside">Once it is in your hands, he will want to see what you remember.</p>
      </section>
    `;

    bind('.choice', (button) => {
      const run = newRun(button.dataset['weapon'] ?? '', sex);
      state = run;
      saveRun(run);
      // No camp yet. The first thing you do with a weapon is show him.
      void goOut(run, THE_YARD, 1);
    });
  }

  function render(): void {
    const run = state;
    if (run === null) {
      renderIntro();
      return;
    }

    const you = heroFrom(run);
    const weapon = weaponById(run.weaponId);

    mount.innerHTML = `
      <header class="top town-bar">
        <div class="hero-words">
          <h1>The town</h1>
          <p class="sub">${escape(weapon.name)} · ${escape(weapon.archetype)}</p>
        </div>
        ${
          confirmingRestart
            ? `<span class="restart-ask">
                 <span>Lose this hunter and everything in the stores?</span>
                 <button class="restart-yes" data-restart-yes type="button">Start over</button>
                 <button class="ghost" data-restart-no type="button">Keep going</button>
               </span>`
            : `<button class="ghost restart" data-restart type="button">Start over</button>`
        }
      </header>

      <section class="town" style="--scene: url('${sceneFor('town')}')">
        <img class="townsfolk you" src="${heroSpriteFor(run.weaponId, run.sex)}" alt="" onerror="this.remove()" />
        ${SPOTS.map(
          (
            spot,
          ) => `<button class="spot ${spot.id === place ? 'open' : ''}" data-place="${spot.id}" type="button"
            style="left: ${spot.x}%; top: ${spot.y}%">${spot.label}</button>`,
        ).join('')}
        ${place === null ? '' : `<div class="place-panel">${placePanel(place, run)}</div>`}
      </section>

      <nav class="tabs">
        ${TABS.map(
          (candidate) =>
            `<button class="tab ${candidate.id === tab ? 'selected' : ''}" data-tab="${candidate.id}" type="button">${candidate.label}</button>`,
        ).join('')}
      </nav>

      ${tab === 'gear' ? gearTab(run) : tab === 'stats' ? statsTab(you) : inventoryTab(run)}
    `;

    bind('[data-place]', (button) => {
      const next = button.dataset['place'] as Place;
      place = place === next ? null : next;
      render();
    });
    bind('[data-close-place]', () => {
      place = null;
      render();
    });

    bind('[data-tab]', (button) => {
      tab = button.dataset['tab'] as Tab;
      render();
    });
    bind('[data-restart]', () => {
      confirmingRestart = true;
      render();
    });
    bind('[data-restart-no]', () => {
      confirmingRestart = false;
      render();
    });
    bind('[data-restart-yes]', () => {
      // The one destructive button in the game, and it asked first.
      confirmingRestart = false;
      clearRun();
      state = null;
      intro = 'title';
      beat = 0;
      tab = 'gear';
      openCell = null;
      render();
    });
    bind('[data-cell]', (button) => {
      const cell = button.dataset['cell'] as GearCell;
      openCell = openCell === cell ? null : cell;
      render();
    });
    bind('[data-length]', (button) => {
      const length = Number(button.dataset['length']) as HuntLength;
      commit(setHuntLength(run, length));
    });
    bind('[data-hunt]', (button) => {
      const id = button.dataset['hunt'];
      // The yard is not here on purpose: the spar happens once, in the opening.
      const area = [...AREAS, THE_ROAD_OUT].find((candidate) => candidate.id === id);
      if (area === undefined) return;
      const length = AREAS.includes(area) ? run.huntLength : 1;
      void goOut(run, area, length);
    });
    bind('[data-cook]', (button) => {
      const count = button.dataset['cook'] === 'all' ? run.meat : 1;
      commit(cook(run, count));
    });
    bind('[data-craft]', (button) => {
      const slot = button.dataset['craft'] as (typeof CRAFTABLE_SLOTS)[number];
      const material = button.dataset['material'] as MaterialId;
      if (!canCraft(run, slot, material)) return;
      commit(advanceDropSeed(craft(run, slot, material, new Rng(run.dropSeed))));
    });
    bind('[data-equip]', (button) => {
      const item = run.backpack.find((candidate) => candidate.id === button.dataset['equip']);
      if (item === undefined) return;
      // From the gear table, the item goes into the slot that is open.
      const position =
        openCell !== null && !isHand(openCell) && slotOf(openCell) === item.slot
          ? openCell
          : positionFor(item, run);
      commit(equipItem(run, item, position));
    });
    bind('[data-discard]', (button) => commit(discardItem(run, button.dataset['discard'] ?? '')));
    bind('[data-unequip]', (button) =>
      commit(unequipItem(run, button.dataset['unequip'] as EquipPosition)),
    );
    bind('[data-wield]', (button) => commit(wieldWeapon(run, button.dataset['wield'] ?? '')));
  }

  function gearTab(run: RunState): string {
    return `
      <section class="panel">
        <h2>Worn</h2>
        <div class="doll">
          ${GEAR_CELLS.map((cell) => gearCell(cell, run, cell === openCell)).join('')}
        </div>
        ${openCell === null ? '<p class="aside">Pick a slot to see what you could put there.</p>' : picker(openCell, run)}
      </section>
    `;
  }

  function statsTab(you: Combatant): string {
    return `
      <section class="panel">
        <h2>You</h2>
        <ul class="stats">
          ${stat('Health', String(you.maxHealth))}
          ${stat('Damage', String(Math.round(you.attack.damage)))}
          ${stat('Attacks / sec', you.attack.attacksPerSecond.toFixed(2))}
          ${stat('Armor', String(you.flatDamageReduction))}
          ${stat('Damage reduction', percent(you.percentDamageReduction))}
          ${stat('Evasion', percent(you.evasion))}
          ${stat('Block', percent(you.blockChance))}
          ${stat('Crit', percent(you.critChance))}
          ${stat('Lifesteal', percent(you.lifesteal))}
          ${stat('Initiative', percent(you.initiative))}
        </ul>
      </section>
    `;
  }

  /** What opens over the painting when you walk somewhere. */
  function placePanel(which: Place, run: RunState): string {
    const close =
      '<button class="ghost close-place" data-close-place type="button">Back to the square</button>';
    switch (which) {
      case 'gate':
        return `${outPanel(run)}${close}`;
      case 'tanner':
        return `${tannerPanel(run)}${close}`;
      case 'cookfire':
        return `${cookfirePanel(run)}${close}`;
      case 'oswald':
        return `${oswaldPanel(run)}${close}`;
    }
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

// --- Gear ---

function isHand(cell: GearCell): cell is 'leftHand' | 'rightHand' {
  return cell === 'leftHand' || cell === 'rightHand';
}

function gearCell(cell: GearCell, run: RunState, open: boolean): string {
  if (isHand(cell)) {
    const weapon = WEAPONS.find((candidate) => candidate.id === run.weaponId);
    const held = cell === 'leftHand' ? handsFor(run.weaponId).left : handsFor(run.weaponId).right;
    const label = cell === 'leftHand' ? 'Left hand' : 'Right hand';
    if (held === null) {
      return `
        <button class="cell empty ${open ? 'open' : ''}" data-cell="${cell}" type="button" style="grid-area: ${cell}">
          <span class="icon blank"></span>
          <span class="cell-label">${label}</span>
          <span class="cell-name">—</span>
        </button>
      `;
    }
    return `
      <button class="cell filled ${open ? 'open' : ''}" data-cell="${cell}" type="button" style="grid-area: ${cell}">
        ${icon(weaponIconFor(held))}
        <span class="cell-label">${label}</span>
        <span class="cell-name">${escape(weapon?.name ?? '')}</span>
      </button>
    `;
  }

  const item = run.equipped[cell];
  const slot = slotOf(cell);
  if (item === undefined) {
    return `
      <button class="cell empty ${open ? 'open' : ''}" data-cell="${cell}" type="button" style="grid-area: ${cell}">
        ${icon(emptyIconFor(slot))}
        <span class="cell-label">${label(cell)}</span>
        <span class="cell-name">—</span>
      </button>
    `;
  }
  return `
    <button class="cell filled ${open ? 'open' : ''}" data-cell="${cell}" type="button" style="grid-area: ${cell}">
      ${icon(iconFor(slot))}
      <span class="cell-label">${label(cell)}</span>
      <span class="cell-name">${escape(item.name)}</span>
    </button>
  `;
}

/** What you own for one slot: what is on, then what is in the pack. */
function picker(cell: GearCell, run: RunState): string {
  if (isHand(cell)) {
    return `
      <div class="picker">
        <h3>Arms</h3>
        <div class="items">
          ${run.ownedWeaponIds
            .map((id) => WEAPONS.find((candidate) => candidate.id === id))
            .filter((weapon): weapon is Weapon => weapon !== undefined)
            .map((weapon) => weaponCard(weapon, weapon.id === run.weaponId, run.sex))
            .join('')}
        </div>
        ${run.ownedWeaponIds.length === 1 ? '<p class="aside">Other weapons have to be taken off someone.</p>' : ''}
      </div>
    `;
  }

  const slot = slotOf(cell);
  const worn = run.equipped[cell];
  const spare = run.backpack.filter((item) => item.slot === slot);
  const source = CRAFTABLE_SLOTS.includes(slot)
    ? 'The tanner makes these from hide.'
    : 'These come off people. Nobody makes them.';

  return `
    <div class="picker">
      <h3>${label(cell)}</h3>
      <div class="items">
        ${worn === undefined ? '' : itemCard(worn, { worn: cell })}
        ${spare.map((item) => itemCard(item, { worn: null })).join('')}
      </div>
      ${
        worn === undefined && spare.length === 0
          ? `<p class="aside">Nothing for this slot yet. ${source}</p>`
          : ''
      }
    </div>
  `;
}

function weaponCard(weapon: Weapon, inHand: boolean, sex: Sex): string {
  return `
    <div class="item ${inHand ? 'in-hand' : ''}">
      <div class="item-head">
        ${icon(heroSpriteFor(weapon.id, sex))}
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

/** An item card. `worn` names the position it is in, or null if it is in the pack. */
function itemCard(item: Item, where: { readonly worn: EquipPosition | null }): string {
  return `
    <div class="item ${where.worn === null ? '' : 'in-hand'}">
      <div class="item-head">
        ${icon(iconFor(item.slot))}
        <div>
          <p class="item-name">${escape(item.name)}</p>
          ${where.worn === null ? '' : '<p class="in-hand-note">Worn</p>'}
        </div>
      </div>
      <ul class="affixes">${item.modifiers.map(affixLine).join('')}</ul>
      <div class="item-actions">
        ${
          where.worn === null
            ? `<button data-equip="${item.id}" type="button">Wear</button>
               <button class="ghost" data-discard="${item.id}" type="button">Discard</button>`
            : `<button class="ghost" data-unequip="${where.worn}" type="button">Remove</button>`
        }
      </div>
    </div>
  `;
}

// --- The gate ---

function outPanel(run: RunState): string {
  return `
    <section class="panel">
      <h2>Hunt</h2>
      <p class="provisions">${provisionsLine(run)}</p>
      <div class="length">
        <span class="length-label">How far</span>
        ${HUNT_LENGTHS.map(
          (length) => `<button class="length-choice ${length === run.huntLength ? 'selected' : ''}"
            data-length="${length}" type="button">${length} fights</button>`,
        ).join('')}
        <span class="length-note">Your wounds go with you. Fall and half of what you carry stays out there.</span>
      </div>
      <div class="hunts">
        ${AREAS.map((area) => areaCard(area, `${run.huntLength} fights`, run)).join('')}
        ${areaCard(THE_ROAD_OUT, 'One fight', run)}
      </div>
    </section>
  `;
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

function provisionsLine(run: RunState): string {
  if (run.rations === 0) {
    return 'No rations. Whatever you lose out there, you carry to the end.';
  }
  return `You carry ${run.rations} ${run.rations === 1 ? 'ration' : 'rations'}. You eat one whenever a fight leaves you under ${Math.round(EAT_BELOW * 100)}% health.`;
}

// --- The cookfire and the tanner ---

function cookfirePanel(run: RunState): string {
  return `
    <section class="panel">
      <h2>Cookfire</h2>
      <div class="cookfire">
        <p class="item-name">Meat <span class="count">×${run.meat}</span> · Rations <span class="count">×${run.rations}</span></p>
        <p class="pitch">Meat keeps a day. Cook it here and it keeps for the road: one meat, one ration, ${RATION_HEAL} health back when you need it.</p>
        <div class="item-actions">
          <button data-cook="1" type="button" ${run.meat > 0 ? '' : 'disabled'}>Cook one</button>
          <button data-cook="all" type="button" ${run.meat > 0 ? '' : 'disabled'}>Cook all</button>
        </div>
      </div>
    </section>
  `;
}

function tannerPanel(run: RunState): string {
  return `
    <section class="panel">
      <h2>Tanner</h2>
      <div class="tanner">
        ${MATERIAL_LIST.map((material) => materialRow(material.id, run)).join('')}
      </div>
    </section>
  `;
}

function materialRow(materialId: MaterialId, run: RunState): string {
  const material = MATERIAL_LIST.find((candidate) => candidate.id === materialId);
  if (material === undefined) return '';
  const have = run.materials[materialId] ?? 0;

  return `
    <div class="material ${have === 0 ? 'none' : ''}">
      <div class="material-head">
        <p class="item-name">${escape(material.name)} <span class="count">×${have}</span></p>
        <p class="pitch">${escape(material.note)}</p>
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

// --- Oswald ---

/** A line for where you are. He does not repeat himself much. */
function oswaldPanel(run: RunState): string {
  const kills = run.defeated.filter((id) => id !== OSWALD.id).length;
  const line =
    kills === 0
      ? 'You have the pack. The forest is through the gate. Three fights is a morning; ten is a day you might not finish. Start with the morning.'
      : run.defeated.includes(STRAYED_HUNTER.id)
        ? 'You came back from him. Most do not. What is past him is worse, and it is where the hides are worth something.'
        : kills < 8
          ? 'Cook what you bring back before you go out again. Meat does not keep and neither do you.'
          : 'The one on the road out is a man who went too far. When you can walk five fights and come home with all of it, you are ready for him. Not before.';

  return `
    <section class="panel meeting dialog">
      <img class="face" src="${portraitFor(OSWALD.id)}" alt="" onerror="this.remove()" />
      <p class="speaker-name">Oswald</p>
      <p class="speech quote">${escape(`"${line}"`)}</p>
    </section>
  `;
}

// --- Inventory ---

function inventoryTab(run: RunState): string {
  const spare = run.backpack;
  return `
    <section class="panel">
      <h2>Provisions</h2>
      <ul class="stores">
        <li><span>Rations</span><strong>${run.rations}</strong></li>
        <li><span>Meat</span><strong>${run.meat}</strong></li>
      </ul>
    </section>

    <section class="panel">
      <h2>Hides</h2>
      <ul class="stores">
        ${MATERIAL_LIST.map((material) => {
          const source = MONSTERS.find((monster) => monster.material === material.id);
          return `<li>
            <span>${escape(material.name)} <em>${source === undefined ? '' : `from the ${escape(source.name)}`}</em></span>
            <strong>${run.materials[material.id] ?? 0}</strong>
          </li>`;
        }).join('')}
      </ul>
    </section>

    <section class="panel">
      <h2>Pack <span class="count">${spare.length}</span></h2>
      ${
        spare.length === 0
          ? '<p class="empty">Nothing spare. Everything you own is on you.</p>'
          : `<div class="items">${spare.map((item) => itemCard(item, { worn: null })).join('')}</div>`
      }
    </section>
  `;
}

// --- Coming home ---

function outcome(hunt: HuntResult, heroName: string, packGiven: boolean, sex: Sex): HTMLElement {
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

  // The premise, said once, by the one person who would say it. The game is
  // named for this sentence.
  const lesson = packGiven
    ? `<p class="lesson">He looks past you, at the gate. &ldquo;The farther out you go, the stranger it gets. The animals first. Then the people. Farther still and I could not tell you. What you bring back is worth more out there. So are you. Go as far as you can walk home from, and not a step more.&rdquo;</p>`
    : '';

  node.innerHTML = `
    <h2>${headline}</h2>
    <p>${line}</p>
    ${lesson}
    <ol class="road">
      ${hunt.encounters.map((encounter) => `<li>${escape(encounterLine(encounter, heroName))}</li>`).join('')}
    </ol>
    ${
      hunt.rationsEaten > 0
        ? `<p class="aside">Ate ${hunt.rationsEaten} ${hunt.rationsEaten === 1 ? 'ration' : 'rations'} on the way.</p>`
        : ''
    }
    ${
      packGiven
        ? `<div class="item found">
             <p class="slot-name">From Oswald</p>
             <p class="item-name">A Hunter's Pack</p>
             <p class="pitch">${HUNTERS_PACK.rations} rations, ${HUNTERS_PACK.materials['boar-hide']} boar hide, ${HUNTERS_PACK.materials['wolf-pelt']} wolf pelt. He does not make a speech about it.</p>
           </div>`
        : ''
    }
    ${haulMarkup(hunt.kept, sex)}
    <button class="continue" type="button">Back to town</button>
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

function haulMarkup(haul: Haul, sex: Sex): string {
  const materials = Object.entries(haul.materials).filter(([, count]) => (count ?? 0) > 0);
  const weapons = haul.weaponIds
    .map((id) => WEAPONS.find((weapon) => weapon.id === id))
    .filter((weapon): weapon is Weapon => weapon !== undefined);

  if (
    materials.length === 0 &&
    haul.meat === 0 &&
    haul.items.length === 0 &&
    weapons.length === 0
  ) {
    return '<p class="empty">Nothing to carry back.</p>';
  }

  return `
    <div class="haul">
      ${haul.meat > 0 ? `<p class="haul-line">Meat <strong>×${haul.meat}</strong></p>` : ''}
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
               ${icon(heroSpriteFor(weapon.id, sex))}
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

// --- Bits ---

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

function label(position: EquipPosition | Slot): string {
  const slot = slotOf(position as EquipPosition);
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
