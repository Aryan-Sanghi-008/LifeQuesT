import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { AvatarByCharacter } from '../components/Avatars';
import { StatBar, Card, Badge, SectionLabel, Divider } from '../components/index';
import { ACHIEVEMENTS } from '../data/gameData';
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
  wrap: { flex: 1, gap: 4 },
  val:  { fontFamily: FONTS.monoSemiBold, fontSize: 18 },
  lbl:  { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─── Life Stat Row ─────────────────────────────────────────────────────────────
function LifeStatRow({ icon, label, value, color = COLORS.t2 }: {
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
  row:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  iconWrap:{ width: 28, height: 28, borderRadius: RADII.xs, backgroundColor: COLORS.bgCard2, alignItems: 'center', justifyContent: 'center' },
  label:   { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, flex: 1 },
  value:   { fontFamily: FONTS.bodySemiBold, fontSize: 14 },
});

// ─── Setting Toggle ───────────────────────────────────────────────────────────
function SettingRow({
  icon, label, desc, value, onChange,
}: { icon: React.ReactNode; label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={sr.row}>
      <View style={sr.iconWrap}>{icon}</View>
      <View style={sr.info}>
        <Text style={sr.label}>{label}</Text>
        {desc && <Text style={sr.desc}>{desc}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.bgCard2, true: `${COLORS.gold}40` }}
        thumbColor={value ? COLORS.gold : COLORS.t4}
      />
    </View>
  );
}
const sr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  iconWrap:{ width: 36, height: 36, borderRadius: RADII.sm, backgroundColor: COLORS.bgCard2, alignItems: 'center', justifyContent: 'center' },
  info:    { flex: 1 },
  label:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  desc:    { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character   = useGameStore(s => s.character);
  const resetGame   = useGameStore(s => s.resetGame);

  const [sound, setSound]   = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [notif, setNotif]   = useState(false);

  if (!character) return null;

  const { stats, name, age, country, countryFlag, job,
          zodiac, traits, karma, achievements, eventHistory,
          relationships, children, netWorthPeak, isPremium,
          coins, gems, bankBalance } = character;

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

  const totalEvents = eventHistory.length;
  const unlockedAch = achievements.length;

  const karmaLabel =
    karma < 0    ? 'Villain'  :
    karma < 50   ? 'Neutral'  :
    karma < 150  ? 'Decent'   :
    karma < 250  ? 'Virtuous' : 'Saint';

  const handleReset = () => {
    Alert.alert(
      'End This Life?',
      'This will permanently delete your character and start over. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => { void resetGame(); } },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero Section ─────────────────────────────────────── */}
          <LinearGradient
            colors={[COLORS.bg3, COLORS.bg2, COLORS.bg]}
            style={styles.hero}
          >
            {/* Accent orb */}
            <View style={styles.heroOrb} />

            <View style={styles.avatarContainer}>
              <View style={styles.avatarInner}>
                <AvatarByCharacter character={character} size={88} />
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path fill={COLORS.gold} d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z"/>
                  </Svg>
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroSub}>{job} · {countryFlag} {country}</Text>

            <View style={styles.heroBadges}>
              <Badge label={`Age ${age}`} color={COLORS.gold} />
              <Badge label={zodiac.charAt(0).toUpperCase() + zodiac.slice(1)} color={COLORS.orchid} />
              <Badge label={karmaLabel} color={karma > 100 ? COLORS.teal : COLORS.t3} />
            </View>

            {/* Mini stats strip — tap for full stats */}
            <Pressable onPress={() => navigation.navigate('Stats')} style={styles.miniStats}>
              <StatChip label="Health"  value={stats.health}     color={COLORS.crimson}  />
              <View style={styles.miniDivider} />
              <StatChip label="Joy"     value={stats.happiness}  color={COLORS.gold}     />
              <View style={styles.miniDivider} />
              <StatChip label="Mind"    value={stats.intelligence} color={COLORS.sapphire} />
              <View style={styles.miniDivider} />
              <StatChip label="Wealth"  value={stats.wealth}     color={COLORS.teal}     />
            </Pressable>
          </LinearGradient>

          {/* ── Bank Balance ─────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionLabel label="Finances" />
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md }}>
              <View>
                <Text style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, letterSpacing: 1.5, textTransform: 'uppercase' }}>Bank Balance</Text>
                <Text style={{ fontFamily: FONTS.displayBold, fontSize: 24, color: COLORS.teal, marginTop: 2 }}>{fmt(bankBalance)}</Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Shop')}
                style={[styles.premiumBtn, { backgroundColor: `${COLORS.gold}20`, borderColor: COLORS.goldBorder }]}
              >
                <Text style={styles.premiumBtnText}>Shop</Text>
              </Pressable>
            </Card>
          </View>

          {/* ── Life Stats ───────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionLabel label="Life Stats" />
            <Card>
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle stroke={COLORS.crimson} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" d="M12 8v4l3 3"/></Svg>}
                label="Years Lived"
                value={age}
                color={COLORS.t1}
              />
              <Divider />
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill={COLORS.teal}><Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></Svg>}
                label="Peak Wealth"
                value={`${netWorthPeak}/100`}
                color={COLORS.teal}
              />
              <Divider />
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.crimson} strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg>}
                label="Relationships"
                value={relationships}
                color={COLORS.crimson}
              />
              <Divider />
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><Circle stroke={COLORS.gold} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={COLORS.gold} strokeWidth={2} strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg>}
                label="Children"
                value={children}
                color={COLORS.gold}
              />
              <Divider />
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.orchid} strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg>}
                label="Achievements"
                value={`${unlockedAch} / ${ACHIEVEMENTS.length}`}
                color={COLORS.orchid}
              />
              <Divider />
              <LifeStatRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>}
                label="Life Events"
                value={totalEvents}
                color={COLORS.sapphire}
              />
            </Card>
          </View>

          {/* ── Traits ───────────────────────────────────────────── */}
          {traits.length > 0 && (
            <View style={styles.section}>
              <SectionLabel label="Personality Traits" />
              <View style={styles.traitRow}>
                {traits.map(t => (
                  <View key={t} style={styles.traitChip}>
                    <Text style={styles.traitText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Currency ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionLabel label="Wallet" />
            <Card style={styles.walletCard}>
              <View style={styles.walletRow}>
                <View style={styles.walletItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill={COLORS.gold}><Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}20`} stroke={COLORS.gold} strokeWidth={2}/></Svg>
                  <Text style={styles.walletVal}>{coins.toLocaleString()}</Text>
                  <Text style={styles.walletLbl}>Coins</Text>
                </View>
                <View style={styles.walletDivider} />
                <View style={styles.walletItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path fill={COLORS.orchid} d="M12 2L2 9l10 13L22 9z" opacity={0.9}/></Svg>
                  <Text style={[styles.walletVal, { color: COLORS.orchid }]}>{gems}</Text>
                  <Text style={styles.walletLbl}>Gems</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* ── Settings ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionLabel label="Settings" />
            <Card style={{ gap: 0 }}>
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M9 18V5l12-2v13"/><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="6" cy="18" r="3"/><Circle stroke={COLORS.sapphire} strokeWidth={2} cx="18" cy="16" r="3"/></Svg>}
                label="Sound Effects"
                desc="In-game sounds and music"
                value={sound}
                onChange={setSound}
              />
              <Divider />
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><Path stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" d="M13.73 21a2 2 0 01-3.46 0"/></Svg>}
                label="Notifications"
                desc="Daily life reminders"
                value={notif}
                onChange={setNotif}
              />
              <Divider />
              <SettingRow
                icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>}
                label="Haptic Feedback"
                desc="Vibration on button press"
                value={haptic}
                onChange={setHaptic}
              />
            </Card>
          </View>

          {/* ── Premium Status ─────────────────────────────────── */}
          {!isPremium && (
            <View style={styles.section}>
              <Pressable onPress={() => Alert.alert('Get Premium', 'Unlock all features for ₹299/mo — no ads, all life paths, 3x boosts.', [{ text: 'Not Now', style: 'cancel' }, { text: 'Get Premium', onPress: () => {} }])}>
                <Card style={[styles.premiumCard, { borderColor: `${COLORS.gold}30` }]}>
                  <View style={styles.premiumRow}>
                    <View>
                      <Text style={styles.premiumTitle}>Get Premium</Text>
                      <Text style={styles.premiumSub}>No ads · All life paths · Boosts</Text>
                    </View>
                    <View style={[styles.premiumBtn, { backgroundColor: `${COLORS.gold}20`, borderColor: COLORS.goldBorder }]}>
                      <Text style={styles.premiumBtnText}>₹299/mo</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </View>
          )}

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionLabel label="Danger Zone" />
            <Pressable onPress={handleReset} style={styles.resetBtn} android_ripple={{ color: `${COLORS.crimson}20` }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </Svg>
              <Text style={styles.resetText}>End This Life & Start Over</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>LifeQuest v1.0.0 · Built with love</Text>
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
    alignItems: 'center', paddingBottom: SPACING.xxl, paddingTop: SPACING.xl,
    gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    overflow: 'hidden', position: 'relative',
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: `${COLORS.gold}05`, top: -60, alignSelf: 'center',
  },
  avatarContainer: { position: 'relative' },
  avatarInner: { borderRadius: 52, borderWidth: 2.5, borderColor: COLORS.goldBorder, overflow: 'hidden' },
  premiumBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.bg,
  },
  heroName:   { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1 },
  heroSub:    { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3 },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },

  miniStats:   { flexDirection: 'row', gap: 0, marginTop: SPACING.md, width: '90%', backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  miniDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },

  // Sections
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  // Traits
  traitRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  traitChip: { paddingHorizontal: SPACING.md, paddingVertical: 8, backgroundColor: `${COLORS.orchid}12`, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.orchidBorder },
  traitText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.orchid },

  // Wallet
  walletCard: { padding: SPACING.lg },
  walletRow:  { flexDirection: 'row', alignItems: 'center' },
  walletItem: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  walletVal:  { fontFamily: FONTS.displayBold, fontSize: 24, color: COLORS.gold },
  walletLbl:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  walletDivider: { width: 1, height: 48, backgroundColor: COLORS.border },

  // Premium card
  premiumCard: { gap: 0 },
  premiumRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  premiumTitle:{ fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.gold2 },
  premiumSub:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 2 },
  premiumBtn:  { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADII.sm, borderWidth: 1 },
  premiumBtnText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.gold },

  // Reset
  resetBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, borderRadius: RADII.md,
    backgroundColor: `${COLORS.crimson}08`, borderWidth: 1.5,
    borderColor: `${COLORS.crimson}30`,
  },
  resetText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.crimson },

  footer:    { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textAlign: 'center', paddingTop: SPACING.xl },
});
