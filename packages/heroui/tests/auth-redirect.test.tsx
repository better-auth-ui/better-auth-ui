import { QueryClient } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

function createMockAuthClient(
  getSession: () => Promise<unknown> = async () => null
) {
  return {
    getSession: vi.fn(getSession)
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
}

function renderAuthRedirect(authClient = createMockAuthClient()) {
  return render(
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      queryClient={createTestQueryClient()}
    >
      <Auth path="redirect" />
    </AuthProvider>
  )
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("<AuthRedirect />", () => {
  it("renders through the built-in Auth path dispatcher", () => {
    window.history.pushState(
      {},
      "",
      "/auth/redirect?redirectTo=%2Fsettings%2Faccount"
    )

    const { container } = renderAuthRedirect(
      createMockAuthClient(() => new Promise(() => {}))
    )

    expect(container.querySelector('[data-slot="spinner"]')).toBeInTheDocument()
  })
})
