// src/components/modals/QRCodeModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import QRCode from "react-qr-code";

interface QRCodeModalProps {
    user?: any;
    isOpen?: boolean;
    onClose?: () => void;
    url?: string;
}

export default function QRCodeModal({ isOpen, onClose, url: providedUrl, user }: QRCodeModalProps) {
    // Generate URL if not provided by parent
    const url = providedUrl || (user?.id ? `${window.location.origin}/foodies/${user.id}` : "");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999, // Phải đảm bảo z-index cao để đè lên mọi thứ
                        padding: "20px",
                    }}
                    onClick={onClose} // Bấm ra ngoài nền đen sẽ đóng modal
                >
                    {/* Vùng chứa nội dung Modal (ngăn sự kiện click truyền ra ngoài) */}
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "24px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "340px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {/* Nút tắt X */}
                        <button
                            onClick={onClose}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                background: "#f2f2f7",
                                border: "none",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#8e8e93",
                            }}
                        >
                            <X size={18} />
                        </button>

                        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", color: "#1c1c1e" }}>
                            Mã QR TasteMap
                        </h3>
                        <p style={{ margin: "0 0 24px 0", fontSize: "0.85rem", color: "#8e8e93", textAlign: "center" }}>
                            Dùng camera hoặc Zalo quét mã này để kết bạn nhé!
                        </p>

                        {/* Vùng vẽ mã QR */}
                        <div
                            style={{
                                background: "#ffffff",
                                padding: "16px",
                                borderRadius: "20px",
                                border: "2px solid rgba(255, 107, 53, 0.1)",
                                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.05)",
                            }}
                        >
                            {url ? (
                                <QRCode
                                    value={url}
                                    size={200}
                                    fgColor="#ff6b35" // Màu cam chủ đạo của app
                                    level="H" // Quality cao nhất để dễ quét
                                />
                            ) : (
                                <div style={{ width: 200, height: 200, backgroundColor: "#f9f9fb" }} />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}