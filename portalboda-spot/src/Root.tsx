import React from "react";
import { Composition } from "remotion";
import { DURATION, FPS } from "./config";
import { Spot } from "./Spot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Spot16x9" component={Spot} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="Spot9x16" component={Spot} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
