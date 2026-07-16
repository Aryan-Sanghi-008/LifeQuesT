import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@hooks/useReducedMotion';
import type { ScenarioId } from '@/types';
import { ScenarioFxOverlay } from './ScenarioArt';
import { fxDurationMs, getScenarioVisual } from './scenarioVisuals';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FxCtx {
  fxOpacity: SharedValue<number>;
  reducedMotion: boolean;
  onEnter: () => void;
}

const ScenarioFxContext = createContext<FxCtx | null>(null);

function EnterFxTrigger() {
  const ctx = useContext(ScenarioFxContext);
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !ctx) return;
    fired.current = true;
    const t = setTimeout(() => ctx.onEnter(), 40);
    return () => clearTimeout(t);
  }, [ctx]);
  return null;
}

interface Props {
  scenarioId: ScenarioId;
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  enterDelay?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'button';
  pressable?: boolean;
}

/**
 * Enter + press motion wrapper. One-shot thematic FX on appear / press.
 * Reduced motion → static (no enter/press animation, no FX pulse).
 */
export function ScenarioMotion({
  scenarioId,
  children,
  onPress,
  disabled,
  enterDelay = 0,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
  pressable = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const visual = getScenarioVisual(scenarioId);
  const scale = useSharedValue(1);
  const fxOpacity = useSharedValue(0);
  const duration = fxDurationMs(visual.intensity);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const onEnter = useMemo(
    () => () => {
      if (reducedRef.current) return;
      fxOpacity.value = withSequence(
        withTiming(0.85, { duration: duration * 0.35, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: duration * 0.65, easing: Easing.inOut(Easing.quad) }),
      );
    },
    [duration, fxOpacity],
  );

  const firePressFx = () => {
    if (reducedMotion) return;
    fxOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: duration * 0.5 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const entering = reducedMotion
    ? undefined
    : FadeInDown.delay(enterDelay)
        .duration(Math.min(duration, 420))
        .springify()
        .damping(18);

  const onPressIn = () => {
    if (reducedMotion || disabled) return;
    scale.value = withSpring(0.975, { damping: 16, stiffness: 220 });
    firePressFx();
  };

  const onPressOut = () => {
    if (reducedMotion || disabled) return;
    scale.value = withSpring(1, { damping: 16, stiffness: 220 });
  };

  const ctxValue = useMemo<FxCtx>(
    () => ({ fxOpacity, reducedMotion, onEnter }),
    [fxOpacity, reducedMotion, onEnter],
  );

  if (!pressable) {
    return (
      <Animated.View entering={entering} style={style}>
        <ScenarioFxContext.Provider value={ctxValue}>
          <EnterFxTrigger />
          {children}
        </ScenarioFxContext.Provider>
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      entering={entering}
      onPress={onPress}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[style, animatedStyle]}
      android_ripple={
        onPress && !disabled ? { color: `${visual.accent}18` } : undefined
      }
    >
      <ScenarioFxContext.Provider value={ctxValue}>
        <EnterFxTrigger />
        {children}
      </ScenarioFxContext.Provider>
    </AnimatedPressable>
  );
}

/** Absolute overlay driven by ScenarioMotion FX shared value */
export function ScenarioArtFxLayer({ scenarioId }: { scenarioId: ScenarioId }) {
  const ctx = useContext(ScenarioFxContext);
  const fallback = useSharedValue(0);
  const fxOpacity = ctx?.fxOpacity ?? fallback;
  const reduced = ctx?.reducedMotion ?? true;

  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : fxOpacity.value,
  }));

  if (!ctx || reduced) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <ScenarioFxOverlay scenarioId={scenarioId} opacity={1} />
    </Animated.View>
  );
}
