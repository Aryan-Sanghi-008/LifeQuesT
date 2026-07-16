import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { CharacterNameText } from '@shared/components/CharacterNameText';
import { useSettingsStore } from '@store/settingsStore';
import Svg, { Path, Circle, Ellipse, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface Props {
  name: string;
  birthYear: number;
  deathAge: number;
  tombstoneStyleId?: string;
  /** Compact preview mode for shop sheet */
  compact?: boolean;
}

const STYLE_COLORS: Record<string, { stone: string; stoneEdge: string; accent: string }> = {
  gothic: { stone: '#1F2937', stoneEdge: '#0B1220', accent: '#C4B5FD' },
  modern: { stone: '#E2E8F0', stoneEdge: '#94A3B8', accent: '#475569' },
  angelic: { stone: '#FFFBEB', stoneEdge: '#FDE68A', accent: '#D97706' },
};

function resolveStyleKey(tombstoneStyleId?: string, equippedId?: string | null): string {
  if (tombstoneStyleId && STYLE_COLORS[tombstoneStyleId]) return tombstoneStyleId;
  if (equippedId?.startsWith('tombstone_')) {
    const key = equippedId.replace('tombstone_', '');
    if (STYLE_COLORS[key]) return key;
  }
  return '';
}

export function TombstoneHero({ name, birthYear, deathAge, tombstoneStyleId, compact }: Props) {
  const { colors, fonts } = useTheme();
  const equippedTombstoneId = useSettingsStore((s) => s.equippedTombstoneId);
  const styleKey = resolveStyleKey(tombstoneStyleId, equippedTombstoneId);
  const deathYear = birthYear + deathAge;
  const palette = STYLE_COLORS[styleKey] ?? {
    stone: colors.bgCard,
    stoneEdge: colors.bg2,
    accent: colors.gold,
  };

  const w = compact ? 140 : 220;
  const h = compact ? 180 : 280;

  return (
    <View style={[styles.container, compact && { marginBottom: 0 }]}>
      <Svg width={w} height={h} viewBox="0 0 220 280">
        <Defs>
          <RadialGradient id="stone" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={palette.stone} stopOpacity="1" />
            <Stop offset="100%" stopColor={palette.stoneEdge} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="110" cy="268" rx="80" ry="10" fill={palette.stoneEdge} opacity={0.7} />

        {styleKey === 'gothic' ? (
          <>
            <Path
              d="M40 250 L40 110 Q40 40 110 28 Q180 40 180 110 L180 250 Z"
              fill="url(#stone)"
              stroke={palette.accent}
              strokeWidth="2"
            />
            <Path d="M110 28 L110 8" stroke={palette.accent} strokeWidth="2" />
            <Path d="M95 20 L110 8 L125 20" stroke={palette.accent} strokeWidth="1.5" fill="none" />
            <Path d="M55 90 L75 70 L95 90" stroke={palette.accent} strokeWidth="1.2" fill="none" opacity={0.7} />
            <Path d="M125 90 L145 70 L165 90" stroke={palette.accent} strokeWidth="1.2" fill="none" opacity={0.7} />
          </>
        ) : styleKey === 'modern' ? (
          <>
            <Rect x="45" y="55" width="130" height="195" rx="4" fill="url(#stone)" stroke={palette.accent} strokeWidth="2" />
            <Rect x="55" y="70" width="110" height="4" fill={palette.accent} opacity={0.5} />
            <Circle cx="110" cy="110" r="14" fill="none" stroke={palette.accent} strokeWidth="1.5" />
          </>
        ) : styleKey === 'angelic' ? (
          <>
            <Path
              d="M30 250 L30 120 Q30 50 110 50 Q190 50 190 120 L190 250 Z"
              fill="url(#stone)"
              stroke={palette.accent}
              strokeWidth="2"
            />
            <Path d="M50 95 Q80 55 110 95 Q140 55 170 95" stroke={palette.accent} strokeWidth="1.5" fill="none" opacity={0.8} />
            <Circle cx="110" cy="110" r="16" fill="none" stroke={palette.accent} strokeWidth="1.2" />
          </>
        ) : (
          <Path
            d="M30 250 L30 120 Q30 50 110 50 Q190 50 190 120 L190 250 Z"
            fill="url(#stone)"
            stroke={palette.accent}
            strokeWidth="2"
          />
        )}

        <Path d="M55 150 L165 150" stroke={palette.accent} strokeWidth="0.8" opacity={0.6} />
        <Path d="M65 200 L155 200" stroke={palette.accent} strokeWidth="0.8" opacity={0.6} />
        {styleKey !== 'modern' && (
          <Path
            d="M110 98 L114 106 L122 106 L116 112 L118 120 L110 115 L102 120 L104 112 L98 106 L106 106 Z"
            fill={palette.accent}
            opacity={0.75}
          />
        )}
      </Svg>
      <View style={[styles.textOverlay, compact && { bottom: 24, paddingHorizontal: 24 }]}>
        <Text style={[styles.rip, { color: palette.accent, fontFamily: fonts.displayBold, fontSize: compact ? 11 : 14 }]}>
          R.I.P.
        </Text>
        <CharacterNameText
          name={name}
          style={[styles.name, { fontFamily: fonts.displayBlack, fontSize: compact ? 14 : 22 }]}
          numberOfLines={2}
        />
        {!compact && (
          <>
            <Text style={[styles.dates, { color: colors.t3, fontFamily: fonts.body }]}>
              {birthYear} — {deathYear}
            </Text>
            <Text style={[styles.age, { color: colors.t4, fontFamily: fonts.body }]}>
              Aged {deathAge}
            </Text>
          </>
        )}
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
