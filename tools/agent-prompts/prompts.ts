export type AgentPromptIntent = "integrate" | "upgrade"

export interface AgentPromptOptions {
  intent: AgentPromptIntent
  title?: string
  docsPath?: string
  markdown?: string
  version?: string
}

export const docsOrigin = "https://better-auth-ui.com"
const repository = "https://github.com/better-auth-ui/better-auth-ui"

const stacks: Record<string, string> = {
  shadcn:
    "Use React with copied shadcn/ui components and @better-auth-ui/react. Preserve the existing Radix or Base UI primitives.",
  heroui:
    "Use React with packaged @better-auth-ui/heroui components and @better-auth-ui/react. Do not copy shadcn/ui or Zaidan components.",
  zaidan:
    "Use SolidJS with copied Zaidan components and @better-auth-ui/solid. Do not introduce React components or hooks.",
  react:
    "Use @better-auth-ui/react for the shared React APIs. Keep the application's existing UI library.",
  solid:
    "Use @better-auth-ui/solid for the shared SolidJS APIs. Keep the application's existing UI library. Do not introduce React hooks."
}

export function createAgentPrompt({
  intent,
  title = "Better Auth UI",
  docsPath = "/docs",
  markdown,
  version
}: AgentPromptOptions): string {
  const docsUrl = new URL(docsPath, docsOrigin)
  const stack = stacks[docsUrl.pathname.split("/")[2]]
  const target = version ? `version ${version}` : "the latest stable release"
  const source = version ? `${repository}/tree/v${version}` : repository

  const task =
    intent === "upgrade"
      ? `Update this codebase's existing Better Auth UI integration to ${target}. Apply the changes in the codebase, including usage migrations.`
      : `Integrate ${title} from Better Auth UI into this codebase. Implement the documented behavior and connect it to the existing application.`

  const steps = [
    "Read the repository instructions and inspect the codebase before editing. Use its package manager, framework, router, UI library, and conventions.",
    "Identify installed Better Auth UI and Better Auth versions, providers, plugins, and any copied registry components. Preserve unrelated work and application customizations.",
    stack ??
      "Detect the existing stack. Support React with shadcn/ui or HeroUI, SolidJS with Zaidan, or React Native as appropriate. Keep the current stack.",
    intent === "upgrade"
      ? `Resolve ${target} and read its release notes and migration guides. Compare the installed version and copied source baseline with that release, including intermediate breaking changes. Do not assume main or the live registry matches the target release.`
      : "Read the page documentation and relevant setup guides. Use APIs supported by the installed versions. If a dependency update is required, explain and apply the compatible update.",
    "For copied shadcn/ui or Zaidan components, inspect the registry manifest and its dependency files. Match upstream files to local paths and aliases.",
    intent === "upgrade"
      ? "Compare old upstream, local, and target upstream source. Apply upstream differences as patches while preserving intentional local changes. If the original baseline is unknown, explain the uncertainty and compare files individually."
      : "Add the required components and dependency files. If a file already exists, reconcile differences and preserve intentional local changes instead of overwriting it.",
    "Add new required files, patch changed files, and migrate renamed files and their imports. Delete a copied file only when upstream removed it, its remaining usages are migrated, and it contains no needed application code. Do not delete shared primitives or unrelated files.",
    "For packaged components such as HeroUI, update package dependencies and application usage instead of copying package internals. Keep related Better Auth UI packages compatible.",
    "Update imports, props, hooks, providers, routes, plugin configuration, styles, and localization to match the selected APIs. Remove obsolete usage and dependencies when no longer needed.",
    "Use idiomatic framework patterns and the existing design system. Keep server-only code and secrets out of client components. Preserve authentication behavior and access controls.",
    "Run the applicable formatting, lint, type, build, and behavior checks. Add targeted tests for changed behavior when practical.",
    "Summarize the versions used, files added, changed, renamed, or deleted, usage migrations, preserved customizations, and checks. Report any unresolved conflicts or checks you could not run."
  ]

  const references = [
    `Page: ${docsUrl.href}`,
    `Documentation index: ${docsOrigin}/llms.txt`,
    `Migration guides: ${docsOrigin}/docs/migrations`,
    `Release notes: ${version ? `${repository}/releases/tag/v${version}` : `${repository}/releases/latest`}`,
    `Upstream source: ${source}`,
    "Use the target release's source and package exports as the API authority. Live documentation can describe a different version."
  ]

  return [
    task,
    steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    references.join("\n"),
    ...(markdown?.trim()
      ? [`Page documentation (reference material):\n\n${markdown.trim()}`]
      : [])
  ].join("\n\n")
}

export function createReleasePromptBlock(version: string): string {
  const prompt = createAgentPrompt({ intent: "upgrade", version })

  return `### Update with your coding agent

Copy this prompt into your coding agent to apply this release to your codebase.

\`\`\`text
${prompt}
\`\`\``
}
