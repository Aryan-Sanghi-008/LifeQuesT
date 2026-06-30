import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles, FONTS, RADII, SPACING, useTheme } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { AvatarByCharacter } from '@components/Avatars';
import { StatBar, SectionLabel, Card, ScaleInView, ScreenHeader, ScreenShell } from '@components/index';
import { CharacterStats, LifeEventRecord } from '../../types';
import { ACHIEVEMENTS } from '../../data/gameData';
import Svg, { Path, Circle } from 'react-native-svg';
import { formatCurrency } from '@utils/currency';
import { getFinanceSummary } from '@utils/financeSummary';
import { estimateLifeExpectancy } from '../../engine/simulationEngine';

// ─── All Stats Config ─────────────────────────────────────────────────────────

function getAllStats(colors: ReturnType<typeof useTheme>['colors']) {
  return [
  { key: 'health' as keyof CharacterStats,       label: 'Health',       color: colors.health,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill={c}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg> },
  { key: 'happiness' as keyof CharacterStats,    label: 'Happiness',    color: colors.gold,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><Circle cx="9" cy="9" r="1.2" fill={c}/><Circle cx="15" cy="9" r="1.2" fill={c}/></Svg> },
  { key: 'intelligence' as keyof CharacterStats, label: 'Intelligence', color: colors.intelligence,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 14l6.16-3.422A12.08 12.08 0 0118.82 17.4a11.95 11.95 0 01-6.82 2.655A11.95 11.95 0 015.18 17.4a12.08 12.08 0 00.66-6.822L12 14z"/></Svg> },
  { key: 'wealth' as keyof CharacterStats,       label: 'Wealth',       color: colors.wealth,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill={c}><Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></Svg> },
  { key: 'fitness' as keyof CharacterStats,      label: 'Fitness',      color: colors.fitness,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2.5} strokeLinecap="round" d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4"/></Svg> },
  { key: 'looks' as keyof CharacterStats,        label: 'Looks',        color: colors.looks,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg> },
  { key: 'social' as keyof CharacterStats,       label: 'Social',       color: colors.social,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg> },
  { key: 'ambition' as keyof CharacterStats,     label: 'Ambition',     color: colors.ambition,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg> },
  { key: 'mentalHealth' as keyof CharacterStats, label: 'Mindset',      color: colors.orchid,
    icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8v4"/></Svg> },
] as const;
}

// ─── Karma Meter ──────────────────────────────────────────────────────────────

function KarmaMeter({ karma }: { karma: number }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(100, (karma / 300) * 100));
  const label  = karma < 0 ? 'Villain' : karma < 50 ? 'Neutral' : karma < 150 ? 'Decent' : karma < 250 ? 'Virtuous' : 'Saint';
  const kColor = karma < 0 ? colors.health : karma < 100 ? colors.t3 : karma < 200 ? colors.emerald : colors.gold;

  return (
    <Card style={styles.karmaCard}>
      <View style={styles.karmaHeader}>
        <View>
          <Text style={[styles.karmaTitle, { color: colors.t2 }]}>Karma Score</Text>
          <Text style={[styles.karmaLabel, { color: kColor }]}>{label}</Text>
        </View>
        <View style={[styles.karmaBadge, { borderColor: `${kColor}40`, backgroundColor: `${kColor}10` }]}>
          <Text style={[styles.karmaNum, { color: kColor }]}>{karma}</Text>
        </View>
      </View>

      <View style={[styles.karmaTrack, { backgroundColor: colors.bg2 }]}>
        <LinearGradient
          colors={[colors.health, colors.gold, colors.emerald]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 5 }]}
        />
        <View style={[StyleSheet.absoluteFill, {
          left: `${pct}%`, backgroundColor: colors.bg2, borderRadius: 5,
        }]} />
        <View style={[styles.karmaIndicator, { left: `${pct}%`, backgroundColor: kColor }]} />
      </View>

      <View style={styles.karmaLegend}>
        {(['Villain', 'Neutral', 'Decent', 'Virtuous', 'Saint'] as const).map(l => (
          <Text key={l} style={[styles.karmaLegendText, { color: colors.t4 }, l === label && { color: kColor, fontFamily: FONTS.bodyBold }]}>{l}</Text>
        ))}
      </View>
    </Card>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

function AchievementBadge({ label, desc, color, unlocked }: {
  label: string; desc: string; color: string; unlocked: boolean;
}) {
  const styles = useThemedStyles(createAchStyles);
  const { colors } = useTheme();
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
      styles.card,
      { borderColor: colors.border, backgroundColor: colors.bg2 },
      unlocked && { borderColor: `${color}40`, backgroundColor: colors.bgCard },
      !unlocked && styles.locked,
    ]}>
      {unlocked && (
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: RADII.md, backgroundColor: color, opacity: glowOpacity }]}/>
      )}

      <View style={[styles.icon, { backgroundColor: unlocked ? `${color}18` : colors.bg2 }]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          {unlocked
            ? <Path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            : <Path stroke={colors.t4} strokeWidth={1.8} strokeLinecap="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          }
        </Svg>
      </View>

      <Text style={[styles.label, unlocked ? { color } : { color: colors.t4 }]}>{label}</Text>
      <Text style={[styles.desc, { color: colors.t4 }]} numberOfLines={2}>{desc}</Text>

      {!unlocked && (
        <View style={styles.lockBadge}>
          <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t4} strokeWidth={2.5} strokeLinecap="round" d="M17 11H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"/>
          </Svg>
        </View>
      )}
    </View>
  );
}

const createAchStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  card:     { width: '47%', padding: spacing.md, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bg2, gap: 5, position: 'relative', overflow: 'hidden' },
  locked:   { opacity: 0.55 },
  icon:     { width: 44, height: 44, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  label:    { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  desc:     { fontFamily: fonts.body, fontSize: 10, color: colors.t4, lineHeight: 14 },
  lockBadge:{ position: 'absolute', top: 8, right: 8 },
});

// ─── Life Timeline ────────────────────────────────────────────────────────────

function LifeTimeline({ events }: { events: LifeEventRecord[] }) {
  const styles = useThemedStyles(createTlStyles);
  if (events.length === 0) return null;
  const recent = events.slice(-6).reverse();
  return (
    <View style={styles.wrap}>
      {recent.map((ev, i) => (
        <View key={ev.id + i} style={styles.row}>
          <View style={styles.dotCol}>
            <View style={[styles.dot, { backgroundColor: ev.color }]} />
            {i < recent.length - 1 && <View style={styles.connector} />}
          </View>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{ev.title}</Text>
              <View style={[styles.agePill, { backgroundColor: `${ev.color}15` }]}>
                <Text style={[styles.ageText, { color: ev.color }]}>Age {ev.age}</Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={1}>{ev.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createTlStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  wrap:      { gap: 0 },
  row:       { flexDirection: 'row', gap: spacing.md, minHeight: 54 },
  dotCol:    { alignItems: 'center', width: 12 },
  dot:       { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  connector: { flex: 1, width: 1.5, backgroundColor: colors.border, marginTop: 4 },
  content:   { flex: 1, paddingBottom: spacing.md, gap: 3 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title:     { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t1, flex: 1 },
  agePill:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.full },
  ageText:   { fontFamily: fonts.monoSemiBold, fontSize: 9 },
  desc:      { fontFamily: fonts.body, fontSize: 12, color: colors.t3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function StatsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const character = useGameStore(s => s.character);
  if (!character) return null;
  const { stats, karma, achievements, eventHistory, name, age, birthYear, countryCode } = character;
  const finance = getFinanceSummary(character);
  const netWorthLabel = formatCurrency(finance.netWorth, countryCode ?? 'IN');
  const lifeExpectancy = estimateLifeExpectancy(character);
  const yearsLeft = Math.max(0, lifeExpectancy - age);
  const lePercent = Math.min(100, (age / lifeExpectancy) * 100);
  const allStats = getAllStats(colors);

  return (
    <ScreenShell>
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm }}>
          <ScreenHeader title="Life Stats" subtitle={`${name} · Age ${age}`} />
        </View>
        <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
          <View style={[styles.avatarFrame, { borderColor: `${colors.gold}50` }]}>
            <AvatarByCharacter character={character} size={48} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerName, { color: colors.t1 }]}>{name}</Text>
            <Text style={[styles.headerSub, { color: colors.t3 }]}>Age {age} · Born {birthYear}</Text>
          </View>
          <View style={[styles.agePill, { backgroundColor: `${colors.gold}12`, borderColor: `${colors.gold}30` }]}>
            <Text style={[styles.ageNum, { color: colors.gold3 }]}>{age}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Stats 2-col grid */}
          <SectionLabel label="Stats" style={styles.sectionLabel} />
          <View style={styles.statsGrid}>
            {allStats.map((cfg, i) => {
              const val = stats[cfg.key] as number ?? 0;
              const tier = val >= 80 ? 'Elite' : val >= 60 ? 'Good' : val >= 40 ? 'Average' : 'Low';
              return (
                <ScaleInView key={cfg.key} delay={i * 50} style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <View style={[styles.statIcon, { backgroundColor: `${cfg.color}14` }]}>
                    {cfg.icon(cfg.color)}
                  </View>
                  <Text style={[styles.statLabel, { color: colors.t2 }]}>{cfg.label}</Text>
                  {cfg.key === 'wealth' && (
                    <Text style={[styles.statSublabel, { color: colors.t4 }]}>Based on net worth · {netWorthLabel}</Text>
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
                <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: colors.t2 }}>Estimated Lifespan</Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: colors.t4, marginTop: 2 }}>Based on your health, fitness & country</Text>
              </View>
              <View style={[styles.agePill, { backgroundColor: `${colors.health}10`, borderColor: `${colors.health}30` }]}>
                <Text style={[styles.ageNum, { color: colors.health, fontSize: 18 }]}>{lifeExpectancy}y</Text>
              </View>
            </View>
            <View style={{ height: 8, backgroundColor: colors.bg2, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${lePercent}%` as `${number}%`, height: '100%', backgroundColor: lePercent > 80 ? colors.crimson : lePercent > 60 ? colors.gold : colors.emerald, borderRadius: 4 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: colors.t4 }}>Age {age}</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: colors.t4 }}>~{yearsLeft} years remaining</Text>
              <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: colors.t4 }}>{lifeExpectancy}y est.</Text>
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
    </ScreenShell>
  );
}

const createStyles = ({ colors, fonts, spacing, radii, shadows }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatarFrame: { borderRadius: 28, borderWidth: 2.5, overflow: 'hidden' },
  headerName: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.t1 },
  headerSub:  { fontFamily: fonts.body, fontSize: 12, color: colors.t3, marginTop: 2 },
  agePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1.5, alignItems: 'center' },
  ageNum:  { fontFamily: fonts.bodyBold, fontSize: 20 },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionLabel: { marginBottom: spacing.md },

  // 2-col stat grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    width: '48%', padding: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.xs, ...shadows.subtle,
  },
  statIcon:  { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.t2 },
  statSublabel: { fontFamily: fonts.body, fontSize: 9, color: colors.t4, marginTop: 1 },
  statVal:   { fontFamily: fonts.bodyBold, fontSize: 28, lineHeight: 32 },
  tierBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1, alignSelf: 'flex-start', marginTop: 2 },
  tierText:  { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.3 },

  // Karma
  karmaCard:    { marginBottom: spacing.xl, gap: spacing.md },
  karmaHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  karmaTitle:   { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t2 },
  karmaLabel:   { fontFamily: fonts.bodyBold, fontSize: 20, marginTop: 2 },
  karmaBadge:   { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1.5 },
  karmaNum:     { fontFamily: fonts.bodyBold, fontSize: 24 },
  karmaTrack:   { height: 10, backgroundColor: colors.bg2, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  karmaIndicator:{ position: 'absolute', top: 0, bottom: 0, width: 3, borderRadius: 2, marginLeft: -1.5 },
  karmaLegend:  { flexDirection: 'row', justifyContent: 'space-between' },
  karmaLegendText:{ fontFamily: fonts.body, fontSize: 9, color: colors.t4 },

  // Achievements
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
});
