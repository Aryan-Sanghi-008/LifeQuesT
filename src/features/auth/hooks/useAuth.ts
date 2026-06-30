import { useGameStore } from "@store/gameStore";

export function useAuth() {
  const user = useGameStore((s) => s.user);
  const isHydrated = useGameStore((s) => s.isHydrated);
  const onUserChanged = useGameStore((s) => s.onUserChanged);
  const setUser = useGameStore((s) => s.setUser);

  return {
    user,
    isHydrated,
    isSignedIn: Boolean(user),
    isGuest: Boolean(user?.isGuest),
    onUserChanged,
    setUser,
  };
}
