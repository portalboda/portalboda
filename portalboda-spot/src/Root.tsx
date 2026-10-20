import React from "react";
import { Composition } from "remotion";
import { DURATION, FPS, HERO_LINES, Variant } from "./config";
import { Spot } from "./Spot";
import { HOOK_DURATION, Hook } from "./hook/Hook";

const FORMATS = [
  { id: "16x9", width: 1920, height: 1080 },
  { id: "9x16", width: 1080, height: 1920 },
];

// Una composición por formato y variante: Spot16x9-A, Spot9x16-B, etc.
export const RemotionRoot: React.FC = () => (
  <>
    {FORMATS.flatMap((f) =>
      (Object.keys(HERO_LINES) as Variant[]).map((v) => (
        <Composition
          key={`${f.id}-${v}`}
          id={`Spot${f.id}-${v}`}
          component={Spot}
          defaultProps={{ variant: v }}
          durationInFrames={DURATION}
          fps={FPS}
          width={f.width}
          height={f.height}
        />
      )),
    )}
    {FORMATS.map((f) => (
      <Composition key={`hook-${f.id}`} id={`Hook${f.id}`} component={Hook} durationInFrames={HOOK_DURATION} fps={FPS} width={f.width} height={f.height} />
    ))}
  </>
);
