import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { triggerTapFeedback } from '@services/gameFeedback';
import { MIN_TAP_TARGET } from '@theme/a11y';

interface FeedbackPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  feedback?: boolean;
  /** When false, skip default 44pt minimum (e.g. full-width rows). */
  enforceMinTapTarget?: boolean;
}

/** Pressable that triggers standard game tap sound + haptic. */
export function FeedbackPressable({
  onPress,
  feedback = true,
  enforceMinTapTarget = true,
  style,
  children,
  ...rest
}: FeedbackPressableProps) {
  const handlePress: PressableProps['onPress'] = (event) => {
    if (feedback) {
      triggerTapFeedback();
    }
    onPress?.(event);
  };

  const minTargetStyle = enforceMinTapTarget
    ? { minHeight: MIN_TAP_TARGET, minWidth: MIN_TAP_TARGET, justifyContent: 'center' as const }
    : undefined;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      style={[minTargetStyle, style]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
