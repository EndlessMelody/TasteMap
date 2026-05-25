"use client";

import React from "react";
import { Row, Column, Text, Button } from "@/components/OnceUI";
import { motion } from "framer-motion";

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

const BRAND = "#ff6b35";

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
      horizontal="space-between"
      vertical="center"
      padding="16 20"
      borderTop="neutral-alpha-weak"
      style={{
        background: "#FFFFFF",
        flexShrink: 0,
        minHeight: "80px",
      }}
    >
      <Column gap="6" style={{ flex: 1, maxWidth: "200px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="body-default-s" onBackground="neutral-medium">
            {isUploading ? "Uploading..." : "Completion"}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {Math.round(completionPercentage)}%
          </Text>
        </div>
        <div
          style={{
            height: "4px",
            background: "#E5E5EA",
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
              background: canSubmit ? BRAND : "#8E8E93",
              borderRadius: "2px",
            }}
          />
        </div>
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
            background: canSubmit ? BRAND : undefined,
          }}
        >
          {getButtonLabel()}
        </Button>
      </Row>
    </Row>
  );
}
