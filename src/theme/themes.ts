// ─── LifeQuest Design System — Master Theme ──────────────────────────────────
// Single source of truth for all design tokens.

// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  bg:        '#080C14',
  bg2:       '#0E1420',
  bg3:       '#141B28',
  bg4:       '#1A2235',
  bgCard:    'rgba(255,255,255,0.04)',
  bgCard2:   'rgba(255,255,255,0.07)',
  bgSheet:   '#0F1623',

  // Brand — Midnight Gold
  gold:       '#E8A838',
  gold2:      '#F5C46A',
  gold3:      '#D4922A',
  goldBorder: 'rgba(232,168,56,0.35)',

  // Accent — Electric Teal (money/success)
  teal:       '#00D4B4',
  teal2:      '#00B09A',
  tealBorder: 'rgba(0,212,180,0.30)',

  // Danger — Crimson (health alerts)
  crimson:       '#E8385A',
  crimson2:      '#C22244',
  crimsonBorder: 'rgba(232,56,90,0.30)',

  // Info — Sapphire (standard actions)
  sapphire:       '#4A9EFF',
  sapphire2:      '#2B7FE0',
  sapphireBorder: 'rgba(74,158,255,0.30)',

  // Emerald (fitness/health)
  emerald:       '#34D399',
  emerald2:      '#10B981',
  emeraldBorder: 'rgba(52,211,153,0.30)',

  // Orchid
  orchid:       '#A855F7',
  orchid2:      '#8730D9',
  orchidBorder: 'rgba(168,85,247,0.30)',

  // Text
  t1: '#F0F4FF',
  t2: 'rgba(240,244,255,0.60)',
  t3: 'rgba(240,244,255,0.35)',
  t4: 'rgba(240,244,255,0.18)',

  // Borders
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.04)',
} as const;

// ─── Fonts ───────────────────────────────────────────────────────────────────
// Ensure these font files are linked in android/app/src/main/assets/fonts/

export const FONTS = {
  displayBlack:    'PlayfairDisplay-Black',
  displayBold:     'PlayfairDisplay-Bold',
  body:            'DMSans-Regular',
  bodyMedium:      'DMSans-Medium',
  bodySemiBold:    'DMSans-SemiBold',
  bodyBold:        'DMSans-Bold',
  mono:            'JetBrainsMono-Regular',
  monoSemiBold:    'JetBrainsMono-SemiBold',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  xxl:   28,
  xxxl:  40,
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────

export const RADII = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const SHADOWS = {
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  teal: {
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 7,
  },
  crimson: {
    shadowColor: COLORS.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 7,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// ─── Animation Presets ───────────────────────────────────────────────────────

export const ANIM = {
  fast:   200,
  normal: 300,
  slow:   500,
  spring: {
    damping:   18,
    stiffness: 200,
    mass:      1,
  },
} as const;
