import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { Card, GradientButton } from '../../components/index';
import { formatCurrency } from '../../utils/currency';
import { computeLeaderboardScore, submitLeaderboardScore } from '../../services/leaderboard';
import { evaluateChallenge } from '../../engine/challengeEngine';

function Tombstone() {
  const { colors } = useTheme();
  return (
    <View style={[styles.tombstone, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.rip, { color: colors.gold3 ?? colors.gold }]}>R.I.P.</Text>
      <Text style={[styles.epitaph, { color: colors.t4 }]}>A life remembered</Text>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  const { colors, fonts, radii } = useTheme();
  return (
    <View style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.bgCard, borderRadius: radii.md }]}>
      <Text style={[styles.pillLabel, { color: colors.t4, fontFamily: fonts.body }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{value}</Text>
    </View>
  );
}

export function DeathScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const character = useGameStore(s => s.character);
  const globalPrestige = useGameStore(s => s.globalPrestige);
  const reincarnate = useGameStore(s => s.reincarnate);

  if (!character) return null;

  const deathAge = character.deathAge ?? character.age;
  const country = character.countryCode ?? 'IN';
  const netWorth = formatCurrency(character.bankBalance, country);
  const score = computeLeaderboardScore({
    netWorthPeak: character.netWorthPeak ?? character.bankBalance,
    age: deathAge,
    karma: character.karma ?? 50,
  });
  const challengeResult = evaluateChallenge(character);

  const handleShare = async () => {
    await Share.share({
      message: `${character.name} lived to age ${deathAge} with a net worth of ${netWorth}.`,
    });
  };

  const handleSubmitScore = async () => {
    try {
      await submitLeaderboardScore({
        score,
        lifeAge: deathAge,
        country,
        displayName: character.name,
        avatarSeed: character.avatarSeed,
      });
      Alert.alert('Submitted', 'Leaderboard score submitted.');
    } catch (error) {
      Alert.alert('Submission Failed', 'Unable to submit leaderboard score right now.');
    }
  };

  const handleReincarnate = () => {
    reincarnate();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { padding: spacing.xl }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Tombstone />
            <Text style={[styles.name, { color: colors.t1, fontFamily: fonts.displayBold }]}>{character.name}</Text>
            <Text style={[styles.dates, { color: colors.t4, fontFamily: fonts.body }]}>
              {character.birthYear} - {character.birthYear + deathAge}
            </Text>
          </View>

          <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={[styles.summary, { color: colors.t2, fontFamily: fonts.body }]}>Your story has ended, but the ripple remains.</Text>
          </Card>

          <View style={styles.grid}>
            <StatPill label="Age" value={String(deathAge)} />
            <StatPill label="Net Worth" value={netWorth} />
            <StatPill label="Karma" value={String(character.karma ?? 50)} />
            <StatPill label="Prestige" value={String(globalPrestige.prestigeLevel)} />
          </View>

          <Card style={[styles.card, { borderColor: challengeResult.success ? colors.emerald : colors.crimson }]}>
            <Text style={[styles.challengeTitle, { color: challengeResult.success ? colors.emerald : colors.crimson, fontFamily: fonts.bodySemiBold }]}>
              {challengeResult.success ? 'Challenge Completed' : 'Challenge Status'}
            </Text>
            <Text style={[styles.challengeText, { color: colors.t2, fontFamily: fonts.body }]}>{challengeResult.message}</Text>
          </Card>

          <View style={{ gap: spacing.sm }}>
            <Pressable onPress={handleShare} style={[styles.button, { borderColor: colors.border, borderRadius: radii.md }]}>
              <Text style={[styles.buttonText, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>Share Summary</Text>
            </Pressable>
            <Pressable onPress={handleSubmitScore} style={[styles.button, { borderColor: colors.sapphire, borderRadius: radii.md, backgroundColor: `${colors.sapphire}12` }]}>
              <Text style={[styles.buttonText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>Submit Score</Text>
            </Pressable>
            <GradientButton
              label="Reincarnate"
              onPress={handleReincarnate}
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
  scroll: { gap: 16 },
  header: { alignItems: 'center', gap: 8, marginVertical: 12 },
  tombstone: { width: 180, height: 220, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  rip: { fontSize: 20 },
  epitaph: { fontSize: 12 },
  name: { fontSize: 24, textAlign: 'center' },
  dates: { fontSize: 14, letterSpacing: 1.2 },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  summary: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { width: '48%', padding: 14, borderWidth: 1, gap: 6 },
  pillLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  pillValue: { fontSize: 16 },
  challengeTitle: { fontSize: 13, marginBottom: 4 },
  challengeText: { fontSize: 13, lineHeight: 20 },
  button: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1 },
  buttonText: { fontSize: 14 },
});
