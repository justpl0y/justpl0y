#!/usr/bin/env bash
set -euo pipefail

JSON_FILE="json/social.json"
GAMES_DIR="g"
TMP=$(mktemp)

# ensure JSON file exists
if [ ! -f "$JSON_FILE" ]; then
  mkdir -p "$(dirname "$JSON_FILE")"
  echo "[]" > "$JSON_FILE"
fi

# ensure games dir exists
if [ ! -d "$GAMES_DIR" ]; then
  echo "⚠️ Games directory '$GAMES_DIR' not found. Exiting."
  exit 0
fi

# supported image formats
IMG_EXTENSIONS=("png" "jpg" "jpeg" "webp" "gif" "svg" "bmp" "ico" "avif")

# function to find first image in a folder
find_first_image() {
  local folder="$1"
  for ext in "${IMG_EXTENSIONS[@]}"; do
    img=$(find "$folder" -maxdepth 1 -type f -iname "*.$ext" | head -n1)
    if [ -n "$img" ]; then
      echo "$img"
      return
    fi
  done
}

# add missing games
for game in "$GAMES_DIR"/*; do
  if [ -d "$game" ]; then
    logo_file=$(find_first_image "$game")

    # skip if no image found
    if [ -z "$logo_file" ]; then
      echo "⏭ Skipping $(basename "$game") (no image found)"
      continue
    fi

    game_name=$(basename "$game")
    game_id=$(echo "$game_name" | tr '[:upper:]' '[:lower:]')
    game_url="$GAMES_DIR/$game_name"  # no longer forcing index.html
    logo_rel="${logo_file#./}"  # relative path

    # check if already exists by id OR url
    exists=$(jq --arg id "$game_id" --arg url "$game_url" '[.[] | select(.id==$id or .url==$url)] | length' "$JSON_FILE")
    if [ "$exists" -eq 0 ]; then
      echo "➕ Adding $game_name"
      # add new entry
      jq --arg id "$game_id" \
         --arg name "$game_name" \
         --arg url "$game_url" \
         --arg logo "$logo_rel" \
         '. + [{id: $id, name: $name, url: $url, logo: $logo}]' "$JSON_FILE" > "$TMP"
      mv "$TMP" "$JSON_FILE"
    fi
  fi
done

echo "✅ Done! Updated $JSON_FILE"
