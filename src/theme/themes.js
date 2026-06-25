"use strict";
// ─── LifeQuest Design System — Light Theme ──────────────────────────────────
// Complete overhaul: white/bright palette, BitLife-inspired, no emojis anywhere.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANIM = exports.SHADOWS = exports.RADII = exports.SPACING = exports.FONTS = exports.COLORS = void 0;
exports.COLORS = {
    // ─── Backgrounds ────────────────────────────────────────────────────────────
    bg: '#F4F6F9', // App background — soft off-white
    bg2: '#ECEEF2', // Section / grouped background
    bg3: '#FFFFFF', // Elevated surface (sheets)
    bg4: '#F8F9FB', // Subtle surface variant
    bgCard: '#FFFFFF', // Card surface — pure white
    bgCard2: '#F4F6F9', // Secondary card / input bg
    bgSheet: '#FFFFFF', // Bottom sheet background
    // ─── Brand — Gold (Age Up button, premium) ───────────────────────────────────
    gold: '#F59E0B', // Primary amber-gold
    gold2: '#FCD34D', // Light gold highlight
    gold3: '#D97706', // Deep gold shadow
    goldBorder: 'rgba(245,158,11,0.35)',
    // ─── Stat Colors — each stat gets a vivid, distinct color ────────────────────
    health: '#EF4444', // Red — health / HP
    happiness: '#F59E0B', // Amber — happiness / joy (reuses gold)
    intelligence: '#3B82F6', // Blue — intelligence / mind
    wealth: '#059669', // Forest green — wealth / money
    fitness: '#10B981', // Emerald — fitness / body
    looks: '#EC4899', // Pink — looks / appearance
    social: '#8B5CF6', // Violet — social / charisma
    ambition: '#F97316', // Orange — ambition / drive
    // ─── Functional Colors ──────────────────────────────────────────────────────
    teal: '#0EA5E9', // Sky blue — financial / success accents
    teal2: '#0284C7',
    tealBorder: 'rgba(14,165,233,0.30)',
    crimson: '#EF4444', // Red — danger / health alerts
    crimson2: '#DC2626',
    crimsonBorder: 'rgba(239,68,68,0.25)',
    sapphire: '#3B82F6', // Blue — info / education
    sapphire2: '#2563EB',
    sapphireBorder: 'rgba(59,130,246,0.25)',
    emerald: '#10B981', // Green — positive changes
    emerald2: '#059669',
    emeraldBorder: 'rgba(16,185,129,0.25)',
    orchid: '#8B5CF6', // Violet — traits / personality
    orchid2: '#7C3AED',
    orchidBorder: 'rgba(139,92,246,0.25)',
    // ─── Category colors for life events ────────────────────────────────────────
    catEducation: '#3B82F6',
    catCareer: '#F59E0B',
    catRelationship: '#EC4899',
    catHealth: '#EF4444',
    catFinancial: '#059669',
    catFamily: '#F97316',
    catCrime: '#7C3AED',
    catTravel: '#0EA5E9',
    catMilestone: '#8B5CF6',
    catRandom: '#6B7280',
    catActivity: '#10B981',
    // ─── Text ───────────────────────────────────────────────────────────────────
    t1: '#0F172A', // Near-black primary text
    t2: '#374151', // Dark secondary text
    t3: '#6B7280', // Muted text
    t4: '#9CA3AF', // Placeholder / label text
    // ─── Borders ────────────────────────────────────────────────────────────────
    border: '#E5E7EB', // Standard card border
    border2: '#F3F4F6', // Hairline / subtle divider
    // ─── Death screen (dark palette) ───────────────────────────────────────────
    deathBg: '#020408',
    deathBg2: '#05080F',
    // ─── Shadows ────────────────────────────────────────────────────────────────
    shadowCard: 'rgba(15,23,42,0.08)',
    shadowStrong: 'rgba(15,23,42,0.14)',
};
// ─── Fonts ───────────────────────────────────────────────────────────────────
exports.FONTS = {
    displayBlack: 'PlayfairDisplay-Black',
    displayBold: 'PlayfairDisplay-Bold',
    body: 'DMSans-Regular',
    bodyMedium: 'DMSans-Medium',
    bodySemiBold: 'DMSans-SemiBold',
    bodyBold: 'DMSans-Bold',
    mono: 'JetBrainsMono-Regular',
    monoSemiBold: 'JetBrainsMono-SemiBold',
};
// ─── Spacing ─────────────────────────────────────────────────────────────────
exports.SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 40,
};
// ─── Radii ───────────────────────────────────────────────────────────────────
exports.RADII = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 999,
};
// ─── Shadows (iOS shadow + Android elevation) ─────────────────────────────────
exports.SHADOWS = {
    card: {
        shadowColor: 'rgba(15,23,42,0.10)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
    },
    gold: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 14,
        elevation: 8,
    },
    teal: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 5,
    },
    crimson: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 5,
    },
    subtle: {
        shadowColor: 'rgba(15,23,42,0.08)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
};
// ─── Animation Presets ───────────────────────────────────────────────────────
exports.ANIM = {
    fast: 180,
    normal: 280,
    slow: 450,
    spring: {
        damping: 18,
        stiffness: 220,
        mass: 1,
    },
};
