"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  /** Delay between each child animating in. Default: 0.06s */
  staggerDelay?: number;
  /** Initial delay before the first child. Default: 0 */
  delayChildren?: number;
  className?: string;
  style?: React.CSSProperties;
}

const containerVariants = (staggerDelay: number, delayChildren: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export const StaggerContainer = ({
  children,
  staggerDelay = 0.06,
  delayChildren = 0,
  className,
  style,
}: StaggerContainerProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants(staggerDelay, delayChildren)}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggerItem = ({ children, className, style }: StaggerItemProps) => (
  <motion.div variants={itemVariants} className={className} style={style}>
    {children}
  </motion.div>
);
