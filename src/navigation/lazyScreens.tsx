import { lazy, Suspense, ComponentType } from 'react';
import { HydrationLoader } from '@components/HydrationLoader';
import { withGameErrorBoundary } from './screenWrappers';

function lazyNamed(
  factory: () => Promise<Record<string, ComponentType<object>>>,
  exportName: string,
) {
  const Lazy = lazy(() => factory().then((m) => ({ default: m[exportName] })));
  function Wrapped(props: object) {
    return (
      <Suspense fallback={<HydrationLoader />}>
        <Lazy {...props} />
      </Suspense>
    );
  }
  return withGameErrorBoundary(Wrapped);
}

export const LazyDeathScreen = lazyNamed(
  () => import('@features/character/death/DeathScreen'),
  'DeathScreen',
);
export const LazyShopScreen = lazyNamed(
  () => import('@features/economy/ShopScreen'),
  'ShopScreen',
);
export const LazyStatsScreen = lazyNamed(
  () => import('@features/character/StatsScreen'),
  'StatsScreen',
);
export const LazyActivitiesScreen = lazyNamed(
  () => import('@features/life/ActivitiesScreen'),
  'ActivitiesScreen',
);
export const LazyStudyScreen = lazyNamed(
  () => import('@features/life/StudyScreen'),
  'default',
);
export const LazyLeaderboardScreen = lazyNamed(
  () => import('@features/leaderboard/LeaderboardScreen'),
  'default',
);
export const LazyAspirationPickerScreen = lazyNamed(
  () => import('@features/life/AspirationPickerScreen'),
  'AspirationPickerScreen',
);
export const LazyCollegeMajorPickerScreen = lazyNamed(
  () => import('@features/life/CollegeMajorPickerScreen'),
  'CollegeMajorPickerScreen',
);
export const LazyCourtScreen = lazyNamed(
  () => import('@features/life/CourtScreen'),
  'CourtScreen',
);
export const LazyMortgageScreen = lazyNamed(
  () => import('@features/economy/MortgageScreen'),
  'MortgageScreen',
);
export const LazySocialMediaScreen = lazyNamed(
  () => import('@features/life/SocialMediaScreen'),
  'SocialMediaScreen',
);
export const LazySocialPlatformScreen = lazyNamed(
  () => import('@features/life/social/SocialPlatformScreen'),
  'SocialPlatformScreen',
);
export const LazyPetCareScreen = lazyNamed(
  () => import('@features/people/PetCareScreen'),
  'PetCareScreen',
);
export const LazyHobbyDetailScreen = lazyNamed(
  () => import('@features/life/HobbyDetailScreen'),
  'HobbyDetailScreen',
);
export const LazyFamilyTreeScreen = lazyNamed(
  () => import('@features/people/FamilyTreeScreen'),
  'FamilyTreeScreen',
);
export const LazyWillEditorScreen = lazyNamed(
  () => import('@features/life/WillEditorScreen'),
  'WillEditorScreen',
);
export const LazyLifeMuseumScreen = lazyNamed(
  () => import('@features/life/LifeMuseumScreen'),
  'LifeMuseumScreen',
);
export const LazyChallengeModeScreen = lazyNamed(
  () => import('@features/character/ChallengeModeScreen'),
  'ChallengeModeScreen',
);
export const LazyPrestigeScreen = lazyNamed(
  () => import('@features/character/PrestigeScreen'),
  'PrestigeScreen',
);
export const LazyLiveOpsScreen = lazyNamed(
  () => import('@features/liveops/LiveOpsScreen'),
  'default',
);
export const LazyPeopleScreen = lazyNamed(
  () => import('@features/people/PeopleScreen'),
  'PeopleScreen',
);
export const LazyCareerScreen = lazyNamed(
  () => import('@features/career/CareerScreen'),
  'CareerScreen',
);
export const LazyAssetsScreen = lazyNamed(
  () => import('@features/economy/AssetsScreen'),
  'AssetsScreen',
);
export const LazySettingsScreen = lazyNamed(
  () => import('@features/settings/SettingsScreen'),
  'SettingsScreen',
);
export const LazyWorldEventsScreen = lazyNamed(
  () => import('@features/liveops/WorldEventsScreen'),
  'WorldEventsScreen',
);
export const LazyScenarioPickerScreen = lazyNamed(
  () => import('@features/scenarios/ScenarioPickerScreen'),
  'ScenarioPickerScreen',
);
export const LazyScenarioDetailScreen = lazyNamed(
  () => import('@features/scenarios/ScenarioDetailScreen'),
  'ScenarioDetailScreen',
);
export const LazyCollectionsScreen = lazyNamed(
  () => import('@features/collections/CollectionsScreen'),
  'CollectionsScreen',
);
export const LazyDailyRewardsScreen = lazyNamed(
  () => import('@features/retention/DailyRewardsScreen'),
  'DailyRewardsScreen',
);
export const LazyMysteryBoxScreen = lazyNamed(
  () => import('@features/retention/MysteryBoxScreen'),
  'MysteryBoxScreen',
);
