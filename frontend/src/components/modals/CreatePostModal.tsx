import React from "react";
import { motion } from "framer-motion";
import { Row, Column, Text } from "@once-ui-system/core";
import { Camera, ChevronLeft, Star, Image as ImageIcon } from "lucide-react";
import { tokens } from "@/styles/tokens";

// Re-export original modal
export { CreatePostModal } from "./create-post";
export type { CreatePostModalProps } from "./create-post";

// ─── Gradient shade constants (TasteMap warm/red brand palette) ───
const WARM_GRADIENT = { dark: "#e85d2a", light: "#ff8c5a" };
const RED_GRADIENT = { base: "#ff4757", light: "#ff7675" };

interface CreatePostCardProps {
    onOpenCreatePost: () => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ onOpenCreatePost }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(255,107,53,0.18)",
            }}
        >
            {/* Card Header */}
            <Column
                style={{
                    position: "relative",
                    background: `linear-gradient(135deg, ${tokens.color.warm}, ${WARM_GRADIENT.dark}, ${WARM_GRADIENT.light})`,
                    padding: "20px 24px 18px",
                    overflow: "hidden",
                }}
            >
                {/* Decorative shimmer */}
                <motion.div
                    animate={{ x: ["calc(-100%)", "calc(200%)"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "60%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                        pointerEvents: "none",
                    }}
                />
                <Row style={{ gap: "12px", alignItems: "center" }}>
                    <Column
                        center
                        style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "10px",
                            borderRadius: "12px",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <Camera size={20} color="white" />
                    </Column>
                    <Column style={{ gap: "2px" }}>
                        <Text
                            style={{ color: "white", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}
                        >
                            Create Content
                        </Text>
                        <Text
                            style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem", fontWeight: 500 }}
                        >
                            Share your food journey
                        </Text>
                    </Column>
                </Row>
            </Column>

            {/* Action Buttons */}
            <Column
                style={{
                    backgroundColor: tokens.color.surface,
                    padding: "16px",
                    gap: "10px",
                    borderLeft: `1px solid ${tokens.color.border}`,
                    borderRight: `1px solid ${tokens.color.border}`,
                    borderBottom: `1px solid ${tokens.color.border}`,
                    borderBottomLeftRadius: "24px",
                    borderBottomRightRadius: "24px",
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: tokens.color.surfaceMuted }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenCreatePost}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: `1px solid ${tokens.color.border}`,
                        backgroundColor: tokens.color.surfaceMuted,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <Column
                        center
                        style={{
                            background: `linear-gradient(135deg, ${tokens.color.warm}, ${WARM_GRADIENT.light})`,
                            padding: "8px",
                            borderRadius: "10px",
                            flexShrink: 0,
                        }}
                    >
                        <Star size={16} color="white" fill="white" />
                    </Column>
                    <Column style={{ gap: "2px", flex: 1 }}>
                        <Text
                            style={{ color: tokens.color.text, fontWeight: 600, fontSize: "0.88rem" }}
                        >
                            Foodie Feed Post
                        </Text>
                        <Text
                            style={{ color: tokens.color.textMuted, fontSize: "0.75rem", fontWeight: 500 }}
                        >
                            Reviews, ratings & food stories
                        </Text>
                    </Column>
                    <ChevronLeft
                        size={16}
                        color={tokens.color.textMuted}
                        style={{ transform: "rotate(180deg)", flexShrink: 0 }}
                    />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: tokens.color.surfaceMuted }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenCreatePost}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: `1px solid ${tokens.color.border}`,
                        backgroundColor: tokens.color.surfaceMuted,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <Column
                        center
                        style={{
                            background: `linear-gradient(135deg, ${RED_GRADIENT.base}, ${RED_GRADIENT.light})`,
                            padding: "8px",
                            borderRadius: "10px",
                            flexShrink: 0,
                        }}
                    >
                        <ImageIcon size={16} color="white" />
                    </Column>
                    <Column style={{ gap: "2px", flex: 1 }}>
                        <Text
                            style={{ color: tokens.color.text, fontWeight: 600, fontSize: "0.88rem" }}
                        >
                            Discover Reel
                        </Text>
                        <Text
                            style={{ color: tokens.color.textMuted, fontSize: "0.75rem", fontWeight: 500 }}
                        >
                            Short-form video content
                        </Text>
                    </Column>
                    <ChevronLeft
                        size={16}
                        color={tokens.color.textMuted}
                        style={{ transform: "rotate(180deg)", flexShrink: 0 }}
                    />
                </motion.button>
            </Column>
        </motion.div>
    );
};