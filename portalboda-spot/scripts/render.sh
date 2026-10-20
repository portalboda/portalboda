#!/usr/bin/env bash
# Render final H.264 CRF 18 + recorte a 15,0 s exactos (el AAC agrega ~20 ms de relleno).
set -euo pipefail
cd "$(dirname "$0")/.."
BX="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
[ -x "$BX" ] && BFLAG="--browser-executable=$BX" || BFLAG=""
for c in 16x9 9x16; do
  npx remotion render "Spot$c" "out/raw_$c.mp4" --codec=h264 --crf=18 $BFLAG
  ffmpeg -nostdin -v error -y -i "out/raw_$c.mp4" -t 14.99 -c:v copy -c:a aac -b:a 256k -movflags +faststart "out/portalboda_$c.mp4"
  rm -f "out/raw_$c.mp4"
  echo "$c: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/portalboda_$c.mp4") s"
done
