---
name: better-auth-ui
description: "Trigger: Better Auth UI, @better-auth-ui, shadcn auth, HeroUI auth, Solid auth UI, Zaidan, auth components. Route agents to the correct framework, UI surface, docs, registry, package, and validation path."
license: Apache-2.0
metadata:
  author: better-auth-ui
  version: "1.0"
---

## Activation Contract

Use this skill when installing, customizing, debugging, or documenting Better Auth UI packages, copied components, framework hooks, server helpers, plugins, queries, or mutations.

Do not use it for generic Better Auth server setup unless Better Auth UI code, docs, components, or package exports are involved.

## Hard Rules

- Start from `https://better-auth-ui.com/llms.txt`; fetch the listed `.md` docs before guessing APIs.
- Use `https://better-auth-ui.com/llms-full.txt` only when broad cross-surface context is needed.
- Match the requested surface before choosing files or packages: React, Solid, shadcn/ui, HeroUI, Zaidan, core, or upstream Better Auth.
- For Better Auth server config, plugins, adapters, sessions, auth endpoints, or database behavior, read upstream Better Auth docs/skills before changing Better Auth UI code.
- Do not duplicate shared auth query/mutation/plugin behavior in adapters; inspect `@better-auth-ui/core` patterns first.
- For consumer projects, use the project's own package manager and scripts; do not assume any monorepo runner, package manager, framework, or test tool unless the project shows it.

## Decision Gates

| Situation | Use |
| --- | --- |
| Copied React UI components | shadcn docs, registry `https://better-auth-ui.com/r/*.json`, app-owned component code |
| Packaged React UI components | HeroUI docs, package `@better-auth-ui/heroui` |
| React hooks, queries, mutations, SSR | React docs, package `@better-auth-ui/react`, shared core helpers |
| Solid hooks, queries, mutations, SSR | Solid docs, package `@better-auth-ui/solid`, Solid Query semantics |
| Copied Solid UI components | Zaidan docs, registry `https://better-auth-ui.com/r/solid/*.json` |
| Shared auth behavior, plugin contracts, keys | Core exports and docs before framework adapters |
| Better Auth server config, plugins, sessions, adapters | Upstream Better Auth docs, Better Auth skills, or Better Auth MCP before UI changes |

## Execution Steps

1. Identify the requested framework/UI surface and read its docs from `llms.txt` markdown links.
2. If the project has `@better-auth-ui/*` packages installed, read the versioned package skill shipped inside the package first: `node_modules/@better-auth-ui/<pkg>/skills/<skill>/SKILL.md` (`core/skills/core`, `react/skills/react`, `solid/skills/solid`, `heroui/skills/heroui`). No extra tooling is required; `npx @tanstack/intent@latest load @better-auth-ui/<pkg>#<skill>` is an equivalent alternative.
3. Read the smallest supporting reference for the task: repo map, framework surfaces, upstream Better Auth, common tasks, validation, or checklist.
4. Inspect the matching package or copied component path; do not mix React and Solid APIs.
5. For UI registry installation, fetch registry JSON only after choosing shadcn or Zaidan.
6. For shared behavior, trace from core options/keys/factories into adapters and keep adapters thin.
7. Validate with the narrowest relevant project script or framework command, then run formatting/lint checks when the project provides them.

## Output Contract

Return:

- selected surface and docs read;
- files or registry routes used;
- package/API decisions made;
- validation commands and results;
- any unresolved docs/API ambiguity.

## References

- `references/docs-routing.md` — canonical docs, packages, and registry routes.
- `references/framework-surfaces.md` — API boundaries and framework/UI differences.
- `references/repo-map.md` — local package, docs, example, and registry source map.
- `references/upstream-better-auth.md` — when and how to consult Better Auth docs, skills, and MCP.
- `references/common-tasks.md` — task playbooks for queries, mutations, docs, registries, and plugins.
- `references/validation.md` — consumer-safe validation strategy without assuming a specific build system.
- `assets/agent-checklist.md` — pre-edit and pre-response checklist.
