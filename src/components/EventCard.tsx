import { useRef, useEffect } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { LifeEventRecord, EventCategory } from "../types";
import { useTheme } from "@theme";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { RarityBadge } from "./RarityBadge";

// ─── Category Icon (SVG — no emojis) ─────────────────────────────────────────

function CategoryIcon({
  category,
  color,
}: {
  category: EventCategory;
  color: string;
}) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };
  switch (category) {
    case "health":
      return (
        <Svg {...p}>
          <Path
            fill={color}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </Svg>
      );
    case "education":
      return (
        <Svg {...p}>
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </Svg>
      );
    case "career":
      return (
        <Svg {...p}>
          <Rect
            stroke={color}
            strokeWidth={2}
            x="2"
            y="7"
            width="20"
            height="14"
            rx="2"
          />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
          />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 12v5M9 14.5l3-2.5 3 2.5"
          />
        </Svg>
      );
    case "relationship":
      return (
        <Svg {...p}>
          <Circle stroke={color} strokeWidth={2} cx="9" cy="7" r="4" />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          />
        </Svg>
      );
    case "financial":
      return (
        <Svg {...p}>
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
          />
        </Svg>
      );
    case "family":
      return (
        <Svg {...p}>
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 22V12h6v10"
          />
        </Svg>
      );
    case "crime":
      return (
        <Svg {...p}>
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
        </Svg>
      );
    case "travel":
      return (
        <Svg {...p}>
          <Circle stroke={color} strokeWidth={2} cx="12" cy="12" r="10" />
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          />
        </Svg>
      );
    case "milestone":
      return (
        <Svg {...p}>
          <Path
            fill={color}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </Svg>
      );
    default:
      return (
        <Svg {...p}>
          <Path
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </Svg>
      );
  }
}

// ─── Stat Effect Labels ──────────────────────────────────────────────────────

const STAT_LABELS: Record<string, string> = {
  health: "HP",
  happiness: "Joy",
  intelligence: "Mind",
  wealth: "Gold",
  fitness: "Fit",
  looks: "Looks",
  social: "Social",
  ambition: "Drive",
};

// ─── EventCard ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: LifeEventRecord;
  isNew?: boolean;
}

export default function EventCard({ event, isNew = false }: EventCardProps) {
  const { colors, fonts, radii } = useTheme();

  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isNew ? 24 : 0)).current;
  const scale = useRef(new Animated.Value(isNew ? 0.94 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
      ]).start();
    }
  }, [isNew, opacity, translateY, scale]);

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (event.rarity === "epic" || event.rarity === "legendary") {
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
            if (isMounted) {
              startShimmer();
            }
          }, 2500);
        });
      };
      startShimmer();
      return () => {
        isMounted = false;
      };
    }
  }, [event.rarity, shimmerAnim]);

  // ─── Category Config ───────────────────────────────────────────────────────

  const CATEGORY_CONFIG: Record<
    EventCategory,
    { color: string; bgColor: string }
  > = {
    health: { color: colors.health, bgColor: `${colors.health}12` },
    education: {
      color: colors.catEducation,
      bgColor: `${colors.catEducation}12`,
    },
    career: { color: colors.catCareer, bgColor: `${colors.catCareer}12` },
    relationship: {
      color: colors.catRelationship,
      bgColor: `${colors.catRelationship}12`,
    },
    financial: {
      color: colors.catFinancial,
      bgColor: `${colors.catFinancial}12`,
    },
    family: { color: colors.catFamily, bgColor: `${colors.catFamily}12` },
    crime: { color: colors.catCrime, bgColor: `${colors.catCrime}12` },
    travel: { color: colors.teal, bgColor: `${colors.teal}12` },
    milestone: {
      color: colors.catMilestone,
      bgColor: `${colors.catMilestone}12`,
    },
    random: { color: colors.catRandom, bgColor: `${colors.catRandom}10` },
    activity: { color: colors.catActivity, bgColor: `${colors.catActivity}12` },
  };

  const cfg = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.random;

  // Build stat chips
  const chips: Array<{ label: string; positive: boolean }> = [];
  Object.entries(event.statEffect).forEach(([key, val]) => {
    if (!val || key === "karma") return;
    const lbl = STAT_LABELS[key];
    if (!lbl) return;
    chips.push({
      label: `${(val as number) > 0 ? "+" : ""}${val} ${lbl}`,
      positive: (val as number) > 0,
    });
  });

  // ─── Rarity Glow Styles ────────────────────────────────────────────────────

  const getRarityStyles = () => {
    if (!event.rarity || event.rarity === "common") {
      return {
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: colors.shadowCard,
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

    const targetColor = rarityColors[event.rarity] ?? colors.border;
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

    return {
      borderColor: targetColor,
      borderWidth: event.rarity === "legendary" ? 1.8 : 1.3,
      shadowColor: targetColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: shadowOpacityMap[event.rarity] ?? 0.15,
      shadowRadius: shadowRadiusMap[event.rarity] ?? 5,
      elevation: elevationMap[event.rarity] ?? 3,
    };
  };

  const rarityStyles = getRarityStyles();

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
          shadowOffset: rarityStyles.shadowOffset || { width: 0, height: 1 },
          shadowOpacity: rarityStyles.shadowOpacity,
          shadowRadius: rarityStyles.shadowRadius,
          elevation: rarityStyles.elevation,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {/* Colored left border accent */}
      <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

      {/* Category icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bgColor }]}>
        <CategoryIcon category={event.category} color={cfg.color} />
      </View>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
          <View style={styles.badgeRow}>
            {event.rarity && event.rarity !== "common" && (
              <RarityBadge rarity={event.rarity} />
            )}
            <View style={[styles.agePill, { backgroundColor: cfg.bgColor }]}>
              <Text
                style={[
                  styles.ageText,
                  { color: cfg.color, fontFamily: fonts.monoSemiBold },
                ]}
              >
                {event.age}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[styles.desc, { color: colors.t2, fontFamily: fonts.body }]}
          numberOfLines={2}
        >
          {event.description}
        </Text>

        {event.choiceMade && (
          <View style={styles.choiceRow}>
            <View style={[styles.choiceDot, { backgroundColor: colors.gold }]} />
            <Text
              style={[
                styles.choiceText,
                { color: colors.t3, fontFamily: fonts.bodyMedium },
              ]}
              numberOfLines={1}
            >
              {event.choiceMade}
            </Text>
          </View>
        )}

        {chips.length > 0 && (
          <View style={styles.chips}>
            {chips.slice(0, 3).map((chip, i) => (
              <View
                key={i}
                style={[
                  styles.chip,
                  {
                    backgroundColor: chip.positive
                      ? `${colors.emerald}15`
                      : `${colors.health}12`,
                    borderColor: chip.positive
                      ? `${colors.emerald}30`
                      : `${colors.health}25`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: chip.positive ? colors.emerald2 : colors.crimson2,
                      fontFamily: fonts.monoSemiBold,
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* New indicator */}
      {isNew && <View style={[styles.newDot, { backgroundColor: colors.emerald, borderColor: colors.bgCard }]} />}

      {/* Shimmer Overlay */}
      {(event.rarity === "epic" || event.rarity === "legendary") && (
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
                event.rarity === "legendary" ? "rgba(251, 191, 36, 0.15)" : "rgba(255, 255, 255, 0.18)",
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
  accentBar: {
    width: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    alignSelf: "flex-start",
    marginTop: 14,
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  agePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  ageText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  choiceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  choiceText: {
    fontSize: 11,
    fontStyle: "italic",
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 9,
    letterSpacing: 0.2,
  },
  newDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});