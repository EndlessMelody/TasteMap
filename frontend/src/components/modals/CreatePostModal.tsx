import React from "react";
import { motion } from "framer-motion";
import { Row, Column, Text } from "@/components/OnceUI";
import { Camera, ChevronLeft, Star, Image as ImageIcon } from "lucide-react";

// Re-export original modal
export { CreatePostModal } from "./create-post";
export type { CreatePostModalProps } from "./create-post";

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
            <div
                style={{
                    position: "relative",
                    background: "linear-gradient(135deg, #ff6b35, #e85d2a, #ff8c5a)",
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
                    <div
                        style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "10px",
                            borderRadius: "12px",
                            display: "flex",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <Camera size={20} color="white" />
                    </div>
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
            </div>

            {/* Action Buttons */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    borderLeft: "1px solid #F2F2F7",
                    borderRight: "1px solid #F2F2F7",
                    borderBottom: "1px solid #F2F2F7",
                    borderBottomLeftRadius: "24px",
                    borderBottomRightRadius: "24px",
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#FFF8F5" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenCreatePost}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,107,53,0.12)",
                        backgroundColor: "#FFFAF7",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                            padding: "8px",
                            borderRadius: "10px",
                            display: "flex",
                            flexShrink: 0,
                        }}
                    >
                        <Star size={16} color="white" fill="white" />
                    </div>
                    <Column style={{ gap: "2px", flex: 1 }}>
                        <Text
                            style={{ color: "#1C1C1E", fontWeight: 600, fontSize: "0.88rem" }}
                        >
                            Foodie Feed Post
                        </Text>
                        <Text
                            style={{ color: "#8E8E93", fontSize: "0.75rem", fontWeight: 500 }}
                        >
                            Reviews, ratings & food stories
                        </Text>
                    </Column>
                    <ChevronLeft
                        size={16}
                        color="#C7C7CC"
                        style={{ transform: "rotate(180deg)", flexShrink: 0 }}
                    />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#F8F5FF" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenCreatePost}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid rgba(88,86,214,0.1)",
                        backgroundColor: "#FAFAFF",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #5856D6, #7B79E8)",
                            padding: "8px",
                            borderRadius: "10px",
                            display: "flex",
                            flexShrink: 0,
                        }}
                    >
                        <ImageIcon size={16} color="white" />
                    </div>
                    <Column style={{ gap: "2px", flex: 1 }}>
                        <Text
                            style={{ color: "#1C1C1E", fontWeight: 600, fontSize: "0.88rem" }}
                        >
                            Discover Reel
                        </Text>
                        <Text
                            style={{ color: "#8E8E93", fontSize: "0.75rem", fontWeight: 500 }}
                        >
                            Short-form video content
                        </Text>
                    </Column>
                    <ChevronLeft
                        size={16}
                        color="#C7C7CC"
                        style={{ transform: "rotate(180deg)", flexShrink: 0 }}
                    />
                </motion.button>
            </div>
        </motion.div>
    );
};