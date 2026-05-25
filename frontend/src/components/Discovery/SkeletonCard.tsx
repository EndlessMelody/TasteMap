"use client";

import React from 'react';
import { Skeleton } from '@/components/Skeleton';

export const SkeletonCard = () => (
  <div
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
    <Skeleton className="absolute inset-0 rounded-none" />

    {/* Bottom content area */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px 28px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Skeleton className="h-7 w-3/4 rounded-l" />
      <Skeleton className="h-4 w-full rounded-s" />
      <Skeleton className="h-4 w-2/3 rounded-s" />
    </div>
  </div>
);

export const SkeletonCardStack = () => (
  <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '600px' }}>
    {/* Back card — smaller, offset */}
    <div
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
    <div
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
  </div>
);
