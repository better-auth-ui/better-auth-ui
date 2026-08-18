import { API_KEY_EXPIRATION_SECONDS_PER_DAY } from "@better-auth-ui/core/plugins/api-key"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CreateApiKeyDialog } from "../src/components/auth/api-key/create-api-key-dialog"
import { NewApiKeyDialog } from "../src/components/auth/api-key/new-api-key-dialog"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { apiKeyPlugin } from "../src/lib/auth/api-key-plugin"

function createMockAuthClient(
  create = vi.fn(async () => ({
    key: "api-key-secret",
    name: null
  }))
) {
  return {
    apiKey: { create },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
}

function ControlledNewApiKeyDialog() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <NewApiKeyDialog
      isOpen={isOpen}
      name="Deploy key"
      onOpenChange={setIsOpen}
      secretKey="api-key-secret"
    />
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("<NewApiKeyDialog />", () => {
  it("shows inline feedback after copying the key", async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue()

    render(
      <AuthProvider
        authClient={createMockAuthClient()}
        navigate={() => {}}
        plugins={[apiKeyPlugin()]}
      >
        <ControlledNewApiKeyDialog />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: /copy to clipboard/i }))

    expect(writeText).toHaveBeenCalledWith("api-key-secret")
    expect(
      screen.getByRole("button", { name: /copied to clipboard/i })
    ).toBeInTheDocument()
  })

  it("dismisses the controlled dialog after the key is saved", async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider
        authClient={createMockAuthClient()}
        navigate={() => {}}
        plugins={[apiKeyPlugin()]}
      >
        <ControlledNewApiKeyDialog />
      </AuthProvider>
    )

    await user.click(screen.getByRole("button", { name: /i've saved my key/i }))

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })
})

describe("<CreateApiKeyDialog />", () => {
  it("sends the default expiration interval to Better Auth in seconds", async () => {
    const user = userEvent.setup()
    const create = vi.fn(async () => ({
      key: "api-key-secret",
      name: null
    }))

    render(
      <AuthProvider
        authClient={createMockAuthClient(create)}
        navigate={() => {}}
        plugins={[apiKeyPlugin()]}
      >
        <CreateApiKeyDialog isOpen onOpenChange={() => {}} />
      </AuthProvider>
    )

    await user.click(
      screen.getByRole("button", { name: "Create API key", exact: true })
    )

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresIn: 30 * API_KEY_EXPIRATION_SECONDS_PER_DAY,
          fetchOptions: { throw: true }
        })
      )
    })
  })

  it("hides the expiration field when the plugin opts out", () => {
    render(
      <AuthProvider
        authClient={createMockAuthClient()}
        navigate={() => {}}
        plugins={[apiKeyPlugin({ keyExpiration: false })]}
      >
        <CreateApiKeyDialog isOpen onOpenChange={() => {}} />
      </AuthProvider>
    )

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })
})
