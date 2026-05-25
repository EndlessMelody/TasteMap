"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Column, Row, Heading, Text, Button, IconButton
} from "@/components/OnceUI";
import {
    Trophy, Plus, Search, Filter, MoreVertical,
    CheckCircle2, Clock, AlertCircle, TrendingUp
} from "lucide-react";
import { Zap, Edit3, Trash2, Eye, X, Save, AlertCircle as AlertIcon, Users } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast, Toaster } from "sonner";

// ═══════════════════════════════════════════════════════════════════════
//  TYPES — Phản ánh chính xác Backend Schema đã triển khai
// ═══════════════════════════════════════════════════════════════════════
interface Challenge {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    xp_reward: number;
    target_count: number;
    action_type: string;
    action_filter: any;
    badge_id: number | null;
    icon: string;
    accent_color: string;
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    is_recurring: boolean;
    participants_count: number;
    completion_rate: number;
    // UI helper field
    computedStatus?: "Active" | "Draft" | "Expired" | "Scheduled";
}

export default function ChallengeManagementPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"All" | "Active" | "Draft" | "Expired">("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Tính toán trạng thái dựa trên thời gian và flag is_active
    const deriveStatus = useCallback((c: Challenge): "Active" | "Draft" | "Expired" | "Scheduled" => {
        if (!c.is_active) return "Draft";
        const now = new Date();
        if (c.start_date && new Date(c.start_date) > now) return "Scheduled";
        if (c.end_date && new Date(c.end_date) < now) return "Expired";
        return "Active";
    }, []);

    const fetchChallenges = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiGet<any>("/api/v1/challenges");
            if (Array.isArray(response)) {
                const enriched = response.map((c: Challenge) => ({
                    ...c,
                    computedStatus: deriveStatus(c)
                }));
                setChallenges(enriched);
            } else {
                setError("Định dạng dữ liệu không hợp lệ từ máy chủ");
            }
        } catch (err: any) {
            setError(err.message || "Lỗi kết nối API");
        } finally {
            setIsLoading(false);
        }
    }, [deriveStatus]);

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    // Lọc dữ liệu dựa trên Tab và Search Query
    const filteredChallenges = challenges.filter(c => {
        const matchTab = activeTab === "All" || c.computedStatus === activeTab;
        const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });

    // ─── CRUD HANDLERS ───
    const handleDelete = async () => {
        if (!selectedChallenge) return;
        setIsSubmitting(true);
        try {
            const res = await apiDelete<any>(`/api/v1/challenges/${selectedChallenge.id}`);
            toast.success("Đã xoá thử thách thành công");
            setIsDeleteOpen(false);
            fetchChallenges();
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi xoá thử thách");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = async (formData: any) => {
        setIsSubmitting(true);
        try {
            const endpoint = formMode === "create" ? "/api/v1/challenges/" : `/api/v1/challenges/${selectedChallenge.id}`;
            const method = formMode === "create" ? apiPost : apiPut;

            await method(endpoint, formData);

            toast.success(`Đã ${formMode === "create" ? "tạo" : "cập nhật"} thử thách thành công`);
            setIsFormOpen(false);
            fetchChallenges();
        } catch (err: any) {
            toast.error(err.message || "Lỗi lưu dữ liệu");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── DYNAMIC DASHBOARD METRICS ───
    const stats = {
        activeChallenges: challenges.filter(c => deriveStatus(c) === "Active").length,
        totalParticipants: challenges.reduce((sum, c) => sum + (c.participants_count || 0), 0),
        avgCompletion: challenges.length > 0
            ? Math.round(challenges.reduce((sum, c) => sum + (c.completion_rate || 0), 0) / challenges.length)
            : 0,
        totalXP: challenges.reduce((sum, c) => sum + (c.xp_reward || 0), 0),
    };

    if (isLoading) {
        return (
            <Column fillWidth fillHeight vertical="center" horizontal="center" gap={16} background="page">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
                <Text variant="body-default-m" style={{ color: "#8E8E93" }}>Đang kết nối Command Center...</Text>
            </Column>
        );
    }

    if (error) {
        return (
            <Column fillWidth fillHeight vertical="center" horizontal="center" gap={16} background="page">
                <AlertCircle size={48} className="text-[#FF3B30]" />
                <Text variant="body-strong-m">Lỗi hệ thống</Text>
                <Text variant="body-default-s" style={{ color: "#8E8E93" }}>{error}</Text>
                <Button variant="secondary" onClick={() => fetchChallenges()}>Thử lại</Button>
            </Column>
        );
    }

    return (
        <Column
            fillWidth
            style={{
                minHeight: "100vh",
                background: "#F2F2F7",
                overflowY: "auto",
            }}
        >
            {/* ─── HERO HEADER: Trạm điều khiển trung tâm ─── */}
            <div
                className="w-full shrink-0"
                style={{
                    background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
                    padding: "48px 48px 40px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow Effects (Cái này làm nên độ hoành tráng) */}
                <div style={{
                    position: "absolute", top: -100, right: -50, width: 350, height: 350,
                    borderRadius: "50%", background: "rgba(0,122,255,0.15)", filter: "blur(90px)"
                }} />

                <div className="relative max-w-[1400px] mx-auto w-full flex flex-col">
                    <Row fillWidth horizontal="between" vertical="end" style={{ marginBottom: 32 }}>
                        <Column gap={8}>
                            <Row gap={12} vertical="center">
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                    <Trophy size={28} className="text-[#FBBF24]" />
                                </div>
                                <Heading variant="heading-strong-l" style={{ color: "#fff" }}>
                                    Challenge Command Center
                                </Heading>
                            </Row>
                            <Text variant="body-default-m" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500 }}>
                                Quản lý, điều phối và theo dõi hiệu suất các thử thách trên toàn hệ thống TasteMap.
                            </Text>
                        </Column>

                        <Button
                            size="l"
                            variant="primary"
                            style={{ borderRadius: 16 }}
                            onClick={() => {
                                setFormMode("create");
                                setSelectedChallenge(null);
                                setIsFormOpen(true);
                            }}
                        >
                            <Plus size={20} style={{ marginRight: 8 }} />
                            Tạo Thử Thách Mới
                        </Button>
                    </Row>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 w-full">
                        {[
                            { label: "Active Challenges", value: stats.activeChallenges.toString(), icon: <Zap size={16} />, color: "#34C759" },
                            { label: "Total Participants", value: stats.totalParticipants >= 1000 ? `${(stats.totalParticipants / 1000).toFixed(1)}k` : stats.totalParticipants.toString(), icon: <Users size={16} />, color: "#007AFF" },
                            { label: "Avg. Completion", value: `${stats.avgCompletion}%`, icon: <TrendingUp size={16} />, color: "#AF52DE" },
                            { label: "XP Distributed", value: stats.totalXP >= 1000 ? `${(stats.totalXP / 1000).toFixed(0)}k` : stats.totalXP.toString(), icon: <Trophy size={16} />, color: "#FBBF24" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    padding: "20px",
                                    borderRadius: "24px",
                                }}
                            >
                                <Row gap={8} vertical="center" style={{ marginBottom: 12 }}>
                                    <div style={{ color: stat.color }}>{stat.icon}</div>
                                    <Text variant="body-default-xs" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {stat.label}
                                    </Text>
                                </Row>
                                <Text variant="heading-strong-m" style={{ color: "#fff" }}>{stat.value}</Text>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT: Management Area ─── */}
            <div className="max-w-[1400px] mx-auto w-full px-12 py-10 flex flex-col gap-8">

                {/* Toolbar: Search & Tabs */}
                <Row fillWidth horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: 20 }}>
                    <Row gap={4} style={{ background: "rgba(0,0,0,0.05)", padding: 4, borderRadius: 16 }}>
                        {["All", "Active", "Scheduled", "Draft", "Expired"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className="px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all"
                                style={activeTab === tab
                                    ? { background: "#fff", color: "#1C1C1E", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
                                    : { color: "#8E8E93" }
                                }
                            >
                                {tab}
                            </button>
                        ))}
                    </Row>

                    <Row gap={12} style={{ flex: 1, maxWidth: 400 }}>
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm thử thách..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <IconButton icon={<Filter size={18} />} variant="tertiary" />
                    </Row>
                </Row>

                {/* Challenge Data Table / Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {filteredChallenges.map((challenge) => (
                            <Row
                                key={challenge.id}
                                fillWidth
                                vertical="center"
                                horizontal="between"
                                style={{
                                    background: "#fff",
                                    padding: "16px 24px",
                                    borderRadius: "24px",
                                    border: "1px solid rgba(0,0,0,0.04)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                                }}
                            >
                                <Row gap={20} vertical="center" style={{ flex: 2 }}>
                                    <div className={`p-4 rounded-2xl ${challenge.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                                        challenge.difficulty === 'Medium' ? 'bg-blue-50 text-blue-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                        <Zap size={20} />
                                    </div>
                                    <Column gap={4}>
                                        <Text variant="body-strong-m" style={{ color: "#1C1C1E" }}>{challenge.title}</Text>
                                        <Row gap={12} vertical="center">
                                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>{challenge.category}</Text>
                                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D1D6" }} />
                                            <Text variant="body-default-xs" style={{
                                                fontWeight: 700, color:
                                                    challenge.difficulty === 'Easy' ? '#34C759' :
                                                        challenge.difficulty === 'Medium' ? '#007AFF' : '#FF3B30'
                                            }}>
                                                {challenge.difficulty}
                                            </Text>
                                        </Row>
                                    </Column>
                                </Row>

                                <Row gap={40} vertical="center" style={{ flex: 3, justifyContent: "center" }}>
                                    <Column align="center">
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>XP Reward</Text>
                                        <Text variant="body-strong-s" style={{ color: "#FBBF24" }}>+{challenge.xp_reward} XP</Text>
                                    </Column>
                                    <Column align="center">
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Participants</Text>
                                        <Text variant="body-strong-s">{challenge.participants_count?.toLocaleString() || 0}</Text>
                                    </Column>
                                    <Column align="center" style={{ minWidth: 100 }}>
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Completion</Text>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#007AFF]" style={{ width: `${challenge.completion_rate}%` }} />
                                        </div>
                                        <Text variant="body-default-xs" style={{ fontWeight: 700, marginTop: 4 }}>{challenge.completion_rate}%</Text>
                                    </Column>
                                </Row>

                                <Row gap={8} style={{ flex: 1, justifyContent: "flex-end" }}>
                                    <IconButton
                                        icon={<Eye size={16} />}
                                        variant="tertiary"
                                        size="s"
                                        onClick={() => {
                                            setSelectedChallenge(challenge);
                                            setIsViewOpen(true);
                                        }}
                                    />
                                    <IconButton
                                        icon={<Edit3 size={16} />}
                                        variant="tertiary"
                                        size="s"
                                        onClick={() => {
                                            setFormMode("edit");
                                            setSelectedChallenge(challenge);
                                            setIsFormOpen(true);
                                        }}
                                    />
                                    <IconButton
                                        icon={<Trash2 size={16} />}
                                        variant="tertiary"
                                        size="s"
                                        style={{ color: "#FF3B30" }}
                                        onClick={() => {
                                            setSelectedChallenge(challenge);
                                            setIsDeleteOpen(true);
                                        }}
                                    />
                                </Row>
                            </Row>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ─── MODALS ─── */}
            <Toaster position="top-right" expand={false} richColors />

            <ChallengeFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedChallenge}
                mode={formMode}
                isSubmitting={isSubmitting}
            />

            <ChallengeViewModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                challenge={selectedChallenge}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                challengeTitle={selectedChallenge?.title}
                isSubmitting={isSubmitting}
            />
        </Column>
    );
}

// ═══════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS: MODALS
// ═══════════════════════════════════════════════════════════════════════

function ChallengeFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting }: any) {
    const [formData, setFormData] = useState<any>({
        title: "", description: "", category: "discovery", difficulty: "Easy",
        xp_reward: 100, target_count: 1, action_type: "check_in",
        action_filter: "{}", icon: "trophy", accent_color: "#007AFF",
        badge_id: "", duration_days: "", start_date: "", end_date: "",
        is_active: true, is_recurring: false
    });

    useEffect(() => {
        if (initialData && mode === "edit") {
            setFormData({
                ...initialData,
                badge_id: initialData.badge_id || "",
                duration_days: initialData.duration_days || "",
                start_date: initialData.start_date ? initialData.start_date.substring(0, 16) : "",
                end_date: initialData.end_date ? initialData.end_date.substring(0, 16) : "",
                action_filter: JSON.stringify(initialData.action_filter || {}, null, 2)
            });
        } else {
            setFormData({
                title: "", description: "", category: "discovery", difficulty: "Easy",
                xp_reward: 100, target_count: 1, action_type: "check_in",
                action_filter: "{}", icon: "trophy", accent_color: "#007AFF",
                badge_id: "", duration_days: "", start_date: "", end_date: "",
                is_active: true, is_recurring: false
            });
        }
    }, [initialData, mode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalData = {
                ...formData,
                action_filter: JSON.parse(formData.action_filter),
                xp_reward: Number(formData.xp_reward),
                target_count: Number(formData.target_count),
                badge_id: formData.badge_id ? Number(formData.badge_id) : null,
                duration_days: formData.duration_days ? Number(formData.duration_days) : null,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
            };
            onSubmit(finalData);
        } catch (err) {
            toast.error("Vui lòng kiểm tra lại dữ liệu nhập vào (VD: Action Filter JSON)");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-[70%] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <Heading variant="heading-strong-m">
                        {mode === "create" ? "Tạo Thử Thách Mới" : "Chỉnh Sửa Thử Thách"}
                    </Heading>
                    <IconButton icon={<X size={20} />} variant="tertiary" onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                    <Column gap={24}>
                        {/* Section 1: Basic Info */}
                        <Column gap={12}>
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Basic Information</Text>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all"
                                placeholder="Tên thử thách..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all min-h-[100px]"
                                placeholder="Mô tả chi tiết..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Column>

                        {/* Section 2: Mechanics */}
                        <Column gap={12}>
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Mechanics & Reward</Text>
                            <Row gap={12}>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Category</Text>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {["discovery", "social", "review", "cuisine", "streak"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Difficulty</Text>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        {["Easy", "Medium", "Hard"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </Row>

                            <Row gap={12}>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>XP Reward</Text>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.xp_reward}
                                        onChange={e => setFormData({ ...formData, xp_reward: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Target Count</Text>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.target_count}
                                        onChange={e => setFormData({ ...formData, target_count: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Badge ID (Optional)</Text>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.badge_id}
                                        onChange={e => setFormData({ ...formData, badge_id: e.target.value })}
                                        placeholder="Để trống nếu không có..."
                                    />
                                </div>
                            </Row>

                            <Row gap={12}>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Icon (Lucide name)</Text>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Accent Color</Text>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="h-[46px] w-[46px] bg-transparent border-none p-0 cursor-pointer"
                                            value={formData.accent_color}
                                            onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                                        />
                                        <input
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none uppercase"
                                            value={formData.accent_color}
                                            onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </Row>
                        </Column>

                        {/* Section 3: Timing & Validation */}
                        <Column gap={12}>
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Timing & Validation</Text>
                            <Row gap={12}>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Action Type</Text>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.action_type}
                                        onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                                    >
                                        {["check_in", "post_review", "add_friend", "join_group"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Duration (Days)</Text>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.duration_days}
                                        onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                                        placeholder="Hết hạn sau X ngày..."
                                    />
                                </div>
                            </Row>

                            <Row gap={12}>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Start Date</Text>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>End Date</Text>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </Row>

                            <div className="flex-1">
                                <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Action Filter (JSON)</Text>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-800 text-green-400 font-mono text-xs border border-gray-200 rounded-xl outline-none min-h-[80px]"
                                    value={formData.action_filter}
                                    onChange={e => setFormData({ ...formData, action_filter: e.target.value })}
                                />
                            </div>
                        </Column>

                        <Row gap={20}>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <Text variant="body-default-s">Kích hoạt ngay</Text>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_recurring} onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })} />
                                <Text variant="body-default-s">Thử thách lặp lại</Text>
                            </label>
                        </Row>
                    </Column>
                </form>

                <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <Button variant="tertiary" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Đang lưu..." : (
                            <Row gap={8} vertical="center">
                                <Save size={18} />
                                {mode === "create" ? "Tạo thử thách" : "Lưu thay đổi"}
                            </Row>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

function ChallengeViewModal({ isOpen, onClose, challenge }: any) {
    const StatusBadge = ({ status }: any) => {
        const colors: any = {
            Active: { bg: "#E3F2FD", text: "#1976D2" },
            Scheduled: { bg: "#F3E5F5", text: "#7B1FA2" },
            Expired: { bg: "#FFEBEE", text: "#D32F2F" },
            Draft: { bg: "#F5F5F5", text: "#616161" }
        };
        const color = colors[status] || colors.Draft;
        return (
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: color.bg, color: color.text }}>
                {status}
            </div>
        );
    };

    // QUAN TRỌNG: Phải check biến isOpen và challenge tồn tại trước khi render
    if (!isOpen || !challenge) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-8">
                    <Row horizontal="between" vertical="start">
                        <Column gap={8}>
                            <Row gap={8} vertical="center">
                                <StatusBadge status={challenge.computedStatus} />
                                <div className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                    {challenge.category}
                                </div>
                            </Row>
                            <Heading variant="heading-strong-m" style={{ marginTop: 8 }}>{challenge.title}</Heading>
                        </Column>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border-2" style={{ borderColor: challenge.accent_color, color: challenge.accent_color }}>
                                <IconButton icon={<X size={20} />} variant="tertiary" onClick={onClose} />
                            </div>
                        </div>
                    </Row>

                    <div className="my-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <Text variant="body-default-m" style={{ color: "#48484A" }}>{challenge.description}</Text>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30 text-center">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Hoàn thành</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#007AFF" }}>{challenge.completion_rate}%</Heading>
                        </div>
                        <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-100/30 text-center">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Phần thưởng</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#AF52DE" }}>+{challenge.xp_reward} XP</Heading>
                        </div>
                        <div className="p-4 bg-green-50/30 rounded-2xl border border-green-100/30 text-center">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Người chơi</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#34C759" }}>{challenge.participants_count}</Heading>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-12">
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Hành động yêu cầu</Text>
                            <Text variant="body-strong-s">{challenge.action_type} ({challenge.target_count} lần)</Text>
                        </Column>
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Badge ID</Text>
                            <Text variant="body-strong-s">{challenge.badge_id || "None"}</Text>
                        </Column>
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Thời hạn (Days)</Text>
                            <Text variant="body-strong-s">{challenge.duration_days || "Vĩnh viễn"}</Text>
                        </Column>
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Định kỳ</Text>
                            <Text variant="body-strong-s">{challenge.is_recurring ? "Có" : "Không"}</Text>
                        </Column>
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Ngày bắt đầu</Text>
                            <Text variant="body-strong-s">{challenge.start_date ? new Date(challenge.start_date).toLocaleDateString() : "N/A"}</Text>
                        </Column>
                        <Column gap={2}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Ngày kết thúc</Text>
                            <Text variant="body-strong-s">{challenge.end_date ? new Date(challenge.end_date).toLocaleDateString() : "N/A"}</Text>
                        </Column>
                    </div>

                    <div className="mt-6">
                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Action Filter (Raw)</Text>
                        <div className="p-3 bg-gray-900 rounded-xl font-mono text-[10px] text-green-400 overflow-auto max-h-[100px]">
                            {JSON.stringify(challenge.action_filter, null, 2)}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-100">
                    <Button variant="tertiary" onClick={onClose} fillWidth>Đóng cửa sổ</Button>
                </div>
            </motion.div>
        </div>
    );
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, challengeTitle, isSubmitting }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full rounded-[32px] p-8 shadow-2xl text-center"
            >
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                    <AlertIcon size={32} className="text-[#FF3B30]" />
                </div>
                <Heading variant="heading-strong-s" style={{ marginBottom: 12 }}>Xoá thử thách?</Heading>
                <Text variant="body-default-m" style={{ color: "#8E8E93", marginBottom: 32 }}>
                    Bạn có chắc chắn muốn xoá <span className="text-black font-bold">"{challengeTitle}"</span>?
                    Hành động này sẽ xoá toàn bộ dữ liệu tham gia của người dùng và không thể hoàn tác.
                </Text>

                <Row gap={12}>
                    <Button variant="tertiary" onClick={onClose} fillWidth disabled={isSubmitting}>Huỷ bỏ</Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        fillWidth
                        style={{ background: "#FF3B30", border: 'none' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang xoá..." : "Xoá vĩnh viễn"}
                    </Button>
                </Row>
            </motion.div>
        </div>
    );
}
