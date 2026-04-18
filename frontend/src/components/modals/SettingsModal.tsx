import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  IconButton,
  Button,
} from "@/components/OnceUI";
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
import { useTheme, type Theme } from "@/context/ThemeContext";
import { useLanguage, type Lang } from "@/context/LanguageContext";

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
  const { lang, setLang, t } = useLanguage();

  // Theme-aware colors for the modal itself
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const modalBg = isDark ? "#2C2C2E" : "#F2F2F7";
  const sidebarBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#E5E5EA";
  const textPrimary = isDark ? "#F2F2F7" : "#1C1C1E";
  const textMuted = isDark ? "#636366" : "#AEAEB2";
  const cardBg = isDark ? "#3A3A3C" : "#FFFFFF";

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
              backgroundColor: modalBg,
              border: `1px solid ${border}`,
              borderRadius: "32px",
              overflow: "hidden",
              boxShadow: isDark
                ? "0 32px 80px rgba(0,0,0,0.5)"
                : "0 32px 80px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Left Sidebar Tabs */}
            <Column
              style={{
                width: "240px",
                minWidth: "240px",
                backgroundColor: sidebarBg,
                borderRight: `1px solid ${border}`,
                padding: "20px 12px",
                gap: "4px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Row
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 8px 16px",
                  borderBottom: `1px solid ${border}`,
                  marginBottom: "8px",
                }}
              >
                <Heading
                  variant="heading-strong-s"
                  style={{ color: textPrimary }}
                >
                  {t("settingsTitle")}
                </Heading>
                <IconButton
                  icon={<X size={16} color={textMuted} />}
                  onClick={onClose}
                  style={{
                    backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                  }}
                />
              </Row>

              {[
                {
                  id: "appearance",
                  labelKey: "appearance",
                  icon: <Palette size={16} />,
                },
                {
                  id: "language",
                  labelKey: "language",
                  icon: <Globe size={16} />,
                },
                {
                  id: "notifications",
                  labelKey: "notifications",
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
                    color: activeSettingsTab === tab.id ? "#ff6b35" : textMuted,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", color: "inherit" }}>
                    {tab.icon}
                  </div>
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

              <div
                style={{
                  height: "1px",
                  backgroundColor: border,
                  margin: "8px 0",
                }}
              />

              {[
                {
                  id: "support",
                  labelKey: "support",
                  icon: <LifeBuoy size={16} />,
                },
                { id: "about", labelKey: "about", icon: <Info size={16} /> },
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
                    color: activeSettingsTab === tab.id ? "#ff6b35" : textMuted,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", color: "inherit" }}>
                    {tab.icon}
                  </div>
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

              <div style={{ flex: 1 }} />
              <Text
                style={{
                  color: isDark ? "#48484A" : "#D1D1D6",
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
                      style={{ color: textPrimary }}
                    >
                      {t("appearanceTitle")}
                    </Heading>
                    <Text style={{ color: textMuted, fontSize: "0.8rem" }}>
                      {t("appearanceSubtitle")}
                    </Text>
                  </Column>

                  <Row style={{ gap: "16px" }}>
                    {[
                      {
                        id: "light" as Theme,
                        labelKey: "themeLight",
                        icon: <Sun size={24} />,
                      },
                      {
                        id: "dark" as Theme,
                        labelKey: "themeDark",
                        icon: <Moon size={24} />,
                      },
                      {
                        id: "system" as Theme,
                        labelKey: "themeSystem",
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
                              : cardBg,
                            border: active
                              ? "2px solid #ff6b35"
                              : `1px solid ${border}`,
                            borderRadius: "14px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                        >
                          {active && (
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                backgroundColor: "#ff6b35",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={11} color="white" strokeWidth={3} />
                            </div>
                          )}
                          <div
                            style={{ color: active ? "#ff6b35" : textMuted }}
                          >
                            {opt.icon}
                          </div>
                          <Text
                            style={{
                              color: active ? "#ff6b35" : textMuted,
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
                        color: textMuted,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {t("accentColor")}
                    </Text>
                    <Row style={{ gap: "10px" }}>
                      {[
                        "#ED1B24",
                        "#ff6b35",
                        "#A855F7",
                        "#FBBF24",
                        "#34C759",
                        "#F97316",
                      ].map((c) => (
                        <div
                          key={c}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: c,
                            border:
                              c === "#ff6b35"
                                ? "3px solid white"
                                : "2px solid transparent",
                            cursor: "pointer",
                            transition: "transform 0.15s",
                            boxShadow:
                              c === "#ff6b35" ? `0 0 12px ${c}60` : "none",
                          }}
                        />
                      ))}
                    </Row>
                  </Column>
                </>
              )}

              {activeSettingsTab === "language" && (
                <>
                  <Column style={{ gap: "4px" }}>
                    <Heading
                      variant="heading-strong-m"
                      style={{ color: textPrimary }}
                    >
                      {t("languageTitle")}
                    </Heading>
                    <Text style={{ color: textMuted, fontSize: "0.8rem" }}>
                      {t("languageSubtitle")}
                    </Text>
                  </Column>
                  <Column style={{ gap: "8px" }}>
                    {[
                      { code: "vi" as Lang, label: "Tiếng Việt", flag: "🇻🇳" },
                      { code: "en" as Lang, label: "English", flag: "🇺🇸" },
                    ].map((l) => {
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
                              : cardBg,
                            border: active
                              ? "1.5px solid #ff6b35"
                              : `1px solid ${border}`,
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                            {l.flag}
                          </span>
                          <Text
                            style={{
                              color: active ? textPrimary : textMuted,
                              fontWeight: active ? 600 : 400,
                              fontSize: "0.9rem",
                              flex: 1,
                            }}
                          >
                            {l.label}
                          </Text>
                          {active && (
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: "#ff6b35",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={12} color="white" strokeWidth={3} />
                            </div>
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
                    style={{ color: textPrimary }}
                  >
                    {t("supportTitle")}
                  </Heading>
                  <Text
                    style={{
                      color: textMuted,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {t("supportBody")}
                  </Text>
                  <Button variant="primary" style={{ borderRadius: "12px" }}>
                    {t("contactSupport")}
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
