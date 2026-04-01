import React from "react";
import { motion } from "framer-motion";
import {
  Row,
  Column,
  Heading,
  Text,
} from "@/components/OnceUI";
import { Sparkles } from "lucide-react";
import { ContextCard } from "@/components/cards/ContextCard";
import { getDynamicContext } from "@/utils/dashboard-utils";

export const ContextualNavigator = () => {
  const ctx = getDynamicContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
    >
      <Column fillWidth style={{ gap: "16px" }}>
        <Row
          fillWidth
          style={{
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Row style={{ alignItems: "center", gap: "10px" }}>
            {ctx.icon}
            <Heading
              variant="heading-strong-l"
              weight="strong"
              style={{ color: "#1C1C1E" }}
            >
              {ctx.title}
            </Heading>
            <Row style={{ gap: "6px", marginLeft: "8px" }}>
              {ctx.tags.map((tag, tagIdx) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3 + tagIdx * 0.06,
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.08,
                    y: -2,
                    boxShadow: `0 4px 16px ${ctx.accent}25`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    paddingTop: "3px",
                    paddingBottom: "3px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    backgroundColor: `${ctx.accent}15`,
                    borderTopWidth: "1px",
                    borderBottomWidth: "1px",
                    borderLeftWidth: "1px",
                    borderRightWidth: "1px",
                    borderStyle: "solid",
                    borderColor: `${ctx.accent}30`,
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: ctx.accent,
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </Row>
          </Row>
          <Row
            onClick={() => {}}
            style={{
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <Sparkles size={14} color={ctx.accent} />
            <Text
              style={{
                color: ctx.accent,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              AI Picks
            </Text>
          </Row>
        </Row>
        <Row
          className="no-scrollbar"
          fillWidth
          style={{
            gap: "16px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollBehavior: "smooth",
          }}
        >
          <ContextCard
            title="Phở Bò 36 Lý Quốc Sư"
            subtitle="Open until 2AM • 0.8km away"
            match={94}
            accent={ctx.accent}
            img="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=250&fit=crop"
            delay={0}
          />
          <ContextCard
            title="Bánh Tráng Trộn Cô Ba"
            subtitle="Trending tonight • 1.2km away"
            match={87}
            accent={ctx.accent}
            img="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop"
            delay={0.05}
          />
          <ContextCard
            title="Cơm Tấm Sườn Bì Chả"
            subtitle="Crowded now • 0.5km away"
            match={91}
            accent={ctx.accent}
            img="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=250&fit=crop"
            delay={0.1}
          />
          <ContextCard
            title="Kem Bơ Thanh Long"
            subtitle="Just opened • 2.1km away"
            match={78}
            accent={ctx.accent}
            img="https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=250&fit=crop"
            delay={0.15}
          />
          <ContextCard
            title="Bún Riêu Cua Đồng"
            subtitle="Top rated • 1.5km away"
            match={85}
            accent={ctx.accent}
            img="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=250&fit=crop"
            delay={0.2}
          />
        </Row>
      </Column>
    </motion.div>
  );
};
