import { Easing, getStaticFiles } from "remotion";
import assets from "../assets.json";

export const FPS = 30;
export const DURATION = 450; // 15 s exactos

// Música: "Si nada es suficiente" (Kuzzy). Prepara el corte con scripts/prepare-music.sh;
// si existe public/audio/track.mp3 se usa automáticamente.
const MUSIC_FILE = "audio/track.mp3";
export const MUSIC_TRACK: string | null = getStaticFiles().some((f) => f.name === MUSIC_FILE) ? MUSIC_FILE : null;
// Logo: si existe en public/logo, pon su ruta (ej. "logo/portalboda.png"); null = wordmark.
export const LOGO: string | null = null;

// BPM configurable: los cortes del montaje y de la sección rápida caen en la grilla.
export const BPM = 100; // [ajustar al tempo real de la canción; prepare-music.sh lo estima]
export const BEAT = (FPS * 60) / BPM;

export const PALETTE = {
  carbon: "#0E0D0C",
  ivory: "#F2EBDD",
  champagne: "#C9A86A",
  burgundy: "#5A1F2B",
  stone: "#8A8279",
} as const;

// Curvas de cine (nada lineal)
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  slow: Easing.bezier(0.33, 0, 0.15, 1),
};

export type ImageId = keyof typeof assets.images;
export const img = (id: ImageId) => ({
  src: `img/${id}.jpg`,
  focal: assets.images[id].focal as [number, number],
});

// Una toma puede usar un archivo distinto según formato (solo cambia el layout).
export type ShotDef = { h: ImageId; v?: ImageId };

// ---- Beats (frames) ----
export const SECTIONS = {
  hook: { from: 0, to: 45 },
  montage: { from: 45, to: 180 },
  hero: { from: 180, to: 270 },
  fast: { from: 270, to: 390 },
  end: { from: 390, to: 450 },
};

export const HOOK_SHOT: ShotDef = { h: "01_manos_detalle" };

// Orden pensado como match cuts por color: marfil → durazno → verde → BN → gris frío → BN claro → marfil/negro
export const MONTAGE_SHOTS: ShotDef[] = [
  { h: "02_manos_ramo" },
  { h: "03_ramo_detalle" },
  { h: "12_abrazo_rostros" },
  { h: "10_portico_novia" },
  { h: "08_velo_pareja" },
  { h: "07_velo_playa" },
  { h: "06_beso_manos" },
];

export const HERO_SHOT: ShotDef = { h: "14_moto_beso", v: "13_moto_atardecer" };
// Microclip para el héroe (public/clips/*.mp4). null = still con cámara lenta simulada.
export const HERO_CLIP: string | null = null;

export const FAST_SHOTS: ShotDef[] = [
  { h: "05_beso_rostros", v: "04_beso_iglesia" },
  { h: "11_abrazo_arco" },
  { h: "09_portico_bn" },
];

// Montaje: 7 tomas de 0,4–0,6 s ajustadas al beat; lo que sobra va a un quemado de película antes del héroe.
const montageLen = SECTIONS.montage.to - SECTIONS.montage.from;
export const MONTAGE_SHOT_LEN = Math.round(Math.min(18, Math.max(12, BEAT)));
const montageUsed = MONTAGE_SHOT_LEN * MONTAGE_SHOTS.length;
export const BURN_LEN = Math.min(9, montageLen - montageUsed);
export const MONTAGE_LAST_EXTRA = montageLen - montageUsed - BURN_LEN;

export const montageTimeline = MONTAGE_SHOTS.map((shot, i) => {
  const from = SECTIONS.montage.from + i * MONTAGE_SHOT_LEN;
  const extra = i === MONTAGE_SHOTS.length - 1 ? MONTAGE_LAST_EXTRA : 0;
  return { shot, from, duration: MONTAGE_SHOT_LEN + extra };
});

// Sección rápida: cortes cada 2 beats.
const fastStep = Math.round(BEAT * 2);
export const fastTimeline = FAST_SHOTS.map((shot, i) => {
  const from = SECTIONS.fast.from + Math.min(i * fastStep, 100);
  const next =
    i === FAST_SHOTS.length - 1
      ? SECTIONS.fast.to
      : SECTIONS.fast.from + Math.min((i + 1) * fastStep, 100);
  return { shot, from, duration: next - from };
});

// Todos los cortes (para whoosh y aberración cromática)
export const CUTS: number[] = Array.from(new Set([
  SECTIONS.montage.from,
  ...montageTimeline.slice(1).map((s) => s.from),
  SECTIONS.hero.from - BURN_LEN,
  SECTIONS.hero.from,
  ...fastTimeline.map((s) => s.from),
  SECTIONS.end.from,
])).sort((a, b) => a - b);

// ---- Diseño sonoro (public/sfx, generados con ffmpeg, sin licencias de terceros) ----
// at = frame del corte; lead = frames antes del corte donde arranca el sonido (pico en el corte).
export type Sfx = { file: string; at: number; lead: number; volume: number };
const montageCuts = montageTimeline.slice(1).map((s) => s.from);
const fastCuts = fastTimeline.slice(1).map((s) => s.from);
export const SFX: Sfx[] = [
  { file: "sfx/burn.wav", at: 2, lead: 0, volume: 0.45 },
  { file: "sfx/whoosh.wav", at: SECTIONS.montage.from, lead: 7, volume: 0.6 },
  ...montageCuts.map((at) => ({ file: "sfx/whoosh.wav", at, lead: 7, volume: 0.32 })),
  { file: "sfx/riser.wav", at: SECTIONS.hero.from, lead: 42, volume: 0.35 },
  ...(BURN_LEN > 0 ? [{ file: "sfx/burn.wav", at: SECTIONS.hero.from - BURN_LEN, lead: 0, volume: 0.4 }] : []),
  { file: "sfx/impact.wav", at: SECTIONS.hero.from, lead: 0, volume: 0.7 },
  { file: "sfx/whoosh.wav", at: SECTIONS.fast.from, lead: 7, volume: 0.55 },
  ...fastCuts.map((at) => ({ file: "sfx/swish.wav", at, lead: 4, volume: 0.45 })),
  { file: "sfx/impact.wav", at: SECTIONS.end.from, lead: 0, volume: 0.45 },
  { file: "sfx/pad.wav", at: SECTIONS.end.from + 4, lead: 0, volume: 0.3 },
];
// Con música, los SFX bajan para no competir con la pista.
export const SFX_GAIN_WITH_MUSIC = 0.6;
