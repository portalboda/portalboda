"""Pista original para el spot (15 s, 100 BPM, Re mayor). Sin samples ni licencias de terceros.

Estructura alineada al guion:
  0.0–1.5  hook: piano solo + pad que respira ("Una vez." / "Para siempre.")
  1.5–6.0  montaje: arpegio de piano en corcheas + latido grave en cada beat (IV–I–vi–V)
  6.0–9.0  héroe: golpe de cuerdas graves y melodía lenta de piano
  9.0–13.0 rápidos: build con toms, arpegio más brillante y cuerdas en crescendo
  13.0–15  end card: resolución en Re mayor y cola de reverb

Uso: python3 -I scripts/compose-music.py public/audio/track.wav
"""
import sys
import numpy as np

SR = 48000
DUR = 15.0
BPM = 100
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)


def hz(note: str) -> float:
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    name, octave = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[name] + 12 * (octave + 1) - 69) / 12)


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i : i + len(sig)] += sig * l
    buf[1, i : i + len(sig)] += sig * r


def piano(f, length=2.5, vel=1.0):
    t = np.arange(int(SR * length)) / SR
    sig = np.zeros_like(t)
    for k, a in enumerate([1.0, 0.6, 0.35, 0.22, 0.12, 0.07, 0.04], start=1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)  # leve inarmonicidad de cuerda
        sig += a * np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.4 + 0.45 * k))
    attack = np.minimum(1, t / 0.004)
    hammer = rng.standard_normal(len(t)) * np.exp(-t * 90) * 0.02
    return (sig * attack + hammer) * vel * 0.35


def strings(f, length, attack=0.6, release=0.8, bright=0.5):
    t = np.arange(int(SR * length)) / SR
    sig = np.zeros_like(t)
    for detune in (-0.12, -0.04, 0.05, 0.11):  # ensemble desafinado
        ff = f * 2 ** (detune / 12)
        vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6))
        phase = np.cumsum(2 * np.pi * ff * vib / SR)
        saw = sum(np.sin(k * phase) / k for k in range(1, 9))
        sig += saw
    # filtro paso bajo de un polo (cálido)
    a = np.exp(-2 * np.pi * (600 + 2400 * bright) / SR)
    out = np.empty_like(sig)
    acc = 0.0
    for i in range(0, len(sig), 1):
        acc = (1 - a) * sig[i] + a * acc
        out[i] = acc
    env = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, (length - t) / release))
    return out * env * 0.05


def kick(length=0.6, f0=110, f1=42, gain=1.0):
    t = np.arange(int(SR * length)) / SR
    freq = f1 + (f0 - f1) * np.exp(-t * 28)
    return np.sin(np.cumsum(2 * np.pi * freq / SR)) * np.exp(-t * 7) * gain


def tom(f=90, length=0.5):
    t = np.arange(int(SR * length)) / SR
    freq = f * (1 + 0.6 * np.exp(-t * 30))
    body = np.sin(np.cumsum(2 * np.pi * freq / SR)) * np.exp(-t * 9)
    skin = rng.standard_normal(len(t)) * np.exp(-t * 40) * 0.25
    return (body + skin) * 0.6


def reverb(x, seconds=2.8, mix=0.32):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds)
        ir[: int(SR * 0.012)] = 0  # predelay
        ir /= np.sqrt(np.sum(ir**2))
        size = 1 << int(np.ceil(np.log2(len(x[ch]) + n)))
        wet = np.fft.irfft(np.fft.rfft(x[ch], size) * np.fft.rfft(ir, size), size)[: len(x[ch])]
        out[ch] = x[ch] * (1 - mix) + wet * mix * 2.2
    return out


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

def eq(x):
    """Ecualización de mezcla: limpia sub-graves, quita barro en 200–400 Hz y suma presencia/aire."""
    f = np.fft.rfftfreq(x.shape[1], 1 / SR)
    g = np.ones_like(f)
    g *= 1 / np.sqrt(1 + (35 / np.maximum(f, 1)) ** 4)  # high-pass 35 Hz
    g *= 1 - 0.35 * np.exp(-((np.log2(np.maximum(f, 1) / 280)) ** 2) / 0.3)  # -3,7 dB en 280 Hz
    g *= 1 + 0.75 * np.exp(-((np.log2(np.maximum(f, 1) / 3000)) ** 2) / 0.8)  # +4,9 dB presencia
    g *= 1 + 0.5 / (1 + (9000 / np.maximum(f, 1)) ** 2)  # +3,5 dB aire
    return np.fft.irfft(np.fft.rfft(x, axis=1) * g, x.shape[1], axis=1)


mix = eq(reverb(dry, 2.6, 0.30) * 1.3 + reverb(pads, 3.2, 0.38) * 0.75 + reverb(drums, 1.2, 0.12))
t = np.arange(N) / SR
mix *= np.minimum(1, t / 0.03) * np.minimum(1, np.maximum(0, (DUR - t) / 1.2))
mix = np.tanh(mix * 1.4) / np.tanh(1.4)  # saturación suave tipo cinta
mix /= np.max(np.abs(mix)) / 0.89

out = (mix.T * 32767).astype("<i2").tobytes()
path = sys.argv[1]
with open(path, "wb") as fh:
    import struct

    fh.write(b"RIFF" + struct.pack("<I", 36 + len(out)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 4, 4, 16))
    fh.write(b"data" + struct.pack("<I", len(out)) + out)
print("OK", path)
