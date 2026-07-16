import type { Character } from './character';
import type { LifeEvent } from './events';
// ─── Store Slices ────────────────────────────────────────────────────────────

export interface PendingDecision {
  event: LifeEvent;
}

export interface GameState {
  character: Character | null;
  pendingDecision: PendingDecision | null;
  isProcessing: boolean;
  sessionAges: number;
  user: AppUser | null;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}
