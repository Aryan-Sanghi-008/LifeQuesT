import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
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
            <StatBar value={stats[key]} color={stats[key] >= 60 ? COLORS.teal : COLORS.gold} height={8} />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.xl, gap: SPACING.md },
  header: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3 },
  statRow: { gap: 4 },
  statLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.t4 },
  statValue: { fontFamily: FONTS.monoSemiBold, fontSize: 11, color: COLORS.t2, alignSelf: 'flex-end' },
  section: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.t4, letterSpacing: 1.5, marginTop: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actionBtn: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  actionLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  actionDesc: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  backBtn: { alignItems: 'center', marginTop: SPACING.lg, padding: SPACING.md },
  backText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3 },
});
