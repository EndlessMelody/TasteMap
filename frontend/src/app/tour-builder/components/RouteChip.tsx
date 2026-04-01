"use client";

import React from 'react';
import { Text } from '@/components/OnceUI';
import { radius, spacing } from '../tokens';

interface RouteChipProps {
  label: string;
  color: string;
  variant?: 'on-image' | 'on-surface';
}

export function RouteChip({ label, color, variant = 'on-image' }: RouteChipProps) {
  const isSurface = variant === 'on-surface';

  return (
    <Text
      style={{
        display: 'inline-block',
        padding: `${spacing['2xs']}px ${spacing.s}px`,
        backgroundColor: isSurface ? '#EBF5FF' : 'rgba(255,255,255,0.15)',
        backdropFilter: isSurface ? 'none' : 'blur(120px)',
        WebkitBackdropFilter: isSurface ? 'none' : 'blur(120px)',
        border: isSurface ? '1px solid #D1E9FF' : `1px solid rgba(255,255,255,0.25)`,
        borderRadius: radius.full, // Full pill shape as requested
        fontSize: '0.7rem',
        fontWeight: 800,
        color: isSurface ? '#374151' : 'white', // Gray 700 for surface
        textShadow: isSurface ? 'none' : '0 1px 4px rgba(0,0,0,0.3)',
      }}
    >
      {label}
    </Text>
  );
}
