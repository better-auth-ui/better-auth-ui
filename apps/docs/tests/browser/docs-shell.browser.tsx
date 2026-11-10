import {
  cleanup,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { FrameworkProvider } from "fumadocs-core/framework"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { RootProvider } from "fumadocs-ui/provider/base"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { page, userEvent } from "vitest/browser"
import { AgentPromptButton } from "../../src/components/agent-prompt"
import { docsSlots, HomeHeader } from "../../src/components/DocsShell"
import SearchDialog from "../../src/components/search"
import "../../src/styles/app.css"

function Providers({ children }: { children: ReactNode }) {
  return (
    <FrameworkProvider
      usePathname={() => "/docs"}
      useParams={() => ({})}
      useRouter={() => ({ push: vi.fn(), refresh: vi.fn() })}
    >
      <RootProvider search={{ SearchDialog }}>{children}</RootProvider>
    </FrameworkProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("docs Base UI shell", () => {
  it("expands documentation folders and opens the library switcher", async () => {
    await page.viewport(1280, 800)
    render(
      <DocsLayout
        slots={docsSlots}
        containerProps={{ className: "docs-shell" }}
        tree={{
          name: "Docs",
          children: [
            {
              type: "folder",
              name: "Components",
              children: [
                { type: "page", name: "Sign in", url: "/docs/sign-in" }
              ]
            }
          ]
        }}
        tabs={[{ title: "React", url: "/docs/react" }]}
      >
        <main>Documentation</main>
      </DocsLayout>,
      { wrapper: Providers }
    )
    await userEvent.click(screen.getByRole("button", { name: "Components" }))
    expect(
      (await screen.findByRole("link", { name: "Sign in" })).getAttribute(
        "href"
      )
    ).toBe("/docs/sign-in")
    await userEvent.click(
      screen.getByRole("button", { name: "Choose documentation library" })
    )
    expect(
      (await screen.findByRole("link", { name: "React" })).getAttribute("href")
    ).toBe("/docs/react")
    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "React" })).toBeNull()
    )
  })

  it("opens navigation menus with the keyboard and preserves link destinations", async () => {
    await page.viewport(1280, 800)
    render(<HomeHeader />, { wrapper: Providers })
    const trigger = screen.getByRole("button", { name: "Storybook" })
    trigger.focus()
    await userEvent.keyboard("{ArrowDown}")

    const item = await screen.findByRole("menuitem", { name: /HeroUI/ })
    expect(item.tagName).toBe("A")
    expect(item.getAttribute("href")).toBe("/storybook/heroui/")
    await waitFor(() => expect(document.activeElement).toBe(item))

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("closes mobile navigation and restores focus to its trigger", async () => {
    await page.viewport(390, 844)
    render(<HomeHeader />, { wrapper: Providers })
    const trigger = screen.getByRole("button", {
      name: "Open navigation"
    })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Navigation" })
    expect(
      within(dialog).getByRole("link", { name: "Docs" }).getAttribute("href")
    ).toBe("/docs")
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close navigation" })
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("opens the agent prompt dialog and switches task tabs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("# Integration guide\nUse the configured auth client.")
    )
    render(<AgentPromptButton />, { wrapper: Providers })
    const trigger = screen.getByRole("button", {
      name: "Preview integration and upgrade prompts"
    })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", {
      name: "Use your coding agent"
    })
    expect(
      await within(dialog).findByLabelText("Integration prompt")
    ).toBeTruthy()
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "Update Better Auth UI" })
    )
    expect(await within(dialog).findByLabelText("Upgrade prompt")).toBeTruthy()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("opens the documentation search and restores focus when dismissed", async () => {
    await page.viewport(1280, 800)
    render(<HomeHeader />, { wrapper: Providers })
    const trigger = screen.getByRole("button", { name: "Open Search" })
    await userEvent.click(trigger)
    const input = await screen.findByRole("textbox")
    await waitFor(() => expect(document.activeElement).toBe(input))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})
