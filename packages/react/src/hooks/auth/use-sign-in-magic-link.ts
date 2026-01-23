import { useAuth } from "@better-auth-ui/react"
import type { AuthCallbackOptions } from "@better-auth-ui/react/core"
import { useActionState } from "react"

/**
 * Provides a hook that sends a magic-link sign-in email and exposes the action state for that flow.
 *
 * The returned action state invokes the auth client's magic-link sign-in using the email from a FormData
 * input, calls the appropriate callback, and normalizes the stored email based on the result.
 *
 * @returns An action state object that triggers sending a magic link and holds the `email` field (initially `""`).
 */
export function useSignInMagicLink({
  onError,
  onSuccess
}: AuthCallbackOptions = {}) {
  const { authClient, baseURL, redirectTo } = useAuth()

  const signInMagicLink = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL
    })

    if (error) {
      await onError?.(error)

      return { email }
    }

    await onSuccess?.()

    return { email: "" }
  }

  return useActionState(signInMagicLink, { email: "" })
}
