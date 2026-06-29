import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '@theme';
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
import { SyncConflictModal } from '../components/SyncConflictModal';
import { useGameStore } from '../store/gameStore';
import { resolveRootRoute } from './gamePhase';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useGameStore(s => s.user);
  const character = useGameStore(s => s.character);
  const isHydrated = useGameStore(s => s.isHydrated);
  const pendingReincarnation = useGameStore(s => s.pendingReincarnation);

  if (!isHydrated) return null;

  const initialRouteName = resolveRootRoute({ user, character, pendingReincarnation });

  return (
    <>
      <Stack.Navigator
        key={user?.uid ?? 'guest'}
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="SaveSlots" component={SaveSlotScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CharacterCreate" component={CharacterCreateScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="Death" component={DeathScreen} options={{ animation: 'fade', contentStyle: { backgroundColor: COLORS.deathBg } }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="Activities" component={ActivitiesScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Study" component={StudyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AspirationPicker" component={AspirationPickerScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="Court" component={CourtScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="Mortgage" component={MortgageScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="SocialMedia" component={SocialMediaScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PetCare" component={PetCareScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HobbyDetail" component={HobbyDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FamilyTree" component={FamilyTreeScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="WillEditor" component={WillEditorScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LifeMuseum" component={LifeMuseumScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ChallengeMode" component={ChallengeModeScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Prestige" component={PrestigeScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LiveOps" component={LiveOpsScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
      <SyncConflictModal />
    </>
  );
}
