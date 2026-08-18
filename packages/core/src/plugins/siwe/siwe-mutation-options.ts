import type { MutationOptions } from "@tanstack/query-core"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { SiweAuthClient } from "./siwe-auth-client"
import { siweQueryKeys } from "./siwe-query-options"
import type { SiweWalletConnector, SiweWalletManager } from "./siwe-wallet"
import { createSiweMessage } from "./siwe-wallet"

export const siweMutationKeys = {
  all: ["auth", "siwe"] as const,
  signIn: ["auth", "siwe", "signIn"] as const,
  link: ["auth", "siwe", "link"] as const,
  unlink: ["auth", "siwe", "unlink"] as const,
  setPrimary: ["auth", "siwe", "setPrimary"] as const
} as const

export type SignInSiweVariables = { email?: string }

export type SignInSiweConfig = {
  connector: SiweWalletConnector
  domain: string
  uri: string
  statement?: string
}

export const signInSiweOptions = (
  authClient: SiweAuthClient,
  config: SignInSiweConfig
) => {
  const mutationFn = async ({ email }: SignInSiweVariables = {}) => {
    const wallet = await config.connector.connect()
    const nonceResult = await authClient.siwe.nonce({
      fetchOptions: { throw: true }
    })
    const nonce = nonceResult.data?.nonce
    if (!nonce) throw new Error("The SIWE nonce response was empty.")

    const message = createSiweMessage({
      ...wallet,
      domain: config.domain,
      uri: config.uri,
      nonce,
      statement: config.statement
    })
    const signature = await config.connector.signMessage({
      address: wallet.address,
      message
    })

    return authClient.siwe.verify({
      message,
      signature,
      ...(email ? { email } : {}),
      fetchOptions: { throw: true }
    })
  }

  return {
    mutationKey: siweMutationKeys.signIn,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } satisfies MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    Error,
    SignInSiweVariables | undefined
  >
}

const walletMeta = (userId?: string) => ({
  awaits: [siweQueryKeys.wallets(userId)]
})

export const linkSiweWalletOptions = (
  manager: SiweWalletManager,
  connector: SiweWalletConnector,
  userId?: string
) => {
  const mutationFn = async () => {
    const wallet = await connector.connect()
    const challenge = await manager.createLinkChallenge(wallet)
    const signature = await connector.signMessage({
      address: wallet.address,
      message: challenge.message
    })
    return manager.link({
      ...wallet,
      message: challenge.message,
      signature
    })
  }

  return {
    mutationKey: siweMutationKeys.link,
    mutationFn,
    meta: walletMeta(userId)
  } satisfies MutationOptions<void, Error, void>
}

export const unlinkSiweWalletOptions = (
  manager: SiweWalletManager,
  userId?: string
) =>
  ({
    mutationKey: siweMutationKeys.unlink,
    mutationFn: (walletId: string) => manager.unlink(walletId),
    meta: walletMeta(userId)
  }) satisfies MutationOptions<void, Error, string>

export const setPrimarySiweWalletOptions = (
  manager: SiweWalletManager,
  userId?: string
) =>
  ({
    mutationKey: siweMutationKeys.setPrimary,
    mutationFn: (walletId: string) => manager.setPrimary(walletId),
    meta: walletMeta(userId)
  }) satisfies MutationOptions<void, Error, string>
