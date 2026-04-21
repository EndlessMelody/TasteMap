import React from "react";

export type Difficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "active" | "completed" | "claimed" | "requires_opt_in" | "upcoming";
export type ChallengeCategory = "discovery" | "social" | "review" | "cuisine" | "streak";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  xp_reward: number;
  progress: number;
  target_count: number;
  difficulty: Difficulty;
  icon: string;
  accent_color: string;
  status: ChallengeStatus;
  deadline_display?: string;
  badge_reward?: string;
  claimed_at?: string;
}

export interface ChallengeResponse {
  id: string;
  challenge: {
    id: string;
    title: string;
    description: string;
    category: ChallengeCategory;
    difficulty: Difficulty;
    xp_reward: number;
    target_count: number;
    icon: string;
    accent_color: string;
    badge_reward?: string;
  };
  progress: number;
  target: number;
  status: ChallengeStatus;
  started_at: string;
  expires_at?: string;
  deadline_display?: string;
  completed_at?: string;
  claimed_at?: string;
  percentage: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  title?: string;
  featured_badge?: string;
  is_current_user: boolean;
}

export interface BadgeSummary {
  id: number;
  name: string;
  description?: string;
  icon_name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  accent_color: string;
  is_hidden: boolean;
  earned_at?: string;
}

export interface UserBadgeResponse {
  badge: BadgeSummary;
  earned_at?: string;
}

export interface UserGamificationInfo {
  current_xp: number;
  xp: number; // For backward compatibility
  level: number;
  next_level_xp: number;
  xp_to_next_level: number;
  title: string;
  total_xp_earned: number;
  progress_percentage: number;
  rank?: number;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
  is_active_today: boolean;
  streak_bonus_xp: number;
}
