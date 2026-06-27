import { resolveRootRoute } from '@navigation/gamePhase';
import type { AppUser, Character } from '../../types';

function navState(overrides: {
  user?: AppUser | null;
  character?: Character | null;
  pendingReincarnation?: boolean;
}) {
  return {
    user: overrides.user ?? null,
    character: overrides.character ?? null,
    pendingReincarnation: overrides.pendingReincarnation ?? false,
  };
}

const guestUser: AppUser = {
  uid: 'guest-1',
  displayName: 'Guest',
  email: null,
  photoURL: null,
  isGuest: true,
};

const aliveCharacter = {
  isAlive: true,
} as Character;

const deadCharacter = {
  isAlive: false,
} as Character;

describe('resolveRootRoute', () => {
  it('routes unauthenticated users to Auth', () => {
    expect(resolveRootRoute(navState({}))).toBe('Auth');
  });

  it('routes authenticated users without a character to SaveSlots', () => {
    expect(resolveRootRoute(navState({ user: guestUser }))).toBe('SaveSlots');
  });

  it('routes reincarnation flow to CharacterCreate', () => {
    expect(resolveRootRoute(navState({
      user: guestUser,
      pendingReincarnation: true,
    }))).toBe('CharacterCreate');
  });

  it('routes living characters to MainTabs', () => {
    expect(resolveRootRoute(navState({
      user: guestUser,
      character: aliveCharacter,
    }))).toBe('MainTabs');
  });

  it('routes dead characters to Death', () => {
    expect(resolveRootRoute(navState({
      user: guestUser,
      character: deadCharacter,
    }))).toBe('Death');
  });
});
