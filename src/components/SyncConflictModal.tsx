import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { FONTS, SPACING, SHADOWS, RADII } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';

export function SyncConflictModal() {
  const syncConflict = useGameStore((s) => s.syncConflict);
  const resolveChoice = useGameStore((s) => s.resolveConflictChoice);

  if (!syncConflict) return null;

  const { local, cloud } = syncConflict;

  const formatDate = (ts: number) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.container}
        >
          <Text style={styles.title}>Cloud Sync Conflict</Text>
          <Text style={styles.subtitle}>
            A discrepancy was detected between your local and cloud saves. Choose which character to keep.
          </Text>

          <View style={styles.cardsRow}>
            {/* Local Save */}
            <LinearGradient
              colors={['#064e3b', '#022c22']}
              style={[styles.card, styles.localBorder]}
            >
              <Text style={styles.cardHeader}>LOCAL SAVE</Text>
              <View style={styles.details}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.val}>{local.name}</Text>

                <Text style={styles.label}>Age</Text>
                <Text style={styles.val}>{local.age} years</Text>

                <Text style={styles.label}>Net Worth</Text>
                <Text style={styles.val}>{formatMoney(local.bankBalance)}</Text>

                <Text style={styles.label}>Last Saved</Text>
                <Text style={styles.val}>{formatDate(local.updatedAt)}</Text>
              </View>
              <Pressable
                onPress={() => resolveChoice('local')}
                style={({ pressed }) => [
                  styles.btn,
                  styles.localBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.btnText}>Use Local</Text>
              </Pressable>
            </LinearGradient>

            {/* Cloud Save */}
            <LinearGradient
              colors={['#1e3a8a', '#172554']}
              style={[styles.card, styles.cloudBorder]}
            >
              <Text style={styles.cardHeader}>CLOUD SAVE</Text>
              <View style={styles.details}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.val}>{cloud.name}</Text>

                <Text style={styles.label}>Age</Text>
                <Text style={styles.val}>{cloud.age} years</Text>

                <Text style={styles.label}>Net Worth</Text>
                <Text style={styles.val}>{formatMoney(cloud.bankBalance)}</Text>

                <Text style={styles.label}>Last Saved</Text>
                <Text style={styles.val}>{formatDate(cloud.updatedAt)}</Text>
              </View>
              <Pressable
                onPress={() => resolveChoice('cloud')}
                style={({ pressed }) => [
                  styles.btn,
                  styles.cloudBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.btnText}>Use Cloud</Text>
              </Pressable>
            </LinearGradient>
          </View>

          <Text style={styles.warning}>
            ⚠️ WARNING: The unselected save will be permanently overwritten.
          </Text>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    ...SHADOWS.card,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: '#F1F5F9',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  card: {
    flex: 1,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  localBorder: {
    borderColor: '#059669',
  },
  cloudBorder: {
    borderColor: '#2563eb',
  },
  cardHeader: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 1.2,
  },
  details: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 14,
    color: '#F8FAFC',
    marginBottom: SPACING.xs,
  },
  btn: {
    height: 40,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localBtn: {
    backgroundColor: '#059669',
  },
  cloudBtn: {
    backgroundColor: '#2563eb',
  },
  btnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  warning: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
  },
});
