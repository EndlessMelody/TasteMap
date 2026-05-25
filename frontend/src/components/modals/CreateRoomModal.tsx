import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Column,
  Row,
  Heading,
  Text,
  IconButton,
  Button,
  Input,
  Avatar,
} from "@/components/OnceUI";
import { X } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#FFFFFF",
              borderRadius: "32px",
              border: "1px solid #E5E5EA",
              boxShadow: "0 32px 80px rgba(0,0,0,0.1)",
              padding: "32px",
            }}
          >
            <Row
              fillWidth
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Heading variant="heading-strong-l" style={{ color: "#1C1C1E" }}>
                Start Group Room
              </Heading>
              <IconButton
                icon={<X size={18} color="#636366" />}
                onClick={onClose}
                variant="tertiary"
                style={{ cursor: "pointer" }}
              />
            </Row>
            <Column style={{ gap: "24px" }}>
              <Column style={{ gap: "8px" }}>
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.8rem",
                  }}
                >
                  Room Name
                </Text>
                <Input
                  placeholder="e.g. Saturday Midnight Snacks"
                  style={{ borderRadius: "12px", padding: "14px 16px" }}
                />
              </Column>
              <Column style={{ gap: "8px" }}>
                <Text
                  style={{
                    color: "#8E8E93",
                    fontSize: "0.8rem",
                  }}
                >
                  Invite Foodies
                </Text>
                <Row style={{ gap: "16px", flexWrap: "wrap" }}>
                  <Column
                    style={{
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop"
                      size="m"
                    />
                    <Text style={{ color: "#1C1C1E", fontSize: "0.7rem" }}>
                      Ramona
                    </Text>
                  </Column>
                  <Column
                    style={{
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop"
                      size="m"
                    />
                    <Text style={{ color: "#1C1C1E", fontSize: "0.7rem" }}>
                      Jane
                    </Text>
                  </Column>
                  <Column
                    style={{
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      opacity: 0.4,
                    }}
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                      size="m"
                    />
                    <Text style={{ color: "#1C1C1E", fontSize: "0.7rem" }}>
                      Mike
                    </Text>
                  </Column>
                </Row>
              </Column>
              <Button
                size="l"
                onClick={onClose}
                style={{ marginTop: "8px", borderRadius: "12px" }}
              >
                Initialize Minimax Engine
              </Button>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
