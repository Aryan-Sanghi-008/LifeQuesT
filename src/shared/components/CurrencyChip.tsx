import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  type: "coin" | "gem" | "ticket";
  amount: number;
}

export function CurrencyChip({ type, amount }: Props) {
  const { colors, fonts } = useTheme();

  const isCoin = type === "coin";
  const isGem = type === "gem";

  const badgeColor = isCoin
    ? colors.gold
    : isGem
    ? colors.orchid
    : colors.teal;

  const bg = `${badgeColor}10`;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: bg, borderColor: `${badgeColor}25` },
      ]}
    >
      {isCoin && (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="12"
            r="10"
            stroke={colors.gold}
            strokeWidth={2.5}
            fill={`${colors.gold}20`}
          />
          <Path
            d="M12 7v10M9 9h5a2 2 0 010 4H9a2 2 0 000 4h5"
            stroke={colors.gold}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      )}
      {isGem && (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3h12l4 6-10 12L2 9z"
            stroke={colors.orchid}
            strokeWidth={2.5}
            fill={`${colors.orchid}20`}
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {!isCoin && !isGem && (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 9a3 3 0 013-3h14a3 3 0 013 3v6a3 3 0 01-3 3H5a3 3 0 01-3-3z"
            stroke={colors.teal}
            strokeWidth={2.2}
          />
          <Circle cx="12" cy="12" r="2.5" stroke={colors.teal} strokeWidth={2.2} />
        </Svg>
      )}
      <Text
        style={[
          styles.amountText,
          { color: colors.t1, fontFamily: fonts.mono },
        ]}
      >
        {amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
    alignSelf: "flex-start",
  },
  amountText: {
    fontSize: 12,
  },
});
