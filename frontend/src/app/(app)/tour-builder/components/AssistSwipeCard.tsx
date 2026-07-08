"use client";

/**
 * AssistSwipeCard — compact on-brand card shown in the swipe-assist drawer.
 */
import { Column, Row } from "@once-ui-system/core";
import { Star, DollarSign, MapPin } from "lucide-react";
import { GlassCard } from "@/components/primitives/GlassCard";
import { MatchRing } from "@/components/primitives/MatchRing";
import { H3, BodySm } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import type { TourNode } from "@/store/useTourBuilderStore";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Row
      vertical="center"
      style={{
        gap: 4,
        padding: "4px 9px",
        borderRadius: tokens.radius.pill,
        background: "rgba(255,255,255,0.16)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff",
        fontSize: tokens.type.size.caption,
        fontWeight: tokens.type.weight.semibold,
      }}
    >
      {children}
    </Row>
  );
}

export function AssistSwipeCard({ node }: { node: TourNode }) {
  return (
    <GlassCard variant="elevated" padding="none" radius="xl" fillWidth style={{ height: "100%" }}>
      <Column style={{ position: "relative", width: "100%", height: "100%" }}>
        <img
          src={node.img}
          alt={node.title}
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
        <Column
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,6,4,0.9) 0%, rgba(10,6,4,0.15) 55%, transparent 100%)",
          }}
        />

        {node.match > 0 && (
          <Column
            style={{
              position: "absolute",
              top: tokens.space[3],
              right: tokens.space[3],
              padding: 4,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <MatchRing value={node.match} size="md" />
          </Column>
        )}

        <Column style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: tokens.space[5], gap: tokens.space[2] }}>
          <H3 tone="inverse" style={{ lineHeight: 1.1 }}>
            {node.title}
          </H3>
          <BodySm style={{ color: "rgba(255,255,255,0.85)" }}>{node.subtitle}</BodySm>
          <Row style={{ gap: tokens.space[2], flexWrap: "wrap", marginTop: 4 }}>
            {node.distance !== "—" && (
              <Chip>
                <MapPin size={11} /> {node.distance}
              </Chip>
            )}
            <Chip>
              <DollarSign size={11} /> {node.price}
            </Chip>
            {node.rating != null && (
              <Chip>
                <Star size={11} /> {node.rating.toFixed(1)}
              </Chip>
            )}
          </Row>
        </Column>
      </Column>
    </GlassCard>
  );
}
