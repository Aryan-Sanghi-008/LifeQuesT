import { useRef, useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { BottomSheet } from "./BottomSheet";
import { LifeEvent, EventChoice, Character } from "@/types";
import { useTheme } from "@theme";
import Svg, { Path } from "react-native-svg";
import { hapticDecision, hapticButtonPress } from "@services/haptics";
import { playSound } from "@services/audio";
import { useGameStore } from "@store/gameStore";

interface DecisionSheetProps {
  event: LifeEvent | null;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

// ─── Choice Arrow Icon ────────────────────────────────────────────────────────
function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 18l6-6-6-6"
      />
    </Svg>
  );
}

// ─── Success Chance Bar ───────────────────────────────────────────────────────
function SuccessBar({ chance }: { chance: number }) {
  const { colors, fonts } = useTheme();
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(width, {
      toValue: chance,
      useNativeDriver: false,
      damping: 20,
      stiffness: 180,
    }).start();
  }, [chance, width]);

  const widthPct = width.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const barColor =
    chance >= 70
      ? colors.emerald
      : chance >= 50
      ? colors.gold
      : colors.health;

  return (
    <View style={sb.wrap}>
      <View style={[sb.track, { backgroundColor: colors.bg2 }]}>
        <Animated.View
          style={[sb.fill, { width: widthPct, backgroundColor: barColor }]}
        />
      </View>
      <Text
        style={[
          sb.label,
          { color: barColor, fontFamily: fonts.monoSemiBold },
        ]}
      >
        {chance}% chance
      </Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  label: { fontSize: 10, minWidth: 64, textAlign: "right" },
});

// ─── Parse stat chips ─────────────────────────────────────────────────────────
const STAT_LABELS: Record<string, string> = {
  health: "HP",
  happiness: "Joy",
  intelligence: "Mind",
  wealth: "Wealth",
  fitness: "Fit",
  looks: "Looks",
  social: "Social",
  ambition: "Drive",
  karma: "Karma",
};

function parseEffectChips(choice: EventChoice, revealed: boolean) {
  const chips: Array<{ label: string; positive: boolean }> = [];
  Object.entries(choice.statEffect).forEach(([key, val]) => {
    if (!val) return;
    const lbl = STAT_LABELS[key];
    if (!lbl) return;
    const sign = (val as number) > 0 ? "+" : "";
    // Hide the actual value with a visual "?" placeholder if not pressed/revealed
    const displayVal = revealed ? `${sign}${val}` : `??`;
    chips.push({
      label: `${displayVal} ${lbl}`,
      positive: (val as number) > 0,
    });
  });
  return chips.slice(0, 3);
}

// ─── Choice Card ─────────────────────────────────────────────────────────────
interface ChoiceCardProps {
  choice: EventChoice;
  onPress: () => void;
  index: number;
  accentColor: string;
  character: Character | null;
}

function ChoiceCard({ choice, onPress, index, accentColor, character }: ChoiceCardProps) {
  const { colors, fonts, radii } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  // Track if consequences are revealed (unblurred) during press and hold
  const [revealed, setRevealed] = useState(false);

  const chips = parseEffectChips(choice, revealed);
  const showChance = choice.successChance !== undefined;

  // Fetch NPC Reaction sentiment
  const npcReactionText = useMemo(() => {
    if (!choice.npcReaction || !character) return null;
    const reaction = choice.npcReaction;
    const npc = character.people.find((p) => p.relationType === reaction.relationType);
    if (!npc) return null;
    const sentimentMap: Record<string, { emoji: string; verb: string }> = {
      positive: { emoji: '😊', verb: 'approves' },
      negative: { emoji: '😠', verb: 'disapproves' },
      overjoyed: { emoji: '🥹', verb: 'is overjoyed' },
      relieved: { emoji: '😌', verb: 'is relieved' },
      grateful: { emoji: '🙏', verb: 'is grateful' },
      proud: { emoji: '🫡', verb: 'is proud' },
      moved: { emoji: '🥺', verb: 'is moved' },
      shocked: { emoji: '😳', verb: 'is shocked' },
      hurt: { emoji: '💔', verb: 'is hurt' },
      sad: { emoji: '😢', verb: 'is sad' },
      uncertain: { emoji: '😟', verb: 'is uncertain' },
      frustrated: { emoji: '😤', verb: 'is frustrated' },
      disappointed: { emoji: '😞', verb: 'is disappointed' },
      betrayed: { emoji: '😡', verb: 'feels betrayed' },
      accepting: { emoji: '🤝', verb: 'accepts this' },
    };
    const { emoji, verb } = sentimentMap[reaction.sentiment] ?? sentimentMap.positive;
    return `${emoji} ${npc.name} (${reaction.relationType}) ${verb}`;
  }, [choice.npcReaction, character]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale }, { translateY: translateYAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          setRevealed(true);
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            damping: 18,
            stiffness: 220,
          }).start();
          hapticButtonPress();
        }}
        onPressOut={() => {
          setRevealed(false);
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 18,
            stiffness: 220,
          }).start();
        }}
        accessibilityRole="button"
        accessibilityLabel={choice.text}
        android_ripple={{ color: `${accentColor}15` }}
        style={{ borderRadius: radii.md, overflow: "hidden" }}
      >
        <View
          style={[
            styles.choiceCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: `${accentColor}25`,
              borderRadius: radii.md,
            },
          ]}
        >
          {/* Index badge */}
          <View
            style={[
              styles.indexBadge,
              {
                backgroundColor: `${accentColor}15`,
                borderRadius: radii.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.indexText,
                { color: accentColor, fontFamily: fonts.bodyBold },
              ]}
            >
              {index + 1}
            </Text>
          </View>

          <View style={styles.choiceBody}>
            <Text
              style={[
                styles.choiceTitle,
                { color: colors.t1, fontFamily: fonts.bodySemiBold },
              ]}
            >
              {choice.text}
            </Text>
            {choice.subtext ? (
              <Text
                style={[
                  styles.choiceSub,
                  { color: colors.t3, fontFamily: fonts.body },
                ]}
              >
                {choice.subtext}
              </Text>
            ) : null}

            {/* NPC Reaction Preview */}
            {npcReactionText && (
              <Text style={[styles.npcReaction, { color: colors.t3, fontFamily: fonts.body }]}>
                {npcReactionText}
              </Text>
            )}

            {chips.length > 0 && (
              <View style={styles.chips}>
                {chips.map((chip, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: chip.positive
                          ? `${colors.emerald}14`
                          : `${colors.health}12`,
                        borderColor: chip.positive
                          ? `${colors.emerald}28`
                          : `${colors.health}25`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: chip.positive
                            ? colors.emerald2
                            : colors.crimson2,
                          fontFamily: fonts.monoSemiBold,
                        },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </View>
                ))}
                {!revealed && (
                  <Text style={[styles.holdHint, { color: colors.t4, fontFamily: fonts.body }]}>
                    (Hold choice card to reveal)
                  </Text>
                )}
              </View>
            )}

            {showChance && <SuccessBar chance={choice.successChance!} />}
          </View>

          <ChevronRight color={accentColor} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Event Icon ───────────────────────────────────────────────────────────────
function EventIconBox({ color }: { color: string }) {
  return (
    <View style={[styles.iconOuter, { backgroundColor: `${color}12` }]}>
      <View style={[styles.iconInner, { backgroundColor: `${color}22` }]}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path
            fill={color}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </Svg>
      </View>
    </View>
  );
}

// ─── DecisionSheet ────────────────────────────────────────────────────────────
export default function DecisionSheet({
  event,
  onChoice,
  onClose,
}: DecisionSheetProps) {
  const { colors, fonts, spacing } = useTheme();
  const character = useGameStore((s) => s.character);
  const [displayEvent, setDisplayEvent] = useState<LifeEvent | null>(null);

  // Timer countdown states
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (event) {
      setDisplayEvent(event);
      if (event.timerSeconds) {
        setTimeLeft(event.timerSeconds);
      }
    }
  }, [event]);

  // Handle countdown logic
  useEffect(() => {
    if (!displayEvent || !displayEvent.timerSeconds || !event) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit choice
          const defaultId = displayEvent.defaultChoiceId || (displayEvent.choices && displayEvent.choices[0]?.id);
          if (defaultId) {
            hapticDecision();
            void playSound("decision_made");
            onChoice(defaultId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [displayEvent, event, onChoice]);

  if (!displayEvent) return null;

  const accentColor = displayEvent.color ?? colors.gold;
  const isTimerActive = event && displayEvent.timerSeconds && timeLeft > 0;

  return (
    <BottomSheet
      visible={!!event}
      onClose={onClose}
      onDismissed={() => setDisplayEvent(null)}
    >
      <EventIconBox color={accentColor} />

      <Text
        style={[
          styles.title,
          {
            color: colors.t1,
            fontFamily: fonts.displayBold,
            marginBottom: spacing.sm,
          },
        ]}
      >
        {displayEvent.title}
      </Text>
      <Text
        style={[
          styles.desc,
          {
            color: colors.t3,
            fontFamily: fonts.body,
            marginBottom: spacing.lg,
          },
        ]}
      >
        {displayEvent.description}
      </Text>

      {/* Decision Timer Indicator */}
      {isTimerActive && (
        <View style={styles.timerWrapper}>
          <Text style={[styles.timerText, { color: colors.crimson, fontFamily: fonts.monoSemiBold }]}>
            ⏳ Make your choice: {timeLeft}s
          </Text>
          <View style={[styles.timerTrack, { backgroundColor: colors.bg2 }]}>
            <View
              style={[
                styles.timerFill,
                {
                  backgroundColor: colors.crimson,
                  width: `${(timeLeft / displayEvent.timerSeconds!) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border, marginBottom: spacing.md },
        ]}
      />

      <Text
        style={[
          styles.chooseLabel,
          {
            color: colors.t4,
            fontFamily: fonts.bodySemiBold,
            marginBottom: spacing.md,
          },
        ]}
      >
        CHOOSE YOUR PATH
      </Text>

      <View style={[styles.choices, { gap: spacing.sm, paddingBottom: spacing.sm }]}>
        {(displayEvent.choices ?? []).map((choice, i) => (
          <ChoiceCard
            key={choice.id}
            choice={choice}
            index={i}
            accentColor={accentColor}
            character={character}
            onPress={() => {
              hapticDecision();
              void playSound("decision_made");
              onChoice(choice.id);
            }}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  iconOuter: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    lineHeight: 30,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  divider: {
    height: 1,
  },
  chooseLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  choices: {},
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
  },
  indexBadge: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  indexText: {
    fontSize: 14,
  },
  choiceBody: {
    flex: 1,
    gap: 2,
  },
  choiceTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  choiceSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  npcReaction: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 9,
    letterSpacing: 0.2,
  },
  holdHint: {
    fontSize: 9,
    marginLeft: 4,
  },
  timerWrapper: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 12,
  },
  timerTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRadius: 3,
  },
});
