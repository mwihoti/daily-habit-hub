import { ImageResponse } from "next/og";
import { getPublicAchievementShareBySlug } from "@/lib/achievementShares";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const share = await getPublicAchievementShareBySlug(slug);

  const title = share?.meta?.title || "Shared Achievement";
  const description = share?.meta?.unlockLabel || "FitTribe";
  const emoji = share?.meta?.emoji || "🏆";
  const member = share?.fullName || share?.username || "FitTribe member";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%)",
          color: "white",
          padding: "48px 60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                background: "linear-gradient(135deg, #f97316, #ec4899)",
              }}
            >
              {emoji}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, color: "#fb923c", fontWeight: 700 }}>FitTribe Achievement</span>
              <span style={{ fontSize: 16, color: "#94a3b8" }}>Public share page</span>
            </div>
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(251,146,60,0.35)",
              color: "#fdba74",
              fontSize: 20,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, color: "#cbd5e1" }}>{member} unlocked</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ fontSize: 24, color: "#94a3b8", maxWidth: 900 }}>
            View the shared badge page on FitTribe without logging in.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, color: "#64748b" }}>daily-habit-hub.vercel.app</div>
          <div style={{ fontSize: 18, color: "#f97316" }}>Workout consistency, publicly shareable</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
