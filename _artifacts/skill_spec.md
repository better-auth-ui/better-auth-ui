# Better Auth UI skill maintenance

These skills teach application developers how to use the published packages. They do not replace the repository's contributor instructions.

Each package owns one skill. The React skill includes shadcn guidance, and the Solid skill includes Zaidan guidance.

The same files ship in npm tarballs for TanStack Intent and remain available on GitHub for skills.sh. No generated mirror is required.

## Content boundaries

- Keep each skill usable without installing another skill.
- Put optional UI-specific detail in references inside that skill's directory.
- Use standard Agent Skills frontmatter, with package and framework information under `metadata`.
- Describe API boundaries and common mistakes instead of copying the entire reference documentation.
- Cover React, Solid, shadcn/ui, HeroUI, and Zaidan when shared behavior changes.
- Keep organization access explicit through slugs or IDs.

`domain_map.yaml` records the task areas and failure modes. `skill_tree.yaml` maps each skill to its package and source files.

## Update a skill

1. Read the source files listed in `skill_tree.yaml` before changing the skill.
2. Update the owning package's `SKILL.md` and any affected references.
3. Update the artifacts when ownership, coverage, or source paths change.
4. Run `bun nx run workspace:skills-check`.
5. Review the instructions against the installed API, including server/client boundaries and framework-specific behavior.

The check runs Intent validation, validates artifact coverage and local links, and packs every public package.

It loads each skill from the extracted tarball through Intent and installs the public skills through the skills CLI in a temporary project.

These checks prove discovery and packaging. They do not prove that an agent applies the instructions correctly.

## Release behavior

The existing Nx release workflow publishes the package-local `skills` directories. The `tanstack-intent` keyword enables TanStack registry indexing.

Skills installed from GitHub follow their selected Git reference. They do not automatically track a consumer's installed library version.

Keep skill changes in the same release as the API changes they describe. Use the installed package as the authority when current website docs differ.
