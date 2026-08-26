import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0f0f10",
          padding: "80px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "5px solid #e8232a",
            color: "#f7f5f2",
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 36,
          }}
        >
          HKS
        </div>
        <div style={{ display: "flex", color: "#e8232a", fontSize: 26, letterSpacing: 6, marginBottom: 16 }}>
          {SITE.hashtag}
        </div>
        <div style={{ display: "flex", color: "#f7f5f2", fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", color: "#a8a8ac", fontSize: 30, marginTop: 24, maxWidth: 900 }}>
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
