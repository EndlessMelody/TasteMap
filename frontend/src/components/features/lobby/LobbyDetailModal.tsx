"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, MapPin, Clock, Crown, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import type { LobbyModalProps } from "./types";
import { LivePing } from "./LobbyUI";

/**
 * Full-screen iOS-style modal for viewing lobby details.
 * Shows participant list, empty spots, and a join CTA button.
 */
export default function LobbyDetailModal({ lobby, onClose }: LobbyModalProps) {
  const router = useRouter();
  const [joining, setJoining] = React.useState(false);
  const spotsLeft = lobby.spots - lobby.members.length;

  const handleJoin = async () => {
    if (!lobby.id) return toast.error("Invalid lobby ID");
    setJoining(true);
    try {
      await apiPost(`/api/v1/groups/${lobby.id}/join`);
      router.push(`/group-rooms/${lobby.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to join lobby");
      setJoining(false);
    }
  };

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
        {/* Header — Pastel Blue */}
        <div className="bg-[#EAF2FF] p-6 relative">
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
            <LivePing />
            <span className="text-[12px] font-bold text-[#34C759] uppercase tracking-wider">
              Live Now
            </span>
          </div>

          <h2 className="text-[24px] font-bold tracking-tight text-[#1C1C1E] leading-snug">
            {lobby.name}
          </h2>
          <p className="text-[#007AFF] font-medium text-[15px] mt-1">
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
                    <span className="text-[12px] bg-[#EAF2FF] text-[#007AFF] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
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
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#D6E6FF] bg-[#EAF2FF] flex items-center justify-center">
                  <Plus size={14} className="text-[#007AFF]" />
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
            onClick={handleJoin}
            disabled={joining}
            className="w-full flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[17px] font-semibold py-4 rounded-[16px] transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            style={{ boxShadow: "0 4px 14px rgb(0 122 255 / 0.3)" }}
          >
            {joining && <Loader2 size={18} className="animate-spin" />}
            {joining ? "Joining..." : "Confirm & Join Lobby"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
