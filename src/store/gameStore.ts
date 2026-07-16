import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameStore, CreateCharacterPayload } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createCharacterSlice } from './slices/characterSlice';
import { createCareerSlice } from './slices/careerSlice';
import { createActivitySlice } from './slices/activitySlice';
import { createSaveSlice } from './slices/saveSlice';
import { createEconomySlice } from './slices/economySlice';
import { createQuestSlice } from './slices/questSlice';
import { createRewardsSlice } from './slices/rewardsSlice';
import { createEducationProgressSlice } from './slices/educationProgressSlice';
import { createScenarioSlice } from './slices/scenarioSlice';
import { createCosmeticSlice } from './slices/cosmeticSlice';
import { createProgressionSlice } from './slices/progressionSlice';
import { createSocialSlice } from './slices/socialSlice';

export { GameStore, CreateCharacterPayload };

export const useGameStore = create<GameStore>()(
  immer((set, get, store) => ({
    ...createAuthSlice(set, get, store),
    ...createCharacterSlice(set, get, store),
    ...createCareerSlice(set, get, store),
    ...createActivitySlice(set, get, store),
    ...createSaveSlice(set, get, store),
    ...createEconomySlice(set, get, store),
    ...createQuestSlice(set, get, store),
    ...createRewardsSlice(set, get, store),
    ...createEducationProgressSlice(set, get, store),
    ...createScenarioSlice(set, get, store),
    ...createCosmeticSlice(set, get, store),
    ...createProgressionSlice(set, get, store),
    ...createSocialSlice(set, get, store),
  })),
);
