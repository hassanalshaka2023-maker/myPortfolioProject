import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0d12" }}>
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 30% 25%, #ffd27a, #f5b544 55%, #d98e1c)",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 30 30">
            <path d="M8 4v22M22 4v22M8 15h14" stroke="#241a08" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
