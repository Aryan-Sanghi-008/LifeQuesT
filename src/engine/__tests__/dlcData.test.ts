import { createTestCharacter } from "../../test/fixtures/character";
import {
  isDlcUnlocked,
  triggerDlcAgeUpEvents,
  FANTASY_TRAITS,
  FANTASY_CAREERS,
} from "../../data/dlcData";

describe("dlcData", () => {
  it("checks isDlcUnlocked correctly based on premium and unlocked lists", () => {
    const dummyChar = createTestCharacter({ unlockedDlcIds: [] });
    expect(isDlcUnlocked(dummyChar, "dlc_fantasy")).toBe(false);

    const premiumChar = createTestCharacter({ isPremium: true });
    expect(isDlcUnlocked(premiumChar, "dlc_fantasy")).toBe(true);

    const purchasedChar = createTestCharacter({
      unlockedDlcIds: ["dlc_fantasy"],
    });
    expect(isDlcUnlocked(purchasedChar, "dlc_fantasy")).toBe(true);
  });

  it("contains fantasy species traits and career configurations", () => {
    expect(FANTASY_TRAITS.length).toBe(3);
    expect(FANTASY_TRAITS[0].id).toBe("prestige_elf_grace");
    expect(FANTASY_CAREERS.length).toBe(2);
    expect(FANTASY_CAREERS[0].label).toBe("Alchemist");
  });

  it("triggers magical events only when dlc is unlocked and career matches", () => {
    const lockedChar = createTestCharacter({
      job: "Alchemist",
      unlockedDlcIds: [],
    });
    const resLocked = triggerDlcAgeUpEvents(lockedChar);
    expect(resLocked.length).toBe(0);

    const unlockedChar = createTestCharacter({
      job: "Alchemist",
      unlockedDlcIds: ["dlc_fantasy"],
    });

    // Seed Math.random to always trigger (we want it to roll < 0.15)
    const originalRandom = Math.random;
    Math.random = () => 0.05;

    const resUnlocked = triggerDlcAgeUpEvents(unlockedChar);
    Math.random = originalRandom;

    expect(resUnlocked.length).toBe(1);
    expect(resUnlocked[0].title).toBe("Potion Spill Accident");
    expect(resUnlocked[0].statEffect?.health).toBe(-8);
  });
});
