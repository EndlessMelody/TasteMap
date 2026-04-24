"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  Utensils, 
  Award, 
  Heart, 
  TrendingUp, 
  Flame, 
  Cake, 
  Gem, 
  Feather, 
  PartyPopper, 
  Users, 
  Handshake, 
  Shield, 
  Medal, 
  Trophy 
} from "lucide-react";
import { Text } from "@/components/OnceUI";
import { BadgeSummary } from "@/types/gamification";

interface BadgeCardProps {
  badge: BadgeSummary;
  delay?: number;
  isOwner?: boolean;
  isPrimary?: boolean;
  onEquip?: (badgeId: number | null) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  delay = 0, 
  isOwner = false, 
  isPrimary = false, 
  onEquip 
}) => {
  const IconMap: Record<string, any> = {
    Star,
    Utensils,
    Award,
    Heart,
    TrendingUp,
    Flame,
    Cake,
    Gem,
    Feather,
    PartyPopper,
    Users,
    Handshake,
    Shield,
    Medal,
    Trophy,
  };

  const IconComponent = IconMap[badge.icon_name] || Award;

  const rarityStyles: Record<string, any> = {
    Common: {
      border: "rgba(0,0,0,0.05)",
      glow: "transparent",
      text: "neutral-strong",
      bg: "rgba(0,0,0,0.02)",
    },
    Rare: {
      border: "rgba(0,122,255,0.2)",
      glow: "rgba(0,122,255,0.1)",
      text: "info-strong",
      bg: "rgba(0,122,255,0.03)",
    },
    Epic: {
      border: "rgba(175,82,222,0.3)",
      glow: "rgba(175,82,222,0.15)",
      text: "brand-strong",
      bg: "rgba(175,82,222,0.05)",
    },
    Legendary: {
      border: "rgba(251,191,36,0.5)",
      glow: "rgba(251,191,36,0.25)",
      text: "warning-strong",
      bg: "rgba(251,191,36,0.08)",
      animate: true,
    },
  };

  const style = rarityStyles[badge.rarity] || rarityStyles.Common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 1,
      }}
    >
      {/* Glow Aura for Epic and Legendary */}
      {(badge.rarity === "Epic" || badge.rarity === "Legendary") && (
        <div
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            background: style.glow,
            filter: "blur(20px)",
            borderRadius: "24px",
            zIndex: -1,
          }}
        />
      )}

      {/* Main card body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          minWidth: 0,
          padding: "20px",
          gap: "12px",
          borderRadius: "24px",
          background: style.bg,
          border: `1px solid ${style.border}`,
          backdropFilter: "blur(10px)",
          textAlign: "center",
          boxShadow:
            badge.rarity === "Legendary"
              ? "0 10px 30px rgba(251,191,36,0.15)"
              : "none",
          boxSizing: "border-box",
        }}
      >
        {/* Icon container */}
        <div
          style={{
            width: "60px",
            height: "60px",
            minWidth: "60px",
            minHeight: "60px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            color: badge.accent_color || "#007AFF",
            position: "relative",
          }}
        >
          {badge.rarity === "Legendary" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: "50%",
                border: "2px dashed #FBBF24",
                opacity: 0.8,
                boxSizing: "border-box",
              }}
            />
          )}
          <IconComponent size={28} />
        </div>

        {/* Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            width: "100%",
          }}
        >
          <Text
            variant="body-strong-s"
            style={{
              color: "#1C1C1E",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {badge.name}
          </Text>
          {badge.description && (
            <Text
              variant="body-default-xs"
              onBackground="neutral-weak"
              style={{
                fontSize: "11px",
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {badge.description}
            </Text>
          )}
        </div>

        {/* Rarity Tag */}
        <div
          style={{
            marginTop: "auto",
            padding: "2px 8px",
            borderRadius: "100px",
            background: style.border,
          }}
        >
          <Text
            variant="body-default-xs"
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              fontWeight: 800,
              letterSpacing: "0.5px",
              color: badge.accent_color || "#007AFF",
            }}
          >
            {badge.rarity}
          </Text>
        </div>

        {badge.earned_at && (
          <Text
            variant="body-default-xs"
            style={{ color: "rgba(0,0,0,0.3)", marginTop: "8px" }}
          >
            {new Date(badge.earned_at).toLocaleDateString("vi-VN")}
          </Text>
        )}

        {isOwner && (
          <button
            onClick={() => onEquip?.(isPrimary ? null : badge.id)}
            style={{
              marginTop: "12px",
              padding: "6px 16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: isPrimary ? "rgba(0,0,0,0.05)" : "#ff6b35",
              color: isPrimary ? "#8E8E93" : "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
            }}
          >
            {isPrimary ? "Unequip Badge" : "Set as Primary"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BadgeCard;
