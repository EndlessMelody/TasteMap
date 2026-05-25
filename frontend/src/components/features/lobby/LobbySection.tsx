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
import { H2, Body, Caption, Eyebrow, BodySm, Skeleton } from "@/components/ui";
import { tokens } from "@/styles/tokens";

export default function LobbySection({ lobbies }: LobbySectionProps) {
  const { lobbies: apiLobbies, loading, error } = useGroups("active");
  const data = lobbies ?? apiLobbies;
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleLobbyClick = (lobby: LobbyData) => {
    const isJoined = Boolean(
      user && lobby.members.some((m) => m.user_id === user.id),
    );
    if (isJoined && lobby.id) {
      router.push(`/group-rooms/${lobby.id}`);
    } else {
      setSelectedLobby(lobby);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[5],
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: `0 ${tokens.space[4]}`,
          gap: tokens.space[3],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[1],
            flex: 1,
            minWidth: 0,
          }}
        >
          <Eyebrow tone="muted">Collaborate</Eyebrow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
            }}
          >
            <Users
              size={20}
              strokeWidth={1.75}
              style={{ color: tokens.color.warm, flexShrink: 0 }}
            />
            <H2>Social tables</H2>
          </div>
          <BodySm tone="muted">{data.length} active sessions near you</BodySm>
        </div>
        <Link
          href="/group-rooms"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[1],
            padding: `${tokens.space[1]} ${tokens.space[3]}`,
            borderRadius: tokens.radius.pill,
            background: "rgba(255, 107, 53, 0.1)",
            color: tokens.color.warm,
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.semibold,
            textDecoration: "none",
          }}
        >
          View all
          <ArrowRight size={14} strokeWidth={1.75} />
        </Link>
      </div>

      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: tokens.space[4],
          overflowX: "auto",
          paddingBottom: tokens.space[2],
        }}
      >
        {loading ? (
          [1, 2].map((i) => (
            <Skeleton
              key={i}
              width={280}
              height={180}
              radius="lg"
              style={{ flexShrink: 0 }}
            />
          ))
        ) : error ? (
          <BodySm
            tone="muted"
            style={{ padding: `${tokens.space[4]} 0` }}
          >
            Unable to load lobbies: {error}
          </BodySm>
        ) : data.length === 0 ? (
          <BodySm
            tone="muted"
            style={{ padding: `${tokens.space[4]} 0` }}
          >
            No active lobbies right now.
          </BodySm>
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
