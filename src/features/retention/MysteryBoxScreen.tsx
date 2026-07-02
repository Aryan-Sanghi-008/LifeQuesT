import { useState, useRef } from "react";
import { View, Text, Pressable, Animated, Modal, ScrollView, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, G, Text as SvgText, Circle, Polygon } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { useToastStore } from "@store/toastStore";
import { MYSTERY_SEGMENTS, MysteryReward, rollMysterySegmentIndex } from "@store/slices/progressionSlice";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { showRewardedAd } from "@services/ads";
import { SupportLifeQuestButton } from "@shared/components/SupportLifeQuestButton";
import type { RootStackParamList } from "@/types";

// ─── Wheel constants ───────────────────────────────────────────────────────────
const WHEEL_SIZE = 280;
const WHEEL_R = WHEEL_SIZE / 2;
const CX = WHEEL_R;
const CY = WHEEL_R;
const INNER_R = WHEEL_R - 8; // slight inset from border ring

const SEGMENT_COLORS = [
  "#F59E0B", "#3B82F6", "#22C55E", "#EF4444",
  "#A855F7", "#F97316", "#06B6D4", "#EC4899",
];

// ─── SVG Pie Wheel ─────────────────────────────────────────────────────────────
function FortuneWheel({ rotateDeg }: { rotateDeg: Animated.AnimatedInterpolation<string> }) {
  const { colors } = useTheme();
  const N = MYSTERY_SEGMENTS.length;
  const segDeg = 360 / N;

  return (
    <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      {/* Static outer ring */}
      <View
        style={{
          position: "absolute",
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          borderRadius: WHEEL_R,
          borderWidth: 4,
          borderColor: colors.gold,
          zIndex: 2,
        }}
      />

      {/* Spinning SVG disc */}
      <Animated.View
        style={{
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          transform: [{ rotate: rotateDeg }],
        }}
      >
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          {/* Background circle */}
          <Circle cx={CX} cy={CY} r={INNER_R} fill={colors.bgCard} stroke={colors.border} strokeWidth={1} />

          {MYSTERY_SEGMENTS.map((seg, idx) => {
            const startRad = ((idx * segDeg - 90) * Math.PI) / 180;
            const endRad = (((idx + 1) * segDeg - 90) * Math.PI) / 180;
            const x1 = CX + INNER_R * Math.cos(startRad);
            const y1 = CY + INNER_R * Math.sin(startRad);
            const x2 = CX + INNER_R * Math.cos(endRad);
            const y2 = CY + INNER_R * Math.sin(endRad);
            const largeArc = segDeg > 180 ? 1 : 0;

            const midRad = (startRad + endRad) / 2;
            const labelR = INNER_R * 0.62;
            const lx = CX + labelR * Math.cos(midRad);
            const ly = CY + labelR * Math.sin(midRad);
            const textRotDeg = (midRad * 180) / Math.PI + 90;

            const col = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            const path = `M ${CX} ${CY} L ${x1} ${y1} A ${INNER_R} ${INNER_R} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // Divider line between segments
            const divPath = `M ${CX} ${CY} L ${x1} ${y1}`;

            // Truncate label to ~12 chars to fit wedge
            const label = seg.label.length > 12 ? seg.label.slice(0, 11) + "…" : seg.label;

            return (
              <G key={idx}>
                <Path d={path} fill={`${col}22`} />
                <Path d={divPath} stroke={col} strokeWidth={0.8} opacity={0.4} />
                <SvgText
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fill={col}
                  fontSize={8.5}
                  fontWeight="700"
                  transform={`rotate(${textRotDeg}, ${lx}, ${ly})`}
                >
                  {label}
                </SvgText>
              </G>
            );
          })}

          {/* Center jewel */}
          <Circle cx={CX} cy={CY} r={16} fill={colors.bgCard} stroke={colors.gold} strokeWidth={2} />
          <SvgText
            x={CX}
            y={CY + 5}
            textAnchor="middle"
            fontSize={14}
          >
            🎲
          </SvgText>
        </Svg>
      </Animated.View>

      {/* Fixed pointer triangle at top center */}
      <View
        style={{
          position: "absolute",
          top: -2,
          left: WHEEL_R - 12,
          zIndex: 3,
        }}
      >
        <Svg width={24} height={20} viewBox="0 0 24 20">
          <Polygon points="12,18 0,0 24,0" fill={colors.gold} />
        </Svg>
      </View>
    </View>
  );
}

// ─── Result Modal ──────────────────────────────────────────────────────────────
function ResultModal({ reward, onClose }: { reward: MysteryReward; onClose: () => void }) {
  const { colors, fonts, spacing, radii } = useTheme();
  const emoji = reward.type === "coins" ? "🪙" : reward.type === "gems" ? "💎" : "⚡";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#00000099",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: radii.xl,
            padding: spacing.xl,
            gap: spacing.md,
            alignItems: "center",
            width: "100%",
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          <Text style={{ fontSize: 72 }}>{emoji}</Text>
          <Text style={{ color: colors.gold, fontFamily: fonts.displayBold, fontSize: 11, letterSpacing: 2 }}>
            YOU WON
          </Text>
          <Text
            style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 22, textAlign: "center" }}
          >
            {reward.label}
          </Text>
          <Text
            style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13, textAlign: "center" }}
          >
            Reward has been added to your account.
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: colors.gold,
              borderRadius: radii.md,
              paddingVertical: 12,
              paddingHorizontal: 40,
              marginTop: spacing.sm,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontFamily: fonts.displayBold, fontSize: 15 }}>
              Awesome!
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export function MysteryBoxScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const reducedMotion = useReducedMotion();

  const canSpin = useGameStore((s) => s.canSpinMysteryBox);
  const canSpinWithTicket = useGameStore((s) => s.canSpinMysteryBoxWithTicket);
  const mysteryTickets = useGameStore((s) => s.character?.mysteryTickets ?? 0);
  const gems = useGameStore((s) => s.character?.gems ?? 0);
  const spin = useGameStore((s) => s.spinMysteryBox);
  const purchaseMysterySpinWithGems = useGameStore((s) => s.purchaseMysterySpinWithGems);
  const grantAdMysteryTicket = useGameStore((s) => s.grantAdMysteryTicket);
  const character = useGameStore((s) => s.character);
  const showToast = useToastStore((s) => s.showToast);

  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<MysteryReward | null>(null);
  const [freeSpunThisSession, setFreeSpunThisSession] = useState(!canSpin());

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const accumulatedDeg = useRef(0);

  const canFreeSpin = canSpin() && !freeSpunThisSession;
  const N = MYSTERY_SEGMENTS.length;
  const SEGMENT_DEG = 360 / N;

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend",
  });

  const [adLoading, setAdLoading] = useState(false);

  const watchAdForTicket = async () => {
    if (adLoading || character?.hasNoAds || character?.isPremium) return;
    setAdLoading(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
        const granted = grantAdMysteryTicket();
        showToast(
          granted > 0 ? "You earned +1 wheel spin ticket!" : "Weekly ticket cap reached.",
          granted > 0 ? "success" : "info",
        );
      } else {
        showToast("Ad unavailable — try again in a moment.", "info");
      }
    } finally {
      setAdLoading(false);
    }
  };

  const runSpin = (useTicket: boolean) => {
    if (isSpinning) return;
    if (useTicket) {
      if (!canSpinWithTicket()) return;
    } else {
      if (!canFreeSpin) return;
    }

    const pickedIndex = rollMysterySegmentIndex();
    setIsSpinning(true);

    const finish = () => {
      const result = spin({ useTicket, segmentIndex: pickedIndex });
      setIsSpinning(false);
      if (result.ok && result.reward) {
        setWonReward(result.reward);
        if (!useTicket) setFreeSpunThisSession(true);
      }
    };

    if (reducedMotion) {
      finish();
      return;
    }

    // Land the center of the picked segment at the top pointer
    const segCenter = pickedIndex * SEGMENT_DEG + SEGMENT_DEG / 2;
    const alignmentDeg = (360 - segCenter) % 360;
    const targetDeg = accumulatedDeg.current + 5 * 360 + alignmentDeg;
    accumulatedDeg.current = targetDeg;

    Animated.timing(rotateAnim, {
      toValue: targetDeg,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) finish();
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>
          Mystery Box
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          padding: spacing.xl,
          gap: spacing.xl,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 22 }}>
            Weekly Mystery Box
          </Text>
          <Text
            style={{
              color: colors.t3,
              fontFamily: fonts.body,
              fontSize: 13,
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            {canFreeSpin
              ? "Spin to win coins, gems, XP, cosmetics and more!"
              : canSpinWithTicket()
              ? `Free spin used. You have ${mysteryTickets} ticket${mysteryTickets === 1 ? "" : "s"}.`
              : "Come back Monday for your next free spin."}
          </Text>
        </View>

        {/* Wheel */}
        <FortuneWheel rotateDeg={rotateDeg} />

        {/* Spin buttons */}
        <Pressable
          onPress={() => runSpin(false)}
          disabled={!canFreeSpin || isSpinning}
          style={({ pressed }) => ({
            backgroundColor: canFreeSpin && !isSpinning ? colors.gold : colors.bgCard,
            borderRadius: radii.md,
            paddingVertical: 14,
            paddingHorizontal: 48,
            opacity: pressed ? 0.85 : canFreeSpin ? 1 : 0.5,
            borderWidth: 1,
            borderColor: canFreeSpin ? colors.gold : colors.border,
            width: "100%",
            alignItems: "center",
          })}
        >
          <Text
            style={{
              color: canFreeSpin && !isSpinning ? "#FFFFFF" : colors.t3,
              fontFamily: fonts.displayBold,
              fontSize: 16,
            }}
          >
            {isSpinning ? "Spinning…" : canFreeSpin ? "Free Spin!" : "Free Spin Used"}
          </Text>
        </Pressable>

        {canSpinWithTicket() && (
          <Pressable
            onPress={() => runSpin(true)}
            disabled={isSpinning}
            style={({ pressed }) => ({
              backgroundColor: `${colors.orchid}18`,
              borderRadius: radii.md,
              paddingVertical: 12,
              paddingHorizontal: 32,
              opacity: pressed ? 0.85 : 1,
              borderWidth: 1,
              borderColor: colors.orchid,
              width: "100%",
              alignItems: "center",
            })}
          >
            <Text style={{ color: colors.orchid, fontFamily: fonts.bodyBold, fontSize: 14 }}>
              Use Ticket ({mysteryTickets} left)
            </Text>
          </Pressable>
        )}

        {/* Rewarded ticket */}
        {character?.hasNoAds || character?.isPremium ? (
          <SupportLifeQuestButton label="LifeQuest Plus — Active" compact />
        ) : (
          <Pressable
            onPress={() => void watchAdForTicket()}
            disabled={adLoading || isSpinning}
            style={({ pressed }) => ({
              backgroundColor: `${colors.sapphire}18`,
              borderRadius: radii.md,
              paddingVertical: 12,
              paddingHorizontal: 32,
              opacity: pressed ? 0.85 : adLoading ? 0.6 : 1,
              borderWidth: 1,
              borderColor: colors.sapphire,
              width: "100%",
              alignItems: "center",
            })}
          >
            <Text style={{ color: colors.sapphire, fontFamily: fonts.bodyBold, fontSize: 14 }}>
              {adLoading ? "Loading ad…" : "Watch ad for +1 Wheel Spin"}
            </Text>
          </Pressable>
        )}

        {/* Gem-spend extra spin */}
        {!canFreeSpin && (
          <Pressable
            onPress={() => {
              const result = purchaseMysterySpinWithGems();
              if (result.ok) {
                runSpin(true);
              } else {
                showToast(result.message, 'error');
              }
            }}
            disabled={isSpinning || gems < 20}
            style={({ pressed }) => ({
              backgroundColor: gems >= 20 ? `${colors.emerald}15` : colors.bgCard,
              borderRadius: radii.md,
              paddingVertical: 12,
              paddingHorizontal: 32,
              opacity: pressed ? 0.85 : gems >= 20 ? 1 : 0.45,
              borderWidth: 1,
              borderColor: gems >= 20 ? colors.emerald : colors.border,
              width: "100%",
              alignItems: "center",
              gap: 2,
            })}
          >
            <Text style={{ color: gems >= 20 ? colors.emerald : colors.t4, fontFamily: fonts.bodyBold, fontSize: 14 }}>
              Spin Again · 20 💎
            </Text>
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11 }}>
              {gems >= 20 ? `You have ${gems} gems` : `Need 20 💎 — get more in the Shop`}
            </Text>
          </Pressable>
        )}

        {/* IAP nudge when gems are low */}
        {!canFreeSpin && gems < 20 && (
          <Pressable
            onPress={() => navigation.navigate('Shop')}
            style={({ pressed }) => ({
              borderRadius: radii.md,
              paddingVertical: 10,
              opacity: pressed ? 0.7 : 1,
              width: "100%",
              alignItems: "center",
            })}
          >
            <Text style={{ color: colors.orchid, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
              Get a 3-Spin Pack in the Shop →
            </Text>
          </Pressable>
        )}

        {/* Possible rewards */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            width: "100%",
            gap: spacing.xs,
          }}
        >
          <Text
            style={{
              color: colors.t4,
              fontFamily: fonts.bodySemiBold,
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: spacing.xs,
            }}
          >
            POSSIBLE REWARDS
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MYSTERY_SEGMENTS.map((seg, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  width: "45%",
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                  }}
                />
                <Text
                  style={{
                    color: colors.t2,
                    fontFamily: fonts.body,
                    fontSize: 12,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {seg.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {wonReward && <ResultModal reward={wonReward} onClose={() => setWonReward(null)} />}
    </SafeAreaView>
  );
}
