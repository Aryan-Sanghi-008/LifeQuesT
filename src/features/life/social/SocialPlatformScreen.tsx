import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { HorizontalChipTabBar } from '@components/HorizontalChipTabBar';
import { useGameStore } from '@store/gameStore';
import { getSocialPlatform } from '@data/socialPlatforms';
import {
  ensureSocialMedia,
  getNextFollowerMilestone,
  getPlatformMetrics,
  getPlatformForecast,
  getProductionCostLocal,
  getStaffMonthlyCostLocal,
  estimateMonetizationPayout,
  STAFF_DEFS,
  FOLLOWER_MILESTONES,
} from '@engine/socialMediaEngine';
import { formatCurrency, formatCurrencyFull, getCurrencyInfo } from '@utils/currency';
import type {
  RootStackParamList,
  SocialContentType,
  SocialStaffRole,
} from '@/types';
import { MetricTile } from './components/MetricTile';
import { LedgerRow } from './components/LedgerRow';
import { PostFeedCard } from './components/PostFeedCard';
import { StaffRoleCard } from './components/StaffRoleCard';
import { MonetizeActionCard } from './components/MonetizeActionCard';

type TabId = 'overview' | 'compose' | 'staff' | 'earn' | 'activity';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'compose', label: 'Compose' },
  { id: 'staff', label: 'Staff' },
  { id: 'earn', label: 'Earn' },
  { id: 'activity', label: 'Activity' },
];

export function SocialPlatformScreen() {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocialPlatform'>>();
  const platformId = route.params.platformId;
  const platform = getSocialPlatform(platformId);

  const character = useGameStore((s) => s.character);
  const createSocialPost = useGameStore((s) => s.createSocialPost);
  const hireSocialStaff = useGameStore((s) => s.hireSocialStaff);
  const fireSocialStaff = useGameStore((s) => s.fireSocialStaff);
  const runSocialMonetization = useGameStore((s) => s.runSocialMonetization);

  const [tab, setTab] = useState<TabId>('overview');
  const [contentType, setContentType] = useState<SocialContentType>(
    platform?.featuredContent[0] ?? 'text',
  );
  const [content, setContent] = useState('');
  const [marketingSpend, setMarketingSpend] = useState('0');
  const [activityFilter, setActivityFilter] = useState<'all' | 'spend' | 'income'>('all');

  const social = useMemo(
    () => (character ? ensureSocialMedia(character) : null),
    [character],
  );
  const account = social?.platforms[platformId];
  const countryCode = character?.countryCode ?? 'US';
  const { symbol } = getCurrencyInfo(countryCode);
  const metrics = account ? getPlatformMetrics(account) : null;
  const forecast = character
    ? getPlatformForecast(character, platformId)
    : { nextAgeUpPayroll: 0, energyLeft: 0, energyMax: 4, estimatedAdsPayout: 0 };

  const currentTier = useMemo(() => {
    let tier = 'Newcomer';
    const followers = metrics?.followers ?? 0;
    for (const m of FOLLOWER_MILESTONES) {
      if (followers >= m.followers) tier = m.label;
    }
    return tier;
  }, [metrics?.followers]);

  if (!character || !social || !platform) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, padding: 16 }}>
          Platform not found
        </Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.orchid, fontFamily: fonts.bodySemiBold }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const nextMilestone = getNextFollowerMilestone(metrics?.followers ?? 0);

  const prodCost = getProductionCostLocal(platformId, contentType, countryCode);
  const mktNum = Math.max(0, Math.round(Number(marketingSpend) || 0));
  const totalPostCost = prodCost + mktNum;

  const posts = [...(account?.posts ?? [])].reverse();
  const ledger = [...(account?.ledger ?? [])].reverse();
  const filteredLedger = ledger.filter((e) => {
    if (activityFilter === 'spend') return e.amount < 0;
    if (activityFilter === 'income') return e.amount > 0;
    return true;
  });

  const handlePost = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Empty Post', 'Write something to share.');
      return;
    }
    const result = createSocialPost(trimmed, {
      platformId,
      contentType,
      marketingSpend: mktNum,
    });
    Alert.alert(result.ok ? 'Posted!' : 'Failed', result.message);
    if (result.ok) {
      setContent('');
      setMarketingSpend('0');
      setTab('overview');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient
          colors={platform.theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back to Social Empire"
            style={styles.backChip}
          >
            <Text style={{ color: platform.theme.textOnAccent, fontFamily: fonts.bodySemiBold }}>
              ← Empire
            </Text>
          </Pressable>
          <Text style={{ color: platform.theme.textOnAccent, fontFamily: fonts.displayBold, fontSize: 24 }}>
            {platform.label}
          </Text>
          <Text
            style={{
              color: platform.theme.textOnAccent,
              opacity: 0.9,
              fontFamily: fonts.body,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {platform.niche} · {currentTier} · Fame {metrics?.fameScore ?? 0}
          </Text>
          <Text
            style={{
              color: platform.theme.textOnAccent,
              opacity: 0.8,
              fontFamily: fonts.body,
              fontSize: 12,
              marginTop: 6,
            }}
          >
            Energy {forecast.energyLeft}/{forecast.energyMax} · Payroll next Age Up{' '}
            {formatCurrency(forecast.nextAgeUpPayroll, countryCode)}
          </Text>
        </LinearGradient>

        <HorizontalChipTabBar
          tabs={TABS}
          activeId={tab}
          onSelect={setTab}
          activeColors={{
            border: platform.theme.accent,
            background: platform.theme.accentSoft,
            text: platform.theme.accent,
          }}
          inactiveColors={{
            border: colors.border,
            background: colors.bgCard,
            text: colors.t3,
          }}
        />

        <ScrollView contentContainerStyle={styles.scroll} style={{ backgroundColor: colors.bg }}>
          {tab === 'overview' && metrics ? (
            <>
              <View style={styles.metricGrid}>
                <MetricTile
                  label={platform.metricLabels.followers}
                  value={metrics.followers.toLocaleString()}
                  accent={platform.theme.accent}
                />
                {platform.metricLabels.secondary ? (
                  <MetricTile
                    label={platform.metricLabels.secondary}
                    value={metrics.subscribers.toLocaleString()}
                  />
                ) : (
                  <MetricTile label="Subscribers" value={metrics.subscribers.toLocaleString()} />
                )}
                <MetricTile
                  label={platform.metricLabels.views}
                  value={metrics.totalViews.toLocaleString()}
                />
                <MetricTile label="Likes" value={metrics.totalLikes.toLocaleString()} />
                <MetricTile label="Comments" value={metrics.totalComments.toLocaleString()} />
                <MetricTile
                  label={platform.metricLabels.engagement}
                  value={`${(metrics.engagementRate * 100).toFixed(1)}%`}
                />
                <MetricTile label="Avg views/post" value={metrics.avgViewsPerPost.toLocaleString()} />
                <MetricTile label="Avg virality" value={String(metrics.avgVirality)} />
                <MetricTile label="Fame" value={String(metrics.fameScore)} accent={platform.theme.accent} />
                <MetricTile label="Posts" value={String(metrics.postCount)} />
                <MetricTile
                  label="YTD earn"
                  value={formatCurrency(metrics.earningsYtd, countryCode)}
                  accent={colors.emerald}
                />
                <MetricTile
                  label="YTD spend"
                  value={formatCurrency(metrics.expensesYtd, countryCode)}
                  accent={colors.crimson}
                />
                <MetricTile
                  label="YTD net"
                  value={formatCurrency(metrics.netYtd, countryCode)}
                  accent={metrics.netYtd >= 0 ? colors.emerald : colors.crimson}
                />
                <MetricTile
                  label="Monthly payroll"
                  value={formatCurrency(metrics.monthlyPayroll, countryCode)}
                  sub="Charged once per Age Up"
                />
              </View>

              {nextMilestone ? (
                <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <Text style={{ color: colors.t4, fontFamily: fonts.bodySemiBold, fontSize: 10 }}>
                    NEXT MILESTONE
                  </Text>
                  <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, marginTop: 4 }}>
                    {nextMilestone.label} · {nextMilestone.followers.toLocaleString()} followers
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: colors.bg2 }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: platform.theme.accent,
                          width: `${Math.min(
                            100,
                            ((metrics.followers / nextMilestone.followers) * 100) || 0,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ) : null}

              <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>
                STAFF ({account?.staff.length ?? 0})
              </Text>
              {(account?.staff ?? []).length === 0 ? (
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No staff hired yet.</Text>
              ) : (
                (account?.staff ?? []).map((s) => (
                  <View
                    key={s.id}
                    style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
                  >
                    <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold }}>
                      {STAFF_DEFS[s.role].label} — {formatCurrencyFull(s.monthlyCost, countryCode)}/mo
                    </Text>
                    <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
                      Hired at age {s.hiredAge}
                    </Text>
                  </View>
                ))
              )}

              <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>
                RECENT POSTS
              </Text>
              {posts.length === 0 ? (
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No posts yet.</Text>
              ) : (
                posts.slice(0, 5).map((p) => (
                  <PostFeedCard
                    key={p.id}
                    post={p}
                    countryCode={countryCode}
                    accent={platform.theme.accentSoft}
                  />
                ))
              )}
            </>
          ) : null}

          {tab === 'compose' ? (
            <>
              <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13, marginBottom: 8 }}>
                {platform.blurb}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {platform.featuredContent.concat(
                    (['text', 'photo', 'video', 'short', 'live'] as SocialContentType[]).filter(
                      (t) => !platform.featuredContent.includes(t),
                    ),
                  ).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setContentType(t)}
                      accessibilityLabel={`Content type ${t}`}
                      style={[
                        styles.chip,
                        {
                          borderColor: contentType === t ? platform.theme.accent : colors.border,
                          backgroundColor:
                            contentType === t ? platform.theme.accentSoft : colors.bgCard,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: contentType === t ? platform.theme.accent : colors.t3,
                          fontFamily: fonts.bodySemiBold,
                          fontSize: 11,
                        }}
                      >
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
                style={[
                  styles.input,
                  {
                    color: colors.t1,
                    borderColor: colors.border,
                    backgroundColor: colors.bgCard,
                    fontFamily: fonts.body,
                  },
                ]}
                multiline
                maxLength={280}
              />
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12, marginBottom: 4 }}>
                Marketing ({symbol}) — local bank currency
              </Text>
              <TextInput
                value={marketingSpend}
                onChangeText={setMarketingSpend}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.t4}
                style={[
                  styles.input,
                  {
                    color: colors.t1,
                    borderColor: colors.border,
                    backgroundColor: colors.bgCard,
                    fontFamily: fonts.body,
                    minHeight: 44,
                  },
                ]}
              />
              <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                  Production {formatCurrencyFull(prodCost, countryCode)}
                </Text>
                <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>
                  Marketing {formatCurrencyFull(mktNum, countryCode)}
                </Text>
                <Text
                  style={{
                    color: colors.t1,
                    fontFamily: fonts.bodyBold,
                    fontSize: 14,
                    marginTop: 6,
                  }}
                >
                  Total {formatCurrencyFull(totalPostCost, countryCode)} · 1 energy
                </Text>
                <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
                  Bank {formatCurrencyFull(character.bankBalance, countryCode)} · Energy{' '}
                  {forecast.energyLeft}/{forecast.energyMax}
                </Text>
              </View>
              <Pressable
                onPress={handlePost}
                accessibilityLabel={`Publish ${contentType}`}
                style={[styles.cta, { backgroundColor: platform.theme.accent }]}
              >
                <Text style={{ color: platform.theme.textOnAccent, fontFamily: fonts.displayBold }}>
                  Publish {contentType}
                </Text>
              </Pressable>
            </>
          ) : null}

          {tab === 'staff' ? (
            <>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginBottom: 8 }}>
                Staff costs are charged once per Age Up (one month each). Hiring is free now —
                payroll starts next Age Up.
              </Text>
              {(Object.keys(STAFF_DEFS) as SocialStaffRole[]).map((role) => {
                const hired = account?.staff.some((s) => s.role === role);
                return (
                  <StaffRoleCard
                    key={role}
                    role={role}
                    monthlyCost={getStaffMonthlyCostLocal(role, countryCode)}
                    countryCode={countryCode}
                    hired={hired}
                    accent={platform.theme.accent}
                    textOnAccent={platform.theme.textOnAccent}
                    onHire={() => {
                      const r = hireSocialStaff(platformId, role);
                      Alert.alert(r.ok ? 'Hired' : 'Failed', r.message);
                    }}
                  />
                );
              })}
              {(account?.staff ?? []).map((s) => (
                <Pressable
                  key={`fire-${s.id}`}
                  onPress={() => {
                    Alert.alert('Let go?', `Fire ${STAFF_DEFS[s.role].label}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Fire',
                        style: 'destructive',
                        onPress: () => {
                          const r = fireSocialStaff(platformId, s.id);
                          Alert.alert(r.ok ? 'Done' : 'Failed', r.message);
                        },
                      },
                    ]);
                  }}
                  accessibilityLabel={`Fire ${STAFF_DEFS[s.role].label}`}
                  style={[styles.chip, { borderColor: colors.crimson, alignSelf: 'flex-start' }]}
                >
                  <Text style={{ color: colors.crimson, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                    Fire {STAFF_DEFS[s.role].label}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}

          {tab === 'earn' ? (
            <>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginBottom: 8 }}>
                Each earn action can be used once per year on this platform. Grow followers to unlock
                better deals.
              </Text>
              {platform.monetization.map((action) => {
                const estimate = estimateMonetizationPayout(character, platformId, action.kind);
                const onCooldown = account?.monetizationCooldowns?.[action.kind] === character.age;
                return (
                  <MonetizeActionCard
                    key={action.kind}
                    action={action}
                    estimatedPayout={estimate.payout}
                    countryCode={countryCode}
                    lockedReason={estimate.ok ? undefined : estimate.message}
                    onCooldown={onCooldown}
                    accent={platform.theme.accent}
                    textOnAccent={platform.theme.textOnAccent}
                    onPress={() => {
                      const r = runSocialMonetization(platformId, action.kind);
                      Alert.alert(r.ok ? 'Success' : 'Failed', r.message);
                    }}
                  />
                );
              })}
            </>
          ) : null}

          {tab === 'activity' ? (
            <>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {(['all', 'spend', 'income'] as const).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setActivityFilter(f)}
                    accessibilityLabel={`Filter ${f}`}
                    style={[
                      styles.chip,
                      {
                        borderColor: activityFilter === f ? platform.theme.accent : colors.border,
                        backgroundColor:
                          activityFilter === f ? platform.theme.accentSoft : colors.bgCard,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: activityFilter === f ? platform.theme.accent : colors.t3,
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 11,
                        textTransform: 'capitalize',
                      }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {filteredLedger.length === 0 ? (
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No activity yet.</Text>
              ) : (
                filteredLedger.map((e) => (
                  <LedgerRow key={e.id} entry={e} countryCode={countryCode} />
                ))
              )}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
    backChip: { marginBottom: 8, alignSelf: 'flex-start' },
    backBtn: { padding: spacing.lg },
    scroll: { padding: spacing.lg, paddingBottom: 56 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: 8 },
    section: { fontSize: 10, letterSpacing: 1.2, marginTop: spacing.md, marginBottom: 6 },
    chip: { borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderRadius: radii.md,
      padding: spacing.md,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 8,
    },
    cta: { borderRadius: radii.md, padding: spacing.md, alignItems: 'center', marginBottom: 8 },
    progressTrack: { height: 8, borderRadius: radii.xs, marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: radii.xs },
  });
