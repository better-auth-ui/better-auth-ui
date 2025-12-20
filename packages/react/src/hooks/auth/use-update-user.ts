import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useActionState } from "react"

import { useAuth } from "./use-auth"

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

      toast.success(localization.account.profileUpdatedSuccess)
    }

    return { name }
  }

  return useActionState(updateUser, { name: "" })
}
