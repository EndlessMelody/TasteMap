"use client";

import React, { useState } from "react";
import { Share2, Link2, QrCode, Settings } from "lucide-react";
import { Card, H3 } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useProfileActions } from "@/hooks/useProfileActions";
import QRCodeModal from "@/components/modals/QRCodeModal";

interface QuickActionsCardProps {
  user: { username?: string; avatar_url?: string } & Record<string, unknown>;
  onSettingsClick?: () => void;
}

interface ActionRowProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ActionRow({ icon, label, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: tokens.space[3],
        padding: tokens.space[3],
        borderRadius: tokens.radius.md,
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        color: tokens.color.text,
        fontSize: tokens.type.size.bodySm,
        fontWeight: tokens.type.weight.semibold,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = tokens.color.surfaceMuted;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ color: tokens.color.textMuted, display: "inline-flex" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  user,
  onSettingsClick,
}) => {
  const { handleShareProfile, handleCopyLink, profileUrl } =
    useProfileActions(user);
  const [isQROpen, setIsQROpen] = useState(false);

  return (
    <>
      <Card radius="xl" padding="md" shadow="sm">
        <H3 style={{ marginBottom: tokens.space[4] }}>Quick actions</H3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[1],
          }}
        >
          <ActionRow
            icon={<Share2 size={18} strokeWidth={1.75} />}
            label="Share profile"
            onClick={handleShareProfile}
          />
          <ActionRow
            icon={<Link2 size={18} strokeWidth={1.75} />}
            label="Copy link"
            onClick={handleCopyLink}
          />
          <ActionRow
            icon={<QrCode size={18} strokeWidth={1.75} />}
            label="QR code"
            onClick={() => setIsQROpen(true)}
          />
          <ActionRow
            icon={<Settings size={18} strokeWidth={1.75} />}
            label="Settings"
            onClick={onSettingsClick}
          />
        </div>
      </Card>

      <QRCodeModal
        user={user}
        url={profileUrl}
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </>
  );
};

export default QuickActionsCard;
