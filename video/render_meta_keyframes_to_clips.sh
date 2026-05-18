#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="${SCRIPT_DIR}/sequence_assets/meta_keyframes"
OUTPUT_DIR="${SCRIPT_DIR}/sequence_assets/clips"
FPS=24
DURATION=5
WIDTH=1920
HEIGHT=1080

mkdir -p "${OUTPUT_DIR}"

shopt -s nullglob
for src in "${INPUT_DIR}"/scene_*.jpg "${INPUT_DIR}"/scene_*.jpeg "${INPUT_DIR}"/scene_*.png; do
  [[ -e "$src" ]] || continue
  base="$(basename "${src%.*}")"
  dst="${OUTPUT_DIR}/${base}.mp4"

  ffmpeg -y \
    -loop 1 \
    -framerate "${FPS}" \
    -t "${DURATION}" \
    -i "${src}" \
    -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,zoompan=z='if(eq(on,1),1.0,min(zoom+0.00045,1.06))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${WIDTH}x${HEIGHT}:fps=${FPS},format=yuv420p" \
    -an \
    -c:v libx264 \
    -pix_fmt yuv420p \
    "${dst}" >/dev/null 2>&1

  echo "${dst}"
done
