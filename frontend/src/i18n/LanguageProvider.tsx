"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { DEFAULT_LANG, LANG_KEY, LOCALES, isLang, type Lang } from "./config";
import en from "./messages/en";
import vi from "./messages/vi";
import zh from "./messages/zh";
import ja from "./messages/ja";

type MessageTree = { [key: string]: string | MessageTree };

const MESSAGES: Record<Lang, MessageTree> = {
  en: en as MessageTree,
  vi: vi as MessageTree,
  zh: zh as MessageTree,
  ja: ja as MessageTree,
};

/** Resolve a dotted key (e.g. "settings.title") against a message tree. */
function resolve(tree: MessageTree, key: string): string | undefined {
  let node: string | MessageTree | undefined = tree;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Replace {token} placeholders from the vars map. */
function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export type TFunction = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFunction;
  locales: typeof LOCALES;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (k) => k,
  locales: LOCALES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Deterministic default on both server and first client render to avoid a
  // hydration mismatch. The persisted choice is applied in useEffect below.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (isLang(stored) && stored !== lang) {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable — keep default.
    }
    // Only run on mount; intentional one-time hydration of the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore persistence failures
    }
  }, []);

  const t = useCallback<TFunction>(
    (key, vars) => {
      const hit =
        resolve(MESSAGES[lang], key) ??
        resolve(MESSAGES[DEFAULT_LANG], key) ??
        key;
      return interpolate(hit, vars);
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, locales: LOCALES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
