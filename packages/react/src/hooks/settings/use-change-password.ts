import { useAuth } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Hook that creates an action state for changing the authenticated user's password.
 *
 * The action validates confirm-password when enabled, submits the password-change request,
 * revokes other sessions on success, and displays success or error toasts.
 *
 * @returns The `useActionState` result whose state is an empty object `{}`.
 */
export function useChangePassword() {
  const { authClient, emailAndPassword, localization, toast } = useAuth()

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
