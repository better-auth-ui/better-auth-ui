import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Provides an action state hook for the forgot-password flow.
 *
 * The configured action sends a password reset request for the submitted email,
 * shows a success or error toast, navigates to the sign-in view on success,
 * and returns the submitted email.
 *
 * @returns The action state for the forgot-password flow. The action, when invoked, sends a password-reset request and resolves to an object containing the submitted `email`.
 */
export function useForgotPassword() {
  const { authClient, basePaths, localization, toast, viewPaths, navigate } =
    useAuth()

  const forgotPassword = async (_: object, formData: FormData) => {
    const email = formData.get("email") as string

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${basePaths.auth}/${viewPaths.auth.resetPassword}`
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      toast.success(localization.auth.passwordResetEmailSent)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)
    }

    return { email }
  }

  return useActionState(forgotPassword, {
    email: ""
  })
}
