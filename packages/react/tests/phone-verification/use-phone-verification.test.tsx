import {
  type PhoneVerificationProvider,
  type PhoneVerificationResult,
  type PhoneVerificationSession,
  phoneVerificationPlugin
} from "@better-auth-ui/core/plugins"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { createAuthClient } from "better-auth/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../../src/components/auth/auth-provider"
import { usePhoneVerification } from "../../src/hooks/phone-verification/use-phone-verification"

// Mock better-auth
vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null
    }))
  }))
}))

const session: PhoneVerificationSession = {
  sessionId: "s1",
  status: "pending",
  whatsApp: {
    number: "1234567890",
    deepLink: "https://t.phone-verif.com/qr/xyz",
    directLink: "https://wa.me/1234567890?text=hello"
  }
}

/** Fake client that flips to verified after `verifyAfterPolls` status calls. */
function fakeClient(verifyAfterPolls: number): PhoneVerificationProvider & {
  statusCalls: () => number
} {
  let polls = 0

  return {
    statusCalls: () => polls,
    createVerification: vi.fn(async ({ sessionId }) => ({
      ...session,
      sessionId
    })),
    getVerificationStatus: vi.fn(
      async ({ sessionId }): Promise<PhoneVerificationResult> => {
        polls++

        return polls > verifyAfterPolls
          ? { sessionId, status: "verified", phoneNumber: "+33612345678" }
          : { sessionId, status: "pending" }
      }
    ),
    cancelVerification: vi.fn(async ({ sessionId }) => ({
      sessionId,
      status: "cancelled" as const
    }))
  }
}

function createWrapper(
  client: PhoneVerificationProvider,
  pluginOptions: { pollingInterval?: number; timeout?: number } = {}
) {
  const authClient = createAuthClient({ baseURL: "http://localhost:3000" })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[
          phoneVerificationPlugin({
            client,
            pollingInterval: 25,
            timeout: 5_000,
            ...pluginOptions
          })
        ]}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe("usePhoneVerification", () => {
  it("auto-starts, polls until verified, then stops polling", async () => {
    const client = fakeClient(2)
    const onVerified = vi.fn()

    const { result } = renderHook(() => usePhoneVerification({ onVerified }), {
      wrapper: createWrapper(client)
    })

    await waitFor(() => {
      expect(result.current.status).toBe("pending")
    })
    expect(result.current.session?.whatsApp.directLink).toContain("wa.me")

    await waitFor(() => {
      expect(result.current.status).toBe("verified")
    })
    expect(result.current.phoneNumber).toBe("+33612345678")
    expect(onVerified).toHaveBeenCalledTimes(1)

    // Polling stops after the terminal status.
    const polls = client.statusCalls()
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(client.statusCalls()).toBe(polls)
  })

  it("does not start automatically when autoStart is false", async () => {
    const client = fakeClient(0)

    const { result } = renderHook(
      () => usePhoneVerification({ autoStart: false }),
      { wrapper: createWrapper(client) }
    )

    expect(result.current.status).toBe("idle")
    expect(client.createVerification).not.toHaveBeenCalled()
  })

  it("cancels the active session", async () => {
    const client = fakeClient(Number.POSITIVE_INFINITY)

    const { result } = renderHook(() => usePhoneVerification(), {
      wrapper: createWrapper(client)
    })

    await waitFor(() => {
      expect(result.current.status).toBe("pending")
    })

    const sessionId = result.current.session?.sessionId
    result.current.cancel()

    await waitFor(() => {
      expect(result.current.status).toBe("cancelled")
    })
    expect(client.cancelVerification).toHaveBeenCalledWith({ sessionId })
  })

  it("resolves to timeout when no terminal status arrives in time", async () => {
    const client = fakeClient(Number.POSITIVE_INFINITY)

    const { result } = renderHook(() => usePhoneVerification(), {
      wrapper: createWrapper(client, { timeout: 150 })
    })

    await waitFor(() => {
      expect(result.current.status).toBe("pending")
    })

    await waitFor(() => {
      expect(result.current.status).toBe("timeout")
    })
  })

  it("starts a fresh session on retry", async () => {
    const client = fakeClient(Number.POSITIVE_INFINITY)

    const { result } = renderHook(() => usePhoneVerification(), {
      wrapper: createWrapper(client)
    })

    await waitFor(() => {
      expect(result.current.status).toBe("pending")
    })
    const firstSessionId = result.current.session?.sessionId

    result.current.retry()

    await waitFor(() => {
      expect(result.current.session?.sessionId).not.toBe(firstSessionId)
    })
  })
})
