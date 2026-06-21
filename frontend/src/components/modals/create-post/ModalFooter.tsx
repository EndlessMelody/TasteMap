"use client";

import React from "react";
import { Row, Column, Text, Button } from "@once-ui-system/core";
import { motion } from "framer-motion";
import { tokens } from "@/styles/tokens";

interface ModalFooterProps {
  isUploading: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  submitLabel: string;
  destinationHint: string;
  completionPercentage: number;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ModalFooter({
  isUploading,
  isSubmitting,
  canSubmit,
  submitLabel,
  destinationHint,
  completionPercentage,
  onCancel,
  onSubmit,
}: ModalFooterProps) {
  const getButtonLabel = () => {
    if (isUploading) return "Uploading...";
    if (isSubmitting) return "Publishing...";
    return submitLabel;
  };

  return (
    <Row
      fillWidth
      horizontal="between"
      vertical="center"
      paddingY="16"
      paddingX="20"
      borderTop="neutral-alpha-weak"
      style={{
        backgroundColor: tokens.color.surface,
        flexShrink: 0,
        minHeight: "80px",
      }}
    >
      <Column gap="8" style={{ flex: 1, maxWidth: "200px" }}>
        <Row horizontal="between" vertical="center">
          <Text variant="body-default-s" onBackground="neutral-medium">
            {isUploading ? "Uploading..." : "Completion"}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {Math.round(completionPercentage)}%
          </Text>
        </Row>
        <Column
          style={{
            height: "4px",
            background: tokens.color.border,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: "100%",
              background: canSubmit ? tokens.color.warm : tokens.color.textMuted,
              borderRadius: "2px",
            }}
          />
        </Column>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {isUploading ? "Wait for upload to finish" : destinationHint}
        </Text>
      </Column>

      <Row gap="12" vertical="center">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || isUploading || !canSubmit}
          style={{
            background: canSubmit ? tokens.color.warm : undefined,
          }}
        >
          {getButtonLabel()}
        </Button>
      </Row>
    </Row>
  );
}
