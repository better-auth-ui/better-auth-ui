import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Provides an action state hook for resetting a user's password using the `token` query parameter.
 *
 * When the returned action is invoked with a FormData containing `password` (and optionally `confirmPassword`),
 * it attempts to reset the password, shows success or error toasts, navigates to the sign-in view on success or when
 * the token is missing, and returns updated form field values.
 *
 * @returns The `useActionState` result configured for the reset-password action. When the action is executed it
 * returns an object with `password` and, if confirm-password is enabled, `confirmPassword` (both strings).
 * On failure or missing token these fields are set to empty strings.
 */
export function useResetPassword() {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    toast,
    viewPaths,
    navigate
  } = useAuth()

  const resetPassword = async (_: object, formData: FormData) => {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token")

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)

      return {
        password: "",
        ...(emailAndPassword?.confirmPassword ? { confirmPassword: "" } : {})
      }
    }

    // Validate confirmPassword if enabled
    if (emailAndPassword?.confirmPassword) {
      if (password !== confirmPassword) {
        toast.error(localization.auth.passwordsDoNotMatch)

        return {
          password: "",
          confirmPassword: ""
        }
      }
    }

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password
    })

    if (error) {
      toast.error(error.message || error.statusText)

      return {
        password: "",
        confirmPassword: ""
      }
    }

    toast.success(localization.auth.passwordResetSuccess)
    navigate(`${basePaths.auth}/${viewPaths.auth.signIn}`)

    return {
      password,
      confirmPassword
    }
  }

  return useActionState(resetPassword, {
    password: "",
    confirmPassword: ""
  })
}