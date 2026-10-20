"""Pista original para el spot (15 s, 100 BPM, Re mayor). Sin samples ni licencias de terceros.

Estructura alineada al guion:
  0.0–1.5  hook: piano solo + pad que respira ("Una vez." / "Para siempre.")
  1.5–6.0  montaje: arpegio de piano en corcheas + latido grave en cada beat (IV–I–vi–V)
  6.0–9.0  héroe: golpe de cuerdas graves y melodía lenta de piano
  9.0–13.0 rápidos: build con toms, arpegio más brillante y cuerdas en crescendo
  13.0–15  end card: resolución en Re mayor y cola de reverb

Uso: python3 -I scripts/compose-music.py public/audio/track.wav
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import SR, eq, hz, kick, piano, place, reverb, strings, tom, write_wav  # noqa: E402

DUR = 15.0
BPM = 100
BEAT = 60 / BPM
N = int(SR * DUR)

dry = np.zeros((2, N))
pads = np.zeros((2, N))
drums = np.zeros((2, N))

CH = {
    "G": ["G2", "D3", "G3", "B3", "D4", "G4"],
    "D": ["D2", "A2", "D3", "F#3", "A3", "D4"],
    "Bm": ["B1", "F#2", "B2", "D3", "F#3", "B3"],
    "A": ["A1", "E2", "A2", "C#3", "E3", "A3"],
}
ARP = {
    "G": ["G3", "B3", "D4", "G4", "B4", "D5", "G4", "D4"],
    "D": ["D4", "F#4", "A4", "D5", "F#5", "A4", "D5", "A4"],
    "Bm": ["B3", "D4", "F#4", "B4", "D5", "F#4", "B4", "F#4"],
    "A": ["A3", "C#4", "E4", "A4", "C#5", "E4", "A4", "E4"],
}

# --- Hook 0–1.5 ---
place(pads, strings(hz("D3"), 1.9, attack=0.9, release=0.6, bright=0.2), 0.0, 0.8)
place(pads, strings(hz("A3"), 1.9, attack=0.9, release=0.6, bright=0.2), 0.0, 0.6, 0.2)
place(dry, piano(hz("D5"), 3, 0.9), 0.07, 1.0, -0.1)
place(dry, piano(hz("A4"), 3, 0.7), 0.77, 1.0, 0.1)
place(dry, piano(hz("F#5"), 3, 0.8), 0.80, 1.0, 0.15)

# --- Montaje 1.5–6.0: IV–I–vi–V, arpegio en corcheas, latido en negras ---
prog = [("G", 1.5), ("D", 2.7), ("Bm", 3.9), ("A", 5.1)]
for name, start in prog:
    length = 1.2 if name != "A" else 0.9
    for n in CH[name][2:5]:
        place(pads, strings(hz(n), length + 0.4, attack=0.15, release=0.35, bright=0.55), start, 0.8)
    place(dry, piano(hz(CH[name][0]) * 2, 2.0, 0.6), start, 1.0, -0.2)
    steps = int(round(length / (BEAT / 2)))
    for k in range(steps):
        note = ARP[name][k % 8]
        place(dry, piano(hz(note) * 2, 1.2, 0.8 + 0.15 * (k % 2 == 0)), start + k * BEAT / 2, 1.0, 0.35 if k % 2 else -0.35)
for b in np.arange(1.5, 5.95, BEAT):
    place(drums, kick(0.45, 95, 50, 0.3), b)
# respiración antes del héroe: nada suena entre 5.85 y 6.0 salvo la cola

# --- Héroe 6.0–9.0: golpe de cuerdas + melodía lenta ---
place(drums, kick(1.4, 70, 32, 1.1), 6.0)
for n in ["D2", "A2", "D3", "F#3", "A3"]:
    place(pads, strings(hz(n), 3.3, attack=0.05, release=1.2, bright=0.45), 6.0, 1.1)
for n, t, v in [("F#5", 6.0, 0.9), ("D5", 6.0, 0.5), ("E5", 7.2, 0.75), ("A4", 7.2, 0.4), ("D5", 7.8, 0.8), ("B4", 8.4, 0.6)]:
    place(dry, piano(hz(n), 3, v * 1.5), t, 1.0, 0.05)

# --- Rápidos 9.0–13.0: build ---
build = [("G", 9.0), ("D", 10.2), ("Bm", 11.4), ("A", 12.4)]
for idx, (name, start) in enumerate(build):
    length = 1.2 if idx < 2 else 1.0 if idx == 2 else 0.6
    for n in CH[name]:
        place(pads, strings(hz(n), length + 0.3, attack=0.08, release=0.25, bright=0.5 + 0.12 * idx), start, 0.8 + 0.12 * idx)
    steps = int(round(length / (BEAT / 4)))
    for k in range(steps):
        note = ARP[name][k % 8]
        place(dry, piano(hz(note) * 2, 0.8, 0.6 + 0.06 * idx), start + k * BEAT / 4, 1.0, 0.4 if k % 2 else -0.4)
for b in np.arange(9.0, 12.95, BEAT):
    place(drums, kick(0.45, 100, 48, 0.55), b)
for b in np.arange(9.0 + BEAT / 2, 12.95, BEAT):
    place(drums, tom(120, 0.4), b, 0.35, 0.3)
for k, b in enumerate(np.arange(12.4, 13.0, BEAT / 4)):  # redoble final
    place(drums, tom(95 + 10 * k, 0.35), b, 0.4 + 0.1 * k, -0.3 + 0.15 * k)

# --- End card 13.0–15.0: resolución ---
place(drums, kick(1.6, 65, 30, 1.0), 13.0)
for n in ["D2", "A2", "D3", "F#3", "A3", "D4", "F#4"]:
    place(pads, strings(hz(n), 2.0, attack=0.04, release=1.6, bright=0.4), 13.0, 1.0)
for n, v in [("D4", 0.7), ("F#4", 0.6), ("A4", 0.6), ("D5", 0.8)]:
    place(dry, piano(hz(n), 2.0, v), 13.0, 1.0)

mix = eq(reverb(dry, 2.6, 0.30) * 1.3 + reverb(pads, 3.2, 0.38) * 0.75 + reverb(drums, 1.2, 0.12))
t = np.arange(N) / SR
mix *= np.minimum(1, t / 0.03) * np.minimum(1, np.maximum(0, (DUR - t) / 1.2))
mix = np.tanh(mix * 1.4) / np.tanh(1.4)  # saturación suave tipo cinta
mix /= np.max(np.abs(mix)) / 0.89

write_wav(sys.argv[1], mix)
print("OK", sys.argv[1])
