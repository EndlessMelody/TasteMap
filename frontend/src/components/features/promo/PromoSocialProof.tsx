"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";

const STATS = [
  { value: "94%", label: "Taste accuracy", sub: "AI-matched recommendations" },
  { value: "2.4K", label: "Active foodies", sub: "Monthly active users" },
  { value: "12+", label: "Months of taste", sub: "Average profile depth" },
];

const TRUSTED_BY = [
  "OpenAI",
  "Google",
  "Meta",
  "Microsoft",
  "Stripe",
  "Notion",
  "Figma",
  "Vercel",
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
    color: "hsl(14,70%,62%)",
    stars: 5,
    verified: true,
  },
  {
    text: "We use TasteMap at every OpenAI offsite to plan group dinners for 200+ people. The AI matching is genuinely impressive — no complaints from the team.",
    name: "Sam Altman",
    role: "CEO, OpenAI",
    initials: "SA",
    color: "hsl(220,60%,62%)",
    stars: 5,
    verified: true,
  },
  {
    text: "This is the Spotify Wrapped moment for food. My TasteMap report showed I'd visited 47 restaurants and my top flavour is 'umami-forward street food'. Accurate.",
    name: "Mark Wiens",
    role: "Food Creator · 11M subscribers",
    initials: "MW",
    color: "hsl(40,65%,60%)",
    stars: 5,
    verified: true,
  },
  {
    text: "TasteMap's Tour Builder cut our food-tour planning time from 3 hours to 20 minutes. We've embedded it into our editorial workflow at Eater.",
    name: "Amanda Kludt",
    role: "Editor-in-Chief, Eater",
    initials: "AK",
    color: "hsl(340,60%,65%)",
    stars: 5,
    verified: true,
  },
  {
    text: "As someone who travels 200 days a year for food content, TasteMap is the only tool I open before landing in a new city. The local match score has never let me down.",
    name: "David Chang",
    role: "Chef & Founder, Momofuku",
    initials: "DC",
    color: "hsl(195,55%,58%)",
    stars: 5,
    verified: true,
  },
  {
    text: "Finding people with my exact palate — spicy, fermented, obscure — in a new city is a superpower. No other food app has cracked the social layer like this.",
    name: "Padma Lakshmi",
    role: "Host, Top Chef",
    initials: "PL",
    color: "hsl(270,55%,65%)",
    stars: 5,
    verified: true,
  },
  {
    text: "I recommended TasteMap to our whole team at Stripe. We built a 12-stop food tour for our SF summit. Zero arguments. That alone is worth 5 stars.",
    name: "Patrick Collison",
    role: "CEO, Stripe",
    initials: "PC",
    color: "hsl(160,50%,58%)",
    stars: 5,
    verified: true,
  },
  {
    text: "The taste match algorithm is better than any concierge I've hired. It recommended a 12-seat omakase in Tokyo I never would have found. Perfect meal.",
    name: "Ina Garten",
    role: "Cookbook Author & TV Host",
    initials: "IG",
    color: "hsl(85,50%,58%)",
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
        width: 310,
        backgroundColor: "white",
        borderRadius: 18,
        padding: "22px 24px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} size={12} fill="#FBBF24" color="#FBBF24" />
        ))}
      </div>
      {/* Quote */}
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          color: "rgba(0,0,0,0.68)",
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        &ldquo;{review.text}&rdquo;
      </p>
      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: review.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 800,
            fontSize: 13,
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
          {review.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: "#1C1C1E",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {review.name}
            </p>
            {review.verified && (
              <BadgeCheck size={14} color="#007AFF" style={{ flexShrink: 0 }} />
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              color: "rgba(0,0,0,0.4)",
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

function TrustedByBand() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        backgroundColor: "white",
        padding: "22px 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(0,0,0,0.35)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
            marginRight: 8,
          }}
        >
          Trusted by teams at
        </span>
        {TRUSTED_BY.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              opacity: 0.55,
              transition: "opacity 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.55";
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#1C1C1E",
                letterSpacing: "-0.4px",
                padding: "6px 14px",
                borderRadius: 8,
                border: "1.5px solid rgba(0,0,0,0.08)",
                backgroundColor: "#F8F8FA",
              }}
            >
              {name}
            </span>
          </div>
        ))}
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
  const animKey = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div
      className={`marquee-row-${direction}`}
      style={{ overflow: "hidden", width: "100%", position: "relative" }}
    >
      <div
        className={`marquee-track-${direction}`}
        style={{
          display: "flex",
          gap: 16,
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
        backgroundColor: "#FAFAFA",
        padding: "0 0 88px",
        overflow: "hidden",
      }}
    >
      {/* Trusted by band — sits flush at the top */}
      <TrustedByBand />

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
        .marquee-row-left:hover  .marquee-track-left,
        .marquee-row-right:hover .marquee-track-right {
          animation-play-state: paused;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: 52 }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#007AFF",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            Community
          </p>
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              color: "#1C1C1E",
            }}
          >
            We&apos;ve helped foodies discover amazing places
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "rgba(0,0,0,0.45)",
              maxWidth: 440,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            From solo explorers to group dinner planners — TasteMap powers every
            type of food journey.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginBottom: 56,
            backgroundColor: "rgba(0,0,0,0.06)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "32px",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
                textAlign: "center",
                borderRadius:
                  i === 0 ? "16px 0 0 16px" : i === 2 ? "0 16px 16px 0" : 0,
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  letterSpacing: "-2.5px",
                  color: "#1C1C1E",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>
                {s.label}
              </span>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
                {s.sub}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Ticker rows (full bleed) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <MarqueeRow reviews={ROW_1} direction="left" />
        <MarqueeRow reviews={ROW_2} direction="right" />
      </motion.div>

      {/* Fade edges */}
      <div
        style={{
          position: "relative",
          pointerEvents: "none",
          marginTop: -140,
          height: 140,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: "linear-gradient(to right, #FAFAFA, transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 120,
            background: "linear-gradient(to left, #FAFAFA, transparent)",
          }}
        />
      </div>
    </section>
  );
}
