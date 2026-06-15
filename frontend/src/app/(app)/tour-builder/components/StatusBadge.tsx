"use client";

import React from 'react';
import { Row, Text } from '@/components/OnceUI';
import { accent, text, radius, spacing } from '../tokens';

type StatusType = 'match' | 'distance' | 'time' | 'price' | 'rating';

interface StatusBadgeProps {
  type: StatusType;
  value: string | number;
  icon?: React.ReactNode;
  isGlass?: boolean;
}

const statusStyles: Record<StatusType, { color: string; bg: string }> = {
  match: { color: accent.warning, bg: accent.warningMuted },
  distance: { color: text.secondary, bg: 'rgba(0,0,0,0.06)' },
  time: { color: accent.secondary, bg: accent.secondaryMuted },
  price: { color: accent.primary, bg: accent.primaryMuted },
  rating: { color: accent.warning, bg: accent.warningMuted },
};

export function StatusBadge({ type, value, icon, isGlass = false }: StatusBadgeProps) {
  const style = statusStyles[type];

  return (
    <Row
      style={{
        alignItems: 'center',
        gap: spacing['2xs'],
        padding: `${spacing['2xs']}px ${spacing.xs}px`,
        backgroundColor: isGlass ? 'rgba(255,255,255,0.12)' : style.bg,
        backdropFilter: isGlass ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isGlass ? 'blur(16px)' : 'none',
        borderRadius: radius.s,
        border: `1px solid ${isGlass ? 'rgba(255,255,255,0.2)' : `${style.color}20`}`,
        boxShadow: isGlass ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {icon}
      <Text
        style={{
          color: isGlass ? 'white' : style.color,
          fontSize: '0.75rem',
          fontWeight: 700,
          textShadow: isGlass ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {value}
      </Text>
    </Row>
  );
}
