import type { Character, SocialPost } from '../types';
import { clamp } from './economyEngine';
import { scaleCountryAmount } from './countryScaleEngine';
import { getSocialIncomeTraitMultiplier } from './traitEngine';

function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const FOLLOWER_MILESTONES = [
  { followers: 1_000, label: 'Rising Influencer', annualIncomeUsd: 500, unlockEventId: 'follower_1k' },
  { followers: 10_000, label: 'Local Celebrity', annualIncomeUsd: 3_000, unlockEventId: 'brand_deal' },
  { followers: 100_000, label: 'National Star', annualIncomeUsd: 25_000, unlockEventId: 'cancelled_online' },
] as const;

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

export function createPost(
  character: Character,
  content: string,
  platform = 'LifeFeed',
): { post: SocialPost; followerDelta: number } {
  const virality = Math.floor(Math.random() * 100);
  const baseReach = Math.floor(character.stats.social / 10) + 10;
  const fameBoost = 1 + Math.min(0.5, character.socialFollowers / 200_000);
  const followerDelta = Math.floor(baseReach * (virality / 100) * fameBoost * (1 + character.socialFollowers / 10000));

  const post: SocialPost = {
    id: generateId(),
    age: character.age,
    platform,
    content: content.slice(0, 280),
    virality,
    followerDelta,
  };

  return { post, followerDelta };
}

export function tickSocialYear(character: Character): {
  socialFollowers: number;
  posts: SocialPost[];
  followerIncome: number;
  unlockedEventIds: string[];
} {
  const posts = character.socialPosts ?? [];
  const recentBoost = posts
    .filter(p => p.age >= character.age - 1)
    .reduce((sum, p) => sum + p.followerDelta, 0);
  const decay = posts.length > 20 ? Math.floor(character.socialFollowers * 0.02) : 0;
  const socialFollowers = Math.max(0, character.socialFollowers + recentBoost - decay);
  const trimmed = posts.length > 30 ? posts.slice(-30) : posts;
  const followerIncome = getFollowerAnnualIncome(
    socialFollowers,
    character.countryCode ?? 'US',
    character.traits ?? [],
  );
  const unlockedEventIds = FOLLOWER_MILESTONES
    .filter(m => socialFollowers >= m.followers)
    .map(m => m.unlockEventId);

  return { socialFollowers, posts: trimmed, followerIncome, unlockedEventIds };
}

export function getViralityBoost(post: SocialPost): number {
  return 1 + post.virality / 200;
}

export function applyPostToCharacter(
  character: Character,
  post: SocialPost,
): Partial<Character> {
  return {
    socialPosts: [...(character.socialPosts ?? []), post],
    socialFollowers: character.socialFollowers + post.followerDelta,
    stats: {
      ...character.stats,
      social: clamp(character.stats.social + (post.virality > 70 ? 2 : 1)),
      happiness: clamp(character.stats.happiness + (post.followerDelta > 100 ? 3 : 1)),
    },
  };
}

/** Fame bonus for career promotions (0–0.12). */
export function getFollowerPromotionBonus(followers: number): number {
  if (followers >= 100_000) return 0.12;
  if (followers >= 10_000) return 0.06;
  if (followers >= 1_000) return 0.03;
  return 0;
}
