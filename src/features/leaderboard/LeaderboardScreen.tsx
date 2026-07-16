import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaderboard, findPlayerRank } from '../../services/leaderboard';
import { getCurrentSeason } from '../../engine/liveOpsEngine';
import { LeaderboardEntry } from '../../types';
import { Card, ScreenHeader, BottomSheet } from '@components/index';
import { useThemedStyles, useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { formatCurrency } from '@utils/currency';

type FilterMode = 'global' | 'country';

function LifeCardSheet({
  entry,
  visible,
  onClose,
}: {
  entry: LeaderboardEntry | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, fonts, spacing } = useTheme();
  if (!entry) return null;
  const snap = entry.lifeSnapshot;
  const name = snap?.characterName ?? entry.characterName ?? entry.displayName;
  const account = snap?.displayName ?? entry.displayName;
  const cc = entry.country || 'US';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Life Record">
      <ScrollView style={{ maxHeight: 420 }}>
        <Text style={{ color: colors.gold, fontFamily: fonts.displayBold, fontSize: 22 }}>{name}</Text>
        {account && account !== name ? (
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginTop: 2 }}>
            Account · {account}
          </Text>
        ) : null}
        <View style={{ marginTop: spacing.md, gap: 8 }}>
          <Text style={{ color: colors.t2, fontFamily: fonts.body }}>Lived to age {entry.lifeAge}</Text>
          <Text style={{ color: colors.t2, fontFamily: fonts.body }}>Country · {entry.country}</Text>
          <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold }}>
            Score · {entry.score.toLocaleString()}
          </Text>
          {(snap?.peakNetWorth ?? entry.peakNetWorth) != null ? (
            <Text style={{ color: colors.t2, fontFamily: fonts.body }}>
              Peak net worth · {formatCurrency(snap?.peakNetWorth ?? entry.peakNetWorth ?? 0, cc)}
            </Text>
          ) : null}
          {(snap?.careerTitle ?? entry.careerTitle) ? (
            <Text style={{ color: colors.t2, fontFamily: fonts.body }}>
              Career · {snap?.careerTitle ?? entry.careerTitle}
            </Text>
          ) : null}
          {(snap?.karma ?? entry.karma) != null ? (
            <Text style={{ color: colors.t2, fontFamily: fonts.body }}>
              Karma · {snap?.karma ?? entry.karma}
            </Text>
          ) : null}
          {(snap?.causeOfDeath ?? entry.causeOfDeath) ? (
            <Text style={{ color: colors.crimson, fontFamily: fonts.body }}>
              Cause of death · {snap?.causeOfDeath ?? entry.causeOfDeath}
            </Text>
          ) : null}
          {(snap?.prestigeLevel ?? entry.prestigeLevel) ? (
            <Text style={{ color: colors.orchid, fontFamily: fonts.body }}>
              Prestige · {snap?.prestigeLevel ?? entry.prestigeLevel}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onClose} style={{ marginTop: spacing.lg, padding: 12 }}>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, textAlign: 'center' }}>Close</Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

export default function LeaderboardScreen() {
  const { colors, fonts, spacing } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore((s) => s.character);
  const uid = useGameStore((s) => s.user?.uid);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('global');
  const [myRank, setMyRank] = useState<number | null>(null);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);

  const season = getCurrentSeason();
  const myCountry = character?.countryCode ?? '';

  useEffect(() => {
    void fetchLeaderboard(50, season.id)
      .then((result) => {
        setEntries(result.entries);
        setFromCache(result.fromCache);
      })
      .finally(() => setLoading(false));
  }, [season.id]);

  useEffect(() => {
    if (!uid || loading) return;
    const inList = entries.some((e) => e.uid === uid);
    if (inList) {
      setMyRank(null);
      return;
    }
    void findPlayerRank(uid).then(setMyRank);
  }, [uid, entries, loading]);

  const displayEntries = useMemo(() => {
    if (filterMode === 'country' && myCountry) {
      return entries.filter((e) => e.country === myCountry);
    }
    return entries;
  }, [entries, filterMode, myCountry]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Leaderboard" subtitle={`${season.title} · Best finished lives`} />

      <View style={[styles.filterRow, { paddingHorizontal: spacing.lg }]}>
        {(['global', 'country'] as FilterMode[]).map((mode) => (
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
            <Text
              style={[
                styles.chipText,
                {
                  fontFamily: fonts.bodySemiBold,
                  color: filterMode === mode ? '#FFF' : colors.t3,
                },
              ]}
            >
              {mode === 'global' ? 'Season' : `My Country (${myCountry})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {fromCache && entries.length > 0 ? (
        <Text style={[styles.cacheHint, { paddingHorizontal: spacing.lg }]}>
          Showing cached rankings — connect to refresh
        </Text>
      ) : null}

      {myRank ? (
        <Text style={[styles.cacheHint, { paddingHorizontal: spacing.lg }]}>
          Your best life this season ranks #{myRank}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.sapphire} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {displayEntries.length === 0 ? (
            <Text style={styles.empty}>
              No scores yet. Complete a life and submit from the death screen.
            </Text>
          ) : (
            displayEntries.map((e, i) => {
              const isMe = e.uid === uid;
              const title = e.characterName ?? e.displayName;
              return (
                <Pressable key={e.uid} onPress={() => setSelected(e)}>
                  <Card style={isMe ? { borderColor: colors.gold, borderWidth: 2 } : undefined}>
                    <View style={styles.row}>
                      <Text style={[styles.rank, isMe && { color: colors.gold }]}>#{i + 1}</Text>
                      <View style={styles.info}>
                        <Text style={[styles.name, isMe && { color: colors.gold }]}>{title}</Text>
                        <Text style={styles.meta}>
                          Age {e.lifeAge} · {e.country}
                          {e.careerTitle ? ` · ${e.careerTitle}` : ''}
                        </Text>
                        <Text style={[styles.meta, { color: colors.t4 }]}>Tap for full life card</Text>
                      </View>
                      <Text style={styles.score}>{e.score.toLocaleString()}</Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      <LifeCardSheet entry={selected} visible={!!selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
    chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    chipText: { fontSize: 12 },
    cacheHint: { color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginBottom: 8 },
    list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 40 },
    empty: { color: colors.t4, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rank: { fontFamily: fonts.monoSemiBold, fontSize: 16, color: colors.t3, width: 36 },
    info: { flex: 1 },
    name: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.t1 },
    meta: { fontFamily: fonts.body, fontSize: 11, color: colors.t3, marginTop: 2 },
    score: { fontFamily: fonts.monoSemiBold, fontSize: 14, color: colors.teal },
  });
