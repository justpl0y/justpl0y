#!/bin/sh

DESTDIR="g"

# Go into the 'g' directory
cd "$DESTDIR" || { echo "Directory '$DESTDIR' not found"; exit 1; }

# Find all zip files
ZIPFILES=$(ls *.zip 2>/dev/null)

if [ -z "$ZIPFILES" ]; then
  echo "No zip files found in '$DESTDIR'"
  exit 0
fi

# Loop through each zip file
for ZIPFILE in $ZIPFILES; do
  echo "Unzipping '$ZIPFILE'..."
  unzip -q "$ZIPFILE"
  rm -f "$ZIPFILE"
  echo "'$ZIPFILE' extracted and deleted."
done

echo "All zip files processed in '$DESTDIR/'"
