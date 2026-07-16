import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme, FONTS, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ACTIVITIES } from '../../data/gameData';
import { HOBBY_CATALOG } from '../../data/hobbies';
import { Activity, ActivityCategory, RootStackParamList } from '../../types';
import { isFeatureEnabled, getActivityFeatureGate } from '../../engine/scenarioEngine';
import { ScreenHeader } from '@components/ScreenHeader';
import { SectionLabel } from '@components/index';
import { ContextualTutorial } from '@shared/components/ContextualTutorial';
import { getHobbyProgress } from '../../engine/hobbyEngine';
import Svg, { Path, Circle } from 'react-native-svg';
import { scaleActivityCost } from '../../engine/countryScaleEngine';
import { formatCurrency } from '@utils/currency';

// ─── Category SVG icons ───────────────────────────────────────────────────────
function CatIcon({ cat, color }: { cat: ActivityCategory; color: string }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' };
  switch (cat) {
    case 'mind':      return <Svg {...p}><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5z"/><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 14l6.16-3.42A12.08 12.08 0 0118.82 17.4a11.95 11.95 0 01-6.82 2.655A11.95 11.95 0 015.18 17.4a12.08 12.08 0 00.66-6.822L12 14z"/></Svg>;
    case 'body':      return <Svg {...p}><Path stroke={color} strokeWidth={2.5} strokeLinecap="round" d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4"/></Svg>;
    case 'social':    return <Svg {...p}><Circle stroke={color} strokeWidth={2} cx="9" cy="7" r="4"/><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg>;
    case 'financial': return <Svg {...p}><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Svg>;
    case 'illegal':   return <Svg {...p}><Circle stroke={color} strokeWidth={2} cx="12" cy="12" r="10"/><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M4.93 4.93l14.14 14.14"/></Svg>;
    case 'health':    return <Svg {...p}><Path fill={color} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></Svg>;
    default:          return <Svg {...p}><Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></Svg>;
  }
}

// ─── Category icon & color ────────────────────────────────────────────────────
function getCatMeta(colors: ReturnType<typeof useTheme>['colors']): Record<ActivityCategory, { color: string; label: string }> {
  return {
  mind:      { color: colors.sapphire, label: 'Mind'      },
  body:      { color: colors.teal,     label: 'Body'      },
  social:    { color: colors.orchid,   label: 'Social'    },
  financial: { color: colors.gold,     label: 'Financial' },
  illegal:   { color: colors.crimson,  label: 'Illegal'   },
  health:    { color: colors.crimson,  label: 'Health'    },
  misc:      { color: colors.gold3,    label: 'Misc'      },
};
}

// ─── Stat effect summary ──────────────────────────────────────────────────────
function EffectChips({ activity, countryCode }: { activity: Activity; countryCode: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createEcStyles);
  const chips: Array<{ label: string; positive: boolean }> = [];
  if (activity.bankEffect) {
    const scaled = scaleActivityCost(activity.bankEffect, countryCode);
    const fmtAmt = formatCurrency(Math.abs(scaled), countryCode);
    chips.push({ label: scaled > 0 ? `+${fmtAmt}` : `-${fmtAmt}`, positive: scaled > 0 });
  }
  const eff = activity.statEffect;
  if (eff.fitness)      chips.push({ label: `${eff.fitness! > 0 ? '+' : ''}${eff.fitness} Fit`, positive: (eff.fitness ?? 0) > 0 });
  if (eff.happiness)    chips.push({ label: `${eff.happiness! > 0 ? '+' : ''}${eff.happiness} Joy`, positive: (eff.happiness ?? 0) > 0 });
  if (eff.intelligence) chips.push({ label: `${eff.intelligence! > 0 ? '+' : ''}${eff.intelligence} IQ`, positive: (eff.intelligence ?? 0) > 0 });
  if (eff.social)       chips.push({ label: `${eff.social! > 0 ? '+' : ''}${eff.social} Social`, positive: (eff.social ?? 0) > 0 });
  if (eff.health)       chips.push({ label: `${eff.health! > 0 ? '+' : ''}${eff.health} HP`, positive: (eff.health ?? 0) > 0 });
  if (eff.karma)        chips.push({ label: `${eff.karma! > 0 ? '+' : ''}${eff.karma} Karma`, positive: (eff.karma ?? 0) > 0 });

  return (
    <View style={styles.row}>
      {chips.slice(0, 3).map((c, i) => (
        <View key={i} style={[styles.chip, { backgroundColor: c.positive ? `${colors.teal}18` : `${colors.crimson}18` }]}>
          <Text style={[styles.chipText, { color: c.positive ? colors.teal : colors.crimson }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const createEcStyles = ({ fonts, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  row:      { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  chip:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.xs },
  chipText: { fontFamily: fonts.monoSemiBold, fontSize: 9 },
});

// ─── Activity Card ────────────────────────────────────────────────────────────
function ActivityCard({
  activity,
  onPress,
  disabled,
  countryCode,
  catMeta,
}: { activity: Activity; onPress: () => void; disabled: boolean; countryCode: string; catMeta: ReturnType<typeof getCatMeta> }) {
  const styles = useThemedStyles(createAcStyles);
  const meta = catMeta[activity.category];
  const hasCost = (activity.bankEffect ?? 0) < 0 || (activity.cost ?? 0) > 0;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.card, { borderColor: `${meta.color}30` }, disabled && styles.disabled, pressed && { opacity: 0.85 }]}
      android_ripple={{ color: `${meta.color}15` }}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}18` }]}>
        <CatIcon cat={activity.category} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{activity.label}</Text>
        <Text style={styles.desc} numberOfLines={2}>{activity.description}</Text>
        <EffectChips activity={activity} countryCode={countryCode} />
      </View>
      {hasCost && (
        <View style={[styles.costBadge, { borderColor: `${meta.color}40`, backgroundColor: `${meta.color}10` }]}>
          <Text style={[styles.costText, { color: meta.color }]}>
            {activity.bankEffect && activity.bankEffect < 0
              ? formatCurrency(Math.abs(scaleActivityCost(activity.bankEffect, countryCode)), countryCode)
              : `${activity.cost}c`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const createAcStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.md, backgroundColor: colors.bgCard, borderRadius: radii.md, borderWidth: 1.5, marginBottom: spacing.sm },
  disabled:  { opacity: 0.4 },
  iconWrap:  { width: 44, height: 44, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  label:     { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
  desc:      { fontFamily: fonts.body, fontSize: 11, color: colors.t3, marginTop: 2, lineHeight: 15 },
  costBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, borderWidth: 1, alignSelf: 'flex-start' },
  costText:  { fontFamily: fonts.monoSemiBold, fontSize: 11 },
});

const ALL_CAT_KEYS = ['mind', 'body', 'social', 'financial', 'illegal', 'health', 'misc'] as const;
const ALL_CATS = ['all', ...ALL_CAT_KEYS] as const;
type FilterCat = 'all' | ActivityCategory;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ActivitiesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character        = useGameStore(s => s.character);
  const performActivity  = useGameStore(s => s.performActivity);
  const [filter, setFilter] = useState<FilterCat>('all');
  const [tab, setTab] = useState<'activities' | 'hobbies'>('activities');

  if (!character) return null;

  const catMeta = getCatMeta(colors);
  const { countryCode, age } = character;
  const eligibleHobbies = HOBBY_CATALOG.filter(h => age >= h.minAge).slice(0, 20);
  const eligible = ACTIVITIES.filter(a => {
    if (character.age < a.minAge || character.age > a.maxAge) return false;
    if (filter !== 'all' && a.category !== filter) return false;
    const gate = getActivityFeatureGate(a.id, a.category);
    if (gate && !isFeatureEnabled(character, gate)) return false;
    return true;
  });

  const handleActivity = (activity: Activity) => {
    const scaledCost = activity.bankEffect
      ? scaleActivityCost(activity.bankEffect, countryCode)
      : 0;
    const canAffordBank = !scaledCost || scaledCost >= 0 || character.bankBalance >= Math.abs(scaledCost);
    const canAffordCoins = !activity.cost || character.coins >= activity.cost;

    if (!canAffordBank) {
      Alert.alert('Not Enough Money', `You need ${formatCurrency(Math.abs(scaledCost), countryCode)} for this.`);
      return;
    }
    if (!canAffordCoins) {
      Alert.alert('Not Enough Coins', `You need ${activity.cost} coins.`);
      return;
    }

    Alert.alert(
      activity.label,
      activity.description,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Do It',
          onPress: () => {
            const result = performActivity(activity.id);
            Alert.alert(result.success ? '✓ Done' : '✗ Failed', result.message);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.column}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Activities" subtitle="Things you can do right now" />
        </View>

        <View style={styles.tabBar}>
          {(['activities', 'hobbies'] as const).map(t => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabChip, tab === t && styles.tabChipActive]}
            >
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                {t === 'activities' ? 'Activities' : 'Hobby Hub'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'activities' && (
        <>
        {/* Filter chips */}
        <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {ALL_CATS.map(cat => {
            const active = cat === filter;
            const meta = cat !== 'all' ? catMeta[cat as ActivityCategory] : null;
            const label = cat === 'all' ? 'All' : meta!.label;
            const color = meta?.color ?? colors.gold;
            return (
              <Pressable
                key={cat}
                onPress={() => setFilter(cat as FilterCat)}
                style={[styles.filterChip, active && { borderColor: color, backgroundColor: `${color}12` }]}
              >
                {/* Fixed-width icon slot keeps all chips the same width */}
                <View style={styles.filterIconSlot}>
                  {cat !== 'all' && <CatIcon cat={cat as ActivityCategory} color={active ? color : colors.t4} />}
                </View>
                <Text style={[styles.filterLabel, active && { color, fontFamily: FONTS.bodyBold }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {eligible.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                  <Circle stroke={colors.t4} strokeWidth={1.5} cx="12" cy="12" r="10"/>
                  <Path stroke={colors.t4} strokeWidth={1.5} strokeLinecap="round" d="M4.93 4.93l14.14 14.14"/>
                </Svg>
              </View>
              <Text style={styles.emptyText}>No activities available right now.</Text>
            </View>
          ) : (
            eligible.map(a => (
              <ActivityCard
                key={a.id}
                activity={a}
                onPress={() => handleActivity(a)}
                disabled={false}
                countryCode={countryCode}
                catMeta={catMeta}
              />
            ))
          )}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
        </>
        )}

        {tab === 'hobbies' && (
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SectionLabel label="Your Hobbies" />
          {eligibleHobbies.map(h => {
            const progress = getHobbyProgress(character, h.id);
            return (
              <Pressable
                key={h.id}
                onPress={() => navigation.navigate('HobbyDetail', { hobbyId: h.id })}
                style={styles.hobbyRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.hobbyName}>{h.label}</Text>
                  <Text style={styles.hobbySub}>{h.category} · Lv {progress.level}</Text>
                </View>
                <Text style={styles.hobbyXp}>{progress.xp} XP</Text>
              </Pressable>
            );
          })}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
        )}
        </View>
      </SafeAreaView>
      <ContextualTutorial screenId="activities" />
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  safe:         { flex: 1 },
  column:       { flex: 1 },
  headerWrap:   { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  filterBar:    { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg2 },
  filterContent:{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  contentScroll:{ flex: 1 },
  filterChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, height: 34, backgroundColor: colors.bgCard, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, minWidth: 72, justifyContent: 'center' },
  filterIconSlot: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  filterLabel:  { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.t3 },
  scroll:       { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  empty:        { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.md },
  emptyIconWrap:{ width: 72, height: 72, borderRadius: 22, backgroundColor: colors.bg2, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  emptyText:    { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t3 },
  tabBar: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  tabChip: { flex: 1, paddingVertical: 8, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabChipActive: { borderColor: colors.gold, backgroundColor: `${colors.gold}12` },
  tabLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.t3 },
  tabLabelActive: { fontFamily: fonts.bodySemiBold, color: colors.gold },
  hobbyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.bgCard, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  hobbyName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
  hobbySub: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, marginTop: 2 },
  hobbyXp: { fontFamily: fonts.monoSemiBold, fontSize: 12, color: colors.gold },
});
