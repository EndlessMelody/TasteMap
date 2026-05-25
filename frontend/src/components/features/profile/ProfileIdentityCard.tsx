"use client";

import React from "react";
import { Flame, MapPin, Calendar } from "lucide-react";
import { Card, H1, Body, BodySm, Caption, Pill } from "@/components/ui";
import { tokens } from "@/styles/tokens";
interface ProfileIdentityCardLike {
  username?: string;
  display_name?: string;
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  xp?: number | null;
  level?: number | null;
  created_at?: string;
}

interface ProfileIdentityCardProps {
  user: ProfileIdentityCardLike | null;
}

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}

function StatTile({ icon, label, value, accent }: StatTileProps) {
  return (
    <Card radius="lg" padding="md" shadow="sm">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[3],
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: tokens.radius.md,
            background: accent
              ? "rgba(255, 107, 53, 0.1)"
              : tokens.color.surfaceMuted,
            color: accent ? tokens.color.warm : tokens.color.textMuted,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Caption tone="muted">{label}</Caption>
          <Body style={{ fontWeight: tokens.type.weight.semibold }}>
            {value}
          </Body>
        </div>
      </div>
    </Card>
  );
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  user,
}) => {
  const xpCurrent = user?.xp || 0;
  const level = user?.level || 1;
  const xpForLevel = level * 1000;
  const xpProgress = Math.min((xpCurrent / xpForLevel) * 100, 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[4],
      }}
    >
      <Card radius="xl" padding="lg" shadow="sm">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[3],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: tokens.space[3],
            }}
          >
            <H1>{user?.display_name || user?.username || "Guest"}</H1>
            <Pill tone="warm" size="md">
              {user?.title || "Taste Explorer"}
            </Pill>
          </div>

          <BodySm
            tone="muted"
            style={{ fontWeight: tokens.type.weight.semibold }}
          >
            @{user?.username || "guest"}
          </BodySm>

          <Body tone="muted" style={{ maxWidth: 600 }}>
            {user?.bio ||
              "Exploring flavors, one bite at a time. Join me on this delicious journey!"}
          </Body>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: tokens.space[4],
        }}
      >
        <Card radius="lg" padding="md" shadow="sm">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[2],
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[2],
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: tokens.radius.sm,
                  background: tokens.color.warm,
                  color: tokens.color.textInverse,
                }}
              >
                <Flame size={14} strokeWidth={2} />
              </span>
              <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                Level {level}
              </Body>
            </div>
            <div
              style={{
                width: "100%",
                height: 6,
                background: tokens.color.surfaceInset,
                borderRadius: tokens.radius.pill,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${xpProgress}%`,
                  height: "100%",
                  background: tokens.color.warm,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <Caption tone="muted">
              {xpCurrent} / {xpForLevel} XP
            </Caption>
          </div>
        </Card>

        <StatTile
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label="Location"
          value={user?.location || "Exploring"}
          accent
        />

        <StatTile
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Member since"
          value={
            user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "Mar 2025"
          }
        />
      </div>
    </div>
  );
};

export default ProfileIdentityCard;
