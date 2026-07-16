import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@components/index';
import { useTheme } from '@theme';
import { formatCurrency } from '@utils/currency';
import type { AssetDetailModel } from '@data/assetDetail';

interface Props {
  model: AssetDetailModel | null;
  visible: boolean;
  countryCode: string;
  onClose: () => void;
  onBuy?: () => void;
  onSell?: () => void;
  onEquipToggle?: () => void;
}

export function AssetDetailSheet({
  model,
  visible,
  countryCode,
  onClose,
  onBuy,
  onSell,
  onEquipToggle,
}: Props) {
  const { colors, fonts, spacing, radii } = useTheme();
  if (!model) return null;
  const fmt = (n: number) => formatCurrency(n, countryCode);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={model.title}>
      <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 12, marginBottom: 4 }}>
          {model.subtitle} · {model.tierLabel} tier
          {model.roleTag ? ` · ${model.roleTag}` : ''}
        </Text>
        <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginBottom: spacing.md }}>
          {model.description}
        </Text>

        <View style={[styles.priceRow, { backgroundColor: colors.bg2, borderRadius: radii.md, borderColor: colors.border }]}>
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12 }}>{model.priceLabel}</Text>
          <Text style={{ color: colors.teal, fontFamily: fonts.displayBold, fontSize: 20 }}>{fmt(model.priceValue)}</Text>
        </View>

        {model.stackingHint ? (
          <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm }}>
            {model.stackingHint}
          </Text>
        ) : null}

        {model.extraLines.length > 0 && (
          <View style={{ marginTop: spacing.md, gap: 4 }}>
            {model.extraLines.map((line) => (
              <Text key={line} style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>
                · {line}
              </Text>
            ))}
          </View>
        )}

        <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 14, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Perks & benefits
        </Text>
        {model.perks.length === 0 ? (
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12 }}>No special perks listed.</Text>
        ) : (
          model.perks.map((p) => (
            <View
              key={p.id}
              style={[styles.perkCard, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.sm }]}
            >
              <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{p.label}</Text>
              <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>{p.description}</Text>
            </View>
          ))
        )}

        <View style={{ marginTop: spacing.lg, gap: spacing.sm, marginBottom: spacing.md }}>
          {model.canBuy && onBuy ? (
            <Pressable
              onPress={onBuy}
              style={[styles.cta, { backgroundColor: colors.gold }]}
              accessibilityRole="button"
              accessibilityLabel={`Buy ${model.title}`}
            >
              <Text style={{ color: colors.textOnInverse, fontFamily: fonts.displayBold, fontSize: 15 }}>Buy</Text>
            </Pressable>
          ) : null}
          {model.canEquip && onEquipToggle ? (
            <Pressable
              onPress={onEquipToggle}
              style={[styles.cta, { backgroundColor: model.equipped ? colors.bgCard2 : colors.teal, borderWidth: 1, borderColor: colors.teal }]}
              accessibilityRole="button"
              accessibilityLabel={model.equipped ? 'Unequip' : 'Equip'}
            >
              <Text style={{ color: model.equipped ? colors.teal : colors.textOnInverse, fontFamily: fonts.displayBold, fontSize: 15 }}>
                {model.equipped ? 'Unequip' : 'Equip'}
              </Text>
            </Pressable>
          ) : null}
          {model.canSell && onSell ? (
            <Pressable
              onPress={onSell}
              style={[styles.cta, { backgroundColor: `${colors.crimson}22`, borderWidth: 1, borderColor: colors.crimson }]}
              accessibilityRole="button"
              accessibilityLabel={`Sell ${model.title}`}
            >
              <Text style={{ color: colors.crimson, fontFamily: fonts.displayBold, fontSize: 15 }}>Sell</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={{ color: colors.t3, fontFamily: fonts.body, textAlign: 'center', padding: 8 }}>Close</Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  perkCard: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
