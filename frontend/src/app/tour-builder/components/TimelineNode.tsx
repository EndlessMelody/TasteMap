"use client";

import React from 'react';
import { Text } from '@/components/OnceUI';
import { motion } from 'framer-motion';
import { surface, accent, text, border, radius, shadow, motion as motionTokens } from '../tokens';

interface TimelineNodeProps {
  index: number;
  imageUrl?: string;
  color?: string;
  isActive?: boolean;
  isFilled?: boolean;
}

export function TimelineNode({
  index,
  imageUrl,
  color,
  isActive = false,
  isFilled = false,
}: TimelineNodeProps) {
  const nodeSize = 56; // Standardized size

  const getStyles = () => {
    if (isFilled && color) {
      return {
        border: `3px solid ${color}`,
        backgroundColor: 'rgba(255,255,255,0.05)',
        boxShadow: `0 0 20px ${color}40`,
      };
    }
    if (isActive) {
      return {
        border: `2px solid ${accent.primary}`,
        backgroundColor: 'white',
        boxShadow: `0 0 16px ${accent.primary}30`,
      };
    }
    return {
      border: `2px dashed rgba(0,0,0,0.08)`,
      backgroundColor: 'rgba(0,0,0,0.02)',
      boxShadow: 'none',
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      animate={
        isActive && !isFilled
          ? {
              scale: [1, 1.05, 1],
              borderColor: [accent.primary, `${accent.primary}40`, accent.primary],
            }
          : {}
      }
      transition={
        isActive && !isFilled
          ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.4 }
      }
      style={{
        width: nodeSize,
        height: nodeSize,
        borderRadius: radius.full,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        ...styles,
      }}
    >
      {imageUrl ? (
        <motion.img
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={imageUrl}
          alt={`Stop ${index + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Text
          style={{
            color: isActive ? accent.primary : 'rgba(0,0,0,0.2)',
            fontSize: '0.85rem',
            fontWeight: 800,
          }}
        >
          {index + 1}
        </Text>
      )}
    </motion.div>
  );
}

// Connector line between nodes
export function TimelineConnector({ isActive = false }: { isActive?: boolean }) {
  return (
    <div
      style={{
        width: 32, // More compact connector
        height: 2,
        background: isActive
          ? `linear-gradient(90deg, ${accent.primary}, ${accent.primary}40)`
          : 'rgba(0,0,0,0.05)',
        transition: 'all 0.4s ease',
      }}
    />
  );
}
