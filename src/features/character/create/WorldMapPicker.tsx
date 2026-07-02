import { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import { COUNTRIES } from '@data/gameData';

interface Props {
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function WorldMapPicker({ selectedCode, onSelect }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = COUNTRIES.find((c) => c.code === selectedCode);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Search bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bgCard,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
      }}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </Svg>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search country…"
          placeholderTextColor={colors.t4}
          style={{
            flex: 1,
            paddingVertical: 10,
            color: colors.t1,
            fontFamily: fonts.body,
            fontSize: 14,
          }}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Text style={{ color: colors.t4, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Selected country highlight */}
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
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>
              {selected.name}
            </Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
              Selected birthplace · tap any flag below to change
            </Text>
          </View>
        </View>
      )}

      {/* Country chip grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {filtered.length === 0 ? (
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 13, padding: spacing.sm }}>
            No countries match "{query}"
          </Text>
        ) : (
          filtered.map((c) => {
            const active = c.code === selectedCode;
            return (
              <Pressable
                key={c.code}
                onPress={() => onSelect(c.code)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderRadius: radii.full,
                  borderWidth: 1.5,
                  borderColor: active ? colors.gold : colors.border,
                  backgroundColor: active ? `${colors.gold}15` : colors.bgCard,
                }}
              >
                <Text style={{ fontSize: 16 }}>{c.flag}</Text>
                <Text style={{
                  fontFamily: active ? fonts.bodyBold : fonts.body,
                  fontSize: 12,
                  color: active ? (colors as Record<string, string>).gold3 ?? colors.gold : colors.t2,
                }}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}
