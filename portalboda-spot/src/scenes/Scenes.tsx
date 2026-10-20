import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import {
  BURN_LEN,
  EASE,
  FAST_SHOTS,
  HERO_CLIP,
  HERO_LINES,
  HERO_SHOT,
  HOOK_SHOT,
  LOGO,
  PALETTE,
  SECTIONS,
  fastTimeline,
  montageTimeline,
  type Variant,
} from "../config";
import { Shot, useShotImage, useVertical } from "../components/Shot";
import { Em, Kicker, RevealLine, SANS, SERIF, SafeArea } from "../components/Type";
import { FilmBurn, Grain } from "../look/Look";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0–45 · HOOK: negro → quemado → detalle con push-in rápido. "Una vez." … "Para siempre."
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const push = spring({ frame: frame - 6, fps, config: { damping: 30, stiffness: 120, mass: 0.7 } });
  const reveal = interpolate(frame, [6, 14], [0, 1], { ...clamp, easing: EASE.out });
  const dur = SECTIONS.hook.to;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      <AbsoluteFill style={{ opacity: reveal, scale: String(1.42 - 0.3 * push) }}>
        <Shot id="hook" shot={HOOK_SHOT} duration={dur} zoom={[1, 1.04]} whipOut={1} aberration={false} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${PALETTE.carbon}99 0%, ${PALETTE.carbon}40 70%, ${PALETTE.carbon}30 100%)` }} />
      <Sequence from={2} durationInFrames={14} layout="none">
        <FilmBurn duration={14} seed={1} />
      </Sequence>
      <SafeArea>
        <RevealLine size={vertical ? 104 : 118} delay={10} out={dur - 9}>
          Una vez.
        </RevealLine>
        <RevealLine size={vertical ? 104 : 118} delay={23} italic out={dur - 9}>
          <Em>Para siempre.</Em>
        </RevealLine>
      </SafeArea>
    </AbsoluteFill>
  );
};

// 45–180 · Montaje rítmico: 7 tomas con Ken Burns, whip-pans alternados y quemado antes del héroe.
export const Montage: React.FC = () => {
  const base = SECTIONS.montage.from;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      {montageTimeline.map(({ shot, from, duration }, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const last = i === montageTimeline.length - 1;
        return (
          <Sequence key={i} from={from - base} durationInFrames={duration} name={`Montaje ${i + 1}`} premountFor={15}>
            <Shot
              id={`m${i}`}
              shot={shot}
              duration={duration}
              zoom={i % 3 === 0 ? [1.16, 1.06] : [1.05, 1.15]}
              drift={[dir * -1, i % 2 ? 0.6 : -0.6]}
              whipIn={dir}
              whipOut={last ? 0 : -dir}
              whipFrames={4}
            />
          </Sequence>
        );
      })}
      {BURN_LEN > 0 && (
        <Sequence from={SECTIONS.hero.from - BURN_LEN - base} durationInFrames={BURN_LEN + 6} name="Quemado">
          <FilmBurn duration={BURN_LEN + 6} seed={7} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// 180–270 · Momento héroe en cámara lenta (microclip a 0.5x o still con deriva lenta).
export const Hero: React.FC<{ variant: Variant }> = ({ variant }) => {
  const text = HERO_LINES[variant];
  const frame = useCurrentFrame();
  const vertical = useVertical();
  const dur = SECTIONS.hero.to - SECTIONS.hero.from;
  const { focal } = useShotImage(HERO_SHOT);
  const breathe = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: EASE.slow });
  const inFade = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE.out });
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      <AbsoluteFill style={{ opacity: inFade }}>
        {HERO_CLIP ? (
          <Video
            src={staticFile(HERO_CLIP)}
            playbackRate={0.5}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%", scale: String(1.04 + 0.05 * breathe), objectPosition: `${focal[0]}% ${focal[1]}%` }}
          />
        ) : (
          <Shot id="hero" shot={HERO_SHOT} duration={dur} zoom={[1.02, 1.11]} drift={[-1, 0.6]} aberration avoid={vertical ? { bottom: 0.42 } : { right: 0.45 }} />
        )}
      </AbsoluteFill>
      {/* Scrim para legibilidad del texto */}
      <AbsoluteFill
        style={{
          background: vertical
            ? `linear-gradient(180deg, transparent 35%, ${PALETTE.carbon}CC 70%, ${PALETTE.carbon}E6 100%)`
            : `linear-gradient(270deg, ${PALETTE.carbon}D9 0%, ${PALETTE.carbon}80 38%, transparent 62%)`,
        }}
      />
      <SafeArea align={vertical ? "center" : "end"} justify={vertical ? "end" : "center"}>
        <RevealLine size={vertical ? 88 : 84} delay={18} align={vertical ? "center" : "right"} out={dur - 10}>
          {text.line1}
        </RevealLine>
        <RevealLine size={vertical ? 88 : 84} delay={26} align={vertical ? "center" : "right"} out={dur - 10}>
          {text.line2}
          <Em>{text.em}</Em>
        </RevealLine>
      </SafeArea>
    </AbsoluteFill>
  );
};

// 270–390 · Tres cortes rápidos. "Videos de matrimonio con look cinematográfico."
export const FastCuts: React.FC = () => {
  const base = SECTIONS.fast.from;
  const vertical = useVertical();
  const total = SECTIONS.fast.to - base;
  // En 16:9 la primera toma no deja espacio lateral sin tapar rostros: el texto entra en el 2º corte.
  const textIn = vertical ? 8 : fastTimeline[1].from - base + 4;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      {fastTimeline.map(({ shot, from, duration }, i) => (
        <Sequence key={i} from={from - base} durationInFrames={duration} name={`Rápido ${i + 1}`} premountFor={15}>
          <Shot
            id={`f${i}`}
            shot={shot}
            duration={duration}
            zoom={i === FAST_SHOTS.length - 1 ? [1.18, 1.04] : [1.04, 1.12]}
            drift={[i % 2 ? 1 : -1, 0]}
            avoid={vertical ? { bottom: 0.42 } : { right: 0.42 }}
            whipIn={i === 0 ? 0 : i % 2 ? -1 : 1}
            whipOut={i === FAST_SHOTS.length - 1 ? 0 : i % 2 ? 1 : -1}
            whipFrames={4}
          />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background: vertical
            ? `linear-gradient(0deg, ${PALETTE.carbon}E6 0%, ${PALETTE.carbon}B0 25%, ${PALETTE.carbon}40 42%, transparent 55%)`
            : `linear-gradient(270deg, ${PALETTE.carbon}D9 0%, ${PALETTE.carbon}80 36%, transparent 58%)`,
        }}
      />
      <SafeArea align={vertical ? "center" : "end"} justify={vertical ? "end" : "center"}>
        <RevealLine size={vertical ? 64 : 58} delay={textIn} out={total - 10} align={vertical ? "center" : "right"}>
          Videos de matrimonio
        </RevealLine>
        <RevealLine size={vertical ? 64 : 58} delay={textIn + 8} out={total - 10} align={vertical ? "center" : "right"}>
          con look <Em>cinematográfico.</Em>
        </RevealLine>
      </SafeArea>
    </AbsoluteFill>
  );
};

// 390–450 · End card sobre negro con grano.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const mark = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const rule = interpolate(frame, [14, 34], [0, 1], { ...clamp, easing: EASE.out });
  const cta = spring({ frame: frame - 24, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      <Grain opacity={0.2} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${PALETTE.burgundy}55 0%, transparent 70%)`,
        }}
      />
      <SafeArea>
        <div
          style={{
            opacity: mark,
            translate: `0 ${(1 - mark) * 30}px`,
            letterSpacing: `${0.34 - mark * 0.12}em`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {LOGO ? (
            <Img src={staticFile(LOGO)} style={{ width: vertical ? 420 : 380 }} />
          ) : (
            <div
              style={{
                fontFamily: SERIF,
                fontSize: vertical ? 84 : 110,
                fontWeight: 400,
                color: PALETTE.ivory,
                whiteSpace: "nowrap",
                paddingLeft: "0.22em",
              }}
            >
              PORTAL <span style={{ fontStyle: "italic", color: PALETTE.champagne }}>BODA</span>
            </div>
          )}
        </div>
        <div
          style={{
            width: vertical ? 300 : 360,
            height: 1,
            margin: vertical ? "36px 0 28px" : "34px 0 26px",
            backgroundColor: PALETTE.champagne,
            scale: `${rule} 1`,
          }}
        />
        <Kicker size={vertical ? 30 : 28} delay={18}>
          portalboda.cl
        </Kicker>
        <div
          style={{
            marginTop: vertical ? 56 : 46,
            opacity: cta,
            translate: `0 ${(1 - cta) * 20}px`,
            border: `1px solid ${PALETTE.champagne}`,
            padding: vertical ? "22px 44px" : "18px 40px",
            fontFamily: SANS,
            fontSize: vertical ? 26 : 22,
            fontWeight: 500,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: PALETTE.champagne,
            paddingRight: `calc(${vertical ? 44 : 40}px - 0.34em)`,
          }}
        >
          Reserva tu fecha
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
