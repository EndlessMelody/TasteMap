"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Column, Row } from "@once-ui-system/core";
import { Body, Button, Caption, DecoratedAvatar } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { membershipApi } from "@/lib/membershipApi";
import type { Frame } from "@/types/membership";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const FramePicker: React.FC = () => {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<number | null>(null);

  useEffect(() => {
    membershipApi
      .getFrames()
      .then(setFrames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleEquip(frame: Frame) {
    const alreadyEquipped = user?.equipped_frame?.id === frame.id;
    setEquippingId(frame.id);
    try {
      await membershipApi.equipFrame(alreadyEquipped ? null : frame.id);
      await refreshUser();
      setFrames(await membershipApi.getFrames());
    } catch {
      toast.error(t("membership.frames.updateError"));
    } finally {
      setEquippingId(null);
    }
  }

  if (loading || frames.length === 0) return null;

  return (
    <Column style={{ gap: tokens.space[4] }}>
      <Column style={{ gap: 2 }}>
        <Body style={{ fontWeight: tokens.type.weight.semibold }}>{t("membership.frames.title")}</Body>
        <Caption tone="muted">{t("membership.frames.subtitle")}</Caption>
      </Column>
      <Row style={{ gap: tokens.space[4], flexWrap: "wrap" }}>
        {frames.map((frame) => {
          const equipped = user?.equipped_frame?.id === frame.id;
          const unlocked = frame.owned && frame.equippable;
          return (
            <Column
              key={frame.id}
              horizontal="center"
              style={{
                gap: tokens.space[2],
                padding: tokens.space[3],
                borderRadius: tokens.radius.md,
                border: equipped ? `2px solid ${frame.accent_color}` : `1px solid ${tokens.color.border}`,
                width: 108,
                opacity: unlocked || frame.owned ? 1 : 0.5,
              }}
            >
              <DecoratedAvatar
                size="lg"
                name={user?.display_name || user?.username}
                src={user?.avatar_url}
                frame={{ style_key: frame.style_key, accent_color: frame.accent_color, is_animated: frame.is_animated }}
              />
              <Caption tone="muted" style={{ textAlign: "center", fontSize: 10 }}>
                {frame.name}
              </Caption>
              {unlocked ? (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={equippingId === frame.id}
                  onClick={() => handleEquip(frame)}
                  style={{
                    fontSize: tokens.type.size.caption,
                    color: equipped ? tokens.color.textMuted : frame.accent_color,
                    padding: 0,
                    height: "auto",
                  }}
                >
                  {equipped ? t("membership.frames.unequip") : t("membership.frames.equip")}
                </Button>
              ) : (
                <Caption tone="muted" style={{ fontSize: 10 }}>
                  {t("membership.frames.locked", {
                    tier: t(`membership.tier${capitalize(frame.min_tier)}`),
                  })}
                </Caption>
              )}
            </Column>
          );
        })}
      </Row>
    </Column>
  );
};

export default FramePicker;
