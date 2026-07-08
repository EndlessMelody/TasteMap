/**
 * Compatibility shim.
 *
 * The i18n implementation moved to `src/i18n/`. This re-export keeps existing
 * `@/context/LanguageContext` imports working during the phased translation
 * migration. Prefer importing from `@/i18n` in new code.
 */
export {
  LanguageProvider,
  useLanguage,
  type Lang,
  type TFunction,
  LOCALES,
  DEFAULT_LANG,
  LANG_KEY,
} from "@/i18n";
