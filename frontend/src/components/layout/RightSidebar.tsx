import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  Avatar,
} from "@once-ui-system/core";
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
import { useAuth } from "@/context/AuthContext";
import { useFoodies } from "@/hooks/useFoodies";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { tokens } from "@/styles/tokens";

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
  const { t } = useLanguage();
  
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
        borderLeft: `1px solid ${tokens.color.border}`,
        backgroundColor: tokens.color.surfaceWarm,
        paddingTop: "20px",
        paddingBottom: "20px",
        paddingLeft: isExpanded ? "16px" : "8px",
        paddingRight: isExpanded ? "16px" : "8px",
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
              <Column
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: isPulsing ? tokens.color.success : tokens.color.warm,
                  boxShadow: isPulsing
                    ? `0 0 8px ${tokens.color.success}80`
                    : "none",
                  transition: "all 0.3s",
                }}
              />
              <Text
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: tokens.color.textSubtle,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                {t("rightbar.tasteProfile")}
              </Text>
            </Row>
          ) : (
            <Sparkles size={18} color={tokens.color.warm} />
          )}
        </Row>

        <Column
          style={{
            width: "100%",
            height: isExpanded ? 180 : 64,
            minWidth: 0,
            transition: "height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            overflow: "hidden",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={isExpanded ? 180 : 64}
            debounce={50}
          >
            <RadarChart
              data={radarData}
              cx="50%"
              cy="50%"
              outerRadius={isExpanded ? "72%" : "80%"}
            >
              <PolarGrid
                stroke={tokens.color.border}
                strokeDasharray="3 3"
              />
              {isExpanded && (
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: tokens.color.textMuted,
                  }}
                />
              )}
              <Radar
                dataKey="A"
                stroke={tokens.color.warm}
                fill={`${tokens.color.warm}26`}
                strokeWidth={2}
                dot={isExpanded}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Column>

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
              backgroundColor: `${tokens.color.warm}0F`,
              border: `1px solid ${tokens.color.warm}1F`,
            }}
          >
            <TrendingUp size={14} color={tokens.color.warm} />
            <Text
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: tokens.color.text,
              }}
            >
              {t("rightbar.topTaste")}{" "}
              <span style={{ color: tokens.color.warm, fontWeight: 700 }}>
                {topTrait.subject}
              </span>
            </Text>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: tokens.color.textSubtle,
                marginLeft: "auto",
              }}
            >
              {Math.round((topTrait.A / topTrait.fullMark) * 100)}%
            </span>
          </motion.div>
        )}
      </Column>

      <Column
        style={{
          height: 1,
          backgroundColor: tokens.color.border,
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
                <Column
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: tokens.color.success,
                    boxShadow: `0 0 6px ${tokens.color.success}66`,
                  }}
                />
                <Text
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: tokens.color.textSubtle,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  {t("rightbar.foodieFriends")}
                </Text>
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 20,
                    backgroundColor: `${tokens.color.success}1A`,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: tokens.color.success,
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
                  color: tokens.color.textSubtle,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "4px 6px",
                  borderRadius: 6,
                  transition: "color 0.15s",
                }}
              >
                {t("rightbar.all")}
                <ChevronRight size={12} />
              </button>
            </>
          ) : (
            <Column style={{ position: "relative" }}>
              <Users size={18} color={tokens.color.textSubtle} />
              <Column
                style={{
                  position: "absolute",
                  top: -2,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: tokens.color.success,
                  border: `2px solid ${tokens.color.surface}`,
                }}
              />
            </Column>
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
                    ? tokens.color.border
                    : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                width: "100%",
                justifyContent: isExpanded ? "flex-start" : "center",
              }}
            >
              <Column style={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  src={friend.avatar}
                  size="s"
                  style={{ display: "block" }}
                />
                {(friend.isOnline || (friend as any).match > 80) && (
                  <Column
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: tokens.color.success,
                      border: `2px solid ${tokens.color.surface}`,
                    }}
                  />
                )}
              </Column>

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
                      color: tokens.color.text,
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
                      color: tokens.color.textMuted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {(friend as any).match ? t("rightbar.match", { n: (friend as any).match }) : friend.status}
                  </Text>
                </Column>
              )}
            </button>
          ))}
        </Column>
      </Column>

      <Column
        style={{
          height: 1,
          backgroundColor: tokens.color.border,
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
              <Flame size={14} color={tokens.color.danger} />
              <Text
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: tokens.color.textSubtle,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                {t("rightbar.trendingNearYou")}
              </Text>
            </Row>
          ) : (
            <Flame size={18} color={tokens.color.danger} />
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
                  border: `1px solid ${tokens.color.border}`,
                  backgroundColor: tokens.color.surfaceMuted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  width: "100%",
                  justifyContent: isExpanded ? "flex-start" : "center",
                }}
              >
                <Row
                  horizontal="center"
                  vertical="center"
                  style={{
                    width: isExpanded ? 36 : 32,
                    height: isExpanded ? 36 : 32,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${tokens.color.warm}1A, ${tokens.color.warmBright}14)`,
                    flexShrink: 0,
                  }}
                >
                  <Utensils size={isExpanded ? 16 : 14} color={tokens.color.warm} />
                </Row>

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
                          color: tokens.color.text,
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
                            color={tokens.color.textSubtle}
                          />
                          <Text
                            style={{
                              fontSize: "0.68rem",
                              color: tokens.color.textMuted,
                              fontWeight: 500,
                            }}
                          >
                            {spot.city}
                          </Text>
                        </Row>
                        <Row style={{ alignItems: "center", gap: 3 }}>
                          <Star
                            size={10}
                            color={tokens.color.warning}
                            fill={tokens.color.warning}
                          />
                          <Text
                            style={{
                              fontSize: "0.68rem",
                              color: tokens.color.textMuted,
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
                        backgroundColor: `${tokens.color.success}14`,
                        border: `1px solid ${tokens.color.success}26`,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: tokens.color.success,
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

      <Column style={{ flex: 1 }} />

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
            icon={<Heart size={14} color={tokens.color.danger} />}
            label={t("rightbar.saved")}
            value={String(user?.stats?.followers || 24)}
          />
          <StatCard
            icon={<Zap size={14} color={tokens.color.warning} />}
            label={t("rightbar.reviews")}
            value={String(user?.stats?.reviews || 0)}
          />
          <StatCard
            icon={<MapPin size={14} color={tokens.color.warm} />}
            label={t("rightbar.visited")}
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
    <Column
      horizontal="center"
      style={{
        flex: 1,
        gap: 4,
        padding: "10px 6px",
        borderRadius: 12,
        backgroundColor: tokens.color.surfaceMuted,
        border: `1px solid ${tokens.color.border}`,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: tokens.color.text,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          color: tokens.color.textSubtle,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
    </Column>
  );
}
