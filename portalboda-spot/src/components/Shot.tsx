import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, ShotDef, img } from "../config";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

export const useShotImage = (shot: ShotDef) => {
  const vertical = useVertical();
  return img(vertical && shot.v ? shot.v : shot.h);
};

type Props = {
  shot: ShotDef;
  duration: number;
  id: string;
  /** Ken Burns: escala inicial → final */
  zoom?: [number, number];
  /** Deriva en % (x, y) a lo largo de la toma */
  drift?: [number, number];
  /** Whip-pan de entrada/salida: 1 = hacia la izquierda, -1 = derecha, 0 = sin whip */
  whipIn?: number;
  whipOut?: number;
  whipFrames?: number;
  /** Aberración cromática en el corte de entrada */
  aberration?: boolean;
};

// Toma con Ken Burns, whip-pan con motion blur direccional (SVG) y aberración cromática en el corte.
export const Shot: React.FC<Props> = ({
  shot,
  duration,
  id,
  zoom = [1.06, 1.14],
  drift = [0, 0],
  whipIn = 0,
  whipOut = 0,
  whipFrames = 5,
  aberration = true,
}) => {
  const frame = useCurrentFrame();
  const { src, focal } = useShotImage(shot);

  const kb = interpolate(frame, [0, duration], [0, 1], { ...clamp, easing: EASE.slow });
  const scale = zoom[0] + (zoom[1] - zoom[0]) * kb;

  // Whip: desplazamiento + blur horizontal que culmina justo en el corte.
  const inP = whipIn ? interpolate(frame, [0, whipFrames], [1, 0], { ...clamp, easing: EASE.out }) : 0;
  const outP = whipOut
    ? interpolate(frame, [duration - whipFrames, duration], [0, 1], { ...clamp, easing: EASE.in })
    : 0;
  const shift = whipIn * inP * 12 - whipOut * outP * 12;
  const blur = Math.max(inP, outP) * 60;
  const whipScale = 1 + Math.max(inP, outP) * 0.3;

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
          scale: String(scale * whipScale),
          translate: `${drift[0] * kb + shift}% ${drift[1] * kb}%`,
          filter: useFilter ? `url(#${filterId})` : undefined,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focal[0]}% ${focal[1]}%` }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
