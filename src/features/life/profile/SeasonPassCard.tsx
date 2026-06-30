import { View, Text } from "react-native";
import { useTheme } from "@theme";

export function SeasonPassCard({
  xp,
  level,
  isPremium,
}: {
  xp: number;
  level: number;
  isPremium: boolean;
}) {
  const { colors, fonts, radii, spacing } = useTheme();
  return (
    <View
      style={{
        borderRadius: radii.md,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${colors.gold}40`,
      }}
    >
      <View
        style={{
          backgroundColor: `${colors.gold}12`,
          padding: spacing.md,
          gap: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.gold,
              fontFamily: fonts.bodyBold,
              fontSize: 13,
            }}
          >
            Season Pass
          </Text>
          <View
            style={{
              backgroundColor: isPremium ? `${colors.gold}22` : colors.bg2,
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                color: isPremium ? colors.gold : colors.t3,
                fontFamily: fonts.bodyBold,
                fontSize: 10,
              }}
            >
              {isPremium ? "ACTIVE" : "FREE TIER"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              color: colors.t1,
              fontFamily: fonts.displayBold,
              fontSize: 22,
            }}
          >
            Lv.{level}
          </Text>
          <View
            style={{
              flex: 1,
              height: 6,
              backgroundColor: colors.bg2,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.min(100, (xp % 1000) / 10)}%` as `${number}%`,
                height: 6,
                backgroundColor: colors.gold,
                borderRadius: 3,
              }}
            />
          </View>
          <Text
            style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11 }}
          >
            {xp} XP
          </Text>
        </View>
      </View>
    </View>
  );
}
