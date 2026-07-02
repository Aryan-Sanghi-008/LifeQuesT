import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { CharacterNameText } from '@shared/components/CharacterNameText';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  name: string;
  birthYear: number;
  deathAge: number;
  tombstoneStyleId?: string;
}

const STYLE_COLORS: Record<string, { stone: string; stoneEdge: string; accent: string }> = {
  gothic: { stone: '#1F2937', stoneEdge: '#111827', accent: '#9CA3AF' },
  modern: { stone: '#CBD5E1', stoneEdge: '#94A3B8', accent: '#64748B' },
  angelic: { stone: '#F8FAFC', stoneEdge: '#E2E8F0', accent: '#F59E0B' },
};

export function TombstoneHero({ name, birthYear, deathAge, tombstoneStyleId }: Props) {
  const { colors, fonts } = useTheme();
  const deathYear = birthYear + deathAge;
  const palette = STYLE_COLORS[tombstoneStyleId ?? ''] ?? {
    stone: colors.bgCard,
    stoneEdge: colors.bg2,
    accent: colors.gold,
  };

  return (
    <View style={styles.container}>
      <Svg width={220} height={280} viewBox="0 0 220 280">
        <Defs>
          <RadialGradient id="stone" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={palette.stone} stopOpacity="1" />
            <Stop offset="100%" stopColor={palette.stoneEdge} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="110" cy="268" rx="80" ry="10" fill={palette.stoneEdge} opacity={0.7} />
        <Path
          d="M30 250 L30 120 Q30 50 110 50 Q190 50 190 120 L190 250 Z"
          fill="url(#stone)"
          stroke={palette.accent}
          strokeWidth="2"
        />
        <Path d="M55 150 L165 150" stroke={palette.accent} strokeWidth="0.8" opacity={0.6} />
        <Path d="M65 200 L155 200" stroke={palette.accent} strokeWidth="0.8" opacity={0.6} />
        <Circle cx="110" cy="110" r="20" fill="none" stroke={palette.accent} strokeWidth="1" />
        <Path
          d="M110 98 L114 106 L122 106 L116 112 L118 120 L110 115 L102 120 L104 112 L98 106 L106 106 Z"
          fill={palette.accent}
          opacity={0.75}
        />
      </Svg>
      <View style={styles.textOverlay}>
        <Text style={[styles.rip, { color: palette.accent, fontFamily: fonts.displayBold }]}>R.I.P.</Text>
        <CharacterNameText
          name={name}
          style={[styles.name, { fontFamily: fonts.displayBlack }]}
          numberOfLines={2}
        />
        <Text style={[styles.dates, { color: colors.t3, fontFamily: fonts.body }]}>
          {birthYear} — {deathYear}
        </Text>
        <Text style={[styles.age, { color: colors.t4, fontFamily: fonts.body }]}>
          Aged {deathAge}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 8 },
  textOverlay: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    alignItems: 'center', gap: 4, paddingHorizontal: 40,
  },
  rip: { fontSize: 14, letterSpacing: 3 },
  name: { fontSize: 22, textAlign: 'center' },
  dates: { fontSize: 13, letterSpacing: 1.5, marginTop: 4 },
  age: { fontSize: 11, letterSpacing: 1 },
});
