import type { AuthClient } from "@better-auth-ui/core"
import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { describe, expectTypeOf, it } from "vitest"
import type { UseRevokeSessionOptions } from "../src/hooks/mutations/use-revoke-session"
import type { UseSignInEmailOptions } from "../src/hooks/mutations/use-sign-in-email"
import type { UseUpdateUserOptions } from "../src/hooks/mutations/use-update-user"
import type { UseCreateApiKeyOptions } from "../src/plugins/api-key/hooks/mutations/use-create-api-key"
import type { UseAddPasskeyOptions } from "../src/plugins/passkey/hooks/mutations/use-add-passkey"

describe("Solid base mutation option typing", () => {
  it("requires accessor-wrapped mutation options", () => {
    expectTypeOf<UseSignInEmailOptions<AuthClient>>().toBeFunction()
    expectTypeOf<
      ReturnType<UseSignInEmailOptions<AuthClient>>
    >().toHaveProperty("onSuccess")
    expectTypeOf<
      ReturnType<UseSignInEmailOptions<AuthClient>>
    >().toHaveProperty("onError")

    expectTypeOf<UseUpdateUserOptions<AuthClient>>().toBeFunction()
    expectTypeOf<ReturnType<UseUpdateUserOptions<AuthClient>>>().toHaveProperty(
      "onSettled"
    )
    expectTypeOf<
      ReturnType<UseRevokeSessionOptions<AuthClient>>
    >().toHaveProperty("onMutate")
    expectTypeOf<
      ReturnType<UseCreateApiKeyOptions<ApiKeyAuthClient>>
    >().toHaveProperty("onSuccess")
    expectTypeOf<
      ReturnType<UseAddPasskeyOptions<PasskeyAuthClient>>
    >().toHaveProperty("onError")
  })
})
