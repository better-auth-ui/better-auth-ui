import { authMutationKeys } from "../../lib/auth-mutation-keys"

export const ssoMutationKeys = {
  all: [...authMutationKeys.signIn.all, "sso"] as const,
  signIn: [...authMutationKeys.signIn.all, "sso", "discover"] as const,
  register: ["auth", "sso", "register"] as const,
  requestDomainVerification: [
    "auth",
    "sso",
    "requestDomainVerification"
  ] as const,
  verifyDomain: ["auth", "sso", "verifyDomain"] as const
}
