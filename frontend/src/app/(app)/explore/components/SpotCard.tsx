"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Utensils } from "lucide-react";

import { PRICE_ICONS } from "../data";
import type { Spot } from "../types";
import { CATEGORY_ICON } from "../ui-constants";
import { BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface SpotCardProps {
  spot: Spot;
  selected: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function SpotCard({
  spot,
  selected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: SpotCardProps) {
  return (
    <motion.button
      id={`spot-card-${spot.id}`}
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        gap: tokens.space[3],
        padding: "10px",
        borderRadius: tokens.radius.lg,
        cursor: "pointer",
        transition: "all 0.22s ease",
        border: selected
          ? `1.5px solid ${spot.accent}5a`
          : `1.5px solid ${tokens.color.border}`,
        background: selected
          ? `linear-gradient(145deg, ${spot.accent}1f 0%, ${tokens.color.surface} 100%)`
          : `linear-gradient(145deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceMuted} 100%)`,
        boxShadow: selected
          ? `0 14px 24px ${spot.accent}29`
          : tokens.shadow.md,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: tokens.radius.md,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Image
          src={spot.img}
          alt={spot.name}
          fill
          unoptimized
          sizes="84px"
          className="object-cover"
        />
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            height: 28,
            background:
              "linear-gradient(180deg, rgba(16,10,7,0) 0%, rgba(16,10,7,0.52) 100%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            borderRadius: tokens.radius.pill,
            padding: "2px 7px",
            fontSize: "0.65rem",
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.textInverse,
            backgroundColor: "rgba(20,16,13,0.56)",
            backdropFilter: "blur(5px)",
          }}
        >
          {spot.emoji}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: tokens.space[2],
          }}
        >
          <BodySm
            style={{
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.text,
              lineHeight: 1.25,
            }}
          >
            {spot.name}
          </BodySm>
          <span
            style={{
              fontSize: "10px",
              fontWeight: tokens.type.weight.bold,
              whiteSpace: "nowrap",
              padding: "4px 8px",
              borderRadius: tokens.radius.pill,
              color: spot.isOpen ? tokens.color.success : tokens.color.danger,
              backgroundColor: spot.isOpen
                ? "rgba(46, 204, 113, 0.12)"
                : "rgba(230, 57, 70, 0.12)",
              border: `1px solid ${
                spot.isOpen ? "rgba(46, 204, 113, 0.24)" : "rgba(230, 57, 70, 0.24)"
              }`,
            }}
          >
            {spot.isOpen ? `Until ${spot.closesAt}` : "Closed"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[2],
            marginTop: 4,
          }}
        >
          <span style={{ color: spot.accent, display: "inline-flex" }}>
            {CATEGORY_ICON[spot.category] ?? <Utensils size={12} />}
          </span>
          <BodySm
            tone="muted"
            style={{
              fontSize: 12,
              fontWeight: tokens.type.weight.semibold,
            }}
          >
            {spot.category}
          </BodySm>
          <span style={{ color: tokens.color.border }}>·</span>
          <BodySm
            tone="muted"
            style={{
              fontSize: 12,
              fontWeight: tokens.type.weight.semibold,
            }}
          >
            {PRICE_ICONS[spot.priceLevel]}
          </BodySm>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space[3],
            marginTop: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[1],
              fontSize: 12,
              color: tokens.color.warning,
              fontWeight: tokens.type.weight.bold,
            }}
          >
            <Star size={11} fill="currentColor" /> {spot.rating}
            <span
              style={{
                color: tokens.color.textSubtle,
                fontWeight: tokens.type.weight.medium,
              }}
            >
              ({spot.reviewCount})
            </span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[1],
              fontSize: 12,
              color: tokens.color.textMuted,
              fontWeight: tokens.type.weight.semibold,
            }}
          >
            <MapPin size={11} /> {spot.distance}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: tokens.space[2],
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          {spot.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "10px",
                fontWeight: tokens.type.weight.semibold,
                padding: "2px 8px",
                borderRadius: tokens.radius.pill,
                backgroundColor: `${spot.accent}1a`,
                color: spot.accent,
                border: `1px solid ${spot.accent}33`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
