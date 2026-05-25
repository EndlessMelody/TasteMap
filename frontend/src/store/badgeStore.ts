import { create } from 'zustand';
import { BadgeSummary, UserBadgeResponse } from '@/types/gamification';
import { apiGet } from '@/lib/api';

interface BadgeState {
  // Keyed by user ID. Use -1 for "current user" initial state if needed
  badgesByUser: Record<number, BadgeSummary[]>;
  loading: boolean;
  error: string | null;
  fetchUserBadges: (userId?: number) => Promise<void>;
  getUserBadges: (userId: number) => BadgeSummary[];
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  badgesByUser: {},
  loading: false,
  error: null,

  fetchUserBadges: async (userId?: number) => {
    // If we have data for this user, skip unless forced (can add force param later)
    if (userId && get().badgesByUser[userId]) return;

    set({ loading: true, error: null });
    try {
      const endpoint = userId ? `/api/v1/badges/user/${userId}` : '/api/v1/badges/me';
      const data = await apiGet<UserBadgeResponse[]>(endpoint);
      
      // Flatten the nested UserBadgeResponse into BadgeSummary
      const flattenedbadges: BadgeSummary[] = (data || []).map(item => ({
        ...item.badge,
        earned_at: item.earned_at
      }));

      // If it was "me", we might not have the userId passed in.
      // We'll store it under the userId from any item (they all should have same if it's the same user)
      // but if list is empty, we need another way.
      // For now, let's just use the passed userId or a placeholder if it's "me"
      // Wait, let's assume if userId is passed, we use it. If not, we might need to store it under "me" key if we can't find ID.
      // Better: if userId is passed, use it. If not, just for now use -1 or a specific key for "self".
      
      const key = userId || -1; // -1 represents "me" if ID is unknown

      set((state) => ({
        badgesByUser: {
          ...state.badgesByUser,
          [key]: flattenedbadges
        },
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch badges', 
        loading: false 
      });
    }
  },

  getUserBadges: (userId: number) => {
    return get().badgesByUser[userId] || get().badgesByUser[-1] || [];
  }
}));
