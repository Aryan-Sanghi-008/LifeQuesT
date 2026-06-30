import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { StatBar } from '@components/index';
import { useGameStore } from '@store/gameStore';
import { HOBBY_MAP } from '@data/hobbies';
import { getHobbyProgress, canPracticeHobby, getEligibleCompetitions } from '@engine/hobbyEngine';
import type { RootStackParamList } from '@/types';

export function HobbyDetailScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HobbyDetail'>>();
  const character = useGameStore(s => s.character);
  const practiceHobby = useGameStore(s => s.practiceHobby);

  const def = HOBBY_MAP[route.params.hobbyId];

  if (!character || !def) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Hobby Not Found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const progress = getHobbyProgress(character, def.id);
  const canPractice = canPracticeHobby(character, def.id);
  const xpInLevel = progress.xp % 100;
  const competitions = getEligibleCompetitions(def.id, progress.level);

  const handlePractice = () => {
    const result = practiceHobby(def.id);
    Alert.alert(result.ok ? 'Practice Complete' : 'Cannot Practice', result.message);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.category}>{def.category.toUpperCase()}</Text>
        <Text style={styles.title}>{def.label}</Text>
        <Text style={styles.desc}>{def.description}</Text>

        <View style={styles.levelCard}>
          <Text style={styles.levelLabel}>Level {progress.level} / {def.maxLevel}</Text>
          <StatBar value={xpInLevel} color={colors.gold} height={10} />
          <Text style={styles.xpText}>{progress.xp} total XP · +{def.xpPerSession} per session</Text>
        </View>

        {competitions.length > 0 && (
          <View style={styles.compCard}>
            <Text style={styles.compLabel}>UNLOCKED COMPETITIONS</Text>
            {competitions.map(c => (
              <Text key={c} style={styles.compItem}>{c.replace(/_/g, ' ')}</Text>
            ))}
          </View>
        )}

        <Pressable
          onPress={handlePractice}
          disabled={!canPractice}
          style={[styles.btn, !canPractice && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>
            {canPractice ? 'Practice Today' : 'Already practiced this year'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back to Hobbies</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  category: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.gold, letterSpacing: 2 },
  title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.t1 },
  desc: { fontFamily: fonts.body, fontSize: 14, color: colors.t3, lineHeight: 20 },
  levelCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  levelLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
  xpText: { fontFamily: fonts.body, fontSize: 12, color: colors.t4 },
  compCard: {
    backgroundColor: `${colors.emerald}10`,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.emerald}30`,
    gap: 4,
  },
  compLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.emerald, letterSpacing: 1 },
  compItem: { fontFamily: fonts.body, fontSize: 13, color: colors.t2 },
  btn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.bg },
  backBtn: { alignItems: 'center', padding: spacing.md },
  backText: { fontFamily: fonts.body, fontSize: 14, color: colors.t3 },
});
