"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, LogOut, Mail, AlertTriangle } from "lucide-react";
import {
  Page,
  Card,
  Button,
  H2,
  Body,
  BodySm,
  Caption,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

export default function BannedPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleAppeal = () => {
    window.location.href =
      "mailto:support@tastemap.app?subject=Yêu%20cầu%20Kháng%20cáo%20-%20TasteMap";
  };

  return (
    <Page center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: tokens.space[6],
          maxWidth: 480,
          width: "100%",
        }}
      >
        <Card
          radius="xl"
          shadow="md"
          padding="lg"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: tokens.space[5],
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: tokens.radius.lg,
              background: "rgba(230, 57, 70, 0.1)",
              color: tokens.color.danger,
            }}
          >
            <ShieldAlert size={32} strokeWidth={1.75} />
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[2] }}>
            <H2>Tài khoản bị đình chỉ</H2>
            <Body tone="muted">
              Quyền truy cập của bạn vào TasteMap đã bị khóa do không tuân thủ
              các Tiêu chuẩn Cộng đồng. Chúng tôi xây dựng một môi trường văn
              minh và an toàn cho tất cả mọi người.
            </Body>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              gap: tokens.space[3],
              padding: tokens.space[4],
              background: tokens.color.surfaceMuted,
              borderRadius: tokens.radius.md,
              textAlign: "left",
            }}
          >
            <AlertTriangle
              size={18}
              strokeWidth={1.75}
              style={{ color: tokens.color.warning, flexShrink: 0, marginTop: 2 }}
            />
            <BodySm tone="muted">
              Nếu bạn tin rằng đây là một sự nhầm lẫn của hệ thống, vui lòng gửi
              yêu cầu xem xét lại cho chúng tôi.
            </BodySm>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: tokens.space[2],
            }}
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<Mail size={18} strokeWidth={1.75} />}
              onClick={handleAppeal}
            >
              Gửi yêu cầu kháng cáo
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              leftIcon={<LogOut size={18} strokeWidth={1.75} />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </Card>

        <Caption tone="subtle">TasteMap Security System</Caption>
      </div>
    </Page>
  );
}
