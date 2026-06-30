import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '@theme';
import OnboardingScreen from '@features/auth/OnboardingScreen';
import AgeGateScreen from '@features/auth/AgeGateScreen';
import AuthScreen from '@features/auth/AuthScreen';
import { CharacterCreateScreen } from '@features/character/CharacterCreateScreen';
import { SaveSlotScreen } from '@features/character/SaveSlotScreen';
import MainTabNavigator from './MainTabNavigator';
import DeathScreen from '@features/character/DeathScreen';
import { ShopScreen } from '@features/economy/ShopScreen';
import { StatsScreen } from '@features/character/StatsScreen';
import { ActivitiesScreen } from '@features/life/ActivitiesScreen';
import StudyScreen from '@features/life/StudyScreen';
import LeaderboardScreen from '@features/leaderboard/LeaderboardScreen';
import { AspirationPickerScreen } from '@features/life/AspirationPickerScreen';
import { CourtScreen } from '@features/life/CourtScreen';
import { MortgageScreen } from '@features/economy/MortgageScreen';
import { SocialMediaScreen } from '@features/life/SocialMediaScreen';
import { PetCareScreen } from '@features/people/PetCareScreen';
import { HobbyDetailScreen } from '@features/life/HobbyDetailScreen';
import { FamilyTreeScreen } from '@features/people/FamilyTreeScreen';
import { WillEditorScreen } from '@features/life/WillEditorScreen';
import { LifeMuseumScreen } from '@features/life/LifeMuseumScreen';
import { ChallengeModeScreen } from '@features/character/ChallengeModeScreen';
import { PrestigeScreen } from '@features/character/PrestigeScreen';
import LiveOpsScreen from '@features/liveops/LiveOpsScreen';
import { PeopleScreen } from '@features/people/PeopleScreen';
import { CareerScreen } from '@features/career/CareerScreen';
import { AssetsScreen } from '@features/economy/AssetsScreen';
import { SettingsScreen } from '@features/settings/SettingsScreen';
import { WorldEventsScreen } from '@features/liveops/WorldEventsScreen';
import { ScenarioPickerScreen } from '@features/scenarios/ScenarioPickerScreen';
import { ScenarioDetailScreen } from '@features/scenarios/ScenarioDetailScreen';
import { CollectionsScreen } from '@features/collections/CollectionsScreen';
import { DailyRewardsScreen } from '@features/retention/DailyRewardsScreen';
import { MysteryBoxScreen } from '@features/retention/MysteryBoxScreen';
import { SyncConflictModal } from '@components/SyncConflictModal';
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
const Death = withGameErrorBoundary(DeathScreen);
const Shop = withGameErrorBoundary(ShopScreen);
const Stats = withGameErrorBoundary(StatsScreen);
const Activities = withGameErrorBoundary(ActivitiesScreen);
const Study = withGameErrorBoundary(StudyScreen);
const Leaderboard = withGameErrorBoundary(LeaderboardScreen);
const AspirationPicker = withGameErrorBoundary(AspirationPickerScreen);
const Court = withGameErrorBoundary(CourtScreen);
const Mortgage = withGameErrorBoundary(MortgageScreen);
const SocialMedia = withGameErrorBoundary(SocialMediaScreen);
const PetCare = withGameErrorBoundary(PetCareScreen);
const HobbyDetail = withGameErrorBoundary(HobbyDetailScreen);
const FamilyTree = withGameErrorBoundary(FamilyTreeScreen);
const WillEditor = withGameErrorBoundary(WillEditorScreen);
const LifeMuseum = withGameErrorBoundary(LifeMuseumScreen);
const ChallengeMode = withGameErrorBoundary(ChallengeModeScreen);
const Prestige = withGameErrorBoundary(PrestigeScreen);
const LiveOps = withGameErrorBoundary(LiveOpsScreen);
const People = withGameErrorBoundary(PeopleScreen);
const Career = withGameErrorBoundary(CareerScreen);
const Assets = withGameErrorBoundary(AssetsScreen);
const Settings = withGameErrorBoundary(SettingsScreen);
const WorldEventsNav = withGameErrorBoundary(WorldEventsScreen);
const ScenarioPicker = withGameErrorBoundary(ScenarioPickerScreen);
const ScenarioDetail = withGameErrorBoundary(ScenarioDetailScreen);
const Collections = withGameErrorBoundary(CollectionsScreen);
const DailyRewards = withGameErrorBoundary(DailyRewardsScreen);
const MysteryBox = withGameErrorBoundary(MysteryBoxScreen);

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
    </>
  );
}
