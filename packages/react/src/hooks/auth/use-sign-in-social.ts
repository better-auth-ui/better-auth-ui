import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useActionState } from "react"

interface UseSignInSocialOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: ({ provider }: { provider: string }) => unknown | Promise<unknown>
}

/**
 * Creates an action state for initiating a social sign-in using the configured auth client.
 *
 * The action extracts the "provider" value from the supplied FormData, constructs a callback URL
 * from the auth context's base URL and redirect path, and invokes the client's social sign-in flow.
 * If the sign-in returns an error, the onError callback is called.
 *
 * @returns An action state whose action, when executed, returns an object `{ provider: string }`
 *          containing the social provider that was used to start the sign-in.
 */
export function useSignInSocial({
  onError,
  onSuccess
}: UseSignInSocialOptions = {}) {
  const { authClient, baseURL, redirectTo } = useAuth()

  const signInSocial = async (_: object, formData: FormData) => {
    const provider = formData.get("provider") as string

    const callbackURL = `${baseURL}${redirectTo}`

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL
    })

    if (error) {
      await onError?.(error)
    } else {
      await onSuccess?.({ provider })
    }

    return { provider }
  }

  return useActionState(signInSocial, { provider: "" })
}
