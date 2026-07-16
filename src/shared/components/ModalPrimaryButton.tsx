import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme, MIN_TAP_TARGET } from '@theme';
import { triggerTapFeedback } from '@services/gameFeedback';

export type ModalButtonVariant = 'primary' | 'secondary' | 'danger';

interface ModalPrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ModalButtonVariant;
  /** Accent fill for primary (default gold). Ignored for secondary/danger. */
  color?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Compact modal / sheet CTA — clears horizontal + vertical inset so labels
 * never look glued to the button edges.
 */
export function ModalPrimaryButton({
  label,
  onPress,
  variant = 'primary',
  color,
  fullWidth = false,
  disabled = false,
  style,
  accessibilityLabel,
}: ModalPrimaryButtonProps) {
  const { colors, fonts, radii } = useTheme();

  const bg =
    variant === 'danger'
      ? colors.crimson
      : variant === 'secondary'
        ? 'transparent'
        : (color ?? colors.gold);

  const textColor =
    variant === 'secondary'
      ? colors.t2
      : colors.bg;

  const border =
    variant === 'secondary'
      ? { borderWidth: 1.5, borderColor: colors.border }
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        triggerTapFeedback();
        onPress();
      }}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderRadius: radii.md,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
          width: fullWidth ? '100%' : undefined,
        },
        border,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: textColor, fontFamily: fonts.bodyBold },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    // Compact (~10–12px vertical) but not flush; clear horizontal inset.
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: Math.max(40, MIN_TAP_TARGET - 4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
