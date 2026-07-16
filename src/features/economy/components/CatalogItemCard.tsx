import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import type { AssetPerk, AssetPerkTier } from '@data/assetPerks';
import { tierLabel } from '@data/assetPerks';

interface CatalogItemCardProps {
  title: string;
  subtitle?: string;
  priceLabel?: string;
  tier?: AssetPerkTier;
  roleTag?: string;
  perks?: AssetPerk[];
  metaLine?: string;
  equipped?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
}

export function CatalogItemCard({
  title,
  subtitle,
  priceLabel,
  tier,
  roleTag,
  perks = [],
  metaLine,
  equipped,
  onPress,
  trailing,
  actions,
}: CatalogItemCardProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const chips = perks.slice(0, 3);

  const body = (
    <View
      style={[
        styles.card,
        {
          borderColor: equipped ? colors.gold : colors.border,
          backgroundColor: colors.bgCard,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            {tier ? (
              <View style={[styles.badge, { backgroundColor: `${colors.teal}22` }]}>
                <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold, fontSize: 10 }}>
                  {tierLabel(tier)}
                </Text>
              </View>
            ) : null}
            {roleTag ? (
              <View style={[styles.badge, { backgroundColor: `${colors.orchid}22` }]}>
                <Text
                  style={{
                    color: colors.orchid,
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 10,
                    textTransform: 'capitalize',
                  }}
                >
                  {roleTag}
                </Text>
              </View>
            ) : null}
            {equipped ? (
              <View style={[styles.badge, { backgroundColor: `${colors.gold}22` }]}>
                <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 10 }}>
                  Equipped
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 15, marginTop: 4 }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
          {metaLine ? (
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
              {metaLine}
            </Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.perkRow}>
              {chips.map((perk) => (
                <View
                  key={perk.id}
                  style={[styles.perkChip, { borderColor: colors.border, backgroundColor: colors.bg2 }]}
                >
                  <Text
                    style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 10 }}
                    numberOfLines={1}
                  >
                    {perk.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        {trailing ? <View style={{ marginLeft: 8 }}>{trailing}</View> : null}
      </View>
      {priceLabel ? (
        <Text style={{ color: colors.teal, fontFamily: fonts.monoSemiBold, fontSize: 12, marginTop: 8 }}>
          {priceLabel}
        </Text>
      ) : null}
      {actions}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityLabel={title}>
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  perkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  perkChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
});
