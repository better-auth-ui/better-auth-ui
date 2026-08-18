import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../../lib/auth-client"

type AuthFetchOptions = Parameters<
  AuthClient["signIn"]["social"]
>[0]["fetchOptions"]

export type SsoSignInParams = {
  email?: string
  organizationSlug?: string
  providerId?: string
  domain?: string
  callbackURL: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  scopes?: string[]
  loginHint?: string
  additionalParams?: Record<string, string>
  requestSignUp?: boolean
  providerType?: "oidc" | "saml"
  fetchOptions?: AuthFetchOptions
}

export type SsoSignInResult = {
  data: { url: string; redirect: boolean } | null
  error: BetterFetchError | null
}

/** Better Auth client surface added by `ssoClient()`. */
export type SsoAuthClient = AuthClient & {
  signIn: AuthClient["signIn"] & {
    sso: (params: SsoSignInParams) => Promise<SsoSignInResult>
  }
}
