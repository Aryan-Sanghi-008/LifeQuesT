import { StyleSheet } from "react-native";
import { useTheme, SPACING } from "@theme";

export const createSectionStyles = ({
  colors,
  fonts,
  spacing,
  radii,
}: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },

    financeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    financeCell: { width: "47%", gap: 2 },
    financeLabel: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t4,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    financeVal: { fontFamily: fonts.bodyBold, fontSize: 22, marginTop: 2 },
    shopBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radii.sm,
      borderWidth: 1,
    },
    shopBtnText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 13,
      color: colors.gold3,
    },

    traitRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
    traitChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      backgroundColor: `${colors.orchid}10`,
      borderRadius: radii.full,
      borderWidth: 1.5,
      borderColor: `${colors.orchid}25`,
    },
    traitDot: { width: 5, height: 5, borderRadius: 3 },
    traitText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 13,
      color: colors.orchid,
    },

    walletRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    walletItem: { flex: 1, alignItems: "center", gap: spacing.xs },
    walletIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
    },
    walletVal: { fontFamily: fonts.bodyBold, fontSize: 26, color: colors.gold3 },
    walletLbl: { fontFamily: fonts.body, fontSize: 11, color: colors.t4 },
    walletDivider: { width: 1, height: 56, backgroundColor: colors.border },

    premiumCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.lg,
      borderWidth: 1.5,
    },
    premiumIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    premiumTitle: {
      fontFamily: fonts.bodyBold,
      fontSize: 16,
      color: colors.gold3,
    },
    premiumSub: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t3,
      marginTop: 2,
    },
    premiumPriceTag: { paddingHorizontal: 10, paddingVertical: 6 },
    premiumPrice: { fontFamily: fonts.bodyBold, fontSize: 12, color: "#FFFFFF" },

    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.md,
      backgroundColor: `${colors.health}08`,
      borderWidth: 1.5,
      borderColor: `${colors.health}28`,
    },
    resetIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    resetText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
      color: colors.health,
    },
    settingsNavRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    settingsNavIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    settingsNavLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
    },
    settingsNavDesc: {
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 2,
    },

    menuItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      backgroundColor: colors.bgCard,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    menuItemIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    menuItemLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
      color: colors.t1,
    },
    menuItemSub: {
      fontFamily: fonts.body,
      fontSize: 11,
      color: colors.t4,
      marginTop: 2,
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
    syncStatusWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    syncDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    syncStatusText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 13,
      color: colors.t1,
    },
    syncNowBtn: {
      backgroundColor: colors.bg2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    syncNowBtnText: {
      fontFamily: fonts.bodyBold,
      fontSize: 12,
      color: colors.t2,
    },
  });

export const createHeroStyles = ({
  colors,
  fonts,
  spacing,
  radii,
  shadows,
}: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    hero: {
      alignItems: "center",
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      overflow: "hidden",
      position: "relative",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatarContainer: { position: "relative" },
    avatarRing: {
      borderRadius: 54,
      borderWidth: 3,
      overflow: "hidden",
      ...shadows.card,
    },
    avatarStyleRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.sm,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    avatarStyleChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    avatarStyleChipActive: {
      borderColor: colors.gold,
      backgroundColor: `${colors.gold}12`,
    },
    avatarStyleChipText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 11,
      color: colors.t3,
    },
    premiumBadge: {
      position: "absolute",
      bottom: 0,
      right: -4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: `${colors.gold}25`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${colors.gold}55`,
    },
    cloudPhotoBadge: {
      position: "absolute",
      top: -2,
      left: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
    },
    cloudPhotoImage: {
      width: "100%",
      height: "100%",
    },
    plusChipText: {
      fontSize: 8,
      letterSpacing: 0.8,
    },
    heroName: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.t1 },
    heroSub: { fontFamily: fonts.body, fontSize: 13, color: colors.t3 },
    heroBadges: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    lifeStagePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radii.full,
      borderWidth: 1,
    },
    lifeStageDot: { width: 5, height: 5, borderRadius: 3 },
    lifeStageText: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
    miniStats: {
      flexDirection: "row",
      marginTop: spacing.md,
      width: "92%",
      backgroundColor: colors.bgCard,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      ...shadows.subtle,
    },
    miniDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
  });

export const createLifeStatRowStyles = (
  _theme: ReturnType<typeof useTheme>,
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconWrap: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    label: { fontSize: 13, flex: 1 },
    value: { fontSize: 14 },
  });

export const createChipStyles = (_theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrap: { flex: 1, gap: 4, alignItems: "center" },
    val: { fontSize: 22 },
    lbl: {
      fontSize: 9,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
  });

export { SPACING };
