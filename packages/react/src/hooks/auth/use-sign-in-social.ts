import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Creates an action state for initiating a social sign-in using the configured auth client.
 *
 * The action extracts the "provider" value from the supplied FormData, constructs a callback URL
 * from the auth context's base URL and redirect path, and invokes the client's social sign-in flow.
 * If the sign-in returns an error, an error toast is shown.
 *
 * @returns An action state whose action, when executed, returns an object `{ provider: string }`
 *          containing the social provider that was used to start the sign-in.
 */
export function useSignInSocial() {
  const { authClient, baseURL, redirectTo, toast } = useAuth()

  const signInSocial = async (_: object, formData: FormData) => {
    const provider = formData.get("provider") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL
    })

    if (error) toast.error(error.message || error.statusText)

    return { provider }
  }

  return useActionState(signInSocial, { provider: "" })
}
