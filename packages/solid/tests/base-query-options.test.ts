import type { AuthClient } from "@better-auth-ui/core"
import { describe, expectTypeOf, it } from "vitest"
import type { UseAccountInfoOptions } from "../src/hooks/queries/use-account-info"
import type { UseListAccountsOptions } from "../src/hooks/queries/use-list-accounts"
import type { UseListSessionsOptions } from "../src/hooks/queries/use-list-sessions"
import type { UseSessionOptions } from "../src/hooks/queries/use-session"

describe("Solid base query option typing", () => {
  it("preserves Solid Query options while carrying Better Auth params", () => {
    expectTypeOf<ReturnType<UseSessionOptions<AuthClient>>>().toHaveProperty(
      "query"
    )
    expectTypeOf<ReturnType<UseSessionOptions<AuthClient>>>().toHaveProperty(
      "fetchOptions"
    )
    expectTypeOf<ReturnType<UseSessionOptions<AuthClient>>>().toHaveProperty(
      "enabled"
    )

    expectTypeOf<
      ReturnType<UseAccountInfoOptions<AuthClient>>
    >().toHaveProperty("enabled")
    expectTypeOf<
      ReturnType<UseAccountInfoOptions<AuthClient>>
    >().toHaveProperty("query")
    expectTypeOf<
      ReturnType<UseListAccountsOptions<AuthClient>>
    >().toHaveProperty("enabled")
    expectTypeOf<
      ReturnType<UseListSessionsOptions<AuthClient>>
    >().toHaveProperty("enabled")
  })
})
