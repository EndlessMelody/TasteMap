"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Users, Map as MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FinishResult } from "@/hooks/useGroupSwipe";
import { Card, H2, H3, Body, BodySm, Caption, Pill } from "@/components/ui";
import { tokens } from "@/styles/tokens";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

interface GroupResultsViewProps {
  results: FinishResult[];
}

export function GroupResultsView({ results }: GroupResultsViewProps) {
  const router = useRouter();
  if (results.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: tokens.color.bg,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: `${tokens.space[6]} ${tokens.space[5]} ${tokens.space[4]}`,
          flexShrink: 0,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: tokens.radius.lg,
            margin: `0 auto ${tokens.space[3]}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(251, 191, 36, 0.12)",
            color: tokens.color.warning,
          }}
        >
          <Trophy size={30} strokeWidth={1.75} />
        </motion.div>
        <H2>Tour revealed</H2>
        <BodySm tone="muted" style={{ marginTop: tokens.space[1] }}>
          Here are the top picks the Minimax Referee chose for your group.
        </BodySm>
      </motion.div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `0 ${tokens.space[5]} ${tokens.space[6]}`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space[3],
        }}
      >
        {results.map((place, idx) => (
          <motion.div
            key={place.location_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3 + idx * 0.08,
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card
              radius="lg"
              padding="md"
              shadow={idx === 0 ? "md" : "sm"}
              surface={idx === 0 ? "default" : "muted"}
              style={
                idx === 0
                  ? { border: `1.5px solid ${tokens.color.warning}` }
                  : undefined
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space[3],
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background:
                      idx === 0
                        ? tokens.color.warning
                        : tokens.color.surfaceInset,
                    color:
                      idx === 0 ? tokens.color.textInverse : tokens.color.textMuted,
                    fontSize: 14,
                    fontWeight: tokens.type.weight.bold,
                  }}
                >
                  {idx + 1}
                </span>

                <img
                  src={place.image_url || FALLBACK_IMG}
                  alt=""
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: tokens.radius.md,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <H3
                    style={{
                      marginBottom: tokens.space[1],
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {place.name}
                  </H3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[2],
                      flexWrap: "wrap",
                    }}
                  >
                    <Pill
                      tone="warning"
                      size="sm"
                      leftIcon={<Star size={10} fill="currentColor" />}
                    >
                      {Math.round(place.group_score)}% match
                    </Pill>

                    {place.in_vault && (
                      <Pill
                        tone="magic"
                        size="sm"
                        leftIcon={<Users size={9} strokeWidth={1.75} />}
                      >
                        In vault
                      </Pill>
                    )}
                  </div>

                  {place.member_scores && place.member_scores.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: tokens.space[1],
                        marginTop: tokens.space[2],
                        flexWrap: "wrap",
                      }}
                    >
                      {place.member_scores.map((ms) => (
                        <Caption
                          key={ms.user_id}
                          tone="subtle"
                          style={{
                            background: tokens.color.surfaceInset,
                            padding: "2px 6px",
                            borderRadius: tokens.radius.xs,
                          }}
                        >
                          User {ms.user_id}: {Math.round(ms.score)}%
                        </Caption>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ padding: `0 ${tokens.space[5]} ${tokens.space[6]}`, flexShrink: 0 }}>
        <button
          onClick={() => {
            const ids = results.map((r) => r.location_id).join(",");
            router.push(`/explore?spots=${ids}`);
          }}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: tokens.radius.md,
            background: "linear-gradient(135deg, #FF6B35, #A855F7)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 6px 20px rgba(255,107,53,0.3)",
          }}
        >
          <MapIcon size={16} /> View All on Map
        </button>
      </div>
    </div>
  );
}
