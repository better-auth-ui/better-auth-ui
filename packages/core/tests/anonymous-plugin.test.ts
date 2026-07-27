import { describe, expect, it } from "vitest"
import {
  anonymousLocalization,
  anonymousMutationKeys,
  anonymousPlugin
} from "../src/plugins"

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
})
