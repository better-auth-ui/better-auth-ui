import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useActionState } from "react"

interface UseForgotPasswordOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: ({ email }: { email: string }) => unknown | Promise<unknown>
}

/**
 * Provides an action state hook for the forgot-password flow.
 *
 * The configured action sends a password reset request for the submitted email,
 * shows a success or error toast, navigates to the sign-in view on success,
 * and returns the submitted email.
 *
 * @returns The action state for the forgot-password flow. The action, when invoked, sends a password-reset request and resolves to an object containing the submitted `email`.
 */
export function useForgotPassword({
  onError,
  onSuccess
}: UseForgotPasswordOptions = {}) {
  const { authClient, basePaths, viewPaths, navigate } = useAuth()

  const forgotPassword = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`
    })

    if (error) {
      await onError?.(error)
    } else {
      await onSuccess?.({ email })
      navigate({ href: `${basePaths.auth}/${viewPaths.auth.signIn}` })
    }

    return { email }
  }

  return useActionState(forgotPassword, {
    email: ""
  })
}
