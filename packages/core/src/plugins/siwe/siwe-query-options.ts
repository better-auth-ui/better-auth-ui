import { type QueryOptions, skipToken } from "@tanstack/query-core"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { SiweWalletAccount, SiweWalletManager } from "./siwe-wallet"

export const siweQueryKeys = {
  all: (userId?: string) => [...authQueryKeys.user(userId), "siwe"] as const,
  wallets: (userId?: string) =>
    [...siweQueryKeys.all(userId), "wallets"] as const
} as const

export const siweWalletsOptions = (
  manager: SiweWalletManager | undefined,
  userId?: string
) =>
  ({
    queryKey: siweQueryKeys.wallets(userId),
    queryFn:
      manager && userId ? ({ signal }) => manager.list(signal) : skipToken
  }) satisfies QueryOptions<SiweWalletAccount[]>
