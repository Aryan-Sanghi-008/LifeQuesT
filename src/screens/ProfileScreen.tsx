import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '../constants/theme';
import { RootStackParamList, AvatarStyleId } from '../types';
import { useGameStore } from '../store/gameStore';
import { AvatarByCharacter } from '../components/Avatars';
import { StatBar, Card, Badge, SectionLabel, Divider } from '../components/index';
import { ACHIEVEMENTS } from '../data/gameData';
import { formatCurrency } from '../utils/currency';
import { formatCount } from '../utils/formatCount';
import { getPrivacyPolicyUrl, getTermsUrl, openLegalUrl } from '../config/legal';
import { getNotificationsEnabled, getHapticsEnabled, setHapticsEnabled, getSoundEnabled, setSoundEnabled } from '../services/persistence';
import { setNotificationsPreference } from '../services/notifications';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={chip.wrap}>
      <Text style={[chip.val, { color }]}>{value}</Text>
      <Text style={chip.lbl}>{label}</Text>
      <StatBar value={value} color={color} height={3} />
    </View>
  );
}

const chip = StyleSheet.create({
  wrap: { flex: 1, gap: 4, alignItems: 'center' },
  val:  { fontFamily: FONTS.bodyBold, fontSize: 22 },
  lbl:  { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─── Life Stat Row ─────────────────────────────────────────────────────────────

function LifeStatRow({ icon, label, value, color = COLORS.t1 }: {
  icon: React.ReactNode; label: string; value: string | number; color?: string;
}) {
  return (
    <View style={lsr.row}>
      <View style={lsr.iconWrap}>{icon}</View>
      <Text style={lsr.label}>{label}</Text>
      <Text style={[lsr.value, { color }]}>{value}</Text>
    </View>
  );
}

const lsr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm + 2 },
  iconWrap:{ width: 32, height: 32, borderRadius: RADII.xs, backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center' },
  label:   { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, flex: 1 },
  value:   { fontFamily: FONTS.bodyBold, fontSize: 14 },
});

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({ icon, label, desc, value, onChange, iconBg }: {
  icon: React.ReactNode; label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; iconBg?: string;
}) {
  return (
    <View style={sr.row}>
      <View style={[sr.iconWrap, { backgroundColor: iconBg ?? COLORS.bg2 }]}>{icon}</View>
      <View style={sr.info}>
        <Text style={sr.label}>{label}</Text>
        {desc && <Text style={sr.desc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.bg2, true: `${COLORS.sapphire}40` }}
        thumbColor={value ? COLORS.sapphire : COLORS.t4}
        ios_backgroundColor={COLORS.bg2}
      />
    </View>
  );
}

const sr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  iconWrap:{ width: 38, height: 38, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  info:    { flex: 1 },
  label:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  desc:    { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 2 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character  = useGameStore(s => s.character);
  const resetGame  = useGameStore(s => s.resetGame);
  const claimDailyBonus = useGameStore(s => s.claimDailyBonus);
  const dailyQuests = useGameStore(s => s.dailyQuests);
  const loadDailyQuests = useGameStore(s => s.loadDailyQuests);
  const claimQuestReward = useGameStore(s => s.claimQuestReward);
  const setAvatarStyle = useGameStore(s => s.setAvatarStyle);

  const [sound, setSound]   = useState(getSoundEnabled());
  const [notif, setNotif]   = useState(getNotificationsEnabled());
  const [haptic, setHaptic] = useState(getHapticsEnabled());

  useEffect(() => {
    loadDailyQuests();
  }, [loadDailyQuests]);

  const handleOpenPrivacy = async () => {
    try {
      await openLegalUrl(getPrivacyPolicyUrl());
    } catch {
      Alert.alert('Unable to open privacy policy', 'Set EXPO_PUBLIC_PRIVACY_POLICY_URL or deploy hosting.');
    }
  };

  const handleOpenTerms = async () => {
    try {
      await openLegalUrl(getTermsUrl());
    } catch {
      Alert.alert('Unable to open terms', 'Try again later.');
    }
  };

  if (!character) return null;

  const {
    stats, name, age, country, countryFlag, job,
    zodiac, traits, karma, achievements, eventHistory,
    relationships, children, isPremium,
    coins, gems, bankBalance, countryCode,
    avatarStyle, unlockedAvatarStyles, socialFollowers,
  } = character;

  const AVATAR_STYLE_LABELS: Record<AvatarStyleId, string> = {
    adventurer: 'Adventurer',
    'adventurer-neutral': 'Adventurer N',
    lorelei: 'Lorelei',
    'lorelei-neutral': 'Lorelei N',
    bottts: 'Bottts',
    notionists: 'Notionists',
    'big-smile': 'Big Smile',
  };

  const AVATAR_STYLE_OPTIONS: AvatarStyleId[] = [
    'adventurer', 'lorelei', 'bottts', 'notionists', 'big-smile',
  ];

  const cc = countryCode ?? 'IN';
  const bankStr = formatCurrency(bankBalance, cc);
  const unlockedAch = achievements.length;

  const karmaLabel =
    karma < 0    ? 'Villain'  :
    karma < 50   ? 'Neutral'  :
    karma < 150  ? 'Decent'   :
    karma < 250  ? 'Virtuous' : 'Saint';

  const karmaColor =
    karma < 0   ? COLORS.health :
    karma < 100 ? COLORS.t3    :
    karma < 200 ? COLORS.emerald : COLORS.gold;

  const lifeStage = age < 13 ? 'Childhood' : age < 18 ? 'Teenager' : age < 30 ? 'Young Adult' : age < 60 ? 'Adult' : 'Golden Years';
  const avatarRingColor = age < 13 ? COLORS.emerald : age < 18 ? COLORS.sapphire : age < 30 ? COLORS.catCareer : age < 60 ? COLORS.gold : COLORS.orchid;

  const handleClaimDailyBonus = () => {
    const result = claimDailyBonus();
    Alert.alert(result.ok ? 'Daily Bonus' : 'Come Back Tomorrow', result.message);
  };

  const handleReset = () => {
    Alert.alert(
      'End This Life?',
      'This will permanently delete your character and start over. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Life',
          style: 'destructive',
          onPress: () => {
            void resetGame().then(() => {
              navigation.reset({ index: 0, routes: [{ name: 'SaveSlots' }] });
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero ── */}
          <View style={styles.hero}>
            {/* Soft gradient banner */}
            <LinearGradient
              colors={[`${avatarRingColor}18`, `${avatarRingColor}04`, COLORS.bg]}
              style={StyleSheet.absoluteFill}
            />

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarRing, { borderColor: `${avatarRingColor}60` }]}>
                <AvatarByCharacter character={character} size={88} />
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill={COLORS.gold}>
                    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </Svg>
                </View>
              )}
            </View>

            <View style={styles.avatarStyleRow}>
              {AVATAR_STYLE_OPTIONS.map(style => {
                const unlocked = (unlockedAvatarStyles ?? [avatarStyle ?? 'adventurer']).includes(style);
                const active = (avatarStyle ?? 'adventurer') === style;
                return (
                  <Pressable
                    key={style}
                    disabled={!unlocked}
                    onPress={() => setAvatarStyle(style)}
                    style={[
                      styles.avatarStyleChip,
                      active && styles.avatarStyleChipActive,
                      !unlocked && { opacity: 0.35 },
                    ]}
                  >
                    <Text style={[styles.avatarStyleChipText, active && { color: COLORS.gold }]}>
                      {AVATAR_STYLE_LABELS[style]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroSub}>{job} · {countryFlag} {country}</Text>

            {/* Badges row */}
            <View style={styles.heroBadges}>
              <View style={[styles.lifeStagePill, { backgroundColor: `${avatarRingColor}15`, borderColor: `${avatarRingColor}30` }]}>
                <View style={[styles.lifeStageDot, { backgroundColor: avatarRingColor }]} />
                <Text style={[styles.lifeStageText, { color: avatarRingColor }]}>{lifeStage}</Text>
              </View>
              <Badge label={zodiac.charAt(0).toUpperCase() + zodiac.slice(1)} color={COLORS.orchid} />
              <Badge label={karmaLabel} color={karmaColor} />
            </View>

            {/* Quick stat strip — tappable */}
            <Pressable onPress={() => navigation.navigate('Stats')} style={styles.miniStats}>
              <StatChip label="Health"  value={stats.health}       color={COLORS.health}        />
              <View style={styles.miniDivider} />
              <StatChip label="Joy"     value={stats.happiness}    color={COLORS.gold}          />
              <View style={styles.miniDivider} />
              <StatChip label="Mind"    value={stats.intelligence} color={COLORS.intelligence}  />
              <View style={styles.miniDivider} />
              <StatChip label="Wealth"  value={stats.wealth}       color={COLORS.wealth}        />
            </Pressable>
          </View>

          {/* ── Finances ── */}
          <View style={styles.section}>
            <SectionLabel label="Finances" />
            <Card>
              <View style={styles.financeRow}>
                <View style={[styles.financeIconWrap, { backgroundColor: `${COLORS.wealth}12` }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill={COLORS.wealth}>
                    <Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.financeLabel}>Bank Balance</Text>
                  <Text style={[styles.financeVal, { color: COLORS.wealth }]}>{bankStr}</Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('Shop')}
                  style={[styles.shopBtn, { backgroundColor: `${COLORS.gold}12`, borderColor: `${COLORS.gold}30` }]}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path stroke={COLORS.gold3} strokeWidth={2} strokeLinecap="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <Path stroke={COLORS.gold3} strokeWidth={2} strokeLinecap="round" d="M3 6h18M16 10a4 4 0 01-8 0"/>
                  </Svg>
                  <Text style={styles.shopBtnText}>Shop</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          {/* ── Life Stats ── */}
          <View style={styles.section}>
            <SectionLabel label="Life Stats" />
            <Card style={{ gap: 0 }}>
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M12 6v6l4 2"/></Svg>} label="Years Lived" value={age} color={COLORS.t1} />
              <Divider />
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.health} strokeWidth={2} fill="none" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg>} label="Relationships" value={relationships} color={COLORS.health} />
              <Divider />
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.gold} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={COLORS.gold} strokeWidth={2} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87"/></Svg>} label="Children" value={children} color={COLORS.gold} />
              <Divider />
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.social} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={COLORS.social} strokeWidth={2} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87"/></Svg>} label="Followers" value={formatCount(socialFollowers ?? 0)} color={COLORS.social} />
              <Divider />
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.orchid} strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg>} label="Achievements" value={`${unlockedAch} / ${ACHIEVEMENTS.length}`} color={COLORS.orchid} />
              <Divider />
              <LifeStatRow icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.catActivity} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>} label="Life Events" value={eventHistory.length} color={COLORS.catActivity} />
            </Card>
          </View>

          {/* ── Traits ── */}
          {traits.length > 0 && (
            <View style={styles.section}>
              <SectionLabel label="Personality Traits" />
              <View style={styles.traitRow}>
                {traits.map(t => (
                  <View key={t} style={styles.traitChip}>
                    <View style={[styles.traitDot, { backgroundColor: COLORS.orchid }]} />
                    <Text style={styles.traitText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Wallet ── */}
          <View style={styles.section}>
            <SectionLabel label="Wallet" />
            <Card>
              <View style={styles.walletRow}>
                <View style={styles.walletItem}>
                  <View style={[styles.walletIcon, { backgroundColor: `${COLORS.gold}15` }]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.gold}>
                      <Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}20`} stroke={COLORS.gold} strokeWidth={2}/>
                      <Path fill={COLORS.gold} d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V8h-3v.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </Svg>
                  </View>
                  <Text style={styles.walletVal}>{coins.toLocaleString()}</Text>
                  <Text style={styles.walletLbl}>Coins</Text>
                </View>
                <View style={styles.walletDivider} />
                <View style={styles.walletItem}>
                  <View style={[styles.walletIcon, { backgroundColor: `${COLORS.orchid}12` }]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path fill={COLORS.orchid} d="M12 2L2 9l10 13L22 9z" opacity={0.9}/>
                    </Svg>
                  </View>
                  <Text style={[styles.walletVal, { color: COLORS.orchid }]}>{gems}</Text>
                  <Text style={styles.walletLbl}>Gems</Text>
                </View>
              </View>
              <Pressable
                onPress={handleClaimDailyBonus}
                style={styles.dailyBonusBtn}
                accessibilityRole="button"
                accessibilityLabel="Claim daily bonus of 25 coins"
              >
                <Text style={styles.dailyBonusText}>Claim Daily Bonus (+25 coins)</Text>
              </Pressable>
              {dailyQuests.map(q => (
                <Pressable
                  key={q.id}
                  style={styles.dailyBonusBtn}
                  onPress={() => {
                    const result = claimQuestReward(q.id);
                    Alert.alert(result.ok ? 'Quest Complete' : 'Quest', result.message);
                  }}
                  accessibilityLabel={`Quest ${q.title}`}
                >
                  <Text style={styles.dailyBonusText}>
                    {q.title} ({q.progress}/{q.target}) — {q.rewardCoins}c
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.dailyBonusBtn}
                onPress={() => navigation.navigate('Leaderboard')}
                accessibilityLabel="View leaderboard"
              >
                <Text style={styles.dailyBonusText}>View Leaderboard</Text>
              </Pressable>
            </Card>
          </View>

          {/* ── Settings ── */}
          <View style={styles.section}>
            <SectionLabel label="Settings" />
            <Card style={{ gap: 0 }}>
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M9 18V5l12-2v13"/><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="6" cy="18" r="3"/><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="18" cy="16" r="3"/></Svg>}
                label="Sound Effects"
                desc="In-game sounds and music"
                value={sound}
                onChange={(v) => { setSound(v); setSoundEnabled(v); }}
                iconBg={`${COLORS.sapphire}12`}
              />
              <Divider />
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.emerald} strokeWidth={2} strokeLinecap="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></Svg>}
                label="Notifications"
                desc="Daily life reminders"
                value={notif}
                onChange={(v) => {
                  setNotif(v);
                  void setNotificationsPreference(v);
                }}
                iconBg={`${COLORS.emerald}12`}
              />
              <Divider />
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>}
                label="Haptic Feedback"
                desc="Vibration on button press"
                value={haptic}
                onChange={(v) => { setHaptic(v); setHapticsEnabled(v); }}
                iconBg={`${COLORS.orchid}12`}
              />
            </Card>
          </View>

          {/* ── Premium ── */}
          {!isPremium && (
            <View style={styles.section}>
              <Pressable onPress={() => Alert.alert('Get Premium', 'Remove ads, get 5 luck boosts, and cloud save priority.', [{ text: 'Not Now', style: 'cancel' }, { text: 'Get Premium', onPress: () => navigation.navigate('Shop') }])}>
                <LinearGradient
                  colors={[`${COLORS.gold2}30`, `${COLORS.gold}18`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.premiumCard, { borderColor: `${COLORS.gold}30` }]}
                >
                  <View style={[styles.premiumIcon, { backgroundColor: `${COLORS.gold}20` }]}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill={COLORS.gold}>
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.premiumTitle}>Get Premium</Text>
                    <Text style={styles.premiumSub}>No ads · 5 luck boosts · Cloud save priority</Text>
                  </View>
                  <View style={[styles.premiumPriceTag, { backgroundColor: COLORS.gold, borderRadius: RADII.sm }]}>
                    <Text style={styles.premiumPrice}>Premium</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* ── Legal ── */}
          <View style={styles.section}>
            <SectionLabel label="Legal" />
            <Card style={{ gap: 0 }}>
              <Pressable onPress={() => void handleOpenPrivacy()} style={styles.legalRow}>
                <Text style={styles.legalRowText}>Privacy Policy</Text>
              </Pressable>
              <Divider />
              <Pressable onPress={() => void handleOpenTerms()} style={styles.legalRow}>
                <Text style={styles.legalRowText}>Terms of Service</Text>
              </Pressable>
            </Card>
          </View>

          {/* ── Danger Zone ── */}
          <View style={styles.section}>
            <SectionLabel label="Danger Zone" />
            <Pressable
              onPress={handleReset}
              style={styles.resetBtn}
              android_ripple={{ color: `${COLORS.health}18` }}
            >
              <View style={[styles.resetIcon, { backgroundColor: `${COLORS.health}12` }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path stroke={COLORS.health} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </Svg>
              </View>
              <Text style={styles.resetText}>End This Life & Start Over</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>LifeQuesT · Built with purpose</Text>
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: COLORS.bg },
  safe:  { flex: 1 },
  scroll:{ flexGrow: 1 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: { position: 'relative' },
  avatarRing: { borderRadius: 54, borderWidth: 3, overflow: 'hidden', ...SHADOWS.card },
  avatarStyleRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  avatarStyleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  avatarStyleChipActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}12` },
  avatarStyleChipText: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.t3 },
  premiumBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.bgCard,
  },
  heroName:   { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1 },
  heroSub:    { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3 },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs, flexWrap: 'wrap', justifyContent: 'center' },
  lifeStagePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADII.full, borderWidth: 1 },
  lifeStageDot:  { width: 5, height: 5, borderRadius: 3 },
  lifeStageText: { fontFamily: FONTS.bodySemiBold, fontSize: 11 },
  miniStats:     { flexDirection: 'row', marginTop: SPACING.md, width: '92%', backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, ...SHADOWS.subtle },
  miniDivider:   { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },

  // Sections
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  // Finance
  financeRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  financeIconWrap:{ width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  financeLabel:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textTransform: 'uppercase', letterSpacing: 0.8 },
  financeVal:    { fontFamily: FONTS.bodyBold, fontSize: 22, marginTop: 2 },
  shopBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADII.sm, borderWidth: 1 },
  shopBtnText:   { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.gold3 },

  // Traits
  traitRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  traitChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 8, backgroundColor: `${COLORS.orchid}10`, borderRadius: RADII.full, borderWidth: 1.5, borderColor: `${COLORS.orchid}25` },
  traitDot:  { width: 5, height: 5, borderRadius: 3 },
  traitText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.orchid },

  // Wallet
  walletRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  walletItem:   { flex: 1, alignItems: 'center', gap: SPACING.xs },
  walletIcon:   { width: 48, height: 48, borderRadius: RADII.md, alignItems: 'center', justifyContent: 'center' },
  walletVal:    { fontFamily: FONTS.bodyBold, fontSize: 26, color: COLORS.gold3 },
  walletLbl:    { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  walletDivider:{ width: 1, height: 56, backgroundColor: COLORS.border },

  // Premium
  premiumCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADII.lg, borderWidth: 1.5 },
  premiumIcon: { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  premiumTitle:{ fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.gold3 },
  premiumSub:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 2 },
  premiumPriceTag:{ paddingHorizontal: 10, paddingVertical: 6 },
  premiumPrice:{ fontFamily: FONTS.bodyBold, fontSize: 12, color: '#FFFFFF' },

  // Reset
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, borderRadius: RADII.md,
    backgroundColor: `${COLORS.health}08`, borderWidth: 1.5,
    borderColor: `${COLORS.health}28`,
  },
  resetIcon: { width: 36, height: 36, borderRadius: RADII.xs, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.health },
  legalRow: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  legalRowText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.sapphire },
  dailyBonusBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: `${COLORS.gold}15`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}35`,
    alignItems: 'center',
  },
  dailyBonusText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.gold3 },

  footer: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textAlign: 'center', paddingTop: SPACING.xl },
});
