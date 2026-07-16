import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import type { ScenarioId } from '@/types';
import {
  ART_HEIGHT,
  getScenarioVisual,
  motifOpacity,
  type ScenarioArtVariant,
  type ScenarioMotif,
} from './scenarioVisuals';

interface Props {
  scenarioId: ScenarioId;
  variant?: ScenarioArtVariant;
  /** Extra overlay opacity 0–1 for press/enter FX driven by parent */
  fxOverlayOpacity?: number;
  children?: React.ReactNode;
}

function MotifSvg({
  motif,
  accent,
  opacity,
  width,
  height,
}: {
  motif: ScenarioMotif;
  accent: string;
  opacity: number;
  width: number;
  height: number;
}) {
  const a = accent;
  const o = opacity;

  switch (motif) {
    case 'horizon':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Ellipse cx="100" cy="95" rx="90" ry="18" fill={a} opacity={o * 0.25} />
          <Path d="M0 78 Q50 58 100 72 T200 68 L200 120 L0 120 Z" fill={a} opacity={o * 0.2} />
          <Circle cx="158" cy="28" r="14" fill={a} opacity={o * 0.35} />
          <Circle cx="158" cy="28" r="22" fill={a} opacity={o * 0.12} />
        </Svg>
      );
    case 'embers':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          {[
            [40, 90, 4], [55, 70, 3], [70, 85, 5], [90, 55, 3.5],
            [110, 75, 4], [130, 48, 3], [150, 68, 4.5],
          ].map(([cx, cy, r], i) => (
            <Circle key={i} cx={cx} cy={cy} r={r} fill={a} opacity={o * (0.35 + (i % 3) * 0.1)} />
          ))}
          <Path d="M30 110 L70 40 L85 70 L110 25 L140 80 L170 45" stroke={a} strokeWidth={1.2} fill="none" opacity={o * 0.4} />
        </Svg>
      );
    case 'spoon':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Ellipse cx="130" cy="38" rx="28" ry="18" fill={a} opacity={o * 0.3} />
          <Rect x="122" y="52" width="16" height="48" rx="6" fill={a} opacity={o * 0.35} />
          <Path d="M20 100 H180" stroke={a} strokeWidth={1} opacity={o * 0.2} />
          <Ellipse cx="60" cy="90" rx="40" ry="6" fill="#FFF" opacity={o * 0.08} />
        </Svg>
      );
    case 'crown':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Path
            d="M50 85 L60 40 L85 65 L100 28 L115 65 L140 40 L150 85 Z"
            fill={a}
            opacity={o * 0.35}
          />
          <Rect x="50" y="85" width="100" height="10" rx="2" fill={a} opacity={o * 0.4} />
          {[70, 100, 130].map((x) => (
            <Line key={x} x1={x} y1={20} x2={x} y2={8} stroke={a} strokeWidth={1.5} opacity={o * 0.5} />
          ))}
          <Circle cx="100" cy="18" r="4" fill={a} opacity={o * 0.6} />
        </Svg>
      );
    case 'alley':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Rect x="20" y="20" width="50" height="100" fill={a} opacity={o * 0.15} />
          <Rect x="130" y="10" width="55" height="110" fill={a} opacity={o * 0.2} />
          <Path d="M70 120 L100 40 L130 120" fill={a} opacity={o * 0.12} />
          {[35, 50, 145, 160].map((x) => (
            <Rect key={x} x={x} y={30} width="8" height="10" fill={a} opacity={o * 0.35} />
          ))}
          <Circle cx="100" cy="55" r="3" fill={a} opacity={o * 0.7} />
          <Circle cx="88" cy="70" r="2" fill={a} opacity={o * 0.5} />
          <Circle cx="112" cy="70" r="2" fill={a} opacity={o * 0.5} />
        </Svg>
      );
    case 'grid':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          {Array.from({ length: 8 }, (_, i) => (
            <Line key={`v${i}`} x1={20 + i * 22} y1={10} x2={20 + i * 22} y2={110} stroke={a} strokeWidth={0.8} opacity={o * 0.25} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <Line key={`h${i}`} x1={10} y1={20 + i * 20} x2={190} y2={20 + i * 20} stroke={a} strokeWidth={0.8} opacity={o * 0.2} />
          ))}
          <Path d="M10 30 L190 90" stroke={a} strokeWidth={1.5} opacity={o * 0.45} />
          <Circle cx="160" cy="35" r="6" fill={a} opacity={o * 0.5} />
        </Svg>
      );
    case 'blade':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Path d="M100 15 L108 70 L100 105 L92 70 Z" fill={a} opacity={o * 0.4} />
          <Rect x="88" y="70" width="24" height="8" rx="2" fill={a} opacity={o * 0.5} />
          <Path d="M40 90 Q100 60 160 90" stroke={a} strokeWidth={1} fill="none" opacity={o * 0.25} />
          {[45, 70, 130, 155].map((x, i) => (
            <Circle key={x} cx={x} cy={85 - (i % 2) * 12} r={2} fill={a} opacity={o * 0.35} />
          ))}
        </Svg>
      );
    case 'fog':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Ellipse cx="60" cy="80" rx="55" ry="22" fill={a} opacity={o * 0.25} />
          <Ellipse cx="140" cy="70" rx="60" ry="28" fill={a} opacity={o * 0.2} />
          <Ellipse cx="100" cy="100" rx="80" ry="18" fill={a} opacity={o * 0.3} />
          <Path d="M70 40 L75 55 L85 45 L90 60 L100 40" stroke={a} strokeWidth={1.5} fill="none" opacity={o * 0.4} />
        </Svg>
      );
    case 'habitat':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Circle cx="100" cy="55" r="32" stroke={a} strokeWidth={2} fill="none" opacity={o * 0.45} />
          <Circle cx="100" cy="55" r="22" stroke={a} strokeWidth={1.2} fill="none" opacity={o * 0.3} />
          <Rect x="88" y="78" width="24" height="18" rx="3" fill={a} opacity={o * 0.35} />
          {[30, 50, 150, 170].map((x, i) => (
            <Circle key={x} cx={x} cy={40 + (i % 2) * 30} r={2.5} fill={a} opacity={o * 0.4} />
          ))}
          <Ellipse cx="100" cy="110" rx="70" ry="8" fill={a} opacity={o * 0.2} />
        </Svg>
      );
    case 'stars':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={a} stopOpacity={o * 0.5} />
              <Stop offset="1" stopColor={a} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Path d="M80 0 L100 70 L120 0 Z" fill="url(#spot)" />
          {[
            [40, 30], [55, 55], [140, 25], [160, 50], [175, 35], [30, 70],
          ].map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.5 : 1.8} fill={a} opacity={o * (0.4 + (i % 3) * 0.15)} />
          ))}
        </Svg>
      );
    case 'runes':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          <Circle cx="100" cy="55" r="28" stroke={a} strokeWidth={1.5} fill="none" opacity={o * 0.35} />
          <Circle cx="100" cy="55" r="16" stroke={a} strokeWidth={1} fill="none" opacity={o * 0.45} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 100 + Math.cos(rad) * 40;
            const y = 55 + Math.sin(rad) * 40;
            return <Circle key={deg} cx={x} cy={y} r={3} fill={a} opacity={o * 0.5} />;
          })}
          <Path d="M92 48 L100 62 L108 48" stroke={a} strokeWidth={1.5} fill="none" opacity={o * 0.55} />
        </Svg>
      );
    case 'columns':
      return (
        <Svg width={width} height={height} viewBox="0 0 200 120" style={StyleSheet.absoluteFill}>
          {[55, 85, 115, 145].map((x) => (
            <Rect key={x} x={x} y={35} width="14" height="70" rx="2" fill={a} opacity={o * 0.28} />
          ))}
          <Rect x="45" y="28" width="110" height="10" rx="2" fill={a} opacity={o * 0.35} />
          <Circle cx="100" cy="70" r="14" stroke={a} strokeWidth={1.5} fill="none" opacity={o * 0.4} />
          <Path d="M100 58 L100 82 M90 70 L110 70" stroke={a} strokeWidth={1.5} opacity={o * 0.45} />
        </Svg>
      );
    default:
      return null;
  }
}

/** Thematic FX overlays rendered on enter/press — parent drives opacity */
export function ScenarioFxOverlay({
  scenarioId,
  opacity,
  width = 200,
  height = 120,
}: {
  scenarioId: ScenarioId;
  opacity: number;
  width?: number;
  height?: number;
}) {
  const visual = getScenarioVisual(scenarioId);
  if (opacity <= 0.01) return null;
  const a = visual.accent;

  switch (visual.fxPreset) {
    case 'scanline':
      return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: '35%', height: 2, backgroundColor: a, opacity: 0.7 }} />
          <View style={{ position: 'absolute', left: 0, right: 0, top: '55%', height: 1, backgroundColor: a, opacity: 0.4 }} />
        </View>
      );
    case 'edge_pulse':
      return (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderWidth: 1.5, borderColor: a, opacity: opacity * 0.8 },
          ]}
        />
      );
    case 'highlight_sweep':
    case 'gold_glint':
    case 'wash':
      return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: opacity * 0.35, backgroundColor: a }]} />
      );
    case 'star_spotlight':
      return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
          <LinearGradient
            colors={[`${a}66`, `${a}00`]}
            style={{ position: 'absolute', top: 0, alignSelf: 'center', width: '40%', height: '70%' }}
          />
        </View>
      );
    case 'fog_hazard':
      return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: opacity * 0.3, backgroundColor: a }]} />
      );
    case 'seal_flash':
      return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity }]}>
          <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: a, opacity: 0.8 }} />
        </View>
      );
    case 'sparkle_up':
    case 'dust_drift':
    case 'dust_glow':
    case 'rune_orbit':
      return (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Circle
              key={i}
              cx={30 + i * 28}
              cy={90 - ((opacity * 40 + i * 8) % 70)}
              r={2}
              fill={a}
              opacity={opacity * (0.4 + (i % 3) * 0.15)}
            />
          ))}
        </Svg>
      );
    default:
      return null;
  }
}

export function ScenarioArt({
  scenarioId,
  variant = 'card',
  fxOverlayOpacity = 0,
  children,
}: Props) {
  const visual = getScenarioVisual(scenarioId);
  const height = ART_HEIGHT[variant];
  const opacity = motifOpacity(visual.intensity);

  return (
    <View style={[styles.root, { height }]} accessibilityElementsHidden>
      <LinearGradient
        colors={visual.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <MotifSvg
        motif={visual.motif}
        accent={visual.accent}
        opacity={opacity}
        width={400}
        height={height}
      />
      <ScenarioFxOverlay scenarioId={scenarioId} opacity={fxOverlayOpacity} height={height} />
      {/* Bottom scrim for text legibility when children sit on art */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={styles.scrim}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
});
