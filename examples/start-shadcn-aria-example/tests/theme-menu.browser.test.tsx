import { themeLocalization } from "@better-auth-ui/core/plugins/theme"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { ThemeToggleItem } from "../src/components/auth/theme/theme-toggle-item"
import { Button } from "../src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "../src/components/ui/dropdown-menu"
import "../src/styles/app.css"

vi.mock("@better-auth-ui/react", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react")>()),
  useAuthPlugin: () => ({
    localization: themeLocalization,
    useTheme: () => {
      const [theme, setTheme] = useState("light")
      return { theme, setTheme, themes: ["system", "light", "dark"] }
    }
  })
}))
afterEach(cleanup)

it("changes themes from a keyboard-accessible submenu", async () => {
  render(
    <DropdownMenuTrigger>
      <Button>Account</Button>
      <DropdownMenu>
        <ThemeToggleItem />
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
  const account = screen.getByRole("button", { name: "Account" })
  account.focus()
  await userEvent.keyboard("{ArrowDown}")
  const theme = await screen.findByRole("menuitem", {
    name: themeLocalization.theme
  })
  theme.focus()
  await userEvent.keyboard("{ArrowRight}")
  const dark = await screen.findByRole("menuitemradio", {
    name: themeLocalization.dark
  })
  await userEvent.click(dark)
  await waitFor(() => expect(dark.getAttribute("aria-checked")).toBe("true"))
  expect(
    screen
      .getByRole("menuitemradio", { name: themeLocalization.light })
      .getAttribute("aria-checked")
  ).toBe("false")
})
