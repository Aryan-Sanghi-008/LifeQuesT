import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaderboard } from '../services/leaderboard';
import { LeaderboardEntry } from '../types';
import { Card } from '../components/index';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchLeaderboard(50).then(setEntries).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Leaderboard</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.sapphire} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {entries.length === 0 ? (
            <Text style={styles.empty}>No scores yet. Complete a life to rank!</Text>
          ) : entries.map((e, i) => (
            <Card key={e.uid}>
              <View style={styles.row}>
                <Text style={styles.rank}>#{i + 1}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{e.displayName}</Text>
                  <Text style={styles.meta}>Age {e.lifeAge} · {e.country}</Text>
                </View>
                <Text style={styles.score}>{e.score.toLocaleString()}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  title: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1, marginBottom: SPACING.md },
  list: { gap: SPACING.sm },
  empty: { fontFamily: FONTS.body, color: COLORS.t3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rank: { fontFamily: FONTS.mono, fontSize: 16, color: COLORS.gold, width: 36 },
  info: { flex: 1 },
  name: { fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.t1 },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
  score: { fontFamily: FONTS.mono, fontSize: 14, color: COLORS.sapphire },
});
