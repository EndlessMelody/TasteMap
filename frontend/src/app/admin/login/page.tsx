"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Heading, Text, Button } from "@/components/OnceUI";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "tastemap-admin-2026";

    if (password === secret) {
      // Set cookie (30 ngày)
      document.cookie = `admin_token=${secret}; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/admin/locations");
    } else {
      setError("Sai mật khẩu. Liên hệ Admin để được cấp quyền.");
      setLoading(false);
    }
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
            background: "linear-gradient(135deg, #007AFF, #5856D6)",
            boxShadow: "0 8px 32px rgba(0,122,255,0.3)",
          }}
        >
          <ShieldCheck size={28} color="#fff" />
        </Row>

        <Column gap={6} align="center">
          <Heading variant="heading-strong-l">Admin Panel</Heading>
          <Text
            variant="body-default-s"
            style={{ color: "var(--text-secondary)", textAlign: "center" }}
          >
            Nhập mật khẩu quản trị để truy cập
          </Text>
        </Column>

        {/* Input */}
        <Column gap={12} fillWidth>
          <Row
            fillWidth
            vertical="center"
            style={{
              background: "#F2F2F7",
              borderRadius: 16,
              border: error ? "1.5px solid #FF3B30" : "1px solid #E5E5EA",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu quản trị..."
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                flex: 1,
                padding: "14px 16px",
                fontSize: "0.9rem",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "inherit",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 14px",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </Row>

          {error && (
            <Text variant="body-default-xs" style={{ color: "#FF3B30", paddingLeft: 4 }}>
              {error}
            </Text>
          )}

          <Button
            size="l"
            fillWidth
            onClick={handleLogin}
            disabled={loading || !password}
          >
            {loading ? "Đang xác thực..." : "Đăng nhập Admin"}
          </Button>
        </Column>

        <Text
          variant="body-default-xs"
          style={{ color: "var(--text-tertiary)", textAlign: "center", marginTop: 8 }}
        >
          🔒 Trang này chỉ dành cho quản trị viên TasteMap
        </Text>
      </Column>
    </Column>
  );
}
