import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  IconButton,
  Button,
} from "@once-ui-system/core";
import {
  X,
  Palette,
  Globe,
  BellRing,
  LifeBuoy,
  Info,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { tokens } from "@/styles/tokens";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { useAccent, type Accent } from "@/context/AccentContext";
import { useLanguage } from "@/context/LanguageContext";

// Accent options map Once UI named schemes to the dot color shown in the picker.
const ACCENT_SWATCHES: { id: Accent; swatch: string }[] = [
  { id: "orange", swatch: "#ff6b35" },
  { id: "red", swatch: "#ED1B24" },
  { id: "violet", swatch: "#A855F7" },
  { id: "yellow", swatch: "#FBBF24" },
  { id: "green", swatch: "#34C759" },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "appearance",
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState(initialTab);
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const { lang, setLang, t, locales } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{
              width: "900px",
              maxWidth: "95vw",
              height: "600px",
              maxHeight: "90vh",
              backgroundColor: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: "32px",
              overflow: "hidden",
              boxShadow: tokens.shadow.lg,
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Left Sidebar Tabs */}
            <Column
              style={{
                width: "240px",
                minWidth: "240px",
                backgroundColor: tokens.color.bg,
                borderRight: `1px solid ${tokens.color.border}`,
                padding: "20px 12px",
                gap: "4px",
              }}
            >
              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 8px 16px",
                  borderBottom: `1px solid ${tokens.color.border}`,
                  marginBottom: "8px",
                }}
              >
                <Heading
                  variant="heading-strong-s"
                  style={{ color: tokens.color.text }}
                >
                  {t("settings.title")}
                </Heading>
                <IconButton
                  onClick={onClose}
                  style={{
                    backgroundColor: tokens.color.surfaceMuted,
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} color={tokens.color.textMuted} />
                </IconButton>
              </Row>

              {[
                {
                  id: "appearance",
                  labelKey: "settings.appearance",
                  icon: <Palette size={16} />,
                },
                {
                  id: "language",
                  labelKey: "settings.language",
                  icon: <Globe size={16} />,
                },
                {
                  id: "notifications",
                  labelKey: "settings.notifications",
                  icon: <BellRing size={16} />,
                },
              ].map((tab) => (
                <Row
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  style={{
                    padding: "10px 12px",
                    gap: "12px",
                    alignItems: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor:
                      activeSettingsTab === tab.id
                        ? "rgba(255,107,53,0.1)"
                        : "transparent",
                    color: activeSettingsTab === tab.id ? tokens.color.warm : tokens.color.textMuted,
                    transition: "all 0.15s",
                  }}
                >
                  <Row style={{ display: "flex", color: "inherit" }}>
                    {tab.icon}
                  </Row>
                  <Text
                    style={{
                      color: "inherit",
                      fontWeight: activeSettingsTab === tab.id ? 600 : 400,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t(tab.labelKey)}
                  </Text>
                </Row>
              ))}

              <Column
                style={{
                  height: "1px",
                  backgroundColor: tokens.color.border,
                  margin: "8px 0",
                }}
              />

              {[
                {
                  id: "support",
                  labelKey: "settings.support",
                  icon: <LifeBuoy size={16} />,
                },
                { id: "about", labelKey: "settings.about", icon: <Info size={16} /> },
              ].map((tab) => (
                <Row
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  style={{
                    padding: "10px 12px",
                    gap: "12px",
                    alignItems: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor:
                      activeSettingsTab === tab.id
                        ? "rgba(255,107,53,0.1)"
                        : "transparent",
                    color: activeSettingsTab === tab.id ? tokens.color.warm : tokens.color.textMuted,
                    transition: "all 0.15s",
                  }}
                >
                  <Row style={{ display: "flex", color: "inherit" }}>
                    {tab.icon}
                  </Row>
                  <Text
                    style={{
                      color: "inherit",
                      fontWeight: activeSettingsTab === tab.id ? 600 : 400,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t(tab.labelKey)}
                  </Text>
                </Row>
              ))}

              <Column style={{ flex: 1 }} />
              <Text
                style={{
                  color: tokens.color.border,
                  fontSize: "0.65rem",
                  padding: "0 8px",
                }}
              >
                TasteMap v1.0.0-beta
              </Text>
            </Column>

            {/* Right Content Area */}
            <Column
              style={{
                flex: 1,
                padding: "32px 40px",
                overflowY: "auto",
                gap: "24px",
              }}
            >
              {activeSettingsTab === "appearance" && (
                <>
                  <Column style={{ gap: "4px" }}>
                    <Heading
                      variant="heading-strong-m"
                      style={{ color: tokens.color.text }}
                    >
                      {t("settings.appearanceTitle")}
                    </Heading>
                    <Text style={{ color: tokens.color.textMuted, fontSize: "0.8rem" }}>
                      {t("settings.appearanceSubtitle")}
                    </Text>
                  </Column>

                  <Row style={{ gap: "16px" }}>
                    {[
                      {
                        id: "light" as Theme,
                        labelKey: "settings.themeLight",
                        icon: <Sun size={24} />,
                      },
                      {
                        id: "dark" as Theme,
                        labelKey: "settings.themeDark",
                        icon: <Moon size={24} />,
                      },
                      {
                        id: "system" as Theme,
                        labelKey: "settings.themeSystem",
                        icon: <Monitor size={24} />,
                      },
                    ].map((opt) => {
                      const active = theme === opt.id;
                      return (
                        <Column
                          key={opt.id}
                          onClick={() => setTheme(opt.id)}
                          style={{
                            flex: 1,
                            padding: "24px 16px",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: active
                              ? "rgba(255,107,53,0.08)"
                              : tokens.color.surface,
                            border: active
                              ? `2px solid ${tokens.color.warm}`
                              : `1px solid ${tokens.color.border}`,
                            borderRadius: "14px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                        >
                          {active && (
                            <Column
                              center
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: tokens.color.warm,
                              }}
                            >
                              <Check size={11} color={tokens.color.textInverse} strokeWidth={3} />
                            </Column>
                          )}
                          <Column style={{ color: active ? tokens.color.warm : tokens.color.textMuted }}>
                            {opt.icon}
                          </Column>
                          <Text
                            style={{
                              color: active ? tokens.color.warm : tokens.color.textMuted,
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {t(opt.labelKey)}
                          </Text>
                        </Column>
                      );
                    })}
                  </Row>

                  <Column style={{ gap: "12px", marginTop: "8px" }}>
                    <Text
                      style={{
                        color: tokens.color.textMuted,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {t("settings.accentColor")}
                    </Text>
                    <Row style={{ gap: "10px" }}>
                      {ACCENT_SWATCHES.map((s) => {
                        const selected = accent === s.id;
                        return (
                          <Column
                            key={s.id}
                            center
                            onClick={() => setAccent(s.id)}
                            role="button"
                            aria-label={t(`accent.${s.id}`)}
                            aria-pressed={selected}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: s.swatch,
                              border: selected
                                ? `3px solid ${tokens.color.text}`
                                : "2px solid transparent",
                              cursor: "pointer",
                              transition: "transform 0.15s",
                              boxShadow: selected ? `0 0 12px ${s.swatch}60` : "none",
                            }}
                          >
                            {selected && (
                              <Check size={14} color="#fff" strokeWidth={3} />
                            )}
                          </Column>
                        );
                      })}
                    </Row>
                  </Column>
                </>
              )}

              {activeSettingsTab === "language" && (
                <>
                  <Column style={{ gap: "4px" }}>
                    <Heading
                      variant="heading-strong-m"
                      style={{ color: tokens.color.text }}
                    >
                      {t("settings.languageTitle")}
                    </Heading>
                    <Text style={{ color: tokens.color.textMuted, fontSize: "0.8rem" }}>
                      {t("settings.languageSubtitle")}
                    </Text>
                  </Column>
                  <Column style={{ gap: "8px" }}>
                    {locales.map((l) => {
                      const active = lang === l.code;
                      return (
                        <Row
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          style={{
                            padding: "14px 16px",
                            gap: "14px",
                            alignItems: "center",
                            borderRadius: "12px",
                            cursor: "pointer",
                            backgroundColor: active
                              ? "rgba(255,107,53,0.06)"
                              : tokens.color.surface,
                            border: active
                              ? `1.5px solid ${tokens.color.warm}`
                              : `1px solid ${tokens.color.border}`,
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                            {l.flag}
                          </span>
                          <Text
                            style={{
                              color: active ? tokens.color.text : tokens.color.textMuted,
                              fontWeight: active ? 600 : 400,
                              fontSize: "0.9rem",
                              flex: 1,
                            }}
                          >
                            {l.label}
                          </Text>
                          {active && (
                            <Column
                              center
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: tokens.color.warm,
                              }}
                            >
                              <Check size={12} color={tokens.color.textInverse} strokeWidth={3} />
                            </Column>
                          )}
                        </Row>
                      );
                    })}
                  </Column>
                </>
              )}

              {activeSettingsTab === "support" && (
                <Column style={{ gap: "24px" }}>
                  <Heading
                    variant="heading-strong-m"
                    style={{ color: tokens.color.text }}
                  >
                    {t("settings.supportTitle")}
                  </Heading>
                  <Text
                    style={{
                      color: tokens.color.textMuted,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {t("settings.supportBody")}
                  </Text>
                  <Button variant="primary" style={{ borderRadius: "12px" }}>
                    {t("settings.contactSupport")}
                  </Button>
                </Column>
              )}
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
