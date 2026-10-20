#!/usr/bin/env bash
# Fallback provisional: encuadres de DoP desde fotos propias de Portal Boda (repo /img).
# Uso cuando YouTube no es accesible. Cada recorte >=1920 px de ancho.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=../img
OUT=public/img
mkdir -p "$OUT"
# nombre | archivo origen | crop (w:h:x:y) o "full"
while IFS="|" read -r -u 3 name src crop; do
  [ -z "$name" ] && continue
  if [ "$crop" = "full" ]; then vf="scale='min(iw,3840)':-2"; else vf="crop=$crop,scale='min(iw,3840)':-2"; fi
  # 13: patente difuminada (privacidad / sin texto quemado)
  [ "$name" = "13_moto_atardecer" ] && vf="$vf,split[a][b];[b]crop=212:130:1400:1462,gblur=sigma=16:steps=3[p];[a][p]overlay=1400:1462"
  ffmpeg -nostdin -v error -y -i "$SRC/$src" -vf "$vf" -q:v 2 "$OUT/$name.jpg"
  echo "$name $(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$OUT/$name.jpg" </dev/null)"
done 3<<'LIST'
01_manos_detalle|ceremonia-exterior.jpg|1920:1080:40:660
02_manos_ramo|ceremonia-exterior.jpg|full
03_ramo_detalle|ceremonia-exterior.jpg|1920:1080:740:90
04_beso_iglesia|ceremonia-beso-2024.jpg|full
05_beso_rostros|ceremonia-beso-2024.jpg|1920:1080:450:385
06_beso_manos|ceremonia-beso-2024.jpg|1920:1080:750:1670
07_velo_playa|postboda-leyla-daniel.jpg|full
08_velo_pareja|postboda-leyla-daniel.jpg|2400:1350:2286:800
09_portico_bn|postboda-min-nacho.jpg|full
10_portico_novia|postboda-min-nacho.jpg|2400:1350:450:750
11_abrazo_arco|postboda-pareja-bn.jpg|full
12_abrazo_rostros|postboda-pareja-bn.jpg|1920:1080:440:130
13_moto_atardecer|ceremonia-manos-ramo.jpg|full
14_moto_beso|ceremonia-manos-ramo.jpg|2000:1125:0:300
LIST
