"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { UserMe } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  user: UserMe | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<UserMe | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      // Gọi API Me để lấy thông tin từ PostgreSQL (yêu cầu token trong header đã được api.ts xử lý)
      const data = await apiGet<UserMe>("/api/v1/users/me");
      setUser(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      console.error("Auth fetch failed", err);
      // Nếu 401 thì user chưa được đồng bộ hoặc chưa login
      setUser(null);
      // Giữ loading true nếu có thể còn sync
      return null;
    }
  }, []);

  const syncAndFetch = useCallback(async (session: any) => {
    if (!session) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi endpoint /sync để JIT Provisioning (Đã có token trong header của apiPost)
      await apiPost("/api/v1/auth/sync");
      // 2. Fetch lại profile đầy đủ
      await fetchUser();
    } catch (err: any) {
      console.error("Sync failed", err);
      setError(err.message || "Failed to sync user context");
      setLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    let isMounted = true;

    // 1. Kiểm tra session hiện tại (nhờ SSR cookies, session có sẵn nhanh chóng)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        // Có session ở browser (từ cookie) -> Fetch user
        const currentUser = await fetchUser();
        // Không sync ở đây trên page reload vì nếu user chưa có thì là do api fetch lỗi. 
        // Chỉ sync khi có sự kiện SIGNED_IN.
      } else {
        setLoading(false);
      }
    });

    // 2. Lắng nghe thay đổi trạng thái auth (ví dụ khi mới login xong)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session) {
        if (event === 'SIGNED_IN') {
           // Mới login xong (ví dụ từ Google OAuth redirect hoặc form login) -> cần sync JIT Provisioning
           syncAndFetch(session);
        } else if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
           if (!user) {
             setLoading(true);
             await fetchUser();
           }
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncAndFetch, fetchUser]); // Note: user is out of deps to prevent loop

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, refetch: fetchUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
