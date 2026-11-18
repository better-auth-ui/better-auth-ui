import { createRequire } from "node:module"
import { createReleasePromptBlock } from "./prompts.ts"
import type * as NxReleaseChangelogRendererModule from "nx/release/changelog-renderer"

// Nx loads this file with native TypeScript stripping, without CJS interop.
const changelogRendererModule: typeof NxReleaseChangelogRendererModule =
  createRequire(import.meta.url)("nx/release/changelog-renderer")
const { default: DefaultChangelogRenderer } = changelogRendererModule

export default class AgentPromptChangelogRenderer extends DefaultChangelogRenderer {
  override async render(): Promise<string> {
    const changelog = await super.render()
    if (!changelog) return changelog

    return `${changelog}\n\n${createReleasePromptBlock(this.changelogEntryVersion)}`
  }
}
