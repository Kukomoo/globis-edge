#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="${SCRIPT_DIR}/sequence_assets/clips"
OUTPUT_DIR="${SCRIPT_DIR}/sequence_assets/output"
OUTPUT_FILE="${OUTPUT_DIR}/globis_edge_30_scene_assembly.mp4"
EXPECTED_CLIPS=30
WIDTH=1920
HEIGHT=1080
FPS=24
VIDEO_CODEC="libx264"
PIX_FMT="yuv420p"
PRESET="medium"
CRF=18
TRANSITION_DURATION=0.35
DRY_RUN=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Stitches 30 scene clips into a single continuous MP4 using gentle crossfades.

Options:
  --input-dir PATH           Directory containing scene clips
  --output PATH              Output MP4 path
  --transition-duration SEC  Crossfade duration in seconds (default: ${TRANSITION_DURATION})
  --fps N                    Output frame rate (default: ${FPS})
  --width N                  Output width (default: ${WIDTH})
  --height N                 Output height (default: ${HEIGHT})
  --dry-run                  Validate inputs and print the planned ffmpeg work only
  --help                     Show this help text

Clip naming:
  Name clips so lexical sort matches scene order, for example:
  scene01.mp4 ... scene30.mp4
EOF
}

require_tool() {
  local tool="$1"
  if ! command -v "${tool}" >/dev/null 2>&1; then
    echo "Missing required tool: ${tool}" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input-dir)
      INPUT_DIR="$2"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      OUTPUT_DIR="$(dirname "${OUTPUT_FILE}")"
      shift 2
      ;;
    --transition-duration)
      TRANSITION_DURATION="$2"
      shift 2
      ;;
    --fps)
      FPS="$2"
      shift 2
      ;;
    --width)
      WIDTH="$2"
      shift 2
      ;;
    --height)
      HEIGHT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_tool ffmpeg
require_tool ffprobe

if [[ ! -d "${INPUT_DIR}" ]]; then
  echo "Input directory does not exist: ${INPUT_DIR}" >&2
  exit 1
fi

CLIPS=()
while IFS= read -r clip; do
  CLIPS+=("${clip}")
done < <(find "${INPUT_DIR}" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.m4v" \) | sort)

if [[ "${#CLIPS[@]}" -ne "${EXPECTED_CLIPS}" ]]; then
  echo "Expected ${EXPECTED_CLIPS} clips in ${INPUT_DIR}, found ${#CLIPS[@]}." >&2
  echo "Use scene01..scene30 style names so sort order matches story order." >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
TEMP_DIR="$(mktemp -d "${OUTPUT_DIR}/assemble_tmp.XXXXXX")"
trap 'rm -rf "${TEMP_DIR}"' EXIT

declare -a NORMALISED
declare -a DURATIONS

for i in "${!CLIPS[@]}"; do
  index=$((i + 1))
  src="${CLIPS[$i]}"
  dst="${TEMP_DIR}/$(printf "clip_%02d.mp4" "${index}")"
  NORMALISED+=("${dst}")

  ffmpeg -y \
    -i "${src}" \
    -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=${PIX_FMT}" \
    -an \
    -c:v "${VIDEO_CODEC}" \
    -preset "${PRESET}" \
    -crf "${CRF}" \
    "${dst}" \
    >/dev/null 2>&1

  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${dst}")"
  DURATIONS+=("${duration}")
done

FILTER_COMPLEX=""
running_offset=0

for i in "${!NORMALISED[@]}"; do
  FILTER_COMPLEX+="[${i}:v]settb=AVTB[clip${i}];"
done

for i in $(seq 1 $((EXPECTED_CLIPS - 1))); do
  prev_index=$((i - 1))
  if [[ "${i}" -eq 1 ]]; then
    previous_label="[clip0]"
    running_offset="$(awk -v d="${DURATIONS[0]}" -v t="${TRANSITION_DURATION}" 'BEGIN { printf "%.3f", d - t }')"
  else
    previous_label="[xf$((i - 1))]"
    running_offset="$(awk -v current="${running_offset}" -v d="${DURATIONS[prev_index]}" -v t="${TRANSITION_DURATION}" 'BEGIN { printf "%.3f", current + d - t }')"
  fi

  FILTER_COMPLEX+="${previous_label}[clip${i}]xfade=transition=fade:duration=${TRANSITION_DURATION}:offset=${running_offset}[xf${i}];"
done

FILTER_COMPLEX="${FILTER_COMPLEX%?}"
FINAL_LABEL="[xf$((EXPECTED_CLIPS - 1))]"

if [[ "${DRY_RUN}" -eq 1 ]]; then
  echo "Input clips:"
  printf '  %s\n' "${CLIPS[@]}"
  echo
  echo "Normalised clips will be written to: ${TEMP_DIR}"
  echo "Final output: ${OUTPUT_FILE}"
  echo "Filter graph:"
  echo "${FILTER_COMPLEX}"
  exit 0
fi

INPUT_ARGS=()
for clip in "${NORMALISED[@]}"; do
  INPUT_ARGS+=(-i "${clip}")
done

ffmpeg -y \
  "${INPUT_ARGS[@]}" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -filter_complex "${FILTER_COMPLEX}" \
  -map "${FINAL_LABEL}" \
  -map $((EXPECTED_CLIPS)):a \
  -shortest \
  -c:v "${VIDEO_CODEC}" \
  -preset "${PRESET}" \
  -crf "${CRF}" \
  -pix_fmt "${PIX_FMT}" \
  -c:a aac \
  -b:a 192k \
  "${OUTPUT_FILE}"

echo "Assembled video written to ${OUTPUT_FILE}"
