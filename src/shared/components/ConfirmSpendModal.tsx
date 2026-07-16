import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { ModalPrimaryButton } from './ModalPrimaryButton';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  costLabel?: string;
  warningLevel?: 'info' | 'debt' | 'illegal';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSpendModal({
  visible,
  title,
  message,
  costLabel,
  warningLevel = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const accent = warningLevel === 'illegal'
    ? colors.crimson
    : warningLevel === 'debt'
      ? colors.gold
      : colors.teal;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.t2, fontFamily: fonts.body }]}>{message}</Text>
          {costLabel ? (
            <View style={[styles.costBanner, { backgroundColor: `${accent}15`, borderColor: `${accent}40`, borderRadius: radii.sm }]}>
              <Text style={{ color: accent, fontFamily: fonts.monoSemiBold, fontSize: 14 }}>{costLabel}</Text>
            </View>
          ) : null}
          <View style={[styles.actions, { gap: spacing.sm }]}>
            <ModalPrimaryButton
              label={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              style={styles.btn}
            />
            <ModalPrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              variant={warningLevel === 'illegal' ? 'danger' : 'primary'}
              color={accent}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { padding: 20, borderWidth: 1, gap: 12 },
  title: { fontSize: 18 },
  message: { fontSize: 14, lineHeight: 20 },
  costBanner: { padding: 10, borderWidth: 1, alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', marginTop: 4 },
  btn: { flex: 1 },
});
