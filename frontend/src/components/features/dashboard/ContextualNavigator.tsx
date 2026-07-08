"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { useRecommendations } from "@/hooks/useRecommendations";
import { ContextCard } from "@/components/cards/ContextCard";
import { getDynamicContext } from "@/utils/dashboard-utils";
import { H2, Body, Caption, BodySm, Eyebrow, Pill } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useLanguage } from "@/context/LanguageContext";

export const ContextualNavigator = () => {
  const ctx = getDynamicContext();
  const { t } = useLanguage();
  const { picks, loading, error } = useRecommendations(5, undefined, "food");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <Column fillWidth gap="16">
        <Row fillWidth horizontal="between" vertical="end" gap="16">
          <Column gap="4" paddingLeft="16">
            <Eyebrow style={{ color: ctx.accent }}>{t("discover.rightNow")}</Eyebrow>
            <Row vertical="center" gap="8" style={{ flexWrap: "wrap" }}>
              {ctx.icon}
              <H2>{ctx.title}</H2>
              <Row gap="4" marginLeft="8">
                {ctx.tags.map((tag, tagIdx) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + tagIdx * 0.05,
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Pill tone="warm" size="sm">
                      {tag}
                    </Pill>
                  </motion.div>
                ))}
              </Row>
            </Row>
            {ctx.subtitle && <BodySm tone="muted">{ctx.subtitle}</BodySm>}
          </Column>

          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space[1],
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            <Sparkles size={14} strokeWidth={1.75} style={{ color: ctx.accent }} />
            <Body
              style={{
                color: ctx.accent,
                fontWeight: tokens.type.weight.semibold,
                fontSize: tokens.type.size.bodySm,
              }}
            >
              {t("discover.aiPicks")}
            </Body>
          </button>
        </Row>

        <Row className="no-scrollbar" fillWidth gap="16" overflowX="auto" paddingBottom="4">
          {loading ? (
            <BodySm tone="muted" style={{ padding: tokens.space[5] }}>
              {t("discover.loadingRecs")}
            </BodySm>
          ) : error ? (
            <BodySm
              style={{ color: tokens.color.danger, padding: tokens.space[5] }}
            >
              {error}
            </BodySm>
          ) : picks.length > 0 ? (
            picks.map((pick, i) => (
              <ContextCard
                key={pick.place_id}
                title={pick.name}
                subtitle={`${pick.price_range || "$$"} · ${t("discover.topPick")}`}
                match={Math.round(pick.match_score)}
                accent={ctx.accent}
                img={
                  pick.image_url ||
                  "https://images.unsplash.com/photo-1542181961-9590d0c79b27?w=400&h=250&fit=crop"
                }
                delay={i * 0.04}
              />
            ))
          ) : (
            <BodySm tone="muted" style={{ padding: tokens.space[5] }}>
              {t("discover.noRecs")}
            </BodySm>
          )}
        </Row>
      </Column>
    </motion.div>
  );
};
