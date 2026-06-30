import { useRef, ReactNode } from "react";
import { View, Text, Pressable, Animated, ViewStyle, StyleSheet, StyleProp } from "react-native";
import { RADII, ANIM, useTheme } from "@theme";

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function OutlineButton({
  label,
  onPress,
  color,
  style,
  size = "lg",
  icon,
}: OutlineButtonProps) {
  const { colors, fonts } = useTheme();
  const borderColor = color ?? colors.t2;
  const scale = useRef(new Animated.Value(1)).current;
  const sz = { sm: 12, md: 14, lg: 15 }[size];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, ...ANIM.spring }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...ANIM.spring }).start()
        }
        android_ripple={{ color: `${borderColor}18` }}
        style={[styles.outlineBtn, { borderRadius: RADII.lg, borderColor }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={[styles.outlineBtnText, { color: borderColor, fontSize: sz, fontFamily: fonts.bodySemiBold }]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outlineBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {},
});
