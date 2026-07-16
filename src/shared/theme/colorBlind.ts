/** Color-blind simulation for red/green confusable palette tokens. */

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia';

/** Brettel/Vienot-style linear RGB matrices (row-major 3×3). */
const PROTANOPIA_MATRIX = [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758];
const DEUTERANOPIA_MATRIX = [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7];

/** Tokens where red/green distinction matters for gameplay readability. */
const COLOR_BLIND_KEYS = [
  'health',
  'happiness',
  'wealth',
  'fitness',
  'emerald',
  'emerald2',
  'emeraldBorder',
  'crimson',
  'crimson2',
  'crimsonBorder',
  'teal',
  'teal2',
  'catHealth',
  'catCareer',
  'catEducation',
  'catMilestone',
] as const;

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return [r, g, b];
  }
  return null;
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const rr = clamp(r).toString(16).padStart(2, '0');
  const gg = clamp(g).toString(16).padStart(2, '0');
  const bb = clamp(b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`.toUpperCase();
}

function applyMatrix(r: number, g: number, b: number, m: number[]): [number, number, number] {
  return [
    r * m[0] + g * m[1] + b * m[2],
    r * m[3] + g * m[4] + b * m[5],
    r * m[6] + g * m[7] + b * m[8],
  ];
}

export function simulateHexColor(hex: string, mode: ColorBlindMode): string {
  if (mode === 'none') return hex;
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const matrix = mode === 'protanopia' ? PROTANOPIA_MATRIX : DEUTERANOPIA_MATRIX;
  const [r, g, b] = applyMatrix(rgb[0], rgb[1], rgb[2], matrix);
  return toHex(r, g, b);
}

export function applyColorBlindMode<T extends Record<string, string>>(
  colors: T,
  mode: ColorBlindMode,
): T {
  if (mode === 'none') return colors;
  const out: Record<string, string> = { ...colors };
  for (const key of COLOR_BLIND_KEYS) {
    if (key in out && typeof out[key] === 'string' && out[key].startsWith('#')) {
      out[key] = simulateHexColor(out[key], mode);
    }
  }
  return out as T;
}
