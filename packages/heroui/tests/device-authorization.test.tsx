import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { DeviceAuthorization } from "../src/components/auth/device-authorization/device-authorization"
import { deviceAuthorizationPlugin } from "../src/lib/auth/device-authorization-plugin"

const session = {
  session: {
    id: "session-1",
    token: "session-token",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  user: {
    id: "user-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

function createMockAuthClient(currentSession: typeof session | null = session) {
  const getSession = vi.fn(async () => currentSession)
  const verify = vi.fn(async () => ({
    user_code: "AB12CD34",
    status: "pending"
  }))
  const approve = vi.fn(async () => ({ success: true }))
  const deny = vi.fn(async () => ({ success: true }))
  const device = Object.assign(verify, { approve, deny })

  return {
    device,
    getSession
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    device: typeof device
    getSession: typeof getSession
  }
}

function renderDeviceAuthorization(
  authClient = createMockAuthClient(),
  children = <DeviceAuthorization />
) {
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        plugins={[deviceAuthorizationPlugin()]}
        queryClient={createTestQueryClient()}
      >
        {children}
      </AuthProvider>
    )
  }
}

async function enterDeviceCode(user: ReturnType<typeof userEvent.setup>) {
  const input = screen.getByRole("textbox", { name: "Device code" })
  await user.type(input, "ab12cd34")
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("deviceAuthorizationPlugin (heroui)", () => {
  it("registers DeviceAuthorization as a routable auth view", () => {
    const plugin = deviceAuthorizationPlugin()

    expect(plugin.views?.auth?.deviceAuthorization).toBe(DeviceAuthorization)
    expect(plugin.viewPaths.auth.deviceAuthorization).toBe("device")
  })

  it("renders through the Auth plugin path dispatcher", () => {
    renderDeviceAuthorization(createMockAuthClient(), <Auth path="device" />)

    expect(
      screen.getByRole("heading", { name: "Device Authorization" })
    ).toBeInTheDocument()
  })
})

describe("<DeviceAuthorization />", () => {
  it("auto-verifies normalized codes from complete verification links", async () => {
    window.history.pushState({}, "", "/auth/device?user_code=ab12-cd34")
    const { authClient } = renderDeviceAuthorization()

    await waitFor(() => {
      expect(authClient.device).toHaveBeenCalledWith({
        query: { user_code: "AB12CD34" },
        fetchOptions: expect.objectContaining({ throw: true })
      })
    })
    expect(
      await screen.findByRole("heading", { name: "Approve Device" })
    ).toBeInTheDocument()
  })

  it("auto-verifies the normalized code and approves the device", async () => {
    const user = userEvent.setup()
    const { authClient } = renderDeviceAuthorization()

    await enterDeviceCode(user)

    await waitFor(() => {
      expect(authClient.device).toHaveBeenCalledWith({
        query: { user_code: "AB12CD34" },
        fetchOptions: expect.objectContaining({ throw: true })
      })
    })

    expect(
      await screen.findByRole("heading", { name: "Approve Device" })
    ).toBeInTheDocument()
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("ada@example.com")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Approve" }))

    await waitFor(() => {
      expect(authClient.device.approve).toHaveBeenCalledWith({
        userCode: "AB12CD34",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    })
    expect(
      await screen.findByRole("heading", { name: "Device Approved" })
    ).toBeInTheDocument()
  })

  it("denies a verified device request", async () => {
    const user = userEvent.setup()
    const { authClient } = renderDeviceAuthorization()

    await enterDeviceCode(user)
    await screen.findByRole("heading", { name: "Approve Device" })
    await user.click(screen.getByRole("button", { name: "Deny" }))

    await waitFor(() => {
      expect(authClient.device.deny).toHaveBeenCalledWith({
        userCode: "AB12CD34",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    })
    expect(
      await screen.findByRole("heading", { name: "Device Denied" })
    ).toBeInTheDocument()
  })

  it("sends unauthenticated users through sign-in with the code preserved", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient(null)
    const { navigate } = renderDeviceAuthorization(authClient)

    await enterDeviceCode(user)

    expect(authClient.device).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith({
      to: "/auth/sign-in?redirectTo=%2Fauth%2Fdevice%3Fuser_code%3DAB12CD34"
    })
  })

  it("keeps the code editable when verification fails", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()
    authClient.device.mockRejectedValueOnce(new Error("invalid code"))
    renderDeviceAuthorization(authClient)

    await enterDeviceCode(user)

    expect(
      await screen.findByText("The code is invalid or has expired.")
    ).toBeInTheDocument()

    await user.type(
      screen.getByRole("textbox", { name: "Device code" }),
      "{backspace}"
    )

    expect(
      screen.queryByText("The code is invalid or has expired.")
    ).not.toBeInTheDocument()
  })

  it.each([
    { action: "approve" as const, buttonName: "Approve" },
    { action: "deny" as const, buttonName: "Deny" }
  ])("shows feedback when device $action fails", async ({
    action,
    buttonName
  }) => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()
    authClient.device[action].mockRejectedValueOnce(new Error("request failed"))
    renderDeviceAuthorization(authClient)

    await enterDeviceCode(user)
    await screen.findByRole("heading", { name: "Approve Device" })
    await user.click(screen.getByRole("button", { name: buttonName }))

    expect(
      await screen.findByText("The code is invalid or has expired.")
    ).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Device code" })).toHaveValue(
      "AB12CD34"
    )
  })
})
