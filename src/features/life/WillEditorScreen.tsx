import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '@components/ScreenHeader';
import { Card, GradientButton } from '@components/index';
import { WillDetails, RootStackParamList } from '../../types';
import Svg, { Path } from 'react-native-svg';

const WILL_TYPES = [
  { id: 'equal', title: 'Equal Split', desc: 'Divide your money equally among your spouse and children.' },
  { id: 'spouse', title: 'Spouse Only', desc: 'Leave everything to your spouse (or children if single).' },
  { id: 'heir', title: 'Chosen Successor', desc: 'Pass all wealth directly to a single chosen heir.' },
  { id: 'charity', title: 'Charity Donation', desc: 'Donate 100% of your money to community charity.' },
] as const;

export function WillEditorScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const setWill = useGameStore(s => s.setWill);

  const [willType, setWillType] = useState<WillDetails['type']>(character?.will?.type ?? 'equal');
  const [heirId, setHeirId] = useState<string | undefined>(character?.will?.targetHeirId);

  if (!character) return null;

  const heirs = character.people.filter(
    p => (p.relationType === 'child' || p.relationType === 'sibling') && p.isAlive
  );

  const handleSave = () => {
    if (willType === 'heir' && !heirId) {
      Alert.alert('Selection Required', 'Please select a chosen heir to receive the inheritance.');
      return;
    }

    const payload: WillDetails = {
      type: willType,
      targetHeirId: willType === 'heir' ? heirId : undefined,
    };

    const res = setWill(payload);
    if (res.ok) {
      Alert.alert('Last Will Updated', 'Your will details have been securely recorded.');
      navigation.goBack();
    } else {
      Alert.alert('Error', res.message ?? 'Failed to update will.');
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Last Will & Testament" subtitle="Define your inheritance legacy" />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>
              Your current will will execute immediately upon your passing. Make sure your family and assets are protected.
            </Text>
          </Card>

          <Text style={styles.sectionTitle}>Select Distribution Type</Text>

          {WILL_TYPES.map(t => {
            const active = willType === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setWillType(t.id)}
                style={[styles.typeCard, active && styles.typeCardActive]}
              >
                <View style={styles.row}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeTitle, active && styles.typeTextActive]}>{t.title}</Text>
                    <Text style={styles.typeDesc}>{t.desc}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {willType === 'heir' && (
            <View style={styles.heirSection}>
              <Text style={styles.sectionTitle}>Select Chosen Successor</Text>
              {heirs.length === 0 ? (
                <Text style={styles.noHeirText}>No living children or siblings found to designate as heir.</Text>
              ) : (
                heirs.map(h => {
                  const active = heirId === h.id;
                  return (
                    <Pressable
                      key={h.id}
                      onPress={() => setHeirId(h.id)}
                      style={[styles.heirRow, active && styles.heirRowActive]}
                    >
                      <View style={styles.heirInfo}>
                        <Text style={styles.heirName}>{h.name}</Text>
                        <Text style={styles.heirDesc}>
                          {h.relationType.toUpperCase()} · Age {h.age}
                        </Text>
                      </View>
                      {active && (
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                          <Path stroke={colors.teal} strokeWidth={2.5} strokeLinecap="round" d="M20 6L9 17l-5-5"/>
                        </Svg>
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          <View style={styles.cta}>
            <GradientButton
              label="Save Will & Testament"
              onPress={handleSave}
              colors={[colors.teal, colors.emerald]}
              style={{ width: '100%' }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },
  infoCard: { backgroundColor: `${colors.teal}08`, borderColor: `${colors.teal}25` },
  infoText: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, lineHeight: 18 },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t4, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: spacing.sm },
  typeCard: { padding: spacing.md, backgroundColor: colors.bgCard, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border },
  typeCardActive: { borderColor: colors.teal, backgroundColor: `${colors.teal}08` },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.t4, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.teal },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  typeTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
  typeTextActive: { color: colors.teal },
  typeDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.t3, marginTop: 4, lineHeight: 16 },
  heirSection: { gap: spacing.sm },
  noHeirText: { fontFamily: fonts.body, fontSize: 12, color: colors.t4, fontStyle: 'italic', paddingVertical: spacing.sm },
  heirRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.bgCard, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  heirRowActive: { borderColor: colors.teal, backgroundColor: `${colors.teal}08` },
  heirInfo: { gap: 2 },
  heirName: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t1 },
  heirDesc: { fontFamily: fonts.body, fontSize: 11, color: colors.t4 },
  cta: { marginTop: spacing.md },
});
export default WillEditorScreen;
