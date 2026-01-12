import { useAuth, useSession } from "@better-auth-ui/react"
import { useActionState } from "react"

/**
 * Hook that creates an action state for updating the authenticated user's profile name.
 *
 * The action submits the name update, refetches the session on success,
 * and displays success or error toasts.
 *
 * @returns The `useActionState` result whose state holds `name` (initialized to `""`).
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
