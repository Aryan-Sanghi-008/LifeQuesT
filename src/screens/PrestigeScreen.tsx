import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card, SectionLabel, Divider } from '../components/index';
import { PRESTIGE_TRAITS } from '../engine/prestigeEngine';


export function PrestigeScreen() {
  const globalPrestige = useGameStore(s => s.globalPrestige);
  const purchasePrestigeUnlock = useGameStore(s => s.purchasePrestigeUnlock);

  const points = globalPrestige.prestigePoints;
  const level = globalPrestige.prestigeLevel;
  const lives = globalPrestige.totalLivesLived;
  const unlockedTraits = globalPrestige.unlockedTraitIds ?? [];

  const pointsIntoLevel = points % 1000;
  const progressRatio = pointsIntoLevel / 1000;

  const handleUnlock = (traitId: string, label: string) => {
    const res = purchasePrestigeUnlock(traitId);
    if (res.ok) {
      Alert.alert('Unlocked Successfully!', `You can now pick the "${label}" trait during Character Creation.`);
    } else {
      Alert.alert('Purchase Failed', res.message ?? 'Insufficient points.');
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Global Prestige" subtitle="Metagame rewards & cross-life progression" />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Prestige Scoreboard Card ── */}
          <Card style={styles.prestigeCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.prestigeTitle}>PRESTIGE LEVEL</Text>
                <Text style={styles.prestigeVal}>{level}</Text>
              </View>
              <View style={styles.statGroup}>
                <Text style={styles.statLbl}>PRESTIGE POINTS</Text>
                <Text style={styles.statVal}>{points.toLocaleString()}</Text>
              </View>
            </View>

            {/* Progress bar to next level */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {pointsIntoLevel} / 1000 pts to Level {level + 1}
            </Text>

            <Divider />

            <View style={styles.footerStats}>
              <View style={styles.footerStatItem}>
                <Text style={styles.footerStatLbl}>TOTAL LIVES</Text>
                <Text style={styles.footerStatVal}>{lives}</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerStatItem}>
                <Text style={styles.footerStatLbl}>CHALLENGES</Text>
                <Text style={styles.footerStatVal}>{globalPrestige.completedChallengeIds.length}</Text>
              </View>
            </View>
          </Card>

          {/* ── Prestige Perks Room ── */}
          <SectionLabel label="Prestige Traits Shop" />
          <View style={{ gap: SPACING.md }}>
            {PRESTIGE_TRAITS.map(t => {
              const isUnlocked = unlockedTraits.includes(t.id);
              const canAfford = points >= t.cost;

              return (
                <Card key={t.id} style={[styles.traitCard, isUnlocked && styles.unlockedCard]}>
                  <View style={styles.traitHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.traitLabel, isUnlocked && { color: COLORS.t4 }]}>{t.label}</Text>
                      <Text style={styles.traitDesc}>{t.description}</Text>
                    </View>
                    <View style={styles.costWrap}>
                      {isUnlocked ? (
                        <View style={[styles.unlockBadge, { backgroundColor: `${COLORS.teal}15` }]}>
                          <Text style={[styles.unlockBadgeText, { color: COLORS.teal }]}>UNLOCKED</Text>
                        </View>
                      ) : (
                        <Pressable
                          style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                          disabled={!canAfford}
                          onPress={() => handleUnlock(t.id, t.label)}
                        >
                          <Text style={styles.buyBtnText}>{t.cost} Pts</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, gap: SPACING.md },
  prestigeCard: { padding: SPACING.xl, backgroundColor: `${COLORS.gold}05`, borderColor: `${COLORS.gold}20` },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prestigeTitle: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.gold, letterSpacing: 2 },
  prestigeVal: { fontFamily: FONTS.displayBlack, fontSize: 44, color: COLORS.gold, marginTop: 4 },
  statGroup: { alignItems: 'flex-end' },
  statLbl: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, letterSpacing: 1 },
  statVal: { fontFamily: FONTS.displayBold, fontSize: 20, color: COLORS.t1, marginTop: 4 },
  progressBarBg: { height: 6, width: '100%', backgroundColor: COLORS.border, borderRadius: 3, marginTop: SPACING.md, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  progressText: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, marginTop: 6, textAlign: 'right' },
  footerStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: SPACING.sm },
  footerStatItem: { alignItems: 'center' },
  footerStatLbl: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, letterSpacing: 1 },
  footerStatVal: { fontFamily: FONTS.displayBold, fontSize: 14, color: COLORS.t2, marginTop: 2 },
  footerDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
  traitCard: { padding: SPACING.md, borderColor: COLORS.border },
  unlockedCard: { borderColor: `${COLORS.teal}30`, backgroundColor: `${COLORS.teal}02` },
  traitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md },
  traitLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.t1 },
  traitDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 4, lineHeight: 18 },
  costWrap: { minWidth: 80, alignItems: 'flex-end' },
  unlockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.sm },
  unlockBadgeText: { fontFamily: FONTS.bodyBold, fontSize: 9, letterSpacing: 0.5 },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADII.md, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  buyBtnDisabled: { opacity: 0.5, backgroundColor: COLORS.bgCard2 },
  buyBtnText: { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: '#160D00' },
});
export default PrestigeScreen;
