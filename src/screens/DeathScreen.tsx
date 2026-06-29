import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
  Share,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarByCharacter } from "../components/Avatars";
import { logEvent } from "../services/analytics";
import {
  submitLeaderboardScore,
  computeLeaderboardScore,
} from "../services/leaderboard";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from '@theme';
import { useGameStore } from "../store/gameStore";
import { StatBar, Card, GradientButton } from "../components/index";
import { ACHIEVEMENTS } from "../data/gameData";
import { calculateDynastyScore } from "../engine/legacyEngine";
import { evaluateChallenge } from "../engine/challengeEngine";
import Svg, {
  Path,
  Circle,
  Rect as SvgRect,
  Line,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from "react-native-svg";

// ─── Tombstone SVG ────────────────────────────────────────────────────────────
function Tombstone() {
  return (
    <Svg width={160} height={200} viewBox="0 0 160 200">
      <Defs>
        <SvgGrad id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2A2E3A" />
          <Stop offset="1" stopColor="#181C24" />
        </SvgGrad>
        <SvgGrad id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={COLORS.gold3} />
          <Stop offset="0.5" stopColor={COLORS.gold2} />
          <Stop offset="1" stopColor={COLORS.gold3} />
        </SvgGrad>
      </Defs>

      {/* Base slab */}
      <SvgRect
        x={20}
        y={165}
        width={120}
        height={18}
        rx={4}
        fill="url(#stoneGrad)"
      />
      <SvgRect
        x={10}
        y={178}
        width={140}
        height={10}
        rx={3}
        fill="url(#stoneGrad)"
      />

      {/* Main stone body — rounded top */}
      <Path
        d="M30 160 L30 70 Q30 30 80 30 Q130 30 130 70 L130 160 Z"
        fill="url(#stoneGrad)"
      />
      {/* Stone edge highlight */}
      <Path
        d="M32 158 L32 71 Q32 34 80 34 Q128 34 128 71 L128 158"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={2}
      />

      {/* Cross ornament */}
      <SvgRect
        x={76}
        y={44}
        width={8}
        height={32}
        rx={2}
        fill="url(#goldGrad)"
      />
      <SvgRect
        x={62}
        y={54}
        width={36}
        height={8}
        rx={2}
        fill="url(#goldGrad)"
      />

      {/* Name plate */}
      <SvgRect
        x={38}
        y={95}
        width={84}
        height={48}
        rx={6}
        fill="rgba(0,0,0,0.3)"
      />
      <SvgRect
        x={39}
        y={96}
        width={82}
        height={46}
        rx={5}
        fill="none"
        stroke={`${COLORS.gold}25`}
        strokeWidth={1}
      />

      {/* R.I.P text */}
      <Path
        d="M55 108 h50"
        stroke={COLORS.gold3}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.5}
      />
      {/* We use foreignObject via Text elements with approximate positioning */}
    </Svg>
  );
}

const { width, height } = Dimensions.get("window");

// ─── Floating Particle ────────────────────────────────────────────────────────
function FloatingParticle({
  x,
  delay,
  color,
}: {
  x: number;
  delay: number;
  color: string;
}) {
  const y = useRef(new Animated.Value(height * 0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      y.setValue(height * 0.8 + Math.random() * 100);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, {
          toValue: height * 0.1 - Math.random() * 100,
          duration: 4000 + Math.random() * 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1200,
            delay: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => setTimeout(animate, Math.random() * 2000));
    };
    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: color,
        transform: [{ translateY: y }],
        opacity,
      }}
    />
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function FinalStatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={fsr.row}>
      <Text style={fsr.label}>{label}</Text>
      <View style={fsr.barWrap}>
        <StatBar value={value} color={color} height={4} />
      </View>
      <Text style={[fsr.val, { color }]}>{value}</Text>
    </View>
  );
}
const fsr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: 5,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.t3,
    width: 80,
    textAlign: "right",
  },
  barWrap: { flex: 1 },
  val: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 12,
    width: 28,
    textAlign: "right",
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DeathScreen() {
  const character = useGameStore((s) => s.character);
  const reincarnate = useGameStore((s) => s.reincarnate);
  const user = useGameStore((s) => s.user);
  const playAsHeirAction = useGameStore((s) => s.playAsHeir);
  const [selectedHeirId, setSelectedHeirId] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);

  // Stagger fade-in refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const tombAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  // Tombstone float
  const tombFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger entrance
    Animated.stagger(300, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(tombAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Tombstone gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(tombFloat, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(tombFloat, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (!character || !user || user.isGuest) return;
    const score = computeLeaderboardScore(character);
    void submitLeaderboardScore({
      score,
      lifeAge: character.deathAge ?? character.age,
      country: character.country,
      displayName: user.displayName ?? character.name,
      avatarSeed: character.avatarSeed,
    }).catch(() => {});
  }, [character, user]);

  if (!character) return null;

  const {
    name,
    age,
    deathAge,
    deathCause,
    stats,
    karma,
    achievements,
    eventHistory,
    birthYear,
    country,
    countryFlag,
    netWorthPeak,
    relationships,
    children,
    job,
  } = character;

  const livingHeirs = character.people.filter(
    (p) =>
      (p.relationType === "child" || p.relationType === "sibling") && p.isAlive,
  );

  const finalAge = deathAge ?? age;
  const lifeSpan = finalAge;
  const lifeRating =
    lifeSpan >= 100
      ? "Legendary"
      : lifeSpan >= 80
        ? "Long Life"
        : lifeSpan >= 60
          ? "Full Life"
          : lifeSpan >= 40
            ? "Mid-Life"
            : "Short Life";

  const dynastyScore = calculateDynastyScore(character);
  const challengeEval = character.activeChallengeId
    ? evaluateChallenge(character)
    : null;

  const particles = [
    { x: width * 0.1, color: COLORS.gold, delay: 0 },
    { x: width * 0.25, color: COLORS.teal, delay: 600 },
    { x: width * 0.4, color: COLORS.gold2, delay: 1200 },
    { x: width * 0.6, color: COLORS.orchid, delay: 300 },
    { x: width * 0.75, color: COLORS.gold3, delay: 900 },
    { x: width * 0.88, color: COLORS.sapphire, delay: 450 },
  ];

  const handleReincarnate = () => {
    const carried = reincarnate();
    if (carried) {
      Alert.alert(
        "Reincarnation",
        "Your top stats carry over at 50% strength. Continue to create your next life.",
      );
      void logEvent("reincarnate", { stats: Object.keys(carried).length });
    }
  };

  const handleContinueAsHeir = () => {
    if (!selectedHeirId) return;
    const res = playAsHeirAction(selectedHeirId);
    if (res.ok) {
      Alert.alert(
        "Heir Transition",
        "Successfully transitioned to your chosen heir. Continue their life!",
      );
    } else {
      Alert.alert("Error", res.message ?? "Failed to transition to heir.");
    }
  };

  const handleShare = async () => {
    const divider = "+---------------------------------------------------+";
    const borderText = (label: string, val: string) => {
      const line = `| ${label}: ${val}`;
      const padding = 52 - line.length;
      return line + " ".repeat(Math.max(0, padding)) + "|";
    };
    const message = [
      divider,
      "|                  L I F E Q U E S T                |",
      "|               ~ IN LOVING MEMORY ~                |",
      divider,
      borderText("Name", name),
      borderText(
        "Years Lived",
        `${finalAge} years (${birthYear}–${birthYear + finalAge})`,
      ),
      borderText("Country", `${countryFlag} ${country}`),
      borderText("Peak Career", job || "None"),
      borderText("Net Worth", `$${netWorthPeak.toLocaleString()}`),
      borderText("Achievements", `${achievements.length} milestones`),
      borderText("Karma", `${karma} (${lifeRating})`),
      divider,
      '|  "A legendary life, lived with courage & purpose" |',
      divider,
    ].join("\n");
    await Share.share({ message, title: `${name}'s Life Story` });
  };

  return (
    <View style={styles.root}>
      {/* Dark gradient bg */}
      <LinearGradient
        colors={[COLORS.deathBg, COLORS.deathBg2, COLORS.deathBg]}
        style={StyleSheet.absoluteFill}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} x={p.x} delay={p.delay} color={p.color} />
      ))}

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.ribbonWrap}>
              <LinearGradient
                colors={[COLORS.bg3, `${COLORS.crimson}18`, COLORS.bg3]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ribbon}
              >
                <Text style={styles.ribbonText}>A LIFE HAS ENDED</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Life rating — visible above the fold */}
          <Animated.View
            style={[
              styles.ratingRow,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingAge}>{finalAge}</Text>
              <Text style={styles.ratingYrs}>years</Text>
            </View>
            <View>
              <Text style={styles.ratingLabel}>{lifeRating}</Text>
              <Text style={styles.ratingCountry}>
                {countryFlag} {country}
              </Text>
            </View>
          </Animated.View>

          {/* ── Tombstone ──────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.tombWrap,
              {
                opacity: tombAnim,
                transform: [
                  {
                    translateY: Animated.add(
                      tombAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                      tombFloat,
                    ),
                  },
                ],
              },
            ]}
          >
            <Tombstone />

            {/* Name + dates overlaid */}
            <View style={styles.tombText}>
              <Text style={styles.tombRIP}>R.I.P.</Text>
              <Text style={styles.tombName}>{name}</Text>
              <Text style={styles.tombDates}>
                {birthYear} — {birthYear + finalAge}
              </Text>
              <Text style={styles.tombCause}>
                Died of {deathCause ?? "natural causes"}
              </Text>
            </View>

            {/* Glow under tombstone */}
            <View style={styles.tombGlow} />
          </Animated.View>

          {/* ── Summary Card ────────────────────────────────────── */}
          <Animated.View
            style={[
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {challengeEval && (
              <Card
                style={[
                  styles.challengeOutcomeCard,
                  challengeEval.success
                    ? styles.successChallengeCard
                    : styles.failedChallengeCard,
                ]}
              >
                <Text style={styles.cardTitle}>
                  CHALLENGE:{" "}
                  {character.activeChallengeId
                    ?.toUpperCase()
                    .replace(/_/g, " ")}
                </Text>
                <Text
                  style={[
                    styles.challengeOutcomeText,
                    challengeEval.success
                      ? { color: COLORS.teal }
                      : { color: COLORS.crimson },
                  ]}
                >
                  {challengeEval.success
                    ? "🎉 CHALLENGE COMPLETED"
                    : "❌ CHALLENGE FAILED"}
                </Text>
                <Text style={styles.challengeOutcomeDesc}>
                  {challengeEval.message}
                </Text>
              </Card>
            )}

            {/* Final stats */}
            <Card style={styles.statsCard}>
              <Text style={styles.cardTitle}>FINAL STATS</Text>
              <FinalStatRow
                label="Health"
                value={stats.health}
                color={COLORS.crimson}
              />
              <FinalStatRow
                label="Happiness"
                value={stats.happiness}
                color={COLORS.gold}
              />
              <FinalStatRow
                label="Mind"
                value={stats.intelligence}
                color={COLORS.sapphire}
              />
              <FinalStatRow
                label="Wealth"
                value={stats.wealth}
                color={COLORS.teal}
              />
              <FinalStatRow
                label="Fitness"
                value={stats.fitness}
                color={COLORS.emerald}
              />
              <FinalStatRow
                label="Looks"
                value={stats.looks}
                color={COLORS.orchid}
              />
              <FinalStatRow
                label="Social"
                value={stats.social}
                color={COLORS.sapphire}
              />
              <FinalStatRow
                label="Ambition"
                value={stats.ambition}
                color={COLORS.gold}
              />
            </Card>

            {/* Life highlights */}
            <Card style={styles.highlightsCard}>
              <Text style={styles.cardTitle}>LIFE HIGHLIGHTS</Text>
              <View style={styles.highlights}>
                {[
                  {
                    label: "Events Lived",
                    value: eventHistory.length,
                    color: COLORS.sapphire,
                  },
                  {
                    label: "Relationships",
                    value: relationships,
                    color: COLORS.crimson,
                  },
                  { label: "Children", value: children, color: COLORS.gold },
                  {
                    label: "Peak Wealth",
                    value: netWorthPeak,
                    color: COLORS.teal,
                  },
                  {
                    label: "Karma",
                    value: karma,
                    color: karma > 100 ? COLORS.teal : COLORS.t3,
                  },
                  {
                    label: "Achievements",
                    value: achievements.length,
                    color: COLORS.orchid,
                  },
                  {
                    label: "Dynasty Score",
                    value: dynastyScore,
                    color: COLORS.gold,
                  },
                ].map((h) => (
                  <View key={h.label} style={styles.highlightItem}>
                    <Text style={[styles.highlightVal, { color: h.color }]}>
                      {h.value}
                    </Text>
                    <Text style={styles.highlightLbl}>{h.label}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Achievements earned */}
            {achievements.length > 0 && (
              <Card style={styles.achCard}>
                <Text style={styles.cardTitle}>ACHIEVEMENTS EARNED</Text>
                <View style={styles.achRow}>
                  {achievements.map((id) => {
                    const ach = ACHIEVEMENTS.find((a) => a.id === id);
                    if (!ach) return null;
                    return (
                      <View
                        key={id}
                        style={[
                          styles.achChip,
                          {
                            borderColor: `${ach.color}40`,
                            backgroundColor: `${ach.color}10`,
                          },
                        ]}
                      >
                        <Svg
                          width={10}
                          height={10}
                          viewBox="0 0 24 24"
                          fill={ach.color}
                        >
                          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </Svg>
                        <Text
                          style={[styles.achChipText, { color: ach.color }]}
                        >
                          {ach.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            )}

            {/* Heirs selection */}
            {livingHeirs.length > 0 && (
              <Card style={styles.achCard}>
                <Text style={styles.cardTitle}>CHOOSE YOUR SUCCESSOR</Text>
                <Text style={styles.heirHint}>
                  Select a child or sibling to continue your family line
                </Text>
                <View
                  style={{
                    gap: SPACING.sm,
                    width: "100%",
                    marginTop: SPACING.xs,
                  }}
                >
                  {livingHeirs.map((h) => {
                    const active = selectedHeirId === h.id;
                    return (
                      <Pressable
                        key={h.id}
                        onPress={() => setSelectedHeirId(h.id)}
                        style={[styles.heirRow, active && styles.heirRowActive]}
                      >
                        <View style={{ gap: 2 }}>
                          <Text
                            style={[
                              styles.heirName,
                              active && { color: COLORS.teal },
                            ]}
                          >
                            {h.name}
                          </Text>
                          <Text style={styles.heirRel}>
                            {h.relationType.toUpperCase()} · Age {h.age}
                          </Text>
                          {h.occupation && (
                            <Text style={styles.heirOcc}>{h.occupation}</Text>
                          )}
                        </View>
                        {active && (
                          <View style={styles.checkmark}>
                            <Svg
                              width={14}
                              height={14}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <Path
                                stroke={COLORS.teal}
                                strokeWidth={3}
                                strokeLinecap="round"
                                d="M20 6L9 17l-5-5"
                              />
                            </Svg>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            )}
          </Animated.View>

          {/* ── CTA ────────────────────────────────────────────── */}
          <Animated.View style={[styles.cta, { opacity: ctaAnim }]}>
            <Text style={styles.ctaHint}>
              Continue your journey with a new life
            </Text>
            {selectedHeirId ? (
              <GradientButton
                label="Continue as Heir"
                onPress={handleContinueAsHeir}
                colors={[COLORS.teal, COLORS.emerald]}
                textColor="#FFFFFF"
                style={{ width: "100%" }}
              />
            ) : (
              <GradientButton
                label="Reincarnate"
                onPress={handleReincarnate}
                colors={[COLORS.gold, COLORS.gold3]}
                textColor="#160D00"
                style={{ width: "100%" }}
              />
            )}
            <Text style={styles.ctaSub}>
              {selectedHeirId
                ? "Inherited wealth is distributed according to your will"
                : "Top stats carry over at 50% when eligible"}
            </Text>
            <Pressable
              style={styles.shareBtn}
              onPress={() => setCardVisible(true)}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle
                  stroke={COLORS.t3}
                  strokeWidth={2}
                  cx="18"
                  cy="5"
                  r="3"
                />
                <Circle
                  stroke={COLORS.t3}
                  strokeWidth={2}
                  cx="6"
                  cy="12"
                  r="3"
                />
                <Circle
                  stroke={COLORS.t3}
                  strokeWidth={2}
                  cx="18"
                  cy="19"
                  r="3"
                />
                <Line
                  stroke={COLORS.t3}
                  strokeWidth={2}
                  strokeLinecap="round"
                  x1="8.59"
                  y1="13.51"
                  x2="15.42"
                  y2="17.49"
                />
                <Line
                  stroke={COLORS.t3}
                  strokeWidth={2}
                  strokeLinecap="round"
                  x1="15.41"
                  y1="6.51"
                  x2="8.59"
                  y2="10.49"
                />
              </Svg>
              <Text style={styles.shareBtnText}>View Visual Life Card</Text>
            </Pressable>

            {/* Visual Life Summary Card Modal */}
            <Modal transparent visible={cardVisible} animationType="slide">
              <View style={styles.modalOverlay}>
                <LinearGradient
                  colors={["#0F172A", "#1E293B"]}
                  style={styles.modalContainer}
                >
                  <Text style={styles.modalTitle}>Visual Life Card</Text>

                  {/* The actual visual card layout */}
                  <LinearGradient
                    colors={["#1E1E38", "#0F0F1A"]}
                    style={styles.visualCard}
                  >
                    <Text style={styles.cardRIP}>IN LOVING MEMORY</Text>
                    <View style={styles.cardAvatar}>
                      <AvatarByCharacter character={character} size={80} />
                    </View>
                    <Text style={styles.cardName}>{name}</Text>
                    <Text style={styles.cardDates}>
                      {birthYear} — {birthYear + finalAge} ({finalAge} Years)
                    </Text>
                    <Text style={styles.cardSubText}>
                      {countryFlag} Deceased in {country}
                    </Text>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardStatsGrid}>
                      <View style={styles.cardStat}>
                        <Text style={styles.cardStatLbl}>PEAK CAREER</Text>
                        <Text style={styles.cardStatVal}>{job || "None"}</Text>
                      </View>
                      <View style={styles.cardStat}>
                        <Text style={styles.cardStatLbl}>PEAK WEALTH</Text>
                        <Text
                          style={[styles.cardStatVal, { color: COLORS.wealth }]}
                        >
                          ${netWorthPeak.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.cardStat}>
                        <Text style={styles.cardStatLbl}>ACHIEVEMENTS</Text>
                        <Text
                          style={[styles.cardStatVal, { color: COLORS.orchid }]}
                        >
                          {achievements.length} Earned
                        </Text>
                      </View>
                      <View style={styles.cardStat}>
                        <Text style={styles.cardStatLbl}>DYNASTY SCORE</Text>
                        <Text
                          style={[styles.cardStatVal, { color: COLORS.gold }]}
                        >
                          {dynastyScore} pts
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <Text style={styles.cardQuote}>
                      "A life marked by courage, ambition, and the legacy left
                      behind."
                    </Text>
                  </LinearGradient>

                  {/* Modal Actions */}
                  <View style={styles.modalActions}>
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          "Save Card",
                          "Visual Life Summary Card saved to your gallery successfully!",
                        );
                      }}
                      style={[styles.modalBtn, styles.downloadBtn]}
                    >
                      <Text style={styles.downloadBtnText}>
                        📥 Save to Gallery
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleShare}
                      style={[styles.modalBtn, styles.shareBtnModal]}
                    >
                      <Text style={styles.shareBtnTextModal}>
                        📤 Share ASCII Card
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => setCardVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </Modal>
          </Animated.View>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.deathBg },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, alignItems: "center" },

  // Header ribbon
  header: {
    width: "100%",
    alignItems: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  ribbonWrap: { width: "100%" },
  ribbon: { paddingVertical: SPACING.sm, alignItems: "center" },
  ribbonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 4,
  },

  // Tombstone
  tombWrap: {
    alignItems: "center",
    marginBottom: SPACING.md,
    position: "relative",
  },
  tombText: { position: "absolute", top: 95, alignItems: "center", width: 120 },
  tombRIP: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.gold3,
    letterSpacing: 3,
  },
  tombName: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: COLORS.t1,
    textAlign: "center",
    marginTop: 2,
  },
  tombDates: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.t3,
    marginTop: 3,
  },
  tombCause: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.t4,
    marginTop: 4,
    textAlign: "center",
  },
  tombGlow: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    width: 120,
    height: 20,
    borderRadius: 60,
    backgroundColor: COLORS.gold,
    opacity: 0.07,
    ...SHADOWS.gold,
  },

  // Rating
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
    width: "100%",
  },
  ratingBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    backgroundColor: `${COLORS.gold}10`,
  },
  ratingAge: {
    fontFamily: FONTS.displayBlack,
    fontSize: 28,
    color: COLORS.gold,
  },
  ratingYrs: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.gold3 },
  ratingLabel: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.t1,
  },
  ratingCountry: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.t3,
    marginTop: 4,
  },

  // Cards
  statsCard: { width: "100%", gap: 4, marginBottom: SPACING.lg },
  highlightsCard: { width: "100%", marginBottom: SPACING.lg },
  achCard: { width: "100%", gap: SPACING.sm, marginBottom: SPACING.lg },
  cardTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },

  // Highlights grid
  highlights: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  highlightItem: {
    width: "30%",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  highlightVal: { fontFamily: FONTS.displayBold, fontSize: 20 },
  highlightLbl: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t4,
    marginTop: 2,
    textAlign: "center",
  },

  // Achievements
  achRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  achChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  achChipText: { fontFamily: FONTS.bodySemiBold, fontSize: 11 },

  // Heirs
  heirHint: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.t4,
    marginBottom: SPACING.xs,
  },
  heirRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard2,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heirRowActive: {
    borderColor: COLORS.teal,
    backgroundColor: `${COLORS.teal}08`,
  },
  heirName: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1 },
  heirRel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
  heirOcc: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t3,
    marginTop: 2,
  },
  checkmark: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: `${COLORS.teal}12`,
  },

  // Challenge Outcome
  challengeOutcomeCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  successChallengeCard: {
    borderColor: COLORS.teal,
    backgroundColor: `${COLORS.teal}04`,
  },
  failedChallengeCard: {
    borderColor: COLORS.crimson,
    backgroundColor: `${COLORS.crimson}04`,
  },
  challengeOutcomeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    textTransform: "uppercase",
    marginTop: 4,
  },
  challengeOutcomeDesc: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    lineHeight: 18,
    marginTop: 2,
  },

  // CTA
  cta: { width: "100%", gap: SPACING.sm, marginTop: SPACING.lg },
  ctaHint: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.t2,
    textAlign: "center",
  },
  ctaSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t4,
    textAlign: "center",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  shareBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.t3,
  },

  // Visual Card Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 450,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    ...SHADOWS.card,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: "#F1F5F9",
    marginBottom: SPACING.md,
  },
  visualCard: {
    width: "100%",
    borderRadius: RADII.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  cardRIP: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 10,
    color: COLORS.gold3,
    letterSpacing: 2,
  },
  cardAvatar: {
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  cardName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: "#FFFFFF",
    marginTop: SPACING.xs,
  },
  cardDates: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: "#94A3B8",
  },
  cardSubText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: "#64748B",
  },
  cardDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#334155",
    marginVertical: SPACING.xs,
  },
  cardStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: SPACING.md,
  },
  cardStat: {
    width: "45%",
    gap: 2,
  },
  cardStatLbl: {
    fontFamily: FONTS.bodyBold,
    fontSize: 9,
    color: "#64748B",
    letterSpacing: 0.5,
  },
  cardStatVal: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: "#E2E8F0",
  },
  cardQuote: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    width: "100%",
    marginBottom: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    height: 42,
    borderRadius: RADII.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  downloadBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.t1,
  },
  shareBtnModal: {
    backgroundColor: COLORS.gold,
  },
  shareBtnTextModal: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: "#160D00",
  },
  closeBtn: {
    paddingVertical: SPACING.sm,
  },
  closeBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.t4,
  },
});
