import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import Svg, { Path } from 'react-native-svg';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showClose?: boolean;
}

export function ScreenHeader({ title, subtitle, showClose = true }: ScreenHeaderProps) {
  const navigation = useNavigation();

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
            <Path stroke={COLORS.t2} strokeWidth={2} strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  textCol: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: COLORS.t1,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.t3,
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
});
