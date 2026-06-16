import { ImageResponse } from "next/og";

export const alt = "Ahmed Zaheer - AI/ML Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded share card (link previews). Generated at build via next/og. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 500px at 80% -10%, #2a1a5c 0%, #0b0718 55%), #080510",
          color: "#f5f3ff",
          fontFamily: "monospace",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#fde047",
            fontSize: 30,
            letterSpacing: 6,
            marginBottom: 18,
          }}
        >
          ★ LV.999 ENGINEER ★
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          AHMED ZAHEER
        </div>
        <div
          style={{
            display: "flex",
            color: "#22d3ee",
            fontSize: 38,
            marginTop: 28,
          }}
        >
          Production AI/ML systems, shipped end-to-end.
        </div>
        <div
          style={{
            display: "flex",
            color: "#9488bd",
            fontSize: 26,
            marginTop: 14,
            letterSpacing: 2,
          }}
        >
          AGENTIC LLM SYSTEMS · GENERATIVE-ML INFRA
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            color: "#6b5fa0",
            fontSize: 22,
            letterSpacing: 3,
          }}
        >
          MELBOURNE, AU
        </div>
      </div>
    ),
    { ...size },
  );
}
