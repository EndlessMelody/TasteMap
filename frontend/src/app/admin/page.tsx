"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#F2F2F7]">
                <Loader2 className="animate-spin text-[#007AFF] mb-4" size={40} />
                <p className="text-[15px] font-bold text-[#8E8E93] flex items-center gap-2">
                    <Lock size={16} /> Verifying Clearance...
                </p>
            </div>
        );
    }

    return (
        <div
            className="no-scrollbar"
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                backgroundColor: "#F2F2F7",
                overflowY: "auto",
                overflowX: "hidden",
            }}
        >
            {/* ── HERO HEADER (Giao diện Chỉ huy) ── */}
            <div
                className="w-full shrink-0"
                style={{
                    background: "linear-gradient(135deg, #1C1C1E 0%, #000000 100%)",
                    padding: "48px 48px 40px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Đèn báo động ngầm đỏ/tím cho ngầu */}
                <div
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

                <div className="relative max-w-[1400px] mx-auto w-full flex flex-col">
                    <div className="flex items-start justify-between mb-8 w-full">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div
                                    className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-xl"
                                    style={{ background: "linear-gradient(135deg, #FF3B30, #FF2D55)" }}
                                >
                                    <ShieldAlert size={24} className="text-white" />
                                </div>
                                <h1 className="text-[32px] font-black text-white tracking-tight">
                                    LiveOps Command Center
                                </h1>
                            </div>
                            <p className="text-[15px] text-[rgba(255,255,255,0.6)] font-medium max-w-md">
                                System overview, economy balancing, and fraud detection. Restricted access.
                            </p>
                        </div>

                        {/* Admin Badge */}
                        <div className="flex items-center gap-3 px-5 py-3 rounded-[20px] bg-white/10 border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF3B30]">
                                <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Admin" />
                            </div>
                            <div>
                                <p className="text-[16px] font-black text-white leading-none">
                                    {user?.username || "SuperAdmin"}
                                </p>
                                <p className="text-[11px] uppercase font-bold text-[#FF3B30] tracking-wider mt-1 flex items-center gap-1">
                                    <Lock size={10} /> Clearance Level: MAX
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Metrics (Hardcode tĩnh demo) */}
                    <div className="grid grid-cols-4 gap-4 w-full">
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
                                className="rounded-[20px] px-5 py-4 flex flex-col justify-between bg-white/5 border border-white/10"
                            >
                                <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    {s.icon}
                                    <span className="text-[11px] font-bold uppercase tracking-widest">{s.label}</span>
                                </div>
                                <p className="text-[26px] font-black text-white leading-none mt-3">
                                    {s.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BẢNG ĐIỀU KHIỂN CÁC MODULE ── */}
            <div className="max-w-[1400px] mx-auto w-full px-12 py-10 flex flex-col gap-8">
                <h2 className="text-[20px] font-black text-[#1C1C1E]">System Modules</h2>

                <div className="grid grid-cols-2 gap-6">
                    <div
                        className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer"
                        onClick={() => router.push("/admin/locations")}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center mb-4">
                            <MapPin size={24} className="text-[#FF9500]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">Location Manager</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Review, manage, search, and update places of interest globally.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#FF9500]">
                            <span>Manage Locations</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer"
                        onClick={() => router.push("/admin/challenges")}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center mb-4">
                            <MapPin size={24} className="text-[#FF9500]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">Challenge Manager</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Manage challenges, create new challenges, and update existing challenges.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#FF9500]">
                            <span>Manage Challenges</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    {/* Module 1: LiveOps & Campaigns */}
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mb-4">
                            <Target size={24} className="text-[#007AFF]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">LiveOps & Campaigns</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Manage active challenges, push location deals, and configure event filters.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#007AFF]">
                            <span>Manage Events</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    {/* Module 2: Anti-Cheat & Fraud */}
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/10 flex items-center justify-center mb-4">
                            <ShieldAlert size={24} className="text-[#FF3B30]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">Anti-Cheat System</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Review Fake GPS flags, speed hacking alerts, and shadowbanned users.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#FF3B30]">
                            <span>Review Logs</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    {/* Module 3: Economy & XP */}
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 flex items-center justify-center mb-4">
                            <Database size={24} className="text-[#34C759]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">Economy Manager</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Track XP inflation, audit transaction history, and adjust level curves.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#34C759]">
                            <span>Audit Economy</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    {/* Module 4: AI & Vector Health */}
                    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-black/5 transition-transform hover:-translate-y-1 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center mb-4">
                            <BrainCircuit size={24} className="text-[#AF52DE]" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1C1C1E] mb-2">AI Vector Monitor</h3>
                        <p className="text-[14px] text-[#8E8E93] mb-6">Visualize taste clusters, monitor Group Room match rates, and check LLM API health.</p>
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#AF52DE]">
                            <span>View Analytics</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>

                    {/* Module 5: Location */}

                </div>
            </div>
        </div>
    );
}