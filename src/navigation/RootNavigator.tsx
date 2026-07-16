import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '@theme';
import OnboardingScreen from '@features/auth/OnboardingScreen';
import AgeGateScreen from '@features/auth/AgeGateScreen';
import AuthScreen from '@features/auth/AuthScreen';
import { CharacterCreateScreen } from '@features/character/CharacterCreateScreen';
import { SaveSlotScreen } from '@features/character/SaveSlotScreen';
import MainTabNavigator from './MainTabNavigator';
import {
  LazyDeathScreen as Death,
  LazyShopScreen as Shop,
  LazyStatsScreen as Stats,
  LazyActivitiesScreen as Activities,
  LazyStudyScreen as Study,
  LazyLeaderboardScreen as Leaderboard,
  LazyAspirationPickerScreen as AspirationPicker,
  LazyCollegeMajorPickerScreen as CollegeMajorPicker,
  LazyCourtScreen as Court,
  LazyMortgageScreen as Mortgage,
  LazySocialMediaScreen as SocialMedia,
  LazyPetCareScreen as PetCare,
  LazyHobbyDetailScreen as HobbyDetail,
  LazyFamilyTreeScreen as FamilyTree,
  LazyWillEditorScreen as WillEditor,
  LazyLifeMuseumScreen as LifeMuseum,
  LazyChallengeModeScreen as ChallengeMode,
  LazyPrestigeScreen as Prestige,
  LazyLiveOpsScreen as LiveOps,
  LazyPeopleScreen as People,
  LazyCareerScreen as Career,
  LazyAssetsScreen as Assets,
  LazySettingsScreen as Settings,
  LazyWorldEventsScreen as WorldEventsNav,
  LazyScenarioPickerScreen as ScenarioPicker,
  LazyScenarioDetailScreen as ScenarioDetail,
  LazyCollectionsScreen as Collections,
  LazyDailyRewardsScreen as DailyRewards,
  LazyMysteryBoxScreen as MysteryBox,
} from './lazyScreens';
import { SyncConflictModal } from '@components/SyncConflictModal';
import { RetentionModalsHost } from '@features/retention/RetentionModalsHost';
import { StarterOfferHost } from '@features/economy/shop/StarterOfferHost';
import { HydrationLoader } from '@components/HydrationLoader';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '@store/settingsStore';
import { resolveRootRoute } from './gamePhase';
import { withGameErrorBoundary } from './screenWrappers';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Onboarding = withGameErrorBoundary(OnboardingScreen);
const AgeGate = withGameErrorBoundary(AgeGateScreen);
const Auth = withGameErrorBoundary(AuthScreen);
const SaveSlots = withGameErrorBoundary(SaveSlotScreen);
const CharacterCreate = withGameErrorBoundary(CharacterCreateScreen);
const MainTabs = withGameErrorBoundary(MainTabNavigator);

export default function RootNavigator() {
  const user = useGameStore(s => s.user);
  const character = useGameStore(s => s.character);
  const isHydrated = useGameStore(s => s.isHydrated);
  const pendingReincarnation = useGameStore(s => s.pendingReincarnation);
  const onboardingComplete = useSettingsStore(s => s.onboardingComplete);
  const ageGateVerified = useSettingsStore(s => s.ageGateVerified);
  const { colors } = useTheme();

  if (!isHydrated) return <HydrationLoader />;

  const initialRouteName = resolveRootRoute({
    user,
    character,
    pendingReincarnation,
    onboardingComplete,
    ageGateVerified,
  });

  return (
    <>
      <Stack.Navigator
        key={user?.uid ?? 'guest'}
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ animation: 'fade' }} />
        <Stack.Screen name="AgeGate" component={AgeGate} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Auth" component={Auth} options={{ animation: 'fade' }} />
        <Stack.Screen name="SaveSlots" component={SaveSlots} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CharacterCreate" component={CharacterCreate} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="Death" component={Death} options={{ animation: 'fade', contentStyle: { backgroundColor: colors.deathBg } }} />
        <Stack.Screen name="Shop" component={Shop} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="Stats" component={Stats} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="Activities" component={Activities} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Study" component={Study} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Leaderboard" component={Leaderboard} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AspirationPicker" component={AspirationPicker} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="CollegeMajorPicker" component={CollegeMajorPicker} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="Court" component={Court} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="Mortgage" component={Mortgage} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="SocialMedia" component={SocialMedia} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PetCare" component={PetCare} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HobbyDetail" component={HobbyDetail} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FamilyTree" component={FamilyTree} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="WillEditor" component={WillEditor} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LifeMuseum" component={LifeMuseum} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ChallengeMode" component={ChallengeMode} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Prestige" component={Prestige} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LiveOps" component={LiveOps} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="People" component={People} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Career" component={Career} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Assets" component={Assets} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Settings" component={Settings} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="WorldEvents" component={WorldEventsNav} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ScenarioPicker" component={ScenarioPicker} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ScenarioDetail" component={ScenarioDetail} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Collections" component={Collections} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="DailyRewards" component={DailyRewards} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="MysteryBox" component={MysteryBox} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack.Navigator>
      <SyncConflictModal />
      <RetentionModalsHost />
      <StarterOfferHost />
    </>
  );
}
