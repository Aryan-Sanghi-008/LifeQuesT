import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, SectionLabel, Divider } from '../../components/index';
import { NpcAvatar } from '../../components/Avatars';

export function FamilyTreeScreen() {
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
                <View style={[styles.genBadge, { backgroundColor: COLORS.teal }]}>
                  <Text style={styles.genText}>Gen {currentGen}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lineageName, { color: COLORS.teal }]}>{character.name} (Active)</Text>
                  <Text style={styles.lineageInfo}>Current character · Age {character.age}</Text>
                </View>
                <Text style={[styles.lineageWealth, { color: COLORS.teal }]}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, gap: SPACING.sm },
  founderCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, borderStyle: 'dashed', borderWidth: 1.5, borderColor: COLORS.border },
  founderTitle: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textTransform: 'uppercase', letterSpacing: 1.5 },
  founderName: { fontFamily: FONTS.displayBold, fontSize: 20, color: COLORS.teal },
  founderDesc: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, textAlign: 'center' },
  lineageRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  activeLineageRow: { backgroundColor: `${COLORS.teal}08` },
  genBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.sm, backgroundColor: COLORS.bgCard2 },
  genText: { fontFamily: FONTS.bodyBold, fontSize: 10, color: COLORS.t1 },
  lineageName: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1 },
  lineageInfo: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 2 },
  lineageCause: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, marginTop: 1 },
  lineageWealth: { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.t3 },
  familyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  familyName: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1 },
  familyRel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  familyOcc: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t3, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADII.xs, backgroundColor: `${COLORS.teal}12` },
  scoreText: { fontFamily: FONTS.monoSemiBold, fontSize: 10, color: COLORS.teal },
  noFamilyText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, fontStyle: 'italic', paddingVertical: SPACING.sm },
});
export default FamilyTreeScreen;
