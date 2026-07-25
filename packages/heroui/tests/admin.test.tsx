import { authQueryKeys } from "@better-auth-ui/core"
import { Dropdown } from "@heroui/react"
import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { adminPlugin, StopImpersonating } from "../src/plugins"

function renderStopImpersonating(
  session: { session: { impersonatedBy?: string } },
  stopImpersonating = vi.fn(async () => ({}))
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  queryClient.setQueryData(authQueryKeys.session, session)

  const authClient = {
    admin: { stopImpersonating },
    getSession: vi.fn(async () => session)
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]

  return {
    stopImpersonating,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[adminPlugin()]}
        queryClient={queryClient}
      >
        <Dropdown.Menu aria-label="User menu">
          <StopImpersonating />
        </Dropdown.Menu>
      </AuthProvider>
    )
  }
}

describe("adminPlugin", () => {
  it("contributes the localized stop action to the user menu", () => {
    const plugin = adminPlugin({
      localization: { stopImpersonating: "Return to admin" }
    })

    expect(plugin.localization.stopImpersonating).toBe("Return to admin")
    expect(plugin.userMenuItems).toEqual([StopImpersonating])
  })

  it("hides the stop action outside an impersonation session", () => {
    renderStopImpersonating({ session: {} })

    expect(
      screen.queryByRole("menuitem", { name: "Stop impersonating" })
    ).not.toBeInTheDocument()
  })

  it("renders the stop action during impersonation", async () => {
    renderStopImpersonating({
      session: { impersonatedBy: "administrator-id" }
    })

    expect(
      await screen.findByRole("menuitem", { name: "Stop impersonating" })
    ).toBeVisible()
  })

  it("disables the stop action while its mutation is pending", async () => {
    let resolveStopImpersonating: (() => void) | undefined
    const stopImpersonating = vi.fn(
      () =>
        new Promise<object>((resolve) => {
          resolveStopImpersonating = () => resolve({})
        })
    )
    const user = userEvent.setup()

    renderStopImpersonating(
      { session: { impersonatedBy: "administrator-id" } },
      stopImpersonating
    )
    const action = await screen.findByRole("menuitem", {
      name: "Stop impersonating"
    })

    await user.click(action)

    await waitFor(() => {
      expect(stopImpersonating).toHaveBeenCalledTimes(1)
      expect(action).toHaveAttribute("data-disabled")
    })

    resolveStopImpersonating?.()

    await waitFor(() => {
      expect(action).not.toHaveAttribute("data-disabled")
    })
  })
})
