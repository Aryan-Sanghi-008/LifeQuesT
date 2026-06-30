import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { NpcAvatar } from '@components/Avatars';
import { StatBar } from '@components/index';
import { useGameStore } from '@store/gameStore';
import { initPetStats } from '@engine/petEngine';
import type { RootStackParamList } from '@/types';

const ACTIONS = [
  { id: 'feed' as const, label: 'Feed', desc: 'Restore hunger' },
  { id: 'play' as const, label: 'Play', desc: 'Boost happiness' },
  { id: 'train' as const, label: 'Train', desc: 'Improve obedience' },
  { id: 'vet' as const, label: 'Vet Visit', desc: 'Restore health' },
];

export function PetCareScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PetCare'>>();
  const character = useGameStore(s => s.character);
  const careForPet = useGameStore(s => s.careForPet);

  const pet = character?.people.find(p => p.id === route.params.personId && p.relationType === 'pet');

  if (!character || !pet) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Pet Not Found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.actionBtn}>
          <Text style={styles.actionLabel}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const stats = pet.petStats ?? initPetStats();

  const handleAction = (action: typeof ACTIONS[number]['id']) => {
    const result = careForPet(pet.id, action);
    Alert.alert(pet.name, result.message);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <NpcAvatar
            seed={pet.avatarSeed}
            gender={pet.gender as 'male' | 'female'}
            size={64}
            age={pet.age}
            relationType="pet"
          />
          <Text style={styles.title}>{pet.name}</Text>
          <Text style={styles.sub}>{pet.occupation ?? 'Pet'} · Age {pet.age}</Text>
        </View>

        {(['happiness', 'health', 'training'] as const).map(key => (
          <View key={key} style={styles.statRow}>
            <Text style={styles.statLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <StatBar value={stats[key]} color={stats[key] >= 60 ? colors.teal : colors.gold} height={8} />
            <Text style={styles.statValue}>{stats[key]}</Text>
          </View>
        ))}

        <Text style={styles.section}>Care Actions</Text>
        <View style={styles.grid}>
          {ACTIONS.map(a => (
            <Pressable key={a.id} onPress={() => handleAction(a.id)} style={styles.actionBtn}>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back to People</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  title: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.t1 },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.t3 },
  statRow: { gap: 4 },
  statLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t4 },
  statValue: { fontFamily: fonts.monoSemiBold, fontSize: 11, color: colors.t2, alignSelf: 'flex-end' },
  section: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t4, letterSpacing: 1.5, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn: {
    width: '47%',
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  actionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
  actionDesc: { fontFamily: fonts.body, fontSize: 11, color: colors.t4 },
  backBtn: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.md },
  backText: { fontFamily: fonts.body, fontSize: 14, color: colors.t3 },
});
