import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, PALETTE, SECTIONS } from "../config";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Gradación teal-ámbar: sombras hacia teal profundo (lighten), luces cálidas (soft-light).
export const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "contrast(1.07) saturate(0.86) sepia(0.07) brightness(0.98)" }}>
    {children}
    <AbsoluteFill style={{ backgroundColor: "#12201F", mixBlendMode: "lighten", opacity: 0.55 }} />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${PALETTE.champagne} 0%, #7A5A34 100%)`,
        mixBlendMode: "soft-light",
        opacity: 0.32,
      }}
    />
  </AbsoluteFill>
);

// Grano de película: ruido SVG con semilla nueva cada frame.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.13 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = Math.floor(random(`grain-${frame}`) * 1000);
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <filter id={`grain-${frame}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 45%, ${PALETTE.carbon}B3 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Alto final de cada franja (también define la ventana visible para el encuadre).
export const letterboxBar = (width: number, height: number) =>
  height > width ? height * 0.028 : (height - width / 2.39) / 2;

// Letterbox 2.39:1 animado en horizontal; franjas sutiles en vertical.
export const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const target = letterboxBar(width, height);
  const bar = interpolate(frame, [4, 30], [vertical ? 0 : height * 0.5, target], {
    ...clamp,
    easing: EASE.out,
  });
  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: bar,
    backgroundColor: PALETTE.carbon,
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...style, top: 0 }} />
      <div style={{ ...style, bottom: 0 }} />
    </AbsoluteFill>
  );
};

// Light leaks cálidos (screen). Respiran todo el spot y se encienden en los cortes y el héroe.
export const LightLeaks: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const nearCut = Math.max(
    0,
    ...cuts.map((c) => interpolate(Math.abs(frame - c), [0, 8], [1, 0], { ...clamp, easing: EASE.out })),
  );
  const hero = interpolate(frame, [SECTIONS.hero.from, SECTIONS.hero.from + 20, SECTIONS.hero.to - 10, SECTIONS.hero.to], [0, 1, 1, 0], clamp);
  const base = 0.18 + 0.5 * nearCut + 0.35 * hero;
  const t = frame / 30;
  const blobs = [
    { c: PALETTE.champagne, x: 12 + 10 * Math.sin(t * 0.7), y: 18 + 8 * Math.cos(t * 0.5), r: 55 },
    { c: "#D9832F", x: 92 + 6 * Math.cos(t * 0.6), y: 70 + 10 * Math.sin(t * 0.4), r: 45 },
    { c: PALETTE.burgundy, x: 70 + 12 * Math.sin(t * 0.3), y: 8, r: 60 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.min(1, base), pointerEvents: "none" }}>
      {blobs.map((b, i) => (
        <AbsoluteFill
          key={i}
          style={{
            background: `radial-gradient(circle ${(b.r / 100) * Math.max(width, height)}px at ${b.x}% ${b.y}%, ${b.c}AA 0%, ${b.c}33 40%, transparent 70%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Quemado de película: flash cálido de alta intensidad.
export const FilmBurn: React.FC<{ duration: number; seed?: number }> = ({ duration, seed = 0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration * 0.4, duration], [0, 1, 0], clamp);
  const x = 30 + random(`burn-x-${seed}`) * 40;
  const y = 35 + random(`burn-y-${seed}`) * 30;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: p, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 90% at ${x}% ${y}%, #FFF4DE 0%, #F0B45A 22%, #B4532A 45%, ${PALETTE.burgundy} 65%, transparent 90%)`,
          scale: String(0.8 + 0.5 * p),
        }}
      />
    </AbsoluteFill>
  );
};
