import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card, SectionLabel } from '../components/index';
import { ACHIEVEMENTS } from '../data/gameData';
import { calculateDynastyScore } from '../engine/legacyEngine';
import Svg, { Path } from 'react-native-svg';

export function LifeMuseumScreen() {
  const character = useGameStore(s => s.character);

  if (!character) return null;

  const currentGen = character.generation ?? 1;
  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character);
  const achievements = character.achievements ?? [];
  const completedCount = achievements.length;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Family Museum" subtitle="Generational collectibles & trophies" />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Dynasty Summary ── */}
          <Card style={styles.summaryCard}>
            <Text style={styles.dynastyTitle}>DYNASTY RATING</Text>
            <Text style={styles.dynastyScore}>{dynastyScore.toLocaleString()}</Text>
            <View style={styles.row}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>GENERATIONS</Text>
                <Text style={styles.metricValue}>{currentGen}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>TROPHIES</Text>
                <Text style={styles.metricValue}>{completedCount}</Text>
              </View>
            </View>
          </Card>

          {/* ── Trophies Earned ── */}
          <SectionLabel label="Trophy Room" />
          {completedCount === 0 ? (
            <Card style={styles.emptyCard}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path stroke={COLORS.t4} strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </Svg>
              <Text style={styles.emptyText}>Trophy Room is currently empty. Complete in-game achievements to unlock rare relics!</Text>
            </Card>
          ) : (
            <View style={styles.grid}>
              {achievements.map(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (!ach) return null;
                return (
                  <Card key={id} style={[styles.trophyCard, { borderColor: `${ach.color}40` }]}>
                    <View style={[styles.trophyIconWrap, { backgroundColor: `${ach.color}15` }]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill={ach.color}>
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </Svg>
                    </View>
                    <Text style={styles.trophyLabel}>{ach.label}</Text>
                    <Text style={styles.trophyDesc}>{ach.description}</Text>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, gap: SPACING.md },
  summaryCard: { padding: SPACING.xl, alignItems: 'center', backgroundColor: `${COLORS.gold}08`, borderColor: `${COLORS.gold}25` },
  dynastyTitle: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.gold, letterSpacing: 2 },
  dynastyScore: { fontFamily: FONTS.displayBlack, fontSize: 44, color: COLORS.gold, marginVertical: SPACING.xs },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'center', gap: SPACING.xl, marginTop: SPACING.sm },
  metric: { alignItems: 'center' },
  metricLabel: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, letterSpacing: 1 },
  metricValue: { fontFamily: FONTS.displayBold, fontSize: 18, color: COLORS.t1, marginTop: 2 },
  metricDivider: { width: 1, height: 28, backgroundColor: COLORS.border, alignSelf: 'center' },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, borderStyle: 'dashed', borderWidth: 1.5, borderColor: COLORS.border },
  emptyText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, textAlign: 'center', lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  trophyCard: { width: '47%', padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },
  trophyIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  trophyLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1, textAlign: 'center' },
  trophyDesc: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textAlign: 'center', lineHeight: 15 },
});
export default LifeMuseumScreen;
