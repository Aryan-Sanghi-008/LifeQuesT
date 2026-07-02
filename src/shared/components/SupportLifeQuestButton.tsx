import { Pressable, Text, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { getSupportUrl } from '@config/legal';
import type { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SupportLifeQuestButtonProps {
  label?: string;
  compact?: boolean;
}

export function SupportLifeQuestButton({
  label = 'Support LifeQuest',
  compact = false,
}: SupportLifeQuestButtonProps) {
  const { colors, fonts, radii } = useTheme();
  const navigation = useNavigation<Nav>();
  const character = useGameStore((s) => s.character);
  const hasAdFree = character?.hasNoAds || character?.isPremium;

  if (!hasAdFree) return null;

  const handlePress = () => {
    const supportUrl = getSupportUrl();
    if (supportUrl) {
      void Linking.openURL(supportUrl);
      return;
    }
    navigation.navigate('Shop');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.btn,
        compact && styles.compact,
        {
          backgroundColor: `${colors.gold}18`,
          borderColor: `${colors.gold}40`,
          borderRadius: radii.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={{ color: colors.gold, fontFamily: fonts.bodySemiBold, fontSize: compact ? 13 : 14 }}>
        {label}
      </Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11, marginTop: 2 }}>
        LifeQuest Plus — thank you for your support
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    width: '100%',
  },
  compact: {
    paddingVertical: 10,
  },
});
