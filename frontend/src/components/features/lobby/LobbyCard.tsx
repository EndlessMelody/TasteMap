"use client";

import React from "react";
import { Users, MapPin, Clock } from "lucide-react";
import type { LobbyCardProps } from "./types";
import { AvatarStack, StatusBadge } from "./LobbyUI";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, H3, BodySm } from "@/components/ui";
import { tokens } from "@/styles/tokens";

export default function LobbyCard({ lobby, onClick }: LobbyCardProps) {
  const { user } = useAuth();
  const spotsLeft = lobby.spots - lobby.members.length;
  const isJoined = Boolean(
    user && lobby.members.some((m) => m.user_id === user.id),
  );

  return (
    <Card
      radius="lg"
      padding="md"
      shadow="sm"
      interactive
      onClick={onClick}
      style={{
        minWidth: 300,
        cursor: "pointer",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: tokens.space[3],
        }}
      >
        <StatusBadge spotsLeft={spotsLeft} />
        <Users
          size={16}
          strokeWidth={1.75}
          style={{ color: tokens.color.textMuted }}
        />
      </div>

      <H3>{lobby.name}</H3>
      <BodySm
        tone="muted"
        style={{
          marginTop: tokens.space[1],
          display: "flex",
          alignItems: "center",
          gap: tokens.space[1],
        }}
      >
        <MapPin size={14} strokeWidth={1.75} />
        {lobby.route}
      </BodySm>
      <BodySm
        tone="muted"
        style={{
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          gap: tokens.space[1],
        }}
      >
        <Clock size={13} strokeWidth={1.75} />
        {lobby.time}
      </BodySm>

      <div
        style={{
          marginTop: tokens.space[5],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <AvatarStack members={lobby.members} spotsLeft={spotsLeft} />
        <Button variant={isJoined ? "secondary" : "primary"} size="sm">
          {isJoined ? "Enter room" : "Join"}
        </Button>
      </div>
    </Card>
  );
}
