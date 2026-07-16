import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import type { RootStackParamList } from '@/types';
import { useGameStore } from '@store/gameStore';
import { getEnrollableDegrees } from '@engine/educationEngine';
import { formatCurrency } from '@utils/currency';

export function CollegeMajorPickerScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  const chooseCollegeMajor = useGameStore((s) => s.chooseCollegeMajor);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!character) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>No character</Text>
      </SafeAreaView>
    );
  }

  const programs = getEnrollableDegrees(character).filter(
    (d) => d.stage === 'diploma' || d.stage === 'undergraduate',
  );

  const handleConfirm = () => {
    if (!selected) {
      setError('Pick a program, or skip college.');
      return;
    }
    const result = chooseCollegeMajor(selected);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigation.goBack();
  };

  const handleSkip = () => {
    const result = chooseCollegeMajor('skip');
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose Your Major</Text>
        <Text style={styles.subtitle}>
          You finished high school. Enroll in a college or diploma program — or skip and stay a high-school graduate.
          Programs are ordered for {character.countryCode ?? 'your country'}.
        </Text>

        <View style={styles.grid}>
          {programs.map((d) => {
            const active = selected === d.id;
            return (
              <Pressable
                key={d.id}
                accessibilityLabel={`Select ${d.label}`}
                onPress={() => setSelected(d.id)}
                style={[styles.card, active && styles.cardActive]}
              >
                <Text style={[styles.cardTitle, active && { color: colors.gold }]}>
                  {d.shortLabel}
                </Text>
                <Text style={styles.cardDesc}>{d.label}</Text>
                <Text style={styles.cardMeta}>
                  {d.branch} · {d.durationYears}yr · {formatCurrency(d.baseAnnualCost, character.countryCode)}/yr
                </Text>
              </Pressable>
            );
          })}
        </View>

        {programs.length === 0 && (
          <Text style={styles.subtitle}>
            No programs available yet (check GPA or scenario rules). You can skip for now.
          </Text>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          accessibilityLabel="Enroll in selected major"
          onPress={handleConfirm}
          style={[styles.confirm, !selected && styles.confirmDisabled]}
        >
          <Text style={styles.confirmText}>Enroll</Text>
        </Pressable>

        <Pressable accessibilityLabel="Skip college" onPress={handleSkip} style={styles.skip}>
          <Text style={styles.skipText}>Skip college for now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.t1 },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.t3,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    grid: { gap: spacing.sm },
    card: {
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgCard,
      padding: spacing.md,
    },
    cardActive: { borderColor: colors.gold, backgroundColor: `${colors.gold}12` },
    cardTitle: { fontFamily: fonts.bodyBold, color: colors.t1, fontSize: 15 },
    cardDesc: { fontFamily: fonts.body, color: colors.t3, fontSize: 12, marginTop: 4 },
    cardMeta: { fontFamily: fonts.mono, color: colors.t4, fontSize: 11, marginTop: 6 },
    error: { fontFamily: fonts.body, color: colors.crimson, marginTop: spacing.md },
    confirm: {
      marginTop: spacing.xl,
      backgroundColor: colors.gold,
      borderRadius: radii.md,
      paddingVertical: 11,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
    },
    confirmDisabled: { opacity: 0.45 },
    confirmText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },
    skip: { marginTop: spacing.md, alignItems: 'center', paddingVertical: 12 },
    skipText: { fontFamily: fonts.bodySemiBold, color: colors.t3, fontSize: 14 },
  });
