import type {
  Character,
  SocialContentType,
  SocialLedgerEntry,
  SocialLedgerKind,
  SocialMediaState,
  SocialMonetizationKind,
  SocialPlatformAccount,
  SocialPlatformId,
  SocialPost,
  SocialStaffRole,
} from '../types';
import { SOCIAL_PLATFORMS, getSocialPlatform } from '@data/socialPlatforms';
import { clamp } from './economyEngine';
import { scaleCountryAmount } from './countryScaleEngine';
import { getSocialIncomeTraitMultiplier } from './traitEngine';

export { SOCIAL_PLATFORMS } from '@data/socialPlatforms';

export const SOCIAL_ENERGY_PER_AGE = 4;
export const MAX_SOCIAL_LEDGER = 80;

export const STAFF_DEFS: Record<
  SocialStaffRole,
  { label: string; monthlyCostUsd: number; energyBonus: number; reachBonus: number; successBonus: number; description: string }
> = {
  editor: {
    label: 'Editor',
    monthlyCostUsd: 800,
    energyBonus: 1,
    reachBonus: 0.08,
    successBonus: 0.05,
    description: '+1 energy, better post polish and reach.',
  },
  manager: {
    label: 'Manager',
    monthlyCostUsd: 1400,
    energyBonus: 1,
    reachBonus: 0.12,
    successBonus: 0.08,
    description: '+1 energy, stronger growth and success odds.',
  },
  marketer: {
    label: 'Marketer',
    monthlyCostUsd: 1100,
    energyBonus: 0,
    reachBonus: 0.18,
    successBonus: 0.1,
    description: 'Boosts reach and campaign success (no energy).',
  },
};

export const FOLLOWER_MILESTONES = [
  { followers: 1_000, label: 'Rising Influencer', annualIncomeUsd: 500, unlockEventId: 'follower_1k' },
  { followers: 10_000, label: 'Local Celebrity', annualIncomeUsd: 3_000, unlockEventId: 'brand_deal' },
  { followers: 100_000, label: 'National Star', annualIncomeUsd: 25_000, unlockEventId: 'cancelled_online' },
] as const;

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeLedgerEntry(params: {
  age: number;
  platformId: SocialPlatformId;
  kind: SocialLedgerKind;
  label: string;
  amount: number;
  breakdown?: SocialLedgerEntry['breakdown'];
  postId?: string;
  staffRole?: SocialStaffRole;
  monetizationKind?: SocialMonetizationKind;
}): SocialLedgerEntry {
  return {
    id: generateId('sled'),
    age: params.age,
    platformId: params.platformId,
    kind: params.kind,
    label: params.label,
    amount: params.amount,
    breakdown: params.breakdown,
    postId: params.postId,
    staffRole: params.staffRole,
    monetizationKind: params.monetizationKind,
    timestamp: Date.now(),
  };
}

export function appendSocialLedger(
  existing: SocialLedgerEntry[] | undefined,
  next: SocialLedgerEntry | SocialLedgerEntry[],
): SocialLedgerEntry[] {
  const added = Array.isArray(next) ? next : [next];
  const merged = [...(existing ?? []), ...added];
  if (merged.length <= MAX_SOCIAL_LEDGER) return merged;
  return merged.slice(merged.length - MAX_SOCIAL_LEDGER);
}

export function computeFameScore(account: SocialPlatformAccount): number {
  const followerPart = Math.min(50, Math.log10(Math.max(1, account.followers)) * 12);
  const viewPart = Math.min(25, Math.log10(Math.max(1, account.totalViews)) * 5);
  const viralityAvg =
    account.posts.length > 0
      ? account.posts.reduce((s, p) => s + p.virality, 0) / account.posts.length
      : 0;
  const viralPart = Math.min(25, viralityAvg / 4);
  return Math.round(Math.max(0, Math.min(100, followerPart + viewPart + viralPart)));
}

export function computeEngagementRate(account: SocialPlatformAccount): number {
  if (account.totalViews <= 0) return 0;
  return Math.min(1, account.totalLikes / account.totalViews);
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
    ledger: [],
    fameScore: 0,
    engagementRate: 0,
    monetizationCooldowns: {},
  };
}

function normalizeAccount(
  platformId: SocialPlatformId,
  acc: SocialPlatformAccount | undefined,
  unlocked: boolean,
): SocialPlatformAccount {
  if (!acc) return emptyAccount(platformId, unlocked);
  return {
    ...emptyAccount(platformId, unlocked),
    ...acc,
    platformId,
    unlocked: acc.unlocked || unlocked,
    ledger: acc.ledger ?? [],
    fameScore: acc.fameScore ?? computeFameScore(acc),
    engagementRate: acc.engagementRate ?? computeEngagementRate(acc),
    monetizationCooldowns: acc.monetizationCooldowns ?? {},
  };
}

export function ensureSocialMedia(character: Character): SocialMediaState {
  const age = character.age;
  if (character.socialMedia?.platforms) {
    const platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>> = {};
    for (const p of SOCIAL_PLATFORMS) {
      const existing = character.socialMedia.platforms[p.id];
      platforms[p.id] = normalizeAccount(p.id, existing, age >= p.unlockAge);
    }
    // Preserve any unexpected keys
    for (const [id, acc] of Object.entries(character.socialMedia.platforms)) {
      if (!platforms[id as SocialPlatformId] && acc) {
        platforms[id as SocialPlatformId] = normalizeAccount(
          id as SocialPlatformId,
          acc,
          acc.unlocked,
        );
      }
    }
    let state: SocialMediaState = {
      energySpentThisAge: character.socialMedia.energySpentThisAge,
      energyAge: character.socialMedia.energyAge,
      platforms,
    };
    if (state.energyAge !== age) {
      state = { ...state, energySpentThisAge: 0, energyAge: age };
    }
    return state;
  }

  const platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>> = {};
  for (const p of SOCIAL_PLATFORMS) {
    platforms[p.id] = emptyAccount(p.id, age >= p.unlockAge);
  }
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
  lf.fameScore = computeFameScore(lf);
  lf.engagementRate = computeEngagementRate(lf);
  return { energySpentThisAge: 0, energyAge: age, platforms };
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

export function getGlobalFame(state: SocialMediaState): number {
  let weighted = 0;
  let weightSum = 0;
  for (const p of SOCIAL_PLATFORMS) {
    const acc = state.platforms[p.id];
    if (!acc?.unlocked) continue;
    weighted += (acc.fameScore ?? 0) * p.fameWeight;
    weightSum += p.fameWeight;
  }
  if (weightSum <= 0) return 0;
  return Math.round(weighted / weightSum);
}

export function canUnlockPlatform(character: Character, platformId: SocialPlatformId): boolean {
  const def = getSocialPlatform(platformId);
  return character.age >= def.unlockAge;
}

export function unlockPlatform(
  character: Character,
  platformId: SocialPlatformId,
): { ok: boolean; message: string; state?: SocialMediaState } {
  const def = getSocialPlatform(platformId);
  if (!def) return { ok: false, message: 'Unknown platform.' };
  if (character.age < def.unlockAge) {
    return { ok: false, message: `Unlocks at age ${def.unlockAge}.` };
  }
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId] ?? emptyAccount(platformId, true);
  if (account.unlocked) {
    return { ok: true, message: `${def.label} already open.`, state };
  }
  const entry = makeLedgerEntry({
    age: character.age,
    platformId,
    kind: 'platform_unlock',
    label: `Opened ${def.label} account`,
    amount: 0,
  });
  const nextAccount: SocialPlatformAccount = {
    ...account,
    unlocked: true,
    ledger: appendSocialLedger(account.ledger, entry),
  };
  return {
    ok: true,
    message: `${def.label} account opened.`,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
  };
}

export function getProductionCostLocal(
  platformId: SocialPlatformId,
  contentType: SocialContentType,
  countryCode: string,
): number {
  const def = getSocialPlatform(platformId);
  return scaleCountryAmount(def.contentCostUsd[contentType], countryCode, 'cost');
}

export function getStaffMonthlyCostLocal(
  role: SocialStaffRole,
  countryCode: string,
): number {
  return scaleCountryAmount(STAFF_DEFS[role].monthlyCostUsd, countryCode, 'cost');
}

export interface PlatformMetrics {
  followers: number;
  subscribers: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  engagementRate: number;
  avgViewsPerPost: number;
  avgVirality: number;
  fameScore: number;
  earningsYtd: number;
  expensesYtd: number;
  netYtd: number;
  monthlyPayroll: number;
  postCount: number;
  staffCount: number;
}

export function getPlatformMetrics(account: SocialPlatformAccount): PlatformMetrics {
  const postCount = account.posts.length;
  const avgViewsPerPost =
    postCount > 0 ? Math.round(account.totalViews / postCount) : 0;
  const avgVirality =
    postCount > 0
      ? Math.round(account.posts.reduce((s, p) => s + p.virality, 0) / postCount)
      : 0;
  const monthlyPayroll = account.staff.reduce((s, st) => s + st.monthlyCost, 0);
  return {
    followers: account.followers,
    subscribers: account.subscribers,
    totalLikes: account.totalLikes,
    totalViews: account.totalViews,
    totalComments: account.totalComments,
    engagementRate: account.engagementRate ?? computeEngagementRate(account),
    avgViewsPerPost,
    avgVirality,
    fameScore: account.fameScore ?? computeFameScore(account),
    earningsYtd: account.earningsYtd,
    expensesYtd: account.expensesYtd,
    netYtd: account.earningsYtd - account.expensesYtd,
    monthlyPayroll,
    postCount,
    staffCount: account.staff.length,
  };
}

export function getPlatformForecast(
  character: Character,
  platformId: SocialPlatformId,
): {
  nextAgeUpPayroll: number;
  energyLeft: number;
  energyMax: number;
  estimatedAdsPayout: number;
} {
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId] ?? emptyAccount(platformId, false);
  const metrics = getPlatformMetrics(account);
  const energyMax = getMaxEnergy(character);
  const energyLeft = Math.max(0, energyMax - state.energySpentThisAge);
  const estimated = estimateMonetizationPayout(character, platformId, 'ads');
  return {
    nextAgeUpPayroll: metrics.monthlyPayroll,
    energyLeft,
    energyMax,
    estimatedAdsPayout: estimated.ok ? estimated.payout : 0,
  };
}

type PostOptions = {
  platformId?: string;
  contentType?: string;
  /** Local bank currency — not USD-scaled. */
  marketingSpend?: number;
};

export function createPost(
  character: Character,
  content: string,
  options?: PostOptions,
): { post?: SocialPost; error?: string; followerDelta?: number; productionCost?: number; marketingCost?: number } {
  const platformId = (options?.platformId as SocialPlatformId) || 'lifefeed';
  const contentType = (options?.contentType as SocialContentType) || 'text';
  const marketingSpend = Math.max(0, Math.round(options?.marketingSpend ?? 0));
  const platform = getSocialPlatform(platformId);
  if (!platform) return { error: 'Unknown platform.' };

  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId];
  if (!account?.unlocked && character.age < platform.unlockAge) {
    return { error: `Unlocks at age ${platform.unlockAge}.` };
  }

  const maxEnergy = getMaxEnergy(character);
  if (state.energySpentThisAge >= maxEnergy) {
    return { error: `Out of post energy this year (${maxEnergy}). Hire staff or Age Up.` };
  }

  const prodCost = getProductionCostLocal(platformId, contentType, character.countryCode);
  // Marketing is already in local currency — do not scale again.
  const mkt = marketingSpend;
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
    (40 + baseFollowers * 0.35 + character.stats.social * 2) *
      typeMult *
      (0.6 + roll) *
      (1 + staffReach) *
      platform.earnMult,
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
    productionCost: prodCost,
    marketingCost: mkt,
    metrics: { likes, views, comments, subsDelta },
  };

  return { post, followerDelta, productionCost: prodCost, marketingCost: mkt };
}

export function applyPostToCharacter(
  character: Character,
  post: SocialPost,
): Partial<Character> {
  const state = ensureSocialMedia(character);
  const platformId = (post.platform as SocialPlatformId) || 'lifefeed';
  const account = state.platforms[platformId] ?? emptyAccount(platformId, true);
  const metrics = post.metrics ?? { likes: post.virality, views: post.virality * 8, comments: 0, subsDelta: 0 };
  const prod = post.productionCost ?? (post.marketingCost != null ? (post.cost ?? 0) - post.marketingCost : post.cost ?? 0);
  const mkt = post.marketingCost ?? 0;

  const ledgerAdds: SocialLedgerEntry[] = [];
  if (prod > 0) {
    ledgerAdds.push(
      makeLedgerEntry({
        age: character.age,
        platformId,
        kind: 'post_production',
        label: `${post.contentType ?? 'post'} production`,
        amount: -prod,
        breakdown: { production: prod },
        postId: post.id,
      }),
    );
  }
  if (mkt > 0) {
    ledgerAdds.push(
      makeLedgerEntry({
        age: character.age,
        platformId,
        kind: 'marketing',
        label: 'Marketing boost',
        amount: -mkt,
        breakdown: { marketing: mkt },
        postId: post.id,
      }),
    );
  }

  const nextAccountBase: SocialPlatformAccount = {
    ...account,
    unlocked: true,
    followers: account.followers + post.followerDelta,
    subscribers: account.subscribers + metrics.subsDelta,
    totalLikes: account.totalLikes + metrics.likes,
    totalViews: account.totalViews + metrics.views,
    totalComments: account.totalComments + metrics.comments,
    expensesYtd: account.expensesYtd + (post.cost ?? 0),
    posts: [...account.posts, post].slice(-40),
    ledger: appendSocialLedger(account.ledger, ledgerAdds),
  };
  const nextAccount: SocialPlatformAccount = {
    ...nextAccountBase,
    fameScore: computeFameScore(nextAccountBase),
    engagementRate: computeEngagementRate(nextAccountBase),
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
  const platform = getSocialPlatform(platformId);
  if (!platform) return { ok: false, message: 'Unknown platform.' };
  if (character.age < platform.unlockAge) {
    return { ok: false, message: `Unlocks at age ${platform.unlockAge}.` };
  }

  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId] ?? emptyAccount(platformId, true);
  if (account.staff.some((s) => s.role === role)) {
    return { ok: false, message: `Already have a ${def.label}.` };
  }

  const monthly = getStaffMonthlyCostLocal(role, character.countryCode);
  const hireEntry = makeLedgerEntry({
    age: character.age,
    platformId,
    kind: 'staff_hire',
    label: `Hired ${def.label} (~${monthly}/mo from next Age Up)`,
    amount: 0,
    staffRole: role,
  });

  const nextAccount: SocialPlatformAccount = {
    ...account,
    unlocked: true,
    staff: [
      ...account.staff,
      { id: generateId('staff'), role, monthlyCost: monthly, hiredAge: character.age },
    ],
    ledger: appendSocialLedger(account.ledger, hireEntry),
  };

  return {
    ok: true,
    message: `Hired ${def.label} (~${monthly}/mo starting next Age Up).`,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
    // No bank charge on hire — payroll hits on Age Up (1 month).
    bankBalance: character.bankBalance,
  };
}

export function fireStaff(
  character: Character,
  platformId: SocialPlatformId,
  staffId: string,
): { ok: boolean; message: string; state?: SocialMediaState } {
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId];
  if (!account) return { ok: false, message: 'No account.' };
  const member = account.staff.find((s) => s.id === staffId);
  if (!member) return { ok: false, message: 'Staff not found.' };
  const nextAccount: SocialPlatformAccount = {
    ...account,
    staff: account.staff.filter((s) => s.id !== staffId),
    ledger: appendSocialLedger(
      account.ledger,
      makeLedgerEntry({
        age: character.age,
        platformId,
        kind: 'staff_hire',
        label: `Let go ${STAFF_DEFS[member.role].label}`,
        amount: 0,
        staffRole: member.role,
      }),
    ),
  };
  return {
    ok: true,
    message: `Let go ${STAFF_DEFS[member.role].label}.`,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
  };
}

export function estimateMonetizationPayout(
  character: Character,
  platformId: SocialPlatformId,
  kind: SocialMonetizationKind,
): { ok: boolean; message: string; payout: number } {
  const platform = getSocialPlatform(platformId);
  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId];
  if (!account?.unlocked) return { ok: false, message: 'Platform locked.', payout: 0 };

  const action = platform.monetization.find((m) => m.kind === kind);
  if (!action) return { ok: false, message: 'Not available on this platform.', payout: 0 };
  if (account.followers < action.minFollowers) {
    return {
      ok: false,
      message: `Need ${action.minFollowers.toLocaleString()} followers.`,
      payout: 0,
    };
  }
  if (action.minSubscribers != null && account.subscribers < action.minSubscribers) {
    return {
      ok: false,
      message: `Need ${action.minSubscribers.toLocaleString()} subscribers.`,
      payout: 0,
    };
  }

  const eng = account.engagementRate || computeEngagementRate(account) || 0.05;
  const careerBoost =
    platformId === 'linkedin'
      ? 1 + character.stats.intelligence / 200 + (character.job ? 0.15 : 0)
      : 1;
  const viralBoost =
    platformId === 'x' || platformId === 'threads' || platformId === 'tiktok'
      ? 1 + Math.min(0.4, (account.fameScore ?? 0) / 200)
      : 1;
  const subWeight =
    platformId === 'youtube' || platformId === 'twitch'
      ? 1 + account.subscribers / Math.max(500, account.followers)
      : 1;

  let payoutUsd = 0;
  switch (kind) {
    case 'ads':
      payoutUsd = 120 + account.followers * 0.035 + account.totalViews * 0.002;
      break;
    case 'sponsorship':
      payoutUsd = 350 + account.followers * 0.07 * (1 + eng);
      break;
    case 'brand_deal':
      payoutUsd = 1_200 + account.followers * 0.1 * (1 + eng * 2);
      break;
    case 'super_thanks':
      payoutUsd = 60 + account.totalLikes * 0.015 + account.followers * 0.01;
      break;
    case 'consulting':
      payoutUsd = 500 + account.followers * 0.06 * careerBoost;
      break;
  }

  payoutUsd = Math.round(
    payoutUsd * platform.earnMult * careerBoost * viralBoost * subWeight,
  );
  const payout = scaleCountryAmount(payoutUsd, character.countryCode ?? 'US', 'salary');
  return { ok: true, message: '', payout };
}

export function runMonetization(
  character: Character,
  platformId: SocialPlatformId,
  kind: SocialMonetizationKind,
): { ok: boolean; message: string; state?: SocialMediaState; bankBalance?: number; payout?: number } {
  const estimate = estimateMonetizationPayout(character, platformId, kind);
  if (!estimate.ok) return { ok: false, message: estimate.message };

  const state = ensureSocialMedia(character);
  const account = state.platforms[platformId]!;
  const lastUsed = account.monetizationCooldowns?.[kind];
  if (lastUsed === character.age) {
    return { ok: false, message: 'Already used this earn action this year. Age Up to reset.' };
  }

  const payout = estimate.payout;
  const platform = getSocialPlatform(platformId);
  const actionLabel = platform.monetization.find((m) => m.kind === kind)?.label ?? kind;
  const entry = makeLedgerEntry({
    age: character.age,
    platformId,
    kind: 'monetization',
    label: actionLabel,
    amount: payout,
    monetizationKind: kind,
  });

  const nextAccount: SocialPlatformAccount = {
    ...account,
    earningsYtd: account.earningsYtd + payout,
    ledger: appendSocialLedger(account.ledger, entry),
    monetizationCooldowns: {
      ...account.monetizationCooldowns,
      [kind]: character.age,
    },
  };

  return {
    ok: true,
    message: `${actionLabel}: +${payout}`,
    payout,
    state: {
      ...state,
      platforms: { ...state.platforms, [platformId]: nextAccount },
    },
    bankBalance: character.bankBalance + payout,
  };
}

export interface SocialPayrollLine {
  platformId: SocialPlatformId;
  platformLabel: string;
  staffRole: SocialStaffRole;
  staffLabel: string;
  amount: number;
}

export function tickSocialYear(character: Character): {
  socialFollowers: number;
  posts: SocialPost[];
  followerIncome: number;
  unlockedEventIds: string[];
  socialMedia: SocialMediaState;
  /** Total payroll deducted this Age Up (1 month per staff). */
  staffCost: number;
  /** Per-staff finance lines for the main ledger. */
  payrollLines: SocialPayrollLine[];
  /** Platform ids that received follower income share (for labeling). */
  followerIncomeByPlatform: { platformId: SocialPlatformId; amount: number }[];
} {
  const state = ensureSocialMedia(character);
  const cc = character.countryCode ?? 'US';
  const platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>> = {};
  const payrollLines: SocialPayrollLine[] = [];

  for (const [id, acc] of Object.entries(state.platforms)) {
    if (!acc) continue;
    const platformId = id as SocialPlatformId;
    const def = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    const ledgerAdds: SocialLedgerEntry[] = [];

    for (const st of acc.staff) {
      const staffLabel = STAFF_DEFS[st.role]?.label ?? st.role;
      payrollLines.push({
        platformId,
        platformLabel: def?.label ?? platformId,
        staffRole: st.role,
        staffLabel,
        amount: st.monthlyCost,
      });
      ledgerAdds.push(
        makeLedgerEntry({
          age: character.age,
          platformId,
          kind: 'staff_payroll',
          label: `Staff payroll · ${staffLabel}`,
          amount: -st.monthlyCost,
          breakdown: { payroll: st.monthlyCost },
          staffRole: st.role,
        }),
      );
    }

    const decay = acc.posts.length > 25 ? Math.floor(acc.followers * 0.015) : 0;
    const passive = Math.floor(acc.followers * 0.01);
    const nextBase: SocialPlatformAccount = {
      ...acc,
      unlocked:
        acc.unlocked || character.age >= (def?.unlockAge ?? 99),
      followers: Math.max(0, acc.followers + passive - decay),
      // New year: reset YTD after payroll logged into ledger
      expensesYtd: 0,
      earningsYtd: 0,
      posts: acc.posts.filter((p) => p.age >= character.age - 5).slice(-40),
      ledger: appendSocialLedger(acc.ledger, ledgerAdds),
    };
    platforms[platformId] = {
      ...nextBase,
      fameScore: computeFameScore(nextBase),
      engagementRate: computeEngagementRate(nextBase),
    };
  }

  const staffCost = payrollLines.reduce((s, l) => s + l.amount, 0);
  const socialFollowers = Object.values(platforms).reduce((s, a) => s + (a?.followers ?? 0), 0);
  const posts = Object.values(platforms).flatMap((a) => a?.posts ?? []);
  const followerIncome = getFollowerAnnualIncome(socialFollowers, cc, character.traits ?? []);
  const unlockedEventIds = FOLLOWER_MILESTONES
    .filter((m) => socialFollowers >= m.followers)
    .map((m) => m.unlockEventId);

  // Distribute follower income into social ledgers proportionally by followers
  const followerIncomeByPlatform: { platformId: SocialPlatformId; amount: number }[] = [];
  if (followerIncome > 0 && socialFollowers > 0) {
    let allocated = 0;
    const entries = Object.entries(platforms).filter(([, a]) => (a?.followers ?? 0) > 0);
    entries.forEach(([id, acc], idx) => {
      if (!acc) return;
      const platformId = id as SocialPlatformId;
      const share =
        idx === entries.length - 1
          ? followerIncome - allocated
          : Math.floor((acc.followers / socialFollowers) * followerIncome);
      allocated += share;
      if (share <= 0) return;
      followerIncomeByPlatform.push({ platformId, amount: share });
      const entry = makeLedgerEntry({
        age: character.age,
        platformId,
        kind: 'follower_income',
        label: 'Follower milestone income',
        amount: share,
      });
      platforms[platformId] = {
        ...acc,
        earningsYtd: share,
        ledger: appendSocialLedger(acc.ledger, entry),
      };
    });
  }

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
    payrollLines,
    followerIncomeByPlatform,
  };
}
