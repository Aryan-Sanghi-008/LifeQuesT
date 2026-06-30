import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "@store/gameStore";
import { useThemedStyles, useTheme } from "@theme";

export function SyncConflictModal() {
  const { colors, fonts } = useTheme();
  const styles = useThemedStyles(createStyles);
  const syncConflict = useGameStore((s) => s.syncConflict);
  const resolveChoice = useGameStore((s) => s.resolveConflictChoice);

  if (!syncConflict) return null;

  const { local, cloud } = syncConflict;

  const formatDate = (ts: number) => {
    if (!ts) return "Never";
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.title, { fontFamily: fonts.displayBold, color: colors.t1 }]}>
            Cloud Sync Conflict
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fonts.body, color: colors.t3 }]}>
            A discrepancy was detected between your local and cloud saves. Choose which character to keep.
          </Text>

          <View style={styles.cardsRow}>
            <LinearGradient
              colors={[`${colors.emerald}33`, colors.bgCard]}
              style={[styles.card, { borderColor: colors.emerald }]}
            >
              <Text style={[styles.cardHeader, { fontFamily: fonts.bodyBold, color: colors.t1 }]}>
                LOCAL SAVE
              </Text>
              <View style={styles.details}>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Name</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>{local.name}</Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Age</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>{local.age} years</Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Net Worth</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
                  {formatMoney(local.bankBalance)}
                </Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Last Saved</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
                  {formatDate(local.updatedAt)}
                </Text>
              </View>
              <Pressable
                onPress={() => resolveChoice("local")}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: colors.emerald },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Use Local</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient
              colors={[`${colors.sapphire}33`, colors.bgCard]}
              style={[styles.card, { borderColor: colors.sapphire }]}
            >
              <Text style={[styles.cardHeader, { fontFamily: fonts.bodyBold, color: colors.t1 }]}>
                CLOUD SAVE
              </Text>
              <View style={styles.details}>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Name</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>{cloud.name}</Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Age</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>{cloud.age} years</Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Net Worth</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
                  {formatMoney(cloud.bankBalance)}
                </Text>
                <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>Last Saved</Text>
                <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
                  {formatDate(cloud.updatedAt)}
                </Text>
              </View>
              <Pressable
                onPress={() => resolveChoice("cloud")}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: colors.sapphire },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.btnText, { fontFamily: fonts.bodyBold }]}>Use Cloud</Text>
              </Pressable>
            </LinearGradient>
          </View>

          <Text style={[styles.warning, { color: colors.crimson, fontFamily: fonts.bodyBold }]}>
            The unselected save will be permanently overwritten.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = ({ colors, spacing, radii, shadows }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: `${colors.bg}DD`,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    container: {
      width: "100%",
      maxWidth: 600,
      borderRadius: radii.lg,
      padding: spacing.xl,
      alignItems: "center",
      borderWidth: 1,
      ...shadows.card,
    },
    title: { fontSize: 22, marginBottom: spacing.xs },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    cardsRow: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },
    card: {
      flex: 1,
      borderRadius: radii.md,
      padding: spacing.md,
      borderWidth: 1.5,
      justifyContent: "space-between",
    },
    cardHeader: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: spacing.md,
      letterSpacing: 1.2,
    },
    details: { gap: spacing.xs, marginBottom: spacing.lg },
    label: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    val: { fontSize: 14, marginBottom: spacing.xs },
    btn: {
      height: 40,
      borderRadius: radii.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    btnText: { fontSize: 14, color: "#FFFFFF" },
    warning: { fontSize: 12, textAlign: "center" },
  });
