import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@theme';
import { COUNTRIES } from '@data/gameData';

/** Approximate map positions (viewBox 360 x 180) */
const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  US: { x: 72, y: 62 },
  BR: { x: 108, y: 118 },
  GB: { x: 168, y: 48 },
  DE: { x: 178, y: 52 },
  NG: { x: 178, y: 88 },
  AE: { x: 210, y: 78 },
  IN: { x: 228, y: 82 },
  SG: { x: 258, y: 98 },
  JP: { x: 278, y: 68 },
  AU: { x: 288, y: 128 },
};

interface Props {
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function WorldMapPicker({ selectedCode, onSelect }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const selected = COUNTRIES.find((c) => c.code === selectedCode);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg2,
        overflow: 'hidden',
      }}>
        <Svg width="100%" height={160} viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet">
          {/* Simplified continent silhouettes */}
          <Path
            d="M40 50 Q80 30 120 45 Q140 70 110 95 Q70 100 40 80 Z"
            fill={`${colors.sapphire}25`}
            stroke={colors.border}
            strokeWidth={0.8}
          />
          <Path
            d="M95 95 Q130 80 155 100 Q165 130 130 145 Q100 140 95 95 Z"
            fill={`${colors.emerald}20`}
            stroke={colors.border}
            strokeWidth={0.8}
          />
          <Path
            d="M155 35 Q200 25 240 40 Q260 65 230 85 Q190 90 155 70 Z"
            fill={`${colors.orchid}18`}
            stroke={colors.border}
            strokeWidth={0.8}
          />
          <Path
            d="M220 70 Q270 55 310 75 Q320 110 280 130 Q240 125 220 95 Z"
            fill={`${colors.gold}18`}
            stroke={colors.border}
            strokeWidth={0.8}
          />
          <Path
            d="M270 120 Q300 115 315 135 Q300 155 270 150 Z"
            fill={`${colors.teal}20`}
            stroke={colors.border}
            strokeWidth={0.8}
          />

          {COUNTRIES.map((c) => {
            const pos = COUNTRY_POSITIONS[c.code];
            if (!pos) return null;
            const active = c.code === selectedCode;
            return (
              <Circle
                key={c.code}
                cx={pos.x}
                cy={pos.y}
                r={active ? 9 : 6}
                fill={active ? colors.gold : colors.sapphire}
                opacity={active ? 1 : 0.75}
                onPress={() => onSelect(c.code)}
              />
            );
          })}
        </Svg>
      </View>

      {selected && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radii.md,
          backgroundColor: `${colors.gold}12`,
          borderWidth: 1,
          borderColor: `${colors.gold}35`,
        }}>
          <Text style={{ fontSize: 28 }}>{selected.flag}</Text>
          <View>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>{selected.name}</Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>Tap another dot to change birthplace</Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {COUNTRIES.map((c) => {
          const active = c.code === selectedCode;
          return (
            <Pressable
              key={c.code}
              onPress={() => onSelect(c.code)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: active ? colors.gold : colors.border,
                backgroundColor: active ? `${colors.gold}15` : colors.bgCard,
              }}
            >
              <Text style={{ fontSize: 12, color: active ? colors.gold3 ?? colors.gold : colors.t2 }}>
                {c.flag} {c.code}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
