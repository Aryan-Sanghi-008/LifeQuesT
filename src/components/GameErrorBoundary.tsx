import { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { recordError } from "../services/crashReporting";
import { COLORS, FONTS, RADII, SPACING, SHADOWS } from "@theme";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>
              Something went wrong — your save is safe.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.debugText}>{this.state.error.toString()}</Text>
            )}
            <Pressable
              onPress={this.handleReset}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.xl,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    ...SHADOWS.card,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.displayBold,
    color: COLORS.crimson,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.t1,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  debugText: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    color: COLORS.t3,
    backgroundColor: COLORS.bg2,
    padding: SPACING.sm,
    borderRadius: RADII.xs,
    width: "100%",
    maxHeight: 150,
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.sapphire,
    borderRadius: RADII.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: "100%",
    alignItems: "center",
    ...SHADOWS.subtle,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
  },
});
