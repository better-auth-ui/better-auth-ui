import { useAuth } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useListAccounts } from "./use-list-accounts"

/**
 * Provides functionality to unlink a social account from the current user.
 *
 * @returns An object containing the unlinking provider and a function to unlink an account
 */
export function useUnlinkAccount() {
  const { authClient, localization, toast } = useAuth()
  const { refetch } = useListAccounts()

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
