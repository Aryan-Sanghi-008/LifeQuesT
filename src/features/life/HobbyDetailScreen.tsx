import { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { StatBar } from '@components/index';
import { useGameStore } from '@store/gameStore';
import { HOBBY_MAP } from '@data/hobbies';
import { getHobbyProgress, canPracticeHobby, getEligibleCompetitions } from '@engine/hobbyEngine';
import { CAREER_PATHS } from '@data/careerPaths';
import type { RootStackParamList } from '@/types';

export function HobbyDetailScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HobbyDetail'>>();
  const character = useGameStore(s => s.character);
  const practiceHobby = useGameStore(s => s.practiceHobby);

  const def = HOBBY_MAP[route.params.hobbyId];

  // Hooks must run before early return
  const relatedCareers = useMemo(() => {
    if (!def) return [];
    return CAREER_PATHS.filter(cp =>
      cp.requirements?.requiredHobbyCategory === def.category &&
      cp.requirements?.minHobbyLevel !== undefined,
    );
  }, [def]);

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
              <Text key={c.id} style={styles.compItem}>{c.label} (Lv {c.minLevel}+)</Text>
            ))}
          </View>
        )}

        {relatedCareers.length > 0 && (
          <View style={styles.careerCard}>
            <Text style={styles.careerLabel}>CAREER PATHS</Text>
            <Text style={styles.careerHint}>Reach the required level to unlock these careers</Text>
            {relatedCareers.map(cp => {
              const required = cp.requirements!.minHobbyLevel!;
              const unlocked = progress.level >= required;
              return (
                <View key={cp.id} style={[styles.careerRow, unlocked && styles.careerRowUnlocked]}>
                  <View style={styles.careerInfo}>
                    <Text style={[styles.careerName, { color: unlocked ? colors.teal : colors.t1 }]}>
                      {cp.label}
                    </Text>
                    <Text style={styles.careerReq}>
                      Level {required} required · {unlocked ? 'Unlocked!' : `${required - progress.level} more levels`}
                    </Text>
                  </View>
                  <Text style={[styles.careerLock, { color: unlocked ? colors.teal : colors.t4 }]}>
                    {unlocked ? '✓' : '🔒'}
                  </Text>
                </View>
              );
            })}
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
  careerCard: {
    backgroundColor: `${colors.sapphire}10`,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.sapphire}30`,
    gap: spacing.sm,
  },
  careerLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.sapphire, letterSpacing: 1 },
  careerHint: { fontFamily: fonts.body, fontSize: 12, color: colors.t4, marginBottom: 4 },
  careerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  careerRowUnlocked: { borderColor: colors.teal },
  careerInfo: { flex: 1, gap: 2 },
  careerName: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  careerReq: { fontFamily: fonts.body, fontSize: 11, color: colors.t4 },
  careerLock: { fontSize: 18, marginLeft: spacing.sm },
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
