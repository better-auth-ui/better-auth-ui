import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src"
import {
  anonymousLocalization,
  anonymousMutationKeys,
  anonymousPlugin,
  signInAnonymousOptions
} from "../src/plugins/anonymous"

describe("anonymousPlugin", () => {
  it("provides stable identity and merges localization overrides", () => {
    const plugin = anonymousPlugin({
      localization: { continueAsGuest: "Try without an account" }
    })

    expect(anonymousPlugin.id).toBe("anonymous")
    expect(plugin).toMatchObject({
      id: "anonymous",
      localization: {
        ...anonymousLocalization,
        continueAsGuest: "Try without an account"
      }
    })
  })

  it("keeps anonymous sign-in under the shared sign-in namespace", () => {
    expect(anonymousMutationKeys.signIn).toEqual([
      "auth",
      "signIn",
      "anonymous"
    ])
  })

  it("signs in with throwing fetch options and refreshes the session", async () => {
    const anonymous = vi.fn(async () => undefined)
    const options = signInAnonymousOptions({
      signIn: { anonymous }
    } as never)

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
