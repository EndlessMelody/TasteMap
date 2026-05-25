"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Plus, X, Clock, Crown } from "lucide-react";

// ═══════════ TYPES ═══════════ //
export interface LobbyMember {
  name: string;
  avatar: string;
  ready: boolean;
}

export interface LobbyData {
  name: string;
  route: string;
  time: string;
  spots: number;
  bg: string;
  accent: string;
  members: LobbyMember[];
}

// ═══════════ LOBBY CARD (iOS Style) ═══════════ //
function IOSLobbyCard({
  lobby,
  onClick,
}: {
  lobby: LobbyData;
  onClick: () => void;
}) {
  const spotsLeft = lobby.spots - lobby.members.length;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="min-w-[300px] bg-white rounded-[24px] p-5 border border-gray-100 cursor-pointer flex-shrink-0 select-none"
      style={{
        boxShadow: "0 8px 30px rgb(0 0 0 / 0.04)",
        transition: "box-shadow 0.3s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 12px 40px rgb(0 122 255 / 0.08)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 30px rgb(0 0 0 / 0.04)")
      }
    >
      {/* Top Bar — Live Status */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]" />
          </span>
          <span className="text-[13px] font-semibold text-[#34C759]">
            {spotsLeft > 0 ? `Waiting for ${spotsLeft}` : "Full"}
          </span>
        </div>
        <Users size={16} className="text-[#8E8E93]" />
      </div>

      {/* Main Content */}
      <h3 className="text-[19px] font-bold tracking-tight text-[#1C1C1E] leading-snug">
        {lobby.name}
      </h3>
      <p className="text-[14px] text-[#8E8E93] mt-1 flex items-center gap-1.5">
        <MapPin size={14} /> {lobby.route}
      </p>
      <p className="text-[13px] text-[#8E8E93] mt-0.5 flex items-center gap-1.5">
        <Clock size={13} /> {lobby.time}
      </p>

      {/* Bottom Bar — Avatars & CTA */}
      <div className="mt-5 flex justify-between items-end">
        {/* Avatars */}
        <div className="flex -space-x-2">
          {lobby.members.map((m, i) => (
            <img
              key={i}
              src={m.avatar}
              alt={m.name}
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              style={{ zIndex: lobby.members.length - i }}
            />
          ))}
          {spotsLeft > 0 && (
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#E5E5EA] bg-[#F2F2F7] flex items-center justify-center">
              <Plus size={12} className="text-[#8E8E93]" />
            </div>
          )}
        </div>

        {/* Join Button */}
        <button className="bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#ff6b35] text-[14px] font-semibold py-2 px-4 rounded-full transition-colors">
          Join
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════ LOBBY MODAL (iOS Style) ═══════════ //
function IOSLobbyModal({
  lobby,
  onClose,
}: {
  lobby: LobbyData;
  onClose: () => void;
}) {
  const spotsLeft = lobby.spots - lobby.members.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 20px 50px rgb(0 0 0 / 0.1)" }}
      >
        {/* Header — Pastel Orange */}
        <div className="bg-[#FFF0E6] p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close"
            className="absolute top-4 right-4 bg-white/50 hover:bg-white text-[#1C1C1E] rounded-full p-2 backdrop-blur-sm transition"
          >
            <X size={18} />
          </button>

          {/* Live badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
            </span>
            <span className="text-[12px] font-bold text-[#34C759] uppercase tracking-wider">
              Live Now
            </span>
          </div>

          <h2 className="text-[24px] font-bold tracking-tight text-[#1C1C1E] leading-snug">
            {lobby.name}
          </h2>
          <p className="text-[#ff6b35] font-medium text-[15px] mt-1">
            {lobby.spots} Spots Total •{" "}
            {spotsLeft > 0 ? `${spotsLeft} Left` : "Full"}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-[#8E8E93] text-[13px]">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {lobby.route}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {lobby.time}
            </span>
          </div>
        </div>

        {/* Body — Participant List */}
        <div className="p-6">
          <h4 className="text-[13px] uppercase font-bold text-[#8E8E93] tracking-wider mb-4">
            Current Explorers
          </h4>

          <div className="space-y-3">
            {lobby.members.map((member, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-[#1C1C1E] text-[15px]">
                      {member.name}
                    </p>
                    <p className="text-[12px] text-[#8E8E93]">
                      {member.ready ? "Ready" : "Not ready yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-[12px] bg-[#FFF0E6] text-[#ff6b35] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                      <Crown size={11} /> Creator
                    </span>
                  )}
                  {member.ready && (
                    <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                  )}
                </div>
              </div>
            ))}

            {/* Empty Spots */}
            {Array.from({ length: spotsLeft }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 opacity-40"
              >
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#FFE0CC] bg-[#FFF0E6] flex items-center justify-center">
                  <Plus size={14} className="text-[#ff6b35]" />
                </div>
                <p className="text-[14px] text-[#8E8E93]">
                  Waiting for explorer...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — Action */}
        <div className="p-6 pt-2">
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full bg-[#ff6b35] hover:bg-[#e65721] text-white text-[17px] font-semibold py-4 rounded-[16px] transition-transform active:scale-[0.98] cursor-pointer"
            style={{ boxShadow: "0 4px 14px rgb(255 107 53 / 0.3)" }}
          >
            Confirm & Join Lobby
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════ MAIN SECTION EXPORT ═══════════ //
export default function IOSLobbiesSection({
  lobbies,
}: {
  lobbies: LobbyData[];
}) {
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);

  return (
    <div
      className="font-sans antialiased"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Section Container — pastel island */}
      <div className="bg-[#F2F2F7] rounded-[28px] p-6 border border-[#E8ECF0]">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#FFF0E6] flex items-center justify-center">
              <Users size={18} className="text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold tracking-tight text-[#1C1C1E]">
                Live Group Lobbies
              </h2>
              <p className="text-[13px] text-[#8E8E93]">
                {lobbies.length} active sessions near you
              </p>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#ff6b35] bg-[#FFF0E6] px-3 py-1.5 rounded-full">
            {lobbies.length} Active
          </span>
        </div>

        {/* Cards Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {lobbies.map((lobby, idx) => (
            <IOSLobbyCard
              key={idx}
              lobby={lobby}
              onClick={() => setSelectedLobby(lobby)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedLobby && (
          <IOSLobbyModal
            lobby={selectedLobby}
            onClose={() => setSelectedLobby(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
