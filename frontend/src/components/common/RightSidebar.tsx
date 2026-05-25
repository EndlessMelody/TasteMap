import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
} from "@/components/OnceUI";
import {
  Users,
  TrendingUp,
  Flame,
  MapPin,
  Utensils,
  ChevronRight,
  Sparkles,
  Star,
  Heart,
  Zap,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useUserVector } from "@/context/UserVectorContext";
import { useAuth } from "@/hooks/useAuth";
import { useFoodies } from "@/hooks/useFoodies";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

/* ─── Types ─── */
interface TrendingSpot {
  id: number;
  name: string;
  city: string;
  rating: number;
  trend: string;
  image_url?: string;
}

/* ─── Mock Fallbacks ─── */
const MOCK_AVATARS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
];

/* ─── Component ─── */

interface RightSidebarProps {
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isExpanded,
  onExpandChange,
}) => {
  const { radarData, isPulsing } = useUserVector();
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFoodies();
  const router = useRouter();
  
  const [trendingSpots, setTrendingSpots] = useState<TrendingSpot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [hoveredFriend, setHoveredFriend] = useState<number | null>(null);

  // Fetch Trending Spots
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data: any = await apiGet("/api/v1/locations/?min_rating=4.0&limit=3");
        if (data?.items) {
          setTrendingSpots(data.items.map((spot: any) => ({
            id: spot.id,
            name: spot.name,
            city: spot.city || "Sài Gòn",
            rating: spot.rating || 4.5,
            trend: `+${Math.floor(Math.random() * 15) + 5}%`, // Fun trend mock
            image_url: spot.image_url
          })));
        }
      } catch (err) {
        console.error("Failed to fetch trending spots", err);
      } finally {
        setSpotsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const topTrait = useMemo(() => {
    if (!radarData?.length) return null;
    return [...radarData].sort(
      (a, b) => b.A / b.fullMark - a.A / a.fullMark,
    )[0];
  }, [radarData]);

  // Use real friends if available, fallback to mock if none returned
  const displayFriends = useMemo(() => {
    if (friends && friends.length > 0) return friends;
    return [
      { id: 1, name: "Minh Anh", avatar: MOCK_AVATARS[0], status: "Exploring cafes ☕", isOnline: true },
      { id: 2, name: "Hà Linh", avatar: MOCK_AVATARS[1], status: "At Bánh Mì Huỳnh Hoa 🥖", isOnline: true },
      { id: 3, name: "Đức Trọng", avatar: MOCK_AVATARS[2], status: "Looking for phở 🍜", isOnline: true },
    ].slice(0, isExpanded ? 6 : 4);
  }, [friends, isExpanded]);

  return (
    <Column
      onMouseEnter={() => onExpandChange(true)}
      onMouseLeave={() => onExpandChange(false)}
      fillHeight
      className="no-scrollbar"
      style={{
        width: isExpanded ? "320px" : "80px",
        minWidth: isExpanded ? "320px" : "80px",
        flexShrink: 0,
        overflowX: "hidden",
        overflowY: "auto",
        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        backgroundColor: "#FFF4EE",
        padding: isExpanded ? "20px 16px" : "20px 8px",
        gap: "20px",
      }}
    >
      {/* ════════════════════════════════════════════
          Section 1: Taste Radar (Mini)
          ════════════════════════════════════════════ */}
      <Column style={{ gap: 10, width: "100%" }}>
        <Row
          style={{
            alignItems: "center",
            justifyContent: isExpanded ? "space-between" : "center",
            minHeight: 28,
          }}
        >
          {isExpanded ? (
            <Row style={{ alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: isPulsing ? "#34C759" : "#ff6b35",
                  boxShadow: isPulsing
                    ? "0 0 8px rgba(52,199,89,0.5)"
                    : "none",
                  transition: "all 0.3s",
                }}
              />
              <Text
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Taste Profile
              </Text>
            </Row>
          ) : (
            <Sparkles size={18} color="#ff6b35" />
          )}
        </Row>

        <div
          style={{
            width: "100%",
            height: isExpanded ? 180 : 64,
            transition: "height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            overflow: "hidden",
          }}
        >
          {isExpanded ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart
                data={radarData}
                cx="50%"
                cy="50%"
                outerRadius="72%"
              >
                <PolarGrid
                  stroke="rgba(0,0,0,0.06)"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: "rgba(0,0,0,0.4)",
                  }}
                />
                <Radar
                  dataKey="A"
                  stroke="#ff6b35"
                  fill="rgba(255, 107, 53, 0.15)"
                  strokeWidth={2}
                  dot
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart
                data={radarData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
              >
                <PolarGrid
                  stroke="rgba(0,0,0,0.06)"
                  strokeDasharray="3 3"
                />
                <Radar
                  dataKey="A"
                  stroke="#ff6b35"
                  fill="rgba(255, 107, 53, 0.15)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {isExpanded && topTrait && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              backgroundColor: "rgba(255, 107, 53, 0.06)",
              border: "1px solid rgba(255, 107, 53, 0.12)",
            }}
          >
            <TrendingUp size={14} color="#ff6b35" />
            <Text
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#1C1C1E",
              }}
            >
              Top taste:{" "}
              <span style={{ color: "#ff6b35", fontWeight: 700 }}>
                {topTrait.subject}
              </span>
            </Text>
            <Text
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "rgba(0,0,0,0.3)",
                marginLeft: "auto",
              }}
            >
              {Math.round((topTrait.A / topTrait.fullMark) * 100)}%
            </Text>
          </motion.div>
        )}
      </Column>

      <div
        style={{
          height: 1,
          backgroundColor: "rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      />

      {/* ════════════════════════════════════════════
          Section 2: Foodie Friends
          ════════════════════════════════════════════ */}
      <Column style={{ gap: 10, width: "100%" }}>
        <Row
          style={{
            alignItems: "center",
            justifyContent: isExpanded ? "space-between" : "center",
            minHeight: 28,
          }}
        >
          {isExpanded ? (
            <>
              <Row style={{ alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#34C759",
                    boxShadow: "0 0 6px rgba(52,199,89,0.4)",
                  }}
                />
                <Text
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  Foodie Friends
                </Text>
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 20,
                    backgroundColor: "rgba(52,199,89,0.1)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#16A34A",
                  }}
                >
                  {displayFriends.length}
                </span>
              </Row>
              <button
                onClick={() => router.push("/foodies")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "rgba(0,0,0,0.3)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "4px 6px",
                  borderRadius: 6,
                  transition: "color 0.15s",
                }}
              >
                All
                <ChevronRight size={12} />
              </button>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <Users size={18} color="rgba(0,0,0,0.4)" />
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#34C759",
                  border: "2px solid white",
                }}
              />
            </div>
          )}
        </Row>

        <Column style={{ gap: 2, width: "100%" }}>
          {displayFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => router.push(`/foodies/${friend.id}`)}
              onMouseEnter={() => setHoveredFriend(friend.id)}
              onMouseLeave={() => setHoveredFriend(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isExpanded ? 10 : 0,
                padding: isExpanded ? "8px 10px" : "6px 0",
                borderRadius: 10,
                border: "none",
                backgroundColor:
                  hoveredFriend === friend.id
                    ? "rgba(0,0,0,0.03)"
                    : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                width: "100%",
                justifyContent: isExpanded ? "flex-start" : "center",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  src={friend.avatar}
                  size="s"
                  style={{ display: "block" }}
                />
                {(friend.isOnline || (friend as any).match > 80) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#34C759",
                      border: "2px solid white",
                    }}
                  />
                )}
              </div>

              {isExpanded && (
                <Column
                  style={{
                    gap: 1,
                    flex: 1,
                    overflow: "hidden",
                    alignItems: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#1C1C1E",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {friend.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(0,0,0,0.4)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {(friend as any).match ? `${(friend as any).match}% Match` : friend.status}
                  </Text>
                </Column>
              )}
            </button>
          ))}
        </Column>
      </Column>

      <div
        style={{
          height: 1,
          backgroundColor: "rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      />

      {/* ════════════════════════════════════════════
          Section 3: Trending Spots
          ════════════════════════════════════════════ */}
      <Column style={{ gap: 10, width: "100%" }}>
        <Row
          style={{
            alignItems: "center",
            justifyContent: isExpanded ? "space-between" : "center",
            minHeight: 28,
          }}
        >
          {isExpanded ? (
            <Row style={{ alignItems: "center", gap: 8 }}>
              <Flame size={14} color="#EF4444" />
              <Text
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                Trending Near You
              </Text>
            </Row>
          ) : (
            <Flame size={18} color="#EF4444" />
          )}
        </Row>

        <Column style={{ gap: 6, width: "100%" }}>
          {(isExpanded ? trendingSpots : trendingSpots.slice(0, 1)).map(
            (spot) => (
              <button
                key={spot.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isExpanded ? 10 : 0,
                  padding: isExpanded ? "10px 12px" : "8px 0",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.05)",
                  backgroundColor: "rgba(0,0,0,0.015)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  width: "100%",
                  justifyContent: isExpanded ? "flex-start" : "center",
                }}
              >
                <div
                  style={{
                    width: isExpanded ? 36 : 32,
                    height: isExpanded ? 36 : 32,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,140,90,0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Utensils size={isExpanded ? 16 : 14} color="#ff6b35" />
                </div>

                {isExpanded && (
                  <>
                    <Column
                      style={{
                        gap: 2,
                        flex: 1,
                        overflow: "hidden",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#1C1C1E",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {spot.name}
                      </Text>
                      <Row style={{ alignItems: "center", gap: 6 }}>
                        <Row style={{ alignItems: "center", gap: 3 }}>
                          <MapPin
                            size={10}
                            color="rgba(0,0,0,0.3)"
                          />
                          <Text
                            style={{
                              fontSize: "0.68rem",
                              color: "rgba(0,0,0,0.4)",
                              fontWeight: 500,
                            }}
                          >
                            {spot.city}
                          </Text>
                        </Row>
                        <Row style={{ alignItems: "center", gap: 3 }}>
                          <Star
                            size={10}
                            color="#FBBF24"
                            fill="#FBBF24"
                          />
                          <Text
                            style={{
                              fontSize: "0.68rem",
                              color: "rgba(0,0,0,0.5)",
                              fontWeight: 600,
                            }}
                          >
                            {spot.rating}
                          </Text>
                        </Row>
                      </Row>
                    </Column>

                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        backgroundColor: "rgba(22,163,74,0.08)",
                        border: "1px solid rgba(22,163,74,0.15)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "#16A34A",
                        flexShrink: 0,
                      }}
                    >
                      {spot.trend}
                    </span>
                  </>
                )}
              </button>
            ),
          )}
        </Column>
      </Column>

      <div style={{ flex: 1 }} />

      {/* ════════════════════════════════════════════
          Section 4: Quick Stats Footer
          ════════════════════════════════════════════ */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            gap: 8,
            width: "100%",
            flexShrink: 0,
          }}
        >
          <StatCard
            icon={<Heart size={14} color="#EF4444" />}
            label="Saved"
            value={String(user?.stats?.followers || 24)}
          />
          <StatCard
            icon={<Zap size={14} color="#FBBF24" />}
            label="Reviews"
            value={String(user?.stats?.reviews || 0)}
          />
          <StatCard
            icon={<MapPin size={14} color="#ff6b35" />}
            label="Visited"
            value={String(user?.stats?.visited || 18)}
          />
        </motion.div>
      )}
    </Column>
  );
};

/* ─── Stat Card Sub-component ─── */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 6px",
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {icon}
      <span
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: "#1C1C1E",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          color: "rgba(0,0,0,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
    </div>
  );
}
