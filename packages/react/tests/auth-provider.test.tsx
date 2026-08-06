import { authQueryKeys } from "@better-auth-ui/core"
import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from "@tanstack/react-query"
import { render, waitFor } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { describe, expect, it, vi } from "vitest"

import {
  AuthProvider,
  type AuthProviderProps
} from "../src/components/auth/auth-provider"

const retryQueryKey = [...authQueryKeys.all, "retry-test"] as const
const authClient = {} as AuthProviderProps["authClient"]

function RetryQuery({ queryFn }: { queryFn: () => Promise<unknown> }) {
  useQuery({
    queryKey: retryQueryKey,
    queryFn,
    retryDelay: 0
  })

  return null
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider authClient={authClient} navigate={() => {}}>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0
      }
    }
  })
}

describe("AuthProvider query defaults", () => {
  it("does not retry permanent auth query failures", async () => {
    const queryClient = createQueryClient()
    const queryFn = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }))

    render(<RetryQuery queryFn={queryFn} />, {
      wrapper: createWrapper(queryClient)
    })

    await waitFor(() => {
      expect(queryClient.getQueryState(retryQueryKey)?.status).toBe("error")
    })

    expect(queryFn).toHaveBeenCalledOnce()
  })

  it.each([429, 500])(
    "retries transient auth query status %s three times",
    async (status) => {
      const queryClient = createQueryClient()
      const queryFn = vi
        .fn<() => Promise<unknown>>()
        .mockRejectedValue(
          Object.assign(new Error("Transient error"), { status })
        )

      render(<RetryQuery queryFn={queryFn} />, {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(queryClient.getQueryState(retryQueryKey)?.status).toBe("error")
      })

      expect(queryFn).toHaveBeenCalledTimes(4)
    }
  )
})
