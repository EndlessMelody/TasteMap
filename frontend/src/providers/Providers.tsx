"use client";

/**
 * OnceUI provider stack.
 *
 * Wraps the app with Once UI's Theme / Layout / Icon / Toast contexts so that
 * all `@once-ui-system/core` components (Column, Row, Heading, Button, …) and
 * the design tokens resolve correctly.
 *
 * The TasteMap-specific app providers (Auth, Language, UserVector, Chat, …)
 * are mounted here so the app chrome can be split into route-group layouts
 * (`app/(marketing)/layout.tsx` and `app/(app)/layout.tsx`).
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

// TasteMap app providers. `ThemeProvider` is aliased to avoid a clash with
// Once UI's ThemeProvider.
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthProvider as HooksAuthProvider } from "@/hooks/useAuth";
import { UserVectorProvider } from "@/context/UserVectorContext";
import { ChatProvider } from "@/context/ChatContext";

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
          <ToastProvider>
            <AppThemeProvider>
              <LanguageProvider>
                <AuthProvider>
                  <HooksAuthProvider>
                    <UserVectorProvider>
                      <ChatProvider>{children}</ChatProvider>
                    </UserVectorProvider>
                  </HooksAuthProvider>
                </AuthProvider>
              </LanguageProvider>
            </AppThemeProvider>
          </ToastProvider>
        </IconProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}

export default Providers;
