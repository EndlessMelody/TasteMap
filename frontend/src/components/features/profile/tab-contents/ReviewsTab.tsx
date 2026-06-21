"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Utensils, MapPin, Heart } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import {
  Card,
  Body,
  BodySm,
  Pill,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";
import type { PostItem } from "./PostsTab";

interface ReviewsTabProps {
  postsLoading: boolean;
  userPosts: PostItem[];
  onReviewClick?: (post: PostItem) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  postsLoading,
  userPosts,
  onReviewClick,
}) => {
  const reviews = userPosts.filter((p) => p.rating != null);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
      : 0;

  return (
    <Column style={{ gap: tokens.space[3] }}>
      {reviews.length > 0 && (
        <Row vertical="center" style={{ gap: tokens.space[3], marginBottom: tokens.space[2] }}>
          <Pill tone="warm" size="md" solid leftIcon={<Star size={12} fill="currentColor" />}>
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </Pill>
          <BodySm tone="muted">
            Average{" "}
            <span
              style={{
                color: tokens.color.warm,
                fontWeight: tokens.type.weight.bold,
              }}
            >
              {avgRating.toFixed(1)}
            </span>{" "}
            / 5
          </BodySm>
        </Row>
      )}

      {postsLoading ? (
        [1, 2, 3].map((i) => (
          <Card key={i} radius="lg" padding="md" shadow="sm">
            <Column style={{ gap: tokens.space[2] }}>
              <Skeleton width="40%" height={16} />
              <Skeleton width="85%" height={13} />
              <Skeleton width="70%" height={13} />
            </Column>
          </Card>
        ))
      ) : reviews.length === 0 ? (
        <Card radius="xl" padding="lg" shadow="none" surface="muted">
          <EmptyState
            icon={<Star size={32} strokeWidth={1.5} />}
            title="No reviews yet"
            description="Post with a rating to see reviews here."
          />
        </Card>
      ) : (
        reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
          >
            <Card
              radius="lg"
              padding="md"
              shadow="sm"
              interactive
              onClick={() => onReviewClick?.(review)}
              style={{ cursor: "pointer" }}
            >
              <Row style={{ gap: tokens.space[4], alignItems: "flex-start" }}>
                {review.image_url ? (
                  <img
                    src={review.image_url}
                    alt=""
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: tokens.radius.md,
                      objectFit: "cover",
                      flexShrink: 0,
                      border: `1px solid ${tokens.color.border}`,
                    }}
                  />
                ) : (
                  <Column
                    center
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: tokens.radius.md,
                      background: tokens.color.surfaceMuted,
                      flexShrink: 0,
                      color: tokens.color.textSubtle,
                    }}
                  >
                    <Utensils size={24} strokeWidth={1.5} />
                  </Column>
                )}

                <Column style={{ flex: 1, minWidth: 0, gap: tokens.space[2] }}>
                  <Row
                    horizontal="between"
                    vertical="center"
                    style={{ flexWrap: "wrap", gap: tokens.space[2] }}
                  >
                    {review.location && (
                      <Row vertical="center" style={{ gap: tokens.space[1] }}>
                        <MapPin
                          size={14}
                          strokeWidth={1.75}
                          style={{ color: tokens.color.textMuted }}
                        />
                        <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                          {review.location.name}
                        </Body>
                      </Row>
                    )}
                    <Row vertical="center" style={{ gap: tokens.space[2] }}>
                      <Row style={{ gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            strokeWidth={1.5}
                            fill={
                              s <= Math.round(review.rating ?? 0)
                                ? tokens.color.warm
                                : "none"
                            }
                            color={tokens.color.warm}
                          />
                        ))}
                      </Row>
                      <BodySm
                        style={{
                          color: tokens.color.warm,
                          fontWeight: tokens.type.weight.bold,
                        }}
                      >
                        {(review.rating ?? 0).toFixed(1)}
                      </BodySm>
                    </Row>
                  </Row>

                  <BodySm
                    tone="muted"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {review.review}
                  </BodySm>

                  <Row horizontal="between" vertical="center">
                    <Row style={{ gap: tokens.space[1], flexWrap: "wrap" }}>
                      {(review.tags ?? []).slice(0, 2).map((tag) => (
                        <Pill key={tag} tone="neutral" size="sm">
                          {tag}
                        </Pill>
                      ))}
                    </Row>
                    <Row vertical="center" style={{ gap: tokens.space[3] }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          color: tokens.color.textSubtle,
                          fontSize: tokens.type.size.caption,
                          fontWeight: tokens.type.weight.semibold,
                        }}
                      >
                        <Heart
                          size={12}
                          strokeWidth={1.75}
                          fill={
                            review.is_liked ? tokens.color.warm : "none"
                          }
                          color={
                            review.is_liked
                              ? tokens.color.warm
                              : "currentColor"
                          }
                        />
                        {review.likes_count}
                      </span>
                      {review.created_at && (
                        <BodySm tone="subtle">
                          {new Date(review.created_at).toLocaleDateString(
                            "vi-VN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </BodySm>
                      )}
                    </Row>
                  </Row>
                </Column>
              </Row>
            </Card>
          </motion.div>
        ))
      )}
    </Column>
  );
};

export default ReviewsTab;
