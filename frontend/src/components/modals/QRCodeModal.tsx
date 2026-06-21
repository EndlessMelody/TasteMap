// src/components/modals/QRCodeModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import QRCode from "react-qr-code";
import { Column } from "@once-ui-system/core";
import { tokens } from "@/styles/tokens";

// QR code brand foreground — display-only prop to react-qr-code library
const QR_FG_COLOR = "#ff6b35";

interface QRCodeModalProps {
    user?: any;
    isOpen?: boolean;
    onClose?: () => void;
    url?: string;
}

export default function QRCodeModal({ isOpen, onClose, url: providedUrl, user }: QRCodeModalProps) {
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
                        zIndex: 9999,
                        padding: "20px",
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: tokens.color.surface,
                            borderRadius: "24px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "340px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                            boxShadow: tokens.shadow.lg,
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                background: tokens.color.surfaceMuted,
                                border: "none",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: tokens.color.textMuted,
                            }}
                        >
                            <X size={18} />
                        </button>

                        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", color: tokens.color.text }}>
                            Mã QR TasteMap
                        </h3>
                        <p style={{ margin: "0 0 24px 0", fontSize: "0.85rem", color: tokens.color.textMuted, textAlign: "center" }}>
                            Dùng camera hoặc Zalo quét mã này để kết bạn nhé!
                        </p>

                        <Column
                            center
                            style={{
                                background: tokens.color.surface,
                                padding: "16px",
                                borderRadius: "20px",
                                border: "2px solid rgba(255, 107, 53, 0.1)",
                                boxShadow: tokens.shadow.sm,
                            }}
                        >
                            {url ? (
                                <QRCode
                                    value={url}
                                    size={200}
                                    fgColor={QR_FG_COLOR}
                                    level="H"
                                />
                            ) : (
                                <Column style={{ width: 200, height: 200, background: tokens.color.surfaceMuted }} />
                            )}
                        </Column>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
