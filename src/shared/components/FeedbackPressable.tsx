import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { hapticButtonPress } from '@services/haptics';
import { playSound } from '@services/audio';

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
      hapticButtonPress();
      void playSound('button_tap');
    }
    onPress?.(event);
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}
