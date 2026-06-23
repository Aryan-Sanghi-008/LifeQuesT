import { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LifeEventRecord, EventCategory } from '../types';
import { COLORS, FONTS, SPACING, RADII } from '../constants/theme';
import Svg, { Path, Circle } from 'react-native-svg';

interface EventCardProps {
  event: LifeEventRecord;
  isNew?: boolean;
}

function CategoryIcon({ category, color }: { category: EventCategory; color: string }) {
  const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' };
  switch (category) {
    case 'health':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </Svg>
      );
    case 'education':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </Svg>
      );
    case 'career':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </Svg>
      );
    case 'relationship':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <Circle stroke={color} strokeWidth={2} cx="9" cy="7" r="4" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
        </Svg>
      );
    case 'financial':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </Svg>
      );
    case 'family':
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
        </Svg>
      );
    default:
      return (
        <Svg {...iconProps}>
          <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </Svg>
      );
  }
}

export default function EventCard({ event, isNew = false }: EventCardProps) {
  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isNew ? 20 : 0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [isNew, opacity, translateY]);

  // Parse stat effects for mini-chips
  const chips: Array<{ label: string; positive: boolean }> = [];
  Object.entries(event.statEffect).forEach(([key, val]) => {
    if (!val || key === 'karma') return;
    const labels: Record<string, string> = {
      health: 'HP', happiness: 'Joy', intelligence: 'Mind',
      wealth: 'Gold', fitness: 'Fit', looks: 'Looks',
      social: 'Social', ambition: 'Drive',
    };
    const lbl = labels[key];
    if (!lbl) return;
    chips.push({
      label: `${(val as number) > 0 ? '+' : ''}${val} ${lbl}`,
      positive: (val as number) > 0,
    });
  });

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: event.color }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: `${event.color}18` }]}>
        <CategoryIcon category={event.category} color={event.color} />
      </View>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Text style={[styles.age, { color: event.color }]}>Age {event.age}</Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>{event.description}</Text>

        {event.choiceMade && (
          <Text style={styles.choice}>
            <Text style={{ color: COLORS.gold }}>→ </Text>
            {event.choiceMade}
          </Text>
        )}

        {chips.length > 0 && (
          <View style={styles.chips}>
            {chips.slice(0, 3).map((chip, i) => (
              <View
                key={i}
                style={[styles.chip, { backgroundColor: chip.positive ? `${COLORS.teal}15` : `${COLORS.crimson}15` }]}
              >
                <Text style={[styles.chipText, { color: chip.positive ? COLORS.teal : COLORS.crimson }]}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard2,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginVertical: 4,
    alignItems: 'stretch',
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: RADII.md,
    borderBottomLeftRadius: RADII.md,
  },
  iconWrap: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    marginVertical: SPACING.md,
    borderRadius: RADII.xs,
    height: 38,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  body: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.t1,
    flex: 1,
  },
  age: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  desc: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    lineHeight: 17,
  },
  choice: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.t2,
    fontStyle: 'italic',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  chipText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});