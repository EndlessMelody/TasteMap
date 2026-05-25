/**
 * TasteMap Concierge — UI Primitives
 * ─────────────────────────────────────────────────────────
 * Single import surface for the design system.
 *
 *   import { Page, Card, Button, H1, Body } from "@/components/ui";
 *
 * Rules live in src/styles/DESIGN.md.
 * All primitives consume tokens from src/styles/tokens.ts.
 * Pair with src/styles/ui.css for stateful (hover/focus) styling.
 */

// Layout shells
export { Page } from "./Page";
export { Section } from "./Section";
export { PageHeader } from "./PageHeader";

// Surfaces
export { Card } from "./Card";

// Typography
export {
  Display,
  H1,
  H2,
  H3,
  Body,
  BodySm,
  Caption,
  Eyebrow,
} from "./typography";

// Controls
export { Button, IconButton } from "./Button";
export type { ButtonVariant, ButtonSize } from "./Button";
export { Field } from "./Field";

// Indicators
export { Pill, Chip } from "./Pill";
export type { PillTone, PillSize } from "./Pill";
export { Avatar } from "./Avatar";
export type { AvatarSize } from "./Avatar";

// States
export { EmptyState } from "./EmptyState";
export { Skeleton } from "./Skeleton";
