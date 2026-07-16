/** Shared unique id helper for engine + store layers. */
export function makeId(prefix?: string): string {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}_${id}` : id;
}
