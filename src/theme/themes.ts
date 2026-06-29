// ─── LifeQuest Design System — Light & Dark Themes ────────────────────────────
// Complete overhaul: BitLife-inspired, premium illustrated journal aesthetics.

export const COLORS = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  bg:        "#F4F6F9",   // App background — soft off-white
  bg2:       "#ECEEF2",   // Section / grouped background
  bg3:       "#FFFFFF",   // Elevated surface (sheets)
  bg4:       "#F8F9FB",   // Subtle surface variant
  bgCard:    "#FFFFFF",   // Card surface — pure white
  bgCard2:   "#F4F6F9",   // Secondary card / input bg
  bgSheet:   "#FFFFFF",   // Bottom sheet background

  // ─── Brand — Gold (Age Up button, premium) ───────────────────────────────────
  gold:        "#F59E0B",   // Primary amber-gold
  gold2:       "#FCD34D",   // Light gold highlight
  gold3:       "#D97706",   // Deep gold shadow
  goldBorder:  "rgba(245,158,11,0.35)",

  // ─── Stat Colors — each stat gets a vivid, distinct color ────────────────────
  health:      "#EF4444",   // Red — health / HP
  happiness:   "#F59E0B",   // Amber — happiness / joy (re-uses gold)
  intelligence:"#3B82F6",   // Blue — intelligence / mind
  wealth:      "#059669",   // Forest green — wealth / money
  fitness:     "#10B981",   // Emerald — fitness / body
  looks:       "#EC4899",   // Pink — looks / appearance
  social:      "#8B5CF6",   // Violet — social / charisma
  ambition:    "#F97316",   // Orange — ambition / drive

  // ─── Functional Colors ──────────────────────────────────────────────────────
  teal:        "#0EA5E9",   // Sky blue — financial / success accents
  teal2:       "#0284C7",
  tealBorder:  "rgba(14,165,233,0.30)",

  crimson:       "#EF4444",   // Red — danger / health alerts
  crimson2:      "#DC2626",
  crimsonBorder: "rgba(239,68,68,0.25)",

  sapphire:       "#3B82F6",  // Blue — info / education
  sapphire2:      "#2563EB",
  sapphireBorder: "rgba(59,130,246,0.25)",

  emerald:        "#10B981",  // Green — positive changes
  emerald2:       "#059669",
  emeraldBorder:  "rgba(16,185,129,0.25)",

  orchid:         "#8B5CF6",  // Violet — traits / personality
  orchid2:        "#7C3AED",
  orchidBorder:   "rgba(139,92,246,0.25)",

  // ─── Category colors for life events ────────────────────────────────────────
  catEducation:   "#3B82F6",
  catCareer:      "#F59E0B",
  catRelationship:"#EC4899",
  catHealth:      "#EF4444",
  catFinancial:   "#059669",
  catFamily:      "#F97316",
  catCrime:       "#7C3AED",
  catTravel:      "#0EA5E9",
  catMilestone:   "#8B5CF6",
  catRandom:      "#6B7280",
  catActivity:    "#10B981",

  // ─── Scenario accent colors (new) ────────────────────────────────────────────
  scenarioRoyal:   "#7B2FBE",
  scenarioZombie:  "#2D6A2D",
  scenarioCyber:   "#00D9FF",
  scenarioCrime:   "#C0392B",
  scenarioFantasy: "#D4A017",

  // ─── Rarity tiers (new) ──────────────────────────────────────────────────────
  rarityCommon:   "#6B7280",
  rarityUncommon: "#3B82F6",
  rarityRare:     "#8B5CF6",
  rarityEpic:     "#EC4899",
  rarityLegendary:"#F59E0B",

  // ─── Text ───────────────────────────────────────────────────────────────────
  t1: "#0F172A",           // Near-black primary text
  t2: "#374151",           // Dark secondary text
  t3: "#6B7280",           // Muted text
  t4: "#9CA3AF",           // Placeholder / label text

  // ─── Borders ────────────────────────────────────────────────────────────────
  border:  "#E5E7EB",      // Standard card border
  border2: "#F3F4F6",      // Hairline / subtle divider

  // ─── Death screen (dark palette) ───────────────────────────────────────────
  deathBg:  "#020408",
  deathBg2: "#05080F",

  // ─── Shadows ────────────────────────────────────────────────────────────────
  shadowCard: "rgba(15,23,42,0.08)",
  shadowStrong: "rgba(15,23,42,0.14)",
} as const;

export const DARK_COLORS = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  bg:        "#0D1117",   // Deep navy-black app background
  bg2:       "#161B22",   // Card background
  bg3:       "#1C2128",   // Sheet surface
  bg4:       "#0F141C",   // Subtle surface variant
  bgCard:    "#161B22",   // Card surface
  bgCard2:   "#0D1117",
  bgSheet:   "#1C2128",   // Sheet background

  // ─── Brand — Gold ────────────────────────────────────────────────────────────
  gold:        "#F59E0B",
  gold2:       "#FCD34D",
  gold3:       "#D97706",
  goldBorder:  "rgba(245,158,11,0.45)",

  // ─── Stat Colors ────────────────────────────────────────────────────────────
  health:      "#EF4444",
  happiness:   "#F59E0B",
  intelligence:"#3B82F6",
  wealth:      "#10B981",
  fitness:     "#10B981",
  looks:       "#EC4899",
  social:      "#8B5CF6",
  ambition:    "#F97316",

  // ─── Functional Colors ──────────────────────────────────────────────────────
  teal:        "#0EA5E9",
  teal2:       "#0284C7",
  tealBorder:  "rgba(14,165,233,0.30)",

  crimson:       "#EF4444",
  crimson2:      "#DC2626",
  crimsonBorder: "rgba(239,68,68,0.25)",

  sapphire:       "#3B82F6",
  sapphire2:      "#2563EB",
  sapphireBorder: "rgba(59,130,246,0.25)",

  emerald:        "#10B981",
  emerald2:       "#059669",
  emeraldBorder:  "rgba(16,185,129,0.25)",

  orchid:         "#8B5CF6",
  orchid2:        "#7C3AED",
  orchidBorder:   "rgba(139,92,246,0.25)",

  // ─── Category colors ────────────────────────────────────────────────────────
  catEducation:   "#3B82F6",
  catCareer:      "#F59E0B",
  catRelationship:"#EC4899",
  catHealth:      "#EF4444",
  catFinancial:   "#10B981",
  catFamily:      "#F97316",
  catCrime:       "#8B5CF6",
  catTravel:      "#0EA5E9",
  catMilestone:   "#8B5CF6",
  catRandom:      "#6B7280",
  catActivity:    "#10B981",

  // ─── Scenario accent colors ──────────────────────────────────────────────────
  scenarioRoyal:   "#7B2FBE",
  scenarioZombie:  "#2D6A2D",
  scenarioCyber:   "#00D9FF",
  scenarioCrime:   "#C0392B",
  scenarioFantasy: "#D4A017",

  // ─── Rarity tiers ────────────────────────────────────────────────────────────
  rarityCommon:   "#6B7280",
  rarityUncommon: "#3B82F6",
  rarityRare:     "#8B5CF6",
  rarityEpic:     "#EC4899",
  rarityLegendary:"#F59E0B",

  // ─── Text ───────────────────────────────────────────────────────────────────
  t1: "#F0F6FC",           // Primary text (near-white)
  t2: "#B1BAC4",           // Secondary text
  t3: "#8B949E",           // Muted text
  t4: "#484F58",           // Placeholder / label text

  // ─── Borders ────────────────────────────────────────────────────────────────
  border:  "#30363D",      // Dark border
  border2: "#21262D",      // Subtle dark border

  // ─── Death screen ────────────────────────────────────────────────────────────
  deathBg:  "#020408",
  deathBg2: "#05080F",

  // ─── Shadows ────────────────────────────────────────────────────────────────
  shadowCard: "rgba(0,0,0,0.25)",
  shadowStrong: "rgba(0,0,0,0.40)",
} as const;

// ─── Fonts ───────────────────────────────────────────────────────────────────
export const FONTS = {
  displayBlack:    "PlayfairDisplay-Black",
  displayBold:     "PlayfairDisplay-Bold",
  display:         "PlayfairDisplay-Bold",      // Headlines, age display, death screen
  displayItal:     "PlayfairDisplay-Italic",    // Pull quotes, event drama
  body:            "DMSans-Regular",            // Body text
  bodyMedium:      "DMSans-Medium",
  bodySemiBold:    "DMSans-SemiBold",          // Labels
  bodyBold:        "DMSans-Bold",
  mono:            "JetBrainsMono-Regular",    // Stats, numbers
  monoSemiBold:    "JetBrainsMono-SemiBold",  // Emphasized stats
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 40,
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────
export const RADII = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  full: 999,
} as const;

// ─── Shadows (iOS shadow + Android elevation) ─────────────────────────────────
export const SHADOWS = {
  card: {
    shadowColor: "rgba(15,23,42,0.10)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  gold: {
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 8,
  },
  teal: {
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  crimson: {
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  subtle: {
    shadowColor: "rgba(15,23,42,0.08)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

// ─── Animation Presets ───────────────────────────────────────────────────────
export const ANIM = {
  fast:   180,
  normal: 280,
  slow:   450,
  spring: {
    damping:   18,
    stiffness: 220,
    mass:      1,
  },
} as const;
