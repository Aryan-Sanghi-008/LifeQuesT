import { useState, useRef } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { useToastStore } from "@store/toastStore";
import { MYSTERY_SEGMENTS, MysteryReward, rollMysterySegmentIndex } from "@store/slices/progressionSlice";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { showRewardedAd } from "@services/ads";
import { SupportLifeQuestButton } from "@shared/components/SupportLifeQuestButton";
import { GradientButton } from "@shared/components/GradientButton";
import { FortuneWheel } from "./components/FortuneWheel";
import { getSegmentVisual } from "./components/mysteryWheelTheme";
import { useMysteryWheelSpin, type WheelSpinPhase } from './hooks/useMysteryWheelSpin';
import { hapticAchievement } from "@services/haptics";
import type { RootStackParamList } from "@/types";

// ─── Result Modal ──────────────────────────────────────────────────────────────
function ResultModal({ reward, onClose }: { reward: MysteryReward; onClose: () => void }) {
  const { colors, fonts, spacing, radii } = useTheme();
  const visual = getSegmentVisual(reward);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlayScrim,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.xl,
        }}
      >
        <LinearGradient
          colors={[`${visual.fill}30`, colors.bgCard]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            borderRadius: radii.xl,
            padding: 2,
            width: "100%",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: radii.xl - 2,
              padding: spacing.xl,
              gap: spacing.md,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: `${visual.fill}22`,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: `${visual.fill}55`,
              }}
            >
              <Text style={{ fontSize: 44 }}>{visual.emoji}</Text>
            </View>
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
            <GradientButton
              label="Awesome!"
              onPress={onClose}
              colors={[colors.gold, colors.gold3]}
              style={{ marginTop: spacing.sm, width: "100%" }}
            />
          </View>
        </LinearGradient>
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
  const [spinPhase, setSpinPhase] = useState<WheelSpinPhase>("idle");
  const [wonReward, setWonReward] = useState<MysteryReward | null>(null);
  const [freeSpunThisSession, setFreeSpunThisSession] = useState(!canSpin());
  const [pendingSpin, setPendingSpin] = useState<{ useTicket: boolean; pickedIndex: number } | null>(null);
  const activeSpinRef = useRef<{ useTicket: boolean; pickedIndex: number } | null>(null);

  const { rotateDeg, spinToSegment } = useMysteryWheelSpin();

  const canFreeSpin = canSpin() && !freeSpunThisSession;

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
    const spinPayload = { useTicket, pickedIndex };
    activeSpinRef.current = spinPayload;
    setPendingSpin(spinPayload);

    spinToSegment({
      pickedIndex,
      reducedMotion,
      onSpinStart: () => {
        setIsSpinning(true);
        setSpinPhase("spinning");
        setWonReward(null);
      },
      onLanded: () => {
        setSpinPhase("landed");
        hapticAchievement();
      },
      onComplete: () => {
        const pending = activeSpinRef.current;
        if (!pending) return;
        const result = spin({
          useTicket: pending.useTicket,
          segmentIndex: pending.pickedIndex,
        });
        activeSpinRef.current = null;
        setPendingSpin(null);
        setIsSpinning(false);
        setSpinPhase("idle");
        if (result.ok && result.reward) {
          setWonReward(result.reward);
          if (!pending.useTicket) setFreeSpunThisSession(true);
        } else if (result.message) {
          showToast(result.message, "error");
        }
      },
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

        {/* Wheel stage */}
        <LinearGradient
          colors={[`${colors.orchid}18`, `${colors.gold}10`, colors.bgCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: "100%",
            borderRadius: radii.xl,
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.md,
            alignItems: "center",
            borderWidth: 1,
            borderColor: `${colors.orchid}25`,
            position: "relative",
          }}
        >
          <FortuneWheel
            rotateDeg={rotateDeg}
            isSpinning={spinPhase === "spinning"}
            spinPhase={spinPhase}
            highlightReady={canFreeSpin && spinPhase === "idle"}
          />
          {spinPhase === "spinning" && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: spacing.md,
                alignSelf: "center",
                backgroundColor: `${colors.bgCard}EE`,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: `${colors.gold}55`,
              }}
            >
              <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.5 }}>
                Rolling…
              </Text>
            </View>
          )}
          {spinPhase === "landed" && pendingSpin != null && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: spacing.md,
                alignSelf: "center",
                backgroundColor: `${colors.emerald}18`,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: `${colors.emerald}55`,
              }}
            >
              <Text style={{ color: colors.emerald, fontFamily: fonts.bodyBold, fontSize: 13 }}>
                {getSegmentVisual(MYSTERY_SEGMENTS[pendingSpin.pickedIndex]).emoji}{" "}
                {MYSTERY_SEGMENTS[pendingSpin.pickedIndex].label}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Spin buttons */}
        <GradientButton
          label={isSpinning ? "Spinning…" : canFreeSpin ? "Free Spin!" : "Free Spin Used"}
          onPress={() => runSpin(false)}
          disabled={!canFreeSpin || isSpinning}
          loading={isSpinning}
          style={{ width: "100%" }}
        />

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
            {MYSTERY_SEGMENTS.map((seg, idx) => {
              const visual = getSegmentVisual(seg);
              return (
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
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: `${visual.fill}22`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: `${visual.fill}44`,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{visual.emoji}</Text>
                </View>
                <Text
                  style={{
                    color: colors.t2,
                    fontFamily: fonts.body,
                    fontSize: 12,
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {seg.label}
                </Text>
              </View>
            );
            })}
          </View>
        </View>
      </ScrollView>

      {wonReward && <ResultModal reward={wonReward} onClose={() => setWonReward(null)} />}
    </SafeAreaView>
  );
}
