#!/usr/bin/env bash
# Uso: scripts/prepare-music.sh "Si nada es suficiente.mp3" [inicio, ej. 00:01:12.5]
# Corta 15 s desde el inicio indicado (elige el drop/coro), fades y loudness para redes (-14 LUFS).
set -euo pipefail
cd "$(dirname "$0")/.."
IN="$1"; START="${2:-0}"
mkdir -p public/audio
ffmpeg -nostdin -v error -y -ss "$START" -i "$IN" -t 15 \
  -af "afade=t=in:d=0.15,afade=t=out:st=13.6:d=1.4,loudnorm=I=-14:TP=-1:LRA=9" \
  -ar 48000 -ac 2 -b:a 320k public/audio/track.mp3
echo "OK: public/audio/track.mp3"
# Estimación de BPM (onsets de graves) para ajustar BPM en src/config.ts
python3 -I - public/audio/track.mp3 <<'PY'
import subprocess, sys, array
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-af","lowpass=f=150","-ac","1","-ar","4000","-f","s16le","-"],capture_output=True).stdout
x = array.array("h", raw); hop = 40  # 10 ms
env = [sum(abs(v) for v in x[i:i+hop]) for i in range(0, len(x)-hop, hop)]
d = [max(0, env[i]-env[i-1]) for i in range(1, len(env))]
best = max(range(30, 101), key=lambda lag: sum(d[i]*d[i-lag] for i in range(lag, len(d))))
bpm = 6000 / best
while bpm < 80: bpm *= 2
while bpm > 160: bpm /= 2
print(f"BPM estimado: {bpm:.0f}  -> pon BPM = {round(bpm)} en src/config.ts")
PY
