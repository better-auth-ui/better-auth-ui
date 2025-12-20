import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

/**
 * Provides an action state hook that updates the current user's name, triggers a session refetch, and shows localized toast notifications.
 *
 * @param config - Optional auth configuration forwarded to the auth hook
 * @returns An action state (initialized with `name` = "") whose action updates the user's name, refetches the session on success, and displays success or error toasts
 */
export function useUpdateUser(config?: AnyAuthConfig) {
  const { authClient, localization, toast } = useAuth(config)

  const { refetch } = authClient.useSession()

  const updateUser = async (_: object, formData: FormData) => {
    const name = formData.get("name") as string

    const { error } = await authClient.updateUser(
      {
        name
      },
      { disableSignal: true }
    )

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