import { resolveAuthConfig, type AuthClient } from "@better-auth-ui/core"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { Settings } from "../src/components/auth/settings/settings"
import "../src/styles/app.css"

const navigate = vi.fn()
const config = resolveAuthConfig({ authClient: {} as AuthClient, navigate })
vi.mock("@better-auth-ui/react", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config,
  useAuthenticate: vi.fn()
}))
vi.mock("@/components/auth/settings/account/account-settings", () => ({
  AccountSettings: () => <p>Profile</p>
}))
vi.mock("@/components/auth/settings/security/security-settings", () => ({
  SecuritySettings: () => <p>Security content</p>
}))
beforeEach(() => navigate.mockClear())
afterEach(cleanup)

it("navigates between settings tabs with arrow keys", async () => {
  render(<Settings view="account" />)
  screen
    .getByRole("tab", { name: config.localization.settings.account })
    .focus()
  await userEvent.keyboard("{ArrowRight}")
  expect(navigate).toHaveBeenCalledWith({
    to: `${config.basePaths.settings}/${config.viewPaths.settings.security}`
  })
})

it("navigates once when a settings tab is clicked", async () => {
  render(<Settings view="account" />)
  await userEvent.click(
    screen.getByRole("tab", { name: config.localization.settings.security })
  )
  expect(navigate).toHaveBeenCalledExactlyOnceWith({
    to: `${config.basePaths.settings}/${config.viewPaths.settings.security}`
  })
})
