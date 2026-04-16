"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Heading, Text, Button } from "@/components/OnceUI";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu chưa load auth xong thì chờ
    if (isInitializing) return;

    // Nếu user đã có role admin trong state nhưng cookie bị thiếu (do refresh hoặc lý do nào đó)
    // thì set lại cookie và đẩy tự động vào trong
    if (user && user.role === "admin") {
      document.cookie = `user_role=admin; path=/; max-age=86400`;
      router.push("/admin/locations");
    }
  }, [user, isInitializing, router]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleLoginClick = () => {
    router.push("/login?redirect=/admin");
  };

  return (
    <Column
      fill
      align="center"
      justify="center"
      style={{ minHeight: "100vh", background: "var(--surface-page)" }}
    >
      <Column
        gap={24}
        align="center"
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 32,
        }}
      >
        {/* Icon */}
        <Row
          align="center"
          justify="center"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: user && user.role !== "admin" 
              ? "linear-gradient(135deg, #FF3B30, #FF9500)" 
              : "linear-gradient(135deg, #007AFF, #5856D6)",
            boxShadow: "0 8px 32px rgba(0,122,255,0.3)",
          }}
        >
          {user && user.role !== "admin" ? (
            <ShieldAlert size={28} color="#fff" />
          ) : (
            <ShieldCheck size={28} color="#fff" />
          )}
        </Row>

        <Column gap={6} align="center">
          <Heading variant="heading-strong-l">Admin Panel</Heading>
          
          {isInitializing ? (
            <Text variant="body-default-s" style={{ color: "var(--text-secondary)", textAlign: "center" }}>
              Đang kiểm tra quyền truy cập...
            </Text>
          ) : !user ? (
            <Text variant="body-default-s" style={{ color: "var(--text-secondary)", textAlign: "center" }}>
              Vui lòng đăng nhập để kiểm tra quyền quản trị
            </Text>
          ) : user.role !== "admin" ? (
            <Column gap={8} align="center">
              <Text variant="body-default-s" style={{ color: "#FF3B30", textAlign: "center", fontWeight: 500 }}>
                Truy cập bị từ chối
              </Text>
              <Text variant="body-default-s" style={{ color: "var(--text-secondary)", textAlign: "center" }}>
                Tài khoản <b>{user.username}</b> không có quyền quản trị viên.
              </Text>
            </Column>
          ) : (
            <Text variant="body-default-s" style={{ color: "var(--text-secondary)", textAlign: "center" }}>
              Đang chuyển hướng...
            </Text>
          )}
        </Column>

        {/* Buttons */}
        <Column gap={12} fillWidth paddingTop={16}>
          {!isInitializing && !user && (
            <Button size="l" fillWidth onClick={handleLoginClick}>
              Đăng nhập tài khoản
            </Button>
          )}
          
          {!isInitializing && user && user.role !== "admin" && (
            <Button size="l" fillWidth onClick={handleGoHome}>
              Quay lại Trang chủ
            </Button>
          )}
        </Column>
      </Column>
    </Column>
  );
}
