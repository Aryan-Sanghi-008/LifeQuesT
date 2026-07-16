import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Person } from "../../types";
import {
  getClassmates,
  enrichPersonProfile,
  appendPlayerMemory,
  discoverSecret,
  rollInteraction,
  getInteraction,
} from "../../engine/peopleEngine";
import {
  createPost,
  applyPostToCharacter,
  hireStaff,
  fireStaff,
  runMonetization,
  unlockPlatform,
} from "../../engine/socialMediaEngine";
import { getSocialPlatform as getPlatformDef } from "@data/socialPlatforms";
import {
  practiceHobby as runPracticeHobby,
  competeHobby as runCompeteHobby,
} from "../../engine/hobbyEngine";
import { careForPet, initPetStats } from "../../engine/petEngine";
import { applyEffect } from "../../engine/economyEngine";
import {
  appendFinanceLedger,
  createLedgerEntry,
} from "../../engine/financeLedgerEngine";
import type {
  SocialMonetizationKind,
  SocialPlatformId,
  SocialStaffRole,
} from "../../types";

function mirrorSocialFinance(
  character: {
    age: number;
    bankBalance: number;
    debt?: number;
    financeLedger?: import("../../types").FinanceLedgerEntry[];
  },
  label: string,
  amount: number,
  bankAfter: number,
): import("../../types").FinanceLedgerEntry[] {
  if (amount === 0) return character.financeLedger ?? [];
  const debt = character.debt ?? 0;
  return appendFinanceLedger(
    character.financeLedger,
    createLedgerEntry({
      age: character.age,
      category: "social",
      label,
      amount,
      bankAfter,
      debtAfter: debt,
      debtBefore: debt,
    }),
  );
}

export interface SocialSlice {
  getClassmates: () => Person[];
  createSocialPost: (
    content: string,
    options?: { platformId?: string; contentType?: string; marketingSpend?: number },
  ) => { ok: boolean; message: string };
  practiceHobby: (hobbyId: string) => { ok: boolean; message: string };
  competeHobby: (hobbyId: string, competitionId: string) => { ok: boolean; message: string };
  hireSocialStaff: (platformId: string, role: string) => { ok: boolean; message: string };
  fireSocialStaff: (platformId: string, staffId: string) => { ok: boolean; message: string };
  runSocialMonetization: (
    platformId: string,
    kind: SocialMonetizationKind,
  ) => { ok: boolean; message: string };
  unlockSocialPlatform: (platformId: string) => { ok: boolean; message: string };
  careForPet: (
    personId: string,
    action: "feed" | "train" | "vet" | "play",
  ) => { ok: boolean; message: string };
  interactWithPerson: (
    personId: string,
    interactionId: string,
  ) => { delta: number; message: string };
}

export const createSocialSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  SocialSlice
> = (set, get) => ({
  getClassmates: () => {
    const { character } = get();
    if (!character) return [];
    return getClassmates(character.people);
  },

  createSocialPost: (content, options) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = createPost(character, content, options);
    if (result.error || !result.post) {
      return { ok: false, message: result.error ?? "Could not post." };
    }
    const post = result.post;
    const platformId = (post.platform as SocialPlatformId) || "lifefeed";
    const platformLabel =
      getPlatformDef(platformId)?.label ?? String(platformId);

    set((s) => {
      if (!s.character) return;
      const patch = applyPostToCharacter(s.character, post);
      Object.assign(s.character, patch);
      const cost = post.cost ?? 0;
      if (cost > 0 && patch.bankBalance !== undefined) {
        s.character.financeLedger = mirrorSocialFinance(
          {
            age: s.character.age,
            bankBalance: patch.bankBalance,
            debt: s.character.debt,
            financeLedger: s.character.financeLedger,
          },
          `${platformLabel} · Post (${post.contentType ?? "post"})`,
          -cost,
          patch.bankBalance,
        );
      }
    });
    void get()._persist();
    const likes = post.metrics?.likes ?? post.virality;
    return {
      ok: true,
      message: `Posted! +${post.followerDelta} followers · ${likes} likes.`,
    };
  },

  practiceHobby: (hobbyId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = runPracticeHobby(character, hobbyId);
    if (!result)
      return { ok: false, message: "Already practiced this year (or locked)." };
    set((s) => {
      if (!s.character) return;
      s.character.hobbyProgress = {
        ...s.character.hobbyProgress,
        [hobbyId]: result.progress,
      };
      s.character.stats = { ...s.character.stats, ...result.statPatch };
    });
    void get()._persist();
    const unlockMsg = result.newUnlocks.length
      ? ` Unlocked: ${result.newUnlocks.join(", ")}.`
      : "";
    return {
      ok: true,
      message: `+${result.xpGained} XP → Level ${result.progress.level}.${unlockMsg}`,
    };
  },

  competeHobby: (hobbyId, competitionId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = runCompeteHobby(character, hobbyId, competitionId);
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character || !result.progress) return;
      s.character.hobbyProgress = {
        ...s.character.hobbyProgress,
        [hobbyId]: result.progress,
      };
      if (result.bankBalance !== undefined) {
        s.character.bankBalance = result.bankBalance;
      }
      if (result.statPatch) {
        s.character.stats = { ...s.character.stats, ...result.statPatch };
      }
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  hireSocialStaff: (platformId, role) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = hireStaff(
      character,
      platformId as SocialPlatformId,
      role as SocialStaffRole,
    );
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character || !result.state) return;
      s.character.socialMedia = result.state;
      if (result.bankBalance !== undefined) s.character.bankBalance = result.bankBalance;
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  fireSocialStaff: (platformId, staffId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = fireStaff(character, platformId as SocialPlatformId, staffId);
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character || !result.state) return;
      s.character.socialMedia = result.state;
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  runSocialMonetization: (platformId, kind) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = runMonetization(character, platformId as SocialPlatformId, kind);
    if (!result.ok) return { ok: false, message: result.message };
    const platformLabel =
      getPlatformDef(platformId as SocialPlatformId)?.label ?? platformId;
    set((s) => {
      if (!s.character || !result.state) return;
      s.character.socialMedia = result.state;
      if (result.bankBalance !== undefined) {
        s.character.bankBalance = result.bankBalance;
        const payout = result.payout ?? 0;
        if (payout > 0) {
          s.character.financeLedger = mirrorSocialFinance(
            {
              age: s.character.age,
              bankBalance: result.bankBalance,
              debt: s.character.debt,
              financeLedger: s.character.financeLedger,
            },
            `${platformLabel} · ${result.message.split(":")[0] ?? "Monetization"}`,
            payout,
            result.bankBalance,
          );
        }
      }
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  unlockSocialPlatform: (platformId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = unlockPlatform(character, platformId as SocialPlatformId);
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character || !result.state) return;
      s.character.socialMedia = result.state;
    });
    void get()._persist();
    return { ok: true, message: result.message };
  },

  careForPet: (personId, action) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const idx = character.people.findIndex(
      (p) => p.id === personId && p.relationType === "pet",
    );
    if (idx < 0) return { ok: false, message: "Pet not found." };
    set((s) => {
      if (!s.character) return;
      const pet = s.character.people[idx];
      const withStats = pet.petStats
        ? pet
        : { ...pet, petStats: initPetStats() };
      s.character.people[idx] = careForPet(withStats, action);
    });
    void get()._persist();
    return { ok: true, message: `Pet cared for (${action}).` };
  },

  interactWithPerson: (personId, interactionId) => {
    const { character } = get();
    if (!character) return { delta: 0, message: "No character." };

    const interaction = getInteraction(interactionId, character.countryCode);
    if (!interaction) return { delta: 0, message: "Unknown interaction." };

    const person = character.people.find((p) => p.id === personId);
    if (!person) return { delta: 0, message: "Person not found." };

    if (person.lastInteractionAge === character.age) {
      return {
        delta: 0,
        message: `You already interacted with ${person.name} this year. Try again after aging up.`,
      };
    }

    const rolled = rollInteraction(
      interaction,
      character.personality,
      character.traits ?? [],
    );

    const { stats, karma, bankBalance, debt } = applyEffect(
      character.stats,
      character.karma,
      character.bankBalance,
      {},
      rolled.bankDelta,
      character.assets,
      character.debt ?? 0,
    );

    set((s) => {
      if (!s.character) return;
      const p = s.character.people.find((x) => x.id === personId);
      if (p) {
        const engagementBonus = rolled.success ? 5 : 0;
        p.relationshipScore = Math.max(
          0,
          Math.min(100, p.relationshipScore + rolled.delta + engagementBonus),
        );
        p.lastInteractionAge = s.character.age;
        if (!p.interactionCooldowns) p.interactionCooldowns = {};
        p.interactionCooldowns[interactionId] = s.character.age;
        const enriched = enrichPersonProfile(p);
        Object.assign(
          p,
          appendPlayerMemory(enriched, rolled.message, s.character.age),
        );
        if (
          interactionId === "gift" &&
          rolled.success &&
          enriched.secrets?.[0]
        ) {
          Object.assign(p, discoverSecret(enriched, enriched.secrets[0]));
        }
      }
      s.character.stats = stats;
      s.character.karma = karma;
      s.character.bankBalance = bankBalance;
      s.character.debt = debt;
    });

    void get()._persist();
    return { delta: rolled.delta, message: rolled.message };
  },
});
