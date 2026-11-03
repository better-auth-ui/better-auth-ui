import DefaultChangelogRenderer from "nx/release/changelog-renderer"
import { resolveChangelogRenderer } from "nx/src/command-line/release/utils/resolve-changelog-renderer"
import { GithubRemoteReleaseClient } from "nx/src/command-line/release/utils/remote-release-clients/github"
import { describe, expect, it } from "vitest"
import nxConfig from "../../../nx.json"
import AgentPromptChangelogRenderer from "../../../tools/agent-prompts/changelog-renderer"
import { createReleasePromptBlock } from "../../../tools/agent-prompts/prompts"

const options: ConstructorParameters<typeof DefaultChangelogRenderer>[0] = {
  changes: [
    {
      type: "fix",
      scope: "auth",
      description: "preserve the redirect after sign-in",
      affectedProjects: "*"
    }
  ],
  changelogEntryVersion: "1.7.34",
  project: null,
  entryWhenNoChanges: false,
  isVersionPlans: false,
  changelogRenderOptions: { authors: false, versionTitleDate: false },
  conventionalCommitsConfig: {
    useCommitScope: true,
    types: {
      fix: { semverBump: "patch", changelog: { title: "Fixes", hidden: false } }
    }
  },
  remoteReleaseClient: new GithubRemoteReleaseClient(null, false, null)
}

describe("release prompt rendering", () => {
  it("loads the configured renderer through Nx's release loader", async () => {
    const Renderer = resolveChangelogRenderer(
      nxConfig.release.changelog.workspaceChangelog.renderer
    )
    const release = await new Renderer(options).render()

    expect(release).toContain(createReleasePromptBlock("1.7.34"))
  })

  it("preserves the default changelog and appends a copyable version-specific task", async () => {
    const original = await new DefaultChangelogRenderer(options).render()
    const release = await new AgentPromptChangelogRenderer(options).render()

    expect(original).toContain("preserve the redirect after sign-in")
    expect(release).toBe(`${original}\n\n${createReleasePromptBlock("1.7.34")}`)
  })

  it("does not create release notes when Nx suppresses an empty entry", async () => {
    const renderer = new AgentPromptChangelogRenderer({
      ...options,
      changes: []
    })
    await expect(renderer.render()).resolves.toBe("")
  })

  it("includes a prompt when Nx emits its configured empty-entry message", async () => {
    const renderer = new AgentPromptChangelogRenderer({
      ...options,
      changes: [],
      entryWhenNoChanges: "Dependency updates only."
    })
    const release = await renderer.render()

    expect(release).toContain("Dependency updates only.")
    expect(release).toContain(createReleasePromptBlock("1.7.34"))
  })
})
