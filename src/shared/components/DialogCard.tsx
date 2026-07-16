import { ReactNode } from 'react';
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@theme';
import { ModalPrimaryButton, type ModalButtonVariant } from './ModalPrimaryButton';

// ─── DialogCard ──────────────────────────────────────────────────────────────
// Standard overlay + card shell used by all modals in the app.
// Replaces duplicate `padding: 24 / 20` inline styles across ConfirmSpendModal,
// ContextualTutorial, TutorialOverlay, and MysteryBoxScreen ResultModal.

interface DialogCardProps {
  visible: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** If true, tapping the dim overlay dismisses the dialog */
  dismissOnOverlay?: boolean;
}

export function DialogCard({
  visible,
  onDismiss,
  children,
  style,
  dismissOnOverlay = false,
}: DialogCardProps) {
  const { colors, radii } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}
        onPress={dismissOnOverlay ? onDismiss : undefined}
        accessible={false}
      >
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border },
            style,
          ]}
          onPress={() => {}}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── ModalActions ─────────────────────────────────────────────────────────────
// Standardised button row for dialog footers.

interface ActionButton {
  label: string;
  onPress: () => void;
  variant?: ModalButtonVariant;
  color?: string;
}

interface ModalActionsProps {
  actions: ActionButton[];
}

export function ModalActions({ actions }: ModalActionsProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.actions, { gap: spacing.sm }]}>
      {actions.map((a) => (
        <ModalPrimaryButton
          key={a.label}
          label={a.label}
          onPress={a.onPress}
          variant={a.variant ?? 'primary'}
          color={a.color}
          style={styles.actionBtn}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
  },
});
