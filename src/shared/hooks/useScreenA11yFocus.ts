import { RefObject, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/** Move screen reader focus to the heading when a screen gains navigation focus. */
export function useScreenA11yFocus(ref: RefObject<View | null>, enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      const frame = requestAnimationFrame(() => {
        const node = findNodeHandle(ref.current);
        if (node != null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      });
      return () => cancelAnimationFrame(frame);
    }, [ref, enabled]),
  );
}
