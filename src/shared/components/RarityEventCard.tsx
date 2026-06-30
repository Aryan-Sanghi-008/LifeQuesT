import { useRef, useEffect, ReactNode } from "react";
import {
  View,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import type { EventRarity } from "@/types";

export function getRarityCardStyles(
  rarity: EventRarity | undefined,
  colors: ReturnType<typeof useTheme>["colors"],
) {
  if (!rarity || rarity === "common") {
    return {
      borderColor: colors.border,
      borderWidth: 1,
      shadowColor: colors.shadowCard,
      shadowOffset: { width: 0, height: 1 } as const,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };
  }

  const rarityColors = {
    uncommon: colors.rarityUncommon,
    rare: colors.rarityRare,
    epic: colors.rarityEpic,
    legendary: colors.rarityLegendary,
  };

  const shadowOpacityMap = {
    uncommon: 0.15,
    rare: 0.22,
    epic: 0.28,
    legendary: 0.38,
  };
  const shadowRadiusMap = {
    uncommon: 5,
    rare: 8,
    epic: 12,
    legendary: 16,
  };
  const elevationMap = {
    uncommon: 3,
    rare: 4,
    epic: 5,
    legendary: 7,
  };

  const targetColor = rarityColors[rarity] ?? colors.border;

  return {
    borderColor: targetColor,
    borderWidth: rarity === "legendary" ? 1.8 : 1.3,
    shadowColor: targetColor,
    shadowOffset: { width: 0, height: 3 } as const,
    shadowOpacity: shadowOpacityMap[rarity] ?? 0.15,
    shadowRadius: shadowRadiusMap[rarity] ?? 5,
    elevation: elevationMap[rarity] ?? 3,
  };
}

interface Props {
  rarity?: EventRarity;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
}

export function RarityEventCard({
  rarity,
  children,
  style,
  animatedStyle,
}: Props) {
  const { colors, radii } = useTheme();
  const rarityStyles = getRarityCardStyles(rarity, colors);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const showShimmer = rarity === "epic" || rarity === "legendary";

  useEffect(() => {
    if (!showShimmer) return;
    let isMounted = true;
    const startShimmer = () => {
      if (!isMounted) return;
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (isMounted) startShimmer();
        }, 2500);
      });
    };
    startShimmer();
    return () => {
      isMounted = false;
    };
  }, [showShimmer, shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderRadius: radii.md,
          borderColor: rarityStyles.borderColor,
          borderWidth: rarityStyles.borderWidth,
          shadowColor: rarityStyles.shadowColor,
          shadowOffset: rarityStyles.shadowOffset,
          shadowOpacity: rarityStyles.shadowOpacity,
          shadowRadius: rarityStyles.shadowRadius,
          elevation: rarityStyles.elevation,
        },
        style,
        animatedStyle,
      ]}
    >
      {children}
      {showShimmer && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [{ translateX: shimmerTranslate }, { skewX: "-25deg" }],
                width: "40%",
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0)",
                rarity === "legendary"
                  ? "rgba(251, 191, 36, 0.15)"
                  : "rgba(255, 255, 255, 0.18)",
                "rgba(255, 255, 255, 0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    marginVertical: 4,
    alignItems: "stretch",
  },
});
