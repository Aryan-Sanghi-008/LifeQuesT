import { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recordError } from "@services/crashReporting";
import { useTheme } from "@theme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { colors, fonts, radii, spacing, shadows } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radii.md,
      padding: spacing.xl,
      alignItems: "center",
      width: "90%",
      maxWidth: 400,
      ...shadows.card,
    },
    title: {
      fontSize: 28,
      fontFamily: fonts.displayBold,
      color: colors.crimson,
      marginBottom: spacing.md,
    },
    message: {
      fontSize: 16,
      fontFamily: fonts.bodyMedium,
      color: colors.t1,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    debugText: {
      fontSize: 12,
      fontFamily: fonts.mono,
      color: colors.t3,
      backgroundColor: colors.bg2,
      padding: spacing.sm,
      borderRadius: radii.xs,
      width: "100%",
      maxHeight: 150,
      marginBottom: spacing.xl,
    },
    button: {
      backgroundColor: colors.sapphire,
      borderRadius: radii.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      width: "100%",
      alignItems: "center",
      ...shadows.subtle,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: fonts.bodyBold,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>Something went wrong — your save is safe.</Text>
        {__DEV__ && error && <Text style={styles.debugText}>{error.toString()}</Text>}
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GameErrorBoundary caught an error", error, errorInfo);
    recordError(error);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
