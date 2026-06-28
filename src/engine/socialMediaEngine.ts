import type { Character, SocialPost } from '../types';
import { clamp } from './economyEngine';

function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createPost(
  character: Character,
  content: string,
  platform = 'LifeFeed',
): { post: SocialPost; followerDelta: number } {
  const virality = Math.floor(Math.random() * 100);
  const baseReach = Math.floor(character.stats.social / 10) + 10;
  const followerDelta = Math.floor(baseReach * (virality / 100) * (1 + character.socialFollowers / 10000));

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
} {
  const posts = character.socialPosts ?? [];
  const recentBoost = posts
    .filter(p => p.age >= character.age - 1)
    .reduce((sum, p) => sum + p.followerDelta, 0);
  const decay = posts.length > 20 ? Math.floor(character.socialFollowers * 0.02) : 0;
  const socialFollowers = Math.max(0, character.socialFollowers + recentBoost - decay);

  const trimmed = posts.length > 30 ? posts.slice(-30) : posts;

  return { socialFollowers, posts: trimmed };
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
