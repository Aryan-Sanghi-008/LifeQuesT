import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { SkeletonCard } from "./SkeletonCard";

export function HydrationLoader() {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.content, { padding: spacing.lg, gap: spacing.md }]}>
        <SkeletonCard height={72} />
        <SkeletonCard height={140} />
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
