/**
 * Dev-only guard for Expo Metro HMR on web.
 *
 * When the HMR WebSocket drops, expo/src/async-require/hmr.ts calls
 * window.location.reload() from registerBundleEntryPoints — which feels like
 * Metro "disconnecting" every few minutes with a full page refresh.
 *
 * We debounce those auto-reloads and surface a clear reconnect message instead
 * of reload storms during long play sessions.
 */
if (typeof window === 'undefined' || !__DEV__) {
  // Native / production — no-op.
} else {
  const DEBOUNCE_MS = 45_000;
  const MAX_SUPPRESSED_LOGS = 3;

  let lastAutoReloadAt = 0;
  let suppressedLogCount = 0;
  let reloadInFlight = false;

  const nativeReload = window.location.reload.bind(window.location);

  const isHmrAutoReload = () => {
    const stack = new Error().stack ?? '';
    return (
      stack.includes('registerBundleEntryPoints') ||
      stack.includes('async-require/hmr') ||
      stack.includes('async-require/hmrUtils') ||
      stack.includes('async-require/setupFastRefresh') ||
      stack.includes('performFullRefresh') ||
      stack.includes('performReactRefresh') ||
      stack.includes('messageSocket')
    );
  };

  window.location.reload = (() => {
    if (!isHmrAutoReload()) {
      nativeReload();
      return;
    }

    const now = Date.now();
    if (reloadInFlight || now - lastAutoReloadAt < DEBOUNCE_MS) {
      if (suppressedLogCount < MAX_SUPPRESSED_LOGS) {
        suppressedLogCount += 1;
        console.warn(
          '[LifeQuest dev] Suppressed Metro auto-reload after HMR disconnect. ' +
            'Metro is still running — save a file or press "r" in the Expo terminal to refresh.',
        );
      }
      return;
    }

    reloadInFlight = true;
    lastAutoReloadAt = now;
    suppressedLogCount = 0;

    console.warn(
      '[LifeQuest dev] Metro HMR disconnected — performing a single reconnect reload. ' +
        'If this repeats, restart with: npx expo start --clear',
    );

    window.setTimeout(() => {
      reloadInFlight = false;
      nativeReload();
    }, 800);
  }) as typeof window.location.reload;
}
