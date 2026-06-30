import { useState, useRef } from "react";
import { View, Text, Pressable, Animated, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { MYSTERY_SEGMENTS, MysteryReward } from "@store/slices/progressionSlice";
import { useReducedMotion } from "@hooks/useReducedMotion";

const SEGMENT_COLORS = [
  "#F59E0B", "#3B82F6", "#22C55E", "#EF4444",
  "#A855F7", "#F59E0B", "#06B6D4", "#EC4899",
];

function ResultModal({ reward, onClose }: { reward: MysteryReward; onClose: () => void }) {
  const { colors, fonts, spacing, radii } = useTheme();
  const emoji = reward.type === "coins" ? "🪙" : reward.type === "gems" ? "💎" : "⚡";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#00000088", justifyContent: "center",
        alignItems: "center", padding: spacing.xl }}>
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radii.xl,
          padding: spacing.xl, gap: spacing.md, alignItems: "center", width: "100%" }}>
          <Text style={{ fontSize: 64 }}>{emoji}</Text>
          <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 22,
            textAlign: "center" }}>
            You Won!
          </Text>
          <Text style={{ color: colors.gold3, fontFamily: fonts.bodySemiBold, fontSize: 18,
            textAlign: "center" }}>
            {reward.label}
          </Text>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 13,
            textAlign: "center" }}>
            Reward has been added to your account.
          </Text>
          <Pressable onPress={onClose} style={{
            backgroundColor: colors.gold, borderRadius: radii.md, paddingVertical: 12,
            paddingHorizontal: 32, marginTop: spacing.sm,
          }}>
            <Text style={{ color: "#FFFFFF", fontFamily: fonts.displayBold, fontSize: 15 }}>
              Awesome!
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function MysteryBoxScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation();
  const reducedMotion = useReducedMotion();

  const canSpin = useGameStore((s) => s.canSpinMysteryBox);
  const spin = useGameStore((s) => s.spinMysteryBox);

  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<MysteryReward | null>(null);
  const [spunThisSession, setSpunThisSession] = useState(!canSpin());

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);

  const canSpinNow = canSpin() && !spunThisSession;

  const handleSpin = () => {
    if (!canSpinNow || isSpinning) return;
    setIsSpinning(true);

    if (reducedMotion) {
      const result = spin();
      setIsSpinning(false);
      if (result.ok && result.reward) {
        setWonReward(result.reward);
        setSpunThisSession(true);
      }
      return;
    }

    const rotations = 5 + Math.random() * 3;
    const targetDeg = rotations * 360;

    spinRef.current = Animated.timing(rotateAnim, {
      toValue: targetDeg,
      duration: 3000,
      useNativeDriver: true,
    });

    spinRef.current.start(() => {
      const result = spin();
      setIsSpinning(false);
      if (result.ok && result.reward) {
        setWonReward(result.reward);
        setSpunThisSession(true);
      }
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Mystery Box</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center",
        padding: spacing.xl, gap: spacing.xl }}>

        {/* Spin Wheel Visual */}
        <Animated.View style={{
          width: 220, height: 220, borderRadius: 110,
          transform: reducedMotion ? [] : [{ rotate: rotateInterpolate }],
          overflow: "hidden",
          borderWidth: 4,
          borderColor: colors.gold,
        }}>
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
            {MYSTERY_SEGMENTS.map((seg, idx) => (
              <View key={idx} style={{
                width: "50%", height: "50%",
                backgroundColor: `${SEGMENT_COLORS[idx]}20`,
                borderWidth: 0.5,
                borderColor: `${SEGMENT_COLORS[idx]}40`,
                alignItems: "center", justifyContent: "center",
                padding: 8,
              }}>
                <Text style={{ color: SEGMENT_COLORS[idx], fontFamily: fonts.bodySemiBold,
                  fontSize: 10, textAlign: "center" }} numberOfLines={2}>
                  {seg.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Pointer */}
        <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10,
          borderBottomWidth: 20, borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: colors.gold, marginTop: -200, marginBottom: 180 }} />

        {/* Info */}
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 20 }}>
            Weekly Mystery Box
          </Text>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 14, textAlign: "center" }}>
            {canSpinNow
              ? "Spin for a chance to win coins, gems, or luck boosts!"
              : "You've already spun this week. Come back next week!"}
          </Text>
        </View>

        {/* Possible rewards list */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radii.md,
          borderWidth: 1, borderColor: colors.border, padding: spacing.md,
          width: "100%", gap: spacing.xs }}>
          <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11,
            marginBottom: spacing.xs }}>POSSIBLE REWARDS</Text>
          {MYSTERY_SEGMENTS.map((seg, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4,
                backgroundColor: SEGMENT_COLORS[idx] }} />
              <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13 }}>
                {seg.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Spin button */}
        <Pressable
          onPress={handleSpin}
          disabled={!canSpinNow || isSpinning}
          style={({ pressed }) => ({
            backgroundColor: canSpinNow ? colors.gold : colors.bg2,
            borderRadius: radii.md,
            paddingVertical: 14,
            paddingHorizontal: 48,
            opacity: pressed ? 0.85 : 1,
            borderWidth: canSpinNow ? 0 : 1,
            borderColor: colors.border,
          })}
        >
          <Text style={{
            color: canSpinNow ? "#FFFFFF" : colors.t4,
            fontFamily: fonts.displayBold, fontSize: 16,
          }}>
            {isSpinning ? "Spinning..." : canSpinNow ? "Spin!" : "Come Back Next Week"}
          </Text>
        </Pressable>
      </View>

      {wonReward && (
        <ResultModal reward={wonReward} onClose={() => setWonReward(null)} />
      )}
    </SafeAreaView>
  );
}
