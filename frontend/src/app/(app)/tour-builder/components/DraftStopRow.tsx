"use client";

/**
 * DraftStopRow — a compact row in the "Your tour" draft list (with remove).
 */
import { Column, Row, IconButton } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import { BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import type { TourNode } from "@/store/useTourBuilderStore";
import { useLanguage } from "@/context/LanguageContext";

interface DraftStopRowProps {
  node: TourNode;
  index: number;
  onRemove: () => void;
}

export function DraftStopRow({ node, index, onRemove }: DraftStopRowProps) {
  const { t } = useLanguage();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: tokens.motion.easeCurve.out }}
    >
      <Row
        vertical="center"
        fillWidth
        style={{
          gap: tokens.space[3],
          paddingTop: tokens.space[2],
          paddingBottom: tokens.space[2],
          paddingLeft: tokens.space[2],
          paddingRight: tokens.space[2],
          borderRadius: tokens.radius.md,
          background: tokens.color.surface,
          border: `1px solid ${tokens.color.border}`,
        }}
      >
        <GripVertical size={14} color={tokens.color.textSubtle} style={{ flexShrink: 0 }} />
        <Row
          horizontal="center"
          vertical="center"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: node.color,
            color: "#fff",
            fontSize: tokens.type.size.caption,
            fontWeight: tokens.type.weight.black,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Row>
        <Column
          style={{
            width: 38,
            height: 38,
            borderRadius: tokens.radius.sm,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img src={node.img} alt={node.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Column>
        <Column style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <BodySm
            style={{
              fontWeight: tokens.type.weight.semibold,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.title}
          </BodySm>
          <Caption tone="muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.subtitle}
          </Caption>
        </Column>
        <IconButton
          size="s"
          variant="ghost"
          tooltip={t("tour.remove")}
          onClick={onRemove}
          style={{ flexShrink: 0 }}
        >
          <X size={14} />
        </IconButton>
      </Row>
    </motion.div>
  );
}
