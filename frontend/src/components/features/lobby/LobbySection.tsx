"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import type { LobbyData, LobbySectionProps } from "./types";
import { useGroups } from "@/hooks/useGroups";
import { useAuth } from "@/context/AuthContext";
import LobbyCard from "./LobbyCard";
import LobbyDetailModal from "./LobbyDetailModal";

/**
 * The top-level "Live Group Lobbies" section.
 * Manages internal state for which lobby is selected (modal).
 * Accepts optional `lobbies` prop; defaults to MOCK_LOBBIES.
 */
export default function LobbySection({ lobbies }: LobbySectionProps) {
  const { lobbies: apiLobbies, loading, error } = useGroups("active");
  // If lobbies prop is explicitly passed (e.g. from parent), use that; else use API
  const data = lobbies ?? apiLobbies;
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleLobbyClick = (lobby: LobbyData) => {
    const isJoined = Boolean(
      user &&
      lobby.members.some(
        (m) =>
          m.user_id === user.id ||
          m.name === user.username ||
          m.name === user.display_name,
      ),
    );
    if (isJoined && lobby.id) {
      router.push(`/group-rooms/${lobby.id}`);
    } else {
      setSelectedLobby(lobby);
    }
  };

  return (
    <div
      className="font-sans antialiased"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Section Container */}
      <div className="w-full flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#FFF0E6] flex items-center justify-center">
              <Users size={18} className="text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold tracking-tight text-[#1C1C1E]">
                Live Group Lobbies
              </h2>
              <p className="text-[13px] text-[#8E8E93]">
                {data.length} active sessions near you
              </p>
            </div>
          </div>
          <Link
            href="/group-rooms"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#ff6b35] bg-[#FFF0E6] px-3 py-1.5 rounded-full hover:bg-[#FFE0CC] transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {loading ? (
            // Skeleton loader
            [1, 2].map((i) => (
              <div
                key={i}
                style={{
                  minWidth: 280,
                  height: 180,
                  borderRadius: 16,
                  background:
                    "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
            ))
          ) : error ? (
            <p
              style={{
                color: "#8E8E93",
                fontSize: "0.85rem",
                padding: "16px 0",
              }}
            >
              Không thể tải lobby: {error}
            </p>
          ) : data.length === 0 ? (
            <p
              style={{
                color: "#8E8E93",
                fontSize: "0.85rem",
                padding: "16px 0",
              }}
            >
              Chưa có lobby nào đang active.
            </p>
          ) : (
            data.map((lobby, idx) => (
              <LobbyCard
                key={idx}
                lobby={lobby}
                onClick={() => handleLobbyClick(lobby)}
              />
            ))
          )}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedLobby && (
          <LobbyDetailModal
            lobby={selectedLobby}
            onClose={() => setSelectedLobby(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
