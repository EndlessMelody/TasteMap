"use client";

/**
 * NearbyNowCard — Discover v2.5
 * ─────────────────────────────────────────────────────────────────
 * Brings the map back into the hero as genuine utility (not decoration).
 * Replaces the old ContinueTourCard slot in the right sidebar.
 *
 * Content:
 *   - Header:  "Nearby Now" eyebrow + count badge
 *   - Body:    embedded MapWidget centered on user's location with
 *              3 nearby recommendation pins
 *   - Footer:  "Open map view →" link to /explore
 *
 * Graceful fallback: if the Mapbox token isn't available, shows a
 * styled "Map preview unavailable" placeholder instead of a blank.
 */
import React from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowUpRight } from "lucide-react";

import Map from "@/components/Map";
import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";
import type { Spot } from "@/app/explore/types";

// ─── Default center (Dĩ An area) ─────────────────────────────────
const DEFAULT_CENTER: [number, number] = [10.897, 106.772];

// ─── Mock nearby spots (replaced by real data in a later phase) ──
const MOCK_SPOTS: Spot[] = [
  {
    id: 9901,
    name: "Bún Bò Huế Đông Ba",
    category: "Vietnamese",
    emoji: "🍜",
    accent: "#FF6B35",
    lat: 10.9012,
    lon: 106.7695,
    rating: 4.7,
    reviewCount: 128,
    priceLevel: 1,
    isOpen: true,
    closesAt: "22:00",
    distance: "0.8km",
    img: "",
    description: "",
    tags: ["Street Food", "Spicy"],
  },
  {
    id: 9902,
    name: "Saigon Beer Club",
    category: "Bar",
    emoji: "🍺",
    accent: "#7B2FF7",
    lat: 10.8935,
    lon: 106.7778,
    rating: 4.5,
    reviewCount: 342,
    priceLevel: 3,
    isOpen: true,
    closesAt: "01:00",
    distance: "1.4km",
    img: "",
    description: "",
    tags: ["Nightlife", "Group"],
  },
  {
    id: 9903,
    name: "The Cozy Bean",
    category: "Cafe",
    emoji: "☕",
    accent: "#34C759",
    lat: 10.8997,
    lon: 106.7752,
    rating: 4.8,
    reviewCount: 89,
    priceLevel: 2,
    isOpen: true,
    closesAt: "23:00",
    distance: "0.5km",
    img: "",
    description: "",
    tags: ["Quiet", "Aesthetic"],
  },
];

// ─── Helper: detect Mapbox availability ──────────────────────────
function isMapAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
}

// ─── Main component ──────────────────────────────────────────────
export const NearbyNowCard: React.FC = () => {
  const router = useRouter();
  const spots = MOCK_SPOTS;
  const mapReady = isMapAvailable();

  const handleOpenExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/explore");
  };

  return (
    <GlassCard
      variant="elevated"
      padding="none"
      radius="lg"
      fillWidth
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: tokens.space[3],
          padding: `${tokens.space[3]} ${tokens.space[4]}`,
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space[2],
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: tokens.radius.sm,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${tokens.color.warm}14`,
              border: `1px solid ${tokens.color.warm}30`,
            }}
          >
            <MapPin size={12} color={tokens.color.warm} strokeWidth={2.4} />
          </span>
          <span
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: tokens.type.weight.bold,
              letterSpacing: tokens.type.tracking.wide,
              textTransform: "uppercase",
              color: tokens.color.textSubtle,
            }}
          >
            Nearby Now
          </span>
        </div>

        <span
          style={{
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.text,
            letterSpacing: tokens.type.tracking.normal,
          }}
        >
          {spots.length} within 2km
        </span>
      </div>

      {/* ── Map body ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          backgroundColor: tokens.color.surfaceMuted,
        }}
      >
        {mapReady ? (
          <Map
            mapId="discover-nearby"
            spots={spots}
            center={DEFAULT_CENTER}
            zoom={14}
            minZoom={12}
            maxZoom={17}
            userLocation={DEFAULT_CENTER}
            showBanner={false}
            enableClustering={false}
            interactive={false}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space[2],
              color: tokens.color.textMuted,
              padding: tokens.space[5],
              textAlign: "center",
            }}
          >
            <MapPin
              size={22}
              color={tokens.color.textMuted}
              strokeWidth={1.8}
            />
            <span
              style={{
                fontSize: tokens.type.size.bodySm,
                fontWeight: tokens.type.weight.semibold,
                color: tokens.color.text,
              }}
            >
              Map preview unavailable
            </span>
            <span
              style={{
                fontSize: tokens.type.size.caption,
                color: tokens.color.textMuted,
              }}
            >
              Add a Mapbox token to enable
            </span>
          </div>
        )}
      </div>

      {/* ── Footer (clickable) ── */}
      <button
        type="button"
        onClick={handleOpenExplore}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: tokens.space[2],
          padding: `${tokens.space[3]} ${tokens.space[4]}`,
          borderTop: `1px solid ${tokens.color.border}`,
          backgroundColor: tokens.color.surface,
          border: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 150ms var(--dsc-ease-out)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tokens.color.surfaceMuted;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = tokens.color.surface;
        }}
      >
        <span
          style={{
            fontSize: tokens.type.size.bodySm,
            fontWeight: tokens.type.weight.bold,
            color: tokens.color.warm,
            letterSpacing: tokens.type.tracking.normal,
          }}
        >
          Open map view
        </span>
        <ArrowUpRight size={14} color={tokens.color.warm} strokeWidth={2.4} />
      </button>
    </GlassCard>
  );
};
