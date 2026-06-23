import { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, Animated, StyleSheet,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { LifeEvent, EventChoice } from '../types';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

interface DecisionSheetProps {
  event: LifeEvent | null;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

function ChoiceArrow() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path stroke={COLORS.t4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        d="M9 18l6-6-6-6" />
    </Svg>
  );
}

function parseEffectChips(choice: EventChoice) {
  const chips: Array<{ label: string; positive: boolean }> = [];
  Object.entries(choice.statEffect).forEach(([key, val]) => {
    if (!val) return;
    const labels: Record<string, string> = {
      health: 'Health', happiness: 'Joy', intelligence: 'Mind',
      wealth: 'Wealth', fitness: 'Fit', looks: 'Looks',
      social: 'Social', ambition: 'Drive', karma: 'Karma',
    };
    const lbl = labels[key];
    if (!lbl) return;
    chips.push({ label: `${(val as number) > 0 ? '+' : ''}${val} ${lbl}`, positive: (val as number) > 0 });
  });
  return chips.slice(0, 3);
}

interface ChoiceCardProps {
  choice: EventChoice;
  onPress: () => void;
  index: number;
}

function ChoiceCard({ choice, onPress, index }: ChoiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const chips = parseEffectChips(choice);
  const showChips = chips.length > 0 || choice.successChance !== undefined;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 18, stiffness: 200 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }).start()}
        android_ripple={{ color: `${COLORS.gold}18` }}
        style={{ borderRadius: RADII.md, overflow: 'hidden' }}
      >
        <View style={styles.choiceCard}>
          <View style={styles.choiceNum}>
            <Text style={styles.choiceNumText}>{index + 1}</Text>
          </View>

          <View style={styles.choiceBody}>
            <Text style={styles.choiceTitle}>{choice.text}</Text>
            <Text style={styles.choiceSub}>{choice.subtext}</Text>

            {showChips && (
              <View style={styles.chips}>
                {chips.map((chip, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chip,
                      { backgroundColor: chip.positive ? `${COLORS.teal}18` : `${COLORS.crimson}18` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: chip.positive ? COLORS.teal : COLORS.crimson },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </View>
                ))}
                {choice.successChance !== undefined && (
                  <View style={[styles.chip, { backgroundColor: `${COLORS.gold}18` }]}>
                    <Text style={[styles.chipText, { color: COLORS.gold }]}>
                      {choice.successChance}% success
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <ChoiceArrow />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DecisionSheet({ event, onChoice, onClose }: DecisionSheetProps) {
  const [displayEvent, setDisplayEvent] = useState<LifeEvent | null>(null);

  useEffect(() => {
    if (event) setDisplayEvent(event);
  }, [event]);

  if (!displayEvent) return null;

  return (
    <BottomSheet
      visible={!!event}
      onClose={onClose}
      onDismissed={() => setDisplayEvent(null)}
    >
      <View style={[styles.eventIcon, { backgroundColor: `${displayEvent.color}18` }]}>
        <View style={[styles.eventIconInner, { backgroundColor: `${displayEvent.color}30` }]}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path stroke={displayEvent.color} strokeWidth={2} strokeLinecap="round"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </Svg>
        </View>
      </View>

      <Text style={styles.title}>{displayEvent.title}</Text>
      <Text style={styles.desc}>{displayEvent.description}</Text>

      <View style={styles.divider} />
      <Text style={styles.chooseLabel}>CHOOSE YOUR PATH</Text>

      <View style={styles.choices}>
        {(displayEvent.choices ?? []).map((choice, i) => (
          <ChoiceCard
            key={choice.id}
            choice={choice}
            index={i}
            onPress={() => onChoice(choice.id)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  eventIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  eventIconInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    color: COLORS.t2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
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
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.md,
  },
  choiceNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  choiceNumText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 13,
    color: COLORS.t3,
  },
  choiceBody: {
    flex: 1,
    gap: 3,
  },
  choiceTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.t1,
  },
  choiceSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '600',
  },
});
