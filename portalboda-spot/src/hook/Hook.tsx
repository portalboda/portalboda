import React from "react";
import { AbsoluteFill, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { EASE } from "../config";
import { SANS, SERIF } from "../components/Type";
import { useVertical } from "../components/Shot";
import { Grain } from "../look/Look";

// Gancho de 4,8 s: tipografía cinética en rosa con frases de Portal Boda. 120 BPM (beat = 15 frames).
export const HOOK_DURATION = 144;

export const PINK = {
  blush: "#F7DCD6",
  petal: "#EFB3B0",
  rose: "#D8607A",
  wine: "#5A1F2B",
  cream: "#FFF6F0",
} as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Línea de tiempo (frames)
const T = { open: 0, services: 15, provider: 45, years: 68, dream: 90, outro: 120 };
const SERVICES = ["FOTO", "VIDEO", "DRONE", "CABINA", "POSTBODA"];
const WORD = 6;

// Tamaño de letra que llena el ancho seguro (ancho medio de glifo medido: Jost Black ≈ 0,64 em)
// con tope por alto (`hShare` = fracción del alto del cuadro que puede ocupar la línea).
const useFit = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const safeW = vertical ? width * 0.81 : width * 0.84;
  return (text: string, hShare = 0.3, em = 0.64) => Math.min(height * hShare, safeW / (text.length * em));
};

// Contenedor centrado en la zona segura (9:16: fuera del 18% inferior y del 12% derecho).
const Stage: React.FC<{ children: React.ReactNode; shake?: number }> = ({ children, shake = 0 }) => {
  const vertical = useVertical();
  const frame = useCurrentFrame();
  const dx = (random(`sx${frame}`) - 0.5) * shake;
  const dy = (random(`sy${frame}`) - 0.5) * shake;
  return (
    <AbsoluteFill
      style={{
        top: vertical ? "10%" : "8%",
        bottom: vertical ? "20%" : "8%",
        left: vertical ? "7%" : "8%",
        right: vertical ? "12%" : "8%",
        width: "auto",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        translate: `${dx}px ${dy}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Golpe: escala desde grande con spring y temblor que decae.
const useSlam = (delay = 0, snappy = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: snappy ? { damping: 18, stiffness: 600, mass: 0.4 } : { damping: 14, stiffness: 220, mass: 0.6 },
  });
  const shake = interpolate(frame - delay, [0, 3, 10], [0, 18, 0], clamp);
  return { s, shake, visible: frame >= delay };
};

const Big: React.FC<{
  text: string;
  color: string;
  size: number;
  delay?: number;
  serif?: boolean;
  italic?: boolean;
  snappy?: boolean;
}> = ({ text, color, size, delay = 0, serif, italic, snappy }) => {
  const { s, visible } = useSlam(delay, snappy);
  if (!visible) return null;
  return (
    <div
      style={{
        fontFamily: serif ? SERIF : SANS,
        fontWeight: serif ? 500 : 900,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: serif ? "-0.02em" : "-0.03em",
        color,
        whiteSpace: "nowrap",
        scale: String(snappy ? 1.25 - 0.25 * s : 1.5 - 0.5 * s),
        opacity: Math.min(1, s * 2),
        filter: `blur(${Math.max(0, 1 - s) * (snappy ? 4 : 10)}px)`,
      }}
    >
      {text}
    </div>
  );
};

// Fondo que entra como círculo expansivo desde un punto (cambio de color en el beat).
const Wipe: React.FC<{ color: string; at?: [number, number]; frames?: number }> = ({ color, at = [50, 50], frames = 7 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, frames], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <AbsoluteFill
      style={{ backgroundColor: color, clipPath: `circle(${p * 150}% at ${at[0]}% ${at[1]}%)` }}
    />
  );
};

const Kicker: React.FC<{ text: string; color: string; size: number; delay: number }> = ({ text, color, size, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 8], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: `${0.3 + (1 - p) * 0.3}em`,
        textTransform: "uppercase",
        color,
        opacity: p,
        whiteSpace: "nowrap",
        paddingLeft: "0.3em",
      }}
    >
      {text}
    </div>
  );
};

// ---- Escenas ----

const Open: React.FC = () => {
  const fit = useFit();
  const { shake } = useSlam(6);
  return (
    <AbsoluteFill style={{ backgroundColor: PINK.blush }}>
      <Stage shake={shake}>
        <Big text="¿TE" color={PINK.wine} size={fit("CASAS?", 0.3) * 0.72} />
        <Big text="CASAS?" color={PINK.rose} size={fit("CASAS?", 0.3)} delay={6} />
      </Stage>
    </AbsoluteFill>
  );
};

const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const fit = useFit();
  const i = Math.min(SERVICES.length - 1, Math.floor(frame / WORD));
  const bgs = [PINK.rose, PINK.wine, PINK.petal, PINK.wine, PINK.rose];
  const fgs = [PINK.cream, PINK.petal, PINK.wine, PINK.cream, PINK.cream];
  return (
    <AbsoluteFill style={{ backgroundColor: i > 0 ? bgs[i - 1] : PINK.blush }}>
      <Sequence from={i * WORD} durationInFrames={WORD} layout="none">
        <Wipe color={bgs[i]} at={[i % 2 ? 85 : 15, i % 2 ? 20 : 80]} frames={4} />
      </Sequence>
      <Stage shake={interpolate(frame % WORD, [0, 2, 5], [0, 14, 0], clamp)}>
        <Sequence key={i} from={i * WORD} layout="none">
          <Big text={SERVICES[i]} color={fgs[i]} size={fit(SERVICES[i], 0.36)} snappy />
        </Sequence>
      </Stage>
    </AbsoluteFill>
  );
};

const Provider: React.FC = () => {
  const frame = useCurrentFrame();
  const fit = useFit();
  const size = fit("PROVEEDOR.", 0.3);
  const size1 = fit("UN SOLO", 0.25);
  const l1 = interpolate(frame, [0, 7], [-120, 0], { ...clamp, easing: EASE.out });
  const l2 = interpolate(frame, [4, 11], [120, 0], { ...clamp, easing: EASE.out });
  const bar = interpolate(frame, [8, 16], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <AbsoluteFill style={{ backgroundColor: PINK.rose }}>
      <Wipe color={PINK.wine} at={[50, 100]} />
      <Stage>
        <div style={{ overflow: "hidden" }}>
          <div style={{ translate: `${l1}% 0`, fontFamily: SANS, fontWeight: 900, fontSize: size1, color: PINK.petal, letterSpacing: "-0.03em", lineHeight: 0.95, whiteSpace: "nowrap" }}>
            UN SOLO
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ translate: `${l2}% 0`, fontFamily: SANS, fontWeight: 900, fontSize: size, color: PINK.cream, letterSpacing: "-0.03em", lineHeight: 0.95, whiteSpace: "nowrap" }}>
            PROVEEDOR.
          </div>
        </div>
        <div style={{ height: size * 0.08, width: size * 6.2, marginTop: size * 0.12, backgroundColor: PINK.rose, scale: `${bar} 1`, transformOrigin: "left" }} />
      </Stage>
    </AbsoluteFill>
  );
};

const Years: React.FC = () => {
  const frame = useCurrentFrame();
  const fit = useFit();
  const n = Math.round(interpolate(frame, [0, 12], [0, 10], { ...clamp, easing: EASE.out }));
  const { s, shake } = useSlam(12);
  const size = fit("10", 0.42, 0.62);
  return (
    <AbsoluteFill style={{ backgroundColor: PINK.wine }}>
      <Wipe color={PINK.blush} at={[0, 0]} />
      <Stage shake={shake}>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: size,
            lineHeight: 0.85,
            color: PINK.rose,
            scale: String(1 + 0.12 * (1 - s) * (frame >= 12 ? 1 : 0)),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n}
        </div>
        <Kicker text="años" color={PINK.wine} size={size * 0.16} delay={4} />
        <div style={{ height: size * 0.06 }} />
        <Kicker text="en las bodas de Chile" color={PINK.wine} size={size * 0.075} delay={9} />
      </Stage>
    </AbsoluteFill>
  );
};

const HEART = "M50 90 C 22 68, 2 48, 10 26 C 17 8, 40 6, 50 26 C 60 6, 83 8, 90 26 C 98 48, 78 68, 50 90 Z";

const Dream: React.FC = () => {
  const frame = useCurrentFrame();
  const fit = useFit();
  const { width, height } = useVideoConfig();
  const size = fit("soñaste.", 0.3, 0.4);
  const draw = interpolate(frame, [4, 24], [0, 1], { ...clamp, easing: EASE.inOut });
  const heart = Math.min(width, height) * 0.9;
  return (
    <AbsoluteFill style={{ backgroundColor: PINK.blush }}>
      <Wipe color={PINK.rose} at={[50, 50]} frames={8} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: height > width ? "-8%" : 0 }}>
        <svg width={heart} height={heart} viewBox="0 0 100 100" style={{ opacity: 0.9, rotate: `${interpolate(frame, [0, 30], [-6, 0], clamp)}deg` }}>
          <path d={HEART} fill="none" stroke={PINK.cream} strokeWidth={1.1} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} strokeLinecap="round" />
        </svg>
      </AbsoluteFill>
      <Stage>
        <Big text="Como lo" color={PINK.wine} size={size * 0.62} serif delay={2} />
        <Big text="soñaste." color={PINK.cream} size={size} serif italic delay={7} />
      </Stage>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fit = useFit();
  const size = fit("PORTAL", 0.26);
  const cta = spring({ frame: frame - 7, fps, config: { damping: 16, stiffness: 200 } });
  const { shake } = useSlam(0);
  return (
    <AbsoluteFill style={{ backgroundColor: PINK.rose }}>
      <Wipe color={PINK.wine} at={[50, 50]} frames={6} />
      <Stage shake={shake}>
        <Big text="PORTAL" color={PINK.cream} size={size} />
        <Big text="BODA" color={PINK.petal} size={size} delay={3} />
        <div style={{ height: size * 0.22 }} />
        <div
          style={{
            opacity: cta,
            scale: String(0.8 + 0.2 * cta),
            backgroundColor: PINK.rose,
            color: PINK.cream,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: size * 0.17,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            padding: `${size * 0.1}px ${size * 0.26}px`,
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          portalboda.cl · Reserva tu fecha
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

const SCENES: { from: number; to: number; C: React.FC; name: string }[] = [
  { from: T.open, to: T.services, C: Open, name: "¿Te casas?" },
  { from: T.services, to: T.provider, C: Services, name: "Servicios" },
  { from: T.provider, to: T.years, C: Provider, name: "Un solo proveedor" },
  { from: T.years, to: T.dream, C: Years, name: "10 años" },
  { from: T.dream, to: T.outro, C: Dream, name: "Como lo soñaste" },
  { from: T.outro, to: HOOK_DURATION, C: Outro, name: "portalboda.cl" },
];

const SFX: { file: string; at: number; volume: number }[] = [
  ...SERVICES.map((_, i) => ({ file: "sfx/swish.wav", at: T.services + i * WORD - 3, volume: 0.35 })),
  { file: "sfx/whoosh.wav", at: T.provider - 6, volume: 0.45 },
  { file: "sfx/whoosh.wav", at: T.years - 6, volume: 0.4 },
  { file: "sfx/whoosh.wav", at: T.outro - 6, volume: 0.45 },
];

export const Hook: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PINK.blush }}>
    {SCENES.map(({ from, to, C, name }) => (
      <Sequence key={name} name={name} from={from} durationInFrames={to - from}>
        <C />
      </Sequence>
    ))}
    <Grain opacity={0.07} />
    <Audio src={staticFile("audio/hook.mp3")} />
    {SFX.map((fx, i) => (
      <Sequence key={i} from={fx.at} durationInFrames={20} layout="none">
        <Audio src={staticFile(fx.file)} volume={fx.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
