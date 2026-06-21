"use client";

import React, { ComponentPropsWithoutRef, ElementType } from "react";
import { Heading, Text } from "@once-ui-system/core";

// The real Heading/Text components are generic over `as`, which TS cannot
// infer through this wrapper's fixed prop shape. Loosen to a prop-bag type
// so callers keep full intellisense on our own TextElementProps below.
const HeadingAny = Heading as unknown as React.ComponentType<Record<string, unknown>>;
const TextAny = Text as unknown as React.ComponentType<Record<string, unknown>>;

type Tone = "default" | "muted" | "subtle" | "inverse";

const TONE_ON_BACKGROUND: Record<Tone, "neutral-strong" | "neutral-medium" | "neutral-weak"> = {
  default: "neutral-strong",
  muted: "neutral-medium",
  subtle: "neutral-weak",
  inverse: "neutral-strong",
};

interface TextElementProps extends Omit<ComponentPropsWithoutRef<"span">, "color"> {
  tone?: Tone;
  align?: "left" | "center" | "right";
  as?: ElementType;
}

function withTone(tone: Tone, style?: React.CSSProperties): React.CSSProperties | undefined {
  return tone === "inverse" ? { color: "var(--neutral-on-solid-strong)", ...style } : style;
}

function makeHeading(variant: string, defaultAs: ElementType) {
  return function HeadingComponent({ tone = "default", align, as, style, ...props }: TextElementProps) {
    return (
      <HeadingAny
        as={as ?? defaultAs}
        variant={variant}
        onBackground={TONE_ON_BACKGROUND[tone]}
        align={align}
        style={withTone(tone, style)}
        {...props}
      />
    );
  };
}

function makeText(variant: string, defaultAs: ElementType, extraStyle?: React.CSSProperties) {
  return function TextComponent({ tone = "default", align, as, style, ...props }: TextElementProps) {
    return (
      <TextAny
        as={as ?? defaultAs}
        variant={variant}
        onBackground={TONE_ON_BACKGROUND[tone]}
        align={align}
        style={{ ...extraStyle, ...withTone(tone, style) }}
        {...props}
      />
    );
  };
}

export const Display = makeHeading("display-strong-xl", "h1");
export const H1 = makeHeading("display-strong-l", "h1");
export const H2 = makeHeading("display-strong-m", "h2");
export const H3 = makeHeading("display-strong-s", "h3");

export const Body = makeText("body-default-m", "p");
export const BodySm = makeText("body-default-s", "p");

const CAPTION_STYLE: React.CSSProperties = { textTransform: "uppercase", letterSpacing: "0.06em" };
export const Caption = makeText("label-default-s", "span", CAPTION_STYLE);
export const Eyebrow = Caption;
