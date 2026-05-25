import { GlassCard } from "@/components/ui/GlassCard";

export default function Loading() {
  return (
    <div style={{ paddingTop: "16px" }}>
      {/* Title skeleton */}
      <div className="skeleton" style={{ width: "180px", height: "32px", marginBottom: "24px" }} />

      {/* Alert banner skeleton */}
      <GlassCard
        padding="md"
        style={{
          marginBottom: "16px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          height: "64px"
        }}
      >
        <div className="skeleton" style={{ width: "80%", height: "20px" }} />
      </GlassCard>

      {/* Tab Switcher skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "4px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)", padding: "4px" }}>
          <div className="skeleton" style={{ width: "100px", height: "36px", borderRadius: "var(--border-radius-sm)" }} />
          <div className="skeleton" style={{ width: "100px", height: "36px", borderRadius: "var(--border-radius-sm)" }} />
        </div>
        <div className="skeleton" style={{ width: "80px", height: "32px", borderRadius: "var(--border-radius-sm)" }} />
      </div>

      {/* Filters skeleton */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <div className="skeleton" style={{ flex: 1, minWidth: "120px", height: "38px", borderRadius: "var(--border-radius-sm)" }} />
        <div className="skeleton" style={{ flex: 1, minWidth: "160px", height: "38px", borderRadius: "var(--border-radius-sm)" }} />
        <div className="skeleton" style={{ flex: 1, minWidth: "150px", height: "38px", borderRadius: "var(--border-radius-sm)" }} />
      </div>

      {/* Match Cards skeletons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} padding="md" variant="default">
            {/* Sport Badge + Location Skeleton */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <div className="skeleton" style={{ width: "60px", height: "16px", borderRadius: "var(--border-radius-full)" }} />
                <div className="skeleton" style={{ width: "80%", height: "24px", marginTop: "4px" }} />
              </div>
              <div className="skeleton" style={{ width: "70px", height: "20px", borderRadius: "var(--border-radius-full)" }} />
            </div>

            {/* Time / Price Skeleton */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
              <div className="skeleton" style={{ width: "100px", height: "18px" }} />
              <div className="skeleton" style={{ width: "80px", height: "18px" }} />
            </div>

            {/* Age restrictions / Info */}
            <div className="skeleton" style={{ width: "150px", height: "16px", marginBottom: "12px" }} />

            {/* Creator profile footer skeleton */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "10px", borderTop: "1px solid var(--glass-border)" }}>
              <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="skeleton" style={{ width: "120px", height: "16px" }} />
                <div className="skeleton" style={{ width: "70px", height: "12px" }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
