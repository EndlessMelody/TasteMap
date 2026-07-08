"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/**
 * Accent (brand/main color) selection.
 *
 * Values map to Once UI named color schemes so the whole app recolors via the
 * `data-brand` / `data-accent` attributes on <html> — these auto-derive
 * solid/on-solid/alpha variants and flip correctly across light/dark.
 *
 * Mirrors ThemeContext, but initializes deterministically (no localStorage in
 * the useState initializer) and hydrates the stored value in useEffect to avoid
 * an SSR hydration mismatch.
 */
export type Accent = "orange" | "red" | "violet" | "yellow" | "green";

export const ACCENTS: readonly Accent[] = [
  "orange",
  "red",
  "violet",
  "yellow",
  "green",
] as const;

const DEFAULT_ACCENT: Accent = "orange";
const STORAGE_KEY = "tastemap_accent";

function isAccent(value: unknown): value is Accent {
  return ACCENTS.includes(value as Accent);
}

interface AccentContextValue {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
});

function applyAccent(accent: Accent) {
  const root = document.documentElement;
  root.setAttribute("data-brand", accent);
  root.setAttribute("data-accent", accent);
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);

  // Hydrate the persisted accent after mount (deterministic SSR default above).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isAccent(stored) && stored !== accent) {
        setAccentState(stored);
      }
    } catch {
      // localStorage unavailable — keep default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect the active accent onto <html> whenever it changes.
  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setAccent = useCallback((a: Accent) => {
    setAccentState(a);
    try {
      localStorage.setItem(STORAGE_KEY, a);
    } catch {
      // ignore persistence failures
    }
  }, []);

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export const useAccent = () => useContext(AccentContext);
