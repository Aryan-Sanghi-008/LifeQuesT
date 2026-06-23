import { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, SectionList, Pressable, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, ANIM } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { AvatarByCharacter } from '../components/Avatars';
import EventCard from '../components/EventCard';
import DecisionSheet from '../components/DecisionSheet';
import { StatBar } from '../components/index';
import { LifeEventRecord, CharacterStats } from '../types';
import { maybeShowInterstitial } from '../services/ads';
import { INTERSTITIAL_EVERY_N_AGEUPS } from '../config/ads';
import { logEvent } from '../services/analytics';
import { formatCurrency } from '../utils/currency';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── Stat config ──────────────────────────────────────────────────────────────

const MINI_STATS = [
  { key: 'health'        as const, label: 'Health', color: COLORS.health,        icon: (c: string) => <Svg width={12} height={12} viewBox="0 0 24 24" fill={c}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg> },
  { key: 'happiness'     as const, label: 'Joy',    color: COLORS.gold,          icon: (c: string) => <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><Circle cx="9" cy="9" r="1" fill={c}/><Circle cx="15" cy="9" r="1" fill={c}/></Svg> },
  { key: 'intelligence'  as const, label: 'Mind',   color: COLORS.intelligence,  icon: (c: string) => <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/></Svg> },
  { key: 'fitness'       as const, label: 'Fit',    color: COLORS.fitness,       icon: (c: string) => <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2.5} strokeLinecap="round" d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4"/></Svg> },
];

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function StatsStrip({ stats }: { stats: Pick<CharacterStats, 'health' | 'happiness' | 'intelligence' | 'fitness'> }) {
  return (
    <View style={strip.row}>
      {MINI_STATS.map((s, i) => (
        <View key={s.key} style={strip.item}>
          <View style={strip.labelRow}>
            <View style={[strip.iconDot, { backgroundColor: `${s.color}15` }]}>
              {s.icon(s.color)}
            </View>
            <Text style={strip.label}>{s.label}</Text>
            <Text style={[strip.val, { color: s.color }]}>{stats[s.key]}</Text>
          </View>
          <StatBar value={stats[s.key] as number} color={s.color} height={4} delay={i * 40} />
        </View>
      ))}
    </View>
  );
}

const strip = StyleSheet.create({
  row:      { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.bgCard, borderTopWidth: 1, borderTopColor: COLORS.border },
  item:     { flex: 1, gap: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconDot:  { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  label:    { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t3, flex: 1, letterSpacing: 0.3 },
  val:      { fontFamily: FONTS.monoSemiBold, fontSize: 10, fontWeight: '700' },
});

// ─── Age Up Button ────────────────────────────────────────────────────────────

function AgeUpButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const shimmer    = useRef(new Animated.Value(-1)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOp    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer sweep
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true, delay: 1000 }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOp,   { toValue: 0.5,  duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOp,   { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const shimX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-220, 220] });

  return (
    <View style={ageBtn.wrap}>
      {/* Pulse ring */}
      <Animated.View style={[
        ageBtn.ring,
        { transform: [{ scale: pulseScale }], opacity: pulseOp },
      ]} />

      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        <Pressable
          onPress={onPress}
          disabled={loading}
          onPressIn={() =>
            Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, ...ANIM.spring }).start()
          }
          onPressOut={() =>
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start()
          }
          android_ripple={{ color: 'rgba(255,255,255,0.30)' }}
          style={{ borderRadius: RADII.lg, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={ageBtn.btn}
          >
            {/* Shimmer */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { transform: [{ translateX: shimX }] }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.28)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={ageBtn.inner}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path fill="#FFFFFF" d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
  ring:  { position: 'absolute', width: '110%', height: 60, borderRadius: RADII.xl, borderWidth: 2.5, borderColor: '#22C55E', shadowColor: '#22C55E', shadowOpacity: 0.30, shadowRadius: 12, elevation: 0 },
  btn:   { paddingVertical: 17, borderRadius: RADII.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 14, elevation: 8 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  label: { fontFamily: FONTS.bodyBold, fontSize: 18, color: '#FFFFFF', letterSpacing: 2 },
});

// ─── Age Section Header ───────────────────────────────────────────────────────

function AgeSectionHeader({ age }: { age: number }) {
  const lifeStageColor = age < 13 ? COLORS.emerald : age < 18 ? COLORS.sapphire : age < 30 ? COLORS.catCareer : age < 60 ? COLORS.gold : COLORS.orchid;

  return (
    <View style={ash.wrap}>
      <View style={[ash.line, { backgroundColor: COLORS.border }]} />
      <View style={[ash.badge, { backgroundColor: `${lifeStageColor}12`, borderColor: `${lifeStageColor}30` }]}>
        <Text style={[ash.text, { color: lifeStageColor }]}>AGE {age}</Text>
      </View>
      <View style={[ash.line, { backgroundColor: COLORS.border }]} />
    </View>
  );
}

const ash = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  line:  { flex: 1, height: 1 },
  badge: { paddingHorizontal: SPACING.md, paddingVertical: 3, borderRadius: RADII.full, borderWidth: 1 },
  text:  { fontFamily: FONTS.monoSemiBold, fontSize: 9, letterSpacing: 2.5 },
});

// ─── Header Currency/Badge Pills ──────────────────────────────────────────────

function CurrencyPill({ icon, value, color, bgColor }: { icon: React.ReactNode; value: string; color: string; bgColor: string }) {
  return (
    <View style={[pill.wrap, { backgroundColor: bgColor, borderColor: `${color}25` }]}>
      {icon}
      <Text style={[pill.text, { color }]}>{value}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: RADII.full, borderWidth: 1 },
  text: { fontFamily: FONTS.monoSemiBold, fontSize: 11 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyLifeLog() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: SPACING.xxxl, gap: SPACING.lg }}>
      <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: COLORS.bg2, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path stroke={COLORS.t4} strokeWidth={1.5} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </Svg>
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.t2 }}>Your story begins now</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4, textAlign: 'center' }}>
          Tap Age Up to write your first chapter.
        </Text>
      </View>
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
  const navigation    = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets        = useSafeAreaInsets();
  const character     = useGameStore(s => s.character);
  const pendingDecision = useGameStore(s => s.pendingDecision);
  const isProcessing  = useGameStore(s => s.isProcessing);
  const ageUp         = useGameStore(s => s.ageUp);
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
  const countryCode = character.countryCode ?? 'IN';
  const bankStr = formatCurrency(character.bankBalance, countryCode);
  const lifeStage = character.age < 13 ? 'Childhood' : character.age < 18 ? 'Teenager' : character.age < 30 ? 'Young Adult' : character.age < 60 ? 'Adult' : 'Golden Years';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar + live dot */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrap}>
                <AvatarByCharacter character={character} size={46} />
              </View>
              <View style={styles.liveDot} />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.charName} numberOfLines={1}>{character.name}</Text>
              <View style={styles.headerMeta}>
                <View style={[styles.jobBadge, { backgroundColor: `${COLORS.sapphire}12`, borderColor: `${COLORS.sapphire}25` }]}>
                  <Text style={[styles.jobBadgeText, { color: COLORS.sapphire }]}>{character.job}</Text>
                </View>
                <Text style={styles.metaText}>{character.countryFlag}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Age circle */}
            <View style={styles.ageBubble}>
              <Text style={styles.ageNum}>{character.age}</Text>
              <Text style={styles.ageLabel}>yrs</Text>
            </View>
          </View>
        </View>

        {/* ── Currency row ── */}
        <View style={styles.currencyRow}>
          <CurrencyPill
            icon={<Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Path stroke={COLORS.catFinancial} strokeWidth={2} strokeLinecap="round" d="M3 22h18M3 10h18M5 6l7-4 7 4"/></Svg>}
            value={bankStr}
            color={COLORS.catFinancial}
            bgColor={`${COLORS.catFinancial}10`}
          />
          <CurrencyPill
            icon={<Svg width={12} height={12} viewBox="0 0 24 24" fill={COLORS.gold}><Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}20`} stroke={COLORS.gold} strokeWidth={2}/></Svg>}
            value={character.coins >= 1000 ? `${(character.coins / 1000).toFixed(0)}K` : String(character.coins)}
            color={COLORS.gold3}
            bgColor={`${COLORS.gold}10`}
          />
          <Pressable
            onPress={() => navigation.navigate('Activities')}
            style={styles.actBtn}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path stroke={COLORS.orchid} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </Svg>
            <Text style={styles.actBtnText}>Activities</Text>
          </Pressable>
        </View>

        {/* ── Life Log ── */}
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

        {/* ── Stats Strip ── */}
        <StatsStrip stats={character.stats} />

        {/* ── Age Up area ── */}
        <View style={[styles.ageWrap, { paddingBottom: insets.bottom > 0 ? 0 : SPACING.sm }]}>
          <AgeUpButton onPress={handleAgeUp} loading={isProcessing} />
          <Text style={styles.ageHint}>
            {lifeStage}{' · '}Born {character.birthYear}
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  headerRight: { alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarWrap:  { borderRadius: 27, borderWidth: 2.5, borderColor: COLORS.gold, overflow: 'hidden' },
  liveDot:     { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.emerald, borderWidth: 2, borderColor: COLORS.bgCard },
  headerInfo:  { flex: 1, gap: 5 },
  charName:    { fontFamily: FONTS.bodyBold, fontSize: 17, color: COLORS.t1 },
  headerMeta:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  jobBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADII.full, borderWidth: 1 },
  jobBadgeText:{ fontFamily: FONTS.bodySemiBold, fontSize: 10 },
  metaText:    { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3 },

  // Age bubble
  ageBubble: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.sapphire,
    borderWidth: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  ageNum:   { fontFamily: FONTS.bodyBold, fontSize: 20, color: '#FFFFFF', lineHeight: 24 },
  ageLabel: { fontFamily: FONTS.body, fontSize: 9, color: 'rgba(255,255,255,0.80)', lineHeight: 11 },

  // Currency row
  currencyRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bg2,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  actBtn: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: `${COLORS.orchid}10`,
    borderRadius: RADII.full, borderWidth: 1, borderColor: `${COLORS.orchid}25`,
  },
  actBtnText: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.orchid },

  // Age up area
  ageWrap: {
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 4,
  },
  ageHint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, textAlign: 'center', paddingBottom: SPACING.sm },
});
