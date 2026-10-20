import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, ShotDef, img } from "../config";
import { letterboxBar } from "../look/Look";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

export const useShotImage = (shot: ShotDef) => {
  const vertical = useVertical();
  return img(vertical && shot.v ? shot.v : shot.h);
};

/** Fracciones del cuadro reservadas (texto) donde no deben quedar las cabezas. */
export type Avoid = { top?: number; bottom?: number; left?: number; right?: number };

type Frame = { scale: number; x: number; y: number; w: number; h: number };

/**
 * Encuadre con prioridad al sujeto: escala de cover × zoom (limitado para que el sujeto quepa)
 * y posición dentro del rango donde la caja del sujeto queda en la ventana visible
 * (cuadro − letterbox − zonas de texto). `pan` ∈ [0,1] recorre ese rango.
 */
const frameSubject = (
  W: number,
  H: number,
  im: { w: number; h: number; subject: [number, number, number, number] },
  zoom: number,
  pan: [number, number],
  avoid: Avoid,
): Frame => {
  const bar = letterboxBar(W, H);
  const margin = 0.03 * Math.min(W, H);
  const vl = W * (avoid.left ?? 0) + margin;
  const vr = W * (1 - (avoid.right ?? 0)) - margin;
  const vt = Math.max(bar, H * (avoid.top ?? 0)) + margin;
  const vb = Math.min(H - bar, H * (1 - (avoid.bottom ?? 0))) - margin;
  const [x0, y0, x1, y1] = im.subject;
  const cover = Math.max(W / im.w, H / im.h);
  // Zoom máximo con el que el sujeto aún entra en la ventana.
  const maxZoom = Math.min((vr - vl) / ((x1 - x0) * im.w * cover), (vb - vt) / ((y1 - y0) * im.h * cover));
  const scale = cover * Math.max(1, Math.min(zoom, maxZoom));
  const w = im.w * scale;
  const h = im.h * scale;
  const axis = (size: number, frame: number, a0: number, a1: number, lo: number, hi: number, p: number) => {
    // cubrir el cuadro: [frame - size, 0]; sujeto dentro de [lo, hi]: [lo - a0·size, hi - a1·size]
    const min = Math.max(frame - size, lo - a0 * size);
    const max = Math.min(0, hi - a1 * size);
    if (min <= max) return min + (max - min) * p;
    // Sin solución exacta: prioriza el borde superior/izquierdo del sujeto (las cabezas).
    return Math.min(0, Math.max(frame - size, lo - a0 * size));
  };
  return {
    scale,
    w,
    h,
    x: axis(w, W, x0, x1, vl, vr, pan[0]),
    y: axis(h, H, y0, y1, vt, vb, pan[1]),
  };
};

type Props = {
  shot: ShotDef;
  duration: number;
  id: string;
  /** Ken Burns: zoom inicial → final (se limita para no cortar cabezas) */
  zoom?: [number, number];
  /** Paneo dentro del rango seguro: [x, y] de -1 a 1 (0 = centrado) */
  drift?: [number, number];
  /** Whip-pan de entrada/salida: 1 = hacia la izquierda, -1 = derecha, 0 = sin whip */
  whipIn?: number;
  whipOut?: number;
  whipFrames?: number;
  /** Aberración cromática en el corte de entrada */
  aberration?: boolean;
  avoid?: Avoid;
};

// Toma con Ken Burns subject-aware, whip-pan con motion blur direccional (SVG) y aberración cromática.
export const Shot: React.FC<Props> = ({
  shot,
  duration,
  id,
  zoom = [1.04, 1.1],
  drift = [0, 0],
  whipIn = 0,
  whipOut = 0,
  whipFrames = 5,
  aberration = true,
  avoid = {},
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const image = useShotImage(shot);

  const kb = interpolate(frame, [0, duration], [0, 1], { ...clamp, easing: EASE.slow });
  const z = zoom[0] + (zoom[1] - zoom[0]) * kb;
  const pan: [number, number] = [0.5 + 0.5 * drift[0] * (kb - 0.5), 0.5 + 0.5 * drift[1] * (kb - 0.5)];
  const f = frameSubject(width, height, image, z, pan, avoid);

  // Whip: desplazamiento corto + blur horizontal fuerte que culmina justo en el corte.
  const inP = whipIn ? interpolate(frame, [0, whipFrames], [1, 0], { ...clamp, easing: EASE.out }) : 0;
  const outP = whipOut
    ? interpolate(frame, [duration - whipFrames, duration], [0, 1], { ...clamp, easing: EASE.in })
    : 0;
  const shift = (whipIn * inP - whipOut * outP) * 0.04 * width;
  const whip = Math.max(inP, outP);
  const blur = whip * 70;
  const whipScale = 1 + whip * 0.08;

  const ca = aberration ? interpolate(frame, [0, 4], [9, 0], { ...clamp, easing: EASE.out }) : 0;
  const filterId = `fx-${id}`;
  const useFilter = blur > 0.5 || ca > 0.3;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0E0D0C" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={`${blur} ${blur * 0.04}`} result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={ca} result="r2" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bl" />
          <feOffset in="bl" dx={-ca} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          scale: String(whipScale),
          translate: `${shift}px 0px`,
          filter: useFilter ? `url(#${filterId})` : undefined,
        }}
      >
        <Img
          src={staticFile(image.src)}
          style={{ position: "absolute", left: f.x, top: f.y, width: f.w, height: f.h, maxWidth: "none" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
