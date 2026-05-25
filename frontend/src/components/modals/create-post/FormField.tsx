"use client";

import React from "react";
import { Column, Row, Text } from "@/components/OnceUI";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  children,
  optional = false,
  hint,
  error,
  rightElement,
}: FormFieldProps) {
  return (
    <Column gap="8" fillWidth>
      <Row fillWidth horizontal="space-between" vertical="center">
        <Text variant="label-default-s" onBackground="neutral-medium">
          {label}
          {optional && (
            <Text as="span" variant="body-default-xs" onBackground="neutral-weak">
              {" "}(optional)
            </Text>
          )}
        </Text>
        {rightElement}
      </Row>
      {children}
      {hint && !error && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {hint}
        </Text>
      )}
      {error && (
        <Text variant="body-default-xs" style={{ color: "#e53935" }}>
          {error}
        </Text>
      )}
    </Column>
  );
}
