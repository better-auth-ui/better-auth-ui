import { useAuth } from "@better-auth-ui/react"
import type { AuthError } from "@better-auth-ui/react/core"
import { useActionState } from "react"

interface UseResetPasswordOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: () => unknown | Promise<unknown>
}

/**
 * Provides an action state hook for resetting a user's password using the `token` query parameter.
 *
 * When the returned action is invoked with a FormData containing `password` (and optionally `confirmPassword`),
 * it attempts to reset the password, calls the appropriate callback, navigates to the sign-in view on success,
 * and returns updated form field values.
 *
 * Note: Token validation on mount should be handled by the component.
 *
 * @returns The `useActionState` result configured for the reset-password action. When the action is executed it
 * returns an object with `password` and, if confirm-password is enabled, `confirmPassword` (both strings).
 * On failure these fields are set to empty strings.
 */
export function useResetPassword({
  onError,
  onSuccess
}: UseResetPasswordOptions = {}) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    viewPaths,
    navigate
  } = useAuth()

  const resetPassword = async (_: object, formData: FormData) => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token")

    if (!token) {
      await onError?.({
        message: localization.auth.invalidResetPasswordToken,
        status: 400,
        statusText: "MISSING_TOKEN"
      })

      return {
        password: "",
        confirmPassword: ""
      }
    }

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate confirmPassword if enabled
    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      await onError?.({
        message: localization.auth.passwordsDoNotMatch,
        status: 400,
        statusText: "PASSWORD_MISMATCH"
      })

      return {
        password: "",
        confirmPassword: ""
      }
    }

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password
    })

    if (error) {
      await onError?.(error)

      return {
        password: "",
        confirmPassword: ""
      }
    }

    await onSuccess?.()
    navigate({ href: `${basePaths.auth}/${viewPaths.auth.signIn}` })

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
