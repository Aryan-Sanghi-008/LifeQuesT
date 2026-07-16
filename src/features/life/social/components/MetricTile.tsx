import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export function MetricTile({ label, value, sub, accent }: MetricTileProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.sm,
        },
      ]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.6 }}>
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          color: accent ?? colors.t1,
          fontFamily: fonts.bodyBold,
          fontSize: 16,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      {sub ? (
        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11, marginTop: 2 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: '45%',
    marginBottom: 8,
  },
});
