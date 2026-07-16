/**
 * Thin logger — verbose in __DEV__, quiet in release.
 * Optionally forwards errors to Crashlytics when available.
 */

type LogArgs = unknown[];

function forwardError(args: LogArgs): void {
  try {
    // Lazy require to avoid hard dependency during tests / web.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crash = require('@services/crashReporting') as {
      recordError?: (e: Error, ctx?: string) => void;
    };
    const first = args[0];
    const err =
      first instanceof Error
        ? first
        : new Error(typeof first === 'string' ? first : 'App error');
    crash.recordError?.(err, typeof args[1] === 'string' ? args[1] : undefined);
  } catch {
    // ignore
  }
}

export const logger = {
  debug(...args: LogArgs): void {
    if (__DEV__) console.debug(...args);
  },
  info(...args: LogArgs): void {
    if (__DEV__) console.log(...args);
  },
  warn(...args: LogArgs): void {
    if (__DEV__) console.warn(...args);
  },
  error(...args: LogArgs): void {
    if (__DEV__) {
      console.error(...args);
    } else {
      forwardError(args);
    }
  },
};
