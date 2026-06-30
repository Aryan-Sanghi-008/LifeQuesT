import { View, StyleSheet } from "react-native";
import { useTheme } from "@theme";

export function BottomSheetHandle() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
});
