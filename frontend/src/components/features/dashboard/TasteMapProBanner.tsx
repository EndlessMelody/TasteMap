import React from "react";
import { motion } from "framer-motion";
import {
  Row,
  Column,
  Heading,
  Text,
  Button,
} from "@/components/OnceUI";
import { toast } from "sonner";
import { MOCK_PRO_BANNER } from "@/constants/mock-data";

export const TasteMapProBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Column
        className="rounded-[32px] overflow-hidden relative"
        style={{
          width: "100%",
          minHeight: "300px",
          background: MOCK_PRO_BANNER.image 
            ? `url(${MOCK_PRO_BANNER.image})` 
            : "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 30%, #E5E5EA 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
        onClick={() => toast("Tour Builder: Preview coming soon! 🗺️")}
      >
        {/* Protective Dark Overlay for Image Mode */}
        {MOCK_PRO_BANNER.image && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
              zIndex: 1
            }}
          />
        )}

        <Column
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            justifyContent: "center",
            paddingTop: "48px",
            paddingBottom: "72px",
            paddingLeft: "80px",
            paddingRight: "80px",
            gap: "18px",
            maxWidth: "800px"
          }}
        >
          {/* Badge Row */}
          <Row style={{ gap: "10px", alignItems: "center" }}>
            <div style={{ 
                paddingTop: "5px",
                paddingBottom: "5px",
                paddingLeft: "10px",
                paddingRight: "10px",
                backgroundColor: "#FFB800", 
                borderRadius: "6px",
                boxShadow: "0 4px 10px rgba(255, 184, 0, 0.25)"
            }}>
              <Text style={{ color: "#000", fontWeight: 900, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {MOCK_PRO_BANNER.badge}
              </Text>
            </div>
            <Text style={{ color: MOCK_PRO_BANNER.image ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontWeight: 600 }}>
              {MOCK_PRO_BANNER.subBadge}
            </Text>
          </Row>

          {/* Main Title */}
          <Heading 
            variant="display-strong-s" 
            style={{ 
                color: "white", 
                fontSize: "2.8rem", // Slightly scaled down for 300px
                lineHeight: 1.1,
                letterSpacing: "-1px"
            }}
          >
            {MOCK_PRO_BANNER.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    {i === 0 && <br />}
                </React.Fragment>
            ))}
          </Heading>

          {/* Description */}
          <Text 
            style={{ 
                color: "rgba(255,255,255,0.85)", 
                fontSize: "1rem", 
                lineHeight: 1.5,
                maxWidth: "480px",
                fontWeight: 500
            }}
          >
            {MOCK_PRO_BANNER.description}
          </Text>

          {/* CTA Button */}
          <Row style={{ marginTop: "8px" }}>
            <Button
              size="m"
              variant="primary"
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "14px",
                paddingTop: "12px",
                paddingBottom: "12px",
                paddingLeft: "36px",
                paddingRight: "36px",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 8px 25px rgba(255,255,255,0.12)"
              }}
            >
              {MOCK_PRO_BANNER.btnText}
            </Button>
          </Row>
        </Column>

        {/* Subtle Decorative Elements */}
        {!MOCK_PRO_BANNER.image && (
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-5%",
              width: "350px",
              height: "350px",
              background: "radial-gradient(circle, rgba(255,184,0,0.03) 0%, transparent 70%)",
              zIndex: 0
            }}
          />
        )}
      </Column>
    </motion.div>
  );
};
