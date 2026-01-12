import { useAuth } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useListAccounts } from "./use-list-accounts"

/**
 * Exposes state and an action to unlink a linked social provider from the current user.
 *
 * The action sets `unlinkingProvider` to the provider id while the operation is in progress,
 * triggers a refetch of linked accounts on success, and shows a localized success or error toast.
 *
 * @returns An object with `unlinkingProvider` (the provider id being unlinked or `null`) and `unlinkAccount` (a function that initiates unlinking for a given provider id)
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
