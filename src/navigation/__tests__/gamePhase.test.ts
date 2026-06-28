import { needsCourtRoute } from '@navigation/gamePhase';
import type { AppUser, Character } from '../../types';

const guestUser: AppUser = {
  uid: 'guest-1',
  displayName: 'Guest',
  email: null,
  photoURL: null,
  isGuest: true,
};

const aliveCharacter = { isAlive: true } as Character;

describe('needsCourtRoute', () => {
  it('returns true when alive character needs court', () => {
    expect(needsCourtRoute({
      user: guestUser,
      character: aliveCharacter,
      pendingReincarnation: false,
      pendingCourt: true,
    })).toBe(true);
  });

  it('returns false when court is not pending', () => {
    expect(needsCourtRoute({
      user: guestUser,
      character: aliveCharacter,
      pendingReincarnation: false,
      pendingCourt: false,
    })).toBe(false);
  });
});
