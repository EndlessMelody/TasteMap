"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Column, Row, Grid, Heading, Text, Button, IconButton
} from "@once-ui-system/core";
import {
    Trophy, Plus, Search, Filter, MoreVertical,
    CheckCircle2, Clock, AlertCircle, TrendingUp
} from "lucide-react";
import { Zap, Edit3, Trash2, Eye, X, Save, AlertCircle as AlertIcon, Users } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast, Toaster } from "sonner";
import type { AdminChallenge, AdminChallengeStatus, ChallengeFormData } from "@/types/challenges";

export default function ChallengeManagementPage() {
    const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"All" | AdminChallengeStatus>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<AdminChallenge | null>(null);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Tính toán trạng thái dựa trên thời gian và flag is_active
    const deriveStatus = useCallback((c: AdminChallenge): AdminChallengeStatus => {
        if (!c.is_active) return "Draft";
        const now = new Date();
        if (c.start_date && new Date(c.start_date) > now) return "Scheduled";
        if (c.end_date && new Date(c.end_date) < now) return "Expired";
        return "Active";
    }, []);

    const fetchChallenges = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiGet<AdminChallenge[]>("/api/v1/challenges");
            if (Array.isArray(response)) {
                const enriched = response.map((c) => ({
                    ...c,
                    computedStatus: deriveStatus(c)
                }));
                setChallenges(enriched);
            } else {
                setError("Định dạng dữ liệu không hợp lệ từ máy chủ");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi kết nối API");
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
            await apiDelete<void>(`/api/v1/challenges/${selectedChallenge.id}`);
            toast.success("Đã xoá thử thách thành công");
            setIsDeleteOpen(false);
            fetchChallenges();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Lỗi khi xoá thử thách");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = async (formData: Record<string, unknown>) => {
        if (!selectedChallenge && formMode === "edit") return;
        setIsSubmitting(true);
        try {
            const endpoint = formMode === "create" ? "/api/v1/challenges/" : `/api/v1/challenges/${selectedChallenge!.id}`;
            const method = formMode === "create" ? apiPost : apiPut;

            await method(endpoint, formData);

            toast.success(`Đã ${formMode === "create" ? "tạo" : "cập nhật"} thử thách thành công`);
            setIsFormOpen(false);
            fetchChallenges();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
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
            <Column fillWidth fillHeight vertical="center" horizontal="center" gap="16" background="page">
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <Column style={{
                    animation: "spin 0.8s linear infinite",
                    borderRadius: 9999,
                    height: 48,
                    width: 48,
                    borderBottom: "2px solid #007AFF",
                }} />
                <Text variant="body-default-m" style={{ color: "#8E8E93" }}>Đang kết nối Command Center...</Text>
            </Column>
        );
    }

    if (error) {
        return (
            <Column fillWidth fillHeight vertical="center" horizontal="center" gap="16" background="page">
                <AlertCircle size={48} style={{ color: "#FF3B30" }} />
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
            <Column
                fillWidth
                style={{
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
                    paddingTop: "48px",
                    paddingLeft: "48px",
                    paddingRight: "48px",
                    paddingBottom: "40px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow Effects (Cái này làm nên độ hoành tráng) */}
                <Column style={{
                    position: "absolute", top: -100, right: -50, width: 350, height: 350,
                    borderRadius: "50%", background: "rgba(0,122,255,0.15)", filter: "blur(90px)"
                }} />

                <Column fillWidth style={{ position: "relative", maxWidth: 1400, marginTop: 0, marginBottom: 0, marginLeft: "auto", marginRight: "auto" }}>
                    <Row fillWidth horizontal="between" vertical="end" style={{ marginBottom: 32 }}>
                        <Column gap="8">
                            <Row gap="12" vertical="center">
                                <Column style={{
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    paddingLeft: 12,
                                    paddingRight: 12,
                                    borderRadius: 16,
                                    background: "rgba(255,255,255,0.1)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}>
                                    <Trophy size={28} style={{ color: "#FBBF24" }} />
                                </Column>
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
                    <Grid fillWidth gap="16" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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
                                <Row gap="8" vertical="center" style={{ marginBottom: 12 }}>
                                    <Column style={{ color: stat.color }}>{stat.icon}</Column>
                                    <Text variant="body-default-xs" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {stat.label}
                                    </Text>
                                </Row>
                                <Text variant="heading-strong-m" style={{ color: "#fff" }}>{stat.value}</Text>
                            </motion.div>
                        ))}
                    </Grid>
                </Column>
            </Column>

            {/* ─── MAIN CONTENT: Management Area ─── */}
            <Column
                gap="32"
                style={{
                    maxWidth: 1400,
                    marginTop: 0,
                    marginBottom: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "100%",
                    paddingTop: "40px",
                    paddingBottom: "40px",
                    paddingLeft: "48px",
                    paddingRight: "48px",
                }}
            >

                {/* Toolbar: Search & Tabs */}
                <Row fillWidth horizontal="between" vertical="center" style={{ flexWrap: "wrap", gap: 20 }}>
                    <Row gap="4" style={{ background: "rgba(0,0,0,0.05)", paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, borderRadius: 16 }}>
                        {(["All", "Active", "Scheduled", "Draft", "Expired"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "10px 24px",
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    transition: "all 0.2s",
                                    border: "none",
                                    cursor: "pointer",
                                    ...(activeTab === tab
                                        ? { background: "#fff", color: "#1C1C1E", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
                                        : { background: "transparent", color: "#8E8E93" })
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </Row>

                    <Row gap="12" style={{ flex: 1, maxWidth: 400 }}>
                        <Column fillWidth style={{ position: "relative" }}>
                            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#8E8E93" }} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm thử thách..."
                                style={{
                                    width: "100%",
                                    paddingLeft: 48,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    background: "#fff",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    borderRadius: 16,
                                    fontSize: 14,
                                    outline: "none",
                                    transition: "all 0.2s",
                                }}
                                onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.2)"; }}
                                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Column>
                        <IconButton variant="tertiary">
                            <Filter size={18} />
                        </IconButton>
                    </Row>
                </Row>

                {/* Challenge Data Table / Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 16 }}
                    >
                        {filteredChallenges.map((challenge) => (
                            <Row
                                key={challenge.id}
                                fillWidth
                                vertical="center"
                                horizontal="between"
                                style={{
                                    background: "#fff",
                                    paddingTop: "16px",
                                    paddingBottom: "16px",
                                    paddingLeft: "24px",
                                    paddingRight: "24px",
                                    borderRadius: "24px",
                                    border: "1px solid rgba(0,0,0,0.04)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                                }}
                            >
                                <Row gap="20" vertical="center" style={{ flex: 2 }}>
                                    <Column style={{
                                        paddingTop: 16,
                                        paddingBottom: 16,
                                        paddingLeft: 16,
                                        paddingRight: 16,
                                        borderRadius: 16,
                                        ...(challenge.difficulty === 'Easy'
                                            ? { background: "#F0FDF4", color: "#16A34A" }
                                            : challenge.difficulty === 'Medium'
                                                ? { background: "#EFF6FF", color: "#2563EB" }
                                                : { background: "#FEF2F2", color: "#DC2626" })
                                    }}>
                                        <Zap size={20} />
                                    </Column>
                                    <Column gap="4">
                                        <Text variant="body-strong-m" style={{ color: "#1C1C1E" }}>{challenge.title}</Text>
                                        <Row gap="12" vertical="center">
                                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>{challenge.category}</Text>
                                            <Column style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D1D6" }} />
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

                                <Row gap="40" vertical="center" style={{ flex: 3, justifyContent: "center" }}>
                                    <Column horizontal="center">
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>XP Reward</Text>
                                        <Text variant="body-strong-s" style={{ color: "#FBBF24" }}>+{challenge.xp_reward} XP</Text>
                                    </Column>
                                    <Column horizontal="center">
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Participants</Text>
                                        <Text variant="body-strong-s">{challenge.participants_count?.toLocaleString() || 0}</Text>
                                    </Column>
                                    <Column horizontal="center" style={{ minWidth: 100 }}>
                                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Completion</Text>
                                        <Column fillWidth style={{ height: 6, background: "#F3F4F6", borderRadius: 9999, overflow: "hidden" }}>
                                            <Column style={{ height: "100%", background: "#007AFF", width: `${challenge.completion_rate}%` }} />
                                        </Column>
                                        <Text variant="body-default-xs" style={{ fontWeight: 700, marginTop: 4 }}>{challenge.completion_rate}%</Text>
                                    </Column>
                                </Row>

                                <Row gap="8" style={{ flex: 1, justifyContent: "flex-end" }}>
                                    <IconButton
                                        variant="tertiary"
                                        size="s"
                                        onClick={() => {
                                            setSelectedChallenge(challenge);
                                            setIsViewOpen(true);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </IconButton>
                                    <IconButton
                                        variant="tertiary"
                                        size="s"
                                        onClick={() => {
                                            setFormMode("edit");
                                            setSelectedChallenge(challenge);
                                            setIsFormOpen(true);
                                        }}
                                    >
                                        <Edit3 size={16} />
                                    </IconButton>
                                    <IconButton
                                        variant="tertiary"
                                        size="s"
                                        style={{ color: "#FF3B30" }}
                                        onClick={() => {
                                            setSelectedChallenge(challenge);
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Row>
                            </Row>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </Column>

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

interface ChallengeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
    initialData: AdminChallenge | null;
    mode: "create" | "edit";
    isSubmitting: boolean;
}

function ChallengeFormModal({ isOpen, onClose, onSubmit, initialData, mode, isSubmitting }: ChallengeFormModalProps) {
    const [formData, setFormData] = useState<ChallengeFormData>({
        title: "", description: "", category: "discovery", difficulty: "Easy",
        xp_reward: 100, target_count: 1, action_type: "check_in",
        action_filter: "{}", icon: "trophy", accent_color: "#007AFF",
        badge_id: "", duration_days: "", start_date: "", end_date: "",
        is_active: true, is_recurring: false
    });

    useEffect(() => {
        if (initialData && mode === "edit") {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                category: initialData.category,
                difficulty: initialData.difficulty,
                xp_reward: initialData.xp_reward,
                target_count: initialData.target_count,
                action_type: initialData.action_type,
                icon: initialData.icon,
                accent_color: initialData.accent_color,
                is_active: initialData.is_active,
                is_recurring: initialData.is_recurring,
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

    const focusRing = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.2)"; };
    const blurRing = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = "none"; };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        outline: "none",
        transition: "all 0.2s",
    };

    return (
        <Row horizontal="center" vertical="center" style={{ position: "fixed", inset: 0, zIndex: 100, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                    background: "#fff",
                    width: "70%",
                    borderRadius: 32,
                    overflow: "hidden",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                }}
            >
                <Row horizontal="between" vertical="center" style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "32px", paddingRight: "32px", borderBottom: "1px solid #F3F4F6", background: "rgba(249,250,251,0.5)" }}>
                    <Heading variant="heading-strong-m">
                        {mode === "create" ? "Tạo Thử Thách Mới" : "Chỉnh Sửa Thử Thách"}
                    </Heading>
                    <IconButton variant="tertiary" onClick={onClose}>
                        <X size={20} />
                    </IconButton>
                </Row>

                <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                    <Column gap="24">
                        {/* Section 1: Basic Info */}
                        <Column gap="12">
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Basic Information</Text>
                            <input
                                style={inputStyle}
                                onFocus={focusRing}
                                onBlur={blurRing}
                                placeholder="Tên thử thách..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <textarea
                                style={{ ...inputStyle, minHeight: 100 }}
                                onFocus={focusRing}
                                onBlur={blurRing}
                                placeholder="Mô tả chi tiết..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Column>

                        {/* Section 2: Mechanics */}
                        <Column gap="12">
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Mechanics & Reward</Text>
                            <Row gap="12">
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Category</Text>
                                    <select
                                        style={inputStyle}
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {["discovery", "social", "review", "cuisine", "streak"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Difficulty</Text>
                                    <select
                                        style={inputStyle}
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value as ChallengeFormData["difficulty"] })}
                                    >
                                        {["Easy", "Medium", "Hard"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </Column>
                            </Row>

                            <Row gap="12">
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>XP Reward</Text>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={formData.xp_reward}
                                        onChange={e => setFormData({ ...formData, xp_reward: e.target.value })}
                                    />
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Target Count</Text>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={formData.target_count}
                                        onChange={e => setFormData({ ...formData, target_count: e.target.value })}
                                    />
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Badge ID (Optional)</Text>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={formData.badge_id}
                                        onChange={e => setFormData({ ...formData, badge_id: e.target.value })}
                                        placeholder="Để trống nếu không có..."
                                    />
                                </Column>
                            </Row>

                            <Row gap="12">
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Icon (Lucide name)</Text>
                                    <input
                                        style={inputStyle}
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    />
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Accent Color</Text>
                                    <Row gap="8">
                                        <input
                                            type="color"
                                            style={{ height: 46, width: 46, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                                            value={formData.accent_color}
                                            onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                                        />
                                        <input
                                            style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                                            value={formData.accent_color}
                                            onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                                        />
                                    </Row>
                                </Column>
                            </Row>
                        </Column>

                        {/* Section 3: Timing & Validation */}
                        <Column gap="12">
                            <Text variant="body-strong-s" style={{ color: "#007AFF", textTransform: "uppercase" }}>Timing & Validation</Text>
                            <Row gap="12">
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Action Type</Text>
                                    <select
                                        style={inputStyle}
                                        value={formData.action_type}
                                        onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                                    >
                                        {["check_in", "post_review", "add_friend", "join_group"].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Duration (Days)</Text>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={formData.duration_days}
                                        onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                                        placeholder="Hết hạn sau X ngày..."
                                    />
                                </Column>
                            </Row>

                            <Row gap="12">
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Start Date</Text>
                                    <input
                                        type="datetime-local"
                                        style={inputStyle}
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </Column>
                                <Column style={{ flex: 1 }}>
                                    <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>End Date</Text>
                                    <input
                                        type="datetime-local"
                                        style={inputStyle}
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </Column>
                            </Row>

                            <Column style={{ flex: 1 }}>
                                <Text variant="body-default-xs" style={{ marginBottom: 4, color: "#8E8E93" }}>Action Filter (JSON)</Text>
                                <textarea
                                    style={{
                                        ...inputStyle,
                                        background: "#1F2937",
                                        color: "#4ADE80",
                                        fontFamily: "monospace",
                                        fontSize: 12,
                                        minHeight: 80,
                                    }}
                                    value={formData.action_filter}
                                    onChange={e => setFormData({ ...formData, action_filter: e.target.value })}
                                />
                            </Column>
                        </Column>

                        <Row gap="20">
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <Text variant="body-default-s">Kích hoạt ngay</Text>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input type="checkbox" checked={formData.is_recurring} onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })} />
                                <Text variant="body-default-s">Thử thách lặp lại</Text>
                            </label>
                        </Row>
                    </Column>
                </form>

                <Row horizontal="end" gap="12" style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "32px", paddingRight: "32px", borderTop: "1px solid #F3F4F6", background: "rgba(249,250,251,0.5)" }}>
                    <Button variant="tertiary" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Đang lưu..." : (
                            <Row gap="8" vertical="center">
                                <Save size={18} />
                                {mode === "create" ? "Tạo thử thách" : "Lưu thay đổi"}
                            </Row>
                        )}
                    </Button>
                </Row>
            </motion.div>
        </Row>
    );
}

interface ChallengeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenge: AdminChallenge | null;
}

function ChallengeViewModal({ isOpen, onClose, challenge }: ChallengeViewModalProps) {
    const StatusBadge = ({ status }: { status?: AdminChallengeStatus }) => {
        const colors: Record<AdminChallengeStatus, { bg: string; text: string }> = {
            Active: { bg: "#E3F2FD", text: "#1976D2" },
            Scheduled: { bg: "#F3E5F5", text: "#7B1FA2" },
            Expired: { bg: "#FFEBEE", text: "#D32F2F" },
            Draft: { bg: "#F5F5F5", text: "#616161" }
        };
        const color = (status ? colors[status] : undefined) || colors.Draft;
        return (
            <Column style={{
                paddingTop: "4px",
                paddingBottom: "4px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: color.bg,
                color: color.text,
            }}>
                {status}
            </Column>
        );
    };

    // QUAN TRỌNG: Phải check biến isOpen và challenge tồn tại trước khi render
    if (!isOpen || !challenge) return null;

    return (
        <Row horizontal="center" vertical="center" style={{ position: "fixed", inset: 0, zIndex: 100, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    background: "#fff",
                    width: "100%",
                    borderRadius: 32,
                    overflow: "hidden",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                }}
            >
                <Column style={{ paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }}>
                    <Row horizontal="between" vertical="start">
                        <Column gap="8">
                            <Row gap="8" vertical="center">
                                <StatusBadge status={challenge.computedStatus} />
                                <Column style={{
                                    paddingTop: "4px",
                                    paddingBottom: "4px",
                                    paddingLeft: "12px",
                                    paddingRight: "12px",
                                    background: "#F3F4F6",
                                    color: "#6B7280",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    borderRadius: 9999,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    {challenge.category}
                                </Column>
                            </Row>
                            <Heading variant="heading-strong-m" style={{ marginTop: 8 }}>{challenge.title}</Heading>
                        </Column>
                        <Row gap="8">
                            <Row horizontal="center" vertical="center" style={{ width: 48, height: 48, borderRadius: 16, border: `2px solid ${challenge.accent_color}`, color: challenge.accent_color }}>
                                <IconButton variant="tertiary" onClick={onClose}>
                                    <X size={20} />
                                </IconButton>
                            </Row>
                        </Row>
                    </Row>

                    <Column style={{ marginTop: "24px", marginBottom: "24px", marginLeft: 0, marginRight: 0, paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, background: "#F9FAFB", borderRadius: 16, border: "1px solid #F3F4F6" }}>
                        <Text variant="body-default-m" style={{ color: "#48484A" }}>{challenge.description}</Text>
                    </Column>

                    <Grid gap="16" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                        <Column style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, background: "rgba(239,246,255,0.3)", borderRadius: 16, border: "1px solid rgba(219,234,254,0.3)", textAlign: "center" }}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Hoàn thành</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#007AFF" }}>{challenge.completion_rate}%</Heading>
                        </Column>
                        <Column style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, background: "rgba(250,245,255,0.3)", borderRadius: 16, border: "1px solid rgba(233,213,255,0.3)", textAlign: "center" }}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Phần thưởng</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#AF52DE" }}>+{challenge.xp_reward} XP</Heading>
                        </Column>
                        <Column style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, background: "rgba(240,253,244,0.3)", borderRadius: 16, border: "1px solid rgba(187,247,208,0.3)", textAlign: "center" }}>
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Người chơi</Text>
                            <Heading variant="heading-strong-s" style={{ color: "#34C759" }}>{challenge.participants_count}</Heading>
                        </Column>
                    </Grid>

                    <Grid style={{ marginTop: 32, gridTemplateColumns: "repeat(2, 1fr)", rowGap: 16, columnGap: 48 }}>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Hành động yêu cầu</Text>
                            <Text variant="body-strong-s">{challenge.action_type} ({challenge.target_count} lần)</Text>
                        </Column>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Badge ID</Text>
                            <Text variant="body-strong-s">{challenge.badge_id || "None"}</Text>
                        </Column>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Thời hạn (Days)</Text>
                            <Text variant="body-strong-s">{challenge.duration_days || "Vĩnh viễn"}</Text>
                        </Column>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Định kỳ</Text>
                            <Text variant="body-strong-s">{challenge.is_recurring ? "Có" : "Không"}</Text>
                        </Column>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Ngày bắt đầu</Text>
                            <Text variant="body-strong-s">{challenge.start_date ? new Date(challenge.start_date).toLocaleDateString() : "N/A"}</Text>
                        </Column>
                        <Column gap="2">
                            <Text variant="body-default-xs" style={{ color: "#8E8E93" }}>Ngày kết thúc</Text>
                            <Text variant="body-strong-s">{challenge.end_date ? new Date(challenge.end_date).toLocaleDateString() : "N/A"}</Text>
                        </Column>
                    </Grid>

                    <Column style={{ marginTop: 24 }}>
                        <Text variant="body-default-xs" style={{ color: "#8E8E93", marginBottom: 4 }}>Action Filter (Raw)</Text>
                        <Column style={{
                            paddingTop: 12,
                            paddingBottom: 12,
                            paddingLeft: 12,
                            paddingRight: 12,
                            background: "#111827",
                            borderRadius: 12,
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#4ADE80",
                            overflow: "auto",
                            maxHeight: 100,
                        }}>
                            {JSON.stringify(challenge.action_filter, null, 2)}
                        </Column>
                    </Column>
                </Column>
                <Row horizontal="center" style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, background: "#F9FAFB", borderTop: "1px solid #F3F4F6" }}>
                    <Button variant="tertiary" onClick={onClose} fillWidth>Đóng cửa sổ</Button>
                </Row>
            </motion.div>
        </Row>
    );
}

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    challengeTitle?: string;
    isSubmitting: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, challengeTitle, isSubmitting }: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <Row horizontal="center" vertical="center" style={{ position: "fixed", inset: 0, zIndex: 110, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: "#fff",
                    width: "100%",
                    borderRadius: 32,
                    padding: 32,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                    textAlign: "center",
                }}
            >
                <Row horizontal="center" vertical="center" style={{ marginTop: 0, marginLeft: "auto", marginRight: "auto", marginBottom: 24, width: 64, height: 64, background: "#FEF2F2", borderRadius: 16 }}>
                    <AlertIcon size={32} style={{ color: "#FF3B30" }} />
                </Row>
                <Heading variant="heading-strong-s" style={{ marginBottom: 12 }}>Xoá thử thách?</Heading>
                <Text variant="body-default-m" style={{ color: "#8E8E93", marginBottom: 32 }}>
                    Bạn có chắc chắn muốn xoá <span style={{ color: "#000", fontWeight: 700 }}>"{challengeTitle}"</span>?
                    Hành động này sẽ xoá toàn bộ dữ liệu tham gia của người dùng và không thể hoàn tác.
                </Text>

                <Row gap="12">
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
        </Row>
    );
}
