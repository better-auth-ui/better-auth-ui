import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useCallback, useState } from "react"

import { useAuth } from "../auth/use-auth"

/**
 * Provides functionality to link a social account to the current user.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An object containing the linking provider and a function to link a social account
 */
export function useLinkSocial(config?: AnyAuthConfig) {
  const { authClient, baseURL, toast } = useAuth(config)

  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)

  const linkSocial = useCallback(
    async (provider: string) => {
      setLinkingProvider(provider)

      const callbackURL = `${baseURL}${window.location.pathname}`

      const { error } = await authClient.linkSocial({
        provider,
        callbackURL
      })

      if (error) {
        toast.error(error.message || error.statusText)
      }

      setLinkingProvider(null)
    },
    [authClient, baseURL, toast]
  )

  return { linkingProvider, linkSocial }
}
