import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated, StyleProp, ViewStyle, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { FadeInView } from '../components/index';
import {
  purchaseProduct,
  restorePurchases,
  getIAPProducts,
  processVerifiedPurchase,
} from '../services/iap';
import { getPrivacyPolicyUrl, openLegalUrl } from '../config/legal';
import { IAPProductId } from '../types';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── Shimmer View ─────────────────────────────────────────────────────────────
function GoldShimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-300, 300] });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}
      pointerEvents="none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,215,100,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

// ─── Premium Banner ───────────────────────────────────────────────────────────
function PremiumBanner({ isPremium, onPress }: { isPremium: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.premiumWrap]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, damping: 20, stiffness: 200 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 200 }).start()}
        android_ripple={{ color: 'rgba(255,215,100,0.1)' }}
        style={{ borderRadius: RADII.xl, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#1E3A8A', '#2563EB', '#1E40AF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          <GoldShimmer style={{ borderRadius: RADII.xl }} />

          {/* Border glow */}
          <View style={styles.premiumBorder} />

          <View style={styles.premiumContent}>
            <View style={styles.premiumLeft}>
              <View style={styles.crownWrap}>
                <LinearGradient colors={['#FCD34D', '#F59E0B']} style={styles.crownBg}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Path fill="#FFFFFF" d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z" />
                    <Path fill="#FFFFFF" d="M4 18h16v2H4z" />
                  </Svg>
                </LinearGradient>
              </View>
              <View style={styles.premiumInfo}>
                <View style={styles.premiumTitleRow}>
                  <Text style={styles.premiumTitle}>LifeQuest Premium</Text>
                  {isPremium && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>}
                </View>
                <Text style={styles.premiumSub}>No ads, bonus luck boosts, and cloud save priority.</Text>
              </View>
            </View>
            {!isPremium && (
              <View style={styles.premiumCTA}>
                <Text style={styles.premiumPrice}>₹299</Text>
                <Text style={styles.premiumPeriod}>/mo</Text>
              </View>
            )}
          </View>

          {/* Perk list */}
          <View style={styles.perks}>
            {['Remove all ads', '5 bonus luck boosts', 'Priority cloud save', 'Support ongoing development'].map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <View style={styles.perkDot} />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── IAP Product Card ─────────────────────────────────────────────────────────
interface ProductCardProps {
  title: string;
  desc: string;
  price: string;
  color: string;
  icon: React.ReactNode;
  badge?: string;
  onPress: () => void;
}

function ProductCard({ title, desc, price, color, icon, badge, onPress }: ProductCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 18, stiffness: 200 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }).start()}
        android_ripple={{ color: `${color}15` }}
        style={{ borderRadius: RADII.md, overflow: 'hidden' }}
      >
        <View style={[styles.productCard, { borderColor: `${color}35` }]}>
          {badge && (
            <View style={[styles.productBadge, { backgroundColor: `${color}25`, borderColor: `${color}50` }]}>
              <Text style={[styles.productBadgeText, { color }]}>{badge}</Text>
            </View>
          )}
          <View style={[styles.productIcon, { backgroundColor: `${color}18` }]}>
            {icon}
          </View>
          <Text style={styles.productTitle}>{title}</Text>
          <Text style={styles.productDesc}>{desc}</Text>
          <View style={[styles.priceBtn, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
            <Text style={[styles.priceText, { color }]}>{price}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function ShopScreen() {
  const character  = useGameStore(s => s.character);
  const store      = useGameStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const buy = async (productId: IAPProductId, fallback?: () => void) => {
    if (purchasing) return;
    setPurchasing(productId);
    try {
      const catalog = getIAPProducts();
      if (catalog.length === 0 && fallback) {
        fallback();
        return;
      }
      await purchaseProduct(productId);
    } catch (e) {
      Alert.alert('Purchase failed', (e as Error).message ?? 'Try again later.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing('restore');
    try {
      const purchases = await restorePurchases();
      let granted = 0;
      for (const p of purchases) {
        const ok = await processVerifiedPurchase(p, store);
        if (ok) granted += 1;
      }
      Alert.alert(
        'Restored',
        granted > 0
          ? `${granted} purchase(s) restored.`
          : purchases.length > 0
            ? 'Purchases found but server verification failed. Sign in and try again.'
            : 'No purchases found.',
      );
    } catch (e) {
      Alert.alert('Restore failed', (e as Error).message ?? 'Try again later.');
    } finally {
      setPurchasing(null);
    }
  };

  const openPrivacy = async () => {
    try {
      await openLegalUrl(getPrivacyPolicyUrl());
    } catch {
      Alert.alert('Unable to open privacy policy', 'Set EXPO_PUBLIC_PRIVACY_POLICY_URL or deploy hosting.');
    }
  };

  const buyLuckWithCoins = () => {
    if (!store.spendCoins(500)) {
      Alert.alert('Not enough coins', 'You need 500 coins for a Luck Boost.');
      return;
    }
    store.addLuckBoost(3);
    Alert.alert('Luck Boost', '3 luck boosts added to your character.');
  };

  if (!character) return null;

  const busy = purchasing !== null;

  const products = [
    {
      title: 'Remove Ads',
      desc: 'One-time. Clean forever.',
      price: '₹199',
      color: COLORS.sapphire,
      badge: 'ONE-TIME',
      productId: 'remove_ads' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle stroke={COLORS.sapphire} strokeWidth={2} cx="12" cy="12" r="10"/>
          <Path stroke={COLORS.sapphire} strokeWidth={2} strokeLinecap="round" d="M4.93 4.93l14.14 14.14"/>
        </Svg>
      ),
      onPress: () => buy('remove_ads', () => store.setNoAds(true)),
    },
    {
      title: '10,000 Coins',
      desc: 'Boosts, potions & luck upgrades',
      price: '₹99',
      color: COLORS.gold,
      productId: 'coins_small' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.gold}>
          <Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}20`} stroke={COLORS.gold} strokeWidth={2}/>
          <Path fill={COLORS.gold} d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </Svg>
      ),
      onPress: () => buy('coins_small', () => store.addCoins(10000)),
    },
    {
      title: '50,000 Coins',
      desc: 'Stock up for the long game',
      price: '₹399',
      color: COLORS.gold,
      badge: 'BEST VALUE',
      productId: 'coins_medium' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.gold}>
          <Circle cx="12" cy="12" r="10" fill={`${COLORS.gold}30`} stroke={COLORS.gold} strokeWidth={2}/>
          <Path fill={COLORS.gold} d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </Svg>
      ),
      onPress: () => buy('coins_medium', () => store.addCoins(50000)),
    },
    {
      title: '25 Gems',
      desc: 'Premium currency for rare items',
      price: '₹149',
      color: COLORS.orchid,
      productId: 'gems_small' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path fill={COLORS.orchid} d="M12 2L2 9l10 13L22 9z" opacity={0.8}/>
          <Path stroke={COLORS.orchid} strokeWidth={1.5} d="M12 2L2 9l10 13L22 9z"/>
        </Svg>
      ),
      onPress: () => buy('gems_small', () => store.addGems(25)),
    },
    {
      title: 'Luck Boost ×3',
      desc: 'Better outcomes for 3 events',
      price: '500 Coins',
      color: COLORS.teal,
      productId: 'luck_boost' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path stroke={COLORS.teal} strokeWidth={2} strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </Svg>
      ),
      onPress: () => buy('luck_boost', buyLuckWithCoins),
    },
    {
      title: 'Reincarnation Scroll',
      desc: 'Carry 3 stats into your next life',
      price: '₹49',
      color: COLORS.crimson,
      productId: 'reincarnation_scroll' as IAPProductId,
      icon: (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/>
          <Path stroke={COLORS.crimson} strokeWidth={2} strokeLinecap="round" d="M8 12l2 2 4-4"/>
        </Svg>
      ),
      onPress: () => buy('reincarnation_scroll', () => store.useReincarnationScroll()),
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Life Store</Text>
            <Text style={styles.headerSub}>Power up your journey</Text>
          </View>
          <View style={styles.walletRow}>
            <View style={styles.walletChip}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill={COLORS.gold}><Circle cx="12" cy="12" r="10"/></Svg>
              <Text style={styles.walletText}>{character.coins.toLocaleString()}</Text>
            </View>
            <View style={[styles.walletChip, { borderColor: COLORS.orchidBorder }]}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Path fill={COLORS.orchid} d="M12 2L2 9l10 13L22 9z" opacity={0.9}/></Svg>
              <Text style={[styles.walletText, { color: COLORS.orchid }]}>{character.gems}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Premium Banner */}
          <FadeInView delay={100}>
            <PremiumBanner
              isPremium={character.isPremium}
              onPress={() => buy('premium_yearly', () => store.setPremium(true))}
            />
          </FadeInView>

          {/* Products Grid */}
          <Text style={styles.gridLabel}>CONSUMABLES & BOOSTS</Text>
          <View style={styles.productGrid}>
            {products.map((p, i) => (
              <FadeInView key={p.title} delay={i * 60 + 200} style={{ width: '48%' }}>
                <ProductCard {...p} />
              </FadeInView>
            ))}
          </View>

          {/* Restore Purchases */}
          <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={busy}>
            <Text style={styles.restoreText}>{purchasing === 'restore' ? 'Restoring…' : 'Restore Purchases'}</Text>
          </Pressable>

          <Text style={styles.legal}>
            Subscriptions auto-renew. Cancel any time. Purchases are non-refundable. Prices may vary by region.
          </Text>

          <Pressable onPress={() => void openPrivacy()} style={styles.privacyLink}>
            <Text style={styles.privacyLinkText}>Privacy Policy</Text>
          </Pressable>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg2,
  },
  headerTitle: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  headerSub:   { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3, marginTop: 2 },
  walletRow:   { flexDirection: 'row', gap: SPACING.sm },
  walletChip:  {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    backgroundColor: COLORS.bgCard, borderRadius: RADII.full,
    borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  walletText:  { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.gold },

  scroll: { padding: SPACING.lg },

  // Premium
  premiumWrap: { marginBottom: SPACING.xl },
  premiumCard: {
    borderRadius: RADII.xl, padding: SPACING.xl,
    gap: SPACING.md, overflow: 'hidden', position: 'relative',
    borderWidth: 1.5, borderColor: `${COLORS.gold}30`,
  },
  premiumBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
  },
  premiumContent: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  premiumLeft:    { flex: 1, flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  crownWrap:      { flexShrink: 0 },
  crownBg:        { width: 48, height: 48, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  premiumInfo:    { flex: 1 },
  premiumTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  premiumTitle:   { fontFamily: FONTS.displayBold, fontSize: 17, color: '#FFFFFF' },
  activeBadge:    { backgroundColor: 'rgba(255,255,255,0.20)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADII.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)' },
  activeBadgeText:{ fontFamily: FONTS.monoSemiBold, fontSize: 8, color: '#FFFFFF', letterSpacing: 1 },
  premiumSub:     { fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  premiumCTA:     { flexDirection: 'row', alignItems: 'baseline', gap: 2, flexShrink: 0 },
  premiumPrice:   { fontFamily: FONTS.displayBold, fontSize: 20, color: '#FFFFFF' },
  premiumPeriod:  { fontFamily: FONTS.body, fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  perks: { gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.20)', paddingTop: SPACING.md },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  perkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FCD34D' },
  perkText: { fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.90)' },

  // Grid label
  gridLabel: {
    fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.t4,
    letterSpacing: 2, marginBottom: SPACING.md,
  },

  // Products
  productGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  productCard:  {
    backgroundColor: COLORS.bgCard, borderRadius: RADII.md,
    borderWidth: 1.5, padding: SPACING.md, gap: SPACING.sm,
    position: 'relative', overflow: 'hidden',
  },
  productBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: RADII.xs, borderWidth: 1,
  },
  productBadgeText: { fontFamily: FONTS.monoSemiBold, fontSize: 8, letterSpacing: 0.5 },
  productIcon:  { width: 44, height: 44, borderRadius: RADII.sm, alignItems: 'center', justifyContent: 'center' },
  productTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t1 },
  productDesc:  { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3, lineHeight: 15 },
  priceBtn:     { paddingVertical: 8, borderRadius: RADII.sm, alignItems: 'center', borderWidth: 1, marginTop: 4 },
  priceText:    { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  // Footer
  restoreBtn:   { alignItems: 'center', paddingVertical: SPACING.lg },
  restoreText:  { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.t3 },
  legal:        { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4, textAlign: 'center', lineHeight: 15, marginTop: SPACING.sm },
  privacyLink:  { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: SPACING.xs },
  privacyLinkText: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.sapphire },
});
