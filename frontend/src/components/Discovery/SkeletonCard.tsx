"use client";

import React from 'react';
import { Column } from '@once-ui-system/core';
import { Skeleton } from '@/components/Skeleton';

export const SkeletonCard = () => (
  <Column
    style={{
      position: 'absolute',
      width: '100%',
      maxWidth: '400px',
      height: '600px',
      borderRadius: 'var(--radius-2xl)',
      overflow: 'hidden',
      backgroundColor: 'var(--surface-elevated)',
      boxShadow: 'var(--shadow-card)',
    }}
  >
    {/* Image area shimmer */}
    <Skeleton style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />

    {/* Bottom content area */}
    <Column
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px 28px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        gap: '10px',
      }}
    >
      <Skeleton style={{ height: 28, width: '75%', borderRadius: 16 }} />
      <Skeleton style={{ height: 16, width: '100%', borderRadius: 8 }} />
      <Skeleton style={{ height: 16, width: '66.666%', borderRadius: 8 }} />
    </Column>
  </Column>
);

export const SkeletonCardStack = () => (
  <Column style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '600px' }}>
    {/* Back card — smaller, offset */}
    <Column
      style={{
        position: 'absolute',
        width: '100%',
        maxWidth: '400px',
        height: '600px',
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--surface-elevated)',
        transform: 'scale(0.94) translateY(12px)',
        opacity: 0.5,
      }}
    />
    {/* Middle card */}
    <Column
      style={{
        position: 'absolute',
        width: '100%',
        maxWidth: '400px',
        height: '600px',
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--surface-elevated)',
        transform: 'scale(0.97) translateY(6px)',
        opacity: 0.75,
      }}
    />
    {/* Top card with shimmer */}
    <SkeletonCard />
  </Column>
);
