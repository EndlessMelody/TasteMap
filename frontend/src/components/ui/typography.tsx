"use client";

import React, { HTMLAttributes } from "react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/cn";

type Tone = "default" | "muted" | "subtle" | "inverse";

const TONE_COLOR: Record<Tone, string> = {
  default: tokens.color.text,
  muted: tokens.color.textMuted,
  subtle: tokens.color.textSubtle,
  inverse: tokens.color.textInverse,
};

interface TextElementProps extends HTMLAttributes<HTMLElement> {
  tone?: Tone;
  align?: "left" | "center" | "right";
  as?: React.ElementType;
}

function makeTextComponent(
  defaultTag: React.ElementType,
  baseStyle: React.CSSProperties,
  baseClass?: string,
) {
  return function TextComponent({
    tone = "default",
    align,
    as,
    className,
    style,
    children,
    ...props
  }: TextElementProps) {
    const Tag = (as ?? defaultTag) as React.ElementType;
    return React.createElement(
      Tag,
      {
        ...props,
        className: cn("font-sans m-0", baseClass, className),
        style: {
          ...baseStyle,
          color: TONE_COLOR[tone],
          textAlign: align,
          ...style,
        },
      },
      children,
    );
  };
}

export const Display = makeTextComponent("h1", {
  fontSize: tokens.type.size.display,
  fontWeight: tokens.type.weight.bold,
  letterSpacing: tokens.type.tracking.tight,
  lineHeight: 1.1,
});

export const H1 = makeTextComponent("h1", {
  fontSize: tokens.type.size.h1,
  fontWeight: tokens.type.weight.bold,
  letterSpacing: tokens.type.tracking.tight,
  lineHeight: 1.2,
});

export const H2 = makeTextComponent("h2", {
  fontSize: tokens.type.size.h2,
  fontWeight: tokens.type.weight.semibold,
  letterSpacing: tokens.type.tracking.tight,
  lineHeight: 1.25,
});

export const H3 = makeTextComponent("h3", {
  fontSize: tokens.type.size.h3,
  fontWeight: tokens.type.weight.semibold,
  letterSpacing: tokens.type.tracking.normal,
  lineHeight: 1.35,
});

export const Body = makeTextComponent("p", {
  fontSize: tokens.type.size.body,
  fontWeight: tokens.type.weight.regular,
  letterSpacing: tokens.type.tracking.normal,
  lineHeight: 1.5,
});

export const BodySm = makeTextComponent("p", {
  fontSize: tokens.type.size.bodySm,
  fontWeight: tokens.type.weight.regular,
  letterSpacing: tokens.type.tracking.normal,
  lineHeight: 1.5,
});

export const Caption = makeTextComponent("span", {
  fontSize: tokens.type.size.caption,
  fontWeight: tokens.type.weight.semibold,
  letterSpacing: tokens.type.tracking.wide,
  lineHeight: 1.4,
  textTransform: "uppercase",
});

export const Eyebrow = Caption;
