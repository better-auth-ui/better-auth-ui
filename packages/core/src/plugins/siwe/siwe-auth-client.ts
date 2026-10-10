import type { siweClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

/** Better Auth client surface added by siweClient(), including throw-aware responses. */
export type SiweAuthClient = AuthClient<{
  plugins: [ReturnType<typeof siweClient>]
}>
export type SiweNonceResult = Awaited<
  ReturnType<SiweAuthClient["siwe"]["nonce"]>
>
export type SiweVerifyParams = Parameters<SiweAuthClient["siwe"]["verify"]>[0]
export type SiweVerifyResult = Awaited<
  ReturnType<SiweAuthClient["siwe"]["verify"]>
>
