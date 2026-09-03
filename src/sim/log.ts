import type { CombatEvent, FightResult } from './types.ts';

/**
 * Turns a fight into something a human can read and argue with.
 *
 * This is a debugging and balancing tool, not the game's UI. Its job is to make
 * a wrong number obvious at a glance.
 */
export function formatFight(result: FightResult): string {
  const lines = result.events.map(formatEvent);

  lines.push('');
  lines.push(
    result.winner === null
      ? `DRAW — nobody could finish it (${result.durationSeconds.toFixed(2)}s)`
      : `WINNER: ${result.winner} (${result.durationSeconds.toFixed(2)}s)`,
  );

  return lines.join('\n');
}

function formatEvent(event: CombatEvent): string {
  const at = `[${event.at.toFixed(2).padStart(6)}s]`;

  switch (event.type) {
    case 'fight-start':
      return `${at} FIGHT  ${event.hero} vs ${event.monsters.join(' and ')}`;

    case 'attack': {
      const tags = [
        event.empowered ? 'EMPOWERED' : null,
        event.critical ? 'CRIT' : null,
        event.blocked ? 'BLOCKED' : null,
        event.unavoidable ? 'HEAVY' : null,
        event.snared ? 'SNARED' : null,
      ].filter((tag) => tag !== null);

      const banner = tags.length > 0 ? `${tags.join(' ')} ` : '';
      const health = `${event.defenderHealth}/${event.defenderMaxHealth}`;
      const absorbed = event.prevented > 0 ? ` (${event.prevented} absorbed)` : '';
      const drained = event.healed > 0 ? ` [+${event.healed} drained]` : '';

      return `${at} ${banner}${event.attacker} hits ${event.defender} for ${event.damage}${absorbed}${drained} -> ${health}`;
    }

    case 'resource':
      return `${at}      ${event.who} ${event.kind} ${Math.round(event.current)}/${event.threshold}`;

    case 'evade':
      return `${at}     ${event.defender} evades ${event.attacker}`;

    case 'defeat':
      return `${at}     ${event.who} ${event.style === 'yields' ? 'yields' : 'dies'}`;

    case 'timeout':
      return `${at} TIMEOUT`;
  }
}
