"use client";

import React from "react";
import { List } from "react-window";
import { motion } from "framer-motion";
import type { Spot } from "../types";
import SpotCard from "./SpotCard";

interface VirtualizedSpotListProps {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

const ITEM_HEIGHT = 100; // Height of each SpotCard in pixels
const BUFFER_ITEMS = 5;

interface SpotRowProps {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot) => void;
}

const SpotRow = ({
  index,
  style,
  spots,
  selected,
  onSelect,
}: {
  index: number;
  style: React.CSSProperties;
} & SpotRowProps) => {
  const spot = spots[index];
  if (!spot) return null;

  return (
    <div style={style}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          delay: (index % 10) * 0.02,
        }}
      >
        <SpotCard
          spot={spot}
          selected={selected?.id === spot.id}
          onClick={() => onSelect(spot)}
        />
      </motion.div>
    </div>
  );
};

export default function VirtualizedSpotList({
  spots,
  selected,
  onSelect,
  hasMore,
  onLoadMore,
  isLoading,
}: VirtualizedSpotListProps) {
  // Triggers onLoadMore when scrolling near the end
  const handleRowsRendered = ({ stopIndex }: { stopIndex: number }) => {
    if (hasMore && !isLoading && stopIndex >= spots.length - BUFFER_ITEMS) {
      onLoadMore();
    }
  };

  return (
    <List<SpotRowProps>
      rowCount={spots.length}
      rowHeight={ITEM_HEIGHT}
      rowComponent={SpotRow as any}
      rowProps={{
        spots,
        selected,
        onSelect,
      }}
      overscanCount={BUFFER_ITEMS}
      onRowsRendered={handleRowsRendered}
      style={{ height: 600, width: "100%" }}
    />
  );
}
