import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@theme";

export function EmptyLifeLog() {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.t3, fontFamily: fonts.body }]}>
        No events recorded yet. Tap Age Up to begin!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: 32, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
