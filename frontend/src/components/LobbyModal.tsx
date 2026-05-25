"use client";

import React from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  Avatar,
} from "@/components/OnceUI";
import { Users, MapPin, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import BottomSheet from "@/components/BottomSheet";

export interface LobbyData {
  name: string;
  route: string;
  time: string;
  spots: number;
  members: { name: string; avatar: string; ready: boolean }[];
  bg: string;
  accent: string;
}

interface LobbyModalProps {
  isOpen: boolean;
  data: LobbyData;
  onClose: () => void;
}

export default function LobbyModal({ isOpen, data, onClose }: LobbyModalProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Hero Image */}
      <div
        style={{
          height: "180px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={data.bg}
          alt={data.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.2), ${data.accent}55)`,
          }}
        />
        <Column
          style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            zIndex: 2,
          }}
        >
          <Heading variant="heading-strong-m" style={{ color: "#1C1C1E" }}>
            {data.name}
          </Heading>
        </Column>
      </div>

      {/* Content */}
      <Column style={{ padding: "24px", gap: "20px" }}>
        {/* Route Info */}
        <Column style={{ gap: "8px" }}>
          <Row style={{ alignItems: "center", gap: "8px" }}>
            <MapPin size={16} color="#8E8E93" />
            <Text
              style={{ color: "#48484A", fontSize: "0.85rem" }}
            >
              {data.route}
            </Text>
          </Row>
          <Row style={{ gap: "16px" }}>
            <Row style={{ alignItems: "center", gap: "6px" }}>
              <Clock size={14} color="#AEAEB2" />
              <Text
                style={{ color: "#8E8E93", fontSize: "0.75rem" }}
              >
                {data.time}
              </Text>
            </Row>
            <Row style={{ alignItems: "center", gap: "6px" }}>
              <Users size={14} color="#AEAEB2" />
              <Text
                style={{ color: "#8E8E93", fontSize: "0.75rem" }}
              >
                {data.members.length}/{data.spots} joined
              </Text>
            </Row>
          </Row>
        </Column>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "var(--border-weak)",
          }}
        />

        {/* Participants */}
        <Column style={{ gap: "12px" }}>
          <Text
            style={{
              color: "#8E8E93",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Participants
          </Text>
          <Row style={{ gap: "12px", flexWrap: "wrap" }}>
            {data.members.map((m) => (
              <Column
                key={m.name}
                style={{ alignItems: "center", gap: "6px", width: "64px" }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar src={m.avatar} size="l" />
                  {m.ready && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "var(--surface-elevated)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle size={14} color="#00D1B2" fill="#00D1B2" />
                    </div>
                  )}
                </div>
                <Text
                  style={{
                    color: "#48484A",
                    fontSize: "0.65rem",
                    textAlign: "center",
                  }}
                >
                  {m.name}
                </Text>
              </Column>
            ))}
            {Array.from({
              length: Math.max(0, data.spots - data.members.length),
            }).map((_, i) => (
              <Column
                key={`empty-${i}`}
                style={{ alignItems: "center", gap: "6px", width: "64px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2px dashed rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={18} color="rgba(255,255,255,0.15)" />
                </div>
                <Text
                  style={{
                    color: "#C7C7CC",
                    fontSize: "0.65rem",
                  }}
                >
                  Open
                </Text>
              </Column>
            ))}
          </Row>
        </Column>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "var(--border-weak)",
          }}
        />

        {/* Status + CTA */}
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Row style={{ alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#00D1B2",
                boxShadow: "var(--shadow-glow-teal)",
              }}
            />
            <Text
              style={{ color: "#00D1B2", fontSize: "0.8rem", fontWeight: 600 }}
            >
              Lobby Open
            </Text>
          </Row>
          <Button
            size="m"
            onClick={() => toast("Will be updated in the next version 🚀")}
            style={{
              backgroundColor: data.accent,
              color: "#1C1C1E",
              fontWeight: 700,
              borderRadius: "var(--radius-m)",
              padding: "10px 28px",
              cursor: "pointer",
              border: "none",
            }}
          >
            Confirm Join
          </Button>
        </Row>

        {/* Safe area bottom padding */}
        <div style={{ height: "8px" }} />
      </Column>
    </BottomSheet>
  );
}
