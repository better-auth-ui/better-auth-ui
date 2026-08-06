import type { BetterFetchOption } from "better-auth/client"
import { describe, expectTypeOf, it } from "vitest"
import type { useAuthQuery } from "../../src/hooks/use-auth-query"

type AuthQuery = (params: {
  query?: Record<string, unknown>
  fetchOptions?: BetterFetchOption
}) => Promise<{ data: { accountId: string } }>

type UseAuthQueryOptions = NonNullable<
  Parameters<typeof useAuthQuery<AuthQuery, ["auth", "accountInfo"]>>[2]
>

describe("useAuthQuery option typing", () => {
  it("preserves React Query options while carrying Better Auth params", () => {
    expectTypeOf<UseAuthQueryOptions>().toHaveProperty("query")
    expectTypeOf<UseAuthQueryOptions>().toHaveProperty("fetchOptions")
    expectTypeOf<UseAuthQueryOptions>().toHaveProperty("enabled")
    expectTypeOf<UseAuthQueryOptions>().toHaveProperty("initialData")
  })
})
