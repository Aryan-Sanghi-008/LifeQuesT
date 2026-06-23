import { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, SectionList, Pressable, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, SHADOWS, ANIM } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { AvatarByCharacter } from '../components/Avatars';
import EventCard from '../components/EventCard';
import DecisionSheet from '../components/DecisionSheet';
import { StatBar, Badge } from '../components/index';
import { LifeEventRecord, CharacterStats } from '../types';
import { maybeShowInterstitial } from '../services/ads';
import { INTERSTITIAL_EVERY_N_AGEUPS } from '../config/ads';
import { logEvent } from '../services/analytics';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── Currency Icons ───────────────────────────────────────────────────────────
function CoinIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill={COLORS.gold}>
      <Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}25`} stroke={COLORS.gold} strokeWidth={2} />
      <Path fill={COLORS.gold} d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </Svg>
  );
}

function BankIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 22h18M3 10h18M5 6l7-4 7 4M4 10v12M20 10v12M8 10v12M16 10v12M12 10v12" />
    </Svg>
  );
}

// ─── Age Up Button ────────────────────────────────────────────────────────────
function AgeUpButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const shimmer   = useRef(new Animated.Value(-1)).current;
  const scale     = useRef(new Animated.Value(1)).current;
  const pulseRing = useRef(new Animated.Value(0.85)).current;
  const ringOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2400, useNativeDriver: true, delay: 800 }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRing, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseRing, { toValue: 0.85, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.55, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const translateX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-200, 200] });

  return (
    <View style={ageBtn.wrap}>
      <Animated.View style={[ageBtn.ring, { transform: [{ scale: pulseRing }], opacity: ringOpacity }]} />
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        <Pressable
          onPress={onPress}
          disabled={loading}
          onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, ...ANIM.spring }).start()}
          onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start()}
          android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
          style={{ borderRadius: RADII.lg, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={[COLORS.gold2, COLORS.gold, COLORS.gold3]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={ageBtn.btn}
          >
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]} pointerEvents="none">
              <LinearGradient colors={['transparent', 'rgba(255,255,255,0.22)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
            <View style={ageBtn.inner}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path fill="#160D00" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </Svg>
              <Text style={ageBtn.label}>{loading ? 'Living...' : 'AGE UP'}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ageBtn = StyleSheet.create({
  wrap:  { position: 'relative', alignItems: 'center', paddingVertical: SPACING.sm },
  ring:  { position: 'absolute', width: '108%', height: 64, borderRadius: RADII.xl, borderWidth: 2, borderColor: COLORS.gold, ...SHADOWS.gold },
  btn:   { paddingVertical: 18, borderRadius: RADII.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  label: { fontFamily: FONTS.displayBold, fontSize: 18, color: '#160D00', letterSpacing: 1.5 },
});

// ─── Stats Strip ──────────────────────────────────────────────────────────────
const MINI_STATS = [
  { key: 'health'       as const, label: 'HP',  color: COLORS.crimson  },
  { key: 'happiness'    as const, label: 'Joy', color: COLORS.gold     },
  { key: 'intelligence' as const, label: 'IQ',  color: COLORS.sapphire },
  { key: 'fitness'      as const, label: 'Fit', color: COLORS.emerald  },
];

function StatsStrip({ stats }: { stats: Pick<CharacterStats, 'health' | 'happiness' | 'intelligence' | 'fitness'> }) {
  return (
    <View style={strip.row}>
      {MINI_STATS.map(s => (
        <View key={s.key} style={strip.item}>
          <View style={strip.labelRow}>
            <Text style={strip.label}>{s.label}</Text>
            <Text style={[strip.val, { color: s.color }]}>{stats[s.key]}</Text>
          </View>
          <StatBar value={stats[s.key] as number} color={s.color} height={3} />
        </View>
      ))}
    </View>
  );
}

const strip = StyleSheet.create({
  row:      { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: `${COLORS.bg2}F0`, borderTopWidth: 1, borderTopColor: COLORS.border },
  item:     { flex: 1, gap: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label:    { fontFamily: FONTS.bodySemiBold, fontSize: 9, color: COLORS.t4, letterSpacing: 0.5, textTransform: 'uppercase' },
  val:      { fontFamily: FONTS.monoSemiBold, fontSize: 10 },
});

// ─── Age Section Header ───────────────────────────────────────────────────────
function AgeSectionHeader({ age }: { age: number }) {
  return (
    <View style={ash.wrap}>
      <View style={ash.line} />
      <View style={ash.badge}>
        <Text style={ash.text}>AGE {age}</Text>
      </View>
      <View style={ash.line} />
    </View>
  );
}

const ash = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  line:  { flex: 1, height: 1, backgroundColor: COLORS.border },
  badge: { paddingHorizontal: SPACING.md, paddingVertical: 3, borderRadius: RADII.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  text:  { fontFamily: FONTS.monoSemiBold, fontSize: 9, color: COLORS.t4, letterSpacing: 2 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyLifeLog() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: SPACING.xxxl, gap: SPACING.md }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path stroke={COLORS.t4} strokeWidth={1.5} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </Svg>
      </View>
      <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t3, textAlign: 'center' }}>Your life story begins here.</Text>
      <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, textAlign: 'center' }}>Tap Age Up to write your first chapter.</Text>
    </View>
  );
}

// ─── Group events by age ──────────────────────────────────────────────────────
function groupByAge(events: LifeEventRecord[]) {
  const map = new Map<number, LifeEventRecord[]>();
  for (const e of events) {
    if (!map.has(e.age)) map.set(e.age, []);
    map.get(e.age)!.push(e);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([age, data]) => ({ title: String(age), data }));
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function LifeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const character       = useGameStore(s => s.character);
  const pendingDecision = useGameStore(s => s.pendingDecision);
  const isProcessing    = useGameStore(s => s.isProcessing);
  const ageUp           = useGameStore(s => s.ageUp);
  const resolveDecision = useGameStore(s => s.resolveDecision);
  const dismissDecision = useGameStore(s => s.dismissDecision);

  const handleAgeUp = useCallback(async () => {
    const wasAlive = useGameStore.getState().character?.isAlive;
    ageUp();
    const after = useGameStore.getState().character;
    void logEvent('age_up', { age: after?.age ?? 0 });
    if (!after?.isAlive && wasAlive) void logEvent('death', { age: after?.deathAge ?? 0 });

    const { ageUpsSinceAd: count, character: c } = useGameStore.getState();
    if (c && !c.hasNoAds && !c.isPremium && count > 0 && count % INTERSTITIAL_EVERY_N_AGEUPS === 0) {
      await maybeShowInterstitial();
    }
  }, [ageUp]);

  if (!character) return null;

  const sections = groupByAge(character.eventHistory);

  const formatBank = (n: number) => {
    if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrap}>
                <AvatarByCharacter character={character} size={48} />
              </View>
              <View style={styles.aliveIndicator}>
                <View style={styles.aliveDot} />
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.charName}>{character.name}</Text>
              <View style={styles.headerMeta}>
                <Badge label={character.job} color={COLORS.sapphire} />
                <Text style={styles.metaText}>{character.countryFlag} {character.country}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable onPress={() => navigation.navigate('Activities')} style={styles.actBtn}>
              <Text style={styles.actBtnText}>Activities</Text>
            </Pressable>
            <LinearGradient colors={[`${COLORS.gold}22`, `${COLORS.gold}08`]} style={styles.ageBadge}>
              <Text style={styles.ageNum}>{character.age}</Text>
              <Text style={styles.ageLabel}>yrs</Text>
            </LinearGradient>

            {/* Bank + coins */}
            <View style={styles.currencyRow}>
              <View style={styles.currencyChip}>
                <BankIcon />
                <Text style={[styles.currencyText, { color: COLORS.teal }]}>{formatBank(character.bankBalance)}</Text>
              </View>
              <View style={styles.currencyChip}>
                <CoinIcon />
                <Text style={styles.currencyText}>{character.coins >= 1000 ? `${(character.coins / 1000).toFixed(0)}K` : character.coins}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Life Log by Age ─────────────────────────────────────────── */}
        {sections.length === 0 ? (
          <EmptyLifeLog />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => `${item.id}_${item.timestamp}`}
            renderItem={({ item, index }) => (
              <View style={{ paddingHorizontal: SPACING.lg }}>
                <EventCard event={item} isNew={index === 0 && !isProcessing} />
              </View>
            )}
            renderSectionHeader={({ section }) => (
              <AgeSectionHeader age={Number(section.title)} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.sm }}
            stickySectionHeadersEnabled={false}
          />
        )}

        {/* ── Stats Strip ─────────────────────────────────────────────── */}
        <StatsStrip stats={character.stats} />

        {/* ── Age Up Button ────────────────────────────────────────────── */}
        <View style={[styles.ageWrap, { paddingBottom: insets.bottom > 0 ? 0 : SPACING.sm }]}>
          <AgeUpButton onPress={handleAgeUp} loading={isProcessing} />
          <Text style={styles.ageHint}>
            {character.age < 18 ? 'Childhood' : character.age < 30 ? 'Young Adult' : character.age < 60 ? 'Adult Life' : 'Golden Years'}
            {' · '}Born {character.birthYear}
          </Text>
        </View>
      </SafeAreaView>

      <DecisionSheet
        event={pendingDecision?.event ?? null}
        onChoice={resolveDecision}
        onClose={dismissDecision}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.bg2, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  headerRight: { alignItems: 'flex-end', gap: SPACING.xs },
  actBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.tealBorder, backgroundColor: `${COLORS.teal}12` },
  actBtnText: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.teal },
  avatarContainer: { position: 'relative' },
  avatarWrap:  { borderRadius: 28, borderWidth: 2, borderColor: COLORS.goldBorder, overflow: 'hidden' },
  aliveIndicator: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 6.5, backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center' },
  aliveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.teal },
  headerInfo:  { gap: 4, flex: 1 },
  charName:    { fontFamily: FONTS.displayBold, fontSize: 18, color: COLORS.t1 },
  headerMeta:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  metaText:    { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  ageBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 3, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.goldBorder },
  ageNum:   { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.gold },
  ageLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.gold3 },
  currencyRow:  { flexDirection: 'row', gap: SPACING.xs },
  currencyChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border },
  currencyText: { fontFamily: FONTS.monoSemiBold, fontSize: 11, color: COLORS.gold },
  ageWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 4 },
  ageHint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textAlign: 'center', paddingBottom: SPACING.sm },
});
