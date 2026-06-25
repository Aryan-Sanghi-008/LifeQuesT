import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@constants/theme';
import Svg, { Path } from 'react-native-svg';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showClose?: boolean;
}

export function ScreenHeader({ title, subtitle, showClose = true }: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 pr-3">
        <Text className="font-display-bold text-[28px] text-t-1">{title}</Text>
        {subtitle ? (
          <Text className="font-body text-[13px] text-t-3 mt-1">{subtitle}</Text>
        ) : null}
      </View>
      {showClose ? (
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-md border border-border items-center justify-center bg-bg-card"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.t2} strokeWidth={2} strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}
