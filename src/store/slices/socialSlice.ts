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
import { createPost, applyPostToCharacter } from "../../engine/socialMediaEngine";
import { practiceHobby as runPracticeHobby } from "../../engine/hobbyEngine";
import { careForPet, initPetStats } from "../../engine/petEngine";
import { applyEffect } from "../../engine/economyEngine";

export interface SocialSlice {
  getClassmates: () => Person[];
  createSocialPost: (content: string) => { ok: boolean; message: string };
  practiceHobby: (hobbyId: string) => { ok: boolean; message: string };
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

  createSocialPost: (content) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const { post } = createPost(character, content);
    set((s) => {
      if (!s.character) return;
      const patch = applyPostToCharacter(s.character, post);
      Object.assign(s.character, patch);
    });
    void get()._persist();
    return { ok: true, message: `Posted! +${post.followerDelta} followers.` };
  },

  practiceHobby: (hobbyId) => {
    const { character } = get();
    if (!character) return { ok: false, message: "No character." };
    const result = runPracticeHobby(character, hobbyId);
    if (!result)
      return { ok: false, message: "Cannot practice this hobby now." };
    set((s) => {
      if (!s.character) return;
      s.character.hobbyProgress = {
        ...s.character.hobbyProgress,
        [hobbyId]: result.progress,
      };
      s.character.stats = { ...s.character.stats, ...result.statPatch };
    });
    void get()._persist();
    return {
      ok: true,
      message: `Leveled up! Now level ${result.progress.level}.`,
    };
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
