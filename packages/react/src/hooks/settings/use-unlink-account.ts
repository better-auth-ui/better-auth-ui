import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"
import { useListAccounts } from "./use-list-accounts"

/**
 * Provides functionality to unlink a social account from the current user.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the unlinking provider and a function to unlink an account
 */
export function useUnlinkAccount(config?: AnyAuthConfig) {
  const { authClient, localization, toast } = useAuth(config)
  const { refetch } = useListAccounts(config)

  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null
  )

  const unlinkAccount = useCallback(
    async (providerId: string) => {
      setUnlinkingProvider(providerId)

      const { error } = await authClient.unlinkAccount({
        providerId
      })

      if (error) {
        toast.error(error.message || error.statusText)
      } else {
        await refetch()
        toast.success(localization.settings.accountUnlinked)
      }

      setUnlinkingProvider(null)
    },
    [authClient, localization, refetch, toast]
  )

  return { unlinkingProvider, unlinkAccount }
}
