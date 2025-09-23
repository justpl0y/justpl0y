#!/usr/bin/env bash
set -euo pipefail

JSON_FILE="json/social.json"
GAMES_DIR="g"
TMP=$(mktemp)

# ensure json file exists
if [ ! -f "$JSON_FILE" ]; then
  echo "[]" > "$JSON_FILE"
fi

# add missing games
for game in "$GAMES_DIR"/*; do
  if [ -d "$game" ] && [ -f "$game/index.html" ]; then
    game_name=$(basename "$game")
    game_id=$(echo "$game_name" | tr '[:upper:]' '[:lower:]')
    game_url="$GAMES_DIR/$game_name/index.html"

    # check if already exists by id OR url
    exists=$(jq --arg id "$game_id" --arg url "$game_url" '[.[] | select(.id==$id or .url==$url)] | length' "$JSON_FILE")
    if [ "$exists" -eq 0 ]; then
      echo "➕ Adding $game_name"

      # first image in folder for logo
      logo_file=$(find "$game" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) | head -n1)
      if [ -n "$logo_file" ]; then
        # relative path from current directory
        logo_rel="${logo_file#./}"
      else
        logo_rel=""
      fi

      # add new entry without touching other existing fields
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
