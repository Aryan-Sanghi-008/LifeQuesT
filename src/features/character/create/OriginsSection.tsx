import { useState, ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { getCreateStyles } from "./styles";

type OriginsSectionProps = {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

export function OriginsSection({
  title,
  defaultExpanded = true,
  children,
}: OriginsSectionProps) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = getCreateStyles(radii, spacing, shadows);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.originsSection}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.originsSectionHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? "expanded" : "collapsed"}`}
      >
        <Text style={[styles.inputLabel, { color: colors.t4, fontFamily: fonts.bodyBold, marginBottom: 0 }]}>
          {title}
        </Text>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            stroke={colors.t3}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={expanded ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}
          />
        </Svg>
      </Pressable>
      {expanded ? <View style={styles.originsSectionBody}>{children}</View> : null}
    </View>
  );
}
