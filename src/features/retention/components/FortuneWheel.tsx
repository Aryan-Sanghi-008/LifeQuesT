import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Path, G, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';
import { MYSTERY_SEGMENTS } from '@store/slices/progressionSlice';
import { getSegmentVisual } from './mysteryWheelTheme';

export const WHEEL_SIZE = 300;
const WHEEL_R = WHEEL_SIZE / 2;
const CX = WHEEL_R;
const CY = WHEEL_R;
const INNER_R = WHEEL_R - 22;
const LABEL_R = INNER_R * 0.62;

import type { WheelSpinPhase } from '../hooks/useMysteryWheelSpin';

type FortuneWheelProps = {
  rotateDeg: Animated.AnimatedInterpolation<string>;
  isSpinning?: boolean;
  spinPhase?: WheelSpinPhase;
  highlightReady?: boolean;
};

function wedgePath(idx: number, segDeg: number, radius: number): string {
  const startRad = ((idx * segDeg - 90) * Math.PI) / 180;
  const endRad = (((idx + 1) * segDeg - 90) * Math.PI) / 180;
  const x1 = CX + radius * Math.cos(startRad);
  const y1 = CY + radius * Math.sin(startRad);
  const x2 = CX + radius * Math.cos(endRad);
  const y2 = CY + radius * Math.sin(endRad);
  const largeArc = segDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

export function FortuneWheel({
  rotateDeg,
  isSpinning = false,
  spinPhase = 'idle',
  highlightReady = false,
}: FortuneWheelProps) {
  const { colors, fonts } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;
  const N = MYSTERY_SEGMENTS.length;
  const segDeg = 360 / N;

  useEffect(() => {
    if (!highlightReady || isSpinning || spinPhase !== 'idle') {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlightReady, isSpinning, spinPhase, pulse]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] });

  return (
    <View style={styles.stage}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowRing,
          {
            opacity: highlightReady && spinPhase === 'idle' ? glowOpacity : spinPhase === 'spinning' ? 0.5 : 0.25,
            transform: [{ scale: highlightReady && spinPhase === 'idle' ? glowScale : 1 }],
            shadowColor: colors.gold,
            backgroundColor: `${colors.gold}18`,
            borderColor: `${colors.gold}35`,
          },
        ]}
      />

      <View style={[styles.outerFrame, { borderColor: colors.gold, shadowColor: colors.gold }]}>
        <Svg width={WHEEL_SIZE + 8} height={WHEEL_SIZE + 8} style={styles.outerSvg}>
          <Defs>
            <LinearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FCD34D" />
              <Stop offset="0.5" stopColor="#F59E0B" />
              <Stop offset="1" stopColor="#D97706" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={WHEEL_R + 4}
            cy={WHEEL_R + 4}
            r={WHEEL_R - 2}
            fill="none"
            stroke="url(#rimGrad)"
            strokeWidth={6}
          />
          {Array.from({ length: N }).map((_, idx) => {
            const angle = idx * segDeg;
            const peg = polarToXY(angle, WHEEL_R - 6);
            return (
              <Circle
                key={`peg-${idx}`}
                cx={peg.x + 4}
                cy={peg.y + 4}
                r={4}
                fill="#FFF8E7"
                stroke="#D97706"
                strokeWidth={1}
              />
            );
          })}
        </Svg>

        <Animated.View
          style={[
            styles.disc,
            { transform: [{ rotate: rotateDeg }] },
          ]}
        >
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <Circle cx={CX} cy={CY} r={INNER_R + 1} fill={colors.bgCard} />

            {MYSTERY_SEGMENTS.map((seg, idx) => {
              const visual = getSegmentVisual(seg);
              const path = wedgePath(idx, segDeg, INNER_R);
              const dividerStart = polarToXY(idx * segDeg, INNER_R);
              const isEven = idx % 2 === 0;
              return (
                <G key={seg.label}>
                  <Path d={path} fill={isEven ? visual.fill : visual.fillAccent} />
                  <Path
                    d={`M ${CX} ${CY} L ${dividerStart.x} ${dividerStart.y}`}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    opacity={0.55}
                  />
                </G>
              );
            })}

            <Circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.2} />
          </Svg>

          {MYSTERY_SEGMENTS.map((seg, idx) => {
            const visual = getSegmentVisual(seg);
            const midAngle = idx * segDeg + segDeg / 2;
            const pos = polarToXY(midAngle, LABEL_R);
            const labelW = 52;
            const labelH = 44;
            return (
              <View
                key={`label-${seg.label}`}
                style={[
                  styles.segmentLabel,
                  {
                    left: pos.x - labelW / 2,
                    top: pos.y - labelH / 2,
                    width: labelW,
                    height: labelH,
                    transform: [{ rotate: `${midAngle}deg` }],
                  },
                ]}
              >
                <Text style={styles.segmentEmoji}>{visual.emoji}</Text>
                <Text
                  style={[styles.segmentShort, { fontFamily: fonts.monoSemiBold }]}
                  numberOfLines={1}
                >
                  {visual.shortLabel}
                </Text>
              </View>
            );
          })}

          <View style={styles.hubWrap}>
            <ExpoLinearGradient
              colors={['#FCD34D', '#F59E0B', '#D97706']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={[styles.hub, { borderColor: '#FFF8E7' }]}
            >
              <Text style={styles.hubEmoji}>{isSpinning ? '✨' : '🎲'}</Text>
            </ExpoLinearGradient>
          </View>
        </Animated.View>

        <View style={styles.pointerWrap} pointerEvents="none">
          <Svg width={32} height={28} viewBox="0 0 32 28">
            <Defs>
              <LinearGradient id="pointerGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FCD34D" />
                <Stop offset="1" stopColor="#D97706" />
              </LinearGradient>
            </Defs>
            <Polygon points="16,26 2,4 30,4" fill="url(#pointerGrad)" stroke="#FFF8E7" strokeWidth={1.5} />
            <Circle cx={16} cy={6} r={3} fill="#FFFFFF" opacity={0.85} />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: WHEEL_SIZE + 24,
    height: WHEEL_SIZE + 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
  outerFrame: {
    width: WHEEL_SIZE + 8,
    height: WHEEL_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (WHEEL_SIZE + 8) / 2,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  outerSvg: {
    position: 'absolute',
  },
  disc: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
  },
  segmentLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentEmoji: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  segmentShort: {
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 0.4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hubWrap: {
    position: 'absolute',
    left: CX - 26,
    top: CY - 26,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hub: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  hubEmoji: {
    fontSize: 24,
  },
  pointerWrap: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
});
