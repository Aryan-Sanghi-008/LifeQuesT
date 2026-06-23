import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { Asset } from '../types';
import { SectionLabel } from '../components/index';

// ─── Format currency ──────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

// ─── Balance Hero ─────────────────────────────────────────────────────────────
interface BalanceHeroProps {
  balance: number;
  career: { salary: number } | null;
  assets: Asset[];
}

function BalanceHero({ balance, career, assets }: BalanceHeroProps) {
  const totalDebt   = assets.reduce((s, a) => s + (a.debt ?? 0), 0);
  const assetValue  = assets.reduce((s, a) => s + a.value, 0);
  const netWorth    = balance + assetValue - totalDebt;

  return (
    <LinearGradient colors={[COLORS.bg2, COLORS.bg]} style={bh.wrap}>
      <Text style={bh.heroLabel}>Bank Balance</Text>
      <Text style={bh.heroValue}>{fmt(balance)}</Text>

      <View style={bh.row}>
        <View style={bh.metric}>
          <Text style={bh.metricLabel}>Net Worth</Text>
          <Text style={[bh.metricValue, { color: netWorth >= 0 ? COLORS.teal : COLORS.crimson }]}>{fmt(netWorth)}</Text>
        </View>
        <View style={bh.metricDivider} />
        <View style={bh.metric}>
          <Text style={bh.metricLabel}>Annual Income</Text>
          <Text style={[bh.metricValue, { color: COLORS.gold }]}>{fmt(career?.salary ?? 0)}</Text>
        </View>
        <View style={bh.metricDivider} />
        <View style={bh.metric}>
          <Text style={bh.metricLabel}>Total Debt</Text>
          <Text style={[bh.metricValue, { color: COLORS.crimson }]}>{fmt(totalDebt)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const bh = StyleSheet.create({
  wrap:        { padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center', gap: SPACING.sm },
  heroLabel:   { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, letterSpacing: 1.5, textTransform: 'uppercase' },
  heroValue:   { fontFamily: FONTS.displayBold, fontSize: 36, color: COLORS.teal },
  row:         { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  metric:      { flex: 1, alignItems: 'center' },
  metricLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, marginBottom: 2 },
  metricValue: { fontFamily: FONTS.monoSemiBold, fontSize: 13 },
  metricDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
});

// ─── Asset Card ───────────────────────────────────────────────────────────────
const ASSET_ICONS: Record<string, string> = {
  property: '🏠',
  vehicle: '🚗',
  investment: '📈',
};

function AssetCard({ asset, onSell }: { asset: Asset; onSell: () => void }) {
  const equity = asset.value - (asset.debt ?? 0);
  const debtRatio = asset.debt ? (asset.debt / asset.value) * 100 : 0;

  return (
    <View style={asc.card}>
      <View style={asc.header}>
        <View style={[asc.iconWrap, { backgroundColor: COLORS.bgCard2 }]}>
          <Text style={asc.icon}>{ASSET_ICONS[asset.type] ?? '💼'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={asc.name}>{asset.name}</Text>
          <Text style={asc.sub}>Purchased at age {asset.purchasedAge} · {asset.type}</Text>
        </View>
        <Pressable onPress={onSell} style={asc.sellBtn}>
          <Text style={asc.sellText}>Sell</Text>
        </Pressable>
      </View>
      <View style={asc.row}>
        <View>
          <Text style={asc.rowLabel}>Market Value</Text>
          <Text style={asc.rowValue}>{fmt(asset.value)}</Text>
        </View>
        {asset.debt !== undefined && (
          <View>
            <Text style={asc.rowLabel}>Outstanding Debt</Text>
            <Text style={[asc.rowValue, { color: COLORS.crimson }]}>{fmt(asset.debt)}</Text>
          </View>
        )}
        <View>
          <Text style={asc.rowLabel}>Equity</Text>
          <Text style={[asc.rowValue, { color: equity >= 0 ? COLORS.teal : COLORS.crimson }]}>{fmt(equity)}</Text>
        </View>
      </View>
      {debtRatio > 0 && (
        <View style={asc.debtBar}>
          <View style={[asc.debtFill, { width: `${debtRatio}%` as `${number}%` }]} />
        </View>
      )}
    </View>
  );
}

const asc = StyleSheet.create({
  card:      { backgroundColor: COLORS.bgCard, borderRadius: RADII.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md, marginBottom: SPACING.sm },
  header:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconWrap:  { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  icon:      { fontSize: 22 },
  name:      { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  sub:       { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t4, marginTop: 2 },
  row:       { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel:  { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, marginBottom: 2 },
  rowValue:  { fontFamily: FONTS.monoSemiBold, fontSize: 13, color: COLORS.t1 },
  sellBtn:   { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADII.sm, borderWidth: 1, borderColor: COLORS.crimson },
  sellText:  { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.crimson },
  debtBar:   { height: 3, backgroundColor: COLORS.bgCard2, borderRadius: 2, overflow: 'hidden' },
  debtFill:  { height: '100%', backgroundColor: COLORS.crimson, borderRadius: 2 },
});

// ─── Buy Modal ────────────────────────────────────────────────────────────────
const BUY_OPTIONS = [
  { type: 'property' as const, name: '1BHK Apartment',  value: 2500000, debt: 2000000 },
  { type: 'property' as const, name: '2BHK Flat',        value: 4500000, debt: 3500000 },
  { type: 'vehicle'  as const, name: 'Hatchback Car',    value: 600000,  debt: 400000  },
  { type: 'vehicle'  as const, name: 'SUV',              value: 1500000, debt: 1000000 },
  { type: 'investment' as const, name: 'Stock Portfolio', value: 50000,  debt: 0       },
  { type: 'investment' as const, name: 'Mutual Fund',     value: 25000,  debt: 0       },
];

function BuySheet({ balance, onBuy, onClose }: { balance: number; onBuy: (opt: typeof BUY_OPTIONS[number]) => void; onClose: () => void }) {
  return (
    <View style={bs.overlay}>
      <Pressable style={bs.backdrop} onPress={onClose} />
      <View style={bs.sheet}>
        <Text style={bs.title}>Buy Asset</Text>
        {BUY_OPTIONS.map((opt, i) => {
          const downPayment = opt.value - (opt.debt ?? 0);
          const canAfford = balance >= downPayment;
          return (
            <Pressable key={i} onPress={() => canAfford && onBuy(opt)} style={[bs.row, !canAfford && bs.locked]}>
              <Text style={bs.optIcon}>{ASSET_ICONS[opt.type]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={bs.optName}>{opt.name}</Text>
                <Text style={bs.optSub}>Down: {fmt(downPayment)}</Text>
              </View>
              <Text style={[bs.optPrice, { color: canAfford ? COLORS.teal : COLORS.t4 }]}>{fmt(opt.value)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const bs = StyleSheet.create({
  overlay:  { position: 'absolute', inset: 0, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:    { backgroundColor: COLORS.bg2, borderTopLeftRadius: RADII.xl, borderTopRightRadius: RADII.xl, padding: SPACING.xl, gap: SPACING.md },
  title:    { fontFamily: FONTS.displayBold, fontSize: 20, color: COLORS.t1, marginBottom: SPACING.sm },
  row:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  locked:   { opacity: 0.4 },
  optIcon:  { fontSize: 24 },
  optName:  { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
  optSub:   { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3 },
  optPrice: { fontFamily: FONTS.monoSemiBold, fontSize: 13 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function AssetsScreen() {
  const character    = useGameStore(s => s.character);
  const purchaseAsset = useGameStore(s => s.purchaseAsset);
  const sellAsset    = useGameStore(s => s.sellAsset);
  const [showBuy, setShowBuy] = useState(false);

  if (!character) return null;

  const { bankBalance, career, assets } = character;

  const handleBuy = (opt: typeof BUY_OPTIONS[number]) => {
    const success = purchaseAsset({
      type: opt.type,
      name: opt.name,
      value: opt.value,
      debt: opt.debt || undefined,
    });
    setShowBuy(false);
    if (success) {
      Alert.alert('Purchase Successful', `You now own: ${opt.name}`);
    } else {
      Alert.alert('Not Enough Funds', 'You need more money for the down payment.');
    }
  };

  const handleSell = (asset: Asset) => {
    const equity = asset.value - (asset.debt ?? 0);
    Alert.alert(
      `Sell ${asset.name}?`,
      `You will receive ${fmt(Math.max(0, equity))} after paying off debt.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sell', style: 'destructive', onPress: () => sellAsset(asset.id) },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.titleBar}>
          <Text style={styles.headerTitle}>Assets</Text>
        </View>

        <BalanceHero balance={bankBalance} career={career} assets={assets} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.actionRow}>
            <Pressable onPress={() => setShowBuy(true)} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>+ Buy Asset</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert('Invest', `You invested ₹10,000 in the stock market. Results next year.`)}
              style={[styles.actionBtn, { borderColor: COLORS.sapphire }]}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.sapphire }]}>📈 Invest</Text>
            </Pressable>
          </View>

          {assets.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyText}>No assets yet.</Text>
              <Text style={styles.emptyHint}>Buy a house, car, or investments.</Text>
            </View>
          ) : (
            <>
              <SectionLabel label={`Assets (${assets.length})`} style={{ marginBottom: SPACING.md }} />
              {assets.map(a => (
                <AssetCard key={a.id} asset={a} onSell={() => handleSell(a)} />
              ))}
            </>
          )}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>

      {showBuy && (
        <BuySheet balance={bankBalance} onBuy={handleBuy} onClose={() => setShowBuy(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: COLORS.bg },
  safe:         { flex: 1 },
  titleBar:     { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg2 },
  headerTitle:  { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  scroll:       { padding: SPACING.lg },
  actionRow:    { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  actionBtn:    { flex: 1, paddingVertical: 12, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.teal, alignItems: 'center' },
  actionBtnText:{ fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.teal },
  empty:        { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.md },
  emptyIcon:    { fontSize: 48 },
  emptyText:    { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.t3 },
  emptyHint:    { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4 },
});
