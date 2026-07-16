import { ReactNode, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import { useScreenA11yFocus } from "@hooks/useScreenA11yFocus";

interface TabScreenHeaderProps {
  title: string;
  subtitle?: ReactNode;
  accent: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export function TabScreenHeader({
  title,
  subtitle,
  accent,
  icon,
  trailing,
}: TabScreenHeaderProps) {
  const { colors, fonts, spacing, scaledFonts } = useTheme();
  const headingRef = useRef<View>(null);
  useScreenA11yFocus(headingRef);

  return (
    <LinearGradient
      colors={[`${accent}18`, colors.bgCard]}
      style={[
        styles.wrap,
        {
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <View
            style={[
              styles.icon,
              { backgroundColor: `${accent}18`, borderColor: `${accent}30` },
            ]}
          >
            {icon}
          </View>
        ) : null}
        <View style={{ flex: 1 }} ref={headingRef} accessible accessibilityRole="header">
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold, fontSize: scaledFonts.xxl }]}>
            {title}
          </Text>
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <Text style={[styles.sub, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.md }]}>
                {subtitle}
              </Text>
            ) : (
              <View style={{ marginTop: 2 }}>{subtitle}</View>
            )
          ) : null}
        </View>
        {trailing}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22 },
  sub: { fontSize: 12, marginTop: 2 },
});
