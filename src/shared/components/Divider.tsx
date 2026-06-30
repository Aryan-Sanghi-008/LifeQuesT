import { View, ViewStyle } from "react-native";
import { useTheme } from "@theme";

export function Divider({ color, style }: { color?: string; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: color ?? colors.border }, style]} />;
}
