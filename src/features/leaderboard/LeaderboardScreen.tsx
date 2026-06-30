import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaderboard } from '../../services/leaderboard';
import { LeaderboardEntry } from '../../types';
import { Card, ScreenHeader } from '@components/index';
import { useThemedStyles, useTheme } from '@theme';

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    void fetchLeaderboard(50).then((result) => {
      setEntries(result.entries);
      setFromCache(result.fromCache);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Leaderboard" subtitle="Top lives by score" />
      {fromCache && entries.length > 0 ? (
        <Text style={styles.cacheHint}>Showing cached rankings — connect to refresh</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator color={colors.sapphire} />
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

const createStyles = ({ colors, fonts, spacing }: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  cacheHint: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  empty: { fontFamily: fonts.body, color: colors.t3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rank: { fontFamily: fonts.mono, fontSize: 16, color: colors.gold, width: 36 },
  info: { flex: 1 },
  name: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.t1 },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.t3 },
  score: { fontFamily: fonts.monoSemiBold, fontSize: 15, color: colors.sapphire },
});
