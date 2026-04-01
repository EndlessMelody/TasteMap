"use client";

import React from 'react';
import { Column, Row } from '@/components/OnceUI';
import { Skeleton } from '@/components/Skeleton';
import { surface, text, border, radius, spacing } from '../tokens';

export function TourSkeleton() {
  return (
    <Column
      fillWidth
      fillHeight
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
      }}
    >
      {/* Card skeleton */}
      <div
        style={{
          width: 340,
          height: 480,
          borderRadius: radius['2xl'],
          overflow: 'hidden',
          backgroundColor: surface.elevated,
          border: `1px solid ${border.weak}`,
          position: 'relative',
        }}
      >
        <Skeleton className="absolute inset-0 rounded-none" />
        
        {/* Bottom content area */}
        <Column
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.xl,
            gap: spacing.s,
            background: `linear-gradient(to top, ${surface.elevated} 0%, transparent 100%)`,
          }}
        >
          <Skeleton style={{ height: 28, width: '75%', borderRadius: radius.m }} />
          <Skeleton style={{ height: 16, width: '100%', borderRadius: radius.s }} />
          <Row style={{ gap: spacing.xs }}>
            <Skeleton style={{ height: 24, width: 60, borderRadius: radius.s }} />
            <Skeleton style={{ height: 24, width: 60, borderRadius: radius.s }} />
            <Skeleton style={{ height: 24, width: 60, borderRadius: radius.s }} />
          </Row>
        </Column>
      </div>

      {/* Timeline skeleton */}
      <Row style={{ gap: 0, alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: border.weak,
                }}
              />
            )}
            <Skeleton
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.full,
              }}
            />
          </React.Fragment>
        ))}
      </Row>
    </Column>
  );
}

// Empty state when no cards left
export function EmptyState({ filledCount, totalCount }: { filledCount: number; totalCount: number }) {
  return (
    <Column
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.m,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: radius.full,
          backgroundColor: surface.elevated,
          border: `1px solid ${border.weak}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
        }}
      >
        ✨
      </div>
      <Column style={{ alignItems: 'center', gap: spacing.xs }}>
        <span
          style={{
            color: text.primary,
            fontSize: '1.125rem',
            fontWeight: 700,
          }}
        >
          No More Cards
        </span>
        <span
          style={{
            color: text.muted,
            fontSize: '0.85rem',
          }}
        >
          {filledCount}/{totalCount} stops selected
        </span>
      </Column>
    </Column>
  );
}
