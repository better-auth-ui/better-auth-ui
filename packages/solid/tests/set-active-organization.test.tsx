import { authQueryKeys } from "@better-auth-ui/core"
import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import { QueryClient } from "@tanstack/solid-query"
import { renderToString } from "solid-js/web"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../src"
import { useSetActiveOrganization } from "../src/plugins/organization"

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
    let mutateAsync:
      | ((variables: { organizationId: string }) => Promise<unknown>)
      | undefined

    queryClient.setQueryData(authQueryKeys.session, {
      session: { id: "session-1", activeOrganizationId: acme.id },
      user: { id: "user-1" }
    })
    queryClient.setQueryData(organizationQueryKeys.list("user-1"), [acme, beta])
    queryClient.setQueryData(sessionOrganizationKey, acme)
    queryClient.setQueryData(slugOrganizationKey, acme)
    queryClient.setQueryData(idOrganizationKey, acme)

    function MutationConsumer() {
      mutateAsync = useSetActiveOrganization(authClient as never).mutateAsync
      return null
    }

    renderToString(() => (
      <AuthProvider authClient={authClient as never} queryClient={queryClient}>
        {() => <MutationConsumer />}
      </AuthProvider>
    ))

    const mutation = mutateAsync?.({ organizationId: beta.id })

    await vi.waitFor(() => {
      expect(queryClient.getQueryData(sessionOrganizationKey)).toEqual(beta)
    })
    expect(queryClient.getQueryData(slugOrganizationKey)).toEqual(acme)
    expect(queryClient.getQueryData(idOrganizationKey)).toEqual(acme)

    resolveSetActive?.(beta)
    await mutation
  })
})
