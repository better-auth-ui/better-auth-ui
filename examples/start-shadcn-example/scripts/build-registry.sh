#!/usr/bin/env bash
#
# Build the shadcn registry JSON and sync component + lib sources from this
# example into the other consumers (the docs app and the Next.js example).
#
# `cp -r` never prunes, so each mirrored subtree is removed up front and
# re-created from scratch to keep renames/deletes propagating cleanly.

set -euo pipefail

# Resolve repo-relative paths regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$EXAMPLE_DIR/src"

# Subtrees mirrored into every target, relative to `src/`. Everything
# plugin-related lives under `auth/`; shadcn UI primitives live under `ui/`.
MIRRORS=(
  components/auth
  components/ui
  lib/auth
)

TARGETS=(
  "$EXAMPLE_DIR/../../apps/docs/src"
  "$EXAMPLE_DIR/../next-shadcn-example/src"
)

# Library-agnostic subtrees mirrored into the Base UI example. The auth
# components and plugin scaffolding are written to work against both Radix
# and Base UI primitives, so they stay in sync here — but `components/ui`
# is intentionally excluded since those primitives differ per library.
AGNOSTIC_MIRRORS=(
  components/auth
  lib/auth
)

AGNOSTIC_TARGETS=(
  "$EXAMPLE_DIR/../start-shadcn-baseui-example/src"
)

REGISTRY_OUTPUT="$EXAMPLE_DIR/../../apps/docs/public/r"

# `shadcn build` writes one JSON per registry item but never deletes stale
# entries from previous runs. Prune only the top-level JSON files this build
# owns so renames/removals propagate without touching namespaced registries
# (e.g. `solid/`, owned by the Solid example's registry build).
echo "→ pruning $REGISTRY_OUTPUT"
: "${REGISTRY_OUTPUT:?REGISTRY_OUTPUT is empty}"
mkdir -p "$REGISTRY_OUTPUT"
find "$REGISTRY_OUTPUT" -maxdepth 1 -type f -name '*.json' -delete

echo "→ shadcn build → $REGISTRY_OUTPUT"
(cd "$EXAMPLE_DIR" && bunx shadcn build --output "$REGISTRY_OUTPUT")

for target in "${TARGETS[@]}"; do
  echo "→ syncing $target"
  for path in "${MIRRORS[@]}"; do
    # Guard against empty variables so a misconfigured loop never does `rm -rf /`.
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
    # Guard against empty variables so a misconfigured loop never does `rm -rf /`.
    : "${target:?target is empty}"
    : "${path:?mirror path entry is empty}"
    rm -rf -- "$target/$path"
    mkdir -p -- "$(dirname "$target/$path")"
    cp -R -- "$SRC/$path" "$target/$path"
  done
done

echo "✓ registry build complete"
