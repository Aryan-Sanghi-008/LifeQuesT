import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import type { SocialPost } from '@/types';
import { formatCurrencyFull } from '@utils/currency';

interface PostFeedCardProps {
  post: SocialPost;
  countryCode: string;
  accent?: string;
}

export function PostFeedCard({ post, countryCode, accent }: PostFeedCardProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: accent ?? colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Text style={{ color: colors.t1, fontFamily: fonts.body, fontSize: 13 }}>{post.content}</Text>
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
        Age {post.age} · {post.contentType ?? 'text'} · ❤️ {post.metrics?.likes ?? post.virality} · 👁{' '}
        {post.metrics?.views ?? '—'} · 💬 {post.metrics?.comments ?? 0} · +{post.followerDelta}{' '}
        followers
      </Text>
      {(post.cost ?? 0) > 0 ? (
        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
          Cost {formatCurrencyFull(post.cost ?? 0, countryCode)}
          {post.productionCost != null || post.marketingCost != null
            ? ` (prod ${formatCurrencyFull(post.productionCost ?? 0, countryCode)} + mkt ${formatCurrencyFull(post.marketingCost ?? 0, countryCode)})`
            : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
});
