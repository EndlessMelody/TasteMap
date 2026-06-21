"use client";

import React from "react";
import { Row, Text } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

interface DestinationBadgeProps {
  destination: string;
}

export function DestinationBadge({ destination }: DestinationBadgeProps) {
  return (
    <Row
      fillWidth
      padding="12"
      vertical="center"
      style={{
        border: "1px solid rgba(255,107,53,0.15)",
        borderRadius: "12px",
        background: "rgba(255,107,53,0.06)",
      }}
    >
      <Text variant="body-default-s" onBackground="neutral-medium">
        Publishing to:
      </Text>
      <Text variant="body-strong-s" style={{ color: tokens.color.warm, marginLeft: "6px" }}>
        {destination}
      </Text>
    </Row>
  );
}
