/**
 * Eagerly loads DiceBear style JSON used by Avatars.tsx so first avatar render
 * does not block on require() during scroll.
 */
export function preloadAvatarStyleAssets(): void {
  require("@dicebear/styles/dist/adventurer.min.json");
  require("@dicebear/styles/dist/adventurer-neutral.min.json");
  require("@dicebear/styles/dist/lorelei.min.json");
  require("@dicebear/styles/dist/lorelei-neutral.min.json");
  require("@dicebear/styles/dist/bottts.min.json");
  require("@dicebear/styles/dist/notionists.min.json");
  require("@dicebear/styles/dist/big-smile.min.json");
}
