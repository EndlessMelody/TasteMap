/**
 * TasteMap i18n configuration.
 *
 * Supported locales and the constants used by the LanguageProvider.
 * Messages live in `./messages/{vi,en,zh,ja}.ts` as nested, namespaced objects
 * resolved by dotted keys (e.g. `t("nav.discover")`, `t("settings.appearance")`).
 */

export type Lang = "vi" | "en" | "zh" | "ja";

export interface LocaleMeta {
  code: Lang;
  label: string;
  flag: string;
}

/** Display order + metadata for the language selector. */
export const LOCALES: readonly LocaleMeta[] = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
] as const;

export const DEFAULT_LANG: Lang = "vi";

export const LANG_KEY = "tastemap_lang";

export function isLang(value: unknown): value is Lang {
  return LOCALES.some((l) => l.code === value);
}
