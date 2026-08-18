import { authMutationKeys } from "../../lib/auth-mutation-keys"

export const ssoMutationKeys = {
  all: [...authMutationKeys.signIn.all, "sso"] as const,
  signIn: [...authMutationKeys.signIn.all, "sso", "discover"] as const
}
