import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { formatCurrency } from '@utils/currency';
import { ModalPrimaryButton } from '@components/ModalPrimaryButton';

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  countryCode: string;
  minAmount: number;
  suggestedAmount: number;
  maxAmount: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

function parseAmountInput(text: string): number {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function InvestAmountModal({
  visible,
  title,
  subtitle,
  countryCode,
  minAmount,
  suggestedAmount,
  maxAmount,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const fmt = (n: number) => formatCurrency(n, countryCode);
  const [text, setText] = useState(String(suggestedAmount));
  const amount = useMemo(() => parseAmountInput(text), [text]);

  useEffect(() => {
    if (visible) setText(String(suggestedAmount));
  }, [visible, suggestedAmount]);

  const cappedMax = Math.max(minAmount, maxAmount);
  const clamped = Math.min(Math.max(amount, 0), cappedMax);
  const validationError = amount > 0 && amount < minAmount
    ? `Minimum is ${fmt(minAmount)}`
    : amount > cappedMax
      ? `Maximum is ${fmt(cappedMax)}`
      : amount <= 0
        ? 'Enter an amount'
        : null;
  const canConfirm = amount >= minAmount && amount <= cappedMax;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.t3, fontFamily: fonts.body }]}>{subtitle}</Text>
          ) : null}

          <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.body }]}>Amount to invest</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            placeholder={String(suggestedAmount)}
            placeholderTextColor={colors.t4}
            style={[styles.input, { color: colors.t1, borderColor: colors.border, fontFamily: fonts.monoSemiBold, borderRadius: radii.sm }]}
            accessibilityLabel="Investment amount"
          />
          <Text style={[styles.preview, { color: colors.teal, fontFamily: fonts.monoSemiBold }]}>
            {clamped > 0 ? fmt(clamped) : '—'}
          </Text>

          <View style={styles.presets}>
            {[
              { label: 'Min', value: minAmount },
              { label: 'Suggested', value: Math.min(suggestedAmount, cappedMax) },
              { label: 'Max', value: cappedMax },
            ].map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => setText(String(preset.value))}
                style={[styles.preset, { borderColor: colors.border, borderRadius: radii.sm }]}
              >
                <Text style={{ color: colors.t2, fontFamily: fonts.bodySemiBold, fontSize: 11 }}>{preset.label}</Text>
                <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 10 }}>{fmt(preset.value)}</Text>
              </Pressable>
            ))}
          </View>

          {validationError ? (
            <Text style={{ color: colors.crimson, fontFamily: fonts.body, fontSize: 12 }}>{validationError}</Text>
          ) : (
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11 }}>
              Min {fmt(minAmount)} · Max {fmt(cappedMax)}
            </Text>
          )}

          <View style={[styles.actions, { marginTop: spacing.sm, gap: spacing.sm }]}>
            <ModalPrimaryButton
              label="Cancel"
              onPress={onCancel}
              variant="secondary"
              style={styles.btn}
            />
            <ModalPrimaryButton
              label="Invest"
              disabled={!canConfirm}
              onPress={() => onConfirm(amount)}
              color={colors.emerald}
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
  card: { padding: 20, borderWidth: 1, gap: 10 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18 },
  preview: { fontSize: 14 },
  presets: { flexDirection: 'row', gap: 8 },
  preset: { flex: 1, borderWidth: 1, padding: 8, alignItems: 'center', gap: 2 },
  actions: { flexDirection: 'row' },
  btn: { flex: 1 },
});
