#!/usr/bin/env bash
#
# Sync component and library sources from this example into the docs app and
# the other shadcn examples.
#
# `cp -r` never prunes, so each mirrored subtree is removed up front and
# re-created from scratch to keep renames and deletions propagating cleanly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$EXAMPLE_DIR/src"

MIRRORS=(
  components/auth
  components/ui
  lib/auth
)

TARGETS=(
  "$EXAMPLE_DIR/../../apps/docs/src"
  "$EXAMPLE_DIR/../next-shadcn-example/src"
)

# Most auth components and plugin scaffolding work with both Radix and Base UI.
# Keep the few primitive-specific consumers owned by the Base UI example.
AGNOSTIC_MIRRORS=(
  components/auth
  lib/auth
)

BASE_UI_TARGET="$EXAMPLE_DIR/../start-shadcn-baseui-example/src"
BASE_UI_OVERRIDES=(
  components/auth/additional-field.tsx
  components/auth/api-key/create-api-key-dialog.tsx
  components/auth/organization/invite-member-dialog.tsx
  components/auth/phone-number/remove-phone-number-dialog.tsx
)

OVERRIDE_BACKUP="$(mktemp -d)"
trap 'rm -rf -- "$OVERRIDE_BACKUP"' EXIT

for path in "${BASE_UI_OVERRIDES[@]}"; do
  : "${path:?override path entry is empty}"
  mkdir -p -- "$OVERRIDE_BACKUP/$(dirname "$path")"
  cp -- "$BASE_UI_TARGET/$path" "$OVERRIDE_BACKUP/$path"
done

for target in "${TARGETS[@]}"; do
  echo "→ syncing $target"
  for path in "${MIRRORS[@]}"; do
    : "${target:?target is empty}"
    : "${path:?mirror path entry is empty}"
    rm -rf -- "$target/$path"
    mkdir -p -- "$(dirname "$target/$path")"
    cp -R -- "$SRC/$path" "$target/$path"
  done
done

echo "→ syncing $BASE_UI_TARGET (shared files with Base UI overrides)"
for path in "${AGNOSTIC_MIRRORS[@]}"; do
  : "${path:?mirror path entry is empty}"
  rm -rf -- "$BASE_UI_TARGET/$path"
  mkdir -p -- "$(dirname "$BASE_UI_TARGET/$path")"
  cp -R -- "$SRC/$path" "$BASE_UI_TARGET/$path"
done

for path in "${BASE_UI_OVERRIDES[@]}"; do
  mkdir -p -- "$(dirname "$BASE_UI_TARGET/$path")"
  cp -- "$OVERRIDE_BACKUP/$path" "$BASE_UI_TARGET/$path"
done

echo "✓ source sync complete"
