import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, SPACING } from '@constants/theme';
import type { YearReviewSnapshot } from '@/types';
import { FOCUS_DOMAIN_MAP } from '@data/focusDomains';

interface YearReviewCardProps {
  review: YearReviewSnapshot;
  onDismiss: () => void;
}

export function YearReviewCard({ review, onDismiss }: YearReviewCardProps) {
  const focusEntries = Object.entries(review.focusAllocation ?? {}).filter(([, v]) => (v ?? 0) > 0);
  const statEntries = Object.entries(review.statDeltas ?? {}).filter(([, v]) => v !== 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Age {review.age} — Year in Review</Text>

      {focusEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus</Text>
          {focusEntries.map(([domain, pts]) => (
            <Text key={domain} style={styles.line}>
              {FOCUS_DOMAIN_MAP[domain as keyof typeof FOCUS_DOMAIN_MAP]?.label ?? domain}: {pts} pt
            </Text>
          ))}
        </View>
      )}

      {review.newMemoryTagIds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Memories</Text>
          {review.newMemoryTagIds.slice(0, 4).map(tag => (
            <Text key={tag} style={styles.line}>{tag.replace(/_/g, ' ')}</Text>
          ))}
        </View>
      )}

      {statEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stat Changes</Text>
          {statEntries.map(([key, delta]) => (
            <Text key={key} style={[styles.line, { color: (delta ?? 0) >= 0 ? COLORS.emerald : COLORS.crimson }]}>
              {key}: {(delta ?? 0) > 0 ? '+' : ''}{delta}
            </Text>
          ))}
        </View>
      )}

      <Pressable accessibilityLabel="Dismiss year review" onPress={onDismiss} style={styles.btn}>
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.t1, marginBottom: SPACING.sm },
  section: { marginTop: SPACING.sm },
  sectionTitle: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.t3, marginBottom: 4 },
  line: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t2, marginBottom: 2 },
  btn: {
    marginTop: SPACING.md,
    alignSelf: 'flex-end',
    backgroundColor: COLORS.sapphire,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  btnText: { fontFamily: FONTS.bodyBold, color: COLORS.t1, fontSize: 13 },
});
