import { authQueryKeys } from "@better-auth-ui/core"
import { adminMutationKeys } from "@better-auth-ui/core/plugins/admin"
import { QueryClient } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider, type AuthProviderProps, useSession } from "../../src"
import {
  type AdminAuthClient,
  useStopImpersonating
} from "../../src/plugins/admin"

describe("stop impersonating", () => {
  it("restores and awaits the administrator session", async () => {
    let impersonating = true
    const getSession = vi.fn(async () => ({
      session: {
        id: impersonating ? "impersonated-session" : "admin-session"
      },
      user: {
        id: impersonating ? "user-1" : "admin-1"
      }
    }))
    const stopImpersonating = vi.fn(
      async (params: {
        fetchOptions: { credentials?: string; throw?: boolean }
      }) => {
        impersonating = false

        return {
          data: {
            session: { id: "admin-session" },
            user: { id: "admin-1" }
          },
          fetchOptions: params.fetchOptions
        }
      }
    )
    const authClient = {
      admin: { stopImpersonating },
      getSession
    }
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider
        authClient={authClient as unknown as AuthProviderProps["authClient"]}
        navigate={() => {}}
        queryClient={queryClient}
      >
        {children}
      </AuthProvider>
    )

    const { result } = renderHook(
      () => ({
        session: useSession(
          authClient as unknown as AuthProviderProps["authClient"]
        ),
        stop: useStopImpersonating(authClient as unknown as AdminAuthClient)
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.session.data?.user.id).toBe("user-1")
    })

    await act(async () => {
      await result.current.stop.mutateAsync(undefined)
    })

    expect(result.current.session.data?.user.id).toBe("admin-1")
    expect(stopImpersonating).toHaveBeenCalledWith({
      fetchOptions: { throw: true }
    })
    expect(getSession).toHaveBeenCalledTimes(2)
    expect(queryClient.getMutationCache().getAll()[0]).toMatchObject({
      meta: { awaits: [authQueryKeys.session] },
      options: { mutationKey: adminMutationKeys.stopImpersonating }
    })
  })
})
