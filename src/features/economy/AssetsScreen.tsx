import { useMemo, useState, type ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@theme';
import { useGameStore } from '../../store/gameStore';
import { Asset, PropertyTier, RootStackParamList } from '../../types';
import { Card, SectionLabel, ScreenShell, TabScreenHeader, CurrencyChip } from '@components/index';
import { ContextualTutorial } from '@shared/components/ContextualTutorial';
import { formatCurrency } from '@utils/currency';
import { getFinanceSummary } from '@utils/financeSummary';
import { getPropertiesByTier } from '../../data/properties';
import { VEHICLES } from '../../data/vehicles';
import { COLLECTIBLES } from '../../data/collectibles';
import { FRANCHISES } from '../../data/franchises';
import { INSURANCE_PRODUCTS } from '../../data/insurancePolicies';
import {
  MARKET_INSTRUMENTS,
  getInstrumentById,
  type InstrumentKind,
} from '../../data/marketInstruments';
import {
  createVehicleAsset,
  scaleVehiclePrice,
} from '../../engine/assetCatalogEngine';
import { scalePropertyValue, scaleCountryAmount } from '../../engine/countryScaleEngine';
import {
  getMinInvestment,
  getMaxInvestableAmount,
  validateInvestmentAmount,
} from '../../engine/economyEngine';
import { getFinancedPurchaseTerms } from '../../engine/financingEngine';
import { marginUnlocked } from '../../engine/creditScoreEngine';
import { canFoundFranchise, hasFranchiseSoftBoost, EMPLOYEE_ROLES } from '../../engine/businessEngine';
import { portfolioAllocation, performanceSeries } from '../../engine/marketEngine';
import { InvestAmountModal } from './InvestAmountModal';

type MainTab = 'overview' | 'market' | 'property' | 'business' | 'portfolio';
type MarketChip = InstrumentKind | 'angel' | 'collectible' | 'insurance' | 'vehicle';

const TIER_LABELS: Record<PropertyTier, string> = {
  shelter: 'Shelter',
  basic: 'Basic',
  mid: 'Mid',
  upper: 'Upper',
  luxury: 'Luxury',
};

const MARKET_CHIPS: { id: MarketChip; label: string }[] = [
  { id: 'stock', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'mutual_fund', label: 'Funds' },
  { id: 'bond', label: 'Bonds' },
  { id: 'commodity', label: 'Commodities' },
  { id: 'reit', label: 'REITs' },
  { id: 'venture', label: 'Venture' },
  { id: 'angel', label: 'Angel' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'vehicle', label: 'Vehicles' },
];

function BalanceHero() {
  const { colors, fonts } = useTheme();
  const character = useGameStore((s) => s.character)!;
  const finance = getFinanceSummary(character);
  const cc = character.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const score = character.creditScore ?? 650;

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
          <Text style={[styles.metricLabel, { color: colors.t4, fontFamily: fonts.body }]}>Debt</Text>
          <Text style={[styles.metricValue, { color: colors.crimson, fontFamily: fonts.monoSemiBold }]}>{fmt(character.debt ?? 0)}</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.t4, fontFamily: fonts.body }]}>Credit</Text>
          <Text style={[styles.metricValue, { color: score >= 700 ? colors.emerald : colors.gold, fontFamily: fonts.monoSemiBold }]}>{score}</Text>
        </View>
      </View>
      <Text style={[styles.heroHint, { color: colors.t4, fontFamily: fonts.body }]}>
        Investments are cash-only (margin at 750+). Loans ≤ 50% of cash and ≤ 50% of price.
      </Text>
      <View style={styles.currencyRow}>
        <CurrencyChip type="coin" amount={character.coins} />
        <CurrencyChip type="gem" amount={character.gems} />
      </View>
    </LinearGradient>
  );
}

function CreditFactorsCard() {
  const { colors, fonts } = useTheme();
  const character = useGameStore((s) => s.character)!;
  const f = character.creditFactors;
  if (!f) {
    return (
      <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
        <Text style={{ color: colors.t3, fontFamily: fonts.body }}>
          Credit factors update each Age Up (payment history, utilization, mix, inquiries).
        </Text>
      </Card>
    );
  }
  const rows: [string, number][] = [
    ['Payment history', f.paymentHistory],
    ['Utilization', f.utilization],
    ['History length', f.historyLength],
    ['Credit mix', f.creditMix],
    ['Recent inquiries', f.recentInquiries],
  ];
  return (
    <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
      <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>Credit factors</Text>
      {rows.map(([label, val]) => (
        <View key={label} style={styles.rowBetween}>
          <Text style={[styles.meta, { color: colors.t3, fontFamily: fonts.body }]}>{label}</Text>
          <Text style={[styles.meta, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>{val}</Text>
        </View>
      ))}
      {marginUnlocked(character.creditScore) ? (
        <Text style={[styles.meta, { color: colors.emerald, fontFamily: fonts.body, marginTop: 6 }]}>
          Margin investing unlocked (capped).
        </Text>
      ) : (
        <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body, marginTop: 6 }]}>
          Reach 750 credit to unlock limited margin.
        </Text>
      )}
    </Card>
  );
}

function AssetCard({
  asset,
  onSell,
  extra,
}: {
  asset: Asset;
  onSell: () => void;
  extra?: ReactNode;
}) {
  const { colors, fonts } = useTheme();
  const cc = useGameStore.getState().character?.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const equity = asset.value - (asset.debt ?? 0);
  const inst = asset.catalogId ? getInstrumentById(asset.catalogId) : undefined;

  return (
    <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard, borderRadius: 16 }]}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{asset.name}</Text>
          <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
            Age {asset.purchasedAge} · {asset.type}
            {asset.occupancy ? ` · ${asset.occupancy}` : ''}
            {asset.renovationLevel ? ` · reno L${asset.renovationLevel}` : ''}
          </Text>
          {inst ? (
            <Text style={[styles.meta, { color: colors.t3, fontFamily: fonts.body, marginTop: 4 }]}>
              ~{(inst.annualReturnBase * 100).toFixed(0)}% target · {(inst.volatility * 100).toFixed(0)}% vol
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onSell} style={[styles.chip, { borderColor: colors.crimson }]}>
          <Text style={[styles.chipText, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Sell</Text>
        </Pressable>
      </View>
      <View style={styles.rowBetween}>
        <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body }]}>Value {fmt(asset.value)}</Text>
        <Text style={[styles.meta, { color: equity >= 0 ? colors.emerald : colors.crimson, fontFamily: fonts.bodySemiBold }]}>
          Equity {fmt(equity)}
        </Text>
      </View>
      {extra}
    </Card>
  );
}

export function AssetsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  const sellAsset = useGameStore((s) => s.sellAsset);
  const purchaseAsset = useGameStore((s) => s.purchaseAsset);
  const purchaseProperty = useGameStore((s) => s.purchaseProperty);
  const purchaseCollectible = useGameStore((s) => s.purchaseCollectible);
  const purchaseInsurance = useGameStore((s) => s.purchaseInsurance);
  const investInStocks = useGameStore((s) => s.investInStocks);
  const investAngel = useGameStore((s) => s.investAngel);
  const refreshAngelDeals = useGameStore((s) => s.refreshAngelDeals);
  const foundFranchise = useGameStore((s) => s.foundFranchise);
  const sellBusiness = useGameStore((s) => s.sellBusiness);
  const hireEmployee = useGameStore((s) => s.hireEmployee);
  const fireEmployee = useGameStore((s) => s.fireEmployee);
  const renovateProperty = useGameStore((s) => s.renovateProperty);
  const setPropertyMode = useGameStore((s) => s.setPropertyMode);

  const [tab, setTab] = useState<MainTab>('overview');
  const [marketChip, setMarketChip] = useState<MarketChip>('stock');
  const [investTarget, setInvestTarget] = useState<{ catalogId: string; useMargin?: boolean } | null>(null);
  const [useMargin, setUseMargin] = useState(false);

  const chartWidth = Dimensions.get('window').width - 64;

  const allocation = useMemo(
    () => portfolioAllocation(character?.assets ?? []),
    [character?.assets],
  );
  const perf = useMemo(
    () => performanceSeries(character?.assets ?? []),
    [character?.assets],
  );

  if (!character) return null;

  const cc = character.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const finance = getFinanceSummary(character);
  const minInvest = getMinInvestment(cc);
  const maxInvest = getMaxInvestableAmount(character, {
    useMargin: useMargin && marginUnlocked(character.creditScore),
  });
  const softBoost = hasFranchiseSoftBoost(character);

  const pieData = allocation.map((a, i) => ({
    value: a.value,
    text: `${a.pct}%`,
    color: [colors.teal, colors.emerald, colors.gold, colors.orchid, colors.sapphire, colors.crimson][i % 6],
  }));

  const lineData = perf.map((p) => ({ value: p.value, label: `${p.age}` }));

  const confirmInvest = (amount: number) => {
    const validation = validateInvestmentAmount(amount, cc);
    if (!validation.ok) {
      Alert.alert('Invalid amount', validation.message);
      return;
    }
    if (!investTarget) return;
    const result = investInStocks(amount, {
      catalogId: investTarget.catalogId,
      useMargin: useMargin && marginUnlocked(character.creditScore),
    });
    Alert.alert(result.ok ? 'Invested' : 'Could not invest', result.message);
    setInvestTarget(null);
  };

  const buyVehicle = (vehicleId: string) => {
    const data = createVehicleAsset(vehicleId, character.age, cc);
    if (!data) return;
    const terms = getFinancedPurchaseTerms(data.value, character, data.debt ?? 0);
    if (!terms.approved) {
      Alert.alert('Cannot buy', terms.message);
      return;
    }
    const ok = purchaseAsset({ ...data, debt: terms.loan });
    Alert.alert(ok ? 'Purchased' : 'Could not purchase', ok ? `${data.name}. ${terms.message}` : terms.message);
  };

  const tabs: { id: MainTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market' },
    { id: 'property', label: 'Property' },
    { id: 'business', label: 'Business' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  return (
    <ScreenShell>
      <TabScreenHeader
        title="Assets & Finance"
        subtitle={`Net worth ${fmt(finance.netWorth)}`}
        accent={colors.catFinancial}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
          {tabs.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, tab === t.id && { borderBottomColor: colors.teal }]}
            >
              <Text style={[styles.tabText, { color: tab === t.id ? colors.teal : colors.t4, fontFamily: tab === t.id ? fonts.bodyBold : fonts.body }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <>
            <BalanceHero />
            <SectionLabel label="Credit" />
            <CreditFactorsCard />
            <SectionLabel label="Holdings snapshot" />
            {character.assets.length === 0 ? (
              <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No assets yet — open Market or Property.</Text>
              </Card>
            ) : (
              character.assets.slice(0, 6).map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onSell={() => {
                    Alert.alert('Sell?', asset.name, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Sell', style: 'destructive', onPress: () => sellAsset(asset.id) },
                    ]);
                  }}
                />
              ))
            )}
          </>
        )}

        {tab === 'market' && (
          <>
            <BalanceHero />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {MARKET_CHIPS.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setMarketChip(c.id)}
                    style={[styles.chip, { borderColor: marketChip === c.id ? colors.teal : colors.border, backgroundColor: marketChip === c.id ? `${colors.teal}18` : 'transparent' }]}
                  >
                    <Text style={[styles.chipText, { color: marketChip === c.id ? colors.teal : colors.t3, fontFamily: fonts.bodySemiBold }]}>{c.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {marginUnlocked(character.creditScore) ? (
              <Pressable onPress={() => setUseMargin((v) => !v)} style={[styles.chip, { alignSelf: 'flex-start', borderColor: useMargin ? colors.gold : colors.border }]}>
                <Text style={{ color: useMargin ? colors.gold : colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>
                  {useMargin ? 'Margin ON (capped)' : 'Margin OFF'}
                </Text>
              </Pressable>
            ) : null}

            {(marketChip === 'stock' || marketChip === 'crypto' || marketChip === 'mutual_fund' || marketChip === 'bond' || marketChip === 'commodity' || marketChip === 'reit' || marketChip === 'venture') && (
              <>
                <SectionLabel label={`${marketChip.replace('_', ' ')} · cash max ${fmt(maxInvest)}`} />
                {MARKET_INSTRUMENTS.filter((i) => i.kind === marketChip).slice(0, 40).map((inst) => {
                  const suggested = scaleCountryAmount(inst.suggestedBuyUsd, cc, 'cost');
                  return (
                    <Card key={inst.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                      <View style={styles.rowBetween}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{inst.name}</Text>
                          <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                            ~{(inst.annualReturnBase * 100).toFixed(0)}% · vol {(inst.volatility * 100).toFixed(0)}%
                            {inst.dividendYield > 0 ? ` · div ${(inst.dividendYield * 100).toFixed(1)}%` : ''}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => setInvestTarget({ catalogId: inst.id })}
                          style={[styles.chip, { borderColor: colors.emerald }]}
                        >
                          <Text style={[styles.chipText, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>Buy</Text>
                        </Pressable>
                      </View>
                      <Text style={[styles.meta, { color: colors.t4, fontFamily: fonts.body }]}>Suggested {fmt(suggested)}</Text>
                    </Card>
                  );
                })}
              </>
            )}

            {marketChip === 'vehicle' && (
              <>
                <SectionLabel label="Vehicles · max 50% loan" />
                {VEHICLES.map((v) => (
                  <Card key={v.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{v.name}</Text>
                        <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>+{v.happinessBonus} happiness · {(v.depreciationPct * 100).toFixed(0)}% dep/yr</Text>
                      </View>
                      <Pressable onPress={() => buyVehicle(v.id)} style={[styles.chip, { borderColor: colors.teal }]}>
                        <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>{fmt(scaleVehiclePrice(v, cc))}</Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {marketChip === 'collectible' && (
              <>
                <SectionLabel label="Collectibles" />
                {COLLECTIBLES.map((c) => (
                  <Card key={c.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{c.name}</Text>
                        <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>{c.category} · +{c.happinessBonus} happy</Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          const r = purchaseCollectible(c.id);
                          Alert.alert(r.ok ? 'Bought' : 'Failed', r.message);
                        }}
                        style={[styles.chip, { borderColor: colors.orchid }]}
                      >
                        <Text style={[styles.chipText, { color: colors.orchid, fontFamily: fonts.bodySemiBold }]}>
                          {fmt(scaleCountryAmount(c.baseValueUsd, cc, 'cost'))}
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {marketChip === 'insurance' && (
              <>
                <SectionLabel label="Insurance policies" />
                {INSURANCE_PRODUCTS.map((p) => (
                  <Card key={p.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{p.name}</Text>
                        <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>{p.description}</Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          const r = purchaseInsurance(p.id);
                          Alert.alert(r.ok ? 'Covered' : 'Failed', r.message);
                        }}
                        style={[styles.chip, { borderColor: colors.sapphire }]}
                      >
                        <Text style={[styles.chipText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>Buy</Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
                {(character.insurancePolicies ?? []).length > 0 ? (
                  <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                    Active: {(character.insurancePolicies ?? []).map((p) => p.line).join(', ')}
                  </Text>
                ) : null}
              </>
            )}

            {marketChip === 'angel' && (
              <>
                <View style={styles.rowBetween}>
                  <SectionLabel label="Angel deals" />
                  <Pressable onPress={() => refreshAngelDeals()}>
                    <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>Refresh</Text>
                  </Pressable>
                </View>
                {(character.angelOpportunities ?? []).length === 0 ? (
                  <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                    <Text style={{ color: colors.t4, fontFamily: fonts.body }}>Tap Refresh for NPC startup deals.</Text>
                  </Card>
                ) : (
                  (character.angelOpportunities ?? []).map((o) => (
                    <Card key={o.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                      <View style={styles.rowBetween}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{o.name}</Text>
                          <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                            {o.sector} · {o.equityPct}% equity · risk {(o.risk * 100).toFixed(0)}%
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            const r = investAngel(o.id);
                            Alert.alert(r.ok ? 'Invested' : 'Failed', r.message);
                          }}
                          style={[styles.chip, { borderColor: colors.gold }]}
                        >
                          <Text style={[styles.chipText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>{fmt(o.askAmount)}</Text>
                        </Pressable>
                      </View>
                    </Card>
                  ))
                )}
              </>
            )}
          </>
        )}

        {tab === 'property' && (
          <>
            <BalanceHero />
            <SectionLabel label="Owned property" />
            {character.assets.filter((a) => a.type === 'property').map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSell={() => sellAsset(asset.id)}
                extra={
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <Pressable
                      onPress={() => {
                        const r = renovateProperty(asset.id);
                        Alert.alert(r.ok ? 'Renovated' : 'Failed', r.message);
                      }}
                      style={[styles.chip, { borderColor: colors.gold }]}
                    >
                      <Text style={[styles.chipText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Renovate</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const next = asset.occupancy === 'rental' ? 'primary' : 'rental';
                        const r = setPropertyMode(asset.id, next);
                        Alert.alert(r.ok ? 'Updated' : 'Failed', r.message);
                      }}
                      style={[styles.chip, { borderColor: colors.sapphire }]}
                    >
                      <Text style={[styles.chipText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>
                        {asset.occupancy === 'rental' ? 'Make primary' : 'List rental'}
                      </Text>
                    </Pressable>
                  </View>
                }
              />
            ))}
            {(['shelter', 'basic', 'mid', 'upper', 'luxury'] as PropertyTier[]).map((tier) => {
              const entries = getPropertiesByTier(tier).slice(0, 6);
              return (
                <View key={tier} style={{ gap: 8, marginBottom: spacing.lg }}>
                  <SectionLabel label={TIER_LABELS[tier]} />
                  {entries.map((prop) => {
                    const scaledValue = scalePropertyValue(prop.value, cc);
                    const terms = getFinancedPurchaseTerms(scaledValue, character);
                    return (
                      <Card key={prop.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                        <View style={styles.rowBetween}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{prop.name}</Text>
                            <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                              Down ≥50% · rent yield {((prop.rentalYieldPct ?? 0.04) * 100).toFixed(1)}% · +{prop.happinessBonus ?? 0} happy
                            </Text>
                          </View>
                          <Text style={[styles.meta, { color: colors.teal, fontFamily: fonts.monoSemiBold }]}>{fmt(scaledValue)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <Pressable
                            onPress={() => navigation.navigate('Mortgage', { propertyDefId: prop.id })}
                            style={[styles.chip, { borderColor: colors.teal }]}
                          >
                            <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>Details</Text>
                          </Pressable>
                          <Pressable
                            disabled={!terms.approved}
                            onPress={() => {
                              const r = purchaseProperty(prop.id, 'primary');
                              Alert.alert(r.ok ? 'Purchased' : 'Failed', r.message);
                            }}
                            style={[styles.chip, { borderColor: terms.approved ? colors.emerald : colors.t4 }]}
                          >
                            <Text style={[styles.chipText, { color: terms.approved ? colors.emerald : colors.t4, fontFamily: fonts.bodySemiBold }]}>Buy primary</Text>
                          </Pressable>
                          <Pressable
                            disabled={!terms.approved}
                            onPress={() => {
                              const r = purchaseProperty(prop.id, 'rental');
                              Alert.alert(r.ok ? 'Purchased' : 'Failed', r.message);
                            }}
                            style={[styles.chip, { borderColor: terms.approved ? colors.gold : colors.t4 }]}
                          >
                            <Text style={[styles.chipText, { color: terms.approved ? colors.gold : colors.t4, fontFamily: fonts.bodySemiBold }]}>Buy rental</Text>
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
            {softBoost ? (
              <Text style={{ color: colors.emerald, fontFamily: fonts.body, fontSize: 12 }}>
                Soft boost active (entrepreneur / business education): −10% entry, +10% revenue.
              </Text>
            ) : null}
            <SectionLabel label="Your businesses" />
            {(character.businesses ?? []).length === 0 ? (
              <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>No businesses — pick a franchise below.</Text>
              </Card>
            ) : (
              (character.businesses ?? []).map((biz) => (
                <Card key={biz.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{biz.name}</Text>
                  <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                    {biz.industry ?? 'Business'} · Val {fmt(biz.valuation)} · Rev {fmt(biz.revenue)}
                  </Text>
                  {biz.employees.map((emp) => (
                    <View key={emp.id} style={styles.rowBetween}>
                      <Text style={[styles.meta, { color: colors.t2, fontFamily: fonts.body }]}>{emp.name} · {emp.role}</Text>
                      {emp.role !== 'CEO' ? (
                        <Pressable onPress={() => fireEmployee(biz.id, emp.id)}>
                          <Text style={[styles.meta, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Fire</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <Pressable
                      onPress={() => {
                        Alert.alert('Hire', 'Select role', [
                          { text: 'Cancel', style: 'cancel' },
                          ...EMPLOYEE_ROLES.map((role) => ({
                            text: role,
                            onPress: () => hireEmployee(biz.id, role),
                          })),
                        ]);
                      }}
                      style={[styles.chip, { borderColor: colors.teal }]}
                    >
                      <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>Hire</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const r = sellBusiness(biz.id);
                        Alert.alert(r.ok ? 'Sold' : 'Failed', r.message);
                      }}
                      style={[styles.chip, { borderColor: colors.crimson }]}
                    >
                      <Text style={[styles.chipText, { color: colors.crimson, fontFamily: fonts.bodySemiBold }]}>Sell</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
            <SectionLabel label="Franchise catalog" />
            {FRANCHISES.map((f) => {
              const check = canFoundFranchise(character, f.id);
              return (
                <Card key={f.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{f.name}</Text>
                      <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                        {f.industry} · credit {f.minCredit}+ · age {f.minAge}+
                      </Text>
                      <Text style={[styles.meta, { color: colors.t3, fontFamily: fonts.body }]}>{f.description}</Text>
                    </View>
                    <Pressable
                      disabled={!check.ok}
                      onPress={() => {
                        const r = foundFranchise(f.id);
                        Alert.alert(r.ok ? 'Opened' : 'Failed', r.message);
                      }}
                      style={[styles.chip, { borderColor: check.ok ? colors.emerald : colors.t4 }]}
                    >
                      <Text style={[styles.chipText, { color: check.ok ? colors.emerald : colors.t4, fontFamily: fonts.bodySemiBold }]}>
                        {fmt(check.entryCost || scaleCountryAmount(f.entryCostUsd, cc, 'cost'))}
                      </Text>
                    </Pressable>
                  </View>
                  {!check.ok ? (
                    <Text style={[styles.meta, { color: colors.crimson, fontFamily: fonts.body }]}>{check.message}</Text>
                  ) : null}
                </Card>
              );
            })}
          </>
        )}

        {tab === 'portfolio' && (
          <>
            <BalanceHero />
            <SectionLabel label="Allocation" />
            <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard, alignItems: 'center' }]}>
              {pieData.length > 0 ? (
                <PieChart data={pieData} donut radius={90} innerRadius={50} />
              ) : (
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>Buy assets to see allocation.</Text>
              )}
              {allocation.map((a) => (
                <View key={a.kind} style={[styles.rowBetween, { width: '100%', marginTop: 6 }]}>
                  <Text style={[styles.meta, { color: colors.t3, fontFamily: fonts.body }]}>{a.kind}</Text>
                  <Text style={[styles.meta, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
                    {a.pct}% · {fmt(a.value)}
                  </Text>
                </View>
              ))}
            </Card>
            <SectionLabel label="Performance" />
            <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
              {lineData.length > 1 ? (
                <LineChart
                  data={lineData}
                  width={chartWidth}
                  height={180}
                  color={colors.teal}
                  thickness={2}
                  hideDataPoints={lineData.length > 12}
                  yAxisTextStyle={{ color: colors.t4, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.t4, fontSize: 9 }}
                  backgroundColor={colors.bgCard}
                />
              ) : (
                <Text style={{ color: colors.t4, fontFamily: fonts.body }}>
                  Age Up with investments to build a performance line.
                </Text>
              )}
            </Card>
            <SectionLabel label="All holdings" />
            {character.assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSell={() => sellAsset(asset.id)}
              />
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <ContextualTutorial screenId="assets" />
      {investTarget ? (
        <InvestAmountModal
          visible
          title={getInstrumentById(investTarget.catalogId)?.name ?? 'Invest'}
          subtitle={`Cash max ${fmt(maxInvest)}${useMargin ? ' (margin on)' : ''}`}
          countryCode={cc}
          minAmount={minInvest}
          suggestedAmount={scaleCountryAmount(
            getInstrumentById(investTarget.catalogId)?.suggestedBuyUsd ?? 5000,
            cc,
            'cost',
          )}
          maxAmount={maxInvest}
          onConfirm={confirmInvest}
          onCancel={() => setInvestTarget(null)}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13 },
  scroll: { padding: 20, gap: 16 },
  hero: { padding: 20, alignItems: 'center', gap: 8, borderRadius: 16 },
  heroLabel: { fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  heroValue: { fontSize: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8, marginTop: 4 },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 10, marginBottom: 2 },
  metricValue: { fontSize: 13 },
  metricDivider: { width: 1, height: 24 },
  heroHint: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  currencyRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  card: { borderWidth: 1, padding: 16, gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 14 },
  sub: { fontSize: 11, marginTop: 2 },
  meta: { fontSize: 11 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 12 },
  chipText: { fontSize: 12 },
});
