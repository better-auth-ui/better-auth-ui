import { afterEach, describe, expect, it, vi } from "vitest"
import { createAgentPrompt, loadPromptMarkdown } from "../src/lib/agent-prompts"
import { createReleasePromptBlock } from "../../../tools/agent-prompts/prompts"

afterEach(() => vi.unstubAllGlobals())

describe("agent prompts", () => {
  it.each([
    ["shadcn", "React with copied shadcn/ui", "Radix or Base UI"],
    ["heroui", "packaged @better-auth-ui/heroui", "Do not copy shadcn/ui"],
    ["zaidan", "SolidJS with copied Zaidan", "Do not introduce React"],
    ["react", "@better-auth-ui/react", "existing UI library"],
    ["solid", "@better-auth-ui/solid", "Do not introduce React hooks"]
  ])(
    "includes the %s page, stack, and full documentation",
    (stack, api, constraint) => {
      const prompt = createAgentPrompt({
        intent: "integrate",
        title: "<SignIn />",
        docsPath: `/docs/${stack}/components/sign-in`,
        markdown: "# Sign in\n\nUse `<SignIn />` with your auth client."
      })

      expect(prompt).toContain("Integrate <SignIn /> from Better Auth UI")
      expect(prompt).toContain(
        `Page: https://better-auth-ui.com/docs/${stack}/components/sign-in`
      )
      expect(prompt).toContain(api)
      expect(prompt).toContain(constraint)
      expect(prompt).toContain(
        "Page documentation (reference material):\n\n# Sign in\n\nUse `<SignIn />` with your auth client."
      )
    }
  )

  it("creates an upgrade task with file reconciliation and usage migration instructions", () => {
    const prompt = createAgentPrompt({ intent: "upgrade" })

    expect(prompt).toContain("to the latest stable release")
    expect(prompt).toContain(
      "Compare old upstream, local, and target upstream source"
    )
    expect(prompt).toContain("If the original baseline is unknown")
    expect(prompt).toContain("Add new required files, patch changed files")
    expect(prompt).toContain("migrate renamed files and their imports")
    expect(prompt).toContain(
      "Delete a copied file only when upstream removed it"
    )
    expect(prompt).toContain("its remaining usages are migrated")
    expect(prompt).toContain("preserving intentional local changes")
    expect(prompt).toContain("Update imports, props, hooks, providers, routes")
    expect(prompt).toContain(
      "Run the applicable formatting, lint, type, build, and behavior checks"
    )
    expect(prompt).toContain("/releases/latest")
  })

  it("works without a selected stack or inline documentation", () => {
    const prompt = createAgentPrompt({ intent: "integrate" })

    expect(prompt).toContain("Detect the existing stack")
    expect(prompt).toContain("Page: https://better-auth-ui.com/docs")
    expect(prompt).not.toContain("Page documentation (reference material)")
    expect(prompt).not.toContain("undefined")
  })

  it.each(["1.7.34", "2.0.0-beta.1"])(
    "pins release prompts to %s",
    (version) => {
      const block = createReleasePromptBlock(version)

      expect(block).toContain(`integration to version ${version}`)
      expect(block).toContain(`/releases/tag/v${version}`)
      expect(block).toContain(`/tree/v${version}`)
      expect(block).not.toContain("latest stable release")
      expect(block).not.toContain("/releases/latest")
      expect(block).toContain("```text\n")
      expect(block).toMatch(/\n```$/)
    }
  )
})

describe("prompt documentation loading", () => {
  it("loads Markdown and forwards the abort signal", async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockResolvedValue(new Response("# Page content"))
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      loadPromptMarkdown("/docs/shadcn.md", controller.signal)
    ).resolves.toBe("# Page content")
    expect(fetchMock).toHaveBeenCalledWith("/docs/shadcn.md", {
      signal: controller.signal
    })
  })

  it("rejects an error page and allows a later retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("# Recovered content"))
    vi.stubGlobal("fetch", fetchMock)

    await expect(loadPromptMarkdown("/docs/shadcn.md")).rejects.toThrow(
      "Could not load page documentation (404)."
    )
    await expect(loadPromptMarkdown("/docs/shadcn.md")).resolves.toBe(
      "# Recovered content"
    )
  })

  it("propagates network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")))
    await expect(loadPromptMarkdown("/docs/shadcn.md")).rejects.toThrow(
      "Offline"
    )
  })
})
