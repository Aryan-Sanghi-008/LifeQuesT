import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";

import type { EventRarity } from "@/types";

interface Props {
  rarity: EventRarity;
}

export function RarityBadge({ rarity }: Props) {
  const { colors, fonts } = useTheme();

  const rarityColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    common: {
      bg: `${colors.rarityCommon}14`,
      text: colors.rarityCommon,
      border: `${colors.rarityCommon}30`,
    },
    uncommon: {
      bg: `${colors.rarityUncommon}14`,
      text: colors.rarityUncommon,
      border: `${colors.rarityUncommon}30`,
    },
    rare: {
      bg: `${colors.rarityRare}14`,
      text: colors.rarityRare,
      border: `${colors.rarityRare}30`,
    },
    epic: {
      bg: `${colors.rarityEpic}14`,
      text: colors.rarityEpic,
      border: `${colors.rarityEpic}30`,
    },
    legendary: {
      bg: `${colors.rarityLegendary}14`,
      text: colors.rarityLegendary,
      border: `${colors.rarityLegendary}30`,
    },
  };

  const current = rarityColors[rarity] ?? rarityColors.common;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: current.bg, borderColor: current.border },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: current.text, fontFamily: fonts.bodySemiBold },
        ]}
      >
        {rarity.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
});
