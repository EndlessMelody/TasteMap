"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Column, Heading, Text } from "@/components/OnceUI";
import { SwipeCard, LocationData } from "./SwipeCard";
import { SkeletonCardStack } from "./SkeletonCard";

export interface CardStackProps {
  items: LocationData[];
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  isLoading?: boolean;
}

export const CardStack: React.FC<CardStackProps> = ({
  items,
  onSwipeRight,
  onSwipeLeft,
  isLoading = false,
}) => {
  const [cards, setCards] = useState<LocationData[]>(items);

  const handleSwipeRight = (id: string) => {
    onSwipeRight(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSwipeLeft = (id: string) => {
    onSwipeLeft(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <Column
        fillWidth
        fillHeight
        position="relative"
        justify="center"
        align="center"
        style={{ perspective: "1000px" }}
      >
        <SkeletonCardStack />
      </Column>
    );
  }

  if (cards.length === 0) {
    return (
      <Column
        fillWidth
        fillHeight
        justify="center"
        align="center"
        style={{ perspective: "1000px", minHeight: "600px" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "40px 32px",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--border-weak)",
            backgroundColor: "var(--surface-elevated)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <span style={{ fontSize: "3rem" }}>✨</span>
          <Heading
            variant="heading-strong-m"
            style={{ color: "white", textAlign: "center" }}
          >
            You&apos;ve seen it all
          </Heading>
          <Text
            variant="body-default-s"
            style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
          >
            Check back later for more places to discover.
          </Text>
        </motion.div>
      </Column>
    );
  }

  return (
    <Column
      fillWidth
      fillHeight
      position="relative"
      justify="center"
      align="center"
      style={{ perspective: "1000px", overflow: "hidden" }}
    >
      <AnimatePresence>
        {cards
          .map((data, index) => {
            const isTop = index === 0;
            return (
              <SwipeCard
                key={data.id}
                data={data}
                active={isTop}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
              />
            );
          })
          .reverse()}
      </AnimatePresence>
    </Column>
  );
};
