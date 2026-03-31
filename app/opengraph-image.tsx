import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FitTribe — Fitness & Personal Trainers in Nairobi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #f97316, #ec4899, #8b5cf6)",
          }}
        />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            💪
          </div>
          <span style={{ fontSize: 52, fontWeight: 700, color: "#ffffff" }}>
            FitTribe
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            margin: "0 80px 32px",
            lineHeight: 1.4,
          }}
        >
          Nairobi's Fitness Community & Personal Trainer Marketplace
        </p>

        {/* Location pills */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", padding: "0 60px" }}>
          {["Kilimani", "Karen", "Ngong Road", "CBD", "Thika Road", "Roysambu", "Allsops"].map(
            (area) => (
              <div
                key={area}
                style={{
                  background: "rgba(249, 115, 22, 0.15)",
                  border: "1px solid rgba(249, 115, 22, 0.4)",
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontSize: 18,
                  color: "#fb923c",
                  fontWeight: 600,
                }}
              >
                {area}
              </div>
            )
          )}
        </div>

        {/* Bottom domain */}
        <p style={{ position: "absolute", bottom: 28, fontSize: 18, color: "#475569" }}>
          fittribe.co.ke
        </p>
      </div>
    ),
    { ...size }
  );
}
