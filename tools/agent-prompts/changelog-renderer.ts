import { createRequire } from "node:module"
import { createReleasePromptBlock } from "./prompts.ts"

// Nx loads this file with native TypeScript stripping, without CJS interop.
const { default: DefaultChangelogRenderer } = createRequire(import.meta.url)(
  "nx/release/changelog-renderer"
) as typeof import("nx/release/changelog-renderer")

export default class AgentPromptChangelogRenderer extends DefaultChangelogRenderer {
  override async render(): Promise<string> {
    const changelog = await super.render()
    if (!changelog) return changelog

    return `${changelog}\n\n${createReleasePromptBlock(this.changelogEntryVersion)}`
  }
}
