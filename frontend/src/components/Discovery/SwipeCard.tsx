"use client";

import React, { useState } from "react";
import {
  motion,
  PanInfo,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Check, X } from "lucide-react";
import { Column, Row, Heading, Text } from "@/components/OnceUI";

export interface LocationData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface SwipeCardProps {
  data: LocationData;
  active: boolean;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
}

const SWIPE_THRESHOLD = 100;

export const SwipeCard: React.FC<SwipeCardProps> = ({
  data,
  active,
  onSwipeRight,
  onSwipeLeft,
}) => {
  const controls = useAnimation();
  const [exitX, setExitX] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Motion values for drag-driven overlay effects
  const dragX = useMotionValue(0);
  const likeOpacity = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const cardRotate = useTransform(dragX, [-300, 300], [-18, 18]);

  const dragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setExitX(500);
      controls.start({
        x: 500,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" },
      });
      onSwipeRight(data.id);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExitX(-500);
      controls.start({
        x: -500,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" },
      });
      onSwipeLeft(data.id);
    } else {
      // Spring snap back to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
      dragX.set(0);
    }
  };

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={dragEnd}
      animate={controls}
      style={{
        position: "absolute",
        width: "100%",
        maxWidth: "400px",
        height: "600px",
        borderRadius: "var(--radius-2xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-elevated)",
        cursor: active ? "grab" : "auto",
        zIndex: active ? 10 : 0,
        rotate: active ? cardRotate : 0,
        x: dragX,
        touchAction: "none",
        backgroundColor: "var(--surface-elevated)",
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.25 } }}
      whileDrag={{ scale: 1.03, cursor: "grabbing" }}
      onDrag={(_e, info) => dragX.set(info.offset.x)}
    >
      {/* Background image with blur-up progressive load */}
      <div style={{ position: "absolute", inset: 0 }}>
        {/* Low-quality placeholder blur layer */}
        {!imageLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "var(--surface-elevated)",
              backgroundImage: data.thumbnailUrl
                ? `url(${data.thumbnailUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.1)",
            }}
          />
        )}
        {/* Full-resolution image */}
        <img
          src={data.imageUrl}
          alt={data.title}
          onLoad={() => setImageLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      </div>

      {/* Like overlay — green, appears on right-drag */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.45) 0%, transparent 60%)",
          opacity: likeOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Pass overlay — red, appears on left-drag */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(225deg, rgba(239,68,68,0.45) 0%, transparent 60%)",
          opacity: passOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Like indicator badge */}
      <motion.div
        style={{
          position: "absolute",
          top: 28,
          left: 24,
          opacity: likeOpacity,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "rgba(34,197,94,0.25)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(34,197,94,0.7)",
          borderRadius: "var(--radius-m)",
          padding: "6px 14px",
        }}
      >
        <Check size={18} color="#22c55e" strokeWidth={3} />
        <span
          style={{
            color: "#22c55e",
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
          }}
        >
          LIKE
        </span>
      </motion.div>

      {/* Pass indicator badge */}
      <motion.div
        style={{
          position: "absolute",
          top: 28,
          right: 24,
          opacity: passOpacity,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "rgba(239,68,68,0.25)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(239,68,68,0.7)",
          borderRadius: "var(--radius-m)",
          padding: "6px 14px",
        }}
      >
        <X size={18} color="#ef4444" strokeWidth={3} />
        <span
          style={{
            color: "#ef4444",
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
          }}
        >
          PASS
        </span>
      </motion.div>

      {/* Bottom content gradient + text */}
      <Column
        fillWidth
        fillHeight
        justify="end"
        style={{
          padding: "28px 28px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          position: "absolute",
          inset: 0,
        }}
      >
        <Row fillWidth>
          <Column gap={8}>
            <Heading variant="display-strong-xs" style={{ color: "white" }}>
              {data.title}
            </Heading>
            <Text
              variant="body-default-m"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {data.description}
            </Text>
          </Column>
        </Row>
      </Column>
    </motion.div>
  );
};
