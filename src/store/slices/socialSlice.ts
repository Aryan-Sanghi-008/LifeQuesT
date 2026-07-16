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
  runMonetization,
} from "../../engine/socialMediaEngine";
import {
  practiceHobby as runPracticeHobby,
  competeHobby as runCompeteHobby,
} from "../../engine/hobbyEngine";
import { careForPet, initPetStats } from "../../engine/petEngine";
import { applyEffect } from "../../engine/economyEngine";
import type { SocialPlatformId, SocialStaffRole } from "../../types";

export interface SocialSlice {
  getClassmates: () => Person[];
  createSocialPost: (
    content: string,
    options?: { platformId?: string; contentType?: string; marketingSpend?: number },
  ) => { ok: boolean; message: string };
  practiceHobby: (hobbyId: string) => { ok: boolean; message: string };
  competeHobby: (hobbyId: string, competitionId: string) => { ok: boolean; message: string };
  hireSocialStaff: (platformId: string, role: string) => { ok: boolean; message: string };
  runSocialMonetization: (
    platformId: string,
    kind: 'ads' | 'sponsorship' | 'brand_deal' | 'super_thanks',
  ) => { ok: boolean; message: string };
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
    set((s) => {
      if (!s.character) return;
      const patch = applyPostToCharacter(s.character, post);
      Object.assign(s.character, patch);
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

  runSocialMonetization: (platformId, kind) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = runMonetization(character, platformId as SocialPlatformId, kind);
    if (!result.ok) return { ok: false, message: result.message };
    set((s) => {
      if (!s.character || !result.state) return;
      s.character.socialMedia = result.state;
      if (result.bankBalance !== undefined) s.character.bankBalance = result.bankBalance;
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
