import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useCallback } from "react"

interface UseSendVerificationEmailOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: (context: { email: string }) => unknown | Promise<unknown>
}

/**
 * Provides a function to send a verification email to the specified email address.
 *
 * @param options - Optional callbacks for error and success handling
 * @returns An object containing `sendVerificationEmail`, a function that sends a verification email.
 */
export function useSendVerificationEmail({
  onError,
  onSuccess
}: UseSendVerificationEmailOptions = {}) {
  const { authClient, baseURL, redirectTo } = useAuth()

  const sendVerificationEmail = useCallback(
    async (email: string) => {
      const callbackURL = `${baseURL}${redirectTo}`

      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL
      })

      if (error) {
        await onError?.(error)
      } else {
        await onSuccess?.({ email })
      }
    },
    [authClient, baseURL, redirectTo, onError, onSuccess]
  )

  return { sendVerificationEmail }
}
