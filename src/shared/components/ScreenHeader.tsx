import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import Svg, { Path } from 'react-native-svg';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showClose?: boolean;
}

export function ScreenHeader({ title, subtitle, showClose = true }: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { colors, fonts, radii, spacing } = useTheme();
  const styles = getStyles(colors, fonts, radii, spacing);

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showClose ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t2} strokeWidth={2} strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

const getStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  fonts: ReturnType<typeof useTheme>['fonts'],
  radii: ReturnType<typeof useTheme>['radii'],
  spacing: ReturnType<typeof useTheme>['spacing'],
) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    textCol: {
      flex: 1,
      paddingRight: spacing.md,
    },
    title: {
      fontFamily: fonts.displayBold,
      fontSize: 28,
      color: colors.t1,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.t3,
      marginTop: 4,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgCard,
    },
  });
