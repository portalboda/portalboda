import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { CUTS, DURATION, MUSIC_TRACK, PALETTE, SECTIONS } from "./config";
import { Grade, Grain, Letterbox, LightLeaks, Vignette } from "./look/Look";
import { EndCard, FastCuts, Hero, Hook, Montage } from "./scenes/Scenes";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WHOOSH_LEAD = 7; // pico del whoosh ≈ 0,22 s

// Spot compartido: las escenas son las mismas; el layout se adapta por formato (useVertical).
export const Spot: React.FC = () => {
  const len = (s: { from: number; to: number }) => s.to - s.from;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.carbon }}>
      <Grade>
        <Sequence name="Hook" durationInFrames={len(SECTIONS.hook)}>
          <Hook />
        </Sequence>
        <Sequence name="Montaje" from={SECTIONS.montage.from} durationInFrames={len(SECTIONS.montage)}>
          <Montage />
        </Sequence>
        <Sequence name="Héroe" from={SECTIONS.hero.from} durationInFrames={len(SECTIONS.hero)}>
          <Hero />
        </Sequence>
        <Sequence name="Rápidos" from={SECTIONS.fast.from} durationInFrames={len(SECTIONS.fast)}>
          <FastCuts />
        </Sequence>
      </Grade>
      <Sequence name="Light leaks" durationInFrames={SECTIONS.end.from}>
        <LightLeaks cuts={CUTS} />
      </Sequence>
      <Sequence name="End card" from={SECTIONS.end.from} durationInFrames={len(SECTIONS.end)}>
        <EndCard />
      </Sequence>
      <Vignette />
      <Grain />
      <Letterbox />

      {CUTS.map((c) => (
        <Sequence key={c} name={`Whoosh ${c}`} from={Math.max(0, c - WHOOSH_LEAD)} durationInFrames={20} layout="none">
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.55} />
        </Sequence>
      ))}
      {MUSIC_TRACK && (
        <Audio
          src={staticFile(MUSIC_TRACK)}
          volume={(f) => interpolate(f, [0, 6, DURATION - 30, DURATION], [0, 1, 1, 0], clamp)}
        />
      )}
    </AbsoluteFill>
  );
};
