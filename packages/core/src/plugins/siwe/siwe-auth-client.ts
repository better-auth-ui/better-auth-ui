import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../../lib/auth-client"

type AuthFetchOptions = Parameters<
  AuthClient["signIn"]["social"]
>[0]["fetchOptions"]

export type SiweNonceResult = {
  data: { nonce: string } | null
  error: BetterFetchError | null
}

export type SiweVerifyParams = {
  message: string
  signature: string
  email?: string
  fetchOptions?: AuthFetchOptions
}

export type SiweVerifyResult = {
  data: {
    token: string
    success: boolean
    user: { id: string; walletAddress: string; chainId: number }
  } | null
  error: BetterFetchError | null
}

/** Better Auth client surface added by `siweClient()`. */
export type SiweAuthClient = AuthClient & {
  siwe: {
    nonce: (params?: {
      fetchOptions?: AuthFetchOptions
    }) => Promise<SiweNonceResult>
    verify: (params: SiweVerifyParams) => Promise<SiweVerifyResult>
  }
}
