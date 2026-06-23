import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { ACTIVITIES } from '../data/gameData';
import { Activity, ActivityCategory } from '../types';
import Svg, { Path, Circle } from 'react-native-svg';

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
const CAT_META: Record<ActivityCategory, { color: string; label: string }> = {
  mind:      { color: COLORS.sapphire, label: 'Mind'      },
  body:      { color: COLORS.teal,     label: 'Body'      },
  social:    { color: COLORS.orchid,   label: 'Social'    },
  financial: { color: COLORS.gold,     label: 'Financial' },
  illegal:   { color: COLORS.crimson,  label: 'Illegal'   },
  health:    { color: COLORS.crimson,  label: 'Health'    },
  misc:      { color: COLORS.gold3,    label: 'Misc'      },
};

// ─── Stat effect summary ──────────────────────────────────────────────────────
function EffectChips({ activity }: { activity: Activity }) {
  const chips: Array<{ label: string; positive: boolean }> = [];
  if (activity.bankEffect) {
    chips.push({ label: activity.bankEffect > 0 ? `+₹${(activity.bankEffect/1000).toFixed(0)}K` : `-₹${Math.abs(activity.bankEffect/1000).toFixed(0)}K`, positive: activity.bankEffect > 0 });
  }
  const eff = activity.statEffect;
  if (eff.fitness)      chips.push({ label: `${eff.fitness! > 0 ? '+' : ''}${eff.fitness} Fit`, positive: (eff.fitness ?? 0) > 0 });
  if (eff.happiness)    chips.push({ label: `${eff.happiness! > 0 ? '+' : ''}${eff.happiness} Joy`, positive: (eff.happiness ?? 0) > 0 });
  if (eff.intelligence) chips.push({ label: `${eff.intelligence! > 0 ? '+' : ''}${eff.intelligence} IQ`, positive: (eff.intelligence ?? 0) > 0 });
  if (eff.social)       chips.push({ label: `${eff.social! > 0 ? '+' : ''}${eff.social} Social`, positive: (eff.social ?? 0) > 0 });
  if (eff.health)       chips.push({ label: `${eff.health! > 0 ? '+' : ''}${eff.health} HP`, positive: (eff.health ?? 0) > 0 });
  if (eff.karma)        chips.push({ label: `${eff.karma! > 0 ? '+' : ''}${eff.karma} Karma`, positive: (eff.karma ?? 0) > 0 });

  return (
    <View style={ec.row}>
      {chips.slice(0, 3).map((c, i) => (
        <View key={i} style={[ec.chip, { backgroundColor: c.positive ? `${COLORS.teal}18` : `${COLORS.crimson}18` }]}>
          <Text style={[ec.chipText, { color: c.positive ? COLORS.teal : COLORS.crimson }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const ec = StyleSheet.create({
  row:      { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  chip:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADII.xs },
  chipText: { fontFamily: FONTS.monoSemiBold, fontSize: 9 },
});

// ─── Activity Card ────────────────────────────────────────────────────────────
function ActivityCard({
  activity,
  onPress,
  disabled,
}: { activity: Activity; onPress: () => void; disabled: boolean }) {
  const meta = CAT_META[activity.category];
  const hasCost = (activity.bankEffect ?? 0) < 0 || (activity.cost ?? 0) > 0;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [ac.card, { borderColor: `${meta.color}30` }, disabled && ac.disabled, pressed && { opacity: 0.85 }]}
      android_ripple={{ color: `${meta.color}15` }}
    >
      <View style={[ac.iconWrap, { backgroundColor: `${meta.color}18` }]}>
        <CatIcon cat={activity.category} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ac.label}>{activity.label}</Text>
        <Text style={ac.desc} numberOfLines={2}>{activity.description}</Text>
        <EffectChips activity={activity} />
      </View>
      {hasCost && (
        <View style={[ac.costBadge, { borderColor: `${meta.color}40`, backgroundColor: `${meta.color}10` }]}>
          <Text style={[ac.costText, { color: meta.color }]}>
            {activity.bankEffect && activity.bankEffect < 0
              ? `₹${Math.abs(activity.bankEffect / 1000).toFixed(0)}K`
              : `${activity.cost}c`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const ac = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1.5, marginBottom: SPACING.sm },
  disabled:  { opacity: 0.4 },
  iconWrap:  { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  label:     { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  desc:      { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, marginTop: 2, lineHeight: 15 },
  costBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.sm, borderWidth: 1, alignSelf: 'flex-start' },
  costText:  { fontFamily: FONTS.monoSemiBold, fontSize: 11 },
});

// ─── Category filter ──────────────────────────────────────────────────────────
const ALL_CATS = ['all', ...Object.keys(CAT_META)] as const;
type FilterCat = 'all' | ActivityCategory;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ActivitiesScreen() {
  const character        = useGameStore(s => s.character);
  const performActivity  = useGameStore(s => s.performActivity);
  const [filter, setFilter] = useState<FilterCat>('all');

  if (!character) return null;

  const eligible = ACTIVITIES.filter(a =>
    character.age >= a.minAge && character.age <= a.maxAge &&
    (filter === 'all' || a.category === filter)
  );

  const handleActivity = (activity: Activity) => {
    const canAffordBank = !activity.bankEffect || activity.bankEffect >= 0 || character.bankBalance >= Math.abs(activity.bankEffect);
    const canAffordCoins = !activity.cost || character.coins >= activity.cost;

    if (!canAffordBank) {
      Alert.alert('Not Enough Money', `You need ₹${Math.abs((activity.bankEffect ?? 0) / 1000).toFixed(0)}K for this.`);
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
        <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={styles.header}>
          <Text style={styles.headerTitle}>Activities</Text>
          <Text style={styles.headerSub}>Things you can do right now</Text>
        </LinearGradient>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
          {ALL_CATS.map(cat => {
            const active = cat === filter;
            const meta = cat !== 'all' ? CAT_META[cat as ActivityCategory] : null;
            const label = cat === 'all' ? 'All' : meta!.label;
            const color = meta?.color ?? COLORS.gold;
            return (
              <Pressable
                key={cat}
                onPress={() => setFilter(cat as FilterCat)}
                style={[styles.filterChip, active && { borderColor: color, backgroundColor: `${color}12` }]}
              >
                {cat !== 'all' && <CatIcon cat={cat as ActivityCategory} color={active ? color : COLORS.t4} />}
                <Text style={[styles.filterLabel, active && { color, fontFamily: FONTS.bodyBold }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {eligible.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                  <Circle stroke={COLORS.t4} strokeWidth={1.5} cx="12" cy="12" r="10"/>
                  <Path stroke={COLORS.t4} strokeWidth={1.5} strokeLinecap="round" d="M4.93 4.93l14.14 14.14"/>
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
              />
            ))
          )}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: COLORS.bg },
  safe:         { flex: 1 },
  header:       { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  headerSub:    { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  filterBar:    { borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg2 },
  filterContent:{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  filterChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, backgroundColor: COLORS.bgCard, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}10` },
  filterLabel:  { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.t3 },
  scroll:       { padding: SPACING.lg },
  empty:        { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.md },
  emptyIconWrap:{ width: 72, height: 72, borderRadius: 22, backgroundColor: COLORS.bg2, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  emptyText:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t3 },
});
