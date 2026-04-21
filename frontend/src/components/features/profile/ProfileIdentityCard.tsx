"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
} from "@/components/OnceUI";
import {
  Star,
  Flame,
  MapPin,
  Calendar,
} from "lucide-react";
import { UserData } from "@/context/AuthContext";

interface ProfileIdentityCardProps {
  user: UserData | null;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({ user }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Profile Identity Card (Name/Bio) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "28px",
          border: "1px solid #F2F2F7",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <Row
          style={{
            gap: "12px",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Heading
            variant="display-strong-s"
            style={{
              color: "#1C1C1E",
              fontSize: "2.2rem",
              letterSpacing: "-0.5px",
            }}
          >
            {user?.display_name || user?.username || "Guest"}
          </Heading>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
            style={{
              background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
              borderRadius: "50%",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Star size={12} color="white" fill="white" />
          </motion.div>
        </Row>

        <Row
          style={{
            gap: "12px",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Text
            style={{
              color: "#ff6b35",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            @{user?.username || "guest"}
          </Text>
          <span style={{ color: "#E5E5EA" }}>•</span>
          <div
            style={{
              background: "linear-gradient(135deg, #FFF0E6, #FFE8D6)",
              padding: "4px 12px",
              borderRadius: "20px",
              border: "1px solid rgba(255,107,53,0.15)",
            }}
          >
            <Text
              style={{
                color: "#ff6b35",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {user?.title || "Taste Explorer"}
            </Text>
          </div>
        </Row>

        <Text
          style={{
            color: "#48484A",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            maxWidth: "600px",
          }}
        >
          {user?.bio ||
            "Exploring flavors, one bite at a time. Join me on this delicious journey!"}
        </Text>
      </motion.div>

      {/* Bento Pills Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {/* Level/XP Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #F2F2F7",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <Row
            style={{
              gap: "8px",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
                padding: "6px",
                borderRadius: "8px",
              }}
            >
              <Flame size={14} color="white" />
            </div>
            <Text
              style={{
                color: "#1C1C1E",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              Level {user?.level || 1}
            </Text>
          </Row>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "#F2F2F7",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(((user?.xp || 0) / ((user?.level || 1) * 1000)) * 100, 100)}%`,
              }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #ff6b35, #ff8c5a)",
                borderRadius: "3px",
              }}
            />
          </div>
          <Text
            style={{
              color: "#8E8E93",
              fontSize: "0.75rem",
              marginTop: "6px",
            }}
          >
            {user?.xp || 0} / {(user?.level || 1) * 1000} XP
          </Text>
        </motion.div>

        {/* Location Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          whileHover={{ y: -2 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #F2F2F7",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            cursor: "pointer",
          }}
        >
          <Row style={{ gap: "10px", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#F2F2F7",
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <MapPin size={16} color="#ff6b35" />
            </div>
            <Column>
              <Text
                style={{
                  color: "#8E8E93",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Location
              </Text>
              <Text
                style={{
                  color: "#1C1C1E",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {user?.location || "Exploring"}
              </Text>
            </Column>
          </Row>
        </motion.div>

        {/* Member Since Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid #F2F2F7",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <Row style={{ gap: "10px", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#F2F2F7",
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <Calendar size={16} color="#8E8E93" />
            </div>
            <Column>
              <Text
                style={{
                  color: "#8E8E93",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Member Since
              </Text>
              <Text
                style={{
                  color: "#1C1C1E",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "numeric" },
                  )
                  : "Mar 2025"}
              </Text>
            </Column>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileIdentityCard;
