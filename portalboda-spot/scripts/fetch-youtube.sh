#!/usr/bin/env bash
# Pipeline oficial: material SOLO del canal @portalboda6955.
# Requiere acceso de red a youtube.com / googlevideo.com.
set -euo pipefail
cd "$(dirname "$0")/.."
CH="https://www.youtube.com/@portalboda6955/videos"
mkdir -p raw candidates
yt-dlp --flat-playlist --print "%(id)s %(title)s" "$CH" | tee raw/list.txt
# Elegir 8-10 ids representativos y dejarlos en raw/ids.txt (uno por línea).
[ -f raw/ids.txt ] || head -n 10 raw/list.txt | cut -d' ' -f1 > raw/ids.txt
while read -r id; do
  yt-dlp -f "bv*[height>=1080][ext=mp4]+ba/bv*[height>=1080]+ba" --merge-output-format mp4 \
    -o "raw/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id" </dev/null
done < raw/ids.txt
# Candidatos: cambio de escena (>0.3), máximo 1 cada 2 s; pts en el nombre = timestamp.
for f in raw/*.mp4; do
  id=$(basename "$f" .mp4)
  ffmpeg -nostdin -v error -i "$f" -vf "select='gt(scene,0.3)*gte(t-prev_selected_t,2)',showinfo" \
    -fps_mode vfr -frame_pts 1 -q:v 2 "candidates/${id}_%010d.jpg" 2> "candidates/${id}.log"
done
echo "Revisa candidates/, copia los 14 elegidos a public/img y registra id+timestamp en assets.json"
# Microclip ejemplo (1-2 s): ffmpeg -ss 00:01:23.4 -i raw/ID.mp4 -t 1.8 -an -c:v libx264 -crf 16 public/clips/beso.mp4

# Música: MUSIC_ID=<id del video del canal> MUSIC_START=00:00:30 scripts/fetch-youtube.sh
# Extrae 15 s a public/audio/track.mp3; luego en src/config.ts: MUSIC_TRACK = "audio/track.mp3".
# OJO: si la pista es comercial, su licencia no cubre publicidad (Content ID / silenciado en Meta/TikTok).
if [ -n "${MUSIC_ID:-}" ]; then
  mkdir -p public/audio
  yt-dlp -x --audio-format mp3 -o "raw/music_%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$MUSIC_ID" </dev/null
  ffmpeg -nostdin -y -ss "${MUSIC_START:-0}" -i "raw/music_$MUSIC_ID.mp3" -t 15 \
    -af "afade=t=in:d=0.2,afade=t=out:st=13.8:d=1.2,loudnorm=I=-14:TP=-1" public/audio/track.mp3
fi
