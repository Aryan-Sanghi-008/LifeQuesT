import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { triggerTapFeedback } from '@services/gameFeedback';

interface FeedbackPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  feedback?: boolean;
}

/** Pressable that triggers standard game tap sound + haptic. */
export function FeedbackPressable({
  onPress,
  feedback = true,
  children,
  ...rest
}: FeedbackPressableProps) {
  const handlePress: PressableProps['onPress'] = (event) => {
    if (feedback) {
      triggerTapFeedback();
    }
    onPress?.(event);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}
