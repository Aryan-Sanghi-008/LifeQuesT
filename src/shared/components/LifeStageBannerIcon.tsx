import type { ReactNode } from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type LifeStageKey = 'child' | 'teen' | 'young' | 'adult' | 'senior';

const STAGE_SVGS: Record<LifeStageKey, (color: string) => ReactNode> = {
  child: (color) => (
    <>
      <Circle cx="20" cy="14" r="6" fill={color} opacity={0.9} />
      <Path d="M12 28 Q20 22 28 28 L28 34 L12 34 Z" fill={color} opacity={0.75} />
    </>
  ),
  teen: (color) => (
    <>
      <Rect x="10" y="8" width="20" height="14" rx="3" fill={color} opacity={0.85} />
      <Path d="M8 30 L32 30 L28 22 L12 22 Z" fill={color} opacity={0.6} />
    </>
  ),
  young: (color) => (
    <>
      <Path d="M20 6 L26 18 L38 20 L28 28 L30 40 L20 34 L10 40 L12 28 L2 20 L14 18 Z" fill={color} opacity={0.8} />
    </>
  ),
  adult: (color) => (
    <>
      <Rect x="14" y="10" width="12" height="16" rx="2" fill={color} opacity={0.85} />
      <Path d="M8 32 L32 32 L28 24 L12 24 Z" fill={color} opacity={0.55} />
      <Circle cx="20" cy="8" r="4" fill={color} />
    </>
  ),
  senior: (color) => (
    <>
      <Circle cx="20" cy="12" r="7" fill="none" stroke={color} strokeWidth={2} />
      <Path d="M10 30 Q20 24 30 30" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M14 18 Q20 14 26 18" stroke={color} strokeWidth={1.5} fill="none" />
    </>
  ),
};

export function getLifeStageKey(age: number): LifeStageKey {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 29) return 'young';
  if (age <= 59) return 'adult';
  return 'senior';
}

interface Props {
  age: number;
  color: string;
  size?: number;
}

export function LifeStageBannerIcon({ age, color, size = 40 }: Props) {
  const key = getLifeStageKey(age);
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {STAGE_SVGS[key](color)}
    </Svg>
  );
}
