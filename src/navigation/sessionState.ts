/**
 * Session-level (non-persisted) state for navigation decisions.
 * These values reset to their defaults every time the JS bundle loads (i.e. cold start).
 */

let _slotSelectedThisSession = false;
const _dismissedLegacyNudges = new Set<string>();

/** Call this once the user has explicitly picked or resumed a save slot. */
export function markSlotSelected(): void {
  _slotSelectedThisSession = true;
}

/** Returns true only after the user has selected a slot this session. */
export function hasSelectedSlotThisSession(): boolean {
  return _slotSelectedThisSession;
}

/** Resets the session flag (used internally or for testing). */
export function resetSessionState(): void {
  _slotSelectedThisSession = false;
}

/** Dismiss a legacy nudge type for the rest of this session. */
export function dismissLegacyNudge(nudgeType: string): void {
  _dismissedLegacyNudges.add(nudgeType);
}

/** Returns true if this nudge type has been dismissed this session. */
export function isLegacyNudgeDismissed(nudgeType: string): boolean {
  return _dismissedLegacyNudges.has(nudgeType);
}
