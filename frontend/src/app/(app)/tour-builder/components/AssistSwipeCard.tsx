"use client";

/**
 * AssistSwipeCard — the swipe deck's card. Flips in place (tap anywhere,
 * or the info affordance) to reveal full details on its back face.
 * Front/back share one GlassCard shell; only the inner face rotates so the
 * flip never fights the ancestor's drag="x" swipe gesture.
 */
import { Column, Row } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { Star, DollarSign, MapPin, Info, Sparkles, Quote } from "lucide-react";
import { GlassCard } from "@/components/primitives/GlassCard";
import { MatchRing } from "@/components/primitives/MatchRing";
import { H3, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import type { TourNode } from "@/store/useTourBuilderStore";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Row
      vertical="center"
      style={{
        gap: 4,
        paddingTop: "4px",
        paddingRight: "9px",
        paddingBottom: "4px",
        paddingLeft: "9px",
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

interface AssistSwipeCardProps {
  node: TourNode;
  /** Whether the back (details) face is currently showing. */
  flipped?: boolean;
  /** Tap-anywhere-on-card handler that toggles `flipped`. */
  onFlip?: () => void;
}

export function AssistSwipeCard({ node, flipped = false, onFlip }: AssistSwipeCardProps) {
  return (
    <GlassCard
      variant="elevated"
      padding="none"
      radius="xl"
      fillWidth
      style={{ height: "100%", perspective: 1600 }}
    >
      <motion.div
        onClick={onFlip}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          cursor: onFlip ? "pointer" : undefined,
        }}
      >
        {/* ─── FRONT FACE ─── */}
        <Column style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
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
                paddingTop: 4,
                paddingRight: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <MatchRing value={node.match} size="md" />
            </Column>
          )}

          {onFlip && (
            <Row
              horizontal="center"
              vertical="center"
              style={{
                position: "absolute",
                top: tokens.space[3],
                left: tokens.space[3],
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Info size={14} color="#fff" />
            </Row>
          )}

          <Column
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              paddingTop: tokens.space[5],
              paddingRight: tokens.space[5],
              paddingBottom: tokens.space[5],
              paddingLeft: tokens.space[5],
              gap: tokens.space[2],
            }}
          >
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

        {/* ─── BACK FACE ─── */}
        <Column
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: tokens.color.surface,
            paddingTop: tokens.space[5],
            paddingRight: tokens.space[5],
            paddingBottom: tokens.space[5],
            paddingLeft: tokens.space[5],
            gap: tokens.space[4],
            overflowY: "auto",
          }}
        >
          <Column style={{ gap: 2 }}>
            <H3 style={{ lineHeight: 1.1 }}>{node.title}</H3>
            <BodySm tone="muted">{node.subtitle}</BodySm>
          </Column>

          {node.tags.length > 0 && (
            <Column style={{ gap: tokens.space[2] }}>
              <Caption tone="muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Palate tags
              </Caption>
              <Row style={{ gap: tokens.space[2], flexWrap: "wrap" }}>
                {node.tags.map((tag) => (
                  <Row
                    key={tag}
                    style={{
                      paddingTop: "4px",
                      paddingRight: "10px",
                      paddingBottom: "4px",
                      paddingLeft: "10px",
                      borderRadius: tokens.radius.pill,
                      background: tokens.color.surfaceMuted,
                      border: `1px solid ${tokens.color.border}`,
                    }}
                  >
                    <Caption style={{ fontWeight: tokens.type.weight.semibold }}>{tag}</Caption>
                  </Row>
                ))}
              </Row>
            </Column>
          )}

          <Row
            horizontal="between"
            vertical="center"
            style={{
              paddingTop: tokens.space[3],
              paddingRight: tokens.space[3],
              paddingBottom: tokens.space[3],
              paddingLeft: tokens.space[3],
              borderRadius: tokens.radius.md,
              background: tokens.color.surfaceMuted,
              border: `1px solid ${tokens.color.border}`,
            }}
          >
            <Row vertical="center" style={{ gap: 6 }}>
              <DollarSign size={16} color={tokens.color.warm} />
              <BodySm style={{ fontWeight: tokens.type.weight.bold }}>~{node.price}</BodySm>
            </Row>
            {node.rating != null && (
              <Row vertical="center" style={{ gap: 4 }}>
                <Star size={14} color={tokens.color.warning} fill={tokens.color.warning} />
                <BodySm style={{ fontWeight: tokens.type.weight.bold }}>{node.rating.toFixed(1)}</BodySm>
              </Row>
            )}
          </Row>

          {node.reviews_preview?.[0] && (
            <Column style={{ gap: tokens.space[2] }}>
              <Caption tone="muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Community consensus
              </Caption>
              <Row
                style={{
                  gap: tokens.space[2],
                  paddingTop: tokens.space[3],
                  paddingRight: tokens.space[3],
                  paddingBottom: tokens.space[3],
                  paddingLeft: tokens.space[3],
                  borderRadius: tokens.radius.md,
                  background: tokens.color.surfaceMuted,
                  border: `1px solid ${tokens.color.border}`,
                }}
              >
                <Quote size={14} color={tokens.color.textSubtle} style={{ flexShrink: 0, marginTop: 2 }} />
                <BodySm tone="muted" style={{ fontStyle: "italic" }}>
                  {node.reviews_preview[0]}
                </BodySm>
              </Row>
            </Column>
          )}

          <Row vertical="center" style={{ gap: 6, marginTop: "auto", opacity: 0.7 }}>
            <Sparkles size={13} color={tokens.color.warm} />
            <Caption tone="muted" style={{ textTransform: "uppercase" }}>
              Matches your Tour DNA
            </Caption>
          </Row>
        </Column>
      </motion.div>
    </GlassCard>
  );
}
