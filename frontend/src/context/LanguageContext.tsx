"use client";

import React, { createContext, useContext, useState } from "react";

export type Lang = "vi" | "en";

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  vi: {
    // Navigation
    discover: "Khám phá",
    myMap: "Bản đồ của tôi",
    tourBuilder: "Lên kế hoạch",
    profile: "Hồ sơ",
    settings: "Cài đặt",
    logout: "Đăng xuất",
    foodies: "Bạn bè",
    explore: "Khám phá",
    aiPlanner: "AI Planner",
    // Settings
    settingsTitle: "Cài đặt",
    appearance: "Giao diện",
    language: "Ngôn ngữ",
    notifications: "Thông báo",
    support: "Trợ giúp",
    about: "Thông tin",
    appearanceTitle: "Giao diện (Appearance)",
    appearanceSubtitle: "Chọn theme hiển thị cho ứng dụng",
    languageTitle: "Ngôn ngữ (Language)",
    languageSubtitle: "Chọn ngôn ngữ hiển thị",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeSystem: "Hệ thống",
    accentColor: "Màu nhấn",
    supportTitle: "Trợ giúp & Hỗ trợ",
    supportBody: "Bạn cần hỗ trợ? Đội ngũ TasteMap luôn sẵn sàng giúp đỡ bạn 24/7.",
    contactSupport: "Liên hệ hỗ trợ",
  },
  en: {
    // Navigation
    discover: "Discover",
    myMap: "My Map",
    tourBuilder: "Tour Builder",
    profile: "Profile",
    settings: "Settings",
    logout: "Sign Out",
    foodies: "Friends",
    explore: "Explore",
    aiPlanner: "AI Planner",
    // Settings
    settingsTitle: "Settings",
    appearance: "Appearance",
    language: "Language",
    notifications: "Notifications",
    support: "Support",
    about: "About",
    appearanceTitle: "Appearance",
    appearanceSubtitle: "Choose how TasteMap looks on your device",
    languageTitle: "Language",
    languageSubtitle: "Choose your display language",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    accentColor: "Accent Color",
    supportTitle: "Help & Support",
    supportBody: "Need help? The TasteMap team is always ready to assist you 24/7.",
    contactSupport: "Contact Support",
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "vi",
  setLang: () => {},
  t: (k) => k,
});

const LANG_KEY = "tastemap_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "vi";
    return (localStorage.getItem(LANG_KEY) as Lang) ?? "vi";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  const t = (key: string): string =>
    TRANSLATIONS[lang][key] ?? TRANSLATIONS["vi"][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
