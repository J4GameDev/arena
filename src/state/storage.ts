import type { RunState } from './run.ts';

const STORAGE_KEY = 'arena.run';

/**
 * Bumped whenever the saved shape changes incompatibly. An old save is
 * discarded rather than migrated — there is nothing in it yet worth rescuing,
 * and silently loading a half-understood save is worse than starting over.
 */
const SAVE_VERSION = 2;

interface SaveEnvelope {
  readonly version: number;
  readonly state: RunState;
}

/**
 * Persistence is deliberately forgiving. A browser can refuse localStorage
 * outright (private windows, blocked site data), and a game that crashes on
 * load because storage is unavailable is worse than one that forgets.
 */
export function saveRun(state: RunState): void {
  try {
    const envelope: SaveEnvelope = { version: SAVE_VERSION, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage unavailable or full. Play continues; progress just will not keep.
  }
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const envelope = JSON.parse(raw) as Partial<SaveEnvelope>;
    if (envelope.version !== SAVE_VERSION || envelope.state === undefined) return null;

    return envelope.state;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — the save is already effectively gone.
  }
}
