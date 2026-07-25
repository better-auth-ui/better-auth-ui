#!/usr/bin/env bash
#
# Build the public shadcn registry JSON from this example's registry definition
# and source files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
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

echo "✓ registry build complete"
