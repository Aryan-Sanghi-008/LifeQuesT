import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card, SectionLabel, Divider } from '@components/index';
import { PRESTIGE_TRAITS } from '../../engine/prestigeEngine';
import {
  DYNASTY_PERKS,
  DYNASTY_CREST_LABELS,
  countDynastyPerkPurchases,
} from '../../data/dynastyShop';

type TabId = 'traits' | 'dynasty';

export function PrestigeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const globalPrestige = useGameStore(s => s.globalPrestige);
  const purchasePrestigeUnlock = useGameStore(s => s.purchasePrestigeUnlock);
  const purchaseDynastyPerk = useGameStore(s => s.purchaseDynastyPerk);
  const [tab, setTab] = useState<TabId>('traits');

  const points = globalPrestige.prestigePoints;
  const level = globalPrestige.prestigeLevel;
  const lives = globalPrestige.totalLivesLived;
  const unlockedTraits = globalPrestige.unlockedTraitIds ?? [];
  const dynastyPerkIds = globalPrestige.unlockedDynastyPerkIds ?? [];

  const pointsIntoLevel = points % 1000;
  const progressRatio = pointsIntoLevel / 1000;
  const pointsLabel = tab === 'dynasty' ? 'LEGACY POINTS' : 'PRESTIGE POINTS';

  const handleUnlockTrait = (traitId: string, label: string) => {
    const res = purchasePrestigeUnlock(traitId);
    if (res.ok) {
      Alert.alert('Unlocked Successfully!', `You can now pick the "${label}" trait during Character Creation.`);
    } else {
      Alert.alert('Purchase Failed', res.message ?? 'Insufficient points.');
    }
  };

  const handleUnlockDynastyPerk = (perkId: string, label: string) => {
    const res = purchaseDynastyPerk(perkId);
    if (res.ok) {
      Alert.alert('Dynasty Perk Unlocked', `"${label}" is now active across your bloodline.`);
    } else {
      Alert.alert('Purchase Failed', res.message ?? 'Insufficient legacy points.');
    }
  };

  const isDynastyPerkOwned = (perkId: string, maxPurchases?: number) => {
    const count = countDynastyPerkPurchases(dynastyPerkIds, perkId);
    if (maxPurchases === undefined) return count > 0;
    return count >= maxPurchases;
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Global Prestige" subtitle="Metagame rewards & cross-life progression" />

        <View style={styles.tabRow}>
          {(['traits', 'dynasty'] as TabId[]).map((id) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={[styles.tabBtn, tab === id && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>
                {id === 'traits' ? 'Traits' : 'Dynasty Shop'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.prestigeCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.prestigeTitle}>PRESTIGE LEVEL</Text>
                <Text style={styles.prestigeVal}>{level}</Text>
              </View>
              <View style={styles.statGroup}>
                <Text style={styles.statLbl}>{pointsLabel}</Text>
                <Text style={styles.statVal}>{points.toLocaleString()}</Text>
              </View>
            </View>

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
                <Text style={styles.footerStatLbl}>DYNASTY TIER</Text>
                <Text style={styles.footerStatVal}>{globalPrestige.dynastyStatBonusTier ?? 0}</Text>
              </View>
              {globalPrestige.familyCrestId ? (
                <>
                  <View style={styles.footerDivider} />
                  <View style={styles.footerStatItem}>
                    <Text style={styles.footerStatLbl}>CREST</Text>
                    <Text style={styles.footerStatVal}>
                      {DYNASTY_CREST_LABELS[globalPrestige.familyCrestId] ?? globalPrestige.familyCrestId}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </Card>

          {tab === 'traits' ? (
            <>
              <SectionLabel label="Prestige Traits Shop" />
              <View style={{ gap: SPACING.md }}>
                {PRESTIGE_TRAITS.map(t => {
                  const isUnlocked = unlockedTraits.includes(t.id);
                  const canAfford = points >= t.cost;
                  return (
                    <Card key={t.id} style={[styles.traitCard, isUnlocked && styles.unlockedCard]}>
                      <View style={styles.traitHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.traitLabel, isUnlocked && { color: colors.t4 }]}>{t.label}</Text>
                          <Text style={styles.traitDesc}>{t.description}</Text>
                        </View>
                        <View style={styles.costWrap}>
                          {isUnlocked ? (
                            <View style={[styles.unlockBadge, { backgroundColor: `${colors.teal}15` }]}>
                              <Text style={[styles.unlockBadgeText, { color: colors.teal }]}>UNLOCKED</Text>
                            </View>
                          ) : (
                            <Pressable
                              style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                              disabled={!canAfford}
                              onPress={() => handleUnlockTrait(t.id, t.label)}
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
            </>
          ) : (
            <>
              <SectionLabel label="Dynasty Shop — Legacy Points" />
              <View style={{ gap: SPACING.md }}>
                {DYNASTY_PERKS.map((perk) => {
                  const owned = isDynastyPerkOwned(perk.id, perk.maxPurchases);
                  const canAfford = points >= perk.cost;
                  const tierNote =
                    perk.id === 'dynasty_stat_lineage'
                      ? `Tier ${globalPrestige.dynastyStatBonusTier ?? 0} / ${perk.maxPurchases ?? 1}`
                      : null;
                  return (
                    <Card key={perk.id} style={[styles.traitCard, owned && styles.unlockedCard]}>
                      <View style={styles.traitHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.traitLabel, owned && { color: colors.t4 }]}>{perk.label}</Text>
                          <Text style={styles.traitDesc}>{perk.description}</Text>
                          {tierNote ? (
                            <Text style={[styles.traitDesc, { color: colors.gold, marginTop: 4 }]}>
                              {tierNote}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.costWrap}>
                          {owned ? (
                            <View style={[styles.unlockBadge, { backgroundColor: `${colors.teal}15` }]}>
                              <Text style={[styles.unlockBadgeText, { color: colors.teal }]}>OWNED</Text>
                            </View>
                          ) : (
                            <Pressable
                              style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                              disabled={!canAfford}
                              onPress={() => handleUnlockDynastyPerk(perk.id, perk.label)}
                            >
                              <Text style={styles.buyBtnText}>{perk.cost} Pts</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.sm },
  tabBtnActive: { backgroundColor: `${colors.gold}20` },
  tabText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t3 },
  tabTextActive: { color: colors.gold },
  scroll: { padding: spacing.md, gap: spacing.md },
  prestigeCard: { padding: spacing.xl, backgroundColor: `${colors.gold}05`, borderColor: `${colors.gold}20` },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prestigeTitle: { fontFamily: fonts.body, fontSize: 10, color: colors.gold, letterSpacing: 2 },
  prestigeVal: { fontFamily: fonts.displayBlack, fontSize: 44, color: colors.gold, marginTop: 4 },
  statGroup: { alignItems: 'flex-end' },
  statLbl: { fontFamily: fonts.body, fontSize: 9, color: colors.t4, letterSpacing: 1 },
  statVal: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.t1, marginTop: 4 },
  progressBarBg: { height: 6, width: '100%', backgroundColor: colors.border, borderRadius: 3, marginTop: spacing.md, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },
  progressText: { fontFamily: fonts.body, fontSize: 10, color: colors.t4, marginTop: 6, textAlign: 'right' },
  footerStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap', gap: spacing.sm },
  footerStatItem: { alignItems: 'center' },
  footerStatLbl: { fontFamily: fonts.body, fontSize: 9, color: colors.t4, letterSpacing: 1 },
  footerStatVal: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.t2, marginTop: 2 },
  footerDivider: { width: 1, height: 20, backgroundColor: colors.border },
  traitCard: { padding: spacing.md, borderColor: colors.border },
  unlockedCard: { borderColor: `${colors.teal}30`, backgroundColor: `${colors.teal}02` },
  traitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  traitLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.t1 },
  traitDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.t3, marginTop: 4, lineHeight: 18 },
  costWrap: { minWidth: 80, alignItems: 'flex-end' },
  unlockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm },
  unlockBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.5 },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  buyBtnDisabled: { opacity: 0.5, backgroundColor: colors.bgCard2 },
  buyBtnText: { fontFamily: fonts.monoSemiBold, fontSize: 12, color: '#160D00' },
});
export default PrestigeScreen;
