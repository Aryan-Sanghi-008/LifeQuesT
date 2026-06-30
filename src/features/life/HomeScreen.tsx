import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGameStore } from "@store/gameStore";
import { useTheme } from "@theme";
import { GlassCard, ScreenShell, Card } from "@components/index";
import { XPBar } from "@components/XPBar";
import { AvatarByCharacter } from "@components/Avatars";
import { getSeasonPassLevel } from "../../utils/seasonPassHelper";
import { getDailyBonusLastClaim } from "@services/persistence";
import Svg, { Path } from "react-native-svg";

function FlameIcon({ size = 20, color = "#F59E0B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const character = useGameStore((s) => s.character);
  const dailyQuests = useGameStore((s) => s.dailyQuests);
  const loadDailyQuests = useGameStore((s) => s.loadDailyQuests);
  const claimQuestReward = useGameStore((s) => s.claimQuestReward);
  const claimDailyBonus = useGameStore((s) => s.claimDailyBonus);

  const [hasClaimedBonusToday, setHasClaimedBonusToday] = useState(false);

  useEffect(() => {
    loadDailyQuests();
    const today = new Date().toISOString().slice(0, 10);
    const lastClaim = getDailyBonusLastClaim();
    setHasClaimedBonusToday(lastClaim === today);
  }, [loadDailyQuests, character?.coins]);

  if (!character) {
    return (
      <ScreenShell>
        <View style={[styles.empty, { backgroundColor: colors.bg }]}>
          <Text style={[styles.emptyText, { color: colors.t3, fontFamily: fonts.body }]}>
            No active character. Create one to begin your quest!
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const { level, currentXp, maxXp } = getSeasonPassLevel(character.seasonXp ?? 0);

  const handleClaimDailyBonus = () => {
    const res = claimDailyBonus();
    if (res.ok) {
      setHasClaimedBonusToday(true);
      Alert.alert("Success", res.message);
    } else {
      Alert.alert("Claim Failed", res.message);
    }
  };

  const handleClaimQuest = (questId: string) => {
    const res = claimQuestReward(questId);
    if (res.ok) {
      Alert.alert("Success", res.message);
    } else {
      Alert.alert("Claim Failed", res.message);
    }
  };

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Strip */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarRing, { borderColor: colors.gold }]}>
              <AvatarByCharacter character={character} size={50} />
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.welcome, { color: colors.t3, fontFamily: fonts.body }]}>
                Welcome back,
              </Text>
              <Text style={[styles.name, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                {character.name}
              </Text>
              <Text style={[styles.subText, { color: colors.t3, fontFamily: fonts.body }]}>
                Age {character.age} · {character.countryFlag} {character.country}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.streakBadge, { backgroundColor: `${colors.gold}15`, borderRadius: radii.full }]}>
              <FlameIcon size={16} color={colors.gold} />
              <Text style={[styles.streakText, { color: colors.gold, fontFamily: fonts.monoSemiBold }]}>
                {character.dailyStreak ?? 1}
              </Text>
            </View>
          </View>
        </View>

        {/* Currency summary strip */}
        <GlassCard style={styles.currencyCard}>
          <View style={styles.currencyCol}>
            <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body }]}>COINS</Text>
            <Text style={[styles.currencyVal, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
              🪙 {character.coins.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />
          <View style={styles.currencyCol}>
            <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body }]}>GEMS</Text>
            <Text style={[styles.currencyVal, { color: colors.gold, fontFamily: fonts.monoSemiBold }]}>
              💎 {character.gems.toLocaleString()}
            </Text>
          </View>
        </GlassCard>

        {/* Active World Event Banner */}
        {character.activeWorldEvents && character.activeWorldEvents.length > 0 && (
          <View style={[styles.worldEventCard, { backgroundColor: `${colors.health}12`, borderColor: colors.health, borderRadius: radii.md }]}>
            <View style={styles.worldEventHeader}>
              <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.bodyBold }]}>
                ⚠️ GLOBAL EVENT ACTIVE
              </Text>
            </View>
            <Text style={[styles.worldEventDesc, { color: colors.t2, fontFamily: fonts.body }]}>
              The stock market is experiencing massive volatility. Asset yields are modified. Check the Life Feed for details!
            </Text>
          </View>
        )}

        {/* Season Pass Progress Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Season Pass Progression
            </Text>
            <View style={[styles.tag, { backgroundColor: `${colors.teal}15` }]}>
              <Text style={[styles.tagText, { color: colors.teal, fontFamily: fonts.bodyBold }]}>
                {character.hasSeasonPass ? "PLUS ACTIVE" : "FREE TIER"}
              </Text>
            </View>
          </View>
          <XPBar level={level} currentXp={currentXp} maxXp={maxXp} />
          {!character.hasSeasonPass && (
            <Pressable
              onPress={() => navigation.navigate("Shop")}
              style={[styles.buyPassBtn, { backgroundColor: colors.gold, borderRadius: radii.sm }]}
            >
              <Text style={[styles.buyPassText, { color: colors.bgCard, fontFamily: fonts.bodyBold }]}>
                Unlock Premium Pass
              </Text>
            </Pressable>
          )}
        </Card>

        {/* Daily Bonus Claim Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Daily Login Bonus
            </Text>
          </View>
          <View style={styles.dailyBonusContent}>
            <View style={[styles.giftBox, { backgroundColor: hasClaimedBonusToday ? colors.bg2 : `${colors.gold}15` }]}>
              <Text style={{ fontSize: 28 }}>🎁</Text>
            </View>
            <View style={styles.dailyBonusTextCol}>
              <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                {hasClaimedBonusToday ? "Reward Claimed!" : "Ready to Claim"}
              </Text>
              <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                Log in consecutive days to grow your 🔥 streak and claim bonus gold coins.
              </Text>
            </View>
            <Pressable
              onPress={handleClaimDailyBonus}
              disabled={hasClaimedBonusToday}
              style={[
                styles.claimBonusBtn,
                {
                  backgroundColor: hasClaimedBonusToday ? colors.bg2 : colors.emerald,
                  borderRadius: radii.sm,
                },
              ]}
            >
              <Text
                style={[
                  styles.claimBonusText,
                  {
                    color: hasClaimedBonusToday ? colors.t4 : "#FFFFFF",
                    fontFamily: fonts.bodyBold,
                  },
                ]}
              >
                {hasClaimedBonusToday ? "Claimed" : "Claim"}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Daily Quests Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Daily Quests
            </Text>
          </View>
          <View style={styles.questsList}>
            {dailyQuests.length === 0 ? (
              <Text style={[styles.noQuests, { color: colors.t3, fontFamily: fonts.body }]}>
                No quests active. Check back later or age up!
              </Text>
            ) : (
              dailyQuests.map((quest) => {
                const isComplete = quest.progress >= quest.target;
                return (
                  <View
                    key={quest.id}
                    style={[
                      styles.questRow,
                      { borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.questInfo}>
                      <Text style={[styles.questTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                        {quest.title}
                      </Text>
                      <Text style={[styles.questDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                        {quest.description}
                      </Text>
                      <View style={styles.questProgressContainer}>
                        <View style={[styles.progressTrack, { backgroundColor: colors.bg2, borderRadius: radii.full }]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: isComplete ? colors.emerald : colors.sapphire,
                                borderRadius: radii.full,
                                width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.progressText, { color: colors.t2, fontFamily: fonts.mono }]}>
                          {quest.progress}/{quest.target}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.questAction}>
                      <Text style={[styles.questReward, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
                        🪙 {quest.rewardCoins}
                      </Text>
                      <Pressable
                        onPress={() => handleClaimQuest(quest.id)}
                        disabled={!isComplete || quest.claimed}
                        style={[
                          styles.questBtn,
                          {
                            backgroundColor: quest.claimed
                              ? colors.bg2
                              : isComplete
                              ? colors.emerald
                              : colors.bg2,
                            borderRadius: radii.sm,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.questBtnText,
                            {
                              color: quest.claimed
                                ? colors.t4
                                : isComplete
                                ? "#FFFFFF"
                                : colors.t4,
                              fontFamily: fonts.bodyBold,
                            },
                          ]}
                        >
                          {quest.claimed ? "Claimed" : isComplete ? "Claim" : "Locked"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </Card>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    gap: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarRing: {
    borderRadius: 28,
    borderWidth: 2,
    padding: 2,
    overflow: "hidden",
  },
  profileText: {
    gap: 2,
  },
  welcome: {
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    lineHeight: 22,
  },
  subText: {
    fontSize: 11,
  },
  headerRight: {},
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
  },
  currencyCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  currencyCol: {
    alignItems: "center",
    flex: 1,
  },
  currencyLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  currencyVal: {
    fontSize: 16,
  },
  currencyDivider: {
    width: 1,
    height: 30,
  },
  worldEventCard: {
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  worldEventHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  worldEventTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  worldEventDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  buyPassBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buyPassText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  dailyBonusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  giftBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyBonusTextCol: {
    flex: 1,
    gap: 2,
  },
  bonusTitle: {
    fontSize: 14,
  },
  bonusDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  claimBonusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  claimBonusText: {
    fontSize: 12,
  },
  questsList: {
    gap: 12,
  },
  noQuests: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  questRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  questInfo: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  questTitle: {
    fontSize: 13,
  },
  questDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  questProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 10,
    minWidth: 32,
    textAlign: "right",
  },
  questAction: {
    alignItems: "center",
    gap: 6,
  },
  questReward: {
    fontSize: 12,
  },
  questBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
    alignItems: "center",
  },
  questBtnText: {
    fontSize: 11,
  },
});
