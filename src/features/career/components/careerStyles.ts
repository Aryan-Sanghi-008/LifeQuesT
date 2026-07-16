import { StyleSheet } from "react-native";

export function getCareerStyles(spacing: {
  lg: number;
  md: number;
  sm: number;
  xl: number;
  xxxl: number;
}) {
  return StyleSheet.create({
    scroll: { padding: spacing.lg },
    btn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1.5,
    },
    btnText: { fontSize: 12 },
    jobRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    jobIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    salaryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
  });
}
