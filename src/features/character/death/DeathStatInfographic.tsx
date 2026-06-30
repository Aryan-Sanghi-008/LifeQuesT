import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

export interface InfographicStat {
  label: string;
  value: string;
  color: string;
  pct?: number;
}

export function DeathStatInfographic({ stats }: { stats: InfographicStat[] }) {
  const { colors, fonts, radii } = useTheme();
  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View
          key={s.label}
          style={[styles.cell, { backgroundColor: `${s.color}10`, borderColor: `${s.color}40`, borderRadius: radii.md }]}
        >
          {s.pct !== undefined && (
            <View style={[styles.barTrack, { backgroundColor: colors.bg2 }]}>
              <View style={[styles.barFill, { width: `${s.pct}%` as `${number}%`, backgroundColor: s.color }]} />
            </View>
          )}
          <Text style={[styles.val, { color: s.color, fontFamily: fonts.displayBold }]}>{s.value}</Text>
          <Text style={[styles.label, { color: colors.t3, fontFamily: fonts.body }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47%', padding: 14, borderWidth: 1, gap: 4, alignItems: 'center' },
  barTrack: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: 4, borderRadius: 2 },
  val: { fontSize: 22 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
});
