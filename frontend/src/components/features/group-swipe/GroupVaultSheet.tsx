"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Archive, Heart } from "lucide-react";
import type { VaultItem } from "@/hooks/useGroupSwipe";
import { Card, IconButton, Pill, H3, Body, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

interface GroupVaultSheetProps {
  open: boolean;
  onClose: () => void;
  vault: VaultItem[];
  loading: boolean;
}

export function GroupVaultSheet({
  open,
  onClose,
  vault,
  loading,
}: GroupVaultSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10, 10, 10, 0.4)",
              backdropFilter: "blur(4px)",
              zIndex: tokens.z.overlay,
            }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "70vh",
              background: tokens.color.surface,
              borderTopLeftRadius: tokens.radius.xl,
              borderTopRightRadius: tokens.radius.xl,
              boxShadow: tokens.shadow.lg,
              zIndex: tokens.z.modal,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: `${tokens.space[3]} ${tokens.space[5]} 0`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: tokens.color.surfaceInset,
                  margin: "0 auto 12px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: tokens.space[3],
                  borderBottom: `1px solid ${tokens.color.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[2],
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: tokens.radius.sm,
                      background: tokens.color.surfaceMuted,
                      color: tokens.color.textMuted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Archive size={16} strokeWidth={1.75} />
                  </span>
                  <div>
                    <H3>Group vault</H3>
                    <Caption tone="muted">
                      {vault.length} place{vault.length !== 1 ? "s" : ""} saved
                    </Caption>
                  </div>
                </div>

                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Close"
                  icon={<X size={16} strokeWidth={1.75} />}
                  onClick={onClose}
                />
              </div>
            </div>

            <div
              className="no-scrollbar"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: `${tokens.space[3]} ${tokens.space[5]} ${tokens.space[6]}`,
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: `3px solid ${tokens.color.surfaceInset}`,
                      borderTopColor: tokens.color.warm,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : vault.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: `${tokens.space[10]} ${tokens.space[5]}`,
                    color: tokens.color.textSubtle,
                  }}
                >
                  <Archive
                    size={36}
                    strokeWidth={1.5}
                    style={{ color: tokens.color.textSubtle, marginBottom: tokens.space[3] }}
                  />
                  <Body
                    style={{
                      fontWeight: tokens.type.weight.semibold,
                      marginBottom: 4,
                    }}
                  >
                    Vault is empty
                  </Body>
                  <BodySm tone="muted">
                    Places you and your group like will appear here.
                  </BodySm>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.space[2],
                  }}
                >
                  {vault.map((item, idx) => (
                    <motion.div
                      key={item.location_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card radius="md" padding="sm" shadow="none" surface="muted">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: tokens.space[3],
                          }}
                        >
                          <img
                            src={item.image_url || FALLBACK_IMG}
                            alt=""
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: tokens.radius.sm,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Body
                              style={{
                                fontWeight: tokens.type.weight.semibold,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.name}
                            </Body>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 2,
                                color: tokens.color.textMuted,
                              }}
                            >
                              <Heart
                                size={10}
                                strokeWidth={1.75}
                                fill={tokens.color.danger}
                                style={{ color: tokens.color.danger }}
                              />
                              <Caption tone="muted">
                                {item.votes} vote{item.votes !== 1 ? "s" : ""}
                              </Caption>
                            </div>
                          </div>

                          <Pill tone="success" size="md">
                            {item.votes}
                          </Pill>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
