"use client";

import React, { HTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";
import { H1, Body, Eyebrow } from "./typography";
import { IconButton } from "./Button";

interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Show a back button that calls `router.back()` (or a custom handler). */
  back?: boolean | (() => void);
  /** Right-side actions slot. */
  actions?: ReactNode;
  /** Sticky to the top of the scroll container. */
  sticky?: boolean;
}

/**
 * <PageHeader>
 * Replaces every bespoke per-page header. Title + optional back-button + actions.
 */
export const PageHeader = ({
  title,
  eyebrow,
  description,
  back,
  actions,
  sticky,
  className,
  style,
  ...props
}: PageHeaderProps) => {
  const router = useRouter();
  const handleBack = () => {
    if (typeof back === "function") back();
    else router.back();
  };

  return (
    <header
      className={cn("ui-page-header", className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space[4],
        paddingTop: tokens.space[4],
        paddingBottom: tokens.space[5],
        marginBottom: tokens.space[6],
        borderBottom: `1px solid ${tokens.color.border}`,
        ...(sticky && {
          position: "sticky",
          top: 0,
          zIndex: tokens.z.sticky,
          background: tokens.color.bg,
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
        }),
        ...style,
      }}
      {...props}
    >
      {back && (
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Go back"
          onClick={handleBack}
          icon={<ChevronLeft size={20} strokeWidth={1.75} />}
        />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: tokens.space[1] }}>
        {eyebrow && <Eyebrow tone="muted">{eyebrow}</Eyebrow>}
        <H1>{title}</H1>
        {description && <Body tone="muted">{description}</Body>}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space[2] }}>
          {actions}
        </div>
      )}
    </header>
  );
};
