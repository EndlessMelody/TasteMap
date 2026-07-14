export type AdminChallengeDifficulty = "Easy" | "Medium" | "Hard";
export type AdminChallengeStatus = "Active" | "Draft" | "Expired" | "Scheduled";

export interface AdminChallenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: AdminChallengeDifficulty;
  xp_reward: number;
  target_count: number;
  action_type: string;
  action_filter: Record<string, unknown> | null;
  badge_id: number | null;
  icon: string;
  accent_color: string;
  duration_days: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_recurring: boolean;
  participants_count: number;
  completion_rate: number;
  // UI helper field, computed client-side from is_active/start_date/end_date.
  computedStatus?: AdminChallengeStatus;
}

/** Shape of the create/edit form's local state — numeric fields are edited as strings. */
export interface ChallengeFormData {
  title: string;
  description: string;
  category: string;
  difficulty: AdminChallengeDifficulty;
  xp_reward: number | string;
  target_count: number | string;
  action_type: string;
  /** JSON text while being edited; parsed to an object on submit. */
  action_filter: string;
  icon: string;
  accent_color: string;
  badge_id: number | string;
  duration_days: number | string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_recurring: boolean;
}
