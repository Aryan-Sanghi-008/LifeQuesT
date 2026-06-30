import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card, SectionLabel, Divider } from '@components/index';
import { NpcAvatar } from '@components/Avatars';

export function FamilyTreeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore(s => s.character);

  if (!character) return null;

  const lineage = character.familyLineage ?? [];
  const currentGen = character.generation ?? 1;

  const livingRelatives = character.people.filter(
    p => ['mother', 'father', 'sibling', 'spouse', 'partner', 'child'].includes(p.relationType) && p.isAlive
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Family Tree & Lineage" subtitle={`Generation ${currentGen} Bloodline`} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Lineage Section ── */}
          <SectionLabel label="Lineage History" />
          {lineage.length === 0 ? (
            <Card style={styles.founderCard}>
              <Text style={styles.founderTitle}>Generation 1 (Founder)</Text>
              <Text style={styles.founderName}>{character.name}</Text>
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
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineageName}>{entry.name}</Text>
                      <Text style={styles.lineageInfo}>
                        Lived {entry.lifespan} years · Born {entry.birthYear}
                      </Text>
                      <Text style={styles.lineageCause}>Died of {entry.deathCause}</Text>
                    </View>
                    <Text style={styles.lineageWealth}>
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
                  <Text style={[styles.lineageName, { color: colors.teal }]}>{character.name} (Active)</Text>
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
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.familyName}>{p.name}</Text>
                      <Text style={styles.familyRel}>
                        {p.relationType.toUpperCase()} · Age {p.age}
                      </Text>
                      {p.occupation && <Text style={styles.familyOcc}>{p.occupation}</Text>}
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
  founderName: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.teal },
  founderDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, textAlign: 'center' },
  lineageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  activeLineageRow: { backgroundColor: `${colors.teal}08` },
  genBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, backgroundColor: colors.bgCard2 },
  genText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.t1 },
  lineageName: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t1 },
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
});
export default FamilyTreeScreen;
