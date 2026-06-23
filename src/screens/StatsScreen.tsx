import { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { AvatarById } from '../components/Avatars';
import { StatBar, SectionLabel, Badge, Card } from '../components/index';
import { CharacterStats, LifeEventRecord } from '../types';
import { ACHIEVEMENTS } from '../data/gameData';
import Svg, { Path, Circle, Line } from 'react-native-svg';

// ─── All-Stats Config ─────────────────────────────────────────────────────────
const ALL_STATS: Array<{
  key: keyof CharacterStats;
  label: string;
  color: string;
  icon: (c: string) => React.ReactNode;
}> = [
  {
    key: 'health', label: 'Health', color: COLORS.crimson,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill={c}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg>,
  },
  {
    key: 'happiness', label: 'Happiness', color: COLORS.gold,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><Line stroke={c} strokeWidth={2.5} strokeLinecap="round" x1="9" y1="9" x2="9.01" y2="9"/><Line stroke={c} strokeWidth={2.5} strokeLinecap="round" x1="15" y1="9" x2="15.01" y2="9"/></Svg>,
  },
  {
    key: 'intelligence', label: 'Intelligence', color: COLORS.sapphire,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></Svg>,
  },
  {
    key: 'wealth', label: 'Wealth', color: COLORS.teal,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill={c}><Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></Svg>,
  },
  {
    key: 'fitness', label: 'Fitness', color: COLORS.emerald,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></Svg>,
  },
  {
    key: 'looks', label: 'Looks', color: COLORS.orchid,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  },
  {
    key: 'social', label: 'Social', color: COLORS.sapphire,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><Circle stroke={c} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg>,
  },
  {
    key: 'ambition', label: 'Ambition', color: COLORS.gold,
    icon: (c) => <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>,
  },
];

// ─── Karma Meter ──────────────────────────────────────────────────────────────
function KarmaMeter({ karma }: { karma: number }) {
  const pct = Math.max(0, Math.min(100, (karma / 300) * 100));
  const label = karma < 0 ? 'Villain' : karma < 50 ? 'Neutral' : karma < 150 ? 'Decent' : karma < 250 ? 'Virtuous' : 'Saint';
  const kColor = karma < 0 ? COLORS.crimson : karma < 100 ? COLORS.t3 : karma < 200 ? COLORS.teal : COLORS.gold;

  return (
    <Card style={styles.karmaCard}>
      <View style={styles.karmaHeader}>
        <View>
          <Text style={styles.karmaTitle}>Karma Score</Text>
          <Text style={[styles.karmaLabel, { color: kColor }]}>{label}</Text>
        </View>
        <View style={[styles.karmaBadge, { borderColor: kColor, backgroundColor: `${kColor}12` }]}>
          <Text style={[styles.karmaNum, { color: kColor }]}>{karma}</Text>
        </View>
      </View>

      <View style={styles.karmaTrack}>
        <View style={[styles.karmaFill, { flex: pct, backgroundColor: 'transparent' }]}>
          <LinearGradient
            colors={[COLORS.crimson, COLORS.teal, COLORS.gold]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={{ flex: 100 - pct }} />
      </View>

      <View style={styles.karmaLegend}>
        {['Villain', 'Neutral', 'Decent', 'Virtuous', 'Saint'].map((l) => (
          <Text key={l} style={[styles.karmaLegendText, label === l && { color: kColor, fontFamily: FONTS.bodySemiBold }]}>{l}</Text>
        ))}
      </View>
    </Card>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────
function AchievementBadge({
  label, desc, color, unlocked,
}: { label: string; desc: string; color: string; unlocked: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [unlocked]);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.35] });

  return (
    <View style={[
      ach.card,
      unlocked && { borderColor: `${color}50`, backgroundColor: `${color}08` },
      !unlocked && ach.locked,
    ]}>
      {unlocked && (
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: RADII.md, backgroundColor: color, opacity: glowOpacity }]} />
      )}

      <View style={[ach.icon, { backgroundColor: unlocked ? `${color}20` : COLORS.bgCard }]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          {unlocked
            ? <Path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            : <Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          }
        </Svg>
      </View>

      <Text style={[ach.label, !unlocked && { color: COLORS.t4 }, unlocked && { color }]}>{label}</Text>
      <Text style={ach.desc} numberOfLines={2}>{desc}</Text>
      {!unlocked && (
        <View style={ach.lockBadge}>
          <Text style={ach.lockText}>LOCKED</Text>
        </View>
      )}
    </View>
  );
}

const ach = StyleSheet.create({
  card:     { width: '47%', padding: SPACING.md, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard, gap: 5, position: 'relative', overflow: 'hidden' },
  locked:   { opacity: 0.6 },
  icon:     { width: 40, height: 40, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  label:    { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.t2 },
  desc:     { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, lineHeight: 14 },
  lockBadge:{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lockText: { fontFamily: FONTS.monoSemiBold, fontSize: 8, color: COLORS.t4, letterSpacing: 0.5 },
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
              <Text style={[tl.age, { color: ev.color }]}>Age {ev.age}</Text>
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
  row:       { flexDirection: 'row', gap: SPACING.md, minHeight: 52 },
  dotCol:    { alignItems: 'center', width: 12 },
  dot:       { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  connector: { flex: 1, width: 1.5, backgroundColor: COLORS.border, marginTop: 4 },
  content:   { flex: 1, paddingBottom: SPACING.md, gap: 3 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1, flex: 1 },
  age:       { fontFamily: FONTS.monoSemiBold, fontSize: 10 },
  desc:      { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function StatsScreen() {
  const character = useGameStore(s => s.character);
  if (!character) return null;

  const { stats, karma, achievements, eventHistory, name, age, birthYear } = character;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={styles.header}>
          <AvatarById id={character.avatarId} size={52} />
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerSub}>Age {age} · Born {birthYear}</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Stats Grid ── */}
          <SectionLabel label="Stats" style={styles.sectionLabel} />
          <View style={styles.statsGrid}>
            {ALL_STATS.map((cfg, i) => {
              const val = stats[cfg.key];
              const tier = val >= 80 ? 'Elite' : val >= 60 ? 'Good' : val >= 40 ? 'Average' : 'Low';
              return (
                <Card key={cfg.key} style={styles.statCard}>
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIcon, { backgroundColor: `${cfg.color}18` }]}>
                      {cfg.icon(cfg.color)}
                    </View>
                    <View style={styles.statMeta}>
                      <Text style={styles.statLabel}>{cfg.label}</Text>
                      <Badge label={tier} color={cfg.color} />
                    </View>
                    <Text style={[styles.statVal, { color: cfg.color }]}>{val}</Text>
                  </View>
                  <StatBar value={val} color={cfg.color} height={5} delay={i * 60} />
                </Card>
              );
            })}
          </View>

          {/* ── Karma ── */}
          <SectionLabel label="Karma" style={styles.sectionLabel} />
          <KarmaMeter karma={karma} />

          {/* ── Achievements ── */}
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

          {/* ── Timeline ── */}
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
  root:   { flex: 1, backgroundColor: COLORS.bg },
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerName: { fontFamily: FONTS.displayBold, fontSize: 20, color: COLORS.t1 },
  headerSub:  { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  scroll:     { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  sectionLabel: { marginBottom: SPACING.md },

  // Stats grid
  statsGrid:  { gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard:   { padding: SPACING.md, gap: SPACING.sm },
  statCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  statIcon:   { width: 36, height: 36, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  statMeta:   { flex: 1, gap: 3 },
  statLabel:  { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t2 },
  statVal:    { fontFamily: FONTS.displayBold, fontSize: 22 },

  // Karma
  karmaCard:   { marginBottom: SPACING.xl, gap: SPACING.sm },
  karmaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  karmaTitle:  { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t2 },
  karmaLabel:  { fontFamily: FONTS.displayBold, fontSize: 18, marginTop: 2 },
  karmaBadge:  { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADII.md, borderWidth: 1.5 },
  karmaNum:    { fontFamily: FONTS.displayBold, fontSize: 22 },
  karmaTrack:  { height: 8, backgroundColor: COLORS.bgCard2, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  karmaFill:   { overflow: 'hidden', borderRadius: 4, position: 'relative' },
  karmaLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  karmaLegendText: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.t4 },

  // Achievements
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
});
