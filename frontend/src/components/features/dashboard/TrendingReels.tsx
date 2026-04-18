import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Column, Heading, Text } from "@/components/OnceUI";
import { Flame } from "lucide-react";
import { ReelCard } from "@/components/cards/ReelCard";
import { StaggerContainer, StaggerItem } from "@/components/StaggerContainer";
import { useReels } from "@/hooks/useReels";
import { ReelData } from "@/types/dashboard";
import { SkeletonReelCard } from "@/components/Skeletons";

interface TrendingReelsProps {
  onReelClick: (reel: ReelData) => void;
  isLoading?: boolean;
}

export const TrendingReels: React.FC<TrendingReelsProps> = ({
  onReelClick,
}) => {
  const { reels, loading, error } = useReels(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <Column fillWidth style={{ gap: "16px" }}>
        <Row
          fillWidth
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Row style={{ alignItems: "center", gap: "10px" }}>
            <Flame size={20} color="#ED1B24" />
            <Heading
              variant="heading-strong-l"
              weight="strong"
              style={{ color: "#1C1C1E" }}
            >
              Trending Reels
            </Heading>
          </Row>
          <Text
            onClick={() => {}}
            style={{
              color: "#ff6b35",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transitionProperty: "opacity",
              transitionDuration: "0.2s",
            }}
          >
            View all
          </Text>
        </Row>
        <Row
          className="no-scrollbar"
          fillWidth
          style={{
            gap: "16px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          <StaggerContainer
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              paddingBottom: "4px",
            }}
          >
            {loading ? (
              <Text style={{ color: "#8E8E93", padding: "20px" }}>
                Loading reels...
              </Text>
            ) : error ? (
              <Text style={{ color: "red", padding: "20px" }}>{error}</Text>
            ) : reels.length > 0 ? (
              reels.map((reel, idx) => (
                <StaggerItem key={idx}>
                  <div
                    onClick={() => onReelClick(reel)}
                    style={{ cursor: "pointer" }}
                  >
                    <ReelCard
                      title={reel.title}
                      user={reel.user}
                      views={reel.views}
                      avatar={reel.userAvatar}
                      img={reel.img}
                      delay={0}
                    />
                  </div>
                </StaggerItem>
              ))
            ) : (
              <Text style={{ color: "#8E8E93", padding: "20px" }}>
                No trending reels found.
              </Text>
            )}
          </StaggerContainer>
        </Row>
      </Column>
    </motion.div>
  );
};
