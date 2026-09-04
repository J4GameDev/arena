import type { RunState } from './run.ts';

const STORAGE_KEY = 'arena.run';

/**
 * Bumped whenever the saved shape changes. A save one step behind is walked
 * forward by `migrateSave`; anything older than the migrations know is
 * discarded, because silently loading a half-understood save is worse than
 * starting over. The game is live, so a shape change without a migration
 * wipes real progress — write the step.
 */
const SAVE_VERSION = 7;

interface SaveEnvelope {
  readonly version: number;
  readonly state: RunState;
}

/**
 * Bring a save up to the current version, one step at a time, or return null
 * if it is older than the steps go back.
 *
 *   6 → 7  The second ring came back (4 Sep 2026): the one ring position
 *          `ring` became `ring1`, and `ring2` starts empty.
 */
export function migrateSave(envelope: Partial<SaveEnvelope>): RunState | null {
  if (typeof envelope.version !== 'number' || envelope.state === undefined) return null;

  let version = envelope.version;
  let state: Record<string, unknown> = { ...envelope.state };

  if (version === 6) {
    const equipped = { ...((state['equipped'] as Record<string, unknown> | undefined) ?? {}) };
    const ring = equipped['ring'];
    delete equipped['ring'];
    if (ring !== undefined) equipped['ring1'] = ring;
    state = { ...state, equipped };
    version = 7;
  }

  return version === SAVE_VERSION ? (state as unknown as RunState) : null;
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

    return migrateSave(JSON.parse(raw) as Partial<SaveEnvelope>);
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
