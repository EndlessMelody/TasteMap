"use client";

import React from "react";
import { motion } from "framer-motion";
import { Row, Text } from "@/components/OnceUI";
import { Users, UserPlus } from "lucide-react";

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

export const FriendsListCard: React.FC<FriendsListCardProps> = ({
  friendsList,
  friendsLoading,
  onSeeAll,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        padding: "24px",
        border: "1px solid #F2F2F7",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row
        style={{
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
          justifyContent: "space-between",
        }}
      >
        <Row style={{ gap: "8px", alignItems: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
              padding: "6px",
              borderRadius: "8px",
            }}
          >
            <Users size={16} color="white" />
          </div>
          <Text
            style={{
              color: "#1C1C1E",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            Friends
          </Text>
          <div
            style={{
              backgroundColor: "#F2F2F7",
              padding: "2px 8px",
              borderRadius: "10px",
            }}
          >
            <Text
              style={{
                color: "#8E8E93",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {friendsList.length}
            </Text>
          </div>
        </Row>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSeeAll}
          style={{
            background: "none",
            border: "none",
            color: "#ff6b35",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          See All
        </motion.button>
      </Row>

      {friendsLoading ? (
        // ── Skeleton loading ──
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    height: "13px",
                    borderRadius: "6px",
                    background:
                      "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    width: "55%",
                  }}
                />
                <div
                  style={{
                    height: "11px",
                    borderRadius: "5px",
                    background:
                      "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    width: "75%",
                  }}
                />
              </div>
            </div>
          ))}
          <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        </div>
      ) : friendsList.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "24px 0",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #FFF0E6, #FFE8D6)",
              padding: "16px",
              borderRadius: "50%",
            }}
          >
            <UserPlus size={24} color="#ff6b35" />
          </div>
          <Text
            style={{
              color: "#8E8E93",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Chưa có bạn bè. Bắt đầu khám phá!
          </Text>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSeeAll}
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Discover Foodies
          </motion.button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
          }}
        >
          {friendsList.slice(0, 5).map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.08 * i }}
              whileHover={{ backgroundColor: "#F9F9FB" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={onSeeAll}
            >
              {/* Avatar with match-score ring */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={
                    friend.avatar_url ||
                    `https://i.pravatar.cc/150?u=${friend.id}`
                  }
                  alt={friend.display_name || friend.username}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border:
                      friend.match_score >= 80
                        ? "2px solid #ff6b35"
                        : "2px solid #F2F2F7",
                    display: "block",
                  }}
                />
              </div>

              {/* Name + subtitle */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    color: "#1C1C1E",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {friend.display_name || friend.username}
                </span>
                <span
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.72rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {friend.title
                    ? `${friend.title}`
                    : friend.location
                      ? `📍 ${friend.location}`
                      : `@${friend.username}`}
                </span>
              </div>

              {/* Match score badge */}
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background:
                    friend.match_score >= 80
                      ? "linear-gradient(135deg, #FFF0E6, #FFE8D6)"
                      : "#F2F2F7",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: friend.match_score >= 80 ? "#ff6b35" : "#8E8E93",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {friend.match_score}%
                </span>
              </div>
            </motion.div>
          ))}

          {friendsList.length > 5 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSeeAll}
              style={{
                marginTop: "4px",
                background: "#F9F9FB",
                border: "1px solid #F2F2F7",
                padding: "10px",
                borderRadius: "12px",
                color: "#ff6b35",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Xem tất cả {friendsList.length} bạn bè
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};
