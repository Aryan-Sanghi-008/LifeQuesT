import { View, Text, StyleSheet } from 'react-native';
import { CharacterStats } from '@/types';
import { useThemedStyles, useTheme } from '@theme';
import { StatBar } from './index';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface StatPanelProps {
  stats: CharacterStats;
  compact?: boolean;
}

function getStatConfig(colors: ReturnType<typeof useTheme>['colors']) {
  return [
  {
    key: 'health' as keyof CharacterStats,
    label: 'Health',
    color: colors.crimson,
    icon: (c: string) => (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill={c}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
  },
  {
    key: 'happiness' as keyof CharacterStats,
    label: 'Joy',
    color: colors.gold,
    icon: (c: string) => (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
        <Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" />
        <Line stroke={c} strokeWidth={2} strokeLinecap="round" x1="9" y1="9" x2="9.01" y2="9" />
        <Line stroke={c} strokeWidth={2} strokeLinecap="round" x1="15" y1="9" x2="15.01" y2="9" />
      </Svg>
    ),
  },
  {
    key: 'mentalHealth' as keyof CharacterStats,
    label: 'Mindset',
    color: colors.orchid,
    icon: (c: string) => (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
        <Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8v4" />
      </Svg>
    ),
  },
  {
    key: 'intelligence' as keyof CharacterStats,
    label: 'Mind',
    color: colors.sapphire,
    icon: (c: string) => (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
        <Circle stroke={c} strokeWidth={2} cx="12" cy="12" r="10" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8v4l3 3" />
      </Svg>
    ),
  },
  {
    key: 'wealth' as keyof CharacterStats,
    label: 'Wealth',
    color: colors.teal,
    icon: (c: string) => (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill={c}>
        <Path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </Svg>
    ),
  },
] as const;
}

export default function StatPanel({ stats, compact = false }: StatPanelProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const statConfig = getStatConfig(colors);
  return (
    <View style={compact ? styles.gridCompact : styles.grid}>
      {statConfig.map((cfg, i) => {
        const val = stats[cfg.key];
        return (
          <View key={String(cfg.key)} style={[styles.pill, compact && styles.pillCompact]}>
            {cfg.icon(cfg.color)}
            <View style={styles.col}>
              <View style={styles.top}>
                <Text style={styles.lbl}>{cfg.label}</Text>
                <Text style={[styles.val, { color: cfg.color }]}>{val}</Text>
              </View>
              <StatBar value={val} color={cfg.color} height={compact ? 3 : 4} delay={i * 80} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = ({ colors, fonts }: ReturnType<typeof useTheme>) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  pill: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pillCompact: {
    padding: 7,
  },
  col: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  lbl: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.t3,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  val: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '600',
  },
});