import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { ASPIRATIONS } from '@data/aspirations';
import type { AspirationId, RootStackParamList } from '@/types';
import { useGameStore } from '@store/gameStore';

export function AspirationPickerScreen() {
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  title: { fontFamily: FONTS.displayBold, fontSize: 24, color: COLORS.t1 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  section: { fontFamily: FONTS.bodyBold, color: COLORS.gold, marginBottom: SPACING.sm, marginTop: SPACING.md },
  grid: { gap: SPACING.sm },
  card: {
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    padding: SPACING.md,
  },
  cardActive: { borderColor: COLORS.gold, backgroundColor: `${COLORS.gold}12` },
  cardTitle: { fontFamily: FONTS.bodyBold, color: COLORS.t1, fontSize: 15 },
  cardTitleActive: { color: COLORS.gold },
  cardDesc: { fontFamily: FONTS.body, color: COLORS.t3, fontSize: 12, marginTop: 4 },
  error: { fontFamily: FONTS.body, color: COLORS.crimson, marginTop: SPACING.md },
  confirm: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { fontFamily: FONTS.bodyBold, color: COLORS.bg, fontSize: 16 },
});
