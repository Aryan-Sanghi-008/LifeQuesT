import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import type { ScenarioId } from '@/types';
import { ScenarioArt } from './ScenarioArt';
import { ScenarioArtFxLayer, ScenarioMotion } from './ScenarioMotion';
import { getScenarioVisual, type ScenarioArtVariant } from './scenarioVisuals';

export type StorefrontCardVariant = 'hero' | 'editorial';

interface Props {
  scenarioId: ScenarioId;
  name: string;
  tagline: string;
  description?: string;
  owned: boolean;
  isPremium?: boolean;
  priceLabel?: string;
  badgeSubtitle?: string;
  featured?: boolean;
  variant?: StorefrontCardVariant;
  /** Art band height; defaults to hero/card from variant */
  artSize?: 'card' | 'compact';
  enterDelay?: number;
  onPress: () => void;
}

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
      />
    </Svg>
  );
}

export function ScenarioStorefrontCard({
  scenarioId,
  name,
  tagline,
  description,
  owned,
  isPremium,
  priceLabel,
  badgeSubtitle,
  featured = false,
  variant = 'editorial',
  artSize,
  enterDelay = 0,
  onPress,
}: Props) {
  const { colors, fonts, spacing, radii } = useTheme();
  const visual = getScenarioVisual(scenarioId);
  const accent = visual.accent;
  const isHero = variant === 'hero' || featured;
  const artVariant: ScenarioArtVariant = artSize ?? (isHero ? 'hero' : 'card');

  const statusBadge = owned ? (
    <View style={[styles.badge, { backgroundColor: `${colors.emerald}28`, borderColor: `${colors.emerald}50` }]}>
      <Text style={[styles.badgeText, { color: colors.emerald, fontFamily: fonts.monoSemiBold }]}>
        {badgeSubtitle ?? 'OWNED'}
      </Text>
    </View>
  ) : isPremium ? (
    <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: `${accent}55` }]}>
      <LockIcon color={colors.gold} />
      <Text style={[styles.badgeText, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
        {badgeSubtitle ?? priceLabel ?? 'Premium'}
      </Text>
    </View>
  ) : (
    <View style={[styles.badge, { backgroundColor: `${accent}30`, borderColor: `${accent}50` }]}>
      <Text style={[styles.badgeText, { color: '#FFF', fontFamily: fonts.bodySemiBold }]}>
        {badgeSubtitle ?? 'FREE'}
      </Text>
    </View>
  );

  const a11y = owned
    ? `${name}, owned`
    : isPremium
      ? `${name}, premium, ${priceLabel ?? 'locked'}`
      : `${name}, free scenario`;

  return (
    <ScenarioMotion
      scenarioId={scenarioId}
      onPress={onPress}
      enterDelay={enterDelay}
      accessibilityLabel={a11y}
      style={[
        styles.card,
        {
          borderColor: `${accent}40`,
          borderRadius: radii.lg,
          backgroundColor: colors.bgCard,
        },
      ]}
    >
      <View style={styles.artWrap}>
        <ScenarioArt scenarioId={scenarioId} variant={artVariant}>
          <View style={[styles.artChrome, { padding: spacing.sm }]}>
            <View style={styles.artTopRow}>
              {featured ? (
                <View style={[styles.featuredChip, { backgroundColor: `${colors.gold}30`, borderColor: `${colors.gold}60` }]}>
                  <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1 }}>
                    FEATURED
                  </Text>
                </View>
              ) : (
                <View />
              )}
              {statusBadge}
            </View>
            {isHero && (
              <View style={styles.heroTitleBlock}>
                <Text
                  style={[styles.heroName, { color: '#FFF', fontFamily: fonts.displayBold }]}
                  numberOfLines={2}
                >
                  {name}
                </Text>
                <Text
                  style={[styles.heroTagline, { color: accent, fontFamily: fonts.bodySemiBold }]}
                  numberOfLines={1}
                >
                  {tagline}
                </Text>
              </View>
            )}
          </View>
          <ScenarioArtFxLayer scenarioId={scenarioId} />
        </ScenarioArt>
      </View>

      <View style={[styles.body, { padding: spacing.md, gap: spacing.xs }]}>
        {!isHero && (
          <>
            <Text style={[styles.name, { color: colors.t1, fontFamily: fonts.displayBold }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.tagline, { color: accent, fontFamily: fonts.bodySemiBold }]} numberOfLines={1}>
              {tagline}
            </Text>
          </>
        )}
        {!!description && (
          <Text
            style={[styles.desc, { color: colors.t3, fontFamily: fonts.body }]}
            numberOfLines={isHero ? 3 : 2}
          >
            {description}
          </Text>
        )}
      </View>
    </ScenarioMotion>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  artWrap: {
    width: '100%',
  },
  artChrome: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  artTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
  },
  heroTitleBlock: {
    gap: 2,
  },
  heroName: {
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTagline: {
    fontSize: 13,
  },
  body: {},
  name: {
    fontSize: 16,
  },
  tagline: {
    fontSize: 12,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
