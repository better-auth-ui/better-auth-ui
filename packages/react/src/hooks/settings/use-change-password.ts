import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "../auth/use-auth"

/**
 * Provides an action state hook that allows an authenticated user to change their password.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An action state whose action initiates the password change process and displays success or error toasts
 */
export function useChangePassword(config?: AnyAuthConfig) {
  const { authClient, emailAndPassword, localization, toast } = useAuth(config)

  const changePassword = async (_: object, formData: FormData) => {
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (emailAndPassword?.confirmPassword && newPassword !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      return {}
    }

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      toast.success(localization.settings.changePasswordSuccess)
    }

    return {}
  }

  return useActionState(changePassword, {})
}
