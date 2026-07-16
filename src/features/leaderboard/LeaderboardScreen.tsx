import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaderboard, findPlayerRank } from '../../services/leaderboard';
import { getCurrentSeason } from '../../engine/liveOpsEngine';
import { LeaderboardEntry } from '../../types';
import { Card, ScreenHeader } from '@components/index';
import { useThemedStyles, useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';

type FilterMode = 'global' | 'country';

export default function LeaderboardScreen() {
  const { colors, fonts, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore(s => s.character);
  const uid = useGameStore(s => s.user?.uid);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('global');
  const [myRank, setMyRank] = useState<number | null>(null);

  const season = getCurrentSeason();
  const myCountry = character?.countryCode ?? '';

  useEffect(() => {
    void fetchLeaderboard(50, season.id).then((result) => {
      setEntries(result.entries);
      setFromCache(result.fromCache);
    }).finally(() => setLoading(false));
  }, [season.id]);

  // Fetch out-of-top-50 rank once entries load
  useEffect(() => {
    if (!uid || loading) return;
    // Check if user is already in list
    const inList = entries.some(e => e.uid === uid);
    if (inList) { setMyRank(null); return; }
    void findPlayerRank(uid).then(setMyRank);
  }, [uid, entries, loading]);

  const displayEntries = useMemo(() => {
    if (filterMode === 'country' && myCountry) {
      return entries.filter(e => e.country === myCountry);
    }
    return entries;
  }, [entries, filterMode, myCountry]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Leaderboard" subtitle={`${season.title} · Top lives by score`} />

      {/* Country filter chips */}
      <View style={[styles.filterRow, { paddingHorizontal: spacing.lg }]}>
        {(['global', 'country'] as FilterMode[]).map(mode => (
          <Pressable
            key={mode}
            onPress={() => setFilterMode(mode)}
            style={[
              styles.chip,
              {
                backgroundColor: filterMode === mode ? colors.sapphire : colors.bgCard,
                borderColor: filterMode === mode ? colors.sapphire : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, {
              fontFamily: fonts.bodySemiBold,
              color: filterMode === mode ? '#FFF' : colors.t3,
            }]}>
              {mode === 'global' ? 'Global' : `My Country (${myCountry})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {fromCache && entries.length > 0 ? (
        <Text style={[styles.cacheHint, { paddingHorizontal: spacing.lg }]}>
          Showing cached rankings — connect to refresh
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.sapphire} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {displayEntries.length === 0 ? (
            <Text style={styles.empty}>
              {filterMode === 'country' ? 'No scores from your country yet.' : 'No scores yet. Complete a life to rank!'}
            </Text>
          ) : displayEntries.map((e, i) => {
            const isMe = e.uid === uid;
            return (
              <Card key={e.uid} style={isMe ? { borderColor: colors.gold, borderWidth: 2 } : undefined}>
                <View style={styles.row}>
                  <Text style={[styles.rank, isMe && { color: colors.gold }]}>#{i + 1}</Text>
                  <View style={styles.info}>
                    <Text style={[styles.name, isMe && { color: colors.gold }]}>
                      {e.displayName}{isMe ? ' (You)' : ''}
                    </Text>
                    <Text style={styles.meta}>Age {e.lifeAge} · {e.country}</Text>
                  </View>
                  <Text style={styles.score}>{e.score.toLocaleString()}</Text>
                </View>
              </Card>
            );
          })}

          {/* Out-of-top-50 rank banner */}
          {myRank !== null && (
            <View style={[styles.rankBanner, { backgroundColor: `${colors.sapphire}18`, borderColor: colors.sapphire }]}>
              <Text style={[styles.rankBannerText, { fontFamily: fonts.body, color: colors.t2 }]}>
                Your rank: <Text style={{ fontFamily: fonts.bodyBold, color: colors.sapphire }}>#{myRank}</Text>
                {' '}— keep playing to crack the top 50!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.lg },
  cacheHint: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, marginBottom: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 12 },
  list: { gap: spacing.sm, padding: spacing.lg },
  empty: { fontFamily: fonts.body, color: colors.t3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rank: { fontFamily: fonts.mono, fontSize: 16, color: colors.gold, width: 36 },
  info: { flex: 1 },
  name: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.t1 },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.t3 },
  score: { fontFamily: fonts.monoSemiBold, fontSize: 15, color: colors.sapphire },
  rankBanner: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  rankBannerText: { fontSize: 13, textAlign: 'center' },
});
