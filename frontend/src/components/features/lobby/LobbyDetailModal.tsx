"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, MapPin, Clock, Crown, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import type { LobbyModalProps } from "./types";
import {
  Card,
  Button,
  IconButton,
  H2,
  BodySm,
  Caption,
  Pill,
  Eyebrow,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

export default function LobbyDetailModal({ lobby, onClose }: LobbyModalProps) {
  const router = useRouter();
  const [joining, setJoining] = React.useState(false);
  const spotsLeft = lobby.spots - lobby.members.length;

  const handleJoin = async () => {
    if (!lobby.id) return toast.error("Invalid lobby ID");
    setJoining(true);
    try {
      await apiPost(`/api/v1/groups/${lobby.id}/join`);
      router.push(`/group-rooms/${lobby.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join lobby";
      toast.error(msg);
      setJoining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: tokens.z.modal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 10, 0.4)",
        backdropFilter: "blur(8px)",
        padding: tokens.space[4],
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Card
          radius="xl"
          padding="none"
          shadow="lg"
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              padding: tokens.space[6],
              background: tokens.color.surfaceMuted,
              position: "relative",
            }}
          >
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Close"
              icon={<X size={18} strokeWidth={1.75} />}
              onClick={onClose}
              style={{
                position: "absolute",
                top: tokens.space[3],
                right: tokens.space[3],
                background: tokens.color.surface,
              }}
            />

            <Pill tone="success" size="sm" dot style={{ marginBottom: tokens.space[3] }}>
              Live now
            </Pill>

            <H2>{lobby.name}</H2>
            <BodySm
              style={{
                color: tokens.color.warm,
                fontWeight: tokens.type.weight.medium,
                marginTop: tokens.space[1],
              }}
            >
              {lobby.spots} spots total ·{" "}
              {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
            </BodySm>

            <div
              style={{
                display: "flex",
                gap: tokens.space[4],
                marginTop: tokens.space[3],
              }}
            >
              <BodySm
                tone="muted"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                }}
              >
                <MapPin size={13} strokeWidth={1.75} />
                {lobby.route}
              </BodySm>
              <BodySm
                tone="muted"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space[1],
                }}
              >
                <Clock size={13} strokeWidth={1.75} />
                {lobby.time}
              </BodySm>
            </div>
          </div>

          <div style={{ padding: tokens.space[6] }}>
            <Eyebrow tone="muted" style={{ marginBottom: tokens.space[4], display: "block" }}>
              Current explorers
            </Eyebrow>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: tokens.space[3],
              }}
            >
              {lobby.members.map((member, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[3],
                    }}
                  >
                    <img
                      src={member.avatar}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                        {member.name}
                      </BodySm>
                      <Caption tone="muted">
                        {member.ready ? "Ready" : "Not ready yet"}
                      </Caption>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.space[2],
                    }}
                  >
                    {i === 0 && (
                      <Pill
                        tone="warm"
                        size="sm"
                        leftIcon={<Crown size={11} strokeWidth={1.75} />}
                      >
                        Creator
                      </Pill>
                    )}
                    {member.ready && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: tokens.color.success,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {Array.from({ length: spotsLeft }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space[3],
                    opacity: 0.5,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `2px dashed ${tokens.color.border}`,
                      background: tokens.color.surfaceMuted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus
                      size={14}
                      strokeWidth={1.75}
                      style={{ color: tokens.color.textMuted }}
                    />
                  </div>
                  <BodySm tone="muted">Waiting for explorer…</BodySm>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: `${tokens.space[2]} ${tokens.space[6]} ${tokens.space[6]}` }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={joining}
              leftIcon={joining ? <Loader2 size={18} strokeWidth={1.75} /> : undefined}
              onClick={handleJoin}
            >
              {joining ? "Joining…" : "Confirm & join lobby"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
