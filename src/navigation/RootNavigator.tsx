import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';
import AuthScreen from '../screens/AuthScreen';
import { CharacterCreateScreen } from '../screens/CharacterCreateScreen';
import { SaveSlotScreen } from '../screens/SaveSlotScreen';
import MainTabNavigator from './MainTabNavigator';
import DeathScreen from '../screens/DeathScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ActivitiesScreen } from '../screens/ActivitiesScreen';
import StudyScreen from '../screens/StudyScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { AspirationPickerScreen } from '../screens/AspirationPickerScreen';
import { CourtScreen } from '../screens/CourtScreen';
import { MortgageScreen } from '../screens/MortgageScreen';
import { SocialMediaScreen } from '../screens/SocialMediaScreen';
import { PetCareScreen } from '../screens/PetCareScreen';
import { HobbyDetailScreen } from '../screens/HobbyDetailScreen';
import { FamilyTreeScreen } from '../screens/FamilyTreeScreen';
import { WillEditorScreen } from '../screens/WillEditorScreen';
import { LifeMuseumScreen } from '../screens/LifeMuseumScreen';
import { ChallengeModeScreen } from '../screens/ChallengeModeScreen';
import { PrestigeScreen } from '../screens/PrestigeScreen';
import LiveOpsScreen from '../screens/LiveOpsScreen';
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
