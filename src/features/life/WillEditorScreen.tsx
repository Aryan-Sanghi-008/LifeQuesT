import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card, GradientButton } from '../../components/index';
import { WillDetails, RootStackParamList } from '../../types';
import Svg, { Path } from 'react-native-svg';

const WILL_TYPES = [
  { id: 'equal', title: 'Equal Split', desc: 'Divide your money equally among your spouse and children.' },
  { id: 'spouse', title: 'Spouse Only', desc: 'Leave everything to your spouse (or children if single).' },
  { id: 'heir', title: 'Chosen Successor', desc: 'Pass all wealth directly to a single chosen heir.' },
  { id: 'charity', title: 'Charity Donation', desc: 'Donate 100% of your money to community charity.' },
] as const;

export function WillEditorScreen() {
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
                          <Path stroke={COLORS.teal} strokeWidth={2.5} strokeLinecap="round" d="M20 6L9 17l-5-5"/>
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
              colors={[COLORS.teal, COLORS.emerald]}
              style={{ width: '100%' }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, gap: SPACING.md },
  infoCard: { backgroundColor: `${COLORS.teal}08`, borderColor: `${COLORS.teal}25` },
  infoText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, lineHeight: 18 },
  sectionTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t4, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: SPACING.sm },
  typeCard: { padding: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.border },
  typeCardActive: { borderColor: COLORS.teal, backgroundColor: `${COLORS.teal}08` },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.t4, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.teal },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.teal },
  typeTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  typeTextActive: { color: COLORS.teal },
  typeDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 4, lineHeight: 16 },
  heirSection: { gap: SPACING.sm },
  noHeirText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, fontStyle: 'italic', paddingVertical: SPACING.sm },
  heirRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  heirRowActive: { borderColor: COLORS.teal, backgroundColor: `${COLORS.teal}08` },
  heirInfo: { gap: 2 },
  heirName: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1 },
  heirDesc: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4 },
  cta: { marginTop: SPACING.md },
});
export default WillEditorScreen;
