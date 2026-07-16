import { useMemo, useState, type ReactNode } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { selectCharacterAssetsContext } from '@store/selectors';
import { Asset, PropertyTier, RootStackParamList } from '../../types';
import { Card, SectionLabel, ScreenShell, TabScreenHeader, CurrencyChip, HorizontalChipTabBar } from '@components/index';
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
import { AssetDetailSheet } from './AssetDetailSheet';
import { CatalogItemCard } from './components/CatalogItemCard';
import { CatalogFlatList } from '@features/economy/assets/components/CatalogFlatList';
import {
  detailFromVehicleCatalog,
  detailFromCollectibleCatalog,
  detailFromInsuranceCatalog,
  detailFromOwnedAsset,
  detailFromOwnedPolicy,
  detailFromBusiness,
  detailFromPropertyCatalog,
  type AssetDetailModel,
} from '@data/assetDetail';
import { scalePremium } from '../../data/insurancePolicies';
import { tierFromUsdPrice } from '@data/assetPerks';
import { getPropertyCatalogEntry } from '@data/properties';
import { getEquippedPerkSummary } from '@engine/equippedPerksEngine';

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
  const financeInput = useGameStore(useShallow(selectCharacterAssetsContext));
  if (!financeInput) return null;
  const finance = getFinanceSummary(financeInput);
  const cc = financeInput.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const score = financeInput.creditScore ?? 650;

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
          <Text style={[styles.metricValue, { color: colors.crimson, fontFamily: fonts.monoSemiBold }]}>{fmt(financeInput.debt ?? 0)}</Text>
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
        <CurrencyChip type="coin" amount={financeInput.coins} />
        <CurrencyChip type="gem" amount={financeInput.gems} />
      </View>
    </LinearGradient>
  );
}

function CreditFactorsCard() {
  const { colors, fonts } = useTheme();
  const financeInput = useGameStore(useShallow(selectCharacterAssetsContext));
  if (!financeInput) return null;
  const f = financeInput.creditFactors;
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
      {marginUnlocked(financeInput.creditScore) ? (
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
  onOpen,
  extra,
}: {
  asset: Asset;
  onSell: () => void;
  onOpen?: () => void;
  extra?: ReactNode;
}) {
  const { colors, fonts } = useTheme();
  const cc = useGameStore.getState().character?.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const equity = asset.value - (asset.debt ?? 0);
  const inst = asset.catalogId ? getInstrumentById(asset.catalogId) : undefined;

  return (
    <Pressable onPress={onOpen}>
      <Card style={[styles.card, { borderColor: asset.equipped ? colors.gold : colors.border, backgroundColor: colors.bgCard, borderRadius: 16 }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
              {asset.name}{asset.equipped ? ' · Equipped' : ''}
            </Text>
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
    </Pressable>
  );
}

export function AssetsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(useShallow(selectCharacterAssetsContext));
  const sellAsset = useGameStore((s) => s.sellAsset);
  const purchaseAsset = useGameStore((s) => s.purchaseAsset);
  const purchaseProperty = useGameStore((s) => s.purchaseProperty);
  const purchaseCollectible = useGameStore((s) => s.purchaseCollectible);
  const purchaseInsurance = useGameStore((s) => s.purchaseInsurance);
  const sellInsurance = useGameStore((s) => s.sellInsurance);
  const setInsuranceEquipped = useGameStore((s) => s.setInsuranceEquipped);
  const setAssetEquipped = useGameStore((s) => s.setAssetEquipped);
  const setBusinessEquipped = useGameStore((s) => s.setBusinessEquipped);
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
  const [detail, setDetail] = useState<AssetDetailModel | null>(null);

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

      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.bgCard,
        }}
      >
        <HorizontalChipTabBar
          tabs={tabs}
          activeId={tab}
          onSelect={setTab}
          activeColors={{
            border: colors.teal,
            background: `${colors.teal}18`,
            text: colors.teal,
          }}
          inactiveColors={{
            border: colors.border,
            background: colors.bg2,
            text: colors.t3,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <>
            <BalanceHero />
            {(() => {
              const summary = getEquippedPerkSummary(character);
              if (summary.length === 0) return null;
              return (
                <Card style={[styles.card, { borderColor: colors.gold, backgroundColor: colors.bgCard, marginBottom: 8 }]}>
                  <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>Active equipped perks</Text>
                  {summary.map((line) => (
                    <Text key={line} style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
                      · {line}
                    </Text>
                  ))}
                </Card>
              );
            })()}
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
                  onOpen={() => setDetail(detailFromOwnedAsset(asset))}
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
                <CatalogFlatList
                  data={MARKET_INSTRUMENTS.filter((i) => i.kind === marketChip)}
                  keyExtractor={(inst) => inst.id}
                  ListHeaderComponent={
                    <SectionLabel label={`${marketChip.replace('_', ' ')} · cash max ${fmt(maxInvest)}`} />
                  }
                  renderItem={({ item: inst }) => {
                    const suggested = scaleCountryAmount(inst.suggestedBuyUsd, cc, 'cost');
                    return (
                      <CatalogItemCard
                        title={inst.name}
                        subtitle={inst.description}
                        tier={tierFromUsdPrice(inst.suggestedBuyUsd)}
                        roleTag={inst.roleTag}
                        perks={inst.holdingPerks}
                        metaLine={`~${(inst.annualReturnBase * 100).toFixed(0)}% · vol ${(inst.volatility * 100).toFixed(0)}%${inst.dividendYield > 0 ? ` · div ${(inst.dividendYield * 100).toFixed(1)}%` : ''}`}
                        priceLabel={`Suggested ${fmt(suggested)}`}
                        onPress={() => setInvestTarget({ catalogId: inst.id })}
                      />
                    );
                  }}
                />
              </>
            )}

            {marketChip === 'vehicle' && (
              <>
                <SectionLabel label="Vehicles · max 50% loan" />
                <CatalogFlatList
                  data={VEHICLES}
                  keyExtractor={(v) => v.id}
                  renderItem={({ item: v }) => (
                    <CatalogItemCard
                      title={v.name}
                      subtitle={v.description}
                      tier={tierFromUsdPrice(v.baseValueUsd)}
                      roleTag={v.roleTag}
                      perks={v.perks}
                      metaLine={`${(v.depreciationPct * 100).toFixed(0)}% dep/yr · loan ≤50%`}
                      priceLabel={fmt(scaleVehiclePrice(v, cc))}
                      onPress={() => setDetail(detailFromVehicleCatalog(v.id, scaleVehiclePrice(v, cc)))}
                    />
                  )}
                />
              </>
            )}

            {marketChip === 'collectible' && (
              <>
                <SectionLabel label="Collectibles" />
                <CatalogFlatList
                  data={COLLECTIBLES}
                  keyExtractor={(c) => c.id}
                  renderItem={({ item: c }) => (
                    <CatalogItemCard
                      title={c.name}
                      subtitle={c.description}
                      tier={tierFromUsdPrice(c.baseValueUsd)}
                      roleTag={c.roleTag}
                      perks={c.perks}
                      metaLine={`${c.category} · ~${(c.appreciationPct * 100).toFixed(1)}% appr`}
                      priceLabel={fmt(scaleCountryAmount(c.baseValueUsd, cc, 'cost'))}
                      onPress={() =>
                        setDetail(
                          detailFromCollectibleCatalog(
                            c.id,
                            scaleCountryAmount(c.baseValueUsd, cc, 'cost'),
                          ),
                        )
                      }
                    />
                  )}
                />
              </>
            )}

            {marketChip === 'insurance' && (
              <>
                <SectionLabel label="Insurance policies" />
                {INSURANCE_PRODUCTS.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setDetail(detailFromInsuranceCatalog(p.id, scalePremium(p.premiumUsd, cc)))}
                  >
                    <Card style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                      <View style={styles.rowBetween}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>{p.name}</Text>
                          <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>{p.description}</Text>
                        </View>
                        <View style={[styles.chip, { borderColor: colors.sapphire }]}>
                          <Text style={[styles.chipText, { color: colors.sapphire, fontFamily: fonts.bodySemiBold }]}>Details</Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                ))}
                <SectionLabel label="Your policies" />
                {(character.insurancePolicies ?? []).length === 0 ? (
                  <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>No policies yet.</Text>
                ) : (
                  (character.insurancePolicies ?? []).map((pol) => (
                    <Pressable key={pol.id} onPress={() => setDetail(detailFromOwnedPolicy(pol))}>
                      <Card style={[styles.card, { borderColor: pol.equipped === false ? colors.border : colors.gold, backgroundColor: colors.bgCard }]}>
                        <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                          {pol.line} · {pol.equipped === false ? 'Unequipped' : 'Equipped'}
                        </Text>
                        <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                          Premium {fmt(pol.annualPremium)} · {Math.round(pol.coveragePct * 100)}% cover
                        </Text>
                      </Card>
                    </Pressable>
                  ))
                )}
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
                onOpen={() => setDetail(detailFromOwnedAsset(asset))}
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
              const entries = getPropertiesByTier(tier);
              return (
                <View key={tier} style={{ gap: 8, marginBottom: spacing.lg }}>
                  <SectionLabel label={TIER_LABELS[tier]} />
                  {entries.map((prop) => {
                    const scaledValue = scalePropertyValue(prop.value, cc);
                    const terms = getFinancedPurchaseTerms(scaledValue, character);
                    const entry = getPropertyCatalogEntry(prop.id);
                    return (
                      <CatalogItemCard
                        key={prop.id}
                        title={prop.name}
                        subtitle={entry?.description}
                        tier={tierFromUsdPrice(prop.value)}
                        roleTag={entry?.roleTag}
                        perks={entry?.perks}
                        metaLine={`Down ≥50% · rent yield ${((prop.rentalYieldPct ?? 0.04) * 100).toFixed(1)}%`}
                        priceLabel={fmt(scaledValue)}
                        onPress={() => setDetail(detailFromPropertyCatalog(prop.id, scaledValue))}
                        actions={
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <Pressable
                              onPress={() => navigation.navigate('Mortgage', { propertyDefId: prop.id })}
                              style={[styles.chip, { borderColor: colors.teal }]}
                            >
                              <Text style={[styles.chipText, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>Mortgage</Text>
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
                        }
                      />
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
                <Card key={biz.id} style={[styles.card, { borderColor: biz.equipped ? colors.gold : colors.border, backgroundColor: colors.bgCard }]}>
                  <Pressable onPress={() => setDetail(detailFromBusiness(biz))}>
                    <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                      {biz.name}{biz.equipped ? ' · Featured' : ''}
                    </Text>
                    <Text style={[styles.sub, { color: colors.t4, fontFamily: fonts.body }]}>
                      {biz.industry ?? 'Business'} · Val {fmt(biz.valuation)} · Rev {fmt(biz.revenue)} · Tap for perks
                    </Text>
                  </Pressable>
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
                <CatalogItemCard
                  key={f.id}
                  title={f.name}
                  subtitle={f.description}
                  tier={tierFromUsdPrice(f.entryCostUsd)}
                  roleTag={f.roleTag}
                  perks={f.industryPerks}
                  metaLine={`${f.industry} · credit ${f.minCredit}+ · age ${f.minAge}+ · risk ${(f.risk * 100).toFixed(0)}%`}
                  priceLabel={fmt(check.entryCost || scaleCountryAmount(f.entryCostUsd, cc, 'cost'))}
                  actions={
                    <View style={{ marginTop: 8 }}>
                      <Pressable
                        disabled={!check.ok}
                        onPress={() => {
                          const r = foundFranchise(f.id);
                          Alert.alert(r.ok ? 'Opened' : 'Failed', r.message);
                        }}
                        style={[styles.chip, { borderColor: check.ok ? colors.emerald : colors.t4, alignSelf: 'flex-start' }]}
                      >
                        <Text style={[styles.chipText, { color: check.ok ? colors.emerald : colors.t4, fontFamily: fonts.bodySemiBold }]}>
                          {check.ok ? 'Found franchise' : check.message}
                        </Text>
                      </Pressable>
                    </View>
                  }
                />
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
                onOpen={() => setDetail(detailFromOwnedAsset(asset))}
                onSell={() => sellAsset(asset.id)}
              />
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <ContextualTutorial screenId="assets" />
      <AssetDetailSheet
        model={detail}
        visible={!!detail}
        countryCode={cc}
        onClose={() => setDetail(null)}
        onBuy={() => {
          if (!detail) return;
          if (detail.kind === 'vehicle') {
            buyVehicle(detail.id);
            setDetail(null);
            return;
          }
          if (detail.kind === 'collectible') {
            const r = purchaseCollectible(detail.id);
            Alert.alert(r.ok ? 'Bought' : 'Failed', r.message);
            if (r.ok) setDetail(null);
            return;
          }
          if (detail.kind === 'insurance') {
            const r = purchaseInsurance(detail.id);
            Alert.alert(r.ok ? 'Covered' : 'Failed', r.message);
            if (r.ok) setDetail(null);
          }
        }}
        onSell={() => {
          if (!detail) return;
          if (detail.ownedAssetId) {
            sellAsset(detail.ownedAssetId);
            setDetail(null);
            return;
          }
          if (detail.ownedPolicyId) {
            const r = sellInsurance(detail.ownedPolicyId);
            Alert.alert(r.ok ? 'Cancelled' : 'Failed', r.message);
            if (r.ok) setDetail(null);
            return;
          }
          if (detail.ownedBusinessId) {
            const r = sellBusiness(detail.ownedBusinessId);
            Alert.alert(r.ok ? 'Sold' : 'Failed', r.message);
            if (r.ok) setDetail(null);
          }
        }}
        onEquipToggle={() => {
          if (!detail) return;
          if (detail.ownedAssetId) {
            const r = setAssetEquipped(detail.ownedAssetId, !detail.equipped);
            Alert.alert(r.ok ? 'Updated' : 'Failed', r.message);
            if (r.ok) setDetail(null);
            return;
          }
          if (detail.ownedPolicyId) {
            const r = setInsuranceEquipped(detail.ownedPolicyId, !detail.equipped);
            Alert.alert(r.ok ? 'Updated' : 'Failed', r.message);
            if (r.ok) setDetail(null);
            return;
          }
          if (detail.ownedBusinessId) {
            const r = setBusinessEquipped(detail.ownedBusinessId, !detail.equipped);
            Alert.alert(r.ok ? 'Updated' : 'Failed', r.message);
            if (r.ok) setDetail(null);
          }
        }}
      />
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
