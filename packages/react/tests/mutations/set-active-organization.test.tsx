import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import { QueryClient } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider, type AuthProviderProps } from "../../src"
import { useSetActiveOrganization } from "../../src/plugins/organization"

describe("set active organization", () => {
  it("updates only the session-selected organization cache", async () => {
    const acme = { id: "org-acme", name: "Acme", slug: "acme" }
    const beta = { id: "org-beta", name: "Beta", slug: "beta" }
    let resolveSetActive: ((organization: typeof beta) => void) | undefined
    const setActive = vi.fn(
      () =>
        new Promise<typeof beta>((resolve) => {
          resolveSetActive = resolve
        })
    )
    const authClient = {
      getSession: vi.fn(async () => ({
        session: { id: "session-1", activeOrganizationId: acme.id },
        user: { id: "user-1" }
      })),
      organization: {
        getFullOrganization: vi.fn(async () => acme),
        list: vi.fn(async () => [acme, beta]),
        setActive
      }
    }
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    const sessionOrganizationKey =
      organizationQueryKeys.activeOrganization("user-1")
    const slugOrganizationKey = organizationQueryKeys.activeOrganization(
      "user-1",
      { organizationSlug: acme.slug }
    )
    const idOrganizationKey = organizationQueryKeys.activeOrganization(
      "user-1",
      { organizationId: acme.id }
    )

    queryClient.setQueryData(sessionOrganizationKey, acme)
    queryClient.setQueryData(slugOrganizationKey, acme)
    queryClient.setQueryData(idOrganizationKey, acme)

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
      () => useSetActiveOrganization(authClient as never),
      { wrapper }
    )

    await waitFor(() => {
      expect(authClient.organization.list).toHaveBeenCalledOnce()
    })

    act(() => {
      result.current.mutate({ organizationId: beta.id })
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(sessionOrganizationKey)).toEqual(beta)
    })
    expect(queryClient.getQueryData(slugOrganizationKey)).toEqual(acme)
    expect(queryClient.getQueryData(idOrganizationKey)).toEqual(acme)

    act(() => {
      resolveSetActive?.(beta)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })
})
