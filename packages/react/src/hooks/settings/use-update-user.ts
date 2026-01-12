import { useAuth, useSession } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Provides an action state hook that updates the current user's name, triggers a session refetch, and shows localized toast notifications.
 *
 * @returns An action state (initialized with `name` = "") whose action updates the user's name, refetches the session on success, and displays success or error toasts
 */
export function useUpdateUser() {
  const { authClient, localization, toast } = useAuth()
  const { refetch } = useSession()

  const updateUser = async (_: object, formData: FormData) => {
    const name = formData.get("name") as string

    const { error } = await authClient.updateUser({
      name
    })

    if (error) {
      toast.error(error.message || error.statusText)
    } else {
      await refetch()

      toast.success(localization.settings.profileUpdatedSuccess)
    }

    return { name }
  }

  return useActionState(updateUser, { name: "" })
}
