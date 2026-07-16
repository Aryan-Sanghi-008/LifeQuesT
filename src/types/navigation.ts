import type { Character } from './character';
import type { CharacterStats } from './stats';
import type { ScenarioId } from './scenario';
import type { SocialPlatformId } from './social';
// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  AgeGate: undefined;
  Auth: undefined;
  SaveSlots: undefined;
  CharacterCreate: { carriedStats?: Partial<CharacterStats>; scenarioId?: ScenarioId } | undefined;
  MainTabs: undefined;
  Death: undefined;
  Shop: { tab?: import('@features/economy/shop/ShopTabBar').ShopTab; source?: 'trait_upsell' } | undefined;
  Stats: undefined;
  Activities: undefined;
  Study: undefined;
  Leaderboard: undefined;
  AspirationPicker: undefined;
  CollegeMajorPicker: undefined;
  Court: undefined;
  SocialMedia: undefined;
  SocialPlatform: { platformId: SocialPlatformId };
  PetCare: { personId: string };
  HobbyDetail: { hobbyId: string };
  Mortgage: { propertyDefId: string };
  FamilyTree: undefined;
  WillEditor: undefined;
  LifeMuseum: undefined;
  WorldEvents: undefined;
  Settings: undefined;
  ScenarioPicker: undefined;
  ScenarioDetail: { scenarioId: string };
  Collections: undefined;
  DailyRewards: undefined;
  MysteryBox: undefined;
  ChallengeMode: undefined;
  Prestige: undefined;
  LiveOps: undefined;
  People: undefined;
  Career: undefined;
  Assets: undefined;
};

export interface SyncConflict {
  local: Character;
  cloud: Character;
  resolve: (choice: 'local' | 'cloud') => void;
}

export type MainTabParamList = {
  Home: undefined;
  World: undefined;
  QuickActions: undefined;
  Life: undefined;
  Profile: undefined;
};
