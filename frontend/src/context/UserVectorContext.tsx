"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { MOCK_USER } from "@/constants/mock-data";

interface RadarPoint {
  subject: string;
  A: number;
  fullMark: number;
}

interface UserVectorContextType {
  radarData: RadarPoint[];
  mergedRadarData: (RadarPoint & { prevA?: number })[];
  updateVector: (traits: string[], direction: 'select' | 'skip') => void;
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
  const [radarData, setRadarData] = useState<RadarPoint[]>(MOCK_USER.radarData);
  const [previousRadarData, setPreviousRadarData] = useState<RadarPoint[] | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  
  const lastUpdateRef = useRef<number>(Date.now());

  const updateVector = useCallback((traits: string[], direction: 'select' | 'skip') => {
    const now = Date.now();
    const timeDelta = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

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
  }, [radarData]);

  const mergedRadarData = radarData.map((point, index) => ({
    ...point,
    prevA: previousRadarData?.[index]?.A ?? undefined
  }));

  return (
    <UserVectorContext.Provider value={{ radarData, mergedRadarData, updateVector, isPulsing }}>
      {children}
    </UserVectorContext.Provider>
  );
};
