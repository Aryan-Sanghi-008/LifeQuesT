import { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, Animated, StyleSheet,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { LifeEvent, EventChoice } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import Svg, { Path } from 'react-native-svg';
import { hapticDecision, hapticButtonPress } from '../services/haptics';
import { playSound } from '../services/audio';

interface DecisionSheetProps {
  event: LifeEvent | null;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

// ─── Choice Arrow Icon ────────────────────────────────────────────────────────

function ChevronRight({ color = COLORS.t3 }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
    </Svg>
  );
}

// ─── Success Chance Bar ───────────────────────────────────────────────────────

function SuccessBar({ chance }: { chance: number }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(width, { toValue: chance, useNativeDriver: false, damping: 20, stiffness: 180 } as any).start();
  }, [chance]);
  const widthPct = width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  const color = chance >= 70 ? COLORS.emerald : chance >= 50 ? COLORS.gold : COLORS.health;

  return (
    <View style={sb.wrap}>
      <View style={sb.track}>
        <Animated.View style={[sb.fill, { width: widthPct, backgroundColor: color }]} />
      </View>
      <Text style={[sb.label, { color }]}>{chance}% chance</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  track: { flex: 1, height: 4, backgroundColor: COLORS.bg2, borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 2 },
  label: { fontFamily: FONTS.monoSemiBold, fontSize: 10, minWidth: 64, textAlign: 'right' },
});

// ─── Parse stat chips ─────────────────────────────────────────────────────────

const STAT_LABELS: Record<string, string> = {
  health: 'HP', happiness: 'Joy', intelligence: 'Mind',
  wealth: 'Wealth', fitness: 'Fit', looks: 'Looks',
  social: 'Social', ambition: 'Drive', karma: 'Karma',
};

function parseEffectChips(choice: EventChoice) {
  const chips: Array<{ label: string; positive: boolean }> = [];
  Object.entries(choice.statEffect).forEach(([key, val]) => {
    if (!val) return;
    const lbl = STAT_LABELS[key];
    if (!lbl) return;
    chips.push({ label: `${(val as number) > 0 ? '+' : ''}${val} ${lbl}`, positive: (val as number) > 0 });
  });
  return chips.slice(0, 3);
}

// ─── Choice Card ─────────────────────────────────────────────────────────────

interface ChoiceCardProps {
  choice: EventChoice;
  onPress: () => void;
  index: number;
  accentColor: string;
}

function ChoiceCard({ choice, onPress, index, accentColor }: ChoiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const chips = parseEffectChips(choice);
  const showChance = choice.successChance !== undefined;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={choice.text}
        onPressIn={() => {
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 18, stiffness: 220 }).start();
          hapticButtonPress();
        }}
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }).start()
        }
        android_ripple={{ color: `${accentColor}15` }}
        style={{ borderRadius: RADII.md, overflow: 'hidden' }}
      >
        <View style={[styles.choiceCard, { borderColor: `${accentColor}25` }]}>
          {/* Index badge */}
          <View style={[styles.indexBadge, { backgroundColor: `${accentColor}15` }]}>
            <Text style={[styles.indexText, { color: accentColor }]}>{index + 1}</Text>
          </View>

          <View style={styles.choiceBody}>
            <Text style={styles.choiceTitle}>{choice.text}</Text>
            {choice.subtext ? (
              <Text style={styles.choiceSub}>{choice.subtext}</Text>
            ) : null}

            {chips.length > 0 && (
              <View style={styles.chips}>
                {chips.map((chip, i) => (
                  <View
                    key={i}
                    style={[styles.chip, {
                      backgroundColor: chip.positive ? `${COLORS.emerald}14` : `${COLORS.health}12`,
                      borderColor: chip.positive ? `${COLORS.emerald}28` : `${COLORS.health}25`,
                    }]}
                  >
                    <Text style={[styles.chipText, { color: chip.positive ? COLORS.emerald2 : COLORS.crimson2 }]}>
                      {chip.label}
                    </Text>
                  </View>
                ))}
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
          <Path fill={color} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </Svg>
      </View>
    </View>
  );
}

// ─── DecisionSheet ────────────────────────────────────────────────────────────

export default function DecisionSheet({ event, onChoice, onClose }: DecisionSheetProps) {
  const [displayEvent, setDisplayEvent] = useState<LifeEvent | null>(null);

  useEffect(() => {
    if (event) setDisplayEvent(event);
  }, [event]);

  if (!displayEvent) return null;

  const accentColor = displayEvent.color ?? COLORS.gold;

  return (
    <BottomSheet visible={!!event} onClose={onClose} onDismissed={() => setDisplayEvent(null)}>
      <EventIconBox color={accentColor} />

      <Text style={styles.title}>{displayEvent.title}</Text>
      <Text style={styles.desc}>{displayEvent.description}</Text>

      <View style={[styles.divider, { backgroundColor: COLORS.border }]} />

      <Text style={styles.chooseLabel}>CHOOSE YOUR PATH</Text>

      <View style={styles.choices}>
        {(displayEvent.choices ?? []).map((choice, i) => (
          <ChoiceCard
            key={choice.id}
            choice={choice}
            index={i}
            accentColor={accentColor}
            onPress={() => {
              hapticDecision();
              void playSound('decision_made');
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
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.t1,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: SPACING.sm,
  },
  desc: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.t3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    marginBottom: SPACING.md,
  },
  chooseLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  choices: {
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    padding: SPACING.md,
  },
  indexBadge: {
    width: 30,
    height: 30,
    borderRadius: RADII.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indexText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  choiceBody: {
    flex: 1,
    gap: 2,
  },
  choiceTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.t1,
    lineHeight: 20,
  },
  choiceSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    lineHeight: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontFamily: FONTS.monoSemiBold,
    fontSize: 9,
    letterSpacing: 0.2,
  },
});
