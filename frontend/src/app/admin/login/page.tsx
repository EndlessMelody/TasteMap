"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Column, Row, Heading, Text, Button } from "@once-ui-system/core";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.scss";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    // Re-sync the admin cookie if it was dropped (e.g. after a refresh) and
    // forward straight into the panel.
    if (user && user.role === "admin") {
      document.cookie = `user_role=admin; path=/; max-age=86400`;
      router.push("/admin/locations");
    }
  }, [user, isInitializing, router]);

  const isDenied = !!user && user.role !== "admin";

  return (
    <Column
      fillWidth
      horizontal="center"
      vertical="center"
      background="page"
      className={styles.screen}
    >
      <Column
        fillWidth
        maxWidth={25}
        horizontal="center"
        align="center"
        gap="24"
        padding="32"
      >
        <Row
          horizontal="center"
          vertical="center"
          className={`${styles.iconBadge} ${isDenied ? styles.iconBadgeDenied : ""}`}
        >
          {isDenied ? (
            <ShieldAlert size={28} color="#fff" />
          ) : (
            <ShieldCheck size={28} color="#fff" />
          )}
        </Row>

        <Column gap="8" horizontal="center" align="center">
          <Heading variant="heading-strong-l">Admin Panel</Heading>

          {isInitializing ? (
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Đang kiểm tra quyền truy cập...
            </Text>
          ) : !user ? (
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Vui lòng đăng nhập để kiểm tra quyền quản trị
            </Text>
          ) : isDenied ? (
            <Column gap="8" horizontal="center" align="center">
              <Text variant="body-strong-s" onBackground="danger-medium" align="center">
                Truy cập bị từ chối
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                Tài khoản <b>{user.username}</b> không có quyền quản trị viên.
              </Text>
            </Column>
          ) : (
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              Đang chuyển hướng...
            </Text>
          )}
        </Column>

        <Column gap="12" fillWidth paddingTop="16">
          {!isInitializing && !user && (
            <Button
              size="l"
              fillWidth
              onClick={() => router.push("/login?redirect=/admin")}
            >
              Đăng nhập tài khoản
            </Button>
          )}

          {!isInitializing && isDenied && (
            <Button
              size="l"
              fillWidth
              variant="secondary"
              onClick={() => router.push("/")}
            >
              Quay lại Trang chủ
            </Button>
          )}
        </Column>
      </Column>
    </Column>
  );
}
