import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { EASE, PALETTE } from "../config";
import { useVertical } from "./Shot";

// Bodoni Moda y Jost (Google Fonts, OFL) empaquetadas en public/fonts: render offline y reproducible.
export const SERIF = "Bodoni Moda";
export const SANS = "Jost";
loadFont({ family: SERIF, url: staticFile("fonts/BodoniModa-Roman.woff2"), weight: "400 900", style: "normal" });
loadFont({ family: SERIF, url: staticFile("fonts/BodoniModa-Italic.woff2"), weight: "400 900", style: "italic" });
loadFont({ family: SANS, url: staticFile("fonts/Jost.woff2"), weight: "100 900", style: "normal" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Área de texto segura. 9:16: nada en el 18% inferior ni en el 12% derecho (UI TikTok/IG).
export const SafeArea: React.FC<{
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  justify?: "center" | "start" | "end";
  style?: React.CSSProperties;
}> = ({ children, align = "center", justify = "center", style }) => {
  const vertical = useVertical();
  const flex = { center: "center", start: "flex-start", end: "flex-end" } as const;
  return (
    <AbsoluteFill
      style={{
        top: vertical ? "10%" : "17%",
        bottom: vertical ? "18%" : "17%",
        left: vertical ? "7%" : "8%",
        right: vertical ? "12%" : "8%",
        width: "auto",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: flex[align],
        justifyContent: flex[justify],
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Línea de título: sube desde máscara con spring, desenfoque que se resuelve.
export const RevealLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size: number;
  italic?: boolean;
  out?: number;
  align?: React.CSSProperties["textAlign"];
}> = ({ children, delay = 0, size, italic, out, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8 } });
  const fadeOut = out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], { ...clamp, easing: EASE.in });
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.12 }}>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: italic ? "italic" : "normal",
          fontWeight: 400,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: "-0.01em",
          color: PALETTE.ivory,
          textAlign: align,
          translate: `0 ${(1 - s) * 105}%`,
          opacity: Math.min(s * 1.4, 1) * fadeOut,
          filter: `blur(${(1 - s) * 6}px)`,
          textShadow: "0 2px 30px rgba(14,13,12,0.55)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Apoyo: Jost en versalitas con tracking amplio.
export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; size: number; color?: string }> = ({
  children,
  delay = 0,
  size,
  color = PALETTE.ivory,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 18], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 400,
        fontSize: size,
        textTransform: "uppercase",
        letterSpacing: `${0.32 + (1 - p) * 0.2}em`,
        color,
        opacity: p,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontStyle: "italic", color: PALETTE.champagne }}>{children}</span>
);
