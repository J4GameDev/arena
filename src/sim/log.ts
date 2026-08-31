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
      return `${at} FIGHT  ${event.hero} vs ${event.monster}`;

    case 'attack': {
      const mark = event.empowered ? '**' : '  ';
      const health = `${event.defenderHealth}/${event.defenderMaxHealth}`;
      const absorbed = event.prevented > 0 ? ` (${event.prevented} absorbed)` : '';
      return `${at} ${mark} ${event.attacker} hits ${event.defender} for ${event.damage}${absorbed} -> ${health}`;
    }

    case 'resource':
      return `${at}      ${event.who} ${event.kind} ${Math.round(event.current)}/${event.threshold}`;

    case 'evade':
      return `${at}     ${event.defender} evades ${event.attacker}`;

    case 'death':
      return `${at}     ${event.who} dies`;

    case 'timeout':
      return `${at} TIMEOUT`;
  }
}
