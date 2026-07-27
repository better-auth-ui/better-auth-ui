import { authQueryKeys } from "@better-auth-ui/core"
import { anonymousMutationKeys } from "@better-auth-ui/core/plugins"
import { describe, expect, it, vi } from "vitest"
import { signInAnonymousOptions } from "../src/mutations/anonymous/sign-in-anonymous-mutation"

describe("anonymous mutation (Solid)", () => {
  it("signs in with the shared anonymous key and throwing fetch options", async () => {
    const anonymous = vi.fn(async () => undefined)
    const options = signInAnonymousOptions({
      signIn: { anonymous }
    } as never)

    expect(options.mutationKey).toEqual(anonymousMutationKeys.signIn)
    expect(options.meta?.awaits).toEqual([authQueryKeys.session])

    await expect(
      options.mutationFn?.({
        fetchOptions: { credentials: "include" }
      } as never)
    ).resolves.toBeUndefined()

    expect(anonymous).toHaveBeenCalledWith({
      fetchOptions: { credentials: "include", throw: true }
    })
  })
})
