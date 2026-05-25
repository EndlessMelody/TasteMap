"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

interface RadarPoint {
  subject: string;
  A: number;
  fullMark: number;
}

interface UserVectorContextType {
  radarData: RadarPoint[];
  mergedRadarData: (RadarPoint & { prevA?: number })[];
  updateVector: (venueId: number, traits: string[], direction: 'select' | 'skip') => void;
  /** Imperatively flush the pending swipe queue. Use before tour finalization. */
  flushSwipeQueue: () => Promise<void>;
  isPulsing: boolean;
}

const UserVectorContext = createContext<UserVectorContextType | undefined>(undefined);

export const useUserVector = () => {
  const context = useContext(UserVectorContext);
  if (!context) {
    throw new Error("useUserVector must be used within a UserVectorProvider");
  }
  return context;
};

// Mapping from venue tags to Radar subjects
const TRAIT_MAP: Record<string, string> = {
  "Street Food": "Street Food",
  "Spicy": "Spicy",
  "Sweet": "Sweet",
  "Cafe": "Sweet",
  "Luxury": "Luxury",
  "Premium": "Luxury",
  "Quiet": "Quiet",
  "Aesthetic": "Quiet",
  "Group": "Group",
  "Nightlife": "Group",
  "Beer": "Group",
  "Budget": "Street Food",
  "Classy": "Luxury",
};

export const UserVectorProvider: ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element = ({ children }) => {
  const { user } = useAuth();
  
  const [radarData, setRadarData] = useState<RadarPoint[]>([
    { subject: "Street Food", A: 100, fullMark: 150 },
    { subject: "Spicy", A: 71, fullMark: 150 },
    { subject: "Sweet", A: 90, fullMark: 150 },
    { subject: "Luxury", A: 56, fullMark: 150 },
    { subject: "Quiet", A: 85, fullMark: 150 },
    { subject: "Group", A: 120, fullMark: 150 },
  ]);

  useEffect(() => {
    const vec = (user as any)?.food_vector;
    if (Array.isArray(vec) && vec.length >= 6) {
      setRadarData([
        { subject: "Street Food", A: Math.round(vec[0] * 150) || 100, fullMark: 150 },
        { subject: "Spicy", A: Math.round(vec[1] * 150) || 71, fullMark: 150 },
        { subject: "Sweet", A: Math.round(vec[2] * 150) || 90, fullMark: 150 },
        { subject: "Luxury", A: Math.round(vec[3] * 150) || 56, fullMark: 150 },
        { subject: "Quiet", A: Math.round(vec[4] * 150) || 85, fullMark: 150 },
        { subject: "Group", A: Math.round(vec[5] * 150) || 120, fullMark: 150 },
      ]);
    }
  }, [user]);

  const [previousRadarData, setPreviousRadarData] = useState<RadarPoint[] | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  
  const lastUpdateRef = useRef<number>(Date.now());
  const swipeQueueRef = useRef<{place_id: number, direction: "RIGHT" | "LEFT", client_timestamp: number}[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const flushSwipeQueue = useCallback(async () => {
    if (swipeQueueRef.current.length === 0) return;
    const actions = [...swipeQueueRef.current];
    swipeQueueRef.current = [];

    const userId = (user as any)?.id || "guest-id";

    try {
      await apiPost<any>("/api/v1/interactions/swipe-batch", {
        user_id: String(userId),
        domain: "food",
        actions: actions,
      });
    } catch (e) {
      console.error("Failed to send swipe batch", e);
    }
  }, [user]);

  const updateVector = useCallback((venueId: number, traits: string[], direction: 'select' | 'skip') => {
    const now = Date.now();
    const timeDelta = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    swipeQueueRef.current.push({
      place_id: venueId,
      direction: direction === 'select' ? "RIGHT" : "LEFT",
      client_timestamp: now
    });

    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    if (swipeQueueRef.current.length >= 5) {
      flushSwipeQueue();
    } else {
      batchTimerRef.current = setTimeout(flushSwipeQueue, 3000);
    }

    // ─── Rule: Exponential Decay for Rapid Swiping ───
    let alpha = direction === 'select' ? 0.15 : -0.05;
    if (timeDelta < 500) {
      const penalty = Math.max(0, timeDelta / 500); 
      alpha *= penalty;
    }

    setPreviousRadarData([...radarData]);
    setIsPulsing(true);

    setRadarData((prev) => {
      return prev.map((point) => {
        const matches = traits.some(t => TRAIT_MAP[t] === point.subject);
        
        if (matches) {
          const delta = alpha * (point.fullMark / 5);
          const newA = Math.min(point.fullMark, Math.max(20, point.A + delta));
          return { ...point, A: Math.round(newA) };
        }
        return point;
      });
    });

    // Reset pulse after animation
    setTimeout(() => setIsPulsing(false), 1000);
    // Fade out previous data after delta display
    setTimeout(() => setPreviousRadarData(null), 2500);
  }, [radarData, flushSwipeQueue]);

  const mergedRadarData = radarData.map((point, index) => ({
    ...point,
    prevA: previousRadarData?.[index]?.A ?? undefined
  }));

  return (
    <UserVectorContext.Provider value={{ radarData, mergedRadarData, updateVector, flushSwipeQueue, isPulsing }}>
      {children}
    </UserVectorContext.Provider>
  );
};
