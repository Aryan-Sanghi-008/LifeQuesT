import { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import {
  COUNTRIES,
  COUNTRY_REGIONS,
  getCountryRegion,
  type CountryRegion,
} from '@data/gameData';
import { getCreateStyles } from './styles';

interface Props {
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function WorldMapPicker({ selectedCode, onSelect }: Props) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<CountryRegion>(() =>
    getCountryRegion(selectedCode),
  );

  useEffect(() => {
    setActiveRegion(getCountryRegion(selectedCode));
  }, [selectedCode]);

  const regionLabel = COUNTRY_REGIONS.find((r) => r.id === activeRegion)?.label ?? 'Asia';

  const filtered = useMemo(() => {
    const inRegion = COUNTRIES.filter((c) => c.region === activeRegion);
    const q = query.trim().toLowerCase();
    if (!q) return inRegion;
    return inRegion.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query, activeRegion]);

  const selected = COUNTRIES.find((c) => c.code === selectedCode);

  return (
    <View style={{ gap: spacing.md }}>
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
          placeholder="Search in region…"
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
              Selected birthplace
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.regionTabBar}
      >
        {COUNTRY_REGIONS.map((region) => {
          const active = region.id === activeRegion;
          return (
            <Pressable
              key={region.id}
              onPress={() => {
                setActiveRegion(region.id);
                setQuery('');
              }}
              style={[
                styles.regionTab,
                {
                  borderColor: active ? colors.gold : colors.border,
                  backgroundColor: active ? `${colors.gold}15` : colors.bgCard,
                },
              ]}
            >
              <Text style={{
                fontFamily: active ? fonts.bodyBold : fonts.body,
                fontSize: 12,
                color: active ? colors.gold : colors.t3,
              }}>
                {region.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {filtered.length === 0 ? (
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 13, padding: spacing.sm }}>
            {query
              ? `No matches in ${regionLabel}. Try another tab or clear search.`
              : `No countries in ${regionLabel}.`}
          </Text>
        ) : (
          filtered.map((c) => {
            const active = c.code === selectedCode;
            return (
              <Pressable
                key={c.code}
                onPress={() => onSelect(c.code)}
                style={[
                  styles.countryChip,
                  {
                    borderColor: active ? colors.gold : colors.border,
                    backgroundColor: active ? `${colors.gold}15` : colors.bgCard,
                  },
                ]}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[
                  styles.countryName,
                  {
                    fontFamily: active ? fonts.bodyBold : fonts.body,
                    color: active ? colors.gold : colors.t2,
                  },
                ]}>
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
