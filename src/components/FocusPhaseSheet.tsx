import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { COLORS, FONTS, RADII, SPACING } from "@theme";
import { BottomSheet } from "@components/BottomSheet";
import { FOCUS_DOMAINS } from "@data/focusDomains";
import type { FocusAllocation, FocusDomain } from "@/types";
import { useGameStore } from "@store/gameStore";
import { FOCUS_POINTS_PER_YEAR, getAutoChildFocus } from "@engine/focusEngine";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";

interface FocusPhaseSheetProps {
  visible: boolean;
  age: number;
  familyBackground: Parameters<typeof getAutoChildFocus>[0]["familyBackground"];
}

const DOMAIN_EMOJIS: Record<FocusDomain, string> = {
  career: "💼",
  education: "🎓",
  health: "❤️",
  social: "🗣️",
  finance: "🪙",
  hobby: "🎨",
  crime: "🕶️",
  family: "🏠",
};

export function FocusPhaseSheet({ visible, age, familyBackground }: FocusPhaseSheetProps) {
  const setFocusAllocation = useGameStore((s) => s.setFocusAllocation);
  const confirmFocusAndAct = useGameStore((s) => s.confirmFocusAndAct);
  const [allocation, setAllocation] = useState<FocusAllocation>({});

  const isChild = age <= 12;
  const autoFocus = useMemo(
    () => getAutoChildFocus({ familyBackground }),
    [familyBackground],
  );

  const used = Object.values(allocation).reduce((sum, n) => sum + (n ?? 0), 0);
  const remaining = FOCUS_POINTS_PER_YEAR - used;

  const cycleWedge = (domainId: FocusDomain) => {
    if (isChild) return;
    setAllocation((prev) => {
      const current = prev[domainId] ?? 0;
      let nextVal = 0;

      if (current === 0) {
        if (remaining >= 1) {
          nextVal = 1;
        } else {
          Alert.alert("No Points", `You have already allocated all ${FOCUS_POINTS_PER_YEAR} focus points. Reset a domain first.`);
          return prev;
        }
      } else if (current === 1) {
        if (remaining >= 1) {
          nextVal = 2;
        } else {
          nextVal = 0; // Cycle back to 0 since we can't allocate more
        }
      } else {
        nextVal = 0; // Reset
      }

      const next = { ...prev, [domainId]: nextVal };
      if (nextVal === 0) delete next[domainId];
      return next;
    });
  };

  const handleConfirm = () => {
    if (isChild) {
      confirmFocusAndAct();
      return;
    }
    setFocusAllocation(allocation);
    confirmFocusAndAct();
  };

  // Math helpers for SVG radar
  const getCoordinates = (index: number, points: number) => {
    // 0 points -> R=30; 1 point -> R=65; 2 points -> R=100
    const radius = points === 0 ? 30 : points === 1 ? 65 : 100;
    // Align index 0 to top-center (subtract 90 degrees or -Math.PI/2)
    const angleRad = (index * 45 * Math.PI) / 180 - Math.PI / 2;
    return {
      x: 120 + radius * Math.cos(angleRad),
      y: 120 + radius * Math.sin(angleRad),
    };
  };

  const getWedgePath = (index: number) => {
    const angleStart = ((index * 45 - 22.5) * Math.PI) / 180 - Math.PI / 2;
    const angleEnd = ((index * 45 + 22.5) * Math.PI) / 180 - Math.PI / 2;
    const R = 100;
    const x1 = 120 + R * Math.cos(angleStart);
    const y1 = 120 + R * Math.sin(angleStart);
    const x2 = 120 + R * Math.cos(angleEnd);
    const y2 = 120 + R * Math.sin(angleEnd);
    return `M 120 120 L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  };

  // Build the polygon points path for active allocation shape
  const radarPolygonPath = useMemo(() => {
    const pointsCoords = FOCUS_DOMAINS.map((domain, i) => {
      const pts = allocation[domain.id] ?? 0;
      return getCoordinates(i, pts);
    });
    return pointsCoords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ") + " Z";
  }, [allocation]);

  return (
    <BottomSheet visible={visible} onClose={() => {}} title="Plan Your Year">
      <Text style={styles.subtitle}>
        {isChild
          ? "Your guardians shape this year for you."
          : `Tap sectors on the Life Compass below to allocate exactly ${FOCUS_POINTS_PER_YEAR} focus points before aging up.`}
      </Text>

      {isChild ? (
        <View style={styles.autoList}>
          {FOCUS_DOMAINS.filter((d) => autoFocus[d.id]).map((d) => (
            <Text key={d.id} style={styles.autoItem}>
              {d.label}: {autoFocus[d.id]} pt
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.compassContainer}>
          <Text style={styles.remaining}>
            {remaining} point{remaining === 1 ? "" : "s"} remaining
          </Text>

          {/* SVG Compass Wheel */}
          <View style={styles.svgWrapper}>
            <Svg width={240} height={240} viewBox="0 0 240 240">
              {/* Background grid concentric rings */}
              <Circle cx={120} cy={120} r={100} fill="none" stroke={COLORS.border} strokeWidth={1} strokeDasharray="3, 3" />
              <Circle cx={120} cy={120} r={65} fill="none" stroke={COLORS.border} strokeWidth={1} strokeDasharray="3, 3" />
              <Circle cx={120} cy={120} r={30} fill="none" stroke={COLORS.border} strokeWidth={1} strokeDasharray="3, 3" />

              {/* Wedge slices */}
              {FOCUS_DOMAINS.map((domain, i) => {
                const pts = allocation[domain.id] ?? 0;
                // Highlight color depending on allocation
                const wedgeColor =
                  pts === 2
                    ? "rgba(245, 158, 11, 0.2)"
                    : pts === 1
                    ? "rgba(245, 158, 11, 0.08)"
                    : "rgba(0, 0, 0, 0.015)";

                const pathD = getWedgePath(i);
                const labelPos = getCoordinates(i, 114);

                return (
                  <g key={domain.id}>
                    <Path
                      d={pathD}
                      fill={wedgeColor}
                      stroke={COLORS.border2}
                      strokeWidth={1}
                      onPress={() => cycleWedge(domain.id)}
                    />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      fontSize={14}
                      onPress={() => cycleWedge(domain.id)}
                    >
                      {DOMAIN_EMOJIS[domain.id]}
                    </SvgText>
                  </g>
                );
              })}

              {/* Grid spokes */}
              {FOCUS_DOMAINS.map((_, i) => {
                const outer = getCoordinates(i, 2); // Radius 100
                return (
                  <Path
                    key={i}
                    d={`M 120 120 L ${outer.x} ${outer.y}`}
                    stroke={COLORS.border}
                    strokeWidth={0.8}
                    pointerEvents="none"
                  />
                );
              })}

              {/* Golden Radar shape */}
              <Path
                d={radarPolygonPath}
                fill="rgba(245, 158, 11, 0.28)"
                stroke={COLORS.gold}
                strokeWidth={2.2}
                pointerEvents="none"
              />

              {/* Center Core */}
              <Circle cx={120} cy={120} r={6} fill={COLORS.gold3} />
            </Svg>
          </View>

          {/* Simple helper panel below */}
          <View style={styles.legendContainer}>
            {FOCUS_DOMAINS.map((domain) => {
              const pts = allocation[domain.id] ?? 0;
              return (
                <Pressable
                  key={domain.id}
                  onPress={() => cycleWedge(domain.id)}
                  style={[
                    styles.legendItem,
                    {
                      borderColor: pts > 0 ? COLORS.gold : COLORS.border,
                      backgroundColor: pts > 0 ? `${COLORS.gold}08` : "transparent",
                    },
                  ]}
                >
                  <Text style={styles.legendText}>
                    {DOMAIN_EMOJIS[domain.id]} {domain.label}: {pts} pt
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <Pressable
        accessibilityLabel="Confirm focus plan"
        onPress={handleConfirm}
        disabled={!isChild && remaining !== 0}
        style={[styles.confirmBtn, !isChild && remaining !== 0 ? styles.confirmBtnDisabled : null]}
      >
        <Text style={styles.confirmText}>{isChild ? "Continue" : "Confirm Focus"}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.t3,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  remaining: {
    fontFamily: FONTS.monoSemiBold,
    color: COLORS.gold,
    fontSize: 14,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  compassContainer: {
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  svgWrapper: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  legendItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: RADII.xs,
  },
  legendText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.t2,
  },
  confirmBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.bg,
    fontSize: 15,
  },
  autoList: {
    gap: 6,
    marginBottom: SPACING.md,
  },
  autoItem: {
    fontFamily: FONTS.body,
    color: COLORS.t2,
    fontSize: 13,
  },
});
