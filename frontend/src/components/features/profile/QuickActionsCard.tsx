"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link2, QrCode, Settings } from "lucide-react";
import { Text } from "@/components/OnceUI";
import { useProfileActions } from "@/hooks/useProfileActions"; // Import hook ông vừa tạo
import QRCodeModal from "@/components/modals/QRCodeModal";

interface QuickActionsCardProps {
  user: any; // Truyền cục user vào đây để lấy username và avatar
  onSettingsClick?: () => void; // Nút Settings vẫn có thể truyền từ ngoài vào
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ user, onSettingsClick }) => {
  // Lấy các hàm xử lý từ Custom Hook
  const { handleShareProfile, handleCopyLink, profileUrl } = useProfileActions(user);

  // State để mở/tắt Modal QR
  const [isQROpen, setIsQROpen] = useState(false);

  // Mảng cấu hình các nút bấm
  const actions = [
    {
      id: "share",
      icon: <Share2 size={18} />,
      label: "Share Profile",
      color: "#ff6b35",
      onClick: handleShareProfile, // Gắn hàm Share
    },
    {
      id: "copy",
      icon: <Link2 size={18} />,
      label: "Copy Link",
      color: "#34C759",
      onClick: handleCopyLink, // Gắn hàm Copy
    },
    {
      id: "qr",
      icon: <QrCode size={18} />,
      label: "QR Code",
      color: "#5856D6",
      onClick: () => setIsQROpen(true), // Mở Modal QR
    },
    {
      id: "settings",
      icon: <Settings size={18} />,
      label: "Settings",
      color: "#8E8E93",
      onClick: onSettingsClick, // Hàm mở Settings
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "24px",
          border: "1px solid #F2F2F7",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <Text
          style={{
            color: "#1C1C1E",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "16px",
          }}
        >
          Quick Actions
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {actions.map((action) => (
            <motion.div
              key={action.id}
              whileHover={{ x: 4, backgroundColor: "#F9F9FB" }}
              onClick={action.onClick} // Gọi đúng hàm khi click
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
              <Text
                style={{
                  color: "#1C1C1E",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {action.label}
              </Text>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <QRCodeModal
        user={user}
        url={profileUrl}
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </>
  );
};