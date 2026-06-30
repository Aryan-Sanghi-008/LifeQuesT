import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { Asset, PropertyTier, RootStackParamList } from '../../types';
import { Card, SectionLabel, ScreenShell, TabScreenHeader, CurrencyChip } from '@components/index';
import { formatCurrency } from '@utils/currency';
import { getFinanceSummary } from '@utils/financeSummary';
import { getPropertiesByTier } from '../../data/properties';
import { EMPLOYEE_ROLES } from '../../engine/businessEngine';

const TIER_LABELS: Record<PropertyTier, string> = {
  shelter: 'Shelter',
  basic: 'Basic',
  mid: 'Mid',
  upper: 'Upper',
  luxury: 'Luxury',
};

function BalanceHero() {
  const { colors, fonts } = useTheme();
  const character = useGameStore(s => s.character)!;
  const finance = getFinanceSummary(character);
  const cc = character.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);

  return (
    <LinearGradient colors={[colors.bg2, colors.bg]} style={styles.hero}>
      <Text style={[styles.heroLabel, { color: colors.t4, fontFamily: fonts.body }]}>Bank Balance</Text>
      <Text style={[styles.heroValue, { color: colors.teal, fontFamily: fonts.displayBold }]}>{fmt(finance.bank)}</Text>
      <View style={styles.heroRow}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.t4, fontFamily: fonts.body }]}>Net Worth</Text>
          <Text style={[styles.metricValue, { color: finance.netWorth >= 0 ? colors.emerald : colors.crimson, fontFamily: fonts.monoSemiBold }]}>{fmt(finance.netWorth)}</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.t4, fontFamily: fonts.body }]}>Monthly Burn</Text>
          <Text style={[styles.metricValue, { color: colors.crimson, fontFamily: fonts.monoSemiBold }]}>{fmt(finance.monthlyHousingBurn)}</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.t4, fontFamily: fonts.body }]}>Credit Score</Text>
          <Text style={[styles.metricValue, { color: (character.creditScore ?? 650) >= 700 ? colors.emerald : colors.gold, fontFamily: fonts.monoSemiBold }]}>{character.creditScore ?? 650}</Text>
        </View>
      </View>
      <Text style={[styles.heroHint, { color: colors.t4, fontFamily: fonts.body }]}>Assets, property market, and business tools in one place.</Text>
      <View style={styles.currencyRow}>
        <CurrencyChip type="coin" amount={character.coins} />
        <CurrencyChip type="gem" amount={character.gems} />
      </View>
    </LinearGradient>
  );
}

function AssetCard({ asset, onSell }: { asset: Asset; onSell: () => void }) {
  const { colors, fonts } = useTheme();
  const cc = useGameStore.getState().character?.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const equity = asset.value - (asset.debt ?? 0);

  return (
    <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard, borderRadius: 16 }]}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{asset.name}</Text>
          <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>Purchased at age {asset.purchasedAge} · {asset.type}</Text>
        </View>
        <Pressable onPress={onSell} style={[styles.chip, { borderColor: colors.crimson }]}>
          <Text style={[styles.chipText, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Sell</Text>
        </Pressable>
      </View>
      <View style={styles.rowBetween}>
        <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body }]}>Value {fmt(asset.value)}</Text>
        <Text style={[styles.meta, { color: equity >= 0 ? colors.emerald : colors.crimson, fontFamily: fonts.bodySemiBold }]}>Equity {fmt(equity)}</Text>
      </View>
    </Card>
  );
}

function BusinessCard({ businessId }: { businessId: string }) {
  const { colors, fonts, spacing } = useTheme();
  const character = useGameStore(s => s.character)!;
  const hireEmployee = useGameStore(s => s.hireEmployee);
  const fireEmployee = useGameStore(s => s.fireEmployee);
  const businesses = character.businesses ?? [];
  const business = businesses.find(b => b.id === businessId);
  if (!business) return null;

  return (
    <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard, borderRadius: 16 }]}>
      <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{business.name}</Text>
      <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>Valuation {formatCurrency(business.valuation, character.countryCode ?? 'IN')} · Payroll {formatCurrency(business.payrollMonthly ?? 0, character.countryCode ?? 'IN')}/mo</Text>

      <View style={{ gap: 6, marginTop: spacing.sm }}>
        {business.employees.map(emp => (
          <View key={emp.id} style={styles.rowBetween}>
            <Text style={[styles.meta, { color: colors.t2, fontFamily: fonts.body }]}>{emp.name} · {emp.role}</Text>
            {emp.role === 'CEO' ? (
              <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body }]}>Founder</Text>
            ) : (
              <Pressable onPress={() => fireEmployee(business.id, emp.id)}>
                <Text style={[styles.meta, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Fire</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => {
          Alert.alert('Hire Employee', 'Select a role', [
            { text: 'Cancel', style: 'cancel' },
            ...EMPLOYEE_ROLES.map(role => ({ text: role, onPress: () => hireEmployee(business.id, role) })),
          ]);
        }}
        style={[styles.actionBtn, { borderColor: colors.teal, backgroundColor: `${colors.teal}12` }]}
      >
        <Text style={[styles.actionText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>+ Hire Employee</Text>
      </Pressable>
    </Card>
  );
}

export function AssetsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const sellAsset = useGameStore(s => s.sellAsset);
  const purchaseAsset = useGameStore(s => s.purchaseAsset);
  const [tab, setTab] = useState<'owned' | 'properties' | 'business'>('owned');

  if (!character) return null;

  const cc = character.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const finance = getFinanceSummary(character);
  const propertyGroups: PropertyTier[] = ['shelter', 'basic', 'mid', 'upper', 'luxury'];

  const buyAsset = (asset: { type: 'vehicle' | 'investment'; name: string; value: number; debt?: number }) => {
    const ok = purchaseAsset(asset);
    Alert.alert(ok ? 'Purchased' : 'Could not purchase', ok ? `${asset.name} added to your assets.` : 'Check your balance and try again.');
  };

  return (
    <ScreenShell>
      <TabScreenHeader
        title="Assets & Finance"
        subtitle={`Net worth ${fmt(finance.netWorth)}`}
        accent={colors.catFinancial}
      />

        <View style={[styles.tabs, { borderBottomColor: colors.border, backgroundColor: colors.bgCard }]}>
          {(['owned', 'properties', 'business'] as const).map(t => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { borderBottomColor: colors.teal }]}>
              <Text style={[styles.tabText, { color: tab === t ? colors.teal : colors.t4, fontFamily: tab === t ? fonts.bodyBold : fonts.body }]}>
                {t === 'owned' ? 'Owned' : t === 'properties' ? 'Properties' : 'Business'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'owned' && (
            <>
              <BalanceHero />
              <SectionLabel label="Your Portfolio" />
              {character.assets.length === 0 ? (
                <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <Text style={{ color: colors.t4, fontFamily: fonts.body }}>You do not own any assets yet.</Text>
                </Card>
              ) : (
                character.assets.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onSell={() => {
                      Alert.alert('Sell Asset?', `Sell ${asset.name}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Sell', style: 'destructive', onPress: () => sellAsset(asset.id) },
                      ]);
                    }}
                  />
                ))
              )}
            </>
          )}

          {tab === 'properties' && (
            <>
              <BalanceHero />
              {propertyGroups.map(tier => {
                const entries = getPropertiesByTier(tier).slice(0, 4);
                if (entries.length === 0) return null;
                return (
                  <View key={tier} style={{ gap: 8, marginBottom: spacing.lg }}>
                    <SectionLabel label={TIER_LABELS[tier]} />
                    {entries.map(prop => {
                      const downPayment = Math.round(prop.value * prop.downPaymentPct);
                      const canAfford = character.bankBalance >= downPayment;
                      return (
                        <Card key={prop.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                          <View style={styles.rowBetween}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{prop.name}</Text>
                              <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>{tier.toUpperCase()} · Down {fmt(downPayment)}</Text>
                            </View>
                            <Text style={[styles.meta, { color: colors.teal, fontFamily: fonts.monoSemiBold }]}>{fmt(prop.value)}</Text>
                          </View>
                          <View style={styles.rowBetween}>
                            <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body }]}>Maintenance {(prop.maintenancePct * 100).toFixed(1)}%</Text>
                            <Pressable
                              disabled={!canAfford}
                              onPress={() => navigation.navigate('Mortgage', { propertyDefId: prop.id })}
                              style={[styles.chip, { borderColor: canAfford ? colors.teal : colors.t4, backgroundColor: canAfford ? `${colors.teal}12` : 'transparent' }]}
                            >
                              <Text style={[styles.chipText, { color: canAfford ? colors.teal : colors.t4, fontFamily: fonts.bodySemiBold }]}>View</Text>
                            </Pressable>
                          </View>
                        </Card>
                      );
                    })}
                  </View>
                );
              })}
            </>
          )}

          {tab === 'business' && (
            <>
              <BalanceHero />
              <SectionLabel label="Your Businesses" />
              {(character.businesses ?? []).length === 0 ? (
                <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No businesses yet.</Text>
                </Card>
              ) : (
                (character.businesses ?? []).map(biz => (
                  <BusinessCard key={biz.id} businessId={biz.id} />
                ))
              )}
            </>
          )}

          <SectionLabel label="Quick Buy" />
          <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, marginBottom: 8 }}>Vehicles and investments for quick upgrades.</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Pressable onPress={() => buyAsset({ type: 'vehicle', name: 'Hatchback Car', value: 600000, debt: 400000 })} style={[styles.chip, { borderColor: colors.teal }]}>
                <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>Hatchback</Text>
              </Pressable>
              <Pressable onPress={() => buyAsset({ type: 'vehicle', name: 'SUV', value: 1500000, debt: 1000000 })} style={[styles.chip, { borderColor: colors.teal }]}>
                <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>SUV</Text>
              </Pressable>
              <Pressable onPress={() => buyAsset({ type: 'investment', name: 'Stock Portfolio', value: 50000, debt: 0 })} style={[styles.chip, { borderColor: colors.emerald }]}>
                <Text style={[styles.chipText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>Stocks</Text>
              </Pressable>
              <Pressable onPress={() => buyAsset({ type: 'investment', name: 'Mutual Fund', value: 25000, debt: 0 })} style={[styles.chip, { borderColor: colors.emerald }]}>
                <Text style={[styles.chipText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>Mutual Fund</Text>
              </Pressable>
            </View>
          </Card>
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13 },
  scroll: { padding: 20, gap: 16 },
  hero: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'transparent', alignItems: 'center', gap: 8 },
  heroLabel: { fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  heroValue: { fontSize: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8, marginTop: 4 },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 10, marginBottom: 2 },
  metricValue: { fontSize: 13 },
  metricDivider: { width: 1, height: 24 },
  heroHint: { fontSize: 11, marginTop: 4 },
  currencyRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  card: { borderWidth: 1, padding: 16, gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 14 },
  sub: { fontSize: 11, marginTop: 2 },
  meta: { fontSize: 11 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 12 },
  chipText: { fontSize: 12 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  actionText: { fontSize: 12 },
});
