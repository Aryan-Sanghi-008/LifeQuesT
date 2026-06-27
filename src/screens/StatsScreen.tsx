import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { AvatarByCharacter } from '../components/Avatars';
import { StatBar, SectionLabel, Card, ScaleInView, ScreenHeader } from '../components/index';
import { CharacterStats, LifeEventRecord } from '../types';
import { ACHIEVEMENTS } from '../data/gameData';
import Svg, { Path, Circle } from 'react-native-svg';
import { formatCurrency } from '../utils/currency';
import { getFinanceSummary } from '../utils/financeSummary';
import { estimateLifeExpectancy } from '../engine/simulationEngine';

// ─── All Stats Config ─────────────────────────────────────────────────────────

const ALL_STATS: Array<{ key: keyof CharacterStats; label: string; color: string; icon: (c: string) => React.ReactNode }> = [
  { key: 'health',       label: 'Health',       color: COLORS.health,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill={c}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg> },
  { key: 'happiness',    label: 'Happiness',    color: COLORS.gold,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><Circle cx="9" cy="9" r="1.2" fill={c}/><Circle cx="15" cy="9" r="1.2" fill={c}/></Svg> },
  { key: 'intelligence', label: 'Intelligence', color: COLORS.intelligence,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 14l6.16-3.422A12.08 12.08 0 0118.82 17.4a11.95 11.95 0 01-6.82 2.655A11.95 11.95 0 015.18 17.4a12.08 12.08 0 00.66-6.822L12 14z"/></Svg> },
  { key: 'wealth',       label: 'Wealth',       color: COLORS.wealth,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill={c}><Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></Svg> },
  { key: 'fitness',      label: 'Fitness',      color: COLORS.fitness,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2.5} strokeLinecap="round" d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4"/></Svg> },
  { key: 'looks',        label: 'Looks',        color: COLORS.looks,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg> },
  { key: 'social',       label: 'Social',       color: COLORS.social,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg> },
  { key: 'ambition',     label: 'Ambition',     color: COLORS.ambition,
    icon: (c) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg> },
];

// ─── Karma Meter ──────────────────────────────────────────────────────────────

function KarmaMeter({ karma }: { karma: number }) {
  const pct = Math.max(0, Math.min(100, (karma / 300) * 100));
  const label  = karma < 0 ? 'Villain' : karma < 50 ? 'Neutral' : karma < 150 ? 'Decent' : karma < 250 ? 'Virtuous' : 'Saint';
  const kColor = karma < 0 ? COLORS.health : karma < 100 ? COLORS.t3 : karma < 200 ? COLORS.emerald : COLORS.gold;

  return (
    <Card style={styles.karmaCard}>
      <View style={styles.karmaHeader}>
        <View>
          <Text style={styles.karmaTitle}>Karma Score</Text>
          <Text style={[styles.karmaLabel, { color: kColor }]}>{label}</Text>
        </View>
        <View style={[styles.karmaBadge, { borderColor: `${kColor}40`, backgroundColor: `${kColor}10` }]}>
          <Text style={[styles.karmaNum, { color: kColor }]}>{karma}</Text>
        </View>
      </View>

      <View style={styles.karmaTrack}>
        <LinearGradient
          colors={[COLORS.health, COLORS.gold, COLORS.emerald]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 5 }]}
        />
        {/* Mask to clip based on pct */}
        <View style={[StyleSheet.absoluteFill, {
          left: `${pct}%`, backgroundColor: COLORS.bg2, borderRadius: 5,
        }]} />
        {/* Indicator line */}
        <View style={[styles.karmaIndicator, { left: `${pct}%`, backgroundColor: kColor }]} />
      </View>

      <View style={styles.karmaLegend}>
        {(['Villain', 'Neutral', 'Decent', 'Virtuous', 'Saint'] as const).map(l => (
          <Text key={l} style={[styles.karmaLegendText, l === label && { color: kColor, fontFamily: FONTS.bodyBold }]}>{l}</Text>
        ))}
      </View>
    </Card>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

function AchievementBadge({ label, desc, color, unlocked }: {
  label: string; desc: string; color: string; unlocked: boolean;
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [unlocked]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] });

  return (
    <View style={[
      ach.card,
      unlocked && { borderColor: `${color}40`, backgroundColor: COLORS.bgCard },
      !unlocked && ach.locked,
    ]}>
      {unlocked && (
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: RADII.md, backgroundColor: color, opacity: glowOpacity }]}/>
      )}

      <View style={[ach.icon, { backgroundColor: unlocked ? `${color}18` : COLORS.bg2 }]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          {unlocked
            ? <Path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            : <Path stroke={COLORS.t4} strokeWidth={1.8} strokeLinecap="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          }
        </Svg>
      </View>

      <Text style={[ach.label, unlocked ? { color } : { color: COLORS.t4 }]}>{label}</Text>
      <Text style={ach.desc} numberOfLines={2}>{desc}</Text>

      {!unlocked && (
        <View style={ach.lockBadge}>
          <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.t4} strokeWidth={2.5} strokeLinecap="round" d="M17 11H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"/>
          </Svg>
        </View>
      )}
    </View>
  );
}

const ach = StyleSheet.create({
  card:     { width: '47%', padding: SPACING.md, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg2, gap: 5, position: 'relative', overflow: 'hidden' },
  locked:   { opacity: 0.55 },
  icon:     { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  label:    { fontFamily: FONTS.bodySemiBold, fontSize: 12 },
  desc:     { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, lineHeight: 14 },
  lockBadge:{ position: 'absolute', top: 8, right: 8 },
});

// ─── Life Timeline ────────────────────────────────────────────────────────────

function LifeTimeline({ events }: { events: LifeEventRecord[] }) {
  if (events.length === 0) return null;
  const recent = events.slice(-6).reverse();
  return (
    <View style={tl.wrap}>
      {recent.map((ev, i) => (
        <View key={ev.id + i} style={tl.row}>
          <View style={tl.dotCol}>
            <View style={[tl.dot, { backgroundColor: ev.color }]} />
            {i < recent.length - 1 && <View style={tl.connector} />}
          </View>
          <View style={tl.content}>
            <View style={tl.header}>
              <Text style={tl.title}>{ev.title}</Text>
              <View style={[tl.agePill, { backgroundColor: `${ev.color}15` }]}>
                <Text style={[tl.ageText, { color: ev.color }]}>Age {ev.age}</Text>
              </View>
            </View>
            <Text style={tl.desc} numberOfLines={1}>{ev.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const tl = StyleSheet.create({
  wrap:      { gap: 0 },
  row:       { flexDirection: 'row', gap: SPACING.md, minHeight: 54 },
  dotCol:    { alignItems: 'center', width: 12 },
  dot:       { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  connector: { flex: 1, width: 1.5, backgroundColor: COLORS.border, marginTop: 4 },
  content:   { flex: 1, paddingBottom: SPACING.md, gap: 3 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.sm },
  title:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1, flex: 1 },
  agePill:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADII.full },
  ageText:   { fontFamily: FONTS.monoSemiBold, fontSize: 9 },
  desc:      { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function StatsScreen() {
  const character = useGameStore(s => s.character);
  if (!character) return null;
  const { stats, karma, achievements, eventHistory, name, age, birthYear, countryCode } = character;
  const finance = getFinanceSummary(character);
  const netWorthLabel = formatCurrency(finance.netWorth, countryCode ?? 'IN');
  const lifeExpectancy = estimateLifeExpectancy(character);
  const yearsLeft = Math.max(0, lifeExpectancy - age);
  const lePercent = Math.min(100, (age / lifeExpectancy) * 100);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm }}>
          <ScreenHeader title="Life Stats" subtitle={`${name} · Age ${age}`} />
        </View>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarFrame, { borderColor: `${COLORS.gold}50` }]}>
            <AvatarByCharacter character={character} size={48} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerSub}>Age {age} · Born {birthYear}</Text>
          </View>
          <View style={[styles.agePill, { backgroundColor: `${COLORS.gold}12`, borderColor: `${COLORS.gold}30` }]}>
            <Text style={[styles.ageNum, { color: COLORS.gold3 }]}>{age}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Stats 2-col grid */}
          <SectionLabel label="Stats" style={styles.sectionLabel} />
          <View style={styles.statsGrid}>
            {ALL_STATS.map((cfg, i) => {
              const val = stats[cfg.key] as number ?? 0;
              const tier = val >= 80 ? 'Elite' : val >= 60 ? 'Good' : val >= 40 ? 'Average' : 'Low';
              return (
                <ScaleInView key={cfg.key} delay={i * 50} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${cfg.color}14` }]}>
                    {cfg.icon(cfg.color)}
                  </View>
                  <Text style={styles.statLabel}>{cfg.label}</Text>
                  {cfg.key === 'wealth' && (
                    <Text style={styles.statSublabel}>Based on net worth · {netWorthLabel}</Text>
                  )}
                  <Text style={[styles.statVal, { color: cfg.color }]}>{val}</Text>
                  <StatBar value={val} color={cfg.color} height={5} delay={i * 60} />
                  <View style={[styles.tierBadge, { backgroundColor: `${cfg.color}12`, borderColor: `${cfg.color}28` }]}>
                    <Text style={[styles.tierText, { color: cfg.color }]}>{tier}</Text>
                  </View>
                </ScaleInView>
              );
            })}
          </View>

          {/* Life Expectancy */}
          <SectionLabel label="Life Expectancy" style={styles.sectionLabel} />
          <Card style={{ gap: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 }}>Estimated Lifespan</Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: 2 }}>Based on your health, fitness & country</Text>
              </View>
              <View style={[styles.agePill, { backgroundColor: `${COLORS.health}10`, borderColor: `${COLORS.health}30` }]}>
                <Text style={[styles.ageNum, { color: COLORS.health, fontSize: 18 }]}>{lifeExpectancy}y</Text>
              </View>
            </View>
            <View style={{ height: 8, backgroundColor: COLORS.bg2, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${lePercent}%` as `${number}%`, height: '100%', backgroundColor: lePercent > 80 ? COLORS.crimson : lePercent > 60 ? COLORS.gold : COLORS.emerald, borderRadius: 4 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>Age {age}</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>~{yearsLeft} years remaining</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 }}>{lifeExpectancy}y est.</Text>
            </View>
          </Card>

          {/* Karma */}
          <SectionLabel label="Karma" style={styles.sectionLabel} />
          <KarmaMeter karma={karma} />

          {/* Achievements */}
          <SectionLabel label="Achievements" style={styles.sectionLabel} />
          <View style={styles.achGrid}>
            {ACHIEVEMENTS.map(a => (
              <AchievementBadge
                key={a.id}
                label={a.label}
                desc={a.description}
                color={a.color}
                unlocked={achievements.includes(a.id)}
              />
            ))}
          </View>

          {/* Timeline */}
          {eventHistory.length > 0 && (
            <>
              <SectionLabel label="Recent Life Events" style={styles.sectionLabel} />
              <Card>
                <LifeTimeline events={eventHistory} />
              </Card>
            </>
          )}

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatarFrame: { borderRadius: 28, borderWidth: 2.5, overflow: 'hidden' },
  headerName: { fontFamily: FONTS.bodyBold, fontSize: 20, color: COLORS.t1 },
  headerSub:  { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  agePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADII.full, borderWidth: 1.5, alignItems: 'center' },
  ageNum:  { fontFamily: FONTS.bodyBold, fontSize: 20 },

  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  sectionLabel: { marginBottom: SPACING.md },

  // 2-col stat grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    width: '48%', padding: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADII.md,
    borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING.xs, ...SHADOWS.subtle,
  },
  statIcon:  { width: 40, height: 40, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.t2 },
  statSublabel: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4, marginTop: 1 },
  statVal:   { fontFamily: FONTS.bodyBold, fontSize: 28, lineHeight: 32 },
  tierBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADII.full, borderWidth: 1, alignSelf: 'flex-start', marginTop: 2 },
  tierText:  { fontFamily: FONTS.bodySemiBold, fontSize: 9, letterSpacing: 0.3 },

  // Karma
  karmaCard:    { marginBottom: SPACING.xl, gap: SPACING.md },
  karmaHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  karmaTitle:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 },
  karmaLabel:   { fontFamily: FONTS.bodyBold, fontSize: 20, marginTop: 2 },
  karmaBadge:   { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADII.md, borderWidth: 1.5 },
  karmaNum:     { fontFamily: FONTS.bodyBold, fontSize: 24 },
  karmaTrack:   { height: 10, backgroundColor: COLORS.bg2, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  karmaIndicator:{ position: 'absolute', top: 0, bottom: 0, width: 3, borderRadius: 2, marginLeft: -1.5 },
  karmaLegend:  { flexDirection: 'row', justifyContent: 'space-between' },
  karmaLegendText:{ fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4 },

  // Achievements
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
});
