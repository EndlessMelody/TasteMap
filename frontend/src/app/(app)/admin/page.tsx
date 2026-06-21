"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Column, Row, Grid } from "@once-ui-system/core";
import {
    ShieldAlert,
    TrendingUp,
    Target,
    BrainCircuit,
    Users,
    Activity,
    AlertTriangle,
    ChevronRight,
    Lock,
    Loader2,
    Database,
    MapPin
} from "lucide-react";

const MODULES = [
    {
        icon: MapPin,
        color: "#FF9500",
        title: "Location Manager",
        description: "Review, manage, search, and update places of interest globally.",
        cta: "Manage Locations",
        href: "/admin/locations",
    },
    {
        icon: MapPin,
        color: "#FF9500",
        title: "Challenge Manager",
        description: "Manage challenges, create new challenges, and update existing challenges.",
        cta: "Manage Challenges",
        href: "/admin/challenges",
    },
    {
        icon: Target,
        color: "#007AFF",
        title: "LiveOps & Campaigns",
        description: "Manage active challenges, push location deals, and configure event filters.",
        cta: "Manage Events",
    },
    {
        icon: ShieldAlert,
        color: "#FF3B30",
        title: "Anti-Cheat System",
        description: "Review Fake GPS flags, speed hacking alerts, and shadowbanned users.",
        cta: "Review Logs",
    },
    {
        icon: Database,
        color: "#34C759",
        title: "Economy Manager",
        description: "Track XP inflation, audit transaction history, and adjust level curves.",
        cta: "Audit Economy",
    },
    {
        icon: BrainCircuit,
        color: "#AF52DE",
        title: "AI Vector Monitor",
        description: "Visualize taste clusters, monitor Group Room match rates, and check LLM API health.",
        cta: "View Analytics",
    },
];

export default function AdminDashboard() {
    const { user, isInitializing } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    // ─── BẢO MẬT: CHẶN TRUY CẬP TRÁI PHÉP ───
    useEffect(() => {
        if (!isInitializing) {
            if (!user) {
                router.replace("/login"); // Chưa đăng nhập thì cút ra ngoài
            } else if (user.role !== "admin") {
                router.replace("/"); // Có nick nhưng không phải admin thì đá về trang chủ
            } else {
                setIsAuthorized(true); // Cấp quyền hiển thị UI
            }
        }
    }, [user, isInitializing, router]);

    // Hiển thị màn hình chờ mượt mà trong lúc check quyền
    if (isInitializing || !isAuthorized) {
        return (
            <Column horizontal="center" vertical="center" style={{ flex: 1, height: "100%", backgroundColor: "#F2F2F7" }}>
                <Loader2 style={{ color: "#007AFF", marginBottom: 16, animation: "spin 0.8s linear infinite" }} size={40} />
                <Row vertical="center" style={{ fontSize: 15, fontWeight: 700, color: "#8E8E93", gap: 8 }}>
                    <Lock size={16} /> Verifying Clearance...
                </Row>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </Column>
        );
    }

    return (
        <Column
            className="no-scrollbar"
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#F2F2F7",
                overflowY: "auto",
                overflowX: "hidden",
            }}
        >
            {/* ── HERO HEADER (Giao diện Chỉ huy) ── */}
            <Column
                style={{
                    width: "100%",
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #1C1C1E 0%, #000000 100%)",
                    padding: "48px 48px 40px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Đèn báo động ngầm đỏ/tím cho ngầu */}
                <Column
                    style={{
                        position: "absolute",
                        top: -60,
                        right: -60,
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        background: "rgba(255,59,48,0.15)",
                        filter: "blur(80px)",
                    }}
                />

                <Column style={{ position: "relative", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
                    <Row horizontal="between" style={{ alignItems: "flex-start", marginBottom: 32, width: "100%" }}>
                        <Column>
                            <Row vertical="center" style={{ gap: 16, marginBottom: 12 }}>
                                <Row
                                    horizontal="center"
                                    vertical="center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 18,
                                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
                                        background: "linear-gradient(135deg, #FF3B30, #FF2D55)",
                                    }}
                                >
                                    <ShieldAlert size={24} color="#fff" />
                                </Row>
                                <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
                                    LiveOps Command Center
                                </h1>
                            </Row>
                            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", fontWeight: 500, maxWidth: 448, margin: 0 }}>
                                System overview, economy balancing, and fraud detection. Restricted access.
                            </p>
                        </Column>

                        {/* Admin Badge */}
                        <Row
                            vertical="center"
                            style={{
                                gap: 12,
                                padding: "12px 20px",
                                borderRadius: 20,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Column style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF3B30" }}>
                                <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Admin" />
                            </Column>
                            <Column>
                                <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1, margin: 0 }}>
                                    {user?.username || "SuperAdmin"}
                                </p>
                                <Row vertical="center" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#FF3B30", letterSpacing: "0.05em", marginTop: 4, gap: 4 }}>
                                    <Lock size={10} /> Clearance Level: MAX
                                </Row>
                            </Column>
                        </Row>
                    </Row>

                    {/* Quick Metrics (Hardcode tĩnh demo) */}
                    <Grid style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, width: "100%" }}>
                        {[
                            { label: "Active Users (24h)", value: "1,204", icon: <Users size={16} />, color: "#007AFF" },
                            { label: "XP Velocity", value: "+45k/hr", icon: <TrendingUp size={16} />, color: "#34C759" },
                            { label: "Flagged Accounts", value: "12", icon: <AlertTriangle size={16} />, color: "#FF9500" },
                            { label: "Vector Drift", value: "2.4%", icon: <Activity size={16} />, color: "#FF3B30" },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    borderRadius: 20,
                                    padding: "16px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                <Row vertical="center" style={{ gap: 8, color: "rgba(255,255,255,0.5)" }}>
                                    {s.icon}
                                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                                </Row>
                                <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1, marginTop: 12, marginBottom: 0 }}>
                                    {s.value}
                                </p>
                            </motion.div>
                        ))}
                    </Grid>
                </Column>
            </Column>

            {/* ── BẢNG ĐIỀU KHIỂN CÁC MODULE ── */}
            <Column style={{ maxWidth: 1400, margin: "0 auto", width: "100%", padding: "40px 48px", gap: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1C1C1E", margin: 0 }}>System Modules</h2>

                <Grid style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
                    {MODULES.map((mod) => {
                        const Icon = mod.icon;
                        return (
                            <Column
                                key={mod.title}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: 32,
                                    padding: 24,
                                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    transition: "transform 0.2s",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                onClick={mod.href ? () => router.push(mod.href) : undefined}
                            >
                                <Row
                                    horizontal="center"
                                    vertical="center"
                                    style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${mod.color}1A`, marginBottom: 16 }}
                                >
                                    <Icon size={24} color={mod.color} />
                                </Row>
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1C1C1E", marginTop: 0, marginBottom: 8 }}>{mod.title}</h3>
                                <p style={{ fontSize: 14, color: "#8E8E93", marginTop: 0, marginBottom: 24 }}>{mod.description}</p>
                                <Row horizontal="between" style={{ fontSize: 13, fontWeight: 700, color: mod.color }}>
                                    <span>{mod.cta}</span>
                                    <ChevronRight size={16} />
                                </Row>
                            </Column>
                        );
                    })}
                </Grid>
            </Column>
        </Column>
    );
}
