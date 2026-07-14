/**
 * Membership types — mirrors docs/api/monetization.md.
 */

export type MembershipTier = "bite" | "savor" | "feast" | "omakase";

export interface FrameStub {
  id: number;
  slug: string;
  style_key: string;
  accent_color: string;
  is_animated: boolean;
}

export interface Frame extends FrameStub {
  name: string;
  min_tier: MembershipTier;
  owned: boolean;
  equippable: boolean;
}

export interface Entitlements {
  daily_swipes: number | null;
  super_likes_per_day: number | null;
  rewinds_per_day: number | null;
  culture_calls_per_day: number | null;
  recommendation_calls_per_day: number | null;
  tour_stops_max: number | null;
  saved_tours_max: number | null;
  vault_bookmarks_max: number | null;
  xp_boost_pct: number;
  streak_freezes_per_month: number;
  advanced_analytics: boolean;
}

export type EntitlementMatrix = Record<MembershipTier, Entitlements>;

export interface Plan {
  plan: "feast_monthly" | "feast_yearly";
  price_vnd: number;
  currency: "VND";
  interval: "month" | "year";
  savings_pct?: number;
}

export interface SubscriptionInfo {
  plan: string;
  status: "active" | "expired";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface StreakProgress {
  current_streak: number;
  is_alive: boolean;
  days_to_savor: number;
  days_to_omakase: number | null;
}

export interface MembershipStatus {
  tier: MembershipTier;
  streak: StreakProgress;
  subscription: SubscriptionInfo | null;
  equipped_frame: FrameStub | null;
  frames_owned: number[];
  freezes: { allowance: number; used_this_month: number };
}

export interface QuotaUsage {
  limit: number;
  used: number;
  remaining: number;
}

export type Quotas = Partial<Record<"swipes" | "culture_calls" | "recommendation_calls", QuotaUsage>>;

export interface PaymentMethodStub {
  id: number;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface Transaction {
  id: number;
  type: "purchase" | "renewal";
  status: "succeeded" | "declined" | "error";
  amount_vnd: number;
  currency: string;
  decline_code: string | null;
  receipt_number: string | null;
  provider_txn_id: string;
  created_at: string;
}

export interface Receipt {
  receipt_number: string;
  plan: string | null;
  amount_vnd: number;
  currency: string;
  card_last4: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface SubscribeCardInput {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name?: string;
}

export interface SubscribeResult {
  subscription: SubscriptionInfo;
  transaction: Transaction;
  tier: MembershipTier;
}

export const TIER_ORDER: MembershipTier[] = ["bite", "savor", "feast", "omakase"];
export const SAVOR_STREAK_DAYS = 7;
export const OMAKASE_STREAK_DAYS = 14;

export function tierRank(tier: MembershipTier): number {
  return TIER_ORDER.indexOf(tier);
}
