import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';

interface Props {
  visible: boolean;
  priceLabel: string;
  loading?: boolean;
  onPurchase: () => void;
  onDismiss: () => void;
}

export function StarterPackModal({
  visible,
  priceLabel,
  loading = false,
  onPurchase,
  onDismiss,
}: Props) {
  const { colors, fonts, radii, spacing } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
          <LinearGradient
            colors={['#7C3AED', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: radii.md }]}
          >
            <Text style={[styles.badge, { fontFamily: fonts.bodyBold, color: colors.textOnInverseMuted }]}>LIMITED TIME</Text>
            <Text style={[styles.title, { fontFamily: fonts.displayBold, color: colors.textOnInverse }]}>Starter Pack</Text>
            <Text style={[styles.subtitle, { fontFamily: fonts.body, color: colors.textOnInverseMuted }]}>
              Jump-start your next life with premium perks.
            </Text>
          </LinearGradient>

          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {['50 Gems', 'Remove ads forever', 'Silver Spoon scenario'].map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={[styles.perkDot, { backgroundColor: colors.orchid }]} />
                <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14 }}>{perk}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={onPurchase}
            disabled={loading}
            style={[styles.buyBtn, { backgroundColor: colors.gold, borderRadius: radii.md, marginTop: spacing.lg }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnInverse} />
            ) : (
              <Text style={{ color: colors.textOnInverse, fontFamily: fonts.bodyBold, fontSize: 15 }}>
                Get Starter Pack · {priceLabel}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={onDismiss} style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 13 }}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderWidth: 1,
    padding: 20,
  },
  hero: {
    padding: 18,
    gap: 6,
  },
  badge: {
    fontSize: 10,
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  buyBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
});
