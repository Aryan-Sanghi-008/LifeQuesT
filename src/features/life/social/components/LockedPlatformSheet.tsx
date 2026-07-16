import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles, useTheme } from '@theme';
import type { SocialPlatformDef } from '@data/socialPlatforms';
import { getProductionCostLocal } from '@engine/socialMediaEngine';
import { formatCurrencyFull, getCurrencyInfo } from '@utils/currency';

const SHEET_SCROLL_MAX = Math.round(Dimensions.get('window').height * 0.6);

interface LockedPlatformSheetProps {
  platform: SocialPlatformDef;
  visible: boolean;
  characterAge: number;
  countryCode: string;
  canOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function LockedPlatformSheet({
  platform,
  visible,
  characterAge,
  countryCode,
  canOpen,
  onClose,
  onOpen,
}: LockedPlatformSheetProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const styles = useThemedStyles(createStyles);
  const yearsLeft = Math.max(0, platform.unlockAge - characterAge);
  const { symbol } = getCurrencyInfo(countryCode);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlayScrim }]}
        onPress={onClose}
        accessibilityLabel="Close preview"
      >
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.bg, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={platform.theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: radii.md }]}
          >
            <Text style={{ color: platform.theme.textOnAccent, fontFamily: fonts.displayBold, fontSize: 22 }}>
              {platform.label}
            </Text>
            <Text style={{ color: platform.theme.textOnAccent, opacity: 0.85, fontFamily: fonts.body, marginTop: 4 }}>
              {platform.niche}
            </Text>
          </LinearGradient>

          <ScrollView style={{ maxHeight: SHEET_SCROLL_MAX, marginTop: spacing.md }}>
            <Text style={{ color: colors.t2, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 }}>
              {platform.blurb}
            </Text>
            <Text
              style={{
                color: colors.t4,
                fontFamily: fonts.bodySemiBold,
                fontSize: 10,
                letterSpacing: 1,
                marginTop: spacing.md,
              }}
            >
              SAMPLE COSTS ({symbol})
            </Text>
            {platform.featuredContent.map((ct) => (
              <Text
                key={ct}
                style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}
              >
                · {ct}: {formatCurrencyFull(getProductionCostLocal(platform.id, ct, countryCode), countryCode)}
              </Text>
            ))}
            <Text
              style={{
                color: colors.t4,
                fontFamily: fonts.bodySemiBold,
                fontSize: 10,
                letterSpacing: 1,
                marginTop: spacing.md,
              }}
            >
              EARN ACTIONS
            </Text>
            {platform.monetization.map((m) => (
              <Text
                key={m.kind}
                style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}
              >
                · {m.label} — from {m.minFollowers.toLocaleString()} followers
              </Text>
            ))}
            {!canOpen ? (
              <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 13, marginTop: spacing.md }}>
                Unlocks at age {platform.unlockAge}
                {yearsLeft > 0 ? ` · ${yearsLeft} year${yearsLeft === 1 ? '' : 's'} left` : ''}
              </Text>
            ) : (
              <Text style={{ color: colors.emerald, fontFamily: fonts.bodySemiBold, fontSize: 13, marginTop: spacing.md }}>
                You meet the age requirement — open your account!
              </Text>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close"
              style={[styles.btn, { flex: 1, borderColor: colors.border, borderWidth: 1 }]}
            >
              <Text style={{ color: colors.t2, fontFamily: fonts.bodySemiBold, textAlign: 'center' }}>
                Close
              </Text>
            </Pressable>
            {canOpen ? (
              <Pressable
                onPress={onOpen}
                accessibilityLabel={`Open ${platform.label}`}
                style={[
                  styles.btn,
                  { flex: 1, backgroundColor: platform.theme.accent },
                ]}
              >
                <Text
                  style={{
                    color: platform.theme.textOnAccent,
                    fontFamily: fonts.bodyBold,
                    textAlign: 'center',
                  }}
                >
                  Open Account
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = ({ spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderWidth: 1,
      padding: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    hero: { padding: spacing.lg },
    btn: { paddingVertical: spacing.md, borderRadius: radii.sm },
  });
