#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $(basename "$0") scene_XX" >&2
  exit 1
fi

scene_name="$1"
dest_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/sequence_assets/meta_keyframes"
mkdir -p "$dest_dir"

latest_file="$(ls -1t "$HOME/Downloads" | head -n 1)"
if [[ -z "${latest_file}" ]]; then
  echo "No files found in ~/Downloads" >&2
  exit 1
fi

src="$HOME/Downloads/$latest_file"
ext="${latest_file##*.}"
dest="$dest_dir/${scene_name}.${ext}"

cp "$src" "$dest"
echo "$dest"
