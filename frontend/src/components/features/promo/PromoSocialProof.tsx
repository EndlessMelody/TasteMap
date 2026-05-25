"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STATS = [
  { value: "94%",  label: "Taste accuracy",  sub: "AI-matched recommendations" },
  { value: "2.4K", label: "Active foodies",  sub: "Monthly active users" },
  { value: "12+",  label: "Months of taste", sub: "Average profile depth" },
];

type Review = {
  text: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  stars: number;
  verified?: boolean;
};

const REVIEWS: Review[] = [
  {
    text: "I've eaten at 3-star Michelin restaurants on 4 continents. TasteMap is the first app that actually understands why I love what I love. The flavour DNA model is extraordinary.",
    name: "Gordon Ramsay",
    role: "Chef · 7 Michelin Stars",
    initials: "GR",
    color: "#FF5500",
    stars: 5,
    verified: true,
  },
  {
    text: "We use TasteMap at every OpenAI offsite to plan group dinners for 200+ people. The AI matching is genuinely impressive — no complaints from the team.",
    name: "Sam Altman",
    role: "CEO, OpenAI",
    initials: "SA",
    color: "#6366F1",
    stars: 5,
    verified: true,
  },
  {
    text: "This is the Spotify Wrapped moment for food. My TasteMap report showed I'd visited 47 restaurants and my top flavour is 'umami-forward street food'. Accurate.",
    name: "Mark Wiens",
    role: "Food Creator · 11M subscribers",
    initials: "MW",
    color: "#D97706",
    stars: 5,
    verified: true,
  },
  {
    text: "TasteMap's Tour Builder cut our food-tour planning time from 3 hours to 20 minutes. We've embedded it into our editorial workflow at Eater.",
    name: "Amanda Kludt",
    role: "Editor-in-Chief, Eater",
    initials: "AK",
    color: "#DB2777",
    stars: 5,
    verified: true,
  },
  {
    text: "As someone who travels 200 days a year for food content, TasteMap is the only tool I open before landing in a new city. The local match score has never let me down.",
    name: "David Chang",
    role: "Chef & Founder, Momofuku",
    initials: "DC",
    color: "#16A34A",
    stars: 5,
    verified: true,
  },
  {
    text: "Finding people with my exact palate — spicy, fermented, obscure — in a new city is a superpower. No other food app has cracked the social layer like this.",
    name: "Padma Lakshmi",
    role: "Host, Top Chef",
    initials: "PL",
    color: "#7C3AED",
    stars: 5,
    verified: true,
  },
  {
    text: "I recommended TasteMap to our whole team at Stripe. We built a 12-stop food tour for our SF summit. Zero arguments. That alone is worth 5 stars.",
    name: "Patrick Collison",
    role: "CEO, Stripe",
    initials: "PC",
    color: "#2563EB",
    stars: 5,
    verified: true,
  },
  {
    text: "The taste match algorithm is better than any concierge I've hired. It recommended a 12-seat omakase in Tokyo I never would have found. Perfect meal.",
    name: "Ina Garten",
    role: "Cookbook Author & TV Host",
    initials: "IG",
    color: "#EA580C",
    stars: 5,
    verified: true,
  },
];

const ROW_1 = REVIEWS.slice(0, 5);
const ROW_2 = REVIEWS.slice(3);

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 300,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: "20px 22px",
        border: "1px solid rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} size={11} fill="#FFB347" color="#FFB347" />
        ))}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "rgba(24,22,15,0.6)",
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        &ldquo;{review.text}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: review.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 800,
            fontSize: 12,
            color: "white",
            letterSpacing: "-0.4px",
          }}
        >
          {review.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#18160F",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {review.name}
            </p>
            {review.verified && (
              <BadgeCheck size={13} color="#FF5500" style={{ flexShrink: 0 }} />
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "rgba(24,22,15,0.38)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {review.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  reviews,
  direction,
}: {
  reviews: Review[];
  direction: "left" | "right";
}) {
  const doubled = [...reviews, ...reviews, ...reviews];
  const animKey = direction === "left" ? "sp-marquee-left" : "sp-marquee-right";

  return (
    <div
      className={`sp-row-${direction}`}
      style={{ overflow: "hidden", width: "100%", position: "relative" }}
    >
      <div
        className={`sp-track-${direction}`}
        style={{
          display: "flex",
          gap: 14,
          width: "max-content",
          animation: `${animKey} ${reviews.length * 6}s linear infinite`,
        }}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
      </div>
    </div>
  );
}

export function PromoSocialProof() {
  return (
    <section
      style={{
        backgroundColor: "transparent",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes sp-marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes sp-marquee-right {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
        .sp-row-left:hover  .sp-track-left,
        .sp-row-right:hover .sp-track-right {
          animation-play-state: paused;
        }
      `}</style>

      {/* Heading */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#FF5500",
              textTransform: "uppercase",
              letterSpacing: "1.4px",
            }}
          >
            Community
          </p>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 900,
              letterSpacing: "-1.4px",
              color: "#18160F",
            }}
          >
            Foodies love discovering with TasteMap
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "rgba(24,22,15,0.48)",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.65,
            }}
          >
            From solo explorers to group dinner planners — TasteMap powers every
            type of food journey.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.08, ease }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginBottom: 32,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "20px",
                backgroundColor: "#FFFFFF",
                borderRight:
                  i < STATS.length - 1
                    ? "1px solid rgba(0,0,0,0.07)"
                    : "none",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                textAlign: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  color: "#FF5500",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#18160F" }}>
                {s.label}
              </span>
              <span style={{ fontSize: 11, color: "rgba(24,22,15,0.35)" }}>
                {s.sub}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee rows */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}
      >
        {/* Left edge fade */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: "linear-gradient(to right, #FFFCF7, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* Right edge fade */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: "linear-gradient(to left, #FFFCF7, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <MarqueeRow reviews={ROW_1} direction="left" />
        <MarqueeRow reviews={ROW_2} direction="right" />
      </motion.div>
    </section>
  );
}
