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

# The auth components and plugin scaffolding work with both Radix and Base UI.
# UI primitives remain owned by each example because their implementations
# differ.
AGNOSTIC_MIRRORS=(
  components/auth
  lib/auth
)

AGNOSTIC_TARGETS=(
  "$EXAMPLE_DIR/../start-shadcn-baseui-example/src"
)

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

for target in "${AGNOSTIC_TARGETS[@]}"; do
  echo "→ syncing $target (agnostic subtrees only)"
  for path in "${AGNOSTIC_MIRRORS[@]}"; do
    : "${target:?target is empty}"
    : "${path:?mirror path entry is empty}"
    rm -rf -- "$target/$path"
    mkdir -p -- "$(dirname "$target/$path")"
    cp -R -- "$SRC/$path" "$target/$path"
  done
done

echo "✓ source sync complete"
