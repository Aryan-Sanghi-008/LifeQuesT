import type { ScenarioId } from '@/types';
import { FREE_SCENARIO_IDS } from '@data/scenarioCatalog';

export type ScenarioFxPreset =
  | 'wash'
  | 'sparkle_up'
  | 'highlight_sweep'
  | 'gold_glint'
  | 'edge_pulse'
  | 'scanline'
  | 'dust_drift'
  | 'fog_hazard'
  | 'dust_glow'
  | 'star_spotlight'
  | 'rune_orbit'
  | 'seal_flash';

export type ScenarioMotif =
  | 'horizon'
  | 'embers'
  | 'spoon'
  | 'crown'
  | 'alley'
  | 'grid'
  | 'blade'
  | 'fog'
  | 'habitat'
  | 'stars'
  | 'runes'
  | 'columns';

export type ScenarioArtVariant = 'hero' | 'card' | 'compact' | 'strip';

export interface ScenarioVisualTheme {
  accent: string;
  gradient: [string, string, string];
  motif: ScenarioMotif;
  fxPreset: ScenarioFxPreset;
  /** Free scenarios render softer FX */
  intensity: 'subtle' | 'full';
}

const FREE_SET = new Set<string>(FREE_SCENARIO_IDS);

export const SCENARIO_VISUALS: Record<ScenarioId, ScenarioVisualTheme> = {
  classic: {
    accent: '#3B82F6',
    gradient: ['#1E3A5F', '#2563EB55', '#0F172A00'],
    motif: 'horizon',
    fxPreset: 'wash',
    intensity: 'subtle',
  },
  rags_to_riches: {
    accent: '#F97316',
    gradient: ['#7C2D12', '#F9731655', '#0F172A00'],
    motif: 'embers',
    fxPreset: 'sparkle_up',
    intensity: 'subtle',
  },
  silver_spoon: {
    accent: '#C084FC',
    gradient: ['#4C1D95', '#C084FC55', '#0F172A00'],
    motif: 'spoon',
    fxPreset: 'highlight_sweep',
    intensity: 'subtle',
  },
  royal: {
    accent: '#F59E0B',
    gradient: ['#78350F', '#F59E0B66', '#0F172A00'],
    motif: 'crown',
    fxPreset: 'gold_glint',
    intensity: 'full',
  },
  crime: {
    accent: '#EF4444',
    gradient: ['#450A0A', '#EF444466', '#0F172A00'],
    motif: 'alley',
    fxPreset: 'edge_pulse',
    intensity: 'full',
  },
  cyber: {
    accent: '#06B6D4',
    gradient: ['#083344', '#06B6D466', '#0F172A00'],
    motif: 'grid',
    fxPreset: 'scanline',
    intensity: 'full',
  },
  medieval: {
    accent: '#92400E',
    gradient: ['#451A03', '#B4530966', '#0F172A00'],
    motif: 'blade',
    fxPreset: 'dust_drift',
    intensity: 'full',
  },
  zombie: {
    accent: '#4D7C0F',
    gradient: ['#14532D', '#65A30D55', '#0F172A00'],
    motif: 'fog',
    fxPreset: 'fog_hazard',
    intensity: 'full',
  },
  mars: {
    accent: '#DC2626',
    gradient: ['#7F1D1D', '#DC262666', '#0F172A00'],
    motif: 'habitat',
    fxPreset: 'dust_glow',
    intensity: 'full',
  },
  celebrity: {
    accent: '#EC4899',
    gradient: ['#831843', '#EC489966', '#0F172A00'],
    motif: 'stars',
    fxPreset: 'star_spotlight',
    intensity: 'full',
  },
  fantasy: {
    accent: '#7C3AED',
    gradient: ['#4C1D95', '#7C3AED66', '#0F172A00'],
    motif: 'runes',
    fxPreset: 'rune_orbit',
    intensity: 'full',
  },
  political: {
    accent: '#1D4ED8',
    gradient: ['#1E3A8A', '#3B82F666', '#0F172A00'],
    motif: 'columns',
    fxPreset: 'seal_flash',
    intensity: 'full',
  },
};

export function getScenarioVisual(id: ScenarioId): ScenarioVisualTheme {
  return SCENARIO_VISUALS[id] ?? SCENARIO_VISUALS.classic;
}

export function isFreeScenario(id: ScenarioId): boolean {
  return FREE_SET.has(id);
}

/** Opacity multiplier for motif / FX layers */
export function motifOpacity(intensity: 'subtle' | 'full'): number {
  return intensity === 'subtle' ? 0.55 : 0.85;
}

export function fxDurationMs(intensity: 'subtle' | 'full'): number {
  return intensity === 'subtle' ? 520 : 720;
}

export const ART_HEIGHT: Record<ScenarioArtVariant, number> = {
  hero: 168,
  card: 112,
  compact: 88,
  strip: 76,
};
