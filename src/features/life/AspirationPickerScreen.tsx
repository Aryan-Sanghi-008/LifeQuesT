import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { ASPIRATIONS } from '@data/aspirations';
import type { AspirationId, RootStackParamList } from '@/types';
import { useGameStore } from '@store/gameStore';

export function AspirationPickerScreen() {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setAspirations = useGameStore(s => s.setAspirations);
  const [primary, setPrimary] = useState<AspirationId | null>(null);
  const [secondary, setSecondary] = useState<AspirationId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!primary || !secondary) {
      setError('Choose both a primary and secondary aspiration.');
      return;
    }
    const result = setAspirations(primary, secondary);
    if (!result.ok) {
      setError(result.message ?? 'Could not save aspirations.');
      return;
    }
    navigation.goBack();
  };

  const renderPick = (
    selected: AspirationId | null,
    onSelect: (id: AspirationId) => void,
    exclude?: AspirationId | null,
  ) => (
    <View style={styles.grid}>
      {ASPIRATIONS.filter(a => a.id !== exclude).map(a => {
        const active = selected === a.id;
        return (
          <Pressable
            key={a.id}
            accessibilityLabel={`Select ${a.label}`}
            onPress={() => onSelect(a.id)}
            style={[styles.card, active && styles.cardActive]}
          >
            <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{a.label}</Text>
            <Text style={styles.cardDesc}>{a.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Define Your Life Goals</Text>
        <Text style={styles.subtitle}>At 16, you choose what kind of life you want to build.</Text>

        <Text style={styles.section}>Primary Aspiration</Text>
        {renderPick(primary, setPrimary, secondary)}

        <Text style={styles.section}>Secondary Aspiration</Text>
        {renderPick(secondary, setSecondary, primary)}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          accessibilityLabel="Confirm aspirations"
          onPress={handleConfirm}
          style={[styles.confirm, (!primary || !secondary) && styles.confirmDisabled]}
        >
          <Text style={styles.confirmText}>Lock In Aspirations</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.t1 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.t3, marginTop: spacing.sm, marginBottom: spacing.lg },
  section: { fontFamily: fonts.bodyBold, color: colors.gold, marginBottom: spacing.sm, marginTop: spacing.md },
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
  cardTitleActive: { color: colors.gold },
  cardDesc: { fontFamily: fonts.body, color: colors.t3, fontSize: 12, marginTop: 4 },
  error: { fontFamily: fonts.body, color: colors.crimson, marginTop: spacing.md },
  confirm: {
    marginTop: spacing.xl,
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { fontFamily: fonts.bodyBold, color: colors.bg, fontSize: 16 },
});
