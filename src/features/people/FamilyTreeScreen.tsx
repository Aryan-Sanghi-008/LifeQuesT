import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card, SectionLabel, Divider } from '@components/index';
import { NpcAvatar } from '@components/Avatars';
import { CharacterNameText } from '@shared/components/CharacterNameText';
import { calculateDynastyScore } from '@engine/legacyEngine';
import { DYNASTY_MILESTONES } from '@data/dynastyMilestones';
import Svg, { Path } from 'react-native-svg';

interface DynastyGoal {
  label: string;
  done: boolean;
  hint?: string;
}

export function FamilyTreeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const character = useGameStore(s => s.character);

  if (!character) return null;

  const lineage = character.familyLineage ?? [];
  const currentGen = character.generation ?? 1;
  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character);
  const hasChild = character.people.some(p => p.relationType === 'child' && p.isAlive);
  const hasWill = !!character.will;

  const livingRelatives = character.people.filter(
    p => ['mother', 'father', 'sibling', 'spouse', 'partner', 'child'].includes(p.relationType) && p.isAlive
  );

  const dynastyGoals: DynastyGoal[] = [
    {
      label: 'Have a child',
      done: hasChild,
      hint: hasChild ? undefined : 'Build relationships and start a family.',
    },
    {
      label: `Reach Generation 2`,
      done: currentGen >= 2,
      hint: currentGen >= 2 ? undefined : 'Die and continue as an heir to advance your bloodline.',
    },
    {
      label: 'Build a dynasty score of 10,000',
      done: dynastyScore >= 10000,
      hint: dynastyScore >= 10000 ? undefined : `${(10000 - dynastyScore).toLocaleString()} pts to go — age up, earn wealth, unlock achievements.`,
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Family Tree & Lineage" subtitle={`Generation ${currentGen} Bloodline`} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.dynastyCard}>
            <Text style={styles.dynastyLabel}>DYNASTY SCORE</Text>
            <Text style={styles.dynastyScore}>{dynastyScore.toLocaleString()}</Text>
            <Text style={styles.dynastyHint}>
              Build your bloodline across generations. When you die, continue as an heir to carry the legacy forward.
            </Text>
            <Pressable
              style={[styles.dynastyBtn, { backgroundColor: `${colors.teal}15` }]}
              onPress={() => navigation.navigate('LifeMuseum')}
            >
              <Text style={[styles.dynastyBtnText, { color: colors.teal }]}>View Life Museum</Text>
            </Pressable>
          </Card>

          {/* ── Dynasty Milestone Rewards ── */}
          <SectionLabel label="Dynasty Milestones" />
          <Card style={{ gap: 0 }}>
            {DYNASTY_MILESTONES.map((milestone, i) => {
              const claimed = (character.claimedDynastyMilestoneIds ?? []).includes(milestone.id);
              const score = milestone.type === 'score';
              const progress = score ? dynastyScore : currentGen;
              const done = claimed || progress >= milestone.threshold;
              return (
                <View key={milestone.id}>
                  <View style={[styles.goalRow, { opacity: done ? 1 : 0.7 }]}>
                    <Text style={{ fontSize: 20, width: 28 }}>{milestone.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.goalLabel, {
                        color: done ? colors.teal : colors.t1,
                        textDecorationLine: done ? 'line-through' : 'none',
                      }]}>
                        {milestone.label}
                      </Text>
                      <Text style={styles.goalHint}>
                        {done
                          ? `Earned · ${milestone.titleReward}`
                          : score
                            ? `${(milestone.threshold - Math.min(dynastyScore, milestone.threshold)).toLocaleString()} pts to go`
                            : `Reach Generation ${milestone.threshold}`}
                      </Text>
                    </View>
                    {done && (
                      <View style={[styles.goalCheck, { backgroundColor: `${colors.teal}20`, borderColor: `${colors.teal}50` }]}>
                        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                          <Path stroke={colors.teal} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                        </Svg>
                      </View>
                    )}
                  </View>
                  {i < DYNASTY_MILESTONES.length - 1 && <Divider />}
                </View>
              );
            })}
          </Card>

          {/* ── Dynasty Goals ── */}
          <SectionLabel label="Current Goals" style={{ marginTop: SPACING.sm }} />
          <Card style={{ gap: 0 }}>
            {dynastyGoals.map((goal, i) => (
              <View key={goal.label}>
                <View style={styles.goalRow}>
                  <View style={[
                    styles.goalCheck,
                    {
                      backgroundColor: goal.done ? `${colors.emerald}20` : colors.bg2,
                      borderColor: goal.done ? colors.emerald : colors.border,
                    },
                  ]}>
                    {goal.done ? (
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path stroke={colors.emerald} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                          d="M5 12l5 5L20 7" />
                      </Svg>
                    ) : (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalLabel, { color: goal.done ? colors.t2 : colors.t1,
                      textDecorationLine: goal.done ? 'line-through' : 'none' }]}>
                      {goal.label}
                    </Text>
                    {goal.hint && (
                      <Text style={styles.goalHint}>{goal.hint}</Text>
                    )}
                  </View>
                </View>
                {i < dynastyGoals.length - 1 && <Divider />}
              </View>
            ))}
          </Card>

          {/* ── Prepare Your Legacy ── */}
          <SectionLabel label="Prepare Your Legacy" style={{ marginTop: SPACING.md }} />
          <Card style={styles.legacyCard}>
            <Text style={styles.legacyBody}>
              {hasWill
                ? 'Your will is set. Update it anytime to protect your bloodline.'
                : "You haven't written a will yet. Your wealth will be split equally by default."}
            </Text>
            <View style={styles.legacyBtnRow}>
              <Pressable
                style={[styles.legacyBtn, { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}30` }]}
                onPress={() => navigation.navigate('WillEditor' as never)}
              >
                <Text style={[styles.legacyBtnText, { color: colors.gold }]}>
                  {hasWill ? 'Edit Will' : 'Write Will'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.legacyBtn, { backgroundColor: `${colors.orchid}15`, borderColor: `${colors.orchid}30` }]}
                onPress={() => navigation.navigate('Collections' as never)}
              >
                <Text style={[styles.legacyBtnText, { color: colors.orchid }]}>Dynasty Collections</Text>
              </Pressable>
            </View>
          </Card>

          {/* ── Lineage Section ── */}
          <SectionLabel label="Lineage History" style={{ marginTop: SPACING.sm }} />
          {lineage.length === 0 ? (
            <Card style={styles.founderCard}>
              <Text style={styles.founderTitle}>Generation 1 (Founder)</Text>
              <CharacterNameText name={character.name} style={styles.founderName} />
              <Text style={styles.founderDesc}>You are the founder of this family bloodline.</Text>
            </Card>
          ) : (
            <Card style={{ gap: 0 }}>
              {lineage.map((entry, index) => (
                <View key={index}>
                  <View style={styles.lineageRow}>
                    <View style={styles.genBadge}>
                      <Text style={styles.genText}>Gen {entry.generation}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.lineageName} numberOfLines={1} ellipsizeMode="tail">{entry.name}</Text>
                      <Text style={styles.lineageInfo} numberOfLines={1}>
                        Lived {entry.lifespan} years · Born {entry.birthYear}
                      </Text>
                      <Text style={styles.lineageCause} numberOfLines={1} ellipsizeMode="tail">Died of {entry.deathCause}</Text>
                    </View>
                    <Text style={styles.lineageWealth} numberOfLines={1}>
                      ${entry.netWorth.toLocaleString()}
                    </Text>
                  </View>
                  {index < lineage.length - 1 && <Divider />}
                </View>
              ))}
              <Divider />
              <View style={[styles.lineageRow, styles.activeLineageRow]}>
                <View style={[styles.genBadge, { backgroundColor: colors.teal }]}>
                  <Text style={styles.genText}>Gen {currentGen}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <CharacterNameText
                    name={`${character.name} (Active)`}
                    style={[styles.lineageName, { color: colors.teal }]}
                  />
                  <Text style={styles.lineageInfo}>Current character · Age {character.age}</Text>
                </View>
                <Text style={[styles.lineageWealth, { color: colors.teal }]}>
                  ${character.bankBalance.toLocaleString()}
                </Text>
              </View>
            </Card>
          )}

          {/* ── Living Relatives Section ── */}
          <SectionLabel label="Living Relatives" style={{ marginTop: SPACING.md }} />
          {livingRelatives.length === 0 ? (
            <Text style={styles.noFamilyText}>No living relatives found. Focus on relationships to build your family!</Text>
          ) : (
            <Card style={{ gap: 0 }}>
              {livingRelatives.map((p, i) => (
                <View key={p.id}>
                  <View style={styles.familyRow}>
                    <NpcAvatar
                      seed={p.avatarSeed}
                      size={40}
                      age={p.age}
                      gender={p.gender as 'male' | 'female'}
                      relationType={p.relationType}
                    />
                    <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
                      <Text style={styles.familyName} numberOfLines={1} ellipsizeMode="tail">{p.name}</Text>
                      <Text style={styles.familyRel} numberOfLines={1}>
                        {p.relationType.toUpperCase()} · Age {p.age}
                      </Text>
                      {p.occupation && <Text style={styles.familyOcc} numberOfLines={1} ellipsizeMode="tail">{p.occupation}</Text>}
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{p.relationshipScore}</Text>
                    </View>
                  </View>
                  {i < livingRelatives.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.sm },
  founderCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.border },
  founderTitle: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, textTransform: 'uppercase', letterSpacing: 1.5 },
  founderName: { fontSize: 20, color: colors.teal },
  founderDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, textAlign: 'center' },
  lineageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  activeLineageRow: { backgroundColor: `${colors.teal}08` },
  genBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, backgroundColor: colors.bgCard2 },
  genText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.t1 },
  lineageName: { fontSize: 13, color: colors.t1 },
  lineageInfo: { fontFamily: fonts.body, fontSize: 11, color: colors.t3, marginTop: 2 },
  lineageCause: { fontFamily: fonts.body, fontSize: 10, color: colors.t4, marginTop: 1 },
  lineageWealth: { fontFamily: fonts.monoSemiBold, fontSize: 12, color: colors.t3 },
  familyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  familyName: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t1 },
  familyRel: { fontFamily: fonts.body, fontSize: 11, color: colors.t4 },
  familyOcc: { fontFamily: fonts.body, fontSize: 10, color: colors.t3, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.xs, backgroundColor: `${colors.teal}12` },
  scoreText: { fontFamily: fonts.monoSemiBold, fontSize: 10, color: colors.teal },
  noFamilyText: { fontFamily: fonts.body, fontSize: 12, color: colors.t4, fontStyle: 'italic', paddingVertical: spacing.sm },
  dynastyCard: { padding: spacing.lg, gap: spacing.xs, alignItems: 'center' },
  dynastyLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.t4, letterSpacing: 1.5 },
  dynastyScore: { fontFamily: fonts.displayBold, fontSize: 32, color: colors.gold },
  dynastyHint: { fontFamily: fonts.body, fontSize: 12, color: colors.t3, textAlign: 'center', lineHeight: 18 },
  dynastyBtn: { marginTop: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.md },
  dynastyBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  goalCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  goalLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  goalHint: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, marginTop: 3, lineHeight: 16 },
  legacyCard: { padding: spacing.md, gap: spacing.sm },
  legacyBody: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, lineHeight: 18 },
  legacyBtnRow: { flexDirection: 'row', gap: spacing.sm },
  legacyBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.sm, borderWidth: 1 },
  legacyBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
export default FamilyTreeScreen;
