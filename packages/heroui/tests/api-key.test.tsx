import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { NewApiKeyDialog } from "../src/components/auth/api-key/new-api-key-dialog"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { apiKeyPlugin } from "../src/lib/auth/api-key-plugin"

function createMockAuthClient() {
  return {
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

describe("<NewApiKeyDialog />", () => {
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
