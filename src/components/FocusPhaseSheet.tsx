import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, SPACING } from '@constants/theme';
import { BottomSheet } from '@components/BottomSheet';
import { FOCUS_DOMAINS } from '@data/focusDomains';
import type { FocusAllocation, FocusDomain } from '@/types';
import { useGameStore } from '@store/gameStore';
import { FOCUS_POINTS_PER_YEAR, getAutoChildFocus } from '@engine/focusEngine';

interface FocusPhaseSheetProps {
  visible: boolean;
  age: number;
  familyBackground: Parameters<typeof getAutoChildFocus>[0]['familyBackground'];
}

export function FocusPhaseSheet({ visible, age, familyBackground }: FocusPhaseSheetProps) {
  const setFocusAllocation = useGameStore(s => s.setFocusAllocation);
  const confirmFocusAndAct = useGameStore(s => s.confirmFocusAndAct);
  const [allocation, setAllocation] = useState<FocusAllocation>({});

  const isChild = age <= 12;
  const autoFocus = useMemo(
    () => getAutoChildFocus({ familyBackground }),
    [familyBackground],
  );

  const used = Object.values(allocation).reduce((sum, n) => sum + (n ?? 0), 0);
  const remaining = FOCUS_POINTS_PER_YEAR - used;

  const adjust = (domain: FocusDomain, delta: number) => {
    setAllocation(prev => {
      const current = prev[domain] ?? 0;
      const nextVal = Math.max(0, Math.min(2, current + delta));
      const next = { ...prev, [domain]: nextVal };
      if (nextVal === 0) delete next[domain];
      return next;
    });
  };

  const handleConfirm = () => {
    if (isChild) {
      confirmFocusAndAct();
      return;
    }
    setFocusAllocation(allocation);
    confirmFocusAndAct();
  };

  return (
    <BottomSheet visible={visible} onClose={() => {}} title="Plan Your Year">
      <Text style={styles.subtitle}>
        {isChild
          ? 'Your guardians shape this year for you.'
          : `Allocate ${FOCUS_POINTS_PER_YEAR} focus points before aging up.`}
      </Text>

      {isChild ? (
        <View style={styles.autoList}>
          {FOCUS_DOMAINS.filter(d => autoFocus[d.id]).map(d => (
            <Text key={d.id} style={styles.autoItem}>
              {d.label}: {autoFocus[d.id]} pt
            </Text>
          ))}
        </View>
      ) : (
        <>
          <Text style={styles.remaining}>{remaining} point{remaining === 1 ? '' : 's'} left</Text>
          {FOCUS_DOMAINS.map(domain => {
            const points = allocation[domain.id] ?? 0;
            return (
              <View key={domain.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.domainLabel}>{domain.label}</Text>
                  <Text style={styles.domainDesc}>{domain.description}</Text>
                </View>
                <View style={styles.counter}>
                  <Pressable
                    accessibilityLabel={`Decrease ${domain.label} focus`}
                    onPress={() => adjust(domain.id, -1)}
                    style={styles.counterBtn}
                  >
                    <Text style={styles.counterBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.counterVal}>{points}</Text>
                  <Pressable
                    accessibilityLabel={`Increase ${domain.label} focus`}
                    onPress={() => remaining > 0 && points < 2 && adjust(domain.id, 1)}
                    style={[styles.counterBtn, remaining <= 0 || points >= 2 ? styles.counterBtnDisabled : null]}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}

      <Pressable
        accessibilityLabel="Confirm focus plan"
        onPress={handleConfirm}
        disabled={!isChild && remaining !== 0}
        style={[styles.confirmBtn, !isChild && remaining !== 0 ? styles.confirmBtnDisabled : null]}
      >
        <Text style={styles.confirmText}>{isChild ? 'Continue' : 'Confirm Focus'}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, marginBottom: SPACING.md },
  remaining: { fontFamily: FONTS.monoSemiBold, color: COLORS.gold, marginBottom: SPACING.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowText: { flex: 1, paddingRight: SPACING.sm },
  domainLabel: { fontFamily: FONTS.bodyBold, color: COLORS.t1, fontSize: 14 },
  domainDesc: { fontFamily: FONTS.body, color: COLORS.t4, fontSize: 11, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: { opacity: 0.35 },
  counterBtnText: { fontFamily: FONTS.bodyBold, color: COLORS.t1, fontSize: 16 },
  counterVal: { fontFamily: FONTS.monoSemiBold, color: COLORS.t1, minWidth: 16, textAlign: 'center' },
  confirmBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmText: { fontFamily: FONTS.bodyBold, color: COLORS.bg, fontSize: 15 },
  autoList: { gap: 6, marginBottom: SPACING.md },
  autoItem: { fontFamily: FONTS.body, color: COLORS.t2, fontSize: 13 },
});
