import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme } from '@theme';
import { ScreenHeader } from '@components/ScreenHeader';
import { useGameStore } from '@store/gameStore';
import {
  SOCIAL_PLATFORMS,
  STAFF_DEFS,
  ensureSocialMedia,
  getMaxEnergy,
  getNextFollowerMilestone,
  getFollowerAnnualIncome,
  FOLLOWER_MILESTONES,
} from '../../engine/socialMediaEngine';
import { formatCurrency } from '@utils/currency';
import type { SocialContentType, SocialPlatformId, SocialStaffRole } from '@/types';

const CONTENT_TYPES: SocialContentType[] = ['text', 'photo', 'video', 'short', 'live'];

export function SocialMediaScreen() {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore((s) => s.character);
  const createSocialPost = useGameStore((s) => s.createSocialPost);
  const hireSocialStaff = useGameStore((s) => s.hireSocialStaff);
  const runSocialMonetization = useGameStore((s) => s.runSocialMonetization);

  const [platformId, setPlatformId] = useState<SocialPlatformId>('lifefeed');
  const [contentType, setContentType] = useState<SocialContentType>('text');
  const [content, setContent] = useState('');
  const [marketingSpend, setMarketingSpend] = useState('0');

  const social = useMemo(
    () => (character ? ensureSocialMedia(character) : null),
    [character],
  );
  const account = social?.platforms[platformId];
  const followers = account?.followers ?? character?.socialFollowers ?? 0;
  const countryCode = character?.countryCode ?? 'US';
  const nextMilestone = getNextFollowerMilestone(followers);
  const annualIncome = getFollowerAnnualIncome(followers, countryCode);
  const maxEnergy = character ? getMaxEnergy(character) : 4;
  const energyLeft = Math.max(0, maxEnergy - (social?.energySpentThisAge ?? 0));

  const currentTier = useMemo(() => {
    let tier = 'Newcomer';
    for (const m of FOLLOWER_MILESTONES) {
      if (followers >= m.followers) tier = m.label;
    }
    return tier;
  }, [followers]);

  if (!character || !social) return null;

  const posts = [...(account?.posts ?? [])].reverse();
  const fmt = (n: number) => formatCurrency(n, countryCode);

  const handlePost = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Empty Post', 'Write something to share.');
      return;
    }
    const result = createSocialPost(trimmed, {
      platformId,
      contentType,
      marketingSpend: Number(marketingSpend) || 0,
    });
    Alert.alert(result.ok ? 'Posted!' : 'Failed', result.message);
    if (result.ok) setContent('');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="Social Empire"
            subtitle={`${energyLeft}/${maxEnergy} energy · ${currentTier}`}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} horizontal={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SOCIAL_PLATFORMS.map((p) => {
                const unlocked = character.age >= p.unlockAge;
                const active = platformId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    disabled={!unlocked}
                    onPress={() => setPlatformId(p.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: active ? colors.orchid : colors.border,
                        backgroundColor: active ? `${colors.orchid}22` : colors.bgCard,
                        opacity: unlocked ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? colors.orchid : colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 16 }}>
              {SOCIAL_PLATFORMS.find((p) => p.id === platformId)?.label} account
            </Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
              {followers.toLocaleString()} followers
              {account?.subscribers ? ` · ${account.subscribers.toLocaleString()} subs` : ''}
            </Text>
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
              Likes {(account?.totalLikes ?? 0).toLocaleString()} · Views {(account?.totalViews ?? 0).toLocaleString()} · Comments {(account?.totalComments ?? 0).toLocaleString()}
            </Text>
            <Text style={{ color: colors.emerald, fontFamily: fonts.body, fontSize: 12, marginTop: 6 }}>
              YTD earn {fmt(account?.earningsYtd ?? 0)} · spend {fmt(account?.expensesYtd ?? 0)}
              {annualIncome > 0 ? ` · passive ~${fmt(annualIncome)}/yr` : ''}
            </Text>
            {nextMilestone ? (
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
                Next: {nextMilestone.label} at {nextMilestone.followers.toLocaleString()}
              </Text>
            ) : null}
          </View>

          <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>COMPOSE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {CONTENT_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setContentType(t)}
                  style={[styles.chip, { borderColor: contentType === t ? colors.gold : colors.border }]}
                >
                  <Text style={{ color: contentType === t ? colors.gold : colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Caption / script..."
            placeholderTextColor={colors.t4}
            style={[styles.input, { color: colors.t1, borderColor: colors.border, backgroundColor: colors.bgCard, fontFamily: fonts.body }]}
            multiline
            maxLength={280}
          />
          <TextInput
            value={marketingSpend}
            onChangeText={setMarketingSpend}
            keyboardType="number-pad"
            placeholder="Marketing spend (cash)"
            placeholderTextColor={colors.t4}
            style={[styles.input, { color: colors.t1, borderColor: colors.border, backgroundColor: colors.bgCard, fontFamily: fonts.body, minHeight: 44 }]}
          />
          <Pressable onPress={handlePost} style={[styles.cta, { backgroundColor: colors.orchid }]}>
            <Text style={{ color: '#FFF', fontFamily: fonts.displayBold }}>Publish {contentType}</Text>
          </Pressable>

          <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>STAFF</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(STAFF_DEFS) as SocialStaffRole[]).map((role) => (
              <Pressable
                key={role}
                onPress={() => {
                  const r = hireSocialStaff(platformId, role);
                  Alert.alert(r.ok ? 'Hired' : 'Failed', r.message);
                }}
                style={[styles.chip, { borderColor: colors.teal }]}
              >
                <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                  Hire {STAFF_DEFS[role].label}
                </Text>
              </Pressable>
            ))}
          </View>
          {(account?.staff ?? []).map((s) => (
            <Text key={s.id} style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
              · {STAFF_DEFS[s.role].label} — {fmt(s.monthlyCost)}/mo
            </Text>
          ))}

          <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>MONETIZE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['ads', 'sponsorship', 'brand_deal', 'super_thanks'] as const).map((kind) => (
              <Pressable
                key={kind}
                onPress={() => {
                  const r = runSocialMonetization(platformId, kind);
                  Alert.alert(r.ok ? 'Success' : 'Failed', r.message);
                }}
                style={[styles.chip, { borderColor: colors.gold }]}
              >
                <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                  {kind.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>RECENT POSTS</Text>
          {posts.length === 0 ? (
            <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No posts yet on this platform.</Text>
          ) : (
            posts.slice(0, 12).map((p) => (
              <View key={p.id} style={[styles.postCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={{ color: colors.t1, fontFamily: fonts.body, fontSize: 13 }}>{p.content}</Text>
                <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
                  Age {p.age} · {p.contentType ?? 'text'} · ❤️ {p.metrics?.likes ?? p.virality} · 👁 {p.metrics?.views ?? '—'} · 💬 {p.metrics?.comments ?? 0} · +{p.followerDelta} followers
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    safe: { flex: 1 },
    headerWrap: { paddingHorizontal: spacing.lg },
    scroll: { padding: spacing.lg, gap: 8, paddingBottom: 48 },
    card: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md },
    chip: { borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 8 },
    section: { fontSize: 10, letterSpacing: 1.2, marginTop: spacing.md, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderRadius: radii.md,
      padding: spacing.md,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 8,
    },
    cta: { borderRadius: radii.md, padding: 14, alignItems: 'center', marginBottom: 8 },
    postCard: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: 8 },
  });
