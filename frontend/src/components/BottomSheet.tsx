"use client";

import React from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
  useAnimation,
} from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max height as a CSS value. Default: '88vh' */
  maxHeight?: string;
  /** Whether inner content should scroll. Default: true */
  scrollable?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  maxHeight = '88vh',
  scrollable = true,
}: BottomSheetProps) {
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Backdrop opacity fades as sheet is dragged down
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      controls
        .start({ y: '100%', transition: { duration: 0.28, ease: 'easeIn' } })
        .then(onClose);
    } else {
      controls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 320, damping: 28 },
      });
      y.set(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              backgroundColor: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              opacity: backdropOpacity as unknown as number,
            }}
          />

          {/* Sheet panel */}
          <motion.div
            key="sheet"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ y: '100%' }}
            exit={{ y: '100%', transition: { duration: 0.26, ease: 'easeIn' } }}
            whileInView={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              maxHeight,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border-weak)',
              borderBottom: 'none',
              boxShadow: 'var(--shadow-elevated)',
              touchAction: 'none',
              y,
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 4,
                flexShrink: 0,
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.18)',
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: scrollable ? 'auto' : 'hidden',
                overscrollBehavior: 'contain',
              }}
              className="no-scrollbar"
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
