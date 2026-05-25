"use client";

/**
 * QuickActionDock — Discover v2
 * ─────────────────────────────────────────────────────────────────
 * A row of 4 large glass action buttons that sits under the hero.
 * Each button is a low-commitment entry point into a core surface:
 *
 *   [Swipe AI]  [Build Tour]  [Join Squad]  [Saved]
 *
 * Design rules:
 *   - Uses GlassCard `elevated` variant per button.
 *   - Icons use the signature gradient for AI-tinted feel on first action.
 *   - Hover: gentle lift via motion preset.
 *   - Mobile: collapses to horizontal scroll (no-scrollbar).
 */
import React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Map as MapIcon,
  Users,
  Bookmark,
  type LucideIcon,
} from "lucide-react";

import { GlassCard } from "@/components/primitives";
import { tokens } from "@/styles/tokens";

// ─── Action config ───────────────────────────────────────────────
interface ActionConfig {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: string;
  route: string;
  glow?: string;
}

const ACTIONS: ActionConfig[] = [
  {
    id: "swipe",
    label: "AI Pick",
    hint: "Swipe to explore",
    icon: Sparkles,
    tone: tokens.color.magic,
    route: "/ai-planner",
    glow: tokens.shadow.glowMagic,
  },
  {
    id: "build",
    label: "Build Tour",
    hint: "Plan your route",
    icon: MapIcon,
    tone: tokens.color.warm,
    route: "/tour-builder",
    glow: tokens.shadow.glowWarm,
  },
  {
    id: "squad",
    label: "Join Squad",
    hint: "Group lobbies",
    icon: Users,
    tone: tokens.color.cool,
    route: "/group-rooms",
  },
  {
    id: "saved",
    label: "Saved",
    hint: "Your vault",
    icon: Bookmark,
    tone: tokens.color.success,
    route: "/profile",
  },
];

// ─── Main component ──────────────────────────────────────────────
export const QuickActionDock: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: tokens.space[4],
        width: "100%",
        overflowX: "auto",
      }}
    >
      {ACTIONS.map((action) => {
        const Icon = action.icon;

        return (
          <GlassCard
            key={action.id}
            variant="elevated"
            padding="md"
            radius="lg"
            interactive
            onClick={() => router.push(action.route)}
            style={{
              flex: 1,
              minWidth: 180,
              display: "flex",
              alignItems: "center",
              gap: tokens.space[4],
              padding: `${tokens.space[4]} ${tokens.space[5]}`,
            }}
          >
            {/* ── Icon tile ── */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: tokens.radius.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${action.tone}12`,
                border: `1px solid ${action.tone}22`,
                flexShrink: 0,
                boxShadow: action.glow,
              }}
            >
              <Icon size={20} color={action.tone} strokeWidth={2.2} />
            </div>

            {/* ── Label + hint ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: tokens.type.size.body,
                  fontWeight: tokens.type.weight.bold,
                  color: tokens.color.text,
                  letterSpacing: tokens.type.tracking.tight,
                  lineHeight: 1.2,
                }}
              >
                {action.label}
              </span>
              <span
                style={{
                  fontSize: tokens.type.size.caption,
                  fontWeight: tokens.type.weight.medium,
                  color: tokens.color.textMuted,
                  lineHeight: 1.3,
                }}
              >
                {action.hint}
              </span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
