/**
 * Premium theme skins — full token overlays applied within matching light/dark mode.
 * Selecting a skin transforms backgrounds, cards, text, accents, and chrome.
 */

export type ThemeSkinId =
  | 'default'
  | 'porcelain'
  | 'ivory_dawn'
  | 'coastal_mist'
  | 'obsidian'
  | 'noir_harbor'
  | 'ember_night';

export type ThemeSkinMode = 'light' | 'dark';

export interface ThemeSkinDefinition {
  id: Exclude<ThemeSkinId, 'default'>;
  mode: ThemeSkinMode;
  label: string;
  description: string;
  previewColor: string;
  /** Partial palette merge onto COLORS / DARK_COLORS */
  tokens: Record<string, string>;
  gradientHero: [string, string];
  cardChrome: string;
}

/** Map legacy theme / cosmetic IDs → new skin ids */
export const LEGACY_THEME_ID_MAP: Record<string, ThemeSkinId> = {
  dark_slate: 'obsidian',
  midnight: 'noir_harbor',
  sunrise: 'ivory_dawn',
  theme_dark_slate: 'obsidian',
  theme_midnight: 'noir_harbor',
  theme_sunrise: 'ivory_dawn',
};

export function migrateThemeSkinId(raw?: string | null): ThemeSkinId {
  if (!raw || raw === 'default') return 'default';
  if (raw in LEGACY_THEME_ID_MAP) return LEGACY_THEME_ID_MAP[raw];
  const known: ThemeSkinId[] = [
    'porcelain', 'ivory_dawn', 'coastal_mist',
    'obsidian', 'noir_harbor', 'ember_night', 'default',
  ];
  return known.includes(raw as ThemeSkinId) ? (raw as ThemeSkinId) : 'default';
}

export function cosmeticIdForThemeSkin(skinId: ThemeSkinId): string | null {
  if (skinId === 'default') return null;
  return `theme_${skinId}`;
}

export function themeSkinIdFromCosmetic(cosmeticId: string): ThemeSkinId {
  if (cosmeticId === 'theme_system_default') return 'default';
  const stripped = cosmeticId.replace(/^theme_/, '');
  return migrateThemeSkinId(stripped);
}

export const THEME_SKINS: Record<Exclude<ThemeSkinId, 'default'>, ThemeSkinDefinition> = {
  porcelain: {
    id: 'porcelain',
    mode: 'light',
    label: 'Porcelain',
    description: 'Crisp gallery white with soft ink and sapphire accents',
    previewColor: '#F8FAFC',
    gradientHero: ['#F8FAFC', '#E2E8F0'],
    cardChrome: 'rgba(15,23,42,0.06)',
    tokens: {
      bg: '#F8FAFC',
      bg2: '#F1F5F9',
      bg3: '#FFFFFF',
      bg4: '#EEF2F7',
      bgCard: '#FFFFFF',
      bgCard2: '#F8FAFC',
      bgSheet: '#FFFFFF',
      t1: '#0F172A',
      t2: '#334155',
      t3: '#64748B',
      t4: '#94A3B8',
      border: '#E2E8F0',
      border2: '#F1F5F9',
      gold: '#0EA5E9',
      gold2: '#38BDF8',
      gold3: '#0284C7',
      goldBorder: 'rgba(14,165,233,0.35)',
      sapphire: '#2563EB',
      sapphire2: '#1D4ED8',
      overlayScrim: 'rgba(15, 23, 42, 0.38)',
      shadowCard: 'rgba(15,23,42,0.07)',
    },
  },
  ivory_dawn: {
    id: 'ivory_dawn',
    mode: 'light',
    label: 'Ivory Dawn',
    description: 'Warm parchment light with amber-gold highlights',
    previewColor: '#FFFBEB',
    gradientHero: ['#FFFBEB', '#FED7AA'],
    cardChrome: 'rgba(120,53,15,0.08)',
    tokens: {
      bg: '#FFFBEB',
      bg2: '#FEF3C7',
      bg3: '#FFFDF7',
      bg4: '#FFF7ED',
      bgCard: '#FFFDF7',
      bgCard2: '#FEF3C7',
      bgSheet: '#FFFDF7',
      t1: '#431407',
      t2: '#7C2D12',
      t3: '#9A3412',
      t4: '#C2410C',
      border: '#FDE68A',
      border2: '#FEF3C7',
      gold: '#D97706',
      gold2: '#FBBF24',
      gold3: '#B45309',
      goldBorder: 'rgba(217,119,6,0.40)',
      emerald: '#059669',
      emerald2: '#047857',
      overlayScrim: 'rgba(69, 26, 3, 0.35)',
      shadowCard: 'rgba(120,53,15,0.10)',
    },
  },
  coastal_mist: {
    id: 'coastal_mist',
    mode: 'light',
    label: 'Coastal Mist',
    description: 'Airy seafoam surfaces with teal and slate text',
    previewColor: '#F0FDFA',
    gradientHero: ['#F0FDFA', '#CCFBF1'],
    cardChrome: 'rgba(13,148,136,0.10)',
    tokens: {
      bg: '#F0FDFA',
      bg2: '#CCFBF1',
      bg3: '#FFFFFF',
      bg4: '#E6FFFA',
      bgCard: '#FFFFFF',
      bgCard2: '#F0FDFA',
      bgSheet: '#FFFFFF',
      t1: '#134E4A',
      t2: '#115E59',
      t3: '#0F766E',
      t4: '#14B8A6',
      border: '#99F6E4',
      border2: '#CCFBF1',
      gold: '#0D9488',
      gold2: '#2DD4BF',
      gold3: '#0F766E',
      goldBorder: 'rgba(13,148,136,0.35)',
      teal: '#0891B2',
      teal2: '#0E7490',
      overlayScrim: 'rgba(19, 78, 74, 0.36)',
      shadowCard: 'rgba(15,118,110,0.10)',
    },
  },
  obsidian: {
    id: 'obsidian',
    mode: 'dark',
    label: 'Obsidian',
    description: 'Polished charcoal with cool cyan premium accents',
    previewColor: '#0B1220',
    gradientHero: ['#0B1220', '#1E293B'],
    cardChrome: 'rgba(56,189,248,0.12)',
    tokens: {
      bg: '#0B1220',
      bg2: '#121A2B',
      bg3: '#1A2438',
      bg4: '#0E1626',
      bgCard: '#151E30',
      bgCard2: '#0B1220',
      bgSheet: '#1A2438',
      t1: '#F1F5F9',
      t2: '#CBD5E1',
      t3: '#94A3B8',
      t4: '#64748B',
      border: '#243044',
      border2: '#1A2438',
      gold: '#38BDF8',
      gold2: '#7DD3FC',
      gold3: '#0284C7',
      goldBorder: 'rgba(56,189,248,0.40)',
      sapphire: '#60A5FA',
      sapphire2: '#3B82F6',
      overlayScrim: 'rgba(0, 0, 0, 0.65)',
      shadowCard: 'rgba(0,0,0,0.35)',
    },
  },
  noir_harbor: {
    id: 'noir_harbor',
    mode: 'dark',
    label: 'Noir Harbor',
    description: 'Deep indigo night with violet-gold signals',
    previewColor: '#070B18',
    gradientHero: ['#070B18', '#1E1B4B'],
    cardChrome: 'rgba(129,140,248,0.14)',
    tokens: {
      bg: '#070B18',
      bg2: '#0F1428',
      bg3: '#171C34',
      bg4: '#0A0F1F',
      bgCard: '#12182C',
      bgCard2: '#070B18',
      bgSheet: '#171C34',
      t1: '#EEF2FF',
      t2: '#C7D2FE',
      t3: '#A5B4FC',
      t4: '#818CF8',
      border: '#1E293B',
      border2: '#151B2E',
      gold: '#A78BFA',
      gold2: '#C4B5FD',
      gold3: '#7C3AED',
      goldBorder: 'rgba(167,139,250,0.42)',
      sapphire: '#818CF8',
      sapphire2: '#6366F1',
      orchid: '#A78BFA',
      orchid2: '#8B5CF6',
      overlayScrim: 'rgba(0, 0, 0, 0.68)',
      shadowCard: 'rgba(0,0,0,0.40)',
    },
  },
  ember_night: {
    id: 'ember_night',
    mode: 'dark',
    label: 'Ember Night',
    description: 'Warm dusk charcoal with ember gold accents',
    previewColor: '#140C0A',
    gradientHero: ['#140C0A', '#3B1C12'],
    cardChrome: 'rgba(251,146,60,0.14)',
    tokens: {
      bg: '#140C0A',
      bg2: '#1C1210',
      bg3: '#261714',
      bg4: '#120A08',
      bgCard: '#1F1512',
      bgCard2: '#140C0A',
      bgSheet: '#261714',
      t1: '#FFF7ED',
      t2: '#FED7AA',
      t3: '#FDBA74',
      t4: '#FB923C',
      border: '#3F2A22',
      border2: '#2A1A15',
      gold: '#F59E0B',
      gold2: '#FBBF24',
      gold3: '#D97706',
      goldBorder: 'rgba(245,158,11,0.45)',
      crimson: '#F87171',
      emerald: '#34D399',
      overlayScrim: 'rgba(0, 0, 0, 0.66)',
      shadowCard: 'rgba(0,0,0,0.38)',
    },
  },
};

export function getThemeSkin(id: ThemeSkinId): ThemeSkinDefinition | null {
  if (id === 'default') return null;
  return THEME_SKINS[id] ?? null;
}

export function applyThemeSkinTokens<T extends Record<string, string>>(
  base: T,
  themeId: ThemeSkinId,
  isDark: boolean,
): T {
  const resolved = migrateThemeSkinId(themeId);
  if (resolved === 'default') return base;
  const skin = THEME_SKINS[resolved as Exclude<ThemeSkinId, 'default'>];
  if (!skin) return base;
  const modeMatches = (skin.mode === 'dark') === isDark;
  if (!modeMatches) return base;
  return { ...base, ...skin.tokens };
}

/** Relative luminance for WCAG contrast checks */
export function relativeLuminance(hex: string): number {
  const cleaned = hex.replace('#', '');
  if (cleaned.length < 6) return 0;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
