import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";
import Svg, { Path } from "react-native-svg";

interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  const { colors, fonts } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${colors.ambition}12`,
          borderColor: `${colors.ambition}30`,
        },
      ]}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          stroke={colors.ambition}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={`${colors.ambition}20`}
        />
        <Path
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          stroke={colors.ambition}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text
        style={[
          styles.countText,
          { color: colors.ambition, fontFamily: fonts.mono },
        ]}
      >
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    alignSelf: "flex-start",
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
