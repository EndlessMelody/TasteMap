"use client";

import React from "react";
import { Users, UserPlus } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
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
      <Column style={{ flex: 1, minWidth: 0 }}>
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
      </Column>
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
      <Row horizontal="between" vertical="center" style={{ marginBottom: tokens.space[4] }}>
        <Row vertical="center" style={{ gap: tokens.space[2] }}>
          <Users
            size={18}
            strokeWidth={1.75}
            style={{ color: tokens.color.textMuted }}
          />
          <H3>Friends</H3>
          <Pill tone="neutral" size="sm">
            {friendsList.length}
          </Pill>
        </Row>
        <Button variant="ghost" size="sm" onClick={onSeeAll}>
          See all
        </Button>
      </Row>

      {friendsLoading ? (
        <Column style={{ gap: tokens.space[2] }}>
          {[1, 2, 3].map((i) => (
            <Row key={i} vertical="center" style={{ gap: tokens.space[3], paddingTop: tokens.space[3], paddingRight: tokens.space[3], paddingBottom: tokens.space[3], paddingLeft: tokens.space[3] }}>
              <Skeleton width={40} height={40} radius="pill" />
              <Column style={{ flex: 1, gap: 6 }}>
                <Skeleton width="55%" height={13} />
                <Skeleton width="75%" height={11} />
              </Column>
            </Row>
          ))}
        </Column>
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
        <Column style={{ gap: tokens.space[1] }}>
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
        </Column>
      )}
    </Card>
  );
};

export default FriendsListCard;
