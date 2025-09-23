#!/usr/bin/env bash
set -euo pipefail

JSON_FILE="json/social.json"
GAMES_DIR="g"
TMP=$(mktemp)

if [ ! -f "$JSON_FILE" ]; then
    mkdir -p "$(dirname "$JSON_FILE")"
    echo "[]" > "$JSON_FILE"
fi

if [ ! -d "$GAMES_DIR" ]; then
    exit 0
fi

IMG_EXTENSIONS=("png" "jpg" "jpeg" "webp" "gif" "svg" "bmp" "ico" "avif")

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

extract_game_path() {
    local url="$1"
    echo "${url#*/g/}" | sed 's|/$||'
}

for game in "$GAMES_DIR"/*; do
    if [ -d "$game" ]; then
        logo_file=$(find_first_image "$game")
        
        if [ -z "$logo_file" ]; then
            continue
        fi
        
        game_name=$(basename "$game")
        game_id=$(echo "$game_name" | tr '[:upper:]' '[:lower:]')
        game_url="/$GAMES_DIR/$(echo "$game_name" | tr '[:upper:]' '[:lower:]')/"
        logo_rel="${logo_file#./}"
        
        exists=$(jq --arg id "$game_id" --arg url "$game_url" '[.[] | select(.id==$id or .url==$url)] | length' "$JSON_FILE")
        
        if [ "$exists" -eq 0 ]; then
            jq --arg id "$game_id" \
               --arg name "$game_name" \
               --arg url "$game_url" \
               --arg logo "$logo_rel" \
               '. + [{id: $id, name: $name, url: $url, logo: $logo}]' "$JSON_FILE" > "$TMP"
            mv "$TMP" "$JSON_FILE"
        fi
    fi
done
