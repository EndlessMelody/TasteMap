"use client";

import React from "react";
import { Users, UserPlus } from "lucide-react";
import {
  Card,
  H3,
  Body,
  BodySm,
  Button,
  Pill,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

export interface FriendItem {
  id: number;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  title?: string | null;
  match_score: number;
  friendship_id?: number | null;
}

export interface FriendsListCardProps {
  friendsList: FriendItem[];
  friendsLoading: boolean;
  onSeeAll: () => void;
}

function FriendRow({
  friend,
  onClick,
}: {
  friend: FriendItem;
  onClick: () => void;
}) {
  const highMatch = friend.match_score >= 80;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: tokens.space[3],
        padding: tokens.space[3],
        borderRadius: tokens.radius.md,
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = tokens.color.surfaceMuted;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <img
        src={friend.avatar_url || `https://i.pravatar.cc/150?u=${friend.id}`}
        alt=""
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: highMatch
            ? `2px solid ${tokens.color.warm}`
            : `1px solid ${tokens.color.border}`,
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Body
          style={{
            fontWeight: tokens.type.weight.semibold,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {friend.display_name || friend.username}
        </Body>
        <BodySm
          tone="muted"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {friend.title || friend.location || `@${friend.username}`}
        </BodySm>
      </div>
      <Pill tone={highMatch ? "warm" : "neutral"} size="sm">
        {friend.match_score}%
      </Pill>
    </button>
  );
}

export const FriendsListCard: React.FC<FriendsListCardProps> = ({
  friendsList,
  friendsLoading,
  onSeeAll,
}) => {
  return (
    <Card radius="xl" padding="md" shadow="sm" style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: tokens.space[4],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
          }}
        >
          <Users
            size={18}
            strokeWidth={1.75}
            style={{ color: tokens.color.textMuted }}
          />
          <H3>Friends</H3>
          <Pill tone="neutral" size="sm">
            {friendsList.length}
          </Pill>
        </div>
        <Button variant="ghost" size="sm" onClick={onSeeAll}>
          See all
        </Button>
      </div>

      {friendsLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[2],
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[3],
                padding: tokens.space[3],
              }}
            >
              <Skeleton width={40} height={40} radius="pill" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton width="55%" height={13} />
                <Skeleton width="75%" height={11} />
              </div>
            </div>
          ))}
        </div>
      ) : friendsList.length === 0 ? (
        <EmptyState
          compact
          icon={<UserPlus size={24} strokeWidth={1.75} />}
          title="No friends yet"
          description="Start exploring and connect with foodies who share your taste."
          action={
            <Button variant="primary" size="sm" onClick={onSeeAll}>
              Discover foodies
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[1],
          }}
        >
          {friendsList.slice(0, 5).map((friend) => (
            <FriendRow key={friend.id} friend={friend} onClick={onSeeAll} />
          ))}

          {friendsList.length > 5 && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={onSeeAll}
              style={{ marginTop: tokens.space[2] }}
            >
              See all {friendsList.length} friends
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default FriendsListCard;
