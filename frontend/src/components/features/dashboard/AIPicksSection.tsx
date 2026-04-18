import React from "react";
import { motion } from "framer-motion";
import { Row, Column, Heading, Text } from "@/components/OnceUI";
import { Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecommendations } from "@/hooks/useRecommendations";

const CARD_COLORS = ["#E63946", "#2A9D8F", "#FF6B35", "#7B2FF7", "#ff4757"];
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop";

const matchColor = (match: number) =>
  match >= 90 ? "#34C759" : match >= 75 ? "#FBBF24" : "#FF6B6B";

const cardVariants = {
  rest: { y: 0, scale: 1, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  hover: { y: -10, scale: 1.02, boxShadow: "0 20px 48px rgba(0,0,0,0.10)" },
};

const imgVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08 },
};

interface AIPicksSectionProps {
  isLoading?: boolean;
}

export const AIPicksSection: React.FC<AIPicksSectionProps> = ({
  isLoading = false,
}) => {
  const router = useRouter();
  const { picks, loading, error, refetch } = useRecommendations(4);
  const [rotation, setRotation] = React.useState(0);

  const handleRefresh = () => {
    setRotation((prev) => prev + 360);
    refetch();
  };

  const renderCards = () => {
    if (loading) {
      return [1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            minWidth: "260px",
            height: "220px",
            borderRadius: "20px",
            flexShrink: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      ));
    }

    if (error || picks.length === 0) {
      return (
        <Text
          style={{ color: "#8E8E93", fontSize: "0.85rem", padding: "16px 0" }}
        >
          {error
            ? `Lỗi: ${error}`
            : "Chưa có gợi ý nào. Hãy thêm địa điểm vào hệ thống!"}
        </Text>
      );
    }

    return picks.map((pick, idx) => {
      const color = CARD_COLORS[idx % CARD_COLORS.length];
      const matchPct =
        pick.match_score > 1
          ? Math.round(pick.match_score)
          : Math.round(pick.match_score * 100);
      const imgSrc =
        pick.image_url && pick.image_url.trim() !== ""
          ? pick.image_url
          : FALLBACK_IMG;

      return (
        <motion.div
          key={pick.place_id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
          whileHover={{
            y: -10,
            scale: 1.02,
            boxShadow: "0 20px 48px rgba(0,0,0,0.1)",
          }}
          onClick={() => router.push("/tour-builder")}
          style={{
            minWidth: "260px",
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.05)",
            cursor: "pointer",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Card Image */}
          <div
            style={{
              height: "140px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={imgSrc}
              alt={pick.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to bottom, transparent 40%, ${color}20 100%)`,
              }}
            />
            {/* Match badge */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                padding: "6px 12px",
                borderRadius: "10px",
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              <Text
                style={{
                  color: "#1C1C1E",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                }}
              >
                {matchPct}% Match
              </Text>
            </div>
          </div>

          {/* Card Content */}
          <Column style={{ padding: "16px", gap: "8px" }}>
            <Text
              style={{
                color: "#1C1C1E",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
              }}
            >
              {pick.name}
            </Text>
            <Row style={{ gap: "6px", alignItems: "center" }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
              />
              <Text style={{ color, fontSize: "0.75rem", fontWeight: 600 }}>
                AI Recommendation
              </Text>
            </Row>
            {pick.price_range && (
              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                  }}
                >
                  {pick.price_range}
                </Text>
                <div
                  style={{
                    padding: "4px",
                    borderRadius: "8px",
                    backgroundColor: "#F2F2F7",
                  }}
                >
                  <Sparkles size={12} color="#A855F7" />
                </div>
              </Row>
            )}
          </Column>
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
    >
      <Column fillWidth style={{ gap: "16px" }}>
        {/* Section Header */}
        <Row
          fillWidth
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <Row style={{ alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="#A855F7" />
            <Heading
              variant="heading-strong-l"
              weight="strong"
              style={{ color: "#1C1C1E" }}
            >
              AI Picks For You
            </Heading>
          </Row>
          <Text
            onClick={handleRefresh}
            style={{
              color: "#A855F7",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <motion.span
              animate={{ rotate: rotation }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ display: "inline-flex" }}
            >
              <RefreshCw size={13} color="#A855F7" />
            </motion.span>
            <span
              style={{ color: "#A855F7", fontSize: "0.82rem", fontWeight: 600 }}
            >
              Refresh
            </span>
          </Text>
        </Row>

        {/* Cards */}
        <Row
          className="no-scrollbar"
          fillWidth
          style={{ gap: "16px", overflowX: "auto", paddingBottom: "4px" }}
        >
          {renderCards()}
        </Row>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </Column>
    </motion.div>
  );
};
