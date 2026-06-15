"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, MapPin, Star, Utensils, X, ChevronRight } from "lucide-react";

import { CATEGORY_ICON } from "../ui-constants";
import { PRICE_ICONS } from "../data";
import type { Spot } from "../types";
import { H3, BodySm, IconButton } from "@/components/ui";
import { tokens } from "@/styles/tokens";

interface DetailOverlayProps {
  spot: Spot;
  onClose: () => void;
}

export default function DetailOverlay({ spot, onClose }: DetailOverlayProps) {
  return (
    <>
      {/* Island Popup - Bottom Right, parallel with sidebar */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 380,
          zIndex: tokens.z.overlay,
          width: 400,
          borderRadius: tokens.radius.xl,
          overflow: "hidden",
          backgroundColor: tokens.color.surface,
          boxShadow: tokens.shadow.lg,
          border: `1px solid ${tokens.color.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: tokens.space[5],
            padding: tokens.space[5],
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: tokens.radius.lg,
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
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <H3
                  style={{
                    fontSize: 20,
                    fontWeight: tokens.type.weight.bold,
                    color: tokens.color.text,
                    lineHeight: 1.2,
                  }}
                >
                  {spot.name}
                </H3>
                <BodySm
                  tone="muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[1],
                    marginTop: 4,
                  }}
                >
                  {CATEGORY_ICON[spot.category] ?? <Utensils size={14} />}{" "}
                  {spot.category} · {PRICE_ICONS[spot.priceLevel]}
                </BodySm>
              </div>
              <IconButton
                icon={<X size={18} />}
                aria-label="Close details"
                variant="ghost"
                onClick={onClose}
                style={{
                  borderRadius: tokens.radius.pill,
                  backgroundColor: tokens.color.surfaceMuted,
                  color: tokens.color.textMuted,
                  flexShrink: 0,
                }}
              />
            </div>
            <BodySm
              tone="muted"
              className="line-clamp-2"
              style={{
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              {spot.description}
            </BodySm>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space[4],
                marginTop: 12,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  fontSize: 14,
                  fontWeight: tokens.type.weight.bold,
                  color: tokens.color.warning,
                }}
              >
                <Star size={14} fill="currentColor" /> {spot.rating}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  fontSize: 14,
                  color: tokens.color.textMuted,
                }}
              >
                <MapPin size={14} /> {spot.distance}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                  fontSize: 14,
                  color: spot.isOpen ? tokens.color.success : tokens.color.danger,
                }}
              >
                <Clock size={14} />{" "}
                {spot.isOpen ? `Open · closes ${spot.closesAt}` : "Closed now"}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: tokens.space[2],
            paddingLeft: tokens.space[4],
            paddingRight: tokens.space[4],
            paddingBottom: tokens.space[4],
          }}
        >
          <div
            style={{
              display: "flex",
              gap: tokens.space[2],
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {spot.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  fontWeight: tokens.type.weight.semibold,
                  padding: "4px 8px",
                  borderRadius: tokens.radius.pill,
                  backgroundColor: spot.accent + "15",
                  color: spot.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <motion.a
            href="/ai-planner"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[1],
              padding: "8px 16px",
              borderRadius: tokens.radius.md,
              fontSize: 13,
              fontWeight: tokens.type.weight.bold,
              color: tokens.color.textInverse,
              background: `linear-gradient(135deg, ${spot.accent}, ${spot.accent}cc)`,
              boxShadow: `0 4px 12px ${spot.accent}40`,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            Plan Visit <ChevronRight size={14} />
          </motion.a>
        </div>
      </motion.div>
    </>
  );
}
