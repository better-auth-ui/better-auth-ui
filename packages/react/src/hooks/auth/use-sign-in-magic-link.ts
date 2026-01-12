import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Provides a hook that sends a magic-link sign-in email and exposes the action state for that flow.
 *
 * The returned action state invokes the auth client's magic-link sign-in using the email from a FormData
 * input, shows success or error toasts, and normalizes the stored email based on the result.
 *
 * @returns An action state object that triggers sending a magic link and holds the `email` field (initially `""`).
 */
export function useSignInMagicLink() {
  const { authClient, baseURL, localization, redirectTo, toast } = useAuth()

  const signInMagicLink = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return { email }
    }

    toast.success(localization.auth.magicLinkSent)

    return { email: "" }
  }

  return useActionState(signInMagicLink, { email: "" })
}
