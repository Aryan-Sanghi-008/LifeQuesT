/** Lightweight deterministic hash for save conflict detection (not cryptographic). */
export function simpleHash(value: unknown): string {
  const str = JSON.stringify(value);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}
