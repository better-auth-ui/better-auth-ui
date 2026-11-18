import { QueryClient } from "@tanstack/query-core"
import { useMutation } from "@tanstack/solid-query"
import { authQueryKeys } from "@better-auth-ui/core"
import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins/api-key"
import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import { beforeEach, expect, it, vi } from "vitest"
import { useChangeEmail } from "../src/hooks/mutations/use-change-email"
import { useCreateApiKey } from "../src/plugins/api-key/hooks/mutations/use-create-api-key"
import { useDeleteOrganization } from "../src/plugins/organization/hooks/mutations/use-delete-organization"

const session = vi.hoisted(() => ({ data: { user: { id: "user" } } }))
vi.mock("@tanstack/solid-query", () => ({
  useMutation: vi.fn<(...args: unknown[]) => unknown>()
}))
vi.mock("../src/hooks/queries/use-session", () => ({
  useSession: vi.fn<() => { data: { user: { id: string } } }>(() => session)
}))
beforeEach(() => {
  vi.clearAllMocks()
  session.data.user.id = "user"
})

/** The mutation hooks share this call shape, apart from their client types. */
type MutationHook = (
  authClient: never,
  options: never,
  queryClient: () => QueryClient
) => unknown

it.each<{ name: string; hook: MutationHook; awaits: () => unknown[] }>([
  {
    name: "change email",
    hook: useChangeEmail,
    awaits: () => [authQueryKeys.session]
  },
  {
    name: "create API key",
    hook: useCreateApiKey,
    awaits: () => [apiKeyQueryKeys.lists(session.data.user.id)]
  },
  {
    name: "delete organization",
    hook: useDeleteOrganization,
    awaits: () => [organizationQueryKeys.lists(session.data.user.id)]
  }
])(
  "forwards the query client and preserves $name invalidation with inline errors",
  ({ hook, awaits: expectedAwaits }) => {
    const client = new QueryClient()
    const getClient = () => client
    hook(
      {} as never,
      (() => ({ meta: { errorPresentation: "inline" } })) as never,
      getClient
    )
    const [getOptions, passedClient] = vi.mocked(useMutation).mock.calls[0]
    expect(passedClient).toBe(getClient)
    expect(getOptions().meta).toMatchObject({
      errorPresentation: "inline",
      awaits: expectedAwaits()
    })
    session.data.user.id = "other-user"
    expect(getOptions().meta).toMatchObject({ awaits: expectedAwaits() })
  }
)
