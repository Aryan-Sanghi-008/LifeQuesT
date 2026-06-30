import { useEffect, useState, useRef } from "react";
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
import { GlassCard, ScreenShell, Card, StreakBadge, ScenarioBanner } from "@components/index";
import { StreakDetailModal } from "@components/StreakDetailModal";
import { XPBar } from "@components/XPBar";
import { AvatarByCharacter } from "@components/Avatars";
import { getSeasonPassLevel } from "@utils/seasonPassHelper";
import { WORLD_EVENTS_POOL } from "@engine/worldEngine";
import { CHALLENGES } from "@engine/challengeEngine";
import { SCENARIOS } from "@data/scenarios";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getMidnightCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HomeScreen() {
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const character = useGameStore((s) => s.character);
  const dailyQuests = useGameStore((s) => s.dailyQuests);
  const loadDailyQuests = useGameStore((s) => s.loadDailyQuests);
  const claimQuestReward = useGameStore((s) => s.claimQuestReward);
  const getLoginRewardState = useGameStore((s) => s.getLoginRewardState);

  const [countdown, setCountdown] = useState(getMidnightCountdown);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadDailyQuests();
  }, [loadDailyQuests]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(getMidnightCountdown());
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const { day: rewardDay, claimed: rewardClaimed } = getLoginRewardState();

  const doneQuests = dailyQuests.filter((q) => q.progress >= q.target).length;

  const activeEventIds = character.activeWorldEvents ?? [];
  const activeEvent = activeEventIds.length > 0
    ? WORLD_EVENTS_POOL.find((e) => e.id === activeEventIds[0])
    : undefined;

  const activeChallengeId = character.activeChallengeId as string | undefined;
  const activeChallenge = activeChallengeId ? CHALLENGES[activeChallengeId as keyof typeof CHALLENGES] : undefined;
  const activeChallengeTitle = activeChallenge
    ? activeChallenge.title
    : "No active challenge — browse catalog";

  const handleClaimQuest = (questId: string) => {
    const res = claimQuestReward(questId);
    if (res.ok) {
      Alert.alert("Success", res.message);
    } else {
      Alert.alert("Claim Failed", res.message);
    }
  };

  return (
    <>
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
                {getTimeGreeting()},
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
            <StreakBadge
              count={character.dailyStreak ?? 1}
              shieldCount={character.streakShieldCount ?? 0}
              showMilestoneProgress
              onPress={() => setStreakModalOpen(true)}
            />
          </View>
        </View>

        {(() => {
          const scenarioData =
            SCENARIOS.find((s) => s.id === (character.scenarioId ?? 'classic')) ?? SCENARIOS[0];
          return (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <ScenarioBanner
                type={scenarioData.bannerType}
                scenarioName={scenarioData.name}
                description={scenarioData.tagline}
              />
            </View>
          );
        })()}

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
        {activeEventIds.length > 0 && activeEvent && (
          <Pressable
            onPress={() => navigation.navigate("WorldEvents")}
            style={[styles.worldEventCard, { backgroundColor: `${colors.health}12`, borderColor: colors.health, borderRadius: radii.md }]}
          >
            <View style={styles.worldEventHeader}>
              <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.bodyBold }]}>
                {activeEvent.title}
              </Text>
              <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.body, fontSize: 11 }]}>
                {activeEventIds.length} active · Tap to view
              </Text>
            </View>
            <Text style={[styles.worldEventDesc, { color: colors.t2, fontFamily: fonts.body }]} numberOfLines={2}>
              {activeEvent.description}
            </Text>
          </Pressable>
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

        {/* Daily Rewards Summary Card */}
        <Pressable onPress={() => navigation.navigate("DailyRewards" as never)}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: rewardClaimed ? colors.bg2 : `${colors.gold}15` }]}>
                <Text style={{ fontSize: 28 }}>🎁</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  {rewardClaimed ? "Day Claimed!" : `Day ${rewardDay} reward ready`}
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {rewardClaimed
                    ? `Resets in ${countdown}`
                    : "Tap to view your 7-day reward calendar."}
                </Text>
              </View>
              <View style={[styles.claimBonusBtn, {
                backgroundColor: rewardClaimed ? colors.bg2 : colors.gold,
                borderRadius: radii.sm,
              }]}>
                <Text style={[styles.claimBonusText, {
                  color: rewardClaimed ? colors.t4 : "#FFFFFF",
                  fontFamily: fonts.bodyBold,
                }]}>
                  {rewardClaimed ? "Claimed" : "View"}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Mystery Box summary card */}
        <Pressable onPress={() => navigation.navigate("MysteryBox" as never)}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: `${colors.orchid}12` }]}>
                <Text style={{ fontSize: 28 }}>🎲</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  Weekly Mystery Box
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  Spin once a week for coins, gems, or luck boosts.
                </Text>
              </View>
              <View style={[styles.claimBonusBtn, { backgroundColor: `${colors.orchid}12`, borderRadius: radii.sm }]}>
                <Text style={[styles.claimBonusText, { color: colors.orchid, fontFamily: fonts.bodyBold }]}>
                  Spin
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Challenges Card */}
        <Pressable onPress={() => navigation.navigate("ChallengeMode" as never)}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: `${colors.catCareer}12` }]}>
                <Text style={{ fontSize: 28 }}>⚔️</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  Challenges
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {activeChallengeTitle}
                </Text>
              </View>
              <View style={[styles.claimBonusBtn, { backgroundColor: `${colors.catCareer}12`, borderRadius: radii.sm }]}>
                <Text style={[styles.claimBonusText, { color: colors.catCareer, fontFamily: fonts.bodyBold }]}>
                  View
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Daily Quests Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Daily Quests
            </Text>
            {dailyQuests.length > 0 && (
              <Text style={[styles.tagText, { color: colors.t3, fontFamily: fonts.mono }]}>
                {doneQuests}/{dailyQuests.length} done
              </Text>
            )}
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
    <StreakDetailModal
      visible={streakModalOpen}
      onClose={() => setStreakModalOpen(false)}
      streak={character.dailyStreak ?? 0}
      shieldCount={character.streakShieldCount ?? 0}
      claimedMilestones={character.claimedStreakMilestones ?? []}
    />
  </>
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
