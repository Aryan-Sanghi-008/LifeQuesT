import type { AppUser, Character, RootStackParamList } from '../types';
import { hasSelectedSlotThisSession } from './sessionState';

export interface GameNavState {
  user: AppUser | null;
  character: Character | null;
  pendingReincarnation: boolean;
}

export interface BootstrapNavState extends GameNavState {
  onboardingComplete: boolean;
  ageGateVerified: boolean;
}

export function resolveRootRoute(state: BootstrapNavState): keyof RootStackParamList {
  // Existing players skip first-run flows
  if (!state.user) {
    if (!state.onboardingComplete) return 'Onboarding';
    if (!state.ageGateVerified) return 'AgeGate';
    return 'Auth';
  }
  if (!state.character) {
    return state.pendingReincarnation ? 'CharacterCreate' : 'SaveSlots';
  }
  if (!state.character.isAlive) return 'Death';
  // On cold start (slot not yet selected this session) always show SaveSlots
  // so the user can choose which life to continue or create a new one.
  if (!hasSelectedSlotThisSession()) return 'SaveSlots';
  return 'MainTabs';
}

export function needsAspirationRoute(state: GameNavState & { pendingAspirationPicker?: boolean }): boolean {
  return Boolean(state.character?.isAlive && state.pendingAspirationPicker);
}

export function needsCollegeMajorRoute(
  state: GameNavState & { pendingCollegeMajorPicker?: boolean },
): boolean {
  return Boolean(state.character?.isAlive && state.pendingCollegeMajorPicker);
}

export function needsCourtRoute(state: GameNavState & { pendingCourt?: boolean }): boolean {
  return Boolean(state.character?.isAlive && state.pendingCourt);
}

export type GamePhase = 'auth' | 'slots' | 'alive' | 'dead';

export function getGamePhase(state: GameNavState): GamePhase {
  if (!state.user) return 'auth';
  if (!state.character) return 'slots';
  if (!state.character.isAlive) return 'dead';
  return 'alive';
}
