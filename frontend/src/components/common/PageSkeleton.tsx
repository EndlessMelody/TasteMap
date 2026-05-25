export function PageSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "32px 40px",
        backgroundColor: "#F2F2F7",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
        <div style={pulse({ width: 180, height: 32, borderRadius: 10 })} />
        <div style={pulse({ width: 280, height: 16, borderRadius: 8 })} />
      </div>

      {/* Stat pills row */}
      <div style={{ display: "flex", gap: 12 }}>
        {[160, 140, 140, 130].map((w, i) => (
          <div key={i} style={pulse({ width: w, height: 72, borderRadius: 14 })} />
        ))}
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginTop: 8,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={pulse({ height: 180, borderRadius: 20 })} />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>
    </div>
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
