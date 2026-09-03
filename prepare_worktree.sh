#!/usr/bin/env bash

set -euo pipefail

readonly repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required to prepare this worktree." >&2
  exit 1
fi

cd -- "$repo_root"
bun install --frozen-lockfile

# The HeroUI CLI checks only the root manifest and cannot detect workspace dependencies.
printf 'y\n' | bunx --bun heroui-cli@latest agents-md --react --output AGENTS.md
