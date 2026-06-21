import { Column, Row } from "@once-ui-system/core";

export default function RootLoading() {
  return (
    <Row
      horizontal="center"
      vertical="center"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "#F2F2F7",
      }}
    >
      <Column
        horizontal="center"
        style={{
          gap: 16,
        }}
      >
        <Column
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(255,107,53,0.15)",
            borderTopColor: "#ff6b35",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.35)" }}
        >
          Loading…
        </span>
      </Column>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Row>
  );
}
