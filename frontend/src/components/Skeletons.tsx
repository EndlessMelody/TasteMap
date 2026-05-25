"use client";

import React from "react";
import { motion } from "framer-motion";

export function SkeletonGroupCard() {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        minWidth: "240px",
        height: "130px",
        flexShrink: 0,
      }}
    />
  );
}

export function SkeletonReelCard() {
  return (
    <div
      style={{
        width: "180px",
        minWidth: "180px",
        borderRadius: "20px",
        overflow: "hidden",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E5E5EA",
        flexShrink: 0,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ width: "100%", height: "240px", borderRadius: 0 }}
      />
      <div
        style={{
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{
            width: "80%",
            height: "14px",
            marginBottom: "8px",
            borderRadius: "6px",
          }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: "50%", height: "10px", borderRadius: "6px" }}
        />
      </div>
    </div>
  );
}

export function SkeletonVaultCard() {
  return (
    <div
      style={{
        minWidth: "260px",
        borderRadius: "20px",
        overflow: "hidden",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E5E5EA",
        flexShrink: 0,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ width: "100%", height: "150px", borderRadius: 0 }}
      />
      <div
        style={{
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{
            width: "70%",
            height: "14px",
            marginBottom: "6px",
            borderRadius: "6px",
          }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: "45%", height: "10px", borderRadius: "6px" }}
        />
      </div>
    </div>
  );
}

export function SkeletonFeedCard() {
  return (
    <div
      style={{
        minWidth: "340px",
        maxWidth: "340px",
        borderRadius: "16px",
        overflow: "hidden",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#F2F2F7",
        flexShrink: 0,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ width: "100%", height: "200px", borderRadius: 0 }}
      />
      <div
        style={{
          paddingTop: "16px",
          paddingBottom: "16px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{ width: "60%", height: "14px", borderRadius: "6px" }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: "85%", height: "10px", borderRadius: "6px" }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <div
            className="skeleton-shimmer"
            style={{ width: "60px", height: "24px", borderRadius: "6px" }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: "60px", height: "24px", borderRadius: "6px" }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAIPicksCard() {
  return (
    <div
      style={{
        minWidth: "260px",
        borderRadius: "20px",
        overflow: "hidden",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E5E5EA",
        backgroundColor: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ width: "100%", height: "140px", borderRadius: 0 }}
      />
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{ width: "75%", height: "14px", borderRadius: "6px" }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: "50%", height: "10px", borderRadius: "6px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{ width: "90px", height: "10px", borderRadius: "6px" }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: "24px", height: "24px", borderRadius: "8px" }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonThumbnailCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        backgroundColor: "#F2F2F7",
        borderRadius: "16px",
        minWidth: "300px",
        height: "180px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, #F2F2F7 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </motion.div>
  );
}
