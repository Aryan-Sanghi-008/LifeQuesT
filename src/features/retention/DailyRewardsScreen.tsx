import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { LOGIN_REWARD_SCHEDULE } from "@store/slices/progressionSlice";

export function DailyRewardsScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation();

  const getLoginRewardState = useGameStore((s) => s.getLoginRewardState);
  const claimLoginReward = useGameStore((s) => s.claimLoginReward);
  const character = useGameStore((s) => s.character);

  const { day: currentDay, claimed } = getLoginRewardState();
  const [justClaimed, setJustClaimed] = useState(claimed);

  const handleClaim = () => {
    const result = claimLoginReward();
    if (result.ok) {
      setJustClaimed(true);
      Alert.alert("Reward Claimed!", result.message);
    } else {
      Alert.alert("Already Claimed", result.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t1} strokeWidth={2.2} strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </Svg>
        </Pressable>
        <Text style={{ color: colors.t1, fontFamily: fonts.displayBold, fontSize: 18 }}>Daily Rewards</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}>

        {/* Streak context */}
        {character && (
          <View style={{ backgroundColor: `${colors.gold}10`, borderWidth: 1,
            borderColor: `${colors.gold}25`, borderRadius: radii.md, padding: spacing.md,
            flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <View>
              <Text style={{ color: colors.gold3, fontFamily: fonts.displayBold, fontSize: 16 }}>
                {character.dailyStreak ?? 0} day streak
              </Text>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                Keep logging in daily to maintain your streak
              </Text>
            </View>
          </View>
        )}

        {/* 30-day calendar */}
        <View>
          <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 11,
            marginBottom: spacing.md }}>
            30-DAY REWARD CALENDAR
          </Text>
          <View style={{ gap: spacing.sm }}>
            {LOGIN_REWARD_SCHEDULE.map((reward) => {
              const dayNum = reward.day;
              const isPast = dayNum < currentDay;
              const isCurrent = dayNum === currentDay;
              const isFuture = dayNum > currentDay;

              return (
                <View key={reward.day} style={{
                  flexDirection: "row", alignItems: "center", gap: spacing.md,
                  backgroundColor: colors.bgCard, borderRadius: radii.md,
                  padding: spacing.md,
                  borderWidth: 1.5,
                  borderColor: isCurrent
                    ? justClaimed ? colors.emerald : colors.gold
                    : isPast ? `${colors.emerald}40` : colors.border,
                  opacity: isFuture ? 0.6 : 1,
                }}>
                  {/* Day indicator */}
                  <View style={{
                    width: 36, height: 36, borderRadius: radii.full,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: isCurrent
                      ? justClaimed ? `${colors.emerald}18` : `${colors.gold}18`
                      : isPast ? `${colors.emerald}12` : colors.bg2,
                  }}>
                    {isPast ? (
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path stroke={colors.emerald} strokeWidth={2.5} strokeLinecap="round"
                          d="M20 6L9 17l-5-5" />
                      </Svg>
                    ) : (
                      <Text style={{
                        color: isCurrent ? (justClaimed ? colors.emerald : colors.gold3) : colors.t4,
                        fontFamily: fonts.displayBold, fontSize: 14,
                      }}>{dayNum}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isFuture ? colors.t4 : colors.t1,
                      fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                      Day {dayNum}
                    </Text>
                    <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                      {reward.label}
                    </Text>
                  </View>

                  {isCurrent && !justClaimed && (
                    <View style={{ backgroundColor: `${colors.gold}15`, borderRadius: radii.sm,
                      paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
                      <Text style={{ color: colors.gold3, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                        READY
                      </Text>
                    </View>
                  )}
                  {isCurrent && justClaimed && (
                    <View style={{ backgroundColor: `${colors.emerald}15`, borderRadius: radii.sm,
                      paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
                      <Text style={{ color: colors.emerald, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>
                        CLAIMED
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Claim button */}
        {!justClaimed ? (
          <Pressable
            onPress={handleClaim}
            style={({ pressed }) => ({
              backgroundColor: colors.gold,
              borderRadius: radii.md,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: "#FFFFFF", fontFamily: fonts.displayBold, fontSize: 15 }}>
              Claim Day {currentDay} Reward
            </Text>
          </Pressable>
        ) : (
          <View style={{ backgroundColor: colors.bg2, borderRadius: radii.md, paddingVertical: 14,
            alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              Come back tomorrow for Day {currentDay >= 7 ? 1 : currentDay + 1}
            </Text>
          </View>
        )}

        <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12, textAlign: "center" }}>
          Missing a day resets the cycle back to Day 1.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
