"use client";

/**
 * SavedPlaceCard — a Taste-Vault tile the user can quick-add to the tour draft.
 */
import { Column, Row } from "@once-ui-system/core";
import { Plus, Check, Star, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/primitives/GlassCard";
import { BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { FALLBACK_IMG, type SavedPlace } from "../lib";

interface SavedPlaceCardProps {
  place: SavedPlace;
  added: boolean;
  onToggle: () => void;
}

export function SavedPlaceCard({ place, added, onToggle }: SavedPlaceCardProps) {
  return (
    <GlassCard variant="elevated" padding="none" radius="lg" interactive fillWidth onClick={onToggle}>
      <Column style={{ position: "relative", height: 116, width: "100%" }}>
        <img
          src={place.image_url || FALLBACK_IMG}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Column
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,6,4,0.55) 0%, transparent 60%)",
          }}
        />
        {/* Add / added toggle */}
        <Row
          horizontal="center"
          vertical="center"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: added ? tokens.color.success : "rgba(255,255,255,0.92)",
            boxShadow: tokens.shadow.sm,
            transition: "background 0.2s",
          }}
        >
          {added ? <Check size={16} color="#fff" /> : <Plus size={16} color={tokens.color.text} />}
        </Row>
      </Column>

      <Column
        style={{
          paddingTop: tokens.space[3],
          paddingRight: tokens.space[3],
          paddingBottom: tokens.space[3],
          paddingLeft: tokens.space[3],
          gap: 4,
        }}
      >
        <BodySm style={{ fontWeight: tokens.type.weight.bold, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {place.name}
        </BodySm>
        <Row vertical="center" style={{ gap: tokens.space[3] }}>
          {place.rating != null && (
            <Row vertical="center" style={{ gap: 3 }}>
              <Star size={11} color={tokens.color.warning} fill={tokens.color.warning} />
              <Caption tone="muted">{place.rating.toFixed(1)}</Caption>
            </Row>
          )}
          {place.price_range && (
            <Row vertical="center" style={{ gap: 3 }}>
              <DollarSign size={11} color={tokens.color.textMuted} />
              <Caption tone="muted">{place.price_range}</Caption>
            </Row>
          )}
        </Row>
      </Column>
    </GlassCard>
  );
}
