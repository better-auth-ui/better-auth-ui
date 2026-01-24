import { useAuth } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

/**
 * Provides state and an action for linking a social provider account to the current user.
 *
 * The action sets `linkingProvider` to the provider id while the link operation is in progress,
 * shows an error toast on failure, and clears `linkingProvider` when complete.
 *
 * @returns An object with `linkingProvider` (provider id being linked or `null`) and `linkSocial` (function to initiate linking for a given provider).
 */
export function useLinkSocial() {
  const { authClient, baseURL, toast } = useAuth()
  const [isPending, setIsPending] = useState(false)

  const linkSocial = useCallback(
    async (provider: string) => {
      setIsPending(true)

      const callbackURL = `${baseURL}${window.location.pathname}`

      const { error } = await authClient.linkSocial({
        provider,
        callbackURL
      })

      if (error) {
        toast.error(error.message || error.statusText)
      }

      setIsPending(false)
    },
    [authClient, baseURL, toast]
  )

  return { linkSocial, isPending }
}
