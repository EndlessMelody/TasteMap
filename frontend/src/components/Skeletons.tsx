"use client";

import React from "react";
import { motion } from "framer-motion";
import { Column, Row } from "@once-ui-system/core";

export function SkeletonGroupCard() {
  return (
    <Column
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
    <Column
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
      <Column
        className="skeleton-shimmer"
        style={{ width: "100%", height: "240px", borderRadius: 0 }}
      />
      <Column
        style={{
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Column
          className="skeleton-shimmer"
          style={{
            width: "80%",
            height: "14px",
            marginBottom: "8px",
            borderRadius: "6px",
          }}
        />
        <Column
          className="skeleton-shimmer"
          style={{ width: "50%", height: "10px", borderRadius: "6px" }}
        />
      </Column>
    </Column>
  );
}

export function SkeletonVaultCard() {
  return (
    <Column
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
      <Column
        className="skeleton-shimmer"
        style={{ width: "100%", height: "150px", borderRadius: 0 }}
      />
      <Column
        style={{
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Column
          className="skeleton-shimmer"
          style={{
            width: "70%",
            height: "14px",
            marginBottom: "6px",
            borderRadius: "6px",
          }}
        />
        <Column
          className="skeleton-shimmer"
          style={{ width: "45%", height: "10px", borderRadius: "6px" }}
        />
      </Column>
    </Column>
  );
}

export function SkeletonFeedCard() {
  return (
    <Column
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
      <Column
        className="skeleton-shimmer"
        style={{ width: "100%", height: "200px", borderRadius: 0 }}
      />
      <Column
        style={{
          paddingTop: "16px",
          paddingBottom: "16px",
          paddingLeft: "16px",
          paddingRight: "16px",
          backgroundColor: "#FFFFFF",
          gap: "10px",
        }}
      >
        <Column
          className="skeleton-shimmer"
          style={{ width: "60%", height: "14px", borderRadius: "6px" }}
        />
        <Column
          className="skeleton-shimmer"
          style={{ width: "85%", height: "10px", borderRadius: "6px" }}
        />
        <Row style={{ gap: "8px" }}>
          <Column
            className="skeleton-shimmer"
            style={{ width: "60px", height: "24px", borderRadius: "6px" }}
          />
          <Column
            className="skeleton-shimmer"
            style={{ width: "60px", height: "24px", borderRadius: "6px" }}
          />
        </Row>
      </Column>
    </Column>
  );
}

export function SkeletonAIPicksCard() {
  return (
    <Column
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
      <Column
        className="skeleton-shimmer"
        style={{ width: "100%", height: "140px", borderRadius: 0 }}
      />
      <Column
        style={{
          padding: "16px",
          gap: "8px",
        }}
      >
        <Column
          className="skeleton-shimmer"
          style={{ width: "75%", height: "14px", borderRadius: "6px" }}
        />
        <Column
          className="skeleton-shimmer"
          style={{ width: "50%", height: "10px", borderRadius: "6px" }}
        />
        <Row
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <Column
            className="skeleton-shimmer"
            style={{ width: "90px", height: "10px", borderRadius: "6px" }}
          />
          <Column
            className="skeleton-shimmer"
            style={{ width: "24px", height: "24px", borderRadius: "8px" }}
          />
        </Row>
      </Column>
    </Column>
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
      <Column
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
