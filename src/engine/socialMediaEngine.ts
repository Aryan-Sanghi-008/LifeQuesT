import type {
  Character,
  SocialContentType,
  SocialMediaState,
  SocialPlatformAccount,
  SocialPlatformId,
  SocialPost,
  SocialStaffRole,
} from '../types';
import { clamp } from './economyEngine';
import { scaleCountryAmount } from './countryScaleEngine';
import { getSocialIncomeTraitMultiplier } from './traitEngine';

export const SOCIAL_ENERGY_PER_AGE = 4;

export const SOCIAL_PLATFORMS: {
  id: SocialPlatformId;
  label: string;
  unlockAge: number;
  niche: string;
  contentCostUsd: Record<SocialContentType, number>;
}[] = [
  {
    id: 'lifefeed',
    label: 'LifeFeed',
    unlockAge: 12,
    niche: 'General life updates',
    contentCostUsd: { text: 0, photo: 5, video: 40, short: 20, live: 80 },
  },
  {
    id: 'instagram',
    label: 'Instagram',
    unlockAge: 13,
    niche: 'Photo & lifestyle',
    contentCostUsd: { text: 0, photo: 15, video: 60, short: 35, live: 100 },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    unlockAge: 13,
    niche: 'Short-form viral',
    contentCostUsd: { text: 0, photo: 10, video: 50, short: 25, live: 90 },
  },
  {
    id: 'youtube',
    label: 'YouTube',
    unlockAge: 14,
    niche: 'Long-form video',
    contentCostUsd: { text: 0, photo: 20, video: 200, short: 60, live: 150 },
  },
  {
    id: 'x',
    label: 'X',
    unlockAge: 14,
    niche: 'News & hot takes',
    contentCostUsd: { text: 0, photo: 8, video: 40, short: 15, live: 70 },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    unlockAge: 18,
    niche: 'Career & network',
    contentCostUsd: { text: 0, photo: 10, video: 80, short: 30, live: 120 },
  },
  {
    id: 'twitch',
    label: 'Twitch',
    unlockAge: 15,
    niche: 'Live streaming',
    contentCostUsd: { text: 0, photo: 5, video: 40, short: 20, live: 50 },
  },
  {
    id: 'threads',
    label: 'Threads',
    unlockAge: 14,
    niche: 'Conversational',
    contentCostUsd: { text: 0, photo: 8, video: 35, short: 18, live: 60 },
  },
];

export const STAFF_DEFS: Record<
  SocialStaffRole,
  { label: string; monthlyCostUsd: number; energyBonus: number; reachBonus: number; successBonus: number }
> = {
  editor: { label: 'Editor', monthlyCostUsd: 800, energyBonus: 1, reachBonus: 0.08, successBonus: 0.05 },
  manager: { label: 'Manager', monthlyCostUsd: 1400, energyBonus: 1, reachBonus: 0.12, successBonus: 0.08 },
  marketer: { label: 'Marketer', monthlyCostUsd: 1100, energyBonus: 0, reachBonus: 0.18, successBonus: 0.1 },
};

export const FOLLOWER_MILESTONES = [
  { followers: 1_000, label: 'Rising Influencer', annualIncomeUsd: 500, unlockEventId: 'follower_1k' },
  { followers: 10_000, label: 'Local Celebrity', annualIncomeUsd: 3_000, unlockEventId: 'brand_deal' },
  { followers: 100_000, label: 'National Star', annualIncomeUsd: 25_000, unlockEventId: 'cancelled_online' },
] as const;

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyAccount(platformId: SocialPlatformId, unlocked: boolean): SocialPlatformAccount {
  return {
    platformId,
    unlocked,
    followers: 0,
    subscribers: 0,
    totalLikes: 0,
    totalViews: 0,
    totalComments: 0,
    earningsYtd: 0,
    expensesYtd: 0,
    posts: [],
    staff: [],
    marketingBudgetMonthly: 0,
  };
}

export function ensureSocialMedia(character: Character): SocialMediaState {
  if (character.socialMedia?.platforms) {
    const state = character.socialMedia;
    if (state.energyAge !== character.age) {
      return { ...state, energySpentThisAge: 0, energyAge: character.age };
    }
    return state;
  }
  const platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>> = {};
  for (const p of SOCIAL_PLATFORMS) {
    platforms[p.id] = emptyAccount(p.id, character.age >= p.unlockAge);
  }
  // Migrate legacy
  const lf = platforms.lifefeed!;
  lf.followers = character.socialFollowers ?? 0;
  lf.posts = (character.socialPosts ?? []).map((p) => ({
    ...p,
    platform: 'lifefeed' as SocialPlatformId,
    contentType: 'text' as SocialContentType,
    metrics: {
      likes: p.virality,
      views: p.virality * 8,
      comments: Math.floor(p.virality / 5),
      subsDelta: 0,
    },
  }));
  return { energySpentThisAge: 0, energyAge: character.age, platforms };
}

export function getMaxEnergy(character: Character): number {
  const state = ensureSocialMedia(character);
  let bonus = 0;
  for (const acc of Object.values(state.platforms)) {
    if (!acc) continue;
    for (const s of acc.staff) {
      bonus += STAFF_DEFS[s.role]?.energyBonus ?? 0;
    }
  }
  return SOCIAL_ENERGY_PER_AGE + Math.min(6, bonus);
}

export function getNextFollowerMilestone(followers: number) {
  return FOLLOWER_MILESTONES.find((m) => followers < m.followers) ?? null;
}

export function getFollowerAnnualIncome(
  followers: number,
  countryCode: string,
  traitIds: string[] = [],
): number {
  let incomeUsd = 0;
  for (const m of FOLLOWER_MILESTONES) {
    if (followers >= m.followers) incomeUsd += m.annualIncomeUsd;
  }
  incomeUsd = Math.round(incomeUsd * getSocialIncomeTraitMultiplier(traitIds));
  return scaleCountryAmount(incomeUsd, countryCode, 'salary');
}

export function getFollowerPromotionBonus(followers: number): number {
  if (followers >= 100_000) return 0.12;
  if (followers >= 10_000) return 0.06;
  if (followers >= 1_000) return 0.03;
  return 0;
}

export function getViralityBoost(post: SocialPost): number {
  return 1 + post.virality / 200;
}

type PostOptions = {
  platformId?: string;
  contentType?: string;
  marketingSpend?: number;
};

export function createPost(
  character: Character,
  content: string,
  options?: PostOptions,
): { post?: SocialPost; error?: string; followerDelta?: number } {
  const platformId = (options?.platformId as SocialPlatformId) || 'lifefeed';
  const contentType = (options?.contentType as SocialContentType) || 'text';
  const marketingSpend = Math.max(0, options?.marketingSpend ?? 0);
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return { error: 'Unknown platform.' };

  let state = ensureSocialMedia(character);
  const account = state.platforms[platformId];
  if (!account?.unlocked && character.age < platform.unlockAge) {
    return { error: `Unlocks at age ${platform.unlockAge}.` };
  }

  const maxEnergy = getMaxEnergy(character);
  if (state.energySpentThisAge >= maxEnergy) {
    return { error: `Out of post energy this year (${maxEnergy}). Hire staff or Age Up.` };
  }

  const prodCost = scaleCountryAmount(platform.contentCostUsd[contentType], character.countryCode, 'cost');
  const mkt = scaleCountryAmount(marketingSpend, character.countryCode, 'cost');
  const totalCost = prodCost + mkt;
  if (character.bankBalance < totalCost) {
    return { error: `Need ${totalCost} for production/marketing.` };
  }

  const acc = account ?? emptyAccount(platformId, true);
  const staffReach = acc.staff.reduce((s, st) => s + (STAFF_DEFS[st.role]?.reachBonus ?? 0), 0);
  const staffSuccess = acc.staff.reduce((s, st) => s + (STAFF_DEFS[st.role]?.successBonus ?? 0), 0);
  const baseFollowers = Math.max(acc.followers, character.socialFollowers ?? 0);
  const typeMult =
    contentType === 'live' ? 2.2 :
    contentType === 'video' ? 1.8 :
    contentType === 'short' ? 1.6 :
    contentType === 'photo' ? 1.25 : 1;

  const quality = 0.55 + staffSuccess + character.stats.social / 250 + Math.min(0.2, mkt / 5000);
  const roll = Math.random() * quality;
  const views = Math.floor(
    (40 + baseFollowers * 0.35 + character.stats.social * 2) * typeMult * (0.6 + roll) * (1 + staffReach),
  );
  const likes = Math.floor(views * (0.04 + roll * 0.12));
  const comments = Math.floor(likes * (0.08 + Math.random() * 0.1));
  const followerDelta = Math.max(
    1,
    Math.floor(likes * (0.08 + staffReach * 0.5) + (contentType === 'short' || contentType === 'live' ? 8 : 2)),
  );
  const subsDelta =
    platformId === 'youtube' || platformId === 'twitch'
      ? Math.floor(followerDelta * 0.35)
      : 0;
  const virality = Math.min(99, Math.floor((likes / Math.max(1, views)) * 400 + roll * 40));

  const post: SocialPost = {
    id: generateId('post'),
    age: character.age,
    platform: platformId,
    content: content.slice(0, 280),
    contentType,
    virality,
    followerDelta,
    cost: totalCost,
    metrics: { likes, views, comments, subsDelta },
  };

  return { post, followerDelta };
}

export function applyPostToCharacter(
  character: Character,
  post: SocialPost,
): Partial<Character> {
  const state = ensureSocialMedia(character);
  const platformId = (post.platform as SocialPlatformId) || 'lifefeed';
  const account = state.platforms[platformId] ?? emptyAccount(platformId, true);
  const metrics = post.metrics ?? { likes: post.virality, views: post.virality * 8, comments: 0, subsDelta: 0 };

  const nextAccount: SocialPlatformAccount = {
    ...account,
    unlocked: true,
    followers: account.followers + post.followerDelta,
    subscribers: account.subscribers + metrics.subsDelta,
    totalLikes: account.totalLikes + metrics.likes,
    totalViews: account.totalViews + metrics.views,
    totalComments: account.totalComments + metrics.comments,
    expensesYtd: account.expensesYtd + (post.cost ?? 0),
    posts: [...account.posts, post].slice(-40),
  };

  const platforms = { ...state.platforms, [platformId]: nextAccount };
  const totalFollowers = Object.values(platforms).reduce((s, a) => s + (a?.followers ?? 0), 0);

  return {
    socialMedia: {
      energySpentThisAge: state.energySpentThisAge + 1,
      energyAge: character.age,
      platforms,
    },
    socialFollowers: totalFollowers,
    socialPosts: [...(character.socialPosts ?? []), post].slice(-40),
    bankBalance: character.bankBalance - (post.cost ?? 0),
    stats: {
      ...character.stats,
      social: clamp(character.stats.social + (post.virality > 70 ? 2 : 1)),
      happiness: clamp(character.stats.happiness + (post.followerDelta > 50 ? 3 : 1)),
    },
  };
}

export function hireStaff(
  character: Character,
  platformId: SocialPlatformId,
  role: SocialStaffRole,
): { ok: boolean; message: string; state?: SocialMediaState; bankBalance?: number } {
  const def = STAFF_DEFS[role];
  if (!def) return { ok: false, message: 'Unknown role.' };
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId] ?? emptyAccount(platformId, true);
  if (account.staff.some((s) => s.role === role)) {
    return { ok: false, message: `Already have a ${def.label}.` };
  }
  const monthly = scaleCountryAmount(def.monthlyCostUsd, character.countryCode, 'cost');
  const firstMonth = monthly;
  if (character.bankBalance < firstMonth) {
    return { ok: false, message: `Need ${firstMonth} for first month.` };
  }
  const nextAccount: SocialPlatformAccount = {
    ...account,
    unlocked: true,
    staff: [
      ...account.staff,
      { id: generateId('staff'), role, monthlyCost: monthly, hiredAge: character.age },
    ],
    expensesYtd: account.expensesYtd + firstMonth,
  };
  return {
    ok: true,
    message: `Hired ${def.label} (~${monthly}/mo).`,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
    bankBalance: character.bankBalance - firstMonth,
  };
}

export function runMonetization(
  character: Character,
  platformId: SocialPlatformId,
  kind: 'ads' | 'sponsorship' | 'brand_deal' | 'super_thanks',
): { ok: boolean; message: string; state?: SocialMediaState; bankBalance?: number } {
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId];
  if (!account || account.followers < 500) {
    return { ok: false, message: 'Need ~500 followers on this platform.' };
  }
  const cc = character.countryCode ?? 'US';
  let payoutUsd = 0;
  let message = '';
  switch (kind) {
    case 'ads':
      payoutUsd = 80 + account.followers * 0.02;
      message = 'Ran ads on your content.';
      break;
    case 'sponsorship':
      payoutUsd = 200 + account.followers * 0.05;
      message = 'Landed a sponsorship.';
      break;
    case 'brand_deal':
      if (account.followers < 5000) return { ok: false, message: 'Need 5k followers for brand deals.' };
      payoutUsd = 800 + account.followers * 0.08;
      message = 'Closed a brand deal.';
      break;
    case 'super_thanks':
      payoutUsd = 40 + account.totalLikes * 0.01;
      message = 'Fans sent Super Thanks / tips.';
      break;
  }
  const payout = scaleCountryAmount(Math.round(payoutUsd), cc, 'salary');
  const nextAccount: SocialPlatformAccount = {
    ...account,
    earningsYtd: account.earningsYtd + payout,
  };
  return {
    ok: true,
    message: `${message} +${payout}`,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
    bankBalance: character.bankBalance + payout,
  };
}

export function tickSocialYear(character: Character): {
  socialFollowers: number;
  posts: SocialPost[];
  followerIncome: number;
  unlockedEventIds: string[];
  socialMedia: SocialMediaState;
  staffCost: number;
} {
  const state = ensureSocialMedia(character);
  const cc = character.countryCode ?? 'US';
  const platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>> = {};

  for (const [id, acc] of Object.entries(state.platforms)) {
    if (!acc) continue;
    const payroll = acc.staff.reduce((s, st) => s + st.monthlyCost * 12, 0);
    const decay = acc.posts.length > 25 ? Math.floor(acc.followers * 0.015) : 0;
    const passive = Math.floor(acc.followers * 0.01);
    platforms[id as SocialPlatformId] = {
      ...acc,
      unlocked:
        acc.unlocked ||
        character.age >= (SOCIAL_PLATFORMS.find((p) => p.id === id)?.unlockAge ?? 99),
      followers: Math.max(0, acc.followers + passive - decay),
      expensesYtd: payroll,
      earningsYtd: 0,
      posts: acc.posts.filter((p) => p.age >= character.age - 5).slice(-40),
    };
  }

  const staffCost = Object.values(platforms).reduce(
    (s, a) => s + (a?.staff.reduce((x, st) => x + st.monthlyCost * 12, 0) ?? 0),
    0,
  );

  const socialFollowers = Object.values(platforms).reduce((s, a) => s + (a?.followers ?? 0), 0);
  const posts = Object.values(platforms).flatMap((a) => a?.posts ?? []);
  const followerIncome = getFollowerAnnualIncome(socialFollowers, cc, character.traits ?? []);
  const unlockedEventIds = FOLLOWER_MILESTONES
    .filter((m) => socialFollowers >= m.followers)
    .map((m) => m.unlockEventId);

  return {
    socialFollowers,
    posts,
    followerIncome,
    unlockedEventIds,
    socialMedia: {
      energySpentThisAge: 0,
      energyAge: character.age + 1,
      platforms,
    },
    staffCost,
  };
}
