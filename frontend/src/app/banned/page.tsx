"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, LogOut, Mail, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function BannedPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">

      {/* ── BACKGROUND GLOW EFFECTS (Tạo không khí nghiêm trọng) ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-900/5 blur-[100px] rounded-full pointer-events-none" />

      {/* ── MAIN CONTENT CARD ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} // Custom easing for premium feel
        className="relative z-10 w-full max-w-lg bg-[#111113]/80 backdrop-blur-2xl border border-red-500/20 rounded-[32px] p-8 md:p-10 text-center shadow-[0_8px_32px_rgba(239,68,68,0.08)] overflow-hidden"
      >
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        {/* ── ICON & PULSE ANIMATION ── */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-red-500 rounded-full blur-xl w-20 h-20 m-auto"
          />
          <div className="relative w-20 h-20 bg-gradient-to-br from-red-500/10 to-red-900/20 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-inner">
            <ShieldAlert className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" size={36} />
          </div>
        </div>

        {/* ── HEADINGS ── */}
        <h1 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white/90">
          Tài khoản bị đình chỉ
        </h1>

        <p className="text-[#8E8E93] mb-8 text-[15px] leading-relaxed mx-auto max-w-[90%]">
          Quyền truy cập của bạn vào TasteMap đã bị khóa do không tuân thủ các Tiêu chuẩn Cộng đồng. Chúng tôi xây dựng một môi trường văn minh và an toàn cho tất cả mọi người.
        </p>

        {/* ── DETAILS BOX (Glassmorphism) ── */}
        <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
          <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-400">
            Nếu bạn tin rằng đây là một sự nhầm lẫn của hệ thống, vui lòng gửi yêu cầu xem xét lại cho chúng tôi.
          </p>
        </div>

        {/* ── ACTIONS ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.href = "mailto:support@tastemap.app?subject=Yêu%20cầu%20Kháng%20cáo%20-%20TasteMap"}
            className="w-full group relative inline-flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 active:scale-[0.98] overflow-hidden"
          >
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <Mail size={18} className="text-gray-400 group-hover:text-white transition-colors" />
            <span>Gửi Yêu Cầu Kháng Cáo</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-4 bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </motion.div>

      <p className="mt-8 text-[11px] text-[#48484A] font-bold tracking-[0.2em] uppercase">
        TasteMap Security System
      </p>

      {/* Global style for the shine animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}