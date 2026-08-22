import type { ssoClient } from "@better-auth/sso/client"
import type { AuthClient } from "../../lib/auth-client"

/** Better Auth client surface added by `ssoClient()`. */
export type SsoAuthClient = AuthClient<{
  plugins: [
    ReturnType<
      typeof ssoClient<{
        domainVerification: { enabled: true }
      }>
    >
  ]
}>

export type SsoSignInParams = Parameters<SsoAuthClient["signIn"]["sso"]>[0]

export type SsoSignInResult = Awaited<
  ReturnType<SsoAuthClient["signIn"]["sso"]>
>
