import React from "react";
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

// ---- Flex Container (Column) ----
export const Column = React.forwardRef<HTMLDivElement, any>(
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
      gap: gap != null ? `${gap}px` : undefined,
      padding: resolvePadding(padding),
      paddingLeft: resolvePadding(paddingX),
      paddingRight: resolvePadding(paddingX),
      paddingTop: resolvePadding(paddingTop) ?? resolvePadding(paddingY),
      paddingBottom: resolvePadding(paddingBottom) ?? resolvePadding(paddingY),
      backgroundColor: background ? BG_MAP[background] : undefined,
      borderRadius: radius ? RADIUS_MAP[radius] : undefined,
      
      // Hyper-Longhand Borders
      borderTopWidth: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderBottomWidth: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderLeftWidth: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderRightWidth: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      
      borderTopStyle: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderBottomStyle: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderLeftStyle: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderRightStyle: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      
      borderTopColor: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderBottomColor: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderLeftColor: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderRightColor: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      
      flex: flex,
      flexGrow: flexGrow,
      flexShrink: flexShrink,
      flexBasis: flexBasis,
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
export const Row = React.forwardRef<HTMLDivElement, any>(
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
      gap: gap != null ? `${gap}px` : undefined,
      padding: resolvePadding(padding),
      paddingLeft: resolvePadding(paddingX),
      paddingRight: resolvePadding(paddingX),
      paddingTop: resolvePadding(paddingTop) ?? resolvePadding(paddingY),
      paddingBottom: resolvePadding(paddingBottom) ?? resolvePadding(paddingY),
      backgroundColor: background ? BG_MAP[background] : undefined,
      borderRadius: radius ? RADIUS_MAP[radius] : undefined,
      
      // Hyper-Longhand Borders
      borderTopWidth: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderBottomWidth: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderLeftWidth: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      borderRightWidth: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_WIDTH : undefined,
      
      borderTopStyle: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderBottomStyle: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderLeftStyle: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      borderRightStyle: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_STYLE : undefined,
      
      borderTopColor: (border === "neutral-alpha-weak" || borderTop === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderBottomColor: (border === "neutral-alpha-weak" || borderBottom === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderLeftColor: (border === "neutral-alpha-weak" || borderLeft === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      borderRightColor: (border === "neutral-alpha-weak" || borderRight === "neutral-alpha-weak") ? BORDER_COLOR : undefined,
      
      flex: flex,
      flexGrow: flexGrow,
      flexShrink: flexShrink,
      flexBasis: flexBasis,
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

// ---- Grid ----
export const Grid = React.forwardRef<HTMLDivElement, any>(
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

export const Heading = ({
  variant,
  align,
  className,
  style,
  children,
  ...props
}: any) => (
  <h2
    className={cn("font-sans m-0 font-bold leading-tight", className)}
    style={{
      fontSize: HEADING_SIZE[variant] ?? "1.25rem",
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

export const Text = ({
  variant,
  align,
  onBackground,
  className,
  style,
  children,
  ...props
}: any) => (
  <p
    className={cn("font-sans m-0 leading-relaxed", className)}
    style={{ 
      fontSize: TEXT_SIZE[variant] ?? "0.9375rem", 
      textAlign: align, 
      ...style 
    }}
    {...props}
  >
    {children}
  </p>
);

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
}: any) => (
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
        ? "bg-[#EAF2FF] text-[#007AFF] hover:bg-[#D6E6FF]"
        : variant === "tertiary"
          ? "bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA]"
          : variant === "danger"
            ? "bg-[#FFF0F0] text-[#FF3B30] hover:bg-[#FFE5E5]"
            : "bg-[#007AFF] text-[#FFFFFF] hover:bg-[#0062CC]",
      disabled && "bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed hover:bg-[#E5E5EA]",
      fillWidth && "w-full",
      className,
    )}
    style={style}
    {...props}
  >
    {children}
  </button>
);

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
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={cn(
      "flex items-center justify-center p-0 cursor-pointer transition-all duration-[var(--duration-fast)]",
      "rounded-full",
      size === "l" ? "w-12 h-12" : size === "s" ? "w-7 h-7" : "w-9 h-9",
      variant === "secondary"
        ? "bg-[#EAF2FF] text-[#007AFF] hover:bg-[#D6E6FF]"
        : variant === "tertiary"
          ? "bg-transparent text-[#8E8E93] hover:bg-[#F2F2F7]"
          : variant === "danger"
            ? "bg-[#FFF0F0] text-[#FF3B30] hover:bg-[#FFE5E5]"
            : "bg-[#007AFF] text-[#FFFFFF] hover:bg-[#0062CC]",
      disabled && "bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed hover:bg-[#E5E5EA]",
      className,
    )}
    style={style}
    {...props}
  >
    {icon}
  </button>
);

// ---- Input ----
export const Input = ({ placeholder, className, style, ...props }: any) => (
  <input
    placeholder={placeholder}
    className={cn(
      "font-sans w-full text-[0.875rem] text-[#1C1C1E] outline-none",
      "px-4 py-3 rounded-[16px]",
      "bg-[#F2F2F7] border border-[#E5E5EA]",
      "placeholder:text-[#8E8E93] transition-colors duration-[var(--duration-fast)]",
      "focus:border-[#007AFF] focus:bg-[#FFFFFF]",
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

export const Avatar = ({
  size = "m",
  src,
  className,
  style,
  ...props
}: any) => {
  const dim = AVATAR_SIZE[size] ?? "36px";
  return (
    <img
      src={src}
      alt=""
      className={cn("rounded-full object-cover shrink-0", className)}
      style={{ width: dim, height: dim, ...style }}
      {...props}
    />
  );
};
