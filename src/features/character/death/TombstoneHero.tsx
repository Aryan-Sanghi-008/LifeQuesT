import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  name: string;
  birthYear: number;
  deathAge: number;
}

export function TombstoneHero({ name, birthYear, deathAge }: Props) {
  const { colors, fonts } = useTheme();
  const deathYear = birthYear + deathAge;

  return (
    <View style={styles.container}>
      <Svg width={220} height={280} viewBox="0 0 220 280">
        <Defs>
          <RadialGradient id="stone" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={colors.bgCard} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.bg2} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="110" cy="268" rx="80" ry="10" fill={colors.bg2} opacity={0.7} />
        <Path
          d="M30 250 L30 120 Q30 50 110 50 Q190 50 190 120 L190 250 Z"
          fill={colors.bgCard}
          stroke={colors.border}
          strokeWidth="2"
        />
        <Path d="M55 150 L165 150" stroke={colors.border} strokeWidth="0.8" />
        <Path d="M65 200 L155 200" stroke={colors.border} strokeWidth="0.8" />
        <Circle cx="110" cy="110" r="20" fill="none" stroke={colors.border} strokeWidth="1" />
        <Path
          d="M110 98 L114 106 L122 106 L116 112 L118 120 L110 115 L102 120 L104 112 L98 106 L106 106 Z"
          fill={colors.gold}
          opacity={0.6}
        />
      </Svg>
      <View style={styles.textOverlay}>
        <Text style={[styles.rip, { color: colors.gold, fontFamily: fonts.displayBold }]}>R.I.P.</Text>
        <Text style={[styles.name, { color: colors.t1, fontFamily: fonts.displayBlack }]} numberOfLines={2}>
          {name}
        </Text>
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
