"""Música del gancho (4,8 s, 120 BPM, Re mayor). Reutiliza los instrumentos de synth.py.

Sincronía con src/hook/Hook.tsx (s):
  0.0  "¿TE CASAS?"            golpe + bombo
  0.5  FOTO/VIDEO/DRONE/...    4-on-the-floor, palmas, hats y acordes en contratiempo
  1.5  UN SOLO PROVEEDOR       sigue el groove
  2.27 10 AÑOS                 redoble corto
  3.0  Como lo soñaste.        quiebre: cae el ritmo, sub + acorde sostenido
  4.0  PORTALBODA.CL           remate: golpe final y cola

Uso: python3 scripts/compose-hook.py salida.wav
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import SR, eq, hz, kick, piano, place, reverb, rng, strings, tom, write_wav  # noqa: E402

DUR = 4.8
BEAT = 60 / 120
N = int(SR * DUR)
BREAK, OUTRO = 3.0, 4.0


def noise_hit(length, hp, decay, gain):
    """Palma / hat: ruido con paso alto simple y caída exponencial."""
    t = np.arange(int(SR * length)) / SR
    x = rng.standard_normal(len(t))
    x = np.diff(x, prepend=0) if hp > 4000 else x - np.convolve(x, np.ones(8) / 8, "same")
    return x * np.exp(-t * decay) * gain


def clap():
    out = np.zeros(int(SR * 0.2))
    for d in (0, 0.008, 0.017):  # tres palmas casi juntas = palmas de grupo
        hit = noise_hit(0.18, 1500, 28, 0.35)
        i = int(SR * d)
        out[i : i + len(hit)] += hit[: len(out) - i]
    return out


def chord(notes, t, vel, buf, length=0.35):
    for n in notes:
        place(buf, piano(hz(n), length, vel), t, 1.0, rng.uniform(-0.3, 0.3))


dry = np.zeros((2, N))
pads = np.zeros((2, N))
drums = np.zeros((2, N))

PROG = [["D4", "F#4", "A4"], ["C#4", "E4", "A4"], ["D4", "F#4", "B4"], ["D4", "G4", "B4"]]
BASS = ["D3", "A2", "B2", "G2"]

# Golpe de entrada
place(drums, kick(0.6, 120, 40, 1.0), 0.0)
chord(["D3", "A3", "D4", "F#4"], 0.0, 1.0, dry, 0.8)

# Groove 0.5–3.0
for b in np.arange(0.5, BREAK - 0.01, BEAT):
    place(drums, kick(0.3, 120, 55, 0.5), b)
    place(drums, noise_hit(0.05, 8000, 90, 0.45), b + BEAT / 2, 1.0, 0.25)  # hat en contratiempo
    i = int((b - 0.5) // 1.0) % 4
    chord(PROG[i], b + BEAT / 2, 0.95, dry)  # acordes en contratiempo
    place(dry, piano(hz(BASS[i]), 0.45, 0.9), b, 1.0)  # bajo
for b in np.arange(1.0, BREAK - 0.01, BEAT * 2):
    place(drums, clap(), b, 2.4, -0.1)
for k, b in enumerate(np.arange(2.62, BREAK - 0.01, BEAT / 4)):  # redoble hacia el quiebre
    place(drums, tom(130 + 12 * k, 0.25), b, 0.35 + 0.08 * k)

# Quiebre emocional 3.0–4.0
place(drums, kick(1.2, 70, 30, 1.0), BREAK)
for n in ["D2", "A2", "D3", "F#3", "A3"]:
    place(pads, strings(hz(n), 1.2, attack=0.05, release=0.5, bright=0.5), BREAK, 1.0)
for n, dt, v in [("F#5", 0.0, 0.8), ("A5", 0.25, 0.7), ("D6", 0.5, 0.8)]:
    place(dry, piano(hz(n), 1.2, v), BREAK + dt, 1.0)

# Remate 4.0–4.8
place(drums, kick(0.8, 120, 38, 1.1), OUTRO)
place(drums, clap(), OUTRO, 2.4)
chord(["D3", "A3", "D4", "F#4", "A4", "D5"], OUTRO, 1.0, dry, 0.8)
for n in ["D3", "F#3", "A3"]:
    place(pads, strings(hz(n), 0.8, attack=0.02, release=0.6, bright=0.7), OUTRO, 0.8)

mix = eq(reverb(dry, 1.6, 0.22) * 1.2 + reverb(pads, 2.2, 0.35) * 0.8 + reverb(drums, 0.8, 0.08) * 1.1)
t = np.arange(N) / SR
mix *= np.minimum(1, t / 0.005) * np.minimum(1, np.maximum(0, (DUR - t) / 0.35))
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix /= np.max(np.abs(mix)) / 0.89
write_wav(sys.argv[1], mix)
print("OK", sys.argv[1])
