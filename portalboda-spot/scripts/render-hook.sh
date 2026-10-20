#!/usr/bin/env bash
# Gancho rosa (4,8 s). Recompone la música y renderiza 9:16 y 16:9.
set -euo pipefail
cd "$(dirname "$0")/.."
BX="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
[ -x "$BX" ] && BFLAG="--browser-executable=$BX" || BFLAG=""
python3 scripts/compose-hook.py out/hook_music.wav
ffmpeg -nostdin -v error -y -i out/hook_music.wav -af "loudnorm=I=-14:TP=-1:LRA=7" -ar 48000 -b:a 320k public/audio/hook.mp3
rm -f out/hook_music.wav
for c in 9x16 16x9; do
  npx remotion render "Hook$c" "out/raw_hook_$c.mp4" --codec=h264 --crf=18 $BFLAG
  ffmpeg -nostdin -v error -y -i "out/raw_hook_$c.mp4" -t 4.79 -c:v copy -c:a aac -b:a 256k -movflags +faststart "out/portalboda_gancho_$c.mp4"
  rm -f "out/raw_hook_$c.mp4"
  echo "gancho_$c: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/portalboda_gancho_$c.mp4") s"
done
