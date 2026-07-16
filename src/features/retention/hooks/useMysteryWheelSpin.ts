import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const MYSTERY_WHEEL_SEGMENT_COUNT = 8;
const SEGMENT_DEG = 360 / MYSTERY_WHEEL_SEGMENT_COUNT;

export type WheelSpinPhase = 'idle' | 'spinning' | 'landed';

export function computeWheelTargetDegrees(
  pickedIndex: number,
  accumulatedDeg: number,
  fullRotations: number,
): number {
  const segCenter = pickedIndex * SEGMENT_DEG + SEGMENT_DEG / 2;
  const alignmentDeg = (360 - segCenter) % 360;
  return accumulatedDeg + fullRotations * 360 + alignmentDeg;
}

type SpinOptions = {
  pickedIndex: number;
  reducedMotion: boolean;
  onSpinStart?: () => void;
  onLanded?: () => void;
  onComplete: () => void;
};

export function useMysteryWheelSpin() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const accumulatedDeg = useRef(0);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 360, 720, 1080, 1440, 1800, 2160, 2520, 2880],
    outputRange: [
      '0deg',
      '360deg',
      '720deg',
      '1080deg',
      '1440deg',
      '1800deg',
      '2160deg',
      '2520deg',
      '2880deg',
    ],
    extrapolate: 'extend',
  });

  const clearRevealTimeout = useCallback(() => {
    if (revealTimeout.current) {
      clearTimeout(revealTimeout.current);
      revealTimeout.current = null;
    }
  }, []);

  const spinToSegment = useCallback(
    ({
      pickedIndex,
      reducedMotion,
      onSpinStart,
      onLanded,
      onComplete,
    }: SpinOptions) => {
      clearRevealTimeout();
      rotateAnim.stopAnimation((currentDeg) => {
        accumulatedDeg.current = typeof currentDeg === 'number' ? currentDeg : accumulatedDeg.current;

        const fullRotations = reducedMotion
          ? 1
          : 5 + Math.floor(Math.random() * 2);
        const duration = reducedMotion ? 1200 : 4200 + Math.floor(Math.random() * 600);
        const landPauseMs = reducedMotion ? 250 : 650;

        const targetDeg = computeWheelTargetDegrees(
          pickedIndex,
          accumulatedDeg.current,
          fullRotations,
        );

        onSpinStart?.();

        Animated.timing(rotateAnim, {
          toValue: targetDeg,
          duration,
          easing: Easing.bezier(0.1, 0.85, 0.15, 1),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          accumulatedDeg.current = targetDeg;
          onLanded?.();

          revealTimeout.current = setTimeout(() => {
            revealTimeout.current = null;
            onComplete();
          }, landPauseMs);
        });
      });
    },
    [clearRevealTimeout, rotateAnim],
  );

  const resetWheel = useCallback(() => {
    clearRevealTimeout();
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
    accumulatedDeg.current = 0;
  }, [clearRevealTimeout, rotateAnim]);

  return {
    rotateDeg,
    spinToSegment,
    resetWheel,
    clearRevealTimeout,
  };
}
