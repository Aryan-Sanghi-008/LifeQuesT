import { StateCreator } from "zustand";
import { GameStore, CreateCharacterPayload } from "../types";
import {
  Character,
  CharacterStats,
  PendingDecision,
  AvatarId,
  Gender,
  CharacterDNA,
  BigFivePersonality,
} from "../../types";
import {
  generateRandomDNA,
  generateRandomPersonality,
  determineTraitsFromPersonality,
  crossoverDNA,
  crossoverPersonality,
} from "../../utils/genetics";
import { TRAITS, COUNTRIES } from "../../data/gameData";
import { getStartingBalance } from "../../data/countryEconomy";
import { generateParents } from "../../utils/npcGenerator";
import { clamp } from "../../engine/economyEngine";
import {
  saveCharacterLocal,
  saveGlobalPrestige,
  setDailyQuestsProgress,
  normalizeCharacter,
  deleteCharacterLocal,
} from "../../services/persistence";
import { processCharacterDeath } from "../../engine/prestigeEngine";
import { logEvent } from "../../services/analytics";
import { runAgeUp } from "../../engine/ageUpEngine";
import { runResolveDecision } from "../../engine/resolveDecisionEngine";
import { isFocusConfirmedForAge } from "../../engine/focusEngine";
import { hapticAgeUp, hapticDeath } from "../../services/haptics";
import { playSound } from "../../services/audio";
import { buildLocalSlotList, incrementLoadGeneration } from "../storeHelpers";
import { pickDailyQuests, updateQuestProgress } from "../../engine/questEngine";

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultUnlockedStyles(
  gender: Gender,
): NonNullable<Character["unlockedAvatarStyles"]> {
  if (gender === "female") return ["lorelei"];
  if (gender === "other") return ["notionists"];
  return ["adventurer"];
}

function buildCharacter(data: CreateCharacterPayload): Character {
  const bgData: Record<FamilyBackground, number> = {
    poor: 5,
    middle: 30,
    wealthy: 65,
    royalty: 90,
  };
  const wealthStart = bgData[data.familyBackground] ?? 30;
  const countryData = COUNTRIES.find((c) => c.code === data.countryCode);
  const wealthMod = countryData?.wealthMod ?? 0;

  const dna =
    data.parentDNA && data.partnerDNA
      ? crossoverDNA(data.parentDNA, data.partnerDNA)
      : generateRandomDNA();

  const personality =
    data.parentPersonality && data.partnerPersonality
      ? crossoverPersonality(data.parentPersonality, data.partnerPersonality)
      : generateRandomPersonality();

  if (data.traits.includes("prestige_genius_dna")) {
    dna.statPotentials.intelligence = 100;
  }

  const geneticTraits = determineTraitsFromPersonality(personality, dna);
  const traits = Array.from(new Set([...data.traits, ...geneticTraits]));

  const traitEffect: Partial<CharacterStats> = {};
  traits.forEach((traitId) => {
    const trait = TRAITS.find((t) => t.id === traitId);
    if (!trait) return;
    const te = traitEffect as unknown as Record<string, number>;
    const se = trait.statEffect as unknown as Record<string, number>;
    Object.keys(se).forEach((k) => {
      te[k] = (te[k] ?? 0) + se[k];
    });
  });

  const zodiacBonus: Partial<CharacterStats> = {};
  if (data.zodiacBonusStat) {
    (zodiacBonus as unknown as Record<string, number>)[data.zodiacBonusStat] =
      5;
  }

  const applyCarry = (base: number, key: keyof CharacterStats) => {
    const carried = data.carriedStats?.[key];
    const statCap = dna.statPotentials[key] ?? 100;
    const baseCapped = Math.min(statCap, base);
    if (carried !== undefined)
      return clamp(Math.round(baseCapped * 0.5 + carried * 0.5));
    return clamp(baseCapped);
  };

  const stats: CharacterStats = {
    health: applyCarry(
      clamp(
        80 +
          (traitEffect.health ?? 0) +
          (data.traits.includes("prestige_immune_system") ? 20 : 0),
      ),
      "health",
    ),
    happiness: applyCarry(
      clamp(70 + (traitEffect.happiness ?? 0)),
      "happiness",
    ),
    intelligence: applyCarry(
      clamp(
        50 + (traitEffect.intelligence ?? 0) + (zodiacBonus.intelligence ?? 0),
      ),
      "intelligence",
    ),
    wealth: clamp(wealthStart + wealthMod + (traitEffect.wealth ?? 0)),
    fitness: applyCarry(clamp(60 + (traitEffect.fitness ?? 0)), "fitness"),
    looks: applyCarry(clamp(60 + (traitEffect.looks ?? 0)), "looks"),
    social: applyCarry(
      clamp(50 + (traitEffect.social ?? 0) + (zodiacBonus.social ?? 0)),
      "social",
    ),
    ambition: applyCarry(
      clamp(50 + (traitEffect.ambition ?? 0) + (zodiacBonus.ambition ?? 0)),
      "ambition",
    ),
    mentalHealth: applyCarry(
      clamp(70 + (traitEffect.mentalHealth ?? 0)),
      "mentalHealth",
    ),
  };

  let bankBalance = getStartingBalance(data.familyBackground, data.countryCode);
  if (data.traits.includes("prestige_royal_blood")) {
    bankBalance += 150000;
  }
  const id = generateId();
  const parents = generateParents(
    data.name,
    data.countryCode,
    data.familyBackground,
  );

  return normalizeCharacter({
    id,
    name: data.name,
    gender: data.gender,
    activeChallengeId: data.activeChallengeId,
    avatarSeed: data.avatarSeed ?? `${data.name}-${id}`,
    avatarId: (data.gender === "female" ? "female_1" : "male_1") as AvatarId,
    lifeStage: "infant",
    country: countryData?.name ?? "India",
    countryFlag: countryData?.flag ?? "🇮🇳",
    countryCode: data.countryCode ?? "IN",
    zodiac: data.zodiac,
    familyBackground: data.familyBackground,
    traits,
    job: "Student",
    age: 0,
    birthYear: new Date().getFullYear(),
    stats,
    karma: 50,
    bankBalance,
    debt: 0,
    netWorthPeak: bankBalance,
    relationships: 0,
    children: 0,
    educationLevel: "none",
    people: parents,
    career: null,
    assets: [],
    achievements: [],
    eventHistory: [
      {
        id: "birth",
        age: 0,
        title: "Welcome to the World",
        description:
          "You took your first breath. The room was loud, then warm.",
        statEffect: { happiness: 10, health: 5 },
        category: "milestone",
        color: "#2DD4BF",
        timestamp: Date.now(),
      },
    ],
    isAlive: true,
    coins: 500,
    gems: 0,
    isPremium: false,
    hasNoAds: false,
    luckBoostsRemaining: 0,
    hasReincarnationScroll: false,
    businesses: [],
    socialFollowers: 0,
    avatarStyle:
      data.gender === "female"
        ? "lorelei"
        : data.gender === "other"
          ? "notionists"
          : "adventurer",
    unlockedAvatarStyles: [
      data.gender === "female"
        ? "lorelei"
        : data.gender === "other"
          ? "notionists"
          : "adventurer",
    ],
    degreeIds: [],
    certificationIds: [],
    totalCareerYears: 0,
    educationStage: "none",
    educationBranch: "none",
    seasonXp: 0,
    hasSeasonPass: false,
    claimedSeasonTiers: [],
    criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
    dna,
    personality,
    latentTalents: [],
    memories: [],
    memoryTags: [],
    completedMemoryChains: [],
    focusDomainsUsed: [],
    focusPointsSpent: {},
    gpa: undefined,
    creditScore: 650,
    heatLevel: 0,
    hobbyProgress: {},
    socialPosts: [],
    focusConfirmedForAge: -1,
    lifePhase: "planning",
    familyReputation: 50,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

type FamilyBackground = "poor" | "middle" | "wealthy" | "royalty";

export interface CharacterSlice {
  character: Character | null;
  pendingDecision: PendingDecision | null;
  isProcessing: boolean;
  sessionAges: number;
  ageUpsSinceAd: number;
  carriedStatsForCreate: Partial<CharacterStats> | null;
  carriedParentDNA: CharacterDNA | null;
  carriedPartnerDNA: CharacterDNA | null;
  carriedParentPersonality: BigFivePersonality | null;
  carriedPartnerPersonality: BigFivePersonality | null;
  lastAgeUpNotice: string | null;
  pendingReincarnation: boolean;
  pendingAspirationPicker: boolean;
  pendingCourt: boolean;
  showConfetti: boolean;

  createCharacter: (payload: CreateCharacterPayload) => void;
  ageUp: () => void;
  clearAgeUpNotice: () => void;
  setShowConfetti: (val: boolean) => void;
  clearPendingReincarnation: () => void;
  resolveDecision: (choiceId: string) => void;
  dismissDecision: () => void;
  reincarnate: () => Partial<CharacterStats> | null;
  setPremium: (v: boolean) => void;
  setNoAds: (v: boolean) => void;
  unlockFantasyDlc: (method: "gems" | "coins" | "prestige") => {
    ok: boolean;
    message?: string;
  };
  setAvatarStyle: (style: Character["avatarStyle"]) => void;
  unlockAvatarStyle: (style: NonNullable<Character["avatarStyle"]>) => void;
  addLuckBoost: (n: number) => void;
  useReincarnationScroll: () => void;
}

export const createCharacterSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  CharacterSlice
> = (set, get) => ({
  character: null,
  pendingDecision: null,
  isProcessing: false,
  sessionAges: 0,
  ageUpsSinceAd: 0,
  carriedStatsForCreate: null,
  carriedParentDNA: null,
  carriedPartnerDNA: null,
  carriedParentPersonality: null,
  carriedPartnerPersonality: null,
  lastAgeUpNotice: null,
  pendingReincarnation: false,
  pendingAspirationPicker: false,
  pendingCourt: false,
  showConfetti: false,

  createCharacter: (payload) => {
    incrementLoadGeneration();
    const carried = get().carriedStatsForCreate;
    const parentDNA = get().carriedParentDNA;
    const partnerDNA = get().carriedPartnerDNA;
    const parentPers = get().carriedParentPersonality;
    const partnerPers = get().carriedPartnerPersonality;

    const char = buildCharacter({
      ...payload,
      carriedStats: carried ?? payload.carriedStats,
      parentDNA: parentDNA ?? payload.parentDNA,
      partnerDNA: partnerDNA ?? payload.partnerDNA,
      parentPersonality: parentPers ?? payload.parentPersonality,
      partnerPersonality: partnerPers ?? payload.partnerPersonality,
    });

    const slotId = get().activeSlotId;
    saveCharacterLocal(char, slotId);
    set((s) => {
      s.character = char;
      s.pendingDecision = null;
      s.sessionAges = 0;
      s.isProcessing = false;
      s.carriedStatsForCreate = null;
      s.carriedParentDNA = null;
      s.carriedPartnerDNA = null;
      s.carriedParentPersonality = null;
      s.carriedPartnerPersonality = null;
      s.pendingReincarnation = false;
      s.slotList = buildLocalSlotList();
    });
    void get()._persist();
    void logEvent("create_character", { name: char.name });
  },

  ageUp: () => {
    const { character, pendingDecision, isProcessing } = get();
    if (!character || pendingDecision || isProcessing || !character.isAlive)
      return;
    if (character.lifePhase === "review") return;
    if (character.age >= 13) {
      if (character.lifePhase === "planning") return;
      if (!isFocusConfirmedForAge(character)) return;
    }

    const outcome = runAgeUp(character);

    if (outcome.type === "jail_tick") {
      set((s) => {
        if (s.character) s.character.criminalRecord = outcome.criminalRecord;
        s.lastAgeUpNotice = outcome.message;
      });
      void get()._persist();
      return;
    }

    set((s) => {
      s.isProcessing = true;
    });

    if (outcome.type === "death") {
      const prestigeRes = processCharacterDeath(
        character,
        get().globalPrestige,
      );
      set((s) => {
        if (!s.character) return;
        Object.assign(s.character, outcome.patch);
        s.globalPrestige = prestigeRes.nextState;
        s.isProcessing = false;
      });
      saveGlobalPrestige(prestigeRes.nextState);
      hapticDeath();
      void playSound("death");
      void get()._persist();
      return;
    }

    const applyPatch = (withDecision: boolean) => {
      set((s) => {
        if (!s.character) return;
        Object.assign(s.character, outcome.patch);
        outcome.newEventRecords.forEach((r) =>
          s.character!.eventHistory.push(r),
        );
        s.isProcessing = false;
        s.sessionAges += 1;
        s.ageUpsSinceAd += 1;
        if (outcome.needsAspirationPick) s.pendingAspirationPicker = true;
        if ("needsCourt" in outcome && outcome.needsCourt)
          s.pendingCourt = true;
        if (withDecision && outcome.type === "pending_decision") {
          s.pendingDecision = { event: outcome.decisionEvent };
        }
      });
    };

    hapticAgeUp();
    void playSound("age_up");

    if (outcome.type === "pending_decision") {
      applyPatch(true);
    } else {
      applyPatch(false);
      get()._checkAchievements();
      get().addSeasonXp(10);
      const today = new Date().toISOString().slice(0, 10);
      const quests = get().dailyQuests.length
        ? get().dailyQuests
        : pickDailyQuests(today, 3, outcome.karma);
      let updated = updateQuestProgress(quests, "age_up", 1);
      updated = updateQuestProgress(updated, "reach_karma", 0, outcome.karma);
      updated = updateQuestProgress(updated, "gain_karma", 0, outcome.karma);
      setDailyQuestsProgress(today, JSON.stringify(updated));
      set((s) => {
        s.dailyQuests = updated;
      });
    }
    void get()._persist();
  },

  clearAgeUpNotice: () =>
    set((s) => {
      s.lastAgeUpNotice = null;
    }),

  setShowConfetti: (val) =>
    set((s) => {
      s.showConfetti = val;
    }),

  clearPendingReincarnation: () =>
    set((s) => {
      s.pendingReincarnation = false;
    }),

  resolveDecision: (choiceId) => {
    const { character, pendingDecision } = get();
    if (!character || !pendingDecision) return;

    const result = runResolveDecision(
      character,
      pendingDecision.event,
      choiceId,
    );
    if (!result) return;

    set((s) => {
      if (!s.character) return;
      Object.assign(s.character, result.patch);
      s.character.eventHistory.push(result.eventRecord);
      s.pendingDecision = null;
    });

    get()._checkAchievements();
    void get()._persist();
  },

  dismissDecision: () =>
    set((s) => {
      s.pendingDecision = null;
    }),

  reincarnate: () => {
    const { character } = get();
    if (!character) return null;

    const canCarry =
      character.hasReincarnationScroll || character.luckBoostsRemaining > 0;
    let carried: Partial<CharacterStats> | null = null;

    if (canCarry) {
      const entries = Object.entries(character.stats) as [
        keyof CharacterStats,
        number,
      ][];
      const top3 = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
      carried = Object.fromEntries(
        top3.map(([k, v]) => [k, Math.round(v * 0.5)]),
      ) as Partial<CharacterStats>;
    }

    const parentDNA = character.dna;
    const parentPers = character.personality;
    const partner = character.people.find(
      (p) => p.relationType === "partner" || p.relationType === "spouse",
    );
    const partnerDNA = partner?.dna || generateRandomDNA();
    const partnerPers = partner?.personality || generateRandomPersonality();

    set((s) => {
      s.carriedStatsForCreate = carried;
      s.carriedParentDNA = parentDNA;
      s.carriedPartnerDNA = partnerDNA;
      s.carriedParentPersonality = parentPers;
      s.carriedPartnerPersonality = partnerPers;
      s.character = null;
      s.pendingDecision = null;
      s.sessionAges = 0;
      s.pendingReincarnation = true;
      s.slotList = buildLocalSlotList();
    });

    incrementLoadGeneration();

    const slotId = get().activeSlotId;
    deleteCharacterLocal(slotId);
    return carried;
  },

  setPremium: (v) => {
    set((s) => {
      if (!s.character) return;
      s.character.isPremium = v;
      if (v) {
        s.character.hasNoAds = true;
        s.character.luckBoostsRemaining += 5;
      }
    });
    void get()._persist();
  },

  setNoAds: (v) => {
    set((s) => {
      if (s.character) s.character.hasNoAds = v;
    });
    void get()._persist();
  },

  unlockFantasyDlc: (method) => {
    const char = get().character;
    if (!char) return { ok: false, message: "No active character." };
    if (char.unlockedDlcIds?.includes("dlc_fantasy")) {
      return { ok: false, message: "Fantasy DLC already unlocked!" };
    }

    let success = false;
    let costMsg = "";

    if (method === "gems") {
      if (char.gems >= 100) {
        set((s) => {
          if (s.character) {
            s.character.gems -= 100;
            s.character.unlockedDlcIds = [
              ...(s.character.unlockedDlcIds ?? []),
              "dlc_fantasy",
            ];
          }
        });
        success = true;
      } else {
        costMsg = "Not enough gems (needs 100).";
      }
    } else if (method === "coins") {
      if (char.coins >= 1000) {
        set((s) => {
          if (s.character) {
            s.character.coins -= 1000;
            s.character.unlockedDlcIds = [
              ...(s.character.unlockedDlcIds ?? []),
              "dlc_fantasy",
            ];
          }
        });
        success = true;
      } else {
        costMsg = "Not enough coins (needs 1,000).";
      }
    } else if (method === "prestige") {
      const globalPrestige = get().globalPrestige;
      if (globalPrestige.prestigeLevel >= 3) {
        set((s) => {
          if (s.character) {
            s.character.unlockedDlcIds = [
              ...(s.character.unlockedDlcIds ?? []),
              "dlc_fantasy",
            ];
          }
        });
        success = true;
      } else {
        costMsg = "Requires Prestige Level 3 or higher.";
      }
    }

    if (success) {
      void get()._persist();
      return { ok: true, message: "Fantasy DLC Unlocked Successfully!" };
    }
    return { ok: false, message: costMsg };
  },

  setAvatarStyle: (style) => {
    if (!style) return;
    set((s) => {
      if (!s.character) return;
      const unlocked =
        s.character.unlockedAvatarStyles ??
        defaultUnlockedStyles(s.character.gender);
      if (!unlocked.includes(style)) return;
      s.character.avatarStyle = style;
    });
    void get()._persist();
  },

  unlockAvatarStyle: (style) => {
    set((s) => {
      if (!s.character) return;
      const unlocked =
        s.character.unlockedAvatarStyles ??
        defaultUnlockedStyles(s.character.gender);
      if (!unlocked.includes(style)) unlocked.push(style);
      s.character.unlockedAvatarStyles = unlocked;
      s.character.avatarStyle = style;
    });
    void get()._persist();
  },

  addLuckBoost: (n) =>
    set((s) => {
      if (s.character) s.character.luckBoostsRemaining += n;
    }),

  useReincarnationScroll: () =>
    set((s) => {
      if (s.character) s.character.hasReincarnationScroll = true;
    }),
});
