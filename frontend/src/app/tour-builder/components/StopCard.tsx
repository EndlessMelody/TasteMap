"use client";

import React from "react";
import { Column, Row, Heading, Text } from "@/components/OnceUI";
import { motion } from "framer-motion";
import { Sparkles, Navigation, DollarSign } from "lucide-react";
import { surface, accent, text, border, radius, shadow, spacing } from "../tokens";
import { RouteChip } from "./RouteChip";
import { StatusBadge } from "./StatusBadge";

export interface StopCardData {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  match: number;
  distance: string;
  price: string;
  img: string;
  color: string;
}

interface StopCardProps {
  card: StopCardData;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export function StopCard({ card }: StopCardProps) {
  return (
    <Row
      fill
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        borderRadius: radius.l,
        overflow: "hidden",
        boxShadow: shadow.elevated,
        border: `1px solid ${border.medium}`,
      }}
    >
      {/* ─── LEFT SIDE: IMAGE & IDENTITY ─── */}
      <div
        style={{
          width: "55%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={card.img}
          alt={card.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Gradient overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Badges */}
        <Row
          style={{
            position: "absolute",
            top: spacing.l,
            left: spacing.l,
            right: spacing.l,
            zIndex: 3,
            justifyContent: "space-between",
          }}
        >
          <StatusBadge
            type="match"
            value={`${card.match}% match`}
            icon={<Sparkles size={12} color="#FBBF24" />}
          />
          <StatusBadge
            type="distance"
            value={card.distance}
            icon={<Navigation size={11} color="rgba(255,255,255,0.7)" />}
          />
        </Row>

        {/* Identity Overlay */}
        <Column
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `${spacing.l}px`,
            gap: spacing.xs,
          }}
        >
          <Heading
            variant="display-strong-s"
            style={{ color: "white", lineHeight: 1.1, fontSize: '2.4rem' }}
          >
            {card.title}
          </Heading>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", fontWeight: 500 }}>
            {card.subtitle}
          </Text>
        </Column>
      </div>

      {/* ─── RIGHT SIDE: BENTO DETAILS ─── */}
      <Column
        style={{
          width: "45%",
          height: "100%",
          backgroundColor: "#F8FAFF",
          borderLeft: `1px solid ${border.subtle}`,
          padding: `${spacing.l}px`,
          gap: spacing.l,
          overflowY: 'auto'
        }}
      >
        {/* Quick Stats Grid */}
        <Column style={{ gap: spacing.m }}>
          <Text
            style={{
              color: text.muted,
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Palate Analytics
          </Text>
          <Row style={{ gap: spacing.s, flexWrap: "wrap" }}>
            {card.tags.map((tag) => (
              <RouteChip key={tag} label={tag} color={card.color} variant="on-surface" />
            ))}
          </Row>
        </Column>

        <div style={{ height: '1px', backgroundColor: border.subtle, width: '100%' }} />

        {/* Pricing/Rating */}
        <Column style={{ gap: spacing.xs }}>
          <Text style={{ color: text.tertiary, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Estimated Cost
          </Text>
          <Row vertical="center" horizontal="center" style={{ width: '100%' }}>
            <Row vertical="center" style={{ gap: '8px' }}>
              <DollarSign size={18} color={accent.primary} />
              <Text style={{ color: text.primary, fontSize: '1.25rem', fontWeight: 800 }}>~{card.price} VND</Text>
            </Row>
            <StatusBadge type="rating" value="4.8" icon={<Sparkles size={14} color="#FBBF24" />} />
          </Row>
        </Column>

        <div style={{ height: '1px', backgroundColor: border.subtle, width: '100%' }} />

        {/* Curation Insight / Reviews */}
        <Column style={{ gap: spacing.m }}>
          <Text
            style={{
              color: text.muted,
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Community Consensus
          </Text>
          <Column style={{ gap: spacing.m }}>
            <div style={{ padding: spacing.m, backgroundColor: 'white', borderRadius: radius.m, border: `1px solid ${border.subtle}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Text style={{ color: text.secondary, fontSize: "0.85rem", lineHeight: 1.5, fontStyle: 'italic' }}>
                &ldquo;Absolutely incredible, best in the area! The flavor profile perfectly matches your group's current spicy preference.&rdquo;
              </Text>
            </div>
          </Column>
        </Column>

        <div style={{ marginTop: 'auto', paddingTop: spacing.m }}>
          <Row vertical="center" style={{ gap: spacing.xs, opacity: 0.6 }}>
            <Sparkles size={14} color={accent.primary} />
            <Text style={{ fontSize: '0.7rem', fontWeight: 700, color: text.tertiary, textTransform: 'uppercase' }}>
              Highly Recommended for your Tour DNA
            </Text>
          </Row>
        </div>
      </Column>
    </Row>
  );
}
