"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Minus, Flame, Crown, Sparkles } from "lucide-react";
import { Column, Row, Grid } from "@once-ui-system/core";
import { Page, H1, H2, Body, BodySm, Caption, Button, DecoratedAvatar } from "@/components/ui";
import { GlassCard } from "@/components/primitives/GlassCard";
import { MatchRing } from "@/components/primitives/MatchRing";
import { TierBadgePill } from "@/components/features/membership/TierBadgePill";
import { FramePicker } from "@/components/features/membership/FramePicker";
import { tokens } from "@/styles/tokens";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/store/uiStore";
import { membershipApi, formatVnd } from "@/lib/membershipApi";
import { usePlans } from "@/hooks/usePlans";
import type { EntitlementMatrix, MembershipStatus, MembershipTier } from "@/types/membership";

const TIER_ICON: Record<MembershipTier, React.ReactNode> = {
  bite: null,
  savor: <Flame size={16} />,
  feast: <Crown size={16} />,
  omakase: <Sparkles size={16} />,
};

interface PerkRowDef {
  key: keyof EntitlementMatrix["bite"];
  labelKey: string;
  isBoolean?: boolean;
  suffix?: string;
}

const PERK_ROWS: PerkRowDef[] = [
  { key: "daily_swipes", labelKey: "membership.perk.dailySwipes" },
  { key: "super_likes_per_day", labelKey: "membership.perk.superLikes" },
  { key: "rewinds_per_day", labelKey: "membership.perk.rewinds" },
  { key: "culture_calls_per_day", labelKey: "membership.perk.cultureCalls" },
  { key: "recommendation_calls_per_day", labelKey: "membership.perk.recCalls" },
  { key: "tour_stops_max", labelKey: "membership.perk.tourStops" },
  { key: "saved_tours_max", labelKey: "membership.perk.savedTours" },
  { key: "vault_bookmarks_max", labelKey: "membership.perk.vaultBookmarks" },
  { key: "xp_boost_pct", labelKey: "membership.perk.xpBoost", suffix: "%" },
  { key: "streak_freezes_per_month", labelKey: "membership.perk.streakFreezes" },
  { key: "advanced_analytics", labelKey: "membership.perk.analytics", isBoolean: true },
];

function PerkCell({ row, value, t }: { row: PerkRowDef; value: number | boolean | null; t: (k: string, p?: Record<string, string | number>) => string }) {
  if (row.isBoolean) {
    return value ? (
      <Check size={16} color={tokens.color.success} />
    ) : (
      <Minus size={14} color={tokens.color.textMuted} />
    );
  }
  if (value === null) return <BodySm style={{ fontWeight: 700 }}>{t("membership.unlimited")}</BodySm>;
  return <BodySm>{value}{row.suffix ?? ""}</BodySm>;
}

export default function MembershipPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const openCheckout = useUiStore((s) => s.openCheckout);
  const { byId: planById } = usePlans();

  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementMatrix | null>(null);

  useEffect(() => {
    membershipApi.getStatus().then(setStatus).catch(() => {});
    membershipApi.getEntitlements().then(setEntitlements).catch(() => {});
  }, []);

  const tier = status?.tier ?? "bite";
  const streak = status?.streak;

  return (
    <Page>
      <Column style={{ maxWidth: 1000, margin: "0 auto", width: "100%", gap: tokens.space[10] }}>
        {/* ─── Hero ─── */}
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <GlassCard variant="elevated" padding="lg">
            <Row horizontal="between" vertical="center" style={{ gap: tokens.space[6], flexWrap: "wrap" }}>
              <Row vertical="center" style={{ gap: tokens.space[4] }}>
                <DecoratedAvatar
                  size="xl"
                  name={user?.display_name || user?.username}
                  src={user?.avatar_url}
                  frame={user?.equipped_frame ?? null}
                />
                <Column style={{ gap: tokens.space[2] }}>
                  <H1 style={{ fontSize: tokens.type.size.h2 }}>{t("membership.pageTitle")}</H1>
                  <Body tone="muted">{t("membership.pageSubtitle")}</Body>
                  <Row style={{ gap: tokens.space[2] }} vertical="center">
                    <TierBadgePill tier={tier} label={t(`membership.tier${capitalize(tier)}`)} size="md" />
                    {streak && streak.current_streak > 0 && (
                      <Caption tone="muted">
                        🔥 {t("membership.streakShort", { n: streak.current_streak })}
                      </Caption>
                    )}
                  </Row>
                </Column>
              </Row>

              {streak && tier !== "omakase" && (() => {
                const isPaid = !!status?.subscription;
                const target = isPaid ? 14 : 7;
                const ringValue = Math.min(100, (streak.current_streak / target) * 100);
                return (
                  <Column horizontal="center" style={{ gap: tokens.space[2] }}>
                    <MatchRing value={ringValue} size="lg" tone={tokens.color.tierGold} />
                    <Caption tone="muted" style={{ textAlign: "center", maxWidth: 120 }}>
                      {isPaid
                        ? t("membership.daysToOmakase", { n: streak.days_to_omakase ?? 0 })
                        : t("membership.daysToSavor", { n: streak.days_to_savor })}
                    </Caption>
                  </Column>
                );
              })()}
            </Row>
          </GlassCard>
        </motion.div>

        {/* ─── Tier showcases ─── */}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <Column style={{ gap: tokens.space[5] }}>
            {/* Bite */}
            <motion.div variants={fadeUp}>
              <GlassCard variant="flat" padding="lg">
                <TierShowcase
                  tier="bite"
                  title={t("membership.tierBite")}
                  tagline={t("membership.taglineBite")}
                  price={t("membership.freeForever")}
                  badge={undefined}
                  cta={null}
                />
              </GlassCard>
            </motion.div>

            {/* Savor */}
            <motion.div variants={fadeUp}>
              <GlassCard
                variant="elevated"
                padding="lg"
                style={{ border: `1.5px solid ${tokens.color.warm}59`, boxShadow: tokens.shadow.glowWarm }}
              >
                <TierShowcase
                  tier="savor"
                  title={t("membership.tierSavor")}
                  tagline={t("membership.taglineSavor")}
                  price={t("membership.earnedTier")}
                  badge={t("membership.earnedTier")}
                  cta={
                    tier === "bite" ? (
                      <Button variant="secondary" onClick={() => router.push("/challenges")}>
                        {t("membership.keepYourStreak")}
                      </Button>
                    ) : null
                  }
                />
              </GlassCard>
            </motion.div>

            {/* Feast */}
            <motion.div variants={fadeUp}>
              <GlassCard variant="feature" padding="lg" style={{ position: "relative" }}>
                <Row
                  style={{
                    position: "absolute",
                    top: tokens.space[4],
                    right: tokens.space[4],
                  }}
                >
                  <TierBadgePill tier="feast" label={t("membership.mostPopular")} />
                </Row>
                <TierShowcase
                  tier="feast"
                  title={t("membership.tierFeast")}
                  tagline={t("membership.taglineFeast")}
                  price={
                    planById.feast_monthly
                      ? `${formatVnd(planById.feast_monthly.price_vnd)}${t("membership.perMonth")}`
                      : "—"
                  }
                  badge={undefined}
                  cta={
                    tier === "feast" || tier === "omakase" ? (
                      <Caption tone="muted">{t("membership.currentPlan")}</Caption>
                    ) : (
                      <Button variant="primary" onClick={() => openCheckout("feast_monthly")}>
                        {t("membership.upgradeToFeast")}
                      </Button>
                    )
                  }
                />
              </GlassCard>
            </motion.div>

            {/* Omakase */}
            <motion.div variants={fadeUp}>
              <GlassCard
                variant="elevated"
                padding="lg"
                style={{
                  backgroundImage: `linear-gradient(${tokens.color.surface}, ${tokens.color.surface}), ${tokens.gradient.tierGold}`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  border: "1px solid transparent",
                  boxShadow: tokens.shadow.glowGold,
                }}
              >
                <TierShowcase
                  tier="omakase"
                  title={t("membership.tierOmakase")}
                  tagline={t("membership.taglineOmakase")}
                  price={t("membership.pinnacleTier")}
                  badge={t("membership.pinnacleTier")}
                  cta={
                    tier === "omakase" ? (
                      <Caption tone="muted">{t("membership.omakaseUnlocked")}</Caption>
                    ) : tier === "feast" ? (
                      <Button variant="secondary" onClick={() => router.push("/challenges")}>
                        {t("membership.keepYourStreak")}
                      </Button>
                    ) : null
                  }
                />
              </GlassCard>
            </motion.div>
          </Column>
        </motion.div>

        {/* ─── Frame picker ─── */}
        <FramePicker />

        {/* ─── Comparison table ─── */}
        {entitlements && (
          <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
            <Column style={{ gap: tokens.space[4] }}>
              <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("membership.comparePlans")}</H2>
              <Column style={{ overflowX: "auto" }}>
                <Grid
                  style={{
                    gridTemplateColumns: "minmax(160px, 1.5fr) repeat(4, 1fr)",
                    minWidth: 640,
                  }}
                >
                  <Row />
                  {(["bite", "savor", "feast", "omakase"] as MembershipTier[]).map((tk) => (
                    <Row key={tk} horizontal="center" style={{ padding: tokens.space[3] }}>
                      <TierBadgePill tier={tk} label={t(`membership.tier${capitalize(tk)}`)} />
                    </Row>
                  ))}
                  {PERK_ROWS.map((row) => (
                    <React.Fragment key={row.key}>
                      <Row vertical="center" style={{ padding: tokens.space[3], borderTop: `1px solid ${tokens.color.border}` }}>
                        <BodySm tone="muted">{t(row.labelKey)}</BodySm>
                      </Row>
                      {(["bite", "savor", "feast", "omakase"] as MembershipTier[]).map((tk) => (
                        <Row
                          key={tk}
                          horizontal="center"
                          vertical="center"
                          style={{ padding: tokens.space[3], borderTop: `1px solid ${tokens.color.border}` }}
                        >
                          <PerkCell row={row} value={entitlements[tk][row.key] as number | boolean | null} t={t} />
                        </Row>
                      ))}
                    </React.Fragment>
                  ))}
                </Grid>
              </Column>
            </Column>
          </motion.div>
        )}
      </Column>
    </Page>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function TierShowcase({
  tier,
  title,
  tagline,
  price,
  badge,
  cta,
}: {
  tier: MembershipTier;
  title: string;
  tagline: string;
  price: string;
  badge?: string;
  cta: React.ReactNode;
}) {
  return (
    <Row horizontal="between" vertical="center" style={{ gap: tokens.space[5], flexWrap: "wrap" }}>
      <Column style={{ gap: tokens.space[2], maxWidth: 460 }}>
        <Row vertical="center" style={{ gap: tokens.space[2] }}>
          {TIER_ICON[tier]}
          <H2 style={{ fontSize: tokens.type.size.h3 }}>{title}</H2>
          {badge && tier !== "feast" && <Caption tone="muted">{badge}</Caption>}
        </Row>
        <Body tone="muted">{tagline}</Body>
      </Column>
      <Row vertical="center" style={{ gap: tokens.space[5] }}>
        <Body style={{ fontWeight: tokens.type.weight.bold }}>{price}</Body>
        {cta}
      </Row>
    </Row>
  );
}
