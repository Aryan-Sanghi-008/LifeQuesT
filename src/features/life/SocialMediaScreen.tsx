import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { ScreenHeader } from '@components/ScreenHeader';
import { useGameStore } from '@store/gameStore';
import { SOCIAL_PLATFORMS } from '@data/socialPlatforms';
import {
  ensureSocialMedia,
  getMaxEnergy,
  getNextFollowerMilestone,
  getFollowerAnnualIncome,
  getGlobalFame,
  FOLLOWER_MILESTONES,
  canUnlockPlatform,
} from '@engine/socialMediaEngine';
import { formatCurrency } from '@utils/currency';
import type { RootStackParamList, SocialPlatformId } from '@/types';
import { LockedPlatformSheet } from './social/components/LockedPlatformSheet';

/** Append 2-digit hex alpha to a #RRGGBB (or #RGB) color. Falls back to input if parse fails. */
function withAlpha(hex: string, alpha01: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha01)) * 255)
    .toString(16)
    .padStart(2, '0');
  const raw = hex.replace('#', '');
  if (raw.length === 3) {
    const expanded = raw
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded}${a}`;
  }
  if (raw.length === 6) return `#${raw}${a}`;
  return hex;
}

export function SocialMediaScreen() {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  const unlockSocialPlatform = useGameStore((s) => s.unlockSocialPlatform);

  const [previewId, setPreviewId] = useState<SocialPlatformId | null>(null);

  const social = useMemo(
    () => (character ? ensureSocialMedia(character) : null),
    [character],
  );

  const countryCode = character?.countryCode ?? 'US';
  const maxEnergy = character ? getMaxEnergy(character) : 4;
  const energyLeft = Math.max(0, maxEnergy - (social?.energySpentThisAge ?? 0));
  const totalFollowers = character?.socialFollowers ?? 0;
  const globalFame = social ? getGlobalFame(social) : 0;
  const nextMilestone = getNextFollowerMilestone(totalFollowers);
  const annualIncome = getFollowerAnnualIncome(totalFollowers, countryCode, character?.traits ?? []);

  const empireYtd = useMemo(() => {
    let earn = 0;
    let spend = 0;
    if (!social) return { earn, spend };
    for (const acc of Object.values(social.platforms)) {
      if (!acc) continue;
      earn += acc.earningsYtd;
      spend += acc.expensesYtd;
    }
    return { earn, spend };
  }, [social]);

  const currentTier = useMemo(() => {
    let tier = 'Newcomer';
    for (const m of FOLLOWER_MILESTONES) {
      if (totalFollowers >= m.followers) tier = m.label;
    }
    return tier;
  }, [totalFollowers]);

  const previewPlatform = previewId
    ? SOCIAL_PLATFORMS.find((p) => p.id === previewId) ?? null
    : null;

  if (!character || !social) return null;

  const openPlatform = (platformId: SocialPlatformId) => {
    const ageOk = canUnlockPlatform(character, platformId);
    const acc = social.platforms[platformId];

    if (!ageOk) {
      setPreviewId(platformId);
      return;
    }

    if (!acc?.unlocked) {
      setPreviewId(platformId);
      return;
    }

    navigation.navigate('SocialPlatform', { platformId });
  };

  const handleOpenFromSheet = () => {
    if (!previewId) return;
    const result = unlockSocialPlatform(previewId);
    if (!result.ok) {
      Alert.alert('Locked', result.message);
      return;
    }
    setPreviewId(null);
    navigation.navigate('SocialPlatform', { platformId: previewId });
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

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.summary, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 18 }}>
              {totalFollowers.toLocaleString()} followers
            </Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, marginTop: 4 }}>
              Global fame {globalFame} · {currentTier}
            </Text>
            <Text style={{ color: colors.emerald, fontFamily: fonts.body, fontSize: 12, marginTop: 8 }}>
              YTD earn {formatCurrency(empireYtd.earn, countryCode)} · spend{' '}
              {formatCurrency(empireYtd.spend, countryCode)}
              {annualIncome > 0 ? ` · passive ~${formatCurrency(annualIncome, countryCode)}/yr` : ''}
            </Text>
            {nextMilestone ? (
              <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
                Next: {nextMilestone.label} at {nextMilestone.followers.toLocaleString()}
              </Text>
            ) : null}
          </View>

          <Text style={[styles.section, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>
            PLATFORMS
          </Text>
          <View style={styles.grid}>
            {SOCIAL_PLATFORMS.map((p) => {
              const acc = social.platforms[p.id];
              const ageOk = character.age >= p.unlockAge;
              const unlocked = Boolean(acc?.unlocked);
              const followers = acc?.followers ?? 0;
              const fame = acc?.fameScore ?? 0;
              const net = (acc?.earningsYtd ?? 0) - (acc?.expensesYtd ?? 0);
              const staffCount = acc?.staff.length ?? 0;

              return (
                <Pressable
                  key={p.id}
                  onPress={() => openPlatform(p.id)}
                  accessibilityLabel={`${p.label}${ageOk ? '' : ' locked'}`}
                  style={styles.gridItem}
                >
                  <LinearGradient
                    colors={p.theme.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.platformCard, { opacity: ageOk ? 1 : 0.72 }]}
                  >
                    <View style={styles.cardTop}>
                      <View
                        style={[
                          styles.glyph,
                          { backgroundColor: withAlpha(p.theme.textOnAccent, 0.25) },
                        ]}
                      >
                        <Text
                          style={{
                            color: p.theme.textOnAccent,
                            fontFamily: fonts.bodyBold,
                            fontSize: 12,
                          }}
                        >
                          {p.theme.glyph}
                        </Text>
                      </View>
                      {!ageOk ? (
                        <View
                          style={[
                            styles.lockBadge,
                            { backgroundColor: withAlpha(p.theme.textOnAccent, 0.45) },
                          ]}
                        >
                          <Text
                            style={{
                              color: p.theme.textOnAccent,
                              fontFamily: fonts.bodySemiBold,
                              fontSize: 9,
                            }}
                          >
                            AGE {p.unlockAge}
                          </Text>
                        </View>
                      ) : !unlocked ? (
                        <View
                          style={[
                            styles.lockBadge,
                            { backgroundColor: withAlpha(p.theme.textOnAccent, 0.45) },
                          ]}
                        >
                          <Text
                            style={{
                              color: p.theme.textOnAccent,
                              fontFamily: fonts.bodySemiBold,
                              fontSize: 9,
                            }}
                          >
                            TAP TO OPEN
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={{
                        color: p.theme.textOnAccent,
                        fontFamily: fonts.bodyBold,
                        fontSize: 15,
                        marginTop: 8,
                      }}
                    >
                      {p.label}
                    </Text>
                    <Text
                      style={{
                        color: p.theme.textOnAccent,
                        opacity: 0.85,
                        fontFamily: fonts.body,
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {p.niche}
                    </Text>
                    <Text
                      style={{
                        color: p.theme.textOnAccent,
                        fontFamily: fonts.body,
                        fontSize: 11,
                        marginTop: 8,
                      }}
                    >
                      {followers.toLocaleString()} · Fame {fame}
                    </Text>
                    <Text
                      style={{
                        color: p.theme.textOnAccent,
                        opacity: 0.9,
                        fontFamily: fonts.body,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      Net {formatCurrency(net, countryCode)} · Staff {staffCount}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {previewPlatform ? (
          <LockedPlatformSheet
            platform={previewPlatform}
            visible={Boolean(previewId)}
            characterAge={character.age}
            countryCode={countryCode}
            canOpen={canUnlockPlatform(character, previewPlatform.id)}
            onClose={() => setPreviewId(null)}
            onOpen={handleOpenFromSheet}
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    safe: { flex: 1 },
    headerWrap: { paddingHorizontal: spacing.lg },
    scroll: { padding: spacing.lg, paddingBottom: 48 },
    summary: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: 12 },
    section: { fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', marginBottom: 12 },
    platformCard: {
      borderRadius: radii.md,
      padding: spacing.md,
      minHeight: 140,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    glyph: {
      width: 28,
      height: 28,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lockBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: radii.xs,
    },
  });
