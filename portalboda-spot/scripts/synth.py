"""Instrumentos sintetizados compartidos (piano, cuerdas, bombo, tom, reverb, EQ). Sin samples."""
import struct
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def hz(note: str) -> float:
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    name, octave = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[name] + 12 * (octave + 1) - 69) / 12)


def place(buf, sig, t, gain=1.0, pan=0.0):
    n = buf.shape[1]
    i = int(t * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
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


def eq(x):
    """Ecualización de mezcla: limpia sub-graves, quita barro en 200–400 Hz y suma presencia/aire."""
    f = np.fft.rfftfreq(x.shape[1], 1 / SR)
    g = np.ones_like(f)
    g *= 1 / np.sqrt(1 + (35 / np.maximum(f, 1)) ** 4)  # high-pass 35 Hz
    g *= 1 - 0.35 * np.exp(-((np.log2(np.maximum(f, 1) / 280)) ** 2) / 0.3)  # -3,7 dB en 280 Hz
    g *= 1 + 0.75 * np.exp(-((np.log2(np.maximum(f, 1) / 3000)) ** 2) / 0.8)  # +4,9 dB presencia
    g *= 1 + 0.5 / (1 + (9000 / np.maximum(f, 1)) ** 2)  # +3,5 dB aire
    return np.fft.irfft(np.fft.rfft(x, axis=1) * g, x.shape[1], axis=1)



def write_wav(path, mix):
    out = (mix.T * 32767).astype("<i2").tobytes()
    with open(path, "wb") as fh:
        fh.write(b"RIFF" + struct.pack("<I", 36 + len(out)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 4, 4, 16))
        fh.write(b"data" + struct.pack("<I", len(out)) + out)
