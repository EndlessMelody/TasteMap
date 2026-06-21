import { Column, Row, Grid } from "@once-ui-system/core";

export function PageSkeleton() {
  return (
    <Column
      style={{
        width: "100%",
        height: "100%",
        padding: "32px 40px",
        backgroundColor: "#F2F2F7",
        gap: 20,
      }}
    >
      {/* Header skeleton */}
      <Column style={{ gap: 10, marginBottom: 8 }}>
        <Column style={pulse({ width: 180, height: 32, borderRadius: 10 })} />
        <Column style={pulse({ width: 280, height: 16, borderRadius: 8 })} />
      </Column>

      {/* Stat pills row */}
      <Row style={{ gap: 12 }}>
        {[160, 140, 140, 130].map((w, i) => (
          <Column key={i} style={pulse({ width: w, height: 72, borderRadius: 14 })} />
        ))}
      </Row>

      {/* Card grid */}
      <Grid
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginTop: 8,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Column key={i} style={pulse({ height: 180, borderRadius: 20 })} />
        ))}
      </Grid>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>
    </Column>
  );
}

function pulse(extra: React.CSSProperties): React.CSSProperties {
  return {
    backgroundImage:
      "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.06) 75%)",
    backgroundSize: "800px 100%",
    animation: "shimmer 1.4s ease-in-out infinite",
    ...extra,
  };
}
