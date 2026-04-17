"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { BadgeSummary } from "@/types/gamification";

export interface UserData {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  title?: string;
  phone?: string;
  role: string;
  xp: number;           // XP earned WITHIN the current level (relative)
  level: number;
  next_level_xp: number; // XP needed to complete the current level (relative)
  total_xp_earned: number; // Absolute total XP ever earned
  created_at?: string;
  stats?: {
    reviews: number;
    visited: number;
    followers: number;
    following: number;
  };
  badges?: BadgeSummary[];
}

interface AuthContextValue {
  isInitializing: boolean;
  isLoggedIn: boolean;
  user: UserData | null;
  login: (credentials: {
    emailOrUsername: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isInitializing: true,
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // isHydrated: false on server (SSR), true on client after hydration
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true, // client snapshot
    () => false, // server snapshot
  );

  // isInitializing: true while SSR or while checking auth state
  const isInitializing = !isHydrated || !authChecked;

  useEffect(() => {
    let isMounted = true;

    // onAuthStateChange handles all session states:
    // - INITIAL_SESSION: fires on mount with the restored session (or null).
    //   This replaces the old getSession() call and correctly handles expired
    //   tokens by auto-refreshing before firing, preventing false logouts.
    // - SIGNED_IN: new explicit login or post-OAuth redirect
    // - SIGNED_OUT: logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      try {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          if (session) {
            try {
              const userData = await apiPost<UserData>("/api/v1/auth/sync");
              if (isMounted) {
                setUser(userData);
                document.cookie = `user_role=${userData.role}; path=/; max-age=86400`;
              }
            } catch {
              // Backend unreachable — keep user logged in via Supabase session
              if (isMounted && session.user) {
                const meta = session.user.user_metadata ?? {};
                setUser({
                  id: 0,
                  username:
                    meta.username ??
                    session.user.email?.split("@")[0] ??
                    "user",
                  email: session.user.email ?? "",
                  display_name: meta.display_name ?? meta.username ?? undefined,
                  avatar_url: meta.avatar_url ?? undefined,
                  role: "user",
                  xp: 0,
                  level: 1,
                  next_level_xp: 100,
                  total_xp_earned: 0,
                });
                document.cookie = `user_role=user; path=/; max-age=86400`;
              }
            }
          }
          if (isMounted) setAuthChecked(true);
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setUser(null);
            setAuthChecked(true);
            document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      } catch (err) {
        console.warn("[AuthContext] Unexpected error in auth handler:", err);
        if (isMounted) setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const login = async ({
    emailOrUsername,
    password,
  }: {
    emailOrUsername: string;
    password: string;
  }) => {
    setError(null);
    let email = emailOrUsername.trim();

    // Resolve username → email if input has no '@'
    if (!email.includes("@")) {
      try {
        const { email: resolved } = await apiPost<{ email: string }>(
          "/api/v1/auth/resolve-email",
          { username: email },
        );
        email = resolved;
      } catch {
        const msg = "No account found with that username.";
        setError(msg);
        throw new Error(msg);
      }
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      throw authError;
    }
    // User will be set by the SIGNED_IN onAuthStateChange event
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setError(null);
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isInitializing,
        isLoggedIn: !!user,
        user,
        login,
        logout,
        refreshUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
