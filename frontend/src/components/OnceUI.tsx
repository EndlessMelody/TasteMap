"use client";

import React, { useState, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// ---- Helpers ----
const PADDING_MAP: Record<string, string> = {
  xl: "48px",
  l: "32px",
  m: "16px",
  s: "8px",
};
const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  "2xl": "var(--radius-2xl)",
  xl: "var(--radius-xl)",
  l: "var(--radius-l)",
  m: "var(--radius-m)",
  s: "var(--radius-s)",
};
const BG_MAP: Record<string, string> = {
  page: "var(--surface-page)",
  surface: "var(--surface-base)",
  overlay: "var(--surface-overlay)",
};

const BORDER_WIDTH = "1px";
const BORDER_STYLE = "solid";
const BORDER_COLOR = "var(--border-weak)";

function resolvePadding(v?: string) {
  if (!v) return undefined;
  return PADDING_MAP[v] ?? v;
}

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  fillWidth?: boolean;
  fillHeight?: boolean;
  fill?: boolean;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  horizontal?: "start" | "center" | "end" | "stretch";
  vertical?: "start" | "center" | "end" | "between";
  padding?: string;
  paddingX?: string;
  paddingY?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  gap?: number;
  background?: keyof typeof BG_MAP;
  onBackground?: string;
  radius?: keyof typeof RADIUS_MAP;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  border?: string;
  borderRight?: string;
  borderLeft?: string;
  borderBottom?: string;
  borderTop?: string;
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
}

// ---- Flex Container (Column) ----
export const Column = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      fillWidth,
      fillHeight,
      fill,
      align,
      justify,
      horizontal,
      vertical,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      gap,
      background,
      onBackground,
      radius,
      overflow,
      position,
      border,
      borderRight,
      borderLeft,
      borderBottom,
      borderTop,
      flex,
      flexGrow,
      flexShrink,
      flexBasis,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const computedStyle: React.CSSProperties = {
      ...(gap != null && { gap: `${gap}px` }),
      ...(padding && { padding: resolvePadding(padding) }),
      ...(paddingX && {
        paddingLeft: resolvePadding(paddingX),
        paddingRight: resolvePadding(paddingX),
      }),
      ...(paddingLeft && { paddingLeft: resolvePadding(paddingLeft) }),
      ...(paddingRight && { paddingRight: resolvePadding(paddingRight) }),
      ...((paddingTop || paddingY) && {
        paddingTop: resolvePadding(paddingTop) ?? resolvePadding(paddingY),
      }),
      ...((paddingBottom || paddingY) && {
        paddingBottom:
          resolvePadding(paddingBottom) ?? resolvePadding(paddingY),
      }),
      ...(background && { backgroundColor: BG_MAP[background] }),
      ...(radius && { borderRadius: RADIUS_MAP[radius] }),

      // Hyper-Longhand Borders
      borderTopWidth:
        border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderBottomWidth:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderLeftWidth:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderRightWidth:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,

      borderTopStyle:
        border === "neutral-alpha-weak" ||
        borderTop === "neutral-alpha-weak" ||
        borderBottom === "neutral-alpha-weak" ||
        borderLeft === "neutral-alpha-weak" ||
        borderRight === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderBottomStyle:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderLeftStyle:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderRightStyle:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,

      borderTopColor:
        border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderBottomColor:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderLeftColor:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderRightColor:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,

      ...(flex && { flex }),
      ...(flexGrow !== undefined && { flexGrow }),
      ...(flexShrink !== undefined && { flexShrink }),
      ...(flexBasis !== undefined && { flexBasis }),
      ...style,
    };

    const justifyVal = vertical ?? justify;
    const alignVal = horizontal ?? align;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          (fillWidth || fill) && "w-full",
          (fillHeight || fill) && "h-full",
          alignVal === "center" && "items-center",
          alignVal === "end" && "items-end",
          justifyVal === "center" && "justify-center",
          justifyVal === "end" && "justify-end",
          justifyVal === "between" && "justify-between",
          overflow === "hidden" && "overflow-hidden",
          position === "relative" && "relative",
          position === "sticky" && "sticky",
          position === "absolute" && "absolute",
          className,
        )}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Column.displayName = "Column";

// ---- Flex Container (Row) ----
export const Row = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      fillWidth,
      fillHeight,
      fill,
      align,
      justify,
      horizontal,
      vertical,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      gap,
      background,
      onBackground,
      radius,
      overflow,
      position,
      border,
      borderRight,
      borderLeft,
      borderBottom,
      borderTop,
      flex,
      flexGrow,
      flexShrink,
      flexBasis,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const justifyVal = horizontal ?? justify;
    const alignVal = vertical ?? align;

    const computedStyle: React.CSSProperties = {
      ...(gap != null && { gap: `${gap}px` }),
      ...(padding && { padding: resolvePadding(padding) }),
      ...(paddingX && {
        paddingLeft: resolvePadding(paddingX),
        paddingRight: resolvePadding(paddingX),
      }),
      ...(paddingLeft && { paddingLeft: resolvePadding(paddingLeft) }),
      ...(paddingRight && { paddingRight: resolvePadding(paddingRight) }),
      ...((paddingTop || paddingY) && {
        paddingTop: resolvePadding(paddingTop) ?? resolvePadding(paddingY),
      }),
      ...((paddingBottom || paddingY) && {
        paddingBottom:
          resolvePadding(paddingBottom) ?? resolvePadding(paddingY),
      }),
      ...(background && { backgroundColor: BG_MAP[background] }),
      ...(radius && { borderRadius: RADIUS_MAP[radius] }),

      // Hyper-Longhand Borders
      borderTopWidth:
        border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderBottomWidth:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderLeftWidth:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,
      borderRightWidth:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_WIDTH
          : undefined,

      borderTopStyle:
        border === "neutral-alpha-weak" ||
        borderTop === "neutral-alpha-weak" ||
        borderBottom === "neutral-alpha-weak" ||
        borderLeft === "neutral-alpha-weak" ||
        borderRight === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderBottomStyle:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderLeftStyle:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,
      borderRightStyle:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_STYLE
          : undefined,

      borderTopColor:
        border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderBottomColor:
        border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderLeftColor:
        border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,
      borderRightColor:
        border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak"
          ? BORDER_COLOR
          : undefined,

      ...(flex && { flex }),
      ...(flexGrow !== undefined && { flexGrow }),
      ...(flexShrink !== undefined && { flexShrink }),
      ...(flexBasis !== undefined && { flexBasis }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-row",
          (fillWidth || fill) && "w-full",
          (fillHeight || fill) && "h-full",
          alignVal === "center" && "items-center",
          alignVal === "end" && "items-end",
          justifyVal === "center" && "justify-center",
          justifyVal === "end" && "justify-end",
          justifyVal === "between" && "justify-between",
          overflow === "hidden" && "overflow-hidden",
          position === "relative" && "relative",
          position === "sticky" && "sticky",
          className,
        )}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Row.displayName = "Row";

export const Flex = Row;


interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: string;
  gap?: number;
  padding?: string;
  background?: keyof typeof BG_MAP;
}

// ---- Grid ----
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { columns, gap, padding, background, className, style, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: columns ?? "1fr",
        gap: gap ? `${gap}px` : undefined,
        padding: resolvePadding(padding),
        backgroundColor: background ? BG_MAP[background] : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
Grid.displayName = "Grid";

// ---- Typography ----
const HEADING_SIZE: Record<string, string> = {
  "display-strong-xl": "4rem",
  "display-strong-l": "3.5rem",
  "display-strong-m": "2.5rem",
  "display-strong-s": "2rem",
  "display-strong-xs": "1.75rem",
  "display-default-xs": "1.5rem",
  "heading-strong-xl": "2rem",
  "heading-strong-l": "1.5rem",
  "heading-strong-m": "1.25rem",
  "heading-strong-s": "1rem",
  "heading-strong-xs": "0.875rem",
};

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  variant?: keyof typeof HEADING_SIZE;
  align?: "left" | "center" | "right" | "justify";
}

export const Heading = ({
  variant,
  align,
  className,
  style,
  children,
  ...props
}: HeadingProps) => (
  <h2
    className={cn("font-sans m-0 font-bold leading-tight", className)}
    style={{
      fontSize: variant ? HEADING_SIZE[variant] : "1.25rem",
      lineHeight: 1.2,
      textAlign: align,
      ...style,
    }}
    {...props}
  >
    {children}
  </h2>
);

const TEXT_SIZE: Record<string, string> = {
  "body-default-xl": "1.125rem",
  "body-default-l": "1rem",
  "body-default-m": "0.9375rem",
  "body-default-s": "0.875rem",
  "body-default-xs": "0.75rem",
};

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: keyof typeof TEXT_SIZE;
  align?: "left" | "center" | "right" | "justify";
  onBackground?: string;
}

export const Text = ({
  variant,
  align,
  onBackground,
  className,
  style,
  children,
  ...props
}: TextProps) => (
  <p
    className={cn("font-sans m-0 leading-relaxed", className)}
    style={{
      fontSize: variant ? TEXT_SIZE[variant] : "0.9375rem",
      textAlign: align,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "s" | "m" | "l";
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  fillWidth?: boolean;
}

// ---- Button ----
export const Button = ({
  size,
  variant,
  fillWidth,
  onClick,
  disabled,
  className,
  style,
  children,
  ...props
}: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "font-sans font-semibold cursor-pointer transition-all duration-[var(--duration-fast)]",
      "rounded-full",
      size === "l"
        ? "px-7 py-[14px] text-[0.95rem]"
        : size === "s"
          ? "px-4 py-2 text-[0.8rem]"
          : "px-5 py-[10px] text-[0.875rem]",
      variant === "secondary"
        ? "bg-[#FFF0E6] text-[#ff6b35] hover:bg-[#FFE0CC]"
        : variant === "tertiary"
          ? "bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA]"
          : variant === "danger"
            ? "bg-[#FFF0F0] text-[#ff4757] hover:bg-[#FFE5E5]"
            : "bg-[#ff6b35] text-[#FFFFFF] hover:bg-[#e65721]",
      disabled &&
        "bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed hover:bg-[#E5E5EA]",
      fillWidth && "w-full",
      className,
    )}
    style={style}
    {...props}
  >
    {children}
  </button>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "s" | "m" | "l";
  tooltip?: string;
}

// ---- IconButton ----
export const IconButton = ({
  icon,
  variant,
  size,
  onClick,
  disabled,
  className,
  style,
  tooltip,
  ...props
}: IconButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={cn(
      "flex items-center justify-center p-0 cursor-pointer transition-all duration-[var(--duration-fast)]",
      "rounded-full",
      size === "l" ? "w-12 h-12" : size === "s" ? "w-7 h-7" : "w-9 h-9",
      variant === "secondary"
        ? "bg-[#FFF0E6] text-[#ff6b35] hover:bg-[#FFE0CC]"
        : variant === "tertiary"
          ? "bg-transparent text-[#8E8E93] hover:bg-[#F2F2F7]"
          : variant === "danger"
            ? "bg-[#FFF0F0] text-[#ff4757] hover:bg-[#FFE5E5]"
            : "bg-[#ff6b35] text-[#FFFFFF] hover:bg-[#e65721]",
      disabled &&
        "bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed hover:bg-[#E5E5EA]",
      className,
    )}
    style={style}
    {...props}
  >
    {icon}
  </button>
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

// ---- Input ----
export const Input = ({ placeholder, className, style, ...props }: InputProps) => (
  <input
    placeholder={placeholder}
    className={cn(
      "font-sans w-full text-[0.875rem] text-[#1C1C1E] outline-none",
      "px-4 py-3 rounded-[16px]",
      "bg-[#F2F2F7] border border-[#E5E5EA]",
      "placeholder:text-[#8E8E93] transition-colors duration-[var(--duration-fast)]",
      "focus:border-[#ff6b35] focus:bg-[#FFFFFF]",
      className,
    )}
    style={style}
    {...props}
  />
);

// ---- Avatar ----
const AVATAR_SIZE: Record<string, string> = {
  xl: "64px",
  l: "48px",
  m: "36px",
  s: "28px",
  xs: "20px",
};

const AVATAR_COLORS = [
  "#ff6b35",
  "#ff4757",
  "#ffd700",
  "#ff8c42",
  "#ff6348",
  "#ffa502",
  "#ff7f50",
  "#ff6b81",
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: keyof typeof AVATAR_SIZE;
  name?: string;
  src?: string;
}

export const Avatar = ({
  size = "m",
  src,
  name,
  className,
  style,
  ...props
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const dim = AVATAR_SIZE[size] ?? "36px";
  const showFallback = !src || imgError;

  if (showFallback) {
    const bg = colorFromName(name ?? "");
    const fontSize = `calc(${dim} * 0.38)`;
    return (
      <div
        className={cn(
          "rounded-full shrink-0 flex items-center justify-center select-none",
          className,
        )}
        style={{
          width: dim,
          height: dim,
          backgroundColor: bg,
          flexShrink: 0,
          ...style,
        }}
        {...(props as any)}
      >
        <span
          style={{ fontSize, fontWeight: 700, color: "white", lineHeight: 1 }}
        >
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? ""}
      onError={() => setImgError(true)}
      className={cn("rounded-full object-cover shrink-0", className)}
      style={{ width: dim, height: dim, ...style }}
      {...props}
    />
  );
};
