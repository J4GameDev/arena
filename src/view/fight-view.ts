import type { Combatant, CombatEvent, FightResult } from '../sim/types.ts';

/**
 * Plays a finished fight back to the player.
 *
 * The fight is already fully resolved before anything is drawn — this reads the
 * event list and animates it. It computes nothing. If a number is wrong on
 * screen it is wrong in the simulation, which is exactly the property the
 * sim/view split was built for.
 */

/** Faster than real time. Fights run 6-12 seconds and that is a long stare. */
const PLAYBACK_SPEED = 1.8;

/** Playback resolution. Bars carry their own CSS transition, so this is plenty. */
const TICK_MS = 50;

interface Side {
  readonly root: HTMLElement;
  readonly healthFill: HTMLElement;
  readonly healthText: HTMLElement;
  readonly meterFill: HTMLElement | null;
  readonly meterText: HTMLElement | null;
  readonly floaters: HTMLElement;
  readonly maxHealth: number;
}

export function playFight(
  mount: HTMLElement,
  hero: Combatant,
  monster: Combatant,
  result: FightResult,
): Promise<void> {
  mount.innerHTML = `
    <div class="fight">
      <div class="combatants">
        ${sideMarkup('hero', hero)}
        ${sideMarkup('foe', monster)}
      </div>
      <ol class="log" aria-live="polite"></ol>
      <button class="skip" type="button">Skip</button>
    </div>
  `;

  const sides = new Map<string, Side>([
    [hero.name, readSide(mount, 'hero', hero)],
    [monster.name, readSide(mount, 'foe', monster)],
  ]);
  const log = must<HTMLOListElement>(mount, '.log');
  const skip = must<HTMLButtonElement>(mount, '.skip');

  return new Promise((resolve) => {
    let index = 0;
    let finished = false;

    const applyThrough = (upTo: number): void => {
      while (index < result.events.length) {
        const event = result.events[index];
        if (event === undefined || event.at > upTo) break;
        apply(event, sides, log);
        index += 1;
      }
    };

    const startedAt = performance.now();

    // Driven by a timer against the wall clock rather than by animation frames.
    // requestAnimationFrame stops firing entirely in a tab that is not visible,
    // which froze fights permanently the moment a player switched tabs. A timer
    // is throttled when hidden but never stops, so the fight always finishes.
    const timer = setInterval(() => {
      const clock = ((performance.now() - startedAt) / 1000) * PLAYBACK_SPEED;
      applyThrough(clock);
      if (index >= result.events.length) finish();
    }, TICK_MS);

    function finish(): void {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      skip.disabled = true;
      resolve();
    }

    skip.addEventListener('click', () => {
      applyThrough(Number.POSITIVE_INFINITY);
      finish();
    });
  });
}

function apply(event: CombatEvent, sides: Map<string, Side>, log: HTMLOListElement): void {
  switch (event.type) {
    case 'attack': {
      const defender = sides.get(event.defender);
      if (defender !== undefined) {
        setHealth(defender, event.defenderHealth);
        const tags = [
          event.critical ? 'crit' : null,
          event.empowered ? 'empowered' : null,
          event.blocked ? 'blocked' : null,
        ].filter((tag) => tag !== null);
        float(defender, `-${event.damage}`, tags);
      }

      const attacker = sides.get(event.attacker);
      if (attacker !== undefined && event.healed > 0) {
        float(attacker, `+${event.healed}`, ['heal']);
      }

      const flourish = event.empowered
        ? ' — unleashed'
        : event.critical
          ? ' — a lucky blow'
          : event.blocked
            ? ' — turned aside'
            : '';
      write(log, `${event.attacker} hits ${event.defender} for ${event.damage}${flourish}`);
      break;
    }

    case 'resource': {
      const side = sides.get(event.who);
      if (side !== undefined) setMeter(side, event.current, event.threshold, event.kind);
      break;
    }

    case 'evade':
      float(sides.get(event.defender), 'miss', ['evade']);
      write(log, `${event.defender} slips aside`);
      break;

    case 'defeat':
      write(log, `${event.who} ${event.style === 'yields' ? 'yields' : 'falls'}`, 'final');
      break;

    case 'timeout':
      write(log, 'Neither of you can finish this', 'final');
      break;

    case 'fight-start':
      break;
  }
}

function sideMarkup(kind: 'hero' | 'foe', combatant: Combatant): string {
  const meter =
    combatant.resource === null
      ? ''
      : `<div class="bar meter"><span class="fill"></span></div>
         <p class="meter-text"></p>`;

  return `
    <div class="side ${kind}">
      <p class="side-name">${escape(combatant.name)}</p>
      <div class="bar health"><span class="fill"></span></div>
      <p class="health-text">${combatant.health}/${combatant.maxHealth}</p>
      ${meter}
      <div class="floaters"></div>
    </div>
  `;
}

function readSide(mount: HTMLElement, kind: 'hero' | 'foe', combatant: Combatant): Side {
  const root = must<HTMLElement>(mount, `.side.${kind}`);
  return {
    root,
    healthFill: must<HTMLElement>(root, '.health .fill'),
    healthText: must<HTMLElement>(root, '.health-text'),
    meterFill: root.querySelector<HTMLElement>('.meter .fill'),
    meterText: root.querySelector<HTMLElement>('.meter-text'),
    floaters: must<HTMLElement>(root, '.floaters'),
    maxHealth: combatant.maxHealth,
  };
}

function setHealth(side: Side, health: number): void {
  const share = Math.max(0, health / side.maxHealth);
  side.healthFill.style.width = `${share * 100}%`;
  side.healthText.textContent = `${health}/${side.maxHealth}`;
  side.root.classList.toggle('hurt', share < 0.35);
}

function setMeter(side: Side, current: number, threshold: number, kind: string): void {
  if (side.meterFill === null || side.meterText === null) return;
  const share = Math.min(1, current / threshold);
  side.meterFill.style.width = `${share * 100}%`;
  side.meterText.textContent = `${kind} ${Math.round(current)}/${threshold}`;
  side.root.classList.toggle('charged', share >= 1);
}

/** Fans successive numbers out so a flurry of hits does not stack into a smudge. */
const FLOATER_OFFSETS = [0, 1.4, -1.2, 2.6, -2.4, 0.8];
let floaterIndex = 0;

/** Long enough for the 900ms animation, short enough to never look stuck. */
const FLOATER_LIFETIME_MS = 1400;

function float(side: Side | undefined, text: string, tags: readonly string[]): void {
  if (side === undefined) return;

  const node = document.createElement('span');
  node.className = ['floater', ...tags].join(' ');
  node.textContent = text;

  // Offsets `right` rather than `transform`, which the rise animation owns.
  const offset = FLOATER_OFFSETS[floaterIndex % FLOATER_OFFSETS.length] ?? 0;
  floaterIndex += 1;
  node.style.right = `${1 + offset}rem`;

  side.floaters.append(node);

  // animationend alone is not enough: a backgrounded tab may never run the
  // animation, and every un-removed node leaks for the life of the page.
  const remove = (): void => node.remove();
  node.addEventListener('animationend', remove);
  setTimeout(remove, FLOATER_LIFETIME_MS);
}

function write(log: HTMLOListElement, text: string, className = ''): void {
  const line = document.createElement('li');
  if (className !== '') line.className = className;
  line.textContent = text;
  log.append(line);
  log.scrollTop = log.scrollHeight;
}

function must<T extends Element>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (found === null) throw new Error(`Missing element: ${selector}`);
  return found;
}

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}
