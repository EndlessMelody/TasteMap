"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Row, Column, Text } from "@/components/OnceUI";
import { PostsTab } from "./tab-contents/PostsTab";
import { ReviewsTab } from "./tab-contents/ReviewsTab";
import { AchievementsTab } from "./tab-contents/AchievementsTab";
import { VisitedTab } from "./tab-contents/VisitedTab";
import { PostItem } from "./tab-contents/PostsTab";

interface ProfileTabsProps {
  postsLoading: boolean;
  userPosts: PostItem[];
  badges: any[];
  totalBadges: number;
  badgesLoading: boolean;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  postsLoading,
  userPosts,
  badges,
  totalBadges,
  badgesLoading,
}) => {
  const [activeTab, setActiveTab] = useState("Posts");

  return (
    <Column fillWidth style={{ marginBottom: "64px" }}>
      {/* Tab Headers */}
      <Row
        style={{
          gap: "32px",
          borderTopWidth: "0px",
          borderLeftWidth: "0px",
          borderRightWidth: "0px",
          borderBottomWidth: "2px",
          borderBottomStyle: "solid",
          borderBottomColor: "#FFE8D6",
          paddingBottom: "12px",
          marginBottom: "32px",
        }}
      >
        {["Posts", "Reviews", "Achievements", "Visited"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              position: "relative",
              cursor: "pointer",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? "#ff6b35" : "#8E8E93",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "1rem",
                transition: "color 0.2s",
              }}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: "absolute",
                  bottom: "-13px",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                  borderRadius: "3px",
                }}
              />
            )}
          </div>
        ))}
      </Row>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Posts" && (
            <PostsTab postsLoading={postsLoading} userPosts={userPosts} />
          )}
          {activeTab === "Reviews" && (
            <ReviewsTab postsLoading={postsLoading} userPosts={userPosts} />
          )}
          {activeTab === "Achievements" && (
            <AchievementsTab 
              badges={badges} 
              totalBadges={totalBadges} 
              badgesLoading={badgesLoading} 
            />
          )}
          {activeTab === "Visited" && <VisitedTab />}
        </motion.div>
      </AnimatePresence>
    </Column>
  );
};
