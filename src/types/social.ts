export type SocialPlatformId =
  | 'lifefeed'
  | 'youtube'
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'twitch'
  | 'threads';

export type SocialContentType = 'text' | 'photo' | 'video' | 'short' | 'live';

export type SocialStaffRole = 'editor' | 'manager' | 'marketer';

export type SocialMonetizationKind =
  | 'ads'
  | 'sponsorship'
  | 'brand_deal'
  | 'super_thanks'
  | 'consulting';

export type SocialLedgerKind =
  | 'post_production'
  | 'marketing'
  | 'staff_hire'
  | 'staff_payroll'
  | 'monetization'
  | 'follower_income'
  | 'platform_unlock';

export interface SocialStaffMember {
  id: string;
  role: SocialStaffRole;
  monthlyCost: number;
  hiredAge: number;
}

export interface SocialPostMetrics {
  likes: number;
  views: number;
  comments: number;
  subsDelta: number;
}

export interface SocialPost {
  id: string;
  age: number;
  platform: SocialPlatformId | string;
  content: string;
  contentType?: SocialContentType;
  virality: number;
  followerDelta: number;
  cost?: number;
  /** Local-currency production cost (excludes marketing). */
  productionCost?: number;
  /** Local-currency marketing spend. */
  marketingCost?: number;
  metrics?: SocialPostMetrics;
}

export interface SocialLedgerEntry {
  id: string;
  age: number;
  platformId: SocialPlatformId;
  kind: SocialLedgerKind;
  label: string;
  /** Signed: positive = income, negative = expense. */
  amount: number;
  breakdown?: {
    production?: number;
    marketing?: number;
    payroll?: number;
  };
  postId?: string;
  staffRole?: SocialStaffRole;
  monetizationKind?: SocialMonetizationKind;
  timestamp?: number;
}

export interface SocialPlatformAccount {
  platformId: SocialPlatformId;
  unlocked: boolean;
  followers: number;
  subscribers: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  earningsYtd: number;
  expensesYtd: number;
  posts: SocialPost[];
  staff: SocialStaffMember[];
  marketingBudgetMonthly: number;
  /** Cap ~80; newest last. */
  ledger: SocialLedgerEntry[];
  /** 0–100 platform-local influence. */
  fameScore: number;
  /** Likes / views style engagement (0–1). */
  engagementRate: number;
  /** Age when each monetization kind was last used. */
  monetizationCooldowns?: Partial<Record<SocialMonetizationKind, number>>;
}

export interface SocialMediaState {
  /** Shared posting energy spent this age year */
  energySpentThisAge: number;
  energyAge: number;
  platforms: Partial<Record<SocialPlatformId, SocialPlatformAccount>>;
}
