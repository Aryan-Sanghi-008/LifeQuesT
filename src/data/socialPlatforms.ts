import type {
  SocialContentType,
  SocialMonetizationKind,
  SocialPlatformId,
} from '../types';

export interface SocialPlatformTheme {
  gradient: [string, string, ...string[]];
  accent: string;
  accentSoft: string;
  textOnAccent: string;
  /** Brand card tint only — do not use as screen/shell background (use theme colors.bg). */
  cardBg: string;
  glyph: string;
}

export interface SocialMonetizationDef {
  kind: SocialMonetizationKind;
  label: string;
  description: string;
  minFollowers: number;
  minSubscribers?: number;
}

export interface SocialPlatformDef {
  id: SocialPlatformId;
  label: string;
  unlockAge: number;
  niche: string;
  blurb: string;
  contentCostUsd: Record<SocialContentType, number>;
  theme: SocialPlatformTheme;
  /** Preferred content types shown first in compose. */
  featuredContent: SocialContentType[];
  metricLabels: {
    followers: string;
    secondary?: string;
    views: string;
    engagement: string;
  };
  monetization: SocialMonetizationDef[];
  /** Reach / payout flavor multipliers used by the engine. */
  earnMult: number;
  fameWeight: number;
}

export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    id: 'lifefeed',
    label: 'LifeFeed',
    unlockAge: 12,
    niche: 'General life updates',
    blurb: 'Your starter feed — share moments, grow a small audience, unlock bigger platforms.',
    contentCostUsd: { text: 0, photo: 5, video: 40, short: 20, live: 80 },
    theme: {
      gradient: ['#7C3AED', '#A855F7', '#EC4899'],
      accent: '#A855F7',
      accentSoft: '#A855F733',
      textOnAccent: '#FFFFFF',
      cardBg: '#1A1228',
      glyph: 'LF',
    },
    featuredContent: ['text', 'photo', 'short'],
    metricLabels: {
      followers: 'Followers',
      views: 'Views',
      engagement: 'Engagement',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Feed ads',
        description: 'Small ad share from your posts.',
        minFollowers: 300,
      },
      {
        kind: 'super_thanks',
        label: 'Tips',
        description: 'Fans send small tips.',
        minFollowers: 200,
      },
    ],
    earnMult: 0.55,
    fameWeight: 0.7,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    unlockAge: 13,
    niche: 'Photo & lifestyle',
    blurb: 'Visual storytelling — photos, Reels-style shorts, and brand-friendly aesthetics.',
    contentCostUsd: { text: 0, photo: 15, video: 60, short: 35, live: 100 },
    theme: {
      gradient: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
      accent: '#DD2A7B',
      accentSoft: '#DD2A7B33',
      textOnAccent: '#FFFFFF',
      cardBg: '#1A1018',
      glyph: 'IG',
    },
    featuredContent: ['photo', 'short', 'live', 'video'],
    metricLabels: {
      followers: 'Followers',
      views: 'Reach',
      engagement: 'Eng. rate',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Creator ads',
        description: 'Ad revenue from Reels and posts.',
        minFollowers: 500,
      },
      {
        kind: 'sponsorship',
        label: 'Sponsorship',
        description: 'Product placement with a lifestyle brand.',
        minFollowers: 1_500,
      },
      {
        kind: 'brand_deal',
        label: 'Brand deal',
        description: 'Paid campaign with deliverables.',
        minFollowers: 5_000,
      },
      {
        kind: 'super_thanks',
        label: 'Gifts',
        description: 'Live gifts and tips.',
        minFollowers: 800,
      },
    ],
    earnMult: 1.15,
    fameWeight: 1.1,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    unlockAge: 13,
    niche: 'Short-form viral',
    blurb: 'Algorithm-first shorts — high virality ceiling, strong tip and brand upside.',
    contentCostUsd: { text: 0, photo: 10, video: 50, short: 25, live: 90 },
    theme: {
      gradient: ['#010101', '#25F4EE', '#FE2C55'],
      accent: '#FE2C55',
      accentSoft: '#FE2C5533',
      textOnAccent: '#FFFFFF',
      cardBg: '#121212',
      glyph: 'TT',
    },
    featuredContent: ['short', 'live', 'video'],
    metricLabels: {
      followers: 'Followers',
      views: 'Views',
      engagement: 'Avg. watch',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Creator fund',
        description: 'Views-based payout.',
        minFollowers: 1_000,
      },
      {
        kind: 'sponsorship',
        label: 'Sponsored short',
        description: 'Brand-seeded viral clip.',
        minFollowers: 2_000,
      },
      {
        kind: 'brand_deal',
        label: 'Brand deal',
        description: 'Multi-video campaign.',
        minFollowers: 8_000,
      },
      {
        kind: 'super_thanks',
        label: 'Live gifts',
        description: 'Gifts during live sessions.',
        minFollowers: 500,
      },
    ],
    earnMult: 1.25,
    fameWeight: 1.2,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    unlockAge: 14,
    niche: 'Long-form video',
    blurb: 'Long-form and Shorts — subscriber-weighted ads and sponsorships.',
    contentCostUsd: { text: 0, photo: 20, video: 200, short: 60, live: 150 },
    theme: {
      gradient: ['#FF0000', '#CC0000', '#282828'],
      accent: '#FF0000',
      accentSoft: '#FF000033',
      textOnAccent: '#FFFFFF',
      cardBg: '#181818',
      glyph: 'YT',
    },
    featuredContent: ['video', 'short', 'live'],
    metricLabels: {
      followers: 'Subscribers',
      secondary: 'Channel fans',
      views: 'Views',
      engagement: 'Like rate',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'AdSense',
        description: 'Ad revenue from videos.',
        minFollowers: 500,
        minSubscribers: 200,
      },
      {
        kind: 'sponsorship',
        label: 'Sponsorship',
        description: 'Mid-roll brand mention.',
        minFollowers: 2_000,
        minSubscribers: 800,
      },
      {
        kind: 'brand_deal',
        label: 'Brand deal',
        description: 'Dedicated sponsored video.',
        minFollowers: 8_000,
        minSubscribers: 3_000,
      },
      {
        kind: 'super_thanks',
        label: 'Super Thanks',
        description: 'Paid comments and tips.',
        minFollowers: 400,
      },
    ],
    earnMult: 1.35,
    fameWeight: 1.3,
  },
  {
    id: 'x',
    label: 'X',
    unlockAge: 14,
    niche: 'News & hot takes',
    blurb: 'Hot takes and threads — virality spikes and tip-driven income.',
    contentCostUsd: { text: 0, photo: 8, video: 40, short: 15, live: 70 },
    theme: {
      gradient: ['#000000', '#1A1A1A', '#E7E9EA'],
      accent: '#E7E9EA',
      accentSoft: '#E7E9EA22',
      textOnAccent: '#000000',
      cardBg: '#0F0F0F',
      glyph: 'X',
    },
    featuredContent: ['text', 'short', 'photo'],
    metricLabels: {
      followers: 'Followers',
      views: 'Impressions',
      engagement: 'Engagement',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Ad revenue share',
        description: 'Impressions-based payout.',
        minFollowers: 800,
      },
      {
        kind: 'sponsorship',
        label: 'Sponsored post',
        description: 'Promoted take for a brand.',
        minFollowers: 2_500,
      },
      {
        kind: 'super_thanks',
        label: 'Tips',
        description: 'Fan tips on viral posts.',
        minFollowers: 300,
      },
    ],
    earnMult: 0.95,
    fameWeight: 1.0,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    unlockAge: 18,
    niche: 'Career & network',
    blurb: 'Professional network — consulting and sponsorships scale with career stats.',
    contentCostUsd: { text: 0, photo: 10, video: 80, short: 30, live: 120 },
    theme: {
      gradient: ['#0A66C2', '#004182', '#FFFFFF'],
      accent: '#0A66C2',
      accentSoft: '#0A66C233',
      textOnAccent: '#FFFFFF',
      cardBg: '#0D1B2A',
      glyph: 'in',
    },
    featuredContent: ['text', 'photo', 'video'],
    metricLabels: {
      followers: 'Connections reach',
      views: 'Impressions',
      engagement: 'Reactions',
    },
    monetization: [
      {
        kind: 'sponsorship',
        label: 'Thought leadership',
        description: 'Sponsored career content.',
        minFollowers: 1_000,
      },
      {
        kind: 'consulting',
        label: 'Consulting lead',
        description: 'Paid advice from your network.',
        minFollowers: 2_000,
      },
      {
        kind: 'brand_deal',
        label: 'B2B brand deal',
        description: 'Company partnership post.',
        minFollowers: 5_000,
      },
    ],
    earnMult: 1.4,
    fameWeight: 0.9,
  },
  {
    id: 'twitch',
    label: 'Twitch',
    unlockAge: 15,
    niche: 'Live streaming',
    blurb: 'Live streams — subscriber and tip income with high live multipliers.',
    contentCostUsd: { text: 0, photo: 5, video: 40, short: 20, live: 50 },
    theme: {
      gradient: ['#9146FF', '#6441A5', '#0E0E10'],
      accent: '#9146FF',
      accentSoft: '#9146FF33',
      textOnAccent: '#FFFFFF',
      cardBg: '#0E0E10',
      glyph: 'TV',
    },
    featuredContent: ['live', 'short', 'video'],
    metricLabels: {
      followers: 'Followers',
      secondary: 'Subs',
      views: 'Avg. viewers',
      engagement: 'Chat rate',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Stream ads',
        description: 'Mid-roll ads during streams.',
        minFollowers: 400,
        minSubscribers: 50,
      },
      {
        kind: 'sponsorship',
        label: 'Stream sponsor',
        description: 'Gaming / gear sponsor.',
        minFollowers: 1_500,
      },
      {
        kind: 'super_thanks',
        label: 'Bits & tips',
        description: 'Chat tips and bits.',
        minFollowers: 200,
      },
      {
        kind: 'brand_deal',
        label: 'Brand deal',
        description: 'Sponsored stream series.',
        minFollowers: 6_000,
        minSubscribers: 500,
      },
    ],
    earnMult: 1.2,
    fameWeight: 1.05,
  },
  {
    id: 'threads',
    label: 'Threads',
    unlockAge: 14,
    niche: 'Conversational',
    blurb: 'Conversational posts — lighter costs, tip and viral spike income.',
    contentCostUsd: { text: 0, photo: 8, video: 35, short: 18, live: 60 },
    theme: {
      gradient: ['#101010', '#2A2A2A', '#FFFFFF'],
      accent: '#FFFFFF',
      accentSoft: '#FFFFFF22',
      textOnAccent: '#000000',
      cardBg: '#141414',
      glyph: 'Th',
    },
    featuredContent: ['text', 'photo', 'short'],
    metricLabels: {
      followers: 'Followers',
      views: 'Views',
      engagement: 'Replies',
    },
    monetization: [
      {
        kind: 'ads',
        label: 'Ad share',
        description: 'Light ad revenue.',
        minFollowers: 600,
      },
      {
        kind: 'sponsorship',
        label: 'Sponsored thread',
        description: 'Brand conversation series.',
        minFollowers: 2_000,
      },
      {
        kind: 'super_thanks',
        label: 'Tips',
        description: 'Fan tips on viral threads.',
        minFollowers: 250,
      },
    ],
    earnMult: 0.85,
    fameWeight: 0.85,
  },
];

export const SOCIAL_PLATFORM_MAP: Record<SocialPlatformId, SocialPlatformDef> =
  Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, p])) as Record<
    SocialPlatformId,
    SocialPlatformDef
  >;

export function getSocialPlatform(id: SocialPlatformId): SocialPlatformDef {
  return SOCIAL_PLATFORM_MAP[id];
}
