import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { LifeEventRecord } from '@/types';

export function BestMomentsGallery({ events }: { events: LifeEventRecord[] }) {
  const { colors, fonts, radii, spacing } = useTheme();

  const scored = events
    .map((e) => {
      const magnitude = Object.values(e.statEffect).reduce<number>(
        (sum, v) => sum + Math.abs((v as number) ?? 0),
        0,
      );
      return { event: e, score: magnitude };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
        BEST MOMENTS
      </Text>
      {scored.map(({ event }, i) => (
        <View
          key={event.id}
          style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.md }]}
        >
          <View style={[styles.rank, { backgroundColor: `${event.color ?? colors.sapphire}20` }]}>
            <Text style={{ color: event.color ?? colors.sapphire, fontFamily: fonts.displayBold, fontSize: 16 }}>
              {i + 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{event.title}</Text>
            <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12 }}>Age {event.age}</Text>
          </View>
          {event.rarity && (
            <View style={[styles.rarityBadge, { backgroundColor: `${event.color ?? colors.gold}20` }]}>
              <Text style={{ color: event.color ?? colors.gold, fontFamily: fonts.bodyBold, fontSize: 10 }}>
                {event.rarity.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1 },
  rank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rarityBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
});
