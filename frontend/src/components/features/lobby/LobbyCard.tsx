"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Clock } from "lucide-react";
import type { LobbyCardProps } from "./types";
import { AvatarStack, StatusBadge } from "./LobbyUI";
import { useAuth } from "@/context/AuthContext";

/**
 * A single lobby card rendered in the iOS Light Mode style.
 * Features spring hover animation, pulsing live status, and avatar stack.
 */
export default function LobbyCard({ lobby, onClick }: LobbyCardProps) {
  const { user } = useAuth();
  const spotsLeft = lobby.spots - lobby.members.length;
  const isJoined = Boolean(
    user &&
    lobby.members.some(
      (m) =>
        m.user_id === user.id ||
        m.name === user.username ||
        m.name === user.display_name,
    ),
  );

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
        <StatusBadge spotsLeft={spotsLeft} />
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
        <AvatarStack members={lobby.members} spotsLeft={spotsLeft} />
        <button
          className={`${
            isJoined
              ? "bg-[#34C759] hover:bg-[#28A745] text-white"
              : "bg-[#FFF0E6] hover:bg-[#FFE0CC] text-[#ff6b35]"
          } text-[14px] font-semibold py-2 px-4 rounded-full transition-colors`}
        >
          {isJoined ? "Vào phòng" : "Join"}
        </button>
      </div>
    </motion.div>
  );
}
