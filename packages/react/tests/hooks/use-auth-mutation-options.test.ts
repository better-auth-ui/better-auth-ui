import type { BetterFetchOption } from "better-auth/client"
import { describe, expectTypeOf, it } from "vitest"
import type { useAuthMutation } from "../../src/hooks/use-auth-mutation"

/**
 * Mirrors a concrete Better Auth write endpoint, e.g.
 * `authClient.emailOtp.sendVerificationOtp`.
 */
type SendVerificationOtp = (variables: {
  email: string
  type: "sign-in"
  fetchOptions?: BetterFetchOption
}) => Promise<{ success: boolean }>

/**
 * Instantiating the generic with a concrete endpoint is itself the regression
 * check: `AuthMutationFn` previously declared `variables: unknown`, and because
 * parameters are contravariant under `strictFunctionTypes` that rejected every
 * real endpoint with TS2345 before its variables could be inferred.
 */
type UseAuthMutationOptions = NonNullable<
  Parameters<
    typeof useAuthMutation<SendVerificationOtp, ["auth", "sendVerificationOtp"]>
  >[2]
>

describe("useAuthMutation option typing", () => {
  it("accepts concrete endpoint signatures", () => {
    expectTypeOf<UseAuthMutationOptions>().toHaveProperty("onSuccess")
    expectTypeOf<UseAuthMutationOptions>().toHaveProperty("onError")
    expectTypeOf<UseAuthMutationOptions>().toHaveProperty("retry")
  })

  it("infers the endpoint's variables rather than widening to unknown", () => {
    expectTypeOf<NonNullable<UseAuthMutationOptions["onSuccess"]>>()
      .parameter(1)
      .toEqualTypeOf<{
        email: string
        type: "sign-in"
        fetchOptions?: BetterFetchOption
      }>()
  })
})
