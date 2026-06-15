"use client";

/**
 * OnceUI provider stack.
 *
 * Wraps the app with Once UI's Theme / Layout / Icon / Toast contexts so that
 * all `@once-ui-system/core` components (Column, Row, Heading, Button, …) and
 * the design tokens resolve correctly.
 *
 * The TasteMap-specific app providers (Auth, Language, UserVector, Chat, …)
 * are still mounted inside `DashboardLayout` for now; Phase 3 of the migration
 * lifts them up into this file so the app chrome can be split into route-group
 * layouts.
 *
 * Theme config mirrors the static `data-*` attributes set on <html> in
 * `app/layout.tsx` — keep them in sync to avoid a flash on first paint.
 */

import type { ReactNode } from "react";
import {
  ThemeProvider,
  LayoutProvider,
  IconProvider,
  ToastProvider,
} from "@once-ui-system/core";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      theme="light"
      brand="orange"
      accent="orange"
      neutral="sand"
      solid="contrast"
      solidStyle="flat"
      border="rounded"
      surface="filled"
      transition="all"
      scaling="100"
    >
      <LayoutProvider>
        <IconProvider>
          <ToastProvider>{children}</ToastProvider>
        </IconProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}

export default Providers;
