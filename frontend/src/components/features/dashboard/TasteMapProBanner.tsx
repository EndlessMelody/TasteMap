"use client";

/**
 * TasteMapProBanner — Discover v6
 * ─────────────────────────────────────────────────────────────────
 * ShopeeFood exclusive deal banner · Marketing-oriented
 * Focus: "Busy to travel? Let ShopeeFood deliver your cravings"
 *
 * Uses react-icons exclusively — NO emoji icons.
 */
import React from "react";
import { motion } from "framer-motion";
import { tokens } from "@/styles/tokens";

// ─── React Icons (react-icons library) ──────────────────────────
import {
  RiMotorbikeFill,
  RiShieldCheckFill,
  RiTimerFlashFill,
  RiCoupon3Fill,
  RiPercentFill,
  RiMapPin2Fill,
  RiStarFill,
  RiArrowRightLine,
  RiFireFill,
  RiFlashlightFill,
  RiCheckboxCircleFill,
  RiVipCrown2Fill,
} from "react-icons/ri";
import {
  SiShopee,
} from "react-icons/si";
import {
  IoFastFoodSharp,
  IoRestaurant,
} from "react-icons/io5";
import {
  TbTruckDelivery,
} from "react-icons/tb";
import {
  BiSolidOffer,
} from "react-icons/bi";

// ─── Partner branding (ShopeeFood) ──────────────────────────────
const PARTNER = {
  accentColor: "#EE4D2D", // Shopee brand orange
  accentDark: "#D94420",
  accentLight: "#FF6D4A",
  accentGlow: "#FF8C6B",
};

// ─── Floating food icons (decorative) ───────────────────────────
const FLOATING_ICONS = [
  { Icon: IoFastFoodSharp, top: "12%", left: "65%", size: 22, delay: 0, opacity: 0.12 },
  { Icon: IoRestaurant, top: "78%", left: "72%", size: 18, delay: 0.4, opacity: 0.08 },
  { Icon: RiMotorbikeFill, top: "20%", left: "85%", size: 24, delay: 0.8, opacity: 0.10 },
  { Icon: TbTruckDelivery, top: "65%", left: "88%", size: 20, delay: 1.2, opacity: 0.07 },
];

// ─── Stats cards ────────────────────────────────────────────────
const DEAL_STATS = [
  {
    Icon: RiTimerFlashFill,
    label: "25-min delivery",
    accent: "#00D4AA",
  },
  {
    Icon: RiShieldCheckFill,
    label: "Quality guaranteed",
    accent: "#7B8CFF",
  },
  {
    Icon: RiStarFill,
    label: "4.9 · 120K reviews",
    accent: "#FFB547",
  },
];

export const TasteMapProBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%" }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: tokens.radius.xl,
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, #EE4D2D 0%, #B22D14 30%, #120502 80%)`,
          boxShadow: `0 8px 60px ${PARTNER.accentColor}25, ${tokens.shadow.lg}, 0 1px 0 rgba(255,255,255,0.08) inset`,
          cursor: "pointer",
        }}
        onClick={() => window.open("https://shopeefood.vn", "_blank")}
      >
        {/* ── Decorative Gradient Orbs ── */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-60px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, #FF6D4A 25%, #EE4D2D 10%, transparent 70%)`,
            filter: "blur(60px)",
            pointerEvents: "none",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "20%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${PARTNER.accentColor}10 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, #7B2FF712 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Grid Lines Texture ── */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.03,
            pointerEvents: "none",
          }}
        >
          <defs>
            <pattern
              id="promo-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#promo-grid)" />
        </svg>

        {/* ── Diagonal Accent Line ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "38%",
            width: "1px",
            height: "100%",
            background: `linear-gradient(to bottom, transparent, ${PARTNER.accentColor}18, transparent)`,
            transform: "rotate(15deg)",
            transformOrigin: "top center",
            pointerEvents: "none",
          }}
        />

        {/* ── Floating Food Icons (decorative) ── */}
        {FLOATING_ICONS.map(({ Icon, top, left, size, delay, opacity }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + delay, duration: 0.6 }}
            animate={{
              y: [0, -8, 0],
            }}
            style={{
              position: "absolute",
              top,
              left,
              pointerEvents: "none",
              zIndex: 5,
              color: PARTNER.accentGlow,
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {/* ── Main Content Layout ── */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            position: "relative",
            zIndex: 10,
            minHeight: "280px",
          }}
        >
          {/* ═══ LEFT — Text Section ═══ */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "18px",
              padding: "40px 32px 40px 44px",
              minWidth: 0,
            }}
          >
            {/* ── Exclusive Badge ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              {/* Partner Logo Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: `linear-gradient(135deg, ${PARTNER.accentColor}18, ${PARTNER.accentColor}08)`,
                  border: `1px solid ${PARTNER.accentColor}30`,
                  borderRadius: "100px",
                  padding: "5px 14px 5px 8px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${PARTNER.accentColor}, ${PARTNER.accentDark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 2px 8px ${PARTNER.accentColor}50`,
                  }}
                >
                  <SiShopee size={12} color="white" />
                </div>
                <span
                  style={{
                    color: PARTNER.accentLight,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  ShopeeFood
                </span>
              </div>

              {/* Exclusive Tag */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "100px",
                  padding: "5px 12px",
                }}
              >
                <RiVipCrown2Fill size={12} color="#FFB547" />
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  Only on TasteMap
                </span>
              </div>
            </motion.div>

            {/* ── Headline ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: "clamp(1.6rem, 2.4vw, 2.22rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                }}
              >
                Craving found.
                <br />
                ShopeeFood delivered.
                <br />
                <span
                  style={{
                    background: `linear-gradient(90deg, #FFFFFF, #FFD0C6, #FFFFFF)`,
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textTransform: "uppercase",
                    fontSize: "0.82em",
                  }}
                >
                  Gì cũng có!
                </span>
                <br />
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75em", fontWeight: 700 }}>
                  Ship siêu tốc, món siêu hời.
                </span>
              </h2>
            </motion.div>

            {/* ── Deal Highlight ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Discount Chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: `linear-gradient(135deg, ${PARTNER.accentColor}25, ${PARTNER.accentColor}10)`,
                  border: `1px solid ${PARTNER.accentColor}35`,
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <RiPercentFill size={16} color={PARTNER.accentLight} />
                <span
                  style={{
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  30% cashback
                </span>
              </div>

              {/* Free Delivery Chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(0, 212, 170, 0.10)",
                  border: "1px solid rgba(0, 212, 170, 0.25)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <TbTruckDelivery size={16} color="#00D4AA" />
                <span
                  style={{
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  Free delivery
                </span>
              </div>

              {/* Coupon Chip */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(123, 140, 255, 0.10)",
                  border: "1px solid rgba(123, 140, 255, 0.25)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <RiCoupon3Fill size={16} color="#7B8CFF" />
                <span
                  style={{
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  No code needed
                </span>
              </div>
            </motion.div>

            {/* ── Subline ── */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.6)",
                fontSize: tokens.type.size.bodySm,
                lineHeight: 1.6,
                maxWidth: 420,
                fontWeight: 500,
              }}
            >
              From street gems to luxury dining, your AI matches are just a tap away. 
              Get it while it&apos;s hot with ShopeeFood&apos;s 25-min promise.
            </motion.p>

            {/* ── CTA Button ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}
            >
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 12px 32px ${PARTNER.accentColor}50`,
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: `linear-gradient(135deg, ${PARTNER.accentColor} 0%, ${PARTNER.accentDark} 100%)`,
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "13px 30px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 8px 24px ${PARTNER.accentColor}35`,
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <BiSolidOffer size={18} />
                Claim Your Deal
                <RiArrowRightLine size={16} />
              </motion.button>

              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RiCheckboxCircleFill size={12} color="rgba(255,255,255,0.3)" />
                Auto-applied at checkout
              </span>
            </motion.div>
          </div>

          {/* ═══ RIGHT — Visual Section ═══ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: "14px",
              padding: "36px 40px 36px 20px",
              flexShrink: 0,
              minWidth: "260px",
            }}
          >
            {/* ── Partner Logo Card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "24px",
                background: `linear-gradient(145deg, ${PARTNER.accentColor}20, ${PARTNER.accentColor}08)`,
                border: `1px solid ${PARTNER.accentColor}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
                backdropFilter: "blur(16px)",
                boxShadow: `0 8px 32px ${PARTNER.accentColor}15, 0 0 0 1px rgba(255,255,255,0.03) inset`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Inner glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background: `radial-gradient(circle at 30% 30%, ${PARTNER.accentColor}15, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              <SiShopee
                size={38}
                color={PARTNER.accentColor}
                style={{ position: "relative", zIndex: 2 }}
              />
            </motion.div>

            {/* ── Trust/Stats Badges ── */}
            {DEAL_STATS.map(({ Icon, label, accent }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.5 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "9px 16px",
                  backdropFilter: "blur(12px)",
                  whiteSpace: "nowrap",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: `${accent}15`,
                    border: `1px solid ${accent}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={accent} />
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
              </motion.div>
            ))}

            {/* ── Live Badge ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#00D4AA",
                  boxShadow: "0 0 8px #00D4AA80",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                <RiFlashlightFill
                  size={10}
                  color="#FFB547"
                  style={{ marginRight: "4px", verticalAlign: "middle" }}
                />
                2,847 orders today
              </span>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom Disclaimer Bar ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            padding: "10px 44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.18)",
              fontSize: "0.68rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <RiMapPin2Fill size={10} />
            Limited offers · Applies to orders from 50,000 VND · See terms on ShopeeFood
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.18)",
              fontSize: "0.68rem",
            }}
          >
            <RiShieldCheckFill size={10} color="rgba(255,255,255,0.25)" />
            <span>Verified by</span>
            <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
              TasteMap
            </span>
          </span>
        </div>
      </div>

      {/* ── Pulse animation keyframe ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
    </motion.div>
  );
};
