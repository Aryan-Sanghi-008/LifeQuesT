import { View, Text, Pressable } from "react-native";
import { useTheme } from "@theme";

export type ProfileTab = "overview" | "stats" | "achievements" | "legacy";

const PROFILE_TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "stats", label: "Stats" },
  { id: "achievements", label: "Achievements" },
  { id: "legacy", label: "Legacy" },
];

export function ProfileTabBar({
  active,
  onSelect,
}: {
  active: ProfileTab;
  onSelect: (t: ProfileTab) => void;
}) {
  const { colors, fonts, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {PROFILE_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: spacing.sm,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? colors.catMilestone : "transparent",
            }}
          >
            <Text
              style={{
                color: isActive ? colors.catMilestone : colors.t4,
                fontFamily: isActive ? fonts.bodyBold : fonts.body,
                fontSize: 12,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
