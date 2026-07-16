import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme } from '@theme';
import { ScreenHeader } from '@components/ScreenHeader';
import { useGameStore } from '@store/gameStore';
import {
  getNextFollowerMilestone,
  getFollowerAnnualIncome,
  FOLLOWER_MILESTONES,
} from '../../engine/socialMediaEngine';
import { formatCurrency } from '@utils/currency';

export function SocialMediaScreen() {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore(s => s.character);
  const createSocialPost = useGameStore(s => s.createSocialPost);
  const [content, setContent] = useState('');

  const followers = character?.socialFollowers ?? 0;
  const countryCode = character?.countryCode ?? 'US';
  const nextMilestone = getNextFollowerMilestone(followers);
  const annualIncome = getFollowerAnnualIncome(followers, countryCode);

  // Current tier label
  const currentTier = useMemo(() => {
    let tier = 'Newcomer';
    for (const m of FOLLOWER_MILESTONES) {
      if (followers >= m.followers) tier = m.label;
    }
    return tier;
  }, [followers]);

  // Progress to next milestone (0..1)
  const milestoneProgress = useMemo(() => {
    if (!nextMilestone) return 1;
    const prevThreshold = (() => {
      const idx = FOLLOWER_MILESTONES.findIndex(m => m.followers === nextMilestone.followers);
      return idx > 0 ? FOLLOWER_MILESTONES[idx - 1].followers : 0;
    })();
    const range = nextMilestone.followers - prevThreshold;
    return Math.min(1, Math.max(0, (followers - prevThreshold) / range));
  }, [followers, nextMilestone]);

  if (!character) return null;

  const posts = [...(character.socialPosts ?? [])].reverse();

  const handlePost = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Empty Post', 'Write something to share.');
      return;
    }
    const result = createSocialPost(trimmed);
    Alert.alert(result.ok ? 'Posted!' : 'Failed', result.message);
    if (result.ok) setContent('');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="LifeFeed"
            subtitle={`${followers.toLocaleString()} followers · ${currentTier}`}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Follower milestone card */}
          <View style={[styles.milestoneCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.milestoneRow}>
              <Text style={[styles.tierLabel, { color: colors.orchid, fontFamily: fonts.bodySemiBold }]}>
                {currentTier}
              </Text>
              {annualIncome > 0 && (
                <Text style={[styles.incomeLabel, { color: colors.teal, fontFamily: fonts.monoSemiBold }]}>
                  +{formatCurrency(annualIncome, countryCode)}/yr
                </Text>
              )}
            </View>
            {nextMilestone ? (
              <>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.orchid, width: `${Math.round(milestoneProgress * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.milestoneHint, { color: colors.t4, fontFamily: fonts.body }]}>
                  {(nextMilestone.followers - followers).toLocaleString()} more to unlock{' '}
                  <Text style={{ color: colors.t2 }}>{nextMilestone.label}</Text>
                  {' '}(+{formatCurrency(
                    getFollowerAnnualIncome(nextMilestone.followers, countryCode) - annualIncome,
                    countryCode,
                  )}/yr)
                </Text>
              </>
            ) : (
              <Text style={[styles.milestoneHint, { color: colors.gold, fontFamily: fonts.body }]}>
                Max tier reached! You are a global icon.
              </Text>
            )}
          </View>

          {/* Compose */}
          <View style={styles.compose}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What's happening in your life?"
              placeholderTextColor={colors.t4}
              style={styles.input}
              multiline
              maxLength={280}
            />
            <Pressable onPress={handlePost} style={[styles.postBtn, { backgroundColor: colors.orchid }]}>
              <Text style={[styles.postBtnText, { fontFamily: fonts.bodySemiBold, color: colors.bg }]}>Post</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Recent Posts</Text>
          {posts.length === 0 ? (
            <Text style={styles.empty}>No posts yet. Share your story!</Text>
          ) : (
            posts.map(p => (
              <View key={p.id} style={styles.postCard}>
                <Text style={styles.postMeta}>Age {p.age} · {p.platform} · Virality {p.virality}</Text>
                <Text style={styles.postContent}>{p.content}</Text>
                <Text style={styles.postDelta}>+{p.followerDelta} followers</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: spacing.lg },
  scroll: { padding: spacing.lg, gap: spacing.md },
  milestoneCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierLabel: { fontSize: 14 },
  incomeLabel: { fontSize: 13 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  milestoneHint: { fontSize: 12, lineHeight: 18 },
  compose: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.t1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  postBtnText: { fontSize: 13 },
  section: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t4, letterSpacing: 1.5, marginTop: spacing.md },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.t4 },
  postCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  postMeta: { fontFamily: fonts.body, fontSize: 10, color: colors.t4 },
  postContent: { fontFamily: fonts.body, fontSize: 14, color: colors.t1 },
  postDelta: { fontFamily: fonts.monoSemiBold, fontSize: 11, color: colors.teal },
});
