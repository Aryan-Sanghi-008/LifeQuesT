import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { GradientButton } from '@components/index';
import { computeLeaderboardScore, submitLeaderboardScore } from '@services/leaderboard';
import { evaluateChallenge } from '@engine/challengeEngine';
import { TombstoneHero } from './TombstoneHero';
import { LifeSummaryCard } from './LifeSummaryCard';
import { DeathStatInfographic } from './DeathStatInfographic';
import { BestMomentsGallery } from './BestMomentsGallery';
import { LegacySection } from './LegacySection';
import { HeirSelectionSheet } from './HeirSelectionSheet';
import { DeathShareCard } from './DeathShareCard';

export function DeathScreen() {
  const { colors, spacing } = useTheme();
  const character = useGameStore((s) => s.character);
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const reincarnate = useGameStore((s) => s.reincarnate);

  const [selectedHeirId, setSelectedHeirId] = useState<string | null>(null);

  const deathAge = useMemo(() => character?.deathAge ?? character?.age ?? 0, [character]);
  const country = useMemo(() => character?.countryCode ?? 'IN', [character]);
  const score = useMemo(() => {
    if (!character) return 0;
    return computeLeaderboardScore({
      netWorthPeak: character.netWorthPeak ?? character.bankBalance,
      age: deathAge,
      karma: character.karma ?? 50,
    });
  }, [character, deathAge]);

  const challengeResult = useMemo(
    () => (character ? evaluateChallenge(character) : { success: false, message: '' }),
    [character],
  );

  const infographicStats = useMemo(() => {
    if (!character) return [];
    return [
      { label: 'Age', value: String(deathAge), color: colors.sapphire, pct: Math.min(100, (deathAge / 100) * 100) },
      { label: 'Karma', value: String(character.karma ?? 50), color: colors.emerald, pct: character.karma ?? 50 },
      { label: 'Score', value: score.toLocaleString(), color: colors.gold },
      { label: 'Prestige', value: String(globalPrestige.prestigeLevel), color: colors.orchid },
      { label: 'Health', value: String(character.stats.health), color: colors.health ?? '#EF4444', pct: character.stats.health },
      { label: 'Happiness', value: String(character.stats.happiness), color: colors.happiness ?? '#F59E0B', pct: character.stats.happiness },
    ];
  }, [character, colors, deathAge, globalPrestige.prestigeLevel, score]);

  const lifetimeEarnings = useMemo(
    () => character?.netWorthPeak ?? character?.bankBalance ?? 0,
    [character],
  );

  const handleSubmitScore = useCallback(async () => {
    if (!character) return;
    try {
      await submitLeaderboardScore({
        score, lifeAge: deathAge, country, displayName: character.name, avatarSeed: character.avatarSeed,
      });
      Alert.alert('Submitted', 'Leaderboard score submitted.');
    } catch {
      Alert.alert('Submission Failed', 'Unable to submit leaderboard score right now.');
    }
  }, [character, country, deathAge, score]);

  if (!character) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { padding: spacing.xl }]} showsVerticalScrollIndicator={false}>
          <TombstoneHero name={character.name} birthYear={character.birthYear} deathAge={deathAge} />
          <LifeSummaryCard character={character} deathAge={deathAge} />
          <DeathStatInfographic stats={infographicStats} />
          <BestMomentsGallery events={character.eventHistory} />
          <LegacySection
            dynastyScore={score}
            prestigeLevel={globalPrestige.prestigeLevel}
            lifetimeEarnings={lifetimeEarnings}
            country={country}
          />

          {challengeResult.message && (
            <View style={[styles.challengeCard, {
              borderColor: challengeResult.success ? colors.emerald : colors.crimson,
              backgroundColor: `${challengeResult.success ? colors.emerald : colors.crimson}10`,
              borderRadius: 16,
            }]}>
              <Text style={{ color: challengeResult.success ? colors.emerald : colors.crimson, fontFamily: 'System', fontSize: 13, fontWeight: '600' }}>
                {challengeResult.success ? 'Challenge Completed' : 'Challenge Status'}
              </Text>
              <Text style={{ color: colors.t2, fontSize: 13, lineHeight: 20, marginTop: 4 }}>{challengeResult.message}</Text>
            </View>
          )}

          <HeirSelectionSheet character={character} onSelectHeir={setSelectedHeirId} />
          {selectedHeirId && (
            <Text style={{ color: colors.t4, fontFamily: 'System', fontSize: 12, textAlign: 'center' }}>
              Heir selected for reincarnation
            </Text>
          )}

          <DeathShareCard character={character} deathAge={deathAge} score={score} country={country} />

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Pressable
              onPress={handleSubmitScore}
              style={[styles.outlineBtn, { borderColor: colors.sapphire, borderRadius: 12, backgroundColor: `${colors.sapphire}12` }]}
            >
              <Text style={{ color: colors.sapphire, fontFamily: 'System', fontSize: 14, fontWeight: '600' }}>Submit Score to Leaderboard</Text>
            </Pressable>
            <GradientButton
              label="Reincarnate"
              onPress={reincarnate}
              colors={[colors.gold, colors.gold3 ?? colors.gold]}
              textColor="#FFFFFF"
              style={{ width: '100%' }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default DeathScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { gap: 20 },
  challengeCard: { padding: 16, borderWidth: 1 },
  outlineBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1 },
});
